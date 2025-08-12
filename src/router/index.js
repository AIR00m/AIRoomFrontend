import { createRouter, createWebHistory } from "vue-router";
import StudentMain from "@/views/main/StudentMain.vue";
import TeacherMain from "@/views/TeacherMain.vue";
import LoginMain from "@/views/main/LoginMain.vue";
import Exam from "@/views/exam/Exam.vue";

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
    path: "/login",
    name: "Login",
    component: LoginMain,
    beforeEnter: (to, from, next) => {
      // 이미 로그인되어 있다면 해당 페이지로 리다이렉트
      const userType = localStorage.getItem("userType");
      if (userType === "student") {
        next({ name: "StudentMain" });
      } else if (userType === "teacher") {
        next({ name: "TeacherMain" });
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
