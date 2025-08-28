<template>
  <RouterView />
  <NotificationModal @close="closeNotification" />
  <ChatModal v-if="route.query.chat === '1'" @close="closeChat" />
  <StudentChatModal v-if="route.query.studentchat === '1'" @close="closeChat" />
  <Spinner
    :is-loading="loadingState.isLoading"
    :loading-text="loadingState.text"
    overlay-type="fullscreen"
    :backdrop-blur="true"
    :z-index="10000"
  />
  <!-- 전역 플로팅 챗봇 버튼: 학생만 / 특정 화면에서는 숨김 -->
  <ChatFab v-if="showAiFab" />
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ChatModal from "@/components/common/ChatModal.vue";
import StudentChatModal from "./components/common/StudentChatModal.vue";
import Spinner from "./components/common/Spinner.vue";
import ChatFab from "@/components/common/ChatFab.vue";   
import { loadingState } from "@/utils/loading";
import presenceClient from "./utils/presenceClient";
import { provide } from "vue";
//전역해서 WEBSOCKER제공
provide("presenceClient", presenceClient);

const route = useRoute();
const router = useRouter();
// const presence = new presenceClient();
function closeChat() {
  const q = { ...route.query };
  delete q.chat;
  delete q.room;
  delete q.studentchat;
  router.push({ query: q }); // 모달 OFF
}
function closeNotification() {
  noti.close(); // 스토어의 isOpen을 false로 변경
}

// 학생만 보이고, 시험/설치/보안/교사용 화면에서는 숨김
const showAiFab = computed(() => {
  const isStudent = localStorage.getItem("userType") === "student";
  if (!isStudent) return false;
  const hiddenNames = new Set([
    "Login","TeacherMain","TeacherReport","TeacherClassReport",
    "TeacherExamReport","TeacherExamCreate","Exam","ExamProblem"
  ]);
  if (hiddenNames.has(route.name)) return false;
  const hiddenPathStarts = ["/install","/agent-required","/forensic"];
  return !hiddenPathStarts.some((p) => (route.path || "").startsWith(p));
});
</script>

<style scoped></style>
