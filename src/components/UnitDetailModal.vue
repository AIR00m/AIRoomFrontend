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
              <select v-model="selectedPeriod" class="filter-select" @change="onPeriodChange">
                <option value="DAILY">📆 일별</option>
                <option value="MONTHLY">📅 월별</option>
                <option value="CUSTOM">⚙️ 사용자 지정</option>
              </select>
            </div>

            <!-- DAILY: 하나의 날짜만 선택 -->
            <div v-if="selectedPeriod === 'DAILY'" class="filter-group">
              <label>날짜 선택</label>
              <input type="date" v-model="dateFrom" class="date-input" @change="loadDetailData" />
            </div>

            <!-- MONTHLY: 월 선택 -->
            <div v-else-if="selectedPeriod === 'MONTHLY'" class="filter-group">
              <label>월 선택</label>
              <input type="month" v-model="dateFrom" class="date-input" @change="loadDetailData" />
            </div>

            <!-- CUSTOM: 날짜 범위 선택 -->
            <div v-else-if="selectedPeriod === 'CUSTOM'" class="filter-group">
              <label>기간 설정</label>
              <div class="date-range">
                <input type="date" v-model="dateFrom" class="date-input" @change="loadDetailData" />
                <span class="date-separator">~</span>
                <input type="date" v-model="dateTo" class="date-input" @change="loadDetailData" />
              </div>
            </div>
          </div>
        </div>

        <!-- 단원별 학생 성취 현황 -->
        <div v-if="detailData.length > 0" class="detail-content">
          <div class="section-title">👥 학생별 단원 성취 현황</div>

          <!-- 단원 탭 -->
          <div class="unit-tabs">
            <button v-for="unit in uniqueUnits" :key="unit.unitNum"
              :class="['unit-tab', { active: selectedUnit === unit.unitNum }]" @click="selectedUnit = unit.unitNum">
              {{ unit.unitNum }}. {{ unit.unitTitle }}
            </button>
          </div>

          <!-- 선택된 단원 상세 정보 -->
          <div v-if="selectedUnit" class="unit-detail">
            <!-- 단원 요약 -->
            <div class="unit-summary">
              <div class="summary-card">
                <div class="summary-icon">📊</div>
                <div class="summary-info">
                  <div class="summary-value">{{ currentUnitAverage }}점</div>
                  <div class="summary-label">단원 평균점수</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">📝</div>
                <div class="summary-info">
                  <div class="summary-value">{{ currentUnitTotalProblems }}</div>
                  <div class="summary-label">총 문제 수</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">✅</div>
                <div class="summary-info">
                  <div class="summary-value">{{ currentUnitCorrectProblems }}</div>
                  <div class="summary-label">정답 수</div>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">👥</div>
                <div class="summary-info">
                  <div class="summary-value">{{ currentUnitData.length }}</div>
                  <div class="summary-label">참여 학생</div>
                </div>
              </div>
            </div>

            <!-- 차트 섹션 -->
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
                      학생 이름
                      <span v-if="sortConfig.key === 'usClassroomStudentName'" class="sort-indicator">
                        {{ sortConfig.direction === "asc" ? "▲" : "▼" }}
                      </span>
                    </th>
                    <th @click="sortStudents('usTotalProblemsSolved')">
                      풀어본 문제
                      <span v-if="sortConfig.key === 'usTotalProblemsSolved'" class="sort-indicator">
                        {{ sortConfig.direction === "asc" ? "▲" : "▼" }}
                      </span>
                    </th>
                    <th @click="sortStudents('usTotalCorrectProblems')">
                      맞힌 문제
                      <span v-if="sortConfig.key === 'usTotalCorrectProblems'" class="sort-indicator">
                        {{ sortConfig.direction === "asc" ? "▲" : "▼" }}
                      </span>
                    </th>
                    <th @click="sortStudents('usAvgAccuracyRate')">
                      평균 점수
                      <span v-if="sortConfig.key === 'usAvgAccuracyRate'" class="sort-indicator">
                        {{ sortConfig.direction === "asc" ? "▲" : "▼" }}
                      </span>
                    </th>
                    <th>성과</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in sortedCurrentUnitData" :key="student.usClassroomStudentNo"
                    :class="getStudentRowClass(student.usAvgAccuracyRate)">
                    <td class="student-name">
                      {{ student.usClassroomStudentName }}
                    </td>
                    <td>{{ student.usTotalProblemsSolved || 0 }}</td>
                    <td>{{ student.usTotalCorrectProblems || 0 }}</td>
                    <td>
                      <span class="accuracy-rate" :style="{
                        color: getScoreColor(student.usAvgAccuracyRate || 0),
                      }">
                        {{ Math.round(student.usAvgAccuracyRate) || 0 }}점
                      </span>
                    </td>
                    <td>
                      <span :class="getPerformanceClass(Math.round(student.usAvgAccuracyRate) || 0)
                        " class="performance-badge">
                        {{ getPerformanceIcon(Math.round(student.usAvgAccuracyRate) || 0) }}
                        {{ getPerformanceText(Math.round(student.usAvgAccuracyRate) || 0) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 분석 및 제안 -->
            <div class="analysis-suggestions">
              <div class="analysis-card">
                <div class="analysis-header">
                  <div class="analysis-icon">🌟</div>
                  <div class="analysis-title">우수한 학생들</div>
                  <div class="student-count">{{ highPerformers.length }}명</div>
                </div>
                <div class="analysis-content">
                  <ul class="analysis-list">
                    <li v-for="student in highPerformers.slice(0, 3)" :key="student.usClassroomStudentNo">
                      <strong>{{ student.usClassroomStudentName }}</strong> -
                      {{ student.usAvgAccuracyRate }}%
                    </li>
                    <li v-if="highPerformers.length > 3">
                      그 외 {{ highPerformers.length - 3 }}명...
                    </li>
                  </ul>
                  <div class="recommendations">
                    <div v-if="highPerformers.length > 0" class="recommendation">
                      <strong>심화 학습 권장:</strong> 이 학생들에게는 더 어려운
                      문제나 심화 학습 자료를 제공해보세요.
                    </div>
                  </div>
                </div>
              </div>

              <div class="analysis-card">
                <div class="analysis-header">
                  <div class="analysis-icon">💪</div>
                  <div class="analysis-title">도움이 필요한 학생들</div>
                  <div class="student-count">{{ lowPerformers.length }}명</div>
                </div>
                <div class="analysis-content">
                  <ul class="analysis-list">
                    <li v-for="student in lowPerformers.slice(0, 3)" :key="student.usClassroomStudentNo">
                      <strong>{{ student.usClassroomStudentName }}</strong> -
                      {{ Math.round(student.usAvgAccuracyRate) }}점
                    </li>
                    <li v-if="lowPerformers.length > 3">
                      그 외 {{ lowPerformers.length - 3 }}명...
                    </li>
                  </ul>
                  <div class="recommendations">
                    <div v-if="lowPerformers.length > 0" class="recommendation">
                      <strong>개별 지도 권장:</strong> 이 학생들에게는 기초
                      개념 복습과 추가적인 개별 지도가 필요합니다.
                    </div>
                    <div v-if="currentUnitAverage < 70" class="recommendation">
                      <strong>단원 재학습 권장:</strong> 반 평균이
                      {{ currentUnitAverage }}점으로 낮습니다. 단원 전체에 대한
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
        <button class="btn-secondary" @click="exportData" :disabled="!detailData.length">
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
      const sum = currentUnitData.value.reduce(
        (acc, student) => acc + (student.usAvgAccuracyRate || 0),
        0
      );
      return Math.round(sum / currentUnitData.value.length);
    });

    const currentUnitTotalProblems = computed(() => {
      return currentUnitData.value.reduce(
        (acc, student) => acc + (student.usTotalProblemsSolved || 0),
        0
      );
    });

    const currentUnitCorrectProblems = computed(() => {
      return currentUnitData.value.reduce(
        (acc, student) => acc + (student.usTotalCorrectProblems || 0),
        0
      );
    });

    // 차트 초기화
    const initChart = async () => {
      await nextTick();
      if (detailChartRef.value && currentUnitData.value.length > 0) {
        try {
          const { Chart, registerables } = await import("chart.js");
          Chart.register(...registerables);

          const ctx = detailChartRef.value.getContext("2d");

          // 기존 차트 제거
          if (window.currentChart) {
            window.currentChart.destroy();
          }

          window.currentChart = new Chart(ctx, {
            type: "bar",
            data: {
              labels: currentUnitData.value.map(
                (student) => student.usClassroomStudentName
              ),
              datasets: [
                {
                  label: "점수 (점)",
                  data: currentUnitData.value.map(
                    (student) => student.usAvgAccuracyRate || 0
                  ),
                  backgroundColor: currentUnitData.value.map((student) => {
                    const rate = student.usAvgAccuracyRate || 0;
                    return getScoreColor(rate);
                  }),
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
                      const student = currentUnitData.value[context.dataIndex];
                      return [
                        `점수: ${Math.round(context.parsed.y)}점`,
                        `풀어본 문제: ${student.usTotalProblemsSolved || 0}개`,
                        `맞힌 문제: ${student.usTotalCorrectProblems || 0}개`,
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
              },
            },
          });
        } catch (err) {
          console.error("차트 초기화 실패:", err);
        }
      }
    };

    // 정렬 기능
    const sortStudents = (key) => {
      if (sortConfig.value.key === key) {
        sortConfig.value.direction =
          sortConfig.value.direction === "asc" ? "desc" : "asc";
      } else {
        sortConfig.value.key = key;
        sortConfig.value.direction = "asc";
      }
    };

    const sortedCurrentUnitData = computed(() => {
      if (!sortConfig.value.key) return currentUnitData.value;

      return [...currentUnitData.value].sort((a, b) => {
        const aVal = a[sortConfig.value.key];
        const bVal = b[sortConfig.value.key];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.value.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

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

    // 기간 변경 시 처리 함수 - 완전 수정 버전
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

      console.log("🔄 기간 변경:", {
        period: selectedPeriod.value,
        dateFrom: dateFrom.value,
        dateTo: dateTo.value
      });

      // 날짜 변경 후 데이터 로드
      loadDetailData();
    };

    // 데이터 로드 - 더 안전한 버전
    const loadDetailData = async () => {
      if (!props.classroomNo) return;

      loading.value = true;
      error.value = null;

      try {
        // ✅ API용 변수 따로 생성
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

        console.log("🔍 UnitDetailModal API 요청:", {
          classroomNo: props.classroomNo,
          lsType: apiLsType,
          lsStartDate: apiStartDate,
          lsEndDate: apiEndDate,
          originalPeriod: selectedPeriod.value
        });

        const response = await statisticsApi.getClassroomUnitSummaryDetail({
          classroomNo: props.classroomNo,
          lsType: apiLsType,
          lsStartDate: apiStartDate,
          lsEndDate: apiEndDate,
        });

        console.log("✅ UnitDetailModal API 응답:", response);

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
        console.error("🚨 UnitDetailModal 데이터 로드 실패:", err);
        error.value = err.message || "데이터를 불러오는데 실패했습니다.";
      } finally {
        loading.value = false;
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
      onPeriodChange,
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

/* 날짜 범위 선택 스타일 */
.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-separator {
  font-weight: 600;
  color: #ff9800;
  padding: 0 0.5rem;
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

.student-name {
  font-weight: 600;
}

.accuracy-rate {
  font-weight: 700;
}

.performance-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.performance-badge.excellent {
  background: #e8f5e8;
  color: #2e7d32;
}

.performance-badge.good {
  background: #fff3e0;
  color: #f57c00;
}

.performance-badge.fair {
  background: #fff8e1;
  color: #f9a825;
}

.performance-badge.poor {
  background: #ffebee;
  color: #c62828;
}

.action-btn {
  background: #ff9800;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: #f57c00;
}

/* 분석 및 제안 */
.analysis-suggestions {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
}

.analysis-card {
  flex: 1;
  background: white;
  border: 2px solid #fff5d6;
  border-radius: 12px;
  overflow: hidden;
}

.analysis-header {
  background: #fffbf0;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #fff5d6;
}

.analysis-icon {
  font-size: 1.5rem;
}

.analysis-title {
  flex: 1;
  font-weight: 700;
  color: #ff9800;
}

.student-count {
  background: #ff9800;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.analysis-content {
  padding: 1rem;
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

  .date-range {
    flex-direction: column;
    gap: 0.5rem;
  }

  .date-separator {
    text-align: center;
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