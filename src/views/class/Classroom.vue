<!-- src/views/Classroom.vue -->
<template>
  <div>
    <!-- 떠다니는 장식 요소들 -->
    <div class="floating-decorations">
      <div class="floating-item item1">📚</div>
      <div class="floating-item item2">🌟</div>
      <div class="floating-item item3">✨</div>
      <div class="floating-item item4">🎈</div>
      <div class="floating-item item5">📝</div>
      <div class="floating-item item6">🎯</div>
    </div>

    <!-- 헤더 -->
    <header class="header">
      <Header />
    </header>

    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 브레드크럼 -->
      <div class="breadcrumb-section">
        <h1 class="page-title">🏫 우리 반 수업</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a href="#" @click.prevent>🏠 홈</a>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              우리 반 수업
            </li>
          </ol>
        </nav>
      </div>

      <!-- 학습 목차 (전체 폭) -->
      <div class="content-layout">
        <div class="session-section">
          <div class="session-header">📝 단원별 학습</div>

          <!-- 로딩 / 에러 / 안내 -->
          <div class="session-list-container">
            <div v-if="loading" class="helper-row">
              <span>불러오는 중...</span>
            </div>

            <div v-else-if="error" class="helper-row error">
              <span>{{ error }}</span>
            </div>

            <!-- 단원 리스트 -->
            <template v-else>
              <div
                v-for="unit in units"
                :key="unit.unitNum"
                class="session-item"
                @click="selectUnit(unit)"
              >
                <div class="session-content">
                  <div class="session-info">
                    <div class="session-thumbnail">
                      {{ twoDigits(unit.unitNum) }}
                    </div>
                    <div class="session-details">
                      <h3>{{ unit.unitTitle }}</h3>
                    </div>
                  </div>
                  <div class="session-buttons">
                    <button
                      class="btn-session btn-session-primary"
                      @click.stop="openClassroomView(unit)"
                    >
                      🚀 수업하기
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="units.length === 0" class="helper-row">
                표시할 단원이 없습니다.
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";
import apiClient from "@/utils/apiClient";

export default {
  name: "ClassroomApp",
  components: { Header },
  setup() {
    const router = useRouter();

    // === 상태 ===
    const units = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // === 유틸 ===
    const twoDigits = (n) => String(n ?? "").padStart(2, "0");

    // === API 호출 ===
    const fetchUnits = async () => {
      loading.value = true;
      error.value = null;

      try {
        // localStorage에서 selectedTextbook 정보 가져오기
        const selectedTextbook = localStorage.getItem("selectedTextbook");
        if (!selectedTextbook) {
          throw new Error("선택된 교과서 정보가 없습니다.");
        }

        const textbook = JSON.parse(selectedTextbook);
        const textbookNo = textbook.id;

        if (!textbookNo) {
          throw new Error("교과서 번호가 없습니다.");
        }

        console.log("교과서 번호:", textbookNo);

        // apiClient에 명시적 헤더 옵션 전달
        const data = await apiClient.get(`/api/textbooks/units/${textbookNo}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        console.log("API 응답 데이터:", data);

        // API 응답 구조에 맞게 처리
        if (Array.isArray(data)) {
          units.value = data.map((unit) => ({
            ...unit,
            unitNo: unit.unitNo,
            unitTitle: unit.unitTitle,
          }));
        } else {
          units.value = [];
        }
      } catch (err) {
        console.error("단원 목록 조회 실패:", err);
        error.value = err.message || "단원 목록을 불러오지 못했습니다.";
        units.value = [];
      } finally {
        loading.value = false;
      }
    };

    // === UI 액션 ===
    const selectUnit = (unit) => {
      console.log("선택된 단원:", unit.unitNum, unit.unitTitle);
    };

    const openClassroomView = (unit) => {
      try {
        const url = `/classroom/view/${unit.unitNo}`;
        const w = window.open(
          url,
          "_blank",
          "width=1200,height=800,scrollbars=yes,resizable=yes"
        );
        if (!w) alert("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.");
      } catch (err) {
        console.error("수업 창 열기 실패:", err);
      }
    };

    // === 라이프사이클 ===
    onMounted(() => {
      fetchUnits();
    });

    return {
      units,
      loading,
      error,
      twoDigits,
      selectUnit,
      openClassroomView,
    };
  },
};
</script>

<style scoped>
/* Bootstrap override */
body {
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
  background-color: #fff9e6 !important;
  color: #333;
  line-height: 1.6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 헤더 스타일 */
.navbar {
  background: #ffdd29 !important;
}

.logo-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  animation: wiggle 2s ease-in-out infinite;
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  75% {
    transform: rotate(-5deg);
  }
}

.subject-badge {
  background: rgba(255, 255, 255, 0.2) !important;
  font-weight: 600 !important;
}

.navbar-nav .nav-link {
  font-size: 1.1rem !important;
  padding: 0.7rem 1.2rem !important;
  transition: all 0.3s;
  border-radius: 20px !important;
  font-weight: 600 !important;
}

.navbar-nav .nav-link:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateY(-2px);
}

.navbar-nav .nav-link.active-nav {
  background: rgba(255, 255, 255, 0.2) !important;
}

.navbar-nav .nav-item {
  margin-right: 0.8rem;
}

.navbar-brand {
  font-size: 2rem !important;
  font-weight: 800 !important;
}

.navbar-toggler-icon {
  filter: invert(1);
}

/* 메인 컨테이너 */
.main-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

/* 브레드크럼 */
.breadcrumb-section {
  background: white;
  border-radius: 25px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.15);
  border: 3px solid #ffe066;
  animation: bounceIn 0.6s ease;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ff9800;
  margin-bottom: 1rem;
}

.breadcrumb {
  background: none;
  margin-bottom: 0;
  padding: 0;
  font-weight: 600;
}

.breadcrumb-item a {
  color: #ffb74d;
  text-decoration: none;
}

.breadcrumb-item.active {
  color: #ff9800;
  font-weight: 600;
}

/* 학습 목차 전체 폭 레이아웃 */
.content-layout {
  background: white;
  border-radius: 25px;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.15);
  border: 3px solid #ffe066;
  overflow: hidden;
  min-height: 600px;
  animation: slideInUp 0.8s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 학습 목차 */
.session-section {
  width: 100%;
  background: #fffbf0;
  display: flex;
  flex-direction: column;
}

.session-header {
  background: #ffdd29;
  color: white;
  padding: 1.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.session-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* 안내/에러 줄 */
.helper-row {
  background: #fff5d6;
  border: 2px solid #ffe066;
  color: #8d6e00;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  font-weight: 600;
}
.helper-row.error {
  background: #ffe6e6;
  border-color: #ff9b9b;
  color: #b20000;
}

.session-item {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  animation: slideIn 0.5s ease-out forwards;
}

.session-item:last-child {
  margin-bottom: 0;
}

/* hover 효과 */
.session-item:hover {
  background: #ffdd29;
  color: white;
  border-color: #ffdd29;
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(255, 221, 41, 0.3);
}

.session-item:hover .session-thumbnail {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

.session-item:hover .unit-image {
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.session-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex: 1;
  min-width: 0;
}

.session-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  background: #fff5d6;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #ff9800;
  border: 2px solid #ffe066;
  transition: all 0.3s ease;
}

.unit-image {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid #ffe066;
  background: #fff5d6;
  transition: all 0.3s ease;
}

.unit-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.session-details h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.session-details p {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
  font-weight: 500;
}

.session-buttons {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.btn-session {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-session-primary {
  background: #ff9800;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}
.btn-session-primary:hover {
  background: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

/* 떠다니는 장식 요소들 */
.floating-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
.floating-item {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}
.item1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}
.item2 {
  top: 20%;
  right: 10%;
  animation-delay: 1s;
}
.item3 {
  top: 60%;
  left: 5%;
  animation-delay: 2s;
}
.item4 {
  top: 80%;
  right: 20%;
  animation-delay: 3s;
}
.item5 {
  top: 40%;
  left: 80%;
  animation-delay: 4s;
}
.item6 {
  top: 70%;
  right: 5%;
  animation-delay: 5s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
  }
  50% {
    transform: translateY(0px) rotate(180deg);
  }
  75% {
    transform: translateY(-10px) rotate(270deg);
  }
}

/* 애니메이션 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.session-item:nth-child(1) {
  animation-delay: 0.1s;
}
.session-item:nth-child(2) {
  animation-delay: 0.2s;
}
.session-item:nth-child(3) {
  animation-delay: 0.3s;
}
.session-item:nth-child(4) {
  animation-delay: 0.4s;
}
.session-item:nth-child(5) {
  animation-delay: 0.5s;
}
.session-item:nth-child(6) {
  animation-delay: 0.6s;
}
.session-item:nth-child(7) {
  animation-delay: 0.7s;
}

/* 반응형 */
@media (max-width: 768px) {
  .main-container {
    padding: 0 1rem;
  }
  .session-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .session-buttons {
    width: 100%;
    justify-content: center;
  }
  .floating-item {
    font-size: 1.2rem;
  }
}

/* 스크롤바 */
.session-list-container::-webkit-scrollbar {
  width: 8px;
}
.session-list-container::-webkit-scrollbar-track {
  background: #fff5d6;
  border-radius: 4px;
}
.session-list-container::-webkit-scrollbar-thumb {
  background: #ffe066;
  border-radius: 4px;
}
.session-list-container::-webkit-scrollbar-thumb:hover {
  background: #ffdd29;
}

/* 접근성 */
.btn-session:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 애니메이션 감소 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
