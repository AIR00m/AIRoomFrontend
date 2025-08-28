<template>
  <RouterView />
  <NotificationModal @close="closeNotification" />
  <ChatModal v-if="route.query.chat === '1'" @close="closeChat" />
  <StudentChatModal v-if="route.query.studentchat === '1'" @close="closeChat" />
  <AiChatModal v-if="route.query.aichat === '1'" @close="closeAiChat" /> 
  <Spinner
    :is-loading="loadingState.isLoading"
    :loading-text="loadingState.text"
    overlay-type="fullscreen"
    :backdrop-blur="true"
    :z-index="10000"
  />
  <ChatFab v-if="showAiFab" />
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ChatModal from "@/components/common/ChatModal.vue";
import StudentChatModal from "./components/common/StudentChatModal.vue";
import AiChatModal from "@/components/common/AiChatModal.vue";
import Spinner from "./components/common/Spinner.vue";
import ChatFab from "@/components/common/ChatFab.vue";  
import { loadingState } from "@/utils/loading";
import presenceClient from "./utils/presenceClient";
import { computed, provide, watchEffect } from "vue";
import { useAuthStore } from "@/stores/auth";

//전역해서 WEBSOCKER제공
provide("presenceClient", presenceClient);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// const presence = new presenceClient();
function closeChat() {
  const q = { ...route.query };
  delete q.chat;
  delete q.room;
  delete q.studentchat;
  router.push({ query: q }); // 모달 OFF
}

function closeAiChat() {
  const q = { ...route.query };
  delete q.aichat;
  router.push({ query: q });
}

function closeNotification() {
  noti.close(); // 스토어의 isOpen을 false로 변경
}

const showAiFab = computed(() => {
  const role = authStore.tokenInfo?.role || localStorage.getItem("userType");
  if (role !== "student") return false;
  const hiddenNames = new Set(["Login","TeacherMain","TeacherReport","TeacherClassReport","TeacherExamReport","TeacherExamCreate","Exam","ExamProblem"]);
  if (hiddenNames.has(route.name)) return false;
  const hiddenPathStarts = ["/install","/agent-required","/forensic"];
  return !hiddenPathStarts.some((p) => (route.path || "").startsWith(p));
});

watchEffect(() => {
  console.debug("[FAB]", {
    role: authStore.tokenInfo?.role || localStorage.getItem("userType"),
    name: route.name, path: route.path, show: showAiFab.value,
  });
});
</script>

<style scoped></style>
