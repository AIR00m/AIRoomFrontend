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

      <!-- 안내 상자 -->
      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <ul class="notice-list">
          <li>학습 데이터를 기반으로 한 맞춤형 분석 결과를 확인해보세요.</li>
          <li>AI 선생님의 학습 조언으로 더 효과적인 공부를 해요! 💪</li>
          <li>PDF로 저장해서 언제든지 학습 기록을 돌아볼 수 있어요.</li>
        </ul>
      </div>

      <!-- 탭 -->
      <div class="report-tabs">
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
      <div class="report-content">
        <!-- 종합 분석 탭 -->
        <div v-if="currentTab === 0" class="tab-panel">
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

            <div class="summary-stats">
              <div
                v-for="(stat, index) in summaryStats"
                :key="index"
                class="stat-card"
              >
                <div class="stat-icon">{{ stat.icon }}</div>
                <div class="stat-value">
                  {{ stat.value }}<span class="stat-unit">{{ stat.unit }}</span>
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

            <div class="card-footer">
              <button
                class="action-btn btn-secondary"
                @click="showDetailedAnalysis"
              >
                🔍 자세히 보기
              </button>
            </div>
          </div>

          <!-- AI 학습 분석 -->
          <div class="report-card">
            <div class="card-header">
              <h2 class="card-title">🤖 AI 선생님의 분석</h2>
            </div>

            <div class="ai-analysis">
              <div class="ai-comment">
                <div class="ai-avatar">🤖</div>
                <div class="ai-message">
                  <h4>🎉 학생1님 축하해요!</h4>
                  <p>
                    기분 단어/어구 보고 쓰기에서 우수한 성과를 냈군요! 🌟<br />
                    높은 단계로의 도약을 위해 AI 맞춤 콘텐츠를 활용해 보는 것은
                    어떨까요? ✨
                  </p>
                </div>
              </div>

              <div class="strengths-weaknesses">
                <div class="strength-section">
                  <h4 class="section-title good">🏆 나의 강점</h4>
                  <p class="section-subtitle">아주 잘하고 있어요!</p>
                  <div class="achievement-list">
                    <div class="achievement-item">
                      <span class="rank">🥇</span>
                      <span class="content">기분 단어/어구 보고 쓰기</span>
                    </div>
                    <div class="achievement-item">
                      <span class="rank">🥈</span>
                      <span class="content"
                        >안부 묻고 답하는 말 듣고 이해하기</span
                      >
                    </div>
                    <div class="achievement-item">
                      <span class="rank">🥉</span>
                      <span class="content">안부 묻고 답하기</span>
                    </div>
                  </div>
                </div>

                <div class="weakness-section">
                  <h4 class="section-title weak">💪 개선 포인트</h4>
                  <p class="section-subtitle">조금 더 노력이 필요해요!</p>
                  <div class="empty-state">
                    <div class="empty-icon">😊</div>
                    <p>고르게 잘하고 있어요!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI 학습 추천 -->
          <div class="report-card">
            <div class="card-header">
              <h2 class="card-title">💡 AI 맞춤 추천</h2>
            </div>

            <div class="recommendation-content">
              <div class="recommendation-item">
                <div class="rec-icon">📚</div>
                <div class="rec-content">
                  <h4>듣기 실력 향상 프로그램</h4>
                  <p>
                    현재 수준에 맞는 듣기 훈련으로 실력을 한층 더
                    끌어올려보세요!
                  </p>
                </div>
                <button class="action-btn btn-small">시작하기</button>
              </div>
              <div class="recommendation-item">
                <div class="rec-icon">🎯</div>
                <div class="rec-content">
                  <h4>회화 연습 챌린지</h4>
                  <p>
                    일상 대화 상황을 통해 자연스러운 영어 표현을 익혀보세요!
                  </p>
                </div>
                <button class="action-btn btn-small">도전하기</button>
              </div>
            </div>
          </div>

          <!-- 학습 성장 분석 -->
          <div class="report-card">
            <div class="card-header">
              <h2 class="card-title">📊 학습 성장 그래프</h2>
            </div>

            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color knowledge"></div>
                <span>🧠 지식 · 이해</span>
              </div>
              <div class="legend-item">
                <div class="legend-color process"></div>
                <span>⚙️ 과정 · 기능</span>
              </div>
            </div>

            <div class="chart-container">
              <canvas ref="growthChartRef"></canvas>
            </div>

            <div class="teacher-feedback">
              <h5>👩‍🏫 선생님 피드백</h5>
              <p>
                꾸준한 학습으로 실력이 향상되고 있어요. 특히 읽기 영역에서 눈에
                띄는 성장을 보이고 있습니다! 💖
              </p>
            </div>
          </div>
        </div>

        <!-- 학습 현황 탭 -->
        <div v-if="currentTab === 1" class="tab-panel">
          <div class="report-card">
            <div class="card-header">
              <h2 class="card-title">🎯 나의 학습 패턴</h2>
            </div>

            <div class="learning-patterns">
              <!-- 학습 선호도 -->
              <div class="pattern-card">
                <h4 class="pattern-title">💖 학습 선호도</h4>
                <div class="chart-container small">
                  <canvas ref="preferenceChartRef"></canvas>
                </div>
                <div class="pattern-details">
                  <div class="detail-item">
                    <span class="detail-color orange"></span>
                    <span>개념 학습을 <strong>30분</strong> 했어요</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-color blue"></span>
                    <span>문제를 <strong>90분</strong> 풀었어요</span>
                  </div>
                </div>
              </div>

              <!-- 학습 코칭 -->
              <div class="pattern-card">
                <h4 class="pattern-title">🎓 학습 코칭</h4>
                <div class="coaching-items">
                  <div class="coaching-item">
                    <div class="coaching-content">
                      <h5>🏆 학습 챌린지 설정을 추천해요</h5>
                      <p>챌린지를 도전해 볼까요?</p>
                    </div>
                    <button class="action-btn btn-small" @click="goToChallenge">
                      🚀 바로 가기
                    </button>
                  </div>
                  <div class="coaching-item">
                    <div class="coaching-content">
                      <h5>❌ 오답 문제가 기다리고 있어요</h5>
                      <p>지금 바로 오답 문제를 풀어보러 가볼까요?</p>
                    </div>
                    <button
                      class="action-btn btn-small"
                      @click="goToWrongAnswers"
                    >
                      🚀 바로 가기
                    </button>
                  </div>
                  <div class="coaching-item">
                    <div class="coaching-content">
                      <h5>📋 1개의 진행 중인 과제가 있어요</h5>
                      <p>지금 바로 과제를 제출하러 가볼까요?</p>
                    </div>
                    <button
                      class="action-btn btn-small"
                      @click="goToAssignment"
                    >
                      🚀 바로 가기
                    </button>
                  </div>
                </div>
              </div>

              <!-- 시간대별 분석 -->
              <div class="pattern-card">
                <h4 class="pattern-title">⏰ 시간대별 분석</h4>
                <div class="chart-container small">
                  <canvas ref="timeChartRef"></canvas>
                </div>
                <div class="ai-insight">
                  <div class="insight-header">
                    <span class="ai-icon">🤖</span>
                    <strong>AI 분석</strong>
                  </div>
                  <p>
                    주로 <strong>오후</strong> 시간대에 집중적으로 학습하고
                    있습니다 ⏰
                  </p>
                </div>
              </div>
            </div>

            <!-- 요일별/월별 분석 -->
            <div class="analysis-charts">
              <div class="chart-section">
                <h4 class="section-title">📅 요일별 분석</h4>
                <div class="chart-container">
                  <canvas ref="weeklyChartRef"></canvas>
                </div>
                <div class="ai-insight">
                  <div class="insight-header">
                    <span class="ai-icon">🤖</span>
                    <strong>AI 분석</strong>
                  </div>
                  <p>
                    주로 <strong>주말</strong>에 집중적으로 학습하고 있습니다 📅
                  </p>
                </div>
              </div>

              <div class="chart-section">
                <h4 class="section-title">📊 월별 분석</h4>
                <div class="chart-container">
                  <canvas ref="monthlyChartRef"></canvas>
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
  name: "Report",
  components: { Header },
  setup() {
    // 반응형 데이터
    const currentTab = ref(0);
    const selectedPeriod = ref("weekly");
    const dateFrom = ref("2025-01-01");
    const dateTo = ref("2025-08-11");

    // 차트 refs
    const achievementChartRef = ref(null);
    const growthChartRef = ref(null);
    const preferenceChartRef = ref(null);
    const timeChartRef = ref(null);
    const weeklyChartRef = ref(null);
    const monthlyChartRef = ref(null);

    const tabs = [
      { label: "종합 분석", emoji: "📊" },
      { label: "학습 현황", emoji: "📈" },
    ];

    const summaryStats = [
      { value: "7", unit: "일", label: "학습일", icon: "📅" },
      { value: "120", unit: "분", label: "학습 시간", icon: "⏰" },
      { value: "45", unit: "개", label: "문제 풀이 수", icon: "📝" },
      { value: "87.5", unit: "%", label: "정답률", icon: "✅" },
    ];

    // 차트 그리기 함수
    const createMockChart = (canvas, type) => {
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const width = (canvas.width = canvas.offsetWidth);
      const height = (canvas.height = canvas.offsetHeight);

      ctx.clearRect(0, 0, width, height);

      if (type === "bar") {
        // 막대 차트 그리기
        const data = [85, 92, 78, 96, 88];
        const labels = ["문법", "듣기", "말하기", "읽기", "쓰기"];
        const barWidth = (width / data.length) * 0.6;
        const maxHeight = height * 0.7;

        data.forEach((value, index) => {
          const barHeight = (value / 100) * maxHeight;
          const x =
            (width / data.length) * index +
            (width / data.length - barWidth) / 2;
          const y = height - barHeight - 30;

          // 막대 그리기
          ctx.fillStyle = value >= 85 ? "#ffdd29" : "#ffa726";
          ctx.fillRect(x, y, barWidth, barHeight);

          // 라벨 그리기
          ctx.fillStyle = "#666";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(labels[index], x + barWidth / 2, height - 10);
          ctx.fillText(value + "%", x + barWidth / 2, y - 5);
        });
      } else if (type === "line") {
        // 선형 차트 그리기
        const data = [65, 72, 78, 85, 88, 92, 96];
        const points = data.map((value, index) => ({
          x: (width / (data.length - 1)) * index,
          y: height - (value / 100) * height * 0.8 - 20,
        }));

        // 선 그리기
        ctx.strokeStyle = "#ffdd29";
        ctx.lineWidth = 3;
        ctx.beginPath();
        points.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();

        // 점 그리기
        points.forEach((point) => {
          ctx.fillStyle = "#ff9800";
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (type === "pie") {
        // 파이 차트 그리기
        const data = [25, 75]; // 개념학습 25%, 문제풀이 75%
        const colors = ["#ffa726", "#ffdd29"];
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;

        let startAngle = 0;
        data.forEach((value, index) => {
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
      }
    };

    // 차트 초기화
    const initCharts = () => {
      nextTick(() => {
        createMockChart(achievementChartRef.value, "bar");
        createMockChart(growthChartRef.value, "line");
        createMockChart(preferenceChartRef.value, "pie");
        createMockChart(timeChartRef.value, "bar");
        createMockChart(weeklyChartRef.value, "bar");
        createMockChart(monthlyChartRef.value, "line");
      });
    };

    // 메서드들
    const switchTab = (tabIndex) => {
      currentTab.value = tabIndex;
      // 탭 변경 후 차트 재초기화
      setTimeout(() => {
        initCharts();
      }, 100);
    };

    const savePDF = () => {
      alert("📄 PDF 저장 기능을 실행합니다!");
    };

    const showDetailedAnalysis = () => {
      alert("📊 상세 분석 페이지로 이동합니다!");
    };

    const goToChallenge = () => {
      alert("🎯 학습 챌린지 페이지로 이동합니다!");
    };

    const goToWrongAnswers = () => {
      alert("❌ 오답 노트 페이지로 이동합니다!");
    };

    const goToAssignment = () => {
      alert("📋 과제 페이지로 이동합니다!");
    };

    // 생명주기 훅
    onMounted(() => {
      // 컴포넌트 마운트 후 차트 초기화
      setTimeout(() => {
        initCharts();
      }, 100);
    });

    return {
      // 반응형 데이터
      currentTab,
      selectedPeriod,
      dateFrom,
      dateTo,
      tabs,
      summaryStats,

      // 차트 참조
      achievementChartRef,
      growthChartRef,
      preferenceChartRef,
      timeChartRef,
      weeklyChartRef,
      monthlyChartRef,

      // 메서드
      switchTab,
      savePDF,
      showDetailedAnalysis,
      goToChallenge,
      goToWrongAnswers,
      goToAssignment,
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

/* 탭 */
.report-tabs {
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

/* 액션 헤더 */
.action-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

/* 리포트 카드 */
.report-card {
  background: white;
  border: 3px solid #fff5d6;
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
.legend-color.knowledge {
  background: #2196f3;
}
.legend-color.process {
  background: #4caf50;
}
.legend-color.orange {
  background: #ffa726;
}
.legend-color.blue {
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

.chart-container.small {
  height: 200px;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
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

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* AI 분석 */
.ai-analysis {
  background: #fffbf0;
  border-radius: 16px;
  padding: 2rem;
  border: 2px solid #fff5d6;
}

.ai-comment {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border-left: 4px solid #ffdd29;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

.strengths-weaknesses {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.strength-section,
.weakness-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.strength-section {
  border: 2px solid rgba(76, 175, 80, 0.3);
}

.weakness-section {
  border: 2px solid rgba(255, 152, 0, 0.3);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.section-title.good {
  color: #4caf50;
}
.section-title.weak {
  color: #ff9800;
}

.section-subtitle {
  color: #888;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
}

.achievement-list {
  text-align: left;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f5f5f5;
}

.achievement-item:last-child {
  border-bottom: none;
}

.rank {
  font-size: 1rem;
}

.content {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

/* 추천 콘텐츠 */
.recommendation-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  background: #fffbf0;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #fff5d6;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rec-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  background: rgba(255, 221, 41, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rec-content {
  flex: 1;
}

.rec-content h4 {
  color: #ff9800;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.rec-content p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

/* 학습 패턴 */
.learning-patterns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
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
  text-align: left;
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

/* 코칭 아이템 */
.coaching-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.coaching-item {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border: 2px solid #fff5d6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.coaching-content h5 {
  color: #ff9800;
  margin-bottom: 0.25rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.coaching-content p {
  color: #666;
  font-size: 0.8rem;
  margin: 0;
}

/* AI 인사이트 */
.ai-insight {
  background: rgba(255, 221, 41, 0.05);
  padding: 1rem;
  border-radius: 12px;
  margin-top: 1rem;
  text-align: left;
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
  margin: 0;
}

/* 분석 차트 */
.analysis-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.chart-section {
  background: #fffbf0;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #fff5d6;
}

/* 선생님 피드백 */
.teacher-feedback {
  background: #fffbf0;
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  border: 2px solid #fff5d6;
}

.teacher-feedback h5 {
  color: #ffdd29;
  margin-bottom: 0.5rem;
  font-weight: 700;
  font-size: 1rem;
}

.teacher-feedback p {
  color: #666;
  margin: 0;
  line-height: 1.6;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .report-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .strengths-weaknesses {
    grid-template-columns: 1fr;
  }

  .learning-patterns {
    grid-template-columns: 1fr;
  }

  .analysis-charts {
    grid-template-columns: 1fr;
  }

  .tab-button {
    padding: 1rem;
    font-size: 0.85rem;
  }

  .report-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.4rem;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-controls {
    justify-content: center;
  }

  .coaching-item {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .recommendation-item {
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
