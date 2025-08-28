<template>
  <!-- 헤더 -->
  <header class="header">
    <Header></Header>
  </header>
  <div class="report-page">
    <div class="report-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="page-text">
          <h1 class="page-title">📊 나의 학습 여행 일기 ✨</h1>
          <p class="page-subtitle">
            우리가 함께한 소중한 학습 시간들을 되돌아보아요!
          </p>
          <nav class="cute-breadcrumb">
            <span>🏠 홈</span>
            <span class="separator">></span>
            <span class="current">📊 학습 리포트</span>
          </nav>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>학습 데이터를 불러오는 중...</p>
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
            <li>학습 데이터를 기반으로 한 맞춤형 분석 결과를 확인해보세요.</li>
            <li>선생님의 학습 조언으로 더 효과적인 공부를 해요! 💪</li>
            <li>PDF로 저장해서 언제든지 학습 기록을 돌아볼 수 있어요.</li>
          </ul>
        </div>

        <!-- 탭 컨텐츠 -->
        <div class="report-content">
          <!-- 종합 분석 탭 -->
          <div class="tab-panel">
            <!-- PDF 저장 버튼 -->
            <div class="action-header">
              <button class="action-btn btn-primary" @click="savePDF">
                📄 PDF로 저장하기
              </button>
            </div>

            <!-- 학습 요약 -->
            <div class="report-card">
              <div class="card-header">
                <h2 class="card-title">🎓 나의 학습 요약</h2>
                <div class="summary-controls">
                  <select
                    v-model="selectedPeriod"
                    class="filter-select"
                    @change="loadData"
                  >
                    <option value="DAILY">📆 일별</option>
                    <option value="MONTHLY">🗓️ 월별</option>
                    <option value="DAILY">📅 사용자 지정</option>
                  </select>
                  <input
                    type="date"
                    v-model="dateFrom"
                    class="date-input"
                    @change="loadData"
                  />
                  <span class="date-separator">~</span>
                  <input
                    type="date"
                    v-model="dateTo"
                    class="date-input"
                    @change="loadData"
                  />
                </div>
              </div>

              <div class="summary-stats">
                <div
                  v-for="(stat, index) in summaryStats"
                  :key="index"
                  class="stat-card"
                >
                  <div class="stat-icon">{{ stat.icon }}</div>
                  <div class="stat-value">
                    {{ stat.value
                    }}<span class="stat-unit">{{ stat.unit }}</span>
                  </div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>

            <!-- 단원별 성취 현황 -->
            <div class="report-card">
              <div class="card-header">
                <h2 class="card-title">📈 단원별 성취 현황</h2>
              </div>

              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-color good"></div>
                  <span>🌟 잘하고 있는 단원</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color weak"></div>
                  <span>💪 보완이 필요한 단원</span>
                </div>
              </div>

              <div class="chart-container">
                <canvas ref="achievementChartRef"></canvas>
              </div>

              <!-- 단원별 상세 정보 -->
              <div v-if="unitSummaryData.length > 0" class="unit-details">
                <h3 class="section-title">📚 단원별 세부 성취 현황</h3>
                <div class="unit-list">
                  <div
                    v-for="unit in unitSummaryData"
                    :key="unit.unitNum"
                    class="unit-item"
                  >
                    <div class="unit-header">
                      <span class="unit-number">{{ unit.unitNum }}단원</span>
                      <span class="unit-title">{{ unit.unitTitle }}</span>
                      <span
                        class="unit-score"
                        :style="{
                          color: getScoreColor(unit.lsAvgAccuracyRate),
                        }"
                      >
                        {{ unit.lsAvgAccuracyRate || 0 }}%
                      </span>
                    </div>
                    <div class="unit-stats">
                      <span>총 {{ unit.lsTotalProblemsSolved || 0 }}문제</span>
                      <span
                        >정답 {{ unit.lsTotalCorrectProblems || 0 }}문제</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button class="action-btn btn-secondary" @click="goToClassroom">
                  🔍 자세히 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- footer -->
  <footer class="footer">
    <Footer></Footer>
  </footer>
</template>

<script>
import { ref, onMounted, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";
import Footer from "@/components/common/Footer.vue";
import * as statisticsApi from "@/utils/statisticsApi";

export default {
  name: "Report",
  components: { Header, Footer },
  setup() {
    const router = useRouter();
    // 반응형 데이터
    const loading = ref(false);
    const error = ref(null);
    const selectedPeriod = ref("MONTHLY");
    const dateFrom = ref("");
    const dateTo = ref("");
    const achievementChartRef = ref(null);

    // API 응답 데이터
    const learningSummaryData = ref({});
    const unitSummaryData = ref([]);

    // 사용자 정보
    const classroomStudentNo = ref(null);

    // 계산된 속성 - 요약 통계
    const summaryStats = computed(() => {
      const data = learningSummaryData.value;
      return [
        {
          icon: "📅",
          value: data.lsTotalLearningDays || 0,
          unit: "일",
          label: "총 학습일",
        },
        {
          icon: "⏰",
          value: formatTime(data.lsTotalLearningTime || 0),
          unit: "",
          label: "총 학습시간",
        },
        {
          icon: "📝",
          value: data.lsTotalProblemsSolved || 0,
          unit: "문제",
          label: "풀어본 문제",
        },
        {
          icon: "✅",
          value: data.lsTotalCorrectProblems || 0,
          unit: "문제",
          label: "맞힌 문제",
        },
        {
          icon: "🎯",
          value: data.lsAvgAccuracyRate || 0,
          unit: "%",
          label: "평균 정답률",
        },
      ];
    });

    // 유틸리티 함수들
    const formatTime = statisticsApi.formatTime;
    const getScoreColor = statisticsApi.getScoreColor;

    // 날짜 초기화
    const initializeDates = () => {
      const { startDate, endDate } = statisticsApi.getDefaultDateRange();
      dateFrom.value = startDate;
      dateTo.value = endDate;
    };

    // 사용자 정보 로드
    const loadUserInfo = () => {
      try {
        const userInfo = statisticsApi.extractUserInfo();
        console.log(userInfo);
        classroomStudentNo.value = userInfo.classroomStudentNo;
      } catch (err) {
        error.value = err.message;
      }
    };

    // 학습 요약 데이터 로드
    const loadLearningSummary = async () => {
      try {
        const response = await statisticsApi.getStudentLearningSummary({
          classroomStudentNo: classroomStudentNo.value,
          lsType: selectedPeriod.value,
          lsStartDate: dateFrom.value,
          lsEndDate: dateTo.value,
        });
        learningSummaryData.value = response;
      } catch (err) {
        throw new Error("학습 요약 데이터를 불러오는데 실패했습니다.");
      }
    };

    // 단원별 성취 현황 로드
    const loadUnitSummary = async () => {
      try {
        const response = await statisticsApi.getStudentUnitSummary({
          classroomStudentNo: classroomStudentNo.value,
          lsType: selectedPeriod.value,
          lsStartDate: dateFrom.value,
          lsEndDate: dateTo.value,
        });
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
          if (window.studentReportChart) {
            window.studentReportChart.destroy();
          }

          window.studentReportChart = new Chart(ctx, {
            type: "bar",
            data: {
              labels: unitSummaryData.value.map(
                (unit) => `${unit.unitNum}. ${unit.unitTitle}`
              ),
              datasets: [
                {
                  label: "정답률 (%)",
                  data: unitSummaryData.value.map(
                    (unit) => unit.lsAvgAccuracyRate || 0
                  ),
                  backgroundColor: unitSummaryData.value.map((unit) =>
                    (unit.lsAvgAccuracyRate || 0) >= 70 ? "#4CAF50" : "#FF9800"
                  ),
                  borderColor: unitSummaryData.value.map((unit) =>
                    (unit.lsAvgAccuracyRate || 0) >= 70 ? "#388E3C" : "#F57C00"
                  ),
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
                        `정답률: ${context.parsed.y}%`,
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
      if (!classroomStudentNo.value) {
        error.value = "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.";
        return;
      }

      loading.value = true;
      error.value = null;

      try {
        await Promise.all([loadLearningSummary(), loadUnitSummary()]);

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

    // 기타 메서드들
    const savePDF = () => {
      alert("PDF 저장 기능은 개발 중입니다.");
    };

    const goToClassroom = () => {
      router.push({ name: "Classroom" });
    };

    // 생명주기 훅
    onMounted(async () => {
      initializeDates();
      loadUserInfo();
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

      // 차트 참조
      achievementChartRef,

      // 메서드
      loadData,
      savePDF,
      goToClassroom,
      getScoreColor,
    };
  },
};
</script>

<style scoped>
/* 기존 스타일 + 새로운 스타일 추가 */

/* 전역 폰트 및 배경 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}

.report-page {
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.report-container {
  max-width: 1200px;
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
  background: linear-gradient(
    135deg,
    rgba(255, 152, 0, 0.15),
    rgba(255, 193, 7, 0.25)
  );
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

/* 액션 헤더 */
.action-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.action-btn {
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(45deg, #ff9800, #ffc107);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
}

.btn-secondary {
  background: #fff;
  color: #ff9800;
  border: 2px solid #ff9800;
}

.btn-secondary:hover {
  background: #ff9800;
  color: white;
}

/* 리포트 카드 */
.report-card {
  background: white;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0;
}

.card-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #fff5d6;
}

/* 요약 컨트롤 */
.summary-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select,
.date-input {
  padding: 0.75rem 1rem;
  border: 2px solid #ffe066;
  border-radius: 15px;
  background: white;
  color: #ff9800;
  font-weight: 600;
  transition: all 0.3s ease;
}

.filter-select:focus,
.date-input:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.2);
}

.date-separator {
  color: #ffdd29;
  font-weight: 600;
}

/* 요약 통계 */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #fffbf0;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 2px solid #fff5d6;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.15);
  border-color: #ffdd29;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffdd29;
  margin-bottom: 0.5rem;
}

.stat-unit {
  font-size: 0.9rem;
  font-weight: 500;
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

.legend-color.good {
  background: #4caf50;
}
.legend-color.weak {
  background: #ff9800;
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

/* 단원별 상세 정보 */
.unit-details {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #fff5d6;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 1rem;
}

.unit-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.unit-item {
  background: #fffbf0;
  border: 1px solid #fff5d6;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.unit-item:hover {
  border-color: #ffdd29;
  box-shadow: 0 2px 8px rgba(255, 221, 41, 0.1);
}

.unit-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.unit-number {
  background: #ff9800;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
}

.unit-title {
  font-weight: 600;
  color: #333;
  flex: 1;
}

.unit-score {
  font-weight: 700;
  font-size: 1.1rem;
}

.unit-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  flex-wrap: wrap;
}

.unit-stats span {
  background: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  border: 1px solid #eee;
}
</style>
