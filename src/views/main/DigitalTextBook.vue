<template>
  <div class="textbook-page">
    <!-- Main Content -->
    <main class="main-container">
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
                currentSelectedTextbook.author
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

        <!-- School Grade Tabs -->
        <section class="grade-section">
          <h3 class="section-title">🏫 학급</h3>
          <div class="grade-tabs">
            <button
              v-for="grade in grades"
              :key="grade.code"
              class="grade-button"
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
            <div class="empty-icon">📔</div>
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
                  :src="textbook.image"
                  :alt="textbook.title"
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
                <p class="textbook-author">✏️ {{ textbook.author }}</p>
                <div class="textbook-info">
                  <span class="grade-badge">{{
                    getGradeLabel(textbook.grade)
                  }}</span>
                  <span class="subject-badge">{{
                    getSubjectLabel(textbook.subject)
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

    <!-- Footer -->
    <footer class="footer-container">
      <div class="footer-inner">
        <div class="company-info">
          <div class="company-box">
            <img
              src="/public/textbook.jpg"
              alt="천재교육"
              class="company-logo"
            />
            <div class="company-details">
              <p><strong>대표:</strong> 강호철</p>
              <p><strong>주소:</strong> 서울시 금천구 가산로9길 54</p>
              <p><strong>사업자 등록번호:</strong> 119-81-19350</p>
            </div>
          </div>

          <div class="company-box">
            <img
              src="/public/textbook.jpg"
              alt="천재교과서"
              class="company-logo"
            />
            <div class="company-details">
              <p><strong>대표:</strong> 박정과</p>
              <p>
                <strong>주소:</strong> 서울특별시 금천구 가산디지털1로 16,
                2011호
              </p>
              <p><strong>사업자 등록번호:</strong> 119-81-70643</p>
            </div>
          </div>
        </div>

        <div class="footer-links">
          <a href="https://www.chunjae.co.kr/" target="_blank">천재교육</a>
          <a href="https://www.chunjaetext.co.kr/" target="_blank"
            >천재교과서</a
          >
        </div>

        <p class="copyright">
          Copyright ©2024 By Chunjae Co.,Ltd. All Rights Reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Reactive data
const currentUser = ref("김민수");
const currentGrade = ref("E");
const currentSubject = ref("");
const currentSelectedTextbook = ref(null);

// Constants
const grades = ref([
  { code: "E", label: "초등", icon: "🌱" },
  { code: "M", label: "중학", icon: "🌿" },
  { code: "H", label: "고등", icon: "🌳" },
]);

const subjects = ref([
  { code: "", label: "전체", icon: "📚" },
  { code: "MA", label: "수학", icon: "🔢" },
  { code: "EN", label: "영어", icon: "🌍" },
  { code: "CS", label: "정보", icon: "💻" },
]);

// Textbook data
const textbooks = ref([
  {
    id: 247,
    title: "초등 수학 3-1",
    author: "박만구",
    grade: "E",
    subject: "MA",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/247/gate_cen_247.png",
    url: "/web-agency/247",
  },
  {
    id: 248,
    title: "초등 수학 3-2",
    author: "박만구",
    grade: "E",
    subject: "MA",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/248/gate_cen_248.png",
    url: "/web-agency/248",
  },
  {
    id: 249,
    title: "초등 수학 4-1",
    author: "박만구",
    grade: "E",
    subject: "MA",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/249/gate_cen_249.png",
    url: "/web-agency/249",
  },
  {
    id: 250,
    title: "초등 수학 4-2",
    author: "박만구",
    grade: "E",
    subject: "MA",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/250/gate_cen_250.png",
    url: "/web-agency/250",
  },
  {
    id: 254,
    title: "초등 수학 3-1",
    author: "한대희",
    grade: "E",
    subject: "MA",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/254/gate_cen_254.png",
    url: "/web-agency/254",
  },
  {
    id: 255,
    title: "초등 수학 3-2",
    author: "한대희",
    grade: "E",
    subject: "MA",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/255/gate_cen_255.png",
    url: "/web-agency/255",
  },
  {
    id: 257,
    title: "초등 영어 3",
    author: "김태은",
    grade: "E",
    subject: "EN",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/257/gate_cen_257.png",
    url: "/web-agency/257",
  },
  {
    id: 261,
    title: "초등 영어 4",
    author: "김태은",
    grade: "E",
    subject: "EN",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/261/gate_cen_261.png",
    url: "/web-agency/261",
  },
  {
    id: 251,
    title: "초등 영어 3",
    author: "이동환",
    grade: "E",
    subject: "EN",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/251/gate_cen_251.png",
    url: "/web-agency/251",
  },
  {
    id: 256,
    title: "초등 영어 4",
    author: "이동환",
    grade: "E",
    subject: "EN",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/256/gate_cen_256.png",
    url: "/web-agency/256",
  },
  {
    id: 2,
    title: "초등 정보 3-4",
    author: "박선주",
    grade: "E",
    subject: "CS",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/002/gate_cen_002.png",
    url: "/web-agency/002",
  },
  {
    id: 3,
    title: "초등 정보 3-4(늘봄)",
    author: "박선주",
    grade: "E",
    subject: "CS",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/003/gate_cen_003.png",
    url: "/web-agency/003",
  },
  // 중학교 교과서
  {
    id: 237,
    title: "중학 수학 1",
    author: "김동재",
    grade: "M",
    subject: "MA",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/237/gate_cen_237.png",
    url: "/web-agency/237",
  },
  {
    id: 238,
    title: "중학 수학 1",
    author: "김화경",
    grade: "M",
    subject: "MA",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/238/gate_cen_238.png",
    url: "/web-agency/238",
  },
  {
    id: 266,
    title: "중학 영어 1",
    author: "소영순",
    grade: "M",
    subject: "EN",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/266/gate_cen_266.png",
    url: "/web-agency/266",
  },
  {
    id: 241,
    title: "중학 영어 1",
    author: "이상기",
    grade: "M",
    subject: "EN",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/241/gate_cen_241.png",
    url: "/web-agency/241",
  },
  {
    id: 995,
    title: "중등 정보",
    author: "김현철",
    grade: "M",
    subject: "CS",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/995/gate_cen_995.png",
    url: "/web-agency/995",
  },
  // 고등학교 교과서
  {
    id: 252,
    title: "고등 공통수학 1",
    author: "전인태",
    grade: "H",
    subject: "MA",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/252/gate_cen_252.png",
    url: "/web-agency/252",
  },
  {
    id: 265,
    title: "고등 공통수학 2",
    author: "전인태",
    grade: "H",
    subject: "MA",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/265/gate_cen_265.png",
    url: "/web-agency/265",
  },
  {
    id: 245,
    title: "고등 공통영어 1",
    author: "강상구",
    grade: "H",
    subject: "EN",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/245/gate_cen_245.png",
    url: "/web-agency/245",
  },
  {
    id: 246,
    title: "고등 공통영어 2",
    author: "강상구",
    grade: "H",
    subject: "EN",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/246/gate_cen_246.png",
    url: "/web-agency/246",
  },
  {
    id: 991,
    title: "고등 정보",
    author: "김현철",
    grade: "H",
    subject: "CS",
    image:
      "https://aidtcdn.aitextbook.co.kr/lcms/webdisplay/stu/991/gate_cen_991.png",
    url: "/web-agency/991",
  },
]);

// Computed properties
const filteredTextbooks = computed(() => {
  return textbooks.value.filter((textbook) => {
    const gradeMatch = textbook.grade === currentGrade.value;
    const subjectMatch =
      currentSubject.value === "" ||
      textbook.subject === currentSubject.value ||
      (currentSubject.value === "MA" &&
        ["MA", "CM1", "CM2"].includes(textbook.subject)) ||
      (currentSubject.value === "EN" &&
        ["EN", "CE1", "CE2"].includes(textbook.subject));

    return gradeMatch && subjectMatch;
  });
});

// Helper functions
const getSubjectCount = (subjectCode) => {
  return textbooks.value.filter((textbook) => {
    const gradeMatch = textbook.grade === currentGrade.value;
    if (subjectCode === "") return gradeMatch;

    const subjectMatch =
      textbook.subject === subjectCode ||
      (subjectCode === "MA" &&
        ["MA", "CM1", "CM2"].includes(textbook.subject)) ||
      (subjectCode === "EN" && ["EN", "CE1", "CE2"].includes(textbook.subject));

    return gradeMatch && subjectMatch;
  }).length;
};

const getGradeLabel = (gradeCode) => {
  const grade = grades.value.find((g) => g.code === gradeCode);
  return grade ? grade.label : "";
};

const getSubjectLabel = (subjectCode) => {
  const subjectMap = {
    MA: "수학",
    CM1: "수학",
    CM2: "수학",
    EN: "영어",
    CE1: "영어",
    CE2: "영어",
    CS: "정보",
  };
  return subjectMap[subjectCode] || "";
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
  const selectedTextbook = localStorage.getItem("selectedTextbook");
  if (selectedTextbook) {
    try {
      currentSelectedTextbook.value = JSON.parse(selectedTextbook);
    } catch (error) {
      console.error("교과서 정보 파싱 오류:", error);
      currentSelectedTextbook.value = null;
    }
  }
};

// 교과서 선택 (로컬스토리지에만 저장, 페이지 이동하지 않음)
const selectTextbook = (textbook) => {
  // 선택한 교과서 정보를 로컬스토리지에 저장
  const textbookData = {
    id: textbook.id,
    title: textbook.title,
    author: textbook.author,
    grade: textbook.grade,
    subject: textbook.subject,
    image: textbook.image,
    url: textbook.url,
  };

  localStorage.setItem("selectedTextbook", JSON.stringify(textbookData));
  currentSelectedTextbook.value = textbook;

  // 다른 컴포넌트에서 감지할 수 있도록 커스텀 이벤트 발생
  window.dispatchEvent(
    new CustomEvent("textbook-selected", {
      detail: textbookData,
    })
  );

  // 성공 메시지
  alert(`📚 "${textbook.title}" 교과서가 선택되었습니다!`);
};

// 현재 교과서로 학습하기
const useCurrentTextbook = () => {
  if (currentSelectedTextbook.value) {
    openTextbook(currentSelectedTextbook.value);
  }
};

// Methods
const switchGrade = (gradeCode) => {
  currentGrade.value = gradeCode;
};

const switchSubject = (subjectCode) => {
  currentSubject.value = subjectCode;
};

const resetFilters = () => {
  currentGrade.value = "E";
  currentSubject.value = "";
};

const openTextbook = (textbook) => {
  // 로컬스토리지에서 사용자 타입 확인
  const userType = localStorage.getItem("userType");
  // 사용자 타입이 없으면 로그인 페이지로 리다이렉트
  if (!userType) {
    alert("🔐 로그인이 필요합니다. 로그인 페이지로 이동합니다.");
    router.push({ name: "Login" });
    return;
  }

  // 선택한 교과서 정보를 로컬스토리지에 저장
  const textbookData = {
    id: textbook.id,
    title: textbook.title,
    author: textbook.author,
    grade: textbook.grade,
    subject: textbook.subject,
    image: textbook.image,
    url: textbook.url,
  };

  localStorage.setItem("selectedTextbook", JSON.stringify(textbookData));
  currentSelectedTextbook.value = textbook;

  // 다른 컴포넌트에서 감지할 수 있도록 커스텀 이벤트 발생
  window.dispatchEvent(
    new CustomEvent("textbook-selected", {
      detail: textbookData,
    })
  );

  // 사용자 타입에 따라 해당 메인 페이지로 이동
  if (userType === "student") {
    alert(`📚 ${textbook.title} 교과서로 학습을 시작해요! 🎉`);
    window.location.href = "/student";
  } else if (userType === "teacher") {
    alert(`👩‍🏫 ${textbook.title} 교과서로 수업을 시작해요! 🎉`);
    window.location.href = "/teacher";
  } else {
    // 잘못된 사용자 타입인 경우
    alert("⚠️ 사용자 타입을 확인할 수 없습니다. 다시 로그인해주세요.");
    localStorage.removeItem("userType");
    window.location.href = "/login";
  }
};

const handleImageError = (event) => {
  event.target.src = "/images/default-textbook.png";
};

const logout = () => {
  if (confirm("정말 로그아웃 하시겠어요?")) {
    console.log("Logging out...");
    alert("로그아웃 되었습니다. 안녕히 가세요! 👋");
  }
};

// 컴포넌트 마운트 시 현재 선택된 교과서 로드
onMounted(() => {
  loadCurrentSelectedTextbook();
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
}

/* Header Styles */
.header-container {
  background: linear-gradient(135deg, #ffdd29 0%, #ffc107 100%);
  border-bottom: 3px solid #ff9800;
  box-shadow: 0 4px 20px rgba(255, 152, 0, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.logo-section {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-section:hover {
  transform: scale(1.05);
}

.logo {
  margin: 0;
}

.logo-text {
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  display: block;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.logo-sub {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  display: block;
  margin-top: 0.2rem;
}

.account-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  text-align: right;
}

.greeting {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  display: block;
}

.user-name {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.btn-logout {
  background: rgba(255, 255, 255, 0.9);
  color: #ff9800;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn-logout:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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

/* Grade Tabs */
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

.subject-button.active .tab-count {
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

.ai-badge {
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 700;
  display: inline-block;
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
.subject-badge {
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

/* Footer */
.footer-container {
  background: #f5f5f5;
  border-top: 2px solid #e0e0e0;
  margin-top: 2rem;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.company-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.company-box {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.company-logo {
  height: 22px;
  flex-shrink: 0;
}

.company-details p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.footer-links {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.footer-links a {
  color: #ff9800;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #e65100;
}

.copyright {
  font-size: 0.85rem;
  color: #999;
  text-align: center;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .textbook-page {
    padding: 0;
  }

  .main-container {
    padding: 1rem;
  }

  .header-inner {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .logo-text {
    font-size: 1.4rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .textbook-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    padding: 1rem;
  }

  .grade-tabs,
  .subject-tabs {
    flex-direction: column;
  }

  .company-info {
    grid-template-columns: 1fr;
  }

  .footer-links {
    justify-content: center;
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

  .subject-tabs {
    flex-direction: column;
  }

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
