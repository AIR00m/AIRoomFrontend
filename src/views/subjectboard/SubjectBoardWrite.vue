<template>
  <Header />
  <div class="board-write-page">
    <div class="write-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            {{ isEditMode ? "✏️ 게시글 수정하기" : "✍️ 새 글 작성하기" }}
          </h1>
          <p class="page-subtitle">
            학생들과 공유할 학습자료나 공지사항을 올려주세요!
          </p>
        </div>
        <div class="header-actions">
          <button @click="goBack" class="btn btn-secondary">❌ 취소</button>
          <button
            @click="savePost"
            class="btn btn-primary"
            :disabled="isSaving"
          >
            {{ isSaving ? "저장 중..." : "💾 저장하기" }}
          </button>
        </div>
      </div>

      <!-- 안내 상자 -->
      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <ul class="notice-list">
          <li>학생들이 이해하기 쉽게 명확하고 친근한 언어로 작성해주세요.</li>
          <li>
            게시 자료는 공개될 수 있으니, 개인정보가 포함되지 않도록
            유의해주세요.
          </li>
          <li>첨부파일은 학습에 도움이 되는 자료만 업로드해주세요.</li>
        </ul>
      </div>

      <!-- 작성 폼 -->
      <div class="write-form">
        <div class="form-section">
          <!-- 상단 고정 옵션 -->
          <div class="form-group">
            <div class="pin-option">
              <input
                id="pin-post"
                v-model="formData.isPinned"
                type="checkbox"
                class="pin-checkbox"
              />
              <label for="pin-post" class="pin-label">
                📌 상단에 고정 (중요한 공지사항일 때 체크해주세요)
              </label>
            </div>
          </div>

          <!-- 제목 입력 -->
          <div class="form-group">
            <label for="post-title" class="form-label required">
              📝 제목
            </label>
            <input
              id="post-title"
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="학생들이 알아보기 쉬운 제목을 입력해주세요 (예: 📚 새 학습자료, 📢 중요 공지사항)"
              maxlength="100"
              @input="validateTitle"
            />
            <div class="input-info">
              <span class="char-count">{{ formData.title.length }}/100</span>
              <span v-if="titleError" class="error-text">{{ titleError }}</span>
            </div>
          </div>

          <!-- 내용 입력 -->
          <div class="form-group">
            <label for="post-content" class="form-label required">
              📄 내용
            </label>
            <textarea
              id="post-content"
              v-model="formData.content"
              class="form-textarea"
              placeholder="학생들에게 전달하고 싶은 내용을 자세히 적어주세요.&#10;&#10;예시:&#10;• 오늘 배운 내용을 복습할 수 있는 자료입니다&#10;• 과제 제출 기한은 8월 20일까지입니다&#10;• 궁금한 점이 있으면 언제든 댓글로 질문해주세요!"
              rows="12"
              @input="validateContent"
            ></textarea>
            <div class="input-info">
              <span class="char-count">{{ formData.content.length }}/2000</span>
              <span v-if="contentError" class="error-text">{{
                contentError
              }}</span>
            </div>
          </div>

          <!-- 첨부파일 -->
          <div class="form-group">
            <label for="file-upload" class="form-label"> 📎 첨부파일 </label>
            <div class="file-upload-area">
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.hwp,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                @change="handleFileUpload"
                class="file-input-hidden"
              />
              <label for="file-upload" class="file-upload-button">
                📁 파일 선택하기
              </label>
              <div class="file-upload-info">
                <p class="upload-hint">
                  PDF, 워드, 한글, PPT, 엑셀, 이미지, 압축파일을 업로드할 수
                  있어요
                </p>
                <p class="upload-limit">
                  파일당 최대 10MB, 총 5개까지 첨부 가능
                </p>
              </div>
            </div>

            <!-- 첨부된 파일 목록 -->
            <div v-if="formData.files.length > 0" class="attached-files">
              <h4 class="attached-title">
                첨부된 파일 ({{ formData.files.length }}/5)
              </h4>
              <div class="file-list">
                <div
                  v-for="(file, index) in formData.files"
                  :key="index"
                  class="file-item"
                >
                  <div class="file-info">
                    <span class="file-icon">{{ getFileIcon(file.name) }}</span>
                    <div class="file-details">
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size">{{
                        formatFileSize(file.size)
                      }}</span>
                    </div>
                  </div>
                  <button
                    @click="removeFile(index)"
                    class="file-remove-btn"
                    type="button"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 저장 버튼 (하단) -->
        <div class="form-actions">
          <button @click="goBack" class="btn btn-secondary btn-large">
            ❌ 취소하기
          </button>
          <button
            @click="savePost"
            class="btn btn-primary btn-large"
            :disabled="isSaving"
          >
            {{
              isSaving
                ? "저장 중..."
                : isEditMode
                ? "💾 수정 완료"
                : "💾 게시글 작성"
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Header from "@/components/common/Header.vue";

const router = useRouter();
const route = useRoute();

// 상태 관리
const isSaving = ref(false);
const titleError = ref("");
const contentError = ref("");

// 수정 모드 확인
const isEditMode = computed(() => {
  return route.params.id && route.params.id !== "new";
});

// 폼 데이터
const formData = reactive({
  title: "",
  content: "",
  files: [],
  isPinned: false,
  id: null,
});

// 컴포넌트 마운트 시 실행
onMounted(() => {
  if (isEditMode.value) {
    loadPostForEdit();
  }
});

// 기존 게시글 불러오기 (수정 모드)
const loadPostForEdit = async () => {
  try {
    const postId = route.params.id;
    // 실제로는 API 호출이지만, 여기서는 더미 데이터 사용
    const existingPost = getPostById(postId);

    if (existingPost) {
      formData.id = existingPost.id;
      formData.title = existingPost.title;
      formData.content = existingPost.content;
      formData.isPinned = existingPost.isPinned;
      formData.files = [...existingPost.files]; // 기존 첨부파일 복사
    }
  } catch (error) {
    console.error("게시글 불러오기 실패:", error);
    alert("게시글을 불러오는데 실패했습니다. 다시 시도해주세요.");
    goBack();
  }
};

// 더미 데이터에서 게시글 찾기 (실제로는 API 호출)
const getPostById = (id) => {
  const posts = [
    {
      id: 1,
      title: "🏆 8월의 칭찬학생을 발표합니다!",
      content:
        "8월 한달간 가장 열심히 공부한 김병아 학생을 칭찬합니다!\n\n모든 학생들이 열심히 했지만, 특히 매일 과제를 빠짐없이 제출하고 수업시간에도 적극적으로 참여한 김병아 학생을 이번 달 칭찬학생으로 선정합니다.\n\n다른 학생들도 다음 달에는 더욱 열심히 해서 칭찬받을 수 있기를 바라요! 🎉",
      isPinned: true,
      files: [{ name: "칭찬스티커.png", size: 1024000 }],
    },
    {
      id: 2,
      title: "📢 여름방학 숙제 안내",
      content:
        "여름방학 동안 해야 할 숙제를 안내드립니다.\n\n1. 수학 문제집 30-50페이지\n2. 독후감 2편 (책은 자유선택)\n3. 과학 관찰일기 작성\n\n모든 숙제는 개학 첫 주에 제출해주세요.\n궁금한 점이 있으면 언제든 연락주세요!",
      isPinned: true,
      files: [
        { name: "여름방학숙제목록.pdf", size: 2048000 },
        { name: "독후감양식.hwp", size: 512000 },
      ],
    },
  ];

  return posts.find((post) => post.id == id);
};

// 유효성 검사
const validateTitle = () => {
  if (!formData.title.trim()) {
    titleError.value = "제목을 입력해주세요.";
    return false;
  } else if (formData.title.length > 100) {
    titleError.value = "제목은 100자 이내로 입력해주세요.";
    return false;
  } else {
    titleError.value = "";
    return true;
  }
};

const validateContent = () => {
  if (!formData.content.trim()) {
    contentError.value = "내용을 입력해주세요.";
    return false;
  } else if (formData.content.length > 2000) {
    contentError.value = "내용은 2000자 이내로 입력해주세요.";
    return false;
  } else {
    contentError.value = "";
    return true;
  }
};

// 파일 업로드 처리
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);

  // 파일 개수 체크
  if (formData.files.length + files.length > 5) {
    alert("첨부파일은 최대 5개까지만 업로드 가능합니다.");
    return;
  }

  // 파일 크기 체크
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      alert(
        `'${file.name}' 파일이 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.`
      );
      return;
    }
  }

  // 중복 파일 체크
  const existingFileNames = formData.files.map((file) => file.name);
  const duplicateFiles = files.filter((file) =>
    existingFileNames.includes(file.name)
  );

  if (duplicateFiles.length > 0) {
    alert(
      `이미 업로드된 파일이 있습니다: ${duplicateFiles
        .map((f) => f.name)
        .join(", ")}`
    );
    return;
  }

  // 파일 추가
  formData.files.push(...files);

  // 입력 필드 초기화
  event.target.value = "";
};

// 파일 제거
const removeFile = (index) => {
  formData.files.splice(index, 1);
};

// 파일 아이콘 결정
const getFileIcon = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();
  const iconMap = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    hwp: "📝",
    ppt: "📊",
    pptx: "📊",
    xls: "📈",
    xlsx: "📈",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    zip: "🗜️",
    rar: "🗜️",
  };
  return iconMap[extension] || "📎";
};

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 게시글 저장
const savePost = async () => {
  // 유효성 검사
  if (!validateTitle() || !validateContent()) {
    return;
  }

  isSaving.value = true;

  try {
    // 실제로는 API 호출
    const postData = {
      ...formData,
      author: "선생님",
      createdAt: isEditMode.value
        ? formData.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: isEditMode.value ? formData.views : 0,
      commentCount: isEditMode.value ? formData.commentCount : 0,
    };

    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("저장된 게시글:", postData);

    alert(
      isEditMode.value
        ? "게시글이 성공적으로 수정되었습니다! 🎉"
        : "새 게시글이 성공적으로 작성되었습니다! 🎉"
    );

    // 목록으로 돌아가기
    router.push({ name: "SubjectBoard" });
  } catch (error) {
    console.error("저장 실패:", error);
    alert("게시글 저장에 실패했습니다. 다시 시도해주세요.");
  } finally {
    isSaving.value = false;
  }
};

// 뒤로 가기
const goBack = () => {
  if (hasUnsavedChanges()) {
    if (confirm("작성 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
      router.back();
    }
  } else {
    router.back();
  }
};

// 저장되지 않은 변경사항 확인
const hasUnsavedChanges = () => {
  if (isEditMode.value) {
    // 수정 모드에서는 원본 데이터와 비교
    return false; // 간단히 구현, 실제로는 원본과 비교 필요
  } else {
    // 새 글 작성 모드에서는 내용이 있는지 확인
    return (
      formData.title.trim() ||
      formData.content.trim() ||
      formData.files.length > 0
    );
  }
};
</script>

<style scoped>
/* 전역 스타일 */
.board-write-page {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.write-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* 페이지 헤더 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 3px solid #fff5d6;
}

.header-left h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ff9800;
  margin: 0 0 0.5rem 0;
}

.header-left p {
  font-size: 1.1rem;
  color: #ffb74d;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* 버튼 스타일 */
.btn {
  border: none;
  padding: 12px 24px;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 221, 41, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #fff5d6;
  color: #ff9800;
  border: 2px solid #ffe066;
}

.btn-secondary:hover {
  background: #ffe066;
}

.btn-large {
  padding: 15px 30px;
  font-size: 1.1rem;
}

/* 안내 상자 */
.notice-box {
  background: #fffbf0;
  border: 2px dashed #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
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
  margin: 0;
}

/* 작성 폼 */
.write-form {
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.1);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff9800;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label.required::after {
  content: "*";
  color: #f44336;
  font-size: 1.2rem;
}

/* 상단 고정 옵션 */
.pin-option {
  background: #fff9e6;
  border: 2px solid #ffe066;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pin-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #ffdd29;
}

.pin-label {
  font-size: 1rem;
  color: #ff9800;
  font-weight: 600;
  cursor: pointer;
  margin: 0;
}

/* 입력 필드 */
.form-input,
.form-textarea {
  padding: 15px 20px;
  border: 3px solid #fff5d6;
  border-radius: 15px;
  font-size: 1rem;
  font-family: inherit;
  color: #5d4037;
  background: #fffef9;
  transition: all 0.3s ease;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ffdd29;
  background: white;
  box-shadow: 0 0 0 4px rgba(255, 221, 41, 0.1);
}

.form-textarea {
  min-height: 200px;
  line-height: 1.6;
}

/* 입력 정보 */
.input-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.char-count {
  color: #a37800;
}

.error-text {
  color: #f44336;
  font-weight: 600;
}

/* 파일 업로드 */
.file-upload-area {
  border: 3px dashed #ffe066;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  background: #fffbf0;
  transition: all 0.3s ease;
}

.file-upload-area:hover {
  border-color: #ffdd29;
  background: #fff9e6;
}

.file-input-hidden {
  display: none;
}

.file-upload-button {
  display: inline-block;
  background: #ffdd29;
  color: white;
  padding: 12px 24px;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.file-upload-button:hover {
  background: #ffc729;
  transform: translateY(-2px);
}

.file-upload-info {
  margin-top: 1rem;
  color: #a37800;
}

.upload-hint {
  font-size: 0.95rem;
  margin: 0 0 0.25rem 0;
}

.upload-limit {
  font-size: 0.85rem;
  color: #ffb74d;
  margin: 0;
}

/* 첨부된 파일 목록 */
.attached-files {
  margin-top: 1.5rem;
}

.attached-title {
  font-size: 1rem;
  color: #ff9800;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  background: #fff9e6;
  border: 2px solid #fff5d6;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: #ffe066;
  transform: translateX(5px);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.file-icon {
  font-size: 1.5rem;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 600;
  color: #5d4037;
  font-size: 0.95rem;
}

.file-size {
  color: #a37800;
  font-size: 0.85rem;
}

.file-remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.file-remove-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* 폼 액션 */
.form-actions {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #fff5d6;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .board-write-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .write-form {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-large {
    width: 100%;
    justify-content: center;
  }

  .file-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .file-info {
    justify-content: space-between;
  }

  .file-remove-btn {
    align-self: flex-end;
  }
}
</style>
