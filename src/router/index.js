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

const routes = [
  {
    path: "/",
    name: "Home",
    beforeEnter: (to, from, next) => {
      // localStorage에서 사용자 유형 확인
      const userType = localStorage.getItem("userType");
      if (userType === "student") {
        next({ name: "StudentMain" });
      } else if (userType === "teacher") {
        next({ name: "TeacherMain" });
      } else {
        // 로그인 안됐거나 타입 모르면 로그인 페이지로
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/student",
    name: "StudentMain",
    component: StudentMain,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "student") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/teacher",
    name: "TeacherMain",
    component: TeacherMain,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "teacher") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/exam",
    name: "Exam",
    component: Exam,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "student") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/teacher/exam",
    name: "TeacherExam",
    component: TeacherExam,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "teacher") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/teacher/exam/create",
    name: "TeacherExamCreate",
    component: TeacherExamCreate,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "teacher") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/report",
    name: "Report",
    component: Report,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "student") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/teacher/report",
    name: "TeacherReport",
    component: TeacherReport,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "teacher") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/teacher/class/report",
    name: "TeacherClassReport",
    component: TeacherClassReport,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "teacher") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/login",
    name: "Login",
    component: LoginMain,
    beforeEnter: (to, from, next) => {
      // 이미 로그인되어 있다면 해당 페이지로 리다이렉트
      const userType = localStorage.getItem("userType");
      if (userType === "student") {
        next({ name: "Textbook" });
      } else if (userType === "teacher") {
        next({ name: "Textbook" });
      } else {
        next();
      }
    },
  },
  {
    path: "/logout",
    name: "Logout",
    beforeEnter: (to, from, next) => {
      // 로그아웃 처리
      localStorage.removeItem("userType");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      next({ name: "Login" });
    },
  },
  {
    path: "/textbook",
    name: "Textbook",
    component: DigitalTextBook,
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "student") {
        next();
      } else if (userType === "teacher") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },

  {
    path: "/subjectboard/list",
    name: "SubjectBoardList",
    component: SubjectBoardList,
  },
  {
    path: "/subjectboard/write",
    name: "SubjectBoardWrite",
    component: SubjectBoardWrite,
  },
  {
    path: "/subjectboard/:id",
    name: "SubjectBoardDetail",
    component: SubjectBoardDetail,
  },
  {
    path: "/classroom/view",
    component: Classview,
  },
  {
    path: "/classroom",
    component: Classroom,
  },
  {
    path: "/assignment",
    name: "Assignment",
    component: () => import("@/views/assignment/AssignmentList.vue"),
    // (예시) 학생만 과제 목록에 접근 가능
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "student" || userType === "teacher") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/assignment/create",
    name: "AssignmentCreate",
    component: () => import("@/views/assignment/AssignmentCreate.vue"),
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "teacher") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/assignment/submit/:id",
    name: "AssignmentSubmission",
    component: () => import("@/views/assignment/AssignmentSubmission.vue"),
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "student") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
  {
    path: "/assignment/evaluation/:id",
    name: "AssignmentEvaluation",
    component: () => import("@/views/assignment/AssignmentEvaluation.vue"),
    beforeEnter: (to, from, next) => {
      const userType = localStorage.getItem("userType");
      if (userType === "teacher") {
        next();
      } else {
        next({ name: "Login" });
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
