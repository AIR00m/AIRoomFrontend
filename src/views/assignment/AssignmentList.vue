<template>
  <Header />
  <div class="assignment-management">
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            {{ isTeacher ? "과제 관리" : "과제 목록" }}
          </h1>
          <p class="page-description">
            {{
              isTeacher
                ? "학생들에게 출제할 과제를 관리하고 진행 상황을 확인할 수 있습니다."
                : "선생님이 출제한 과제를 확인하고 참여할 수 있습니다."
            }}
          </p>
        </div>
        <router-link
          v-if="isTeacher"
          to="/assignment/create"
          class="create-assignment-btn"
        >
          <i class="bi bi-plus-circle-fill"></i>
          새 과제 출제
        </router-link>
      </div>
    </div>

    <div class="info-card">
      <div class="info-content">
        <div class="info-icon">
          <i class="bi bi-info-circle-fill"></i>
        </div>
        <div class="info-text">
          <ul class="info-list" v-if="isTeacher">
            <li>
              우리 반 수업/AI 맞춤 학습 과제는 각 해당 메뉴에서 출제 가능합니다.
            </li>
            <li>
              과제 출제 후 등록한 학생은 최초 로그인 시 자동 출제됩니다. (우리
              반 전체에 출제된 과제에 한함)
            </li>
          </ul>
          <ul class="info-list" v-else>
            <li>선생님이 출제한 과제를 확인하고 제출할 수 있습니다.</li>
            <li>마감일을 확인하고 시간 내에 과제를 완료해주세요.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="assignment-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-button"
        :class="{ active: currentTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <span class="tab-text">{{ tab.label }}</span>
        <span class="tab-count">{{ getTabCount(tab.key) }}</span>
      </button>
    </div>

    <div class="assignment-content">
      <div v-if="currentTab === 'ongoing'" class="assignment-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="bi bi-play-circle-fill text-primary"></i>
            진행 중
          </h2>
          <span class="section-count"
            >총 {{ ongoingAssignments.length }}개</span
          >
        </div>

        <div v-if="ongoingAssignments.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="bi bi-clipboard-x"></i>
          </div>
          <h3 class="empty-title">
            {{
              isTeacher
                ? "진행 중인 과제가 없습니다"
                : "진행 중인 과제가 없습니다"
            }}
          </h3>
          <p class="empty-description">
            {{
              isTeacher
                ? "새로운 과제를 출제해보세요!"
                : "선생님이 과제를 출제할 때까지 기다려주세요."
            }}
          </p>
          <router-link
            v-if="isTeacher"
            to="/assignment/create"
            class="empty-action-btn"
          >
            <i class="bi bi-plus-circle"></i>
            과제 출제하기
          </router-link>
        </div>

        <div v-else class="assignment-grid">
          <div
            v-for="assignment in ongoingAssignments"
            :key="assignment.id"
            class="assignment-card ongoing"
            @click="viewAssignmentDetail(assignment)"
          >
            <div class="card-header">
              <div class="assignment-status ongoing">
                <i class="bi bi-play-circle-fill"></i>
                진행중
              </div>
              <div class="assignment-actions">
                <template v-if="isTeacher">
                  <button
                    class="action-btn"
                    @click.stop="editAssignment(assignment)"
                    title="수정"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="action-btn"
                    @click.stop="deleteAssignment(assignment)"
                    title="삭제"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </template>
                <template v-else>
                  <button
                    class="action-btn student-action"
                    @click.stop="startAssignment(assignment)"
                    title="과제 시작"
                  >
                    <i class="bi bi-play-fill"></i>
                  </button>
                </template>
              </div>
            </div>

            <div class="card-content">
              <h3 class="assignment-title">{{ assignment.title }}</h3>
              <p class="assignment-subject">{{ assignment.subject }}</p>

              <div v-if="isTeacher" class="assignment-progress">
                <div class="progress-info">
                  <span class="progress-text">진행률</span>
                  <span class="progress-percentage"
                    >{{ assignment.progress }}%</span
                  >
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: assignment.progress + '%' }"
                  ></div>
                </div>
              </div>

              <div v-else class="student-assignment-status">
                <div class="status-item">
                  <span class="status-label">내 상태</span>
                  <span
                    class="status-value"
                    :class="assignment.studentStatus || 'not-started'"
                  >
                    {{ getStudentStatusText(assignment.studentStatus) }}
                  </span>
                </div>
                <div v-if="assignment.studentScore" class="status-item">
                  <span class="status-label">점수</span>
                  <span class="status-value score"
                    >{{ assignment.studentScore }}점</span
                  >
                </div>
              </div>

              <div class="assignment-meta">
                <div class="meta-item">
                  <i class="bi bi-people"></i>
                  <span
                    >{{ assignment.participants }}명
                    {{ isTeacher ? "참여" : "중" }}</span
                  >
                </div>
                <div class="meta-item">
                  <i class="bi bi-calendar-event"></i>
                  <span>{{ formatDate(assignment.dueDate) }} 마감</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'completed'" class="assignment-section">
        <div class="section-header">
          <h2 class="section-title">
            <i class="bi bi-check-circle-fill text-success"></i>
            종료된 과제
          </h2>
          <span class="section-count"
            >총 {{ completedAssignments.length }}개</span
          >
        </div>

        <div v-if="completedAssignments.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="bi bi-clipboard-check"></i>
          </div>
          <h3 class="empty-title">종료된 과제가 없습니다</h3>
          <p class="empty-description">
            {{
              isTeacher
                ? "아직 종료된 과제가 없어요. 과제를 출제해 보세요!"
                : "아직 완료한 과제가 없어요."
            }}
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
              <div class="assignment-status completed">
                <i class="bi bi-check-circle-fill"></i>
                완료
              </div>
              <div class="assignment-actions">
                <template v-if="isTeacher">
                  <button
                    class="action-btn"
                    @click.stop="viewResults(assignment)"
                    title="결과 보기"
                  >
                    <i class="bi bi-bar-chart"></i>
                  </button>
                  <button
                    class="action-btn"
                    @click.stop="downloadResults(assignment)"
                    title="다운로드"
                  >
                    <i class="bi bi-download"></i>
                  </button>
                </template>
                <template v-else>
                  <button
                    class="action-btn student-action"
                    @click.stop="viewMyResult(assignment)"
                    title="내 결과 보기"
                  >
                    <i class="bi bi-eye-fill"></i>
                  </button>
                </template>
              </div>
            </div>

            <div class="card-content">
              <h3 class="assignment-title">{{ assignment.title }}</h3>
              <p class="assignment-subject">{{ assignment.subject }}</p>

              <div v-if="isTeacher" class="assignment-results">
                <div class="result-item">
                  <span class="result-label">완료율</span>
                  <span class="result-value"
                    >{{ assignment.completionRate }}%</span
                  >
                </div>
                <div class="result-item">
                  <span class="result-label">평균 점수</span>
                  <span class="result-value"
                    >{{ assignment.averageScore }}점</span
                  >
                </div>
              </div>

              <div v-else class="student-results">
                <div class="result-item">
                  <span class="result-label">내 점수</span>
                  <span class="result-value score">
                    {{ assignment.studentScore || "미제출"
                    }}{{ assignment.studentScore ? "점" : "" }}
                  </span>
                </div>
                <div class="result-item">
                  <span class="result-label">제출일</span>
                  <span class="result-value">
                    {{
                      assignment.studentSubmitDate
                        ? formatDate(assignment.studentSubmitDate)
                        : "미제출"
                    }}
                  </span>
                </div>
              </div>

              <div class="assignment-meta">
                <div class="meta-item">
                  <i class="bi bi-people"></i>
                  <span
                    >{{ assignment.participants }}명
                    {{ isTeacher ? "참여" : "중" }}</span
                  >
                </div>
                <div class="meta-item">
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
import { ref, computed, onMounted } from "vue";
import Header from "@/components/common/Header.vue";

const isTeacher = computed(() => {
  return localStorage.getItem("userType") === "teacher";
});

const currentTab = ref("ongoing");

const tabs = ref([
  { key: "ongoing", label: "진행 중" },
  { key: "completed", label: "종료된 과제" },
]);

const assignments = ref([
  {
    id: 1,
    title: "'2. What's This? 06. AI Writing' 차시 마무리",
    subject: "2.What's This? > 06.AI Writing",
    status: "ongoing",
    progress: 65,
    participants: 24,
    dueDate: "2024-12-20",
    createdDate: "2024-12-10",
    studentStatus: "in-progress",
    studentScore: null,
    studentSubmitDate: null,
  },
]);

const ongoingAssignments = computed(() =>
  assignments.value.filter((a) => a.status === "ongoing")
);

const completedAssignments = computed(() =>
  assignments.value.filter((a) => a.status === "completed")
);

const getTabCount = (tabKey) => {
  switch (tabKey) {
    case "ongoing":
      return ongoingAssignments.value.length;
    case "completed":
      return completedAssignments.value.length;
    default:
      return 0;
  }
};

const getStudentStatusText = (status) => {
  switch (status) {
    case "not-started":
      return "미시작";
    case "in-progress":
      return "진행중";
    case "completed":
      return "완료";
    default:
      return "미시작";
  }
};

const switchTab = (tabKey) => {
  currentTab.value = tabKey;
};

const viewAssignmentDetail = (assignment) => {
  console.log("과제 상세 보기:", assignment);
  if (isTeacher.value) {
    alert(`"${assignment.title}" 과제 관리 페이지로 이동합니다.`);
  } else {
    alert(`"${assignment.title}" 과제 상세 정보를 확인합니다.`);
  }
};

const editAssignment = (assignment) => {
  console.log("과제 수정:", assignment);
  alert(`"${assignment.title}" 과제를 수정합니다.`);
};

const deleteAssignment = (assignment) => {
  console.log("과제 삭제:", assignment);
  if (confirm(`"${assignment.title}" 과제를 삭제하시겠습니까?`)) {
    assignments.value = assignments.value.filter((a) => a.id !== assignment.id);
    alert("과제가 삭제되었습니다.");
  }
};

const viewResults = (assignment) => {
  console.log("결과 보기:", assignment);
  alert(`"${assignment.title}" 전체 결과를 확인합니다.`);
};

const downloadResults = (assignment) => {
  console.log("결과 다운로드:", assignment);
  alert(`"${assignment.title}" 결과를 다운로드합니다.`);
};

const startAssignment = (assignment) => {
  console.log("과제 시작:", assignment);
  router.push({
    name: "AssignmentSubmission",
    params: { id: assignment.id },
  });
};

const viewMyResult = (assignment) => {
  console.log("내 결과 보기:", assignment);
  alert(`"${assignment.title}" 내 결과를 확인합니다.`);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
};

onMounted(() => {
  console.log("AssignmentList 컴포넌트가 마운트되었습니다.");
  console.log("현재 사용자 유형:", localStorage.getItem("userType"));
});
</script>

<style scoped>
.assignment-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: #fafbfc;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #034582 0%, #0369a1 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(50px, -50px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.header-left h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.page-description {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

.create-assignment-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.create-assignment-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  color: white;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.info-content {
  display: flex;
  gap: 1rem;
}

.info-icon {
  color: #3b82f6;
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.info-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.info-list li {
  color: #6b7280;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1rem;
}

.info-list li::before {
  content: "•";
  color: #3b82f6;
  position: absolute;
  left: 0;
}

.assignment-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.tab-button {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #6b7280;
}

.tab-button:hover {
  background: #f8fafc;
  color: #374151;
}

.tab-button.active {
  background: #034582;
  color: white;
  box-shadow: 0 2px 4px rgba(3, 69, 130, 0.2);
}

.tab-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.tab-button.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.section-count {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem;
}

.empty-description {
  color: #6b7280;
  margin: 0 0 2rem;
}

.empty-action-btn {
  background: #034582;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  text-decoration: none;
}

.empty-action-btn:hover {
  background: #0369a1;
  transform: translateY(-1px);
  color: white;
}

.assignment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.assignment-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #034582;
}

.assignment-card.ongoing::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.assignment-card.completed::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #059669);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.assignment-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.assignment-status.ongoing {
  background: #dbeafe;
  color: #1d4ed8;
}

.assignment-status.completed {
  background: #d1fae5;
  color: #059669;
}

.assignment-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.assignment-card:hover .assignment-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #034582;
  color: white;
}

.action-btn.student-action {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-btn.student-action:hover {
  background: #1d4ed8;
  color: white;
}

.assignment-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.assignment-subject {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 1rem;
}

.assignment-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.3s ease;
}

.student-assignment-status {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-item {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
}

.status-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.status-value {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
}

.status-value.not-started {
  color: #6b7280;
}

.status-value.in-progress {
  color: #f59e0b;
}

.status-value.completed {
  color: #10b981;
}

.status-value.score {
  color: #3b82f6;
}

.assignment-results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-item {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
}

.result-label {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.result-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #10b981;
}

.student-results {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.assignment-meta {
  display: flex;
  justify-content: space-between;
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

@media (max-width: 768px) {
  .assignment-management {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .assignment-tabs {
    flex-direction: column;
  }

  .assignment-grid {
    grid-template-columns: 1fr;
  }

  .assignment-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .student-assignment-status,
  .assignment-results,
  .student-results {
    grid-template-columns: 1fr;
  }
}
</style>
