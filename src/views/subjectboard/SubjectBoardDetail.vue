<template>
  <Header />
  <div class="board-detail-page">
    <div class="detail-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="header-left">
          <button @click="goBack" class="btn btn-back">◀️ 목록으로</button>
          <div class="header-info">
            <h1 class="page-title">📖 게시글 상세보기</h1>
            <p class="page-subtitle">게시글 내용을 자세히 확인해보세요!</p>
          </div>
        </div>
        <div v-if="isTeacher && post" class="header-actions">
          <button @click="editPost" class="btn btn-secondary">
            ✏️ 수정하기
          </button>
          <button @click="deletePost" class="btn btn-danger">
            🗑️ 삭제하기
          </button>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">⏳</div>
        <p class="loading-text">게시글을 불러오고 있어요...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h3>데이터를 불러올 수 없습니다</h3>
        <p>{{ error }}</p>
        <button @click="fetchPostDetail" class="retry-btn">다시 시도</button>
      </div>

      <!-- 게시글이 없을 때 -->
      <div v-else-if="!post" class="error-state">
        <div class="error-icon">😥</div>
        <h3 class="error-title">게시글을 찾을 수 없어요</h3>
        <p class="error-description">
          삭제되었거나 존재하지 않는 게시글입니다.
        </p>
        <button @click="goBack" class="btn btn-primary">
          목록으로 돌아가기
        </button>
      </div>

      <!-- 게시글 내용 -->
      <div v-else class="post-content">
        <!-- 게시글 헤더 -->
        <div class="post-header">
          <div class="post-meta">
            <div class="post-title-section">
              <span v-if="post.isPinned" class="pinned-badge">📌 공지사항</span>
              <h2 class="post-title">{{ post.sbTitle }}</h2>
            </div>
            <div class="post-info">
              <div class="info-item">
                <span class="info-label">✍️ 작성자</span>
                <span class="info-value">{{ post.writerName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 작성일</span>
                <span class="info-value">{{
                  formatDateTime(post.createdAt)
                }}</span>
              </div>
              <div
                v-if="post.updatedAt && post.updatedAt !== post.createdAt"
                class="info-item"
              >
                <span class="info-label">🔄 수정일</span>
                <span class="info-value">{{
                  formatDateTime(post.updatedAt)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 게시글 본문 -->
        <div class="post-body">
          <div class="content-wrapper">
            <div class="post-text" v-html="formatContent(post.sbContent)"></div>
          </div>
        </div>

        <!-- 첨부파일 섹션 -->
        <div
          v-if="post.attachments && post.attachments.length > 0"
          class="attachments-section"
        >
          <div class="attachments-header">
            <h3 class="attachments-title">
              📎 첨부파일 ({{ post.attachments.length }}개)
            </h3>
            <button
              @click="downloadAllFiles(post.attachments)"
              class="btn btn-download-all"
              :disabled="downloadingAll"
            >
              {{ downloadingAll ? "⏳ 다운로드 중..." : "📥 전체 다운로드" }}
            </button>
          </div>

          <div class="attachments-list">
            <div
              v-for="(file, index) in post.attachments"
              :key="index"
              class="attachment-item"
            >
              <div class="attachment-info">
                <span class="attachment-icon">{{
                  getFileIcon(file.originalName)
                }}</span>
                <div class="attachment-details">
                  <span class="attachment-name">{{ file.originalName }}</span>
                  <!-- <span class="attachment-size">{{
                    formatFileSize(file.size)
                  }}</span> -->
                </div>
              </div>
              <button
                @click="downloadFile(file)"
                class="download-btn"
                :disabled="downloading[file.s3Key]"
              >
                {{
                  downloading[file.s3Key] ? "⏳ 다운로드 중..." : "💾 다운로드"
                }}
              </button>
            </div>
          </div>
        </div>

        <!-- 하단 액션 버튼 -->
        <div class="post-actions">
          <button @click="goBack" class="btn btn-secondary btn-large">
            📋 목록으로 돌아가기
          </button>
          <div v-if="isTeacher" class="teacher-actions">
            <button @click="editPost" class="btn btn-primary btn-large">
              ✏️ 게시글 수정
            </button>
            <button @click="deletePost" class="btn btn-danger btn-large">
              🗑️ 게시글 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Header from "@/components/common/Header.vue";
import apiClient from "@/utils/apiClient";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// 상태 관리
const loading = ref(false);
const error = ref(null);
const post = ref(null);
const downloading = ref({}); // 개별 파일 다운로드 상태
const downloadingAll = ref(false); // 전체 다운로드 상태

// 권한 체크
const isTeacher = computed(() => {
  return authStore.tokenInfo?.role === "teacher";
});

// 컴포넌트 마운트 시 게시글 로드
onMounted(() => {
  fetchPostDetail();
});

// 게시글 상세 정보 불러오기
const fetchPostDetail = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await apiClient.get(
      `/subject-board/view/${route.params.id}`
    );

    console.log("API 응답 데이터:", response);
    post.value = response;

    // 첨부파일이 있으면 다운로드 상태 초기화
    if (response.attachments) {
      response.attachments.forEach((attachment) => {
        downloading.value[attachment.s3Key] = false;
      });
    }
  } catch (err) {
    console.error("게시글 상세 조회 실패:", err);
    if (err.response?.status === 404) {
      error.value = "게시글을 찾을 수 없습니다.";
    } else {
      error.value = err.message || "게시글을 불러오는데 실패했습니다.";
    }
  } finally {
    loading.value = false;
  }
};

// 개별 파일 다운로드
const downloadFile = async (attachment) => {
  if (downloading.value[attachment.s3Key]) return; // 이미 다운로드 중이면 중단

  downloading.value[attachment.s3Key] = true;

  try {
    console.log("다운로드 시작:", attachment.originalName);

    // 1. Download Presigned URL 요청
    const presignedResponse = await apiClient.post("/presigned-url/download", {
      s3Key: attachment.s3Key,
    });

    console.log("Presigned URL 응답:", presignedResponse);
    const presignedUrl = presignedResponse.presignedUrl || presignedResponse;

    // 2. Presigned URL로 파일 다운로드
    const fileResponse = await fetch(presignedUrl, {
      method: "GET",
    });

    if (!fileResponse.ok) {
      throw new Error("파일 다운로드에 실패했습니다.");
    }

    // 3. Blob으로 변환
    const blob = await fileResponse.blob();

    // 4. 파일 다운로드 실행
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.originalName; // 원본 파일명으로 다운로드

    // 임시로 DOM에 추가 후 클릭
    document.body.appendChild(link);
    link.click();

    // 정리
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log("다운로드 완료:", attachment.originalName);
  } catch (error) {
    console.error("다운로드 실패:", error);
    alert(`파일 다운로드에 실패했습니다: ${error.message}`);
  } finally {
    downloading.value[attachment.s3Key] = false;
  }
};

// 전체 파일 다운로드
const downloadAllFiles = async (attachments) => {
  if (downloadingAll.value || !attachments || attachments.length === 0) return;

  downloadingAll.value = true;

  try {
    for (let i = 0; i < attachments.length; i++) {
      await downloadFile(attachments[i]);

      // 브라우저 제한 회피를 위한 짧은 지연
      if (i < attachments.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    alert("모든 파일 다운로드가 완료되었습니다.");
  } catch (error) {
    console.error("전체 다운로드 실패:", error);
    alert("일부 파일 다운로드에 실패했습니다.");
  } finally {
    downloadingAll.value = false;
  }
};

// 날짜 포맷팅
const formatDateTime = (dateString) => {
  if (!dateString) return "";

  try {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
};

// 게시글 내용 포맷팅 (줄바꿈 처리)
const formatContent = (content) => {
  if (!content) return "";
  return content.replace(/\n/g, "<br>");
};

// 파일 아이콘 결정
const getFileIcon = (fileName) => {
  if (!fileName) return "📎";

  const extension = fileName.split(".").pop()?.toLowerCase();
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
    mp3: "🎵",
    wav: "🎵",
    mp4: "🎬",
    avi: "🎬",
    zip: "🗜️",
    rar: "🗜️",
  };
  return iconMap[extension] || "📎";
};

// 파일 크기 포맷팅
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 게시글 수정
const editPost = () => {
  router.push({ name: "SubjectBoardWrite", params: { id: post.value.sbNo } });
};

// 게시글 삭제
const deletePost = async () => {
  if (
    !confirm(
      `'${post.value.sbTitle}' 게시글을 정말 삭제하시겠습니까?\n\n삭제된 게시글은 복구할 수 없습니다.`
    )
  ) {
    return;
  }

  try {
    await apiClient.delete(`/subject-board/${post.value.sbNo}`);

    alert("게시글이 성공적으로 삭제되었습니다.");

    // 목록으로 이동
    router.push({ name: "SubjectBoardList" });
  } catch (error) {
    console.error("게시글 삭제 실패:", error);
    alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
  }
};

// 목록으로 돌아가기
const goBack = () => {
  router.push({ name: "SubjectBoardList" });
};
</script>

<style scoped>
/* 전역 스타일 */
.board-detail-page {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.detail-container {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-info h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ff9800;
  margin: 0 0 0.5rem 0;
}

.header-info p {
  font-size: 1.1rem;
  color: #ffb74d;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* 로딩 및 에러 상태 */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  margin-bottom: 2rem;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.2rem;
  color: #ffb74d;
  margin: 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  font-size: 1.5rem;
  color: #ff9800;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  font-size: 1.1rem;
  color: #ffb74d;
  margin: 0 0 2rem 0;
}

.retry-btn {
  background: #ff9800;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #f57c00;
  transform: translateY(-2px);
}

/* 버튼 스타일 */
.btn {
  border: none;
  padding: 12px 20px;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back {
  background: #fff5d6;
  color: #ff9800;
  border: 2px solid #ffe066;
}

.btn-back:hover {
  background: #ffe066;
  transform: translateX(-2px);
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

.btn-secondary {
  background: #fff5d6;
  color: #ff9800;
  border: 2px solid #ffe066;
}

.btn-secondary:hover {
  background: #ffe066;
}

.btn-danger {
  background: #ff5722;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);
}

.btn-danger:hover {
  background: #e64a19;
  transform: translateY(-2px);
}

.btn-large {
  padding: 15px 25px;
  font-size: 1.1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 게시글 콘텐츠 */
.post-content {
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.1);
}

/* 게시글 헤더 */
.post-header {
  background: #fffbf0;
  padding: 2rem;
  border-bottom: 3px solid #fff5d6;
}

.post-title-section {
  margin-bottom: 1.5rem;
}

.pinned-badge {
  background: #ff9800;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: inline-block;
}

.post-title {
  font-size: 2rem;
  font-weight: 800;
  color: #5d4037;
  margin: 0;
  line-height: 1.3;
  word-break: keep-all;
}

.post-info {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  color: #a37800;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.info-label {
  font-weight: 600;
}

.info-value {
  font-weight: 700;
  color: #8c6d32;
}

/* 게시글 본문 */
.post-body {
  padding: 2.5rem 2rem;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.post-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #5d4037;
  word-break: keep-all;
}

.post-text :deep(h3) {
  color: #ff9800;
  font-size: 1.3rem;
  margin: 2rem 0 1rem 0;
  font-weight: 700;
}

.post-text :deep(h4) {
  color: #ffb74d;
  font-size: 1.1rem;
  margin: 1.5rem 0 0.75rem 0;
  font-weight: 700;
}

.post-text :deep(strong) {
  color: #f57c00;
  font-weight: 800;
}

/* 첨부파일 섹션 */
.attachments-section {
  padding: 2rem;
  border-top: 2px dashed #fff5d6;
  background: #fffbf0;
}

.attachments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #fff5d6;
}

.attachments-title {
  font-size: 1.2rem;
  color: #ff9800;
  margin: 0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-download-all {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-download-all:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-download-all:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attachment-item {
  background: white;
  border: 2px solid #fff5d6;
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.attachment-item:hover {
  border-color: #ffe066;
  transform: translateX(5px);
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.attachment-icon {
  font-size: 2rem;
}

.attachment-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.attachment-name {
  font-weight: 600;
  color: #5d4037;
  font-size: 1rem;
}

.attachment-size {
  color: #a37800;
  font-size: 0.9rem;
}

.download-btn {
  background: #ffdd29;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  min-width: 120px;
}

.download-btn:hover:not(:disabled) {
  background: #ffc729;
  transform: translateY(-2px);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 하단 액션 버튼 */
.post-actions {
  padding: 2rem;
  border-top: 3px solid #fff5d6;
  background: #fffbf0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.teacher-actions {
  display: flex;
  gap: 1rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .board-detail-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    justify-content: space-between;
  }

  .post-header,
  .post-body,
  .attachments-section {
    padding: 1.5rem;
  }

  .post-info {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .attachment-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .attachment-info {
    justify-content: center;
  }

  .post-actions {
    flex-direction: column;
    gap: 1.5rem;
  }

  .teacher-actions {
    width: 100%;
    justify-content: space-between;
  }

  .btn-large {
    width: 100%;
    justify-content: center;
  }

  .attachments-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
