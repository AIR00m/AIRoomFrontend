<template>
  <Header />

  <div class="assignment-submission-app">
    <main v-if="assignment" class="main-content">
      <!-- 목록으로 이동 버튼 -->
      <button class="back-to-list-btn" @click="goBackToList">
        <i class="icon">📋</i>
        <span>{{ backButtonText }}</span>
      </button>

      <!-- 과제 정보 카드 -->
      <div class="assignment-card">
        <div class="card-header">
          <div class="assignment-type-badge">{{ assignmentTypeBadge }}</div>
          <div class="assignment-title-area">
            <h2 class="assignment-title">{{ assignment.title }}</h2>
            <div class="assignment-meta">
              <span class="registration-date">{{ dueDateText }}</span>
            </div>
          </div>
        </div>
        <div class="card-content">
          <div class="assignment-info">
            <div
              v-for="info in assignmentInfoItems"
              :key="info.key"
              class="info-row"
            >
              <div class="info-label">{{ info.label }}</div>
              <div class="info-value">
                <template v-if="info.key === 'period'">
                  <span>{{ info.value }}</span>
                  <span class="status-badge" :class="statusClass">{{
                    statusText
                  }}</span>
                </template>
                <template v-else-if="info.key === 'content'">
                  <div class="teacher-message">
                    <div class="message-header">
                      <span class="teacher-icon">👩‍🏫</span>
                      <span class="message-title">{{
                        teacherMessageTitle
                      }}</span>
                    </div>
                    <div class="message-content">
                      <p>{{ assignment.content }}</p>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 과제 제출/확인 영역 -->
      <!-- 과제를 아직 제출하지 않았을 경우 -->
      <div v-if="!submittedAssignment" class="submission-card">
        <div class="card-header">
          <h3 class="card-title">{{ submissionCardTitle }}</h3>
          <div class="privacy-notice">
            {{ privacyNoticeText }}
          </div>
        </div>
        <div class="card-content">
          <form @submit.prevent="submitAssignment">
            <div class="form-group">
              <label class="form-label">{{ contentLabel }}</label>
              <textarea
                v-model="submissionContent"
                class="submission-editor"
                :placeholder="contentPlaceholder"
                rows="6"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">{{ attachmentLabel }}</label>
              <div class="file-upload-area">
                <div
                  class="file-drop-zone"
                  @dragover.prevent
                  @drop.prevent="handleFileDrop"
                  @click="triggerFileInput"
                >
                  <div class="drop-zone-content">
                    <div class="upload-icon">📁</div>
                    <p class="upload-text">
                      <button type="button" class="file-select-btn">
                        {{ fileSelectText }}
                      </button>
                      {{ dragDropText }}
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
                <div v-if="hasSelectedFiles" class="file-list">
                  <div
                    v-for="(file, index) in selectedFiles"
                    :key="`file-${index}`"
                    class="file-item"
                  >
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size"
                      >({{ formatFileSize(file.size) }})</span
                    >
                    <button
                      type="button"
                      class="file-remove-btn"
                      @click="removeFile(index)"
                      :aria-label="`${file.name} 파일 삭제`"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="submit-button-area">
              <button
                type="submit"
                class="submit-btn"
                :disabled="!canSubmit"
                :class="{ disabled: !canSubmit }"
              >
                {{ submitButtonText }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 과제를 제출한 후 -->
      <div v-else>
        <div class="submitted-card">
          <div class="card-header">
            <h3 class="card-title">{{ submittedCardTitle }}</h3>
          </div>
          <div class="card-content">
            <div class="submitted-info">
              <div
                v-for="info in submittedInfoItems"
                :key="info.key"
                class="info-row"
              >
                <div class="info-label">{{ info.label }}</div>
                <div class="info-value">
                  <template v-if="info.key === 'content'">
                    <div class="submitted-content">
                      {{ submittedAssignment.content }}
                    </div>
                  </template>
                  <template v-else-if="info.key === 'files'">
                    <div class="submitted-files">
                      <div
                        v-for="file in submittedAssignment.files"
                        :key="file.name"
                        class="submitted-file"
                      >
                        📄 {{ file.name }}
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    {{ info.value }}
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 평가 카드 (선생님 피드백) -->
        <div v-if="evaluation" class="evaluation-card">
          <div class="card-header">
            <h3 class="card-title">{{ evaluationCardTitle }}</h3>
          </div>
          <div class="card-content">
            <div class="evaluation-content">
              <div class="info-row">
                <div class="info-label">{{ feedbackLabel }}</div>
                <div class="info-value">
                  <div class="teacher-feedback">
                    <div class="feedback-header">
                      <span class="teacher-avatar">👩‍🏫</span>
                      <span class="teacher-name">{{ teacherName }}</span>
                      <span class="feedback-date">{{ evaluation.date }}</span>
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
      <div class="loading-state">
        <div class="loading-icon">⏳</div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";

// 라우터 및 라우트
const route = useRoute();
const router = useRouter();

// 반응형 데이터
const assignment = ref(null);
const submissionContent = ref("");
const selectedFiles = ref([]);
const submittedAssignment = ref(null);
const evaluation = ref(null);
const fileInput = ref(null);

// 상수 데이터
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

// 계산된 속성들
const backButtonText = computed(() => "목록으로 돌아가기");

const assignmentTypeBadge = computed(() => "🎯 일반 과제");

const dueDateText = computed(() =>
  assignment.value ? `마감일: ${formatDate(assignment.value.dueDate)}` : ""
);

const assignmentInfoItems = computed(() => [
  {
    key: "period",
    label: "📅 과제 기간",
    value: assignment.value
      ? `${formatDate(assignment.value.dueDate)}까지`
      : "",
  },
  {
    key: "content",
    label: "📝 과제 내용",
    value: null,
  },
]);

const statusClass = computed(() => "always");
const statusText = computed(() => "🏃 진행중");

const teacherMessageTitle = computed(() => "선생님 메시지");

const submissionCardTitle = computed(() => "🐣 과제 제출하기");

const privacyNoticeText = computed(
  () =>
    "💡 게시 자료는 공개될 수 있으니, 개인정보가 포함되지 않도록 유의해주세요."
);

const contentLabel = computed(() => "✏️ 내용");
const contentPlaceholder = computed(() => "과제 내용을 입력해주세요...");

const attachmentLabel = computed(() => "📎 첨부파일");

const fileSelectText = computed(() => "파일 선택");
const dragDropText = computed(() => "또는 파일을 여기로 드래그하세요.");

const hasSelectedFiles = computed(() => selectedFiles.value.length > 0);

const canSubmit = computed(
  () => submissionContent.value.trim() || selectedFiles.value.length > 0
);

const submitButtonText = computed(() => "🐥 제출하기");

const submittedCardTitle = computed(() => "✅ 내가 제출한 과제");

const submittedInfoItems = computed(() => {
  if (!submittedAssignment.value) return [];

  const items = [
    {
      key: "date",
      label: "📅 제출일",
      value: submittedAssignment.value.submissionDate,
    },
    {
      key: "content",
      label: "📝 내용",
      value: null,
    },
  ];

  if (submittedAssignment.value.files.length > 0) {
    items.push({
      key: "files",
      label: "📎 첨부파일",
      value: null,
    });
  }

  return items;
});

const evaluationCardTitle = computed(() => "⭐ 선생님 평가");
const feedbackLabel = computed(() => "💬 피드백");
const teacherName = computed(() => "선생님");

const loadingText = computed(() => "과제 정보를 불러오는 중입니다...");

// 유틸리티 함수들
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 액션 메서드들
const goBackToList = () => {
  router.push("/assignment");
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  addFiles(files);
};

const handleFileDrop = (event) => {
  const files = Array.from(event.dataTransfer.files);
  addFiles(files);
};

const addFiles = (files) => {
  const maxFiles = 5;
  if (selectedFiles.value.length + files.length > maxFiles) {
    alert(`파일은 최대 ${maxFiles}개까지 등록할 수 있습니다.`);
    return;
  }
  selectedFiles.value.push(...files);
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const submitAssignment = () => {
  if (!canSubmit.value) {
    alert("내용을 입력하거나 파일을 첨부해주세요!");
    return;
  }

  const now = new Date();
  submittedAssignment.value = {
    content: submissionContent.value,
    files: [...selectedFiles.value],
    submissionDate: now.toLocaleDateString("ko-KR"),
  };

  // 3초 후 선생님 피드백 표시
  setTimeout(() => {
    evaluation.value = {
      feedback:
        "정말 잘했어요! 꼼꼼하게 과제를 해결했네요. 다음 과제도 기대할게요! 👍",
      date: now.toLocaleDateString("ko-KR"),
    };
  }, 3000);

  alert("🐥 과제가 성공적으로 제출되었습니다!");
};

// 라이프사이클 훅
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
</script>

<style scoped>
/* 전역 스타일 */
.assignment-submission-app {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  min-height: 100vh;
  color: #333;
}

.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

/* 뒤로가기 버튼 */
.back-to-list-btn {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 15px;
  padding: 0.8rem 1.5rem;
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
  border-color: #ffdd29;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.2);
}

/* 공통 카드 스타일 */
.assignment-card,
.submission-card,
.submitted-card,
.evaluation-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
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

/* 과제 정보 카드 */
.assignment-type-badge {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 1rem;
}

.assignment-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #8c6d32;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.assignment-meta {
  color: #ffb74d;
  font-size: 0.9rem;
  font-weight: 600;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-label {
  min-width: 120px;
  font-weight: 700;
  color: #ff9800;
  font-size: 1rem;
}

.info-value {
  flex: 1;
  color: #8c6d32;
}

.status-badge {
  background: #fff5d6;
  color: #f57c00;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.75rem;
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
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.teacher-icon {
  font-size: 1.3rem;
}

.message-title {
  font-weight: 700;
  color: #f57c00;
  font-size: 1rem;
}

.message-content {
  color: #8c6d32;
  line-height: 1.7;
  font-size: 0.95rem;
}

/* 개인정보 안내 */
.privacy-notice {
  background: #fff9e6;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  color: #f57c00;
  line-height: 1.5;
  border: 2px dashed #ffe066;
}

/* 폼 스타일 */
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
  padding: 1rem 1.2rem;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 150px;
  background: white;
  transition: all 0.3s ease;
}

.submission-editor:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.1);
}

/* 파일 업로드 */
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
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.1);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 2.5rem;
}

.upload-text {
  color: #8c6d32;
  font-size: 0.95rem;
  margin: 0;
}

.file-select-btn {
  background: linear-gradient(135deg, #ffdd29, #ffb74d);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 0.5rem;
}

.file-select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(255, 221, 41, 0.3);
}

.file-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 15px;
  background: white;
  border: 2px solid #fff5d6;
  transition: all 0.3s ease;
}

.file-item:hover {
  border-color: #ffe066;
  box-shadow: 0 2px 8px rgba(255, 221, 41, 0.1);
}

.file-icon {
  font-size: 1.2rem;
}

.file-name {
  flex: 1;
  font-weight: 600;
  color: #8c6d32;
}

.file-size {
  color: #ffb74d;
  font-size: 0.9rem;
}

.file-remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.file-remove-btn:hover {
  background: #ffebee;
  transform: scale(1.1);
}

/* 제출 버튼 */
.submit-button-area {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #fff5d6;
}

.submit-btn {
  background: linear-gradient(135deg, #ffdd29, #ffb74d);
  color: white;
  border: none;
  padding: 1.2rem 2.5rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.submit-btn:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.submit-btn.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 제출된 과제 카드 */
.submitted-card {
  background: linear-gradient(135deg, #f0fff0, #e8f5e8);
  border-color: #c8e6c9;
}

.submitted-card .card-title {
  color: #2e7d32;
}

.submitted-content {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  white-space: pre-wrap;
  line-height: 1.7;
  border: 2px solid #e8f5e9;
  color: #2e7d32;
}

.submitted-files {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.submitted-file {
  background: white;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid #e8f5e9;
  font-weight: 600;
  color: #2e7d32;
}

/* 평가 카드 */
.evaluation-card {
  background: linear-gradient(135deg, #fff8e1, #fff3e0);
  border-color: #ffcc80;
}

.evaluation-card .card-title {
  color: #e65100;
}

.teacher-feedback {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #ffe0b2;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #fff3e0;
}

.teacher-avatar {
  font-size: 1.3rem;
}

.teacher-name {
  font-weight: 700;
  color: #e65100;
}

.feedback-date {
  color: #ff8f00;
  font-size: 0.9rem;
  margin-left: auto;
}

.feedback-message {
  color: #bf360c;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.1);
}

.loading-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;
}

.loading-text {
  color: #ff9800;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .assignment-card,
  .submission-card,
  .submitted-card,
  .evaluation-card {
    padding: 1.5rem;
  }

  .info-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-label {
    min-width: auto;
  }

  .assignment-title {
    font-size: 1.5rem;
  }

  .file-drop-zone {
    padding: 1.5rem;
  }

  .upload-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .assignment-title {
    font-size: 1.3rem;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .file-item {
    padding: 0.75rem;
  }

  .submit-btn {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .back-to-list-btn {
    padding: 0.7rem 1.2rem;
    font-size: 0.85rem;
  }
}
</style>
