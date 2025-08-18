<template>
  <!-- 헤더 -->
  <header class="header">
    <Header></Header>
  </header>
  <div class="teacher-exam-page">
    <div class="exam-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="page-text">
          <h1 class="page-title">우리 반 평가 관리 📚</h1>
          <p class="page-subtitle">
            학생들의 학습 상황을 확인하고 새로운 평가를 만들어보세요! 🌟
          </p>
          <nav class="cute-breadcrumb">
            <span>홈</span>
            <span class="separator">></span>
            <span class="current">우리 반 평가</span>
          </nav>
        </div>
      </div>

      <!-- 안내 상자 -->
      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <ul class="notice-list">
          <li>평가 잠금 설정 시, 학생은 문제 진입이 불가합니다.</li>
          <li>
            평가 출제 후 등록한 학생은 최초 로그인 시 자동 출제됩니다. (우리 반
            전체에 출제된 평가에 한함)
          </li>
          <li>교사의 평가 결과는 저장되지 않습니다.</li>
        </ul>
        <div class="action-buttons">
          <button class="btn-restructure" @click="openRestructureModal">
            🔧 재구성
          </button>
          <button class="btn-add-exam" @click="openExamCreationModal">
            ➕ 평가 추가
          </button>
        </div>
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
        <div class="tab-panel">
          <!-- 필터 섹션 -->
          <div class="filter-section">
            <div class="filter-info">
              <div class="total-count">
                총
                <span class="count-number">{{
                  filteredEvaluations.length
                }}</span
                >개의 평가가 있어요! 📊
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
                  <option value="all">🌟 단원 전체</option>
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
                <button
                  class="edit-button"
                  @click="editEvaluation(evaluation.id)"
                  title="평가 수정하기"
                >
                  ⚙️
                </button>
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
                    <span>{{ evaluation.questions }}문제</span>
                  </div>
                </div>

                <!-- 선생님용 통계 정보 -->
                <div class="teacher-stats">
                  <div class="stats-row">
                    <div class="stat-item">
                      <span class="stat-label">응시자 수</span>
                      <span class="stat-value">
                        <strong>{{ evaluation.participantCount }}</strong>
                        <span class="total"
                          >/ {{ evaluation.totalStudents }}</span
                        >
                      </span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">평균 채점 결과</span>
                      <span class="stat-value">
                        <strong>{{ evaluation.averageScore }}</strong>
                        <span class="total">/ {{ evaluation.questions }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="footer-buttons">
                  <button
                    class="action-btn btn-report"
                    @click="viewReport(evaluation.id)"
                  >
                    📊 평가 리포트
                  </button>
                  <button
                    class="action-btn btn-view"
                    @click="viewQuestions(evaluation.id)"
                  >
                    👁️ 문제 보기
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 빈 상태 -->
          <div v-else class="empty-state">
            <div class="empty-icon">📚</div>
            <h3 class="empty-title">평가가 없어요!</h3>
            <p class="empty-description">
              새로운 평가를 추가해서 학생들의 학습을 확인해보세요!
            </p>
            <button class="btn-add-exam-empty" @click="openExamCreationModal">
              ➕ 첫 번째 평가 만들기
            </button>
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
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from "vue";
import Header from "@/components/common/Header.vue";

export default {
  name: "TeacherExam",
  components: { Header },
  setup() {
    // 반응형 데이터
    const currentTab = ref(0);
    const currentPage = ref(1);
    const itemsPerPage = ref(6);

    // 탭 목록
    const tabs = ref([
      { label: "미완료", key: "incomplete", emoji: "⏳" },
      { label: "완료", key: "complete", emoji: "✅" },
      { label: "전체", key: "all", emoji: "📚" },
    ]);

    // 단원 목록 - 수학 3-2
    const units = ref([
      { value: "1", label: "1. 곱셈" },
      { value: "2", label: "2. 나눗셈" },
      { value: "3", label: "3. 원" },
      { value: "4", label: "4. 들이와 무게" },
      { value: "5", label: "5. 분수" },
      { value: "6", label: "6. 그림그래프" },
    ]);

    // 필터 상태
    const filters = reactive({
      type: "unit",
      unit: "all",
      sortOrder: "registration",
    });

    // 평가 데이터 (선생님용)
    const evaluationData = ref([
      {
        id: 1,
        type: "wrong-answer",
        title: "[오답BEST] 오답 문제_1. 곱셈",
        unit: "1. 곱셈",
        lesson: "",
        questions: 10,
        status: "in-progress",
        participantCount: 0,
        totalStudents: 10,
        averageScore: 0,
      },
      {
        id: 2,
        type: "unit-evaluation",
        title: "(심화) 단원 평가_곱셈",
        unit: "1. 곱셈",
        lesson: "",
        questions: 20,
        status: "in-progress",
        participantCount: 0,
        totalStudents: 10,
        averageScore: 0,
      },
      {
        id: 3,
        type: "unit-evaluation",
        title: "(기초) 단원 평가_곱셈",
        unit: "1. 곱셈",
        lesson: "",
        questions: 20,
        status: "in-progress",
        participantCount: 0,
        totalStudents: 10,
        averageScore: 0,
      },
      {
        id: 4,
        type: "unit-diagnosis",
        title: "단원 진단 평가_나눗셈",
        unit: "2. 나눗셈",
        lesson: "",
        questions: 10,
        status: "in-progress",
        participantCount: 0,
        totalStudents: 10,
        averageScore: 0,
      },
      {
        id: 5,
        type: "formative",
        title: "내림이 없는 (몇십)÷(몇)",
        unit: "2. 나눗셈",
        lesson: "2. 내림이 없는 (몇십)÷(몇)",
        questions: 5,
        status: "in-progress",
        participantCount: 0,
        totalStudents: 10,
        averageScore: 0,
      },
      {
        id: 6,
        type: "formative",
        title: "내림이 없는 (몇십몇)÷(몇)",
        unit: "2. 나눗셈",
        lesson: "3. 내림이 없는 (몇십몇)÷(몇)",
        questions: 5,
        status: "in-progress",
        participantCount: 0,
        totalStudents: 10,
        averageScore: 0,
      },
      {
        id: 7,
        type: "formative",
        title: "내림이 있는 (몇십)÷(몇)",
        unit: "2. 나눗셈",
        lesson: "4. 내림이 있는 (몇십)÷(몇)",
        questions: 5,
        status: "in-progress",
        participantCount: 0,
        totalStudents: 10,
        averageScore: 0,
      },
      {
        id: 8,
        type: "formative",
        title: "내림이 있는 (몇십몇)÷(몇)",
        unit: "2. 나눗셈",
        lesson: "5. 내림이 있는 (몇십몇)÷(몇)",
        questions: 5,
        status: "in-progress",
        participantCount: 0,
        totalStudents: 10,
        averageScore: 0,
      },
    ]);

    // 계산된 속성
    const filteredEvaluations = computed(() => {
      let filtered = [...evaluationData.value];

      // 탭별 필터링
      if (currentTab.value === 0) {
        // 미완료 (응시 중)
        filtered = filtered.filter((item) => item.status === "in-progress");
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
          (item) => item.status === "in-progress"
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
      const typeMap = {
        "wrong-answer": "type-wrong",
        "unit-evaluation": "type-unit",
        "unit-diagnosis": "type-diagnosis",
        formative: "type-formative",
      };
      return typeMap[type] || "type-default";
    };

    const getTypeText = (type) => {
      const typeMap = {
        "wrong-answer": "오답BEST",
        "unit-evaluation": "단원 평가",
        "unit-diagnosis": "단원 진단",
        formative: "형성 평가",
      };
      return typeMap[type] || "평가";
    };

    const getTypeEmoji = (type) => {
      const emojiMap = {
        "wrong-answer": "🔄",
        "unit-evaluation": "📚",
        "unit-diagnosis": "🔍",
        formative: "📝",
      };
      return emojiMap[type] || "📋";
    };

    const getStatusClass = (status) => {
      switch (status) {
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
        case "in-progress":
          return "응시 중";
        case "complete":
          return "완료";
        default:
          return "";
      }
    };

    const getStatusEmoji = (status) => {
      switch (status) {
        case "in-progress":
          return "🔄";
        case "complete":
          return "✅";
        default:
          return "";
      }
    };

    // 팝업 및 액션 메서드들
    const openExamCreationModal = () => {
      // window.open(
      //   "/teacher/exam/create",
      //   "TeacherExamCreate",
      //   "width=1200,height=800,scrollbars=yes,resizable=yes"
      // );
      window.location.href = "/teacher/exam/create";
    };

    const openRestructureModal = () => {
      alert("🔧 재구성 기능을 준비 중입니다!");
    };

    const editEvaluation = (id) => {
      alert(`⚙️ 평가를 수정합니다! (ID: ${id})`);
    };

    const viewReport = (id) => {
      alert(`📊 평가 리포트를 확인합니다! (ID: ${id})`);
    };

    const viewQuestions = (id) => {
      alert(`👁️ 문제를 확인합니다! (ID: ${id})`);
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
      openExamCreationModal,
      openRestructureModal,
      editEvaluation,
      viewReport,
      viewQuestions,
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

.teacher-exam-page {
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
    rgba(76, 175, 80, 0.8),
    rgba(139, 195, 74, 0.6)
  );
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(76, 175, 80, 0.2);
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
  background: #f1f8e9;
  border: 2px dashed #8bc34a;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  color: #4caf50;
  font-weight: 600;
}

.notice-icon {
  font-size: 1.5rem;
  margin-top: 0.2rem;
}

.notice-list {
  list-style: "• ";
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
}

.btn-restructure,
.btn-add-exam {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-restructure {
  background: #9e9e9e;
  color: white;
}

.btn-restructure:hover {
  background: #757575;
  transform: translateY(-2px);
}

.btn-add-exam {
  background: #4caf50;
  color: white;
}

.btn-add-exam:hover {
  background: #388e3c;
  transform: translateY(-2px);
}

/* 평가 탭 */
.exam-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  margin-bottom: 2.5rem;
  background: #f1f8e9;
  border-radius: 20px;
  border: 2px solid #8bc34a;
}

.tab-button {
  flex: 1;
  padding: 12px 20px;
  border: 0;
  border-radius: 15px;
  background: none;
  color: #4caf50;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.tab-button:hover:not(.active) {
  background: rgba(76, 175, 80, 0.1);
}

.tab-button.active {
  background: #4caf50;
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
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
  background: #f1f8e9;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid #8bc34a;
}

.filter-info {
  margin-bottom: 1.5rem;
}

.total-count {
  font-size: 1.2rem;
  color: #4caf50;
  font-weight: 700;
  text-align: center;
}

.count-number {
  color: #2e7d32;
  font-size: 1.4rem;
  text-shadow: 2px 2px 4px rgba(76, 175, 80, 0.2);
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
  color: #4caf50;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #8bc34a;
  border-radius: 15px;
  background: white;
  color: #4caf50;
  font-weight: 600;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

/* 평가 그리드 */
.evaluation-grid {
  display: grid;
  background-color: #f1f8e9;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid #8bc34a;
  border-radius: 20px;
  padding: 1.5rem;
}

/* 평가 카드 */
.evaluation-card {
  background: white;
  border: 3px solid #e8f5e8;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;
}

.evaluation-card:hover {
  border-color: #4caf50;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.2);
}

.card-header {
  background-color: white;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #e8f5e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.type-wrong {
  background: #fff3e0;
  color: #ff9800;
}

.type-unit {
  background: #e8f5e8;
  color: #2e7d32;
}

.type-diagnosis {
  background: #e3f2fd;
  color: #1565c0;
}

.type-formative {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-in-progress {
  background: #e3f2fd;
  color: #1976d2;
}

.status-complete {
  background: #e8f5e8;
  color: #388e3c;
}

.edit-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.edit-button:hover {
  background: #f5f5f5;
  transform: scale(1.1);
}

.card-body {
  background-color: white;
  padding: 1.25rem;
  flex-grow: 1;
}

.evaluation-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2e7d32;
  margin: 0 0 0.75rem;
  line-height: 1.4;
}

.evaluation-unit {
  color: #4caf50;
  margin: 0 0 1rem;
  font-weight: 600;
}

.evaluation-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

/* 선생님용 통계 */
.teacher-stats {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1rem;
  margin-top: 1rem;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1rem;
  color: #2e7d32;
  font-weight: 700;
}

.stat-value strong {
  font-size: 1.2rem;
  color: #1b5e20;
}

.total {
  color: #666;
  font-weight: 500;
}

.card-footer {
  padding: 0.75rem 1.25rem;
  background: #f8f9fa;
}

.footer-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-size: 0.9rem;
}

.btn-report {
  background: #2196f3;
  color: white;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.btn-report:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(33, 150, 243, 0.4);
}

.btn-view {
  background: #9c27b0;
  color: white;
  box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
}

.btn-view:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(156, 39, 176, 0.4);
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #f1f8e9;
  border-radius: 20px;
  border: 2px solid #8bc34a;
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
  color: #4caf50;
  margin: 0 0 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: #8bc34a;
  margin: 0 0 1.5rem;
}

.btn-add-exam-empty {
  background: #4caf50;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add-exam-empty:hover {
  background: #388e3c;
  transform: translateY(-2px);
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
  border: 2px solid #8bc34a;
  color: #4caf50;
  padding: 0.5rem 0.75rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.page-btn:hover:not(:disabled) {
  background: #e8f5e8;
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
  border: 2px solid #8bc34a;
  color: #4caf50;
  padding: 0.5rem 0.75rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  min-width: 40px;
}

.page-number.active {
  background: #4caf50;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.page-number:hover:not(.active) {
  background: #e8f5e8;
  transform: translateY(-1px);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .teacher-exam-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .notice-box {
    flex-direction: column;
  }

  .action-buttons {
    align-self: stretch;
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

  .stats-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer-buttons {
    flex-direction: column;
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

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
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
  outline: 3px solid #4caf50;
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
