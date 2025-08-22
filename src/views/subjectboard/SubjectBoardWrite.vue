<template>
  <Header />
  <div class="subject-board-write-page">
    <div class="write-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">
            ✍️ {{ isEditMode ? "게시글 수정" : "새 글 작성" }}
          </h1>
          <p class="page-subtitle">우리 반 학습자료와 공지사항을 작성해요!</p>
        </div>
      </div>

      <!-- 작성 폼 -->
      <form @submit.prevent="submitPost" class="write-form">
        <!-- 제목 입력 -->
        <div class="form-group">
          <label for="title" class="form-label">📝 제목</label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            placeholder="제목을 입력해주세요"
            class="form-input title-input"
            required
            maxlength="100"
          />
        </div>

        <!-- 공지사항 체크박스 -->
        <div class="form-group" v-if="isTeacher">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="form.isPinned" />
            <span class="checkbox-text"
              >📌 공지사항으로 등록 (상단에 고정됩니다)</span
            >
          </label>
        </div>

        <!-- 내용 입력 -->
        <div class="form-group">
          <label for="content" class="form-label">📖 내용</label>
          <textarea
            id="content"
            v-model="form.content"
            placeholder="내용을 입력해주세요"
            class="form-textarea"
            rows="10"
            required
          ></textarea>
        </div>

        <!-- 파일 첨부 -->
        <div class="form-group">
          <label class="form-label">📎 파일 첨부</label>
          <div class="file-upload-area" @drop="handleDrop" @dragover.prevent>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              multiple
              class="file-input"
              accept=".pdf,.doc,.docx,.hwp,.png,.jpg,.jpeg,.gif,.mp3,.mp4"
            />
            <button
              type="button"
              @click="$refs.fileInput.click()"
              class="file-select-btn"
            >
              📁 파일 선택
            </button>
            <p class="file-guide">파일을 선택하거나 여기로 드래그해주세요</p>
          </div>

          <!-- 기존 파일 목록 (수정 시에만) -->
          <div v-if="existingFiles.length > 0" class="existing-files">
            <h4 class="file-list-title">기존 첨부파일</h4>
            <div class="file-list">
              <div
                v-for="(file, index) in existingFiles"
                :key="`existing-${file.attachmentId || file.id || index}`"
                class="file-item existing"
                :class="{ 'marked-delete': file.markedForDelete }"
              >
                <span class="file-info">
                  📄 {{ file.originalName }}
                  <small class="file-size"
                    >({{ formatFileSize(file.size) }})</small
                  >
                </span>
                <button
                  type="button"
                  @click="markForDeletion(file.attachmentId || file.id, index)"
                  :class="[
                    'file-delete-btn',
                    { 'marked-delete': file.markedForDelete },
                  ]"
                >
                  {{ file.markedForDelete ? "↩️ 복원" : "🗑️ 삭제" }}
                </button>
              </div>
            </div>
          </div>

          <!-- 새로 선택한 파일 목록 -->
          <div v-if="newFiles.length > 0" class="new-files">
            <h4 class="file-list-title">새 첨부파일</h4>
            <div class="file-list">
              <div
                v-for="(file, index) in newFiles"
                :key="'new-' + index"
                class="file-item new"
              >
                <span class="file-info"> 📄 {{ file.name }} </span>
                <button
                  type="button"
                  @click="removeNewFile(index)"
                  class="file-delete-btn"
                >
                  ❌ 제거
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 버튼 그룹 -->
        <div class="button-group">
          <button type="button" @click="goBack" class="btn btn-cancel">
            🔙 취소
          </button>
          <button type="submit" :disabled="isSubmitting" class="btn btn-submit">
            {{
              isSubmitting
                ? "⏳ 저장중..."
                : isEditMode
                ? "✅ 수정하기"
                : "📝 등록하기"
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
  <footer class="footer">
    <Footer></Footer>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Header from "@/components/common/Header.vue";
import Footer from "@/components/common/Footer.vue";
import apiClient from "@/utils/apiClient";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isTeacher = computed(() => {
  return (
    authStore.tokenInfo?.role === "teacher" ||
    localStorage.getItem("userType") === "teacher"
  );
});

const isEditMode = computed(() => {
  return route.params.id !== "new" && route.params.id !== undefined;
});

const isSubmitting = ref(false);

// 폼 데이터
const form = ref({
  title: "",
  content: "",
  isPinned: false,
});

// 파일 관련
const newFiles = ref([]);
const existingFiles = ref([]);
const fileInput = ref(null);

// 현재 사용자 정보
const currentUser = ref({
  classroomTeacherNo: authStore.tokenInfo?.classroomTeacherNo,
  classroomNo: authStore.tokenInfo?.classroomNo,
});

onMounted(() => {
  if (!isTeacher.value) {
    alert("선생님만 게시글을 작성할 수 있습니다.");
    goBack();
    return;
  }

  if (isEditMode.value) {
    loadExistingPost();
  }
});

// 기존 게시글 로드 (수정 모드)
const loadExistingPost = async () => {
  try {
    const data = await apiClient.get(`/subject-board/view/${route.params.id}`);

    console.log("수정할 게시글 데이터:", data);

    form.value = {
      title: data.sbTitle,
      content: data.sbContent,
      isPinned: data.isPinned || false,
    };

    // 기존 첨부파일 로드
    if (data.attachments) {
      existingFiles.value = data.attachments.map((file) => ({
        ...file,
        markedForDelete: false,
        attachmentId: file.attachNo,
      }));
    }
  } catch (error) {
    console.error("게시글 로드 실패:", error);
    alert("게시글을 불러오는데 실패했습니다.");
    goBack();
  }
};

// 파일 선택 처리
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  addNewFiles(files);
  event.target.value = "";
};

// 드래그 앤 드롭 처리
const handleDrop = (event) => {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);
  addNewFiles(files);
};

// 새 파일 추가
const addNewFiles = (files) => {
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/haansofthwp",
    "image/png",
    "image/jpeg",
    "image/gif",
    "audio/mpeg",
    "video/mp4",
  ];

  files.forEach((file) => {
    if (file.size > maxFileSize) {
      alert(`파일 크기가 너무 큽니다: ${file.name} (최대 10MB)`);
      return;
    }

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.toLowerCase().includes(".hwp")
    ) {
      alert(`지원하지 않는 파일 형식입니다: ${file.name}`);
      return;
    }

    // 중복 체크
    const isDuplicate = newFiles.value.some(
      (f) => f.name === file.name && f.size === file.size
    );

    if (!isDuplicate) {
      newFiles.value.push(file);
    }
  });
};

// 새 파일 제거
const removeNewFile = (index) => {
  newFiles.value.splice(index, 1);
};

// 기존 파일 삭제 마킹
const markForDeletion = (fileId, index) => {
  console.log("markForDeletion 호출:", {
    fileId,
    index,
    existingFiles: existingFiles.value,
  });

  // 인덱스를 사용한 직접 접근 방식
  if (index !== undefined && index >= 0 && index < existingFiles.value.length) {
    existingFiles.value[index].markedForDelete =
      !existingFiles.value[index].markedForDelete;
    console.log("삭제 마킹 완료:", existingFiles.value[index]);
  } else {
    // ID를 사용한 검색 방식 (백업)
    const file = existingFiles.value.find(
      (f) =>
        (f.attachmentId && f.attachmentId === fileId) ||
        (f.id && f.id === fileId)
    );
    if (file) {
      file.markedForDelete = !file.markedForDelete;
      console.log("ID로 삭제 마킹 완료:", file);
    } else {
      console.error("파일을 찾을 수 없습니다:", fileId);
    }
  }

  // 삭제 예정 파일 목록 업데이트
  updateDeleteAttachments();
};

// 삭제할 첨부파일 ID 목록 업데이트
const updateDeleteAttachments = () => {
  const deleteIds = existingFiles.value
    .filter((file) => file.markedForDelete)
    .map((file) => file.attachmentId || file.id);

  console.log("삭제 예정 첨부파일 IDs:", deleteIds);
};

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 게시글 제출
const submitPost = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  try {
    let boardNo;

    if (isEditMode.value) {
      // 수정 모드
      boardNo = parseInt(route.params.id);
      await updatePost(boardNo);
      console.log("게시글 수정 완료, boardNo:", boardNo);
    } else {
      // 등록 모드
      boardNo = await createPost();
      console.log("게시글 생성 완료, boardNo:", boardNo);
    }

    // 파일 업로드 처리
    if (newFiles.value.length > 0) {
      console.log("파일 업로드 프로세스 시작");
      await uploadFiles(boardNo);
      console.log("파일 업로드 프로세스 완료");
    }

    alert(
      isEditMode.value ? "게시글이 수정되었습니다!" : "게시글이 등록되었습니다!"
    );
    goBack();
  } catch (error) {
    console.error("게시글 저장 상세 에러:", error);
    alert(`게시글 저장에 실패했습니다: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

// 새 게시글 생성
const createPost = async () => {
  const boardData = {
    title: form.value.title,
    content: form.value.content,
    focusType: form.value.isPinned,
    classroomNo: currentUser.value.classroomNo,
    classroomTeacherNo: currentUser.value.classroomTeacherNo,
    deleteAttachments: [],
  };

  console.log("게시글 생성 요청 데이터:", boardData);

  const response = await apiClient.post("/subject-board", boardData);

  console.log("게시글 생성 응답:", response);

  // 응답에서 boardNo 추출
  return response.boardNo || response;
};

// 게시글 수정
const updatePost = async (boardNo) => {
  const deleteAttachmentIds = existingFiles.value
    .filter((file) => file.markedForDelete)
    .map((file) => file.attachNo);

  const boardData = {
    title: form.value.title,
    content: form.value.content,
    focusType: form.value.isPinned,
    classroomNo: currentUser.value.classroomNo,
    classroomTeacherNo: currentUser.value.classroomTeacherNo,
    deleteAttachments: deleteAttachmentIds,
  };

  console.log("게시글 수정 요청 데이터:", boardData);

  const response = await apiClient.put(`/subject-board/${boardNo}`, boardData);

  console.log("게시글 수정 응답:", response);
};

// 파일 업로드
const uploadFiles = async (boardNo) => {
  const failedFiles = [];

  console.log(`총 ${newFiles.value.length}개 파일 업로드 시작`);

  for (let i = 0; i < newFiles.value.length; i++) {
    const file = newFiles.value[i];
    console.log(
      `파일 ${i + 1}/${newFiles.value.length} 업로드 시작:`,
      file.name
    );

    try {
      // 1. Presigned URL 요청
      console.log("Presigned URL 요청...");
      const presignedResponse = await apiClient.post("/presigned-url/upload", {
        boardNo: boardNo,
        boardType: "SUBJECT",
        originalName: file.name,
      });

      console.log("Presigned URL 응답:", presignedResponse);
      const { presignedUrl, savedName, s3Key } = presignedResponse;

      // 2. S3에 실제 파일 업로드
      console.log("S3 업로드 시작...");
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        console.error(
          "S3 업로드 실패:",
          uploadRes.status,
          uploadRes.statusText
        );
        throw new Error("S3 업로드 실패");
      }
      console.log("S3 업로드 성공");

      // 3. 메타데이터 등록
      console.log("메타데이터 저장 시작...");
      const attachmentResponse = await apiClient.post(
        "/presigned-url/attachment",
        {
          boardNo: boardNo,
          boardType: "SUBJECT",
          originalName: file.name,
          savedName: savedName,
          s3Key: s3Key,
        }
      );

      console.log("메타데이터 저장 성공:", attachmentResponse);
    } catch (err) {
      console.error(`파일 업로드 실패: ${file.name}`, err);
      failedFiles.push(file);
    }
  }

  if (failedFiles.length > 0) {
    console.error(
      "업로드 실패한 파일들:",
      failedFiles.map((f) => f.name)
    );
    throw new Error(
      `일부 파일 업로드에 실패했습니다: ${failedFiles
        .map((f) => f.name)
        .join(", ")}`
    );
  }

  console.log("모든 파일 업로드 완료");
};

// 뒤로가기
const goBack = () => {
  router.push({ name: "SubjectBoardList" });
};
</script>

<style scoped>
/* 전역 폰트 및 배경 설정 */
.subject-board-write-page {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.write-container {
  max-width: 900px;
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

/* 작성 폼 */
.write-form {
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.1);
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #ffe066;
  border-radius: 15px;
  font-size: 1rem;
  background: #fffbf0;
  color: #8c6d32;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.1);
}

.title-input {
  font-weight: 600;
}

.form-textarea {
  resize: vertical;
  min-height: 200px;
}

/* 체크박스 */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 1rem;
  font-weight: 600;
  color: #ff9800;
}

/* 파일 업로드 영역 */
.file-upload-area {
  border: 2px dashed #ffe066;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  background: #fffbf0;
  transition: all 0.2s ease;
}

.file-upload-area:hover {
  border-color: #ffdd29;
  background: #fff9e6;
}

.file-input {
  display: none;
}

.file-select-btn {
  background: #ffdd29;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.file-select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.file-guide {
  color: #ffb74d;
  font-size: 0.9rem;
  margin: 0;
}

/* 파일 목록 */
.existing-files,
.new-files {
  margin-top: 1rem;
}

.file-list-title {
  font-size: 1rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.5rem;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.file-item.existing {
  background: #f3e5f5;
  border: 1px solid #e1bee7;
}

.file-item.new {
  background: #e8f5e8;
  border: 1px solid #c8e6c9;
}

.file-item.existing.marked-delete {
  opacity: 0.5;
  text-decoration: line-through;
}

.file-info {
  flex: 1;
  font-weight: 600;
  color: #5d4037;
}

.file-size {
  color: #9e9e9e;
  font-weight: normal;
}

.file-delete-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-delete-btn:hover {
  background: #ff5252;
  transform: translateY(-1px);
}

.file-delete-btn.marked-delete {
  background: #4caf50;
}

.file-delete-btn.marked-delete:hover {
  background: #45a049;
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #fff5d6;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-cancel {
  background: #fff5d6;
  color: #ff9800;
  border: 2px solid #ffe066;
}

.btn-cancel:hover {
  background: #ffe066;
  transform: translateY(-2px);
}

.btn-submit {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .subject-board-write-page {
    padding: 1rem;
  }

  .write-form {
    padding: 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .file-item {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .file-delete-btn {
    align-self: flex-end;
  }
}
</style>
