import { createRouter, createWebHistory } from "vue-router";
import StudentMain from "@/views/main/StudentMain.vue";
import TeacherMain from "@/views/main/TeacherMain.vue";
import LoginMain from "@/views/main/LoginMain.vue";
import Exam from "@/views/exam/Exam.vue";
import SubjectBoardList from "@/views/subjectboard/SubjectBoardList.vue";
import SubjectBoardWrite from "@/views/subjectboard/SubjectBoardWrite.vue";
import SubjectBoardDetail from "@/views/subjectboard/SubjectBoardDetail.vue";
import Report from "@/views/report/Report.vue";
import DigitalTextBook from "@/views/main/DigitalTextBook.vue";
import TeacherExam from "@/views/exam/TeacherExam.vue";
import TeacherExamCreate from "@/views/exam/TeacherExamCreate.vue";
import TeacherReport from "@/views/report/TeacherReport.vue";
import TeacherClassReport from "@/views/report/TeacherClassReport.vue";
import Classview from "@/views/class/Classview.vue";
import Classroom from "@/views/class/Classroom.vue";
// 보안 프로그램 설치/필요 페이지
import Install from "@/views/secureagent/Install.vue";
import AgentRequired from "@/views/secureagent/AgentRequired.vue";
// 보안 게이트 유틸
import { ensureAgent, startHeartbeat, bindActiveTabWatermark } from "@/utils/ensureAgent";

const routes = [
  { path: "/install", name: "SecureInstall", component: Install },
  { path: "/agent-required", name: "AgentRequired", component: AgentRequired },

  {
    path: "/",
    name: "Home",
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "student") next({ name: "StudentMain" });
      else if (userType === "teacher") next({ name: "TeacherMain" });
      else next({ name: "Login" });
    },
  },
  { path: "/student", name: "StudentMain", component: StudentMain,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "student" ? next() : next({ name: "Login" });
    },
  },
  { path: "/teacher", name: "TeacherMain", component: TeacherMain,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "teacher" ? next() : next({ name: "Login" });
    },
  },
  { path: "/exam", name: "Exam", component: Exam,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "student" ? next() : next({ name: "Login" });
    },
  },
  { path: "/teacher/exam", name: "TeacherExam", component: TeacherExam,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "teacher" ? next() : next({ name: "Login" });
    },
  },
  { path: "/teacher/exam/create", name: "TeacherExamCreate", component: TeacherExamCreate,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "teacher" ? next() : next({ name: "Login" });
    },
  },
  { path: "/report", name: "Report", component: Report,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "student" ? next() : next({ name: "Login" });
    },
  },
  { path: "/teacher/report", name: "TeacherReport", component: TeacherReport,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "teacher" ? next() : next({ name: "Login" });
    },
  },
  { path: "/teacher/class/report", name: "TeacherClassReport", component: TeacherClassReport,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "teacher" ? next() : next({ name: "Login" });
    },
  },
  { path: "/login", name: "Login", component: LoginMain,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "student") next({ name: "Textbook" });
      else if (userType === "teacher") next({ name: "Textbook" });
      else next();
    },
  },
  { path: "/logout", name: "Logout",
    beforeEnter: (to, from, next) => {
      localStorage.removeItem("userType");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      next({ name: "Login" });
    },
  },
  { path: "/textbook", name: "Textbook", component: DigitalTextBook,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      (userType === "student" || userType === "teacher") ? next() : next({ name: "Login" });
    },
  },
  { path: "/subjectboard/list", name: "SubjectBoardList", component: SubjectBoardList },
  { path: "/subjectboard/write", name: "SubjectBoardWrite", component: SubjectBoardWrite },
  { path: "/subjectboard/:id", name: "SubjectBoardDetail", component: SubjectBoardDetail },
  { path: "/classroom/view", component: Classview },
  { path: "/classroom", component: Classroom },
  { path: "/assignment", name: "Assignment",
    component: () => import("@/views/assignment/AssignmentList.vue"),
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      (userType === "student" || userType === "teacher") ? next() : next({ name: "Login" });
    },
  },
  { path: "/assignment/create", name: "AssignmentCreate",
    component: () => import("@/views/assignment/AssignmentCreate.vue"),
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "teacher" ? next() : next({ name: "Login" });
    },
  },
  { path: "/assignment/submit/:id", name: "AssignmentSubmission",
    component: () => import("@/views/assignment/AssignmentSubmission.vue"),
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "student" ? next() : next({ name: "Login" });
    },
  },
  { path: "/assignment/evaluation/:id", name: "AssignmentEvaluation",
    component: () => import("@/views/assignment/AssignmentEvaluation.vue"),
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      userType === "teacher" ? next() : next({ name: "Login" });
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 전역 가드
router.beforeEach(async (to, from, next) => {
  // 0) 사용자가 주소창에 직접 /download/agent를 입력한 케이스 처리
  if (to.path === '/download/agent') {
    const url = import.meta.env.DEV ? 'http://localhost:8080/download/agent' : '/download/agent'
    // 새 탭으로만 다운로드 열기
    setTimeout(() => window.open(url, '_blank', 'noopener'), 0)
    // 현재 탭은 설치 안내로 복귀 (목적지 유지)
    const prev = from.fullPath && from.fullPath !== to.fullPath ? from.fullPath : '/'
    return next({ path: '/install', query: { next: prev } })
  }

  // 1) 게이트 예외 경로
  if (
    to.path.startsWith('/install') ||
    to.path.startsWith('/agent-required') ||
    to.path.startsWith('/login') ||
    to.path.startsWith('/logout')
  ) {
    return next()
  }

  // 2) 보안 에이전트 확인
  const ok = await ensureAgent()
  if (!ok) return next({ path: '/install', query: { next: to.fullPath } })

  startHeartbeat()
  bindActiveTabWatermark()
  next()
})

export default router
