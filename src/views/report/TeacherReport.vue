<template>
  <!-- 헤더 -->
  <header class="header">
    <Header></Header>
  </header>

  <div class="analysis-page">
    <div class="analysis-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="page-text">
          <h1 class="page-title">📊 우리 반 학습 분석 ✨</h1>
          <p class="page-subtitle">
            아이들의 소중한 학습 여정을 함께 살펴보아요!
          </p>
          <nav class="cute-breadcrumb">
            <span>홈</span>
            <span class="separator">></span>
            <span>학습 리포트</span>
            <span class="separator">></span>
            <span class="current">학습 분석</span>
          </nav>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>우리 반 학습 데이터를 분석하는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <p>{{ error }}</p>
          <button @click="loadData" class="retry-btn">다시 시도</button>
        </div>
      </div>

      <!-- 메인 콘텐츠 -->
      <div v-else>
        <!-- 안내 상자 -->
        <div class="notice-box">
          <span class="notice-icon">💡</span>
          <ul class="notice-list">
            <li>
              월별/주별/일별로 분석한 우리 반 학생들의 학습 현황을 확인할 수
              있어요.
            </li>
            <li>분석을 통해 학생들의 강점과 보완점을 파악해보세요!</li>
            <li>개별 학생에게 필요한 맞춤 지도 방안을 찾아보아요.</li>
          </ul>
        </div>

        <!-- 분석 컨텐츠 -->
        <div class="analysis-content">
          <!-- 필터 섹션 -->
          <!-- <div class="filter-section">
            <div class="section-title">🔍 분석 조건 설정</div>
            <div class="filter-controls">
              <div class="filter-group">
                <label>분석 기간</label>
                <select
                  v-model="selectedPeriod"
                  class="filter-select"
                  @change="loadData"
                >
                  <option value="DAILY">📆 일별 분석</option>
                  <option value="MONTHLY">📅 월별 분석</option>
                  <option value="CUSTOM">⚙️ 사용자 지정</option>
                </select>
              </div>
              <div class="filter-group">
                <label>시작일</label>
                <input
                  type="date"
                  v-model="dateFrom"
                  class="date-input"
                  @change="loadData"
                />
              </div>
              <div class="filter-group">
                <label>종료일</label>
                <input
                  type="date"
                  v-model="dateTo"
                  class="date-input"
                  @change="loadData"
                />
              </div>
            </div>
          </div> -->
          <!-- 분석 조건 설정 -->
          <div class="analysis-controls">
            <div class="filter-controls">
              <div class="filter-group">
                <label>📅 분석 기간</label>
                <select v-model="selectedPeriod" class="filter-select" @change="onPeriodChange">
                  <option value="DAILY">📆 일별</option>
                  <option value="MONTHLY">🗓️ 월별</option>
                  <option value="CUSTOM">📅 사용자 지정</option>
                </select>
              </div>

              <!-- DAILY: 하나의 날짜만 선택 -->
              <div v-if="selectedPeriod === 'DAILY'" class="filter-group">
                <label>날짜 선택</label>
                <input type="date" v-model="dateFrom" class="date-input" @change="loadData" />
              </div>

              <!-- MONTHLY: 월 선택 -->
              <div v-else-if="selectedPeriod === 'MONTHLY'" class="filter-group">
                <label>월 선택</label>
                <input type="month" v-model="dateFrom" class="date-input" @change="loadData" />
              </div>

              <!-- CUSTOM: 날짜 범위 선택 -->
              <div v-else-if="selectedPeriod === 'CUSTOM'" class="filter-group">
                <label>기간 설정</label>
                <div class="date-range">
                  <input type="date" v-model="dateFrom" class="date-input" @change="loadData" />
                  <span class="date-separator">~</span>
                  <input type="date" v-model="dateTo" class="date-input" @change="loadData" />
                </div>
              </div>
            </div>
          </div><br></br>

          <!-- 요약 통계 -->
          <div class="stats-section">
            <div class="section-title">📈 우리 반 학습 요약</div>
            <div class="summary-stats">
              <div class="stat-card">
                <div class="stat-icon">📚</div>
                <div class="stat-content">
                  <div class="stat-value">
                    {{ summaryStats.totalLearningDays }}
                  </div>
                  <div class="stat-label">총 학습일</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⏰</div>
                <div class="stat-content">
                  <div class="stat-value">
                    {{
                      statisticsApi.formatTime(summaryStats.totalLearningTime)
                    }}
                  </div>
                  <div class="stat-label">총 학습시간</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-content">
                  <div class="stat-value">{{ summaryStats.totalProblems }}</div>
                  <div class="stat-label">총 문제 수</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                  <div class="stat-value">
                    {{ summaryStats.correctProblems }}
                  </div>
                  <div class="stat-label">정답 수</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                  <div class="stat-value">{{ Math.round(summaryStats.accuracyRate) }}점</div>
                  <div class="stat-label">평균 점수</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 단원별 성취 현황 -->
          <div class="stats-section">
            <div class="section-title">📊 단원별 성취 현황</div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color our-class"></div>
                <span>🌟 우리반 평균</span>
              </div>
            </div>
            <div class="chart-container">
              <canvas ref="achievementChartRef"></canvas>
            </div>

            <!-- 단원별 상세 분석 -->
            <div v-if="unitSummaryData.length > 0" class="unit-analysis">
              <h3 class="analysis-title">📚 단원별 상세 분석</h3>
              <div class="unit-grid">
                <div v-for="unit in unitSummaryData" :key="unit.unitNum" class="unit-detail-card">
                  <div class="unit-detail-header">
                    <span class="unit-number">{{ unit.unitNum }}단원</span>
                    <div class="unit-score" :style="{
                      color: statisticsApi.getScoreColor(
                        unit.lsAvgAccuracyRate
                      ),
                    }">
                      {{ Math.round(unit.lsAvgAccuracyRate) || 0 }}점
                    </div>
                  </div>
                  <div class="unit-title">{{ unit.unitTitle }}</div>
                  <div class="unit-stats">
                    <div class="stat-row">
                      <span class="stat-label">총 문제:</span>
                      <span class="stat-value">{{ unit.lsTotalProblemsSolved || 0 }}개</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">정답:</span>
                      <span class="stat-value">{{ unit.lsTotalCorrectProblems || 0 }}개</span>
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{
                      width: `${unit.lsAvgAccuracyRate || 0}%`,
                      backgroundColor: statisticsApi.getScoreColor(
                        unit.lsAvgAccuracyRate
                      ),
                    }"></div>
                  </div>
                </div>
              </div>

              <!-- 상세 분석 버튼 -->
              <div class="detail-analysis-section">
                <button class="detail-analysis-btn" @click="openUnitDetailModal" :disabled="!unitSummaryData.length">
                  📊 학생별 단원 상세 분석 보기
                </button>
              </div>
            </div>
          </div>

          <!-- 학습 패턴 분석 -->
          <div class="stats-section">
            <div class="section-title">🔍 학습 패턴 분석</div>
            <div class="analysis-text">
              <div class="insight-card">
                <div class="insight-icon">💡</div>
                <div class="insight-content">
                  <h4>주요 분석 결과</h4>
                  <ul class="insight-list">
                    <li v-if="analysisInsights.strongUnits.length > 0">
                      <strong>잘하는 단원:</strong>
                      {{ analysisInsights.strongUnits.join(", ") }}
                    </li>
                    <li v-if="analysisInsights.weakUnits.length > 0">
                      <strong>보완 필요 단원:</strong>
                      {{ analysisInsights.weakUnits.join(", ") }}
                    </li>
                    <li>
                      <strong>평균 점수:</strong>
                      {{ Math.round(summaryStats.accuracyRate) }}점
                      <span :class="getPerformanceClass(summaryStats.accuracyRate)">
                        ({{ getPerformanceText(summaryStats.accuracyRate) }})
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="recommendation-card">
                <div class="rec-icon">🎯</div>
                <div class="rec-content">
                  <h4>교육 개선 제안</h4>
                  <p v-if="summaryStats.accuracyRate >= 80" class="recommendation">
                    우수한 성취도를 보이고 있습니다! 심화 학습이나 프로젝트 기반
                    학습을 통해 더욱 발전시켜보세요.
                  </p>
                  <p v-else-if="summaryStats.accuracyRate >= 60" class="recommendation">
                    안정적인 학습 진행을 보이고 있어요. 부족한 단원에 대한 추가
                    연습과 개별 지도를 권장합니다.
                  </p>
                  <p v-else class="recommendation">
                    기초 실력 향상이 필요해 보입니다. 개념 설명을 강화하고
                    단계별 학습을 진행해보세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 단원별 상세 분석 모달 -->
  <UnitDetailModal v-if="showUnitDetailModal" :visible="showUnitDetailModal" :classroom-no="classroomNo"
    @close="closeUnitDetailModal" />
</template>

<script>
import { ref, onMounted, nextTick, computed } from "vue";
import Header from "@/components/common/Header.vue";
import UnitDetailModal from "@/components/UnitDetailModal.vue";
import * as statisticsApi from "@/utils/statisticsApi";

export default {
  name: "TeacherReport",
  components: {
    Header,
    UnitDetailModal,
  },
  setup() {
    // 반응형 데이터
    const loading = ref(false);
    const error = ref(null);
    const selectedPeriod = ref("DAILY");
    const dateFrom = ref("");
    const dateTo = ref("");
    const achievementChartRef = ref(null);

    // API 응답 데이터
    const classroomSummaryData = ref({});
    const unitSummaryData = ref([]);

    // 모달 상태
    const showUnitDetailModal = ref(false);

    // 클래스룸 정보
    const classroomNo = ref(null);

    // 계산된 속성 - 요약 통계
    const summaryStats = computed(() => {
      const data = classroomSummaryData.value;
      return {
        totalLearningDays: data.lsTotalLearningDays || 0,
        totalLearningTime: data.lsTotalLearningTime || 0,
        totalProblems: data.lsTotalProblemsSolved || 0,
        correctProblems: data.lsTotalCorrectProblems || 0,
        accuracyRate: data.lsAvgAccuracyRate || 0,
      };
    });

    // 분석 인사이트
    const analysisInsights = computed(() => {
      const strongUnits = [];
      const weakUnits = [];

      unitSummaryData.value.forEach((unit) => {
        const rate = unit.lsAvgAccuracyRate || 0;
        if (rate >= 80) {
          strongUnits.push(unit.unitTitle);
        } else if (rate < 60) {
          weakUnits.push(unit.unitTitle);
        }
      });

      return { strongUnits, weakUnits };
    });

    // 유틸리티 함수들
    const getPerformanceClass = (score) => {
      if (score >= 80) return "performance-excellent";
      if (score >= 60) return "performance-good";
      if (score >= 40) return "performance-fair";
      return "performance-poor";
    };

    const getPerformanceText = (score) => {
      if (score >= 80) return "우수";
      if (score >= 60) return "양호";
      if (score >= 40) return "보통";
      return "개선필요";
    };

    // 날짜 초기화
    const initializeDates = () => {
      const today = new Date();

      if (selectedPeriod.value === "DAILY") {
        // 일별: 오늘 날짜
        dateFrom.value = today.toISOString().split('T')[0];
        dateTo.value = dateFrom.value;
      } else if (selectedPeriod.value === "MONTHLY") {
        // 월별: 이번 달
        const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        dateFrom.value = yearMonth;
        dateTo.value = yearMonth;
      } else {
        // 사용자 지정: 최근 7일
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        dateFrom.value = weekAgo.toISOString().split('T')[0];
        dateTo.value = today.toISOString().split('T')[0];
      }
    };

    // 클래스룸 정보 로드
    const loadClassroomInfo = () => {
      try {
        const userInfo = statisticsApi.extractUserInfo();
        classroomNo.value = userInfo.classroomNo;
      } catch (err) {
        error.value = err.message;
      }
    };

    // 클래스룸 학습 요약 로드
    const loadClassroomSummary = async () => {
      let apiLsType = selectedPeriod.value;
      let apiStartDate = dateFrom.value;
      let apiEndDate = dateTo.value;

      if (selectedPeriod.value === "CUSTOM") {
        apiLsType = "DAILY";
        // 날짜는 사용자가 입력한 범위 그대로 사용
        apiStartDate = dateFrom.value;
        apiEndDate = dateTo.value;
      } else if (selectedPeriod.value === "DAILY") {
        // DAILY는 시작일과 종료일이 같음
        apiEndDate = dateFrom.value;
      } else if (selectedPeriod.value === "MONTHLY") {
        // MONTHLY 처리
        const [year, month] = dateFrom.value.split("-");
        apiStartDate = `${year}-${month}-01`;
        const nextMonth = new Date(Number(year), Number(month), 1);
        const nextYear = nextMonth.getFullYear();
        const nextM = String(nextMonth.getMonth() + 1).padStart(2, "0");
        apiEndDate = `${nextYear}-${nextM}-01`;
      }

      const responseData = {
        classroomNo: classroomNo.value,
        lsType: apiLsType,
        lsStartDate: apiStartDate,
        lsEndDate: apiEndDate,
      };

      try {
        const response = await statisticsApi.getClassroomLearningSummary(
          responseData
        );

        classroomSummaryData.value = response;
      } catch (err) {
        throw new Error("클래스룸 학습 요약을 불러오는데 실패했습니다.");
      }
    };

    // 클래스룸 단원별 성취 현황 로드
    const loadClassroomUnitSummary = async () => {
      try {
        let apiLsType = selectedPeriod.value;
        let apiStartDate = dateFrom.value;
        let apiEndDate = dateTo.value;

        if (selectedPeriod.value === "CUSTOM") {
          apiLsType = "DAILY";
          // 날짜 범위는 그대로 유지
        } else if (selectedPeriod.value === "DAILY") {
          apiEndDate = dateFrom.value;
        } else if (selectedPeriod.value === "MONTHLY") {
          const [year, month] = dateFrom.value.split("-");
          apiStartDate = `${year}-${month}-01`;
          const nextMonth = new Date(Number(year), Number(month), 1);
          const nextYear = nextMonth.getFullYear();
          const nextM = String(nextMonth.getMonth() + 1).padStart(2, "0");
          apiEndDate = `${nextYear}-${nextM}-01`;
        }

        const responseData = {
          classroomNo: classroomNo.value,
          lsType: apiLsType,        // ✅ API용 변수 사용
          lsStartDate: apiStartDate,
          lsEndDate: apiEndDate,
        };

        const response = await statisticsApi.getClassroomUnitSummary(responseData);
        unitSummaryData.value = response;
      } catch (err) {
        throw new Error("단원별 성취 현황을 불러오는데 실패했습니다.");
      }
    };

    // 차트 초기화
    const initCharts = async () => {
      await nextTick();
      if (achievementChartRef.value && unitSummaryData.value.length > 0) {
        try {
          const { Chart, registerables } = await import("chart.js");
          Chart.register(...registerables);

          const ctx = achievementChartRef.value.getContext("2d");

          // 기존 차트가 있으면 제거
          if (window.teacherReportChart) {
            window.teacherReportChart.destroy();
          }

          window.teacherReportChart = new Chart(ctx, {
            type: "bar",
            data: {
              labels: unitSummaryData.value.map(
                (unit) => `${unit.unitNum}. ${unit.unitTitle}`
              ),
              datasets: [
                {
                  label: "평균 점수 (점)",
                  data: unitSummaryData.value.map(
                    (unit) => unit.lsAvgAccuracyRate || 0
                  ),
                  backgroundColor: "#ffdd29",
                  borderColor: "#ff9800",
                  borderWidth: 2,
                  borderRadius: 8,
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
                      const unit = unitSummaryData.value[context.dataIndex];
                      return [
                        `평균 점수: ${Math.round(context.parsed.y)}점`,
                        `총 문제: ${unit.lsTotalProblemsSolved || 0}개`,
                        `정답: ${unit.lsTotalCorrectProblems || 0}개`,
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

    // 전체 데이터 로드
    const loadData = async () => {
      if (!classroomNo.value) {
        error.value = "클래스룸 정보를 찾을 수 없습니다. 다시 로그인해주세요.";
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        await Promise.all([loadClassroomSummary(), loadClassroomUnitSummary()]);

        // 차트 초기화
        setTimeout(() => {
          initCharts();
        }, 100);
      } catch (err) {
        error.value = err.message || "데이터를 불러오는데 실패했습니다.";
      } finally {
        loading.value = false;
      }
    };

    // 모달 제어
    const openUnitDetailModal = () => {
      showUnitDetailModal.value = true;
    };

    const closeUnitDetailModal = () => {
      showUnitDetailModal.value = false;
    };

    // 생명주기 훅
    onMounted(async () => {
      initializeDates();
      loadClassroomInfo();
      await loadData();
    });

    return {
      // 반응형 데이터
      loading,
      error,
      selectedPeriod,
      dateFrom,
      dateTo,
      summaryStats,
      unitSummaryData,
      analysisInsights,
      showUnitDetailModal,
      classroomNo,

      // 차트 참조
      achievementChartRef,

      // API 및 유틸리티
      statisticsApi,

      // 메서드
      loadData,
      getPerformanceClass,
      getPerformanceText,
      openUnitDetailModal,
      closeUnitDetailModal,
    };
  },
};
</script>

<style scoped>
/* 기존 스타일 + 새로운 스타일 추가 */

/* 전역 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.analysis-page {
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.analysis-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 로딩 및 에러 상태 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.error-message {
  background: #ffebee;
  border: 2px solid #f44336;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  font-weight: 600;
}

.retry-btn:hover {
  background: #d32f2f;
}

/* 페이지 헤더 */
.page-header {
  background: linear-gradient(135deg,
      rgba(255, 152, 0, 0.15),
      rgba(255, 193, 7, 0.25));
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 152, 0, 0.3);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #e65100;
  margin: 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #f57c00;
  margin-top: 0.5rem;
}

.cute-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #ff9800;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.separator {
  margin: 0 0.25rem;
}

.current {
  font-weight: 700;
  color: #e65100;
}

/* 안내 상자 */
.notice-box {
  background: #fffbf0;
  border: 2px dashed #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
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

/* 분석 컨텐츠 */
.analysis-content {
  background: white;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* 필터 섹션 */
.filter-section {
  background: white;
  border: 2px solid #ffe066;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filter-controls {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: end;
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
  padding: 0.75rem 1rem;
  border: 2px solid #ffe066;
  border-radius: 12px;
  background: white;
  color: #ff9800;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 140px;
}

.filter-select:focus,
.date-input:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.2);
}

/* 통계 섹션 */
.stats-section {
  background: #fffbf0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid #fff5d6;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

/* 요약 통계 */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 2px solid #fff5d6;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.15);
  border-color: #ffdd29;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffdd29;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #666;
  font-weight: 600;
  font-size: 0.9rem;
}

/* 차트 관련 */
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-color.our-class {
  background: #ffdd29;
}

.chart-container {
  position: relative;
  height: 300px;
  margin: 1.5rem 0;
  background: #fffbf0;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid #fff5d6;
}

/* 단원별 상세 분석 */
.unit-analysis {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #fff5d6;
}

.analysis-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 1.5rem;
  text-align: center;
}

.unit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.unit-detail-card {
  background: white;
  border: 2px solid #fff5d6;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.unit-detail-card:hover {
  border-color: #ffdd29;
  box-shadow: 0 4px 12px rgba(255, 221, 41, 0.1);
  transform: translateY(-2px);
}

.unit-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.unit-number {
  background: #ff9800;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
}

.unit-score {
  font-weight: 700;
  font-size: 1.3rem;
}

.unit-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.unit-stats {
  margin-bottom: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.stat-row .stat-label {
  color: #666;
}

.stat-row .stat-value {
  font-weight: 600;
  color: #333;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: all 0.3s ease;
}

/* 상세 분석 버튼 */
.detail-analysis-section {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #fff5d6;
}

.detail-analysis-btn {
  background: linear-gradient(45deg, #ff9800, #ffc107);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.detail-analysis-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.detail-analysis-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 학습 패턴 분석 */
.analysis-text {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.insight-card,
.recommendation-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #fff5d6;
  min-width: 300px;
}

.insight-card {
  border-left: 4px solid #4caf50;
}

.recommendation-card {
  border-left: 4px solid #2196f3;
}

.insight-icon,
.rec-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.insight-content h4,
.rec-content h4 {
  color: #ff9800;
  font-weight: 700;
  margin-bottom: 1rem;
}

.insight-list {
  list-style: none;
  padding: 0;
}

.insight-list li {
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.insight-list li::before {
  content: "▶";
  position: absolute;
  left: 0;
  color: #ff9800;
}

.recommendation {
  color: #555;
  line-height: 1.6;
}

/* 성능 클래스 */
.performance-excellent {
  color: #4caf50;
  font-weight: 600;
}

.performance-good {
  color: #ff9800;
  font-weight: 600;
}

.performance-fair {
  color: #ffc107;
  font-weight: 600;
}

.performance-poor {
  color: #f44336;
  font-weight: 600;
}
</style>
