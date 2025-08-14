<!-- src/views/AssignmentSubmission.vue -->
<template>
  <!-- [수정됨] 공용 헤더 사용 -->
  <Header />

  <div class="chick-assignment-app">
    <main v-if="assignment" class="main-content">
      <!-- 목록으로 이동 버튼 -->
      <button class="back-to-list-btn" @click="goBackToList">
        <i class="icon">📋</i>
        <span>목록으로 돌아가기</span>
      </button>

      <!-- 과제 정보 카드 -->
      <div class="assignment-card">
        <div class="card-header">
          <div class="assignment-type-badge">🎯 일반 과제</div>
          <div class="assignment-title-area">
            <!-- [수정됨] 동적 데이터 바인딩 -->
            <h2 class="assignment-title">{{ assignment.title }}</h2>
            <div class="assignment-meta">
              <span class="registration-date"
                >마감일: {{ formatDate(assignment.dueDate) }}</span
              >
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="assignment-info">
            <div class="info-row">
              <div class="info-label">📅 과제 기간</div>
              <div class="info-value">
                <span>{{ formatDate(assignment.dueDate) }}까지</span>
                <span class="status-badge always">🏃 진행중</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-label">📝 과제 내용</div>
              <div class="info-value">
                <div class="teacher-message">
                  <div class="message-header">
                    <span class="teacher-icon">👩‍🏫</span>
                    <span class="message-title">선생님 메시지</span>
                  </div>
                  <!-- [수정됨] 동적 데이터 바인딩 -->
                  <div class="message-content">
                    <p>{{ assignment.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 과제 제출/확인 영역 -->
      <!-- 과제를 아직 제출하지 않았을 경우 -->
      <div v-if="!submittedAssignment" class="submission-card">
        <div class="card-header">
          <h3 class="card-title">🐣 과제 제출하기</h3>
          <div class="privacy-notice">
            💡 게시 자료는 공개될 수 있으니, 개인정보가 포함되지 않도록
            유의해주세요.
          </div>
        </div>
        <div class="card-content">
          <form @submit.prevent="submitAssignment">
            <div class="form-group">
              <label class="form-label">✏️ 내용</label>
              <textarea
                v-model="submissionContent"
                class="submission-editor"
                placeholder="과제 내용을 입력해주세요..."
                rows="6"
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">📎 첨부파일</label>
              <div class="file-upload-area">
                <div
                  class="file-drop-zone"
                  @dragover.prevent
                  @drop.prevent="handleFileDrop"
                  @click="$refs.fileInput.click()"
                >
                  <div class="drop-zone-content">
                    <div class="upload-icon">📁</div>
                    <p class="upload-text">
                      <button type="button" class="file-select-btn">
                        파일 선택
                      </button>
                      또는 파일을 여기로 드래그하세요.
                    </p>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    @change="handleFileSelect"
                    style="display: none"
                  />
                </div>
                <div v-if="selectedFiles.length > 0" class="file-list">
                  <div
                    v-for="(file, index) in selectedFiles"
                    :key="index"
                    class="file-item"
                  >
                    <span class="file-icon">📄</span
                    ><span class="file-name">{{ file.name }}</span
                    ><span class="file-size"
                      >({{ formatFileSize(file.size) }})</span
                    ><button
                      type="button"
                      class="file-remove-btn"
                      @click="removeFile(index)"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="submit-button-area">
              <button type="submit" class="submit-btn">🐥 제출하기</button>
            </div>
          </form>
        </div>
      </div>

      <!-- 과제를 제출한 후 -->
      <div v-else>
        <div class="submitted-card">
          <div class="card-header">
            <h3 class="card-title">✅ 내가 제출한 과제</h3>
          </div>
          <div class="card-content">
            <div class="submitted-info">
              <div class="info-row">
                <div class="info-label">📅 제출일</div>
                <div class="info-value">
                  {{ submittedAssignment.submissionDate }}
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">📝 내용</div>
                <div class="info-value">
                  <div class="submitted-content">
                    {{ submittedAssignment.content }}
                  </div>
                </div>
              </div>
              <div v-if="submittedAssignment.files.length > 0" class="info-row">
                <div class="info-label">📎 첨부파일</div>
                <div class="info-value">
                  <div class="submitted-files">
                    <div
                      v-for="file in submittedAssignment.files"
                      :key="file.name"
                      class="submitted-file"
                    >
                      📄 {{ file.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 평가 카드 (선생님 피드백) -->
        <div v-if="evaluation" class="evaluation-card">
          <div class="card-header">
            <h3 class="card-title">⭐ 선생님 평가</h3>
          </div>
          <div class="card-content">
            <div class="evaluation-content">
              <div class="info-row">
                <div class="info-label">💬 피드백</div>
                <div class="info-value">
                  <div class="teacher-feedback">
                    <div class="feedback-header">
                      <span class="teacher-avatar">👩‍🏫</span
                      ><span class="teacher-name">선생님</span
                      ><span class="feedback-date">{{ evaluation.date }}</span>
                    </div>
                    <div class="feedback-message">
                      {{ evaluation.feedback }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <div v-else class="main-content">
      <p>과제 정보를 불러오는 중입니다...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";

// [수정됨] Composition API 사용
const route = useRoute();
const router = useRouter();

// 현재 과제 정보를 담을 ref
const assignment = ref(null);

// 제출 관련 상태
const submissionContent = ref("");
const selectedFiles = ref([]);
const submittedAssignment = ref(null);
const evaluation = ref(null); // 선생님 피드백

// 더미 데이터 (실제로는 API에서 가져옵니다)
const dummyAssignments = [
  {
    id: 1,
    title: "'What's This?' 단원 마무리",
    subject: "2. What's This?",
    dueDate: "2025-08-30",
    content:
      "1단원 'What's This?'를 마무리하는 과제입니다. 배운 내용을 잘 복습하고 문제를 풀어보세요! 화이팅! 💪",
  },
  {
    id: 2,
    title: "알파벳 친구들과 노래하기",
    subject: "1. Hello, ABC!",
    dueDate: "2025-09-05",
    content:
      "알파벳 노래를 듣고 따라 부르는 영상을 찍어서 올려주세요. 가장 멋진 목소리를 뽐내봐요! 🎶",
  },
  {
    id: 3,
    title: "AI 친구와 대화하기",
    subject: "3. Sit Down, Please",
    dueDate: "2025-08-01",
    content:
      "AI 친구와 '앉으세요', '일어나세요' 등의 명령어로 대화하는 미션입니다. 재미있게 참여해주세요!",
  },
];

// 컴포넌트가 마운트될 때 URL 파라미터에서 ID를 가져와 과제 정보를 찾음
onMounted(() => {
  const assignmentId = parseInt(route.params.id);
  const foundAssignment = dummyAssignments.find((a) => a.id === assignmentId);
  if (foundAssignment) {
    assignment.value = foundAssignment;
  } else {
    alert("과제를 찾을 수 없습니다.");
    router.push("/assignment");
  }
});

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
const goBackToList = () => router.push("/assignment");

// 파일 처리 로직 (이전 코드와 동일)
const fileInput = ref(null);
const handleFileSelect = (event) => addFiles(Array.from(event.target.files));
const handleFileDrop = (event) =>
  addFiles(Array.from(event.dataTransfer.files));
const addFiles = (files) => {
  if (selectedFiles.value.length + files.length > 5) {
    alert("파일은 최대 5개까지 등록할 수 있습니다.");
    return;
  }
  selectedFiles.value.push(...files);
};
const removeFile = (index) => selectedFiles.value.splice(index, 1);
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
    " " +
    ["Bytes", "KB", "MB"][i]
  );
};

// 과제 제출 로직
const submitAssignment = () => {
  if (!submissionContent.value.trim() && selectedFiles.value.length === 0) {
    alert("내용을 입력하거나 파일을 첨부해주세요!");
    return;
  }
  const now = new Date();
  submittedAssignment.value = {
    content: submissionContent.value,
    files: [...selectedFiles.value],
    submissionDate: now.toLocaleDateString("ko-KR"),
  };
  setTimeout(() => {
    evaluation.value = {
      feedback:
        "정말 잘했어요! 꼼꼼하게 과제를 해결했네요. 다음 과제도 기대할게요! 👍",
      date: now.toLocaleDateString("ko-KR"),
    };
  }, 3000);
  alert("🐥 과제가 성공적으로 제출되었습니다!");
};
</script>

<style scoped>
/* [수정됨] 제공해주신 스타일에서 네비게이션바 관련 스타일 제거 */
.chick-assignment-app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  background: #fff9e6; /* 배경 통일 */
  min-height: 100vh;
  color: #333;
}
.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}
.back-to-list-btn {
  background: white;
  border: 2px solid #ffe066;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  color: #ff9800;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}
.back-to-list-btn:hover {
  background: #fffbf0;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

/* 카드 스타일은 제공된 코드를 기반으로 테마에 맞게 약간 수정 */
.assignment-card,
.submission-card,
.submitted-card,
.evaluation-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 3px solid #fff5d6;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.1);
}
.card-header {
  margin-bottom: 1.5rem;
}
.card-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ff9800;
  margin: 0 0 1rem 0;
}
.assignment-type-badge {
  background: #ff9800;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 1rem;
}
.assignment-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #8c6d32;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}
.assignment-meta {
  color: #ffb74d;
  font-size: 0.9rem;
  font-weight: 600;
}
.info-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}
.info-label {
  min-width: 100px;
  font-weight: 700;
  color: #ff9800;
}
.info-value {
  flex: 1;
  color: #8c6d32;
}
.status-badge {
  background: #fff5d6;
  color: #f57c00;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.5rem;
}
.teacher-message {
  background: #fffbf0;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px dashed #ffe066;
}
.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.teacher-icon {
  font-size: 1.2rem;
}
.message-title {
  font-weight: 700;
  color: #f57c00;
}
.message-content {
  color: #8c6d32;
  line-height: 1.7;
}
.privacy-notice {
  background: #fff9e6;
  border-radius: 12px;
  padding: 1rem;
  font-size: 0.85rem;
  color: #f57c00;
  line-height: 1.4;
  border: 2px dashed #ffe066;
}
.form-group {
  margin-bottom: 2rem;
}
.form-label {
  display: block;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #ff9800;
  font-size: 1.1rem;
}
.submission-editor {
  width: 100%;
  border: 3px solid #fff5d6;
  border-radius: 15px;
  padding: 1rem;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 150px;
  background: white;
  transition: all 0.2s ease;
}
.submission-editor:focus {
  outline: none;
  border-color: #ffdd29;
}
.file-drop-zone {
  border: 3px dashed #ffe066;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fffbf0;
}
.file-drop-zone:hover {
  border-color: #ffdd29;
  background: white;
}
.file-select-btn {
  background: #ffdd29;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.file-select-btn:hover {
  transform: translateY(-1px);
}
.file-list {
  margin-top: 1rem;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 15px;
  background: #fffbf0;
  border: 2px solid #fff5d6;
  margin-bottom: 0.5rem;
}
.file-remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: auto;
}
.submit-btn {
  background: #ffdd29;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}
.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}
.submitted-card {
  background: #f1f8e9;
  border-color: #c5e1a5;
}
.submitted-card .card-title {
  color: #558b2f;
}
.submitted-content {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  white-space: pre-wrap;
  line-height: 1.6;
  border: 2px solid #e8f5e9;
}
.evaluation-card {
  background: #fff3e0;
  border-color: #ffcc80;
}
.evaluation-card .card-title {
  color: #e65100;
}
.teacher-feedback {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #ffe0b2;
}
</style>
