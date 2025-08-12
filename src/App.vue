<template>
  <RouterView />
  <NotificationModal />
  <ChatModal />
</template>

<script setup>
import NotificationModal from "@/components/NotificationModal.vue";
import ChatModal from "@/components/ChatModal.vue";
</script>

<style scoped></style>
