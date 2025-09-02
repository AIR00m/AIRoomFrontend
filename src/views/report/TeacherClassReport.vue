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
          <h1 class="page-title">🏫 우리 반 학습 관리 ✨</h1>
          <p class="page-subtitle">
            우리 반 학생들의 학습 여정을 한눈에 확인하고 맞춤 지도해보세요!
          </p>
          <nav class="cute-breadcrumb">
            <span>홈</span>
            <span class="separator">></span>
            <span>학습 리포트</span>
            <span class="separator">></span>
            <span class="current">학습 현황 관리</span>
          </nav>
        </div>
      </div>

      <!-- 로딩 오버레이 -->
      <Spinner :is-loading="isLoading" v-if="isLoading" class="loading-container"
        :loading-text="'우리 반 학습 데이터를 분석하는 중...'" />

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <span class="error-icon">⚠️</span>
          <p>{{ error }}</p>
          <button @click="loadData" class="retry-btn">다시 시도</button>
        </div>
      </div>

      <!-- 메인 컨텐츠 -->
      <div v-else>
        <!-- 안내 상자 -->
        <div class="notice-box">
          <span class="notice-icon">💡</span>
          <ul class="notice-list">
            <li>학생별 학습 진도와 점수를 한눈에 확인할 수 있어요.</li>
            <li>
              수준별 필터링으로 맞춤형 지도가 필요한 학생을 쉽게 찾아보세요!
            </li>
            <li>개별 학생과의 대화를 통해 학습 동기를 높여주세요.</li>
          </ul>
        </div>

        <!-- 분석 컨텐츠 -->
        <div class="analysis-content">
          <!-- 필터 및 통계 섹션 -->
          <div class="stats-section">
            <div class="section-title">📊 학급 현황 요약</div>
            <div class="stats-grid">
              <div class="stat-card total">
                <div class="stat-icon">👥</div>
                <div class="stat-value">{{ totalStudents }}</div>
                <div class="stat-label">전체 학생</div>
              </div>
              <div class="stat-card fast">
                <div class="stat-icon">⚡</div>
                <div class="stat-value">{{ fastStudents }}</div>
                <div class="stat-label">빠름</div>
              </div>
              <div class="stat-card normal">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value">{{ normalStudents }}</div>
                <div class="stat-label">보통</div>
              </div>
              <div class="stat-card slow">
                <div class="stat-icon">🐌</div>
                <div class="stat-value">{{ slowStudents }}</div>
                <div class="stat-label">느린</div>
              </div>
              <div class="stat-card anomaly">
                <div class="stat-icon">🚨</div>
                <div class="stat-value">{{ highAnomalyStudents }}</div>
                <div class="stat-label">주의 필요</div>
              </div>
            </div>

            <!-- 필터 컨트롤 -->
            <div class="filter-controls">
              <div class="filter-group">
                <label>수준별 필터</label>
                <select v-model="selectedLevel" class="filter-select">
                  <option value="all">전체 보기</option>
                  <option value="fast">⚡ 빠른</option>
                  <option value="normal">⏱️ 보통</option>
                  <option value="slow">🐌 느린</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 학생 현황 테이블 -->
          <!-- <div class="table-container">
            <table class="students-table">
              <thead>
                <tr>
                  <th @click="sort('studentNo')">
                    번호
                    <span
                      class="sort-indicator"
                      v-if="sortConfig.key === 'studentNo'"
                    >
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th @click="sort('studentName')">
                    이름
                    <span
                      class="sort-indicator"
                      v-if="sortConfig.key === 'studentName'"
                    >
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th>수준</th>
                  <th @click="sort('studentLearningProgress')">
                    진도율 (%)
                    <span
                      class="sort-indicator"
                      v-if="sortConfig.key === 'studentLearningProgress'"
                    >
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th @click="sort('studentTotalLearningTime')">
                    총 학습시간
                    <span
                      class="sort-indicator"
                      v-if="sortConfig.key === 'studentTotalLearningTime'"
                    >
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th @click="sort('studentAvgAssignScore')">
                    과제
                    <span
                      class="sort-indicator"
                      v-if="sortConfig.key === 'studentAvgAssignScore'"
                    >
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th @click="sort('studentAvgExamScore')">
                    평가
                    <span
                      class="sort-indicator"
                      v-if="sortConfig.key === 'studentAvgExamScore'"
                    >
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th>문제 풀이</th>
                  <th>대화</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="student in filteredStudents"
                  :key="student.studentNo"
                  :class="['student-row', student.levelClass]"
                >
                  <td class="student-no">{{ student.displayNo }}</td>
                  <td class="student-name">
                    <div class="name-container">
                      <span class="name">{{ student.studentName }}</span>
                    </div>
                  </td>
                  <td class="level-cell">
                    <span :class="['level-badge', student.levelClass]">
                      {{ student.levelIcon }} {{ student.level }}
                    </span>
                  </td>
                  <td class="achievement-cell">
                    <div class="progress-container">
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          :style="{
                            width: `${student.studentAvgExamScore || 0}%`,
                            backgroundColor: getProgressColor(
                              student.studentAvgExamScore || 0
                            ),
                          }"
                        ></div>
                      </div>
                      <span
                        class="progress-text"
                        :style="{
                          color: getProgressColor(
                            student.studentAvgExamScore || 0
                          ),
                        }"
                      >
                        {{ student.studentAvgExamScore || 0 }}%
                      </span>
                    </div>
                  </td>
                  <td class="time-cell">
                    {{ formatTime(student.studentTotalLearningTime) }}
                  </td>
                  <td class="progress-cell">
                    <div class="progress-container">
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          :style="{
                            width: `${student.studentLearningProgress || 0}%`,
                            backgroundColor: getProgressColor(
                              student.studentLearningProgress || 0
                            ),
                          }"
                        ></div>
                      </div>
                      <span
                        class="progress-text"
                        :style="{
                          color: getProgressColor(
                            student.studentLearningProgress || 0
                          ),
                        }"
                      >
                        {{ student.studentLearningProgress || 0 }}%
                      </span>
                    </div>
                  </td>
                  <td class="assignment-cell">
                    <div class="progress-container">
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          :style="{
                            width: `${student.studentAvgAssignScore || 0}%`,
                            backgroundColor: getProgressColor(
                              student.studentAvgAssignScore || 0
                            ),
                          }"
                        ></div>
                      </div>
                      <span
                        class="progress-text"
                        :style="{
                          color: getProgressColor(
                            student.studentAvgAssignScore || 0
                          ),
                        }"
                      >
                        {{ student.studentAvgAssignScore || 0 }}%
                      </span>
                    </div>
                  </td>
                  <td class="problems-cell">
                    <div class="problem-stats">
                      <div class="problem-total">
                        {{ student.studentTotalProblemSolved || 0 }}문제
                      </div>
                      <div class="problem-correct">
                        정답 {{ student.studentTotalCorrectProblems || 0 }}개
                      </div>
                    </div>
                  </td>
                  <td class="action-cell">
                    <div class="action-buttons">
                      <button
                        class="action-btn message-btn"
                        @click="goToMessage(student)"
                        title="대화"
                      >
                        💬
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div> -->

          <div class="table-container">
            <table class="students-table">
              <thead>
                <tr>
                  <th @click="sort('displayNo')">
                    번호
                    <span class="sort-indicator" v-if="sortConfig.key === 'displayNo'">
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th @click="sort('studentName')">
                    이름
                    <span class="sort-indicator" v-if="sortConfig.key === 'studentName'">
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th>수준</th>
                  <th @click="sort('studentLearningProgress')">
                    진도율 (%)
                    <span class="sort-indicator" v-if="sortConfig.key === 'studentLearningProgress'">
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th @click="sort('studentTotalLearningTime')">
                    총 학습시간
                    <span class="sort-indicator" v-if="sortConfig.key === 'studentTotalLearningTime'">
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th @click="sort('studentAvgAssignScore')">
                    과제 (평균점수)
                    <span class="sort-indicator" v-if="sortConfig.key === 'studentAvgAssignScore'">
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th @click="sort('studentAvgExamScore')">
                    평가 (평균점수)
                    <span class="sort-indicator" v-if="sortConfig.key === 'studentAvgExamScore'">
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                  <th>문제 풀이</th>
                  <th @click="sort('studentAnomalyTotalCount')">
                    🚨 이상현상
                    <span class="sort-indicator" v-if="sortConfig.key === 'studentAnomalyTotalCount'">
                      {{ sortConfig.direction === "asc" ? "↑" : "↓" }}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in filteredStudents" :key="student.studentNo"
                  :class="['student-row', student.levelClass]">
                  <td class="student-no">{{ student.displayNo }}</td>
                  <td class="student-name">
                    <div class="name-container">
                      <span class="name">{{ student.studentName }}</span>
                    </div>
                  </td>
                  <td class="level-cell">
                    <span :class="['level-badge', student.levelClass]">
                      {{ student.levelIcon }} {{ student.level }}
                    </span>
                  </td>
                  <td class="achievement-cell">
                    <div class="progress-container">
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{
                          width: `${student.studentLearningProgress || 0}%`,
                          backgroundColor: getProgressColor(
                            student.studentLearningProgress || 0
                          ),
                        }"></div>
                      </div>
                      <span class="progress-text" :style="{
                        color: getProgressColor(
                          student.studentLearningProgress || 0
                        ),
                      }">
                        {{ student.studentLearningProgress || 0 }}%
                      </span>
                    </div>
                  </td>
                  <td class="learning-time-cell">
                    <span class="time-value">
                      {{ formatTime(student.studentTotalLearningTime || 0) }}
                    </span>
                  </td>
                  <td class="assignment-cell">
                    <div class="score-container">
                      <span class="score-value" :style="{
                        color: getProgressColor(
                          student.studentAvgAssignScore || 0
                        ),
                      }">
                        {{ Math.round(student.studentAvgAssignScore) || 0 }}점
                      </span>
                      <div class="score-detail">
                      </div>
                    </div>
                  </td>
                  <td class="exam-cell">
                    <div class="score-container">
                      <span class="score-value" :style="{
                        color: getProgressColor(
                          student.studentAvgExamScore || 0
                        ),
                      }">
                        {{ Math.round(student.studentAvgExamScore) || 0 }}점
                      </span>
                      <div class="score-detail">
                        정답률
                        {{
                          (
                            ((student.studentTotalCorrectProblems || 0) /
                              Math.max(
                                student.studentTotalProblemSolved || 1,
                                1
                              )) *
                            100
                          ).toFixed(1)
                        }}%
                      </div>
                    </div>
                  </td>
                  <td class="problems-cell">
                    <div class="problem-stats">
                      <div class="problem-total">
                        {{ student.studentTotalProblemSolved || 0 }}문제
                      </div>
                      <div class="problem-correct">
                        정답 {{ student.studentTotalCorrectProblems || 0 }}개
                      </div>
                    </div>
                  </td>
                  <td class="anomaly-cell">
                    <div :class="['anomaly-container', getAnomalyClass(student.studentAnomalyTotalCount || 0)]">
                      <span class="anomaly-icon">{{ getAnomalyIcon(student.studentAnomalyTotalCount || 0) }}</span>
                      <span class="anomaly-count">{{ student.studentAnomalyTotalCount || 0 }}회</span>
                      <div class="anomaly-description">
                        {{ getAnomalyDescription(student.studentAnomalyTotalCount || 0) }}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 분석 결과 -->
          <div class="analysis-result">
            <div class="analysis-title">📝 학급 분석 결과</div>
            <div class="analysis-content-text">
              <p class="analysis-summary">
                현재 우리 반은 총 <strong>{{ totalStudents }}명</strong>의
                학생으로 구성되어 있으며, 평균 성취도는
                <strong>{{ averageAchievement }}%</strong>입니다.
                <br />
                <span :class="getPerformanceClass(averageAchievement)">
                  {{ getPerformanceAnalysis(averageAchievement) }}
                </span>
              </p>
              <ul class="analysis-points">
                <li v-if="fastStudents > 0">
                  ⚡ <strong>빠른 수준 학생 {{ fastStudents }}명</strong>: 심화
                  학습이나 도전적인 과제를 제공해보세요.
                </li>
                <li v-if="slowStudents > 0">
                  🐌 <strong>느린 수준 학생 {{ slowStudents }}명</strong>:
                  개별적인 관심과 기초 학습 강화가 필요합니다.
                </li>
                <li v-if="normalStudents > 0">
                  ⏱️ <strong>보통 수준 학생 {{ normalStudents }}명</strong>:
                  꾸준한 학습 진행을 격려해주세요.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Header from "@/components/common/Header.vue";
import * as statisticsApi from "@/utils/statisticsApi";
import apiClient from "@/utils/apiClient";
import Spinner from "@/components/common/Spinner.vue";

const isLoading = ref(false);

// 반응형 데이터
const error = ref(null);
const selectedLevel = ref("all");
const sortConfig = ref({ key: null, direction: "asc" });

// API 응답 데이터
const studentsData = ref([]);

// 클래스룸 정보
const classroomNo = ref(null);

const highAnomalyStudents = computed(() =>
  studentsData.value.filter(s => (s.studentAnomalyTotalCount || 0) >= 5).length
);

// 계산된 속성들
const totalStudents = computed(() => studentsData.value.length);

const fastStudents = computed(
  () => studentsData.value.filter((s) => s.levelClass === "fast").length
);

const normalStudents = computed(
  () => studentsData.value.filter((s) => s.levelClass === "normal").length
);

const slowStudents = computed(
  () => studentsData.value.filter((s) => s.levelClass === "slow").length
);

const averageAchievement = computed(() => {
  if (studentsData.value.length === 0) return 0;
  const total = studentsData.value.reduce(
    (sum, student) => sum + (student.studentAvgExamScore || 0),
    0
  );
  return Math.round((total / studentsData.value.length) * 100) / 100;
});

const filteredStudents = computed(() => {
  let filtered = studentsData.value;

  // 수준별 필터링
  if (selectedLevel.value !== "all") {
    filtered = filtered.filter(
      (student) => student.levelClass === selectedLevel.value
    );
  }

  // 정렬
  if (sortConfig.value.key) {
    filtered = [...filtered].sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];

      // 숫자형 데이터 처리
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.value.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      // 문자형 데이터 처리
      if (aVal < bVal) return sortConfig.value.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.value.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  return filtered;
});

// ✨ 새 추가: 이상현상 관련 유틸리티 함수들
const getAnomalyClass = (count) => {
  if (count >= 5) return "anomaly-high";
  if (count >= 1) return "anomaly-medium";
  return "anomaly-normal";
};

const getAnomalyIcon = (count) => {
  if (count >= 5) return "🚨";
  if (count >= 1) return "⚠️";
  return "✅";
};

const getAnomalyDescription = (count) => {
  if (count >= 5) return "주의 필요";
  if (count >= 1) return "관찰 필요";
  return "정상";
};


// 유틸리티 함수들
const formatTime = (milliseconds) => {
  if (!milliseconds) return "0분";
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
};

const getProgressColor = (value) => {
  if (value >= 80) return "#4CAF50";
  if (value >= 60) return "#FF9800";
  if (value >= 40) return "#FFC107";
  return "#F44336";
};

const getPerformanceClass = (score) => {
  if (score >= 80) return "performance-excellent";
  if (score >= 60) return "performance-good";
  if (score >= 40) return "performance-fair";
  return "performance-poor";
};

const getPerformanceAnalysis = (score) => {
  if (score >= 80) return "🌟 우수한 성취도를 보이고 있습니다!";
  if (score >= 60) return "👍 양호한 학습 진행을 보이고 있어요.";
  if (score >= 40) return "👀 조금 더 노력이 필요해 보입니다.";
  return "💪 기초 실력 향상에 집중이 필요합니다.";
};

const getLevelInfo = (avgExamScore, learningProgress) => {
  // const examScore = avgExamScore || 0;
  // const assignScore = avgAssignScore || 0;
  const score = avgExamScore || 0;
  const progress = learningProgress || 0;

  // 성취도와 진도율을 종합하여 수준 결정
  const combinedScore = (score + progress) / 2;

  if (combinedScore >= 75) {
    return { level: "빠른", levelIcon: "⚡", levelClass: "fast" };
  } else if (combinedScore >= 50) {
    return { level: "보통", levelIcon: "⏱️", levelClass: "normal" };
  } else {
    return { level: "느린", levelIcon: "🐌", levelClass: "slow" };
  }
};

// 클래스룸 정보 로드
const loadClassroomInfo = () => {
  try {
    const tokenInfo = localStorage.getItem("tokenInfo");
    if (tokenInfo) {
      const parsed = JSON.parse(tokenInfo);
      classroomNo.value = parsed.classroomNo;
    }
  } catch (err) {
    console.error("클래스룸 정보 로드 실패:", err);
    error.value = "클래스룸 정보를 찾을 수 없습니다.";
  }
};

// 학생 현황 데이터 로드
const loadStudentsData = async () => {
  try {
    const request = {
      classroomNo: classroomNo.value,
      lsType: "MONTHLY", // 기본값으로 월별 조회
      lsStartDate: null,
      lsEndDate: null,
    };

    console.log("학생 현황 요청:", request);

    const response = await apiClient.post(
      "/statistics/teacher/summary/all",
      request
    );

    console.log(response);

    // 응답 데이터를 UI에 맞게 변환
    studentsData.value = response.map((student, index) => {
      const levelInfo = getLevelInfo(
        student.studentAvgExamScore,
        student.studentLearningProgress
      );

      const anomalyCount = student.studentAnomalyTotalCount || 0;
      let anomalyClass = "";
      if (anomalyCount >= 30) anomalyClass = "high-risk";
      else if (anomalyCount >= 5) anomalyClass = "medium-risk";

      return {
        ...student,
        displayNo: index + 1,
        ...levelInfo,
        anomalyClass, // 이상현상 기반 스타일링용
      };
    });

    console.log("변환된 학생 데이터:", studentsData.value);
  } catch (err) {
    console.error("학생 현황 로드 실패:", err);
    throw new Error("학생 현황을 불러오는데 실패했습니다.");
  }
};

// 데이터 로드
const loadData = async () => {
  if (!classroomNo.value) {
    error.value = "클래스룸 정보를 찾을 수 없습니다. 다시 로그인해주세요.";
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    await loadStudentsData();
  } catch (err) {
    error.value = err.message || "데이터를 불러오는데 실패했습니다.";
  } finally {
    isLoading.value = false;
  }
};

// 정렬 함수
const sort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
};

// 액션 함수들
const viewStudentDetail = (student) => {
  alert(`${student.studentName} 학생의 상세 현황을 확인합니다.`);
  // 실제로는 상세 페이지로 이동하거나 모달을 표시
};

const goToMessage = (student) => {
  alert(`${student.studentName} 학생에게 피드백을 작성합니다.`);
  // 실제로는 피드백 작성 모달이나 페이지 표시
};

// 생명주기 훅
onMounted(async () => {
  loadClassroomInfo();
  await loadData();
});
</script>

<style scoped>
/* 기존 스타일 유지 + 새로운 스타일 추가 */

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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.15);
}

.stat-card.total {
  border: 2px solid #e0e0e0;
}

.stat-card.fast {
  border: 2px solid #4caf50;
}

.stat-card.normal {
  border: 2px solid #ff9800;
}

.stat-card.slow {
  border: 2px solid #f44336;
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-card.total .stat-value {
  color: #666;
}

.stat-card.fast .stat-value {
  color: #4caf50;
}

.stat-card.normal .stat-value {
  color: #ff9800;
}

.stat-card.slow .stat-value {
  color: #f44336;
}

.stat-label {
  color: #666;
  font-weight: 600;
  font-size: 0.9rem;
}

/* 필터 컨트롤 */
.filter-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
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

.filter-select {
  padding: 0.5rem;
  border: 2px solid #ffe066;
  border-radius: 8px;
  background: white;
  color: #ff9800;
  font-weight: 600;
}

/* 테이블 */
.table-container {
  overflow-x: auto;
  margin-bottom: 2rem;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.students-table th {
  background: #ff9800;
  color: white;
  padding: 1rem 0.5rem;
  text-align: center;
  font-weight: 600;
  cursor: pointer;
  position: relative;
}

.students-table th:hover {
  background: #f57c00;
}

.sort-indicator {
  margin-left: 0.5rem;
  font-size: 0.8rem;
}

.students-table td {
  padding: 1rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.student-row:hover {
  background: #fffbf0;
}

.student-row.fast {
  border-left: 4px solid #4caf50;
}

.student-row.normal {
  border-left: 4px solid #ff9800;
}

.student-row.slow {
  border-left: 4px solid #f44336;
}

.student-no {
  font-weight: bold;
  color: #666;
}

.student-name {
  text-align: left;
  font-weight: 600;
}

.level-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.level-badge.fast {
  background: #e8f5e8;
  color: #2e7d32;
}

.level-badge.normal {
  background: #fff3e0;
  color: #f57c00;
}

.level-badge.slow {
  background: #ffebee;
  color: #c62828;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  min-width: 60px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.progress-text {
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 40px;
}

.time-cell {
  font-size: 0.9rem;
  color: #666;
}

/* ✨ 새 추가: 이상현상 셀 스타일 */
.anomaly-cell {
  min-width: 100px;
}

.anomaly-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.anomaly-container.anomaly-high {
  background: #ffebee;
  border: 2px solid #e74c3c;
}

.anomaly-container.anomaly-medium {
  background: #fff3e0;
  border: 2px solid #ff9800;
}

.anomaly-container.anomaly-normal {
  background: #e8f5e8;
  border: 2px solid #4caf50;
}

.anomaly-icon {
  font-size: 1.2rem;
}

.anomaly-count {
  font-weight: bold;
  font-size: 0.9rem;
}

.anomaly-description {
  font-size: 0.7rem;
  color: #666;
  text-align: center;
}

.anomaly-high .anomaly-count {
  color: #e74c3c;
}

.anomaly-medium .anomaly-count {
  color: #ff9800;
}

.anomaly-normal .anomaly-count {
  color: #4caf50;
}

.problems-cell {
  font-size: 0.85rem;
}

.problem-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.problem-total {
  font-weight: 600;
  color: #333;
}

.problem-correct {
  color: #666;
  font-size: 0.8rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.detail-btn {
  background: #2196f3;
  color: white;
}

.detail-btn:hover {
  background: #1976d2;
  transform: translateY(-1px);
}

.message-btn {
  background: #4caf50;
  color: white;
}

.message-btn:hover {
  background: #388e3c;
  transform: translateY(-1px);
}

/* 분석 결과 */
.analysis-result {
  background: #fffbf0;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #fff5d6;
}

.analysis-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 1rem;
  text-align: center;
}

.analysis-content-text {
  line-height: 1.6;
}

.analysis-summary {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #ff9800;
}

.analysis-points {
  list-style: none;
  padding: 0;
}

.analysis-points li {
  background: white;
  margin: 0.5rem 0;
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 4px solid #4caf50;
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .students-table {
    font-size: 0.85rem;
  }

  .students-table th,
  .students-table td {
    padding: 0.5rem 0.25rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
