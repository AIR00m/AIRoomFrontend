<template>
  <div>
    <!-- 헤더 -->
    <header class="header">
      <nav class="navbar navbar-expand-lg" style="background-color: #034582">
        <div class="container" style="max-width: 1200px">
          <!-- 로고 -->
          <a class="navbar-brand d-flex align-items-center text-white" href="#">
            <i class="bi bi-mortarboard-fill me-2 fs-3"></i>
            <strong>아이룸</strong>
          </a>

          <!-- 과목/학생 정보 pill -->
          <span
            class="badge rounded-pill text-white me-2 d-none d-lg-inline-block"
            style="background: rgba(255, 255, 255, 0.15); font-weight: 500"
          >
            {{ subjectInfo }}
          </span>

          <!-- 모바일 토글 버튼 -->
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon" style="filter: invert(1)"></span>
          </button>

          <div class="collapse navbar-collapse" id="mainNavbar">
            <!-- 좌측 메뉴 -->
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
              <li class="nav-item">
                <a class="nav-link text-white" href="#">홈</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-white" href="#">우리 반 수업</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-white" href="#">맞춤 학습</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-white" href="#">과제</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-white active" href="#">평가</a>
              </li>
              <li class="nav-item">
                <a class="nav-link text-white" href="#">학습 리포트</a>
              </li>
            </ul>

            <!-- 우측 아이콘: 알림/채팅 -->
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
              <!-- 과목/학생 정보 pill (모바일에서는 오른쪽에 표시) -->
              <li class="nav-item d-lg-none mb-2 text-center">
                <span
                  class="badge rounded-pill text-white"
                  style="
                    background: rgba(255, 255, 255, 0.15);
                    font-weight: 500;
                  "
                >
                  {{ subjectInfo }}
                </span>
              </li>

              <!-- 알림 -->
              <li class="nav-item me-2">
                <a
                  href="#"
                  class="nav-link position-relative text-white"
                  title="알림"
                >
                  <i class="bi bi-bell fs-5"></i>
                  <span
                    class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  >
                    1
                    <span class="visually-hidden">unread notifications</span>
                  </span>
                </a>
              </li>

              <!-- 채팅 -->
              <li class="nav-item">
                <a
                  href="#"
                  class="nav-link position-relative text-white"
                  title="채팅"
                >
                  <i class="bi bi-chat-dots fs-5"></i>
                  <span
                    class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
                  >
                    5
                    <span class="visually-hidden">unread messages</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 브레드크럼 -->
      <div class="breadcrumb-section">
        <h1 class="page-title">나의 평가</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="#">홈</a></li>
            <li class="breadcrumb-item active" aria-current="page">
              나의 평가
            </li>
          </ol>
        </nav>
      </div>

      <!-- 탭 컨테이너 -->
      <div class="tab-container">
        <!-- 탭 네비게이션 -->
        <div class="tab-nav">
          <button
            v-for="(tab, index) in tabs"
            :key="index"
            class="tab-button"
            :class="{ active: currentTab === index }"
            @click="switchTab(index)"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 탭 콘텐츠 -->
        <div class="tab-content">
          <!-- 미완료/전체 탭 -->
          <div
            v-if="currentTab === 0 || currentTab === 2"
            class="tab-panel active"
          >
            <!-- 필터 섹션 -->
            <div class="filter-section">
              <div class="total-count">
                총 <span class="number">{{ filteredEvaluations.length }}</span
                >개
              </div>
              <div class="filter-controls">
                <select v-model="filters.type" class="filter-select">
                  <option value="unit">단원별</option>
                  <option value="evaluation">평가 유형별</option>
                </select>
                <select v-model="filters.unit" class="filter-select">
                  <option value="all">단원 전체</option>
                  <option
                    v-for="unit in units"
                    :key="unit.value"
                    :value="unit.value"
                  >
                    {{ unit.label }}
                  </option>
                </select>
                <select v-model="filters.sortOrder" class="filter-select">
                  <option value="registration">등록일순</option>
                  <option value="deadline">마감일순</option>
                </select>
              </div>
            </div>

            <!-- 평가 목록 -->
            <div v-if="paginatedEvaluations.length > 0" class="evaluation-grid">
              <div
                v-for="evaluation in paginatedEvaluations"
                :key="evaluation.id"
                class="evaluation-card"
              >
                <div class="card-header">
                  <div class="card-info">
                    <span
                      class="evaluation-type"
                      :class="getTypeClass(evaluation.type)"
                    >
                      {{ getTypeText(evaluation.type) }}
                    </span>
                    <h3 class="evaluation-title">{{ evaluation.title }}</h3>
                    <p class="evaluation-subtitle">
                      {{ evaluation.unit
                      }}{{ evaluation.lesson ? " > " + evaluation.lesson : "" }}
                    </p>
                    <div class="evaluation-meta">
                      <span
                        ><i class="bi bi-question-circle"></i> 문항 수:
                        {{ evaluation.questions }}문제</span
                      >
                    </div>
                  </div>
                  <span
                    class="status-badge"
                    :class="getStatusClass(evaluation.status)"
                  >
                    {{ getStatusText(evaluation.status) }}
                  </span>
                </div>
                <div class="card-actions">
                  <button
                    v-if="evaluation.status === 'incomplete'"
                    class="action-btn btn-start"
                    @click="startEvaluation(evaluation.id)"
                  >
                    <i class="bi bi-play-circle"></i> 응시하기
                  </button>
                  <button
                    v-if="evaluation.status === 'in-progress'"
                    class="action-btn btn-continue"
                    @click="continueEvaluation(evaluation.id)"
                  >
                    <i class="bi bi-arrow-clockwise"></i> 이어 하기
                  </button>
                  <button
                    v-if="evaluation.status === 'complete'"
                    class="action-btn btn-report"
                    @click="viewReport(evaluation.id)"
                  >
                    <i class="bi bi-file-text"></i> 평가 리포트
                  </button>
                </div>
              </div>
            </div>

            <!-- 빈 상태 -->
            <div v-else class="empty-state">
              <i class="bi bi-clipboard-check"></i>
              <h3>평가가 없습니다</h3>
              <p>새로운 평가가 등록되면 여기에 표시됩니다.</p>
            </div>

            <!-- 페이지네이션 -->
            <div v-if="totalPages > 1" class="pagination-container">
              <div class="pagination">
                <button @click="changePage(1)" :disabled="currentPage === 1">
                  <i class="bi bi-chevron-double-left"></i>
                </button>
                <button
                  @click="changePage(currentPage - 1)"
                  :disabled="currentPage === 1"
                >
                  <i class="bi bi-chevron-left"></i>
                </button>

                <button
                  v-for="page in pageNumbers"
                  :key="page"
                  @click="changePage(page)"
                  :class="{ active: page === currentPage }"
                >
                  {{ page }}
                </button>

                <button
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                >
                  <i class="bi bi-chevron-right"></i>
                </button>
                <button
                  @click="changePage(totalPages)"
                  :disabled="currentPage === totalPages"
                >
                  <i class="bi bi-chevron-double-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 완료 탭 -->
          <div v-if="currentTab === 1" class="tab-panel active">
            <div class="empty-state">
              <i class="bi bi-check-circle"></i>
              <h3>완료된 평가가 없습니다</h3>
              <p>평가를 완료하면 여기에 표시됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from "vue";

export default {
  name: "EvaluationPage",
  setup() {
    // 반응형 데이터
    const subjectInfo = ref("영어 4 | 학생1");
    const currentTab = ref(0);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);

    // 탭 목록
    const tabs = ref([
      { label: "미완료", key: "incomplete" },
      { label: "완료", key: "complete" },
      { label: "전체", key: "all" },
    ]);

    // 단원 목록
    const units = ref([
      { value: "1", label: "1. How Are You?" },
      { value: "2", label: "2. This Is My Friend" },
      { value: "3", label: "3. Don't Push" },
      { value: "4", label: "4. I'm Happy" },
      { value: "5", label: "5. What Time Is It?" },
      { value: "6", label: "6. Is This Your Cap?" },
      { value: "7", label: "7. What Day Is It Today?" },
      { value: "8", label: "8. Let's Play Badminton" },
      { value: "9", label: "9. How Much Is It?" },
      { value: "10", label: "10. It's in the Box" },
      { value: "11", label: "11. What Are You Doing?" },
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
        unit: "2. This Is My Friend",
        lesson: "2. 둘째 시간",
        questions: 3,
        status: "in-progress",
      },
      {
        id: 2,
        type: "lesson",
        title: "[퀴즈 3] This Is My Friend",
        unit: "2. This Is My Friend",
        lesson: "3. 셋째 시간",
        questions: 3,
        status: "incomplete",
      },
      {
        id: 3,
        type: "unit",
        title: "This Is My Friend 단원 평가",
        unit: "2. This Is My Friend",
        lesson: "",
        questions: 10,
        status: "incomplete",
      },
      {
        id: 4,
        type: "lesson",
        title: "[퀴즈 1] Don't Push",
        unit: "3. Don't Push",
        lesson: "1. 첫째 시간",
        questions: 3,
        status: "incomplete",
      },
      {
        id: 5,
        type: "lesson",
        title: "[퀴즈 2] Don't Push",
        unit: "3. Don't Push",
        lesson: "2. 둘째 시간",
        questions: 3,
        status: "incomplete",
      },
      {
        id: 6,
        type: "lesson",
        title: "[퀴즈 3] Don't Push",
        unit: "3. Don't Push",
        lesson: "3. 셋째 시간",
        questions: 3,
        status: "incomplete",
      },
      {
        id: 7,
        type: "unit",
        title: "Don't Push 단원 평가",
        unit: "3. Don't Push",
        lesson: "",
        questions: 10,
        status: "incomplete",
      },
      {
        id: 8,
        type: "lesson",
        title: "[퀴즈 1] I'm Happy",
        unit: "4. I'm Happy",
        lesson: "1. 첫째 시간",
        questions: 3,
        status: "incomplete",
      },
      {
        id: 9,
        type: "lesson",
        title: "[퀴즈 2] I'm Happy",
        unit: "4. I'm Happy",
        lesson: "2. 둘째 시간",
        questions: 3,
        status: "incomplete",
      },
      {
        id: 10,
        type: "lesson",
        title: "[퀴즈 3] I'm Happy",
        unit: "4. I'm Happy",
        lesson: "3. 셋째 시간",
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
      // 전체 탭은 모든 데이터

      // 단원별 필터링
      if (filters.unit !== "all") {
        const unitNumber = filters.unit;
        filtered = filtered.filter((item) =>
          item.unit.startsWith(unitNumber + ".")
        );
      }

      // 정렬
      if (filters.sortOrder === "deadline") {
        // 마감일순 정렬 로직 (실제로는 마감일 데이터가 필요)
        filtered.sort((a, b) => a.id - b.id);
      } else {
        // 등록일순 (기본)
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
      currentPage.value = 1; // 탭 변경 시 페이지 리셋
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
          return "미응시";
        case "in-progress":
          return "진행중";
        case "complete":
          return "완료";
        default:
          return "";
      }
    };

    const startEvaluation = (id) => {
      const url = `evaluation.html?id=${id}&action=start`;
      window.open(
        url,
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );
    };

    const continueEvaluation = (id) => {
      const url = `evaluation.html?id=${id}&action=continue`;
      window.open(
        url,
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );
    };

    const viewReport = (id) => {
      const url = `evaluation-report.html?id=${id}`;
      window.open(
        url,
        "_blank",
        "width=1200,height=800,scrollbars=yes,resizable=yes"
      );
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
      getStatusClass,
      getStatusText,
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

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8fafc;
  color: #333;
  line-height: 1.6;
}

/* 헤더 스타일 */
.header {
  background-color: #034582;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(30, 64, 175, 0.1);
}

.navbar-nav .nav-link {
  font-size: 1.1rem;
  padding: 0.7rem 1.2rem;
}

.navbar-nav .nav-item {
  margin-right: 0.8rem;
}

.navbar-brand {
  font-size: 1.5rem;
}

/* 메인 컨테이너 */
.main-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

/* 브레드크럼 */
.breadcrumb-section {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 1rem;
}

.breadcrumb {
  background: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
  color: #6b7280;
}

/* 탭 스타일 */
.tab-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.tab-nav {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tab-button {
  flex: 1;
  padding: 1rem 2rem;
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-button.active {
  color: #034582;
  background: white;
}

.tab-button.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #034582;
}

.tab-content {
  padding: 2rem;
}

.tab-panel {
  display: block;
}

/* 필터 영역 */
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.total-count {
  font-size: 1.1rem;
  color: #374151;
}

.total-count .number {
  color: #034582;
  font-weight: 600;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  min-width: 120px;
}

/* 평가 카드 */
.evaluation-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.evaluation-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.evaluation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-info {
  flex: 1;
}

.evaluation-type {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.type-lesson {
  background: #dbeafe;
  color: #1e40af;
}

.type-unit {
  background: #d1fae5;
  color: #065f46;
}

.evaluation-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.evaluation-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.evaluation-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.status-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
}

.status-incomplete {
  background: #fef3c7;
  color: #92400e;
}

.status-in-progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-complete {
  background: #d1fae5;
  color: #065f46;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-btn {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-start {
  background: #034582;
  color: white;
}

.btn-start:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

.btn-continue {
  background: #059669;
  color: white;
}

.btn-continue:hover {
  background: #047857;
  transform: translateY(-1px);
}

.btn-report {
  background: #7c3aed;
  color: white;
}

.btn-report:hover {
  background: #6d28d9;
  transform: translateY(-1px);
}

/* 페이지네이션 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.pagination {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.pagination button {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination button.active {
  background: #034582;
  color: white;
  border-color: #034582;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* 반응형 */
@media (max-width: 768px) {
  .main-container {
    padding: 0 1rem;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }

  .evaluation-card {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
  }

  .card-actions {
    flex-direction: column;
  }

  .action-btn {
    text-align: center;
    justify-content: center;
  }
}
</style>
