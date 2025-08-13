<template>
  <NavRight />

  <div class="assignment-page">
    <!-- 페이지 헤더 -->
    <header class="assignment-header">
      <h2>📚 과제 목록</h2>
      <p class="sub-text">
        선생님이 출제한 과제를 확인하고 응시할 수 있습니다.
      </p>
    </header>

    <!-- 과제 네비게이션 -->
    <div class="assignment-nav">
      <button class="nav-btn" @click="previousAssignment">‹</button>
      <div class="unit-info">{{ assignmentUnit }} 단원</div>
      <button class="nav-btn" @click="nextAssignment">›</button>
    </div>

    <!-- 진행 현황 -->
    <div class="completion-info">
      응시 완료 수
      <strong>{{ assignmentCompleted }} / {{ assignmentTotal }} 개</strong>
    </div>

    <!-- 과제 목록/메시지 -->
    <section class="assignment-section">
      <div v-if="assignments.length === 0" class="assignment-message">
        🧩 아직 과제가 없어요. 선생님을 기다려 봐요!
      </div>

      <ul v-else class="assignment-list">
        <li
          v-for="(item, idx) in assignments"
          :key="idx"
          class="assignment-item"
          @click="startAssignment(item)"
        >
          <div class="title">{{ item.title }}</div>
          <div class="info">
            마감일: {{ item.dueDate }} | 배점: {{ item.score }} 점
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
import { ref } from "vue";
import NavRight from "@/components/Header.vue";
export default {
  name: "AssignmentPage",
  components: {
    NavRight,
  },
  setup() {
    const assignmentUnit = ref(3);
    const assignmentCompleted = ref(1);
    const assignmentTotal = ref(5);

    // 과제 데이터 예시
    const assignments = ref([
      {
        title: "2. What's This? 06. AI Writing",
        dueDate: "2025-08-20",
        score: 50,
      },
      {
        title: "Unit 3: Reading Comprehension",
        dueDate: "2025-08-25",
        score: 40,
      },
    ]);

    const previousAssignment = () => {
      alert("이전 단원으로 이동합니다.");
    };

    const nextAssignment = () => {
      alert("다음 단원으로 이동합니다.");
    };

    const startAssignment = (item) => {
      alert(`과제 "${item.title}"를 시작합니다!`);
      // 라우터로 과제 상세 페이지 이동 가능
    };

    return {
      assignmentUnit,
      assignmentCompleted,
      assignmentTotal,
      assignments,
      previousAssignment,
      nextAssignment,
      startAssignment,
    };
  },
};
</script>

<style scoped>
.assignment-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.assignment-header {
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.assignment-header h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #034582;
}

.sub-text {
  font-size: 0.9rem;
  color: #6b7280;
  margin-top: 4px;
}

.assignment-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
}

.unit-info {
  font-size: 1.1rem;
  font-weight: 600;
}

.completion-info {
  margin-bottom: 1.5rem;
  color: #6b7280;
}

.assignment-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
}

.assignment-message {
  text-align: center;
  color: #6b7280;
}

.assignment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.assignment-item {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.assignment-item:hover {
  background: #f1f5f9;
}

.assignment-item .title {
  font-weight: 600;
  color: #374151;
}

.assignment-item .info {
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.2rem;
}
</style>
