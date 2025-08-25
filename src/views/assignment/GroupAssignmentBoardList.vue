<template>
  <Header />
  <div class="group-assignment-page">
    <div class="assignment-container">
      <!-- 페이지 헤더 -->
      <div class="page-header">
        <div class="page-text">
          <h1 class="page-title">
            {{ isTeacher ? "👥 모둠과제 관리" : "🤝 모둠과제 목록" }}
          </h1>
          <p class="page-subtitle">{{ pageSubtitle }}</p>
          <nav class="cute-breadcrumb">
            <span>🏠 홈</span>
            <span class="separator">></span>
            <span class="current">{{
              isTeacher ? "👥 모둠과제 관리" : "🤝 모둠과제 목록"
            }}</span>
          </nav>
          <img src="https://i.ytimg.com/vi/Ky88xig1A9k/maxresdefault.jpg"></img>
        </div>
        <router-link
          v-if="isTeacher"
          to="/group-assignment/create"
          class="action-btn btn-primary"
        >
          ✨ 새 모둠과제 만들기
        </router-link>
      </div>

      <!-- 안내 상자 -->
      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <ul class="notice-list">
          <li v-for="notice in noticeMessages" :key="notice">
            {{ notice }}
          </li>
        </ul>
      </div>

      <!-- 검색 및 필터 영역 -->
      <div class="search-section">
        <div class="search-bar">
          <input
            type="text"
            v-model="searchKeyword"
            @keyup.enter="searchAssignments"
            placeholder="모둠과제 제목으로 검색해보세요..."
            class="search-input"
          />
          <button @click="searchAssignments" class="search-btn">🔍 검색</button>
          <button @click="resetSearch" class="reset-btn">🔄 초기화</button>
        </div>
        <div class="filter-controls">
          <select v-model="statusFilter" class="filter-select">
            <option value="all">전체 상태</option>
            <option value="recruiting">모집중</option>
            <option value="ongoing">진행중</option>
            <option value="completed">완료</option>
          </select>
          <select v-model="sortBy" @change="sortAssignments" class="sort-select">
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="deadline">마감일순</option>
          </select>
        </div>
      </div>

      <!-- 모둠과제 탭 -->
      <div class="assignment-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-button"
          :class="{ active: currentTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
          <span class="tab-count">{{ getTabCount(tab.key) }}</span>
        </button>
      </div>

      <!-- 모둠과제 콘텐츠 -->
      <div class="assignment-content">
        <!-- 모집중/진행중 탭 -->
        <div v-show="currentTab === 'active'" class="tab-panel">
          <div v-if="activeAssignments.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3 class="empty-title">{{ emptyState.active.title }}</h3>
            <p class="empty-description">
              {{ emptyState.active.description }}
            </p>
          </div>
          <div v-else class="assignment-grid">
            <div
              v-for="assignment in activeAssignments"
              :key="assignment.id"
              class="assignment-card"
              :class="assignment.status"
              @click="viewAssignmentDetail(assignment)"
            >
              <div class="card-header">
                <div class="assignment-badges">
                  <span class="assignment-status" :class="assignment.status">
                    {{ getStatusText(assignment.status) }}
                  </span>
                  <span class="group-type-badge">
                    {{ assignment.groupType }}
                  </span>
                  <div class="assignment-actions" v-if="isTeacher">
                    <button
                      class="action-btn edit"
                      @click.stop="editAssignment(assignment)"
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      class="action-btn delete"
                      @click.stop="deleteAssignment(assignment)"
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <h3 class="assignment-title">{{ assignment.title }}</h3>
                <p class="assignment-subject">📚 {{ assignment.subject }}</p>

                <!-- 모둠 정보 -->
                <div class="group-info">
                  <div class="group-stats">
                    <div class="stat-item">
                      <span class="stat-icon">👥</span>
                      <span class="stat-text">{{ assignment.maxMembers }}명</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-icon">📝</span>
                      <span class="stat-text">{{ assignment.totalGroups }}개 모둠</span>
                    </div>
                  </div>
                  
                  <!-- 교사용 정보 -->
                  <div v-if="isTeacher" class="teacher-info">
                    <div class="progress-section">
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          :style="{ width: assignment.progress + '%' }"
                        ></div>
                      </div>
                      <div class="progress-text">
                        <span>완료율 {{ assignment.progress }}%</span>
                        <span>👥 {{ assignment.participatingStudents }}명 참여</span>
                      </div>
                    </div>
                  </div>

                  <!-- 학생용 정보 -->
                  <div v-else class="student-info">
                    <div class="my-group-info" v-if="assignment.myGroup">
                      <div class="group-name">🏷️ {{ assignment.myGroup.name }}</div>
                      <div class="group-members">
                        <span 
                          v-for="member in assignment.myGroup.members" 
                          :key="member.id"
                          class="member-tag"
                        >
                          {{ member.name }}
                        </span>
                      </div>
                    </div>
                    <div v-else class="no-group">
                      <span class="no-group-text">아직 모둠에 참여하지 않았습니다</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button
                  class="action-btn btn-start"
                  @click.stop="viewAssignmentDetail(assignment)"
                >
                  {{ getActionButtonText(assignment) }}
                </button>
                <div class="due-date">
                  <i class="bi bi-calendar-event"></i>
                  <span>{{ formatDate(assignment.dueDate) }} 마감</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 완료된 모둠과제 탭 -->
        <div v-show="currentTab === 'completed'" class="tab-panel">
          <div v-if="completedAssignments.length === 0" class="empty-state">
            <div class="empty-icon">🏆</div>
            <h3 class="empty-title">{{ emptyState.completed.title }}</h3>
            <p class="empty-description">
              {{ emptyState.completed.description }}
            </p>
          </div>
          <div v-else class="assignment-grid">
            <div
              v-for="assignment in completedAssignments"
              :key="assignment.id"
              class="assignment-card completed"
              @click="viewAssignmentDetail(assignment)"
            >
              <div class="card-header">
                <div class="assignment-badges">
                  <span class="assignment-status completed">🏆 완료</span>
                  <div class="assignment-actions" v-if="isTeacher">
                    <button
                      class="action-btn results"
                      @click.stop="viewResults(assignment)"
                      title="결과 보기"
                    >
                      📊
                    </button>
                    <button
                      class="action-btn download"
                      @click.stop="downloadResults(assignment)"
                      title="다운로드"
                    >
                      💾
                    </button>
                  </div>
                </div>
              </div>

              <div class="card-body">
                <h3 class="assignment-title">{{ assignment.title }}</h3>
                <p class="assignment-subject">📚 {{ assignment.subject }}</p>

                <!-- 교사용 완료 정보 -->
                <div v-if="isTeacher" class="teacher-info completed">
                  <div class="stats-grid">
                    <div class="stat-item">
                      <span class="stat-label">참여율</span>
                      <strong class="stat-value">{{ assignment.participationRate }}%</strong>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">평균점수</span>
                      <strong class="stat-value">{{ assignment.averageScore }}점</strong>
                    </div>
                  </div>
                </div>

                <!-- 학생용 완료 정보 -->
                <div v-else class="student-info">
                  <div class="my-result" v-if="assignment.myResult">
                    <div class="result-score">
                      <span class="score-label">우리 모둠 점수:</span>
                      <strong class="score-value">{{ assignment.myResult.score }}점</strong>
                    </div>
                    <div class="result-rank">
                      <span class="rank-label">모둠 순위:</span>
                      <strong class="rank-value">{{ assignment.myResult.rank }}등</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button
                  class="action-btn btn-report"
                  @click.stop="viewAssignmentDetail(assignment)"
                >
                  📋 {{ isTeacher ? "결과 보기" : "점수 확인" }}
                </button>
                <div class="due-date">
                  <i class="bi bi-calendar-check"></i>
                  <span>{{ formatDate(assignment.completedDate) }} 완료</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 페이징 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ⏮️
        </button>
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          ◀️
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="['page-btn', { active: currentPage === page }]"
        >
          {{ page }}
        </button>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          ▶️
        </button>
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          ⏭️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";

const router = useRouter();
const currentTab = ref("active");
const searchKeyword = ref("");
const statusFilter = ref("all");
const sortBy = ref("latest");
const currentPage = ref(1);
const postsPerPage = 6;

// 계산된 속성들
const isTeacher = computed(
  () => localStorage.getItem("userType") === "teacher"
);

const pageSubtitle = computed(() =>
  isTeacher.value
    ? "친구들과 함께하는 협력 과제를 관리해요!"
    : "친구들과 함께 재미있는 모둠과제를 해봐요!"
);

const noticeMessages = computed(() =>
  isTeacher.value
    ? [
        "모둠과제는 학생들의 협업 능력을 기르는 중요한 활동입니다.",
        "모둠 구성은 자동 또는 수동으로 설정할 수 있어요.",
        "각 모둠의 진행상황을 실시간으로 확인할 수 있습니다.",
      ]
    : [
        "친구들과 함께 협력하여 과제를 완성해보세요!",
        "모둠원들과 소통하며 더 좋은 결과를 만들어봐요.",
        "각자의 역할을 나누어 효율적으로 진행해주세요! 🌟",
      ]
);

const emptyState = computed(() => ({
  active: {
    title: isTeacher.value
      ? "진행 중인 모둠과제가 없어요"
      : "참여할 수 있는 모둠과제가 없어요",
    description: isTeacher.value
      ? "새로운 모둠과제를 만들어서 협업 활동을 시작해보세요!"
      : "선생님이 새로운 모둠과제를 올리면 알려드릴게요!",
  },
  completed: {
    title: "완료된 모둠과제가 아직 없어요",
    description: "모둠과제를 완료하면 여기서 결과를 확인할 수 있어요.",
  },
}));

// 탭 및 데이터
const tabs = ref([
  { key: "active", label: "진행 중인 과제" },
  { key: "completed", label: "완료된 과제" },
]);

const groupAssignments = ref([
  {
    id: 1,
    title: "영어 단어장 만들기",
    subject: "2. What's This?",
    status: "recruiting",
    groupType: "자유모둠",
    maxMembers: 4,
    totalGroups: 6,
    progress: 25,
    participatingStudents: 18,
    dueDate: "2025-09-15",
    myGroup: {
      name: "영어킹왕짱",
      members: [
        { id: 1, name: "김병아" },
        { id: 2, name: "이보통" },
        { id: 3, name: "박열공" }
      ]
    },
    participationRate: 95,
    averageScore: 87,
    completedDate: "2025-08-20",
    myResult: {
      score: 92,
      rank: 2
    }
  },
  {
    id: 2,
    title: "알파벳 노래 합창 영상",
    subject: "1. Hello, ABC!",
    status: "ongoing",
    groupType: "랜덤모둠",
    maxMembers: 3,
    totalGroups: 8,
    progress: 75,
    participatingStudents: 24,
    dueDate: "2025-09-10",
    myGroup: {
      name: "ABC마스터",
      members: [
        { id: 4, name: "정천천" },
        { id: 5, name: "윤차분" }
      ]
    },
    participationRate: 88,
    averageScore: 91,
    completedDate: "2025-08-15",
    myResult: {
      score: 95,
      rank: 1
    }
  },
  {
    id: 3,
    title: "교실 영어 명령어 연극",
    subject: "3. Sit Down, Please",
    status: "completed",
    groupType: "지정모둠",
    maxMembers: 5,
    totalGroups: 5,
    progress: 100,
    participatingStudents: 25,
    dueDate: "2025-08-30",
    myGroup: {
      name: "연극단친구들",
      members: [
        { id: 6, name: "고민중" },
        { id: 7, name: "황지켜" },
        { id: 8, name: "홍도와" }
      ]
    },
    participationRate: 100,
    averageScore: 94,
    completedDate: "2025-08-30",
    myResult: {
      score: 98,
      rank: 1
    }
  },
]);

const filteredAssignments = computed(() => {
  let filtered = [...groupAssignments.value];

  // 검색 필터
  if (searchKeyword.value.trim()) {
    filtered = filtered.filter((assignment) =>
      assignment.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
    );
  }

  // 상태 필터
  if (statusFilter.value !== "all") {
    filtered = filtered.filter((assignment) => assignment.status === statusFilter.value);
  }

  // 정렬
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case "latest":
        return new Date(b.dueDate) - new Date(a.dueDate);
      case "oldest":
        return new Date(a.dueDate) - new Date(b.dueDate);
      case "deadline":
        return new Date(a.dueDate) - new Date(b.dueDate);
      default:
        return 0;
    }
  });

  return filtered;
});

const activeAssignments = computed(() =>
  filteredAssignments.value.filter((a) => a.status === "recruiting" || a.status === "ongoing")
);

const completedAssignments = computed(() =>
  filteredAssignments.value.filter((a) => a.status === "completed")
);

// 페이징 관련
const totalPages = computed(() => {
  const assignments = currentTab.value === "active" ? activeAssignments.value : completedAssignments.value;
  return Math.ceil(assignments.length / postsPerPage);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;

  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(total, start + 4);
    } else {
      start = Math.max(1, end - 4);
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// 유틸리티 함수들
const getTabCount = (tabKey) =>
  tabKey === "active"
    ? activeAssignments.value.length
    : completedAssignments.value.length;

const getStatusText = (status) => {
  const statusMap = {
    recruiting: "🔔 모집중",
    ongoing: "🏃 진행중",
    completed: "🏆 완료"
  };
  return statusMap[status] || "📝 대기중";
};

const getActionButtonText = (assignment) => {
  if (isTeacher.value) {
    return "📊 관리하기";
  }
  
  if (assignment.status === "recruiting") {
    return assignment.myGroup ? "📝 참여하기" : "🤝 모둠 참가";
  } else if (assignment.status === "ongoing") {
    return "🚀 과제하기";
  }
  return "📋 확인하기";
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });

// 액션 메서드들
const switchTab = (tabKey) => {
  currentTab.value = tabKey;
  currentPage.value = 1;
};

const searchAssignments = () => {
  currentPage.value = 1;
};

const resetSearch = () => {
  searchKeyword.value = "";
  statusFilter.value = "all";
  currentPage.value = 1;
};

const sortAssignments = () => {
  currentPage.value = 1;
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const viewAssignmentDetail = (assignment) => {
  if (isTeacher.value) {
    router.push({ name: "GroupAssignmentManage", params: { id: assignment.id } });
    return;
  }

  if (assignment.status === "completed") {
    router.push({ name: "GroupAssignmentResult", params: { id: assignment.id } });
    return;
  }

  router.push({ name: "GroupAssignmentWork", params: { id: assignment.id } });
};

const editAssignment = (assignment) => {
  if (assignment.status === "completed") {
    alert("완료된 모둠과제는 수정할 수 없습니다.");
    return;
  }
  router.push({ name: "GroupAssignmentEdit", params: { id: assignment.id } });
};

const deleteAssignment = (assignment) => {
  if (assignment.status === "completed") {
    alert("완료된 모둠과제는 삭제할 수 없습니다.");
    return;
  }

  if (confirm(`'${assignment.title}' 모둠과제를 정말 삭제할까요?`)) {
    groupAssignments.value = groupAssignments.value.filter(
      (item) => item.id !== assignment.id
    );
    alert("모둠과제가 삭제되었습니다.");
  }
};

const viewResults = (assignment) => {
  router.push({ name: "GroupAssignmentResult", params: { id: assignment.id } });
};

const downloadResults = (assignment) => {
  alert(`'${assignment.title}' 모둠과제 결과를 다운로드합니다.`);
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

.group-assignment-page {
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

/* 검색 및 필터 영역 */
.search-section {
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.1);
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #ffe066;
  border-radius: 15px;
  font-size: 1rem;
  background: #fffbf0;
  color: #8c6d32;
}

.search-input:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.1);
}

.search-btn,
.reset-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn {
  background: #ffdd29;
  color: white;
}

.reset-btn {
  background: #fff5d6;
  color: #ff9800;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.filter-select,
.sort-select {
  padding: 8px 15px;
  border: 2px solid #ffe066;
  border-radius: 10px;
  background: white;
  color: #8c6d32;
  font-weight: 600;
  cursor: pointer;
}

/* 모둠과제 탭 */
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

/* 모둠과제 그리드 */
.assignment-grid {
  display: grid;
  background: #fffbf0;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 모둠과제 카드 */
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

.assignment-card.recruiting {
  border-color: #4caf50;
}

.assignment-card.ongoing {
  border-color: #2196f3;
}

.assignment-card.completed {
  border-color: #ff9800;
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
  flex-wrap: wrap;
}

.assignment-status {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.assignment-status.recruiting {
  background: #e8f5e8;
  color: #4caf50;
}

.assignment-status.ongoing {
  background: #e3f2fd;
  color: #2196f3;
}

.assignment-status.completed {
  background: #fff3e0;
  color: #ff9800;
}

.group-type-badge {
  background: #f3e5f5;
  color: #9c27b0;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}

.assignment-actions {
  display: flex;
  gap: 0.5rem;
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

.action-btn.edit,
.action-btn.delete,
.action-btn.results,
.action-btn.download {
  padding: 0.5rem;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #fff5d6;
  color: #ff9800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.edit:hover {
  background: #2196f3;
  color: white;
}

.action-btn.delete:hover {
  background: #f44336;
  color: white;
}

.action-btn.results:hover {
  background: #4caf50;
  color: white;
}

.action-btn.download:hover {
  background: #9c27b0;
  color: white;
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

.btn-start {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.btn-report {
  background: #a855f7;
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.btn-report:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
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

.assignment-subject {
  color: #ffb74d;
  margin: 0 0 1rem;
  font-weight: 600;
}

/* 모둠 정보 */
.group-info {
  background: #fffbf0;
  border-radius: 15px;
  padding: 1rem;
  border: 2px solid #fff5d6;
}

.group-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.stat-icon {
  font-size: 1rem;
}

/* 교사 정보 */
.teacher-info .progress-section .progress-bar {
  width: 100%;
  height: 8px;
  background: #fff5d6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.teacher-info .progress-section .progress-fill {
  height: 100%;
  background: #ffdd29;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.teacher-info .progress-section .progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
}

.teacher-info.completed .stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  background: #fffbf0;
  border-radius: 15px;
  padding: 1rem;
  border: 2px solid #fff5d6;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #ffb74d;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.2rem;
  color: #ff9800;
  font-weight: 700;
}

/* 학생 정보 */
.student-info {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1rem;
}

.my-group-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-name {
  font-weight: 700;
  color: #2196f3;
  font-size: 0.9rem;
}

.group-members {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.member-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.no-group {
  text-align: center;
  padding: 0.5rem;
}

.no-group-text {
  color: #999;
  font-style: italic;
  font-size: 0.85rem;
}

.my-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-score,
.result-rank {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.score-label,
.rank-label {
  font-size: 0.8rem;
  color: #666;
}

.score-value,
.rank-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f57c00;
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

.due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffb74d;
  font-weight: 600;
  font-size: 0.9rem;
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

/* 페이징 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  background: #fffbf0;
  border-top: 2px solid #fff5d6;
  border-radius: 0 0 20px 20px;
}

.page-btn {
  padding: 8px 12px;
  border: 2px solid #ffe066;
  background: white;
  color: #ff9800;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 40px;
}

.page-btn:hover:not(:disabled) {
  background: #ffe066;
  transform: translateY(-2px);
}

.page-btn.active {
  background: #ffdd29;
  color: white;
  border-color: #ffdd29;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .group-assignment-page {
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

  .search-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
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

  .assignment-badges {
    flex-direction: column;
    align-items: stretch;
  }

  .group-stats {
    flex-direction: column;
    gap: 0.5rem;
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