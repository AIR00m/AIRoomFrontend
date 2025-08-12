<template>
  <RouterView />
  <NotificationModal />
  <ChatModal />
</template>

<script setup>
import NotificationModal from "@/components/common/NotificationModal.vue";
import ChatModal from "@/components/common/ChatModal.vue";
</script>

<style scoped></style>
