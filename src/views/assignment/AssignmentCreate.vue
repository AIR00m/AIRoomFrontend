<template>
  <Header />
  <div class="assignment-creator-page">
    <div class="creator-container">
      <h1 class="page-title">📝 과제 출제하기</h1>
      <p class="page-subtitle">{{ pageSubtitle }}</p>

      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <p>{{ noticeMessage }}</p>
      </div>

      <form @submit.prevent="submitAssignment" class="assignment-form">
        <!-- 과제명 -->
        <div class="form-group">
          <label for="assignment-name" class="form-label">🏷️ 과제명</label>
          <input
            type="text"
            id="assignment-name"
            class="form-input"
            v-model="form.name"
            :placeholder="namePlaceholder"
            required
          />
        </div>

        <!-- 과제 유형 -->
        <div class="form-group">
          <label class="form-label">🧩 과제 유형</label>
          <div class="segmented-control">
            <label v-for="type in assignmentTypes" :key="type.value">
              <input type="radio" v-model="form.type" :value="type.value" />
              <span>{{ type.label }}</span>
            </label>
          </div>
        </div>

        <!-- 모둠 그룹 선택 -->
        <Transition name="form-slide">
          <div v-if="isGroupAssignment" class="form-group indented-group">
            <label class="form-label">🧑‍🤝‍🧑 모둠 그룹 선택</label>
            <div class="checkbox-pills">
              <label v-for="group in availableGroups" :key="group.value">
                <input
                  type="checkbox"
                  :value="group.value"
                  v-model="form.selectedGroups"
                />
                <span>{{ group.label }}</span>
              </label>
            </div>
            <div class="checkbox-group single">
              <label>
                <input type="checkbox" v-model="form.createGroupBoard" />
                <span>모둠별 게시판 생성</span>
              </label>
            </div>
          </div>
        </Transition>

        <!-- 단원 선택 -->
        <div class="form-group">
          <label class="form-label" for="unit-select">📚 단원 선택</label>
          <select id="unit-select" v-model="form.unit" class="form-input">
            <option
              v-for="unit in availableUnits"
              :key="unit.value"
              :value="unit.value"
            >
              {{ unit.label }}
            </option>
          </select>
        </div>

        <!-- 과제 내용 -->
        <div class="form-group">
          <label for="assignment-content" class="form-label"
            >✍️ 과제 내용</label
          >
          <textarea
            id="assignment-content"
            class="form-input"
            v-model="form.content"
            rows="6"
            :placeholder="contentPlaceholder"
            required
          ></textarea>
        </div>

        <!-- 첨부파일 -->
        <div class="form-group">
          <label class="form-label">📎 첨부파일</label>
          <div
            class="file-drop-zone"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
            @click="triggerFileInput"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              multiple
              hidden
            />
            <div v-if="!hasFiles" class="empty-files">
              <div class="upload-icon">📁</div>
              <div>파일을 드래그 앤 드롭 하거나, 여기를 클릭하세요.</div>
              <small>{{ fileUploadInfo }}</small>
            </div>
            <ul v-else class="file-list">
              <li
                v-for="(file, index) in form.files"
                :key="index"
                class="file-item"
              >
                <span class="file-name">📄 {{ file.name }}</span>
                <button
                  type="button"
                  @click.stop="removeFile(index)"
                  class="remove-file-btn"
                  :aria-label="`${file.name} 파일 삭제`"
                >
                  ❌
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- 기간 설정 -->
        <div class="form-group">
          <label class="form-label">🗓️ 기간 설정</label>
          <div class="date-picker-group">
            <div class="date-input-wrapper">
              <label for="start-date" class="sr-only">시작 일시</label>
              <input
                id="start-date"
                type="datetime-local"
                class="form-input"
                v-model="form.period.start"
                required
              />
            </div>
            <span class="date-separator">~</span>
            <div class="date-input-wrapper">
              <label for="end-date" class="sr-only">종료 일시</label>
              <input
                id="end-date"
                type="datetime-local"
                class="form-input"
                v-model="form.period.end"
                :min="form.period.start"
                required
              />
            </div>
          </div>
        </div>

        <!-- 대상 설정 -->
        <div class="form-group">
          <label class="form-label">🧑‍🎓 대상 설정</label>
          <div class="student-selection-panel">
            <div class="select-all">
              <label>
                <input
                  type="checkbox"
                  @change="toggleSelectAll"
                  :checked="isAllSelected"
                />
                <strong>{{ selectAllText }}</strong>
              </label>
              <span class="info-text">{{ studentInfoText }}</span>
            </div>
            <div class="student-groups-container">
              <div
                v-for="(group, level) in groupedStudents"
                :key="level"
                class="student-group"
              >
                <p class="group-title" :class="`level-${level}`">
                  {{ getGroupTitle(level, group.length) }}
                </p>
                <ul class="student-list">
                  <li v-for="student in group" :key="student.id">
                    <label class="student-checkbox">
                      <input
                        type="checkbox"
                        :value="student.id"
                        v-model="form.targetStudents"
                      />
                      <span>{{ student.name }}</span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="actions">
          <router-link to="/assignment" class="btn btn-secondary">
            ↩️ 취소하기
          </router-link>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid"
            :class="{ disabled: !isFormValid }"
          >
            💾 과제 저장하기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";

const router = useRouter();
const fileInput = ref(null);

// 폼 데이터
const form = reactive({
  name: "",
  type: "individual",
  selectedGroups: [],
  createGroupBoard: false,
  unit: "all",
  content: "",
  files: [],
  evaluation: {
    method: "score",
    score: 100,
  },
  period: {
    start: "",
    end: "",
  },
  targetStudents: [],
});

// 상수 데이터
const assignmentTypes = [
  { value: "individual", label: "일반 과제" },
  { value: "group", label: "모둠 과제" },
];

const availableGroups = [
  { value: "group1", label: "모둠 1" },
  { value: "group2", label: "모둠 2" },
  { value: "group3", label: "모둠 3" },
];

const availableUnits = [
  { value: "all", label: "단원 전체" },
  { value: "1", label: "1. Hello, ABC!" },
  { value: "2", label: "2. What's This?" },
  { value: "3", label: "3. Sit Down, Please" },
];

const allStudents = ref([
  { id: 1, name: "김병아", level: "빠른" },
  { id: 6, name: "박열공", level: "빠른" },
  { id: 2, name: "이보통", level: "보통" },
  { id: 7, name: "최평범", level: "보통" },
  { id: 3, name: "나느려", level: "느린" },
  { id: 4, name: "정천천", level: "느린" },
  { id: 5, name: "윤차분", level: "느린" },
  { id: 8, name: "고민중", level: "느린" },
  { id: 9, name: "황지켜", level: "느린" },
  { id: 10, name: "홍도와", level: "느린" },
]);

// 계산된 속성들
const pageSubtitle = computed(
  () => "학생들을 위한 재미있는 과제를 만들어봐요!"
);

const noticeMessage = computed(
  () => "게시 자료는 공개될 수 있으니, 개인정보가 포함되지 않도록 유의해주세요."
);

const namePlaceholder = computed(() => "예: 재미있는 알파벳 친구들");

const contentPlaceholder = computed(
  () => "학생들이 수행할 과제에 대해 자세히 설명해주세요."
);

const fileUploadInfo = computed(() => "최대 5개, 각 10MB 이하");

const isGroupAssignment = computed(() => form.type === "group");

const hasFiles = computed(() => form.files.length > 0);

const groupedStudents = computed(() => {
  const groups = { 빠른: [], 보통: [], 느린: [] };
  allStudents.value.forEach((student) => {
    if (groups[student.level]) {
      groups[student.level].push(student);
    }
  });
  return groups;
});

const isAllSelected = computed(
  () => form.targetStudents.length === allStudents.value.length
);

const selectAllText = computed(
  () => `학생 전체 (${allStudents.value.length}명)`
);

const studentInfoText = computed(() => "학생의 종합 학습 수준이 표시됩니다.");

const isFormValid = computed(() => {
  return (
    form.name.trim() &&
    form.content.trim() &&
    form.period.start &&
    form.period.end &&
    form.targetStudents.length > 0 &&
    new Date(form.period.start) < new Date(form.period.end)
  );
});

// 메서드들
const getGroupTitle = (level, count) => `${level} 학습자 (${count}명)`;

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const files = event.target.files;
  if (files) {
    addFiles(files);
  }
};

const handleFileDrop = (event) => {
  const files = event.dataTransfer.files;
  if (files) {
    addFiles(files);
  }
};

const addFiles = (files) => {
  const fileList = Array.from(files);
  const maxFiles = 5;
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (form.files.length + fileList.length > maxFiles) {
    alert(`파일은 최대 ${maxFiles}개까지 등록할 수 있습니다.`);
    return;
  }

  const oversizedFiles = fileList.filter((file) => file.size > maxSize);
  if (oversizedFiles.length > 0) {
    alert("10MB 이하의 파일만 업로드할 수 있습니다.");
    return;
  }

  form.files.push(...fileList);
};

const removeFile = (index) => {
  form.files.splice(index, 1);
};

const toggleSelectAll = (event) => {
  form.targetStudents = event.target.checked
    ? allStudents.value.map((s) => s.id)
    : [];
};

const submitAssignment = () => {
  if (!isFormValid.value) {
    alert("모든 필수 항목을 입력해주세요.");
    return;
  }

  console.log("과제 데이터:", JSON.parse(JSON.stringify(form)));
  alert("과제가 저장되었습니다.");
  router.push({ name: "Assignment" });
};
</script>

<style scoped>
/* 전역 스타일 */
.assignment-creator-page {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
  color: #333;
}

.creator-container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.1);
  padding: 2.5rem;
}

/* 헤더 */
.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: #8c6d32;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.page-subtitle {
  text-align: center;
  font-size: 1rem;
  color: #ffb74d;
  margin: 0 0 2rem;
  font-weight: 600;
}

/* 안내 상자 */
.notice-box {
  background: #fffbf0;
  border: 2px dashed #ffe066;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: #f57c00;
  font-size: 0.9rem;
  line-height: 1.5;
}

.notice-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

/* 폼 스타일 */
.assignment-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: 0.75rem;
  font-weight: 700;
  color: #ff9800;
  font-size: 1.1rem;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 3px solid #fff5d6;
  border-radius: 15px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  font-family: inherit;
  line-height: 1.5;
}

.form-input:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 150px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 들여쓰기 그룹 */
.indented-group {
  margin-left: 2rem;
  padding-left: 1.5rem;
  border-left: 3px solid #fff5d6;
  background: #fefffe;
  border-radius: 0 15px 15px 0;
  padding-top: 1rem;
  padding-bottom: 1rem;
}

/* 트랜지션 */
.form-slide-enter-active,
.form-slide-leave-active {
  transition: all 0.3s ease-out;
}

.form-slide-enter-from,
.form-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
  max-height: 0;
}

/* 세그먼트 컨트롤 */
.segmented-control,
.checkbox-pills {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.segmented-control input,
.checkbox-pills input {
  display: none;
}

.segmented-control label,
.checkbox-pills label {
  cursor: pointer;
  padding: 0.7rem 1.2rem;
  border-radius: 20px;
  background: white;
  border: 2px solid #fff5d6;
  color: #ff9800;
  font-weight: 600;
  transition: all 0.3s ease;
  user-select: none;
}

.segmented-control label:hover,
.checkbox-pills label:hover {
  background: #fffbf0;
  border-color: #ffe066;
}

.segmented-control label:has(input:checked),
.checkbox-pills label:has(input:checked) {
  background: #ffdd29;
  color: white;
  border-color: #ffdd29;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  transform: translateY(-2px);
}

/* 체크박스 그룹 */
.checkbox-group.single {
  margin-top: 1rem;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  accent-color: #ffdd29;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #8c6d32;
  font-weight: 600;
}

/* 날짜 선택기 */
.date-picker-group {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.date-input-wrapper {
  flex: 1;
  min-width: 200px;
}

.date-separator {
  font-weight: 700;
  color: #ff9800;
  font-size: 1.2rem;
}

/* 파일 드롭 존 */
.file-drop-zone {
  border: 3px dashed #ffe066;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  background: #fffbf0;
  transition: all 0.3s ease;
  color: #8c6d32;
}

.file-drop-zone:hover {
  border-color: #ffdd29;
  background: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.1);
}

.empty-files {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border: 2px solid #fff5d6;
  border-radius: 15px;
  color: #8c6d32;
}

.file-name {
  font-weight: 600;
  flex: 1;
}

.remove-file-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.remove-file-btn:hover {
  background: #ffebee;
  transform: scale(1.1);
}

/* 학생 선택 패널 */
.student-selection-panel {
  background: #fffbf0;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  padding: 1.5rem;
}

.select-all {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #fff5d6;
}

.select-all label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: #8c6d32;
}

.select-all strong {
  font-size: 1.1rem;
  color: #ff9800;
}

.select-all input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #ffdd29;
}

.info-text {
  font-size: 0.9rem;
  color: #ffb74d;
  font-style: italic;
}

.student-groups-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.group-title {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem;
  display: inline-block;
  font-size: 0.95rem;
}

.level-빠른 {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.level-보통 {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.level-느린 {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.student-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.student-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.student-checkbox:hover {
  transform: translateX(3px);
}

.student-checkbox input {
  display: none;
}

.student-checkbox span {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid transparent;
  width: 100%;
  transition: all 0.3s ease;
  color: #8c6d32;
  font-weight: 500;
}

.student-checkbox input:checked + span {
  background: white;
  border-color: #ffdd29;
  color: #ff9800;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 221, 41, 0.2);
}

/* 액션 버튼 */
.actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 2px solid #fff5d6;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  min-width: 150px;
}

.btn-primary {
  background: linear-gradient(135deg, #ffdd29, #ffb74d);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-primary:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.btn-primary.disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: white;
  color: #ff9800;
  border: 2px solid #ffe066;
}

.btn-secondary:hover {
  background: #fffbf0;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(255, 221, 41, 0.2);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .assignment-creator-page {
    padding: 1rem;
  }

  .creator-container {
    padding: 1.5rem;
  }

  .indented-group {
    margin-left: 0;
    border-left: none;
    border-top: 3px solid #fff5d6;
    border-radius: 15px;
  }

  .date-picker-group {
    flex-direction: column;
    align-items: stretch;
  }

  .date-input-wrapper {
    min-width: 100%;
  }

  .student-groups-container {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .segmented-control,
  .checkbox-pills {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.6rem;
  }

  .select-all {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
