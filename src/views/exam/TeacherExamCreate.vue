<template>
  <div class="teacher-exam-create">
    <div class="container">
      <!-- 헤더 -->
      <div class="page-header">
        <button class="back-btn" @click="goBack">
          <i class="bi bi-arrow-left"></i>
          뒤로가기
        </button>
        <h1 class="page-title">✨ 새로운 평가 만들기</h1>
        <button class="close-btn" @click="closeModal">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- 진행 단계 표시 -->
      <div class="progress-steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step-item"
          :class="{ active: currentStep >= index }"
        >
          <div class="step-circle">{{ index + 1 }}</div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>

      <!-- 메인 콘텐츠 -->
      <div class="main-content">
        <!-- 1단계: 기본 정보 설정 -->
        <div v-if="currentStep === 0" class="step-content">
          <h2 class="step-title">
            <i class="bi bi-info-circle"></i>
            기본 정보 설정
          </h2>

          <div class="form-group">
            <label class="form-label">
              📝 평가 이름 <span class="required">*</span>
              <small class="sub-label"
                >학생들에게 표시될 평가의 제목입니다</small
              >
            </label>
            <input
              type="text"
              class="form-input"
              v-model="form.examName"
              placeholder="예: 1단원 진단평가"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              📚 평가 범위 선택 <span class="required">*</span>
              <small class="sub-label">평가할 단원을 선택해주세요</small>
            </label>
            <div v-if="availableUnits.length === 0" class="loading-message">
              단원 정보를 불러오는 중...
            </div>
            <div v-else class="unit-selection">
              <div
                v-for="unit in availableUnits"
                :key="unit.unitNo"
                class="unit-card"
                :class="{ selected: form.selectedUnits.includes(unit.unitNo) }"
                @click="toggleUnit(unit.unitNo)"
              >
                <div class="unit-emoji">{{ unit.emoji }}</div>
                <div class="unit-name">
                  {{ unit.unitNo }}단원 : {{ unit.unitTitle }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              ⚡ 난이도 선택 <span class="required">*</span>
              <small class="sub-label"
                >출제할 문제의 난이도를 선택해주세요</small
              >
            </label>
            <div class="difficulty-selection">
              <label
                v-for="difficulty in availableDifficulties"
                :key="difficulty.value"
                class="difficulty-option"
                :class="{
                  selected: form.selectedDifficulties.includes(
                    difficulty.value
                  ),
                }"
              >
                <input
                  type="checkbox"
                  :value="difficulty.value"
                  v-model="form.selectedDifficulties"
                  class="sr-only"
                />
                <span class="difficulty-emoji">{{ difficulty.emoji }}</span>
                <span class="difficulty-name">{{ difficulty.label }}</span>
              </label>
            </div>
          </div>

          <!-- 단원별 문제 수 설정 -->
          <div
            v-if="
              form.selectedUnits.length > 0 &&
              form.selectedDifficulties.length > 0
            "
            class="form-group"
          >
            <label class="form-label">
              🔢 단원별 문제 수 설정 <span class="required">*</span>
              <small class="sub-label"
                >각 단원에서 출제할 문제 수를 설정해주세요</small
              >
            </label>
            <div class="unit-question-counts">
              <div
                v-for="unitNo in form.selectedUnits"
                :key="unitNo"
                class="unit-count-setting"
              >
                <div class="unit-info">
                  <span class="unit-emoji">{{ getUnitEmoji(unitNo) }}</span>
                  <span>{{ getUnitLabel(unitNo) }}</span>
                </div>
                <div class="count-controls">
                  <button
                    type="button"
                    class="count-btn"
                    @click="
                      form.unitQuestionCounts[unitNo] = Math.max(
                        1,
                        (form.unitQuestionCounts[unitNo] || 5) - 1
                      )
                    "
                  >
                    -
                  </button>
                  <input
                    type="number"
                    class="form-input small"
                    v-model.number="form.unitQuestionCounts[unitNo]"
                    min="1"
                    max="20"
                    @input="updateUnitDistribution(unitNo)"
                  />
                  <button
                    type="button"
                    class="count-btn"
                    @click="
                      form.unitQuestionCounts[unitNo] = Math.min(
                        20,
                        (form.unitQuestionCounts[unitNo] || 5) + 1
                      )
                    "
                  >
                    +
                  </button>
                  <span class="count-unit">개</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 난이도별 배분 -->
          <div
            v-if="
              form.selectedUnits.length > 0 &&
              form.selectedDifficulties.length > 0
            "
            class="form-group"
          >
            <label class="form-label">
              ⚖️ 난이도별 문제 배분
              <small class="sub-label"
                >각 단원의 난이도별 문제 수를 조정할 수 있습니다</small
              >
            </label>
            <div class="difficulty-distribution">
              <div
                v-for="unitNo in form.selectedUnits"
                :key="unitNo"
                class="unit-distribution"
              >
                <h4 class="unit-dist-title">
                  {{ getUnitEmoji(unitNo) }} {{ getUnitLabel(unitNo) }}
                </h4>
                <div class="difficulty-controls">
                  <div
                    v-for="difficulty in form.selectedDifficulties"
                    :key="difficulty"
                    class="difficulty-control"
                  >
                    <label class="control-label">
                      {{ getDifficultyEmoji(difficulty) }}
                      {{ getDifficultyLabel(difficulty) }}
                    </label>
                    <input
                      type="number"
                      class="form-input small"
                      v-model.number="
                        form.unitDifficultyDistribution[unitNo][difficulty]
                      "
                      min="0"
                      :max="form.unitQuestionCounts[unitNo] || 5"
                    />
                  </div>
                </div>
                <div class="distribution-total">
                  총 {{ getUnitTotalCount(unitNo) }}개 /
                  {{ form.unitQuestionCounts[unitNo] || 5 }}개
                  <span
                    v-if="
                      getUnitTotalCount(unitNo) !==
                      (form.unitQuestionCounts[unitNo] || 5)
                    "
                    class="error-text"
                  >
                    (수량이 일치하지 않습니다)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- <div class="form-group">
             <button
              class="btn btn-generate"
              @click="generateQuestions"
              :disabled="!isCurrentStepValid || isLoading"
            >
              <i class="bi bi-magic"></i>
              문제 생성하기
            </button> -->

          <h2 class="step-title">📅 시험 기간 설정</h2>

          <div class="form-group">
            <label class="form-label">
              시험 기간 유형 <span class="required">*</span>
            </label>
            <div class="period-type-selection">
              <label class="period-option">
                <input
                  type="radio"
                  value="unlimited"
                  v-model="form.periodType"
                  class="sr-only"
                />
                <div class="option-content">
                  <span class="option-icon">♾️</span>
                  <span class="option-text">제한 없음</span>
                  <small>학생들이 언제든지 시험을 볼 수 있습니다</small>
                </div>
              </label>
              <label class="period-option">
                <input
                  type="radio"
                  value="limited"
                  v-model="form.periodType"
                  class="sr-only"
                />
                <div class="option-content">
                  <span class="option-icon">⏰</span>
                  <span class="option-text">기간 제한</span>
                  <small>특정 기간 동안만 시험을 볼 수 있습니다</small>
                </div>
              </label>
            </div>
          </div>

          <div v-if="form.periodType === 'limited'" class="form-group">
            <label class="form-label">
              시험 기간 설정 <span class="required">*</span>
            </label>
            <div class="period-inputs">
              <div class="period-input-group">
                <label class="input-label">시작 일시</label>
                <input
                  v-model="form.period.start"
                  type="datetime-local"
                  class="form-input"
                />
              </div>
              <div class="period-separator">~</div>
              <div class="period-input-group">
                <label class="input-label">종료 일시</label>
                <input
                  v-model="form.period.end"
                  type="datetime-local"
                  class="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 2단계: 문제 편집 -->
        <div v-if="currentStep === 1" class="step-content">
          <h2 class="step-title">
            <i class="bi bi-pencil-square"></i>
            문제 편집
          </h2>

          <div v-if="selectedQuestions.length === 0" class="no-questions">
            <p>이전 단계에서 설정을 확인해주세요.</p>
          </div>

          <div v-else class="questions-section">
            <div class="questions-summary">
              <p>
                총 <strong>{{ selectedQuestions.length }}개</strong>의 문제가
                생성되었습니다.
              </p>
              <p>
                문제를 클릭하여 미리보기하거나 다른 문제로 교체할 수 있습니다.
              </p>
            </div>

            <div class="questions-content">
              <div class="questions-list">
                <div class="questions-grid">
                  <!-- <div
                    v-for="(question, index) in selectedQuestions"
                    :key="question.id"
                    class="question-item"
                    :class="{ active: selectedQuestionIndex === index }"
                    @click="selectQuestion(index)"
                  >
                    <div class="question-number">{{ index + 1 }}</div>
                    <div class="question-info">
                      <div class="question-unit">{{ question.unitTitle }}</div>
                      <div class="question-difficulty">
                        {{ getDifficultyEmoji(question.difficulty) }}
                        {{ getDifficultyLabel(question.difficulty) }}
                      </div>
                    </div>
                    <button
                      class="replace-btn"
                      @click.stop="replaceQuestion(index)"
                      :disabled="isReplacingQuestion"
                    >
                      <i class="bi bi-arrow-clockwise"></i>
                      교체
                    </button>
                  </div>
                </div>
              </div> -->
                  <div class="questions-grid">
                    <div
                      v-for="(question, index) in selectedQuestions"
                      :key="question.epNo"
                      class="question-item"
                      :class="{ active: selectedQuestionIndex === index }"
                      @click="selectQuestion(index)"
                    >
                      <div class="question-number">{{ index + 1 }}</div>
                      <div class="question-info">
                        <div class="question-unit">
                          {{ question.unitTitle || "단원명" }}
                        </div>
                        <div class="question-difficulty">
                          {{ getDifficultyLabel(question.epLevel) }}
                        </div>
                      </div>
                      <button
                        class="replace-btn"
                        @click.stop="replaceQuestion(question.epNo, index)"
                        :disabled="isReplacingQuestion"
                      >
                        <i class="bi bi-arrow-clockwise"></i>
                        교체
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 선택된 문제 미리보기 -->
              <div v-if="selectedQuestion" class="question-preview">
                <h3>문제 {{ selectedQuestionIndex + 1 }} 미리보기</h3>
                <div class="preview-content">
                  <div class="question-meta">
                    <span class="meta-item"
                      >단원: {{ selectedQuestion.unitTitle }}</span
                    >
                    <span class="meta-item"
                      >난이도:
                      {{ getDifficultyLabel(selectedQuestion.epLevel) }}</span
                    >
                  </div>
                  <div class="question-text">
                    {{
                      selectedQuestion.epQuestion ||
                      "문제 내용을 불러오는 중..."
                    }}
                  </div>
                  <div
                    v-if="selectedQuestion.epImageUrl"
                    class="question-image"
                  >
                    <img
                      :src="getImageUrl(selectedQuestion.epImageUrl)"
                      alt="문제 이미지"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3단계: 대상 학생 선택 -->
        <div v-if="currentStep === 2" class="step-content">
          <h2 class="step-title">
            <i class="bi bi-people"></i>
            대상 학생 선택
          </h2>

          <div v-if="allStudents.length === 0" class="loading-message">
            학생 정보를 불러오는 중...
          </div>

          <div v-else>
            <div class="select-all-controls">
              <button
                class="select-all-btn"
                :class="{ active: isAllSelected }"
                @click="selectAllStudents"
              >
                <i
                  class="bi"
                  :class="isAllSelected ? 'bi-check-square' : 'bi-square'"
                ></i>
                {{ isAllSelected ? "전체 선택 해제" : "전체 선택" }}
              </button>
              <div class="selection-summary">
                {{ form.targetStudents.length }} / {{ allStudents.length }}명
                선택됨
              </div>
            </div>

            <div class="students-section">
              <div class="students-grid">
                <label
                  v-for="student in allStudents"
                  :key="student.classroomStudentNo"
                  class="student-item"
                  :class="{
                    selected: form.targetStudents.includes(
                      student.classroomStudentNo
                    ),
                  }"
                >
                  <input
                    type="checkbox"
                    :value="student.classroomStudentNo"
                    v-model="form.targetStudents"
                    class="sr-only"
                  />
                  <div class="student-avatar">
                    {{ student.name.charAt(0) }}
                  </div>
                  <div class="student-name">{{ student.name }}</div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 버튼 영역 -->
        <div class="form-actions">
          <button
            v-if="currentStep > 0"
            class="btn btn-secondary"
            @click="previousStep"
            :disabled="isLoading"
          >
            <i class="bi bi-arrow-left"></i>
            이전 단계
          </button>

          <div class="action-spacer"></div>

          <button
            v-if="currentStep < steps.length - 1"
            class="btn btn-primary"
            @click="nextStep"
            :disabled="!isCurrentStepValid || isLoading"
          >
            다음 단계
            <i class="bi bi-arrow-right"></i>
          </button>

          <button
            v-else
            class="btn btn-success"
            @click="submitExam"
            :disabled="!isFormValid || isLoading"
          >
            <i class="bi bi-check-circle"></i>
            평가 생성
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/utils/apiClient";

export default {
  name: "TeacherExamCreate",
  setup() {
    const router = useRouter();

    // 기본 상태
    const isLoading = ref(false);
    const loadingText = ref("");
    const isReplacingQuestion = ref(false);
    const currentStep = ref(0);
    const selectedQuestionIndex = ref(-1);
    const tokenInfo = ref(null);

    // 단계 정의
    const steps = [
      { label: "기본 정보" },
      { label: "문제 편집" },
      { label: "대상 학생" },
    ];

    // 폼 데이터
    const form = reactive({
      examName: "",
      selectedUnits: [],
      selectedDifficulties: [],
      unitQuestionCounts: {},
      unitDifficultyDistribution: {},
      periodType: "unlimited",
      period: {
        start: "",
        end: "",
      },
      targetStudents: [],
      classroomNo: null,
    });

    // 선택된 문제들
    const selectedQuestions = ref([]);
    const allStudents = ref([]);

    // 가용한 옵션들 - API로 가져올 것
    const availableUnits = ref([]);
    const availableDifficulties = [
      { value: "하", label: "쉬움", emoji: "🟢" },
      { value: "중", label: "보통", emoji: "🟡" },
      { value: "상", label: "어려움", emoji: "🔴" },
    ];

    // 토큰 정보 로드
    const loadTokenInfo = () => {
      try {
        const tokenInfoStr = localStorage.getItem("tokenInfo");
        if (tokenInfoStr) {
          tokenInfo.value = JSON.parse(tokenInfoStr);
          form.classroomNo = tokenInfo.value.classroomNo;
        }
      } catch (err) {
        console.error("토큰 정보 파싱 실패:", err);
      }
    };

    // 단원 데이터 로드 - API로 변경
    const loadUnits = async () => {
      try {
        const selectedTextbookStr = localStorage.getItem("selectedTextbook");
        if (!selectedTextbookStr) {
          console.error("선택된 교재 정보가 없습니다.");
          return;
        }

        const selectedTextbook = JSON.parse(selectedTextbookStr);
        const textbookNo = selectedTextbook.id;

        const response = await apiClient.get(
          `/api/textbooks/units/${textbookNo}`
        );

        // API 응답을 현재 형식에 맞게 변환
        availableUnits.value = response.map((unit) => ({
          unitNo: unit.unitNo,
          unitTitle: unit.unitTitle,
          emoji: getUnitEmojiByNumber(unit.unitNo), // 단원 번호에 따른 이모지 매핑
        }));
        console.log("단원 데이터 로드 완료:", availableUnits.value);
      } catch (err) {
        console.error("단원 데이터 로드 실패:", err);
      }
    };

    // 단원 번호에 따른 이모지 매핑 함수
    const getUnitEmojiByNumber = (unitNo) => {
      const emojiMap = {
        1: "🔢",
        2: "➕",
        3: "📝",
        4: "📊",
        5: "⚖️",
        6: "📐",
        7: "🔺",
        8: "📏",
        9: "📈",
        10: "🧮",
      };
      return emojiMap[unitNo] || "📚";
    };

    // 학생 데이터 로드 - API로 변경
    const loadStudents = async () => {
      try {
        if (!form.classroomNo) {
          console.error("클래스룸 번호가 없습니다.");
          return;
        }

        const response = await apiClient.get(
          `/api/classroom/student/${form.classroomNo}`
        );

        // API 응답 구조에 맞게 데이터 매핑
        allStudents.value = response.map((student) => ({
          classroomStudentNo: student.classroomStudentNo,
          name: student.studentName,
        }));

        console.log("학생 데이터 로드 완료:", allStudents.value);
      } catch (err) {
        console.error("학생 데이터 로드 실패:", err);
      }
    };

    // 계산된 속성들
    const isAllSelected = computed(
      () => form.targetStudents.length === allStudents.value.length
    );

    const selectedQuestion = computed(() => {
      if (
        selectedQuestionIndex.value >= 0 &&
        selectedQuestions.value.length > 0
      ) {
        return selectedQuestions.value[selectedQuestionIndex.value];
      }
      return null;
    });

    const isCurrentStepValid = computed(() => {
      switch (currentStep.value) {
        case 0:
          const allUnitsValid = form.selectedUnits.every((unitNo) => {
            const unitTotal = getUnitTotalCount(unitNo);
            const expectedTotal = form.unitQuestionCounts[unitNo] || 0;
            return unitTotal === expectedTotal && expectedTotal > 0;
          });
          return (
            form.examName.trim() &&
            form.selectedUnits.length > 0 &&
            form.selectedDifficulties.length > 0 &&
            allUnitsValid
          );
        case 1:
          return selectedQuestions.value.length > 0;
        case 2:
          return form.targetStudents.length > 0;
        default:
          return false;
      }
    });

    const isFormValid = computed(() => {
      return isCurrentStepValid.value && currentStep.value === steps.length - 1;
    });

    // 유틸리티 함수들
    const getUnitLabel = (unitNo) => {
      const unit = availableUnits.value.find((u) => u.unitNo === unitNo);
      return unit ? `${unitNo}단원 : ${unit.unitTitle}` : `${unitNo}단원`;
    };

    const getUnitEmoji = (unitNo) => {
      const unit = availableUnits.value.find((u) => u.unitNo === unitNo);
      return unit ? unit.emoji : "📚";
    };

    const getDifficultyLabel = (difficulty) => {
      const diff = availableDifficulties.find((d) => d.value === difficulty);
      return diff ? diff.label : difficulty;
    };

    const getDifficultyEmoji = (difficulty) => {
      const diff = availableDifficulties.find((d) => d.value === difficulty);
      return diff ? diff.emoji : "⭐";
    };

    const getUnitTotalCount = (unitNo) => {
      const distribution = form.unitDifficultyDistribution[unitNo] || {};
      return Object.values(distribution).reduce(
        (sum, count) => sum + (count || 0),
        0
      );
    };

    // S3 URL을 Public URL로 변환하는 함수
    const getImageUrl = (imageUrl) => {
      if (!imageUrl || imageUrl.trim() === "") {
        console.log("이미지 URL이 없어서 기본 이미지 사용");
        return "/images/default-textbook.png";
      }

      // 이미 완전한 HTTP URL인 경우 그대로 사용
      if (imageUrl.startsWith("http")) {
        return imageUrl;
      }

      // S3 URI를 Public URL로 변환
      if (imageUrl.startsWith("s3://airoom/")) {
        const path = imageUrl.replace("s3://airoom/exam_problem_image/", "");
        console.log(imageUrl);
        return `https://airoom.s3.ap-northeast-2.amazonaws.com/EXAM_PROBLEM_IMAGE/${path}`;
      }

      console.warn("예상하지 못한 이미지 URL 형식:", imageUrl);
      return "/images/default-textbook.png";
    };

    // 폼 조작 함수들
    const toggleUnit = (unitNo) => {
      const index = form.selectedUnits.indexOf(unitNo);
      if (index > -1) {
        form.selectedUnits.splice(index, 1);
        delete form.unitQuestionCounts[unitNo];
        delete form.unitDifficultyDistribution[unitNo];
      } else if (form.selectedUnits.length < 5) {
        form.selectedUnits.push(unitNo);
        form.unitQuestionCounts[unitNo] = 5;
        initializeUnitDistribution(unitNo);
      } else {
        alert("최대 5개 단원까지 선택할 수 있습니다.");
      }
    };

    const initializeUnitDistribution = (unitNo) => {
      if (!form.unitDifficultyDistribution[unitNo]) {
        form.unitDifficultyDistribution[unitNo] = {};
      }

      form.selectedDifficulties.forEach((difficulty) => {
        if (!form.unitDifficultyDistribution[unitNo][difficulty]) {
          form.unitDifficultyDistribution[unitNo][difficulty] = 1;
        }
      });
    };

    const updateUnitDistribution = (unitNo) => {
      const totalCount = form.unitQuestionCounts[unitNo] || 5;
      const difficulties = form.selectedDifficulties;
      const perDifficulty = Math.floor(totalCount / difficulties.length);
      const remainder = totalCount % difficulties.length;

      if (!form.unitDifficultyDistribution[unitNo]) {
        form.unitDifficultyDistribution[unitNo] = {};
      }

      difficulties.forEach((difficulty, index) => {
        form.unitDifficultyDistribution[unitNo][difficulty] =
          perDifficulty + (index < remainder ? 1 : 0);
      });
    };

    const selectAllStudents = () => {
      if (isAllSelected.value) {
        form.targetStudents = [];
      } else {
        form.targetStudents = allStudents.value.map(
          (s) => s.classroomStudentNo
        );
      }
    };

    // API 호출 함수들
    const generateQuestionsFromAPI = async () => {
      try {
        isLoading.value = true;
        loadingText.value = "문제를 생성하는 중...";

        const examProblemRequestList = [];

        form.selectedUnits.forEach((unitNo) => {
          const problemCountsByLevel = {};
          form.selectedDifficulties.forEach((difficulty) => {
            const count =
              form.unitDifficultyDistribution[unitNo]?.[difficulty] || 0;
            if (count > 0) {
              problemCountsByLevel[difficulty] = count;
            }
          });

          if (Object.keys(problemCountsByLevel).length > 0) {
            examProblemRequestList.push({
              unitNo: unitNo,
              problemCountsByLevel: problemCountsByLevel,
            });
          }
        });
        const requestData = {
          examProblemRequestList: examProblemRequestList,
        };

        const response = await apiClient.post(
          "/exam/level-unit/problems",
          requestData
        );

        console.log("📚 문제 생성 응답:", response);

        selectedQuestions.value = response.examProblemResponseList || [];

        if (selectedQuestions.value.length > 0) {
          selectedQuestionIndex.value = 0;
        }
      } catch (err) {
        console.error("🚨 문제 생성 실패:", err);
        alert(
          "문제 생성에 실패했습니다: " + (err.message || "알 수 없는 오류")
        );
        selectedQuestions.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // const generateQuestions = async () => {
    //   await generateQuestionsFromAPI();
    // };

    // const replaceQuestion = async (index) => {
    //   try {
    //     isReplacingQuestion.value = true;
    //     const questionToReplace = selectedQuestions.value[index];

    //     const response = await apiClient.post("/api/teacher/exam/problems", {
    //       examProblemRequestList: [
    //         {
    //           unitNo: questionToReplace.unitNo,
    //           problemCountsByLevel: {
    //             [questionToReplace.difficulty]: 1,
    //           },
    //         },
    //       ],
    //     });

    //     if (response.length > 0) {
    //       const newQuestion = response[0];
    //       selectedQuestions.value[index] = {
    //         id: newQuestion.problemNo,
    //         unitName: getUnitLabel(newQuestion.unitNo),
    //         difficulty: newQuestion.level,
    //         content: newQuestion.content,
    //         imageUrl: newQuestion.imageUrl,
    //         unitNo: newQuestion.unitNo,
    //       };
    //     }
    //   } catch (error) {
    //     console.error("문제 교체 실패:", error);
    //     alert("문제 교체에 실패했습니다. 다시 시도해주세요.");
    //   } finally {
    //     isReplacingQuestion.value = false;
    //   }
    // };

    // const replaceQuestion = async (epNo, questionIndex) => {
    //   try {
    //     isReplacingQuestion.value = true;

    //     const requestData = {
    //       epNo: epNo,
    //     };

    //     console.log("🔄 문제 교체 요청:", requestData);

    //     const response = await apiClient.post("/exam/problem", requestData);

    //     console.log("✅ 문제 교체 성공:", response);

    //     // 해당 인덱스의 문제를 새로운 문제로 교체
    //     selectedQuestions.value[questionIndex] = response;
    //   } catch (err) {
    //     console.error("🚨 문제 교체 실패:", err);
    //     alert(
    //       "문제 교체에 실패했습니다: " + (err.message || "알 수 없는 오류")
    //     );
    //   } finally {
    //     isReplacingQuestion.value = false;
    //   }
    // };
    const replaceQuestion = async (epNo, index) => {
      try {
        isReplacingQuestion.value = true;
        const questionToReplace = selectedQuestions.value[index];

        const requestData = {
          epNo: epNo,
        };

        console.log("?" + requestData.epNo);

        const response = await apiClient.post("/exam/problem", requestData);

        selectedQuestions.value[index] = response;
        // if (response.length > 0) {
        //   const newQuestion = response[0];
        //   selectedQuestions.value[index] = {
        //     id: newQuestion.problemNo,
        //     unitName: getUnitLabel(newQuestion.unitNo),
        //     difficulty: newQuestion.level,
        //     content: newQuestion.content,
        //     imageUrl: newQuestion.imageUrl,
        //     unitNo: newQuestion.unitNo,
        //   };
        // }
      } catch (error) {
        console.error("문제 교체 실패:", error);
        alert("문제 교체에 실패했습니다. 다시 시도해주세요.");
      } finally {
        isReplacingQuestion.value = false;
      }
    };

    // 네비게이션 함수들
    const nextStep = async () => {
      if (currentStep.value === 0 && isCurrentStepValid.value) {
        // 1단계에서 2단계로 갈 때 문제 생성
        await generateQuestionsFromAPI();
      }

      if (currentStep.value < steps.length - 1 && isCurrentStepValid.value) {
        currentStep.value++;
      }
    };

    const previousStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--;
      }
    };

    const selectQuestion = (index) => {
      selectedQuestionIndex.value = index;
    };

    // 평가 제출
    const submitExam = async () => {
      if (!isFormValid.value) {
        alert("모든 필수 항목을 입력해주세요.");
        return;
      }

      try {
        isLoading.value = true;
        loadingText.value = "평가를 생성하는 중...";

        // CreateExamRequest 형식에 맞게 데이터 구성
        const examData = {
          examName: form.examName,
          unitNoList: form.selectedUnits,
          examProblemCount: selectedQuestions.value.length,
          examStartTime:
            form.periodType === "limited" ? form.period.start : null,
          examEndTime: form.periodType === "limited" ? form.period.end : null,
          epNoList: selectedQuestions.value.map((q) => q.epNo),
          classroomNo: form.classroomNo,
          classroomStudentNoList: form.targetStudents,
        };

        console.log("📤 시험 생성 요청 데이터:", examData);

        const response = await apiClient.post("/exam", examData);

        console.log("✅ 시험 생성 성공:", response);

        alert(`평가가 성공적으로 생성되었습니다!`);
        router.push({ name: "Exam" });
      } catch (err) {
        console.error("🚨 시험 생성 실패:", err);
        alert(
          "평가 생성에 실패했습니다: " + (err.message || "알 수 없는 오류")
        );
      } finally {
        isLoading.value = false;
      }
    };

    // 뒤로가기
    const goBack = () => {
      if (confirm("작성 중인 내용이 모두 사라집니다. 정말 나가시겠습니까?")) {
        router.back();
      }
    };

    const closeModal = () => {
      if (window.opener) {
        if (confirm("작성 중인 내용이 모두 사라집니다. 정말 닫으시겠습니까?")) {
          window.close();
        }
      } else {
        goBack();
      }
    };

    // 생명주기
    onMounted(async () => {
      loadTokenInfo();
      await loadUnits(); // 단원 정보 먼저 로드
      await loadStudents(); // 학생 정보 로드
    });

    return {
      // 상태
      isLoading,
      loadingText,
      isReplacingQuestion,
      currentStep,
      selectedQuestionIndex,
      steps,
      form,
      selectedQuestions,
      allStudents,
      availableUnits,
      availableDifficulties,

      // 계산된 속성
      isAllSelected,
      selectedQuestion,
      isCurrentStepValid,
      isFormValid,

      // 메서드
      getUnitLabel,
      getUnitEmoji,
      getDifficultyLabel,
      getDifficultyEmoji,
      getUnitTotalCount,
      getImageUrl,
      toggleUnit,
      updateUnitDistribution,
      selectAllStudents,
      nextStep,
      previousStep,
      selectQuestion,
      replaceQuestion,
      submitExam,
      goBack,
      closeModal,
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

.teacher-exam-create {
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  min-height: 100vh;
  padding: 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.2);
  border: 3px solid #c8e6c9;
  overflow: hidden;
}

/* 헤더 */
.page-header {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: white;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.back-btn,
.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.back-btn:hover,
.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 진행 단계 */
.progress-steps {
  background: #f8f9fa;
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
  border-bottom: 3px solid #e8f5e8;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all 0.3s ease;
}

.step-item.active .step-circle {
  background: #4caf50;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.step-item.active .step-label {
  color: #4caf50;
}

/* 로딩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #e8f5e8;
  border-top: 6px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4caf50;
}

.loading-message {
  text-align: center;
  color: #666;
  font-size: 1rem;
  padding: 2rem;
}

/* 메인 콘텐츠 */
.main-content {
  padding: 2rem;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step-title {
  color: #2e7d32;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 폼 스타일 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-label {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2e7d32;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.required {
  color: #e74c3c;
}

.sub-label {
  display: block;
  font-size: 0.85rem;
  color: #8bc34a;
  font-weight: 500;
  margin-top: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 3px solid #e8f5e8;
  border-radius: 15px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  font-family: inherit;
  line-height: 1.5;
}

.form-input.small {
  width: auto;
  min-width: 120px;
  padding: 0.5rem 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
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

.error-text {
  color: #e74c3c;
  font-weight: 600;
}

/* 단원 선택 */
.unit-selection {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.unit-card {
  background: white;
  border: 3px solid #e8f5e8;
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.unit-card:hover {
  border-color: #8bc34a;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.1);
}

.unit-card.selected {
  border-color: #4caf50;
  background: #f1f8e9;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.2);
}

.unit-emoji {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.unit-name {
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 0.25rem;
}

/* 난이도 선택 */
.difficulty-selection {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.difficulty-option {
  background: white;
  border: 3px solid #e8f5e8;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 120px;
}

.difficulty-option:hover {
  border-color: #8bc34a;
  transform: translateY(-2px);
}

.difficulty-option.selected {
  border-color: #4caf50;
  background: #f1f8e9;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.difficulty-emoji {
  font-size: 1.2rem;
}

.difficulty-name {
  font-weight: 600;
  color: #2e7d32;
}

/* 문제 수 설정 */
.unit-question-counts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.unit-count-setting {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #e8f5e8;
}

.unit-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #4caf50;
  background: white;
  color: #4caf50;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all 0.3s ease;
}

.count-btn:hover {
  background: #4caf50;
  color: white;
}

.count-unit {
  font-weight: 600;
  color: #666;
}

/* 난이도 배분 */
.difficulty-distribution {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.unit-distribution {
  background: #f8f9fa;
  border: 2px solid #e8f5e8;
  border-radius: 15px;
  padding: 1.5rem;
}

.unit-dist-title {
  color: #2e7d32;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.difficulty-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.difficulty-control {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
}

.distribution-total {
  font-weight: 600;
  color: #4caf50;
  text-align: right;
}

/* 버튼 */
.btn {
  padding: 1rem 2rem;
  border-radius: 15px;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-generate {
  background: #ff9800;
  color: white;
  align-self: center;
}

.btn-generate:hover {
  background: #f57c00;
  transform: translateY(-2px);
}

.btn-primary {
  background: #4caf50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #e0e0e0;
  color: #666;
}

.btn-secondary:hover {
  background: #d5d5d5;
  transform: translateY(-2px);
}

.btn-success {
  background: #2e7d32;
  color: white;
}

.btn-success:hover {
  background: #1b5e20;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 시험 기간 설정 */
.period-type-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.period-option {
  background: white;
  border: 3px solid #e8f5e8;
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-option:hover {
  border-color: #8bc34a;
  transform: translateY(-2px);
}

.period-option:has(input:checked) {
  border-color: #4caf50;
  background: #f1f8e9;
}

.option-content {
  text-align: center;
}

.option-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.option-text {
  font-weight: 700;
  color: #2e7d32;
  display: block;
  margin-bottom: 0.5rem;
}

.option-content small {
  color: #666;
  font-size: 0.85rem;
}

.period-inputs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: end;
}

.period-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
}

.period-separator {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4caf50;
  text-align: center;
}

/* 문제 편집 */
.no-questions {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.questions-summary {
  background: #e8f5e8;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  text-align: center;
}

.questions-summary p {
  margin-bottom: 0.5rem;
}

.questions-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.questions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.question-item {
  background: white;
  border: 3px solid #e8f5e8;
  border-radius: 15px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.question-item:hover {
  border-color: #8bc34a;
  transform: translateY(-2px);
}

.question-item.active {
  border-color: #4caf50;
  background: #f1f8e9;
}

.question-number {
  width: 40px;
  height: 40px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.question-info {
  flex: 1;
}

.question-unit {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.question-difficulty {
  font-size: 0.8rem;
  color: #4caf50;
  font-weight: 600;
}

.replace-btn {
  background: #ff9800;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.3s ease;
}

.replace-btn:hover {
  background: #f57c00;
  transform: translateY(-1px);
}

.replace-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 문제 미리보기 */
.question-preview {
  background: #f8f9fa;
  border: 2px solid #e8f5e8;
  border-radius: 15px;
  padding: 2rem;
  position: sticky;
  top: 1rem;
  height: fit-content;
}

.question-preview h3 {
  color: #2e7d32;
  margin-bottom: 1rem;
}

.question-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
}

.question-text {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.question-image {
  text-align: center;
}

.question-image img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 학생 선택 */
.select-all-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e8f5e8;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.select-all-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.select-all-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.select-all-btn.active {
  background: #2e7d32;
}

.selection-summary {
  font-weight: 700;
  color: #2e7d32;
}

.students-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.student-item {
  background: white;
  border: 3px solid #e8f5e8;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.student-item:hover {
  border-color: #8bc34a;
  transform: translateY(-2px);
}

.student-item.selected {
  border-color: #4caf50;
  background: #f1f8e9;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.student-avatar {
  width: 50px;
  height: 50px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.student-name {
  font-weight: 600;
  color: #2e7d32;
}

/* 폼 액션 */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 3px solid #e8f5e8;
  margin-top: 2rem;
}

.action-spacer {
  flex: 1;
}

/* 반응형 */
@media (max-width: 768px) {
  .questions-content {
    grid-template-columns: 1fr;
  }

  .question-preview {
    position: static;
  }

  .progress-steps {
    flex-direction: column;
    gap: 1rem;
  }

  .step-item {
    flex-direction: row;
    justify-content: center;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
