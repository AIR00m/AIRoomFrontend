<template>
  <!-- 헤더 -->
  <header class="header">
    <Header></Header>
  </header>
  <div class="exam-page">
    <div class="exam-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="page-text">
          <h1 class="page-title">나의 평가 도전기 🎯</h1>
          <p class="page-subtitle">
            우리가 배운 걸 확인해볼 시간이에요! 차근차근 해보자구요 ⭐
          </p>
          <nav class="cute-breadcrumb">
            <span>홈</span>
            <span class="separator">></span>
            <span class="current"> 나의 평가</span>
          </nav>
        </div>
      </div>

      <!-- 안내 상자 -->
      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <ul class="notice-list">
          <li>각 단원별로 퀴즈와 평가가 준비되어 있어요.</li>
          <li>마감일을 잘 확인하고 시간 안에 평가를 완료해주세요! 💪</li>
          <li>완료한 평가는 언제든지 결과를 다시 확인할 수 있어요.</li>
        </ul>
      </div>

      <!-- 평가 탭 -->
      <div class="exam-tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          class="tab-button"
          :class="{ active: currentTab === index }"
          @click="switchTab(index)"
        >
          {{ tab.emoji }} {{ tab.label }}
          <span class="tab-count">{{ getTabCount(index) }}</span>
        </button>
      </div>

      <!-- 탭 컨텐츠 -->
      <div class="exam-content">
        <!-- 미완료/전체 탭 -->
        <div v-if="currentTab === 0 || currentTab === 2" class="tab-panel">
          <!-- 필터 섹션 -->
          <div class="filter-section">
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
                <select v-model="filters.type" class="filter-select">
                  <option value="unit">📚 단원별로 보기</option>
                  <option value="evaluation">⭐ 평가 유형별로 보기</option>
                </select>
              </div>

              <div class="filter-group">
                <label class="filter-label">📖 단원 선택</label>
                <select v-model="filters.unit" class="filter-select">
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
                <label class="filter-label">📄 정렬 순서</label>
                <select v-model="filters.sortOrder" class="filter-select">
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
              :class="getStatusClass(evaluation.status)"
            >
              <div class="card-header">
                <div class="evaluation-badges">
                  <span
                    :class="['evaluation-type', getTypeClass(evaluation.type)]"
                  >
                    {{ getTypeEmoji(evaluation.type) }}
                    {{ getTypeText(evaluation.type) }}
                  </span>
                  <span
                    :class="['status-badge', getStatusClass(evaluation.status)]"
                  >
                    {{ getStatusEmoji(evaluation.status) }}
                    {{ getStatusText(evaluation.status) }}
                  </span>
                </div>
              </div>

              <div class="card-body">
                <h3 class="evaluation-title">{{ evaluation.title }}</h3>
                <p class="evaluation-unit">
                  📚 {{ evaluation.unit }}
                  <span v-if="evaluation.lesson">
                    > {{ evaluation.lesson }}</span
                  >
                </p>
                <div class="evaluation-info">
                  <div class="info-item">
                    <i class="bi bi-question-circle"></i>
                    <span>{{ evaluation.questions }}개의 문제</span>
                  </div>
                </div>
              </div>

              <div class="card-footer">
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
                  ▶️ 이어하기
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
            <p class="empty-description">
              새로운 평가가 등록되면 여기에 나타날 거예요!
            </p>
          </div>

          <!-- 페이지네이션 -->
          <div v-if="totalPages > 1" class="pagination">
            <i
              class="page-btn bi bi-chevron-double-left"
              @click="changePage(1)"
              :disabled="currentPage === 1"
              title="맨 처음으로"
            ></i>
            <i
              class="page-btn bi bi-chevron-left"
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              title="이전 페이지"
            ></i>
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
            <i
              class="page-btn bi bi-chevron-right"
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              title="다음 페이지"
            ></i>
            <i
              class="page-btn bi bi-chevron-double-right"
              @click="changePage(totalPages)"
              :disabled="currentPage === totalPages"
              title="맨 마지막으로"
            ></i>
          </div>
        </div>

        <!-- 완료 탭 -->
        <div v-if="currentTab === 1" class="tab-panel">
          <div class="empty-state">
            <div class="empty-icon">🏆</div>
            <h3 class="empty-title">완료한 평가가 없어요!</h3>
            <p class="empty-description">
              평가를 완료하면 여기에 결과가 나타날 거예요!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from "vue";
import Header from "@/components/common/Header.vue";

export default {
  name: "Exam",
  components: { Header },
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

    const getTabCount = (tabIndex) => {
      if (tabIndex === 0) {
        // 미완료
        return evaluationData.value.filter(
          (item) =>
            item.status === "incomplete" || item.status === "in-progress"
        ).length;
      } else if (tabIndex === 1) {
        // 완료
        return evaluationData.value.filter((item) => item.status === "complete")
          .length;
      } else {
        // 전체
        return evaluationData.value.length;
      }
    };

    const getTypeClass = (type) => {
      return type === "lesson" ? "type-lesson" : "type-unit";
    };

    const getTypeText = (type) => {
      return type === "lesson" ? "퀴즈" : "단원 평가";
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
      alert(`▶️ 평가를 이어서 진행합니다! (ID: ${id})`);
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
      getTabCount,
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
/* 전역 폰트 및 배경 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}

.exam-page {
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.exam-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 페이지 헤더 */
.page-header {
  background: linear-gradient(
    135deg,
    rgba(255, 148, 41, 0.5),
    rgba(239, 1, 1, 0.3)
  );
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 221, 41, 0.2);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: white;
  margin: 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: white;
  margin-top: 0.5rem;
}

.cute-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: white;
  margin-top: 0.5rem;
}

.separator {
  margin: 0 0.25rem;
}

.current {
  font-weight: 700;
  color: white;
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

/* 평가 탭 */
.exam-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  margin-bottom: 2.5rem;
  background: #fff5d6;
  border-radius: 20px;
  border: 2px solid #ffe066;
}

.tab-button {
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

.tab-button:hover:not(.active) {
  background: rgba(255, 221, 41, 0.3);
}

.tab-button.active {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  transform: translateY(-2px);
}

.tab-count {
  margin-left: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 0.8em;
}

.tab-button.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* 필터 섹션 */
.filter-section {
  background: #fffbf0;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid #ffe066;
  border-radius: 20px;
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

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #ffe066;
  border-radius: 15px;
  background: white;
  color: #ff9800;
  font-weight: 600;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.2);
}

/* 평가 그리드 */
.evaluation-grid {
  display: grid;
  background-color: #fffbf0;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
}

/* 평가 카드 */
.evaluation-card {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;
}

.evaluation-card:hover {
  border-color: #ffdd29;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.2);
}

.card-header {
  background-color: white;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #fff5d6;
}

.evaluation-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
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
  background: #edebe7;
  color: #f57c00;
}

.status-in-progress {
  background: #d0e7d0;
  color: #1976d2;
}

.status-complete {
  background: #edebe7;
  color: #388e3c;
}

.card-body {
  background-color: white;
  padding: 1.25rem;
  flex-grow: 1;
}

.evaluation-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #8c6d32;
  margin: 0 0 0.75rem;
  line-height: 1.4;
}

.evaluation-unit {
  color: #ffb74d;
  margin: 0 0 1rem;
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
  font-weight: 600;
}

.card-footer {
  padding: 0.75rem 1.25rem;
  background: whitesmoke;
}

.action-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
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

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fffbf0;
  border-radius: 20px;
  border: 2px solid #ffe066;
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

/* 페이지네이션 */
.pagination {
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .exam-page {
    padding: 1rem;
  }

  .page-title {
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

  .pagination {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .evaluation-card {
    margin: 0;
  }

  .card-body {
    padding: 1rem;
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
    box-shadow: none;
  }

  .action-btn:hover {
    transform: none;
  }
}
</style>
