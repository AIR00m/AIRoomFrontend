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
          <h3 class="notification-title">알림</h3>
          <button class="close-btn" @click="closeNotificationModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="notification-info">
          <i class="bi bi-info-circle me-2"></i>
          수신된 알림은 30일 이후 자동 삭제됩니다.
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
            <i class="bi bi-bell-slash"></i>
            <h4>알림이 없습니다</h4>
            <p>새로운 알림이 도착하면 여기에 표시됩니다.</p>
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
            <h3 class="card-title">📊 이번 주 학습 기록</h3>
            <button class="record-button" @click="exportLearningRecord">
              📊 기록 가져가기
            </button>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">
                {{ learningStats.studyDays
                }}<span style="font-size: 1rem">일</span>
              </div>
              <div class="stat-label">학습일</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                {{ learningStats.studyTime
                }}<span style="font-size: 1rem">분</span>
              </div>
              <div class="stat-label">학습 시간</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                {{ learningStats.problemsSolved
                }}<span style="font-size: 1rem">개</span>
              </div>
              <div class="stat-label">문제 풀이 수</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">
                {{ learningStats.accuracy
                }}<span style="font-size: 1rem">%</span>
              </div>
              <div class="stat-label">정답률</div>
            </div>
          </div>
        </section>
      </aside>

      <!-- 우측: 메인 콘텐츠 -->
      <main>
        <!-- 우리 반 수업 -->
        <section class="class-card">
          <div class="class-card-header">
            <h2 class="class-title">우리 반 수업</h2>
            <div class="nav-arrows">
              <button class="nav-arrow" @click="navigateClass('prev')">
                ‹
              </button>
              <button class="nav-arrow" @click="navigateClass('next')">
                ›
              </button>
            </div>
          </div>

          <button class="study-btn" @click="startLearning">🎯 학습하기</button>

          <div class="class-decorations">
            <div class="decoration decoration-1"></div>
            <div class="decoration decoration-2"></div>
            <div class="decoration decoration-3"></div>
          </div>
        </section>

        <!-- 평가/과제 섹션 -->
        <div class="evaluation-assignment-grid">
          <!-- 좌측: 과제 섹션 -->
          <section class="evaluation-section">
            <div class="evaluation-header">
              <h3
                style="
                  font-size: 1.3rem;
                  font-weight: 600;
                  color: #374151;
                  margin: 0;
                "
              >
                과제
              </h3>
            </div>

            <div class="evaluation-nav">
              <button class="evaluation-nav-btn" @click="previousAssignment">
                ‹
              </button>
              <div class="unit-info">{{ assignmentUnit }}단원</div>
              <button class="evaluation-nav-btn" @click="nextAssignment">
                ›
              </button>
            </div>

            <div class="completion-info">
              응시 완료 수
              <strong
                >{{ assignmentCompleted }} / {{ assignmentTotal }}개</strong
              >
            </div>

            <div class="assignment-section">
              <div class="assignment-message">
                🧩 아직 과제가 없어요. 선생님을 기다려 봐요!
              </div>
            </div>
          </section>

          <!-- 우측: 평가 섹션 -->
          <section class="evaluation-section">
            <div class="evaluation-header">
              <h3
                style="
                  font-size: 1.3rem;
                  font-weight: 600;
                  color: #374151;
                  margin: 0;
                "
              >
                평가
              </h3>
            </div>

            <div class="evaluation-nav">
              <button class="evaluation-nav-btn" @click="previousEvaluation">
                ‹
              </button>
              <div class="unit-info">{{ evaluationUnit }}단원</div>
              <button class="evaluation-nav-btn" @click="nextEvaluation">
                ›
              </button>
            </div>

            <div class="completion-info">
              응시 완료 수
              <strong
                >{{ evaluationCompleted }} / {{ evaluationTotal }}개</strong
              >
            </div>

            <div class="assignment-section">
              <div class="assignment-message">
                📝 아직 평가가 없어요. 선생님을 기다려 봐요!
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
      title="맨 위로"
    >
      <i class="bi bi-arrow-up"></i>
      <div style="font-size: 0.7rem; margin-top: 2px">TOP</div>
    </button>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
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
      { key: "all", label: "전체" },
      { key: "학습", label: "학습" },
      { key: "공지", label: "공지" },
      { key: "기타", label: "기타" },
    ]);

    // 알림 데이터
    const notifications = ref([
      {
        id: 1,
        category: "학습",
        message: "선생님께서 칭찬 도장 (+50)을 보내주셨어요. 잘했어요!",
        time: "05. 14, 오전 11:18",
        read: false,
      },
      {
        id: 2,
        category: "공지",
        message: "수학 3-1 단원 평가가 등록되었습니다.",
        time: "05. 13, 오후 2:30",
        read: false,
      },
      {
        id: 3,
        category: "기타",
        message: "새로운 학습 자료가 업로드되었습니다.",
        time: "05. 12, 오전 9:15",
        read: true,
      },
      {
        id: 4,
        category: "학습",
        message: "과제 제출이 완료되었습니다.",
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
      alert("우리 반 수업 학습을 시작합니다!");
    };

    const navigateClass = (direction) => {
      console.log("수업 네비게이션:", direction);
      if (direction === "prev") {
        alert("이전 수업으로 이동합니다.");
      } else {
        alert("다음 수업으로 이동합니다.");
      }
    };

    const previousAssignment = () => {
      console.log("이전 과제 단원으로 이동");
      alert("이전 과제 단원으로 이동합니다.");
    };

    const nextAssignment = () => {
      console.log("다음 과제 단원으로 이동");
      alert("다음 과제 단원으로 이동합니다.");
    };

    const previousEvaluation = () => {
      console.log("이전 평가 단원으로 이동");
      alert("이전 평가 단원으로 이동합니다.");
    };

    const nextEvaluation = () => {
      console.log("다음 평가 단원으로 이동");
      alert("다음 평가 단원으로 이동합니다.");
    };

    const exportLearningRecord = () => {
      alert("학습 기록을 저장합니다!");
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
/* Bootstrap 5 CSS와 Bootstrap Icons는 별도로 import 필요 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8fafc;
  color: #333;
  line-height: 1.6;
}

/* 헤더 스타일 */
.header {
  background-color: #034582;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(30, 64, 175, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subject-info {
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 500;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  list-style: none;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.nav-menu a:hover,
.nav-menu a.active {
  background: rgba(255, 255, 255, 0.2);
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
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(30, 64, 175, 0.1);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 좌측 학습 기록 */
.learning-record-section {
  margin-bottom: 2rem;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.record-button {
  background: #f3f4f6;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.record-button:hover {
  background: #e5e7eb;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
}

/* 우리 반 수업 카드 */
.class-card {
  background: linear-gradient(135deg, #034582, #0369a1);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  color: white;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.class-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.class-title {
  font-size: 1.8rem;
  font-weight: 700;
}

.nav-arrows {
  display: flex;
  gap: 8px;
}

.nav-arrow {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 1.2rem;
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.study-btn {
  background: white;
  color: #034582;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
}

.study-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 평가/과제 섹션 그리드 */
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
}

.decoration {
  position: absolute;
  border-radius: 50%;
}

.decoration-1 {
  width: 20px;
  height: 20px;
  background: #fbbf24;
  top: 30%;
  right: 25%;
  animation: float 3s ease-in-out infinite;
}

.decoration-2 {
  width: 12px;
  height: 12px;
  background: #10b981;
  top: 60%;
  right: 15%;
  animation: float 3s ease-in-out infinite 1s;
}

.decoration-3 {
  width: 16px;
  height: 16px;
  background: #06b6d4;
  top: 20%;
  right: 35%;
  animation: float 3s ease-in-out infinite 2s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 평가 섹션 */
.evaluation-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f3f4f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.evaluation-nav-btn:hover {
  background: #e5e7eb;
}

.unit-info {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.completion-info {
  margin-bottom: 2rem;
  color: #6b7280;
  font-size: 0.9rem;
}

/* 과제 섹션 */
.assignment-section {
  background: #f8fafc;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  margin-top: 1rem;
}

.assignment-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

/* TOP 버튼 */
.top-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: #374151;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;
}

.top-button:hover {
  background: #1f2937;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

/* 네비게이션 메뉴 글자 크기 & 간격 조정 */
.navbar-nav .nav-link {
  font-size: 1.1rem;
  padding: 0.7rem 1.2rem;
}

.navbar-nav .nav-item {
  margin-right: 0.8rem;
}

.navbar-brand {
  font-size: 1.5rem;
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
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.notification-header {
  background: #034582;
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-title {
  font-size: 1.3rem;
  font-weight: 600;
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
  background: #e0f2fe;
  padding: 1rem 1.5rem;
  border-left: 4px solid #034582;
  margin: 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #374151;
}

.notification-tabs {
  display: flex;
  padding: 0 1.5rem;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 25px;
  background: #f1f5f9;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.tab-button.active {
  background: #034582;
  color: white;
}

.tab-button:hover:not(.active) {
  background: #e2e8f0;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem;
}

.notification-item {
  padding: 1rem;
  border-left: 4px solid #e2e8f0;
  margin-bottom: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: #f1f5f9;
  border-left-color: #034582;
}

.notification-item.read {
  background: white;
  border-left-color: #d1d5db;
  opacity: 0.7;
}

.notification-item.unread {
  background: #f0f9ff;
  border-left-color: #034582;
}

.notification-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-category {
  background: #034582;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.notification-category.학습 {
  background: #059669;
}

.notification-category.공지 {
  background: #dc2626;
}

.notification-category.기타 {
  background: #7c3aed;
}

.notification-message {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.empty-notifications {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-notifications i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
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
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }

  .nav-menu {
    gap: 1rem;
  }

  .class-card {
    padding: 24px;
    margin-bottom: 1rem;
  }

  .class-title {
    font-size: 1.4rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .evaluation-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
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
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
