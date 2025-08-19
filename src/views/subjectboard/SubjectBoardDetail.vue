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
              <h2 class="post-title">{{ post.title }}</h2>
            </div>
            <div class="post-info">
              <div class="info-item">
                <span class="info-label">✍️ 작성자</span>
                <span class="info-value">{{ post.author }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 작성일</span>
                <span class="info-value">{{
                  formatDateTime(post.createdAt)
                }}</span>
              </div>
              <div v-if="post.updatedAt !== post.createdAt" class="info-item">
                <span class="info-label">🔄 수정일</span>
                <span class="info-value">{{
                  formatDateTime(post.updatedAt)
                }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">👀 조회수</span>
                <span class="info-value">{{ post.views }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 게시글 본문 -->
        <div class="post-body">
          <div class="content-wrapper">
            <div class="post-text" v-html="formatContent(post.content)"></div>
          </div>
        </div>

        <!-- 첨부파일 섹션 -->
        <div
          v-if="post.attachments && post.attachments.length > 0"
          class="attachments-section"
        >
          <h3 class="attachments-title">
            📎 첨부파일 ({{ post.attachments.length }}개)
          </h3>
          <div class="attachments-list">
            <div
              v-for="(file, index) in post.attachments"
              :key="index"
              class="attachment-item"
            >
              <div class="attachment-info">
                <span class="attachment-icon">{{
                  getFileIcon(file.name)
                }}</span>
                <div class="attachment-details">
                  <span class="attachment-name">{{ file.name }}</span>
                  <span class="attachment-size">{{
                    formatFileSize(file.size)
                  }}</span>
                </div>
              </div>
              <button
                @click="downloadFile(file)"
                class="download-btn"
                :disabled="file.downloading"
              >
                {{ file.downloading ? "다운로드 중..." : "💾 다운로드" }}
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

const router = useRouter();
const route = useRoute();

// 상태 관리
const loading = ref(true);
const post = ref(null);

// 권한 체크
const isTeacher = computed(() => {
  return localStorage.getItem("userType") === "teacher";
});

// 컴포넌트 마운트 시 게시글 로드
onMounted(() => {
  loadPost();
});

// 게시글 불러오기
const loadPost = async () => {
  try {
    loading.value = true;
    const postId = route.params.id;

    // 실제로는 API 호출이지만, 여기서는 더미 데이터 사용
    await new Promise((resolve) => setTimeout(resolve, 500)); // 로딩 시뮬레이션

    const postData = getPostById(postId);

    if (postData) {
      post.value = postData;
      // 조회수 증가 (실제로는 API 호출)
      increaseViewCount(postId);
    }
  } catch (error) {
    console.error("게시글 로딩 실패:", error);
  } finally {
    loading.value = false;
  }
};

// 더미 데이터에서 게시글 찾기
/* const getPostById = (id) => {
  const posts = [
    {
      id: 1,
      title: "🏆 8월의 칭찬학생을 발표합니다!",
      author: "선생님",
      createdAt: "2025-08-12T14:30:00Z",
      updatedAt: "2025-08-12T14:30:00Z",
      views: 124,
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
  ];

  return posts.find((post) => post.id == id);
}; */
// SubjectBoardDetail.vue의 getPostById 함수 수정
const getPostById = (id) => {
  const posts = [
    {
      id: 1,
      title: "🏆 8월의 칭찬학생을 발표합니다!",
      author: "선생님",
      createdAt: "2025-08-12T14:30:00Z",
      updatedAt: "2025-08-12T14:30:00Z",
      views: 124,
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
        {
          name: "알파벳송.mp3",
          size: 3072000,
          url: "/files/alphabet-song.mp3",
        },
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
  ];

  return posts.find((post) => post.id == id);
};

// 조회수 증가
const increaseViewCount = async (postId) => {
  // 실제로는 API 호출
  if (post.value) {
    post.value.views += 1;
  }
};

// 날짜 포맷팅
const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 게시글 내용 포맷팅 (줄바꿈 처리)
const formatContent = (content) => {
  return content.replace(/\n/g, "<br>");
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

// 파일 다운로드
const downloadFile = async (file) => {
  try {
    // 다운로드 상태 표시
    file.downloading = true;

    // 실제로는 서버에서 파일을 다운로드
    // 여기서는 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 실제 다운로드 로직 (예시)
    const link = document.createElement("a");
    link.href = file.url || "#";
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`'${file.name}' 파일 다운로드가 시작되었습니다! 💾`);
  } catch (error) {
    console.error("다운로드 실패:", error);
    alert("파일 다운로드에 실패했습니다. 다시 시도해주세요.");
  } finally {
    file.downloading = false;
  }
};

// 게시글 수정
const editPost = () => {
  router.push({ name: "SubjectBoardWrite", params: { id: post.value.id } });
};

// 게시글 삭제
const deletePost = async () => {
  if (
    !confirm(
      `'${post.value.title}' 게시글을 정말 삭제하시겠습니까?\n\n삭제된 게시글은 복구할 수 없습니다.`
    )
  ) {
    return;
  }

  try {
    // 실제로는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 500));

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

/* 로딩 및 에러 상태 */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
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

.error-title {
  font-size: 1.5rem;
  color: #ff9800;
  margin: 0 0 0.5rem 0;
}

.error-description {
  font-size: 1.1rem;
  color: #ffb74d;
  margin: 0 0 2rem 0;
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

.attachments-title {
  font-size: 1.2rem;
  color: #ff9800;
  margin: 0 0 1.5rem 0;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
}

.download-btn:hover:not(:disabled) {
  background: #ffc729;
  transform: translateY(-2px);
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
}
</style>
