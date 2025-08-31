<template>
  <div class="exam-container">
    <!-- 시험 헤더 -->
    <div class="exam-header">
      <div class="header-left">
        <div class="exam-info">
          <h1 class="exam-title">{{ examData.examName || "평가" }}</h1>
          <div class="exam-meta">
            <span class="progress-info">
              <i class="bi bi-list-check"></i>
              {{ currentProblem }}/{{ totalProblems }} 문제
            </span>
            <span v-if="tokenInfo" class="user-info">
              <i class="bi bi-person"></i>
              {{ tokenInfo.memberName }} ({{
                tokenInfo.role === "teacher" ? "선생님" : "학생"
              }})
            </span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button
          v-if="tokenInfo && tokenInfo.role === 'student'"
          class="header-btn submit-btn"
          @click="submitExam"
          :disabled="isSubmitting"
        >
          <i class="bi bi-check-circle"></i>
          {{ isSubmitting ? "제출중..." : "시험 제출" }}
        </button>
        <div
          v-if="tokenInfo && tokenInfo.role === 'teacher'"
          class="header-btn submit-btn"
        >
          <span class="status-preview">
            <i class="bi bi-eye-fill"></i>
            미리보기
          </span>
        </div>
        <button class="header-btn close-btn" @click="exitExam">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>

    <!-- 메인 문제 영역 -->
    <div class="exam-content">
      <div class="problem-container">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <i class="bi bi-arrow-clockwise"></i>
          </div>
          <div class="loading-text">문제를 불러오는 중...</div>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">
            <i class="bi bi-exclamation-triangle"></i>
          </div>
          <div class="error-text">문제를 불러올 수 없습니다</div>
          <div class="error-details">{{ error }}</div>
          <button class="retry-btn" @click="loadExamData">다시 시도</button>
        </div>

        <!-- 문제 표시 영역 -->
        <div
          v-else-if="currentProblemData"
          class="problem-display"
          :class="{ 'no-image': !hasImage }"
        >
          <!-- 문제 이미지 (이미지가 있을 때만) -->
          <div v-if="hasImage" class="problem-image-container">
            <img
              :src="getImageUrl(currentProblemData.imageUrl)"
              :alt="`문제 ${currentProblem}`"
              class="problem-image"
              @load="onImageLoad"
              @error="onImageError"
            />
          </div>

          <!-- 문제 정보 및 답안 -->
          <div class="problem-info">
            <div class="problem-header">
              <span class="problem-number">문제 {{ currentProblem }}</span>
              <span class="problem-type">{{
                getProblemTypeText(currentProblemData.type)
              }}</span>
              <span class="problem-level">{{
                getLevelText(currentProblemData.level)
              }}</span>
            </div>

            <!-- 문제 텍스트 -->
            <div class="problem-text">
              <h3>{{ currentProblemData.question }}</h3>
              <p v-if="currentProblemData.paragraph" class="problem-paragraph">
                {{ currentProblemData.paragraph }}
              </p>
            </div>

            <!-- 객관식 답안 -->
            <div
              v-if="currentProblemData.type === 'MULTIPLE_CHOICE'"
              class="answer-section"
            >
              <h3>답안 선택</h3>
              <div class="choices-container">
                <label
                  v-for="(choice, index) in currentProblemData.choices"
                  :key="index"
                  class="choice-item"
                  :class="{
                    selected: studentAnswers[currentProblem] === choice.number,
                  }"
                >
                  <input
                    type="radio"
                    :name="`problem-${currentProblem}`"
                    :value="choice.number"
                    v-model="studentAnswers[currentProblem]"
                    @change="onAnswerChange"
                  />
                  <span class="choice-number">{{ choice.number }}</span>
                  <span class="choice-text">{{ choice.text }}</span>
                </label>
              </div>
            </div>

            <!-- 주관식 답안 -->
            <div
              v-else-if="currentProblemData.type === 'SHORT_ANSWER'"
              class="answer-section"
            >
              <h3>답안 입력</h3>
              <textarea
                v-model="studentAnswers[currentProblem]"
                @input="onAnswerChange"
                placeholder="답안을 입력해주세요..."
                class="answer-input"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 네비게이션 -->
    <div class="exam-navigation">
      <div class="nav-controls">
        <button
          class="nav-btn"
          @click="previousProblem"
          :disabled="currentProblem <= 1"
        >
          <i class="bi bi-chevron-left"></i>
          이전
        </button>

        <div class="problem-indicators">
          <div
            v-for="index in problems.length"
            :key="index"
            @click="goToProblem(index)"
            class="problem-indicator"
            :class="{
              current: index === currentProblem,
              answered:
                studentAnswers[index] !== null &&
                studentAnswers[index] !== undefined &&
                studentAnswers[index] !== '',
            }"
          >
            {{ index }}
          </div>
        </div>

        <button
          class="nav-btn"
          @click="nextProblem"
          :disabled="currentProblem >= problems.length"
        >
          다음
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- 시험 제출 확인 모달 -->
    <div v-if="showSubmitModal" class="modal-overlay" @click="closeSubmitModal">
      <div class="submit-modal" @click.stop>
        <div class="modal-header">
          <h3>시험 제출 확인</h3>
          <button class="modal-close" @click="closeSubmitModal">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="submit-summary">
            <p>
              총 {{ totalProblems }}문제 중 {{ answeredCount }}문제를
              답했습니다.
            </p>
            <p v-if="unansweredCount > 0" class="warning">
              <i class="bi bi-exclamation-triangle"></i>
              {{ unansweredCount }}문제가 답하지 않았습니다.
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeSubmitModal">
            돌아가기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/utils/apiClient";
import { useAiChat } from "@/composables/useAiChat";

export default {
  name: "ExamProblem",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    // ✨ AI 챗봇 관리 추가
    const { closeAiChat } = useAiChat();

    // ✨ 즉시 시험 모드 설정 (setup 단계에서 바로)
    window.isExamMode = true;
    console.log("🚫 즉시 시험 모드 활성화:", window.isExamMode);

    // 기본 상태
    const isLoading = ref(true);
    const error = ref(null);
    const isSubmitting = ref(false);
    const showSubmitModal = ref(false);

    // 시험 데이터
    const examData = ref({});
    const problems = ref([]);
    const currentProblem = ref(1);
    const studentAnswers = ref({});

    // 사용자 정보
    const tokenInfo = ref(null);

    // 시간 관련
    const startTime = ref(null);
    const problemStartTimes = ref({});
    const problemViewTimes = ref({});

    // 이상행위 감지
    const activityCounts = ref({
      controlVCount: 0, // Ctrl+V 복사 붙여넣기
      controlCCount: 0, // Ctrl+C 복사
      afkCount: 0, // 1분 이상 비활성
      devToolsCount: 0, // 개발자도구 시도
      rightClickCount: 0, // 우클릭 시도
      focusLossCount: 0, // 브라우저 포커스 잃음
      tabSwitchCount: 0, // 탭 전환 시도
    });

    const problemAnomalyCounts = ref({});

    // AFK 관련
    const lastActivity = ref(Date.now());
    const afkThreshold = 60000; // 1분으로 수정
    let afkTimer = null;
    let afkCheckInterval = null;

    // 계산된 속성
    const totalProblems = computed(() => problems.value.length);
    const currentProblemData = computed(
      () => problems.value[currentProblem.value - 1]
    );

    // 이미지 존재 여부 계산
    const hasImage = computed(() => {
      if (!currentProblemData.value) return false;
      const imageUrl = currentProblemData.value.imageUrl;
      return imageUrl && imageUrl.trim() !== "" && imageUrl !== null;
    });

    const answeredCount = computed(() => {
      return Object.values(studentAnswers.value).filter(
        (answer) => answer !== null && answer !== undefined && answer !== ""
      ).length;
    });

    const unansweredCount = computed(
      () => totalProblems.value - answeredCount.value
    );

    // ✨ 강화된 AI 챗봇 완전 차단 함수
    const forceCloseAiChatForExam = async () => {
      try {
        console.log("🔥 강화된 시험 모드: AI 챗봇 강제 차단 시작");

        // 1. localStorage 즉시 정리
        try {
          localStorage.removeItem("aiChat_global_state");
          console.log("✅ localStorage 정리 완료");
        } catch (e) {
          console.warn("localStorage 정리 실패:", e);
        }

        // 2. URL에서 즉시 제거
        if (route.query.aichat === "1") {
          const q = { ...route.query };
          delete q.aichat;

          // replace 대신 push 사용 (더 확실함)
          await router.push({
            path: route.path,
            query: q,
            replace: true,
          });
          console.log("✅ URL aichat 파라미터 제거 완료");
        }

        // 3. composable의 closeAiChat 호출
        await closeAiChat();
        console.log("✅ composable closeAiChat 호출 완료");

        // 4. DOM에서 직접 모달 제거 (마지막 보험)
        await nextTick();
        const existingModals = document.querySelectorAll('[role="dialog"]');
        existingModals.forEach((modal) => {
          if (modal.querySelector(".chat-title")) {
            modal.remove();
            console.log("✅ DOM에서 AI 채팅 모달 직접 제거");
          }
        });

        console.log("✅ AI 챗봇 차단 완료");
      } catch (error) {
        console.error("❌ AI 챗봇 차단 실패:", error);

        // 실패해도 최소한 DOM에서는 제거
        try {
          const modals = document.querySelectorAll('[role="dialog"]');
          modals.forEach((modal) => modal.remove());
          console.log("⚠️ 비상 조치: 모든 모달 강제 제거");
        } catch (e) {
          console.error("비상 조치도 실패:", e);
        }
      }
    };

    // ✨ 강화된 AI 챗봇 열기 차단 함수
    const blockAiChatOpening = () => {
      // 1. CSS로 ChatFab 숨기기
      if (!document.getElementById("exam-mode-style")) {
        const style = document.createElement("style");
        style.id = "exam-mode-style";
        style.textContent = `
          .ai-fab {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
          [role="dialog"] .chat-title:has(.ai-icon) {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }

      // 2. 전역 변수로 시험 모드 표시 (이중 확인)
      window.isExamMode = true;

      // 3. 추가 보안: 전역 함수 오버라이드 (극단적 조치)
      const originalAlert = window.alert;
      window.blockAiChatAttempt = () => {
        originalAlert("시험 중에는 학습 도우미를 사용할 수 없습니다! 📝");
        return false;
      };

      console.log("🚫 강화된 AI 챗봇 UI 차단 활성화");
    };

    // ✨ 실시간 감시: route query 변경 감지 (즉시 반응)
    watch(
      () => route.query.aichat,
      async (newValue, oldValue) => {
        console.log(
          `🔄 ExamProblem aichat 쿼리 변경: ${oldValue} → ${newValue}`
        );
        if (newValue === "1") {
          console.log("🚨 시험 중 AI 챗봇 열기 시도 감지 - 즉시 차단");
          alert("시험 중에는 학습 도우미를 사용할 수 없습니다! 🤖");
          await forceCloseAiChatForExam();
        }
      },
      { immediate: true } // ✅ 즉시 실행
    );

    // 문제별 이상행위 카운트 초기화
    const initializeProblemAnomalyCounts = () => {
      for (let i = 1; i <= problems.value.length; i++) {
        problemAnomalyCounts.value[i] = 0;
      }
    };

    // 현재 문제에 이상행위 추가
    const addAnomalyToCurrentProblem = () => {
      const currentProblemNo = currentProblem.value;
      if (problemAnomalyCounts.value[currentProblemNo] !== undefined) {
        problemAnomalyCounts.value[currentProblemNo]++;
      }
    };

    // 로그 데이터 생성
    const createAllProblemsLogData = () => {
      const examNo = parseInt(router.currentRoute.value.params.examNo);

      // 전체 이상현상 카운트 합계
      const totalAnomalyCount = Object.values(activityCounts.value).reduce(
        (sum, count) => sum + count,
        0
      );

      // 모든 문제별 데이터 배열 생성
      const problemsData = [];
      for (let i = 1; i <= problems.value.length; i++) {
        const problem = problems.value[i - 1];
        const selectedAnswer = studentAnswers.value[i];
        const solvingTime = Math.round(problemViewTimes.value[i] || 0);

        problemsData.push({
          problemNo: i,
          selectedAnswer: selectedAnswer || "",
          durationSec: solvingTime,
          cepNo: problem?.cepNo || null,
          unitNo: problem?.unitNo || null,
          anomalyCount: problemAnomalyCounts.value[i] || 0,
        });
      }

      return {
        examNo: examNo,
        classroomStudentNo: tokenInfo.value?.classRoomStudentNo,
        llType: "EXAM",
        llStartTime: startTime.value.toISOString(),
        llEndTime: new Date().toISOString(),

        // 문제별 데이터
        problemsData: problemsData,
      };
    };

    // 시험 로그 전송
    const sendExamLog = async () => {
      try {
        const logData = createAllProblemsLogData();

        await apiClient.post("/log/exam", logData);
        console.log("시험 로그 전송 완료:", logData);

        return true;
      } catch (error) {
        console.error("시험 로그 전송 실패:", error);
        return false;
      }
    };

    // 토큰 정보 로드
    const loadTokenInfo = () => {
      try {
        const tokenInfoStr = localStorage.getItem("tokenInfo");
        if (tokenInfoStr) {
          tokenInfo.value = JSON.parse(tokenInfoStr);
          console.log("📋 토큰 정보 로드:", tokenInfo.value);
        }
      } catch (err) {
        console.error("토큰 정보 파싱 실패:", err);
      }
    };

    // 시험 데이터 로드
    const loadExamData = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const examNo = route.params.examNo;
        if (!examNo) {
          throw new Error("시험 번호를 찾을 수 없습니다.");
        }

        console.log("🎯 시험 데이터 로드 시작:", { examNo });

        // 시험 상세 정보 조회 API 호출
        const response = await apiClient.get(`/exam/exam-problems/${examNo}`);

        console.log("📄 백엔드 응답 데이터:", response);

        // 시험 기본 정보 설정
        examData.value = {
          examNo: response.examNo,
          examName: response.examName || "시험",
          examStartTime: response.examStartTime,
          examEndTime: response.examEndTime,
          cepNo: response.cepNo,
        };

        // 문제 데이터 변환
        if (
          !response.examProblemDetailResponseList ||
          !Array.isArray(response.examProblemDetailResponseList)
        ) {
          throw new Error("문제 데이터가 없습니다.");
        }

        problems.value = response.examProblemDetailResponseList.map(
          (problem) => {
            console.log("문제 데이터 변환:", problem);

            // epExample JSON 파싱
            let choices = [];
            try {
              if (problem.epExample) {
                const exampleObj =
                  typeof problem.epExample === "string"
                    ? JSON.parse(problem.epExample)
                    : problem.epExample;

                choices = Object.entries(exampleObj).map(([key, value]) => ({
                  number: key,
                  text: value,
                }));
              }
            } catch (parseError) {
              console.error("선택지 파싱 오류:", parseError, problem.epExample);
              choices = [];
            }

            return {
              epNo: problem.epNo,
              cepNo: problem.cepNo,
              questionOrder: problem.questionOrder,
              imageUrl: problem.epImageUrl,
              question: problem.epQuestion,
              paragraph: problem.epParagraph,
              type: choices.length > 0 ? "MULTIPLE_CHOICE" : "SHORT_ANSWER",
              level: problem.epLevel,
              choices: choices,
              correctAnswer: problem.epAnswer,
              comment: problem.epComment,
            };
          }
        );

        // 문제 순서대로 정렬
        problems.value.sort((a, b) => a.questionOrder - b.questionOrder);

        // 답안 및 시간 추적 초기화
        studentAnswers.value = {};
        problemStartTimes.value = {};
        problemViewTimes.value = {};

        for (let i = 1; i <= problems.value.length; i++) {
          studentAnswers.value[i] = null;
          problemViewTimes.value[i] = 0;
        }

        // 문제별 이상행위 카운트 초기화
        initializeProblemAnomalyCounts();

        // 시험 시작 시간 기록
        startTime.value = new Date();

        // 첫 번째 문제 시작 시간 기록
        problemStartTimes.value[1] = new Date();

        console.log("✅ 시험 데이터 로드 완료:", {
          examName: examData.value.examName,
          problemCount: problems.value.length,
          problems: problems.value,
        });
      } catch (err) {
        console.error("🚨 시험 데이터 로드 실패:", err);
        error.value = err.message || "시험 데이터를 불러오는데 실패했습니다.";
      } finally {
        isLoading.value = false;
      }
    };

    // 문제 이동
    const goToProblem = (problemIndex) => {
      if (problemIndex < 1 || problemIndex > problems.value.length) return;

      // 현재 문제 풀이 시간 계산 및 저장
      if (problemStartTimes.value[currentProblem.value]) {
        const currentTime = new Date();
        const timeSpent =
          currentTime - problemStartTimes.value[currentProblem.value];
        problemViewTimes.value[currentProblem.value] += timeSpent;
      }

      currentProblem.value = problemIndex;

      // 새 문제 시작 시간 기록
      problemStartTimes.value[problemIndex] = new Date();

      // sendExamLog();
    };

    const previousProblem = () => {
      if (currentProblem.value > 1) {
        goToProblem(currentProblem.value - 1);
      }
    };

    const nextProblem = () => {
      if (currentProblem.value < totalProblems.value) {
        goToProblem(currentProblem.value + 1);
      }
    };

    // 답안 변경 시 처리
    const onAnswerChange = () => {
      console.log(
        `문제 ${currentProblem.value} 답안 변경:`,
        studentAnswers.value[currentProblem.value]
      );
    };

    // 시험 제출
    const submitExam = () => {
      if (unansweredCount.value > 0) {
        showSubmitModal.value = true;
        return;
      }

      confirmSubmit();
    };

    const confirmSubmit = async () => {
      try {
        isSubmitting.value = true;
        showSubmitModal.value = false;
        if (problemStartTimes.value[currentProblem.value]) {
          const currentTime = new Date();
          const timeSpent =
            currentTime - problemStartTimes.value[currentProblem.value];
          problemViewTimes.value[currentProblem.value] += timeSpent;
        }

        const examNo = router.currentRoute.value.params.examNo;

        if (!tokenInfo) {
          throw new Error("학생 정보가 없습니다.");
        }

        await sendExamLog();

        // 답안 데이터 구성 (최신 버전 - Duration 형식)
        const studentAnswerRequestList = problems.value.map((problem) => {
          const answer = studentAnswers.value[problem.questionOrder];
          const solvingTimeMs = Math.round(
            problemViewTimes.value[problem.questionOrder] || 0
          );

          // 답안 형식 결정: 객관식은 선택지, OX/단답형은 정답
          let formattedAnswer;
          if (problem.type === "MULTIPLE_CHOICE") {
            // 객관식: 선택한 답안(선택지) 저장
            formattedAnswer = answer;
          } else {
            // OX, SHORT_ANSWER: 입력한 정답 저장
            formattedAnswer = answer;
          }

          return {
            epNo: problem.epNo,
            cepNo: problem.cepNo,
            saAnswer: formattedAnswer || "",
            saSolvingTime: `PT${solvingTimeMs}S`, // Duration 형식 (밀리초)
          };
        });

        const requestData = {
          examNo: parseInt(examNo),
          classroomStudentNo: tokenInfo.value?.classRoomStudentNo,
          seStartTime: startTime.value.toISOString(),
          seEndTime: new Date().toISOString(),
          studentAnswerRequestList: studentAnswerRequestList,
        };

        const response = await apiClient.post("/exam/submit", requestData);

        console.log("시험 제출 완료:", response.data);

        alert("시험이 성공적으로 제출되었습니다!");
        router.push({
          name: "ExamReport",
          params: { examNo: examData.value.examNo },
        });
      } catch (err) {
        console.error("🚨 시험 제출 실패:", err);

        alert(`시험 제출에 실패했습니다: ${err.message}`);
      } finally {
        isSubmitting.value = false;
      }
    };

    // 시험 나가기
    const exitExam = () => {
      if (
        confirm(
          "정말로 시험을 나가시겠습니까?\n저장되지 않은 답안은 모두 사라집니다."
        )
      ) {
        // ✨ 시험 종료 시 AI 챗봇 차단 해제
        window.isExamMode = false;
        const examStyle = document.getElementById("exam-mode-style");
        if (examStyle) {
          examStyle.remove();
        }
        console.log("🔚 시험 종료: AI 챗봇 차단 해제");

        if (window.opener) {
          window.close();
        } else {
          router.back();
        }
      }
    };

    // 모달 관련
    const closeSubmitModal = () => {
      showSubmitModal.value = false;
    };

    const getProblemTypeText = (type) => {
      switch (type) {
        case "MULTIPLE_CHOICE":
          return "객관식";
        case "SHORT_ANSWER":
          return "주관식";
        default:
          return "문제";
      }
    };

    const getLevelText = (level) => {
      switch (level) {
        case "하":
        case "BASIC":
          return "하";
        case "중":
        case "STANDARD":
          return "중";
        case "상":
        case "ADVANCED":
          return "상";
        default:
          return level || "";
      }
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
        return `https://airoom.s3.ap-northeast-2.amazonaws.com/EXAM_PROBLEM_IMAGE/${path}`;
      }

      console.warn("예상하지 못한 이미지 URL 형식:", imageUrl);
      return "/images/default-textbook.png";
    };

    const onImageLoad = () => {
      console.log(
        `문제 ${currentProblem.value} 이미지 로드 완료:`,
        currentProblemData.value?.imageUrl
      );
    };

    const onImageError = () => {
      console.error(
        `문제 ${currentProblem.value} 이미지 로드 실패:`,
        currentProblemData.value?.imageUrl
      );
    };

    // 이상행위 감지 시작
    const startSuspiciousActivityDetection = () => {
      // 복사/붙여넣기 이벤트 감지
      const handleCopy = (e) => {
        activityCounts.value.controlCCount++;
        addAnomalyToCurrentProblem();
      };

      const handlePaste = (e) => {
        activityCounts.value.controlVCount++;
        addAnomalyToCurrentProblem();
      };

      // 우클릭 방지
      const handleContextMenu = (e) => {
        e.preventDefault();
        activityCounts.value.rightClickCount++;
        addAnomalyToCurrentProblem();
      };

      // 개발자도구 감지
      const handleKeyDown = (e) => {
        if (
          e.key === "F12" ||
          (e.ctrlKey &&
            e.shiftKey &&
            (e.key === "I" || e.key === "J" || e.key === "C")) ||
          (e.ctrlKey && e.key === "u")
        ) {
          // e.preventDefault();
          activityCounts.value.devToolsCount++;
          addAnomalyToCurrentProblem();
        }
      };

      // 브라우저 포커스 잃음 감지
      const handleVisibilityChange = () => {
        if (document.hidden) {
          activityCounts.value.focusLossCount++;
          addAnomalyToCurrentProblem();
        }
      };

      // 마우스/키보드 활동 감지
      const handleActivity = () => {
        lastActivity.value = Date.now();
      };

      // AFK 체크 (1분마다 확인)
      const checkAFK = () => {
        const now = Date.now();
        if (now - lastActivity.value > afkThreshold) {
          activityCounts.value.afkCount++;
          addAnomalyToCurrentProblem();
          lastActivity.value = now; // 중복 카운트 방지
        }
      };
      // 이벤트 리스너 등록
      document.addEventListener("copy", handleCopy);
      document.addEventListener("paste", handlePaste);
      document.addEventListener("contextmenu", handleContextMenu);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousemove", handleActivity);
      document.addEventListener("keypress", handleActivity);
      document.addEventListener("click", handleActivity);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // AFK 체크 인터벌 시작
      afkCheckInterval = setInterval(checkAFK, 30000); // 30초마다 체크

      // 정리 함수 반환
      return () => {
        document.removeEventListener("copy", handleCopy);
        document.removeEventListener("paste", handlePaste);
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousemove", handleActivity);
        document.removeEventListener("keypress", handleActivity);
        document.removeEventListener("click", handleActivity);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );

        if (afkCheckInterval) clearInterval(afkCheckInterval);
      };
    };

    // 생명주기 훅
    onMounted(async () => {
      blockAiChatOpening();
      if (route.query.aichat === "1") {
        console.log("2️⃣ 기존 AI 모달 감지 - 즉시 차단");
        alert(
          "시험 중에는 학습 도우미를 사용할 수 없습니다. 자동으로 닫겠습니다. 📝"
        );
        await forceCloseAiChatForExam();
      }

      // localStorage에서 직접 인증 상태 확인
      const accessToken = localStorage.getItem("authToken");
      const tokenInfoStr = localStorage.getItem("tokenInfo");
      const tokenInfo = JSON.parse(tokenInfoStr);
      if (!accessToken || !tokenInfoStr) {
        alert("로그인이 필요합니다.");
        if (window.opener) {
          window.close();
        } else {
          router.push({ name: "Login" });
        }
        return;
      }

      // 토큰 정보 로드
      loadTokenInfo();

      console.log("🎯 시험 페이지 로드 - 사용자 정보:", tokenInfo.value);
      await loadExamData();

      // 이상행위 감지 시작
      const cleanupSuspiciousDetection = startSuspiciousActivityDetection();
      startActivityTracker();

      // 컴포넌트 언마운트 시 정리
      onBeforeUnmount(() => {
        cleanupSuspiciousDetection();
        if (activityTracker) clearInterval(activityTracker);
        if (afkTimer) clearTimeout(afkTimer);

        // ✨ 시험 종료 시 정리
        window.isExamMode = false;
        const examStyle = document.getElementById("exam-mode-style");
        if (examStyle) {
          examStyle.remove();
        }
        console.log("🔚 시험 종료: AI 챗봇 차단 해제");
      });
    });

    return {
      // 상태
      isLoading,
      error,
      isSubmitting,
      showSubmitModal,
      examData,
      problems,
      currentProblem,
      studentAnswers,
      tokenInfo,

      // 계산된 속성
      totalProblems,
      currentProblemData,
      hasImage,
      answeredCount,
      unansweredCount,

      // 메서드
      loadExamData,
      goToProblem,
      previousProblem,
      nextProblem,
      onAnswerChange,
      submitExam,
      confirmSubmit,
      exitExam,
      closeSubmitModal,
      getProblemTypeText,
      getLevelText,
      getImageUrl,
      onImageLoad,
      onImageError,
      // ✨ 새로 추가된 함수들
      forceCloseAiChatForExam,
      blockAiChatOpening,
    };
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.exam-container {
  background: #fff9e6;
  height: 100vh;
  width: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
}

/* 시험 헤더 */
.exam-header {
  background: #ff9800;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 0.25rem 1.25rem rgba(255, 152, 0, 0.3);
  border-bottom: 0.1875rem solid #ffe066;
  z-index: 100;
}

.header-left .exam-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.exam-title {
  font-size: 1.5rem;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.exam-meta {
  display: flex;
  gap: 2rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.progress-info,
.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.header-right {
  display: flex;
  gap: 0.75rem;
}

.header-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.header-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
  background: rgba(46, 213, 115, 0.9);
  border-color: #2ed573;
}

.submit-btn:hover:not(:disabled) {
  background: #2ed573;
}

.close-btn {
  background: rgba(231, 76, 60, 0.8);
  border-color: #e74c3c;
}

/* 메인 콘텐트 */
.exam-content {
  padding: 1rem;
  overflow-y: auto;
  background: #f8f9fa;
}

.problem-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(255, 152, 0, 0.1);
  border: 3px solid #ffe066;
  overflow: hidden;
  height: 100%;
}

/* 로딩/에러 상태 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1.5rem;
  color: #ff9800;
  font-size: 1.1rem;
  font-weight: 600;
}

.loading-spinner i,
.error-icon i {
  font-size: 3rem;
  animation: spin 1s linear infinite;
}

.error-icon i {
  animation: none;
  color: #e74c3c;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.retry-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #5dade2;
  transform: translateY(-2px);
}

/* 문제 표시 */
.problem-display {
  display: flex;
  height: 100%;
}

/* 이미지가 없을 때 중앙 정렬 */
.problem-display.no-image {
  justify-content: center;
  align-items: center;
}

.problem-display.no-image .problem-info {
  width: 100%;
  max-width: 800px;
  border-left: none;
}

.problem-image-container {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.problem-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

.problem-info {
  width: 400px;
  background: white;
  border-left: 3px solid #ffe066;
  display: flex;
  flex-direction: column;
}

.problem-header {
  background: #ff9800;
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.problem-number {
  font-size: 1.1rem;
  font-weight: 800;
}

.problem-type,
.problem-level {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.problem-header h3 {
  color: #ff9800;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
}

/* 문제 텍스트 */
.problem-text {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #ff9800;
}

.problem-text h3 {
  color: #333;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.problem-paragraph {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

/* 답안 섹션 */
.answer-section {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.answer-section h3 {
  color: #ff9800;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.choices-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.choice-item:hover {
  border-color: #ff9800;
  background: rgba(255, 152, 0, 0.05);
}

.choice-item.selected {
  border-color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
}

.choice-item input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #ff9800;
}

.choice-number {
  background: #ff9800;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.choice-text {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.4;
}

.answer-input {
  flex: 1;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.answer-input:focus {
  outline: none;
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

/* 하단 네비게이션 */
.exam-navigation {
  background: #34495e;
  padding: 1rem;
  border-top: 3px solid #3498db;
}

.nav-controls {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.nav-btn {
  background: #3498db;
  border: 2px solid #5dade2;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  background: #5dade2;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.3);
}

.nav-btn:disabled {
  background: #7f8c8d;
  border-color: #95a5a6;
  cursor: not-allowed;
  opacity: 0.6;
}

.problem-indicators {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 600px;
}

.problem-indicator {
  width: 40px;
  height: 40px;
  border: 2px solid #7f8c8d;
  background: #95a5a6;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.problem-indicator:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.problem-indicator.current {
  background: #ff9800;
  border-color: #ff9800;
  transform: scale(1.1);
}

.problem-indicator.answered {
  background: #27ae60;
  border-color: #2ecc71;
}

.problem-indicator.answered.current {
  background: #e67e22;
  border-color: #d35400;
}

/* 제출 확인 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.submit-modal {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 3px solid #ff9800;
}

.modal-header {
  background: #ff9800;
  color: white;
  padding: 1.5rem;
  border-radius: 17px 17px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.3rem;
  font-weight: 800;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: background 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 2rem 1.5rem;
}

.submit-summary p {
  margin-bottom: 1rem;
  font-size: 1rem;
  line-height: 1.5;
}

.warning {
  color: #e74c3c;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-footer {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
}

.cancel-btn:hover {
  background: #7f8c8d;
}

.submit-confirm-btn {
  background: #e74c3c;
  color: white;
}

.submit-confirm-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

/* 반응형 */
@media (max-width: 768px) {
  .exam-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .exam-meta {
    gap: 1rem;
  }

  .problem-display {
    flex-direction: column;
  }

  .problem-display.no-image .problem-info {
    width: 100%;
  }

  .problem-info {
    width: 100%;
  }

  .nav-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .problem-indicators {
    order: -1;
  }
}
</style>
