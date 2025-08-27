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
  <!-- 전역 플로팅 챗봇: 학생에게만 노출 -->
  <AiChat v-if="route.name !== 'ExamProblem'" />
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ChatModal from "@/components/common/ChatModal.vue";
import StudentChatModal from "./components/common/StudentChatModal.vue";
import Spinner from "./components/common/Spinner.vue";
import AiChat from "@/components/common/AiChat.vue";
import { loadingState } from "@/utils/loading";

const route = useRoute();
const router = useRouter();

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
</script>

<style scoped></style>
