<template>
  <Header />
  <div class="subject-board-page">
    <div class="list-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">📚 과목 게시판</h1>
          <p class="page-subtitle">우리 반의 학습자료와 공지사항을 확인해요!</p>
        </div>
        <button v-if="isTeacher" @click="showWriteForm" class="btn btn-primary">
          ✍️ 새 글 작성하기
        </button>
      </div>

      <!-- 안내 상자 -->
      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <ul class="notice-list">
          <li>선생님이 올리는 학습자료와 공지글을 확인할 수 있어요.</li>
          <li>궁금한 내용이 있으면 선생님께 직접 질문해주세요! 💬</li>
          <li v-if="isTeacher">
            학생들이 볼 수 있도록 중요한 자료를 올려주세요.
          </li>
        </ul>
      </div>

      <!-- 검색 영역 -->
      <!-- <div class="search-section">
        <div class="search-bar">
          <input
            type="text"
            v-model="searchKeyword"
            @keyup.enter="searchPosts"
            placeholder="제목으로 검색해보세요..."
            class="search-input"
          />
          <button @click="searchPosts" class="search-btn">🔍 검색</button>
          <button @click="resetSearch" class="reset-btn">🔄 초기화</button>
        </div>
      </div>
 -->
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">⏳</div>
        <p>게시글을 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <h3>데이터를 불러올 수 없습니다</h3>
        <p>{{ error }}</p>
        <button @click="fetchPosts" class="retry-btn">다시 시도</button>
      </div>

      <!-- 게시글 목록 -->
      <div v-else class="board-content">
        <!-- 게시글 개수 및 정보 -->
        <div class="board-info">
          <div class="post-count">
            총 <strong>{{ filteredPosts.length }}</strong
            >개의 게시글
          </div>
          <div class="sort-options">
            <select v-model="sortBy" @change="sortPosts" class="sort-select">
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
        </div>

        <!-- 게시글 목록 테이블 -->
        <div class="post-list">
          <div class="list-header">
            <div class="col-no">번호</div>
            <div class="col-title">제목</div>
            <div class="col-author">작성자</div>
            <div class="col-date">작성일</div>
          </div>

          <!-- 공지사항 (상단 고정) -->
          <div
            v-for="post in pinnedPosts"
            :key="'pinned-' + post.id"
            class="list-item pinned"
            @click="viewPost(post)"
          >
            <div class="col-no">
              <span class="notice-badge">📌 공지</span>
            </div>
            <div class="col-title">
              <span class="post-title pinned">{{ post.sbTitle }}</span>
              <span v-if="post.hasAttachment" class="attachment-icon">📎</span>
            </div>
            <div class="col-author">{{ post.writerName || post.author }}</div>
            <div class="col-date">{{ formatDate(post.createdAt) }}</div>
          </div>

          <!-- 일반 게시글 -->
          <div
            v-for="post in currentPagePosts"
            :key="'post-' + post.id"
            class="list-item"
            @click="viewPost(post)"
          >
            <div class="col-no">{{ post.boardNo || post.id }}</div>
            <div class="col-title">
              <span class="post-title">{{ post.sbTitle }}</span>
              <span v-if="post.hasAttachment" class="attachment-icon">📎</span>
            </div>
            <div class="col-author">{{ post.writerName || post.author }}</div>
            <div class="col-date">{{ formatDate(post.createdAt) }}</div>
          </div>

          <!-- 게시글이 없을 때 -->
          <div
            v-if="filteredPosts.length === 0 && pinnedPosts.length === 0"
            class="empty-state"
          >
            <div class="empty-icon">📭</div>
            <h3 class="empty-title">게시글이 없어요</h3>
            <p class="empty-description">첫 번째 게시글을 작성해보세요!</p>
          </div>
        </div>

        <!-- 페이징 -->
        <div v-if="totalPages > 1" class="pagination">
          <i
            class="page-btn bi bi-chevron-double-left"
            @click="goToPage(1)"
            :class="{ disabled: currentPage === 1 }"
            title="맨 처음으로"
          ></i>
          <i
            class="page-btn bi bi-chevron-left"
            @click="goToPage(currentPage - 1)"
            :class="{ disabled: currentPage === 1 }"
            title="이전 페이지"
          ></i>
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['page-btn', { active: page === currentPage }]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <i
            class="page-btn bi bi-chevron-right"
            @click="goToPage(currentPage + 1)"
            :class="{ disabled: currentPage === totalPages }"
            title="다음 페이지"
          ></i>
          <i
            class="page-btn bi bi-chevron-double-right"
            @click="goToPage(totalPages)"
            :class="{ disabled: currentPage === totalPages }"
            title="맨 마지막으로"
          ></i>
        </div>
      </div>
    </div>
  </div>
  <!-- footer -->
  <footer class="footer">
    <Footer></Footer>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";
import Footer from "@/components/common/Footer.vue";
import apiClient from "@/utils/apiClient";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const router = useRouter();

const isTeacher = computed(() => {
  return localStorage.getItem("userType") === "teacher";
});

const searchKeyword = ref("");
const sortBy = ref("latest");
const currentPage = ref(1);
const postsPerPage = 5;

// 상태 관리
const loading = ref(false);
const error = ref(null);
const posts = ref([]);

// 컴포넌트 마운트 시 게시글 목록 불러오기
onMounted(() => {
  fetchPosts();
});

// 게시글 목록 API 호출
const fetchPosts = async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = await apiClient.get(
      `/subject-board/list/${authStore.tokenInfo?.classroomNo}`
    );

    //const data = response.data;
    console.log("API 응답 데이터:", data);

    // API 응답 구조에 맞게 처리
    if (Array.isArray(data)) {
      posts.value = data.map((post) => ({
        ...post,
        hasAttachment: post.hasAttachment,
        isPinned: post.pinned,
      }));
    } else {
      posts.value = [];
    }
  } catch (err) {
    console.error("게시글 목록 조회 실패:", err);
    error.value = err.message;
    posts.value = [];
  } finally {
    loading.value = false;
  }
};

// 검색된 게시글
const filteredPosts = computed(() => {
  let filtered = [...posts.value];

  if (searchKeyword.value.trim()) {
    filtered = filtered.filter((post) =>
      post.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  }

  // 정렬
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "latest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return filtered.filter((post) => !post.isPinned);
});

// 공지사항 (상단 고정)
const pinnedPosts = computed(() => {
  return posts.value.filter((post) => post.isPinned);
});

// 페이징 관련
const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / postsPerPage);
});

const currentPagePosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage;
  const end = start + postsPerPage;
  return filteredPosts.value.slice(start, end);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

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
});

// 검색 관련 watch
watch([searchKeyword, sortBy], () => {
  currentPage.value = 1;
});

// 메서드
const searchPosts = () => {
  currentPage.value = 1;
  // 실시간 검색이므로 별도 API 호출 불필요
};

const resetSearch = () => {
  searchKeyword.value = "";
  currentPage.value = 1;
};

const sortPosts = () => {
  currentPage.value = 1;
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const viewPost = (post) => {
  // 게시글 상세보기로 이동
  router.push({
    name: "SubjectBoardDetail",
    params: { id: post.sbNo },
  });
};

const showWriteForm = () => {
  // 게시글 작성 페이지로 이동
  router.push({ name: "SubjectBoardWrite", params: { id: "new" } });
};

const formatDate = (dateString) => {
  if (!dateString) return "";

  try {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (e) {
    return dateString;
  }
};

// 데이터 새로고침
const refreshPosts = () => {
  fetchPosts();
};

// 외부에서 호출 가능하도록 expose
defineExpose({
  refreshPosts,
});
</script>

<style scoped>
/* 기존 스타일 유지 */
.subject-board-page {
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

/* 로딩 상태 */
.loading-state {
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 에러 상태 */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  border: 3px solid #ffcdd2;
  margin-bottom: 2rem;
  color: #d32f2f;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #ff9800;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #f57c00;
  transform: translateY(-2px);
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
  color: #ff9800;
  margin: 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #ffb74d;
  margin-top: 0.5rem;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

/* 새 글 작성 버튼 */
.btn.btn-primary {
  background: #ffdd29;
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
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

/* 검색 영역 */
.search-section {
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.1);
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #ffe066;
  border-radius: 15px;
  font-size: 1rem;
  background: #fffbf0;
  color: #8c6d32;
}

.search-input:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.1);
}

.search-btn,
.reset-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn {
  background: #ffdd29;
  color: white;
}

.reset-btn {
  background: #fff5d6;
  color: #ff9800;
}

.search-btn:hover,
.reset-btn:hover {
  transform: translateY(-2px);
}

/* 게시판 콘텐츠 */
.board-content {
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.1);
}

.board-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: #fffbf0;
  border-bottom: 2px solid #fff5d6;
}

.post-count {
  font-size: 1.1rem;
  color: #ff9800;
  font-weight: 700;
}

.sort-select {
  padding: 8px 15px;
  border: 2px solid #ffe066;
  border-radius: 10px;
  background: white;
  color: #8c6d32;
  font-weight: 600;
  cursor: pointer;
}

/* 게시글 목록 */
.post-list {
  min-height: 400px;
}

.list-header,
.list-item {
  display: grid;
  grid-template-columns: 80px 1fr 120px 120px;
  gap: 1rem;
  padding: 1rem 2rem;
  align-items: center;
}

.list-header {
  background: #ffdd29;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  text-align: center;
  border-bottom: 2px solid #ffe066;
}

.list-item {
  border-bottom: 1px solid #fff5d6;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #8c6d32;
}

.list-item:hover {
  background: #fffbf0;
  transform: translateX(5px);
}

.list-item.pinned {
  background: #fff9e6;
  border-bottom: 2px solid #ffe066;
}

.col-no,
.col-author,
.col-date {
  text-align: center;
  font-size: 0.9rem;
}

.col-title {
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notice-badge {
  background: #ff9800;
  color: white;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.post-title {
  font-weight: 600;
  color: #5d4037;
}

.post-title.pinned {
  color: #ff9800;
  font-weight: 700;
}

.attachment-icon {
  color: #ffb74d;
  font-size: 0.9rem;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #ffb74d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 0.5rem;
}

.empty-description {
  font-size: 1rem;
  margin: 0;
}

/* 페이징 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  background: #fffbf0;
  border-top: 2px solid #fff5d6;
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

.page-btn:hover:not(.disabled) {
  background: #ffe066;
  transform: translateY(-2px);
}

.page-btn.active {
  background: #ffdd29;
  color: white;
  border-color: #ffdd29;
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .subject-board-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .search-input {
    width: 100%;
  }

  .list-header,
  .list-item {
    grid-template-columns: 60px 1fr 80px;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .col-author {
    display: none;
  }

  .board-info {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
