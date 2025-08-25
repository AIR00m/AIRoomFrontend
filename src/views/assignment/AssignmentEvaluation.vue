<template>
  <div class="assignment-manager">
    <header class="header">
      <Header />
    </header>

    <div class="main-container">
      <!-- 브레드크럼 -->
      <nav class="breadcrumb-nav">
        <div class="breadcrumb-title">📝 우리 반 과제</div>
        <div class="breadcrumb-path">
          <span>홈</span>
          <i class="bi bi-chevron-right"></i>
          <span>우리 반 과제</span>
        </div>
      </nav>

      <!-- [추가] 로딩/에러 상태 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-icon">⏳</div>
        <p class="loading-text">과제 데이터를 불러오는 중...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p class="error-text">{{ error }}</p>
        <button @click="fetchDetail()" class="retry-btn">다시 시도</button>
      </div>

      <template v-else>
        <!-- 과제 상세 카드 -->
        <div class="assignment-detail-card">
          <div class="assignment-header">
            <!-- [수정] API 데이터 기반 -->
            <div class="assignment-badge">
              {{ assignResponse.boardType || "일반 과제" }}
            </div>
            <div class="assignment-title-section">
              <div class="status-badge" :class="getStatusClass(status)">
                {{ status }}
              </div>
              <h2 class="assignment-title">{{ assignResponse.title }}</h2>
              <div class="assignment-meta">
                <span class="registration-date">
                  시작: {{ formatDate(assignResponse.startTime) }} ~ 마감:
                  {{ formatDate(assignResponse.endTime) }}
                </span>
                <button
                  class="more-options-btn"
                  @click="toggleOptions"
                  :aria-label="moreOptionsLabel"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 완료 현황 요약 -->
          <div class="completion-summary">
            <div
              v-for="summary in summaryData"
              :key="summary.key"
              class="summary-item"
              :class="summary.key"
            >
              <div class="summary-header">
                <span class="summary-status">{{ summary.label }}</span>
              </div>
              <div class="summary-count">
                <strong>{{ summary.count }}</strong>
                <span>명</span>
              </div>
            </div>
          </div>

          <!-- 과제 정보 -->
          <div class="assignment-info">
            <div
              v-for="info in assignmentInfoData"
              :key="info.key"
              class="info-row"
            >
              <dt class="info-label">
                {{ info.label }}
                <span v-if="info.required" class="required">*</span>
              </dt>
              <dd class="info-value">
                <div v-if="info.key === 'content'" class="content-wrapper">
                  <div
                    class="content-body"
                    v-html="assignResponse.content"
                  ></div>
                  <!-- 첨부파일 섹션은 필요시 추가 -->
                </div>
                <span v-else>{{ info.value }}</span>
              </dd>
            </div>
          </div>
        </div>

        <!-- 학생별 현황 카드 -->
        <div class="student-status-card">
          <div class="status-header">
            <h3>👥 학생별 현황</h3>
          </div>

          <!-- [유지] 필터 및 액션 버튼 -->
          <div class="status-controls">
            <div class="filter-controls">
              <label class="filter-checkbox">
                <input type="checkbox" v-model="showIncompleteOnly" />
                <span class="checkmark"></span>
                {{ filterLabel }}
              </label>
            </div>
            <div class="action-controls">
              <button
                v-for="action in actionButtons"
                :key="action.key"
                class="action-btn"
                :class="action.key"
                @click="action.handler"
                :disabled="action.disabled"
              >
                {{ action.label }}
              </button>
            </div>
          </div>

          <!-- [수정] 학생 목록 테이블 - 점수 입력 포함 -->
          <div class="student-table-container">
            <table class="student-table">
              <thead>
                <tr>
                  <th class="checkbox-col">
                    <input
                      type="checkbox"
                      v-model="selectAll"
                      @change="toggleSelectAll"
                      :aria-label="selectAllLabel"
                    />
                  </th>
                  <th v-for="column in tableColumns" :key="column.key">
                    {{ column.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(student, index) in filteredStudents"
                  :key="index"
                  :class="{ selected: isStudentSelected(index) }"
                >
                  <td class="checkbox-col">
                    <input
                      type="checkbox"
                      :value="index"
                      v-model="selectedStudents"
                      :aria-label="`${student.memberName} 선택`"
                    />
                  </td>
                  <td>{{ index + 1 }}</td>
                  <td class="student-name">{{ student.memberName }}</td>
                  <td class="completion-status">
                    <span
                      class="status-badge"
                      :class="
                        getCompletionStatusClass(student.homeworkSubmitType)
                      "
                    >
                      {{ getCompletionStatusText(student.homeworkSubmitType) }}
                    </span>
                  </td>
                  <td class="submission-time">
                    {{ formatDate(student.createdAt) || "-" }}
                  </td>
                  <td class="modification-time">
                    {{ formatDate(student.updatedAt) || "-" }}
                  </td>
                  <td class="attachment-col">
                    <button
                      v-if="student.originalName"
                      @click="viewAttachment(student)"
                      class="attachment-btn"
                      :aria-label="`${student.memberName}의 첨부파일 보기`"
                    >
                      <i class="bi bi-paperclip"></i>
                    </button>
                    <span v-else>-</span>
                  </td>
                  <td class="detail-col">
                    <button
                      v-if="student.homeworkSubmitType"
                      @click="viewDetail(student)"
                      class="detail-btn"
                    >
                      상세 보기
                    </button>
                    <span v-else>-</span>
                  </td>
                  <!-- [핵심] 점수 입력 부분 -->
                  <td class="score-col">
                    <div
                      v-if="student.homeworkSubmitType"
                      class="score-input-wrapper"
                    >
                      <input
                        type="number"
                        v-model.number="student.homeworkScore"
                        @change="updateScore(student)"
                        class="score-input"
                        min="0"
                        max="100"
                        :class="{
                          'final-score': student.homeworkScore !== null,
                        }"
                        :aria-label="`${student.memberName}의 점수 입력`"
                      />
                      <span class="score-total">/100</span>
                    </div>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- [유지] 점수 반영 버튼 -->
          <div class="score-submit-section">
            <button
              class="score-submit-btn"
              :disabled="!hasScoreChanges"
              @click="submitScores"
            >
              📊 점수반영
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- [유지] TOP 버튼 -->
    <Transition name="fade">
      <button
        v-show="showTopButton"
        class="top-button"
        @click="scrollToTop"
        :title="topButtonTitle"
      >
        <div class="top-icon">🐥</div>
        <div class="top-text">위로</div>
      </button>
    </Transition>
  </div>
</template>

<script>
// [수정] 실제 API 기반 구조로 변경
import { ref, computed, onMounted, onUnmounted } from "vue";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "@/components/common/Header.vue";
import { useAuthStore } from "@/stores/auth";
import { useRoute } from "vue-router";
import apiClient from "@/utils/apiClient";

export default {
  name: "AssignmentManager",
  components: { Header },
  setup() {
    const authStore = useAuthStore();
    const route = useRoute();

    // [추가] API 데이터 상태
    const assignResponse = ref({});
    const students = ref([]);
    const isLoading = ref(true);
    const error = ref(null);

    // [유지] 기존 상태들
    const showTopButton = ref(false);
    const showIncompleteOnly = ref(false);
    const selectAll = ref(false);
    const selectedStudents = ref([]);
    const hasScoreChanges = ref(false);

    // [추가] API 호출 함수
    const fetchDetail = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        if (!authStore.isAuthenticated) {
          throw new Error("로그인이 필요합니다.");
        }

        const assignBoardNo = route.params.id;
        console.log(
          `🌐 API 호출: /assign/teacher/${assignBoardNo}?boardType=ASSIGN`
        );

        const response = await apiClient.get(
          `/assign/teacher/${assignBoardNo}?boardType=ASSIGN`
        );

        assignResponse.value = response.assignResponse;
        students.value = response.studentHomeworkResponses || [];

        console.log("✅ 과제 평가 데이터 로드 완료");
      } catch (err) {
        error.value = err.message || "과제 정보를 불러오는데 실패했습니다.";
        console.error("API 호출 에러:", err);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(fetchDetail);

    // [수정] API 데이터 기반 계산된 속성들
    const filteredStudents = computed(() => {
      if (showIncompleteOnly.value) {
        return students.value.filter((student) => !student.homeworkSubmitType);
      }
      return students.value;
    });

    const summaryData = computed(() => {
      const completed = students.value.filter(
        (s) => s.homeworkSubmitType
      ).length;
      const total = students.value.length;
      return [
        { key: "completed", label: "완료", count: completed },
        { key: "incomplete", label: "미완료", count: total - completed },
        { key: "total", label: "전체", count: total },
      ];
    });

    const assignmentInfoData = computed(() => [
      {
        key: "period",
        label: "과제 기간",
        value: `${formatDate(assignResponse.value.startTime)} ~ ${formatDate(
          assignResponse.value.endTime
        )}`,
        required: false,
      },
      {
        key: "content",
        label: "과제 내용",
        value: null,
        required: true,
      },
    ]);

    const status = computed(() => {
      if (!assignResponse.value.endTime) return "진행중";
      const now = new Date();
      const endTime = new Date(assignResponse.value.endTime);
      return endTime > now ? "진행중" : "완료";
    });

    // [유지] 테이블 컬럼 정의
    const tableColumns = [
      { key: "no", label: "No." },
      { key: "name", label: "이름" },
      { key: "completion", label: "완료 여부" },
      { key: "submission", label: "제출 일시" },
      { key: "modification", label: "수정 일시" },
      { key: "attachment", label: "첨부파일" },
      { key: "detail", label: "상세 보기" },
      { key: "score", label: "점수" },
    ];

    // [유지] 액션 버튼들
    const actionButtons = computed(() => [
      {
        key: "download",
        label: "📎 첨부파일 다운",
        handler: downloadAttachments,
        disabled: selectedStudents.value.length === 0,
      },
      {
        key: "message",
        label: "💬 대화 보내기",
        handler: sendMessage,
        disabled: selectedStudents.value.length === 0,
      },
    ]);

    // [유지] 라벨들
    const moreOptionsLabel = computed(() => "더 많은 옵션 메뉴");
    const filterLabel = computed(() => "미완료 학생만 보기");
    const selectAllLabel = computed(() => "전체 선택/해제");
    const topButtonTitle = computed(() => "맨 위로 올라가기");

    // [유지] 유틸리티 함수들
    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "";
      }
    };

    const getStatusClass = (status) => {
      const statusMap = {
        진행중: "ongoing",
        완료: "completed",
        예정: "scheduled",
      };
      return statusMap[status] || "ongoing";
    };

    const getCompletionStatusClass = (isCompleted) =>
      isCompleted ? "completed" : "incomplete";

    const getCompletionStatusText = (isCompleted) =>
      isCompleted ? "완료" : "미완료";

    const isStudentSelected = (studentIndex) =>
      selectedStudents.value.includes(studentIndex);

    // [유지] 액션 메서드들
    const toggleOptions = () => {
      alert("🔧 더 많은 옵션 메뉴를 표시합니다!");
    };

    const downloadAttachments = () => {
      const selectedCount = selectedStudents.value.length;
      if (selectedCount === 0) {
        alert("⚠️ 학생을 선택해주세요!");
        return;
      }
      alert(`📎 선택된 ${selectedCount}명의 첨부파일을 다운로드합니다!`);
    };

    const sendMessage = () => {
      const selectedCount = selectedStudents.value.length;
      if (selectedCount === 0) {
        alert("⚠️ 학생을 선택해주세요!");
        return;
      }
      alert(`💬 선택된 ${selectedCount}명에게 메시지를 보냅니다!`);
    };

    const toggleSelectAll = () => {
      selectedStudents.value = selectAll.value
        ? filteredStudents.value.map((_, index) => index)
        : [];
    };

    const viewAttachment = (student) => {
      if (!student.originalName) {
        alert("📎 첨부파일이 없습니다.");
        return;
      }
      alert(
        `📎 ${student.memberName}의 첨부파일을 확인합니다! (${student.originalName})`
      );
    };

    const viewDetail = (student) => {
      if (!student.homeworkSubmitType) {
        alert("📋 완료된 과제만 상세 내용을 확인할 수 있습니다.");
        return;
      }
      alert(`📋 ${student.memberName}의 과제 상세 내용을 확인합니다!`);
    };

    // [핵심] 점수 업데이트 함수
    const updateScore = (student) => {
      if (student.homeworkScore < 0 || student.homeworkScore > 100) {
        alert("점수는 0~100 사이의 값을 입력해주세요.");
        student.homeworkScore = Math.min(
          100,
          Math.max(0, student.homeworkScore || 0)
        );
        return;
      }

      hasScoreChanges.value = true;
      console.log(
        `${student.memberName}의 점수가 ${student.homeworkScore}점으로 업데이트되었습니다.`
      );
    };

    const submitScores = () => {
      if (!hasScoreChanges.value) {
        alert("변경된 점수가 없습니다.");
        return;
      }

      const completedStudents = students.value.filter(
        (s) => s.homeworkSubmitType
      );
      const scoredStudents = completedStudents.filter(
        (s) => s.homeworkScore !== null
      );

      alert(
        `📊 ${scoredStudents.length}명의 점수가 성공적으로 반영되었습니다!`
      );
      hasScoreChanges.value = false;
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    const handleScroll = () => {
      showTopButton.value = window.pageYOffset > 300;
    };

    // 라이프사이클 훅
    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    return {
      // [수정] API 데이터
      assignResponse,
      students,
      isLoading,
      error,

      // [유지] 반응형 데이터
      showTopButton,
      showIncompleteOnly,
      selectAll,
      selectedStudents,
      hasScoreChanges,

      // [수정] 계산된 속성
      filteredStudents,
      summaryData,
      assignmentInfoData,
      status,
      tableColumns,
      actionButtons,
      moreOptionsLabel,
      filterLabel,
      selectAllLabel,
      topButtonTitle,

      // [유지] 유틸리티 함수
      formatDate,
      getStatusClass,
      getCompletionStatusClass,
      getCompletionStatusText,
      isStudentSelected,

      // [유지] 액션 메서드
      toggleOptions,
      downloadAttachments,
      sendMessage,
      toggleSelectAll,
      viewAttachment,
      viewDetail,
      updateScore,
      submitScores,
      scrollToTop,
      fetchDetail,
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

.assignment-manager {
  min-height: 100vh;
  background: #fff9e6;
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  color: #333;
  line-height: 1.6;
}

/* 메인 컨테이너 */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 브레드크럼 */
.breadcrumb-nav {
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.1);
  border: 3px solid #fff5d6;
}

.breadcrumb-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ff9800;
  margin-bottom: 0.5rem;
}

.breadcrumb-path {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffb74d;
  font-weight: 600;
}

.breadcrumb-path i {
  font-size: 0.8rem;
  color: #ffe066;
}

/* 과제 상세 카드 */
.assignment-detail-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.1);
  border: 3px solid #fff5d6;
  position: relative;
  overflow: hidden;
}

.assignment-detail-card::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 213, 79, 0.05) 0%,
    transparent 70%
  );
  animation: sparkle 6s ease-in-out infinite;
  pointer-events: none;
}

/* 과제 헤더 */
.assignment-header {
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.assignment-badge {
  background: linear-gradient(135deg, #9c27b0, #8e24aa);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  display: inline-block;
  margin-bottom: 1rem;
}

.assignment-title-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.ongoing {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.status-badge.completed {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
}

.assignment-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #8c6d32;
  margin: 0.5rem 0;
  flex: 1;
  min-width: 300px;
}

.assignment-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.registration-date {
  color: #ffb74d;
  font-weight: 600;
}

.more-options-btn {
  background: #fff5d6;
  border: none;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ff9800;
}

.more-options-btn:hover {
  background: #ffdd29;
  color: white;
  transform: scale(1.1);
}

/* 완료 현황 요약 */
.completion-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.summary-item {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  border: 3px solid #fff5d6;
  transition: all 0.3s ease;
}

.summary-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.15);
}

.summary-item.completed {
  border-color: #4caf50;
  background: linear-gradient(135deg, #f0fff0, #e8f5e8);
}

.summary-item.incomplete {
  border-color: #f44336;
  background: linear-gradient(135deg, #fff5f5, #ffebee);
}

.summary-item.total {
  border-color: #2196f3;
  background: linear-gradient(135deg, #f0f9ff, #e3f2fd);
}

.summary-status {
  font-size: 1rem;
  font-weight: 700;
  color: #8c6d32;
}

.summary-count {
  margin-top: 0.75rem;
}

.summary-count strong {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ff9800;
}

.summary-count span {
  font-size: 1rem;
  color: #ffb74d;
  margin-left: 0.2rem;
}

/* 과제 정보 */
.assignment-info {
  position: relative;
  z-index: 2;
}

.info-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.info-label {
  font-weight: 700;
  color: #8c6d32;
  padding: 1rem 0;
  border-right: 3px solid #fff5d6;
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.required {
  color: #f44336;
  margin-left: 0.3rem;
}

.info-value {
  padding: 1rem;
  background: #fffbf0;
  border-radius: 15px;
  border: 2px solid #fff5d6;
}

.content-wrapper {
  width: 100%;
}

.content-header {
  margin-bottom: 1rem;
}

.subject-path {
  background: linear-gradient(135deg, #e3f2fd, #f0f9ff);
  padding: 1rem 1.5rem;
  border-radius: 15px;
  border-left: 4px solid #2196f3;
  font-weight: 600;
  color: #1565c0;
  margin-bottom: 1rem;
}

.content-body {
  line-height: 1.8;
  color: #8c6d32;
}

.content-body p {
  margin-bottom: 0.5rem;
}

/* 첨부파일 섹션 */
.attachment-section {
  background: white;
  border: 2px solid #fff5d6;
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 1.5rem;
}

.attachment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.attachment-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #8c6d32;
}

.download-all-btn {
  background: linear-gradient(135deg, #ffdd29, #ffb74d);
  color: white;
  border: none;
  padding: 0.7rem 1.3rem;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.download-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 221, 41, 0.3);
}

.attachment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.attachment-item {
  margin-bottom: 0.75rem;
}

.file-button {
  background: none;
  border: none;
  color: #2196f3;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.3s ease;
  font-size: 0.95rem;
}

.file-button:hover {
  color: #1565c0;
}

.file-size {
  color: #ffb74d;
  font-weight: normal;
  margin-left: 0.5rem;
}

/* 학생별 현황 카드 */
.student-status-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.1);
  border: 3px solid #fff5d6;
}

.status-header h3 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #ff9800;
  margin-bottom: 1.5rem;
}

/* 필터 및 액션 버튼 */
.status-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-controls {
  display: flex;
  align-items: center;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  color: #8c6d32;
}

.filter-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #ffdd29;
}

.action-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.8rem 1.3rem;
  border: none;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.download {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
}

.action-btn.message {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

/* 학생 테이블 */
.student-table-container {
  overflow-x: auto;
  border-radius: 15px;
  border: 3px solid #fff5d6;
  margin-bottom: 2rem;
  background: white;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.student-table th,
.student-table td {
  padding: 1rem 0.75rem;
  text-align: center;
  border-bottom: 1px solid #fff5d6;
  font-size: 0.9rem;
}

.student-table th {
  background: linear-gradient(135deg, #fffbf0, #fff5d6);
  font-weight: 700;
  color: #8c6d32;
  position: sticky;
  top: 0;
  z-index: 10;
}

.student-table tbody tr {
  transition: all 0.3s ease;
}

.student-table tbody tr:hover {
  background: #fffbf0;
}

.student-table tbody tr.selected {
  background: linear-gradient(135deg, #fff5d6, #ffe066);
}

.checkbox-col {
  width: 60px;
}

.checkbox-col input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #ffdd29;
  cursor: pointer;
}

.student-name {
  font-weight: 600;
  text-align: left;
  color: #8c6d32;
  min-width: 80px;
}

.completion-status .status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-badge.completed {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.status-badge.incomplete {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.submission-time,
.modification-time {
  font-size: 0.85rem;
  color: #ffb74d;
  min-width: 120px;
}

.attachment-btn,
.detail-btn {
  background: none;
  border: none;
  color: #2196f3;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.3s ease;
  padding: 0.5rem;
}

.attachment-btn:hover,
.detail-btn:hover {
  color: #1565c0;
}

.attachment-btn i {
  font-size: 1.1rem;
}

.score-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.score-input {
  width: 70px;
  padding: 0.5rem;
  border: 2px solid #fff5d6;
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: inherit;
}

.score-input:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.2);
}

.score-input.final-score {
  border-color: #4caf50;
  background: linear-gradient(135deg, #f0fff0, #e8f5e8);
}

.score-total {
  color: #ffb74d;
  font-weight: 600;
  font-size: 0.9rem;
}

/* 점수 반영 버튼 */
.score-submit-section {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #fff5d6;
}

.score-submit-btn {
  background: linear-gradient(135deg, #ffdd29, #ffb74d);
  color: white;
  border: none;
  padding: 1.2rem 2.5rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.score-submit-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.score-submit-btn:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.3);
}

/* TOP 버튼 */
.top-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ffdd29, #ffb74d);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 3px solid #ffe082;
}

.top-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 221, 41, 0.4);
}

.top-icon {
  font-size: 1.5rem;
  margin-bottom: 2px;
}

.top-text {
  font-size: 0.7rem;
  font-weight: 700;
}

/* 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 애니메이션 */
@keyframes sparkle {
  0%,
  100% {
    opacity: 0.3;
    transform: rotate(0deg);
  }
  50% {
    opacity: 0.7;
    transform: rotate(180deg);
  }
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .main-container {
    padding: 1.5rem;
  }

  .completion-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-row {
    grid-template-columns: 150px 1fr;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 1rem;
  }

  .assignment-detail-card,
  .student-status-card {
    padding: 1.5rem;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .info-label {
    border-right: none;
    border-bottom: 2px solid #fff5d6;
    padding: 0.75rem 0;
  }

  .completion-summary {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .status-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .action-controls {
    justify-content: center;
  }

  .assignment-title-section {
    flex-direction: column;
    gap: 0.75rem;
  }

  .assignment-title {
    min-width: auto;
  }
}

@media (max-width: 640px) {
  .assignment-title {
    font-size: 1.3rem;
  }

  .breadcrumb-title {
    font-size: 1.5rem;
  }

  .student-table {
    font-size: 0.8rem;
  }

  .student-table th,
  .student-table td {
    padding: 0.75rem 0.5rem;
  }

  .action-btn {
    padding: 0.7rem 1rem;
    font-size: 0.8rem;
  }

  .top-button {
    width: 60px;
    height: 60px;
    bottom: 1.5rem;
    right: 1.5rem;
  }

  .top-icon {
    font-size: 1.3rem;
  }
}
</style>
