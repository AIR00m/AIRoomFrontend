<template>
  <div v-if="visible" class="modal-overlay" @click="handleBackdropClick">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <h2 class="modal-title">📚 단원별 상세 분석</h2>
        <button class="close-btn" @click="closeModal" title="닫기">✖️</button>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="modal-loading">
        <div class="spinner"></div>
        <p>단원별 상세 데이터를 분석하는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="modal-error">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button @click="loadDetailData" class="retry-btn">다시 시도</button>
      </div>

      <!-- 메인 콘텐츠 -->
      <div v-else class="modal-content">
        <!-- 필터 섹션 -->
        <div class="filter-section">
          <div class="filter-controls">
            <div class="filter-group">
              <label>분석 기간</label>
              <select
                v-model="selectedPeriod"
                class="filter-select"
                @change="loadDetailData"
              >
                <option value="DAILY">📆 일별</option>
                <option value="MONTHLY">📅 월별</option>
                <option value="CUSTOM">⚙️ 사용자 지정</option>
              </select>
            </div>
            <div class="filter-group">
              <label>시작일</label>
              <input
                type="date"
                v-model="dateFrom"
                class="date-input"
                @change="loadDetailData"
              />
            </div>
            <div class="filter-group">
              <label>종료일</label>
              <input
                type="date"
                v-model="dateTo"
                class="date-input"
                @change="loadDetailData"
              />
            </div>
          </div>
        </div>

        <!-- 단원별 학생 성취 현황 -->
        <div v-if="detailData.length > 0" class="detail-content">
          <div class="section-title">👥 학생별 단원 성취 현황</div>

          <!-- 단원 탭 -->
          <div class="unit-tabs">
            <button
              v-for="unit in uniqueUnits"
              :key="unit.unitNum"
              :class="['unit-tab', { active: selectedUnit === unit.unitNum }]"
              @click="selectedUnit = unit.unitNum"
            >
              {{ unit.unitNum }}. {{ unit.unitTitle }}
            </button>
          </div>

          <!-- 선택된 단원의 학생별 데이터 -->
          <div v-if="currentUnitData.length > 0" class="unit-detail-section">
            <div class="unit-summary">
              <div class="summary-card">
                <div class="summary-icon">👥</div>
                <div class="summary-info">
                  <div class="summary-value">
                    {{ currentUnitData.length }}명
                  </div>
                  <div class="summary-label">참여 학생</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">📊</div>
                <div class="summary-info">
                  <div class="summary-value">{{ currentUnitAverage }}%</div>
                  <div class="summary-label">평균 정답률</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">📝</div>
                <div class="summary-info">
                  <div class="summary-value">
                    {{ currentUnitTotalProblems }}
                  </div>
                  <div class="summary-label">총 문제 수</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">✅</div>
                <div class="summary-info">
                  <div class="summary-value">
                    {{ currentUnitCorrectProblems }}
                  </div>
                  <div class="summary-label">정답 수</div>
                </div>
              </div>
            </div>

            <!-- 차트 영역 -->
            <div class="chart-section">
              <div class="chart-container">
                <canvas ref="detailChartRef"></canvas>
              </div>
            </div>

            <!-- 학생별 상세 테이블 -->
            <div class="students-table-container">
              <table class="students-detail-table">
                <thead>
                  <tr>
                    <th @click="sortStudents('usClassroomStudentName')">
                      학생명
                      <span
                        class="sort-indicator"
                        v-if="sortConfig.key === 'usClassroomStudentName'"
                      >
                        {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                      </span>
                    </th>
                    <th @click="sortStudents('usAvgAccuracyRate')">
                      정답률 (%)
                      <span
                        class="sort-indicator"
                        v-if="sortConfig.key === 'usAvgAccuracyRate'"
                      >
                        {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                      </span>
                    </th>
                    <th @click="sortStudents('usTotalProblemsSolved')">
                      총 문제 수
                      <span
                        class="sort-indicator"
                        v-if="sortConfig.key === 'usTotalProblemsSolved'"
                      >
                        {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                      </span>
                    </th>
                    <th @click="sortStudents('usTotalCorrectProblems')">
                      정답 수
                      <span
                        class="sort-indicator"
                        v-if="sortConfig.key === 'usTotalCorrectProblems'"
                      >
                        {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                      </span>
                    </th>
                    <th>성취 수준</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="student in sortedCurrentUnitData"
                    :key="student.usClassroomStudentName"
                    :class="getStudentRowClass(student.usAvgAccuracyRate)"
                  >
                    <td class="student-name">
                      {{ student.usClassroomStudentName }}
                    </td>
                    <td class="accuracy-rate">
                      <div class="progress-container">
                        <div class="progress-bar">
                          <div
                            class="progress-fill"
                            :style="{
                              width: `${student.usAvgAccuracyRate || 0}%`,
                              backgroundColor: getScoreColor(
                                student.usAvgAccuracyRate || 0
                              ),
                            }"
                          ></div>
                        </div>
                        <span
                          class="progress-text"
                          :style="{
                            color: getScoreColor(
                              student.usAvgAccuracyRate || 0
                            ),
                          }"
                        >
                          {{ student.usAvgAccuracyRate || 0 }}%
                        </span>
                      </div>
                    </td>
                    <td class="problems-solved">
                      {{ student.usTotalProblemsSolved || 0 }}
                    </td>
                    <td class="correct-problems">
                      {{ student.usTotalCorrectProblems || 0 }}
                    </td>
                    <td class="achievement-level">
                      <span
                        :class="[
                          'level-badge',
                          getPerformanceClass(student.usAvgAccuracyRate || 0),
                        ]"
                      >
                        {{ getPerformanceIcon(student.usAvgAccuracyRate || 0) }}
                        {{ getPerformanceText(student.usAvgAccuracyRate || 0) }}
                      </span>
                    </td>
                    <td class="action-cell">
                      <button
                        class="action-btn feedback-btn"
                        @click="provideFeedback(student)"
                        title="개별 피드백"
                      >
                        💬 피드백
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 분석 및 제안 -->
            <div class="analysis-suggestions">
              <div class="suggestion-card">
                <div class="suggestion-header">
                  <span class="suggestion-icon">💡</span>
                  <h4>학습 분석 결과</h4>
                </div>
                <div class="suggestion-content">
                  <ul class="analysis-list">
                    <li v-if="highPerformers.length > 0">
                      <strong>우수 학생 (80% 이상):</strong>
                      {{
                        highPerformers
                          .map((s) => s.usClassroomStudentName)
                          .join(", ")
                      }}
                      ({{ highPerformers.length }}명)
                    </li>
                    <li v-if="averagePerformers.length > 0">
                      <strong>보통 학생 (60-79%):</strong>
                      {{
                        averagePerformers
                          .map((s) => s.usClassroomStudentName)
                          .join(", ")
                      }}
                      ({{ averagePerformers.length }}명)
                    </li>
                    <li v-if="lowPerformers.length > 0">
                      <strong>도움 필요 학생 (60% 미만):</strong>
                      {{
                        lowPerformers
                          .map((s) => s.usClassroomStudentName)
                          .join(", ")
                      }}
                      ({{ lowPerformers.length }}명)
                    </li>
                  </ul>
                </div>
              </div>

              <div class="suggestion-card">
                <div class="suggestion-header">
                  <span class="suggestion-icon">🎯</span>
                  <h4>교육 제안사항</h4>
                </div>
                <div class="suggestion-content">
                  <div class="recommendations">
                    <div v-if="lowPerformers.length > 0" class="recommendation">
                      <strong>개별 지도 필요:</strong>
                      {{ lowPerformers.length }}명의 학생이 이 단원에서 어려움을
                      겪고 있습니다. 기초 개념 재학습과 추가 문제 풀이를
                      권장합니다.
                    </div>
                    <div
                      v-if="
                        highPerformers.length >
                        averagePerformers.length + lowPerformers.length
                      "
                      class="recommendation"
                    >
                      <strong>심화 학습 제공:</strong> 대부분의 학생이 우수한
                      성취를 보이고 있어 심화 문제나 응용 학습을 진행해도
                      좋겠습니다.
                    </div>
                    <div v-if="currentUnitAverage < 70" class="recommendation">
                      <strong>단원 재학습 권장:</strong> 반 평균이
                      {{ currentUnitAverage }}%로 낮습니다. 단원 전체에 대한
                      복습과 추가 설명이 필요할 것 같습니다.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 데이터 없음 -->
        <div v-else class="no-data">
          <div class="no-data-icon">📊</div>
          <p>선택한 기간에 대한 단원별 상세 데이터가 없습니다.</p>
        </div>
      </div>

      <!-- 모달 푸터 -->
      <div class="modal-footer">
        <button
          class="btn-secondary"
          @click="exportData"
          :disabled="!detailData.length"
        >
          📊 데이터 내보내기
        </button>
        <button class="btn-primary" @click="closeModal">닫기</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from "vue";
import * as statisticsApi from "@/utils/statisticsApi";

export default {
  name: "UnitDetailModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    classroomNo: {
      type: Number,
      required: true,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    // 반응형 데이터
    const loading = ref(false);
    const error = ref(null);
    const detailData = ref([]);
    const selectedPeriod = ref("MONTHLY");
    const dateFrom = ref("");
    const dateTo = ref("");
    const selectedUnit = ref(null);
    const sortConfig = ref({ key: null, direction: "asc" });
    const detailChartRef = ref(null);

    // 계산된 속성
    const uniqueUnits = computed(() => {
      const units = [];
      const seen = new Set();

      detailData.value.forEach((item) => {
        const key = `${item.unitNum}-${item.unitTitle}`;
        if (!seen.has(key)) {
          seen.add(key);
          units.push({
            unitNum: item.unitNum,
            unitTitle: item.unitTitle,
          });
        }
      });

      return units.sort((a, b) => a.unitNum - b.unitNum);
    });

    const currentUnitData = computed(() => {
      if (!selectedUnit.value) return [];
      return detailData.value.filter(
        (item) => item.unitNum === selectedUnit.value
      );
    });

    const currentUnitAverage = computed(() => {
      if (currentUnitData.value.length === 0) return 0;
      const total = currentUnitData.value.reduce(
        (sum, item) => sum + (item.usAvgAccuracyRate || 0),
        0
      );
      return Math.round((total / currentUnitData.value.length) * 100) / 100;
    });

    const currentUnitTotalProblems = computed(() => {
      return currentUnitData.value.reduce(
        (sum, item) => sum + (item.usTotalProblemsSolved || 0),
        0
      );
    });

    const currentUnitCorrectProblems = computed(() => {
      return currentUnitData.value.reduce(
        (sum, item) => sum + (item.usTotalCorrectProblems || 0),
        0
      );
    });

    const sortedCurrentUnitData = computed(() => {
      if (!sortConfig.value.key) return currentUnitData.value;

      return [...currentUnitData.value].sort((a, b) => {
        let aVal = a[sortConfig.value.key];
        let bVal = b[sortConfig.value.key];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.value.direction === "asc"
            ? aVal - bVal
            : bVal - aVal;
        }

        if (aVal < bVal) return sortConfig.value.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.value.direction === "asc" ? 1 : -1;
        return 0;
      });
    });

    // 성과별 학생 분류
    const highPerformers = computed(() =>
      currentUnitData.value.filter((s) => (s.usAvgAccuracyRate || 0) >= 80)
    );

    const averagePerformers = computed(() =>
      currentUnitData.value.filter((s) => {
        const rate = s.usAvgAccuracyRate || 0;
        return rate >= 60 && rate < 80;
      })
    );

    const lowPerformers = computed(() =>
      currentUnitData.value.filter((s) => (s.usAvgAccuracyRate || 0) < 60)
    );

    // 유틸리티 함수들
    const getScoreColor = statisticsApi.getScoreColor;

    const getPerformanceClass = (score) => {
      if (score >= 80) return "excellent";
      if (score >= 60) return "good";
      if (score >= 40) return "fair";
      return "poor";
    };

    const getPerformanceIcon = (score) => {
      if (score >= 80) return "🌟";
      if (score >= 60) return "👍";
      if (score >= 40) return "📚";
      return "💪";
    };

    const getPerformanceText = (score) => {
      if (score >= 80) return "우수";
      if (score >= 60) return "양호";
      if (score >= 40) return "보통";
      return "개선필요";
    };

    const getStudentRowClass = (score) => {
      return `student-row ${getPerformanceClass(score)}`;
    };

    // 날짜 초기화
    const initializeDates = () => {
      const { startDate, endDate } = statisticsApi.getDefaultDateRange();
      dateFrom.value = startDate;
      dateTo.value = endDate;
    };

    // 데이터 로드
    const loadDetailData = async () => {
      if (!props.classroomNo) return;

      loading.value = true;
      error.value = null;

      try {
        const response = await statisticsApi.getClassroomUnitSummaryDetail({
          classroomNo: props.classroomNo,
          lsType: selectedPeriod.value,
          lsStartDate: dateFrom.value,
          lsEndDate: dateTo.value,
        });

        detailData.value = response;

        // 첫 번째 단원을 기본 선택
        if (uniqueUnits.value.length > 0 && !selectedUnit.value) {
          selectedUnit.value = uniqueUnits.value[0].unitNum;
        }

        // 차트 초기화
        setTimeout(() => {
          initChart();
        }, 100);
      } catch (err) {
        error.value = err.message || "데이터를 불러오는데 실패했습니다.";
      } finally {
        loading.value = false;
      }
    };

    // 차트 초기화
    const initChart = async () => {
      await nextTick();
      if (detailChartRef.value && currentUnitData.value.length > 0) {
        try {
          const { Chart, registerables } = await import("chart.js");
          Chart.register(...registerables);

          // 기존 차트가 있으면 제거
          if (window.currentChart) {
            window.currentChart.destroy();
          }

          const ctx = detailChartRef.value.getContext("2d");

          window.currentChart = new Chart(ctx, {
            type: "bar",
            data: {
              labels: currentUnitData.value.map(
                (item) => item.usClassroomStudentName
              ),
              datasets: [
                {
                  label: "정답률 (%)",
                  data: currentUnitData.value.map(
                    (item) => item.usAvgAccuracyRate || 0
                  ),
                  backgroundColor: currentUnitData.value.map((item) =>
                    getScoreColor(item.usAvgAccuracyRate || 0)
                  ),
                  borderColor: currentUnitData.value.map((item) =>
                    getScoreColor(item.usAvgAccuracyRate || 0)
                  ),
                  borderWidth: 2,
                  borderRadius: 4,
                },
              ],
            },
            options: {
              ...statisticsApi.getChartOptions(),
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const student = currentUnitData.value[context.dataIndex];
                      return [
                        `정답률: ${context.parsed.y}%`,
                        `총 문제: ${student.usTotalProblemsSolved || 0}개`,
                        `정답: ${student.usTotalCorrectProblems || 0}개`,
                      ];
                    },
                  },
                },
              },
            },
          });
        } catch (err) {
          console.error("차트 초기화 실패:", err);
        }
      }
    };

    // 정렬
    const sortStudents = (key) => {
      if (sortConfig.value.key === key) {
        sortConfig.value.direction =
          sortConfig.value.direction === "asc" ? "desc" : "asc";
      } else {
        sortConfig.value.key = key;
        sortConfig.value.direction = "asc";
      }
    };

    // 모달 제어
    const closeModal = () => {
      if (window.currentChart) {
        window.currentChart.destroy();
        window.currentChart = null;
      }
      emit("close");
    };

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        closeModal();
      }
    };

    // 액션 함수들
    const provideFeedback = (student) => {
      alert(
        `${student.usClassroomStudentName} 학생에게 개별 피드백을 제공합니다.`
      );
    };

    const exportData = () => {
      alert("데이터 내보내기 기능은 개발 중입니다.");
    };

    // 워처
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal) {
          initializeDates();
          loadDetailData();
        }
      }
    );

    watch(selectedUnit, () => {
      setTimeout(() => {
        initChart();
      }, 100);
    });

    return {
      // 반응형 데이터
      loading,
      error,
      detailData,
      selectedPeriod,
      dateFrom,
      dateTo,
      selectedUnit,
      sortConfig,
      detailChartRef,

      // 계산된 속성
      uniqueUnits,
      currentUnitData,
      currentUnitAverage,
      currentUnitTotalProblems,
      currentUnitCorrectProblems,
      sortedCurrentUnitData,
      highPerformers,
      averagePerformers,
      lowPerformers,

      // 메서드
      loadDetailData,
      sortStudents,
      closeModal,
      handleBackdropClick,
      provideFeedback,
      exportData,
      getScoreColor,
      getPerformanceClass,
      getPerformanceIcon,
      getPerformanceText,
      getStudentRowClass,
    };
  },
};
</script>

<style scoped>
/* 모달 기본 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #ffe066;
  background: linear-gradient(135deg, #fff9e6, #fffbf0);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #ffebee;
  transform: scale(1.1);
}

/* 로딩 및 에러 상태 */
.modal-loading,
.modal-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ffe066;
  border-top: 4px solid #ff9800;
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

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
}

/* 모달 콘텐츠 */
.modal-content {
  flex: 1;
  padding: 1.5rem 2rem;
}

/* 필터 섹션 */
.filter-section {
  background: #fffbf0;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 2px solid #fff5d6;
}

.filter-controls {
  display: flex;
  gap: 1.5rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 600;
  color: #ff9800;
  font-size: 0.9rem;
}

.filter-select,
.date-input {
  padding: 0.5rem;
  border: 2px solid #ffe066;
  border-radius: 8px;
  background: white;
  color: #ff9800;
  font-weight: 600;
  min-width: 120px;
}

/* 상세 콘텐츠 */
.detail-content {
  margin-top: 1rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 1rem;
  text-align: center;
}

/* 단원 탭 */
.unit-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.unit-tab {
  padding: 0.5rem 1rem;
  border: 2px solid #ffe066;
  border-radius: 20px;
  background: white;
  color: #ff9800;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.unit-tab:hover {
  background: #fffbf0;
}

.unit-tab.active {
  background: #ff9800;
  color: white;
  border-color: #f57c00;
}

/* 단원 요약 */
.unit-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  background: white;
  border: 2px solid #fff5d6;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-icon {
  font-size: 2rem;
}

.summary-info {
  flex: 1;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
}

.summary-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

/* 차트 섹션 */
.chart-section {
  margin-bottom: 1.5rem;
}

.chart-container {
  position: relative;
  height: 300px;
  background: #fffbf0;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid #fff5d6;
}

/* 학생별 상세 테이블 */
.students-table-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.students-detail-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.students-detail-table th {
  background: #ff9800;
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
}

.students-detail-table th:hover {
  background: #f57c00;
}

.sort-indicator {
  margin-left: 0.5rem;
  font-size: 0.8rem;
}

.students-detail-table td {
  padding: 0.75rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.student-row:hover {
  background: #fffbf0;
}

.student-row.excellent {
  border-left: 4px solid #4caf50;
}

.student-row.good {
  border-left: 4px solid #ff9800;
}

.student-row.fair {
  border-left: 4px solid #ffc107;
}

.student-row.poor {
  border-left: 4px solid #f44336;
}

.student-name {
  text-align: left;
  font-weight: 600;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.progress-text {
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 40px;
}

.level-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.level-badge.excellent {
  background: #e8f5e8;
  color: #2e7d32;
}

.level-badge.good {
  background: #fff3e0;
  color: #f57c00;
}

.level-badge.fair {
  background: #fffde7;
  color: #ff8f00;
}

.level-badge.poor {
  background: #ffebee;
  color: #c62828;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.feedback-btn {
  background: #4caf50;
  color: white;
}

.feedback-btn:hover {
  background: #388e3c;
  transform: translateY(-1px);
}

/* 분석 및 제안 */
.analysis-suggestions {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.suggestion-card {
  flex: 1;
  min-width: 300px;
  background: white;
  border: 2px solid #fff5d6;
  border-radius: 12px;
  padding: 1.5rem;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.suggestion-icon {
  font-size: 1.5rem;
}

.suggestion-header h4 {
  color: #ff9800;
  font-weight: 700;
  margin: 0;
}

.analysis-list {
  list-style: none;
  padding: 0;
}

.analysis-list li {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background: #fffbf0;
  border-radius: 8px;
  border-left: 4px solid #ff9800;
}

.recommendations {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation {
  padding: 0.75rem;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
  line-height: 1.5;
}

/* 데이터 없음 */
.no-data {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* 모달 푸터 */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-top: 2px solid #ffe066;
  background: #fffbf0;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #ff9800;
  color: white;
}

.btn-primary:hover {
  background: #f57c00;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #ff9800;
  border: 2px solid #ff9800;
}

.btn-secondary:hover:not(:disabled) {
  background: #ff9800;
  color: white;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .modal-container {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .unit-tabs {
    justify-content: flex-start;
  }

  .unit-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .analysis-suggestions {
    flex-direction: column;
  }

  .students-detail-table {
    font-size: 0.85rem;
  }

  .students-detail-table th,
  .students-detail-table td {
    padding: 0.5rem 0.25rem;
  }
}
</style>
