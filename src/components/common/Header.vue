<template>
  <nav class="cute-navbar">
    <div class="cute-header">
      <!-- 로고 -->
      <a class="cute-brand" href="/">
        <div class="logo-container">
          <img
            src="https://airoom.s3.ap-northeast-2.amazonaws.com/mainlogo.png"
            alt="아이룸"
            width="70"
            height="70"
          />&nbsp;&nbsp;
          <strong class="brand-text">아이룸</strong>
          <div class="sparkles">
            <span class="sparkle">✨</span>
            <span class="sparkle">⭐</span>
          </div>
        </div>
      </a>

      <!-- 과목/학생 정보 pill -->
      <span class="subject-pill d-none d-md-inline-block" @click="goToTextbook">
        <i class="bi bi-book me-1"></i>
        {{ selectedTextbookInfo || "교과서를 선택해주세요" }}
      </span>

      <!-- 메인 메뉴 (항상 표시) -->
      <div class="main-menu">
        <ul class="cute-nav-center">
          <li class="nav-item">
            <router-link class="cute-nav-link" to="/classroom">
              <i class="bi bi-house-door me-1"></i>&nbsp;
              <span class="nav-text">우리 반 수업</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="cute-nav-link" to="/assignment">
              <i class="bi bi-clipboard-check me-1"></i>&nbsp;
              <span class="nav-text">과제</span>
            </router-link>
          </li>

          <!-- 평가 - 교사/학생에 따라 다른 경로 -->
          <li class="nav-item">
            <router-link class="cute-nav-link" to="/exam">
              <i class="bi bi-pencil-square"></i>&nbsp;&nbsp;
              <span class="nav-text">평가</span>
            </router-link>
          </li>

          <!-- 학습 리포트 - 교사인 경우 드롭다운, 학생인 경우 일반 링크 -->
          <li class="nav-item" v-if="!isTeacher">
            <router-link class="cute-nav-link" to="/report">
              <i class="bi bi-graph-up me-1"></i>&nbsp;
              <span class="nav-text">학습 리포트</span>
            </router-link>
          </li>

          <li class="nav-item cute-dropdown" v-if="isTeacher">
            <div class="cute-nav-link">
              <i class="bi bi-graph-up me-1"></i>&nbsp;
              <span class="nav-text">학습 리포트</span>
              <i class="bi bi-chevron-down ms-1"></i>
            </div>
            <div class="cute-dropdown-menu">
              <router-link class="cute-dropdown-item" to="/teacher/report">
                <i class="bi bi-people me-2"></i>
                우리 반 학습 분석
              </router-link>
              <router-link
                class="cute-dropdown-item"
                to="/teacher/class/report"
              >
                <i class="bi bi-clipboard-data me-2"></i>
                학습 현황 관리
              </router-link>
            </div>
          </li>

          <li class="nav-item">
            <router-link class="cute-nav-link" to="/subjectboard/list">
              <i class="bi bi-journal-bookmark me-1"></i>&nbsp;
              <span class="nav-text">게시판</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- 우측 아이콘: 알림/채팅 -->
      <div class="right-actions">
        <!-- 과목/학생 정보 pill (모바일) -->
        <span class="subject-pill-mobile d-md-none" @click="goToTextbook">
          <i class="bi bi-book me-1"></i>
          {{ selectedTextbookInfo || "교과서 선택" }}
        </span>

        <div class="action-buttons">
          <!-- 알림 -->
          <button class="cute-icon-btn" @click="noti.open()">
            <i class="bi bi-bell"></i>
            <span v-if="noti.unreadCount" class="cute-badge">
              {{ noti.unreadCount }}
            </span>
          </button>

          <!-- 채팅 -->
          <button class="cute-icon-btn" @click="openChat()">
            <i class="bi bi-chat-dots"></i>
            <span v-if="totalUnreadCount" class="cute-badge cute-badge-green">
              {{ totalUnreadCount }}
            </span>
          </button>

          <!-- 로그아웃 -->
          <button class="cute-icon-btn" @click="logout()" title="로그아웃">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- 떠다니는 장식 요소들 -->
    <div class="floating-elements">
      <div class="floating-chick">🐥</div>
      <div class="floating-egg">🥚</div>
      <div class="floating-sun">☀️</div>
    </div>
  </nav>
</template>

<script setup>
import { API_BASE_URL } from "@/utils/apiClient";
import { useNotificationStore } from "@/stores/notification";
import { useChatStore } from "@/stores/chat";
import { useRouter, useRoute } from "vue-router";
import { computed, ref, onMounted, watch, onUnmounted,onBeforeUnmount } from "vue";
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/utils/apiClient";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { connectSSE, disconnectSSE } from "@/utils/sseClient";

const noti = useNotificationStore();
const chat = useChatStore();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const selectedTextbookInfo = ref("");

const totalUnreadCount = ref(0);
let globalStompClient = null;
let unreadSubscription = null;
//const API_BASE_URL = "http://localhost:8080";
const API_BASE_URL = "http://43.200.2.244:8080";

const isTeacher = computed(() => {
  return (
    authStore.tokenInfo?.classroomTeacher ||
    localStorage.getItem("userType") === "teacher"
  );
});

const props = defineProps({
  subjectInfo: {
    type: String,
    default: "",
  },
});

// 선택된 교과서 정보 로드
const loadSelectedTextbook = () => {
  const selectedTextbook = localStorage.getItem("selectedTextbook");
  if (selectedTextbook) {
    try {
      const textbook = JSON.parse(selectedTextbook);
      selectedTextbookInfo.value = `${textbook.title} | ${authStore.memberName}`;
    } catch (error) {
      console.error("교과서 정보 파싱 오류:", error);
      selectedTextbookInfo.value = "";
    }
  } else {
    selectedTextbookInfo.value = "";
  }
};

// 디지털 교과서 페이지로 이동
const goToTextbook = () => {
  router.push({ name: "Textbook" });
};

function openChat() {
  const userType = localStorage.getItem("userType");
  if (userType === "teacher") {
    router.push({ query: { ...route.query, chat: "1" } }); // 기존 ChatModal(선생님)
  } else {
    router.push({ query: { ...route.query, studentchat: "1" } }); // 학생용 StudentChatModal
  }

  // 채팅 열었으니 잠시 후 미읽음 카운트 업데이트
  /* setTimeout(() => {
    fetchTotalUnread();
  }, 3000); */
  totalUnreadCount.value = 0;
}

// ✅ Header 마운트될 때 자동으로 SSE 연결
onMounted(async () => {
  // localStorage에서 memberId 가져오기
  const memberId = localStorage.getItem("memberId");
  console.log(memberId);

  if (memberId && authStore.isAuthenticated) {
    await noti.loadInitialNotifications();
    const sseUrl = `${API_BASE_URL}/sse/connect?memberId=${memberId}`;

    connectSSE(
      sseUrl,
      (event) => {
        console.log("SSE 메시지:", event.data);
        noti.addNotification(event.data);
      },
      (error) => {
        console.error("SSE 오류:", error);
      }
    );
  }
});

// ✅ Header 언마운트되면 SSE 연결 해제
onBeforeUnmount(() => {
  disconnectSSE();
});
// 로그아웃 함수
const logout = () => {
  if (confirm("정말 로그아웃 하시겠어요?")) {
    disconnectSSE(); // 로그아웃 시 종료
    authStore.logout();
    router.push({ name: "Login" });
  }
};

//채팅함수
const connectGlobalWebSocket = () => {
  try {
    const socket = new SockJS(`${API_BASE_URL}/ws-chatnoti`);
    globalStompClient = new Client({
      webSocketFactory: () => socket,
      //debug: false, // 헤더용은 디버그 로그 끄기
      onConnect: () => {
        console.log("🔔 헤더 알림 WebSocket 연결 성공");
        subscribeToUnreadUpdates();
      },
      onStompError: (frame) => {
        console.error("헤더 WebSocket 에러:", frame);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000,
    });

    globalStompClient.activate();
  } catch (error) {
    console.error("헤더 WebSocket 연결 실패:", error);
  }
};

const subscribeToUnreadUpdates = () => {
  if (!globalStompClient || !globalStompClient.connected) return;

  const memberNo =
    authStore.tokenInfo?.classroomTeacherNo ||
    authStore.tokenInfo?.classRoomStudentNo ||
    parseInt(localStorage.getItem("memberNo"));

  const memberRole = authStore.tokenInfo?.classroomTeacherNo
    ? "TEACHER"
    : "STUDENT";

  // 개인별 알림 토픽 구독
  unreadSubscription = globalStompClient.subscribe(
    `/topic/unread/${memberRole.toLowerCase()}/${memberNo}`,
    (message) => {
      const data = JSON.parse(message.body);
      console.log("실시간 미읽음 업데이트:", data);

      if (data.totalUnread !== undefined) {
        totalUnreadCount.value = data.totalUnread;
      }
    }
  );

  // 초기 미읽음 개수 조회
  fetchTotalUnread();
};

const fetchTotalUnread = async () => {
  try {
    const unreadRequest = {
      classroomMemberNo:
        authStore.tokenInfo?.classroomTeacherNo ||
        authStore.tokenInfo?.classRoomStudentNo ||
        parseInt(localStorage.getItem("memberNo")),
      memberRole: authStore.tokenInfo?.classroomTeacherNo
        ? "TEACHER"
        : "STUDENT",
    };

    console.log("미읽음 메시지 조회 요청:", unreadRequest);

    const response = await apiClient.post("/chat/unread/total", unreadRequest);
    totalUnreadCount.value = response.totalUnread || 0;
  } catch (error) {
    console.error("미읽음 메시지 조회 실패:", error);
    totalUnreadCount.value = 0;
  }
};

// 컴포넌트 마운트 시 교과서 정보 로드
onMounted(() => {
  loadSelectedTextbook();
  connectGlobalWebSocket();
});

onUnmounted(() => {
  if (unreadSubscription) {
    unreadSubscription.unsubscribe();
  }
  if (globalStompClient) {
    globalStompClient.deactivate();
  }
});

// 로컬스토리지 변경사항 감지 (다른 탭에서 교과서 선택 시)
window.addEventListener("storage", (e) => {
  if (e.key === "selectedTextbook") {
    loadSelectedTextbook();
  }
});

// 라우트 변경 시마다 교과서 정보 업데이트
watch(
  () => route.path,
  () => {
    loadSelectedTextbook();
  }
);
</script>

<style scoped>
/* 폰트 및 부트스트랩 아이콘 CDN */
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css");

@font-face {
  font-family: "GangwonEdu_OTFBoldA";
  src: url("https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2201-2@1.0/GangwonEdu_OTFBoldA.woff")
    format("woff");
  font-weight: normal;
  font-style: normal;
}

/* 전역 폰트 설정 */
* {
  font-family: "GangwonEdu_OTFBoldA", "Segoe UI", Tahoma, Geneva, Verdana,
    sans-serif !important;
  box-sizing: border-box;
}

/* 메인 네비게이션 */
.cute-navbar {
  /* background: linear-gradient(
    135deg,
    #fff9c4 0%,
    #ffeb3b 30%,
    #ffd54f 70%,
    #ff9800 100%
  ); */
  background: #ffeb3b;
  box-shadow: 0 4px 20px rgba(255, 193, 7, 0.3);
  border: 2px solid #ffeb3b;
  position: relative;
  overflow: visible; /* 드롭다운이 잘리지 않도록 수정 */
  min-height: 100px;
  margin-top: 0;
}

.cute-navbar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><defs><pattern id="hearts" patternUnits="userSpaceOnUse" width="20" height="20"><text x="10" y="15" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.1)">🌟</text></pattern></defs><rect width="100" height="20" fill="url(%23hearts)"/></svg>');
  pointer-events: none;
}

.cute-header {
  max-width: 1400px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
  gap: 20px;
  overflow: visible; /* 드롭다운이 잘리지 않도록 수정 */
}

/* 로고 스타일 */
.cute-brand {
  text-decoration: none;
  color: white;
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  position: relative;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.logo-container:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.4);
  background: rgba(255, 255, 255, 0.3);
}

.chick-icon {
  font-size: 1.8rem;
  margin-right: 10px;
  animation: wiggle 2s ease-in-out infinite;
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-10deg);
  }
}

.brand-text {
  color: #8b4513;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.sparkles {
  position: absolute;
  top: -5px;
  right: -5px;
}

.sparkle {
  position: absolute;
  animation: sparkle 2s ease-in-out infinite;
}

.sparkle:first-child {
  animation-delay: 0s;
}

.sparkle:last-child {
  animation-delay: 1s;
  top: 10px;
  right: 10px;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

/* 과목 정보 pill */
.subject-pill {
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 8px 16px;
  color: #8b4513;
  font-weight: 600;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  animation: float 3s ease-in-out infinite;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.subject-pill:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.subject-pill-mobile {
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 6px 12px;
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
  backdrop-filter: blur(10px);
  margin-bottom: 10px;
  display: block;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.subject-pill-mobile:hover {
  background: rgba(255, 255, 255, 0.35);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 메인 메뉴 (항상 표시) */
.main-menu {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 800px;
  overflow: visible; /* 드롭다운이 잘리지 않도록 수정 */
}

.cute-nav-center {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  overflow: visible; /* 드롭다운이 잘리지 않도록 수정 */
}

.nav-item {
  position: relative;
  overflow: visible; /* 드롭다운이 잘리지 않도록 수정 */
}

.cute-nav-link {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  color: #8b4513;
  text-decoration: none;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid transparent;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  white-space: nowrap;
  cursor: pointer;
}

.cute-nav-link:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  color: rgb(229, 110, 25);
}

.cute-nav-link i {
  font-size: 1rem;
}

.nav-text {
  font-size: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

/* 드롭다운 메뉴 */
.cute-dropdown {
  position: relative;
  z-index: 1001; /* 드롭다운 버튼 자체의 z-index 증가 */
}

.cute-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%; /* 중앙 정렬로 변경 */
  transform: translateX(-50%); /* 중앙 정렬을 위한 변환 */
  background: white;
  border: 3px solid #ffeb3b;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 10px;
  margin-top: 15px; /* 간격 증가 */
  min-width: 220px; /* 너비 증가 */
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-10px); /* 초기 위치 조정 */
  transition: all 0.3s ease;
  z-index: 9999; /* 매우 높은 z-index 설정 */
}

.cute-dropdown:hover .cute-dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0); /* 호버 시 위치 */
}

.cute-dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: #ff9800;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.cute-dropdown-item:hover {
  background: #fff3e0;
  color: #f57c00;
  transform: translateX(5px);
}

/* 우측 액션 버튼들 */
.right-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.cute-icon-btn {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  color: #8b4513;
}

.cute-icon-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.cute-icon-btn i {
  font-size: 1.1rem;
}

/* 배지 */
.cute-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
  border: 2px solid white;
  animation: pulse 2s ease-in-out infinite;
}

.cute-badge-green {
  background: #4caf50;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 떠다니는 장식 요소들 */
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-chick,
.floating-egg,
.floating-sun {
  position: absolute;
  font-size: 1.2rem;
  opacity: 0.3;
  animation: floatAround 8s ease-in-out infinite;
}

.floating-chick {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.floating-egg {
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.floating-sun {
  top: 40%;
  left: 80%;
  animation-delay: 4s;
}

@keyframes floatAround {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-10px) rotate(90deg);
    opacity: 0.5;
  }
  50% {
    transform: translateY(0px) rotate(180deg);
    opacity: 0.3;
  }
  75% {
    transform: translateY(-5px) rotate(270deg);
    opacity: 0.4;
  }
}

/* 반응형 디자인 */
@media (max-width: 992px) {
  .cute-header {
    flex-wrap: wrap;
    gap: 15px;
  }

  .main-menu {
    order: 3;
    width: 100%;
    margin-top: 10px;
  }

  .cute-nav-center {
    gap: 6px;
  }

  .cute-nav-link {
    padding: 8px 10px;
    font-size: 0.8rem;
  }

  .nav-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .cute-header {
    padding: 12px 15px;
  }

  .brand-text {
    font-size: 1.2rem;
  }

  .chick-icon {
    font-size: 1.6rem;
  }

  .cute-nav-center {
    gap: 4px;
  }

  .cute-nav-link {
    padding: 6px 8px;
    font-size: 0.75rem;
    flex-direction: column;
    text-align: center;
    min-width: 60px;
  }

  .cute-nav-link i {
    font-size: 0.9rem;
    margin: 0 0 2px 0 !important;
  }

  .nav-text {
    font-size: 0.7rem;
    line-height: 1;
  }

  .floating-elements {
    display: none;
  }

  .cute-dropdown-menu {
    position: fixed;
    top: auto;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: auto;
    max-width: 90vw;
    margin-top: 10px;
  }

  .cute-dropdown:hover .cute-dropdown-menu {
    transform: translateX(-50%);
  }
}

@media (max-width: 576px) {
  .cute-nav-center {
    gap: 2px;
  }

  .cute-nav-link {
    padding: 5px 6px;
    min-width: 50px;
  }

  .nav-text {
    font-size: 0.65rem;
  }

  .cute-icon-btn {
    padding: 8px 10px;
  }

  .subject-pill-mobile {
    font-size: 0.75rem;
    padding: 4px 8px;
  }

  .action-buttons {
    gap: 6px;
  }

  .cute-icon-btn {
    padding: 6px 8px;
  }
}

/* 활성화된 링크 스타일 */
.router-link-active.cute-nav-link,
.router-link-active.cute-dropdown-item {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* 접근성 개선 */
.cute-nav-link:focus,
.cute-icon-btn:focus {
  outline: 3px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

/* 부드러운 전환 효과 */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
