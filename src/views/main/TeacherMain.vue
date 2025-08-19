<template>
  <div>
    <!-- 헤더 -->
    <header class="header">
      <Header></Header>
    </header>

    <!-- 페이지 컨테이너 -->
    <div class="teacher-page">
      <div class="teacher-container">
        <!-- 페이지 헤더 -->
        <div class="page-header">
          <div class="page-text">
            <h1 class="page-title">🌟 선생님 대시보드</h1>
            <p class="page-subtitle">
              우리 반 친구들과 함께하는 즐거운 수업! 오늘도 화이팅! ✨
            </p>
            <div class="teacher-info">
              <span class="subject-badge">{{ teacherInfo }}</span>
            </div>
          </div>
        </div>

        <!-- 안내 상자 -->
        <div class="notice-box">
          <span class="notice-icon">💡</span>
          <div class="notice-content">
            <p><strong>📚 오늘의 수업 팁!</strong></p>
            <p>
              학생들의 학습 현황을 확인하고 맞춤형 피드백을 제공해보세요! 🎯
            </p>
          </div>
        </div>

        <!-- 메인 컨테이너 -->
        <div class="main-container">
          <!-- 메인 콘텐츠 -->
          <main>
            <!-- 최근 수업 -->
            <section class="card recent-lesson">
              <h2 class="card-title">📖 현재 진행 중인 수업</h2>
              <div class="lesson-content">
                <div class="lesson-info">
                  <h3>{{ currentLesson.title }}</h3>
                  <p>{{ currentLesson.subtitle }}</p>
                </div>
                <div class="lesson-buttons">
                  <button class="btn btn-primary" @click="startTextbookLesson">
                    🚀 교과서 수업하기
                  </button>
                  <button class="btn btn-primary" @click="startWorkbookLesson">
                    📝 수학익힘
                  </button>
                </div>
              </div>
            </section>

            <!-- 지난 수업 분석 -->
            <section class="card analysis-card">
              <div class="card-header-with-button">
                <h2 class="card-title">📊 지난 수업 분석 및 추천</h2>
                <button class="btn btn-secondary" @click="viewLearningStatus">
                  📈 학습 현황 보기
                </button>
              </div>
              <div v-if="!hasAnalysisData" class="no-data">
                <div class="no-data-icon">📋</div>
                <div class="no-data-text">
                  <h3>아직 평가가 없는 수업입니다</h3>
                  <p>
                    학생들이 평가를 완료하면 여기에 분석 결과가 나타날 거예요!
                    🎉
                  </p>
                </div>
              </div>
              <div v-else>
                <!-- 분석 데이터가 있을 때의 내용 -->
              </div>
            </section>

            <!-- 단원 성취 현황 -->
            <section class="card achievement-card">
              <h2 class="card-title">📈 우리 반 성취 현황</h2>
              <div class="achievement-content">
                <div class="best-unit-info">
                  <div class="unit-details">
                    <h3>🏆 가장 잘하는 단원</h3>
                    <p class="unit-name">{{ bestUnit.name }}</p>
                  </div>
                  <div class="accuracy-display">
                    <div class="accuracy-number">{{ bestUnit.accuracy }}%</div>
                    <div class="accuracy-label">정답률</div>
                  </div>
                </div>
                <div class="action-buttons">
                  <button class="btn btn-feedback" @click="provideFeedback">
                    💬 단원 피드백하기
                  </button>
                </div>
              </div>
            </section>
          </main>

          <!-- 사이드바 -->
          <aside class="sidebar">
            <!-- 내 할 일 -->
            <section class="card todo-card">
              <h3 class="card-title">✅ 오늘의 할 일</h3>
              <div class="todo-filter">
                <button
                  class="filter-btn"
                  :class="{ active: todoFilter === 'assignment' }"
                  @click="setTodoFilter('assignment')"
                >
                  📝 과제
                </button>
                <button
                  class="filter-btn"
                  :class="{ active: todoFilter === 'evaluation' }"
                  @click="setTodoFilter('evaluation')"
                >
                  🏆 평가
                </button>
              </div>
              <ul class="todo-list">
                <li
                  v-for="todo in filteredTodos"
                  :key="todo.id"
                  class="todo-item"
                >
                  <div class="todo-info">
                    <div class="todo-title">{{ todo.title }}</div>
                    <div class="todo-meta">{{ todo.type }}</div>
                  </div>
                  <span class="todo-count"
                    >{{ todo.completed }}/{{ todo.total }}</span
                  >
                </li>
              </ul>
            </section>

            <!-- 실시간 모니터링 -->
            <section class="card monitoring-card">
              <h3 class="card-title">👀 실시간 모니터링</h3>
              <div class="monitoring-stats">
                <div class="monitor-stat">
                  <div class="monitor-number total">{{ monitoring.total }}</div>
                  <div class="monitor-label">전체</div>
                </div>
                <div class="monitor-stat">
                  <div class="monitor-number online">
                    {{ monitoring.online }}
                  </div>
                  <div class="monitor-label">접속</div>
                </div>
                <div class="monitor-stat">
                  <div class="monitor-number offline">
                    {{ monitoring.offline }}
                  </div>
                  <div class="monitor-label">미접속</div>
                </div>
              </div>
              <div class="last-update">
                🕐 마지막 업데이트: {{ lastUpdate }}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
    <!-- footer -->
    <footer class="footer">
      <Footer></Footer>
    </footer>
    <!-- 플로팅 챗봇 버튼 -->
    <button class="floating-bot" title="학습 챗봇" @click="openChatbot">
      🤖
    </button>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import Header from "@/components/common/Header.vue";
import Footer from "@/components/common/Footer.vue";

export default {
  name: "TeacherMain",
  components: { Header, Footer },
  setup() {
    // 반응형 데이터
    const teacherInfo = ref("수학 3-1 | 이은영 선생님");
    const notificationCount = ref(3);
    const chatCount = ref(1);
    const hasAnalysisData = ref(false);
    const todoFilter = ref("assignment");

    // 로그인한 사용자 정보 가져오기
    const userEmail = localStorage.getItem("userEmail") || "teacher@airoom.com";
    const userName = localStorage.getItem("userName") || "이은영 선생님";

    // 선택한 교과서 정보 가져오기
    const selectedTextbook = localStorage.getItem("selectedTextbook");
    if (selectedTextbook) {
      const textbook = JSON.parse(selectedTextbook);
      teacherInfo.value = `${textbook.title} | ${userName}`;
    } else {
      teacherInfo.value = `수학 3-1 | ${userName}`;
    }

    // 현재 수업 정보
    const currentLesson = reactive({
      title: "6. 분수와 소수",
      subtitle: "01. 단원 도입",
    });

    // 최고 성취 단원
    const bestUnit = reactive({
      name: "1. 길이와 시간",
      accuracy: 80,
    });

    // 할 일 목록
    const todos = ref([
      {
        id: 1,
        title: "test",
        type: "일반 과제",
        category: "assignment",
        completed: 1,
        total: 1,
      },
      {
        id: 2,
        title: "sdfgh",
        type: "모둠 과제",
        category: "assignment",
        completed: 2,
        total: 3,
      },
      {
        id: 3,
        title: "fdgbdf",
        type: "일반 과제",
        category: "assignment",
        completed: 2,
        total: 10,
      },
    ]);

    // 실시간 모니터링
    const monitoring = reactive({
      total: 10,
      online: 1,
      offline: 9,
    });

    const lastUpdate = ref("2025. 08. 11. 오후 01:39");

    // 계산된 속성
    const filteredTodos = computed(() => {
      return todos.value.filter((todo) => todo.category === todoFilter.value);
    });

    // 메서드들
    const startTextbookLesson = () => {
      alert("🚀 교과서 수업을 시작합니다!");
    };

    const startWorkbookLesson = () => {
      alert("📝 수학익힘 수업을 시작합니다!");
    };

    const viewLearningStatus = () => {
      alert("📈 학습 현황 페이지로 이동합니다.");
    };

    const provideFeedback = () => {
      alert("💬 단원 피드백 기능을 실행합니다.");
    };

    const setTodoFilter = (filter) => {
      todoFilter.value = filter;
    };

    const openChatbot = () => {
      alert("🤖 학습 챗봇이 곧 시작됩니다!");
    };

    // 실시간 모니터링 업데이트
    const updateMonitoring = () => {
      const now = new Date();
      lastUpdate.value = now
        .toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\./g, ". ");
    };

    // 주기적 업데이트
    let monitoringInterval;

    // 라이프사이클 훅
    onMounted(() => {
      // 5분마다 모니터링 데이터 업데이트
      monitoringInterval = setInterval(updateMonitoring, 5 * 60 * 1000);
    });

    onUnmounted(() => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    });

    return {
      // 데이터
      teacherInfo,
      notificationCount,
      chatCount,
      hasAnalysisData,
      todoFilter,
      currentLesson,
      bestUnit,
      todos,
      monitoring,
      lastUpdate,

      // 계산된 속성
      filteredTodos,

      // 메서드
      startTextbookLesson,
      startWorkbookLesson,
      viewLearningStatus,
      provideFeedback,
      setTodoFilter,
      openChatbot,
    };
  },
};
</script>

<style scoped>
/* 전역 폰트 및 배경 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}

.teacher-page {
  background: #fff9e6;
  min-height: 100vh;
}

.teacher-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 페이지 헤더 */
.page-header {
  background: linear-gradient(
    135deg,
    rgba(255, 148, 41, 0.8),
    rgba(255, 193, 7, 0.6)
  );
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 152, 0, 0.3);
}

.page-header::before {
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
  animation: sparkle 4s ease-in-out infinite;
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

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

.page-subtitle {
  font-size: 1.1rem;
  color: white;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
}

.teacher-info {
  position: relative;
  z-index: 2;
}

.subject-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #f57c00;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1rem;
}

/* 안내 상자 */
.notice-box {
  background: #fffbf0;
  border: 2px dashed #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  gap: 1rem;
  color: #f57c00;
}

.notice-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notice-content p {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.notice-content p:last-child {
  margin-bottom: 0;
}

/* 메인 컨테이너 */
.main-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
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
  margin-bottom: 2rem;
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

/* 최근 수업 카드 */
.recent-lesson {
  position: relative;
  z-index: 2;
}

.lesson-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #ffe082;
  flex-wrap: wrap;
  gap: 1rem;
}

.lesson-info h3 {
  color: #f57f17;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.lesson-info p {
  color: #ff8f00;
  font-size: 1rem;
  font-weight: 600;
}

.lesson-buttons {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

/* 버튼 스타일 */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #ffdd29;
  color: white;
}

.btn-primary:hover {
  background: #ffc107;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
}

.btn-secondary {
  background: #fff5d6;
  color: #f57c00;
  border: 2px solid #ffe082;
  font-size: 0.9rem;
  padding: 0.6rem 1.2rem;
}

.btn-secondary:hover {
  background: #ffe082;
  transform: translateY(-2px);
}

.btn-feedback {
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  color: white;
  width: 100%;
}

.btn-feedback:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

/* 카드 헤더 with 버튼 */
.card-header-with-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
  gap: 1rem;
}

/* 분석 카드 */
.analysis-card {
  position: relative;
  z-index: 2;
}

.no-data {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  border-radius: 15px;
  border: 2px solid #ffe082;
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.no-data-text h3 {
  color: #f57f17;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  font-weight: 700;
}

.no-data-text p {
  color: #ff8f00;
  font-size: 1rem;
  font-weight: 600;
}

/* 성취 현황 카드 */
.achievement-card {
  position: relative;
  z-index: 2;
}

.achievement-content {
  background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
  padding: 2rem;
  border-radius: 15px;
  border: 2px solid #a5d6a7;
}

.best-unit-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.unit-details h3 {
  color: #2e7d32;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.unit-name {
  color: #4caf50;
  font-size: 1rem;
  font-weight: 600;
}

.accuracy-display {
  text-align: center;
}

.accuracy-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2e7d32;
  line-height: 1;
}

.accuracy-label {
  color: #4caf50;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.2rem;
}

/* 사이드바 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 할 일 카드 */
.todo-card {
  position: relative;
  z-index: 2;
}

.todo-filter {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: #fff5d6;
  padding: 0.3rem;
  border-radius: 15px;
  border: 2px solid #ffe082;
}

.filter-btn {
  flex: 1;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 12px;
  background: none;
  color: #f57c00;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-btn:hover:not(.active) {
  background: rgba(255, 221, 41, 0.3);
}

.filter-btn.active {
  background: #ffdd29;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.todo-list {
  list-style: none;
}

.todo-item {
  padding: 1rem;
  border-bottom: 2px solid #fff5d6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.todo-item:hover {
  background: #fff9c4;
  border-radius: 10px;
  transform: translateX(5px);
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-title {
  font-weight: 700;
  color: #f57f17;
  font-size: 1rem;
}

.todo-meta {
  font-size: 0.85rem;
  color: #ff8f00;
  font-weight: 600;
  margin-top: 0.2rem;
}

.todo-count {
  background: #ffdd29;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(255, 221, 41, 0.3);
}

/* 모니터링 카드 */
.monitoring-card {
  position: relative;
  z-index: 2;
}

.monitoring-stats {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0;
  background: linear-gradient(135deg, #e3f2fd, #f0f8ff);
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #90caf9;
}

.monitor-stat {
  text-align: center;
}

.monitor-number {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.3rem;
}

.monitor-number.total {
  color: #1976d2;
}

.monitor-number.online {
  color: #388e3c;
}

.monitor-number.offline {
  color: #f57c00;
}

.monitor-label {
  font-size: 0.9rem;
  color: #1976d2;
  font-weight: 600;
}

.last-update {
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
  background: #fff9c4;
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid #ffe082;
}

/* 플로팅 버튼 */
.floating-bot {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ffd54f, #ffc107);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  color: white;
  font-size: 1.8rem;
  transition: all 0.3s ease;
  z-index: 1000;
  border: 3px solid #ffe082;
}

.floating-bot:hover {
  transform: translateY(-3px) scale(1.1);
  box-shadow: 0 12px 35px rgba(255, 193, 7, 0.4);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .teacher-container {
    padding: 1rem;
  }

  .main-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .lesson-content {
    flex-direction: column;
    text-align: center;
  }

  .lesson-buttons {
    justify-content: center;
  }

  .best-unit-info {
    flex-direction: column;
    text-align: center;
  }

  .card-header-with-button {
    flex-direction: column;
    align-items: flex-start;
  }

  .monitoring-stats {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .card {
    padding: 1.5rem;
  }

  .lesson-buttons {
    flex-direction: column;
  }
}

/* 접근성 및 사용성 개선 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

button:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 호버 효과는 마우스가 있는 기기에서만 */
@media (hover: none) {
  .card:hover {
    transform: none;
    box-shadow: 0 8px 30px rgba(255, 193, 7, 0.15);
  }

  .btn:hover {
    transform: none;
  }

  .todo-item:hover {
    background: none;
    transform: none;
  }
}
</style>
