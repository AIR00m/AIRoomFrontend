<template>
  <Header />
  <div class="assignment-page">
    <div class="assignment-container">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-icon">⏳</div>
        <p class="loading-text">과제 데이터를 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠</div>
        <p class="error-text">{{ error }}</p>
        <button @click="fetchAssignments()" class="retry-btn">다시 시도</button>
      </div>

      <template v-else>
        <!-- 페이지 헤더 -->
        <div class="page-header">
          <div class="page-text">
            <h1 class="page-title">
              {{ isTeacher ? "📝 과제 관리" : "📚 과제 목록" }}
            </h1>
            <p class="page-subtitle">
              {{
                isTeacher
                  ? "우리 반 친구들의 과제를 관리해요!"
                  : "선생님이 내주신 과제를 확인해요!"
              }}
            </p>
            <nav class="cute-breadcrumb">
              <span>🏠 홈</span>
              <span class="separator">></span>
              <span class="current">{{
                isTeacher ? "📝 과제 관리" : "📚 과제 목록"
              }}</span>
            </nav>
          </div>
          <router-link
            v-if="isTeacher"
            to="/assignment/create"
            class="action-btn btn-primary"
          >
            ✏️ 새 과제 출제하기
          </router-link>
        </div>

        <div class="notice-box">
          <span class="notice-icon">💡</span>
          <ul class="notice-list">
            <li v-for="(notice, index) in noticeMessages" :key="index">
              {{ notice }}
            </li>
          </ul>
        </div>

        <div class="assignment-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-button"
            :class="{ active: currentTab === tab.key }"
            @click="
              currentTab = tab.key;
              currentPage = 1;
            "
          >
            {{ tab.label }}
            <span class="tab-count">{{ getTabCount(tab.key) }}</span>
          </button>
        </div>

        <div class="controls-bar">
          <div class="sort-controls">
            <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'">
              마감일순 {{ sortOrder === "asc" ? "↑" : "↓" }}
            </button>
          </div>
          <div class="items-per-page">
            <select v-model="itemsPerPage" @change="currentPage = 1">
              <option value="6">6개씩 보기</option>
              <option value="12">12개씩 보기</option>
              <option value="18">18개씩 보기</option>
            </select>
          </div>
        </div>

        <div class="assignment-content">
          <div
            v-for="tab in tabs"
            v-show="currentTab === tab.key"
            :key="tab.key"
            class="tab-panel"
          >
            <div
              v-if="filteredAssignments(tab.key).length === 0"
              class="empty-state"
            >
              <div class="empty-icon">
                {{ tab.key === "ongoing" ? "🔭" : "✅" }}
              </div>
              <h3 class="empty-title">{{ emptyState[tab.key].title }}</h3>
              <p class="empty-description">
                {{ emptyState[tab.key].description }}
              </p>
            </div>
            <div v-else class="assignment-grid">
              <div
                v-for="assignment in filteredAssignments(tab.key)"
                :key="assignment.assignBoardNo"
                class="assignment-card"
                :class="tab.key"
                @click="goDetail(assignment)"
              >
                <div class="card-header">
                  <div class="assignment-badges">
                    <span
                      class="assignment-type"
                      :class="
                        assignment.groupAssignType ? 'group' : 'individual'
                      "
                    >
                      {{
                        assignment.groupAssignType
                          ? "👥 모둠과제"
                          : "🧑 개별과제"
                      }}
                    </span>
                    <div class="right-badges">
                      <span class="assignment-status" :class="tab.key">
                        {{ tab.key == "ongoing" ? "🏃 진행중" : "✅ 종료" }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="card-body">
                  <h3 class="assignment-title">
                    {{ assignment.assignBoardTitle }}
                  </h3>
                  <div class="assignment-date-info">
                    <div class="start-date">
                      <i class="bi bi-calendar-plus"></i>
                      <span>{{ formatDate(assignment.startDate) }} 시작</span>
                    </div>
                  </div>
                  <div class="student-info" v-if="!isTeacher">
                    <div class="info-item">
                      <i class="bi bi-person-check"></i>
                      <span>{{ getSubmitStatusText(assignment) }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-footer">
                  <button class="action-btn" @click.stop="goDetail(assignment)">
                    {{ isTeacher ? "관리하기" : "시작하기" }}
                  </button>
                  <div class="due-date">
                    <i class="bi bi-calendar-event"></i>
                    <span>{{ formatDate(assignment.dueDate) }} 마감</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages(currentTab) > 1" class="pagination">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="page-btn"
          >
            이전
          </button>
          <span class="page-info">
            {{ currentPage }} / {{ totalPages(currentTab) }}
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages(currentTab)"
            class="page-btn"
          >
            다음
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Header from "@/components/common/Header.vue";
import apiClient from "@/utils/apiClient";

const authStore = useAuthStore();
const router = useRouter();
const isTeacher = computed(() => authStore.isTeacher);
const currentTab = ref("ongoing");

// 데이터와 로딩 상태
const assignments = ref([]);
const isLoading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(6);
const sortOrder = ref("asc");

const today = new Date();
today.setHours(0, 0, 0, 0);

// 탭 설정
const tabs = [
  { key: "ongoing", label: "진행 중인 과제" },
  { key: "completed", label: "종료된 과제" },
];

const emptyState = {
  ongoing: {
    title: "진행 중인 과제가 없어요",
    description: "새로운 과제가 생기면 바로 알려줄게요!",
  },
  completed: {
    title: "종료된 과제가 아직 없어요",
    description: "과제를 완료하면 이곳에서 확인할 수 있어요.",
  },
};

const noticeMessages = computed(() =>
  isTeacher.value
    ? [
        "수업/AI 맞춤 학습 과제는 다른 메뉴에서 출제하세요.",
        "과제 출제 후 등록된 학생은 최초 로그인 시 자동 출제됩니다.",
      ]
    : [
        "출제된 과제를 확인하고 제출하세요.",
        "마감일을 잘 확인하고 시간 안에 완료해주세요! 💪",
      ]
);

// 사용자 정보 초기화 함수
const initializeData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Auth Store에서 인증 상태 확인
    if (!authStore.isAuthenticated) {
      throw new Error("로그인이 필요합니다.");
    }

    // 사용자 정보 가져오기
    const userInfo = authStore.getUserInfo();

    if (!userInfo.classroomNo) {
      throw new Error("교실 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
    }

    console.log("📚 사용자 정보 확인됨:", userInfo);

    // 과제 목록 로드
    await fetchAssignments(userInfo);
  } catch (err) {
    error.value = err.message;
    console.error("데이터 초기화 실패:", err);

    // 인증 오류인 경우 로그인 페이지로 리다이렉트
    if (err.message.includes("로그인") || err.message.includes("인증")) {
      router.push("/login");
    }
  } finally {
    isLoading.value = false;
  }
};

// 수정된 fetchAssignments 함수
const fetchAssignments = async (userInfo = null) => {
  try {
    // userInfo가 없으면 Auth Store에서 가져오기
    if (!userInfo) {
      userInfo = authStore.getUserInfo();
    }

    // 필수 데이터 검증
    if (!userInfo.classroomNo) {
      throw new Error("교실 정보가 없습니다.");
    }

    const params = new URLSearchParams({
      userType: userInfo.userType === "teacher" ? "TEACHER" : "STUDENT",
    });

    // 학생인 경우 classroomStudentNo 추가
    if (userInfo.userType === "student" && userInfo.classRoomStudentNo) {
      params.append(
        "classroomStudentNo",
        userInfo.classRoomStudentNo.toString()
      );
    }

    console.log(
      "🌐 API 호출:",
      `/assign/list/${userInfo.classroomNo}?${params}`
    );

    const response = await apiClient.get(
      `/assign/list/${userInfo.classroomNo}?${params}`
    );

    if (response && Array.isArray(response)) {
      console.log("📋 과제 개수:", response.length);

      // 각 과제 데이터 상세 출력
      response.forEach((assignment, index) => {
        console.log(`📝 과제 ${index + 1}:`, {
          assignBoardNo: assignment.assignBoardNo,
          title: assignment.assignBoardTitle,
          startDate: assignment.startDate,
          dueDate: assignment.dueDate,
          submitStatus: assignment.submitStatus,
          groupAssignType: assignment.groupAssignType,
          전체데이터: assignment,
        });
      });
    } else {
      console.warn("⚠️ 응답이 배열이 아니거나 비어있음:", response);
    }

    assignments.value = response || [];
    console.log("✅ 과제 데이터 로드 완료:", assignments.value.length + "개");
  } catch (err) {
    const errorMessage =
      err.message || "과제 데이터를 불러오는데 실패했습니다.";

    error.value = errorMessage;
    console.error("API 호출 에러:", err);
    throw err;
  }
};

// 전체 필터링된 데이터를 가져오는 함수
const getAllFilteredAssignments = (tabKey) => {
  const toDate = (v) => {
    const d = new Date(v);
    return isNaN(d) ? null : d;
  };
  const asBool = (v) =>
    typeof v === "boolean" ? v : String(v).toLowerCase() === "true";

  let filtered = (assignments.value || []).filter((a) => {
    const due = toDate(a.dueDate);
    const submitted = asBool(a.submitStatus);

    if (isTeacher.value) {
      if (!due) return false;
      return tabKey === "ongoing" ? due >= today : due < today;
    } else {
      if (tabKey === "ongoing") {
        return submitted === false && due && due >= today;
      } else {
        return submitted === true || (due && due < today);
      }
    }
  });

  // 마감일 기준 정렬
  filtered.sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return sortOrder.value === "asc" ? dateA - dateB : dateB - dateA;
  });

  return filtered;
};

// 페이징이 적용된 필터링
const filteredAssignments = computed(() => {
  return (tabKey) => {
    const allFiltered = getAllFilteredAssignments(tabKey);
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return allFiltered.slice(start, end);
  };
});

// 탭별 카운트
const getTabCount = (tabKey) => {
  return getAllFilteredAssignments(tabKey).length;
};

// 총 페이지 수
const totalPages = (tabKey) => {
  const totalItems = getAllFilteredAssignments(tabKey).length;
  return Math.ceil(totalItems / itemsPerPage.value);
};

// 제출 상태 텍스트변환
function getSubmitStatusText(assignment) {
  const due = new Date(assignment.dueDate);
  const submitted = String(assignment.submitStatus).toLowerCase() === "true";

  if (submitted) return "제출했어요";
  if (due < new Date()) return "제출하지 못했어요 ❌";
  return "아직 제출 안 했어요";
}

// 날짜 포맷
function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return String(date);
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

// 과제 카드 클릭 이동
function goDetail(assignment) {
  if (isTeacher.value) {
    router.push({
      name: "AssignmentEvaluation",
      params: { id: assignment.assignBoardNo },
    });
  } else {
    router.push({
      name: "AssignmentDetail",
      params: { id: assignment.assignBoardNo },
    });
  }
}

onMounted(() => {
  initializeData();
});
</script>

<style scoped>
/* 전역 폰트 및 배경 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}

.assignment-page {
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.assignment-container {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
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
  flex-shrink: 0;
}

.notice-list {
  list-style: "• ";
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 과제 탭 */
.assignment-tabs {
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

.tab-count {
  margin-left: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 0.8em;
}

.tab-button.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1.5rem;
  background: #fffbf0;
  border: 2px solid #ffe066;
  border-radius: 20px;
}

/* 과제 그리드 */
.assignment-grid {
  display: grid;
  background: #fffbf0;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 과제 카드 */
.assignment-card {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;
  cursor: pointer;
}

.assignment-card:hover {
  border-color: #ffdd29;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.2);
}

.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #fff5d6;
}

.assignment-badges {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.right-badges {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.assignment-type {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.assignment-date-info {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 0.8rem;
  align-items: center;
}

.start-date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  background: #f3e5f5;
  color: #7b1fa2;
  font-weight: 700;
  border-radius: 10px;
  padding: 0.2rem 0.9rem 0.2rem 0.6rem;
  margin-bottom: 0.45rem;
}

.start-date i {
  font-size: 1.15rem;
  margin-right: 0.15rem;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffb74d;
  font-weight: 600;
  font-size: 0.9rem;
  margin-left: 0;
}

.assignment-type.individual {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.assignment-type.group {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #ce93d8;
}

.assignment-status {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.assignment-status.ongoing {
  background: #fff3e0;
  color: #f57c00;
}

.assignment-status.completed {
  background: #e8f5e8;
  color: #388e3c;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-size: 0.85rem;
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

.card-body {
  padding: 1.25rem;
  flex-grow: 1;
}

.assignment-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #8c6d32;
  margin: 0 0 0.75rem;
  line-height: 1.4;
}

.student-info {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.card-footer {
  padding: 0.75rem 1.25rem;
  background: #fff9e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fffbf0;
  border-radius: 20px;
  border: 3px solid #ffb74d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: #ffb74d;
  margin: 0;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: #ffdd29;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  margin: 2rem 0;
}

.loading-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: spin 2s linear infinite;
}

.loading-text {
  color: #ff9800;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

/* 에러 상태 */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #ffebee;
  border-radius: 20px;
  border: 3px solid #ffcdd2;
  margin: 2rem 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-text {
  color: #d32f2f;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
}

.retry-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #d32f2f;
  transform: translateY(-2px);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.sort-controls button {
  background: linear-gradient(135deg, #ffdd29, #ffb74d);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-family: inherit;
}

.sort-controls button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 221, 41, 0.3);
}

.items-per-page select {
  background: white;
  border: 2px solid #fff5d6;
  border-radius: 15px;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #8c6d32;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  font-size: 0.9rem;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .assignment-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .assignment-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .assignment-tabs {
    flex-direction: column;
  }

  .tab-button {
    padding: 15px;
    font-size: 0.9rem;
  }

  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .assignment-badges {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .right-badges {
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .assignment-card {
    margin: 0;
  }

  .card-body {
    padding: 1rem;
  }
}

/* 접근성 및 사용성 개선 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

button:focus,
select:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 호버 효과는 마우스가 있는 기기에서만 */
@media (hover: none) {
  .assignment-card:hover {
    transform: none;
    box-shadow: none;
  }

  .action-btn:hover {
    transform: none;
  }
}
</style>
