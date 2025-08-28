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
  }),

  getters: {
    //읽지않은 알림 개수
    unreadCount: (state) => state.items.filter((i) => !i.read).length,
    filtered: (state) => {
      if (state.filter === "all") return state.items;
      return state.items.filter((i) => i.type.includes(state.filter));
    },
  },

  actions: {
    // 초기 알림 로드 (페이지 로드시 사용)
    async loadInitialNotifications() {
      try {
        // 기존 fetchNotifications 메서드 재사용
        await this.fetchNotifications(false);
      } catch (error) {
        console.error("초기 알림 데이터 로드 실패:", error);
      }
    },

    // 미확인 알림 개수 업데이트
    updateUnreadCount() {
      console.log("현재 미확인 알림 개수:", this.unreadCount);
    },

    //모달 열기 닫기
    async open() {
      this.isOpen = true;
      // 처음 열 때만 데이터 로드
      if (this.items.length === 0) {
        await this.fetchNotifications();
      }
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

    // DB 데이터를 UI에 맞게 변환
    transformNotifications(notifications) {
      return notifications.map((notification) => ({
        id: notification.notificationNo,
        type: this.getNotificationCategory(notification.notificationType),
        text: notification.message || notification.notificationType,
        time: notification.createdTime,
        read: notification.isRead,
        url: notification.notificationUrl || notification.redirectUrl,
        originalData: notification, // 원본 데이터 보관
      }));
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
          notificationId: id,
        });

        // 로컬 상태 업데이트
        notification.read = true;

        console.log("알림 읽음 처리 완료");

        // 해당 URL로 이동
        if (notification.url) {
          const router = useRouter();
          // airoom prefix 제거하여 Vue 라우터 경로로 변환
          const routePath = notification.url.replace("/airoom", "");
          router.push(routePath);
        }
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

    // 모든 알림 읽음 처리 - 주석 처리

    //   async markAllAsRead() {
    //     try {
    //       const unreadIds = this.items
    //         .filter((item) => !item.read)
    //         .map((item) => item.id);

    //       if (unreadIds.length === 0) return;

    //       await apiClient.post("/notification/markAllAsRead", {
    //         notificationIds: unreadIds,
    //       });

    //       // 로컬 상태 업데이트
    //       this.items.forEach((item) => {
    //         if (unreadIds.includes(item.id)) {
    //           item.read = true;
    //         }
    //       });
    //     } catch (error) {
    //       console.error("전체 읽음 처리 실패:", error);
    //     }
    //   },
  },
});
