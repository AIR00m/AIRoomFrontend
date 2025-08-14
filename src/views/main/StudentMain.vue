<template>
  <div>
    <!-- 헤더 -->
    <header class="header">
      <Header></Header>
    </header>

    <!-- 알림 모달 -->
    <div
      class="notification-modal"
      :class="{ active: showNotificationModal }"
      @click="closeNotificationModal"
    >
      <div class="notification-content" @click.stop>
        <div class="notification-header">
          <h3 class="notification-title">🐥 새로운 소식이 왔어요!</h3>
          <button class="close-btn" @click="closeNotificationModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="notification-info">
          <i class="bi bi-info-circle me-2"></i>
          💌 받은 알림은 30일 후에 사라져요!
        </div>

        <div class="notification-tabs">
          <button
            v-for="tab in notificationTabs"
            :key="tab.key"
            class="tab-button"
            :class="{ active: currentNotificationTab === tab.key }"
            @click="switchNotificationTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="notification-list">
          <div
            v-if="filteredNotifications.length === 0"
            class="empty-notifications"
          >
            <div class="empty-icon">😴</div>
            <h4>아직 알림이 없어요</h4>
            <p>새로운 소식이 오면 여기에 나타날 거예요!</p>
          </div>

          <div v-else>
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="notification-item"
              :class="{ read: notification.read, unread: !notification.read }"
              @click="markAsRead(notification.id)"
            >
              <div class="notification-item-header">
                <span
                  class="notification-category"
                  :class="notification.category"
                >
                  {{ notification.category }}
                </span>
              </div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ notification.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 좌측: 학습 기록 -->
      <aside>
        <!-- 이번 주 학습 기록 -->
        <section class="card learning-record-section">
          <div class="record-header">
            <h3 class="card-title">📈 이번 주 공부 기록</h3>
            <button class="record-button" @click="exportLearningRecord">
              💾 기록 가져가기
            </button>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">📅</div>
              <div class="stat-value">
                {{ learningStats.studyDays
                }}<span style="font-size: 1rem">일</span>
              </div>
              <div class="stat-label">공부한 날</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⏰</div>
              <div class="stat-value">
                {{ learningStats.studyTime
                }}<span style="font-size: 1rem">분</span>
              </div>
              <div class="stat-label">공부 시간</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">✏️</div>
              <div class="stat-value">
                {{ learningStats.problemsSolved
                }}<span style="font-size: 1rem">개</span>
              </div>
              <div class="stat-label">푼 문제</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">
                {{ learningStats.accuracy
                }}<span style="font-size: 1rem">%</span>
              </div>
              <div class="stat-label">맞춘 비율</div>
            </div>
          </div>

          <!-- 격려 메시지 -->
          <div class="encouragement-message">
            <div class="encourage-icon">🌟</div>
            <div class="encourage-text">오늘도 열심히 공부해서 대단해요!</div>
          </div>
        </section>
      </aside>

      <!-- 우측: 메인 콘텐츠 -->
      <main>
        <!-- 우리 반 수업 -->
        <section class="class-card">
          <div class="class-card-header">
            <div class="class-title-wrapper">
              <h2 class="class-title">🏫 우리 반 수업</h2>
              <div class="class-subject">수학 3-1 | 김학생</div>
            </div>
            <div class="nav-arrows">
              <i
                class="nav-arrow bi bi-caret-left-fill"
                @click="navigateClass('next')"
              ></i>
              <i
                class="nav-arrow bi bi-caret-right-fill"
                @click="navigateClass('next')"
              ></i>
            </div>
          </div>

          <button class="study-btn" @click="startLearning">
            <span class="study-icon">🚀</span>
            공부 시작하기
          </button>

          <!-- 귀여운 학습 캐릭터들 -->
          <div class="study-characters">
            <div class="study-char char1">🐥</div>
            <div class="study-char char2">📚</div>
            <div class="study-char char3">🌟</div>
          </div>

          <div class="class-decorations">
            <div class="decoration decoration-1">☀️</div>
            <div class="decoration decoration-2">🐥</div>
            <div class="decoration decoration-3">🌟</div>
            <div class="decoration decoration-4">🌻</div>
          </div>
        </section>

        <!-- 과제/평가 섹션 -->
        <div class="evaluation-assignment-grid">
          <!-- 좌측: 과제 섹션 -->
          <section class="evaluation-section assignment-card">
            <div class="evaluation-header">
              <h3 class="section-title">📝 숙제</h3>
            </div>

            <div class="evaluation-nav">
              <i
                class="evaluation-nav-btn bi bi-caret-left-fill"
                @click="previousAssignment"
              ></i>
              <div class="unit-info">{{ assignmentUnit }}단원</div>
              <i
                class="evaluation-nav-btn bi bi-caret-right-fill"
                @click="nextAssignment"
              ></i>
            </div>

            <div class="completion-info">
              완료한 숙제
              <strong class="completion-count"
                >{{ assignmentCompleted }} / {{ assignmentTotal }}개</strong
              >
            </div>

            <div class="assignment-section">
              <div class="assignment-message">
                <div class="message-icon">🎯</div>
                <div class="message-text">
                  <div>아직 숙제가 없어요</div>
                  <div class="message-sub">
                    선생님이 숙제를 내주실 때까지 기다려요!
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 우측: 평가 섹션 -->
          <section class="evaluation-section assignment-card">
            <div class="evaluation-header">
              <h3 class="section-title">🏆 시험</h3>
            </div>

            <div class="evaluation-nav">
              <i
                class="evaluation-nav-btn bi bi-caret-left-fill"
                @click="previousEvaluation"
              ></i>
              <div class="unit-info">{{ evaluationUnit }}단원</div>
              <i
                class="evaluation-nav-btn bi bi-caret-right-fill"
                @click="nextEvaluation"
              ></i>
            </div>

            <div class="completion-info">
              완료한 시험
              <strong class="completion-count"
                >{{ evaluationCompleted }} / {{ evaluationTotal }}개</strong
              >
            </div>

            <div class="assignment-section">
              <div class="assignment-message">
                <div class="message-icon">📋</div>
                <div class="message-text">
                  <div>아직 시험이 없어요</div>
                  <div class="message-sub">
                    선생님이 시험을 내주실 때까지 기다려요!
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>

    <!-- TOP 버튼 -->
    <button
      v-show="showTopButton"
      class="top-button"
      @click="scrollToTop"
      title="맨 위로 올라가기"
    >
      <div class="top-icon">🐥</div>
      <div class="top-text">위로</div>
    </button>

    <!-- 떠다니는 장식들 -->
    <div class="floating-decorations">
      <div class="floating-item item1">🐥</div>
      <div class="floating-item item2">🌻</div>
      <div class="floating-item item3">☀️</div>
      <div class="floating-item item4">🐤</div>
      <div class="floating-item item5">🥚</div>
      <div class="floating-item item6">🌟</div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "@/components/common/Header.vue";

export default {
  name: "StudentMain",
  components: { Header },
  setup() {
    // 반응형 데이터
    const subjectInfo = ref("수학 3-1 | 김학생");
    const showNotificationModal = ref(false);
    const showTopButton = ref(false);
    const currentNotificationTab = ref("all");

    // 학습 통계
    const learningStats = reactive({
      studyDays: 0,
      studyTime: 0,
      problemsSolved: 0,
      accuracy: 0,
    });

    // 과제/평가 정보
    const assignmentUnit = ref(0);
    const assignmentCompleted = ref(0);
    const assignmentTotal = ref(0);
    const evaluationUnit = ref(0);
    const evaluationCompleted = ref(0);
    const evaluationTotal = ref(0);

    // 알림 탭 목록
    const notificationTabs = ref([
      { key: "all", label: "🐥 전체" },
      { key: "학습", label: "📚 공부" },
      { key: "공지", label: "📢 공지" },
      { key: "기타", label: "🌟 기타" },
    ]);

    // 알림 데이터
    const notifications = ref([
      {
        id: 1,
        category: "학습",
        message: "🏆 선생님께서 칭찬 도장 (+50)을 보내주셨어요. 잘했어요!",
        time: "05. 14, 오전 11:18",
        read: false,
      },
      {
        id: 2,
        category: "공지",
        message: "📝 수학 3-1 단원 평가가 등록되었습니다.",
        time: "05. 13, 오후 2:30",
        read: false,
      },
      {
        id: 3,
        category: "기타",
        message: "🎉 새로운 학습 자료가 업로드되었습니다.",
        time: "05. 12, 오전 9:15",
        read: true,
      },
      {
        id: 4,
        category: "학습",
        message: "✅ 과제 제출이 완료되었습니다.",
        time: "05. 11, 오후 4:20",
        read: true,
      },
    ]);

    // 계산된 속성
    const unreadNotificationCount = computed(() => {
      return notifications.value.filter((n) => !n.read).length;
    });

    const filteredNotifications = computed(() => {
      if (currentNotificationTab.value === "all") {
        return notifications.value;
      }
      return notifications.value.filter(
        (n) => n.category === currentNotificationTab.value
      );
    });

    // 메서드들
    const openNotificationModal = () => {
      showNotificationModal.value = true;
      document.body.style.overflow = "hidden";
    };

    const closeNotificationModal = () => {
      showNotificationModal.value = false;
      document.body.style.overflow = "auto";
    };

    const switchNotificationTab = (tab) => {
      currentNotificationTab.value = tab;
    };

    const markAsRead = (notificationId) => {
      const notification = notifications.value.find(
        (n) => n.id === notificationId
      );
      if (notification && !notification.read) {
        notification.read = true;
      }
    };

    const startLearning = () => {
      alert("🎉 우리 반 수업 학습을 시작해요! 화이팅!");
    };

    const navigateClass = (direction) => {
      console.log("수업 네비게이션:", direction);
      if (direction === "prev") {
        alert("⬅️ 이전 수업으로 이동해요!");
      } else {
        alert("➡️ 다음 수업으로 이동해요!");
      }
    };

    const previousAssignment = () => {
      console.log("이전 과제 단원으로 이동");
      alert("⬅️ 이전 숙제 단원으로 이동해요!");
    };

    const nextAssignment = () => {
      console.log("다음 과제 단원으로 이동");
      alert("➡️ 다음 숙제 단원으로 이동해요!");
    };

    const previousEvaluation = () => {
      console.log("이전 평가 단원으로 이동");
      alert("⬅️ 이전 시험 단원으로 이동해요!");
    };

    const nextEvaluation = () => {
      console.log("다음 평가 단원으로 이동");
      alert("➡️ 다음 시험 단원으로 이동해요!");
    };

    const exportLearningRecord = () => {
      alert("💾 학습 기록을 저장해요!");
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    const handleScroll = () => {
      showTopButton.value = window.pageYOffset > 300;
    };

    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        closeNotificationModal();
      }
    };

    // 라이프사이클 훅
    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
      document.addEventListener("keydown", handleKeydown);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeydown);
    });

    return {
      // 데이터
      subjectInfo,
      showNotificationModal,
      showTopButton,
      currentNotificationTab,
      learningStats,
      assignmentUnit,
      assignmentCompleted,
      assignmentTotal,
      evaluationUnit,
      evaluationCompleted,
      evaluationTotal,
      notificationTabs,
      notifications,

      // 계산된 속성
      unreadNotificationCount,
      filteredNotifications,

      // 메서드
      openNotificationModal,
      closeNotificationModal,
      switchNotificationTab,
      markAsRead,
      startLearning,
      navigateClass,
      previousAssignment,
      nextAssignment,
      previousEvaluation,
      nextEvaluation,
      exportLearningRecord,
      scrollToTop,
    };
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #fffacd 0%, #fff8dc 50%, #f0f8ff 100%);
  color: #333;
  line-height: 1.6;
}

/* 메인 컨테이너 */
.main-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

/* 카드 공통 스타일 */
.card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(255, 193, 7, 0.15);
  border: 3px solid #fff9c4;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(255, 193, 7, 0.25);
  border-color: #ffe082;
}

.card::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 213, 79, 0.1) 0%,
    transparent 70%
  );
  animation: sparkle 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0.3;
    transform: rotate(0deg);
  }
  50% {
    opacity: 0.7;
    transform: rotate(180deg);
  }
}

.card-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #f57f17;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
}

/* 좌측 학습 기록 */
.learning-record-section {
  margin-bottom: 2rem;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
  width: 400px;
  max-width: 800px;
}

.record-button {
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  border: 2px solid #ffe082;
  padding: 0.6rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #f57f17;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
}

.record-button:hover {
  background: linear-gradient(135deg, #ffe082, #fff9c4);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 193, 7, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background: linear-gradient(135deg, #fffacd, #fff8dc);
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #fff9c4;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 15px;
  border: 2px solid #fff9c4;
  transition: all 0.3s ease;
  position: relative;
}

.stat-item:hover {
  transform: scale(1.05);
  border-color: #ffe082;
  box-shadow: 0 8px 20px rgba(255, 193, 7, 0.15);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  animation: bounce 2s infinite;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #f57f17;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #ff8f00;
  font-weight: 600;
}

.encouragement-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #98fb98, #90ee90);
  padding: 1rem 1.5rem;
  border-radius: 15px;
  border: 2px solid #32cd32;
  position: relative;
  z-index: 2;
}

.encourage-icon {
  font-size: 2rem;
  animation: twinkle 1.5s ease-in-out infinite;
}

@keyframes twinkle {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.encourage-text {
  color: #006400;
  font-weight: 700;
  font-size: 1rem;
}

/* 우리 반 수업 카드 */
.class-card {
  /* background: linear-gradient(135deg, #ff69b4 0%, #ff1493 50%, #ffb6c1 100%); */
  background: linear-gradient(135deg, #ffeb3b 0%, #ffd54f 50%, #fee500 100%);
  /* background-color: #fee500; */
  border-radius: 25px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  color: white;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 3px solid #ffe082;
}

.class-card::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.2) 0%,
    transparent 70%
  );
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(180deg);
  }
}

.class-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.class-title-wrapper {
  flex: 1;
}

.class-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.class-subject {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.nav-arrows {
  display: flex;
  gap: 10px;
}

.nav-arrow {
  width: 45px;
  height: 45px;
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: black;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.2rem;
  font-weight: 700;
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.study-btn {
  background: white;
  color: #f57f17;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-weight: 800;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  align-self: flex-start;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

.study-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  background: #fffacd;
}

.study-icon {
  font-size: 1.3rem;
  animation: rocket 2s ease-in-out infinite;
}

@keyframes rocket {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.study-characters {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1;
}

.study-char {
  font-size: 2rem;
  animation: bounce 2s infinite;
  animation-delay: var(--delay, 0s);
}

.char1 {
  --delay: 0s;
}
.char2 {
  --delay: 0.3s;
}
.char3 {
  --delay: 0.6s;
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

/* 과제/평가 섹션 그리드 */
.evaluation-assignment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

/* 장식 요소들 */
.class-decorations {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.6;
  animation: float 4s ease-in-out infinite;
}

.decoration-1 {
  top: 20%;
  right: 25%;
  animation-delay: 0s;
}

.decoration-2 {
  top: 70%;
  right: 15%;
  animation-delay: 1s;
}

.decoration-3 {
  top: 40%;
  right: 35%;
  animation-delay: 2s;
}

.decoration-4 {
  top: 60%;
  right: 45%;
  animation-delay: 3s;
}

/* 평가 섹션 */
.evaluation-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 3px solid #fff8dc;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.assignment-card {
  border-color: #fff9c4;
}

.assignment-card:hover {
  border-color: #ffe082;
  box-shadow: 0 12px 40px rgba(255, 193, 7, 0.15);
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #f57f17;
  margin: 0;
}

.evaluation-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.evaluation-nav-btn {
  background: none;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  border: 2px solid #ffe082;
}

.evaluation-nav-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.unit-info {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f57f17;
  min-width: 80px;
  text-align: center;
}

.completion-info {
  margin-bottom: 2rem;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 600;
}

.completion-count {
  color: #f57f17;
  font-size: 1.1rem;
}

/* 과제 섹션 */
.assignment-section {
  background: linear-gradient(135deg, #fffacd, #fff9c4);
  padding: 2.5rem;
  border-radius: 15px;
  text-align: center;
  margin-top: 1rem;
  border: 2px solid #fff9c4;
}

.assignment-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.message-icon {
  font-size: 3rem;
  animation: wiggle 3s ease-in-out infinite;
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

.message-text {
  text-align: center;
}

.message-text > div:first-child {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f57f17;
  margin-bottom: 0.5rem;
}

.message-sub {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 600;
}

/* TOP 버튼 */
.top-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ffd54f, #ffc107);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 3px solid #ffe082;
}

.top-button:hover {
  background: linear-gradient(135deg, #ffc107, #ff8f00);
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 193, 7, 0.4);
}

.top-icon {
  font-size: 1.5rem;
  margin-bottom: 2px;
}

.top-text {
  font-size: 0.7rem;
  font-weight: 700;
}

/* 알림 모달 스타일 */
.notification-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.notification-modal.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(255, 193, 7, 0.3);
  animation: slideUp 0.3s ease;
  border: 3px solid #ffe082;
}

.notification-header {
  background: linear-gradient(135deg, #ffd54f, #ffc107);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.notification-info {
  background: linear-gradient(135deg, #e0f2fe, #f0f9ff);
  padding: 1rem 1.5rem;
  border-left: 4px solid #3b82f6;
  margin: 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #374151;
  font-weight: 600;
}

.notification-tabs {
  display: flex;
  padding: 0 1.5rem;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 20px;
  background: #f1f5f9;
  color: #6b7280;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.tab-button.active {
  background: linear-gradient(135deg, #ffd54f, #ffc107);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3);
}

.tab-button:hover:not(.active) {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem;
}

.notification-item {
  padding: 1.2rem;
  border-left: 4px solid #e2e8f0;
  margin-bottom: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: #f1f5f9;
  border-left-color: #ffd54f;
  transform: translateX(5px);
}

.notification-item.read {
  background: white;
  border-left-color: #d1d5db;
  opacity: 0.7;
}

.notification-item.unread {
  background: linear-gradient(135deg, #fffacd, #fff9c4);
  border-left-color: #ffd54f;
  box-shadow: 0 2px 10px rgba(255, 193, 7, 0.1);
}

.notification-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-category {
  background: #ffd54f;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
}

.notification-category.학습 {
  background: #10b981;
}

.notification-category.공지 {
  background: #f59e0b;
}

.notification-category.기타 {
  background: #8b5cf6;
}

.notification-message {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  font-size: 0.95rem;
}

.notification-time {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
}

.empty-notifications {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-notifications h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 700;
}

.empty-notifications p {
  font-weight: 600;
}

/* 떠다니는 장식들 */
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
  font-size: 2rem;
  opacity: 0.4;
  animation: floatAround 8s ease-in-out infinite;
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

@keyframes floatAround {
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

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-container {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 1rem;
    margin: 1rem auto;
  }

  .class-card {
    padding: 2rem 1.5rem;
    margin-bottom: 1rem;
    min-height: 200px;
  }

  .class-title {
    font-size: 1.6rem;
  }

  .study-characters {
    position: static;
    transform: none;
    flex-direction: row;
    justify-content: center;
    margin-top: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
    padding: 1rem;
  }

  .evaluation-assignment-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .notification-content {
    width: 95%;
    margin: 1rem;
  }

  .notification-tabs {
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .tab-button {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }

  .floating-item {
    font-size: 1.5rem;
  }

  .class-card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .nav-arrows {
    align-self: flex-end;
  }
}

/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 호버 효과 개선 */
@media (hover: none) {
  .card:hover {
    transform: none;
  }

  .stat-item:hover {
    transform: none;
  }
}
</style>
