<template>
  <Header />
  <div class="assignment-creator-page">
    <div class="creator-container">
      <h1 class="page-title">📝 과제 출제하기</h1>
      <p class="page-subtitle">학생들을 위한 재미있는 과제를 만들어봐요!</p>

      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <p>
          게시 자료는 공개될 수 있으니, 개인정보가 포함되지 않도록 유의해주세요.
        </p>
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
            placeholder="예: 재미있는 알파벳 친구들"
          />
        </div>

        <!-- 과제 유형 -->
        <div class="form-group">
          <label class="form-label">🧩 과제 유형</label>
          <div class="segmented-control">
            <label>
              <input type="radio" v-model="form.type" value="individual" />
              <span>일반 과제</span>
            </label>
            <label>
              <input type="radio" v-model="form.type" value="group" />
              <span>모둠 과제</span>
            </label>
          </div>
        </div>

        <!-- 모둠 그룹 선택 (조건부 렌더링) -->
        <Transition name="form-slide">
          <div v-if="form.type === 'group'" class="form-group indented-group">
            <label class="form-label">🧑‍🤝‍🧑 모둠 그룹 선택</label>
            <div class="checkbox-pills">
              <label
                ><input
                  type="checkbox"
                  value="group1"
                  v-model="form.selectedGroups"
                /><span>모둠 1</span></label
              >
              <label
                ><input
                  type="checkbox"
                  value="group2"
                  v-model="form.selectedGroups"
                /><span>모둠 2</span></label
              >
              <label
                ><input
                  type="checkbox"
                  value="group3"
                  v-model="form.selectedGroups"
                /><span>모둠 3</span></label
              >
            </div>
            <div class="checkbox-group single">
              <label
                ><input type="checkbox" v-model="form.createGroupBoard" /><span
                  >모둠별 게시판 생성</span
                ></label
              >
            </div>
          </div>
        </Transition>

        <!-- [수정됨] 단원 선택 -->
        <div class="form-group">
          <label class="form-label" for="unit-select">📚 단원 선택</label>
          <select id="unit-select" v-model="form.unit" class="form-input">
            <option value="all">단원 전체</option>
            <option value="1">1. Hello, ABC!</option>
            <option value="2">2. What's This?</option>
            <option value="3">3. Sit Down, Please</option>
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
            placeholder="학생들이 수행할 과제에 대해 자세히 설명해주세요."
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
            <div v-if="form.files.length === 0" class="empty-files">
              <div class="upload-icon">📤</div>
              <div>파일을 드래그 앤 드롭 하거나, 여기를 클릭하세요.</div>
              <small>최대 5개, 각 10MB 이하</small>
            </div>
            <ul v-else class="file-list">
              <li v-for="(file, index) in form.files" :key="index">
                <span>📄 {{ file.name }}</span>
                <button
                  type="button"
                  @click.stop="removeFile(index)"
                  class="remove-file-btn"
                  aria-label="파일 삭제"
                >
                  ❌
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- [수정됨] 기간 설정 -->
        <div class="form-group">
          <label class="form-label">🗓️ 기간 설정</label>
          <div class="date-picker-group">
            <input
              type="datetime-local"
              class="form-input"
              v-model="form.period.start"
            />
            <span class="date-separator">~</span>
            <input
              type="datetime-local"
              class="form-input"
              v-model="form.period.end"
            />
          </div>
        </div>

        <!-- [제거됨] 평가 방식 UI는 제거되었습니다. -->

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
                <strong>학생 전체 ({{ allStudents.length }}명)</strong>
              </label>
              <span class="info-text">학생의 종합 학습 수준이 표시됩니다.</span>
            </div>
            <div class="student-groups-container">
              <div
                v-for="(group, level) in groupedStudents"
                :key="level"
                class="student-group"
              >
                <p class="group-title" :class="`level-${level}`">
                  {{ level }} 학습자 ({{ group.length }}명)
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
          <router-link to="/assignment" class="btn btn-secondary"
            >↩️ 취소하기</router-link
          >
          <button type="submit" class="btn btn-primary">
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

// [수정됨] form 상태 객체 간소화
const form = reactive({
  name: "",
  type: "individual",
  selectedGroups: [],
  createGroupBoard: false,
  unit: "all",
  // 'lesson' 속성 제거
  content: "",
  files: [],
  // 'evaluation' UI는 제거되었지만, 데이터는 100점 만점으로 고정
  evaluation: {
    method: "score",
    score: 100,
  },
  // 'period' 객체에서 'type' 속성 제거
  period: {
    start: "",
    end: "",
  },
  targetStudents: [],
});

const fileInput = ref(null);

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

const groupedStudents = computed(() => {
  const groups = { 빠른: [], 보통: [], 느린: [] };
  allStudents.value.forEach((student) => {
    if (groups[student.level]) {
      groups[student.level].push(student);
    }
  });
  return groups;
});

const isAllSelected = computed(() => {
  return form.targetStudents.length === allStudents.value.length;
});

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileSelect = (event) => {
  addFiles(event.target.files);
};

const handleFileDrop = (event) => {
  addFiles(event.dataTransfer.files);
};

const addFiles = (files) => {
  const fileList = Array.from(files);
  if (form.files.length + fileList.length > 5) {
    alert("파일은 최대 5개까지 등록할 수 있습니다.");
    return;
  }
  form.files.push(...fileList);
};

const removeFile = (index) => {
  form.files.splice(index, 1);
};

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    form.targetStudents = allStudents.value.map((s) => s.id);
  } else {
    form.targetStudents = [];
  }
};

const submitAssignment = () => {
  console.log("과제 데이터:", JSON.parse(JSON.stringify(form)));
  alert("과제가 저장되었습니다.");
  router.push({ name: "Assignment" });
};
</script>

<style scoped>
.assignment-creator-page {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}
.creator-container {
  max-width: 900px;
  margin: 0 auto;
  background: #fffbf0;
  border-radius: 30px;
  border: 3px solid #ffe066;
  box-shadow: 0 20px 60px rgba(255, 221, 41, 0.15);
  padding: 2rem 3rem;
}
.page-title {
  text-align: center;
  font-size: 2.2rem;
  font-weight: 800;
  color: #ff9800;
  margin-bottom: 0.5rem;
}
.page-subtitle {
  text-align: center;
  font-size: 1.1rem;
  color: #ffb74d;
  margin-bottom: 2.5rem;
}
.notice-box {
  background: #fff9e6;
  border: 2px dashed #ffe066;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #f57c00;
  font-weight: 600;
}
.notice-icon {
  font-size: 1.5rem;
}
.assignment-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.form-label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 700;
  color: #ff9800;
  font-size: 1.1rem;
}
.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 3px solid #fff5d6;
  border-radius: 15px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  font-family: inherit;
}
.form-input:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 5px rgba(255, 221, 41, 0.1);
  transform: translateY(-2px);
}
textarea.form-input {
  resize: vertical;
  min-height: 120px;
}
.indented-group {
  margin-left: 2rem;
  padding-left: 1.5rem;
  border-left: 3px solid #fff5d6;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-slide-enter-active,
.form-slide-leave-active {
  transition: all 0.3s ease-out;
}
.form-slide-enter-from,
.form-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.segmented-control,
.checkbox-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.segmented-control input,
.checkbox-pills input {
  display: none;
}
.segmented-control label,
.checkbox-pills label {
  cursor: pointer;
  padding: 12px 20px;
  border-radius: 15px;
  background: white;
  border: 2px solid #fff5d6;
  color: #ff9800;
  font-weight: 700;
  transition: all 0.2s ease;
}
.segmented-control label:hover,
.checkbox-pills label:hover {
  transform: translateY(-2px);
  border-color: #ffe066;
}
.segmented-control input:checked + span,
.checkbox-pills input:checked + span {
  color: white;
}
.segmented-control label:has(input:checked),
.checkbox-pills label:has(input:checked) {
  background: #ffdd29;
  color: white;
  border-color: #ffdd29;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  transform: translateY(-2px);
}
.checkbox-group.single {
  margin-top: 0.5rem;
}
.checkbox-group input {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  accent-color: #ffdd29;
}
.checkbox-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.date-picker-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.date-separator {
  font-weight: 700;
  color: #ff9800;
}
.file-drop-zone {
  border: 3px dashed #ffe066;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  background-color: #fffef9;
  transition: all 0.2s ease;
  color: #ffb74d;
}
.file-drop-zone:hover {
  background-color: white;
  border-color: #ffdd29;
}
.upload-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}
.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.file-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #fff;
  border: 2px solid #fff5d6;
  border-radius: 15px;
  color: #8c6d32;
  font-weight: 600;
}
.remove-file-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
}
.remove-file-btn:hover {
  transform: scale(1.2);
}
.student-selection-panel {
  background: white;
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
  margin-bottom: 1rem;
  border-bottom: 2px solid #fff5d6;
}
.select-all label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.select-all strong {
  font-size: 1.1rem;
  color: #ff9800;
}
.info-text {
  font-size: 0.9rem;
  color: #ffb74d;
}
.student-groups-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
.group-title {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  display: inline-block;
}
.level-빠른 {
  background: #27ae60;
}
.level-보통 {
  background: #f39c12;
}
.level-느린 {
  background: #e74c3c;
}
.student-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.student-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 10px;
  transition: background-color 0.2s;
  cursor: pointer;
}
.student-checkbox:hover {
  background-color: #fff9e6;
}
.student-checkbox input {
  display: none;
}
.student-checkbox span {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 2px solid transparent;
  width: 100%;
  transition: all 0.2s;
}
.student-checkbox input:checked + span {
  background: #fff5d6;
  border-color: #ffe066;
  color: #ff9800;
  font-weight: 600;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #fff5d6;
}
.btn {
  padding: 18px 30px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}
.btn-primary {
  background: #ffdd29;
  color: white;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.3);
}
.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(255, 221, 41, 0.4);
}
.btn-secondary {
  background: white;
  color: #ff9800;
  border: 3px solid #ffe066;
}
.btn-secondary:hover {
  transform: translateY(-3px);
  background-color: #fff9e6;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}
</style>
