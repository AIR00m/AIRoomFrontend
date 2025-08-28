<template>
  <Teleport to="body">
    <button class="ai-fab" @click="open" aria-label="AI 도우미 열기">AI</button>
  </Teleport>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

function open() {
  if (!authStore.isAuthenticated || !authStore.isStudent) return;
  if ((route.path || "").startsWith("/textbook")) return;
  if ((route.path || "").startsWith("/ExamProblem")) return;
  router.push({ query: { ...route.query, aichat: "1" } });
}
</script>

<style scoped>
.ai-fab{
  position: fixed; right: 22px; bottom: 22px;
  width: 56px; height: 56px; border-radius: 50%;
  background: #ffdd29; border: 2px solid #ffc107; color: #6b4e00;
  font-weight: 900; font-size: 18px; box-shadow: 0 12px 26px rgba(0,0,0,.18);
  cursor: pointer; z-index: 3000;
}
.ai-fab:hover{ transform: translateY(-1px); }
</style>
