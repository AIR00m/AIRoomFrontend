<template>
  <div class="teacher-report-page">
    <div class="teacher-report-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">📊 학급 평가 리포트</h1>
        </div>
        <div class="header-right">
          <button class="header-btn export-btn" @click="exportReport">
            <i class="bi bi-download"></i>
            <span>리포트 내보내기</span>
          </button>
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
        <div class="loading-text">학급 평가 결과를 불러오는 중...</div>
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
                {{ reportData.examName || "학급 평가 리포트" }}
              </h2>
              <div class="exam-subtitle">
                {{ reportData.className || "학급" }} - {{ getExamTypeText() }}
              </div>
            </div>
            <div class="exam-meta">
              <div class="meta-item">
                <dt>응시자 수</dt>
                <dd>{{ reportData.totalStudents }}명</dd>
              </div>
              <div class="meta-item">
                <dt>평가일</dt>
                <dd>{{ formatDate(reportData.examDate) }}</dd>
              </div>
              <div class="meta-item">
                <dt>문제 수</dt>
                <dd>{{ reportData.totalProblems }}문제</dd>
              </div>
            </div>
          </div>
        </div>

        <!-- 학급 통계 섹션 -->
        <div class="statistics-section">
          <div class="stat-card">
            <div class="card-header">
              <h3><i class="bi bi-bar-chart-fill"></i> 학급 평균</h3>
            </div>
            <div class="card-content">
              <div class="stat-visual">
                <div class="score-circle">
                  <span class="score">{{
                    Math.round(classStatistics.averageScore)
                  }}</span>
                  <span class="unit">점</span>
                </div>
              </div>
              <div class="stat-details">
                <div class="detail-item">
                  <span class="label">최고점</span>
                  <span class="value">{{ classStatistics.maxScore }}점</span>
                </div>
                <div class="detail-item">
                  <span class="label">최저점</span>
                  <span class="value">{{ classStatistics.minScore }}점</span>
                </div>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="card-header">
              <h3><i class="bi bi-clock-fill"></i> 풀이 시간</h3>
            </div>
            <div class="card-content">
              <div class="stat-visual">
                <div class="time-circle">
                  <span class="time">{{
                    formatTime(classStatistics.averageTime)
                  }}</span>
                </div>
              </div>
              <div class="stat-details">
                <div class="detail-item">
                  <span class="label">최단 시간</span>
                  <span class="value">{{
                    formatTime(classStatistics.minTime)
                  }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">최장 시간</span>
                  <span class="value">{{
                    formatTime(classStatistics.maxTime)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="card-header">
              <h3><i class="bi bi-pie-chart-fill"></i> 점수 분포</h3>
            </div>
            <div class="card-content">
              <div class="grade-distribution">
                <div
                  v-for="grade in gradeDistribution"
                  :key="grade.range"
                  class="grade-item"
                >
                  <div class="grade-header">
                    <span class="grade-name">{{ grade.range }}</span>
                    <span class="grade-count">{{ grade.count }}명</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{
                        width: grade.percentage + '%',
                        backgroundColor: grade.color,
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 문항별 정답률 분석 -->
        <div class="problem-analysis-section">
          <div class="section-header">
            <h3><i class="bi bi-list-check"></i> 문항별 정답률</h3>
            <div class="analysis-summary">
              평균 정답률
              <strong
                >{{ Math.round(problemAnalysis.averageCorrectRate) }}%</strong
              >
            </div>
          </div>

          <div class="problems-chart">
            <div
              v-for="(problem, index) in problemAnalysis.problems"
              :key="problem.problemNo"
              class="problem-bar"
            >
              <div class="problem-info">
                <span class="problem-number">{{ index + 1 }}</span>
                <span class="problem-unit">{{ problem.unitTitle }}</span>
              </div>
              <div class="bar-container">
                <div
                  class="bar-fill"
                  :style="{
                    width: problem.correctRate + '%',
                    backgroundColor: getBarColor(problem.correctRate),
                  }"
                ></div>
                <span class="rate-text"
                  >{{ Math.round(problem.correctRate) }}%</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- 학생별 성적표 -->
        <div class="student-results-section">
          <div class="section-header">
            <h3><i class="bi bi-people-fill"></i> 학생별 성적</h3>
            <div class="view-controls">
              <button
                v-for="view in viewModes"
                :key="view.key"
                @click="currentViewMode = view.key"
                :class="['view-btn', { active: currentViewMode === view.key }]"
              >
                {{ view.label }}
              </button>
            </div>
          </div>

          <!-- 요약 보기 -->
          <div v-if="currentViewMode === 'summary'" class="summary-view">
            <div class="students-table-wrapper">
              <table class="students-table">
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>이름</th>
                    <th>점수</th>
                    <th>정답 수</th>
                    <th>소요 시간</th>
                    <th>상세</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(student, index) in sortedStudents"
                    :key="student.classroomStudentNo"
                    :class="getRankClass(index)"
                  >
                    <td class="rank-cell">
                      <span class="rank">{{ index + 1 }}</span>
                      <i v-if="index < 3" :class="getRankIcon(index)"></i>
                    </td>
                    <td class="name-cell">{{ student.studentName }}</td>
                    <td class="score-cell">
                      <span class="score">{{ student.score }}</span
                      >점
                    </td>
                    <td class="correct-cell">
                      {{ student.correctCount }}/{{ student.totalProblems }}
                    </td>
                    <td class="time-cell">
                      {{ formatTime(student.totalTime) }}
                    </td>
                    <td class="detail-cell">
                      <button
                        @click="viewStudentDetail(student)"
                        class="detail-btn"
                      >
                        상세 보기
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 상세 보기 -->
          <div v-else class="detailed-view">
            <div class="detailed-table-wrapper">
              <table class="detailed-table">
                <thead>
                  <tr>
                    <th rowspan="2">이름</th>
                    <th rowspan="2">점수</th>
                    <th
                      v-for="n in reportData.totalProblems"
                      :key="n"
                      class="problem-header"
                    >
                      {{ n }}
                    </th>
                    <th rowspan="2">소요시간</th>
                  </tr>
                  <tr>
                    <th
                      v-for="problem in problemAnalysis.problems"
                      :key="problem.problemNo"
                      class="unit-header"
                    >
                      {{ problem.unitTitle }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="student in sortedStudents"
                    :key="student.classroomStudentNo"
                  >
                    <td class="student-name">{{ student.studentName }}</td>
                    <td class="student-score">{{ student.score }}점</td>
                    <td
                      v-for="(answer, index) in student.answers"
                      :key="index"
                      :class="[
                        'answer-cell',
                        answer.isCorrect ? 'correct' : 'incorrect',
                      ]"
                    >
                      <i
                        :class="
                          answer.isCorrect
                            ? 'bi bi-check-circle-fill'
                            : 'bi bi-x-circle-fill'
                        "
                      ></i>
                    </td>
                    <td class="student-time">
                      {{ formatTime(student.totalTime) }}
                    </td>
                  </tr>
                </tbody>
              </table>
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

export default {
  name: "TeacherExamReport",
  setup() {
    const route = useRoute();
    const router = useRouter();

    // 기본 상태
    const isLoading = ref(true);
    const error = ref(null);
    const reportData = ref({
      examName: "",
      className: "",
      examDate: new Date(),
      totalStudents: 0,
      totalProblems: 0,
      students: [],
    });
    const currentViewMode = ref("summary");
    const tokenInfo = ref(null);

    // 보기 모드
    const viewModes = [
      { key: "summary", label: "요약" },
      { key: "detailed", label: "상세" },
    ];

    // Duration 문자열을 초 단위로 변환하는 함수
    const parseDurationToSeconds = (durationStr) => {
      if (!durationStr) return 0;

      try {
        if (typeof durationStr === "string" && durationStr.startsWith("PT")) {
          const matches = durationStr.match(
            /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/
          );
          if (matches) {
            const hours = parseInt(matches[1] || "0");
            const minutes = parseInt(matches[2] || "0");
            const seconds = parseFloat(matches[3] || "0");
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;

            return Math.round(totalSeconds / 1000);
          }
        }

        if (typeof durationStr === "number") {
          return durationStr;
        }

        return 0;
      } catch (err) {
        console.warn("Duration 파싱 실패:", durationStr, err);
        return 0;
      }
    };

    // 학급 통계 계산
    const classStatistics = computed(() => {
      const students = reportData.value.students;
      if (!students || students.length === 0) {
        return {
          averageScore: 0,
          maxScore: 0,
          minScore: 0,
          averageTime: 0,
          maxTime: 0,
          minTime: 0,
        };
      }

      const scores = students.map((s) => s.score);
      const times = students.map((s) => s.totalTime);

      return {
        averageScore:
          scores.reduce((sum, score) => sum + score, 0) / scores.length,
        maxScore: Math.max(...scores),
        minScore: Math.min(...scores),
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
        maxTime: Math.max(...times),
        minTime: Math.min(...times),
      };
    });

    // 점수 분포 계산
    const gradeDistribution = computed(() => {
      const students = reportData.value.students;
      if (!students || students.length === 0) return [];

      const ranges = [
        { range: "90-100점", min: 90, max: 100, color: "#4caf50", count: 0 },
        { range: "80-89점", min: 80, max: 89, color: "#8bc34a", count: 0 },
        { range: "70-79점", min: 70, max: 79, color: "#ffc107", count: 0 },
        { range: "60-69점", min: 60, max: 69, color: "#ff9800", count: 0 },
        { range: "60점 미만", min: 0, max: 59, color: "#f44336", count: 0 },
      ];

      students.forEach((student) => {
        const range = ranges.find(
          (r) => student.score >= r.min && student.score <= r.max
        );
        if (range) range.count++;
      });

      return ranges.map((range) => ({
        ...range,
        percentage: (range.count / students.length) * 100,
      }));
    });

    // 문항별 분석 계산
    const problemAnalysis = computed(() => {
      const students = reportData.value.students;
      if (!students || students.length === 0) {
        return { problems: [], averageCorrectRate: 0 };
      }

      const totalProblems = reportData.value.totalProblems;
      const problems = [];

      for (let i = 0; i < totalProblems; i++) {
        let correctCount = 0;
        let unitTitle = "수학";

        students.forEach((student) => {
          if (student.answers && student.answers[i]) {
            if (student.answers[i].isCorrect) {
              correctCount++;
            }
            unitTitle = student.answers[i].unitTitle || "수학";
          }
        });

        problems.push({
          problemNo: i + 1,
          unitTitle,
          correctCount,
          correctRate: (correctCount / students.length) * 100,
        });
      }

      const averageCorrectRate =
        problems.reduce((sum, p) => sum + p.correctRate, 0) / problems.length;

      return { problems, averageCorrectRate };
    });

    // 점수 순으로 정렬된 학생 목록
    const sortedStudents = computed(() => {
      return [...reportData.value.students].sort((a, b) => b.score - a.score);
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

    // 리포트 데이터 로드 - API 호출
    const loadReportData = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const examNo = route.params.examNo;
        const classroomNo =
          route.params.classroomNo || tokenInfo.value?.classroomNo;

        if (!examNo) {
          throw new Error("시험 번호를 찾을 수 없습니다.");
        }

        if (!classroomNo) {
          throw new Error("교실 정보를 찾을 수 없습니다.");
        }

        console.log("📊 교사 리포트 데이터 로드 시작:", {
          examNo,
          classroomNo,
        });

        const response = await apiClient.get(
          `/exam/answer/classroom/${classroomNo}/${examNo}`
        );

        // API 응답은 List<StudentAnswerByClassroomResponse> 형태
        const classroomAnswers = response;

        if (!Array.isArray(classroomAnswers) || classroomAnswers.length === 0) {
          throw new Error("학급 시험 결과 데이터를 찾을 수 없습니다.");
        }

        // StudentAnswerByClassroomResponse를 내부 형식으로 변환
        const students = classroomAnswers.map((studentData) => {
          const answers = studentData.studentAnswerResponseList.map(
            (answer) => ({
              isCorrect: answer.isCorrect,
              unitTitle: answer.unitTitle,
              selectedAnswer: answer.saAnswer,
              correctAnswer: answer.correctAnswer,
              solvingTime: parseDurationToSeconds(answer.saSolvingTime),
            })
          );

          // 정답 수와 총 시간 계산
          const correctCount = answers.filter((a) => a.isCorrect).length;
          const totalTime = answers.reduce(
            (sum, a) => sum + (a.solvingTime || 0),
            0
          );
          const score = Math.round((correctCount / answers.length) * 100);

          return {
            classroomStudentNo: studentData.classroomStudentNo,
            studentName: studentData.classroomStudentName,
            answers,
            correctCount,
            totalProblems: answers.length,
            totalTime,
            score,
          };
        });

        reportData.value = {
          examNo: examNo,
          examName: `평가 ${examNo}`,
          className: tokenInfo.value?.className || "우리 학급",
          examDate: new Date(),
          totalStudents: students.length,
          totalProblems: students.length > 0 ? students[0].totalProblems : 0,
          students,
        };

        console.log("✅ 교사 리포트 데이터 로드 완료:", reportData.value);
      } catch (err) {
        console.error("🚨 교사 리포트 데이터 로드 실패:", err);

        if (err.response) {
          const status = err.response.status;
          const message = err.response.data?.message;

          if (status === 404) {
            error.value = "시험 결과를 찾을 수 없습니다.";
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

    const getExamTypeText = () => {
      return "단원 평가";
    };

    const getBarColor = (rate) => {
      if (rate >= 80) return "#4caf50";
      if (rate >= 60) return "#ff9800";
      return "#f44336";
    };

    const getRankClass = (index) => {
      if (index === 0) return "rank-first";
      if (index === 1) return "rank-second";
      if (index === 2) return "rank-third";
      return "";
    };

    const getRankIcon = (index) => {
      const icons = [
        "bi bi-award-fill gold",
        "bi bi-award-fill silver",
        "bi bi-award-fill bronze",
      ];
      return icons[index] || "";
    };

    // 이벤트 핸들러들
    const closeReport = () => {
      if (window.opener) {
        window.close();
      } else {
        router.push({ name: "Exam" });
      }
    };

    const exportReport = () => {
      alert("리포트 내보내기 기능 - 구현 예정");
      // 실제로는 PDF나 Excel 형태로 내보내기
    };

    const viewStudentDetail = (student) => {
      // 학생 개별 상세 리포트 모달 또는 페이지 이동
      router.push({
        name: "ExamReport",
        params: {
          examNo: reportData.value.examNo,
          classroomStudentNo: student.classroomStudentNo,
          classroomStudentName: student.studentName,
        },
      });
    };

    // 생명주기
    onMounted(async () => {
      loadTokenInfo();
      await loadReportData();
    });

    return {
      // 상태
      isLoading,
      error,
      reportData,
      currentViewMode,
      viewModes,
      tokenInfo,

      // 계산된 속성
      classStatistics,
      gradeDistribution,
      problemAnalysis,
      sortedStudents,

      // 메서드
      loadReportData,
      formatDate,
      formatTime,
      getExamTypeText,
      getBarColor,
      getRankClass,
      getRankIcon,
      closeReport,
      exportReport,
      viewStudentDetail,
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

.teacher-report-page {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #f8f9fa;
  min-height: 100vh;
  padding: 1rem;
}

.teacher-report-container {
  max-width: 1600px;
  margin: 0 auto;
}

/* 페이지 헤더 */
.page-header {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
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
  color: #6366f1;
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
  background: linear-gradient(135deg, #10b981, #047857);
  color: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
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

/* 통계 섹션 */
.statistics-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #e9ecef;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6366f1;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.score-circle,
.time-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  text-align: center;
}

.score,
.time {
  font-size: 1.5rem;
  font-weight: 800;
}

.unit {
  font-size: 0.8rem;
  opacity: 0.9;
}

.stat-details {
  flex: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
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

/* 점수 분포 */
.grade-distribution {
  width: 100%;
}

.grade-item {
  margin-bottom: 1rem;
}

.grade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.grade-name {
  font-weight: 700;
  color: #333;
}

.grade-count {
  font-weight: 700;
  color: #666;
}

.progress-bar {
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 1s ease;
}

/* 문항별 분석 */
.problem-analysis-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #e9ecef;
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
  color: #6366f1;
  font-size: 1.3rem;
  font-weight: 800;
}

.analysis-summary {
  font-size: 0.9rem;
  color: #666;
}

.problems-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.problem-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.problem-info {
  display: flex;
  flex-direction: column;
  width: 120px;
  text-align: center;
}

.problem-number {
  font-weight: 700;
  color: #6366f1;
}

.problem-unit {
  font-size: 0.8rem;
  color: #666;
}

.bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.bar-fill {
  height: 30px;
  border-radius: 15px;
  transition: width 1s ease;
}

.rate-text {
  font-weight: 700;
  color: #333;
  min-width: 50px;
}

/* 학생별 성적 */
.student-results-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid #e9ecef;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  color: #666;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: #e9ecef;
}

.view-btn.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

/* 요약 테이블 */
.students-table-wrapper {
  overflow-x: auto;
  margin-top: 2rem;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 15px;
  overflow: hidden;
}

.students-table th {
  background: #6366f1;
  color: white;
  padding: 1rem;
  text-align: center;
  font-weight: 700;
  border: none;
}

.students-table td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.students-table tr:hover {
  background: #f8f9fa;
}

.rank-first {
  background: rgba(255, 215, 0, 0.1);
}

.rank-second {
  background: rgba(192, 192, 192, 0.1);
}

.rank-third {
  background: rgba(205, 127, 50, 0.1);
}

.rank-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.rank {
  font-weight: 700;
  color: #6366f1;
}

.gold {
  color: #ffd700;
}
.silver {
  color: #c0c0c0;
}
.bronze {
  color: #cd7f32;
}

.score-cell .score {
  font-weight: 800;
  color: #6366f1;
  font-size: 1.1rem;
}

.detail-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.detail-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* 상세 테이블 */
.detailed-table-wrapper {
  overflow-x: auto;
  margin-top: 2rem;
}

.detailed-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 15px;
  overflow: hidden;
  font-size: 0.9rem;
}

.detailed-table th {
  background: #6366f1;
  color: white;
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-weight: 700;
  border: none;
}

.problem-header {
  font-size: 0.8rem;
}

.unit-header {
  font-size: 0.7rem;
  opacity: 0.8;
}

.detailed-table td {
  padding: 0.75rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.student-name {
  font-weight: 700;
  background: #f8f9fa;
}

.student-score {
  font-weight: 700;
  color: #6366f1;
}

.answer-cell {
  font-size: 1.2rem;
}

.answer-cell.correct {
  color: #4caf50;
}

.answer-cell.incorrect {
  color: #f44336;
}

/* 반응형 */
@media (max-width: 1200px) {
  .statistics-section {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .teacher-report-page {
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

  .statistics-section {
    grid-template-columns: 1fr;
  }

  .card-content {
    flex-direction: column;
    text-align: center;
  }

  .problem-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .students-table,
  .detailed-table {
    font-size: 0.8rem;
  }
}
</style>
