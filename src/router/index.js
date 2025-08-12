import { createRouter, createWebHistory } from "vue-router";
import StudentMain from "@/views/StudentMain.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: "/", component: StudentMain }],
});

export default router;
