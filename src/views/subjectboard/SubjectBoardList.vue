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
      <div class="search-section">
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

      <!-- 게시글 목록 -->
      <div class="board-content">
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
              <option value="title">제목순</option>
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
            <!-- <div class="col-views">조회수</div> -->
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
              <span class="post-title pinned">{{ post.title }}</span>
              <span v-if="post.hasAttachment" class="attachment-icon">📎</span>
            </div>
            <div class="col-author">{{ post.author }}</div>
            <div class="col-date">{{ formatDate(post.createdAt) }}</div>
            <!-- <div class="col-views">{{ post.views }}</div> -->
          </div>

          <!-- 일반 게시글 -->
          <div
            v-for="post in currentPagePosts"
            :key="'post-' + post.id"
            class="list-item"
            @click="viewPost(post)"
          >
            <div class="col-no">{{ post.id }}</div>
            <div class="col-title">
              <span class="post-title">{{ post.title }}</span>
              <span v-if="post.hasAttachment" class="attachment-icon">📎</span>
            </div>
            <div class="col-author">{{ post.author }}</div>
            <div class="col-date">{{ formatDate(post.createdAt) }}</div>
            <!-- <div class="col-views">{{ post.views }}</div> -->
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
          <button
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            class="page-btn"
          >
            ⏮️
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
            ⏭️
          </button>
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

const searchKeyword = ref("");
const sortBy = ref("latest");
const currentPage = ref(1);
const postsPerPage = 10;

// 통합된 더미 데이터
const posts = ref([
  {
    id: 1,
    title: "🏆 8월의 칭찬학생을 발표합니다!",
    author: "선생님",
    createdAt: "2025-08-12T14:30:00Z",
    updatedAt: "2025-08-12T14:30:00Z",
    views: 124,
    hasAttachment: true,
    isPinned: true,
    content: `8월 한달간 가장 열심히 공부한 <strong>김병아</strong> 학생을 칭찬합니다! 🎉

모든 학생들이 열심히 했지만, 특히 매일 과제를 빠짐없이 제출하고 수업시간에도 적극적으로 참여한 김병아 학생을 이번 달 칭찬학생으로 선정합니다.

<h3>칭찬 이유</h3>
• 매일 과제 제출 100% 달성 ✨
• 수업 중 적극적인 발표 참여
• 친구들을 도와주는 따뜻한 마음

다른 학생들도 다음 달에는 더욱 열심히 해서 칭찬받을 수 있기를 바라요!
선생님이 준비한 칭찬 스티커를 첨부파일에서 받아가세요! 💝`,
    attachments: [
      {
        name: "칭찬스티커.png",
        size: 1024000,
        url: "/files/praise-sticker.png",
      },
      {
        name: "8월칭찬학생인증서.pdf",
        size: 2048000,
        url: "/files/certificate.pdf",
      },
    ],
  },
  {
    id: 2,
    title: "📢 여름방학 숙제 안내",
    author: "선생님",
    createdAt: "2025-08-10T09:00:00Z",
    updatedAt: "2025-08-11T10:30:00Z",
    views: 256,
    hasAttachment: true,
    isPinned: true,
    content: `여름방학 동안 해야 할 숙제를 안내드립니다. 📚

모든 숙제는 <strong>개학 첫 주(8월 28일)</strong>에 제출해주세요!

<h3>📝 숙제 목록</h3>

<h4>1. 수학 문제집</h4>
• 30-50페이지 (총 20페이지)
• 모르는 문제는 빨간 펜으로 표시해주세요
• 풀이 과정도 꼼꼼히 적어주세요

<h4>2. 독후감 2편</h4>
• 책은 자유선택 (학년 수준에 맞는 책)
• 각각 400자 원고지 3장 분량
• 첨부된 양식을 사용해주세요

<h4>3. 과학 관찰일기</h4>
• 매주 1회씩, 총 4회 작성
• 주변의 자연현상이나 실험 관찰
• 그림이나 사진도 함께 넣어주세요

궁금한 점이 있으면 언제든 연락해주세요! 😊`,
    attachments: [
      {
        name: "여름방학숙제목록.pdf",
        size: 2048000,
        url: "/files/homework-list.pdf",
      },
      {
        name: "독후감양식.hwp",
        size: 512000,
        url: "/files/book-report-form.hwp",
      },
      {
        name: "관찰일기양식.docx",
        size: 768000,
        url: "/files/observation-diary.docx",
      },
    ],
  },
  {
    id: 3,
    title: "What's This? 단원 학습자료",
    author: "선생님",
    createdAt: "2025-08-08T16:20:00Z",
    updatedAt: "2025-08-08T16:20:00Z",
    views: 89,
    hasAttachment: true,
    isPinned: false,
    content: `What's This? 단원의 추가 학습자료를 공유합니다! 📚

<h3>📖 학습 목표</h3>
• 사물의 이름을 영어로 묻고 답할 수 있어요
• "What's this?" "It's a/an ..." 표현을 자연스럽게 사용해요
• 일상생활 물건의 영어 이름을 익혀요

<h3>🎯 중요 표현</h3>
• What's this? → 이게 뭐야?
• It's a book. → 책이에요.
• It's an apple. → 사과에요.

첨부파일에 워크시트와 단어카드가 있으니 활용해보세요!`,
    attachments: [
      {
        name: "What's This 워크시트.pdf",
        size: 1536000,
        url: "/files/whats-this-worksheet.pdf",
      },
      { name: "단어카드.png", size: 2048000, url: "/files/word-cards.png" },
    ],
  },
  {
    id: 4,
    title: "알파벳 발음 연습 파일",
    author: "선생님",
    createdAt: "2025-08-05T11:15:00Z",
    updatedAt: "2025-08-05T11:15:00Z",
    views: 156,
    hasAttachment: true,
    isPinned: false,
    content: `알파벳 정확한 발음을 연습해보세요! 🗣️

<h3>🎵 알파벳 송 활용법</h3>
• 매일 3번씩 따라 불러보세요
• 각 글자의 음을 정확히 발음해보세요
• 친구들과 함께 불러보면 더 재미있어요!

<h3>📝 연습 포인트</h3>
• A, E, I, O, U (모음) 발음에 주의하세요
• B와 V, P와 F 구별해서 발음하세요
• 리듬에 맞춰서 즐겁게 연습해요!

첨부된 음성파일을 들으며 함께 따라해보세요! 🎤`,
    attachments: [
      { name: "알파벳송.mp3", size: 3072000, url: "/files/alphabet-song.mp3" },
      {
        name: "발음연습가이드.pdf",
        size: 1024000,
        url: "/files/pronunciation-guide.pdf",
      },
    ],
  },
  {
    id: 5,
    title: "1학기 현장체험학습 사진",
    author: "선생님",
    createdAt: "2025-08-03T15:45:00Z",
    updatedAt: "2025-08-03T15:45:00Z",
    views: 203,
    hasAttachment: true,
    isPinned: false,
    content: `즐거웠던 현장체험학습 사진들입니다! 📸

<h3>🏛️ 국립중앙박물관 견학</h3>
7월 25일에 다녀온 박물관 견학 사진들을 공유해요!
모두 정말 열심히 관람하고 많은 것들을 배웠어요.

<h3>📚 배운 점들</h3>
• 우리나라의 소중한 문화재들을 직접 봤어요
• 영어로 된 설명도 읽어봤어요
• 친구들과 함께 여행하는 즐거움을 느꼈어요

사진을 보면서 그날의 추억을 다시 떠올려보세요! 💖
가족들과도 함께 보세요!`,
    attachments: [
      { name: "단체사진.jpg", size: 4096000, url: "/files/group-photo.jpg" },
      { name: "박물관에서.jpg", size: 3584000, url: "/files/at-museum.jpg" },
      {
        name: "체험활동.jpg",
        size: 3072000,
        url: "/files/hands-on-activity.jpg",
      },
    ],
  },
  {
    id: 6,
    title: "영어 일기 쓰기 팁",
    author: "선생님",
    createdAt: "2025-08-01T13:30:00Z",
    updatedAt: "2025-08-01T13:30:00Z",
    views: 78,
    hasAttachment: false,
    isPinned: false,
    content: `영어 일기를 잘 쓰는 방법을 알려드릴게요! ✍️

<h3>📝 영어 일기 쓰기 단계</h3>

<h4>1단계: 간단한 문장부터 시작</h4>
• Today is sunny. (오늘은 화창해요)
• I ate breakfast. (나는 아침을 먹었어요)
• I played with friends. (친구들과 놀았어요)

<h4>2단계: 감정 표현하기</h4>
• I was happy. (기뻤어요)
• I felt sad. (슬펐어요)
• It was fun! (재미있었어요!)

<h4>3단계: 이유 설명하기</h4>
• I was happy because... (기뻤어요 왜냐하면...)
• I like it because... (좋아해요 왜냐하면...)

매일 3문장씩만 써도 실력이 늘어요! 화이팅! 💪`,
    attachments: [],
  },
  {
    id: 7,
    title: "분실물 찾아가세요~",
    author: "선생님",
    createdAt: "2025-07-30T10:20:00Z",
    updatedAt: "2025-07-30T10:20:00Z",
    views: 45,
    hasAttachment: false,
    isPinned: false,
    content: `교실에서 발견된 분실물들이 있어요! 🔍

<h3>📦 분실물 목록</h3>
• 노란색 필통 (연필 3자루, 지우개 포함)
• 파란색 물병 (스티커 붙어있음)
• 체육복 (이름표 없음)
• 빨간색 머리끈

<strong>본인 물건이라면 선생님에게 찾으러 오세요!</strong>

앞으로는 본인 물건에 이름을 꼭 적어주세요.
잃어버리지 않도록 자리 정리도 깔끔하게 해요! 😊`,
    attachments: [],
  },
  {
    id: 8,
    title: "Hello, ABC! 단원 복습자료",
    author: "선생님",
    createdAt: "2025-07-28T14:10:00Z",
    updatedAt: "2025-07-28T14:10:00Z",
    views: 167,
    hasAttachment: true,
    isPinned: false,
    content: `Hello, ABC! 단원을 잘 복습했는지 확인해보세요! 📖

<h3>✅ 복습 체크리스트</h3>
• 알파벳 A~Z까지 순서대로 쓸 수 있나요?
• 대문자와 소문자를 구별할 수 있나요?
• "Hello", "Good morning" 인사말을 할 수 있나요?
• 본인의 영어 이름을 소개할 수 있나요?

<h3>🏆 복습 미션</h3>
1. 알파벳 쓰기 연습장 완성하기
2. 가족들에게 영어로 인사해보기
3. 영어 이름으로 자기소개하기

모든 미션을 완료한 친구들에게는 특별한 스티커를 드려요! ⭐`,
    attachments: [
      {
        name: "알파벳쓰기연습장.pdf",
        size: 2560000,
        url: "/files/alphabet-practice.pdf",
      },
      {
        name: "인사말카드.png",
        size: 1024000,
        url: "/files/greeting-cards.png",
      },
    ],
  },
]);

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

// 메서드
const searchPosts = () => {
  currentPage.value = 1;
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
  router.push({ name: "SubjectBoardDetail", params: { id: post.id } });
};

const showWriteForm = () => {
  // 게시글 작성 페이지로 이동
  router.push({ name: "SubjectBoardWrite", params: { id: "new" } });
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
</script>

<style scoped>
/* 기존 스타일은 그대로 유지 */
/* 전역 폰트 및 배경 설정 */
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

/* 페이지 헤더 */
/*.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 3px solid #fff5d6;
}*/
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
.col-date,
.col-views {
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

  .col-author,
  .col-views {
    display: none;
  }

  .board-info {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
