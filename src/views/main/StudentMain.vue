<template>
  <div>
    <!-- 헤더 -->
    <header class="header">
      <Header></Header>
    </header>

    <!-- classrooStuNo 가져와서 progress를 조회하고 가장 최근에 updatedAt된거 하나만 가져와서 unit  -->
    <!-- 페이지 컨테이너 -->
    <div class="student-page">
      <div class="student-container">
        <!-- 메인 컨테이너 -->
        <div class="main-container">
          <!-- 메인 콘텐츠 -->
          <main>
            <!-- 현재 진행 중인 수업 -->
            <section class="card current-lesson">
              <h2 class="card-title">📖 현재 진행 중인 수업</h2>
              <div class="lesson-content">
                <div class="lesson-info">
                  <h3 v-if="!currentUnit.loading">
                    {{ currentUnit.unitTitle }}
                  </h3>
                  <h3 v-else>📖 단원을 불러오는 중...</h3>
                  <p v-else>잠시만 기다려 주세요</p>
                  <!-- 에러 메시지 표시 -->
                  <p v-if="currentUnit.error" class="error-text">
                    ⚠️ {{ currentUnit.error }}
                  </p>
                </div>
                <div class="lesson-buttons">
                  <button class="btn btn-primary" @click="startLearning">
                    🚀 공부 시작하기
                  </button>
                </div>
              </div>

              <!-- 귀여운 학습 캐릭터들 -->
              <div class="study-characters">
                <div class="study-char char1">🥳</div>
                <div class="study-char char2">📚</div>
                <div class="study-char char3">🌟</div>
              </div>

              <div class="class-decorations">
                <div class="decoration decoration-1">☀️</div>
                <div class="decoration decoration-2">🥳</div>
                <div class="decoration decoration-3">🌟</div>
                <div class="decoration decoration-4">🌻</div>
              </div>
            </section>

            <!-- 과제/평가 섹션을 다음과 같이 수정 -->
            <div class="evaluation-assignment-grid">
              <!-- 좌측: 과제 섹션 -->
              <section
                class="card assignment-card"
                @click="onAssignmentClick"
                style="cursor: pointer"
              >
                <div class="card-header-with-button">
                  <h2 class="card-title">📝 최근 출제된 과제</h2>
                </div>

                <!-- 최근 과제가 있는 경우 -->
                <div
                  v-if="latestAssignment && !loadingAssignment"
                  class="latest-content"
                >
                  <div class="latest-header">
                    <h3 class="latest-title">
                      {{ latestAssignment.assignBoardTitle }}
                    </h3>
                    <span
                      class="status-badge"
                      :class="
                        latestAssignment.submitStatus === 'true'
                          ? 'completed'
                          : 'pending'
                      "
                    >
                      {{
                        latestAssignment.submitStatus === "true"
                          ? "✅ 제출완료"
                          : "📝 제출대기"
                      }}
                    </span>
                  </div>
                  <div class="latest-info">
                    <div class="info-item">
                      <i class="bi bi-calendar-plus"></i>
                      <span
                        >{{
                          formatAssignmentDate(latestAssignment.startDate)
                        }}
                        시작</span
                      >
                    </div>
                    <div class="info-item">
                      <i class="bi bi-calendar-event"></i>
                      <span
                        >{{
                          formatAssignmentDate(latestAssignment.dueDate)
                        }}
                        마감</span
                      >
                    </div>
                    <div class="info-item">
                      <i class="bi bi-people"></i>
                      <span>{{
                        latestAssignment.groupAssignType
                          ? "👥 모둠과제"
                          : "🧑 개별과제"
                      }}</span>
                    </div>
                  </div>
                  <div class="latest-actions">
                    <button class="action-btn btn-primary">
                      {{
                        latestAssignment.submitStatus === "true"
                          ? "과제 확인하기"
                          : "과제 시작하기"
                      }}
                    </button>
                  </div>
                </div>

                <!-- 로딩 상태 -->
                <div v-else-if="loadingAssignment" class="loading-content">
                  <div class="loading-spinner">⏳</div>
                  <p>과제를 불러오는 중...</p>
                </div>

                <!-- 과제가 없는 경우 (기존 코드) -->
                <div v-else class="assignment-section">
                  <div class="assignment-message">
                    <div class="message-icon">🎯</div>
                    <div class="message-text">
                      <div>아직 숙제가 없어요</div>
                      <div class="message-sub">
                        선생님이 숙제를 내주실 때까지 기다려요!
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 우측: 시험 섹션 -->
              <section
                class="card assignment-card"
                @click="onExamClick"
                style="cursor: pointer"
              >
                <div class="card-header-with-button">
                  <h2 class="card-title">🏆 최근 출제된 시험</h2>
                </div>

                <!-- 최근 시험이 있는 경우 -->
                <div v-if="latestExam && !loadingExam" class="latest-content">
                  <div class="latest-header">
                    <h3 class="latest-title">{{ latestExam.examName }}</h3>
                    <span
                      class="status-badge"
                      :class="latestExam.seIsDone ? 'completed' : 'pending'"
                    >
                      {{ latestExam.seIsDone ? "✅ 완료" : "📋 대기중" }}
                    </span>
                  </div>
                  <div class="latest-info">
                    <div class="info-item">
                      <i class="bi bi-calendar-plus"></i>
                      <span
                        >{{
                          formatExamDate(latestExam.examStartTime)
                        }}
                        시작</span
                      >
                    </div>
                    <div class="info-item">
                      <i class="bi bi-calendar-event"></i>
                      <span
                        >{{ formatExamDate(latestExam.examEndTime) }} 종료</span
                      >
                    </div>
                    <div class="info-item">
                      <i class="bi bi-patch-question"></i>
                      <span>{{ latestExam.examProblemCount }}문제</span>
                    </div>
                    <div v-if="latestExam.avgExamScore" class="info-item score">
                      <i class="bi bi-star"></i>
                      <span>{{ latestExam.avgExamScore }}점</span>
                    </div>
                  </div>
                  <div class="latest-actions">
                    <button class="action-btn btn-primary">
                      {{
                        latestExam.seIsDone ? "결과 확인하기" : "시험 시작하기"
                      }}
                    </button>
                  </div>
                </div>

                <!-- 로딩 상태 -->
                <div v-else-if="loadingExam" class="loading-content">
                  <div class="loading-spinner">⏳</div>
                  <p>시험을 불러오는 중...</p>
                </div>

                <!-- 시험이 없는 경우 (기존 코드) -->
                <div v-else class="assignment-section">
                  <div class="assignment-message">
                    <div class="message-icon">📋</div>
                    <div class="message-text">
                      <div>아직 시험이 없어요</div>
                      <div class="message-sub">
                        선생님이 시험을 내주실 때까지 기다려요!
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- 기존의 "이번 주 학습 기록" 섹션을 다음과 같이 수정 -->
            <section
              class="card learning-record-section yesterday-stats-section"
            >
              <div class="record-header">
                <h3 class="card-title">📅 어제의 학습 기록</h3>
                <div class="date-info"></div>
              </div>

              <!-- 로딩 상태 -->
              <div v-if="yesterdayStats.loading" class="loading-content">
                <div class="loading-spinner">⏳</div>
                <p>어제 학습 기록을 불러오는 중...</p>
              </div>

              <!-- 에러 상태 -->
              <div v-else-if="yesterdayStats.error" class="error-content">
                <div class="error-icon">😕</div>
                <p>{{ yesterdayStats.error }}</p>
              </div>

              <!-- 통계 데이터가 있는 경우 -->
              <template v-else-if="yesterdayStats.studyTime > 0">
                <div class="stats-grid yesterday-stats-grid">
                  <div class="stat-item yesterday-stat-item">
                    <div class="stat-icon">⏰</div>
                    <div class="stat-value">
                      {{ formatLearningTime(yesterdayStats.studyTime) }}
                    </div>
                    <div class="stat-label">학습시간</div>
                  </div>

                  <div class="stat-item yesterday-stat-item">
                    <div class="stat-icon">📝</div>
                    <div class="stat-value">
                      {{ yesterdayStats.problemsSolved
                      }}<span class="unit">문제</span>
                    </div>
                    <div class="stat-label">풀어본 문제</div>
                  </div>

                  <div class="stat-item yesterday-stat-item">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">
                      {{ yesterdayStats.correctProblems
                      }}<span class="unit">문제</span>
                    </div>
                    <div class="stat-label">맞힌 문제</div>
                  </div>

                  <div class="stat-item yesterday-stat-item">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">
                      {{ yesterdayStats.accuracy }}<span class="unit">점</span>
                    </div>
                    <div class="stat-label">평균 점수</div>
                  </div>
                </div>

                <!-- 격려 메시지 -->
                <div class="encouragement-message">
                  <div class="encourage-icon">🌟</div>
                  <div class="encourage-text">
                    어제도 열심히 공부했네요! 오늘도 화이팅! 💪
                  </div>
                </div>
              </template>

              <!-- 어제 학습하지 않은 경우 -->
              <div v-else class="no-study-message">
                <div class="no-study-icon">😴</div>
                <p class="no-study-text">어제는 쉬어가는 날이었네요!</p>
                <p class="no-study-sub">오늘은 열심히 공부해봐요! 💪</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>

    <!-- TOP 버튼 -->
    <i
      v-show="showTopButton"
      class="bi bi-arrow-up top-button"
      @click="scrollToTop"
      title="맨 위로 올라가기"
    ></i>

    <!-- 떠다니는 장식들 -->
    <div class="floating-decorations">
      <div class="floating-item item1">🥳</div>
      <div class="floating-item item2">🌻</div>
      <div class="floating-item item3">☀️</div>
      <div class="floating-item item4">🤗</div>
      <div class="floating-item item5">🥚</div>
      <div class="floating-item item6">🌟</div>
    </div>

    <!-- footer -->
    <footer class="footer">
      <Footer></Footer>
    </footer>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "@/components/common/Header.vue";
import Footer from "@/components/common/Footer.vue";
import apiClient from "@/utils/apiClient";
import { useAuthStore } from "@/stores/auth";
export default {
  name: "StudentMain",
  components: { Header, Footer },
  setup() {
    const yesterdayStats = ref({
      studyDays: 0,
      studyTime: 0,
      problemsSolved: 0,
      correctProblems: 0,
      accuracy: 0,
      loading: false,
      error: null,
    });

    // 어제 날짜 계산 함수
    const getYesterdayDate = () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split("T")[0];
    };

    // 어제 학습 통계 조회 함수
    const fetchYesterdayStats = async () => {
      try {
        yesterdayStats.value.loading = true;
        yesterdayStats.value.error = null;

        const userInfo = authStore.getUserInfo();
        if (!userInfo.classRoomStudentNo) {
          return;
        }

        const yesterdayDate = getYesterdayDate();

        // DTO 구조: classroomStudentNo, lsType, lsStartDate (lsEndDate 제외)
        const requestData = {
          classroomStudentNo: userInfo.classRoomStudentNo,
          lsType: "DAILY",
          lsStartDate: yesterdayDate,
          // lsEndDate는 제외 - 백엔드에서 DAILY일 때 자동으로 같은 날로 처리
        };

        const response = await apiClient.post(
          "/statistics/student/summary",
          requestData
        );

        if (response) {
          yesterdayStats.value = {
            ...yesterdayStats.value,
            studyDays: response.lsTotalLearningDays || 0,
            studyTime: response.lsTotalLearningTime || 0,
            problemsSolved: response.lsTotalProblemsSolved || 0,
            correctProblems: response.lsTotalCorrectProblems || 0,
            accuracy: Math.round(response.lsAvgAccuracyRate) || 0,
            loading: false,
          };
        }
      } catch (error) {
        console.error("어제 학습 통계 조회 실패:", error);
        yesterdayStats.value.error = "학습 통계를 불러올 수 없습니다.";
      } finally {
        yesterdayStats.value.loading = false;
      }
    };

    // 시간 포맷 함수
    const formatLearningTime = (milliseconds) => {
      if (!milliseconds) return "0분";
      const hours = Math.floor(milliseconds / (1000 * 60 * 60));
      const minutes = Math.floor(
        (milliseconds % (1000 * 60 * 60)) / (1000 * 60)
      );
      if (hours > 0) {
        return `${hours}시간 ${minutes}분`;
      }
      return `${minutes}분`;
    };

    // StudentMain.vue의 setup() 함수에 추가
    const latestAssignment = ref(null);
    const latestExam = ref(null);
    const loadingAssignment = ref(false);
    const loadingExam = ref(false);
    const authStore = useAuthStore();
    // 최근 과제 조회
    const fetchLatestAssignment = async () => {
      try {
        loadingAssignment.value = true;

        const userInfo = authStore.getUserInfo();
        if (!userInfo.classroomNo || !userInfo.classRoomStudentNo) {
          return;
        }

        const params = new URLSearchParams({
          userType: "STUDENT",
          classroomStudentNo: userInfo.classRoomStudentNo.toString(),
        });

        const response = await apiClient.get(
          `/assign/list/${userInfo.classroomNo}?${params}`
        );

        if (response && Array.isArray(response) && response.length > 0) {
          // 가장 최근 과제 (미제출 우선, 그 다음 최신순)
          const assignments = response.sort((a, b) => {
            return new Date(b.startDate) - new Date(a.startDate);
          });

          latestAssignment.value = assignments[0];
        }
      } catch (error) {
        console.error("최근 과제 조회 실패:", error);
      } finally {
        loadingAssignment.value = false;
      }
    };

    // 최근 시험 조회
    const fetchLatestExam = async () => {
      try {
        loadingExam.value = true;

        const tokenInfo = JSON.parse(localStorage.getItem("tokenInfo") || "{}");
        const classroomStudentNo = tokenInfo.classRoomStudentNo;

        if (!classroomStudentNo) {
          return;
        }

        const response = await apiClient.get(
          `/exam/${classroomStudentNo}?examStatus=ALL&memberRole=STUDENT`
        );

        if (response && Array.isArray(response) && response.length > 0) {
          // 미완료 시험 우선, 그 다음 최신순
          const exams = response.sort((a, b) => {
            return b.examNo - a.examNo;
          });

          latestExam.value = exams[0];
        }
      } catch (error) {
        console.error("최근 시험 조회 실패:", error);
      } finally {
        loadingExam.value = false;
      }
    };

    const currentUnit = ref({
      unitTitle: "단원을 불러오는 중...",
      unitNo: null,
      loading: true,
      error: null,
    });

    // setup() 함수 내에서
    const fetchLatestProgress = async () => {
      try {
        currentUnit.value.loading = true;
        currentUnit.value.error = null;

        // 토큰에서 classroomStudentNo 가져오기
        const classroomStudentNo = tokenInfo?.classRoomStudentNo;

        if (!classroomStudentNo) {
          throw new Error("학생 정보를 찾을 수 없습니다.");
        }

        console.log("최신 진도 조회 중:", classroomStudentNo);

        // 직접 API 호출
        const response = await apiClient.get(
          `/api/textbooks/progress/latest/${classroomStudentNo}`
        );

        if (response && response.unitNo) {
          currentUnit.value = {
            unitTitle: response.unitTitle || `${response.unitNum}. 단원`,
            unitNum: response.unitNum,
            unitNo: response.unitNo,
            loading: false,
            error: null,
          };
        } else {
          // 진도가 없는 경우 기본값
          currentUnit.value = {
            unitTitle: "아직 학습을 시작하지 않았습니다",
            unitNum: null,
            unitNo: null,
            loading: false,
            error: null,
          };
        }
      } catch (error) {
        console.error("진도 조회 실패:", error);

        currentUnit.value = {
          unitTitle: "진도 조회 실패",
          unitNum: null,
          unitNo: null,
          loading: false,
          error: error.message || "진도를 불러올 수 없습니다.",
        };
      }
    };

    // 날짜 포맷 함수들
    const formatAssignmentDate = (dateString) => {
      if (!dateString) return "날짜 미정";

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        return "날짜 오류";
      }
    };

    const formatExamDate = (dateString) => {
      if (!dateString) return "시간 미정";

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        return "시간 오류";
      }
    };

    // 반응형 데이터
    // const subjectInfo = ref("수학 3-1 | 김학생");
    const unitInfo = apiClient.get(``);
    // const showNotificationModal = ref(false);
    const showTopButton = ref(false);
    // const currentNotificationTab = ref("all");
    const presenceClient = inject("presenceClient");
    const tokeninfoString = localStorage.getItem("tokenInfo");
    const memberId = localStorage.getItem("memberId");
    const tokenInfo = JSON.parse(tokeninfoString);

    // 학습 통계
    const learningStats = reactive({
      studyDays: 0,
      studyTime: 0,
      problemsSolved: 0,
      accuracy: 0,
    });

    // 과제/평가 정보
    const assignmentUnit = ref(0);
    const assignmentCompleted = ref(0);
    const assignmentTotal = ref(0);
    const evaluationUnit = ref(0);
    const evaluationCompleted = ref(0);
    const evaluationTotal = ref(0);

    // 브라우저 종료 시 실행될 함수
    const handleBeforeUnload = () => {
      if (presenceClient) {
        presenceClient.disconnect();
        console.log("🔌 사이트를 벗어나기 전, 연결을 종료합니다.");
      }
    };

    const onAssignmentClick = () => {
      router.push("/assignment");
    };
    const onExamClick = () => {
      router.push("/exam");
    };

    const startLearning = () => {
      router.push("/classroom");
      //window.open("/classroomview/:unitNo")
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    const handleScroll = () => {
      showTopButton.value = window.pageYOffset > 300;
    };

    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        closeNotificationModal();
      }
    };

    const route = useRoute();
    const router = useRouter();

    // 라이프사이클 훅
    onMounted(() => {
      window.addEventListener("scroll", handleScroll);
      document.addEventListener("keydown", handleKeydown);

      // 온라인 상태 연결 및 브라우저 종료 이벤트 리스너 등록
      if (presenceClient && memberId && tokenInfo) {
        presenceClient.connect(
          {
            classNo: tokenInfo.classroomNo,
            userId: memberId,
            role: tokenInfo.role,
            online: true,
          },
          {
            onEvent: (data) => {
              console.log("서버로부터 받은 실시간 이벤트:", data);

              if (data.eventType === "FOCUS_PULSE" && data.unitNo) {
                const targetPath = `/classroom/view/${data.unitNo}`; // 라우터 경로 확인 필요

                // 현재 경로가 목표 경로와 다를 경우에만 이동
                console.log(
                  `[FOCUS MODE] 학습 화면으로 이동합니다 -> ${targetPath}`
                );
                router.replace(targetPath);
              }
              // 집중학습 모드 종료 이벤트는 그대로 유지
              else if (data.eventType === "FOCUS_STOP") {
                alert("집중학습 모드가 종료되었습니다.");
              }
            },
          }
        );
        console.log("✅ 온라인 상태로 서버에 연결했습니다.");
      }

      fetchLatestProgress();
      fetchLatestAssignment();
      fetchLatestExam();
      fetchYesterdayStats();
      // 브라우저 창/탭을 닫을 때의 이벤트를 감지하도록 리스너를 추가합니다.
      window.addEventListener("beforeunload", handleBeforeUnload);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeydown);

      // 컴포넌트가 사라질 때는 등록했던 beforeunload 이벤트 리스너만 제거합니다.
      window.removeEventListener("beforeunload", handleBeforeUnload);
    });

    return {
      showTopButton,
      currentUnit,
      learningStats,
      assignmentUnit,
      assignmentCompleted,
      assignmentTotal,
      evaluationUnit,
      evaluationCompleted,
      evaluationTotal,
      latestAssignment,
      latestExam,
      loadingAssignment,
      loadingExam,
      yesterdayStats,
      startLearning,
      onAssignmentClick,
      onExamClick,
      formatAssignmentDate,
      formatLearningTime,
      formatExamDate,
      getYesterdayDate,
      scrollToTop,
    };
  },
};
</script>

<style scoped>
/* 최신 과제/시험 카드 스타일 */
.latest-content {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  border-radius: 15px;
  margin: 1rem 0;
}

.latest-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.latest-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f57f17;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.completed {
  background: #e8f5e8;
  color: #388e3c;
}

.status-badge.pending {
  background: #fff3e0;
  color: #f57c00;
}

.latest-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.info-item i {
  color: #f57f17;
  width: 16px;
}

.info-item.score {
  color: #f57c00;
  font-weight: 700;
}

.latest-actions {
  display: flex;
  justify-content: center;
}

.latest-actions .action-btn {
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffdd29;
  color: white;
  font-size: 0.9rem;
}

.latest-actions .action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 221, 41, 0.3);
}

.loading-content {
  text-align: center;
  padding: 2rem;
  color: #f57c00;
}

.loading-spinner {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .latest-header {
    flex-direction: column;
    align-items: stretch;
  }

  .status-badge {
    align-self: flex-start;
  }
}

/* 전역 폰트 및 배경 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}

.student-page {
  background: #fff9e6;
  min-height: 100vh;
}

.student-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 0.3;
    transform: rotate(0deg);
  }
  50% {
    opacity: 0.7;
    transform: rotate(180deg);
  }
}

.student-info {
  position: relative;
  z-index: 2;
}

.subject-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #f57c00;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1rem;
}

/* 안내 상자 */
.notice-box {
  background: #fffbf0;
  border: 2px dashed #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  gap: 1rem;
  color: #f57c00;
}

.notice-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notice-content p {
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.notice-content p:last-child {
  margin-bottom: 0;
}

/* 메인 컨테이너 */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 카드 공통 스타일 */
.card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(255, 193, 7, 0.15);
  border: 3px solid #fff9c4;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 2rem;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(255, 193, 7, 0.25);
  border-color: #ffe082;
}

.card::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 213, 79, 0.1) 0%,
    transparent 70%
  );
  animation: sparkle 4s ease-in-out infinite;
  pointer-events: none;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #f57f17;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
}

/* 학습 기록 */
.learning-record-section {
  position: relative;
  z-index: 2;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
}

.record-button {
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  border: 2px solid #ffe082;
  padding: 0.6rem 1rem;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #f57f17;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
}

.record-button:hover {
  background: linear-gradient(135deg, #ffe082, #fff9c4);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 193, 7, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  background: linear-gradient(135deg, #fffacd, #fff8dc);
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #fff9c4;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 15px;
  border: 2px solid #fff9c4;
  transition: all 0.3s ease;
  position: relative;
}

.stat-item:hover {
  transform: scale(1.05);
  border-color: #ffe082;
  box-shadow: 0 8px 20px rgba(255, 193, 7, 0.15);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  animation: bounce 2s infinite;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  color: #f57f17;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #ff8f00;
  font-weight: 600;
}

.encouragement-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #98fb98, #90ee90);
  padding: 1rem 1.5rem;
  border-radius: 15px;
  border: 2px solid #32cd32;
  position: relative;
  z-index: 2;
}

.encourage-icon {
  font-size: 2rem;
  animation: twinkle 1.5s ease-in-out infinite;
}

@keyframes twinkle {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.encourage-text {
  color: #006400;
  font-weight: 700;
  font-size: 1rem;
}

/* 현재 수업 카드 */
.current-lesson {
  background: linear-gradient(135deg, #ffeb3b 0%, #ffd54f 50%, #fee500 100%);
  border-radius: 25px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  color: white;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 3px solid #ffe082;
}

.current-lesson .card-title {
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.current-lesson::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.2) 0%,
    transparent 70%
  );
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(180deg);
  }
}

.lesson-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-wrap: wrap;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.lesson-info h3 {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.lesson-info p {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.9;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.lesson-buttons {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

/* 버튼 스타일 */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: white;
  color: #f57f17;
}

.btn-primary:hover {
  background: #fffacd;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
}

.study-characters {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1;
}

.study-char {
  font-size: 2rem;
  animation: bounce 2s infinite;
  animation-delay: var(--delay, 0s);
}

.char1 {
  --delay: 0s;
}
.char2 {
  --delay: 0.3s;
}
.char3 {
  --delay: 0.6s;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 과제/평가 섹션 그리드 */
.evaluation-assignment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

/* 장식 요소들 */
.class-decorations {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.6;
  animation: float 4s ease-in-out infinite;
}

.decoration-1 {
  top: 20%;
  right: 25%;
  animation-delay: 0s;
}

.decoration-2 {
  top: 70%;
  right: 15%;
  animation-delay: 1s;
}

.decoration-3 {
  top: 40%;
  right: 35%;
  animation-delay: 2s;
}

.decoration-4 {
  top: 60%;
  right: 45%;
  animation-delay: 3s;
}

/* 과제/평가 카드 */
.assignment-card {
  border-color: #fff9c4;
  position: relative;
  z-index: 2;
}

.assignment-card:hover {
  border-color: #ffe082;
  box-shadow: 0 12px 40px rgba(255, 193, 7, 0.15);
}

.card-header-with-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
  gap: 1rem;
}

.evaluation-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.evaluation-nav-btn {
  background: none;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  border: 2px solid #ffe082;
}

.evaluation-nav-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.unit-info {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f57f17;
  min-width: 80px;
  text-align: center;
}

.completion-info {
  margin-bottom: 2rem;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 600;
}

.completion-count {
  color: #f57f17;
  font-size: 1.1rem;
}

/* 과제 섹션 */
.assignment-section {
  background: linear-gradient(135deg, #fffacd, #fff9c4);
  padding: 2.5rem;
  border-radius: 15px;
  text-align: center;
  margin-top: 1rem;
  border: 2px solid #fff9c4;
}

.assignment-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.message-icon {
  font-size: 3rem;
  animation: wiggle 3s ease-in-out infinite;
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  75% {
    transform: rotate(-5deg);
  }
}

.message-text {
  text-align: center;
}

.message-text > div:first-child {
  font-size: 1.1rem;
  font-weight: 700;
  color: #f57f17;
  margin-bottom: 0.5rem;
}

.message-sub {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 600;
}

/* TOP 버튼 */
.top-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ffd54f, #ffc107);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 3px solid #ffe082;
}

.top-button:hover {
  background: linear-gradient(135deg, #ffc107, #ff8f00);
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 193, 7, 0.4);
}

.top-icon {
  font-size: 1.5rem;
  margin-bottom: 2px;
}

.top-text {
  font-size: 0.7rem;
  font-weight: 700;
}

/* 알림 모달 스타일 */
.notification-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.notification-modal.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(255, 193, 7, 0.3);
  animation: slideUp 0.3s ease;
  border: 3px solid #ffe082;
}

.notification-header {
  background: linear-gradient(135deg, #ffd54f, #ffc107);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.notification-info {
  background: linear-gradient(135deg, #e0f2fe, #f0f9ff);
  padding: 1rem 1.5rem;
  border-left: 4px solid #3b82f6;
  margin: 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #374151;
  font-weight: 600;
}

.notification-tabs {
  display: flex;
  padding: 0 1.5rem;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab-button {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 20px;
  background: #f1f5f9;
  color: #6b7280;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.tab-button.active {
  background: linear-gradient(135deg, #ffd54f, #ffc107);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 193, 7, 0.3);
}

.tab-button:hover:not(.active) {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem;
}

.notification-item {
  padding: 1.2rem;
  border-left: 4px solid #e2e8f0;
  margin-bottom: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: #f1f5f9;
  border-left-color: #ffd54f;
  transform: translateX(5px);
}

.notification-item.read {
  background: white;
  border-left-color: #d1d5db;
  opacity: 0.7;
}

.notification-item.unread {
  background: linear-gradient(135deg, #fffacd, #fff9c4);
  border-left-color: #ffd54f;
  box-shadow: 0 2px 10px rgba(255, 193, 7, 0.1);
}

.notification-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-category {
  background: #ffd54f;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 700;
}

.notification-category.학습 {
  background: #10b981;
}

.notification-category.공지 {
  background: #f59e0b;
}

.notification-category.기타 {
  background: #8b5cf6;
}

.notification-message {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  font-size: 0.95rem;
}

.notification-time {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
}

.empty-notifications {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-notifications h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 700;
}

.empty-notifications p {
  font-weight: 600;
}

/* 떠다니는 장식들 */
.floating-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-item {
  position: absolute;
  font-size: 2rem;
  opacity: 0.4;
  animation: floatAround 8s ease-in-out infinite;
}

.item1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.item2 {
  top: 20%;
  right: 10%;
  animation-delay: 1s;
}

.item3 {
  top: 60%;
  left: 5%;
  animation-delay: 2s;
}

.item4 {
  top: 80%;
  right: 20%;
  animation-delay: 3s;
}

.item5 {
  top: 40%;
  left: 80%;
  animation-delay: 4s;
}

.item6 {
  top: 70%;
  right: 5%;
  animation-delay: 5s;
}

@keyframes floatAround {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
  }
  50% {
    transform: translateY(0px) rotate(180deg);
  }
  75% {
    transform: translateY(-10px) rotate(270deg);
  }
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .student-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .current-lesson {
    padding: 2rem 1.5rem;
    margin-bottom: 1rem;
    min-height: 200px;
  }

  .lesson-content {
    flex-direction: column;
    text-align: center;
  }

  .lesson-buttons {
    justify-content: center;
  }

  .study-characters {
    position: static;
    transform: none;
    flex-direction: row;
    justify-content: center;
    margin-top: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
    padding: 1rem;
  }

  .evaluation-assignment-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .notification-content {
    width: 95%;
    margin: 1rem;
  }

  .notification-tabs {
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  .tab-button {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }

  .floating-item {
    font-size: 1.5rem;
  }

  .card-header-with-button {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .card {
    padding: 1.5rem;
  }

  .lesson-buttons {
    flex-direction: column;
  }
}

/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 접근성 */
button:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 호버 효과 개선 */
@media (hover: none) {
  .card:hover {
    transform: none;
  }

  .stat-item:hover {
    transform: none;
  }
}
</style>
