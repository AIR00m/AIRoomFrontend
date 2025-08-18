<template>
  <div>
    <!-- 떠다니는 장식 요소들 -->
    <div class="floating-decorations">
      <div class="floating-item item1">📚</div>
      <div class="floating-item item2">🌟</div>
      <div class="floating-item item3">✨</div>
      <div class="floating-item item4">🎈</div>
      <div class="floating-item item5">📝</div>
      <div class="floating-item item6">🎯</div>
    </div>

    <!-- 헤더 -->
    <header class="header">
      <Header></Header>
    </header>

    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 브레드크럼 -->
      <div class="breadcrumb-section">
        <h1 class="page-title">🏫 우리 반 수업</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a href="#" @click.prevent>🏠 홈</a>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              우리 반 수업
            </li>
          </ol>
        </nav>
      </div>

      <!-- 상단 액션 버튼 -->
      <div class="action-buttons">
        <button class="btn-action" @click="handleActionButton('restructure')">
          <i class="bi bi-book"></i>
          수업 재구성
        </button>
        <button
          class="btn-action"
          @click="handleActionButton('evaluation-management')"
        >
          <i class="bi bi-clipboard-check"></i>
          평가 관리
        </button>
      </div>

      <!-- 두 열 레이아웃 -->
      <div class="content-layout">
        <!-- 왼쪽: 단원 선택 -->
        <div class="unit-section">
          <div class="unit-header">📚 단원 선택</div>
          <div class="unit-list-container">
            <div class="unit-list">
              <button
                v-for="(unit, index) in units"
                :key="index"
                class="unit-item"
                :class="{ active: activeUnit === unit }"
                @click="selectUnit(unit)"
              >
                {{ unit }}
              </button>
            </div>
          </div>
        </div>

        <!-- 오른쪽: 학습 목차 -->
        <div class="session-section">
          <div class="session-header">📝 학습 목차</div>
          <div class="session-list-container">
            <div
              v-for="(session, index) in sessions"
              :key="session.id"
              class="session-item"
              :class="{
                active: activeSession === index,
                'evaluation-item': session.type === 'evaluation',
              }"
              @click="selectSession(index)"
            >
              <div class="session-content">
                <div class="session-info">
                  <div class="session-thumbnail">
                    {{ session.thumbnail }}
                  </div>
                  <div class="session-details">
                    <h3>{{ session.title }}</h3>
                    <p>{{ session.description }}</p>
                  </div>
                </div>
                <div class="session-buttons">
                  <template v-if="session.type === 'evaluation'">
                    <button
                      class="btn-session btn-session-secondary"
                      @click.stop="
                        handleButtonClick('evaluation-report', session.title)
                      "
                    >
                      📊 평가 리포트
                    </button>
                    <button
                      class="btn-session btn-session-primary"
                      @click.stop="
                        handleButtonClick('view-problems', session.title)
                      "
                    >
                      📝 문제 보기
                    </button>
                  </template>
                  <template v-else>
                    <button
                      class="btn-session btn-session-secondary"
                      @click.stop="
                        handleButtonClick('student-status', session.title)
                      "
                    >
                      📊 학생 학습 현황
                    </button>
                    <button
                      class="btn-session btn-session-primary"
                      @click.stop="
                        handleButtonClick('start-class', session.title)
                      "
                    >
                      🚀 수업하기
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 플로팅 챗봇 -->
    <button class="floating-chatbot" title="학습 챗봇" @click="handleChatbot">
      🤖
    </button>

    <!-- 토스트 알림 -->
    <div
      v-if="showToast"
      class="toast-notification"
      :class="{ show: showToast }"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import Header from "@/components/common/Header.vue";

export default {
  name: "ClassroomApp",
  components: { Header },
  setup() {
    // 반응형 상태
    const activeUnit = ref("8. Do You Have a Pencil?");
    const activeSession = ref(0);
    const showToast = ref(false);
    const toastMessage = ref("");

    // 단원 목록
    const units = [
      "1. Hello, ABC!",
      "2. What's This?",
      "3. Sit Down, Please",
      "High Five 1",
      "4. How Many Melons?",
      "5. I Like Pizza",
      "6. What Color Is It?",
      "High Five 2",
      "Review 1",
      "7. Is It a Dog?",
      "8. Do You Have a Pencil?",
      "High Five 3",
      "9. Can You Swim?",
      "10. She's My Mom",
      "11. It's Snowing",
      "High Five 4",
      "Review 2",
      "Project",
    ];

    // 세션 목록
    const sessions = [
      {
        id: 1,
        title: "🎯 첫째 시간",
        description: "Do You Have a Pencil? - 기본 문형 학습",
        thumbnail: "01",
        type: "normal",
      },
      {
        id: 2,
        title: "💬 둘째 시간",
        description: "대화 연습 및 어휘 확장",
        thumbnail: "02",
        type: "normal",
      },
      {
        id: 3,
        title: "🎮 셋째 시간",
        description: "게임과 활동을 통한 응용 학습",
        thumbnail: "03",
        type: "normal",
      },
      {
        id: 4,
        title: "📖 넷째 시간",
        description: "종합 정리 및 실전 연습",
        thumbnail: "04",
        type: "normal",
      },
      {
        id: 5,
        title: "🤖 AI Speaking",
        description: "AI와 함께하는 말하기 연습",
        thumbnail: "AI",
        type: "ai",
      },
      {
        id: 6,
        title: "✍️ AI Writing",
        description: "AI와 함께하는 쓰기 연습",
        thumbnail: "AI",
        type: "ai",
      },
      {
        id: 7,
        title: "📝 Do You Have a Pencil? 단원 평가",
        description: "종합 평가 및 성취도 확인",
        thumbnail: "📋",
        type: "evaluation",
      },
    ];

    // 토스트 알림 함수
    const displayToast = (message, duration = 2000) => {
      toastMessage.value = message;
      showToast.value = true;

      setTimeout(() => {
        showToast.value = false;
      }, duration);
    };

    // 메서드
    const selectUnit = (unit) => {
      activeUnit.value = unit;
      console.log("선택된 단원:", unit);
      displayToast("📚 " + unit + " 단원을 선택했어요!");
    };

    const selectSession = (index) => {
      activeSession.value = index;
      console.log("선택된 세션:", sessions[index].title);
      displayToast("✨ " + sessions[index].title + " 세션을 선택했어요!");
    };

    const handleButtonClick = (buttonType, sessionTitle) => {
      switch (buttonType) {
        case "start-class":
          displayToast("🚀 수업을 시작합니다! 재미있게 공부해봐요!");
          break;
        case "student-status":
          displayToast("📊 학생들의 학습 현황을 확인해요!");
          break;
        case "evaluation-report":
          displayToast("📋 평가 리포트를 확인합니다!");
          break;
        case "view-problems":
          displayToast("📝 문제들을 살펴봐요!");
          break;
      }
    };

    const handleActionButton = (action) => {
      switch (action) {
        case "restructure":
          displayToast("📚 수업을 새롭게 구성해봐요!");
          break;
        case "evaluation-management":
          displayToast("📊 평가를 관리해봐요!");
          break;
      }
    };

    const handleChatbot = () => {
      displayToast(
        "🤖 안녕하세요! 교과서 공부를 시작해볼까요? 궁금한 것이 있으면 언제든 물어보세요!",
        3000
      );
    };

    // 라이프사이클 훅
    onMounted(() => {
      setTimeout(() => {
        displayToast(
          "🎉 우리 반 수업에 오신 걸 환영해요! 즐거운 학습 시간 되세요!",
          3000
        );
      }, 1000);
    });

    return {
      // 데이터
      activeUnit,
      activeSession,
      units,
      sessions,
      showToast,
      toastMessage,

      // 메서드
      selectUnit,
      selectSession,
      handleButtonClick,
      handleActionButton,
      handleChatbot,
    };
  },
};
</script>

<style scoped>
/* Bootstrap override */
body {
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
  background-color: #fff9e6 !important;
  color: #333;
  line-height: 1.6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 헤더 스타일 */

.navbar {
  background: #ffdd29 !important;
}

.logo-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  animation: wiggle 2s ease-in-out infinite;
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  75% {
    transform: rotate(-5deg);
  }
}

.subject-badge {
  background: rgba(255, 255, 255, 0.2) !important;
  font-weight: 600 !important;
}

.navbar-nav .nav-link {
  font-size: 1.1rem !important;
  padding: 0.7rem 1.2rem !important;
  transition: all 0.3s;
  border-radius: 20px !important;
  font-weight: 600 !important;
}

.navbar-nav .nav-link:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateY(-2px);
}

.navbar-nav .nav-link.active-nav {
  background: rgba(255, 255, 255, 0.2) !important;
}

.navbar-nav .nav-item {
  margin-right: 0.8rem;
}

.navbar-brand {
  font-size: 2rem !important;
  font-weight: 800 !important;
}

.navbar-toggler-icon {
  filter: invert(1);
}

/* 메인 컨테이너 */
.main-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

/* 브레드크럼 */
.breadcrumb-section {
  background: white;
  border-radius: 25px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.15);
  border: 3px solid #ffe066;
  animation: bounceIn 0.6s ease;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ff9800;
  margin-bottom: 1rem;
}

.breadcrumb {
  background: none;
  margin-bottom: 0;
  padding: 0;
  font-weight: 600;
}

.breadcrumb-item a {
  color: #ffb74d;
  text-decoration: none;
}

.breadcrumb-item.active {
  color: #ff9800;
  font-weight: 600;
}

/* 상단 액션 버튼 */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: flex-end;
}

.btn-action {
  background: #ffdd29;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-action:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

/* 두 열 레이아웃 */
.content-layout {
  display: flex;
  gap: 0;
  background: white;
  border-radius: 25px;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.15);
  border: 3px solid #ffe066;
  overflow: hidden;
  min-height: 600px;
  animation: slideInUp 0.8s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 왼쪽: 단원 선택 */
.unit-section {
  width: 350px;
  background: #fff5d6;
  border-right: 3px solid #ffe066;
  display: flex;
  flex-direction: column;
}

.unit-header {
  background: #ffdd29;
  color: white;
  padding: 1.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.unit-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.unit-list {
  display: flex;
  flex-direction: column;
}

.unit-item {
  background: transparent;
  color: #ff9800;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  border-bottom: 2px solid #fff5d6;
}

.unit-item:hover {
  background: #fff5d6;
  transform: translateX(5px);
}

.unit-item.active {
  background: #ffdd29;
  color: white;
  font-weight: 700;
  transform: translateX(10px);
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.unit-item:last-child {
  border-bottom: none;
}

/* 오른쪽: 학습 목차 */
.session-section {
  flex: 1;
  background: #fffbf0;
  display: flex;
  flex-direction: column;
}

.session-header {
  background: #ffdd29;
  color: white;
  padding: 1.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.session-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.session-item {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  animation: slideIn 0.5s ease-out forwards;
}

.session-item:last-child {
  margin-bottom: 0;
}

.session-item.active {
  background: #ffdd29;
  color: white;
  border-color: #ffdd29;
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(255, 221, 41, 0.3);
}

.session-item:hover:not(.active) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.2);
  border-color: #ffe066;
}

.session-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.session-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  background: #fff5d6;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #ff9800;
  border: 2px solid #ffe066;
}

.session-details h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.session-details p {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
  font-weight: 500;
}

.session-buttons {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.btn-session {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-session-primary {
  background: #ff9800;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.btn-session-primary:hover {
  background: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.btn-session-secondary {
  background: rgba(255, 255, 255, 0.3);
  color: inherit;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.session-item:not(.active) .btn-session-secondary {
  background: #fff5d6;
  color: #ff9800;
  border-color: #ffe066;
}

.btn-session-secondary:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* 평가 아이템 특별 스타일 */
.evaluation-item {
  background: #fef7cd;
  border-color: #fbbf24;
}

.evaluation-item .session-details h3 {
  color: #92400e;
}

.evaluation-item .btn-session-primary {
  background: #f59e0b;
}

.evaluation-item .btn-session-primary:hover {
  background: #d97706;
}

/* 플로팅 챗봇 */
.floating-chatbot {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  background: #ffdd29;
  border-radius: 50%;
  border: 3px solid #ffe066;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.3);
  color: white;
  font-size: 2rem;
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.floating-chatbot:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(255, 221, 41, 0.4);
}

/* 떠다니는 장식 요소들 */
.floating-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-item {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.item1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}
.item2 {
  top: 20%;
  right: 10%;
  animation-delay: 1s;
}
.item3 {
  top: 60%;
  left: 5%;
  animation-delay: 2s;
}
.item4 {
  top: 80%;
  right: 20%;
  animation-delay: 3s;
}
.item5 {
  top: 40%;
  left: 80%;
  animation-delay: 4s;
}
.item6 {
  top: 70%;
  right: 5%;
  animation-delay: 5s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
  }
  50% {
    transform: translateY(0px) rotate(180deg);
  }
  75% {
    transform: translateY(-10px) rotate(270deg);
  }
}

/* 토스트 알림 */
.toast-notification {
  position: fixed;
  top: 100px;
  right: 20px;
  background: #ffdd29;
  color: white;
  padding: 15px 25px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.3);
  border: 3px solid #ffe066;
  z-index: 10000;
  max-width: 300px;
  transform: translateX(100px);
  opacity: 0;
  transition: all 0.5s ease;
}

.toast-notification.show {
  transform: translateX(0);
  opacity: 1;
}

/* 애니메이션 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.session-item:nth-child(1) {
  animation-delay: 0.1s;
}
.session-item:nth-child(2) {
  animation-delay: 0.2s;
}
.session-item:nth-child(3) {
  animation-delay: 0.3s;
}
.session-item:nth-child(4) {
  animation-delay: 0.4s;
}
.session-item:nth-child(5) {
  animation-delay: 0.5s;
}
.session-item:nth-child(6) {
  animation-delay: 0.6s;
}
.session-item:nth-child(7) {
  animation-delay: 0.7s;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-container {
    padding: 0 1rem;
  }

  .content-layout {
    flex-direction: column;
    min-height: auto;
  }

  .unit-section {
    width: 100%;
    border-right: none;
    border-bottom: 3px solid #ffe066;
  }

  .session-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .session-buttons {
    width: 100%;
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .floating-item {
    font-size: 1.2rem;
  }

  .toast-notification {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

/* 스크롤바 스타일 */
.unit-list-container::-webkit-scrollbar,
.session-list-container::-webkit-scrollbar {
  width: 8px;
}

.unit-list-container::-webkit-scrollbar-track,
.session-list-container::-webkit-scrollbar-track {
  background: #fff5d6;
  border-radius: 4px;
}

.unit-list-container::-webkit-scrollbar-thumb,
.session-list-container::-webkit-scrollbar-thumb {
  background: #ffe066;
  border-radius: 4px;
}

.unit-list-container::-webkit-scrollbar-thumb:hover,
.session-list-container::-webkit-scrollbar-thumb:hover {
  background: #ffdd29;
}

/* 접근성 개선 */
.unit-item:focus,
.btn-session:focus,
.btn-action:focus,
.floating-chatbot:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
