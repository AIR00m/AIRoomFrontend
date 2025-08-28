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
                  <select v-model="selectedPeriod" class="filter-select" @change="onPeriodChange">
                    <option value="DAILY">📆 일별</option>
                    <option value="MONTHLY">🗓️월별</option>
                    <option value="CUSTOM">📅 사용자 지정</option>
                  </select>

                  <!-- DAILY: 하나의 날짜만 선택 -->
                  <div v-if="selectedPeriod === 'DAILY'" class="date-controls">
                    <input type="date" v-model="dateFrom" class="date-input" @change="loadData" />
                  </div>

                  <!-- MONTHLY: 월 선택 -->
                  <div v-else-if="selectedPeriod === 'MONTHLY'" class="date-controls">
                    <input type="month" v-model="dateFrom" class="date-input" @change="loadData" />
                  </div>

                  <!-- CUSTOM: 날짜 범위 선택 -->
                  <div v-else-if="selectedPeriod === 'CUSTOM'" class="date-controls">
                    <div class="date-range">
                      <input type="date" v-model="dateFrom" class="date-input" @change="loadData" />
                      <span class="date-separator">~</span>
                      <input type="date" v-model="dateTo" class="date-input" @change="loadData" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="summary-stats">
                <div v-for="(stat, index) in summaryStats" :key="index" class="stat-card">
                  <div class="stat-icon">{{ stat.icon }}</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ stat.value }}</div>
                    <div class="stat-unit">{{ stat.unit }}</div>
                    <div class="stat-label">{{ stat.label }}</div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <p class="summary-note">
                  ✨ 꾸준한 학습으로 더 멋진 결과를 만들어가고 있어요!
                </p>
              </div>
            </div>

            <!-- 단원별 성취 현황 -->
            <div v-if="unitSummaryData.length > 0" class="report-card">
              <div class="card-header">
                <h2 class="card-title">📈 단원별 성취 현황</h2>
              </div>

              <div class="chart-container">
                <canvas ref="achievementChartRef"></canvas>
              </div>

              <div class="unit-list">
                <div v-for="unit in unitSummaryData" :key="unit.unitNum" class="unit-item">
                  <div class="unit-header">
                    <span class="unit-number">{{ unit.unitNum }}.</span>
                    <span class="unit-title">{{ unit.unitTitle }}</span>
                  </div>
                  <div class="unit-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{
                        width: (unit.lsAvgAccuracyRate || 0) + '%',
                        backgroundColor: getScoreColor(
                          unit.lsAvgAccuracyRate || 0
                        ),
                      }"></div>
                    </div>
                    <div class="unit-score">
                      <span class="score-value" :style="{
                        color: getScoreColor(unit.lsAvgAccuracyRate || 0),
                      }">
                        {{ Math.round(unit.lsAvgAccuracyRate) || 0 }}점
                      </span>
                    </div>
                    <div class="unit-stats">
                      <span>총 {{ unit.lsTotalProblemsSolved || 0 }}문제</span>
                      <span>정답 {{ unit.lsTotalCorrectProblems || 0 }}문제</span>
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
          value: Math.round(data.lsAvgAccuracyRate) || 0,
          unit: "점",
          label: "평균 점수",
        },
      ];
    });

    // 유틸리티 함수들
    const formatTime = statisticsApi.formatTime;
    const getScoreColor = statisticsApi.getScoreColor;

    // 날짜 초기화
    const initializeDates = () => {
      const today = new Date();

      if (selectedPeriod.value === "DAILY") {
        // 일별: 오늘 날짜
        dateFrom.value = today.toISOString().split('T')[0];
        dateTo.value = dateFrom.value;
      } else if (selectedPeriod.value === "MONTHLY") {
        // 월별: 이번 달 (기본값이므로)
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

    // 기간 변경 시 처리 함수
    const onPeriodChange = () => {
      const today = new Date();

      if (selectedPeriod.value === "DAILY") {
        // 일별: 기존 월 데이터를 일 형태로 변환하거나 오늘로 설정
        if (dateFrom.value && dateFrom.value.match(/^\d{4}-\d{2}$/)) {
          // "2025-08" → "2025-08-01" 변환
          dateFrom.value = dateFrom.value + "-01";
        } else {
          // 유효하지 않으면 오늘 날짜
          dateFrom.value = today.toISOString().split('T')[0];
        }
        dateTo.value = dateFrom.value; // 일별은 같은 날짜

      } else if (selectedPeriod.value === "MONTHLY") {
        // 월별: 기존 일 데이터를 월 형태로 변환하거나 이번 달로 설정
        if (dateFrom.value && dateFrom.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // "2025-08-15" → "2025-08" 변환
          dateFrom.value = dateFrom.value.substring(0, 7);
        } else {
          // 유효하지 않으면 이번 달
          const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
          dateFrom.value = yearMonth;
        }
        dateTo.value = dateFrom.value; // 월별은 같은 월

      } else if (selectedPeriod.value === "CUSTOM") {
        // 사용자 지정: 날짜 범위 설정
        if (dateFrom.value && dateFrom.value.match(/^\d{4}-\d{2}$/)) {
          // 월 형태였으면 해당 월의 1일로 변환
          dateFrom.value = dateFrom.value + "-01";
        } else if (!dateFrom.value || !dateFrom.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // 유효하지 않으면 7일 전으로 설정
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          dateFrom.value = weekAgo.toISOString().split('T')[0];
        }

        // 종료일 설정
        if (!dateTo.value || !dateTo.value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          dateTo.value = today.toISOString().split('T')[0];
        }
      }

      console.log("🔄 학생 리포트 기간 변경:", {
        period: selectedPeriod.value,
        dateFrom: dateFrom.value,
        dateTo: dateTo.value
      });

      // 날짜 변경 후 데이터 로드
      loadData();
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
        // ✅ API용 변수 따로 생성 (selectedPeriod는 절대 건드리지 않음)
        let apiLsType = selectedPeriod.value;
        let apiStartDate = dateFrom.value;
        let apiEndDate = dateTo.value;

        // 날짜 형식 검증 및 수정
        if (selectedPeriod.value === "DAILY") {
          apiLsType = "DAILY";

          // 날짜 형식 검증 (YYYY-MM-DD)
          if (!apiStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(apiStartDate)) {
            const today = new Date().toISOString().split('T')[0];
            apiStartDate = today;
            dateFrom.value = today;
          }
          apiEndDate = apiStartDate; // 일별은 시작일 = 종료일

        } else if (selectedPeriod.value === "MONTHLY") {
          apiLsType = "MONTHLY";

          // 월 형식 검증 (YYYY-MM)
          if (!apiStartDate || !/^\d{4}-\d{2}$/.test(apiStartDate)) {
            const today = new Date();
            apiStartDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            dateFrom.value = apiStartDate;
          }

          const [year, month] = apiStartDate.split("-");
          apiStartDate = `${year}-${month}-01`;
          const nextMonth = new Date(Number(year), Number(month), 1);
          const nextYear = nextMonth.getFullYear();
          const nextM = String(nextMonth.getMonth() + 1).padStart(2, "0");
          apiEndDate = `${nextYear}-${nextM}-01`;

        } else if (selectedPeriod.value === "CUSTOM") {
          apiLsType = "DAILY"; // 백엔드로는 DAILY로 전송

          // 시작일 검증
          if (!apiStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(apiStartDate)) {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            apiStartDate = weekAgo.toISOString().split('T')[0];
            dateFrom.value = apiStartDate;
          }

          // 종료일 검증
          if (!apiEndDate || !/^\d{4}-\d{2}-\d{2}$/.test(apiEndDate)) {
            apiEndDate = new Date().toISOString().split('T')[0];
            dateTo.value = apiEndDate;
          }
        }

        const response = await statisticsApi.getStudentLearningSummary({
          classroomStudentNo: classroomStudentNo.value,
          lsType: apiLsType,        // ✅ API용 변수 사용
          lsStartDate: apiStartDate,
          lsEndDate: apiEndDate,
        });
        learningSummaryData.value = response;
      } catch (err) {
        throw new Error("학습 요약 데이터를 불러오는데 실패했습니다.");
      }
    };

    // 단원별 성취 현황 로드
    const loadUnitSummary = async () => {
      try {
        // ✅ API용 변수 따로 생성 (selectedPeriod는 절대 건드리지 않음)
        let apiLsType = selectedPeriod.value;
        let apiStartDate = dateFrom.value;
        let apiEndDate = dateTo.value;

        // 날짜 형식 검증 및 수정
        if (selectedPeriod.value === "DAILY") {
          apiLsType = "DAILY";

          // 날짜 형식 검증 (YYYY-MM-DD)
          if (!apiStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(apiStartDate)) {
            const today = new Date().toISOString().split('T')[0];
            apiStartDate = today;
            dateFrom.value = today;
          }
          apiEndDate = apiStartDate; // 일별은 시작일 = 종료일

        } else if (selectedPeriod.value === "MONTHLY") {
          apiLsType = "MONTHLY";

          // 월 형식 검증 (YYYY-MM)
          if (!apiStartDate || !/^\d{4}-\d{2}$/.test(apiStartDate)) {
            const today = new Date();
            apiStartDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            dateFrom.value = apiStartDate;
          }

          const [year, month] = apiStartDate.split("-");
          apiStartDate = `${year}-${month}-01`;
          const nextMonth = new Date(Number(year), Number(month), 1);
          const nextYear = nextMonth.getFullYear();
          const nextM = String(nextMonth.getMonth() + 1).padStart(2, "0");
          apiEndDate = `${nextYear}-${nextM}-01`;

        } else if (selectedPeriod.value === "CUSTOM") {
          apiLsType = "DAILY"; // 백엔드로는 DAILY로 전송

          // 시작일 검증
          if (!apiStartDate || !/^\d{4}-\d{2}-\d{2}$/.test(apiStartDate)) {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            apiStartDate = weekAgo.toISOString().split('T')[0];
            dateFrom.value = apiStartDate;
          }

          // 종료일 검증
          if (!apiEndDate || !/^\d{4}-\d{2}-\d{2}$/.test(apiEndDate)) {
            apiEndDate = new Date().toISOString().split('T')[0];
            dateTo.value = apiEndDate;
          }
        }

        const response = await statisticsApi.getStudentUnitSummary({
          classroomStudentNo: classroomStudentNo.value,
          lsType: apiLsType,        // ✅ API용 변수 사용
          lsStartDate: apiStartDate,
          lsEndDate: apiEndDate,
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
              responsive: true,
              maintainAspectRatio: false,
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
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: function (value) {
                      return Math.round(value) + '점';
                    },
                  },
                },
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 0,
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
        error.value = "학생 정보를 찾을 수 없습니다. 다시 로그인해주세요.";
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

    // PDF 저장
    const savePDF = () => {
      alert("PDF 저장 기능은 준비 중입니다! 📄");
    };

    // 클래스룸으로 이동
    const goToClassroom = () => {
      router.push("/classroom");
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

      // 유틸리티
      formatTime,
      getScoreColor,

      // 메서드
      onPeriodChange, // ✅ 추가된 함수
      loadData,
      savePDF,
      goToClassroom,
    };
  },
};
</script>

<style scoped>
/* 전역 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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

/* 페이지 헤더 */
.page-header {
  background: linear-gradient(135deg,
      rgba(255, 152, 0, 0.15),
      rgba(255, 221, 41, 0.15));
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  border: 2px solid #fff5d6;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ff9800;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #ff9800;
  margin-bottom: 1rem;
  font-weight: 500;
}

.cute-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #ff9800;
  background: rgba(255, 255, 255, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #fff5d6;
}

.separator {
  color: #ffdd29;
  font-weight: 600;
}

.current {
  font-weight: 600;
  color: #ffdd29;
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

/* 안내 상자 */
.notice-box {
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  border: 2px solid #c5e1a5;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.notice-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
  vertical-align: middle;
}

.notice-list {
  list-style: none;
  margin: 0;
  padding-left: 2rem;
}

.notice-list li {
  margin-bottom: 0.5rem;
  color: #2e7d32;
  font-weight: 500;
  position: relative;
}

.notice-list li:before {
  content: "✨";
  position: absolute;
  left: -1.5rem;
}

/* 액션 헤더 */
.action-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-primary {
  background: #ff9800;
  color: white;
}

.btn-primary:hover {
  background: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.btn-secondary {
  background: white;
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

.date-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
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

/* 날짜 범위 선택 스타일 */
.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-separator {
  color: #ffdd29;
  font-weight: 600;
  padding: 0 0.25rem;
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
  color: #ff9800;
  font-weight: 600;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  margin-top: 0.5rem;
}

/* 차트 컨테이너 */
.chart-container {
  position: relative;
  height: 350px;
  margin-bottom: 2rem;
  background: #fffbf0;
  border-radius: 16px;
  padding: 1rem;
  border: 2px solid #fff5d6;
}

/* 단원 목록 */
.unit-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.unit-item {
  background: #fffbf0;
  border: 2px solid #fff5d6;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.unit-item:hover {
  border-color: #ffdd29;
  transform: translateY(-1px);
}

.unit-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.unit-number {
  background: #ffdd29;
  color: #ff9800;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
}

.unit-title {
  font-weight: 600;
  color: #ff9800;
}

.unit-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #fff5d6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
}

.unit-score {
  text-align: right;
}

.score-value {
  font-weight: 700;
  font-size: 1.1rem;
}

.unit-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #666;
}

.summary-note {
  color: #ff9800;
  font-weight: 500;
  font-style: italic;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .report-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .summary-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .date-range {
    flex-direction: column;
    gap: 0.5rem;
  }

  .date-separator {
    text-align: center;
  }

  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .unit-stats {
    flex-direction: column;
    gap: 0.25rem;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .action-header {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }

  .page-header {
    padding: 1.5rem;
  }

  .report-card {
    padding: 1.5rem;
  }
}
</style>