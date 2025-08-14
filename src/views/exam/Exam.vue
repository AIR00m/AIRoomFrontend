<template>
  <div class="cute-exam-app">
    <!-- 귀여운 네비게이션 -->
    <nav class="cute-navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <div class="logo-icon">🎓</div>
          <strong>아이룸</strong>
        </div>

        <div class="nav-menu">
          <div class="nav-links">
            <a href="#" class="nav-link">🏠 홈</a>
            <a href="#" class="nav-link">📚 우리 반 수업</a>
            <a href="#" class="nav-link">🎯 맞춤 학습</a>
            <a href="#" class="nav-link">📝 과제</a>
            <a href="#" class="nav-link active">⭐ 평가</a>
            <a href="#" class="nav-link">📊 학습 리포트</a>
          </div>

          <div class="nav-actions">
            <div class="user-info">
              <span class="user-badge">{{ subjectInfo }} 🌟</span>
            </div>
            <button class="nav-btn" title="알림">
              🔔
              <span class="notification-badge">1</span>
            </button>
            <button class="nav-btn" title="채팅">
              💬
              <span class="notification-badge chat-badge">5</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <!-- 귀여운 헤더 -->
      <div class="cute-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="header-title">⭐ 나의 평가 도전기 🎯</h1>
            <p class="header-subtitle">
              우리가 배운 걸 확인해볼 시간이에요! 차근차근 해보자구요 ✨
            </p>
            <nav class="cute-breadcrumb">
              <span>🏠 홈</span>
              <span class="separator">></span>
              <span class="current">⭐ 나의 평가</span>
            </nav>
          </div>
        </div>

        <!-- 귀여운 장식들 -->
        <div class="header-decorations">
          <div class="deco-item deco1">🌟</div>
          <div class="deco-item deco2">🎈</div>
          <div class="deco-item deco3">✨</div>
          <div class="deco-item deco4">🏆</div>
        </div>
      </div>

      <!-- 귀여운 탭 컨테이너 -->
      <div class="cute-tab-container">
        <!-- 탭 네비게이션 -->
        <div class="tab-nav">
          <button
            v-for="(tab, index) in tabs"
            :key="index"
            :class="['tab-button', { active: currentTab === index }]"
            @click="switchTab(index)"
          >
            {{ tab.emoji }} {{ tab.label }}
          </button>
        </div>

        <!-- 탭 콘텐츠 -->
        <div class="tab-content">
          <!-- 미완료/전체 탭 -->
          <div v-if="currentTab === 0 || currentTab === 2" class="tab-panel">
            <!-- 필터 섹션 -->
            <div class="cute-filter-section">
              <div class="filter-info">
                <div class="total-count">
                  총
                  <span class="count-number">{{
                    filteredEvaluations.length
                  }}</span
                  >개의 평가가 기다리고 있어요! 🎉
                </div>
              </div>

              <div class="filter-controls">
                <div class="filter-group">
                  <label class="filter-label">📋 보기 방식</label>
                  <select v-model="filters.type" class="cute-select">
                    <option value="unit">📚 단원별로 보기</option>
                    <option value="evaluation">⭐ 평가 유형별로 보기</option>
                  </select>
                </div>

                <div class="filter-group">
                  <label class="filter-label">📖 단원 선택</label>
                  <select v-model="filters.unit" class="cute-select">
                    <option value="all">🌟 전체 단원</option>
                    <option
                      v-for="unit in units"
                      :key="unit.value"
                      :value="unit.value"
                    >
                      {{ unit.label }}
                    </option>
                  </select>
                </div>

                <div class="filter-group">
                  <label class="filter-label">🔄 정렬 순서</label>
                  <select v-model="filters.sortOrder" class="cute-select">
                    <option value="registration">📅 등록일순</option>
                    <option value="deadline">⏰ 마감일순</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 평가 카드들 -->
            <div v-if="paginatedEvaluations.length > 0" class="evaluation-grid">
              <div
                v-for="evaluation in paginatedEvaluations"
                :key="evaluation.id"
                class="evaluation-card"
              >
                <div class="card-header">
                  <div class="evaluation-badges">
                    <span
                      :class="[
                        'evaluation-type',
                        getTypeClass(evaluation.type),
                      ]"
                    >
                      {{ getTypeEmoji(evaluation.type) }}
                      {{ getTypeText(evaluation.type) }}
                    </span>
                    <span
                      :class="[
                        'status-badge',
                        getStatusClass(evaluation.status),
                      ]"
                    >
                      {{ getStatusEmoji(evaluation.status) }}
                      {{ getStatusText(evaluation.status) }}
                    </span>
                  </div>
                </div>

                <div class="card-content">
                  <h3 class="evaluation-title">{{ evaluation.title }}</h3>
                  <p class="evaluation-unit">
                    📚 {{ evaluation.unit }}
                    <span v-if="evaluation.lesson">
                      > {{ evaluation.lesson }}</span
                    >
                  </p>
                  <div class="evaluation-info">
                    <div class="info-item">
                      <span class="info-icon">🤔</span>
                      <span class="info-text"
                        >{{ evaluation.questions }}개의 문제</span
                      >
                    </div>
                  </div>
                </div>

                <div class="card-actions">
                  <button
                    v-if="evaluation.status === 'incomplete'"
                    class="action-btn btn-start"
                    @click="startEvaluation(evaluation.id)"
                  >
                    🚀 시작하기
                  </button>
                  <button
                    v-if="evaluation.status === 'in-progress'"
                    class="action-btn btn-continue"
                    @click="continueEvaluation(evaluation.id)"
                  >
                    ⏯️ 이어하기
                  </button>
                  <button
                    v-if="evaluation.status === 'complete'"
                    class="action-btn btn-report"
                    @click="viewReport(evaluation.id)"
                  >
                    📋 결과 보기
                  </button>
                </div>
              </div>
            </div>

            <!-- 빈 상태 -->
            <div v-else class="empty-state">
              <div class="empty-icon">😊</div>
              <h3 class="empty-title">평가가 없어요!</h3>
              <p class="empty-message">
                새로운 평가가 등록되면 여기에 나타날 거예요!
              </p>
              <div class="empty-decoration">
                <span class="deco-star">⭐</span>
                <span class="deco-star">✨</span>
                <span class="deco-star">🌟</span>
              </div>
            </div>

            <!-- 귀여운 페이지네이션 -->
            <div v-if="totalPages > 1" class="cute-pagination">
              <button
                class="page-btn"
                @click="changePage(1)"
                :disabled="currentPage === 1"
                title="맨 처음으로"
              >
                ⏮️
              </button>
              <button
                class="page-btn"
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                title="이전 페이지"
              >
                ⬅️
              </button>

              <div class="page-numbers">
                <button
                  v-for="page in pageNumbers"
                  :key="page"
                  :class="['page-number', { active: page === currentPage }]"
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>
              </div>

              <button
                class="page-btn"
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                title="다음 페이지"
              >
                ➡️
              </button>
              <button
                class="page-btn"
                @click="changePage(totalPages)"
                :disabled="currentPage === totalPages"
                title="맨 마지막으로"
              >
                ⏭️
              </button>
            </div>
          </div>

          <!-- 완료 탭 -->
          <div v-if="currentTab === 1" class="tab-panel">
            <div class="empty-state">
              <div class="empty-icon">🏆</div>
              <h3 class="empty-title">완료한 평가가 없어요!</h3>
              <p class="empty-message">
                평가를 완료하면 여기에 결과가 나타날 거예요!
              </p>
              <div class="empty-decoration">
                <span class="deco-star">🎉</span>
                <span class="deco-star">🏆</span>
                <span class="deco-star">✨</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 플로팅 장식들 -->
    <div class="floating-decorations">
      <div class="floating-item item1">⭐</div>
      <div class="floating-item item2">🎈</div>
      <div class="floating-item item3">✨</div>
      <div class="floating-item item4">🏆</div>
      <div class="floating-item item5">🌟</div>
      <div class="floating-item item6">🎯</div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from "vue";

export default {
  name: "CuteEvaluationPage",
  setup() {
    // 반응형 데이터
    const subjectInfo = ref("🇺🇸 영어 4 | 학생1");
    const currentTab = ref(0);
    const currentPage = ref(1);
    const itemsPerPage = ref(6);

    // 탭 목록
    const tabs = ref([
      { label: "해야 할 일", key: "incomplete", emoji: "📝" },
      { label: "완료한 일", key: "complete", emoji: "🏆" },
      { label: "전체 보기", key: "all", emoji: "📚" },
    ]);

    // 단원 목록
    const units = ref([
      { value: "1", label: "1. How Are You? 🤗" },
      { value: "2", label: "2. This Is My Friend 👫" },
      { value: "3", label: "3. Don't Push 🙅‍♀️" },
      { value: "4", label: "4. I'm Happy 😊" },
      { value: "5", label: "5. What Time Is It? ⏰" },
      { value: "6", label: "6. Is This Your Cap? 🧢" },
      { value: "7", label: "7. What Day Is It Today? 📅" },
      { value: "8", label: "8. Let's Play Badminton 🏸" },
      { value: "9", label: "9. How Much Is It? 💰" },
      { value: "10", label: "10. It's in the Box 📦" },
      { value: "11", label: "11. What Are You Doing? 🤷‍♀️" },
    ]);

    // 필터 상태
    const filters = reactive({
      type: "unit",
      unit: "all",
      sortOrder: "registration",
    });

    // 평가 데이터
    const evaluationData = ref([
      {
        id: 1,
        type: "lesson",
        title: "[퀴즈 2] This Is My Friend",
        unit: "2. This Is My Friend 👫",
        lesson: "2. 둘째 시간",
        questions: 3,
        status: "in-progress",
      },
      {
        id: 2,
        type: "lesson",
        title: "[퀴즈 3] This Is My Friend",
        unit: "2. This Is My Friend 👫",
        lesson: "3. 셋째 시간",
        questions: 3,
        status: "incomplete",
      },
      {
        id: 3,
        type: "unit",
        title: "This Is My Friend 단원 평가",
        unit: "2. This Is My Friend 👫",
        lesson: "",
        questions: 10,
        status: "incomplete",
      },
      {
        id: 4,
        type: "lesson",
        title: "[퀴즈 1] Don't Push",
        unit: "3. Don't Push 🙅‍♀️",
        lesson: "1. 첫째 시간",
        questions: 3,
        status: "incomplete",
      },
      {
        id: 5,
        type: "lesson",
        title: "[퀴즈 2] Don't Push",
        unit: "3. Don't Push 🙅‍♀️",
        lesson: "2. 둘째 시간",
        questions: 3,
        status: "incomplete",
      },
      {
        id: 6,
        type: "lesson",
        title: "[퀴즈 3] Don't Push",
        unit: "3. Don't Push 🙅‍♀️",
        lesson: "3. 셋째 시간",
        questions: 3,
        status: "incomplete",
      },
      {
        id: 7,
        type: "unit",
        title: "Don't Push 단원 평가",
        unit: "3. Don't Push 🙅‍♀️",
        lesson: "",
        questions: 10,
        status: "incomplete",
      },
      {
        id: 8,
        type: "lesson",
        title: "[퀴즈 1] I'm Happy",
        unit: "4. I'm Happy 😊",
        lesson: "1. 첫째 시간",
        questions: 3,
        status: "incomplete",
      },
    ]);

    // 계산된 속성
    const filteredEvaluations = computed(() => {
      let filtered = [...evaluationData.value];

      // 탭별 필터링
      if (currentTab.value === 0) {
        // 미완료
        filtered = filtered.filter(
          (item) =>
            item.status === "incomplete" || item.status === "in-progress"
        );
      } else if (currentTab.value === 1) {
        // 완료
        filtered = filtered.filter((item) => item.status === "complete");
      }

      // 단원별 필터링
      if (filters.unit !== "all") {
        const unitNumber = filters.unit;
        filtered = filtered.filter((item) =>
          item.unit.startsWith(unitNumber + ".")
        );
      }

      // 정렬
      if (filters.sortOrder === "deadline") {
        filtered.sort((a, b) => a.id - b.id);
      } else {
        filtered.sort((a, b) => a.id - b.id);
      }

      return filtered;
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredEvaluations.value.length / itemsPerPage.value);
    });

    const paginatedEvaluations = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredEvaluations.value.slice(start, end);
    });

    const pageNumbers = computed(() => {
      const pages = [];
      for (let i = 1; i <= totalPages.value; i++) {
        pages.push(i);
      }
      return pages;
    });

    // 메서드들
    const switchTab = (tabIndex) => {
      currentTab.value = tabIndex;
      currentPage.value = 1;
    };

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const getTypeClass = (type) => {
      return type === "lesson" ? "type-lesson" : "type-unit";
    };

    const getTypeText = (type) => {
      return type === "lesson" ? "차시 평가" : "단원 평가";
    };

    const getTypeEmoji = (type) => {
      return type === "lesson" ? "📝" : "📚";
    };

    const getStatusClass = (status) => {
      switch (status) {
        case "incomplete":
          return "status-incomplete";
        case "in-progress":
          return "status-in-progress";
        case "complete":
          return "status-complete";
        default:
          return "";
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case "incomplete":
          return "준비 완료";
        case "in-progress":
          return "진행 중";
        case "complete":
          return "완료";
        default:
          return "";
      }
    };

    const getStatusEmoji = (status) => {
      switch (status) {
        case "incomplete":
          return "⏳";
        case "in-progress":
          return "🔄";
        case "complete":
          return "✅";
        default:
          return "";
      }
    };

    const startEvaluation = (id) => {
      alert(`🚀 평가를 시작합니다! (ID: ${id})`);
      // 실제로는 평가 페이지로 이동
    };

    const continueEvaluation = (id) => {
      alert(`⏯️ 평가를 이어서 진행합니다! (ID: ${id})`);
      // 실제로는 평가 페이지로 이동
    };

    const viewReport = (id) => {
      alert(`📋 평가 결과를 확인합니다! (ID: ${id})`);
      // 실제로는 결과 페이지로 이동
    };

    // 필터 변경 시 페이지 리셋
    watch(
      [filters],
      () => {
        currentPage.value = 1;
      },
      { deep: true }
    );

    return {
      // 데이터
      subjectInfo,
      currentTab,
      currentPage,
      tabs,
      units,
      filters,
      evaluationData,

      // 계산된 속성
      filteredEvaluations,
      paginatedEvaluations,
      totalPages,
      pageNumbers,

      // 메서드
      switchTab,
      changePage,
      getTypeClass,
      getTypeText,
      getTypeEmoji,
      getStatusClass,
      getStatusText,
      getStatusEmoji,
      startEvaluation,
      continueEvaluation,
      viewReport,
    };
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.cute-exam-app {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 네비게이션 */
.cute-navbar {
  background: #ffdd29;
  border-bottom: 3px solid #ffe066;
  box-shadow: 0 4px 20px rgba(255, 221, 41, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 800;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.logo-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  animation: wiggle 3s ease-in-out infinite;
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

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.nav-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.user-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0.75rem;
  border-radius: 15px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.chat-badge {
  background: #2ed573;
}

/* 메인 컨텐트 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 헤더 */
.cute-header {
  background: linear-gradient(135deg, #ff9800, #ffc107);
  border-radius: 25px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(255, 152, 0, 0.3);
  color: white;
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.header-subtitle {
  font-size: 1.1rem;
  opacity: 0.95;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.cute-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.separator {
  margin: 0 0.25rem;
}

.current {
  font-weight: 700;
}

.header-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.deco-item {
  position: absolute;
  font-size: 2rem;
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.deco1 {
  top: 20%;
  right: 15%;
  animation-delay: 0s;
}
.deco2 {
  top: 10%;
  right: 5%;
  animation-delay: 1s;
}
.deco3 {
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}
.deco4 {
  top: 70%;
  right: 25%;
  animation-delay: 3s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(180deg);
  }
}

/* 탭 컨테이너 */
.cute-tab-container {
  background: white;
  border-radius: 25px;
  box-shadow: 0 8px 25px rgba(255, 152, 0, 0.1);
  border: 3px solid #ffe066;
  overflow: hidden;
}

.tab-nav {
  display: flex;
  background: #fff5d6;
  border-bottom: 2px solid #ffe066;
}

.tab-button {
  flex: 1;
  padding: 1.2rem 2rem;
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff9800;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-family: inherit;
}

.tab-button.active {
  background: white;
  color: #ff9800;
  transform: translateY(-2px);
}

.tab-button.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #ffdd29;
  border-radius: 2px 2px 0 0;
}

.tab-button:hover:not(.active) {
  background: rgba(255, 221, 41, 0.1);
}

.tab-content {
  padding: 2rem;
}

/* 필터 섹션 */
.cute-filter-section {
  background: #fffbf0;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid #fff5d6;
}

.filter-info {
  margin-bottom: 1.5rem;
}

.total-count {
  font-size: 1.2rem;
  color: #ff9800;
  font-weight: 700;
  text-align: center;
}

.count-number {
  color: #ffdd29;
  font-size: 1.4rem;
  text-shadow: 2px 2px 4px rgba(255, 221, 41, 0.2);
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 700;
  color: #ff9800;
  font-size: 0.9rem;
}

.cute-select {
  padding: 0.75rem 1rem;
  border: 2px solid #ffe066;
  border-radius: 15px;
  background: white;
  color: #ff9800;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.3s ease;
}

.cute-select:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.2);
}

/* 평가 그리드 */
.evaluation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.evaluation-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  border: 3px solid #fff5d6;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.1);
}

.evaluation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(255, 152, 0, 0.2);
  border-color: #ffdd29;
}

.card-header {
  margin-bottom: 1rem;
}

.evaluation-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.evaluation-type {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.type-lesson {
  background: #e3f2fd;
  color: #1565c0;
}

.type-unit {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-incomplete {
  background: #fff3e0;
  color: #f57c00;
}

.status-in-progress {
  background: #e3f2fd;
  color: #1976d2;
}

.status-complete {
  background: #e8f5e8;
  color: #388e3c;
}

.card-content {
  margin-bottom: 1.5rem;
}

.evaluation-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.evaluation-unit {
  color: #666;
  margin-bottom: 1rem;
  font-weight: 600;
}

.evaluation-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.info-icon {
  font-size: 1.1rem;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  flex: 1;
  min-width: 120px;
  text-align: center;
}

.btn-start {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.btn-continue {
  background: #2ed573;
  color: white;
  box-shadow: 0 4px 15px rgba(46, 213, 115, 0.3);
}

.btn-continue:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(46, 213, 115, 0.4);
}

.btn-report {
  background: #a855f7;
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.btn-report:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

/* 페이지네이션 */
.cute-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.page-btn {
  background: white;
  border: 2px solid #ffe066;
  color: #ff9800;
  padding: 0.5rem 0.75rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.page-btn:hover:not(:disabled) {
  background: #fff5d6;
  transform: translateY(-2px);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  background: white;
  border: 2px solid #ffe066;
  color: #ff9800;
  padding: 0.5rem 0.75rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  min-width: 40px;
}

.page-number.active {
  background: #ffdd29;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.page-number:hover:not(.active) {
  background: #fff5d6;
  transform: translateY(-1px);
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #ff9800;
}

.empty-icon {
  font-size: 5rem;
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
  margin-bottom: 1rem;
  color: #ff9800;
}

.empty-message {
  font-size: 1.1rem;
  color: #ffb74d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.empty-decoration {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.deco-star {
  font-size: 2rem;
  animation: twinkle 2s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

.deco-star:nth-child(1) {
  --delay: 0s;
}
.deco-star:nth-child(2) {
  --delay: 0.5s;
}
.deco-star:nth-child(3) {
  --delay: 1s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 플로팅 장식들 */
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
  font-size: 2rem;
  opacity: 0.6;
  animation: float 8s ease-in-out infinite;
}

.item1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}
.item2 {
  top: 20%;
  right: 10%;
  animation-delay: 1.5s;
}
.item3 {
  top: 60%;
  left: 5%;
  animation-delay: 3s;
}
.item4 {
  top: 80%;
  right: 20%;
  animation-delay: 4.5s;
}
.item5 {
  top: 40%;
  left: 80%;
  animation-delay: 6s;
}
.item6 {
  top: 70%;
  right: 5%;
  animation-delay: 7.5s;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .nav-menu {
    width: 100%;
    justify-content: center;
  }

  .nav-links {
    justify-content: center;
    flex-wrap: wrap;
  }

  .main-content {
    padding: 1rem;
  }

  .header-title {
    font-size: 1.8rem;
  }

  .filter-controls {
    grid-template-columns: 1fr;
  }

  .evaluation-grid {
    grid-template-columns: 1fr;
  }

  .tab-button {
    padding: 1rem;
    font-size: 0.9rem;
  }

  .cute-pagination {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.5rem;
  }

  .evaluation-card {
    padding: 1rem;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-btn {
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

button:focus,
select:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 호버 효과는 마우스가 있는 기기에서만 */
@media (hover: none) {
  .evaluation-card:hover {
    transform: none;
    box-shadow: 0 4px 15px rgba(255, 152, 0, 0.1);
  }

  .action-btn:hover {
    transform: none;
  }
}
</style>
