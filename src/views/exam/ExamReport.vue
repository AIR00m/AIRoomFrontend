<template>
  <div class="exam-report-page">
    <div class="exam-report-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="header-left">
          <button
            v-if="tokenInfo && tokenInfo.role === 'teacher'"
            class="header-btn back-btn"
            @click="goBack"
          >
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
              <h2 class="exam-title">
                {{ reportData.examName || "시험 리포트" }}
              </h2>
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
                정답률 <strong>{{ correctPercentage }}</strong
                >%
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
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stop-color="#1D6FF7" />
                        <stop offset="60%" stop-color="#5158F8" />
                        <stop offset="100%" stop-color="#6650F9" />
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
                  <span class="value incorrect"
                    >{{ totalCount - correctCount }}문제</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="result-card time-card">
            <div class="card-header">
              <h3><i class="bi bi-clock-fill"></i> 풀이 시간</h3>
              <div class="time-summary">
                학급 평균
                <strong>{{ formatTime(reportData.classAvgTime || 0) }}</strong>
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
                  <span class="value">{{
                    formatTime(Math.round(totalSolvingTime / totalCount))
                  }}</span>
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
                  <th>단원</th>
                  <th>나의 답안</th>
                  <th>정답</th>
                  <th>풀이 시간</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(problem, index) in reportData.problems"
                  :key="problem.saNo"
                  :class="{
                    'correct-row': problem.isCorrect,
                    'incorrect-row': !problem.isCorrect,
                  }"
                >
                  <td class="problem-number">
                    <button
                      @click="viewProblem(problem.epNo)"
                      class="problem-btn"
                    >
                      {{ problem.questionOrder || index + 1 }}
                    </button>
                  </td>
                  <td class="result-cell">
                    <button class="result-btn">
                      <i
                        :class="
                          problem.isCorrect
                            ? 'bi bi-check-circle-fill correct'
                            : 'bi bi-x-circle-fill incorrect'
                        "
                      ></i>
                    </button>
                  </td>
                  <td class="content-area">
                    <span class="area-badge">{{
                      problem.unitTitle || "수학"
                    }}</span>
                  </td>
                  <td class="student-answer">
                    <span class="answer-text">{{
                      problem.selectedAnswer || "미응답"
                    }}</span>
                  </td>
                  <td class="correct-answer">
                    <span class="answer-text correct">{{
                      problem.correctAnswer
                    }}</span>
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
                <i class="bi bi-lightbulb"></i>
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

  <!-- 문제 상세보기 모달 -->
  <div v-if="showProblemModal" class="modal-overlay" @click="closeProblemModal">
    <div class="problem-modal" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="bi bi-card-text"></i>
          문제 {{ currentProblemDetail?.questionOrder }}번 상세보기
        </h3>
        <button class="modal-close-btn" @click="closeProblemModal">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- 로딩 상태 -->
        <div v-if="isLoadingProblem" class="modal-loading">
          <i class="bi bi-arrow-clockwise"></i>
          <span>문제를 불러오는 중...</span>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="problemError" class="modal-error">
          <i class="bi bi-exclamation-triangle"></i>
          <span>{{ problemError }}</span>
        </div>

        <!-- 문제 내용 -->
        <div v-else-if="currentProblemDetail" class="problem-content">
          <!-- 문제 정보 헤더 -->
          <div class="problem-info-header">
            <div class="problem-meta">
              <span class="problem-unit">{{
                currentProblemDetail.unitTitle
              }}</span>
              <span
                :class="[
                  'problem-level',
                  `level-${currentProblemDetail.level}`,
                ]"
              >
                {{ currentProblemDetail.level }}
              </span>
              <span
                :class="[
                  'result-badge',
                  currentProblemDetail.isCorrect ? 'correct' : 'incorrect',
                ]"
              >
                <i
                  :class="
                    currentProblemDetail.isCorrect
                      ? 'bi bi-check-circle'
                      : 'bi bi-x-circle'
                  "
                ></i>
                {{ currentProblemDetail.isCorrect ? "정답" : "오답" }}
              </span>
            </div>
            <div class="solving-time">
              <i class="bi bi-clock"></i>
              풀이시간: {{ formatTime(currentProblemDetail.solvingTime) }}
            </div>
          </div>

          <!-- 문제 이미지와 텍스트 -->
          <div class="problem-display-area">
            <div
              v-if="currentProblemDetail.imageUrl"
              class="problem-image-section"
            >
              <img
                :src="getImageUrl(currentProblemDetail.imageUrl)"
                :alt="`문제 ${currentProblemDetail.questionOrder}`"
                class="problem-image"
                @error="onImageError"
              />
            </div>

            <div class="problem-text-section">
              <h4 class="problem-question">
                {{ currentProblemDetail.question }}
              </h4>
              <p
                v-if="currentProblemDetail.paragraph"
                class="problem-paragraph"
              >
                {{ currentProblemDetail.paragraph }}
              </p>
            </div>
          </div>

          <!-- 선택지 및 답안 -->
          <div class="answer-section">
            <h5>선택지 및 답안</h5>
            <div class="choices-list">
              <div
                v-for="choice in currentProblemDetail.choices"
                :key="choice.number"
                :class="[
                  'choice-item',
                  {
                    'student-choice':
                      choice.number === currentProblemDetail.selectedAnswer,
                    'correct-answer':
                      choice.number === currentProblemDetail.correctAnswer,
                    'wrong-choice':
                      choice.number === currentProblemDetail.selectedAnswer &&
                      choice.number !== currentProblemDetail.correctAnswer,
                  },
                ]"
              >
                <span class="choice-number">{{ choice.number }}</span>
                <span class="choice-text">{{ choice.text }}</span>
                <div class="choice-indicators">
                  <span
                    v-if="choice.number === currentProblemDetail.selectedAnswer"
                    class="indicator student-indicator"
                  >
                    <i class="bi bi-person"></i> 내 답안
                  </span>
                  <span
                    v-if="choice.number === currentProblemDetail.correctAnswer"
                    class="indicator correct-indicator"
                  >
                    <i class="bi bi-check-circle"></i> 정답
                  </span>
                </div>
              </div>
            </div>

            <!-- 답안 요약 -->
            <div class="answer-summary">
              <div class="summary-row">
                <span class="label">내 답안:</span>
                <span
                  :class="[
                    'value',
                    currentProblemDetail.isCorrect ? 'correct' : 'incorrect',
                  ]"
                >
                  {{ currentProblemDetail.selectedAnswer || "미응답" }}
                </span>
              </div>
              <div class="summary-row">
                <span class="label">정답:</span>
                <span class="value correct">{{
                  currentProblemDetail.correctAnswer
                }}</span>
              </div>
            </div>
          </div>

          <!-- 해설 -->
          <div v-if="currentProblemDetail.comment" class="explanation-section">
            <h5>
              <i class="bi bi-lightbulb"></i>
              해설
            </h5>
            <div class="explanation-text">
              {{ currentProblemDetail.comment }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/utils/apiClient";
import ExamProblem from "./ExamProblem.vue";

export default {
  name: "ExamReport",
  setup() {
    const route = useRoute();
    const router = useRouter();

    // 기본 상태
    const isLoading = ref(true);
    const error = ref(null);
    const reportData = ref({
      examName: "",
      studentName: "",
      examDate: new Date(),
      problems: [],
      totalSolvingTime: 0,
      seScore: 0,
      classAvgTime: 0,
    });
    const tokenInfo = ref(null);

    // 계산된 속성
    const correctCount = computed(() => {
      return reportData.value.problems
        ? reportData.value.problems.filter((p) => p.isCorrect).length
        : 0;
    });

    const totalCount = computed(() => {
      return reportData.value.problems ? reportData.value.problems.length : 0;
    });

    const correctPercentage = computed(() => {
      if (totalCount.value === 0) return 0;
      return Math.round((correctCount.value / totalCount.value) * 100);
    });

    const totalSolvingTime = computed(() => {
      if (!reportData.value.problems) return 0;
      return reportData.value.problems.reduce((total, problem) => {
        return total + (problem.saSolvingTime || 0);
      }, 0);
    });

    // 원형 그래프 관련
    const circumference = computed(() => 2 * Math.PI * 80);
    const dashOffset = computed(() => {
      const percentage = correctPercentage.value;
      return circumference.value - (percentage / 100) * circumference.value;
    });

    // 내용 영역별 분석
    const contentAreaAnalysis = computed(() => {
      if (!reportData.value.problems) return [];

      const areas = {};
      reportData.value.problems.forEach((problem) => {
        const areaName = problem.unitTitle || "수학";
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
        percentage: Math.round((data.correct / data.total) * 100),
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

    // Duration 문자열을 초 단위로 변환하는 함수
    const parseDurationToSeconds = (durationStr) => {
      if (!durationStr) return 0;

      try {
        // Duration 문자열 파싱 (예: "PT1M30S" -> 90초)
        if (typeof durationStr === "string" && durationStr.startsWith("PT")) {
          const matches = durationStr.match(
            /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/
          );
          if (matches) {
            const hours = parseInt(matches[1] || "0");
            const minutes = parseInt(matches[2] || "0");
            const seconds = parseFloat(matches[3] || "0");
            return Math.round(hours * 3600 + minutes * 60 + seconds);
          }
        }

        // 숫자인 경우 그대로 반환
        if (typeof durationStr === "number") {
          return durationStr;
        }

        return 0;
      } catch (err) {
        console.warn("Duration 파싱 실패:", durationStr, err);
        return 0;
      }
    };

    // 리포트 데이터 로드 - API 호출로 변경
    const loadReportData = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const examNo = route.params.examNo;
        const classroomStudentNo =
          route.params.classroomStudentNo ||
          tokenInfo.value?.classroomStudentNo;

        if (!examNo) {
          throw new Error("시험 번호를 찾을 수 없습니다.");
        }

        if (!classroomStudentNo) {
          throw new Error("학생 정보를 찾을 수 없습니다.");
        }

        console.log("📊 리포트 데이터 로드 시작:", {
          examNo,
          classroomStudentNo,
        });

        // API 호출: /answer/student/{classroomStudentNo}/{examNo}
        const response = await apiClient.get(
          `/exam/answer/student/${classroomStudentNo}/${examNo}`
        );

        // API 응답은 List<StudentAnswerResponse> 형태
        const studentAnswers = response;

        if (!Array.isArray(studentAnswers) || studentAnswers.length === 0) {
          throw new Error("시험 결과 데이터를 찾을 수 없습니다.");
        }

        // StudentAnswerResponse를 ExamReport 형식으로 변환
        const problems = studentAnswers.map((answer, index) => ({
          saNo: answer.saNo || `${answer.cepNo}_${answer.epNo}`,
          epNo: answer.epNo,
          cepNo: answer.cepNo,
          questionOrder: answer.cepQuestionOrder || index + 1,
          isCorrect: answer.isCorrect,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: answer.correctAnswer,
          saSolvingTime: parseDurationToSeconds(answer.saSolvingTime),
          unitTitle: answer.unitTitle,
        }));

        // 문제를 순서대로 정렬
        problems.sort((a, b) => a.questionOrder - b.questionOrder);

        // 총 점수 계산 (정답 개수 기준)
        const score = Math.round(
          (problems.filter((p) => p.isCorrect).length / problems.length) * 100
        );

        reportData.value = {
          examNo: examNo,
          examName: `평가 ${examNo}`, // API에서 시험명을 받아오지 못하는 경우 기본값
          studentName:
            route.params.classroomStudentName ||
            tokenInfo.value?.memberName ||
            "학생",
          examDate: new Date(),
          seScore: score,
          totalSolvingTime: problems.reduce(
            (total, p) => total + (p.saSolvingTime || 0),
            0
          ),
          classAvgTime: 60, // 임시값 (실제로는 별도 API에서 가져와야 함)
          problems: problems,
        };

        console.log("✅ 리포트 데이터 로드 완료:", reportData.value);
      } catch (err) {
        console.error("🚨 리포트 데이터 로드 실패:", err);

        // 에러 타입에 따른 상세 메시지
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data?.message;

          if (status === 404) {
            error.value =
              "시험 결과를 찾을 수 없습니다. 시험을 완료했는지 확인해주세요.";
          } else if (status === 403) {
            error.value = "시험 결과에 접근할 권한이 없습니다.";
          } else {
            error.value = message || `서버 오류가 발생했습니다. (${status})`;
          }
        } else if (err.request) {
          error.value = "네트워크 연결을 확인해주세요.";
        } else {
          error.value =
            err.message || "리포트 데이터를 불러오는데 실패했습니다.";
        }
      } finally {
        isLoading.value = false;
      }
    };

    // 유틸리티 함수들
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("ko-KR", {
        month: "numeric",
        day: "numeric",
      });
    };

    const formatTime = (seconds) => {
      if (seconds <= 0) return "00:00";
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
      )}`;
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

    const getAIAnalysisComment = () => {
      const score = correctPercentage.value;
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

    // S3 URL을 Public URL로 변환하는 함수
    const getImageUrl = (imageUrl) => {
      if (!imageUrl || imageUrl.trim() === "") {
        console.log("이미지 URL이 없어서 기본 이미지 사용");
        return "/images/default-textbook.png";
      }

      // 이미 완전한 HTTP URL인 경우 그대로 사용
      if (imageUrl.startsWith("http")) {
        return imageUrl;
      }

      if (imageUrl.startsWith("s3://airoom/")) {
        const path = imageUrl.replace("s3://airoom/exam_problem_image/", "");
        return `https://airoom.s3.ap-northeast-2.amazonaws.com/EXAM_PROBLEM_IMAGE/${path}`;
      }

      console.warn("예상하지 못한 이미지 URL 형식:", imageUrl);
      return "/images/default-textbook.png";
    };

    const onImageError = () => {
      console.error(
        `문제 ${currentProblem.value} 이미지 로드 실패:`,
        currentProblemData.value?.imageUrl
      );
    };

    // 이벤트 핸들러들
    const goBack = () => {
      router.back();
    };

    const closeReport = () => {
      if (window.opener) {
        window.close();
      } else {
        router.push({ name: "Exam" });
      }
    };

    // 문제 상세보기 관련 상태
    const showProblemModal = ref(false);
    const currentProblemDetail = ref(null);
    const isLoadingProblem = ref(false);
    const problemError = ref(null);

    // 문제 상세보기
    const viewProblem = async (epNo) => {
      try {
        isLoadingProblem.value = true;
        problemError.value = null;
        showProblemModal.value = true;

        console.log("문제 상세보기 로드:", epNo);

        // API 호출하여 전체 문제 목록 가져오기
        const response = await apiClient.get(
          `/exam/exam-problems/${reportData.value.examNo}`
        );

        const ExamProblemData = response;

        if (ExamProblemData && ExamProblemData.examProblemDetailResponseList) {
          // epNo로 해당 문제 찾기
          const problem = ExamProblemData.examProblemDetailResponseList.find(
            (p) => p.epNo === epNo
          );

          if (!problem) {
            throw new Error("해당 문제를 찾을 수 없습니다.");
          }

          // 현재 리포트에서 해당 문제의 학생 답안 찾기
          const studentAnswer = reportData.value.problems.find(
            (p) => p.epNo === epNo
          );

          // 선택지 파싱
          let choices = [];
          try {
            if (problem.epExample) {
              const exampleObj =
                typeof problem.epExample === "string"
                  ? JSON.parse(problem.epExample)
                  : problem.epExample;

              choices = Object.entries(exampleObj).map(([key, value]) => ({
                number: key,
                text: value,
              }));
            }
          } catch (parseError) {
            console.error("선택지 파싱 오류:", parseError);
            choices = [];
          }

          currentProblemDetail.value = {
            epNo: problem.epNo,
            questionOrder: problem.questionOrder,
            question: problem.epQuestion,
            paragraph: problem.epParagraph,
            imageUrl: problem.epImageUrl,
            level: problem.epLevel,
            choices: choices,
            correctAnswer: problem.epAnswer,
            comment: problem.epComment,
            selectedAnswer: studentAnswer?.selectedAnswer || "",
            isCorrect: studentAnswer?.isCorrect || false,
            solvingTime: studentAnswer?.saSolvingTime || 0,
            unitTitle: studentAnswer?.unitTitle || "수학",
          };

          console.log("문제 상세 데이터:", currentProblemDetail.value);
        } else {
          throw new Error("문제 데이터를 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error("문제 상세보기 로드 실패:", err);
        problemError.value = err.message || "문제를 불러올 수 없습니다.";
      } finally {
        isLoadingProblem.value = false;
      }
    };

    // 모달 닫기
    const closeProblemModal = () => {
      showProblemModal.value = false;
      currentProblemDetail.value = null;
      problemError.value = null;
    };

    // 생명주기
    onMounted(async () => {
      const tokenInfoStr = localStorage.getItem("tokenInfo");
      const tokenInfo = JSON.parse(tokenInfoStr);
      loadTokenInfo();
      await loadReportData();
    });

    return {
      // 상태
      isLoading,
      error,
      reportData,
      tokenInfo,
      showProblemModal,
      currentProblemDetail,
      isLoadingProblem,
      problemError,

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
      formatDate,
      formatTime,
      formatTotalTime,
      getExamTypeText,
      getAIAnalysisComment,
      closeReport,
      viewProblem,
      closeProblemModal,
      getImageUrl,
      onImageError,
      goBack,
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
.loading-state,
.error-state {
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

.score-summary,
.time-summary {
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

.score-details,
.time-details {
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
.detail-section,
.analysis-section {
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

.problem-btn,
.result-btn {
  background: none;
  border: 2px solid #ff9800;
  color: #ff9800;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.problem-btn:hover {
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

.area-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #e3f2fd;
  color: #1565c0;
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

/* 문제 상세보기 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  overflow-y: auto;
  padding: 1rem;
}

.problem-modal {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 3px solid #ff9800;
}

.problem-modal::-webkit-scrollbar {
  width: 15px;
}

.problem-modal::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.problem-modal::-webkit-scrollbar-track {
  background: transparent;
}

.modal-header {
  background: #ff9800;
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 17px 17px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.3rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 2rem;
}

.modal-loading,
.modal-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #ff9800;
  font-size: 1.1rem;
  font-weight: 600;
}

.modal-loading i {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

.modal-error {
  color: #e74c3c;
}

/* 문제 내용 */
.problem-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.problem-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 15px;
  border-left: 5px solid #ff9800;
}

.problem-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.problem-unit {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.problem-level {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.level-하 {
  background: #e8f5e8;
  color: #2e7d32;
}

.level-중 {
  background: #fff3e0;
  color: #f57c00;
}

.level-상 {
  background: #ffebee;
  color: #c62828;
}

.result-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.result-badge.correct {
  background: #e8f5e8;
  color: #2e7d32;
}

.result-badge.incorrect {
  background: #ffebee;
  color: #c62828;
}

.solving-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  font-weight: 600;
}

/* 문제 표시 영역 */
.problem-display-area {
  display: flex;
  gap: 2rem;
  background: white;
  border-radius: 15px;
  border: 2px solid #e9ecef;
  overflow: hidden;
}

.problem-image-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 2rem;
}

.problem-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.problem-text-section {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.problem-question {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.problem-paragraph {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

/* 답안 섹션 */
.answer-section {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 15px;
  border: 2px solid #e9ecef;
}

.answer-section h5 {
  color: #ff9800;
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border: 2px solid #e9ecef;
  border-radius: 15px;
  background: white;
  transition: all 0.3s ease;
}

.choice-item.correct-answer {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.choice-item.wrong-choice {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.choice-item.student-choice:not(.wrong-choice) {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.1);
}

.choice-number {
  min-width: 32px;
  height: 32px;
  background: #6c757d;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
}

.choice-item.correct-answer .choice-number {
  background: #4caf50;
}

.choice-item.wrong-choice .choice-number {
  background: #f44336;
}

.choice-item.student-choice:not(.wrong-choice) .choice-number {
  background: #2196f3;
}

.choice-text {
  flex: 1;
  font-size: 1rem;
  line-height: 1.4;
  color: #333;
}

.choice-indicators {
  display: flex;
  gap: 0.5rem;
}

.indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.student-indicator {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.correct-indicator {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.answer-summary {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #e9ecef;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row .label {
  font-weight: 600;
  color: #666;
}

.summary-row .value {
  font-weight: 700;
  font-size: 1.1rem;
}

.summary-row .value.correct {
  color: #4caf50;
}

.summary-row .value.incorrect {
  color: #f44336;
}

/* 해설 섹션 */
.explanation-section {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  padding: 2rem;
  border-radius: 15px;
}

.explanation-section h5 {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.explanation-text {
  font-size: 1rem;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 10px;
  border-left: 4px solid rgba(255, 255, 255, 0.3);
}

/* 모달 모바일 반응형 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .problem-modal {
    max-height: 95vh;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .problem-display-area {
    flex-direction: column;
    gap: 0;
  }

  .problem-image-section {
    padding: 1.5rem;
  }

  .problem-text-section {
    padding: 1.5rem;
  }

  .problem-info-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .choice-item {
    padding: 1rem;
  }

  .choice-indicators {
    flex-wrap: wrap;
  }
}
</style>
