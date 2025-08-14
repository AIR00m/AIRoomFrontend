<template>
  <Header />
  <div class="assignment-page">
    <div class="assignment-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="page-text">
          <h1 class="page-title">
            {{ isTeacher ? "📝 과제 관리" : "📚 과제 목록" }}
          </h1>
          <p class="page-subtitle">{{ pageSubtitle }}</p>
          <nav class="cute-breadcrumb">
            <span>🏠 홈</span>
            <span class="separator">></span>
            <span class="current">{{
              isTeacher ? "📝 과제 관리" : "📚 과제 목록"
            }}</span>
          </nav>
        </div>
        <router-link
          v-if="isTeacher"
          to="/assignment/create"
          class="action-btn btn-primary"
        >
          ✏️ 새 과제 출제하기
        </router-link>
      </div>

      <!-- 안내 상자 -->
      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <ul class="notice-list">
          <li v-for="notice in noticeMessages" :key="notice">
            {{ notice }}
          </li>
        </ul>
      </div>

      <!-- 과제 탭 -->
      <div class="assignment-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-button"
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
          <span class="tab-count">{{ getTabCount(tab.key) }}</span>
        </button>
      </div>

      <!-- 과제 컨텐츠 -->
      <div class="assignment-content">
        <!-- 진행 중인 과제 -->
        <div v-show="currentTab === 'ongoing'" class="tab-panel">
          <div v-if="ongoingAssignments.length === 0" class="empty-state">
            <div class="empty-icon">🔭</div>
            <h3 class="empty-title">{{ emptyState.ongoing.title }}</h3>
            <p class="empty-description">
              {{ emptyState.ongoing.description }}
            </p>
          </div>
          <div v-else class="assignment-grid">
            <div
              v-for="assignment in ongoingAssignments"
              :key="assignment.id"
              class="assignment-card ongoing"
              @click="viewAssignmentDetail(assignment)"
            >
              <div class="card-header">
                <div class="assignment-badges">
                  <span class="assignment-status ongoing">🏃 진행중</span>
                  <div class="assignment-actions" v-if="isTeacher">
                    <button
                      class="action-btn edit"
                      @click.stop="editAssignment(assignment)"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      class="action-btn delete"
                      @click.stop="deleteAssignment(assignment)"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <h3 class="assignment-title">{{ assignment.title }}</h3>
                <p class="assignment-subject">📚 {{ assignment.subject }}</p>

                <!-- 교사용 정보 -->
                <div v-if="isTeacher" class="teacher-info">
                  <div class="progress-section">
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :style="{ width: assignment.progress + '%' }"
                      ></div>
                    </div>
                    <div class="progress-text">
                      <span>진행률 {{ assignment.progress }}%</span>
                      <span>🧑‍🎓 {{ assignment.participants }}명 참여</span>
                    </div>
                  </div>
                </div>

                <!-- 학생용 정보 -->
                <div v-else class="student-info">
                  <div class="info-item">
                    <i class="bi bi-person-check"></i>
                    <span>{{
                      getStudentStatusText(assignment.studentStatus)
                    }}</span>
                  </div>
                  <div v-if="assignment.studentScore" class="info-item">
                    <i class="bi bi-award"></i>
                    <span>{{ assignment.studentScore }}점</span>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button
                  v-if="assignment.status === 'ongoing'"
                  class="action-btn btn-start"
                  @click.stop="viewAssignmentDetail(assignment)"
                >
                  🚀 {{ isTeacher ? "관리하기" : "시작하기" }}
                </button>
                <div class="due-date">
                  <i class="bi bi-calendar-event"></i>
                  <span>{{ formatDate(assignment.dueDate) }} 마감</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 종료된 과제 -->
        <div v-show="currentTab === 'completed'" class="tab-panel">
          <div v-if="completedAssignments.length === 0" class="empty-state">
            <div class="empty-icon">✅</div>
            <h3 class="empty-title">{{ emptyState.completed.title }}</h3>
            <p class="empty-description">
              {{ emptyState.completed.description }}
            </p>
          </div>
          <div v-else class="assignment-grid">
            <div
              v-for="assignment in completedAssignments"
              :key="assignment.id"
              class="assignment-card completed"
              @click="viewAssignmentDetail(assignment)"
            >
              <div class="card-header">
                <div class="assignment-badges">
                  <span class="assignment-status completed">✅ 완료</span>
                  <div class="assignment-actions" v-if="isTeacher">
                    <button
                      class="action-btn results"
                      @click.stop="viewResults(assignment)"
                      title="결과 보기"
                    >
                      📊
                    </button>
                    <button
                      class="action-btn download"
                      @click.stop="downloadResults(assignment)"
                      title="다운로드"
                    >
                      💾
                    </button>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <h3 class="assignment-title">{{ assignment.title }}</h3>
                <p class="assignment-subject">📚 {{ assignment.subject }}</p>

                <!-- 교사용 완료 정보 -->
                <div v-if="isTeacher" class="teacher-info completed">
                  <div class="stats-grid">
                    <div class="stat-item">
                      <span class="stat-label">완료율</span>
                      <strong class="stat-value"
                        >{{ assignment.completionRate }}%</strong
                      >
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">평균점수</span>
                      <strong class="stat-value"
                        >{{ assignment.averageScore }}점</strong
                      >
                    </div>
                  </div>
                </div>

                <!-- 학생용 완료 정보 -->
                <div v-else class="student-info">
                  <div class="info-item score">
                    <i class="bi bi-trophy"></i>
                    <span
                      >내 점수:
                      {{ getStudentScoreText(assignment.studentScore) }}</span
                    >
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button
                  class="action-btn btn-report"
                  @click.stop="viewAssignmentDetail(assignment)"
                >
                  📋 {{ isTeacher ? "결과 보기" : "점수 확인" }}
                </button>
                <div class="due-date">
                  <i class="bi bi-calendar-check"></i>
                  <span>{{ formatDate(assignment.completedDate) }} 종료</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";

const router = useRouter();
const currentTab = ref("ongoing");

// 계산된 속성들
const isTeacher = computed(
  () => localStorage.getItem("userType") === "teacher"
);

const pageSubtitle = computed(() =>
  isTeacher.value
    ? "우리 반 친구들의 과제를 관리해요!"
    : "선생님이 내주신 과제를 확인해요!"
);

const noticeMessages = computed(() =>
  isTeacher.value
    ? [
        "우리 반 수업/AI 맞춤 학습 과제는 각 해당 메뉴에서 출제 가능해요.",
        "과제 출제 후 등록한 학생은 최초 로그인 시 자동 출제돼요. (우리 반 전체에 출제된 과제에 한함)",
      ]
    : [
        "선생님이 출제한 과제를 확인하고 제출할 수 있어요.",
        "마감일을 잘 확인하고 시간 안에 과제를 완료해주세요! 💪",
      ]
);

const emptyState = computed(() => ({
  ongoing: {
    title: isTeacher.value
      ? "출제된 과제가 없어요"
      : "아직 진행 중인 과제가 없어요",
    description: isTeacher.value
      ? "새로운 과제를 출제해서 학습을 시작해보세요!"
      : "새로운 과제가 생기면 바로 알려줄게요!",
  },
  completed: {
    title: "종료된 과제가 아직 없어요",
    description: "과제를 완료하면 이곳에서 확인할 수 있어요.",
  },
}));

// 탭 및 데이터
const tabs = ref([
  { key: "ongoing", label: "진행 중인 과제" },
  { key: "completed", label: "종료된 과제" },
]);

const assignments = ref([
  {
    id: 1,
    title: "'What's This?' 단원 마무리",
    subject: "2. What's This?",
    status: "ongoing",
    progress: 65,
    participants: 24,
    dueDate: "2025-08-30",
    studentStatus: "in-progress",
    studentScore: null,
    completionRate: 92,
    averageScore: 88,
    completedDate: "2025-08-10",
  },
  {
    id: 2,
    title: "알파벳 친구들과 노래하기",
    subject: "1. Hello, ABC!",
    status: "ongoing",
    progress: 95,
    participants: 28,
    dueDate: "2025-09-05",
    studentStatus: "not-started",
    studentScore: null,
    completionRate: 92,
    averageScore: 88,
    completedDate: "2025-08-10",
  },
  {
    id: 3,
    title: "AI 친구와 대화하기",
    subject: "3. Sit Down, Please",
    status: "completed",
    progress: 100,
    participants: 30,
    dueDate: "2025-08-01",
    studentStatus: "completed",
    studentScore: 95,
    completionRate: 100,
    averageScore: 92,
    completedDate: "2025-08-01",
  },
]);

const ongoingAssignments = computed(() =>
  assignments.value.filter((a) => a.status === "ongoing")
);

const completedAssignments = computed(() =>
  assignments.value.filter((a) => a.status === "completed")
);

// 유틸리티 함수들
const getTabCount = (tabKey) =>
  tabKey === "ongoing"
    ? ongoingAssignments.value.length
    : completedAssignments.value.length;

const getStudentStatusText = (status) => {
  const statusMap = {
    "not-started": "아직 안 했어요",
    "in-progress": "열심히 하는 중!",
    completed: "다 했어요!",
  };
  return statusMap[status] || "미시작";
};

const getStudentScoreText = (score) => (score ? `${score}점` : "미제출");

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });

// 액션 메서드들
const switchTab = (tabKey) => {
  currentTab.value = tabKey;
};

const viewAssignmentDetail = (assignment) => {
  if (isTeacher.value) {
    const routeName =
      assignment.status === "completed"
        ? "AssignmentResult"
        : "AssignmentEvaluation";
    router.push({ name: routeName, params: { id: assignment.id } });
    return;
  }

  if (assignment.status === "completed") {
    alert("이미 종료된 과제입니다. 내 점수를 확인하세요!");
    return;
  }

  router.push({ name: "AssignmentSubmission", params: { id: assignment.id } });
};

const editAssignment = (assignment) => {
  if (assignment.status === "completed") {
    alert("종료된 과제는 수정할 수 없습니다.");
    return;
  }
  alert(`'${assignment.title}' 과제를 수정합니다.`);
};

const deleteAssignment = (assignment) => {
  if (assignment.status === "completed") {
    alert("종료된 과제는 삭제할 수 없습니다.");
    return;
  }

  if (confirm(`'${assignment.title}' 과제를 정말 삭제할까요?`)) {
    assignments.value = assignments.value.filter(
      (item) => item.id !== assignment.id
    );
    alert("과제가 삭제되었습니다.");
  }
};

const viewResults = (assignment) => {
  alert(`'${assignment.title}' 과제 결과를 봅니다.`);
};

const downloadResults = (assignment) => {
  alert(`'${assignment.title}' 과제 결과를 다운로드합니다.`);
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

.assignment-page {
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.assignment-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 페이지 헤더 */
.page-header {
  background: linear-gradient(
    135deg,
    rgba(255, 152, 0, 0.15),
    rgba(255, 193, 7, 0.25)
  );
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 152, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #e65100;
  margin: 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #f57c00;
  margin-top: 0.5rem;
}

.cute-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #ff9800;
  margin-top: 0.5rem;
}

.separator {
  margin: 0 0.25rem;
}

.current {
  font-weight: 700;
  color: #e65100;
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
  font-weight: 600;
}

.notice-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notice-list {
  list-style: "• ";
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 과제 탭 */
.assignment-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  margin-bottom: 2.5rem;
  background: #fff5d6;
  border-radius: 20px;
  border: 2px solid #ffe066;
}

.tab-button {
  flex: 1;
  padding: 12px 20px;
  border: 0;
  border-radius: 15px;
  background: none;
  color: #ff9800;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.tab-button:hover:not(.active) {
  background: rgba(255, 221, 41, 0.3);
}

.tab-button.active {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  transform: translateY(-2px);
}

.tab-count {
  margin-left: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 0.8em;
}

.tab-button.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* 과제 그리드 */
.assignment-grid {
  display: grid;
  background: #fffbf0;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 과제 카드 */
.assignment-card {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;
  cursor: pointer;
}

.assignment-card:hover {
  border-color: #ffdd29;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.2);
}

.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #fff5d6;
}

.assignment-badges {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.assignment-status {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.assignment-status.ongoing {
  background: #fff3e0;
  color: #f57c00;
}

.assignment-status.completed {
  background: #e8f5e8;
  color: #388e3c;
}

.assignment-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-size: 0.85rem;
}

.action-btn.edit,
.action-btn.delete,
.action-btn.results,
.action-btn.download {
  padding: 0.5rem;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #fff5d6;
  color: #ff9800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit:hover {
  background: #2196f3;
  color: white;
}

.action-btn.delete:hover {
  background: #f44336;
  color: white;
}

.action-btn.results:hover {
  background: #4caf50;
  color: white;
}

.action-btn.download:hover {
  background: #9c27b0;
  color: white;
}

.btn-primary {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.btn-start {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.btn-report {
  background: #a855f7;
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.btn-report:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

.card-body {
  padding: 1.25rem;
  flex-grow: 1;
}

.assignment-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #8c6d32;
  margin: 0 0 0.75rem;
  line-height: 1.4;
}

.assignment-subject {
  color: #ffb74d;
  margin: 0 0 1rem;
  font-weight: 600;
}

/* 교사 정보 */
.teacher-info .progress-section .progress-bar {
  width: 100%;
  height: 8px;
  background: #fff5d6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.teacher-info .progress-section .progress-fill {
  height: 100%;
  background: #ffdd29;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.teacher-info .progress-section .progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
}

.teacher-info.completed .stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background: #fffbf0;
  border-radius: 15px;
  padding: 1rem;
  border: 2px solid #fff5d6;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #ffb74d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.2rem;
  color: #ff9800;
  font-weight: 700;
}

/* 학생 정보 */
.student-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.info-item.score {
  color: #f57c00;
  font-weight: 700;
}

.card-footer {
  padding: 0.75rem 1.25rem;
  background: #fff9e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffb74d;
  font-weight: 600;
  font-size: 0.9rem;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fffbf0;
  border-radius: 20px;
  border: 3px solid #ffb74d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s ease-in-out infinite;
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

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: #ffb74d;
  margin: 0;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .assignment-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .assignment-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .assignment-tabs {
    flex-direction: column;
  }

  .tab-button {
    padding: 15px;
    font-size: 0.9rem;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .assignment-card {
    margin: 0;
  }

  .card-body {
    padding: 1rem;
  }

  .assignment-badges {
    flex-direction: column;
    align-items: stretch;
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

button:focus,
select:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 호버 효과는 마우스가 있는 기기에서만 */
@media (hover: none) {
  .assignment-card:hover {
    transform: none;
    box-shadow: none;
  }

  .action-btn:hover {
    transform: none;
  }
}
</style>
