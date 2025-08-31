<template>
  <div class="group-board-page">
    <div class="board-container">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-icon">⏳</div>
        <p class="loading-text">게시글을 불러오는 중...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠</div>
        <p class="error-text">{{ error }}</p>
        <button @click="fetchPosts()" class="retry-btn">다시 시도</button>
      </div>

      <template v-else>
        <div class="page-header">
          <div class="page-text">
            <h1 class="page-title">🎉 그룹 게시판</h1>
            <p class="page-subtitle">우리 그룹만의 특별한 소통 공간이에요!</p>
            <nav class="cute-breadcrumb">
              <span>🏠 홈</span>
              <span class="separator">></span>
              <span class="current">🎉 그룹 게시판</span>
            </nav>
          </div>
          <button @click="showWriteModal = true" class="action-btn btn-primary">
            ✏️ 새 글 쓰기
          </button>
        </div>

        <div class="notice-box">
          <span class="notice-icon">💡</span>
          <ul class="notice-list">
            <li>그룹원들과 자유롭게 소통하고 친해져요!</li>
            <li>질문, 고민, 재미있는 이야기 모두 환영해요 🌟</li>
            <li>서로를 존중하며 즐겁게 대화해주세요!</li>
          </ul>
        </div>

        <div class="posts-content">
          <div v-if="posts.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3 class="empty-title">아직 작성된 글이 없어요</h3>
            <p class="empty-description">첫 번째 글을 작성해보세요!</p>
          </div>
          <div v-else class="posts-list">
            <div
              v-for="post in paginatedPosts"
              :key="post.boardNo"
              class="post-card"
              @click="viewPost(post)"
            >
              <div class="post-header">
                <div class="post-meta">
                  <div class="author-info">
                    <div class="avatar">
                      {{ post.memberName ? post.memberName.charAt(0) : "U" }}
                    </div>
                    <div class="author-details">
                      <span class="author-name">{{
                        post.memberName || "익명"
                      }}</span>
                      <span class="post-time">{{
                        formatTime(post.boardCreatedDate)
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="post-body">
                <h3 class="post-title">{{ post.boardTitle }}</h3>
                <p class="post-preview">{{ post.boardContent }}</p>

                <div v-if="post.hasAttachment" class="attachment-indicator">
                  <span class="attachment-icon">📎</span>
                  <span class="attachment-text">첨부파일</span>
                </div>
              </div>

              <div class="post-footer">
                <div class="post-stats">
                  <div class="stat-item">
                    <span class="stat-icon">👀</span>
                    <span class="stat-count">{{ post.boardViews || 0 }}</span>
                  </div>
                </div>
                <div class="post-date">
                  {{ formatDate(post.boardCreatedDate) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            class="page-btn"
          >
            ⮪️
          </button>
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="page-btn"
          >
            ◀️
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['page-btn', { active: currentPage === page }]"
          >
            {{ page }}
          </button>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            ▶️
          </button>
          <button
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            class="page-btn"
          >
            ⭐️
          </button>
        </div>
      </template>
    </div>

    <div v-if="showWriteModal" class="modal-overlay" @click="closeWriteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>✏️ 새 글 쓰기</h2>
          <button @click="closeWriteModal" class="close-btn">❌</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>제목</label>
            <input
              type="text"
              v-model="newPost.boardTitle"
              placeholder="제목을 입력하세요..."
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>내용</label>
            <textarea
              v-model="newPost.boardContent"
              placeholder="자유롭게 이야기해보세요!"
              class="form-textarea"
              rows="8"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">📎 첨부파일</label>
            <div
              class="file-drop-zone"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
              @click="triggerFileInput"
            >
              <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                multiple
                hidden
              />
              <div v-if="!hasFiles" class="empty-files">
                <div class="upload-icon">📁</div>
                <div>파일을 드래그 앤 드롭 하거나, 여기를 클릭하세요.</div>
                <small>최대 5개, 각 10MB 이하</small>
              </div>
              <ul v-else class="file-list">
                <li
                  v-for="(file, index) in newPost.attachmentFiles"
                  :key="index"
                  class="file-item"
                >
                  <span class="file-name">📄 {{ file.name }}</span>
                  <button
                    type="button"
                    @click.stop="removeFile(index)"
                    class="remove-file-btn"
                  >
                    ❌
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeWriteModal" class="btn-cancel">취소</button>
          <button
            @click="submitPost"
            class="btn-submit"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "⏳ 등록 중..." : "📝 글 등록" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from "@/utils/apiClient";

export default {
  name: "GroupBoard",
  props: {
    groupNo: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      currentPage: 1,
      postsPerPage: 8,
      showWriteModal: false,
      isLoading: false,
      isSubmitting: false,
      error: null,
      posts: [],
      newPost: {
        boardTitle: "",
        boardContent: "",
        attachmentFiles: [],
      },
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.posts.length / this.postsPerPage);
    },
    paginatedPosts() {
      const start = (this.currentPage - 1) * this.postsPerPage;
      const end = start + this.postsPerPage;
      return this.posts.slice(start, end);
    },
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;

      let start = Math.max(1, current - 2);
      let end = Math.min(total, current + 2);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(total, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
    hasFiles() {
      return this.newPost.attachmentFiles.length > 0;
    },
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      try {
        this.isLoading = true;
        this.error = null;

        const response = await apiClient.get(
          `/group/${this.groupNo}/boardList`
        );
        this.posts = response || [];

        this.posts = this.posts.map((post) => ({
          ...post,
          boardViews: post.boardViews || 0,
          hasAttachment: post.attachmentCount > 0 || false,
        }));
      } catch (error) {
        console.error("게시글 조회 실패:", error);
        this.error = "게시글을 불러오는데 실패했습니다.";
      } finally {
        this.isLoading = false;
      }
    },

    formatTime(dateString) {
      if (!dateString) return "방금 전";

      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        return `${diffDays}일 전`;
      } else if (diffHours > 0) {
        return `${diffHours}시간 전`;
      } else {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes > 0 ? `${diffMinutes}분 전` : "방금 전";
      }
    },

    formatDate(dateString) {
      if (!dateString) return "";

      return new Date(dateString).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    viewPost(post) {
      console.log("게시글 보기:", post.boardTitle);
    },

    closeWriteModal() {
      this.showWriteModal = false;
      this.newPost = {
        boardTitle: "",
        boardContent: "",
        attachmentFiles: [],
      };
    },

    triggerFileInput() {
      this.$refs.fileInput?.click();
    },

    handleFileSelect(event) {
      const files = event.target.files;
      if (files) this.addFiles(files);
    },

    handleFileDrop(event) {
      const files = event.dataTransfer.files;
      if (files) this.addFiles(files);
    },

    addFiles(files) {
      const fileList = Array.from(files);
      const maxFiles = 5;
      const maxSize = 10 * 1024 * 1024;

      if (this.newPost.attachmentFiles.length + fileList.length > maxFiles) {
        alert(`파일은 최대 ${maxFiles}개까지 등록할 수 있습니다.`);
        return;
      }

      const oversizedFiles = fileList.filter((file) => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        alert("10MB 이하의 파일만 업로드할 수 있습니다.");
        return;
      }

      this.newPost.attachmentFiles.push(...fileList);
    },

    removeFile(index) {
      this.newPost.attachmentFiles.splice(index, 1);
    },

    async uploadFiles(boardNo) {
      const failedFiles = [];

      for (let i = 0; i < this.newPost.attachmentFiles.length; i++) {
        const file = this.newPost.attachmentFiles[i];

        try {
          const presignedResponse = await apiClient.post(
            "/presigned-url/upload",
            {
              boardNo: boardNo,
              boardType: "GROUP",
              originalName: file.name,
            }
          );

          const { presignedUrl, savedName, s3Key } = presignedResponse;

          const uploadRes = await fetch(presignedUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });

          if (!uploadRes.ok) throw new Error("S3 업로드 실패");

          await apiClient.post("/presigned-url/attachment", {
            boardNo: boardNo,
            boardType: "GROUP",
            originalName: file.name,
            savedName: savedName,
            s3Key: s3Key,
          });
        } catch (err) {
          console.error("파일 업로드 실패:", file.name, err);
          failedFiles.push(file);
        }
      }

      if (failedFiles.length > 0) {
        throw new Error(
          `일부 파일 업로드에 실패했습니다: ${failedFiles
            .map((f) => f.name)
            .join(", ")}`
        );
      }
    },

    async submitPost() {
      if (
        !this.newPost.boardTitle.trim() ||
        !this.newPost.boardContent.trim()
      ) {
        alert("제목과 내용을 모두 입력해주세요!");
        return;
      }

      this.isSubmitting = true;

      try {
        const postData = {
          boardTitle: this.newPost.boardTitle,
          boardContent: this.newPost.boardContent,
          boardType: "GROUP",
        };

        const response = await apiClient.post(
          `/group/${this.groupNo}/board`,
          postData
        );

        let boardNo = response?.boardNo || response?.id || response;

        if (!boardNo) {
          throw new Error("게시글 번호를 받지 못했습니다.");
        }

        if (this.newPost.attachmentFiles.length > 0) {
          await this.uploadFiles(boardNo);
        }

        alert("글이 성공적으로 등록되었습니다! 🎉");
        this.closeWriteModal();

        await this.fetchPosts();
      } catch (error) {
        console.error("글 등록 실패:", error);
        alert("글 등록에 실패했습니다: " + error.message);
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style>
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  margin: 2rem 0;
}

.loading-icon,
.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text,
.error-text {
  color: #ff9800;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

.retry-btn {
  background: #ffdd29;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.group-board-page {
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.board-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(
    135deg,
    rgba(255, 152, 0, 0.15),
    rgba(255, 193, 7, 0.25)
  );
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
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
  list-style-type: disc;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.posts-content {
  background: #fffbf0;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  background: white;
  border: 2px solid #fff5d6;
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.post-card:hover {
  border-color: #ffdd29;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.15);
}

.post-header {
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #fff9e6;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ffdd29, #ffa726);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 1.1rem;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 700;
  color: #8c6d32;
  font-size: 0.95rem;
}

.post-time {
  color: #ffb74d;
  font-size: 0.8rem;
}

.post-body {
  padding: 1rem 1.25rem;
}

.post-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #8c6d32;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.post-preview {
  color: #666;
  line-height: 1.5;
  margin: 0 0 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f0f8ff;
  border-radius: 8px;
  color: #2196f3;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.attachment-icon {
  font-size: 1rem;
}

.post-footer {
  padding: 0.75rem 1.25rem;
  background: #fff9e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #666;
}

.stat-icon {
  font-size: 0.9rem;
}

.post-date {
  color: #ffb74d;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-primary {
  background: #ffdd29;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  background: #fffbf0;
  border-top: 2px solid #fff5d6;
  border-radius: 0 0 20px 20px;
}

.page-btn {
  padding: 8px 12px;
  border: 2px solid #ffe066;
  background: white;
  color: #ff9800;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 40px;
}

.page-btn:hover:not(:disabled) {
  background: #ffe066;
  transform: translateY(-2px);
}

.page-btn.active {
  background: #ffdd29;
  color: white;
  border-color: #ffdd29;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  border: 3px solid #ffe066;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 2px solid #fff5d6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e65100;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #8c6d32;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ffe066;
  border-radius: 10px;
  font-size: 1rem;
  background: #fffbf0;
  color: #8c6d32;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.file-drop-zone {
  border: 3px dashed #ffe066;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  background: #fffbf0;
  transition: all 0.3s ease;
  color: #8c6d32;
}

.file-drop-zone:hover {
  border-color: #ffdd29;
  background: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.1);
}

.empty-files {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border: 2px solid #fff5d6;
  border-radius: 15px;
  color: #8c6d32;
}

.file-name {
  font-weight: 600;
  flex: 1;
}

.remove-file-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.remove-file-btn:hover {
  background: #ffebee;
  transform: scale(1.1);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 2px solid #fff5d6;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 12px 24px;
  border: 2px solid #ffe066;
  background: white;
  color: #ff9800;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #ffe066;
}

.btn-submit {
  padding: 12px 24px;
  border: none;
  background: #ffdd29;
  color: white;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  .group-board-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .post-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .post-stats {
    justify-content: center;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .post-body {
    padding: 0.75rem 1rem;
  }

  .post-header,
  .post-footer {
    padding: 0.75rem 1rem;
  }

  .author-info {
    gap: 0.5rem;
  }

  .avatar {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .group-board-page * {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    transition-duration: 0.01ms;
  }
}

button:focus,
input:focus,
textarea:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

@media (hover: none) {
  .post-card:hover {
    transform: none;
    box-shadow: none;
  }

  .btn-primary:hover,
  .btn-submit:hover,
  .retry-btn:hover {
    transform: none;
  }
}
</style>
