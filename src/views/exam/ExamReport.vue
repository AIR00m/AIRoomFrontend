<template>
  <div class="modern-chick-app">
    <!-- 내비게이션 -->
    <nav class="modern-navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <div class="logo-icon">🐥</div>
          <strong>아이룸</strong>
        </div>

        <div class="nav-menu">
          <div class="nav-links">
            <a href="#" class="nav-link">🏠 홈</a>
            <a href="#" class="nav-link">📚 우리 반 수업</a>
            <a href="#" class="nav-link">🎯 맞춤 학습</a>
            <a href="#" class="nav-link">📝 과제</a>
            <a href="#" class="nav-link">⭐ 평가</a>
            <a href="#" class="nav-link active">📊 학습 리포트</a>
          </div>

          <div class="nav-actions">
            <div class="user-info">
              <span class="user-badge">{{ subjectInfo }} ⭐</span>
            </div>
            <button class="nav-btn" title="알림">
              🔔
              <span class="notification-badge">1</span>
            </button>
            <button class="nav-btn" title="채팅">
              💬
              <span class="notification-badge chat-badge">5</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <!-- 헤더 -->
      <div class="modern-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="header-title">📊 나의 학습 여행 일기 ✨</h1>
            <p class="header-subtitle">
              우리가 함께한 소중한 학습 시간들을 돌아보아요!
            </p>
            <nav class="breadcrumb">
              <span>🏠 홈</span>
              <span class="separator">></span>
              <span class="current">📊 학습 리포트</span>
            </nav>
          </div>
        </div>

        <div class="header-decoration">🐣</div>
      </div>

      <!-- 탭 컨테이너 -->
      <div class="tab-container">
        <!-- 탭 네비게이션 -->
        <div class="tab-nav">
          <button
            v-for="(tab, index) in tabs"
            :key="index"
            :class="['tab-button', { active: currentTab === index }]"
            @click="switchTab(index)"
          >
            <span class="tab-emoji">{{ tab.emoji }}</span>
            {{ tab.label }}
          </button>
        </div>

        <!-- 탭 콘텐츠 -->
        <div class="tab-content">
          <!-- 종합 분석 탭 -->
          <div v-if="currentTab === 0" class="tab-panel">
            <!-- PDF 저장 버튼 -->
            <div class="action-header">
              <button class="modern-btn primary" @click="savePDF">
                📄 PDF로 저장하기
              </button>
            </div>

            <!-- 학습 요약 -->
            <div class="modern-card">
              <div class="card-header">
                <h2 class="card-title">🎓 나의 학습 요약</h2>
                <div class="summary-controls">
                  <select v-model="selectedPeriod" class="modern-select">
                    <option value="weekly">📅 주별</option>
                    <option value="daily">📆 일별</option>
                    <option value="monthly">🗓️ 월별</option>
                  </select>
                  <input type="date" v-model="dateFrom" class="modern-date" />
                  <span class="date-separator">~</span>
                  <input type="date" v-model="dateTo" class="modern-date" />
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
            <div class="modern-card">
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

              <div class="chart-actions">
                <button
                  class="modern-btn secondary"
                  @click="showDetailedAnalysis"
                >
                  🔍 자세히 보기
                </button>
              </div>
            </div>

            <!-- AI 학습 분석 -->
            <div class="modern-card">
              <div class="card-header">
                <h2 class="card-title">🤖 AI 선생님의 분석</h2>
              </div>

              <div class="ai-analysis">
                <div class="ai-comment">
                  <div class="ai-avatar">🐤</div>
                  <div class="ai-message">
                    <h4>🎉 학생1님 축하해요!</h4>
                    <p>
                      기분 단어/어구 보고 쓰기에서 우수한 성과를 냈군요! 🌟<br />
                      높은 단계로의 도약을 위해 AI 맞춤 콘텐츠를 활용해 보는
                      것은 어떨까요? ✨
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
            <div class="modern-card">
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
                  <button class="modern-btn small">시작하기</button>
                </div>
                <div class="recommendation-item">
                  <div class="rec-icon">🎯</div>
                  <div class="rec-content">
                    <h4>회화 연습 챌린지</h4>
                    <p>
                      일상 대화 상황을 통해 자연스러운 영어 표현을 익혀보세요!
                    </p>
                  </div>
                  <button class="modern-btn small">도전하기</button>
                </div>
              </div>
            </div>

            <!-- 학습 성장 분석 -->
            <div class="modern-card">
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
                  꾸준한 학습으로 실력이 향상되고 있어요. 특히 읽기 영역에서
                  눈에 띄는 성장을 보이고 있습니다! 💖
                </p>
              </div>
            </div>
          </div>

          <!-- 학습 현황 탭 -->
          <div v-if="currentTab === 1" class="tab-panel">
            <div class="modern-card">
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
                      <button class="modern-btn small" @click="goToChallenge">
                        🚀 바로 가기
                      </button>
                    </div>
                    <div class="coaching-item">
                      <div class="coaching-content">
                        <h5>❌ 오답 문제가 기다리고 있어요</h5>
                        <p>지금 바로 오답 문제를 풀어보러 가볼까요?</p>
                      </div>
                      <button
                        class="modern-btn small"
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
                      <button class="modern-btn small" @click="goToAssignment">
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
                      <span class="ai-icon">🐤</span>
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
                      <span class="ai-icon">🐤</span>
                      <strong>AI 분석</strong>
                    </div>
                    <p>
                      주로 <strong>주말</strong>에 집중적으로 학습하고 있습니다
                      📅
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
    </main>

    <!-- 플로팅 장식들 -->
    <div class="floating-decorations">
      <div class="floating-item item1">🐣</div>
      <div class="floating-item item2">🌟</div>
      <div class="floating-item item3">✨</div>
      <div class="floating-item item4">📚</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";

export default {
  name: "ModernChickReport",
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

    const subjectInfo = ref("🇺🇸 영어 4 | 학생1");

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
      subjectInfo,
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
.modern-chick-app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  background: linear-gradient(135deg, #fffef7 0%, #fff8e1 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  color: #333;
}

/* 네비게이션 */
.modern-navbar {
  background: linear-gradient(135deg, #ffdd29, #ffc107);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 221, 41, 0.3);
  box-shadow: 0 2px 20px rgba(255, 221, 41, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.logo-icon:hover {
  transform: rotate(15deg) scale(1.1);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  backdrop-filter: blur(5px);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  backdrop-filter: blur(10px);
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  padding: 0.6rem;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  background: #ff5722;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.chat-badge {
  background: #4caf50;
}

/* 메인 콘텐츠 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 헤더 */
.modern-header {
  background: linear-gradient(
    135deg,
    rgba(255, 221, 41, 0.1),
    rgba(255, 193, 7, 0.1)
  );
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 221, 41, 0.2);
}

.header-content {
  position: relative;
  z-index: 2;
}

.header-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
}

.header-subtitle {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #888;
}

.separator {
  margin: 0 0.25rem;
}

.current {
  font-weight: 600;
  color: #ffdd29;
}

.header-decoration {
  position: absolute;
  top: 20px;
  right: 30px;
  font-size: 3rem;
  opacity: 0.3;
  animation: bounce 3s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 탭 컨테이너 */
.tab-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 221, 41, 0.2);
  overflow: hidden;
}

.tab-nav {
  display: flex;
  background: linear-gradient(
    135deg,
    rgba(255, 221, 41, 0.05),
    rgba(255, 193, 7, 0.05)
  );
  border-bottom: 1px solid rgba(255, 221, 41, 0.2);
}

.tab-button {
  flex: 1;
  padding: 1.2rem 2rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-button.active {
  background: white;
  color: #ffdd29;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 221, 41, 0.2);
}

.tab-button:hover:not(.active) {
  background: rgba(255, 221, 41, 0.1);
  color: #ffdd29;
}

.tab-emoji {
  font-size: 1.1rem;
}

.tab-content {
  padding: 2rem;
}

/* 액션 헤더 */
.action-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

/* 버튼들 */
.modern-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.modern-btn.primary {
  background: linear-gradient(135deg, #ffdd29, #ffc107);
  color: white;
  box-shadow: 0 2px 8px rgba(255, 221, 41, 0.3);
}

.modern-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 221, 41, 0.4);
}

.modern-btn.secondary {
  background: rgba(255, 221, 41, 0.1);
  color: #ffdd29;
  border: 1px solid rgba(255, 221, 41, 0.3);
}

.modern-btn.secondary:hover {
  background: rgba(255, 221, 41, 0.2);
  transform: translateY(-1px);
}

.modern-btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* 카드들 */
.modern-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 221, 41, 0.15);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
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
  color: #333;
  margin: 0;
}

/* 요약 통계 */
.summary-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.modern-select,
.modern-date {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 221, 41, 0.3);
  border-radius: 10px;
  background: white;
  color: #333;
  font-weight: 500;
  font-family: inherit;
  transition: all 0.3s ease;
}

.modern-select:focus,
.modern-date:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.15);
}

.date-separator {
  color: #ffdd29;
  font-weight: 600;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(
    135deg,
    rgba(255, 221, 41, 0.05),
    rgba(255, 193, 7, 0.05)
  );
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 221, 41, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.15);
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
  font-weight: 500;
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
  font-weight: 500;
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
  background: rgba(255, 221, 41, 0.02);
  border-radius: 12px;
  padding: 1rem;
}

.chart-container.small {
  height: 200px;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}

.chart-actions {
  text-align: center;
  margin-top: 1.5rem;
}

/* AI 분석 */
.ai-analysis {
  background: linear-gradient(
    135deg,
    rgba(255, 221, 41, 0.03),
    rgba(255, 193, 7, 0.03)
  );
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(255, 221, 41, 0.15);
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
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.weakness-section {
  border: 1px solid rgba(255, 152, 0, 0.3);
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
  background: linear-gradient(
    135deg,
    rgba(255, 221, 41, 0.05),
    rgba(255, 193, 7, 0.05)
  );
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 221, 41, 0.2);
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
  color: #333;
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
  background: linear-gradient(
    135deg,
    rgba(255, 221, 41, 0.03),
    rgba(255, 193, 7, 0.03)
  );
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 221, 41, 0.15);
}

.pattern-title {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
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
  border: 1px solid rgba(255, 221, 41, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.coaching-content h5 {
  color: #333;
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
  border: 1px solid rgba(255, 221, 41, 0.15);
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
  background: linear-gradient(
    135deg,
    rgba(255, 221, 41, 0.03),
    rgba(255, 193, 7, 0.03)
  );
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 221, 41, 0.15);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
}

/* 선생님 피드백 */
.teacher-feedback {
  background: linear-gradient(
    135deg,
    rgba(255, 221, 41, 0.05),
    rgba(255, 193, 7, 0.05)
  );
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  border: 1px solid rgba(255, 221, 41, 0.15);
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

/* 플로팅 장식들 */
.floating-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-item {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.4;
  animation: float 8s ease-in-out infinite;
}

.item1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}
.item2 {
  top: 25%;
  right: 15%;
  animation-delay: 2s;
}
.item3 {
  top: 60%;
  left: 8%;
  animation-delay: 4s;
}
.item4 {
  top: 75%;
  right: 12%;
  animation-delay: 6s;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .nav-menu {
    width: 100%;
    justify-content: center;
  }

  .nav-links {
    justify-content: center;
    flex-wrap: wrap;
  }

  .main-content {
    padding: 1rem;
  }

  .header-title {
    font-size: 1.6rem;
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

  .modern-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header-title {
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
  outline: 2px solid #ffdd29;
  outline-offset: 2px;
}
</style>
