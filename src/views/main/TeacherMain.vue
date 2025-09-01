<template>
  <div>
    <!-- 헤더 -->
    <header class="header">
      <Header></Header>
    </header>

    <!-- 페이지 컨테이너 -->
    <div class="teacher-page">
      <div class="teacher-container">
        <!-- 페이지 헤더 -->
        <div class="page-header">
          <div class="page-text">
            <h1 class="page-title">🌟 선생님 대시보드</h1>
            <p class="page-subtitle">
              우리 반 친구들과 함께하는 즐거운 수업! 오늘도 화이팅! ✨
            </p>
            <div class="teacher-info">
              <span class="subject-badge">{{ teacherInfo }}</span>
            </div>
          </div>
        </div>

        <!-- 안내 상자 -->
        <div class="notice-box">
          <span class="notice-icon">💡</span>
          <div class="notice-content">
            <p><strong>📚 오늘의 수업 팁!</strong></p>
            <p>
              학생들의 학습 현황을 확인하고 맞춤형 피드백을 제공해보세요! 🎯
            </p>
          </div>
        </div>

        <!-- 메인 컨테이너 -->
        <div class="main-container">
          <!-- 메인 콘텐츠 -->
          <main>
            <!-- 과제 관리 -->
            <section class="card assignment-card">
              <div class="card-header-with-button">
                <h2 class="card-title">📝 과제 관리</h2>
                <button class="btn btn-secondary" @click="goToAssignmentCreate">
                  ✏️ 과제 출제하기
                </button>
              </div>
              <div v-if="assignmentLoading" class="loading-state">
                <div class="loading-icon">🔄</div>
                <p>과제 데이터를 불러오는 중...</p>
              </div>
              <div v-else-if="assignments.length === 0" class="no-data">
                <div class="no-data-icon">📋</div>
                <div class="no-data-text">
                  <h3>아직 출제된 과제가 없습니다</h3>
                  <p>첫 번째 과제를 출제해보세요! 🚀</p>
                </div>
              </div>
              <div v-else class="assignment-content">
                <div class="assignment-stats">
                  <div class="stat-item">
                    <div class="stat-number ongoing">
                      {{ assignmentStats.ongoing }}
                    </div>
                    <div class="stat-label">진행중</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number completed">
                      {{ assignmentStats.completed }}
                    </div>
                    <div class="stat-label">완료됨</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number total">
                      {{ assignmentStats.total }}
                    </div>
                    <div class="stat-label">전체</div>
                  </div>
                </div>
                <div class="recent-assignments">
                  <h4>📌 최근 과제</h4>
                  <div class="assignment-list">
                    <div
                      v-for="assignment in recentAssignments"
                      :key="assignment.assignBoardNo"
                      class="assignment-item"
                      @click="goToAssignmentDetail(assignment)"
                    >
                      <div class="assignment-info">
                        <div class="assignment-title">
                          {{ assignment.assignBoardTitle }}
                        </div>
                        <div class="assignment-meta">
                          <span class="assignment-type">
                            {{
                              assignment.groupAssignType ? "👥 모둠" : "🧑 개별"
                            }}
                          </span>
                          <span class="assignment-date">
                            {{ formatDate(assignment.dueDate) }} 마감
                          </span>
                        </div>
                      </div>
                      <div
                        class="assignment-status"
                        :class="getAssignmentStatusClass(assignment)"
                      >
                        {{ getAssignmentStatusText(assignment) }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <button class="btn btn-outline" @click="goToAssignmentList">
                    📋 전체 과제 보기
                  </button>
                </div>
              </div>
            </section>

            <!-- 평가 관리 -->
            <section class="card evaluation-card">
              <div class="card-header-with-button">
                <h2 class="card-title">🏆 평가 관리</h2>
                <button class="btn btn-secondary" @click="goToExamCreate">
                  📊 평가 만들기
                </button>
              </div>
              <div v-if="examLoading" class="loading-state">
                <div class="loading-icon">🔄</div>
                <p>평가 데이터를 불러오는 중...</p>
              </div>
              <div v-else-if="exams.length === 0" class="no-data">
                <div class="no-data-icon">📊</div>
                <div class="no-data-text">
                  <h3>아직 생성된 평가가 없습니다</h3>
                  <p>첫 번째 평가를 만들어보세요! 📈</p>
                </div>
              </div>
              <div v-else class="evaluation-content">
                <div class="evaluation-stats">
                  <div class="stat-item">
                    <div class="stat-number ongoing">
                      {{ examStats.ongoing }}
                    </div>
                    <div class="stat-label">진행중</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number completed">
                      {{ examStats.completed }}
                    </div>
                    <div class="stat-label">완료됨</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number average">
                      {{ examStats.averageScore }}%
                    </div>
                    <div class="stat-label">평균점수</div>
                  </div>
                </div>
                <div class="recent-exams">
                  <h4>📌 최근 평가</h4>
                  <div class="exam-list">
                    <div
                      v-for="exam in recentExams"
                      :key="exam.examNo"
                      class="exam-item"
                      @click="goToExamDetail(exam)"
                    >
                      <div class="exam-info">
                        <div class="exam-title">{{ exam.examName }}</div>
                        <div class="exam-meta">
                          <span class="exam-problems"
                            >📝 {{ exam.examProblemCount }}문제</span
                          >
                          <span class="exam-date">
                            {{ formatDate(exam.examEndTime) }} 마감
                          </span>
                        </div>
                      </div>
                      <div
                        class="exam-status"
                        :class="getExamStatusClass(exam)"
                      >
                        {{ getExamStatusText(exam) }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-actions">
                  <button class="btn btn-outline" @click="goToExamList">
                    📊 전체 평가 보기
                  </button>
                </div>
              </div>
            </section>
          </main>

          <!-- 사이드바 -->
          <aside class="sidebar">
            <!-- 학급현황 요약 -->
            <section class="card class-summary-card">
              <div class="card-header-with-button">
                <h3 class="card-title">📊 학급현황 요약</h3>
                <button class="btn btn-small" @click="goToClassReport">
                  📈 상세보기
                </button>
              </div>

              <div v-if="classStatsLoading" class="loading-state">
                <div class="loading-icon">🔄</div>
                <p>학급 데이터 분석중...</p>
              </div>
              <div v-else-if="classStats.totalStudents === 0" class="no-data">
                <div class="no-data-icon">👥</div>
                <div class="no-data-text">
                  <h4>등록된 학생이 없습니다</h4>
                  <p>학생이 등록되면 현황이 표시됩니다</p>
                </div>
              </div>
              <div v-else class="class-summary-content">
                <!-- 전체 통계 -->
                <div class="summary-overview">
                  <div class="overview-item">
                    <div class="overview-number">
                      {{ classStats.totalStudents }}
                    </div>
                    <div class="overview-label">전체 학생</div>
                  </div>
                  <div class="overview-item">
                    <div class="overview-number">
                      {{ classStats.averageProgress }}%
                    </div>
                    <div class="overview-label">평균 진도</div>
                  </div>
                </div>

                <!-- 수준별 분포 -->
                <div class="level-distribution">
                  <h4>📈 수준별 분포</h4>
                  <div class="level-stats">
                    <div class="level-item fast">
                      <div class="level-icon">⚡</div>
                      <div class="level-info">
                        <div class="level-count">
                          {{ classStats.fastStudents }}
                        </div>
                        <div class="level-label">빠름</div>
                      </div>
                    </div>
                    <div class="level-item normal">
                      <div class="level-icon">⏱️</div>
                      <div class="level-info">
                        <div class="level-count">
                          {{ classStats.normalStudents }}
                        </div>
                        <div class="level-label">보통</div>
                      </div>
                    </div>
                    <div class="level-item slow">
                      <div class="level-icon">🐌</div>
                      <div class="level-info">
                        <div class="level-count">
                          {{ classStats.slowStudents }}
                        </div>
                        <div class="level-label">느림</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 성취도 분석 -->
                <div class="achievement-analysis">
                  <h4>🎯 성취도 분석</h4>
                  <div
                    class="achievement-text"
                    :class="getAchievementClass(classStats.averageScore)"
                  >
                    {{ getAchievementMessage(classStats.averageScore) }}
                  </div>
                  <div class="achievement-score">
                    평균 성취도: <strong>{{ classStats.averageScore }}%</strong>
                  </div>
                </div>
              </div>
            </section>

            <!-- 실시간 모니터링 -->
            <section class="card monitoring-card">
              <h3 class="card-title">👀 실시간 접속 현황</h3>
              <div class="monitoring-stats">
                <div class="monitor-stat">
                  <div class="monitor-number total">{{ monitoring.total }}</div>
                  <div class="monitor-label">전체</div>
                </div>
                <div class="monitor-stat">
                  <div class="monitor-number online">
                    {{ monitoring.online }}
                  </div>
                  <div class="monitor-label">접속</div>
                </div>
                <div class="monitor-stat">
                  <div class="monitor-number offline">
                    {{ monitoring.offline }}
                  </div>
                  <div class="monitor-label">미접속</div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
    <!-- footer -->
    <footer class="footer">
      <Footer></Footer>
    </footer>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/common/Header.vue";
import Footer from "@/components/common/Footer.vue";
import apiClient from "@/utils/apiClient";
import * as statisticsApi from "@/utils/statisticsApi";

export default {
  name: "TeacherMain",
  components: { Header, Footer },
  setup() {
    const router = useRouter();

    // 반응형 데이터
    const teacherInfo = ref("수학 3-1 | 이은영 선생님");
    const notificationCount = ref(3);
    const chatCount = ref(1);

    // 로딩 상태
    const assignmentLoading = ref(false);
    const examLoading = ref(false);
    const classStatsLoading = ref(false);

    // 데이터 상태
    const assignments = ref([]);
    const exams = ref([]);
    const classStats = reactive({
      totalStudents: 0,
      averageProgress: 0,
      averageScore: 0,
      fastStudents: 0,
      normalStudents: 0,
      slowStudents: 0,
    });

    // 로그인한 사용자 정보 가져오기
    const userEmail = localStorage.getItem("userEmail") || "teacher@airoom.com";
    const userName = localStorage.getItem("userName") || "이은영 선생님";

    // 선택한 교과서 정보 가져오기
    const selectedTextbook = localStorage.getItem("selectedTextbook");
    if (selectedTextbook) {
      const textbook = JSON.parse(selectedTextbook);
      teacherInfo.value = `${textbook.title} | ${userName}`;
    } else {
      teacherInfo.value = `수학 3-1 | ${userName}`;
    }

    // 실시간 모니터링
    const monitoring = reactive({
      total: 0,
      online: 0,
      offline: 0,
    });

    const lastUpdate = ref(""); // 사용하지 않음

    // 유틸리티 함수들
    const getClassNo = () => {
      try {
        const tokeninfo = JSON.parse(localStorage.getItem("tokenInfo") || "{}");
        const raw =
          tokeninfo?.classroomNo ??
          tokeninfo?.classroomNO ??
          tokeninfo?.classNo;
        if (raw == null) return undefined;
        const n = Number(raw);
        return Number.isFinite(n) ? n : undefined;
      } catch {
        return undefined;
      }
    };

    const getUserInfo = () => {
      try {
        const tokenInfo = JSON.parse(localStorage.getItem("tokenInfo") || "{}");

        return {
          classroomNo: tokenInfo.classroomNo,
          classroomTeacherNo: tokenInfo.classroomTeacherNo, // 이 값이 핵심!
          memberName: tokenInfo.memberName || userName,
        };
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
        return {
          classroomNo: null,
          classroomTeacherNo: null, // null 반환하도록 수정
          memberName: userName,
        };
      }
    };

    // 계산된 속성들
    const assignmentStats = computed(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 오늘 날짜의 00:00:00으로 설정

      return {
        total: assignments.value.length,
        ongoing: assignments.value.filter((a) => {
          const dueDate = new Date(a.dueDate);
          dueDate.setHours(0, 0, 0, 0); // 마감일의 00:00:00으로 설정
          return dueDate >= today; // 오늘 포함해서 이후면 진행중
        }).length,
        completed: assignments.value.filter((a) => {
          const dueDate = new Date(a.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate < today; // 오늘 이전이면 완료
        }).length,
      };
    });

    const examStats = computed(() => ({
      total: exams.value.length,
      ongoing: exams.value.filter((e) => e.status === "incomplete").length,
      completed: exams.value.filter((e) => e.status === "complete").length,
      averageScore:
        exams.value.length > 0
          ? Math.round(
              exams.value.reduce((sum, e) => sum + (e.score || 0), 0) /
                exams.value.length
            )
          : 0,
    }));

    const recentAssignments = computed(() => {
      return assignments.value
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .slice(0, 3);
    });

    const recentExams = computed(() => {
      return exams.value
        .sort(
          (a, b) =>
            new Date(b.examStartTime || b.startTime) -
            new Date(a.examStartTime || a.startTime)
        )
        .slice(0, 3);
    });

    // API 호출 함수들
    const fetchAssignments = async () => {
      try {
        assignmentLoading.value = true;
        const userInfo = getUserInfo();

        if (!userInfo.classroomNo) {
          console.warn("교실 정보가 없습니다.");
          return;
        }

        const params = new URLSearchParams({
          userType: "TEACHER",
        });

        const response = await apiClient.get(
          `/assign/list/${userInfo.classroomNo}?${params}`
        );
        assignments.value = response || [];

        console.log(
          "📝 과제 데이터 로드 완료:",
          assignments.value.length + "개"
        );
      } catch (error) {
        console.error("🚨 과제 데이터 로드 실패:", error);
        assignments.value = [];
      } finally {
        assignmentLoading.value = false;
      }
    };

    const fetchExams = async () => {
      try {
        examLoading.value = true;
        const userInfo = getUserInfo();

        // classroomTeacherNo 확인 (classroomNo가 아닌)
        if (!userInfo.classroomTeacherNo) {
          console.warn("교사 정보가 없습니다.");
          return;
        }

        console.log("📊 평가 목록 조회 시작:", {
          classroomTeacherNo: userInfo.classroomTeacherNo,
          memberRole: "TEACHER",
          examStatus: "ALL",
        });

        // 올바른 API 엔드포인트와 파라미터 사용
        const response = await apiClient.get(
          `/exam/${userInfo.classroomTeacherNo}?examStatus=ALL&memberRole=TEACHER`
        );

        // 응답 데이터를 표준화
        exams.value = (response || []).map((exam) => ({
          examNo: exam.examNo,
          examName: exam.examName,
          examProblemCount: exam.examProblemCount,
          examStartTime: exam.examStartTime,
          examEndTime: exam.examEndTime,
          status: exam.examStatus === "진행" ? "incomplete" : "complete", // 상태 매핑
          score: exam.avgExamScore || 0,
        }));

        console.log("📊 평가 데이터 로드 완료:", exams.value.length + "개");
      } catch (error) {
        console.error("🚨 평가 데이터 로드 실패:", error);
        exams.value = [];
      } finally {
        examLoading.value = false;
      }
    };

    const fetchClassStats = async () => {
      try {
        classStatsLoading.value = true;
        const userInfo = getUserInfo();

        if (!userInfo.classroomNo) {
          console.warn("교실 정보가 없습니다.");
          return;
        }

        // 학급 현황 요약 조회
        const request = {
          classroomNo: userInfo.classroomNo,
          lsType: "MONTHLY",
          lsStartDate: null,
          lsEndDate: null,
        };

        const response = await apiClient.post(
          "/statistics/teacher/summary/all",
          request
        );

        if (Array.isArray(response) && response.length > 0) {
          // 수준별 분포 계산
          let fastCount = 0,
            normalCount = 0,
            slowCount = 0;
          let totalScore = 0;

          response.forEach((student) => {
            const score = student.studentAvgExamScore || 0;
            const progress = student.studentLearningProgress || 0;
            const combinedScore = (score + progress) / 2;

            if (combinedScore >= 75) {
              fastCount++;
            } else if (combinedScore >= 50) {
              normalCount++;
            } else {
              slowCount++;
            }

            totalScore += score;
          });

          // 상태 업데이트
          Object.assign(classStats, {
            totalStudents: response.length,
            averageProgress: Math.round(
              response.reduce(
                (sum, s) => sum + (s.studentLearningProgress || 0),
                0
              ) / response.length
            ),
            averageScore:
              response.length > 0
                ? Math.round(totalScore / response.length)
                : 0,
            fastStudents: fastCount,
            normalStudents: normalCount,
            slowStudents: slowCount,
          });
        }

        console.log("📊 학급현황 데이터 로드 완료:", classStats);
      } catch (error) {
        console.error("🚨 학급현황 데이터 로드 실패:", error);
      } finally {
        classStatsLoading.value = false;
      }
    };

    const fetchStudentStatus = async () => {
      try {
        const classNo = getClassNo();

        if (!classNo) {
          console.warn("classNo를 찾을 수 없습니다.");
          return;
        }

        const studentList = await apiClient.get(`/api/presence/${classNo}`);

        if (Array.isArray(studentList)) {
          const totalStudents = studentList.length;
          const onlineStudents = studentList.filter((s) => s.online).length;

          monitoring.total = totalStudents;
          monitoring.online = onlineStudents;
          monitoring.offline = totalStudents - onlineStudents;
        }
      } catch (error) {
        console.error("🚨 학생 접속 상태 조회 실패:", error);
      }
    };

    // 네비게이션 함수들
    const goToAssignmentCreate = () => {
      router.push({ name: "AssignmentCreate" });
    };

    const goToAssignmentList = () => {
      router.push({ name: "Assignment" });
    };

    const goToAssignmentDetail = (assignment) => {
      router.push({
        name: "AssignmentEvaluation",
        params: { id: assignment.assignBoardNo },
      });
    };

    const goToExamCreate = () => {
      router.push({ name: "TeacherExamCreate" });
    };

    const goToExamList = () => {
      router.push({ name: "Exam" });
    };

    const goToExamDetail = (exam) => {
      router.push({
        name: "TeacherExamReport",
        params: { classroomNo: getUserInfo().classroomNo, examNo: exam.examNo },
      });
    };

    const goToClassReport = () => {
      router.push({ name: "TeacherClassReport" });
    };

    // 헬퍼 함수들
    const formatDate = (date) => {
      if (!date) return "-";
      const d = new Date(date);
      if (isNaN(d)) return String(date);
      return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
    };

    const getAssignmentStatusClass = (assignment) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(assignment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today ? "ongoing" : "completed";
    };

    const getAssignmentStatusText = (assignment) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(assignment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today ? "🏃 진행중" : "✅ 완료";
    };

    const getExamStatusClass = (exam) => {
      return exam.status === "incomplete" ? "ongoing" : "completed";
    };

    const getExamStatusText = (exam) => {
      return exam.status === "incomplete" ? "🔄 진행중" : "✅ 완료";
    };

    const getAchievementClass = (score) => {
      if (score >= 80) return "achievement-excellent";
      if (score >= 60) return "achievement-good";
      if (score >= 40) return "achievement-fair";
      return "achievement-poor";
    };

    const getAchievementMessage = (score) => {
      if (score >= 80) return "🌟 우수한 성취도를 보이고 있습니다!";
      if (score >= 60) return "👍 양호한 학습 진행을 보이고 있어요.";
      if (score >= 40) return "👀 조금 더 노력이 필요해 보입니다.";
      return "💪 기초 실력 향상에 집중이 필요합니다.";
    };

    // 업데이트 함수 (간소화)
    const updateMonitoring = async () => {
      // 실시간 접속 상태만 업데이트
      await fetchStudentStatus();
    };

    // 전체 데이터 로드
    const loadAllData = async () => {
      await Promise.all([
        fetchAssignments(),
        fetchExams(),
        fetchClassStats(),
        fetchStudentStatus(),
      ]);
    };

    // 주기적 업데이트
    let monitoringInterval;

    // 라이프사이클 훅
    onMounted(async () => {
      console.log("🚀 TeacherMain 컴포넌트 마운트 시작");

      // 초기 데이터 로드
      await loadAllData();

      // 3분마다 모니터링 데이터 업데이트
      monitoringInterval = setInterval(updateMonitoring, 3 * 60 * 1000);

      console.log("✅ TeacherMain 초기화 완료");
    });

    onUnmounted(() => {
      console.log("🔄 TeacherMain 컴포넌트 언마운트");
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    });

    return {
      // 데이터
      teacherInfo,
      notificationCount,
      chatCount,
      assignmentLoading,
      examLoading,
      classStatsLoading,
      assignments,
      exams,
      classStats,
      monitoring,

      // 계산된 속성
      assignmentStats,
      examStats,
      recentAssignments,
      recentExams,

      // 메서드 (제거됨: startTextbookLesson, startWorkbookLesson)

      // 새로운 네비게이션 메서드들
      goToAssignmentCreate,
      goToAssignmentList,
      goToAssignmentDetail,
      goToExamCreate,
      goToExamList,
      goToExamDetail,
      goToClassReport,

      // 헬퍼 메서드
      formatDate,
      getAssignmentStatusClass,
      getAssignmentStatusText,
      getExamStatusClass,
      getExamStatusText,
      getAchievementClass,
      getAchievementMessage,
    };
  },
};
</script>

<style scoped>
/* 전역 폰트 및 배경 설정 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}

.teacher-page {
  background: #fff9e6;
  min-height: 100vh;
}

.teacher-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 페이지 헤더 */
.page-header {
  background: linear-gradient(
    135deg,
    rgba(255, 148, 41, 0.8),
    rgba(255, 193, 7, 0.6)
  );
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 152, 0, 0.3);
}

.page-header::before {
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
  animation: sparkle 4s ease-in-out infinite;
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

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

.page-subtitle {
  font-size: 1.1rem;
  color: white;
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
}

.teacher-info {
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

/* 메인 컨테이너 */
.main-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* 카드 공통 스타일 */
.card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(255, 193, 7, 0.15);
  border: 3px solid #fff9c4;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(255, 193, 7, 0.25);
  border-color: #ffe082;
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

.btn-secondary {
  background: #fff5d6;
  color: #f57c00;
  border: 2px solid #ffe082;
  font-size: 0.9rem;
  padding: 0.6rem 1.2rem;
}

.btn-secondary:hover {
  background: #ffe082;
  transform: translateY(-2px);
}

.btn-small {
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
}

.btn-outline {
  background: white;
  color: #f57c00;
  border: 2px solid #ffe082;
}

.btn-outline:hover {
  background: #fff5d6;
  transform: translateY(-2px);
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 데이터 없음 상태 */
.no-data {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  border-radius: 15px;
  border: 2px solid #ffe082;
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.no-data-text h3,
.no-data-text h4 {
  color: #f57f17;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.no-data-text p {
  color: #ff8f00;
  font-size: 1rem;
  font-weight: 600;
}

/* 과제 카드 스타일 */
.assignment-content,
.evaluation-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.assignment-stats,
.evaluation-stats {
  display: flex;
  justify-content: space-around;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  border-radius: 15px;
  border: 2px solid #ffe082;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.3rem;
}

.stat-number.ongoing {
  color: #ff9800;
}

.stat-number.completed {
  color: #4caf50;
}

.stat-number.total {
  color: #2196f3;
}

.stat-number.average {
  color: #9c27b0;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

/* 최근 항목 리스트 */
.recent-assignments,
.recent-exams {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #e9ecef;
}

.recent-assignments h4,
.recent-exams h4 {
  color: #f57f17;
  margin-bottom: 1rem;
  font-weight: 700;
}

.assignment-list,
.exam-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assignment-item,
.exam-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.assignment-item:hover,
.exam-item:hover {
  border-color: #ffe082;
  transform: translateX(5px);
}

.assignment-title,
.exam-title {
  font-weight: 700;
  color: #333;
  font-size: 1rem;
}

.assignment-meta,
.exam-meta {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
  display: flex;
  gap: 0.5rem;
}

.assignment-status,
.exam-status {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.assignment-status.ongoing,
.exam-status.ongoing {
  background: #fff3e0;
  color: #ef6c00;
}

.assignment-status.completed,
.exam-status.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.card-actions {
  display: flex;
  justify-content: center;
}

/* 학급현황 요약 카드 */
.class-summary-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-overview {
  display: flex;
  justify-content: space-around;
  background: linear-gradient(135deg, #e3f2fd, #f0f8ff);
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #90caf9;
}

.overview-item {
  text-align: center;
}

.overview-number {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1976d2;
  margin-bottom: 0.3rem;
}

.overview-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.level-distribution {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #e9ecef;
}

.level-distribution h4 {
  color: #f57f17;
  margin-bottom: 1rem;
  font-weight: 700;
}

.level-stats {
  display: flex;
  justify-content: space-around;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 10px;
}

.level-item.fast {
  background: rgba(76, 175, 80, 0.1);
}

.level-item.normal {
  background: rgba(255, 152, 0, 0.1);
}

.level-item.slow {
  background: rgba(244, 67, 54, 0.1);
}

.level-icon {
  font-size: 1.2rem;
}

.level-count {
  font-size: 1.2rem;
  font-weight: 700;
}

.level-label {
  font-size: 0.8rem;
  color: #666;
}

.achievement-analysis {
  background: #fff5d6;
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #ffe082;
}

.achievement-analysis h4 {
  color: #f57f17;
  margin-bottom: 1rem;
  font-weight: 700;
}

.achievement-text {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
}

.achievement-text.achievement-excellent {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
}

.achievement-text.achievement-good {
  background: rgba(255, 152, 0, 0.1);
  color: #ef6c00;
}

.achievement-text.achievement-fair {
  background: rgba(255, 193, 7, 0.1);
  color: #f57c00;
}

.achievement-text.achievement-poor {
  background: rgba(244, 67, 54, 0.1);
  color: #c62828;
}

.achievement-score {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

/* 모니터링 카드 */
.monitoring-card {
  position: relative;
  z-index: 2;
}

.monitoring-stats {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0;
  background: linear-gradient(135deg, #e3f2fd, #f0f8ff);
  padding: 1.5rem;
  border-radius: 15px;
  border: 2px solid #90caf9;
}

.monitor-stat {
  text-align: center;
}

.monitor-number {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.3rem;
}

.monitor-number.total {
  color: #1976d2;
}

.monitor-number.online {
  color: #388e3c;
}

.monitor-number.offline {
  color: #f57c00;
}

.monitor-label {
  font-size: 0.9rem;
  color: #1976d2;
  font-weight: 600;
}

.last-update {
  text-align: center;
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
  background: #fff9c4;
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid #ffe082;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .teacher-container {
    padding: 1rem;
  }

  .main-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .card-header-with-button {
    flex-direction: column;
    align-items: flex-start;
  }

  .assignment-stats,
  .evaluation-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .summary-overview,
  .level-stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
