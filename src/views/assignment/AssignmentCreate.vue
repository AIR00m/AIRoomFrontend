<template>
  <Header />
  <div class="assignment-creator-page">
    <div class="creator-container">
      <!-- ✅ 로딩 상태 추가 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-icon">⏳</div>
        <p class="loading-text">사용자 정보를 불러오는 중...</p>
      </div>

      <!-- ✅ 에러 상태 추가 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">❌</div>
        <p class="error-text">{{ error }}</p>
        <button @click="initializeData()" class="retry-btn">다시 시도</button>
      </div>

      <!-- ✅ 정상 상태 -->
      <template v-else>
        <h1 class="page-title">📝 과제 출제하기</h1>
        <p class="page-subtitle">{{ pageSubtitle }}</p>

        <!-- 현재 클래스룸 정보 -->
        <div class="classroom-info-box">
          <span class="classroom-icon">🏫</span>
          <p>
            <strong
              >{{ currentClassroom.grade }}학년
              {{ currentClassroom.classNumber }}반</strong
            >
            (총 {{ allStudents.length }}명)
          </p>
        </div>

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
              v-model="form.assignBoardTitle"
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

          <!-- 📝 간소화된 모둠 그룹 선택 -->
          <Transition name="form-slide">
            <div v-if="isGroupAssignment" class="form-group indented-group">
              <label class="form-label">🧑‍🤝‍🧑 모둠 그룹 선택</label>
              <div class="loading-message" v-if="groupsLoading">
                📊 모둠 정보를 불러오는 중...
              </div>
              <div class="checkbox-pills" v-else>
                <label v-for="group in availableGroups" :key="group.value">
                  <input
                    type="checkbox"
                    :value="group.value"
                    v-model="form.selectedGroups"
                  />
                  <span>{{ group.label }}</span>
                </label>
              </div>
            </div>
          </Transition>

          <!-- 과제 내용 -->
          <div class="form-group">
            <label for="assignment-content" class="form-label"
              >✍️ 과제 내용</label
            >
            <textarea
              id="assignment-content"
              class="form-input"
              v-model="form.boardContent"
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
                  v-for="(file, index) in form.attachmentFile"
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
                  v-model="form.assignStart"
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
                  v-model="form.assignEnd"
                  :min="form.assignStart"
                  required
                />
              </div>
            </div>
          </div>

          <!-- 대상 설정 부분 - 개별 과제일 때만 표시 -->
          <div v-if="!isGroupAssignment" class="form-group">
            <label class="form-label">🧑‍🎓 대상 설정</label>
            <div class="student-selection-panel">
              <div class="loading-message" v-if="studentsLoading">
                👥 학생 목록을 불러오는 중...
              </div>
              <template v-else>
                <div class="select-all">
                  <label>
                    <input
                      type="checkbox"
                      @change="toggleSelectAll"
                      :checked="isAllSelected"
                    />
                    <strong>{{ selectAllText }}</strong>
                  </label>
                </div>
                <div class="student-groups-container">
                  <div class="student-group">
                    <ul class="student-list">
                      <li
                        v-for="student in allStudents"
                        :key="student.classroomStudentNo"
                      >
                        <label class="student-checkbox">
                          <input
                            type="checkbox"
                            :value="student.classroomStudentNo"
                            v-model="form.targetStudents"
                          />
                          <span>{{ student.studentName }}</span>
                        </label>
                      </li>
                    </ul>
                  </div>
                </div>
              </template>
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
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Header from "@/components/common/Header.vue";
import apiClient from "@/utils/apiClient";

const authStore = useAuthStore();
const router = useRouter();
const fileInput = ref(null);

// ✅ 현재 사용자 정보를 토큰에서 가져오기
const currentUser = ref({});
const currentClassroom = ref({});
const currentTeacher = ref({});

// 📝 데이터 상태 관리
const allStudents = ref([]);
const availableGroups = ref([]);
const studentsLoading = ref(true);
const groupsLoading = ref(true);
const isLoading = ref(true);
const error = ref(null);

// ✅ 사용자 정보 초기화 함수
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

    // 현재 사용자 정보 설정
    currentUser.value = userInfo;
    currentClassroom.value = {
      classroomNo: userInfo.classroomNo,
      grade: 2, // 필요하다면 토큰에서 가져오기
      classNumber: 2, // 필요하다면 토큰에서 가져오기
    };
    currentTeacher.value = {
      classroomTeacherNo: userInfo.classroomTeacherNo,
      memberName: userInfo.memberName,
    };

    console.log("📚 사용자 정보 확인됨:", userInfo);

    // 폼 데이터에 사용자 정보 설정
    form.classroomTeacherNo = userInfo.classroomTeacherNo;
    form.classroomNo = userInfo.classroomNo;

    // 학생 목록과 모둠 목록 로드
    await Promise.all([fetchStudents(), fetchGroups()]);
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

// ✅ 폼 데이터 - 동적으로 설정되도록 수정
const form = reactive({
  boardContent: "",
  boardType: "ASSIGN",
  classroomTeacherNo: null, // 초기화 시 설정
  classroomNo: null, // 초기화 시 설정
  assignBoardTitle: "",
  assignStart: "",
  assignEnd: "",
  type: "individual",
  selectedGroups: [],
  attachmentFile: [],
  targetStudents: [],
});

// 상수 데이터
const assignmentTypes = [
  { value: "individual", label: "일반 과제" },
  { value: "group", label: "모둠 과제" },
];

// ✅ 수정된 API 호출 - apiClient 사용
const fetchStudents = async () => {
  try {
    studentsLoading.value = true;

    if (!currentClassroom.value.classroomNo) {
      throw new Error("교실 정보가 없습니다.");
    }

    console.log(
      "🌐 학생 목록 API 호출:",
      `/classroom/student/${currentClassroom.value.classroomNo}`
    );

    const response = await apiClient.get(
      `/classroom/student/${currentClassroom.value.classroomNo}`
    );

    allStudents.value = response || [];
    console.log("✅ 학생 목록 로드 완료:", allStudents.value.length + "명");
  } catch (error) {
    console.error("학생 목록 로드 실패:", error);
    alert("❌ 학생 목록을 불러오는데 실패했습니다.");
  } finally {
    studentsLoading.value = false;
  }
};

// ✅ 수정된 API 호출 - apiClient 사용
const fetchGroups = async () => {
  try {
    groupsLoading.value = true;

    if (!currentClassroom.value.classroomNo) {
      throw new Error("교실 정보가 없습니다.");
    }

    console.log(
      "🌐 모둠 목록 API 호출:",
      `/classroom/group/${currentClassroom.value.classroomNo}`
    );

    const response = await apiClient.get(
      `/classroom/group/${currentClassroom.value.classroomNo}`
    );

    availableGroups.value = (response || []).map((group) => ({
      value: group.groupNo,
      label: group.groupName,
    }));
    console.log("✅ 모둠 목록 로드 완료:", availableGroups.value.length + "개");
  } catch (error) {
    console.error("모둠 목록 로드 실패:", error);
    alert("❌ 모둠 목록을 불러오는데 실패했습니다.");
  } finally {
    groupsLoading.value = false;
  }
};

// ✅ 컴포넌트 마운트 시 초기화
onMounted(() => {
  initializeData();
});

// 계산된 속성들
const pageSubtitle = computed(
  () => "학생들을 위한 재미있는 과제를 만들어봐요!"
);
const noticeMessage = computed(
  () => "게시 자료는 공개될 수 있으니, 개인정보가 포함되지 않도록 유의해주세요."
);
const namePlaceholder = computed(() => "예: 재미있는 수학 문제");
const contentPlaceholder = computed(
  () => "학생들이 수행할 과제에 대해 자세히 설명해주세요."
);
const fileUploadInfo = computed(() => "최대 5개, 각 10MB 이하");
const isGroupAssignment = computed(() => form.type === "group");
const hasFiles = computed(() => form.attachmentFile.length > 0);
const isAllSelected = computed(
  () => form.targetStudents.length === allStudents.value.length
);
const selectAllText = computed(
  () => `학생 전체 (${allStudents.value.length}명)`
);

// ✅ 수정 후: 과제 유형에 따른 조건부 검사
const isFormValid = computed(() => {
  const basicValidation =
    form.assignBoardTitle.trim() &&
    form.boardContent.trim() &&
    form.assignStart &&
    form.assignEnd &&
    new Date(form.assignStart) < new Date(form.assignEnd);

  if (form.type === "individual") {
    return basicValidation && form.targetStudents.length > 0;
  }

  if (form.type === "group") {
    return basicValidation && form.selectedGroups.length > 0;
  }

  return basicValidation;
});

// 파일 관련 메서드들 (기존과 동일)
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

  if (form.attachmentFile.length + fileList.length > maxFiles) {
    alert(`파일은 최대 ${maxFiles}개까지 등록할 수 있습니다.`);
    return;
  }

  const oversizedFiles = fileList.filter((file) => file.size > maxSize);
  if (oversizedFiles.length > 0) {
    alert("10MB 이하의 파일만 업로드할 수 있습니다.");
    return;
  }

  form.attachmentFile.push(...fileList);
};

const removeFile = (index) => {
  form.attachmentFile.splice(index, 1);
};

const toggleSelectAll = (event) => {
  form.targetStudents = event.target.checked
    ? allStudents.value.map((s) => s.classroomStudentNo)
    : [];
};

// ✅ 수정된 과제 제출 함수 - apiClient 사용
const submitAssignment = async () => {
  if (!isFormValid.value) {
    alert("모든 필수 항목을 입력해주세요.");
    return;
  }

  const assignmentData = {
    assignBoard: {
      assignBoardContent: form.boardContent,
      classroomTeacherNo: form.classroomTeacherNo,
      classroomNo: form.classroomNo,
      assignBoardTitle: form.assignBoardTitle,
      assignStart: form.assignStart,
      assignEnd: form.assignEnd,
    },
    attachmentFile: form.attachmentFile.map((file) => ({
      originalName: file.name,
      boardType: "ASSIGN",
    })),
    assignTargets:
      form.type === "group"
        ? form.selectedGroups.map((groupNo) => ({
            targetNo: groupNo,
            groupAssignType: true,
          }))
        : form.targetStudents.map((classroomStudentNo) => ({
            targetNo: classroomStudentNo,
            groupAssignType: false,
          })),
  };

  try {
    console.log("📤 과제 생성 요청:", assignmentData);

    const response = await apiClient.post("/assign/create", assignmentData);

    alert("✅ " + response);
    router.push({ name: "Assignment" });
  } catch (error) {
    console.error("과제 생성 실패:", error);
    alert("❌ 과제 생성에 실패했습니다: " + error.message);
  }
};
</script>

<style scoped>
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
/* 🆕 클래스룸 정보 박스 스타일 */
.classroom-info-box {
  background: #e8f5e8;
  border: 2px solid #4caf50;
  border-radius: 15px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #2e7d32;
  font-size: 0.95rem;
}

.classroom-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

/* 🆕 로딩 메시지 스타일 */
.loading-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
  background: #f9f9f9;
  border-radius: 10px;
  border: 2px dashed #ddd;
}

/* 기존 스타일들은 그대로 유지 */
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
