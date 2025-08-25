<template>
  <div class="exam-container">
    <!-- 시험 헤더 -->
    <div class="exam-header">
      <div class="header-left">
        <div class="exam-info">
          <h1 class="exam-title">{{ examData.examName || '시험 진행중' }}</h1>
          <div class="exam-meta">
            <span class="progress-info">
              <i class="bi bi-list-check"></i>
              {{ currentProblem }}/{{ totalProblems }} 문제
            </span>
            <span v-if="tokenInfo" class="user-info">
              <i class="bi bi-person"></i>
              {{ tokenInfo.memberName }} ({{ tokenInfo.role === 'teacher' ? '선생님' : '학생' }})
            </span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button v-if="tokenInfo && tokenInfo.role === 'student'" class="header-btn submit-btn" @click="submitExam" :disabled="isSubmitting">
          <i class="bi bi-check-circle"></i>
          {{ isSubmitting ? '제출중...' : '시험 제출' }}
        </button>
          <div v-if="tokenInfo && tokenInfo.role === 'teacher'" class="header-btn submit-btn">
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
        <div v-else-if="currentProblemData" class="problem-display">
          <!-- 문제 이미지 -->
          <div class="problem-image-container">
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
              <span class="problem-type">{{ getProblemTypeText(currentProblemData.type) }}</span>
              <span class="problem-level">{{ getLevelText(currentProblemData.level) }}</span>
            </div>

            <!-- 문제 텍스트 -->
            <div class="problem-text">
              <h3>{{ currentProblemData.question }}</h3>
              <p v-if="currentProblemData.paragraph" class="problem-paragraph">
                {{ currentProblemData.paragraph }}
              </p>
            </div>
            
            <!-- 객관식 답안 -->
            <div v-if="currentProblemData.type === 'MULTIPLE_CHOICE'" class="answer-section">
              <h3>답안 선택</h3>
              <div class="choices-container">
                <label 
                  v-for="(choice, index) in currentProblemData.choices" 
                  :key="index"
                  class="choice-item"
                  :class="{ selected: studentAnswers[currentProblem] === choice }"
                >
                  <input 
                    type="radio" 
                    :name="`problem-${currentProblem}`"
                    :value="choice"
                    v-model="studentAnswers[currentProblem]"
                    @change="onAnswerChange"
                  />
                  <span class="choice-number">{{ index+1 }}</span>
                  <span class="choice-text">{{ choice }}</span>
                </label>
              </div>
            </div>

            <!-- 주관식 답안 -->
            <div v-else-if="currentProblemData.type === 'SHORT_ANSWER'" class="answer-section">
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
          class="nav-btn prev-btn" 
          @click="previousProblem"
          :disabled="currentProblem <= 1"
        >
          <i class="bi bi-arrow-left"></i>
          이전 문제
        </button>
        
        <div class="problem-indicators">
          <button
            v-for="n in totalProblems"
            :key="n"
            class="problem-indicator"
            :class="{
              current: n === currentProblem,
              answered: studentAnswers[n] !== null && studentAnswers[n] !== undefined && studentAnswers[n] !== ''
            }"
            @click="goToProblem(n)"
          >
            {{ n }}
          </button>
        </div>

        <button 
          class="nav-btn next-btn" 
          @click="nextProblem"
          :disabled="currentProblem >= totalProblems"
        >
          다음 문제
          <i class="bi bi-arrow-right"></i>
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
            <p>총 {{ totalProblems }}문제 중 {{ answeredCount }}문제를 답했습니다.</p>
            <p v-if="unansweredCount > 0" class="warning">
              <i class="bi bi-exclamation-triangle"></i>
              {{ unansweredCount }}문제가 답하지 않았습니다.
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel-btn" @click="closeSubmitModal">돌아가기</button>
          <!-- <button class="modal-btn submit-confirm-btn" @click="confirmSubmit">제출하기</button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/utils/apiClient";

export default {
  name: "ClassViewExam",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

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
    const problemStartTimes = ref({});
    const problemViewTimes = ref({});

    // 사용자 정보
    const tokenInfo = ref(null);

    // 시간 관련
    const startTime = ref(null);

    // 계산된 속성
    const totalProblems = computed(() => problems.value.length);
    const currentProblemData = computed(() => problems.value[currentProblem.value - 1]);
    
    const answeredCount = computed(() => {
      return Object.values(studentAnswers.value).filter(answer => 
        answer !== null && answer !== undefined && answer !== ''
      ).length;
    });

    const unansweredCount = computed(() => totalProblems.value - answeredCount.value);

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
        const response = await apiClient.get(`/exam/examProblems/${examNo}`);

        console.log("📝 백엔드 응답 데이터:", response);

        // 시험 기본 정보 설정
        examData.value = {
          examNo: response.examNo,
          examName: response.examName || "시험",
          examStartTime: response.examStartTime,
          examEndTime: response.examEndTime
        };

        // 문제 데이터 변환
        if (!response.examProblemDetailResponseList || !Array.isArray(response.examProblemDetailResponseList)) {
          throw new Error("문제 데이터가 없습니다.");
        }

        problems.value = response.examProblemDetailResponseList.map(problem => {
          console.log("문제 데이터 변환:", problem);
          
          // epExample JSON 파싱
          let choices = [];
          try {
            if (problem.epExample) {
              const exampleObj = typeof problem.epExample === 'string' 
                ? JSON.parse(problem.epExample) 
                : problem.epExample;
              
              choices = Object.values(exampleObj);
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
            type: choices.length > 0 ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
            level: problem.epLevel,
            choices: choices,
            correctAnswer: problem.epAnswer,
            comment: problem.epComment
          };
        });

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

        // 시험 시작 시간 기록
        startTime.value = new Date();
        
        // 첫 번째 문제 시작 시간 기록
        problemStartTimes.value[1] = new Date();
        
        console.log("✅ 시험 데이터 로드 완료:", {
          examName: examData.value.examName,
          problemCount: problems.value.length,
          problems: problems.value
        });

      } catch (err) {
        console.error("🚨 시험 데이터 로드 실패:", err);
        error.value = err.message || "시험 데이터를 불러오는데 실패했습니다.";
      } finally {
        isLoading.value = false;
      }
    };

    // 문제 이동 함수들
    const goToProblem = async (problemNumber) => {
      if (problemNumber === currentProblem.value) return;

      // 현재 문제의 소요 시간 기록
      await recordProblemTime();

      currentProblem.value = problemNumber;
      problemStartTimes.value[problemNumber] = new Date();

      // 페이지 이동 로그 전송
      sendPageMoveLog(problemNumber);
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

    // 현재 문제 소요 시간 기록
    const recordProblemTime = async () => {
      const problemNo = currentProblem.value;
      const startTimeVal = problemStartTimes.value[problemNo];
      
      if (startTimeVal) {
        const endTime = new Date();
        const timeSpent = Math.floor((endTime - startTimeVal) / 1000);
        problemViewTimes.value[problemNo] += timeSpent;
      }
    };

    // 페이지 이동 로그 전송
    const sendPageMoveLog = async (targetProblem) => {
      try {
        if (!tokenInfo.value) return;

        const logData = {
          eventType: "PAGE_MOVE",
          examNo: examData.value.examNo,
          studentNo: tokenInfo.value.classRoomStudentNo || tokenInfo.value.classRoomTeacherNo,
          fromProblem: currentProblem.value,
          toProblem: targetProblem,
          timestamp: new Date().toISOString(),
          timeSpent: problemViewTimes.value[currentProblem.value]
        };

        await apiClient.post("/exam/log", logData);
        
        console.log("📊 페이지 이동 로그 전송:", logData);
      } catch (err) {
        console.error("로그 전송 실패:", err);
      }
    };

    // 답안 변경 시 처리
    const onAnswerChange = () => {
      console.log(`문제 ${currentProblem.value} 답안 변경:`, studentAnswers.value[currentProblem.value]);
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

        if (!tokenInfo.value) {
          throw new Error("사용자 정보를 찾을 수 없습니다.");
        }

        // 현재 문제 시간 기록
        await recordProblemTime();

        // 사용자 역할에 따른 식별자 결정
        const userIdentifier = tokenInfo.value.role === 'teacher' 
          ? tokenInfo.value.classRoomTeacherNo 
          : tokenInfo.value.classRoomStudentNo;

        // 답안 데이터 구성
        const submitData = {
          classroomStudentNo: userIdentifier,
          examNo: examData.value.examNo,
          seStartTime: startTime.value.toISOString(),
          seEndTime: new Date().toISOString(),
          studentAnswerRequestList: problems.value.map((problem, index) => {
            const problemNo = index + 1;
            let answer = studentAnswers.value[problemNo];
            
            // 답안이 없으면 빈 문자열이 아니라 기본값 설정
            const answerString = answer ? String(answer) : " ";
            
            console.log(`문제 ${problemNo} 답안:`, {
              원본답안: answer,
              변환된답안: answerString,
              문제타입: problem.type,
              cepNo: problem.cepNo,
              epNo: problem.epNo
            });
            
            return {
              cepNo: problem.cepNo, // 시험출제문제 고유번호 (필수)
              epNo: problem.epNo,   // 시험문제 고유번호
              saAnswer: answerString, // 제출응답 (saStudentAnswer → saAnswer로 수정)
              saTimeSpent: problemViewTimes.value[problemNo] || 0
            };
          })
        };

        console.log("📤 시험 제출 데이터:", submitData);

        // 시험 제출 API 호출
        const response = await apiClient.post("/exam/submit", submitData);

        console.log("✅ 시험 제출 완료:", response);

        // 시험 결과 데이터를 localStorage에 저장 (ExamReport에서 사용)
        const examReportData = {
          examNo: examData.value.examNo,
          examName: response.examName || examData.value.examName,
          studentName: tokenInfo.value.memberName,
          examDate: new Date(),
          seScore: response.seScore,
          totalSolvingTime: response.totalSolvingTime,
          seStartTime: response.seStartTime,
          studentAnswerResponseList: response.studentAnswerResponseList || []
        };

        // localStorage에 저장 (ExamReport 페이지에서 사용할 데이터)
        localStorage.setItem(`examReport_${examData.value.examNo}`, JSON.stringify(examReportData));

        alert("시험이 성공적으로 제출되었습니다!");

        // 시험 결과 페이지로 이동 또는 창 닫기
        if (window.opener) {
          // window.close();
          router.push({ name: "ExamReport", params: { examNo: examData.value.examNo } });
        } else {
          router.push({ name: "ExamReport", params: { examNo: examData.value.examNo } });
        }

      } catch (err) {
        console.error("🚨 시험 제출 실패:", err);
        alert("시험 제출에 실패했습니다: " + err.message);
      } finally {
        isSubmitting.value = false;
      }
    };

    // 시험 나가기
    const exitExam = () => {
      if (confirm("정말로 시험을 나가시겠습니까?\n저장되지 않은 답안은 모두 사라집니다.")) {
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
        case 'MULTIPLE_CHOICE':
          return '객관식';
        case 'SHORT_ANSWER':
          return '주관식';
        default:
          return '문제';
      }
    };

    const getLevelText = (level) => {
      switch (level) {
        case '하':
        case 'BASIC':
          return '하';
        case '중':
        case 'STANDARD':
          return '중';
        case '상':
        case 'ADVANCED':
          return '상';
        default:
          return level || '';
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
      console.log(`문제 ${currentProblem.value} 이미지 로드 완료:`, currentProblemData.value?.imageUrl);
    };

    const onImageError = () => {
      console.error(`문제 ${currentProblem.value} 이미지 로드 실패:`, currentProblemData.value?.imageUrl);
    };

    // 생명주기 훅
    onMounted(async () => {
      // localStorage에서 직접 인증 상태 확인
      const accessToken = localStorage.getItem("authToken");
      const tokenInfoStr = localStorage.getItem("tokenInfo");
      
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
    });

    onBeforeUnmount(() => {
      // 정리 작업
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
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
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

.progress-info, .user-info {
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

/* 메인 콘텐츠 */
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
.loading-state, .error-state {
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

.loading-spinner i, .error-icon i {
  font-size: 3rem;
  animation: spin 1s linear infinite;
}

.error-icon i {
  animation: none;
  color: #e74c3c;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
}

.problem-number {
  font-size: 1.1rem;
  font-weight: 800;
}

.problem-type, .problem-level {
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