<template>
  <div class="learning-status-page">
    <div class="container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <h1 class="page-title">📊 학습 현황 관리 ✨</h1>
        <p class="page-subtitle">
          우리 반 아이들의 소중한 학습 여정을 함께 살펴보아요!
        </p>
        <nav class="breadcrumb">
          <span>🏠 홈</span>
          <span class="separator">></span>
          <span>📚 학습 관리</span>
          <span class="separator">></span>
          <span class="current">📊 학습 현황 관리</span>
        </nav>
      </div>

      <!-- 안내 박스 -->
      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <ul class="notice-list">
          <li>각 항목의 수치를 클릭하면 상세 이력을 확인할 수 있습니다.</li>
          <li>
            핀 아이콘을 클릭하면, 선택한 열과 그 사이 열까지 함께 고정됩니다.
          </li>
          <li>AI 분석을 통해 학생들의 강점과 보완점을 파악해보세요! 💪</li>
        </ul>
      </div>

      <!-- 탭 -->
      <div class="analysis-tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="currentTab = index"
          class="tab-button"
          :class="{ active: currentTab === index }"
        >
          {{ tab.emoji }} {{ tab.label }}
        </button>
      </div>

      <!-- 탭 컨텐츠 -->
      <div class="analysis-content">
        <!-- 학습 수준별 통계 -->
        <div class="stats-section">
          <h2 class="section-title">🎓 우리 반 학습 현황</h2>

          <div class="stats-grid">
            <div class="stat-card total">
              <div class="stat-icon">🏫</div>
              <div class="stat-value">{{ levelStats.total }}명</div>
              <div class="stat-label">전체</div>
            </div>

            <div class="stat-card fast">
              <div class="stat-icon">⚡</div>
              <div class="stat-value">{{ levelStats.fast }}명</div>
              <div class="stat-label">빠른</div>
            </div>

            <div class="stat-card normal">
              <div class="stat-icon">⏱️</div>
              <div class="stat-value">{{ levelStats.normal }}명</div>
              <div class="stat-label">보통</div>
            </div>

            <div class="stat-card slow">
              <div class="stat-icon">🐌</div>
              <div class="stat-value">{{ levelStats.slow }}명</div>
              <div class="stat-label">느린</div>
            </div>
          </div>

          <!-- 필터 -->
          <div class="filter-section">
            <select v-model="selectedLevel" class="level-filter">
              <option value="all">👥 전체</option>
              <option value="빠른">⚡ 빠른</option>
              <option value="보통">⏱️ 보통</option>
              <option value="느린">🐌 느린</option>
            </select>
          </div>
        </div>

        <!-- 학생 목록 테이블 -->
        <div class="table-container">
          <table class="students-table">
            <thead>
              <tr>
                <th class="sticky-column" @click="handleSort('no')">📌 No.</th>
                <th
                  class="sticky-column name-column"
                  @click="handleSort('name')"
                >
                  📌 이름
                </th>
                <th @click="handleSort('level')">🎯 학습 수준</th>
                <th
                  @click="handleSort('achievement')"
                  class="achievement-column"
                >
                  📈 종합 성취도
                </th>
                <th @click="handleSort('totalTime')">⏰ 총학습 시간</th>
                <th @click="handleSort('classProgress')">🏫 우리 반 수업</th>
                <th @click="handleSort('aiProgress')">🤖 AI 맞춤</th>
                <th @click="handleSort('teacherProgress')">👩‍🏫 선생님 추천</th>
                <th @click="handleSort('evaluation')">📝 평가</th>
                <th @click="handleSort('assignment')">📋 과제</th>
                <th>🏆 챌린지</th>
                <th>💡 지도 필요</th>
                <th>👏 칭찬 횟수</th>
                <th>🎉 칭찬하기</th>
                <th>💌 대화하기</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(student, index) in sortedStudents"
                :key="student.no"
                :class="{ even: index % 2 === 0, odd: index % 2 === 1 }"
              >
                <td class="sticky-column">{{ student.no }}</td>
                <td class="sticky-column name-column">
                  <button
                    class="name-button"
                    @click="viewStudentDetail(student)"
                  >
                    {{ student.name }}
                  </button>
                </td>
                <td class="level-cell">
                  <div class="level-info">
                    <span class="level-icon">{{ student.levelIcon }}</span>
                    <span class="level-text">{{ student.level }}</span>
                  </div>
                </td>
                <td class="achievement-cell">
                  <div class="progress-container">
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :style="{
                          width: `${student.achievement}%`,
                          background: `linear-gradient(90deg, ${getProgressColor(
                            student.achievement
                          )}, ${getProgressColor(student.achievement)}aa)`,
                        }"
                      >
                        <span class="progress-label"
                          >{{ student.achievement }}%</span
                        >
                      </div>
                    </div>
                    <span class="progress-value"
                      >{{ student.achievement }}%</span
                    >
                  </div>
                </td>
                <td class="time-cell">{{ student.totalTime }}</td>
                <td class="progress-cell">
                  <button
                    class="progress-button"
                    @click="viewProgress(student, 'class')"
                  >
                    {{ student.classProgress }}%
                  </button>
                </td>
                <td class="progress-cell">
                  <button
                    class="progress-button"
                    @click="viewProgress(student, 'ai')"
                  >
                    {{ student.aiProgress }}%
                  </button>
                </td>
                <td class="progress-cell">
                  <button
                    class="progress-button"
                    @click="viewProgress(student, 'teacher')"
                  >
                    {{ student.teacherProgress }}%
                  </button>
                </td>
                <td class="progress-cell">
                  <button
                    class="progress-button"
                    @click="viewProgress(student, 'evaluation')"
                  >
                    {{ student.evaluation }}%
                  </button>
                </td>
                <td class="progress-cell">
                  <button
                    class="progress-button"
                    @click="viewProgress(student, 'assignment')"
                  >
                    {{ student.assignment }}%
                  </button>
                </td>
                <td class="center">{{ student.challenge }}</td>
                <td class="center">
                  <button
                    v-if="typeof student.guidance === 'number'"
                    class="guidance-button"
                    @click="viewGuidance(student)"
                  >
                    {{ student.guidance }}회
                  </button>
                  <span v-else>{{ student.guidance }}</span>
                </td>
                <td class="center">{{ student.praise }}</td>
                <td class="center">
                  <button
                    class="action-button praise-button"
                    @click="handlePraise(student)"
                    @mouseenter="hoverPraise = student.no"
                    @mouseleave="hoverPraise = null"
                    :class="{ hover: hoverPraise === student.no }"
                  >
                    👏
                  </button>
                </td>
                <td class="center">
                  <button
                    class="action-button message-button"
                    @click="handleMessage(student)"
                    @mouseenter="hoverMessage = student.no"
                    @mouseleave="hoverMessage = null"
                    :class="{ hover: hoverMessage === student.no }"
                  >
                    💬
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- AI 분석 코멘트 -->
        <div class="ai-comment">
          <div class="ai-avatar">🤖</div>
          <div class="ai-message">
            <h4>✨ AI 보조교사 코멘트</h4>
            <p>
              우리 반 학생들은 전반적으로 열심히 학습하고 있어요! 🌟<br />
              특히 빠른 수준 학생들이 많아서 수업 진도를 조금 더 빠르게 진행해도
              좋을 것 같습니다.<br />
              느린 수준 학생들에게는 개별적인 관심과 추가 지도가 필요해
              보입니다. 💪
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 헬퍼 함수
const getProgressColor = (value) => {
  if (value >= 80) return "#4CAF50";
  if (value >= 60) return "#FF9800";
  if (value >= 40) return "#FFC107";
  return "#F44336";
};

// 반응형 데이터
const currentTab = ref(0);
const selectedLevel = ref("all");
const sortConfig = ref({ key: null, direction: "asc" });
const hoverPraise = ref(null);
const hoverMessage = ref(null);

const tabs = [
  { label: "종합 현황", emoji: "📊" },
  { label: "우리 반 수업", emoji: "🏫" },
  { label: "AI 맞춤 학습", emoji: "🤖" },
  { label: "선생님 추천 학습", emoji: "👩‍🏫" },
  { label: "과제", emoji: "📋" },
  { label: "평가", emoji: "📝" },
];

const studentsData = ref([
  {
    no: 1,
    name: "학생1",
    level: "빠른",
    levelIcon: "⚡",
    achievement: 100.0,
    totalTime: "03시간 13분",
    classProgress: 20.2,
    aiProgress: 0.0,
    teacherProgress: 0.0,
    evaluation: 15.4,
    assignment: 0.0,
    challenge: "-",
    guidance: "-",
    praise: "-",
  },
  {
    no: 2,
    name: "학생2",
    level: "빠른",
    levelIcon: "⚡",
    achievement: 62.2,
    totalTime: "0시간 31분",
    classProgress: 19.0,
    aiProgress: 0.0,
    teacherProgress: 0.0,
    evaluation: 15.4,
    assignment: 0.0,
    challenge: "-",
    guidance: 1,
    praise: "-",
  },
  {
    no: 3,
    name: "학생3",
    level: "보통",
    levelIcon: "⏱️",
    achievement: 66.1,
    totalTime: "0시간 40분",
    classProgress: 18.6,
    aiProgress: 0.0,
    teacherProgress: 0.0,
    evaluation: 15.4,
    assignment: 0.0,
    challenge: "-",
    guidance: "-",
    praise: "-",
  },
  {
    no: 4,
    name: "학생4",
    level: "느린",
    levelIcon: "🐌",
    achievement: 43.9,
    totalTime: "01시간 16분",
    classProgress: 18.6,
    aiProgress: 0.0,
    teacherProgress: 0.0,
    evaluation: 15.4,
    assignment: 0.0,
    challenge: "-",
    guidance: "-",
    praise: "-",
  },
  {
    no: 5,
    name: "학생5",
    level: "느린",
    levelIcon: "🐌",
    achievement: 0.0,
    totalTime: "0시간 46분",
    classProgress: 18.6,
    aiProgress: 0.0,
    teacherProgress: 0.0,
    evaluation: 15.4,
    assignment: 0.0,
    challenge: "-",
    guidance: "-",
    praise: "-",
  },
  {
    no: 6,
    name: "학생6",
    level: "빠른",
    levelIcon: "⚡",
    achievement: 100.0,
    totalTime: "0시간 29분",
    classProgress: 18.6,
    aiProgress: 0.0,
    teacherProgress: 0.0,
    evaluation: 15.4,
    assignment: 0.0,
    challenge: "-",
    guidance: "-",
    praise: "-",
  },
  {
    no: 7,
    name: "학생7",
    level: "빠른",
    levelIcon: "⚡",
    achievement: 93.4,
    totalTime: "0시간 31분",
    classProgress: 18.6,
    aiProgress: 0.0,
    teacherProgress: 0.0,
    evaluation: 15.4,
    assignment: 0.0,
    challenge: "-",
    guidance: "-",
    praise: "-",
  },
  {
    no: 8,
    name: "학생8",
    level: "보통",
    levelIcon: "⏱️",
    achievement: 66.1,
    totalTime: "0시간 40분",
    classProgress: 18.6,
    aiProgress: 0.0,
    teacherProgress: 0.0,
    evaluation: 15.4,
    assignment: 0.0,
    challenge: "-",
    guidance: "-",
    praise: "-",
  },
  {
    no: 9,
    name: "학생9",
    level: "느린",
    levelIcon: "🐌",
    achievement: 43.9,
    totalTime: "01시간 16분",
    classProgress: 18.6,
    aiProgress: 0.0,
    teacherProgress: 0.0,
    evaluation: 15.4,
    assignment: 0.0,
    challenge: "-",
    guidance: "-",
    praise: "-",
  },
  {
    no: 10,
    name: "학생10",
    level: "느린",
    levelIcon: "🐌",
    achievement: 0.0,
    totalTime: "0시간 46분",
    classProgress: 18.6,
    aiProgress: 0.0,
    teacherProgress: 0.0,
    evaluation: 15.4,
    assignment: 0.0,
    challenge: "-",
    guidance: "-",
    praise: "-",
  },
]);

// 계산된 속성
const levelStats = computed(() => ({
  total: studentsData.value.length,
  fast: studentsData.value.filter((s) => s.level === "빠른").length,
  normal: studentsData.value.filter((s) => s.level === "보통").length,
  slow: studentsData.value.filter((s) => s.level === "느린").length,
}));

const filteredStudents = computed(() => {
  if (selectedLevel.value === "all") return studentsData.value;
  return studentsData.value.filter(
    (student) => student.level === selectedLevel.value
  );
});

const sortedStudents = computed(() => {
  const students = [...filteredStudents.value];

  if (!sortConfig.value.key) return students;

  return students.sort((a, b) => {
    const aValue = a[sortConfig.value.key];
    const bValue = b[sortConfig.value.key];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.value.direction === "asc"
        ? aValue - bValue
        : bValue - aValue;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (aStr < bStr) return sortConfig.value.direction === "asc" ? -1 : 1;
    if (aStr > bStr) return sortConfig.value.direction === "asc" ? 1 : -1;
    return 0;
  });
});

// 메서드
const handleSort = (key) => {
  let direction = "asc";
  if (sortConfig.value.key === key && sortConfig.value.direction === "asc") {
    direction = "desc";
  }
  sortConfig.value = { key, direction };
};

const handlePraise = (student) => {
  alert(`🎉 ${student.name}에게 칭찬을 보냈습니다!`);
};

const handleMessage = (student) => {
  alert(`💌 ${student.name}에게 메시지를 보냈습니다!`);
};

const viewStudentDetail = (student) => {
  alert(`📊 ${student.name}의 상세 정보를 확인합니다.`);
};

const viewProgress = (student, type) => {
  const typeNames = {
    class: "우리 반 수업",
    ai: "AI 맞춤 학습",
    teacher: "선생님 추천 학습",
    evaluation: "평가",
    assignment: "과제",
  };
  alert(`📈 ${student.name}의 ${typeNames[type]} 상세 현황을 확인합니다.`);
};

const viewGuidance = (student) => {
  alert(`💡 ${student.name}의 지도 이력을 확인합니다.`);
};
</script>

<style scoped>
/* 전역 스타일 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}

.learning-status-page {
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.container {
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
  border: 2px solid rgba(255, 152, 0, 0.3);
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #e65100;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #f57c00;
  margin: 0 0 0.5rem 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #ff9800;
  flex-wrap: wrap;
}

.separator {
  margin: 0 0.25rem;
}

.current {
  font-weight: 700;
  color: #e65100;
}

/* 안내 박스 */
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

/* 탭 */
.analysis-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  margin-bottom: 2.5rem;
  background: #fff5d6;
  border-radius: 20px;
  border: 2px solid #ffe066;
  overflow-x: auto;
}

.tab-button {
  flex: 1;
  min-width: 120px;
  padding: 12px 20px;
  border: 0;
  border-radius: 15px;
  background: none;
  color: #ff9800;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  white-space: nowrap;
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

/* 필터 */
.filter-section {
  text-align: center;
  margin-bottom: 1rem;
}

.level-filter {
  padding: 0.75rem 1rem;
  border: 2px solid #ffe066;
  border-radius: 15px;
  background: white;
  color: #ff9800;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.level-filter:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.2);
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.students-table th,
.students-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f5f5f5;
}

.students-table th {
  background: #fffbf0;
  font-weight: 700;
  color: #ff9800;
  border-bottom: 2px solid #ffe066;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.students-table th:hover {
  background: #fff5d6;
}

.students-table tbody tr:hover {
  background: #fffbf0;
}

.students-table tr.even {
  background: white;
}

.students-table tr.odd {
  background: #fffbf0;
}

.sticky-column {
  position: sticky;
  left: 0;
  z-index: 10;
}

.name-column {
  left: 80px !important;
}

.achievement-column {
  min-width: 200px;
}

/* 셀 스타일 */
.level-cell {
  text-align: center;
}

.level-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.level-icon {
  font-size: 1.2rem;
}

.level-text {
  font-weight: bold;
}

.achievement-cell {
  text-align: center;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-value {
  font-weight: bold;
  min-width: 60px;
}

.time-cell {
  text-align: center;
  font-weight: bold;
}

.progress-cell {
  text-align: center;
}

.center {
  text-align: center;
}

/* 버튼 스타일 */
.name-button,
.progress-button,
.guidance-button {
  background: none;
  border: none;
  color: #ff9800;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.name-button:hover,
.progress-button:hover,
.guidance-button:hover {
  color: #e65100;
  transform: scale(1.05);
}

.action-button {
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.praise-button {
  background: #ffdd29;
}

.message-button {
  background: #ffa726;
}

.action-button.hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

/* 프로그레스 바 */
.progress-bar {
  width: 100%;
  background: #f0f0f0;
  border-radius: 10px;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-label {
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* AI 코멘트 */
.ai-comment {
  background: #fffbf0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 2rem;
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .learning-status-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tab-button {
    padding: 1rem;
    font-size: 0.85rem;
  }

  .analysis-content {
    padding: 1.5rem;
  }

  .students-table {
    font-size: 0.8rem;
  }

  .students-table th,
  .students-table td {
    padding: 0.5rem;
  }

  .sticky-column {
    position: relative;
    left: auto;
  }

  .ai-comment {
    flex-direction: column;
    text-align: center;
  }
}

/* 접근성 */
button:focus,
select:focus,
input:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
