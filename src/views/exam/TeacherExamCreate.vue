<template>
  <Header />
  <div class="exam-creator-page">
    <div class="creator-container">
      <h1 class="page-title">📝 평가 추가하기</h1>
      <p class="page-subtitle">
        학생들의 학습 상황을 확인할 새로운 평가를 만들어보세요! ⭐
      </p>

      <div class="notice-box">
        <span class="notice-icon">💡</span>
        <p>
          여러 학급을 담당할 경우, 평가 출제 후 상세 페이지에서 다른 학급에
          동일한 평가를 복사/등록할 수 있습니다.
        </p>
      </div>

      <!-- 진행 단계 -->
      <div class="progress-steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step"
          :class="{
            active: currentStep === index,
            completed: currentStep > index,
          }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>

      <form @submit.prevent="submitExam" class="exam-form">
        <!-- 1단계: 범위 선택 -->
        <div v-if="currentStep === 0" class="step-content">
          <h2 class="step-title">📚 평가 범위 설정</h2>

          <!-- 시험지명 -->
          <div class="form-group">
            <label for="exam-name" class="form-label">
              📝 시험지명 <span class="required">*</span>
            </label>
            <input
              type="text"
              id="exam-name"
              class="form-input"
              v-model="form.name"
              placeholder="시험지명을 입력해 주세요."
              required
            />
          </div>

          <!-- 시험 범위 선택 -->
          <div class="form-group">
            <label class="form-label">
              📖 시험 범위 선택 <span class="required">*</span>
              <small class="sub-label">최대 5개 선택 가능</small>
            </label>
            <div class="unit-selection">
              <div
                v-for="unit in availableUnits"
                :key="unit.value"
                class="unit-card"
                :class="{ selected: form.selectedUnits.includes(unit.value) }"
                @click="toggleUnit(unit.value)"
              >
                <div class="unit-emoji">{{ unit.emoji }}</div>
                <div class="unit-name">{{ unit.label }}</div>
                <div class="unit-count">({{ unit.questionCount }}문제)</div>
              </div>
            </div>
          </div>

          <!-- 문제 난이도 -->
          <div class="form-group">
            <label class="form-label">
              ⭐ 문제 난이도 <span class="required">*</span>
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
                />
                <span class="difficulty-emoji">{{ difficulty.emoji }}</span>
                <span class="difficulty-label">{{ difficulty.label }}</span>
              </label>
            </div>
          </div>

          <!-- 단원별 문제 수 및 난이도 분포 설정 -->
          <div
            v-if="
              form.selectedUnits.length > 0 &&
              form.selectedDifficulties.length > 0
            "
            class="form-group"
          >
            <label class="form-label">
              🎯 단원별 문제 수 및 난이도 분포 설정
              <button
                type="button"
                class="distribution-reset-btn"
                @click="resetAllDistribution"
                title="전체 균등 분배로 초기화"
              >
                ⚙️ 전체 초기화
              </button>
            </label>

            <div class="unit-distribution-container">
              <div
                v-for="unitValue in form.selectedUnits"
                :key="unitValue"
                class="unit-distribution-card"
              >
                <div class="unit-distribution-header">
                  <span class="unit-emoji">{{ getUnitEmoji(unitValue) }}</span>
                  <span class="unit-name">{{ getUnitLabel(unitValue) }}</span>
                  <button
                    type="button"
                    class="unit-reset-btn"
                    @click="resetUnitDistribution(unitValue)"
                    title="이 단원 초기화"
                  >
                    🔄
                  </button>
                </div>

                <!-- 단원별 총 문제 수 설정 -->
                <div class="unit-question-count">
                  <label>총 문제 수:</label>
                  <select
                    v-model="form.unitQuestionCounts[unitValue]"
                    class="form-input small"
                    @change="initializeUnitDistribution(unitValue)"
                  >
                    <option
                      v-for="num in availableQuestionCounts"
                      :key="num"
                      :value="num"
                    >
                      {{ num }}문제
                    </option>
                  </select>
                </div>

                <!-- 단원별 난이도 분포 테이블 -->
                <div class="difficulty-distribution-table">
                  <div class="distribution-header">
                    <div class="header-cell">난이도</div>
                    <div class="header-cell">문제 수</div>
                    <div class="header-cell">비율</div>
                  </div>
                  <div
                    v-for="difficulty in form.selectedDifficulties"
                    :key="difficulty"
                    class="distribution-row"
                  >
                    <div class="difficulty-cell">
                      <span class="difficulty-emoji">{{
                        getDifficultyEmoji(difficulty)
                      }}</span>
                      <span class="difficulty-name">{{ difficulty }}</span>
                    </div>
                    <div class="count-cell">
                      <div class="count-adjuster">
                        <button
                          type="button"
                          class="count-btn minus"
                          @click="
                            adjustUnitDifficultyCount(unitValue, difficulty, -1)
                          "
                          :disabled="
                            getUnitDifficultyCount(unitValue, difficulty) <= 0
                          "
                        >
                          −
                        </button>
                        <input
                          type="number"
                          :value="getUnitDifficultyCount(unitValue, difficulty)"
                          @input="
                            setUnitDifficultyCount(
                              unitValue,
                              difficulty,
                              $event.target.value
                            )
                          "
                          class="count-input"
                          min="0"
                          :max="form.unitQuestionCounts[unitValue] || 0"
                        />
                        <button
                          type="button"
                          class="count-btn plus"
                          @click="
                            adjustUnitDifficultyCount(unitValue, difficulty, 1)
                          "
                          :disabled="
                            getUnitTotalCount(unitValue) >=
                            (form.unitQuestionCounts[unitValue] || 0)
                          "
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div class="ratio-cell">
                      {{ getUnitDifficultyRatio(unitValue, difficulty) }}%
                    </div>
                  </div>
                  <div class="distribution-summary">
                    <div class="summary-cell">합계</div>
                    <div
                      class="summary-count"
                      :class="{
                        error:
                          getUnitTotalCount(unitValue) !==
                          (form.unitQuestionCounts[unitValue] || 0),
                      }"
                    >
                      {{ getUnitTotalCount(unitValue) }} /
                      {{ form.unitQuestionCounts[unitValue] || 0 }}
                    </div>
                    <div class="summary-ratio">
                      {{
                        getUnitTotalCount(unitValue) ===
                        (form.unitQuestionCounts[unitValue] || 0)
                          ? "100%"
                          : "불일치"
                      }}
                    </div>
                  </div>
                  <div
                    v-if="
                      getUnitTotalCount(unitValue) !==
                      (form.unitQuestionCounts[unitValue] || 0)
                    "
                    class="distribution-warning"
                  >
                    ⚠️ 난이도별 문제 수의 합이 총 문제 수와 일치하지 않습니다.
                  </div>
                </div>
              </div>
            </div>

            <!-- 전체 요약 -->
            <div class="total-summary">
              <h3>📊 전체 요약</h3>
              <div class="summary-content">
                <div class="summary-item">
                  <span class="summary-label">총 문제 수:</span>
                  <span class="summary-value"
                    >{{ getTotalQuestionCount() }}문제</span
                  >
                </div>
                <div class="summary-breakdown">
                  <div
                    v-for="difficulty in form.selectedDifficulties"
                    :key="difficulty"
                    class="breakdown-item"
                  >
                    <span class="difficulty-emoji">{{
                      getDifficultyEmoji(difficulty)
                    }}</span>
                    <span class="breakdown-text"
                      >{{ difficulty }}:
                      {{ getTotalDifficultyCount(difficulty) }}문제</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2단계: 평가 설정 -->
        <div v-if="currentStep === 1" class="step-content">
          <h2 class="step-title">⚙️ 평가 설정</h2>

          <!-- 응시 기간 -->
          <div class="form-group">
            <label class="form-label">📅 응시 기간</label>
            <div class="period-selection">
              <div class="period-radio-group">
                <label class="radio-option">
                  <input
                    type="radio"
                    v-model="form.periodType"
                    value="unlimited"
                  />
                  <span>미설정</span>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    v-model="form.periodType"
                    value="limited"
                  />
                  <span>설정</span>
                </label>
              </div>

              <Transition name="form-slide">
                <div
                  v-if="form.periodType === 'limited'"
                  class="date-picker-group"
                >
                  <div class="date-input-wrapper">
                    <label for="start-date" class="sr-only">시작 일시</label>
                    <input
                      id="start-date"
                      type="datetime-local"
                      class="form-input"
                      v-model="form.period.start"
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
                    />
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- 재응시 가능 여부 -->
          <div class="form-group">
            <label class="form-label">🔄 재응시 가능 여부</label>
            <div class="retake-selection">
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="form.retakeAllowed"
                  value="false"
                />
                <span>비허용</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="form.retakeAllowed" value="true" />
                <span>허용</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 3단계: 대상 설정 -->
        <div v-if="currentStep === 2" class="step-content">
          <h2 class="step-title">🎯 대상 설정</h2>

          <!-- 학생 선택 -->
          <div class="form-group">
            <label class="form-label">👥 응시 대상 학생</label>
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
                <span class="info-text"
                  >학생의 종합 학습 수준이 표시됩니다.</span
                >
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
        </div>

        <!-- 네비게이션 버튼 -->
        <div class="navigation-buttons">
          <button
            v-if="currentStep > 0"
            type="button"
            class="btn btn-secondary"
            @click="previousStep"
          >
            ← 이전
          </button>

          <button
            v-if="currentStep < steps.length - 1"
            type="button"
            class="btn btn-primary"
            @click="nextStep"
            :disabled="!isCurrentStepValid"
            :class="{ disabled: !isCurrentStepValid }"
          >
            다음 →
          </button>

          <button
            v-if="currentStep === steps.length - 1"
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid"
            :class="{ disabled: !isFormValid }"
          >
            📝 평가 생성하기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";

const router = useRouter();
const currentStep = ref(0);

// 단계 정보
const steps = [
  { label: "범위 선택" },
  { label: "평가 설정" },
  { label: "대상 설정" },
];

// 폼 데이터
const form = reactive({
  name: "",
  selectedUnits: [],
  selectedDifficulties: ["상", "중", "하"],
  unitQuestionCounts: {}, // 단원별 총 문제 수
  unitDifficultyDistribution: {}, // 단원별 난이도 분포
  periodType: "unlimited",
  period: {
    start: "",
    end: "",
  },
  retakeAllowed: "false",
  targetStudents: [],
});

// 문제 수 옵션
const availableQuestionCounts = [3, 5, 7, 10, 15, 20, 25, 30];

// 단원 데이터
const availableUnits = [
  { value: "unit1", label: "1. 곱셈", emoji: "✖️", questionCount: 25 },
  { value: "unit2", label: "2. 나눗셈", emoji: "➗", questionCount: 30 },
  { value: "unit3", label: "3. 원", emoji: "⭕", questionCount: 20 },
  { value: "unit4", label: "4. 들이와 무게", emoji: "⚖️", questionCount: 18 },
  { value: "unit5", label: "5. 분수", emoji: "🔢", questionCount: 22 },
  { value: "unit6", label: "6. 그림그래프", emoji: "📊", questionCount: 15 },
];

// 난이도 데이터
const availableDifficulties = [
  { value: "최상", label: "최상", emoji: "🌟" },
  { value: "상", label: "상", emoji: "⭐" },
  { value: "중", label: "중", emoji: "✨" },
  { value: "하", label: "하", emoji: "💫" },
  { value: "최하", label: "최하", emoji: "🔸" },
];

// 학생 데이터
const allStudents = ref([
  { id: 1, name: "김영수", level: "상" },
  { id: 2, name: "이지은", level: "상" },
  { id: 3, name: "박민준", level: "중" },
  { id: 4, name: "최서연", level: "중" },
  { id: 5, name: "정우진", level: "중" },
  { id: 6, name: "강하늘", level: "하" },
  { id: 7, name: "윤소미", level: "하" },
  { id: 8, name: "임태호", level: "하" },
  { id: 9, name: "조은별", level: "하" },
  { id: 10, name: "한도윤", level: "하" },
]);

// 계산된 속성들
const groupedStudents = computed(() => {
  const groups = { 상: [], 중: [], 하: [] };
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

const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 0:
      // 모든 선택된 단원의 분포가 올바른지 확인
      const allUnitsValid = form.selectedUnits.every((unitValue) => {
        const unitTotal = getUnitTotalCount(unitValue);
        const expectedTotal = form.unitQuestionCounts[unitValue] || 0;
        return unitTotal === expectedTotal && expectedTotal > 0;
      });

      return (
        form.name.trim() &&
        form.selectedUnits.length > 0 &&
        form.selectedDifficulties.length > 0 &&
        allUnitsValid
      );
    case 1:
      if (form.periodType === "limited") {
        return (
          form.period.start &&
          form.period.end &&
          new Date(form.period.start) < new Date(form.period.end)
        );
      }
      return true;
    case 2:
      return form.targetStudents.length > 0;
    default:
      return false;
  }
});

const isFormValid = computed(() => {
  return isCurrentStepValid.value && currentStep.value === steps.length - 1;
});

// 메서드들
const toggleUnit = (unitValue) => {
  const index = form.selectedUnits.indexOf(unitValue);
  if (index > -1) {
    form.selectedUnits.splice(index, 1);
    // 단원 제거 시 관련 데이터도 정리
    delete form.unitQuestionCounts[unitValue];
    delete form.unitDifficultyDistribution[unitValue];
  } else if (form.selectedUnits.length < 5) {
    form.selectedUnits.push(unitValue);
    // 새 단원 추가 시 기본값 설정
    form.unitQuestionCounts[unitValue] = 5;
    initializeUnitDistribution(unitValue);
  } else {
    alert("최대 5개 단원까지 선택할 수 있습니다.");
  }
};

const getUnitLabel = (unitValue) => {
  const unit = availableUnits.find((u) => u.value === unitValue);
  return unit ? unit.label : unitValue;
};

const getUnitEmoji = (unitValue) => {
  const unit = availableUnits.find((u) => u.value === unitValue);
  return unit ? unit.emoji : "📚";
};

const getDifficultyEmoji = (difficulty) => {
  const diff = availableDifficulties.find((d) => d.value === difficulty);
  return diff ? diff.emoji : "⭐";
};

// 단원별 분포 초기화
const initializeUnitDistribution = (unitValue) => {
  const selectedDiffs = form.selectedDifficulties;
  const total = form.unitQuestionCounts[unitValue] || 0;

  if (selectedDiffs.length === 0 || total === 0) {
    form.unitDifficultyDistribution[unitValue] = {};
    return;
  }

  const distribution = {};
  const baseCount = Math.floor(total / selectedDiffs.length);
  const remainder = total % selectedDiffs.length;

  selectedDiffs.forEach((diff, index) => {
    distribution[diff] = baseCount + (index < remainder ? 1 : 0);
  });

  form.unitDifficultyDistribution[unitValue] = distribution;
};

// 단원별 난이도 문제 수 조정
const adjustUnitDifficultyCount = (unitValue, difficulty, change) => {
  if (!form.unitDifficultyDistribution[unitValue]) {
    form.unitDifficultyDistribution[unitValue] = {};
  }

  const currentCount = getUnitDifficultyCount(unitValue, difficulty);
  const newCount = Math.max(0, currentCount + change);
  const totalOthers = getUnitTotalCount(unitValue) - currentCount;
  const maxTotal = form.unitQuestionCounts[unitValue] || 0;

  if (newCount + totalOthers <= maxTotal) {
    form.unitDifficultyDistribution[unitValue][difficulty] = newCount;
  }
};

const setUnitDifficultyCount = (unitValue, difficulty, value) => {
  if (!form.unitDifficultyDistribution[unitValue]) {
    form.unitDifficultyDistribution[unitValue] = {};
  }

  const newCount = Math.max(0, parseInt(value) || 0);
  const currentCount = getUnitDifficultyCount(unitValue, difficulty);
  const totalOthers = getUnitTotalCount(unitValue) - currentCount;
  const maxTotal = form.unitQuestionCounts[unitValue] || 0;

  if (newCount + totalOthers <= maxTotal) {
    form.unitDifficultyDistribution[unitValue][difficulty] = newCount;
  }
};

const getUnitDifficultyCount = (unitValue, difficulty) => {
  return form.unitDifficultyDistribution[unitValue]?.[difficulty] || 0;
};

const getUnitTotalCount = (unitValue) => {
  if (!form.unitDifficultyDistribution[unitValue]) return 0;
  return Object.values(form.unitDifficultyDistribution[unitValue]).reduce(
    (sum, count) => sum + (count || 0),
    0
  );
};

const getUnitDifficultyRatio = (unitValue, difficulty) => {
  const count = getUnitDifficultyCount(unitValue, difficulty);
  const total = form.unitQuestionCounts[unitValue] || 0;
  return total > 0 ? Math.round((count / total) * 100) : 0;
};

const resetUnitDistribution = (unitValue) => {
  initializeUnitDistribution(unitValue);
};

const resetAllDistribution = () => {
  form.selectedUnits.forEach((unitValue) => {
    form.unitQuestionCounts[unitValue] = 5; // 기본값
    initializeUnitDistribution(unitValue);
  });
};

// 전체 집계 함수들
const getTotalQuestionCount = () => {
  return Object.values(form.unitQuestionCounts).reduce(
    (sum, count) => sum + (count || 0),
    0
  );
};

const getTotalDifficultyCount = (difficulty) => {
  return form.selectedUnits.reduce((sum, unitValue) => {
    return sum + getUnitDifficultyCount(unitValue, difficulty);
  }, 0);
};

const getGroupTitle = (level, count) => `${level} 수준 학습자 (${count}명)`;

const toggleSelectAll = (event) => {
  form.targetStudents = event.target.checked
    ? allStudents.value.map((s) => s.id)
    : [];
};

const nextStep = () => {
  if (currentStep.value < steps.length - 1 && isCurrentStepValid.value) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const submitExam = () => {
  if (!isFormValid.value) {
    alert("모든 필수 항목을 입력해주세요.");
    return;
  }

  const examData = {
    ...form,
    totalQuestions: getTotalQuestionCount(),
  };

  console.log("평가 데이터:", JSON.parse(JSON.stringify(examData)));
  alert("평가가 생성되었습니다!");

  // 부모 창에 메시지 전송 (팝업인 경우)
  if (window.opener) {
    window.opener.postMessage({ type: "EXAM_CREATED", data: examData }, "*");
    window.close();
  } else {
    router.push({ name: "TeacherExam" });
  }
};

// 감시자들
watch(
  () => form.selectedDifficulties,
  () => {
    // 난이도 변경 시 모든 단원의 분포 재계산
    form.selectedUnits.forEach((unitValue) => {
      initializeUnitDistribution(unitValue);
    });
  },
  { deep: true }
);
</script>

<style scoped>
/* 전역 스타일 */
.exam-creator-page {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
  color: #333;
}

.creator-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  border: 3px solid #e8f5e8;
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.1);
  padding: 2.5rem;
}

/* 헤더 */
.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  color: #2e7d32;
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.page-subtitle {
  text-align: center;
  font-size: 1rem;
  color: #4caf50;
  margin: 0 0 2rem;
  font-weight: 600;
}

/* 안내 상자 */
.notice-box {
  background: #f1f8e9;
  border: 2px dashed #8bc34a;
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: #4caf50;
  font-size: 0.9rem;
  line-height: 1.5;
}

.notice-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

/* 진행 단계 */
.progress-steps {
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem;
  gap: 2rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.4;
  transition: all 0.3s ease;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  background: #ccc;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #4caf50;
  transform: scale(1.1);
}

.step.completed .step-number {
  background: #2e7d32;
}

.step-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
}

.step.active .step-label,
.step.completed .step-label {
  color: #2e7d32;
}

/* 폼 스타일 */
.exam-form {
  display: flex;
  flex-direction: column;
}

.step-content {
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2e7d32;
  margin: 0 0 2rem;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
}

.form-label {
  margin-bottom: 0.75rem;
  font-weight: 700;
  color: #4caf50;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
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

.unit-count {
  font-size: 0.9rem;
  color: #8bc34a;
}

/* 난이도 선택 */
.difficulty-selection {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.difficulty-option {
  cursor: pointer;
  padding: 1rem 1.5rem;
  border-radius: 20px;
  background: white;
  border: 3px solid #e8f5e8;
  transition: all 0.3s ease;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.difficulty-option input {
  display: none;
}

.difficulty-option:hover {
  background: #f1f8e9;
  border-color: #8bc34a;
}

.difficulty-option.selected {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.difficulty-emoji {
  font-size: 1.2rem;
}

.difficulty-label {
  font-weight: 600;
}

/* 단원별 분포 설정 */
.unit-distribution-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.unit-distribution-card {
  background: #f8fffe;
  border: 2px solid #e8f5e8;
  border-radius: 20px;
  padding: 1.5rem;
}

.unit-distribution-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e8f5e8;
}

.unit-name {
  font-weight: 700;
  color: #2e7d32;
  flex: 1;
}

.unit-question-count {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #4caf50;
}

/* 분포 초기화 버튼들 */
.distribution-reset-btn,
.unit-reset-btn {
  background: #8bc34a;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.distribution-reset-btn:hover,
.unit-reset-btn:hover {
  background: #4caf50;
  transform: translateY(-1px);
}

.unit-reset-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

/* 난이도 분포 테이블 */
.difficulty-distribution-table {
  border: 2px solid #e8f5e8;
  border-radius: 15px;
  overflow: hidden;
  background: white;
}

.distribution-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background: #4caf50;
  color: white;
}

.header-cell {
  padding: 1rem;
  font-weight: 700;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.header-cell:last-child {
  border-right: none;
}

.distribution-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 1px solid #e8f5e8;
}

.distribution-row:last-child {
  border-bottom: none;
}

.difficulty-cell,
.count-cell,
.ratio-cell {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e8f5e8;
}

.difficulty-cell:last-child,
.count-cell:last-child,
.ratio-cell:last-child {
  border-right: none;
}

.difficulty-cell {
  gap: 0.5rem;
  font-weight: 600;
  color: #2e7d32;
}

.count-adjuster {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #8bc34a;
  background: white;
  color: #4caf50;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all 0.2s ease;
}

.count-btn:hover:not(:disabled) {
  background: #4caf50;
  color: white;
}

.count-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.count-input {
  width: 60px;
  padding: 0.5rem;
  border: 2px solid #e8f5e8;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
}

.distribution-summary {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background: #f1f8e9;
  font-weight: 700;
  color: #2e7d32;
}

.summary-cell,
.summary-count,
.summary-ratio {
  padding: 1rem;
  text-align: center;
  border-right: 1px solid #e8f5e8;
}

.summary-count:last-child,
.summary-ratio:last-child {
  border-right: none;
}

.summary-count.error {
  color: #e74c3c;
}

.distribution-warning {
  background: #fff3cd;
  color: #856404;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  border-top: 1px solid #e8f5e8;
}

/* 전체 요약 */
.total-summary {
  background: #e8f5e8;
  border-radius: 20px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.total-summary h3 {
  margin: 0 0 1rem;
  color: #2e7d32;
  text-align: center;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 15px;
  font-weight: 600;
}

.summary-label {
  color: #4caf50;
}

.summary-value {
  color: #2e7d32;
  font-size: 1.1rem;
}

.summary-breakdown {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 15px;
  font-weight: 600;
  color: #2e7d32;
}

/* 기간 설정 */
.period-selection {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.period-radio-group,
.retake-selection {
  display: flex;
  gap: 1.5rem;
}

.radio-option {
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  background: white;
  border: 3px solid #e8f5e8;
  transition: all 0.3s ease;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-option input {
  width: 18px;
  height: 18px;
  accent-color: #4caf50;
}

.radio-option:hover {
  background: #f1f8e9;
  border-color: #8bc34a;
}

.radio-option:has(input:checked) {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
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
  color: #4caf50;
  font-size: 1.2rem;
}

/* 학생 선택 패널 */
.student-selection-panel {
  background: #f1f8e9;
  border-radius: 20px;
  border: 3px solid #e8f5e8;
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
  border-bottom: 2px solid #e8f5e8;
}

.select-all label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: #2e7d32;
}

.select-all strong {
  font-size: 1.1rem;
  color: #4caf50;
}

.select-all input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #4caf50;
}

.info-text {
  font-size: 0.9rem;
  color: #8bc34a;
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

.level-상 {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
}

.level-중 {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.level-하 {
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
  color: #2e7d32;
  font-weight: 500;
}

.student-checkbox input:checked + span {
  background: white;
  border-color: #4caf50;
  color: #4caf50;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

/* 네비게이션 버튼 */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 2px solid #e8f5e8;
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
  background: linear-gradient(135deg, #4caf50, #8bc34a);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

.btn-primary.disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: white;
  color: #4caf50;
  border: 2px solid #8bc34a;
}

.btn-secondary:hover {
  background: #f1f8e9;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.2);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .exam-creator-page {
    padding: 1rem;
  }

  .creator-container {
    padding: 1.5rem;
  }

  .progress-steps {
    gap: 1rem;
  }

  .unit-selection {
    grid-template-columns: 1fr;
  }

  .difficulty-selection {
    justify-content: center;
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

  .navigation-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .period-radio-group,
  .retake-selection {
    flex-direction: column;
    gap: 1rem;
  }

  .distribution-header,
  .distribution-row,
  .distribution-summary {
    grid-template-columns: 1fr;
  }

  .header-cell,
  .difficulty-cell,
  .count-cell,
  .ratio-cell,
  .summary-cell,
  .summary-count,
  .summary-ratio {
    border-right: none;
    border-bottom: 1px solid #e8f5e8;
  }

  .summary-breakdown {
    flex-direction: column;
    align-items: stretch;
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

  .difficulty-selection {
    flex-direction: column;
  }

  .form-label {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
