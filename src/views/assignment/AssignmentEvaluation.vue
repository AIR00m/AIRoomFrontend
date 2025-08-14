<template>
  <Header />
  <div class="cute-assignment-app">
    <main v-if="assignment" class="main-content">
      <div class="cute-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="header-title">📝 우리 반 과제 관리 ✨</h1>
            <p class="header-subtitle">
              아이들의 과제 현황을 한눈에 확인하고 관리해보세요! 🌈
            </p>
          </div>
        </div>
        <div class="header-decorations">
          <div class="deco-item deco1">📚</div>
          <div class="deco-item deco2">🎈</div>
          <div class="deco-item deco3">⭐</div>
          <div class="deco-item deco4">🏆</div>
        </div>
      </div>

      <div class="assignment-info-card">
        <div class="assignment-header">
          <div class="assignment-badges">
            <span class="assignment-type-badge">📋 일반 과제</span>
            <span
              class="status-badge"
              :class="
                assignment.status === 'ongoing' ? 'in-progress' : 'completed'
              "
            >
              {{ assignment.status === "ongoing" ? "🔄 진행 중" : "✅ 완료됨" }}
            </span>
          </div>
          <button class="more-btn" @click="showMoreMenu">⋮</button>
        </div>

        <div class="assignment-title-section">
          <h2 class="assignment-title">{{ assignment.title }}</h2>
          <div class="assignment-meta">
            <span class="registration-date"
              >📅 마감일: {{ formatDate(assignment.dueDate) }}</span
            >
          </div>
        </div>

        <div class="completion-summary">
          <div class="summary-card completed">
            <div class="summary-icon">✅</div>
            <div class="summary-content">
              <div class="summary-label">완료</div>
              <div class="summary-count">
                {{ completedCount }}<span>명</span>
              </div>
            </div>
          </div>
          <div class="summary-card incomplete">
            <div class="summary-icon">⏳</div>
            <div class="summary-content">
              <div class="summary-label">미완료</div>
              <div class="summary-count">
                {{ incompleteCount }}<span>명</span>
              </div>
            </div>
          </div>
          <div class="summary-card total">
            <div class="summary-icon">👥</div>
            <div class="summary-content">
              <div class="summary-label">전체</div>
              <div class="summary-count">
                {{ students.length }}<span>명</span>
              </div>
            </div>
          </div>
        </div>

        <div class="assignment-details">
          <div class="detail-row content-row">
            <div class="detail-label">📝 과제 내용</div>
            <div class="detail-value">
              <div class="assignment-content">
                <div class="teacher-message">
                  <p>{{ assignment.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="students-status-card">
        <div class="card-header">
          <h2 class="card-title">👦👧 학생별 현황</h2>
        </div>
        <div class="list-controls">
          <div class="filter-section">
            <label class="cute-checkbox">
              <input type="checkbox" v-model="showOnlyIncomplete" />
              <span class="checkmark">✓</span>
              <span class="label-text">😴 미완료 학생만 보기</span>
            </label>
          </div>
          <div class="action-buttons">
            <button
              class="cute-btn secondary"
              :disabled="selectedStudents.length === 0"
              @click="downloadAttachments"
            >
              📎 첨부파일 다운
            </button>
            <button
              class="cute-btn secondary"
              :disabled="selectedStudents.length === 0"
              @click="praiseStudents"
            >
              🎉 칭찬하기
            </button>
            <button
              class="cute-btn secondary"
              :disabled="selectedStudents.length === 0"
              @click="sendMessage"
            >
              💬 대화 보내기
            </button>
          </div>
        </div>
        <div class="students-table-container">
          <div class="students-table">
            <div class="table-header">
              <div class="header-cell checkbox-cell">
                <label class="cute-checkbox">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="selectAllStudents"
                  />
                  <span class="checkmark">✓</span>
                </label>
              </div>
              <div class="header-cell">번호</div>
              <div class="header-cell">이름</div>
              <div class="header-cell">완료 여부</div>
              <div class="header-cell">제출 일시</div>
              <div class="header-cell">수정 일시</div>
              <div class="header-cell">첨부파일</div>
              <div class="header-cell">상세 보기</div>
            </div>
            <div class="table-body">
              <div
                v-for="(student, index) in filteredStudents"
                :key="student.id"
                class="table-row"
              >
                <div class="table-cell checkbox-cell">
                  <label class="cute-checkbox">
                    <input
                      type="checkbox"
                      v-model="selectedStudents"
                      :value="student.id"
                    />
                    <span class="checkmark">✓</span>
                  </label>
                </div>
                <div class="table-cell number-cell">{{ index + 1 }}</div>
                <div class="table-cell name-cell">
                  <div class="student-info">
                    <span class="student-emoji">🧑‍🎓</span>
                    <span class="student-name">{{ student.name }}</span>
                  </div>
                </div>
                <div class="table-cell status-cell">
                  <span
                    :class="`status-badge ${
                      student.isCompleted ? 'completed' : 'incomplete'
                    }`"
                  >
                    {{ student.isCompleted ? "✅ 완료" : "⏳ 미완료" }}
                  </span>
                </div>
                <div class="table-cell date-cell">
                  {{ student.submissionDate || "-" }}
                </div>
                <div class="table-cell date-cell">
                  {{ student.modificationDate }}
                </div>
                <div class="table-cell attachment-cell">
                  <button v-if="student.hasAttachment" class="attachment-btn">
                    📎
                  </button>
                  <span v-else>-</span>
                </div>
                <div class="table-cell detail-cell">
                  <button
                    class="detail-btn"
                    @click="viewStudentDetail(student.id)"
                  >
                    👀 상세
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="filteredStudents.length === 0" class="empty-state">
          <div class="empty-icon">🤗</div>
          <h3>표시할 학생이 없어요</h3>
          <p>필터 조건을 확인해주세요!</p>
        </div>
      </div>

      <div class="floating-list-btn">
        <button class="list-btn" @click="goToList">
          📋 <span>목록으로 이동</span>
        </button>
      </div>
    </main>
    <div v-else class="loading-state">
      <div class="loading-icon">🐣</div>
      <p>과제 정보를 불러오는 중입니다...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";

const route = useRoute();
const router = useRouter();

const assignment = ref(null);
const students = ref([]);

const showOnlyIncomplete = ref(false);
const selectedStudents = ref([]);

const allAssignments = [
  {
    id: 1,
    title: "'What's This?' 단원 마무리",
    subject: "2. What's This?",
    status: "ongoing",
    dueDate: "2025-08-30",
    content:
      "1단원 'What's This?'를 마무리하는 과제입니다. 배운 내용을 잘 복습하고 문제를 풀어보세요! 화이팅! 💪",
  },
  {
    id: 2,
    title: "알파벳 친구들과 노래하기",
    subject: "1. Hello, ABC!",
    status: "ongoing",
    dueDate: "2025-09-05",
    content:
      "알파벳 노래를 듣고 따라 부르는 영상을 찍어서 올려주세요. 가장 멋진 목소리를 뽐내봐요! 🎶",
  },
  {
    id: 3,
    title: "AI 친구와 대화하기",
    subject: "3. Sit Down, Please",
    status: "completed",
    dueDate: "2025-08-01",
    content:
      "AI 친구와 '앉으세요', '일어나세요' 등의 명령어로 대화하는 미션입니다. 재미있게 참여해주세요!",
  },
];

const allStudents = [
  {
    id: 1,
    name: "김병아",
    assignmentId: 1,
    isCompleted: true,
    submissionDate: "2025.08.12",
    modificationDate: "2025.08.12",
    hasAttachment: true,
  },
  {
    id: 2,
    name: "이보통",
    assignmentId: 1,
    isCompleted: false,
    submissionDate: null,
    modificationDate: "-",
    hasAttachment: false,
  },
  {
    id: 3,
    name: "나느려",
    assignmentId: 1,
    isCompleted: true,
    submissionDate: "2025.08.11",
    modificationDate: "2025.08.11",
    hasAttachment: false,
  },
  {
    id: 4,
    name: "정천천",
    assignmentId: 1,
    isCompleted: false,
    submissionDate: null,
    modificationDate: "-",
    hasAttachment: false,
  },
  {
    id: 5,
    name: "윤차분",
    assignmentId: 1,
    isCompleted: true,
    submissionDate: "2025.08.13",
    modificationDate: "2025.08.13",
    hasAttachment: true,
  },
  {
    id: 6,
    name: "박열공",
    assignmentId: 2,
    isCompleted: true,
    submissionDate: "2025.08.13",
    modificationDate: "2025.08.13",
    hasAttachment: true,
  },
  {
    id: 7,
    name: "최평범",
    assignmentId: 2,
    isCompleted: true,
    submissionDate: "2025.08.13",
    modificationDate: "2025.08.13",
    hasAttachment: true,
  },
  {
    id: 8,
    name: "고민중",
    assignmentId: 3,
    isCompleted: false,
    submissionDate: null,
    modificationDate: "-",
    hasAttachment: false,
  },
  {
    id: 9,
    name: "황지켜",
    assignmentId: 3,
    isCompleted: true,
    submissionDate: "2025.08.10",
    modificationDate: "2025.08.10",
    hasAttachment: true,
  },
  {
    id: 10,
    name: "홍도와",
    assignmentId: 3,
    isCompleted: true,
    submissionDate: "2025.08.09",
    modificationDate: "2025.08.09",
    hasAttachment: false,
  },
];

onMounted(() => {
  const currentId = parseInt(route.params.id);
  const foundAssignment = allAssignments.find((a) => a.id === currentId);

  if (foundAssignment) {
    assignment.value = foundAssignment;
    students.value = allStudents.filter((s) => s.assignmentId === currentId);
  } else {
    alert("해당 과제를 찾을 수 없습니다.");
    router.push("/assignment");
  }
});

const filteredStudents = computed(() => {
  if (!students.value) return [];
  return showOnlyIncomplete.value
    ? students.value.filter((s) => !s.isCompleted)
    : students.value;
});

const completedCount = computed(
  () => students.value.filter((s) => s.isCompleted).length
);
const incompleteCount = computed(
  () => students.value.length - completedCount.value
);
const isAllSelected = computed(
  () =>
    filteredStudents.value.length > 0 &&
    selectedStudents.value.length === filteredStudents.value.length
);

const selectAllStudents = (event) => {
  if (event.target.checked) {
    selectedStudents.value = filteredStudents.value.map((s) => s.id);
  } else {
    selectedStudents.value = [];
  }
};

const goToList = () => router.push("/assignment");
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("ko-KR");

const showMoreMenu = () => alert("더보기 메뉴 (수정/삭제)를 표시합니다!");
const downloadAttachments = () =>
  alert(
    `선택한 ${selectedStudents.value.length}명 학생의 첨부파일을 다운로드합니다!`
  );
const praiseStudents = () =>
  alert(`선택한 ${selectedStudents.value.length}명 학생들을 칭찬합니다!`);
const sendMessage = () =>
  alert(
    `선택한 ${selectedStudents.value.length}명 학생들에게 메시지를 보냅니다!`
  );
const viewStudentDetail = (studentId) =>
  alert(`학생 ID ${studentId}의 제출 상세 정보를 봅니다!`);
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.cute-assignment-app {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.cute-header {
  background: linear-gradient(135deg, #ffdd29, #ffc107);
  border-radius: 25px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(255, 152, 0, 0.2);
  color: white;
}
.header-content {
  position: relative;
  z-index: 2;
}
.header-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}
.header-subtitle {
  font-size: 1.1rem;
  opacity: 0.95;
  line-height: 1.6;
  margin-bottom: 1rem;
}
.header-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
.deco-item {
  position: absolute;
  font-size: 2rem;
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}
.deco1 {
  top: 20%;
  right: 15%;
  animation-delay: 0s;
}
.deco2 {
  top: 10%;
  right: 5%;
  animation-delay: 1s;
}
.deco3 {
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}
.deco4 {
  top: 70%;
  right: 25%;
  animation-delay: 3s;
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
.assignment-info-card {
  background: white;
  border-radius: 25px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px solid #ffe066;
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.08);
  position: relative;
}
.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.assignment-badges {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.assignment-type-badge {
  background: #d9f2ff;
  color: #0077b6;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-weight: 700;
  font-size: 0.9rem;
  border: 1px solid rgba(0, 102, 204, 0.2);
}
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-weight: 700;
  font-size: 0.9rem;
}
.status-badge.in-progress {
  background: #fff5d6;
  color: #f57c00;
  border: 1px solid rgba(133, 100, 4, 0.2);
}
.status-badge.completed {
  background: #d4edda;
  color: #155724;
  border: 1px solid rgba(12, 84, 96, 0.2);
}
.status-badge.incomplete {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid rgba(114, 28, 36, 0.2);
}
.more-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 10px;
  transition: background 0.3s ease;
}
.more-btn:hover {
  background: #f1f1f1;
}
.assignment-title-section {
  margin-bottom: 2rem;
}
.assignment-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}
.assignment-meta {
  color: #666;
  font-size: 0.9rem;
}
.completion-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.summary-card {
  background: #fffbf0;
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  border: 2px solid #fff5d6;
  transition: all 0.3s ease;
}
.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(255, 152, 0, 0.15);
}
.summary-card.completed {
  border-color: #a7f3d0;
  background: #f0fdf4;
}
.summary-card.incomplete {
  border-color: #fecaca;
  background: #fef2f2;
}
.summary-card.total {
  border-color: #bfdbfe;
  background: #eff6ff;
}
.summary-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.summary-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
  font-weight: 600;
}
.summary-count {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ff9800;
}
.summary-count span {
  font-size: 1rem;
  font-weight: 600;
}
.assignment-details {
  border-top: 1px solid #f1f1f1;
  padding-top: 1.5rem;
}
.detail-row {
  display: flex;
  margin-bottom: 1rem;
  gap: 1rem;
}
.detail-row.content-row {
  align-items: flex-start;
}
.detail-label {
  min-width: 120px;
  font-weight: 700;
  color: #666;
  flex-shrink: 0;
}
.detail-value {
  flex: 1;
  color: #333;
}
.assignment-content {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 15px;
  border: 1px solid #e9ecef;
}
.teacher-message {
  margin-top: 1rem;
  line-height: 1.6;
}
.teacher-message p {
  margin-bottom: 0.5rem;
}
.students-status-card {
  background: white;
  border-radius: 25px;
  padding: 2rem;
  border: 2px solid #ffe066;
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.08);
}
.card-header {
  margin-bottom: 2rem;
}
.card-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0;
}
.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.filter-section {
  display: flex;
  align-items: center;
}
.cute-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  color: #666;
}
.cute-checkbox input {
  display: none;
}
.checkmark {
  width: 20px;
  height: 20px;
  background: white;
  border: 2px solid #ffe066;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  color: transparent;
}
.cute-checkbox input:checked + .checkmark {
  background: #ffdd29;
  color: white;
  border-color: #ffdd29;
}
.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.cute-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.cute-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.cute-btn.secondary {
  background: #fff5d6;
  color: #ff9800;
  border: 2px solid #ffe066;
}
.cute-btn.secondary:hover:not(:disabled) {
  background: #fff9e6;
  transform: translateY(-2px);
}
.students-table-container {
  background: #fffbf0;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #fff5d6;
}
.students-table {
  width: 100%;
}
.table-header {
  display: grid;
  grid-template-columns: 50px 60px 1fr 120px 150px 150px 100px 100px;
  background: #fff5d6;
  font-weight: 700;
  color: #ff9800;
}
.header-cell {
  padding: 1rem 0.75rem;
  text-align: center;
  border-right: 1px solid #ffe066;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-cell:last-child {
  border-right: none;
}
.table-body {
  max-height: 400px;
  overflow-y: auto;
}
.table-row {
  display: grid;
  grid-template-columns: 50px 60px 1fr 120px 150px 150px 100px 100px;
  border-bottom: 1px solid #f8f9fa;
  transition: background 0.3s ease;
}
.table-row:hover {
  background: rgba(255, 221, 41, 0.08);
}
.table-cell {
  padding: 1rem 0.75rem;
  text-align: center;
  border-right: 1px solid #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.table-cell:last-child {
  border-right: none;
}
.checkbox-cell {
  padding: 0.5rem;
}
.number-cell {
  font-weight: 700;
  color: #666;
}
.name-cell {
  justify-content: flex-start;
}
.student-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.student-emoji {
  font-size: 1.2rem;
}
.student-name {
  font-weight: 600;
  color: #333;
}
.status-cell {
  padding: 0.5rem;
}
.date-cell {
  font-size: 0.85rem;
  color: #666;
}
.attachment-btn,
.detail-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}
.attachment-btn:hover,
.detail-btn:hover {
  background: rgba(255, 152, 0, 0.1);
}
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
.empty-state h3 {
  color: #ff9800;
  margin-bottom: 0.5rem;
}
.floating-list-btn {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 50;
}
.list-btn {
  background: #ff9800;
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.list-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(255, 152, 0, 0.4);
}
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
  animation: float 8s ease-in-out infinite;
}
.item1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}
.item2 {
  top: 20%;
  right: 10%;
  animation-delay: 1.5s;
}
.item3 {
  top: 60%;
  left: 5%;
  animation-delay: 3s;
}
.item4 {
  top: 80%;
  right: 20%;
  animation-delay: 4.5s;
}
.item5 {
  top: 40%;
  left: 80%;
  animation-delay: 6s;
}
.item6 {
  top: 70%;
  right: 5%;
  animation-delay: 7.5s;
}
.loading-state {
  text-align: center;
  padding-top: 10rem;
  color: #ff9800;
  font-size: 1.2rem;
  font-weight: 700;
}
.loading-icon {
  font-size: 4rem;
  animation: wiggle 2s infinite;
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
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  .header-title {
    font-size: 1.8rem;
  }
  .completion-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  .list-controls {
    flex-direction: column;
    align-items: stretch;
  }
  .action-buttons {
    justify-content: center;
  }
  .table-header,
  .table-row {
    grid-template-columns: 40px 50px 1fr 80px 100px 100px 60px 60px;
  }
  .header-cell,
  .table-cell {
    padding: 0.5rem 0.25rem;
    font-size: 0.8rem;
  }
  .floating-list-btn {
    bottom: 1rem;
    left: 1rem;
  }
  .list-btn {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}
@media (max-width: 480px) {
  .header-title {
    font-size: 1.5rem;
  }
  .completion-summary {
    grid-template-columns: 1fr;
  }
  .assignment-info-card,
  .students-status-card {
    padding: 1.5rem;
  }
  .table-header,
  .table-row {
    grid-template-columns: 30px 40px 1fr 60px 80px 80px 40px 40px;
  }
  .header-cell,
  .table-cell {
    padding: 0.5rem 0.2rem;
    font-size: 0.7rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
button:focus,
input:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}
</style>
