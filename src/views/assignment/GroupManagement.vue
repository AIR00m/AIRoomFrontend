<template>
  <Header />
  <div class="group-management">
    <!-- 메인 컨테이너 -->
    <div class="main-container">
      <!-- 브레드크럼 -->
      <div class="breadcrumb-section">
        <h1 class="page-title">모둠 관리</h1>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="#">홈</a></li>
            <li class="breadcrumb-item active" aria-current="page">
              모둠 관리
            </li>
          </ol>
        </nav>
      </div>

      <!-- 안내 정보 -->
      <div class="info-card">
        <div class="info-content">
          <ul class="info-list">
            <li>모둠 그룹은 과제 출제 시에 사용하는 모둠 구성의 조합입니다.</li>
            <li>
              그룹에 할당된 과제가 있을 경우 삭제는 불가하며, 제출한 모둠이 있는
              경우 수정/삭제 불가합니다.
            </li>
          </ul>
        </div>
      </div>

      <!-- 그룹 목록 헤더 -->
      <div class="group-list-header">
        <div class="total-count">
          총 <span class="number">{{ groupList.length }}</span
          >개
        </div>
        <button class="btn-create-group" @click="openCreateDialog">
          <i class="bi bi-plus-circle"></i> 새 모둠 그룹 생성
        </button>
      </div>

      <!-- 모둠 그룹 목록 -->
      <div class="group-container">
        <div v-for="group in groupList" :key="group.id" class="group-accordion">
          <div
            class="accordion-header"
            @click="toggleGroup(group.id)"
            :class="{ active: expandedGroups.has(group.id) }"
          >
            <div class="group-info">
              <h3 class="group-name">{{ group.name }}</h3>
              <div class="group-stats">
                <span class="stat-item"
                  >모둠 <em class="highlight">{{ group.teams.length }}</em
                  >개</span
                >
                <span class="divider">/</span>
                <span class="stat-item"
                  >할당된 과제
                  <em class="highlight">{{ group.assignedTasks }}</em
                  >개</span
                >
              </div>
            </div>
            <div class="group-actions">
              <button
                class="btn-assign-task"
                @click.stop="assignTask(group.id)"
              >
                <i class="bi bi-file-earmark-plus"></i> 과제 출제
              </button>
              <i
                class="bi bi-chevron-down accordion-icon"
                :class="{ rotated: expandedGroups.has(group.id) }"
              ></i>
            </div>
          </div>

          <div v-show="expandedGroups.has(group.id)" class="accordion-content">
            <div class="group-content">
              <!-- 그룹 관리 버튼들 -->
              <div class="group-manage-buttons">
                <button
                  class="btn-manage delete"
                  @click="deleteGroup(group.id)"
                  :disabled="group.assignedTasks > 0"
                >
                  <i class="bi bi-trash"></i> 삭제
                </button>
                <button
                  class="btn-manage edit"
                  @click="editGroup(group.id)"
                  :disabled="group.assignedTasks > 0"
                >
                  <i class="bi bi-pencil"></i> 수정
                </button>
              </div>

              <!-- 할당된 과제 정보 -->
              <div class="assigned-tasks">
                <h4 class="section-title">할당된 과제</h4>
                <div v-if="group.assignedTasks === 0" class="no-tasks">
                  아직 할당된 과제가 없습니다.
                </div>
                <div v-else class="task-list">
                  <!-- 과제 목록이 있다면 여기에 표시 -->
                </div>
              </div>

              <!-- 모둠 구성 -->
              <div class="team-composition">
                <div
                  v-for="(team, index) in group.teams"
                  :key="index"
                  class="team-card"
                >
                  <h4 class="team-title">{{ index + 1 }}모둠</h4>
                  <ul class="student-list">
                    <li
                      v-for="student in team.students"
                      :key="student.id"
                      class="student-item"
                    >
                      <span class="student-number">{{ student.number }}.</span>
                      <span class="student-name">{{ student.name }}</span>
                      <span class="student-info"
                        >({{ student.gender }} / {{ student.level }})</span
                      >
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 모둠 그룹 생성/수정 모달 -->
    <div v-if="showGroupDialog" class="modal-overlay" @click="closeGroupDialog">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ isEditMode ? "모둠 그룹 수정" : "새 모둠 그룹 생성" }}
          </h3>
          <button class="modal-close" @click="closeGroupDialog">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">그룹 이름</label>
            <input
              v-model="groupForm.name"
              type="text"
              class="form-input"
              placeholder="모둠 그룹 이름을 입력하세요"
            />
          </div>

          <div class="form-group">
            <label class="form-label">모둠 구성 방식</label>
            <div class="composition-options">
              <button
                v-for="option in compositionOptions"
                :key="option.value"
                class="composition-btn"
                :class="{ active: groupForm.composition === option.value }"
                @click="groupForm.composition = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">모둠당 인원</label>
            <select v-model="groupForm.membersPerTeam" class="form-select">
              <option value="3">3명</option>
              <option value="4">4명</option>
              <option value="5">5명</option>
              <option value="6">6명</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeGroupDialog">취소</button>
          <button class="btn-confirm" @click="saveGroup">
            {{ isEditMode ? "수정" : "생성" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import Header from "@/components/common/Header.vue";
export default {
  name: "GroupManagement",
  components: {
    Header,
  },
  setup() {
    // 반응형 데이터
    const expandedGroups = ref(new Set());
    const showGroupDialog = ref(false);
    const isEditMode = ref(false);
    const editingGroupId = ref(null);

    // 폼 데이터
    const groupForm = reactive({
      name: "",
      composition: "auto",
      membersPerTeam: 4,
    });

    // 구성 방식 옵션
    const compositionOptions = ref([
      { value: "auto", label: "자동 구성" },
      { value: "level", label: "실력별 구성" },
      { value: "random", label: "무작위 구성" },
      { value: "manual", label: "수동 구성" },
    ]);

    // 모둠 그룹 데이터
    const groupList = ref([
      {
        id: 1,
        name: "모둠 그룹 1",
        assignedTasks: 0,
        teams: [
          {
            students: [
              {
                id: 1,
                number: 1,
                name: "학생1",
                gender: "여자",
                level: "빠른",
              },
              {
                id: 2,
                number: 2,
                name: "학생2",
                gender: "여자",
                level: "빠른",
              },
              {
                id: 4,
                number: 4,
                name: "학생4",
                gender: "여자",
                level: "느린",
              },
              {
                id: 7,
                number: 7,
                name: "학생7",
                gender: "여자",
                level: "빠른",
              },
            ],
          },
        ],
      },
    ]);

    // 메서드들
    const toggleGroup = (groupId) => {
      if (expandedGroups.value.has(groupId)) {
        expandedGroups.value.delete(groupId);
      } else {
        expandedGroups.value.add(groupId);
      }
    };

    const openCreateDialog = () => {
      isEditMode.value = false;
      editingGroupId.value = null;
      groupForm.name = "";
      groupForm.composition = "auto";
      groupForm.membersPerTeam = 4;
      showGroupDialog.value = true;
    };

    const editGroup = (groupId) => {
      const group = groupList.value.find((g) => g.id === groupId);
      if (group) {
        isEditMode.value = true;
        editingGroupId.value = groupId;
        groupForm.name = group.name;
        groupForm.composition = "auto";
        groupForm.membersPerTeam = 4;
        showGroupDialog.value = true;
      }
    };

    const closeGroupDialog = () => {
      showGroupDialog.value = false;
      isEditMode.value = false;
      editingGroupId.value = null;
    };

    const saveGroup = () => {
      if (!groupForm.name.trim()) {
        alert("그룹 이름을 입력해주세요.");
        return;
      }

      if (isEditMode.value) {
        // 수정 모드
        const groupIndex = groupList.value.findIndex(
          (g) => g.id === editingGroupId.value
        );
        if (groupIndex !== -1) {
          groupList.value[groupIndex].name = groupForm.name;
          alert("모둠 그룹이 수정되었습니다.");
        }
      } else {
        // 생성 모드
        const newGroup = {
          id: Date.now(),
          name: groupForm.name,
          assignedTasks: 0,
          teams: generateTeams(),
        };
        groupList.value.push(newGroup);
        alert("새 모둠 그룹이 생성되었습니다.");
      }

      closeGroupDialog();
    };

    const generateTeams = () => {
      // 실제로는 선택된 구성 방식에 따라 모둠을 생성
      // 여기서는 예시 데이터 반환
      return [
        {
          students: [
            { id: 3, number: 3, name: "학생3", gender: "남자", level: "보통" },
            { id: 5, number: 5, name: "학생5", gender: "여자", level: "보통" },
            { id: 6, number: 6, name: "학생6", gender: "남자", level: "빠른" },
            { id: 8, number: 8, name: "학생8", gender: "여자", level: "느린" },
          ],
        },
      ];
    };

    const deleteGroup = (groupId) => {
      const group = groupList.value.find((g) => g.id === groupId);
      if (group && group.assignedTasks > 0) {
        alert("할당된 과제가 있는 그룹은 삭제할 수 없습니다.");
        return;
      }

      if (confirm("정말 이 모둠 그룹을 삭제하시겠습니까?")) {
        groupList.value = groupList.value.filter((g) => g.id !== groupId);
        expandedGroups.value.delete(groupId);
        alert("모둠 그룹이 삭제되었습니다.");
      }
    };

    const assignTask = (groupId) => {
      const group = groupList.value.find((g) => g.id === groupId);
      if (group) {
        alert(`"${group.name}"에 과제를 출제합니다.`);
        // 실제로는 과제 출제 페이지로 이동하거나 모달 표시
      }
    };

    // 라이프사이클 훅
    onMounted(() => {
      console.log("GroupManagement 컴포넌트가 마운트되었습니다.");
    });

    return {
      // 데이터
      expandedGroups,
      showGroupDialog,
      isEditMode,
      groupForm,
      compositionOptions,
      groupList,

      // 메서드
      toggleGroup,
      openCreateDialog,
      editGroup,
      closeGroupDialog,
      saveGroup,
      deleteGroup,
      assignTask,
    };
  },
};
</script>

<style scoped>
/* 🎨 전체 레이아웃 */
.group-management {
  background: #fafbfc;
  min-height: 100vh;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 📍 브레드크럼 섹션 */
.breadcrumb-section {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 1rem;
}

.breadcrumb {
  background: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: ">";
  color: #6b7280;
}

/* 💡 안내 카드 */
.info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.info-content {
  padding: 1.5rem;
}

.info-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.info-list li {
  padding: 0.5rem 0;
  color: #6b7280;
  position: relative;
  padding-left: 1rem;
}

.info-list li::before {
  content: "•";
  color: #034582;
  position: absolute;
  left: 0;
}

/* 📊 그룹 목록 헤더 */
.group-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.total-count {
  font-size: 1.1rem;
  color: #374151;
}

.total-count .number {
  color: #034582;
  font-weight: 600;
}

.btn-create-group {
  background: #034582;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-create-group:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

/* 🗂️ 그룹 아코디언 */
.group-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-accordion {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.accordion-header {
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
}

.accordion-header:hover {
  background: #f1f5f9;
}

.accordion-header.active {
  background: #e0f2fe;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.group-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.stat-item .highlight {
  color: #034582;
  font-weight: 600;
}

.divider {
  color: #d1d5db;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-assign-task {
  background: #034582;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-assign-task:hover {
  background: #0369a1;
}

.accordion-icon {
  font-size: 1.2rem;
  color: #6b7280;
  transition: transform 0.3s ease;
}

.accordion-icon.rotated {
  transform: rotate(180deg);
}

/* 📂 아코디언 내용 */
.accordion-content {
  border-top: 1px solid #e2e8f0;
}

.group-content {
  padding: 2rem;
}

.group-manage-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.btn-manage {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-manage.delete {
  background: #fee2e2;
  color: #dc2626;
}

.btn-manage.delete:hover:not(:disabled) {
  background: #fecaca;
}

.btn-manage.edit {
  background: #034582;
  color: white;
}

.btn-manage.edit:hover:not(:disabled) {
  background: #0369a1;
}

.btn-manage:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.assigned-tasks {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.no-tasks {
  color: #6b7280;
  font-style: italic;
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 8px;
}

/* 👥 모둠 구성 */
.team-composition {
  display: grid;
  gap: 1.5rem;
}

.team-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.team-title {
  font-size: 1rem;
  font-weight: 600;
  color: #034582;
  margin-bottom: 1rem;
}

.student-list {
  list-style: none;
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.student-number {
  font-weight: 600;
  color: #6b7280;
  min-width: 2rem;
}

.student-name {
  font-weight: 500;
  color: #374151;
}

.student-info {
  color: #6b7280;
  font-size: 0.9rem;
}

/* 🎭 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #034582;
  box-shadow: 0 0 0 3px rgba(3, 69, 130, 0.1);
}

.composition-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.composition-btn {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.composition-btn:hover {
  border-color: #034582;
}

.composition-btn.active {
  background: #034582;
  color: white;
  border-color: #034582;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: #034582;
  color: white;
}

.btn-confirm:hover {
  background: #0369a1;
}

/* 📱 반응형 디자인 */
@media (max-width: 768px) {
  .main-container {
    padding: 0 1rem;
    margin: 1rem auto;
  }

  .group-list-header {
    flex-direction: column;
    align-items: stretch;
  }

  .accordion-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .group-actions {
    align-self: stretch;
    justify-content: space-between;
  }

  .group-manage-buttons {
    flex-direction: column;
  }

  .composition-options {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
