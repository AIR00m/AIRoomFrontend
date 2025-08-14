<template>
  <Header />
  <div class="assignment-list-page">
    <div class="list-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            {{ isTeacher ? "📝 과제 관리" : "📚 과제 목록" }}
          </h1>
          <p class="page-subtitle">
            {{
              isTeacher
                ? "우리 반 친구들의 과제를 관리해요!"
                : "선생님이 내주신 과제를 확인해요!"
            }}
          </p>
        </div>
        <router-link
          v-if="isTeacher"
          to="/assignment/create"
          class="btn btn-primary"
        >
          ✍️ 새 과제 출제하기
        </router-link>
      </div>

      <!-- 안내 상자 -->
      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <ul class="notice-list">
          <template v-if="isTeacher">
            <li>
              우리 반 수업/AI 맞춤 학습 과제는 각 해당 메뉴에서 출제 가능해요.
            </li>
            <li>
              과제 출제 후 등록한 학생은 최초 로그인 시 자동 출제돼요. (우리 반
              전체에 출제된 과제에 한함)
            </li>
          </template>
          <template v-else>
            <li>선생님이 출제한 과제를 확인하고 제출할 수 있어요.</li>
            <li>마감일을 잘 확인하고 시간 안에 과제를 완료해주세요! 💪</li>
          </template>
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

      <!-- 과제 콘텐츠 -->
      <div class="assignment-content">
        <!-- 진행 중인 과제 -->
        <div v-show="currentTab === 'ongoing'">
          <div v-if="ongoingAssignments.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3 class="empty-title">
              {{
                isTeacher
                  ? "출제된 과제가 없어요"
                  : "아직 진행 중인 과제가 없어요"
              }}
            </h3>
            <p class="empty-description">
              {{
                isTeacher
                  ? "새로운 과제를 출제해서 학습을 시작해보세요!"
                  : "새로운 과제가 생기면 바로 알려줄게요!"
              }}
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
                <div class="assignment-status ongoing">🏃 진행중</div>
                <div class="assignment-actions" v-if="isTeacher">
                  <button
                    class="action-btn"
                    @click.stop="editAssignment(assignment)"
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button
                    class="action-btn"
                    @click.stop="deleteAssignment(assignment)"
                    title="삭제"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div class="card-body">
                <h3 class="assignment-title">{{ assignment.title }}</h3>
                <p class="assignment-subject">{{ assignment.subject }}</p>

                <div v-if="isTeacher" class="teacher-info">
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

                <div v-else class="student-info">
                  <span
                    class="status-value"
                    :class="assignment.studentStatus || 'not-started'"
                  >
                    {{ getStudentStatusText(assignment.studentStatus) }}
                  </span>
                  <span
                    v-if="assignment.studentScore"
                    class="status-value score"
                  >
                    {{ assignment.studentScore }}점
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <i class="bi bi-calendar-event"></i>
                <span>{{ formatDate(assignment.dueDate) }} 마감</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 종료된 과제 -->
        <div v-show="currentTab === 'completed'">
          <div v-if="completedAssignments.length === 0" class="empty-state">
            <div class="empty-icon">✅</div>
            <h3 class="empty-title">종료된 과제가 아직 없어요</h3>
            <p class="empty-description">
              과제를 완료하면 이곳에서 확인할 수 있어요.
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
                <div class="assignment-status completed">✅ 완료</div>
                <div class="assignment-actions" v-if="isTeacher">
                  <button
                    class="action-btn"
                    @click.stop="viewResults(assignment)"
                    title="결과 보기"
                  >
                    📊
                  </button>
                  <button
                    class="action-btn"
                    @click.stop="downloadResults(assignment)"
                    title="다운로드"
                  >
                    💾
                  </button>
                </div>
              </div>
              <div class="card-body">
                <h3 class="assignment-title">{{ assignment.title }}</h3>
                <p class="assignment-subject">{{ assignment.subject }}</p>

                <div v-if="isTeacher" class="teacher-info horizontal">
                  <div class="info-item">
                    <span>완료율</span
                    ><strong>{{ assignment.completionRate }}%</strong>
                  </div>
                  <div class="info-item">
                    <span>평균점수</span
                    ><strong>{{ assignment.averageScore }}점</strong>
                  </div>
                </div>

                <!-- [수정됨] 학생에게 점수만 표시하도록 간소화 -->
                <div v-else class="student-info">
                  <span class="status-value score">
                    💯 내 점수: {{ assignment.studentScore || "미제출"
                    }}{{ assignment.studentScore ? "점" : "" }}
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <i class="bi bi-calendar-check"></i>
                <span>{{ formatDate(assignment.completedDate) }} 종료</span>
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

const isTeacher = computed(() => {
  return localStorage.getItem("userType") === "teacher";
});

const currentTab = ref("ongoing");

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
    studentSubmitDate: null,
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
    studentSubmitDate: null,
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
    studentSubmitDate: "2025-07-28",
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

const getTabCount = (tabKey) =>
  tabKey === "ongoing"
    ? ongoingAssignments.value.length
    : completedAssignments.value.length;

const getStudentStatusText = (status) =>
  ({
    "not-started": "아직 안 했어요",
    "in-progress": "열심히 하는 중!",
    completed: "다 했어요!",
  }[status] || "미시작");

const switchTab = (tabKey) => {
  currentTab.value = tabKey;
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });

const viewAssignmentDetail = (assignment) => {
  if (isTeacher.value) {
    // 교사: 진행 중인 과제는 평가 페이지로, 종료된 과제는 결과 페이지로 이동
    // 실제 라우터 이름(e.g., 'AssignmentResult', 'AssignmentEvaluation')은 프로젝트에 맞게 확인해야 합니다.
    const routeName =
      assignment.status === "completed"
        ? "AssignmentResult"
        : "AssignmentEvaluation";
    router.push({
      name: routeName,
      params: { id: assignment.id },
    });
    return;
  }

  // 학생: 종료된 과제는 클릭 시 반응 없음(결과만 보여줌), 진행 중인 과제만 제출 페이지로 이동
  if (assignment.status === "completed") {
    alert("이미 종료된 과제입니다. 내 점수를 확인하세요!");
    return;
  }
  router.push({ name: "AssignmentSubmission", params: { id: assignment.id } });
};

// 교사용 더미 메소드
const editAssignment = (a) => {
  if (a.status === "completed") {
    alert("종료된 과제는 수정할 수 없습니다.");
    return;
  }
  alert(`'${a.title}' 과제를 수정합니다.`);
};

const deleteAssignment = (a) => {
  if (a.status === "completed") {
    alert("종료된 과제는 삭제할 수 없습니다.");
    return;
  }
  if (confirm(`'${a.title}' 과제를 정말 삭제할까요?`)) {
    assignments.value = assignments.value.filter((item) => item.id !== a.id);
    alert("과제가 삭제되었습니다.");
  }
};

const viewResults = (a) => alert(`'${a.title}' 과제 결과를 봅니다.`);
const downloadResults = (a) =>
  alert(`'${a.title}' 과제 결과를 다운로드합니다.`);
</script>

<style scoped>
/* 전역 폰트 및 배경 설정 */
.assignment-list-page {
  /* [수정됨] font-family 속성을 한 줄로 작성하여 파싱 오류 방지 */
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}
.list-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 페이지 헤더 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 3px solid #fff5d6;
}
.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ff9800;
  margin: 0;
}
.page-subtitle {
  font-size: 1.1rem;
  color: #ffb74d;
  margin-top: 0.5rem;
}

/* 새 과제 출제 버튼 */
.btn.btn-primary {
  background: #ffdd29;
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.3);
  transition: all 0.3s ease;
}
.btn.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(255, 221, 41, 0.4);
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

/* 비어있을 때 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fffbf0;
  border-radius: 20px;
  border: 3px dashed #ffe066;
}
.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
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

/* 과제 카드 그리드 */
.assignment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* 과제 카드 */
.assignment-card {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}
.assignment-card:hover {
  border-color: #ffdd29;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.2);
}
.card-header {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #fff5d6;
}
.card-body {
  padding: 1.25rem;
  flex-grow: 1;
}
.card-footer {
  padding: 0.75rem 1.25rem;
  background: #fff9e6;
  color: #ffb74d;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 카드 내부 요소 */
.assignment-status {
  display: inline-flex;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: 700;
  color: white;
}
.assignment-status.ongoing {
  background: #f39c12;
}
.assignment-status.completed {
  background: #27ae60;
}
.assignment-actions {
  display: flex;
  gap: 0.5rem;
}
.action-btn {
  background: #fff5d6;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #ff9800;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}
.action-btn:hover {
  background: #ffdd29;
  color: white;
  transform: scale(1.1);
}
.assignment-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #8c6d32;
  margin: 0 0 0.5rem;
}
.assignment-subject {
  color: #ffb74d;
  margin: 0 0 1rem;
  font-weight: 600;
}

/* 교사/학생 정보 */
.teacher-info .progress-bar {
  width: 100%;
  height: 8px;
  background: #fff5d6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}
.teacher-info .progress-fill {
  height: 100%;
  background: #ffdd29;
  border-radius: 4px;
}
.teacher-info .progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffb74d;
}
.teacher-info.horizontal {
  display: flex;
  gap: 1rem;
  background: #fff9e6;
  border-radius: 15px;
  padding: 1rem;
}
.teacher-info.horizontal .info-item {
  flex: 1;
  text-align: center;
}
.teacher-info.horizontal .info-item span {
  display: block;
  font-size: 0.85rem;
  color: #ffb74d;
  margin-bottom: 0.25rem;
}
.teacher-info.horizontal .info-item strong {
  font-size: 1.2rem;
  color: #ff9800;
}

.student-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}
.student-info .status-value {
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.9rem;
}
.student-info .status-value.not-started {
  background: #f0f0f0;
  color: #888;
}
.student-info .status-value.in-progress {
  background: #d9f2ff;
  color: #0077b6;
}
.student-info .status-value.completed {
  background: #d4edda;
  color: #155724;
}
.student-info .status-value.score {
  background: #fff5d6;
  color: #f57c00;
}
.student-info .status-value.submit-date {
  background: #f3e5f5;
  color: #6a1b9a;
}
</style>
