<template>
  <Header />
  <div class="assignment-creator">
    <div class="notice">
      <p>
        게시 자료는 공개될 수 있으니, 본인 및 타인의 개인정보는 내용에 포함되지
        않도록 유의해 주시기 바랍니다.
      </p>
    </div>

    <h1 class="title">과제 출제</h1>

    <form @submit.prevent="submitAssignment">
      <div class="form-group">
        <label for="assignment-name">과제명</label>
        <input
          type="text"
          id="assignment-name"
          v-model="form.name"
          placeholder="과제명을 입력하세요"
        />
      </div>

      <div class="form-group">
        <label>과제 유형</label>
        <div class="radio-group">
          <label
            ><input
              type="radio"
              v-model="form.type"
              value="individual"
            />일반</label
          >
          <label
            ><input type="radio" v-model="form.type" value="group" />모둠</label
          >
        </div>
      </div>

      <div v-if="form.type === 'group'" class="form-group indented">
        <label>모둠 그룹 선택</label>
        <div class="checkbox-group">
          <label
            ><input
              type="checkbox"
              value="group1"
              v-model="form.selectedGroups"
            />모둠 1</label
          >
          <label
            ><input
              type="checkbox"
              value="group2"
              v-model="form.selectedGroups"
            />모둠 2</label
          >
          <label
            ><input
              type="checkbox"
              value="group3"
              v-model="form.selectedGroups"
            />모둠 3</label
          >
        </div>
        <div class="checkbox-group single">
          <label
            ><input type="checkbox" v-model="form.createGroupBoard" />모둠별
            게시판 생성</label
          >
        </div>
      </div>

      <div class="form-group">
        <label>단원/차시 선택</label>
        <div class="select-group">
          <select v-model="form.unit">
            <option value="all">단원 전체</option>
            <option value="1">1. Hello, ABC!</option>
            <option value="2">2. What's This?</option>
            <option value="3">3. Sit Down, Please</option>
          </select>
          <select v-model="form.lesson">
            <option value="all">차시 전체</option>
            <option value="1">1차시</option>
            <option value="2">2차시</option>
            <option value="3">3차시</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="assignment-content">과제 내용</label>
        <textarea
          id="assignment-content"
          v-model="form.content"
          rows="6"
          placeholder="과제 내용을 입력하세요"
        ></textarea>
      </div>

      <div class="form-group">
        <label>첨부파일</label>
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
          <p v-if="form.files.length === 0">
            파일 선택<br />또는 파일을 여기로 드래그하세요.
          </p>
          <ul v-else class="file-list">
            <li v-for="(file, index) in form.files" :key="index">
              <span>{{ file.name }}</span>
              <button
                type="button"
                @click.stop="removeFile(index)"
                class="remove-file-btn"
              >
                ×
              </button>
            </li>
          </ul>
        </div>
        <div class="file-info">
          <p>
            문서(pptx(ppt), hwpx(hwp), docx(doc), xlsx(xls), pdf, 이미지(JPG,
            JPEG, PNG, GIF)) - 파일 당 최대 10MB
          </p>
          <p>파일은 최대 5개만 등록 가능</p>
        </div>
      </div>

      <div class="form-group">
        <label>평가 방식</label>
        <div class="radio-group">
          <label
            ><input
              type="radio"
              v-model="form.evaluation.method"
              value="score"
            />점수</label
          >
          <label
            ><input
              type="radio"
              v-model="form.evaluation.method"
              value="feedback"
            />피드백</label
          >
          <label
            ><input
              type="radio"
              v-model="form.evaluation.method"
              value="none"
            />평가 안 함</label
          >
        </div>
      </div>

      <div
        v-if="form.evaluation.method === 'score'"
        class="form-group indented"
      >
        <input
          type="number"
          v-model.number="form.evaluation.score"
          min="1"
          max="100"
          placeholder="점수"
        />
        점
        <p class="validation-message">
          점수는 1점에서 100점 사이의 숫자로 입력해 주세요.
        </p>
      </div>

      <div class="form-group">
        <label>기간 설정</label>
        <div class="radio-group">
          <label
            ><input
              type="radio"
              v-model="form.period.type"
              value="always"
            />상시(기간 없음)</label
          >
          <label
            ><input type="radio" v-model="form.period.type" value="set" />기간
            설정</label
          >
        </div>
      </div>

      <div
        v-if="form.period.type === 'set'"
        class="form-group indented date-picker-group"
      >
        <input type="datetime-local" v-model="form.period.start" />
        <span>~</span>
        <input type="datetime-local" v-model="form.period.end" />
      </div>

      <div class="form-group">
        <label>대상 설정</label>
        <div class="student-selection">
          <div class="select-all">
            <label>
              <input
                type="checkbox"
                @change="toggleSelectAll"
                :checked="isAllSelected"
              />
              학생 전체 ({{ allStudents.length }}명)
            </label>
            <span class="info-text">학생의 종합 학습 수준이 표시됩니다.</span>
          </div>
          <div
            v-for="(group, level) in groupedStudents"
            :key="level"
            class="student-group"
          >
            <p class="group-title">{{ level }} 학습자 ({{ group.length }}명)</p>
            <ul>
              <li v-for="student in group" :key="student.id">
                <label>
                  <input
                    type="checkbox"
                    :value="student.id"
                    v-model="form.targetStudents"
                  />
                  {{ student.name }}
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="actions">
        <router-link to="/assignment" class="btn-cancel">취소</router-link>
        <button type="submit" class="btn-save">저장</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";

const router = useRouter();

const form = reactive({
  name: "",
  type: "individual",
  selectedGroups: [],
  createGroupBoard: false,
  unit: "all",
  lesson: "all",
  content: "",
  files: [],
  evaluation: {
    method: "score",
    score: 100,
  },
  period: {
    type: "always",
    start: "",
    end: "",
  },
  targetStudents: [],
});

const fileInput = ref(null);

const allStudents = ref([
  { id: 1, name: "학생1", level: "빠른" },
  { id: 6, name: "학생6", level: "빠른" },
  { id: 2, name: "학생2", level: "보통" },
  { id: 7, name: "학생7", level: "보통" },
  { id: 3, name: "학생3", level: "느린" },
  { id: 4, name: "학생4", level: "느린" },
  { id: 5, name: "학생5", level: "느린" },
  { id: 8, name: "학생8", level: "느린" },
  { id: 9, name: "학생9", level: "느린" },
  { id: 10, name: "학생10", level: "느린" },
]);

const groupedStudents = computed(() => {
  const groups = { 빠른: [], 보통: [], 느린: [], "학습 수준 없음": [] };
  allStudents.value.forEach((student) => {
    if (groups[student.level]) {
      groups[student.level].push(student);
    } else {
      groups["학습 수준 없음"].push(student);
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
.assignment-creator {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: "Malgun Gothic", sans-serif;
  color: #333;
}

.notice {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  border-radius: 4px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group > label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}

.form-group.indented {
  margin-left: 20px;
  padding-left: 10px;
  border-left: 2px solid #f0f0f0;
}

input[type="text"],
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

textarea {
  resize: vertical;
}

.radio-group,
.checkbox-group {
  display: flex;
  gap: 20px;
}

.checkbox-group.single {
  margin-top: 10px;
}

.radio-group label,
.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: normal;
}

.select-group {
  display: flex;
  gap: 10px;
}

.select-group select {
  flex: 1;
}

.file-drop-zone {
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background-color: #fafafa;
}

.file-drop-zone:hover {
  background-color: #f0f0f0;
  border-color: #aaa;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.file-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 3px;
  margin-bottom: 5px;
}

.remove-file-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.file-info {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.file-info p {
  margin: 2px 0;
}

.validation-message {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.date-picker-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-picker-group input {
  flex: 1;
}

.student-selection {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 4px;
}

.select-all {
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.select-all label {
  font-weight: bold;
}

.info-text {
  font-size: 13px;
  color: #777;
  margin-left: 20px;
}

.student-group .group-title {
  font-weight: bold;
  margin: 10px 0;
}

.student-group ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.actions button,
.actions a {
  padding: 10px 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
  color: #333;
}

.btn-save {
  background-color: #007bff;
  color: white;
}

.btn-save:hover {
  background-color: #0056b3;
}
</style>
