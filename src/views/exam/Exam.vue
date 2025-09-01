<template>
  <!-- 헤더 -->
  <header class="header">
    <Header></Header>
  </header>
  <div class="exam-page">
    <div class="exam-container">
      <!-- 페이지 헤더 -->
      <header class="page-header">
        <h1 class="page-title">
          {{
            userRole === "TEACHER" ? "우리 반 평가 📚" : "나의 평가 도전기 🎯"
          }}
        </h1>
        <p class="page-subtitle">학습 내용을 점검하고 실력을 키워보세요!</p>
        <div class="cute-breadcrumb">
          <span>🏠 홈</span>
          <span class="separator">></span>
          <span class="current">평가</span>
        </div>
      </header>

      <!-- 로딩 오버레이 -->
      <Spinner
        :is-loading="isLoading"
        v-if="isLoading"
        class="loading-state"
        :loading-text="'평가 목록을 불러오는 중...'"
      />

      <!-- 에러 상태 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">😕</div>
        <h3 class="error-title">평가 목록을 불러올 수 없습니다</h3>
        <p class="error-description">{{ error }}</p>
        <button @click="fetchExamList" class="retry-btn">🔄 다시 시도</button>
      </div>

      <template v-else>
        <!-- 안내 상자 -->
        <div class="notice-box">
          <div class="notice-icon">💡</div>
          <div>
            <ul class="notice-list">
              <li>
                각 단원의 학습을 완료한 후 퀴즈와 평가를 통해 실력을
                확인해보세요!
              </li>
              <li>평가 중간에 나가면 자동으로 저장되지 않으니 주의하세요!</li>
              <li>모든 문제를 풀고 제출 버튼을 눌러야 점수가 기록돼요!</li>
            </ul>
          </div>
        </div>

        <!-- 평가 탭 -->
        <div class="exam-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="switchTab(tab.key)"
            :class="['tab-button', { active: currentTab === tab.key }]"
          >
            {{ tab.emoji }} {{ tab.label }}
            <span class="tab-count">{{ getTabCount(tab.key) }}</span>
          </button>
        </div>

        <!-- 필터 섹션 -->
        <div class="filter-section">
          <div class="filter-info">
            <div class="total-count">
              총 <span class="count-number">{{ filteredExams.length }}</span
              >개의 평가가
              {{
                userRole === "TEACHER" ? "있어요! 📊" : "기다리고 있어요! 🎉"
              }}
            </div>
            <button
              v-if="userInfo.isTeacher"
              class="btn-add-exam"
              @click="openExamCreationModal"
            >
              ➕ 평가 추가
            </button>
          </div>

          <div class="filter-controls">
            <div class="filter-group">
              <label class="filter-label">📚 단원 선택</label>
              <select v-model="filters.unit" class="filter-select">
                <option value="all">전체 단원</option>
                <option
                  v-for="unit in availableUnits"
                  :key="unit"
                  :value="unit"
                >
                  {{ unit }}
                </option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">📋 평가 유형</label>
              <select v-model="filters.type" class="filter-select">
                <option value="all">전체</option>
                <option value="lesson">퀴즈</option>
                <option value="unit">단원 평가</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 시험 목록 -->
        <div v-if="paginatedExams.length > 0" class="evaluation-grid">
          <div
            v-for="exam in paginatedExams"
            :key="exam.id"
            class="evaluation-card"
          >
            <!-- 카드 헤더 -->
            <div class="card-header">
              <div class="evaluation-badges">
                <span :class="['evaluation-type', getTypeClass(exam.type)]">
                  {{ getTypeEmoji(exam.type) }} {{ getTypeText(exam.type) }}
                </span>
                <span :class="['status-badge', getStatusClass(exam.status)]">
                  {{ getStatusEmoji(exam.status) }}
                  {{ getStatusText(exam.status) }}
                </span>
              </div>
            </div>

            <!-- 카드 바디 -->
            <div class="card-body">
              <h3 class="evaluation-title">{{ exam.title }}</h3>
              <p class="evaluation-unit">📖 {{ exam.unit }}</p>

              <div class="evaluation-info">
                <div class="info-item period-info">
                  <span>📅 시작:</span>
                  <span>{{ exam.startDate }}</span>
                </div>
                <div class="info-item period-info">
                  <span>🕐 종료:</span>
                  <span>{{ exam.endDate }}</span>
                </div>
                <div class="info-item">
                  <span>❓</span>
                  <span>{{ exam.problemCount }}문제</span>
                </div>
                <div
                  v-if="exam.score !== undefined && exam.score !== null"
                  class="info-item"
                >
                  <span>⭐</span>
                  <span>{{ exam.score }}점</span>
                </div>
              </div>
            </div>

            <!-- 카드 푸터 -->
            <div class="card-footer">
              <button
                v-if="showResultButton(exam)"
                class="action-btn btn-report"
                @click="viewExamReport(exam.id)"
              >
                👀 결과 보기
              </button>
              <button
                v-else-if="!showResultButton(exam)"
                @click="startExam(exam.id)"
                class="action-btn btn-start"
                :disabled="!canStartExam(exam)"
                :title="
                  canStartExam(exam)
                    ? '시험 시작하기'
                    : getExamPeriodStatus(exam)
                "
              >
                <template v-if="canStartExam(exam)"> 🚀 평가 시작 </template>
                <template v-else>
                  {{ getExamPeriodStatus(exam) }}
                </template>
              </button>
            </div>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-else class="empty-state">
          <div class="empty-icon">📚</div>
          <h3 class="empty-title">평가가 없어요</h3>
          <p class="empty-description">
            {{
              userInfo.isTeacher
                ? "평가를 출제해보세요!"
                : "진행 중인 평가나 완료된 평가가 없어요"
            }}
          </p>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="pagination">
          <i
            class="page-btn bi bi-chevron-double-left"
            @click="changePage(1)"
            :disabled="currentPage === 1"
            title="맨 처음으로"
          ></i>
          <i
            class="page-btn bi bi-chevron-left"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            title="이전 페이지"
          ></i>
          <div class="page-numbers">
            <button
              v-for="page in pageNumbers"
              :key="page"
              :class="['page-number', { active: page === currentPage }]"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          <i
            class="page-btn bi bi-chevron-right"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            title="다음 페이지"
          ></i>
          <i
            class="page-btn bi bi-chevron-double-right"
            @click="changePage(totalPages)"
            :disabled="currentPage === totalPages"
            title="맨 마지막으로"
          ></i>
        </div>
      </template>
    </div>
  </div>
  <!-- footer -->
  <footer class="footer">
    <Footer></Footer>
  </footer>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Header from "@/components/common/Header.vue";
import Footer from "@/components/common/Footer.vue";
import Spinner from "@/components/common/Spinner.vue";
import apiClient from "@/utils/apiClient";

export default {
  name: "Exam",
  components: { Header, Footer, Spinner },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    // API 함수들을 Vue 파일 내부에 직접 정의
    const ExamStatus = {
      ALL: "ALL",
      INCOMPLETE: "INCOMPLETE", // 진행중
      COMPLETE: "COMPLETE", // 완료
    };

    const MemberRole = {
      TEACHER: "TEACHER",
      STUDENT: "STUDENT",
    };

    // 시험 목록 조회 API
    const getExamList = async (classroomMemberNo, examStatus, memberRole) => {
      try {
        console.log("시험 목록 조회 요청:", {
          classroomMemberNo,
          examStatus,
          memberRole,
        });

        const response = await apiClient.get(
          `/exam/${classroomMemberNo}?examStatus=${examStatus}&memberRole=${memberRole}`
        );

        console.log("시험 목록 조회 성공:", {
          count: response.length,
          rawData: response,
        });

        return {
          success: true,
          data: response,
        };
      } catch (error) {
        console.error("🚨 시험 목록 조회 실패:", error.message);
        return {
          success: false,
          error: {
            message: error.message || "시험 목록을 불러오는데 실패했습니다.",
            status: error.status,
          },
        };
      }
    };

    // 시험 상세 정보 및 문제 조회 API
    const getExamDetail = async (examNo) => {
      try {
        console.log("시험 상세 조회 요청:", { examNo });

        const response = await apiClient.get(`/exam/exam-problems/${examNo}`);

        console.log("시험 상세 조회 성공:", {
          examName: response.examName,
          problemCount: response.examProblemDetailResponseList?.length || 0,
        });

        return {
          success: true,
          data: response,
        };
      } catch (error) {
        console.error("🚨 시험 상세 조회 실패:", error.message);
        return {
          success: false,
          error: {
            message: error.message || "시험 정보를 불러오는데 실패했습니다.",
            status: error.status,
          },
        };
      }
    };

    const mapExamStatus = (backendStatus) => {
      switch (backendStatus) {
        case "진행": // 백엔드의 INCOMPLETE = 진행중
          return "incomplete";
        case "완료": // 백엔드의 COMPLETE = 완료
          return "complete";
        case "전체":
          return "all";
        default:
          return "all";
      }
    };

    const showResultButton = (exam) => {
      if (userInfo.value.isStudent) {
        // 학생: 본인이 완료했으면 결과 보기
        return exam.seIsDone;
      } else if (userInfo.value.isTeacher) {
        // 교사: 모든 학생이 제출했을 때만 결과 보기
        const allStudentsCompleted =
          exam.applicantsCount === exam.applicantsTotalCount;

        const isExamEnded = exam.examStatus === "완료"; // 시험 기간 종료

        console.log(`시험 ${exam.id} 결과보기 조건:`, {
          allStudentsCompleted,
          isExamEnded,
          applicantsCount: exam.applicantsCount,
          applicantsTotalCount: exam.applicantsTotalCount,
          examStatus: exam.examStatus,
        });

        return allStudentsCompleted || isExamEnded;
      }

      return false;
    };

    // 날짜 형식 변환
    const formatDate = (dateString) => {
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
        console.error("날짜 변환 오류:", error, dateString);
        return "시간 오류";
      }
    };

    // 백엔드 시험 목록 응답을 프론트엔드 형식으로 변환
    const transformExamListResponse = (backendData) => {
      if (!Array.isArray(backendData)) {
        console.warn("백엔드 데이터가 배열이 아닙니다:", backendData);
        return [];
      }

      return backendData.map((exam) => {
        console.log("변환 중인 시험 데이터:", exam);

        // 단원 정보 처리 - unitResponseList에서 단원명들 추출
        let unitNames = "전체 단원";
        if (exam.unitResponseList && Array.isArray(exam.unitResponseList)) {
          const unitTitles = exam.unitResponseList
            .map((unit) => unit.unitTitle)
            .filter((title) => title);

          if (unitTitles.length > 0) {
            unitNames =
              unitTitles.length > 2
                ? `${unitTitles[0]} 외 ${unitTitles.length - 1}개 단원`
                : unitTitles.join(", ");
          }
        }

        // 시간 필드 처리 - 여러 가능성 확인
        const startTime =
          exam.examStartTime || exam.exam_start_time || exam.startTime;
        const endTime = exam.examEndTime || exam.exam_end_time || exam.endTime;

        // 탭 분류는 examStatus 기준으로 (시험 기간 상태)
        const tabStatus = mapExamStatus(exam.examStatus);

        return {
          id: exam.examNo,
          title: exam.examName,
          type: "unit", // 기본값
          unit: unitNames,
          status: tabStatus,
          startTime: startTime,
          endTime: endTime,
          problemCount: exam.examProblemCount,
          score: exam.avgExamScore, // 평균 점수 또는 개인 점수
          startDate: formatDate(startTime),
          endDate: formatDate(endTime),
          seIsDone: exam.seIsDone, // 학생 완료 여부 추가
          examStatus: exam.examStatus, // 시험 기간 상태 (원본)
        };
      });
    };

    // 반응형 상태
    const isLoading = ref(false);
    const error = ref(null);
    const examList = ref([]);
    const rawExamData = ref([]); // 원본 백엔드 데이터 저장용
    const currentTab = ref("all");
    const currentPage = ref(1);
    const itemsPerPage = 6;

    // 필터 상태
    const filters = ref({
      unit: "all",
      type: "all",
    });

    // 탭 정의
    const tabs = [
      { key: "all", label: "전체", emoji: "📋" },
      { key: "incomplete", label: "진행중", emoji: "🔄" }, // incomplete = 진행중
      { key: "complete", label: "완료", emoji: "✅" }, // complete = 완료
    ];

    // 사용자 정보 가져오기
    const getUserInfo = () => {
      try {
        const tokenInfo = JSON.parse(localStorage.getItem("tokenInfo") || "{}");
        const userType = localStorage.getItem("userType") || "";

        return {
          tokenInfo,
          userType,
          isStudent: userType === "student",
          isTeacher: userType === "teacher",
        };
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
        return {
          tokenInfo: {},
          userType: "",
          isStudent: false,
          isTeacher: false,
        };
      }
    };

    const userInfo = computed(() => getUserInfo());

    // 클래스룸 멤버 번호 계산
    const classroomMemberNo = computed(() => {
      const info = userInfo.value;

      if (!info.tokenInfo || Object.keys(info.tokenInfo).length === 0) {
        console.warn("토큰 정보를 찾을 수 없습니다.");
        return null;
      }

      const memberNo = info.isStudent
        ? info.tokenInfo.classRoomStudentNo
        : info.tokenInfo.classroomTeacherNo;

      console.log("클래스룸 멤버 번호:", memberNo, "역할:", info.userType);
      return memberNo;
    });

    // 멤버 역할
    const memberRole = computed(() => {
      const info = userInfo.value;
      return info.isStudent ? MemberRole.STUDENT : MemberRole.TEACHER;
    });

    // 사용 가능한 단원 목록 (unitResponseList에서 추출)
    const availableUnits = computed(() => {
      const allUnits = [];

      examList.value.forEach((exam) => {
        // 원본 데이터에서 unitResponseList 찾기
        const rawExam = examList.value.find((e) => e.id === exam.id);
        if (
          rawExam &&
          rawExam.unitResponseList &&
          Array.isArray(rawExam.unitResponseList)
        ) {
          rawExam.unitResponseList.forEach((unit) => {
            if (unit.unitTitle && !allUnits.includes(unit.unitTitle)) {
              allUnits.push(unit.unitTitle);
            }
          });
        }
      });

      console.log("추출된 단원 목록:", allUnits);
      return allUnits;
    });

    // 탭별 개수 계산
    const getTabCount = (tabKey) => {
      if (tabKey === "all") {
        return filteredExamsByTab.value.length;
      }
      return filteredExamsByTab.value.filter((exam) => exam.status === tabKey)
        .length;
    };

    // 탭에 따라 필터링된 시험 목록
    const filteredExamsByTab = computed(() => {
      let filtered = examList.value;

      // 탭 필터
      if (currentTab.value !== "all") {
        filtered = filtered.filter((exam) => exam.status === currentTab.value);
      }

      return filtered;
    });

    // 모든 필터가 적용된 시험 목록
    const filteredExams = computed(() => {
      let filtered = filteredExamsByTab.value;

      // 단원 필터
      if (filters.value.unit !== "all") {
        filtered = filtered.filter((exam) => exam.unit === filters.value.unit);
      }

      // 유형 필터
      if (filters.value.type !== "all") {
        filtered = filtered.filter((exam) => exam.type === filters.value.type);
      }

      return filtered;
    });

    // 페이지네이션 적용된 시험 목록
    const paginatedExams = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredExams.value.slice(start, end);
    });

    // 총 페이지 수
    const totalPages = computed(() => {
      return Math.ceil(filteredExams.value.length / itemsPerPage);
    });

    // 페이지 번호 배열
    const pageNumbers = computed(() => {
      const total = totalPages.value;
      const current = currentPage.value;
      const pages = [];

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push("...", total);
        } else if (current >= total - 3) {
          pages.push(1, "...");
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          pages.push(1, "...");
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push("...", total);
        }
      }

      return pages;
    });

    // API 호출 함수들
    const fetchExamList = async () => {
      // localStorage에서 직접 인증 상태 확인
      const accessToken = localStorage.getItem("authToken");
      const tokenInfo = localStorage.getItem("tokenInfo");

      if (!accessToken || !tokenInfo) {
        error.value = "로그인이 필요합니다.";
        return;
      }

      if (!classroomMemberNo.value || !memberRole.value) {
        error.value = "사용자 인증 정보를 찾을 수 없습니다.";
        console.error(
          "클래스룸 멤버 번호:",
          classroomMemberNo.value,
          "멤버 역할:",
          memberRole.value
        );
        return;
      }

      try {
        isLoading.value = true;
        error.value = null;

        console.log("📋 시험 목록 조회 시작:", {
          classroomMemberNo: classroomMemberNo.value,
          memberRole: memberRole.value,
          userType: userInfo.value.userType,
        });

        // 모든 시험 목록 가져오기
        const result = await getExamList(
          classroomMemberNo.value,
          ExamStatus.ALL,
          memberRole.value
        );

        if (result.success) {
          // 원본 데이터 저장
          rawExamData.value = result.data;

          // 백엔드 응답을 프론트엔드 형식으로 변환
          examList.value = transformExamListResponse(result.data);

          // 최신 생성된 평가가 먼저 나오도록 examNo 기준 내림차순 정렬
          examList.value.sort((a, b) => b.id - a.id);

          console.log("✅ 시험 목록 조회 성공:", examList.value.length, "개");
          // console.log("정렬된 데이터:", examList.value);
          // console.log("원본 데이터:", rawExamData.value);
        } else {
          throw new Error(result.error.message);
        }
      } catch (err) {
        console.error("시험 목록 조회 실패:", err);
        error.value = err.message || "시험 목록을 불러오는데 실패했습니다.";
      } finally {
        isLoading.value = false;
      }
    };

    // 메서드들
    const switchTab = (tabKey) => {
      currentTab.value = tabKey;
      currentPage.value = 1;
    };

    const changePage = (page) => {
      if (page !== "..." && page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    // 시험 시작 가능 여부 확인
    const canStartExam = (exam) => {
      if (!exam.startTime || !exam.endTime) {
        console.log("시험 시간 정보가 없습니다:", exam);
        return true; // 시간 정보가 없으면 시작 불가능이지만 임시조치
      }
      if (exam.seIsDone) {
        return false;
      }

      // 시험 기간이 완료된 경우 시작 불가
      if (exam.examStatus === "완료") {
        return false;
      }

      const now = new Date();
      const startTime = new Date(exam.startTime);
      const endTime = new Date(exam.endTime);

      console.log("시험 시작 가능 여부 확인:", {
        examTitle: exam.title,
        현재시간: now.toLocaleString(),
        시험시작: startTime.toLocaleString(),
        시험종료: endTime.toLocaleString(),
        시작가능: now >= startTime && now <= endTime,
      });

      return now >= startTime && now <= endTime;
    };

    // 시험 기간 상태 텍스트 반환
    const getExamPeriodStatus = (exam) => {
      if (!exam.startTime || !exam.endTime) {
        return "시간 미정";
      }

      const now = new Date();
      const startTime = new Date(exam.startTime);
      const endTime = new Date(exam.endTime);

      if (now < startTime) {
        return "시험 예정";
      } else if (now > endTime) {
        return "시험 종료";
      } else {
        return "시험 중";
      }
    };

    // 시험 기간 상태 클래스 반환
    const getExamPeriodClass = (exam) => {
      if (!exam.startTime || !exam.endTime) {
        return "period-unknown";
      }

      const now = new Date();
      const startTime = new Date(exam.startTime);
      const endTime = new Date(exam.endTime);

      if (now < startTime) {
        return "period-upcoming";
      } else if (now > endTime) {
        return "period-ended";
      } else {
        return "period-active";
      }
    };

    // 시험 시작
    const startExam = async (examId) => {
      const exam = examList.value.find((e) => e.id === examId);

      if (!exam) {
        alert("시험 정보를 찾을 수 없습니다!");
        return;
      }

      if (!canStartExam(exam)) {
        const now = new Date();
        const startTime = new Date(exam.startTime);
        const endTime = new Date(exam.endTime);

        if (now < startTime) {
          alert(
            `⏰ 시험이 아직 시작되지 않았습니다!\n시작 시간: ${startTime.toLocaleString()}`
          );
        } else if (now > endTime) {
          alert(
            `⏰ 시험 시간이 종료되었습니다!\n종료 시간: ${endTime.toLocaleString()}`
          );
        }
        return;
      }

      try {
        // 시험 상세 정보 조회
        const result = await getExamDetail(examId);

        if (result.success) {
          // 새 창으로 시험 페이지 열기
          const examUrl = `/ExamProblem/${examId}`;
          window.open(
            examUrl,
            "_blank",
            "width=1500,height=1500,scrollbars=yes,resizable=yes"
          );
        } else {
          throw new Error(result.error.message);
        }
      } catch (err) {
        console.error("시험 시작 실패:", err);
        alert("시험을 시작할 수 없습니다: " + err.message);
      }
    };

    // 시험 결과 보기
    const viewExamReport = (examNo) => {
      try {
        const info = userInfo.value;
        const memberNo = info.isStudent
          ? info.tokenInfo.classRoomStudentNo
          : info.tokenInfo.classroomTeacherNo;

        if (memberNo) {
          if (info.tokenInfo.role === "teacher") {
            // 선생님인 경우 새 창에서 열기
            const reportUrl = `/teacher/exam/report/${memberNo}/${examNo}`;
            window.open(reportUrl, "_blank", "width=1400,height=900");
          } else {
            const reportUrl = `/exam/report/${memberNo}/${examNo}`;
            window.open(reportUrl, "_blank", "width=1400,height=900");
          }
        } else {
          // 데이터가 없는 경우 상세 안내
          console.warn("⚠️ 저장된 리포트 데이터 없음");
          alert("평가 리포트 데이터를 찾을 수 없습니다.");
        }
      } catch (err) {
        console.error("🚨 평가 리포트 로드 오류:", err);
        alert(
          "평가 리포트를 불러오는 중 오류가 발생했습니다.\n데이터가 손상되었거나 호환되지 않는 형식일 수 있습니다."
        );
      }
    };

    // 스타일 헬퍼 함수들
    const getTypeClass = (type) => {
      return type === "lesson" ? "type-lesson" : "type-unit";
    };

    const getTypeText = (type) => {
      return type === "lesson" ? "퀴즈" : "단원 평가";
    };

    const getTypeEmoji = (type) => {
      return type === "lesson" ? "📝" : "📚";
    };

    const getStatusClass = (status) => {
      switch (status) {
        case "incomplete":
        case "진행":
          return "status-incomplete";
        case "완료":
        case "complete":
          return "status-complete";
        case "전체":
        case "all":
          return "status-all";
        default:
          return "status-incomplete";
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case "incomplete":
          return "진행중";
        case "complete":
          return "완료";
        case "all":
          return "전체";
        default:
          return "전체";
      }
    };

    const getStatusEmoji = (status) => {
      switch (status) {
        case "incomplete":
          return "🔄";
        case "complete":
          return "✅";
        default:
          return "🔄";
      }
    };

    const openExamCreationModal = () => {
      router.push({ name: "TeacherExamCreate" });
    };

    // 필터 변경 시 페이지 리셋
    watch(
      [filters],
      () => {
        currentPage.value = 1;
      },
      { deep: true }
    );

    // 컴포넌트 마운트 시 데이터 로드
    onMounted(async () => {
      // localStorage에서 직접 인증 상태 확인
      const accessToken = localStorage.getItem("authToken");
      const tokenInfo = localStorage.getItem("tokenInfo");

      if (!accessToken || !tokenInfo) {
        error.value = "로그인이 필요합니다.";
        console.warn("인증 토큰이나 토큰 정보가 없습니다.");
        return;
      }

      console.log("🔍 Exam.vue 마운트 - 사용자 정보:", userInfo.value);

      await fetchExamList();
    });

    return {
      // 상태
      isLoading,
      error,
      examList,
      currentTab,
      currentPage,
      tabs,
      filters,
      availableUnits,

      // 계산된 속성
      filteredExams,
      paginatedExams,
      totalPages,
      pageNumbers,
      userInfo,

      // 메서드
      fetchExamList,
      switchTab,
      changePage,
      getTabCount,
      canStartExam,
      startExam,
      viewExamReport,
      // 스타일 및 상태 헬퍼 함수들
      getTypeClass,
      getTypeText,
      getTypeEmoji,
      getStatusClass,
      getStatusText,
      getStatusEmoji,
      getExamPeriodStatus,
      getExamPeriodClass,
      openExamCreationModal,
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

.exam-page {
  background: #fff9e6;
  padding: 2rem;
  min-height: 100vh;
}

.exam-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  background: white;
  border: 2px solid #ffe066;
  color: #ff9800;
  padding: 0.5rem 0.75rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  min-width: 40px;
}

.page-number.active {
  background: #ffdd29;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.page-number:hover:not(.active) {
  background: #fff5d6;
  transform: translateY(-1px);
}

/* 페이지 헤더 */
.page-header {
  background: linear-gradient(
    135deg,
    rgba(255, 148, 41, 0.5),
    rgba(239, 1, 1, 0.3)
  );
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 221, 41, 0.2);
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: white;
  margin: 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: white;
  margin-top: 0.5rem;
}

.cute-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: white;
  margin-top: 0.5rem;
}

.separator {
  margin: 0 0.25rem;
}

.current {
  font-weight: 700;
  color: white;
}

/* 로딩/에러 상태 */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fffbf0;
  border-radius: 20px;
  border: 2px solid #ffe066;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s ease-in-out infinite;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 0.5rem;
}

.error-description {
  font-size: 1rem;
  color: #ffb74d;
  margin: 0 0 1rem;
}

.retry-btn {
  background: #ffdd29;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
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
  font-weight: 600;
}

.notice-icon {
  font-size: 1.5rem;
}

.notice-list {
  list-style: "• ";
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 평가 탭 */
.exam-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  margin-bottom: 2.5rem;
  background: #fff5d6;
  border-radius: 20px;
  border: 2px solid #ffe066;
}

.tab-button {
  flex: 1;
  padding: 12px 20px;
  border: 0;
  border-radius: 15px;
  background: none;
  color: #ff9800;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.tab-button:hover:not(.active) {
  background: rgba(255, 221, 41, 0.3);
}

.tab-button.active {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  transform: translateY(-2px);
}

.tab-count {
  margin-left: 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 0.8em;
}

.tab-button.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
}

/* 필터 섹션 */
.filter-section {
  background: #fffbf0;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid #ffe066;
}

.filter-info {
  margin-bottom: 1.5rem;
}

.total-count {
  font-size: 1.2rem;
  color: #ff9800;
  font-weight: 700;
  text-align: center;
}

.count-number {
  color: #ffdd29;
  font-size: 1.4rem;
  text-shadow: 2px 2px 4px rgba(255, 221, 41, 0.2);
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 700;
  color: #ff9800;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #ffe066;
  border-radius: 15px;
  background: white;
  color: #ff9800;
  font-weight: 600;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #ffdd29;
  box-shadow: 0 0 0 3px rgba(255, 221, 41, 0.2);
}

/* 평가 그리드 */
.evaluation-grid {
  display: grid;
  background-color: #fffbf0;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 1.5rem;
}

/* 평가 카드 */
.evaluation-card {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  overflow: hidden;
}

.evaluation-card:hover {
  border-color: #ffdd29;
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.2);
}

.card-header {
  background-color: white;
  padding: 1rem 1.25rem;
  border-bottom: 2px solid #fff5d6;
}

.evaluation-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.evaluation-type {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.type-lesson {
  background: #e3f2fd;
  color: #1565c0;
}

.type-unit {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
}

.status-incomplete {
  background: #e3f2fd;
  color: #1976d2;
}

.status-complete {
  background: #e8f5e8;
  color: #388e3c;
}

.card-body {
  background-color: white;
  padding: 1.25rem;
  flex-grow: 1;
}

.evaluation-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #8c6d32;
  margin: 0 0 0.75rem;
  line-height: 1.4;
}

.evaluation-unit {
  color: #ffb74d;
  margin: 0 0 1rem;
  font-weight: 600;
}

.evaluation-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex-direction: column;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
}

.period-info {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  border-left: 3px solid #ffdd29;
}

.card-footer {
  padding: 0.75rem 1.25rem;
  background: whitesmoke;
}

.action-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: #95a5a6 !important;
  border-color: #7f8c8d !important;
}

.action-btn:disabled:hover {
  transform: none;
  box-shadow: none;
  background: #95a5a6 !important;
}

.btn-start {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
}

.btn-start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.4);
}

.btn-report {
  background: #a855f7;
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.btn-report:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
}

/* 시험 기간 상태 */
.period-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
}

.period-upcoming {
  background: #fff3cd;
  color: #856404;
}

.period-active {
  background: #d1ecf1;
  color: #0c5460;
  animation: pulse 2s ease-in-out infinite alternate;
}

.period-ended {
  background: #f8d7da;
  color: #721c24;
}

.period-unknown {
  background: #e2e6ea;
  color: #6c757d;
}

@keyframes pulse {
  from {
    background: #d1ecf1;
  }
  to {
    background: #bee5eb;
  }
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #fffbf0;
  border-radius: 20px;
  border: 2px solid #ffe066;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s ease-in-out infinite;
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

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 0.5rem;
}

.empty-description {
  font-size: 1rem;
  color: #ffb74d;
  margin: 0;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.page-btn {
  background: white;
  border: 2px solid #ffe066;
  color: #ff9800;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.page-btn:hover:not(:disabled):not(.active) {
  background: #ffe066;
  color: white;
}

.page-btn.active {
  background: #ffdd29;
  color: white;
  border-color: #ffdd29;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-add-exam {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.btn-add-exam {
  background: #ffdd29;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-add-exam:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}
</style>
