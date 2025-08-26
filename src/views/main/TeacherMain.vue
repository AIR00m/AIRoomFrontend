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
    const teacherInfo = ref("수학 3-1 | 이은영 선생님");
    const hasAnalysisData = ref(false);
    const todoFilter = ref("assignment");

    const selectedTextbook = localStorage.getItem("selectedTextbook");
    const userName = localStorage.getItem("userName") || "이은영 선생님";
    teacherInfo.value = selectedTextbook
      ? `${JSON.parse(selectedTextbook).title} | ${userName}`
      : `수학 3-1 | ${userName}`;

    const currentLesson = reactive({ title: "6. 분수와 소수", subtitle: "01. 단원 도입" });
    const bestUnit = reactive({ name: "1. 길이와 시간", accuracy: 80 });

    const todos = ref([
      { id: 1, title: "test", type: "일반 과제", category: "assignment", completed: 1, total: 1 },
      { id: 2, title: "sdfgh", type: "모둠 과제", category: "assignment", completed: 2, total: 3 },
      { id: 3, title: "fdgbdf", type: "일반 과제", category: "assignment", completed: 2, total: 10 },
    ]);

    const monitoring = reactive({ total: 10, online: 1, offline: 9 });
    const lastUpdate = ref("2025. 08. 11. 오후 01:39");

    const filteredTodos = computed(() => todos.value.filter((t) => t.category === todoFilter.value));

    const startTextbookLesson = () => alert("🚀 교과서 수업을 시작합니다!");
    const startWorkbookLesson = () => alert("📝 수학익힘 수업을 시작합니다!");
    const viewLearningStatus = () => alert("📈 학습 현황 페이지로 이동합니다.");
    const provideFeedback = () => alert("💬 단원 피드백 기능을 실행합니다.");
    const setTodoFilter = (f) => (todoFilter.value = f);

    const updateMonitoring = () => {
      const now = new Date();
      lastUpdate.value = now
        .toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
        .replace(/\./g, ". ");
    };

    let monitoringInterval;
    onMounted(() => { monitoringInterval = setInterval(updateMonitoring, 5 * 60 * 1000); });
    onUnmounted(() => { if (monitoringInterval) clearInterval(monitoringInterval); });

    return {
      teacherInfo, hasAnalysisData, todoFilter, currentLesson, bestUnit,
      todos, monitoring, lastUpdate, filteredTodos,
      startTextbookLesson, startWorkbookLesson, viewLearningStatus, provideFeedback, setTodoFilter,
    };
  },
};
</script>

<style scoped>
/* (원래 스타일 그대로, 단 .floating-bot 관련 블록은 삭제됨) */
* { margin: 0; padding: 0; box-sizing: border-box; font-family: "Comic Sans MS","Segoe UI",Tahoma,Geneva,Verdana,sans-serif !important; }
.teacher-page { background: #fff9e6; min-height: 100vh; }
.teacher-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
/* ... 중략: 기존 스타일 동일 ... (질문에 준 CSS 그대로 유지) */
/* 파일 내 .floating-bot 관련 스타일은 제거됨 */
</style>
