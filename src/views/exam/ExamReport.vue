<template>
  <div class="exam-report-page">
    <div class="exam-report-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="header-left">
          <button class="header-btn back-btn" @click="goBack">
            <i class="bi bi-arrow-left"></i>
            <span>뒤로가기</span>
          </button>
          <h1 class="page-title">📊 평가 리포트</h1>
        </div>
        <div class="header-right">
          <button class="header-btn close-btn" @click="closeReport">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <i class="bi bi-arrow-clockwise"></i>
        </div>
        <div class="loading-text">평가 결과를 불러오는 중...</div>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <div class="error-text">평가 결과를 불러올 수 없습니다</div>
        <div class="error-details">{{ error }}</div>
        <button class="retry-btn" @click="loadReportData">다시 시도</button>
      </div>

      <!-- 메인 리포트 내용 -->
      <div v-else class="report-content">
        <!-- 시험 정보 배너 -->
        <div class="exam-info-banner">
          <div class="banner-content">
            <div class="exam-title-section">
              <h2 class="exam-title">{{ reportData.examName }}</h2>
              <div class="exam-subtitle">{{ getExamTypeText() }}</div>
            </div>
            <div class="exam-meta">
              <div class="meta-item">
                <dt>이름</dt>
                <dd>{{ reportData.studentName }}</dd>
              </div>
              <div class="meta-item">
                <dt>응시일</dt>
                <dd>{{ formatDate(reportData.examDate) }}</dd>
              </div>
              <div class="meta-item">
                <dt>소요시간</dt>
                <dd>{{ formatTotalTime() }}</dd>
              </div>
            </div>
          </div>
        </div>

        <!-- 채점 결과 섹션 -->
        <div class="result-section">
          <div class="result-card score-card">
            <div class="card-header">
              <h3><i class="bi bi-bar-chart-fill"></i> 채점 결과</h3>
              <div class="score-summary">
                정답률 <strong>{{ correctPercentage }}</strong>%
              </div>
            </div>
            <div class="card-content">
              <div class="score-visual">
                <div class="progress-circle">
                  <svg viewBox="0 0 200 200" class="circle-chart">
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="80" 
                      fill="transparent"
                      stroke="#e9ecef"
                      stroke-width="12"
                    />
                    <circle 
                      cx="100" 
                      cy="100" 
                      r="80" 
                      fill="transparent"
                      stroke="url(#gradient)"
                      stroke-width="12"
                      stroke-linecap="round"
                      :stroke-dasharray="circumference"
                      :stroke-dashoffset="dashOffset"
                      transform="rotate(-90 100 100)"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#1D6FF7"/>
                        <stop offset="60%" stop-color="#5158F8"/>
                        <stop offset="100%" stop-color="#6650F9"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div class="score-text">
                    <div class="percentage">{{ correctPercentage }}%</div>
                  </div>
                </div>
              </div>
              <div class="score-details">
                <div class="detail-item">
                  <span class="label">정답</span>
                  <span class="value">
                    <strong>{{ correctCount }}</strong> / {{ totalCount }}문제
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">오답</span>
                  <span class="value incorrect">{{ totalCount - correctCount }}문제</span>
                </div>
              </div>
            </div>
          </div>

          <div class="result-card time-card">
            <div class="card-header">
              <h3><i class="bi bi-clock-fill"></i> 풀이 시간</h3>
              <div class="time-summary">
                학급 평균 <strong>{{ formatTime(reportData.classAvgTime || 0) }}</strong>
              </div>
            </div>
            <div class="card-content">
              <div class="time-visual">
                <div class="clock-display">
                  <i class="bi bi-stopwatch"></i>
                </div>
              </div>
              <div class="time-details">
                <div class="detail-item">
                  <span class="label">총 소요시간</span>
                  <span class="value total-time">{{ formatTotalTime() }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">평균 문제당</span>
                  <span class="value">{{ formatTime(Math.round(totalSolvingTime / totalCount)) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 문항별 정오 현황 -->
        <div class="detail-section">
          <div class="section-header">
            <h3><i class="bi bi-list-check"></i> 문항별 정오 현황</h3>
            <div class="legend">
              <span class="legend-item">
                <i class="bi bi-circle-fill correct-color"></i> 정답
              </span>
              <span class="legend-item">
                <i class="bi bi-circle-fill incorrect-color"></i> 오답
              </span>
            </div>
          </div>

          <div class="problems-table-wrapper">
            <table class="problems-table">
              <thead>
                <tr>
                  <th>문항 번호</th>
                  <th>채점 결과</th>
                  <th>내용 영역</th>
                  <th>난이도</th>
                  <th>나의 답안</th>
                  <th>정답</th>
                  <th>풀이 시간</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(problem, index) in reportData.problems" 
                  :key="problem.saNo"
                  :class="{ 'correct-row': problem.isCorrect, 'incorrect-row': !problem.isCorrect }"
                >
                  <td class="problem-number">
                    <button @click="viewProblem(problem.epNo)" class="problem-btn">
                      {{ index + 1 }}
                    </button>
                  </td>
                  <td class="result-cell">
                    <button @click="viewProblem(problem.epNo)" class="result-btn">
                      <i 
                        :class="problem.isCorrect ? 'bi bi-check-circle-fill correct' : 'bi bi-x-circle-fill incorrect'"
                      ></i>
                    </button>
                  </td>
                  <td class="content-area">
                    <span class="area-badge">{{ getContentArea(problem) }}</span>
                  </td>
                  <td class="difficulty">
                    <span :class="['difficulty-badge', getDifficultyClass(problem.difficulty)]">
                      {{ getDifficultyText(problem.difficulty) }}
                    </span>
                  </td>
                  <td class="student-answer">
                    <span class="answer-text">{{ problem.saAnswer || '미응답' }}</span>
                  </td>
                  <td class="correct-answer">
                    <span class="answer-text correct">{{ problem.correctAnswer }}</span>
                  </td>
                  <td class="solving-time">
                    {{ formatTime(problem.saSolvingTime || 0) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 내용 영역별 분석 -->
        <div class="analysis-section">
          <div class="section-header">
            <h3><i class="bi bi-pie-chart-fill"></i> 내용 영역별 분석</h3>
          </div>

          <div class="analysis-content">
            <div class="ai-comment">
              <div class="comment-icon">
                <i class="bi bi-cursor"></i>
              </div>
              <div class="comment-content">
                <h4>{{ reportData.studentName }}님 분석 결과</h4>
                <p>{{ getAIAnalysisComment() }}</p>
              </div>
            </div>

            <div class="area-progress">
              <div 
                v-for="area in contentAreaAnalysis" 
                :key="area.name"
                class="area-item"
              >
                <div class="area-header">
                  <span class="area-name">{{ area.name }}</span>
                  <span class="area-percentage">{{ area.percentage }}%</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: area.percentage + '%' }"
                  ></div>
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/utils/apiClient";

export default {
  name: "ExamReport",
  setup() {
    const route = useRoute();
    const router = useRouter();

    // 기본 상태
    const isLoading = ref(true);
    const error = ref(null);
    const reportData = ref({});
    const tokenInfo = ref(null);

    // 계산된 속성
    const correctCount = computed(() => {
      return reportData.value.problems ? 
        reportData.value.problems.filter(p => p.isCorrect).length : 0;
    });

    const totalCount = computed(() => {
      return reportData.value.problems ? reportData.value.problems.length : 0;
    });

    const correctPercentage = computed(() => {
      // 이미 계산된 점수 사용
      return reportData.value.seScore || 0;
    });

    const totalSolvingTime = computed(() => {
      // 이미 계산된 총 풀이시간 사용
      return reportData.value.totalSolvingTime || 0;
    });

    // 원형 그래프 관련
    const circumference = computed(() => 2 * Math.PI * 80);
    const dashOffset = computed(() => {
      const percentage = correctPercentage.value; // 0-100 점수
      return circumference.value - (percentage / 100) * circumference.value;
    });

    // 내용 영역별 분석
    const contentAreaAnalysis = computed(() => {
      if (!reportData.value.problems) return [];

      const areas = {};
      reportData.value.problems.forEach(problem => {
        const areaName = getContentArea(problem);
        if (!areas[areaName]) {
          areas[areaName] = { correct: 0, total: 0 };
        }
        areas[areaName].total++;
        if (problem.isCorrect) {
          areas[areaName].correct++;
        }
      });

      return Object.entries(areas).map(([name, data]) => ({
        name,
        percentage: Math.round((data.correct / data.total) * 100)
      }));
    });

    // 토큰 정보 로드
    const loadTokenInfo = () => {
      try {
        const tokenInfoStr = localStorage.getItem("tokenInfo");
        if (tokenInfoStr) {
          tokenInfo.value = JSON.parse(tokenInfoStr);
        }
      } catch (err) {
        console.error("토큰 정보 파싱 실패:", err);
      }
    };

    // 리포트 데이터 로드
    const loadReportData = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const examNo = route.params.examNo;
        if (!examNo) {
          throw new Error("시험 번호를 찾을 수 없습니다.");
        }

        if (!tokenInfo.value) {
          throw new Error("사용자 정보를 찾을 수 없습니다.");
        }

        console.log("📊 리포트 데이터 로드 시작:", { examNo });

        // localStorage에서 시험 결과 데이터 조회
        const savedData = localStorage.getItem(`examReport_${examNo}`);
        if (!savedData) {
          throw new Error("시험 결과 데이터를 찾을 수 없습니다. 시험을 다시 확인해주세요.");
        }

        const examResultData = JSON.parse(savedData);
        console.log("📋 저장된 시험 결과 데이터:", examResultData);

        // StudentAnswerResponse 데이터를 ExamReport 형식으로 변환
        const problems = examResultData.studentAnswerResponseList.map(item => ({
          saNo: `${item.cepNo}_${item.epNo}`, // 임시 ID
          epNo: item.epNo,
          cepNo: item.cepNo,
          questionOrder: item.cepQuestionOrder,
          isCorrect: item.isCorrect,
          saAnswer: item.selectedAnswer,
          correctAnswer: item.correctAnswer,
          saSolvingTime: parseDurationToSeconds(item.saSolvingTime),
          unitTitle: item.unitTitle,
          difficulty: 'STANDARD' // 기본값 (실제 데이터에서는 추가 필요)
        }));

        // 문제를 순서대로 정렬
        problems.sort((a, b) => a.questionOrder - b.questionOrder);

        reportData.value = {
          examNo: examNo,
          examName: examResultData.examName,
          studentName: examResultData.studentName || tokenInfo.value.memberName,
          examDate: examResultData.examDate || new Date(),
          seScore: examResultData.seScore,
          totalSolvingTime: parseDurationToSeconds(examResultData.totalSolvingTime),
          classAvgTime: 60, // 임시값 (실제로는 API에서 가져와야 함)
          problems: problems
        };

        console.log("✅ 리포트 데이터 로드 완료:", reportData.value);

      } catch (err) {
        console.error("🚨 리포트 데이터 로드 실패:", err);
        error.value = err.message || "리포트 데이터를 불러오는데 실패했습니다.";
      } finally {
        isLoading.value = false;
      }
    };

    // Duration 문자열을 초 단위로 변환하는 함수
    const parseDurationToSeconds = (durationStr) => {
      if (!durationStr) return 0;
      
      try {
        // Duration 문자열 파싱 (예: "PT1M30S" -> 90초)
        if (typeof durationStr === 'string' && durationStr.startsWith('PT')) {
          const matches = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
          if (matches) {
            const hours = parseInt(matches[1] || '0');
            const minutes = parseInt(matches[2] || '0');
            const seconds = parseFloat(matches[3] || '0');
            return Math.round(hours * 3600 + minutes * 60 + seconds);
          }
        }
        
        // 숫자인 경우 그대로 반환
        if (typeof durationStr === 'number') {
          return durationStr;
        }
        
        return 0;
      } catch (err) {
        console.warn("Duration 파싱 실패:", durationStr, err);
        return 0;
      }
    };

    // 유틸리티 함수들
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric'
      });
    };

    const formatTime = (seconds) => {
      if (seconds <= 0) return "00:00";
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const formatTotalTime = () => {
      const seconds = totalSolvingTime.value;
      if (seconds <= 0) return "0분 0초";
      const minutes = Math.floor(seconds / 60);
      const remainSecs = seconds % 60;
      return `${minutes}분 ${remainSecs}초`;
    };

    const getExamTypeText = () => {
      return "단원 평가"; // 시험 타입에 따라 변경
    };

    const getContentArea = (problem) => {
      // StudentAnswerResponse의 unitTitle 사용
      return problem.unitTitle || "수와 연산";
    };

    const getDifficultyText = (difficulty) => {
      switch (difficulty) {
        case 'BASIC':
        case '하':
          return '하';
        case 'STANDARD':
        case '중':
          return '중';
        case 'ADVANCED':
        case '상':
          return '상';
        default:
          return '중';
      }
    };

    const getDifficultyClass = (difficulty) => {
      switch (difficulty) {
        case 'BASIC':
        case '하':
          return 'basic';
        case 'STANDARD':
        case '중':
          return 'standard';
        case 'ADVANCED':
        case '상':
          return 'advanced';
        default:
          return 'standard';
      }
    };

    const getAIAnalysisComment = () => {
      const score = correctPercentage.value; // 이미 0-100 점수
      if (score >= 90) {
        return "훌륭한 성과입니다! 모든 영역에서 뛰어난 실력을 보여주었네요.";
      } else if (score >= 70) {
        return "좋은 결과입니다. 몇 가지 부족한 부분을 보완하면 더욱 발전할 수 있어요.";
      } else if (score >= 50) {
        return "기본기는 갖추었지만 좀 더 연습이 필요해 보입니다.";
      } else {
        return "기초부터 차근차근 다시 학습해보세요. 포기하지 마세요!";
      }
    };

    // 이벤트 핸들러들
    const goBack = () => {
      router.back();
    };

    const closeReport = () => {
      // localStorage에서 임시 데이터 정리
      const examNo = route.params.examNo;
      if (examNo) {
        localStorage.removeItem(`examReport_${examNo}`);
      }

      if (window.opener) {
        window.close();
      } else {
        router.push({ name: "Exam" });
      }
    };

    const viewProblem = (epNo) => {
      alert(`문제 ${epNo} 상세보기 - 구현 예정`);
      // 문제 상세보기 모달 또는 페이지 이동
    };

    // 생명주기
    onMounted(async () => {
      loadTokenInfo();
      await loadReportData();
    });

    onUnmounted(() => {
      // 컴포넌트 해제 시 임시 데이터 정리 (선택사항)
      // localStorage에서 완전히 정리하고 싶다면 주석 해제
      // const examNo = route.params.examNo;
      // if (examNo) {
      //   localStorage.removeItem(`examReport_${examNo}`);
      // }
    });

    return {
      // 상태
      isLoading,
      error,
      reportData,
      tokenInfo,

      // 계산된 속성
      correctCount,
      totalCount,
      correctPercentage,
      totalSolvingTime,
      circumference,
      dashOffset,
      contentAreaAnalysis,

      // 메서드
      loadReportData,
      parseDurationToSeconds,
      formatDate,
      formatTime,
      formatTotalTime,
      getExamTypeText,
      getContentArea,
      getDifficultyText,
      getDifficultyClass,
      getAIAnalysisComment,
      goBack,
      closeReport,
      viewProblem,
    };
  },
};
</script>

<style scoped>
/* 전역 스타일 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.exam-report-page {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
  background: #fff9e6;
  min-height: 100vh;
  padding: 1rem;
}

.exam-report-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 페이지 헤더 */
.page-header {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(255, 152, 0, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.header-right {
  display: flex;
  gap: 1rem;
}

.header-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 로딩/에러 상태 */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
  color: #ff9800;
  font-size: 1.1rem;
  font-weight: 600;
}

.loading-spinner i {
  font-size: 3rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon i {
  font-size: 3rem;
  color: #e74c3c;
}

.retry-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #5dade2;
  transform: translateY(-2px);
}

/* 시험 정보 배너 */
.exam-info-banner {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(33, 150, 243, 0.3);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.exam-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.exam-subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

.exam-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.meta-item dt {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.meta-item dd {
  font-size: 1.1rem;
  font-weight: 700;
}

/* 결과 섹션 */
.result-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.result-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(255, 152, 0, 0.1);
  border: 3px solid #ffe066;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff9800;
  font-size: 1.2rem;
  font-weight: 700;
}

.score-summary, .time-summary {
  font-size: 0.9rem;
  color: #666;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

/* 점수 원형 그래프 */
.progress-circle {
  position: relative;
  width: 150px;
  height: 150px;
}

.circle-chart {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  font-size: 2rem;
  font-weight: 800;
  color: #ff9800;
}

/* 시간 시각화 */
.time-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #4caf50, #2e7d32);
  border-radius: 50%;
  color: white;
}

.clock-display i {
  font-size: 3rem;
}

.score-details, .time-details {
  flex: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  color: #666;
  font-weight: 600;
}

.value {
  font-weight: 700;
  color: #333;
}

.value.incorrect {
  color: #e74c3c;
}

.value.total-time {
  color: #ff9800;
  font-size: 1.1rem;
}

/* 상세 섹션 */
.detail-section, .analysis-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(255, 152, 0, 0.1);
  border: 3px solid #ffe066;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff9800;
  font-size: 1.3rem;
  font-weight: 800;
}

.legend {
  display: flex;
  gap: 2rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.correct-color {
  color: #4caf50;
}

.incorrect-color {
  color: #e74c3c;
}

/* 문제 테이블 */
.problems-table-wrapper {
  overflow-x: auto;
}

.problems-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 15px;
  overflow: hidden;
}

.problems-table th {
  background: #ff9800;
  color: white;
  padding: 1rem;
  text-align: center;
  font-weight: 700;
  border: none;
}

.problems-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.problems-table tr:hover {
  background: #f8f9fa;
}

.correct-row {
  background: rgba(76, 175, 80, 0.05);
}

.incorrect-row {
  background: rgba(231, 76, 60, 0.05);
}

.problem-btn, .result-btn {
  background: none;
  border: 2px solid #ff9800;
  color: #ff9800;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.problem-btn:hover, .result-btn:hover {
  background: #ff9800;
  color: white;
}

.result-btn i.correct {
  color: #4caf50;
  font-size: 1.2rem;
}

.result-btn i.incorrect {
  color: #e74c3c;
  font-size: 1.2rem;
}

.area-badge, .difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.area-badge {
  background: #e3f2fd;
  color: #1565c0;
}

.difficulty-badge.basic {
  background: #e8f5e8;
  color: #2e7d32;
}

.difficulty-badge.standard {
  background: #fff3e0;
  color: #f57c00;
}

.difficulty-badge.advanced {
  background: #ffebee;
  color: #c62828;
}

.answer-text {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: #f8f9fa;
}

.answer-text.correct {
  background: #e8f5e8;
  color: #2e7d32;
}

/* 분석 섹션 */
.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.ai-comment {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  padding: 2rem;
  border-radius: 20px;
}

.comment-icon {
  font-size: 2rem;
  color: #fff;
}

.comment-content h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.comment-content p {
  line-height: 1.6;
  opacity: 0.95;
}

.area-progress {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.area-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.area-name {
  font-weight: 700;
  color: #333;
}

.area-percentage {
  font-weight: 700;
  color: #ff9800;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #ff9800, #f57c00);
  border-radius: 6px;
  transition: width 1s ease;
}

/* 반응형 */
@media (max-width: 768px) {
  .exam-report-page {
    padding: 0.5rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .banner-content {
    flex-direction: column;
    text-align: center;
  }

  .result-section {
    grid-template-columns: 1fr;
  }

  .card-content {
    flex-direction: column;
    text-align: center;
  }

  .problems-table {
    font-size: 0.8rem;
  }

  .ai-comment {
    flex-direction: column;
    text-align: center;
  }
}
</style>