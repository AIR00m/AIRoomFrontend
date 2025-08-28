<template>
  <div class="textbook-page">
    <!-- Error Message -->
    <div v-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>오류가 발생했습니다</h3>
      <p>{{ error }}</p>
      <button @click="loadTextbooks" class="retry-btn">다시 시도</button>
    </div>

    <!-- Main Content -->
    <main v-if="!loading && !error" class="main-container">
      <div class="main-inner">
        <!-- Page Header -->
        <section class="page-header">
          <div class="page-text">
            <h2 class="page-title">🌟 디지털 교과서</h2>
            <p class="page-subtitle">우리 반 친구들과 함께하는 스마트 학습!</p>
            <nav class="cute-breadcrumb">
              <span>홈</span>
              <span class="separator">></span>
              <span class="current">디지털교과서</span>
            </nav>
          </div>
        </section>

        <!-- 현재 선택된 교과서 표시 -->
        <div v-if="currentSelectedTextbook" class="selected-textbook-info">
          <div class="selected-icon">📚</div>
          <div class="selected-content">
            <h3 class="selected-title">현재 선택된 교과서</h3>
            <p class="selected-book">
              {{ currentSelectedTextbook.title }} ({{
                currentSelectedTextbook.publisher
              }})
            </p>
            <div class="selected-badges">
              <span class="grade-badge">{{
                getGradeLabel(currentSelectedTextbook.grade)
              }}</span>
              <span class="subject-badge">{{
                getSubjectLabel(currentSelectedTextbook.subject)
              }}</span>
            </div>
          </div>
          <button class="use-textbook-btn" @click="useCurrentTextbook">
            🚀 이 교과서로 학습하기
          </button>
        </div>

        <!-- Notice Box -->
        <div class="notice-box">
          <span class="notice-icon">💡</span>
          <div class="notice-content">
            <p>
              <strong
                >*각 교과서 서비스를 이용하시려면 이미지를 클릭하여
                입장해주세요.</strong
              >
            </p>
            <p>최신 디지털 교과서로 더욱 재미있는 학습을 경험해보세요! 🚀</p>
          </div>
        </div>

        <!-- School Level Tabs (학교) -->
        <section class="grade-section">
          <h3 class="section-title">🏫 학교</h3>
          <div class="grade-tabs">
            <button
              v-for="schoolLevel in schoolLevels"
              :key="schoolLevel.code"
              class="grade-button"
              :class="{ active: currentSchoolLevel === schoolLevel.code }"
              @click="switchSchoolLevel(schoolLevel.code)"
            >
              {{ schoolLevel.icon }} {{ schoolLevel.label }}
            </button>
          </div>
        </section>

        <!-- Detailed Grade Tabs (세부 학년) -->
        <section
          v-if="currentGradeOptions.length > 0"
          class="detailed-grade-section"
        >
          <h4 class="section-title">
            📝 {{ currentSchoolLevel || "전체" }} 학년
          </h4>
          <div class="detailed-grade-tabs">
            <button
              v-for="grade in currentGradeOptions"
              :key="grade.code"
              class="detailed-grade-button"
              :class="{ active: currentGrade === grade.code }"
              @click="switchGrade(grade.code)"
            >
              {{ grade.icon }} {{ grade.label }}
            </button>
          </div>
        </section>

        <!-- Subject Filter -->
        <section class="subject-section">
          <h4 class="section-title">📖 과목</h4>
          <div class="subject-tabs">
            <button
              v-for="subject in subjects"
              :key="subject.code"
              class="subject-button"
              :class="{ active: currentSubject === subject.code }"
              @click="switchSubject(subject.code)"
            >
              {{ subject.icon }} {{ subject.label }}
              <span class="tab-count">{{ getSubjectCount(subject.code) }}</span>
            </button>
          </div>
        </section>

        <!-- Textbook Grid -->
        <section class="textbook-section">
          <div v-if="filteredTextbooks.length === 0" class="empty-state">
            <div class="empty-icon">📕</div>
            <h3 class="empty-title">해당 조건의 교과서가 없어요</h3>
            <p class="empty-description">다른 학년이나 과목을 선택해보세요!</p>
          </div>

          <div v-else class="textbook-grid">
            <div
              v-for="textbook in filteredTextbooks"
              :key="textbook.id"
              class="textbook-card"
              :class="{ 'selected-card': isCurrentlySelected(textbook) }"
              @click="selectTextbook(textbook)"
            >
              <div class="card-image">
                <img
                  :src="getImageUrl(textbook.image)"
                  :alt="textbook.title"
                  :data-textbook-id="textbook.id"
                  @error="handleImageError"
                />
                <div class="image-overlay">
                  <span class="click-hint">🎯 클릭하여 선택하기</span>
                </div>
                <div
                  v-if="isCurrentlySelected(textbook)"
                  class="selected-overlay"
                >
                  <span class="selected-check">✅ 선택됨</span>
                </div>
              </div>

              <div class="card-body">
                <h3 class="textbook-title">{{ textbook.title }}</h3>
                <p class="textbook-author">🏢 {{ textbook.publisher }}</p>
                <div class="textbook-info">
                  <span class="grade-badge">{{
                    getGradeLabel(textbook.grade)
                  }}</span>
                  <span class="subject-badge">{{
                    getSubjectLabel(textbook.subject)
                  }}</span>
                  <span class="semester-badge">{{
                    getSemesterLabel(textbook.semester)
                  }}</span>
                </div>
              </div>

              <div class="card-footer">
                <button class="enter-btn" @click.stop="openTextbook(textbook)">
                  🚀 교과서 열기
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 로딩 오버레이 -->
    <div v-if="tokenLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ loadingMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/utils/apiClient";

const router = useRouter();
const authStore = useAuthStore();

// Reactive data
const currentSchoolLevel = ref(""); // 학교 필터 (초등, 중등, 고등)
const currentGrade = ref(""); // 세부 학년 필터 (FIRST, SECOND...)
const currentSubject = ref("");
const currentSelectedTextbook = ref(null);
const loading = ref(false);
const tokenLoading = ref(false);
const loadingMessage = ref("");
const error = ref(null);

// Constants - 새로운 Grade 시스템에 맞게 수정
const schoolLevels = ref([
  { code: "", label: "전체", icon: "📚" },
  { code: "초등", label: "초등", icon: "🧱" },
  { code: "중등", label: "중등", icon: "🏠" },
  { code: "고등", label: "고등", icon: "🏫" },
]);

// 학교별 세부 학년 매핑
const gradesBySchoolLevel = {
  "": [], // 전체 선택시 빈 배열
  초등: [
    { code: "FIRST", label: "1학년", icon: "🌱" },
    { code: "SECOND", label: "2학년", icon: "🌿" },
    { code: "THIRD", label: "3학년", icon: "🍀" },
    { code: "FOURTH", label: "4학년", icon: "🌸" },
    { code: "FIFTH", label: "5학년", icon: "🌳" },
    { code: "SIXTH", label: "6학년", icon: "⛰️" },
  ],
  중등: [
    { code: "SEVENTH", label: "1학년", icon: "🌱" },
    { code: "EIGHTH", label: "2학년", icon: "🌿" },
    { code: "NINTH", label: "3학년", icon: "🍀" },
  ],
  고등: [
    { code: "TENTH", label: "1학년", icon: "🌸" },
    { code: "ELEVENTH", label: "2학년", icon: "🌳" },
    { code: "TWELFTH", label: "3학년", icon: "⛰️" },
  ],
};

const subjects = ref([
  { code: "", label: "전체", icon: "📚" },
  { code: "MATH", label: "수학", icon: "🔢" },
  { code: "ENGLISH", label: "영어", icon: "🌎" },
  { code: "KOREAN", label: "국어", icon: "📝" },
]);

// 현재 선택된 학교에 따른 학년 옵션을 반환하는 computed property
const currentGradeOptions = computed(() => {
  return gradesBySchoolLevel[currentSchoolLevel.value] || [];
});

// 교재 데이터 (여러 소스에서 가져오기)
const textbooks = ref([]);

// S3 URL을 Public URL로 변환하는 함수
const getImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl.trim() === "") {
    console.log("이미지 URL이 없어서 기본 이미지 사용");
    return "/images/default-textbook.png";
  }

  // 이미 완전한 HTTP URL인 경우 그대로 사용
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  // S3 URI를 Public URL로 변환: s3://airoom/path -> https://airoom.s3.ap-northeast-2.amazonaws.com/path
  if (imageUrl.startsWith("s3://airoom/")) {
    const path = imageUrl.replace("s3://airoom/", "");
    return `https://airoom.s3.ap-northeast-2.amazonaws.com/${path}`;
  }

  // 기타 경우에는 기본 이미지 사용
  console.warn("예상하지 못한 이미지 URL 형식:", imageUrl);
  return "/images/default-textbook.png";
};

// 교재 데이터 로드 (여러 소스 확인)
const loadTextbooks = () => {
  try {
    loading.value = true;
    error.value = null;

    // console.log("=== 교재 데이터 로드 시작 ===");

    // // 1. Auth Store 상태 확인
    // console.log("Auth Store 상태:");
    // console.log("- isLoggedIn:", authStore.isLoggedIn);
    // console.log("- isAuthenticated:", authStore.isAuthenticated);
    // console.log("- hasTextbooks:", authStore.hasTextbooks);
    // console.log("- user:", authStore.user);
    // console.log("- textbooks length:", authStore.textbooks?.length || 0);

    // 2. Auth Store에서 교재 데이터 시도
    if (authStore.textbooks && authStore.textbooks.length > 0) {
      console.log("Auth Store에서 교재 데이터 발견");
      textbooks.value = authStore.textbooks.map((textbook) => ({
        id: textbook.textbookNo || textbook.id,
        title: textbook.textbookTitle || textbook.title,
        publisher: textbook.textbookPublisher || textbook.publisher,
        grade: textbook.textbookGrade || textbook.grade,
        subject: textbook.textbookSubject || textbook.subject,
        semester: textbook.textbookSemester || textbook.semester,
        image: textbook.textbookImageUrl || textbook.image,
        url: textbook.textbookPdfUrl || textbook.url,
      }));
    } else {
      // 3. localStorage에서 교재 데이터 시도
      console.log("⚠️ Auth Store에 교재 데이터 없음, localStorage 확인");
      const savedTextbooks = localStorage.getItem("availableTextbooks");
      console.log("localStorage availableTextbooks:", savedTextbooks);

      if (savedTextbooks) {
        const textbookData = JSON.parse(savedTextbooks);
        console.log(
          "✅ localStorage에서 교재 데이터 발견:",
          textbookData.length,
          "개"
        );

        textbooks.value = textbookData.map((textbook) => ({
          id: textbook.textbookNo || textbook.id,
          title: textbook.textbookTitle || textbook.title,
          publisher: textbook.textbookPublisher || textbook.publisher,
          grade: textbook.textbookGrade || textbook.grade,
          subject: textbook.textbookSubject || textbook.subject,
          semester: textbook.textbookSemester || textbook.semester,
          image: textbook.textbookImageUrl || textbook.image,
          url: textbook.textbookPdfUrl || textbook.url,
        }));

        // Auth Store에도 데이터 저장
        authStore.textbooks = textbookData;
      } else {
        console.log("localStorage에도 교재 데이터 없음");
        throw new Error("교재 데이터가 없습니다. 다시 로그인해주세요.");
      }
    }

    console.log("최종 교재 데이터:", textbooks.value.length, "개");
    console.log("교재 샘플:", textbooks.value[0]);

    // Grade별 분포 확인
    const gradeDistribution = textbooks.value.reduce((acc, book) => {
      acc[book.grade] = (acc[book.grade] || 0) + 1;
      return acc;
    }, {});
    // console.log("Grade별 분포:", gradeDistribution);

    // Subject별 분포 확인
    const subjectDistribution = textbooks.value.reduce((acc, book) => {
      acc[book.subject] = (acc[book.subject] || 0) + 1;
      return acc;
    }, {});
    // console.log("Subject별 분포:", subjectDistribution);
  } catch (err) {
    console.error("🚨 교재 데이터 로드 실패:", err);
    error.value = err.message || "교재 데이터를 불러오는데 실패했습니다.";

    // 디버깅 정보 추가
    console.log("=== 디버깅 정보 ===");
    console.log("localStorage keys:", Object.keys(localStorage));
    console.log(
      "Auth Store 전체 상태:",
      JSON.stringify(
        {
          user: authStore.user,
          textbooks: authStore.textbooks,
          isLoggedIn: authStore.isLoggedIn,
          isAuthenticated: authStore.isAuthenticated,
        },
        null,
        2
      )
    );
  } finally {
    loading.value = false;
  }
};

// Computed properties
const filteredTextbooks = computed(() => {
  console.log(
    "필터링 시작 - currentGrade:",
    currentGrade.value,
    "currentSubject:",
    currentSubject.value
  );
  console.log("전체 교재 수:", textbooks.value.length);

  const filtered = textbooks.value.filter((textbook) => {
    const gradeMatch =
      currentGrade.value === "" || textbook.grade === currentGrade.value;
    const subjectMatch =
      currentSubject.value === "" || textbook.subject === currentSubject.value;

    console.log(
      `교재: ${textbook.title}, Grade: ${textbook.grade}, Subject: ${textbook.subject}, gradeMatch: ${gradeMatch}, subjectMatch: ${subjectMatch}`
    );

    return gradeMatch && subjectMatch;
  });

  console.log("필터링 결과:", filtered.length, "개");
  return filtered;
});

// Helper functions
const getSubjectCount = (subjectCode) => {
  const count = textbooks.value.filter((textbook) => {
    const gradeMatch =
      currentGrade.value === "" || textbook.grade === currentGrade.value;
    if (subjectCode === "") return gradeMatch;
    const subjectMatch = textbook.subject === subjectCode;
    return gradeMatch && subjectMatch;
  }).length;

  console.log(`Subject ${subjectCode} count:`, count);
  return count;
};

// 모든 학년 정보를 포함하는 배열 생성
const allGrades = computed(() => {
  return [
    ...gradesBySchoolLevel["초등"],
    ...gradesBySchoolLevel["중등"],
    ...gradesBySchoolLevel["고등"],
  ];
});

const getGradeLabel = (gradeCode) => {
  const grade = allGrades.value.find((g) => g.code === gradeCode);
  return grade ? grade.label : gradeCode;
};

const getSubjectLabel = (subjectCode) => {
  const subjectMap = {
    MATH: "수학",
    ENGLISH: "영어",
    KOREAN: "국어",
  };
  return subjectMap[subjectCode] || subjectCode;
};

const getSemesterLabel = (semesterCode) => {
  const semesterMap = {
    First: "1학기",
    Second: "2학기",
  };
  return semesterMap[semesterCode] || semesterCode;
};

// 현재 선택된 교과서인지 확인
const isCurrentlySelected = (textbook) => {
  return (
    currentSelectedTextbook.value &&
    currentSelectedTextbook.value.id === textbook.id
  );
};

// 현재 선택된 교과서 로드
const loadCurrentSelectedTextbook = () => {
  if (authStore.selectedTextbook) {
    currentSelectedTextbook.value = authStore.selectedTextbook;
    console.log(
      "Auth Store에서 선택된 교과서 로드:",
      currentSelectedTextbook.value
    );
  } else {
    // localStorage에서 복원 시도
    const selectedTextbook = localStorage.getItem("selectedTextbook");
    if (selectedTextbook) {
      try {
        currentSelectedTextbook.value = JSON.parse(selectedTextbook);
        console.log(
          "localStorage에서 선택된 교과서 로드:",
          currentSelectedTextbook.value
        );
      } catch (error) {
        console.error("교과서 정보 파싱 오류:", error);
        currentSelectedTextbook.value = null;
      }
    }
  }
};

// 교과서 선택
const selectTextbook = (textbook) => {
  const textbookData = {
    id: textbook.id,
    title: textbook.title,
    publisher: textbook.publisher,
    grade: textbook.grade,
    subject: textbook.subject,
    semester: textbook.semester,
    image: textbook.image,
    url: textbook.url,
  };

  authStore.selectTextbook(textbookData);
  currentSelectedTextbook.value = textbookData;
  console.log("교과서 선택됨:", textbookData);
};

// 현재 교과서로 학습하기
const useCurrentTextbook = () => {
  if (currentSelectedTextbook.value) {
    openTextbook(currentSelectedTextbook.value);
  }
};

// Methods - 새로운 학교/학년 시스템에 맞게 수정
const switchSchoolLevel = (schoolLevelCode) => {
  console.log("학교 변경:", schoolLevelCode);
  currentSchoolLevel.value = schoolLevelCode;
  currentGrade.value = ""; // 학교 변경시 세부 학년 초기화
};

const switchGrade = (gradeCode) => {
  console.log("학년 변경:", gradeCode);
  currentGrade.value = gradeCode;
};

const switchSubject = (subjectCode) => {
  console.log("과목 변경:", subjectCode);
  currentSubject.value = subjectCode;
};

// 교과서 열기 - 토큰 발급 API 호출
const openTextbook = async (textbook) => {
  if (!authStore.user?.memberId) {
    alert("🔒 로그인이 필요합니다. 로그인 페이지로 이동합니다.");
    router.push({ name: "Login" });
    return;
  }

  try {
    tokenLoading.value = true;
    loadingMessage.value = "교과서 준비 중...";

    console.log("교과서 선택 및 토큰 발급 요청:", {
      memberId: authStore.user.memberId,
      textbookNo: textbook.id,
    });

    // 교과서 선택 정보 저장 (통일된 데이터 구조 사용)
    const textbookData = {
      id: textbook.id,
      title: textbook.title,
      publisher: textbook.publisher,
      grade: textbook.grade,
      subject: textbook.subject,
      semester: textbook.semester,
      image: textbook.image,
      url: textbook.url,
    };

    authStore.selectTextbook(textbookData);
    currentSelectedTextbook.value = textbookData;

    loadingMessage.value = "토큰 발급 중...";

    // Auth Store를 통해 토큰 발급 요청
    const result = await authStore.requestAccessToken(textbookData.id);

    if (result.success) {
      console.log("토큰 발급 성공");
      loadingMessage.value = "에이전트 세션 준비 중...";

      // 에이전트 세션 바인딩은 Auth Store에서 이미 처리됨

      loadingMessage.value = "페이지 이동 중...";

      // 사용자 타입에 따라 페이지 이동
      const userType = authStore.tokenInfo?.role;

      if (userType === "student") {
        router.push({ name: "StudentMain" });
      } else if (userType === "teacher") {
        router.push({ name: "TeacherMain" });
      } else {
        alert("⚠️ 사용자 타입을 확인할 수 없습니다. 다시 로그인해주세요.");
        authStore.logout();
        router.push({ name: "Login" });
      }
    } else {
      throw new Error(result.error || "토큰 발급에 실패했습니다.");
    }
  } catch (error) {
    console.error("토큰 발급 실패:", error);
    alert(`토큰 발급 실패: ${error.message || error}`);
  } finally {
    tokenLoading.value = false;
    loadingMessage.value = "";
  }
};

const handleImageError = (event) => {
  console.warn("이미지 로드 실패:", event.target.src);
  event.target.src = "/images/default-textbook.png";
};

onMounted(() => {
  // // 전체 상태 확인
  // console.log("현재 상태:");
  // console.log("- 현재 경로:", router.currentRoute.value.path);
  // console.log("- Auth Store 로그인 상태:", authStore.isLoggedIn);
  // console.log("- Auth Store 인증 상태:", authStore.isAuthenticated);
  // console.log("- localStorage 키들:", Object.keys(localStorage));

  // Auth Store 상태 체크
  if (!authStore.isLoggedIn) {
    alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
    router.push({ name: "Login" });
    return;
  }

  // 사용자 정보 확인
  if (!authStore.user) {
    console.warn("⚠️ 사용자 정보가 없습니다. Auth Store 상태를 복원합니다.");
    authStore.loadFromLocalStorage();
  }

  // console.log("사용자 정보:", authStore.user);
  // console.log("사용 가능한 교재 수:", authStore.textbooks?.length || 0);

  // 선택된 교과서 로드
  loadCurrentSelectedTextbook();

  // 교재 데이터 로드
  loadTextbooks();
});
</script>

<style scoped>
/* 전역 폰트 및 배경 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}

.textbook-page {
  background: linear-gradient(135deg, #fff9e6 0%, #fff3d9 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 로딩 오버레이 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #ffffff20;
  border-top: 6px solid #ffdd29;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
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
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #fff;
  border-radius: 20px;
  margin: 2rem;
  padding: 2rem;
  border: 3px solid #ffcdd2;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

/* Main Content */
.main-container {
  flex: 1;
  padding: 2rem;
}

.main-inner {
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  background: linear-gradient(
    135deg,
    rgba(255, 152, 0, 0.15),
    rgba(255, 193, 7, 0.25)
  );
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  border: 2px solid rgba(255, 152, 0, 0.3);
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #e65100;
  margin: 0 0 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #f57c00;
  margin-bottom: 0.5rem;
}

.cute-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #ff9800;
}

.separator {
  margin: 0 0.25rem;
}

.current {
  font-weight: 700;
  color: #e65100;
}

/* 선택된 교과서 정보 박스 */
.selected-textbook-info {
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
  border: 3px solid #4caf50;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.2);
}

.selected-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.selected-content {
  flex-grow: 1;
}

.selected-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2e7d32;
  margin: 0 0 0.5rem;
}

.selected-book {
  font-size: 1rem;
  font-weight: 600;
  color: #388e3c;
  margin: 0 0 0.5rem;
}

.selected-badges {
  display: flex;
  gap: 0.5rem;
}

.use-textbook-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
  flex-shrink: 0;
}

.use-textbook-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

/* Notice Box */
.notice-box {
  background: #fffbf0;
  border: 2px dashed #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  gap: 1rem;
  color: #f57c00;
}

.notice-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notice-content p {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.notice-content p:last-child {
  margin-bottom: 0;
}

/* Section Styles */
.grade-section,
.detailed-grade-section,
.subject-section,
.textbook-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #e65100;
  margin-bottom: 1rem;
}

/* Grade Tabs (학교) */
.grade-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: #fff5d6;
  border-radius: 20px;
  border: 2px solid #ffe066;
}

.grade-button {
  flex: 1;
  padding: 12px 20px;
  border: 0;
  border-radius: 15px;
  background: none;
  color: #ff9800;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.grade-button:hover:not(.active) {
  background: rgba(255, 221, 41, 0.3);
}

.grade-button.active {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  transform: translateY(-2px);
}

/* Detailed Grade Tabs (세부 학년) */
.detailed-grade-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: #fff5d6;
  border-radius: 20px;
  border: 2px solid #ffe066;
}

.detailed-grade-button {
  flex: 1;
  padding: 12px 20px;
  border: 0;
  border-radius: 15px;
  background: none;
  color: #ff9800;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.detailed-grade-button:hover:not(.active) {
  background: rgba(255, 221, 41, 0.3);
}

.detailed-grade-button.active {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  transform: translateY(-2px);
}

/* Subject Tabs */
.subject-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: #fff5d6;
  border-radius: 20px;
  border: 2px solid #ffe066;
  flex-wrap: wrap;
}

.subject-button {
  flex: 1;
  min-width: 120px;
  padding: 12px 20px;
  border: 0;
  border-radius: 15px;
  background: none;
  color: #ff9800;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.subject-button:hover:not(.active) {
  background: rgba(255, 221, 41, 0.3);
}

.subject-button.active {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  transform: translateY(-2px);
}

.tab-count {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 0.8em;
  margin-left: 0.5rem;
}

.subject-button.active .tab-count,
.grade-button.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* Textbook Grid */
.textbook-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  background: #fffbf0;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
}

/* Textbook Card */
.textbook-card {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.textbook-card:hover {
  border-color: #ffdd29;
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.3);
}

.textbook-card.selected-card {
  border-color: #4caf50;
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.card-image {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.textbook-card:hover .card-image img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 221, 41, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.textbook-card:hover .image-overlay {
  opacity: 1;
}

.selected-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #4caf50;
  color: white;
  padding: 0.5rem;
  border-radius: 15px;
  font-weight: 700;
  font-size: 0.8rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.selected-check {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.click-hint {
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.card-body {
  padding: 1.25rem;
  flex-grow: 1;
}

.textbook-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #8c6d32;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.textbook-author {
  color: #ffb74d;
  margin: 0 0 1rem;
  font-weight: 600;
}

.textbook-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.grade-badge,
.subject-badge,
.semester-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.grade-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.subject-badge {
  background: #fce4ec;
  color: #c2185b;
}

.semester-badge {
  background: #f3e5f5;
  color: #7b1fa2;
}

.card-footer {
  padding: 1rem;
  background: #fff9e6;
}

.enter-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  background: #ffdd29;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.enter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fffbf0;
  border-radius: 20px;
  border: 3px solid #ffb74d;
  grid-column: 1 / -1;
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .textbook-page {
    padding: 0;
  }

  .main-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .textbook-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    padding: 1rem;
  }

  .grade-tabs,
  .detailed-grade-tabs,
  .subject-tabs {
    flex-direction: column;
  }

  .selected-textbook-info {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 1.5rem;
  }

  .textbook-grid {
    grid-template-columns: 1fr;
  }

  .detailed-grade-tabs,
  .subject-tabs {
    flex-direction: column;
  }

  .detailed-grade-button,
  .subject-button {
    min-width: auto;
  }
}

/* 접근성 및 사용성 개선 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

button:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 호버 효과는 마우스가 있는 기기에서만 */
@media (hover: none) {
  .textbook-card:hover {
    transform: none;
    box-shadow: none;
  }

  .textbook-card:hover .image-overlay {
    opacity: 0;
  }
}
</style>
