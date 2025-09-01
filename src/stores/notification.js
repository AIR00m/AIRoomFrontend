// src/stores/notification.js
import { defineStore } from "pinia";
import apiClient from "@/utils/apiClient";
import { useRouter } from "vue-router";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    items: [],
    filter: "all", // all | 과제 | 공지 | 평가
    isOpen: false,
    isLoading: false,
    hasMore: true,
    currentPage: 0,
    pageSize: 20,
    hasNew: false, // 배지 표시용
    hasPersistentNew: false, // 지속적인 배지 상태
    lastFetchedAt: 0, // 마지막 동기화 시각(ms),
  }),

  getters: {
    //읽지않은 알림 개수
    unreadCount: (state) => state.items.filter((i) => !i.read).length,
    hasUnreadNotifications: (state) => state.unreadCount > 0, // 실제 미확인 알림이 있는지 체크
    shouldShowBadge: (state) => state.hasNew || state.hasPersistentNew, // 배지 표시 여부 (실시간 + 미확인)
    filtered: (state) => {
      if (state.filter === "all") return state.items;
      return state.items.filter((i) => i.type.includes(state.filter));
    },
  },

  actions: {
    markNew() {
      this.hasNew = true; // 새로운 알림 들어왔을 때
    },
    clearNew() {
      this.hasNew = false; // 사용자가 확인했을 때
    },
    updatePersistentBadge() {
      this.hasPersistentNew = this.unreadCount > 0;
    },

    // 미확인 알림 개수 업데이트
    updateUnreadCount() {
      console.log("현재 미확인 알림 개수:", this.unreadCount);
    },

    //모달 열기 닫기
    async open() {
      this.isOpen = true;
      // 조건부 동기화: 비어 있거나, 오래됐으면 1페이지만 갱신
      if (this.items.length === 0 || this.shouldRefresh()) {
        await this.fetchNotifications(false);
      }
      this.clearNew(); // 실시간 배지는 사용자 확인과 함께 비움
      this.updatePersistentBadge(); // 미읽음 기준 배지 재계산
    },

    close() {
      this.isOpen = false;
    },

    setFilter(f) {
      this.filter = f;
    },

    // DB에서 알림 목록 가져오기 (GET 방식으로 변경)
    async fetchNotifications(isLoadMore = false) {
      if (this.isLoading) return;

      try {
        this.isLoading = true;
        const pageToLoad = isLoadMore ? this.currentPage + 1 : 0;
        const memberId = localStorage.getItem("memberId");

        const response = await apiClient.post("/notification/list", {
          memberId: memberId,
          offset: pageToLoad * this.pageSize,
          limit: this.pageSize,
        });

        console.log("알림 목록 응답:", response);

        const notifications = this.transformNotifications(
          response.notifications || []
        );

        if (isLoadMore) {
          this.items.push(...notifications);
        } else {
          this.items = notifications;
        }

        this.currentPage = pageToLoad;
        this.hasMore =
          response.hasMore || notifications.length === this.pageSize;
        this.updatePersistentBadge();
        this.lastFetchedAt = Date.now();
      } catch (error) {
        console.error("알림 목록 가져오기 실패:", error);
        if (error.response?.status === 401) {
          // 토큰 만료 등
          console.log("인증 오류, 로그인 페이지로 이동");
        }
      } finally {
        this.isLoading = false;
      }
    },

    shouldRefresh() {
      // 60초 이상 지났으면 가볍게 동기화
      return Date.now() - (this.lastFetchedAt || 0) > 60_000;
    },

    // DB 데이터를 UI에 맞게 변환
    transformNotifications(notifications) {
      return notifications.map((n) => {
        const id = n.notificationNo ?? n.notificationId ?? n.id; // API | SSE | fallback
        const message = n.message ?? n.notificationType ?? "";
        const created =
          n.createdTime ?? n.createdAt ?? n.created ?? n.time ?? "";
        const read = n.isRead ?? n.read ?? false; // API | SSE
        const url = n.notificationUrl ?? n.redirectUrl ?? n.url ?? null; // API | SSE
        const type = this.getNotificationCategory(n.notificationType ?? n.type);
        return {
          id,
          type,
          text: message,
          time: created,
          read,
          url,
          originalData: n,
        };
      });
    },

    // 알림 타입에 따른 카테고리 분류
    getNotificationCategory(notificationType) {
      if (!notificationType) return "기타";

      if (
        notificationType.includes("ASSIGNMENT") ||
        notificationType.includes("과제")
      ) {
        return "과제";
      } else if (
        notificationType.includes("EXAM") ||
        notificationType.includes("평가")
      ) {
        return "평가";
      } else if (
        notificationType.includes("NOTICE") ||
        notificationType.includes("공지")
      ) {
        return "공지";
      } else if (
        notificationType.includes("MATERIAL") ||
        notificationType.includes("자료")
      ) {
        return "학습";
      }
      return "기타";
    },

    // 알림 읽음 처리 (POST 유지)
    async markAsRead(id) {
      try {
        console.log("알림 읽음 처리:", id);

        const notification = this.items.find((i) => i.id === id);
        if (!notification || notification.read) return;

        // API 호출 (POST 유지)
        await apiClient.post("/notification/markAsRead", {
          notificationNo: id,
        });

        // 로컬 상태 업데이트
        notification.read = true;
        this.updatePersistentBadge();
        console.log("알림 읽음 처리 완료");
      } catch (error) {
        console.error("알림 읽음 처리 실패:", error);
        // 실패 시 로컬 상태 롤백
        const notification = this.items.find((i) => i.id === id);
        if (notification) {
          notification.read = false;
        }
      }
    },

    // 무한스크롤을 위한 더 많은 알림 로드
    async loadMore() {
      if (this.hasMore && !this.isLoading) {
        await this.fetchNotifications(true);
      }
    },

    // SSE를 통해 새 알림 추가
    addNotification(notificationData) {
      console.log("새 알림 추가:", notificationData);

      let notification;
      if (typeof notificationData === "string") {
        // SSE에서 문자열로 온 경우
        const parsed = JSON.parse(notificationData);
        notification = this.transformNotifications([parsed])[0];
      } else {
        // 객체로 온 경우
        notification = this.transformNotifications([notificationData])[0];
      }

      // 중복 체크
      if (!this.items.find((item) => item.id === notification.id)) {
        this.items.unshift(notification);
        this.markNew(); // 실시간 배지
        this.updatePersistentBadge(); // 지속적 배지
      }
    },

    // 기존 메서드들
    push({ type, text, time = new Date().toLocaleString() }) {
      const id = (this.items.at(-1)?.id ?? 0) + 1;
      this.items.unshift({ id, type, text, time, read: false });
    },

    clearRead() {
      this.items = this.items.filter((i) => !i.read);
    },

    // 초기화 시 배지 상태 복원
    async loadInitialNotifications() {
      console.log("초기 알림 로드");
      try {
        await this.fetchNotifications(false);
        // 초기 로드 후 배지 상태 설정
        this.updatePersistentBadge();
      } catch (error) {
        console.error("초기 알림 데이터 로드 실패:", error);
      }
    },
  },
});
