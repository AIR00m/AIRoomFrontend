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

      <!-- 안내 상자 -->
      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <ul class="notice-list">
          <li>
            월별/주별/일별로 분석한 우리 반 학생들의 학습 현황을 확인할 수
            있어요.
          </li>
          <li>AI 분석을 통해 학생들의 강점과 보완점을 파악해보세요! 💪</li>
          <li>개별 학생 맞춤 지도를 위한 상세한 데이터를 제공합니다.</li>
        </ul>
      </div>

      <!-- 기간 선택 및 필터 -->
      <div class="filter-section">
        <div class="filter-controls">
          <select v-model="selectedFilter" class="filter-select">
            <option value="all">👥 전체</option>
            <option value="group1">📗 1모둠</option>
            <option value="group2">📘 2모둠</option>
            <option value="group3">📕 3모둠</option>
          </select>
          <select v-model="selectedPeriod" class="filter-select">
            <option value="weekly">📅 주별</option>
            <option value="daily">📆 일별</option>
            <option value="monthly">🗓️ 월별</option>
          </select>
          <input type="date" v-model="dateFrom" class="date-input" />
          <span class="date-separator">~</span>
          <input type="date" v-model="dateTo" class="date-input" />
        </div>
      </div>

      <!-- 탭 -->
      <div class="analysis-tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          class="tab-button"
          :class="{ active: currentTab === index }"
          @click="switchTab(index)"
        >
          {{ tab.emoji }} {{ tab.label }}
        </button>
      </div>

      <!-- 탭 컨텐츠 -->
      <div class="analysis-content">
        <!-- 학습 요약 탭 -->
        <div v-if="currentTab === 0" class="tab-panel">
          <!-- 학습 요약 통계 -->
          <div class="analysis-card">
            <div class="card-header">
              <h2 class="card-title">🎓 우리 반 학습 요약</h2>
            </div>

            <div class="summary-stats">
              <div
                v-for="(stat, index) in summaryStats"
                :key="index"
                class="stat-card"
              >
                <div class="stat-icon">{{ stat.icon }}</div>
                <div class="stat-content">
                  <div class="stat-value">
                    {{ stat.value
                    }}<span class="stat-unit">{{ stat.unit }}</span>
                  </div>
                  <div class="stat-label">{{ stat.label }}</div>
                  <div class="stat-range">
                    <span>최소: {{ stat.min }}</span>
                    <span>최대: {{ stat.max }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 단원별 성취 현황 -->
          <div class="analysis-card">
            <div class="card-header">
              <h2 class="card-title">📈 단원별 성취 현황</h2>
              <div class="tooltip-info">
                <span class="tooltip-icon">💡</span>
                <div class="tooltip-text">
                  형성 평가, AI 맞춤 진단, 단원 평가 결과를 바탕으로 분석한 우리
                  반/학교 평균 성취 현황을 확인할 수 있습니다.
                </div>
              </div>
            </div>

            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color our-class"></div>
                <span>🌟 우리 반 평균</span>
              </div>
              <div class="legend-item">
                <div class="legend-color school-avg"></div>
                <span>🏫 전체 평균</span>
              </div>
            </div>

            <div class="chart-container">
              <canvas ref="achievementChartRef"></canvas>
            </div>
          </div>

          <!-- 내용 영역별 성취 현황 -->
          <div class="analysis-card">
            <div class="card-header">
              <h2 class="card-title">🎯 내용 영역별 성취 현황</h2>
            </div>

            <div class="content-area-chart">
              <div class="chart-container">
                <canvas ref="contentAreaChartRef"></canvas>
              </div>
              <div class="content-analysis">
                <h4>📊 영역별 분석 결과</h4>
                <p class="analysis-text">
                  <span class="highlight">수와 연산 <strong>60%</strong></span
                  >,
                  <span class="highlight">변화와 관계 <strong>0%</strong></span
                  >,
                  <span class="highlight">도형과 측정 <strong>0%</strong></span
                  >,
                  <span class="highlight"
                    >자료와 가능성 <strong>0%</strong></span
                  >로 나타났습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 상세 분석 탭 -->
        <div v-if="currentTab === 1" class="tab-panel">
          <!-- 단원별 상세 현황 -->
          <div class="analysis-card">
            <div class="card-header">
              <h2 class="card-title">📚 단원별 상세 현황</h2>
            </div>

            <div class="unit-details">
              <div
                v-for="(unit, index) in unitDetails"
                :key="index"
                class="unit-accordion"
                :class="{ active: activeAccordion === index }"
              >
                <div class="accordion-header" @click="toggleAccordion(index)">
                  <div class="unit-info">
                    <h4 class="unit-title">{{ unit.title }}</h4>
                    <div class="unit-score">
                      <span class="score-label">평균 정답률</span>
                      <span class="score-value">{{ unit.average }}%</span>
                    </div>
                  </div>
                  <div class="accordion-icon">
                    {{ activeAccordion === index ? "▲" : "▼" }}
                  </div>
                </div>
                <div v-if="activeAccordion === index" class="accordion-content">
                  <div class="unit-chart">
                    <canvas :ref="`unitChart${index}`"></canvas>
                  </div>
                  <div class="unit-insights">
                    <h5>🤖 AI 분석</h5>
                    <p>{{ unit.aiInsight }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 오답 BEST 20 -->
          <div class="analysis-card">
            <div class="card-header">
              <h2 class="card-title">❌ 오답 BEST 20</h2>
              <div class="card-controls">
                <select v-model="selectedUnit" class="filter-select">
                  <option value="unit1">1. 곱셈</option>
                  <option value="unit2">2. 나눗셈</option>
                  <option value="unit3">3. 원</option>
                </select>
                <button
                  class="action-btn btn-secondary"
                  @click="generateWrongAnswerTest"
                >
                  📝 오답 시험지 출제
                </button>
              </div>
            </div>

            <div class="wrong-answers-table">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>단원</th>
                    <th>토픽</th>
                    <th>난이도</th>
                    <th>오답자 수</th>
                    <th>문항 보기</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in wrongAnswers" :key="index">
                    <td>{{ item.unit }}</td>
                    <td>{{ item.topic }}</td>
                    <td>
                      <span class="difficulty-tag" :class="item.difficulty">
                        {{ item.difficultyText }}
                      </span>
                    </td>
                    <td>
                      <button
                        class="wrong-count-btn"
                        @click="showWrongStudents(item)"
                      >
                        <strong>{{ item.wrongCount }}</strong
                        >/{{ item.totalCount }}
                      </button>
                    </td>
                    <td>
                      <button
                        class="view-question-btn"
                        @click="viewQuestion(item)"
                      >
                        📄
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 학습 패턴 탭 -->
        <div v-if="currentTab === 2" class="tab-panel">
          <!-- 학습 분포도 -->
          <div class="analysis-card">
            <div class="card-header">
              <h2 class="card-title">📊 우리 반 학습 분포도</h2>
            </div>

            <div class="distribution-chart">
              <div class="chart-container large">
                <canvas ref="distributionChartRef"></canvas>
              </div>
              <div class="distribution-legend">
                <div class="legend-quadrant best">
                  <span class="quadrant-icon">🌟</span>
                  <span>학습 시간이 길고 정답률이 높아요</span>
                </div>
                <div class="legend-quadrant efficient">
                  <span class="quadrant-icon">⚡</span>
                  <span>학습 시간이 짧고 정답률이 높아요</span>
                </div>
                <div class="legend-quadrant effort">
                  <span class="quadrant-icon">💪</span>
                  <span>학습 시간이 길고 정답률이 낮아요</span>
                </div>
                <div class="legend-quadrant need-help">
                  <span class="quadrant-icon">🆘</span>
                  <span>학습 시간이 짧고 정답률이 낮아요</span>
                </div>
              </div>
            </div>

            <div class="ai-comment">
              <div class="ai-avatar">🤖</div>
              <div class="ai-message">
                <h4>✨ AI 보조교사 코멘트</h4>
                <p>
                  우리 반 학생들은 대부분 효율적으로 공부하고 있어요!<br />
                  짧은 시간 내에 높은 정답률을 보이고 있으며, 매우 효율적인 학습
                  습관을 가지고 있습니다.
                </p>
              </div>
            </div>
          </div>

          <!-- 학습 패턴 분석 -->
          <div class="analysis-card">
            <div class="card-header">
              <h2 class="card-title">🎯 우리 반 학습 패턴</h2>
            </div>

            <div class="pattern-analysis">
              <!-- 학습 선호도 -->
              <div class="pattern-card">
                <h4 class="pattern-title">💖 학습 선호도</h4>
                <div class="chart-container small">
                  <canvas ref="preferenceChartRef"></canvas>
                </div>
                <div class="pattern-details">
                  <div class="detail-item">
                    <span class="detail-color orange"></span>
                    <span
                      >우리 반은 개념 학습을 <strong>44분</strong> 했어요</span
                    >
                  </div>
                  <div class="detail-item">
                    <span class="detail-color blue"></span>
                    <span>우리 반은 문제를 <strong>26분</strong> 풀었어요</span>
                  </div>
                </div>
              </div>

              <!-- 시간대별 분석 -->
              <div class="pattern-card">
                <h4 class="pattern-title">⏰ 시간대별 분석</h4>
                <div class="chart-container small">
                  <canvas ref="timeAnalysisChartRef"></canvas>
                </div>
                <div class="ai-insight">
                  <div class="insight-header">
                    <span class="ai-icon">🤖</span>
                    <strong>분석</strong>
                  </div>
                  <p>
                    우리 반은 주로 <em>저녁</em> 시간대에 집중적으로 학습하고
                    있습니다.
                  </p>
                  <div class="insight-header">
                    <span class="ai-icon">💡</span>
                    <strong>AI 학습전략</strong>
                  </div>
                  <p>
                    이런 지속적인 학습 습관을 유지할 수 있도록 격려해 주세요!
                  </p>
                </div>
              </div>

              <!-- 요일별 분석 -->
              <div class="pattern-card">
                <h4 class="pattern-title">📅 요일별 분석</h4>
                <div class="chart-container small">
                  <canvas ref="weeklyAnalysisChartRef"></canvas>
                </div>
                <div class="ai-insight">
                  <div class="insight-header">
                    <span class="ai-icon">🤖</span>
                    <strong>분석</strong>
                  </div>
                  <p>
                    우리 반은 주로 <em>일요일</em>에 집중적으로 학습하고
                    있습니다.
                  </p>
                  <div class="insight-header">
                    <span class="ai-icon">💡</span>
                    <strong>AI 학습전략</strong>
                  </div>
                  <p>
                    하루에 몰아서 학습하기 보다는 여러 날에 걸쳐 고르게 학습할
                    수 있도록 지도해 주세요!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import Header from "@/components/common/Header.vue";

export default {
  name: "TeacherClassAnalysis",
  components: { Header },
  setup() {
    // 반응형 데이터
    const currentTab = ref(0);
    const selectedFilter = ref("all");
    const selectedPeriod = ref("weekly");
    const selectedUnit = ref("unit1");
    const dateFrom = ref("2025-01-01");
    const dateTo = ref("2025-08-17");
    const activeAccordion = ref(-1);

    // 차트 refs
    const achievementChartRef = ref(null);
    const contentAreaChartRef = ref(null);
    const distributionChartRef = ref(null);
    const preferenceChartRef = ref(null);
    const timeAnalysisChartRef = ref(null);
    const weeklyAnalysisChartRef = ref(null);

    const tabs = [
      { label: "학습 요약", emoji: "📊" },
      { label: "상세 분석", emoji: "🔍" },
      { label: "학습 패턴", emoji: "📈" },
    ];

    const summaryStats = [
      {
        value: "3",
        unit: "일",
        label: "평균 학습일",
        icon: "📅",
        min: "2일",
        max: "6일",
      },
      {
        value: "01시간 01",
        unit: "분",
        label: "평균 학습 시간",
        icon: "⏰",
        min: "29분",
        max: "03시간",
      },
      {
        value: "156",
        unit: "개",
        label: "평균 문제 풀이 수",
        icon: "📝",
        min: "114개",
        max: "204개",
      },
      {
        value: "60.4",
        unit: "%",
        label: "평균 정답률",
        icon: "✅",
        min: "7.4%",
        max: "100%",
      },
    ];

    const unitDetails = [
      {
        title: "1. 곱셈",
        average: 60,
        aiInsight:
          "곱셈 영역에서 전반적으로 양호한 성과를 보이고 있습니다. 특히 기본 곱셈에 강점을 보이나, 올림이 있는 곱셈에서 일부 어려움을 겪고 있어요.",
      },
      {
        title: "2. 나눗셈",
        average: 62,
        aiInsight:
          "나눗셈 영역에서 좋은 성과를 보이고 있습니다. 계속해서 연습하면 더 좋은 결과를 얻을 수 있을 것 같아요.",
      },
      {
        title: "3. 원",
        average: 0,
        aiInsight: "아직 학습하지 않은 단원입니다. 곧 시작될 예정이에요!",
      },
    ];

    const wrongAnswers = [
      {
        unit: "1. 곱셈",
        topic: "올림이 여러 번 있는 (몇십몇)×(몇십몇) 계산하기",
        difficulty: "medium",
        difficultyText: "중",
        wrongCount: 8,
        totalCount: 10,
      },
      {
        unit: "1. 곱셈",
        topic: "(한 자리 수)×(두 자리 수) 계산하기",
        difficulty: "medium",
        difficultyText: "중",
        wrongCount: 6,
        totalCount: 10,
      },
      {
        unit: "1. 곱셈",
        topic: "올림이 없는 (세 자리 수)×(한 자리 수) 계산하기",
        difficulty: "easy",
        difficultyText: "하",
        wrongCount: 6,
        totalCount: 10,
      },
    ];

    // 차트 그리기 함수
    const createMockChart = (canvas, type) => {
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const width = (canvas.width = canvas.offsetWidth);
      const height = (canvas.height = canvas.offsetHeight);

      ctx.clearRect(0, 0, width, height);

      if (type === "achievement") {
        // 단원별 성취 현황 차트
        const data = [
          { label: "1단원", ourClass: 60, schoolAvg: 60 },
          { label: "2단원", ourClass: 62, schoolAvg: 62 },
          { label: "3단원", ourClass: 0, schoolAvg: 0 },
          { label: "4단원", ourClass: 0, schoolAvg: 0 },
          { label: "5단원", ourClass: 0, schoolAvg: 0 },
          { label: "6단원", ourClass: 0, schoolAvg: 0 },
        ];

        const barWidth = (width / data.length) * 0.3;
        const maxHeight = height * 0.7;

        data.forEach((item, index) => {
          const x = (width / data.length) * index + (width / data.length) * 0.2;

          // 우리 반
          const ourHeight = (item.ourClass / 100) * maxHeight;
          ctx.fillStyle = "#ffdd29";
          ctx.fillRect(x, height - ourHeight - 30, barWidth, ourHeight);

          // 전체 평균
          const avgHeight = (item.schoolAvg / 100) * maxHeight;
          ctx.fillStyle = "#ffa726";
          ctx.fillRect(
            x + barWidth + 5,
            height - avgHeight - 30,
            barWidth,
            avgHeight
          );

          // 라벨
          ctx.fillStyle = "#666";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(item.label, x + barWidth, height - 10);
        });
      } else if (type === "radar") {
        // 레이더 차트 (내용 영역별)
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        const areas = [
          "수와 연산",
          "변화와 관계",
          "도형과 측정",
          "자료와 가능성",
        ];
        const values = [60, 0, 0, 0];

        // 배경 그리드
        for (let i = 1; i <= 5; i++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
          ctx.strokeStyle = "#e0e0e0";
          ctx.stroke();
        }

        // 축 그리기
        areas.forEach((area, index) => {
          const angle = ((Math.PI * 2) / areas.length) * index - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = "#e0e0e0";
          ctx.stroke();

          // 라벨
          ctx.fillStyle = "#666";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            area,
            x + Math.cos(angle) * 20,
            y + Math.sin(angle) * 20
          );
        });

        // 데이터 그리기
        ctx.beginPath();
        values.forEach((value, index) => {
          const angle = ((Math.PI * 2) / values.length) * index - Math.PI / 2;
          const distance = (value / 100) * radius;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;

          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 221, 41, 0.3)";
        ctx.fill();
        ctx.strokeStyle = "#ffdd29";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (type === "scatter") {
        // 산점도 (학습 분포도)
        const students = [
          { x: 30, y: 80, name: "학생A" },
          { x: 60, y: 90, name: "학생B" },
          { x: 45, y: 70, name: "학생C" },
          { x: 80, y: 85, name: "학생D" },
          { x: 25, y: 60, name: "학생E" },
          { x: 70, y: 95, name: "학생F" },
          { x: 40, y: 75, name: "학생G" },
          { x: 90, y: 88, name: "학생H" },
        ];

        // 축 그리기
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, height - 50);
        ctx.lineTo(width - 50, height - 50);
        ctx.moveTo(50, 50);
        ctx.lineTo(50, height - 50);
        ctx.stroke();

        // 축 라벨
        ctx.fillStyle = "#666";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("학습 시간", width / 2, height - 20);
        ctx.save();
        ctx.translate(20, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("정답률", 0, 0);
        ctx.restore();

        // 학생 점 그리기
        students.forEach((student) => {
          const x = 50 + (student.x / 100) * (width - 100);
          const y = height - 50 - (student.y / 100) * (height - 100);

          ctx.fillStyle = "#ffdd29";
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#666";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(student.name, x, y - 10);
        });
      } else if (type === "pie") {
        // 파이 차트
        const data = [44, 26]; // 개념학습 44분, 문제풀이 26분
        const colors = ["#ffa726", "#ffdd29"];
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        let startAngle = 0;
        data.forEach((value, index) => {
          const sliceAngle = (value / 70) * 2 * Math.PI;

          ctx.fillStyle = colors[index];
          ctx.beginPath();
          ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            startAngle + sliceAngle
          );
          ctx.lineTo(centerX, centerY);
          ctx.fill();

          startAngle += sliceAngle;
        });
      } else if (type === "time") {
        // 시간대별 차트
        const timeData = [2, 22, 77, 0]; // 오전, 오후, 저녁, 새벽
        const labels = ["오전", "오후", "저녁", "새벽"];
        const colors = ["#ffeb3b", "#ff9800", "#ff5722", "#3f51b5"];

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        let startAngle = 0;
        timeData.forEach((value, index) => {
          const sliceAngle = (value / 100) * 2 * Math.PI;

          ctx.fillStyle = colors[index];
          ctx.beginPath();
          ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            startAngle + sliceAngle
          );
          ctx.lineTo(centerX, centerY);
          ctx.fill();

          startAngle += sliceAngle;
        });
      } else if (type === "weekly") {
        // 요일별 차트
        const weekData = [544, 0, 164, 0, 0, 0, 0]; // 일~토
        const labels = ["일", "월", "화", "수", "목", "금", "토"];
        const maxValue = Math.max(...weekData);

        weekData.forEach((value, index) => {
          const barHeight = (value / maxValue) * (height * 0.7);
          const barWidth = (width / weekData.length) * 0.6;
          const x =
            (width / weekData.length) * index +
            (width / weekData.length - barWidth) / 2;
          const y = height - barHeight - 30;

          ctx.fillStyle = value > 0 ? "#ffdd29" : "#e0e0e0";
          ctx.fillRect(x, y, barWidth, barHeight);

          // 라벨
          ctx.fillStyle = "#666";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(labels[index], x + barWidth / 2, height - 10);
        });
      }
    };

    // 차트 초기화
    const initCharts = () => {
      nextTick(() => {
        createMockChart(achievementChartRef.value, "achievement");
        createMockChart(contentAreaChartRef.value, "radar");
        createMockChart(distributionChartRef.value, "scatter");
        createMockChart(preferenceChartRef.value, "pie");
        createMockChart(timeAnalysisChartRef.value, "time");
        createMockChart(weeklyAnalysisChartRef.value, "weekly");
      });
    };

    // 메서드들
    const switchTab = (tabIndex) => {
      currentTab.value = tabIndex;
      setTimeout(() => {
        initCharts();
      }, 100);
    };

    const toggleAccordion = (index) => {
      activeAccordion.value = activeAccordion.value === index ? -1 : index;
    };

    const generateWrongAnswerTest = () => {
      alert("📝 오답 시험지 출제 기능을 실행합니다!");
    };

    const showWrongStudents = (item) => {
      alert(`❌ ${item.topic} 문제를 틀린 학생 목록을 보여줍니다.`);
    };

    const viewQuestion = (item) => {
      alert(`📄 ${item.topic} 문제를 상세히 보여줍니다.`);
    };

    // 생명주기 훅
    onMounted(() => {
      setTimeout(() => {
        initCharts();
      }, 100);
    });

    return {
      // 반응형 데이터
      currentTab,
      selectedFilter,
      selectedPeriod,
      selectedUnit,
      dateFrom,
      dateTo,
      activeAccordion,
      tabs,
      summaryStats,
      unitDetails,
      wrongAnswers,

      // 차트 참조
      achievementChartRef,
      contentAreaChartRef,
      distributionChartRef,
      preferenceChartRef,
      timeAnalysisChartRef,
      weeklyAnalysisChartRef,

      // 메서드
      switchTab,
      toggleAccordion,
      generateWrongAnswerTest,
      showWrongStudents,
      viewQuestion,
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

.analysis-page {
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.analysis-container {
  max-width: 1400px;
  margin: 0 auto;
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

/* 필터 섹션 */
.filter-section {
  background: white;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filter-controls {
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

/* 탭 */
.analysis-tabs {
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

/* 분석 카드 */
.analysis-card {
  background: white;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.analysis-card:hover {
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

.card-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

/* 툴팁 */
.tooltip-info {
  position: relative;
  display: inline-block;
}

.tooltip-icon {
  cursor: help;
  font-size: 1.2rem;
}

.tooltip-text {
  position: absolute;
  background: #333;
  color: white;
  padding: 0.5rem;
  border-radius: 5px;
  font-size: 0.8rem;
  width: 200px;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.tooltip-info:hover .tooltip-text {
  opacity: 1;
  visibility: visible;
}

/* 요약 통계 */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #fffbf0;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 2px solid #fff5d6;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
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
  text-align: left;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffdd29;
  margin-bottom: 0.25rem;
}

.stat-unit {
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-label {
  color: #666;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-range {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #888;
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
.legend-color.school-avg {
  background: #ffa726;
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

.chart-container.small {
  height: 200px;
}

.chart-container.large {
  height: 400px;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}

/* 내용 영역별 차트 */
.content-area-chart {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: center;
}

.content-analysis h4 {
  color: #ff9800;
  margin-bottom: 1rem;
  font-weight: 700;
}

.analysis-text {
  line-height: 1.6;
  color: #666;
}

.highlight {
  font-weight: 600;
}

/* 단원별 상세 */
.unit-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.unit-accordion {
  background: #fffbf0;
  border: 2px solid #fff5d6;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.unit-accordion.active {
  border-color: #ffdd29;
}

.accordion-header {
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  transition: all 0.3s ease;
}

.accordion-header:hover {
  background: #fffbf0;
}

.unit-info {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
}

.unit-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0;
}

.unit-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-label {
  font-size: 0.9rem;
  color: #666;
}

.score-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffdd29;
}

.accordion-icon {
  font-size: 1.2rem;
  color: #ff9800;
  transition: transform 0.3s ease;
}

.accordion-content {
  padding: 1.5rem;
  border-top: 1px solid #fff5d6;
  background: #fffbf0;
}

.unit-insights {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #ffdd29;
}

.unit-insights h5 {
  color: #ff9800;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.unit-insights p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 테이블 */
.wrong-answers-table {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f5f5f5;
}

.data-table th {
  background: #fffbf0;
  font-weight: 700;
  color: #ff9800;
  border-bottom: 2px solid #ffe066;
}

.data-table tbody tr:hover {
  background: #fffbf0;
}

.difficulty-tag {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.difficulty-tag.easy {
  background: #4caf50;
}

.difficulty-tag.medium {
  background: #ff9800;
}

.difficulty-tag.hard {
  background: #f44336;
}

.wrong-count-btn,
.view-question-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #ff9800;
  font-weight: 600;
  transition: all 0.3s ease;
}

.wrong-count-btn:hover {
  color: #e65100;
  transform: scale(1.05);
}

.view-question-btn {
  font-size: 1.2rem;
}

.view-question-btn:hover {
  transform: scale(1.2);
}

/* 분포도 */
.distribution-chart {
  position: relative;
}

.distribution-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1.5rem;
}

.legend-quadrant {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fffbf0;
  border-radius: 8px;
  border: 2px solid #fff5d6;
  font-size: 0.85rem;
  font-weight: 500;
}

.quadrant-icon {
  font-size: 1.2rem;
}

/* AI 코멘트 */
.ai-comment {
  background: #fffbf0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 2px solid #fff5d6;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.ai-avatar {
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.ai-message h4 {
  color: #ffdd29;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.ai-message p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 학습 패턴 */
.pattern-analysis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.pattern-card {
  background: #fffbf0;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #fff5d6;
}

.pattern-title {
  font-size: 1rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 1rem;
  text-align: center;
}

.pattern-details {
  margin-top: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.detail-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.detail-color.orange {
  background: #ffa726;
}
.detail-color.blue {
  background: #ffdd29;
}

/* AI 인사이트 */
.ai-insight {
  background: rgba(255, 221, 41, 0.05);
  padding: 1rem;
  border-radius: 12px;
  margin-top: 1rem;
  border: 2px solid rgba(255, 221, 41, 0.15);
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.ai-icon {
  font-size: 1.1rem;
}

.insight-header strong {
  color: #ffdd29;
  font-weight: 600;
}

.ai-insight p {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 0.5rem 0;
}

.ai-insight em {
  font-weight: 600;
  color: #ff9800;
}

/* 버튼들 */
.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.btn-primary {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.btn-secondary {
  background: rgba(255, 221, 41, 0.1);
  color: #ffdd29;
  border: 2px solid rgba(255, 221, 41, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 221, 41, 0.2);
  transform: translateY(-1px);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .analysis-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .content-area-chart {
    grid-template-columns: 1fr;
  }

  .pattern-analysis {
    grid-template-columns: 1fr;
  }

  .distribution-legend {
    grid-template-columns: 1fr;
  }

  .tab-button {
    padding: 1rem;
    font-size: 0.85rem;
  }

  .analysis-card {
    padding: 1.5rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .stat-content {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.4rem;
  }

  .cute-breadcrumb {
    font-size: 0.8rem;
  }

  .unit-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .ai-comment {
    flex-direction: column;
    text-align: center;
  }
}

/* 접근성 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

button:focus,
select:focus,
input:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}
</style>
