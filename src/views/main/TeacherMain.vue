<template>
  <div>
    <!-- 헤더 -->
    <header class="header">
      <Header></Header>
    </header>
    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 메인 콘텐츠 -->
      <main>
        <!-- 최근 수업 -->
        <section class="card recent-lesson">
          <div class="lesson-content">
            <div class="lesson-info">
              <h3>{{ currentLesson.title }}</h3>
              <p>{{ currentLesson.subtitle }}</p>
            </div>
            <div class="lesson-buttons">
              <button class="btn btn-primary" @click="startTextbookLesson">
                교과서 수업하기
              </button>
              <button class="btn btn-primary" @click="startWorkbookLesson">
                수학익힘
              </button>
            </div>
          </div>
        </section>

        <!-- 지난 수업 분석 -->
        <section class="card analysis-card">
          <h2 class="card-title">
            📊 지난 수업 분석 및 추천
            <button
              class="btn btn-secondary"
              style="margin-left: auto; font-size: 0.8rem"
              @click="viewLearningStatus"
            >
              학습 현황 보기
            </button>
          </h2>
          <div v-if="!hasAnalysisData" class="no-data">
            <div class="no-data-icon">📋</div>
            <p>평가가 없는 수업입니다.</p>
          </div>
          <div v-else>
            <!-- 분석 데이터가 있을 때의 내용 -->
          </div>
        </section>

        <!-- 단원 성취 현황 -->
        <section class="card">
          <h2 class="card-title">📈 단원 성취 현황</h2>
          <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px">
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <div>
                <h3 style="color: #1e40af; margin-bottom: 0.5rem">
                  가장 잘하는 단원
                </h3>
                <p style="color: #64748b">{{ bestUnit.name }}</p>
              </div>
              <div style="text-align: center">
                <div style="font-size: 2rem; font-weight: bold; color: #10b981">
                  {{ bestUnit.accuracy }}%
                </div>
                <div style="font-size: 0.9rem; color: #64748b">정답률</div>
              </div>
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem">
              <button
                class="btn btn-primary"
                style="font-size: 0.8rem"
                @click="provideFeedback"
              >
                단원 피드백하기
              </button>
            </div>
          </div>
        </section>
      </main>

      <!-- 사이드바 -->
      <aside class="sidebar">
        <!-- 내 할 일 -->
        <section class="card">
          <h3 class="card-title">✅ 내 할 일</h3>
          <div style="margin-bottom: 1rem">
            <button
              class="btn"
              :class="
                todoFilter === 'assignment' ? 'btn-primary' : 'btn-secondary'
              "
              style="margin-right: 0.5rem; font-size: 0.9rem"
              @click="setTodoFilter('assignment')"
            >
              과제
            </button>
            <button
              class="btn"
              :class="
                todoFilter === 'evaluation' ? 'btn-primary' : 'btn-secondary'
              "
              style="font-size: 0.9rem"
              @click="setTodoFilter('evaluation')"
            >
              평가
            </button>
          </div>
          <ul class="todo-list">
            <li v-for="todo in filteredTodos" :key="todo.id" class="todo-item">
              <div>
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
        <section class="card">
          <h3 class="card-title">👀 실시간 모니터링</h3>
          <div class="monitoring-stats">
            <div class="monitor-stat">
              <div class="monitor-number">{{ monitoring.total }}</div>
              <div class="monitor-label">전체</div>
            </div>
            <div class="monitor-stat">
              <div class="monitor-number status-online">
                {{ monitoring.online }}
              </div>
              <div class="monitor-label">접속</div>
            </div>
            <div class="monitor-stat">
              <div class="monitor-number status-offline">
                {{ monitoring.offline }}
              </div>
              <div class="monitor-label">미접속</div>
            </div>
          </div>
          <div
            style="
              margin-top: 1rem;
              font-size: 0.8rem;
              color: #64748b;
              text-align: center;
            "
          >
            마지막 업데이트: {{ lastUpdate }}
          </div>
        </section>
      </aside>
    </div>

    <!-- 플로팅 챗봇 버튼 -->
    <button class="floating-bot" title="학습 챗봇" @click="openChatbot">
      🤖
    </button>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import Header from "@/components/common/Header.vue";

export default {
  name: "TeacherMain",
  components: { Header },
  setup() {
    // 반응형 데이터
    const teacherInfo = ref("수학 3-1 | 이영현 선생님");
    const notificationCount = ref(3);
    const chatCount = ref(1);
    const hasAnalysisData = ref(false);
    const todoFilter = ref("assignment");

    // 로그인한 사용자 정보 가져오기
    const userEmail = localStorage.getItem("userEmail") || "teacher@airoom.com";
    const userName = localStorage.getItem("userName") || "이영현 선생님";

    // 사용자 정보로 표시 업데이트
    teacherInfo.value = `수학 3-1 | ${userName}`;

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
      alert("교과서 수업을 시작합니다!");
    };

    const startWorkbookLesson = () => {
      alert("수학익힘 수업을 시작합니다!");
    };

    const viewLearningStatus = () => {
      alert("학습 현황 페이지로 이동합니다.");
    };

    const provideFeedback = () => {
      alert("단원 피드백 기능을 실행합니다.");
    };

    const setTodoFilter = (filter) => {
      todoFilter.value = filter;
    };

    const openChatbot = () => {
      alert("학습 챗봇이 곧 시작됩니다!");
    };

    // 카드 호버 효과 관리
    const setupCardHoverEffects = () => {
      const cards = document.querySelectorAll(".card");
      cards.forEach((card) => {
        card.addEventListener("mouseenter", function () {
          this.style.transform = "translateY(-2px)";
        });

        card.addEventListener("mouseleave", function () {
          this.style.transform = "translateY(0)";
        });
      });
    };

    // 실시간 모니터링 업데이트
    const updateMonitoring = () => {
      // 실제로는 서버에서 데이터를 가져옴
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
      setupCardHoverEffects();

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
  grid-template-columns: 2fr 1fr;
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

/* 최근 수업 카드 */
.recent-lesson {
  margin-bottom: 2rem;
}

.lesson-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f1f5f9;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
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

.lesson-info h3 {
  color: #1e40af;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.lesson-info p {
  color: #64748b;
  font-size: 0.9rem;
}

.lesson-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #034582;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover {
  background: #cbd5e1;
}

/* 지난 수업 분석 */
.analysis-card {
  margin-bottom: 2rem;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* AI 맞춤 학습 코칭 */
.coaching-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #1e40af;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

/* 사이드바 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 퀵 메뉴 */
.quick-menu {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.quick-item {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  color: #475569;
}

.quick-item:hover {
  border-color: #3b82f6;
  color: #1e40af;
  transform: translateY(-2px);
}

.quick-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

/* 할 일 목록 */
.todo-list {
  list-style: none;
}

.todo-item {
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-title {
  font-weight: 500;
  color: #1e40af;
}

.todo-meta {
  font-size: 0.8rem;
  color: #64748b;
}

.todo-count {
  background: #034582;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

/* 실시간 모니터링 */
.monitoring-stats {
  display: flex;
  justify-content: space-around;
  margin: 1rem 0;
}

.monitor-stat {
  text-align: center;
}

.monitor-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e40af;
}

.monitor-label {
  font-size: 0.9rem;
  color: #64748b;
}

.status-online {
  color: #10b981;
}

.status-offline {
  color: #ef4444;
}

/* 플로팅 버튼 */
.floating-bot {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  background: #3b82f6;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  color: white;
  font-size: 1.5rem;
  transition: all 0.3s;
}

.floating-bot:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 30px rgba(59, 130, 246, 0.4);
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

  .lesson-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .quick-menu {
    grid-template-columns: 1fr;
  }
}
</style>
