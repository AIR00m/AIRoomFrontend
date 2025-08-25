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
// forensic 페이지
import ForensicDecoder from "@/views/secureagent/ForensicDecoder.vue";
// 보안 게이트 유틸
import { 
  ensureAgent, 
  startHeartbeat, 
  bindActiveTabWatermark, 
  bindAgentSession, 
  postWatermarkActiveOnce, 
  airoomBypassed, 
  setNavigator, 
  stripNestedNext, 
  installFetch406Redirector,    
} from "@/utils/ensureAgent";

const routes = [
  { path: "/install", name: "SecureInstall", component: Install },
  { path: "/agent-required", name: "AgentRequired", component: AgentRequired },
  { path: "/forensic", name: "ForensicDecoder", component: ForensicDecoder },

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
      localStorage.removeItem("memberId");
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
  { path: "/subjectboard/write/:id?", name: "SubjectBoardWrite", component: SubjectBoardWrite },
  { path: "/subjectboard/:id", name: "SubjectBoardDetail", component: SubjectBoardDetail },
  { path: "/classroom/view/:unitNo", component: Classview },
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
  { path: "/assignment/student/:id", name: "AssignmentDetail",
    component: () => import("@/views/assignment/AssignmentDetail.vue"),
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
// 전역 406 → /agent-required 리다이렉트 가드
installFetch406Redirector(router);

// ensureAgent.js 가 내부 내비게이션에 router.replace 사용 가능하도록 (SPA 내비게이션을 사용할 수 있게 주입)
setNavigator((path) => router.replace(path));

// 전역 가드
router.beforeEach(async (to, from) => {
  // 1) 개발/스테이징 우회
  if (airoomBypassed()) return;

  // 2) 주소창 직접 /download/agent
  if (to.path === '/download/agent') {
    const url = import.meta.env.DEV
      ? 'http://localhost:8080/download/agent'
      : 'http://43.200.2.244:8080/download/agent';
    setTimeout(() => window.open(url, '_blank', 'noopener'), 0);
    const prev = (from.fullPath && from.fullPath !== to.fullPath)
      ? stripNestedNext(from.fullPath)
      : '/';
    return { path: '/install', query: { next: prev } };
  }

  // 3) /agent-required?install=1 → /install 로 스무스 이동
  const installQ = to.query.install;
  const isInstall1 = Array.isArray(installQ) ? installQ[0] === '1' : installQ === '1';
  if (to.path === '/agent-required' && isInstall1) {
    const raw = (to.query.next ?? from.fullPath ?? '/');
    const target = stripNestedNext(raw);
    return { path: '/install', query: { next: target } };
  }

  // 4) 게이트 예외 경로
  if (
    to.path.startsWith('/install') ||
    to.path.startsWith('/agent-required') ||
    to.path.startsWith('/login') ||
    to.path.startsWith('/logout') ||
    to.path.startsWith('/forensic')
  ) {
    return; // 통과
  }

  // 5) 보안 에이전트 확인
  const ok = await ensureAgent();
  if (!ok) {
    return { path: '/install', query: { next: stripNestedNext(to.fullPath) } };
  }

  // 6) 1회 바인드 + 온라인 전환시 재바인드
  try {
    const memberId = localStorage.getItem('memberId');
    const jwt = localStorage.getItem('authToken') || null;

    if (memberId) {
      const key = 'airoom:lastBound';
      const last = JSON.parse(sessionStorage.getItem(key) || '{}');
      const port = parseInt(localStorage.getItem('agentPort') || '4455', 10);
      const fresh = !(last.memberId === memberId && last.port === port && Date.now() - (last.ts || 0) < 60_000);

      if (fresh) {
        const okBind = await bindAgentSession(memberId, jwt);
        if (okBind) {
          sessionStorage.setItem(key, JSON.stringify({ memberId, port, ts: Date.now() }));
        }
      }
    }

    startHeartbeat({
      onAgentOnline: async () => {
        try {
          const memberId2 = localStorage.getItem('memberId');
          const jwt2 = localStorage.getItem('authToken') || null;
          if (memberId2) {
            const okBind2 = await bindAgentSession(memberId2, jwt2);
            if (okBind2) {
              const port2 = parseInt(localStorage.getItem('agentPort') || '4455', 10);
              sessionStorage.setItem('airoom:lastBound', JSON.stringify({ memberId: memberId2, port: port2, ts: Date.now() }));
            }
          }
          // 직후 활성 탭 상태 1회 전송
          await postWatermarkActiveOnce(!document.hidden);
        } catch {}
      }
    });

    // 활성 탭 신호 유지
    bindActiveTabWatermark();
  } catch {}

  // 7) 통과
  return;
});


export default router
