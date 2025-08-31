<template>
  <RouterView />
  <NotificationModal @close="closeNotification" />
  <ChatModal v-if="route.query.chat === '1'" @close="closeChat" />
  <StudentChatModal v-if="route.query.studentchat === '1'" @close="closeChat" />
  <AiChat v-if="route.query.aichat === '1'" mode="modal" @close="closeAiChat" />
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
import AiChat from "@/components/common/AiChat.vue";
import Spinner from "./components/common/Spinner.vue";
import ChatFab from "@/components/common/ChatFab.vue";
import { loadingState } from "@/utils/loading";
import presenceClient from "./utils/presenceClient";
import { computed, provide, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAiChat } from "@/composables/useAiChat";

//전역해서 WEBSOCKER제공
provide("presenceClient", presenceClient);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { closeAiChat } = useAiChat();

watch(
  () => route.path,
  (newPath) => {
    if (newPath.startsWith("/ExamProblem") && route.query.aichat === "1") {
      closeAiChat();
    }
  }
);

watch(
  () => route.query.aichat,
  (isOpen) => {
    if (isOpen === "1" && route.path.startsWith("/ExamProblem")) {
      closeAiChat();
    }
  }
);

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

const showAiFab = computed(() => {
  if (route.query.aichat === "1") return false;

  if (!authStore.isAuthenticated) return false;
  if (!authStore.isStudent) return false;
  const role = authStore.tokenInfo?.role?.toLowerCase?.();
  if (role && role !== "student") return false;

  if (route.matched?.some((r) => r.meta?.hideAiChat === true)) return false;

  const blockedNames = new Set([
    "DigitalTextBook",
    "ExamReport",
    "ExamProblem",
    "Classview",
  ]);
  if (blockedNames.has(route.name)) return false;

  const path = route.path || "";
  const blockedPrefixes = [
    "/install",
    "/agent-required",
    "/forensic",
    "/textbook",
    "/ExamProblem",
    "/classroom/view",
  ];
  if (blockedPrefixes.some((p) => path.startsWith(p))) return false;

  return true;
});
</script>

<style scoped></style>
