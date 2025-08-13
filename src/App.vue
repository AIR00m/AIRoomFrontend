<template>
  <RouterView />
  <NotificationModal />
  <ChatModal v-if="route.query.chat === '1'" @close="closeChat" />
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ChatModal from "@/components/common/ChatModal.vue";

const route = useRoute();
const router = useRouter();

function closeChat() {
  const q = { ...route.query };
  delete q.chat;
  delete q.room;
  router.push({ query: q }); // 모달 OFF
}
</script>

<style scoped></style>
