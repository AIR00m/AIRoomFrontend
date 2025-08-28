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
  if (route.query.aichat === "1") return;  
  if (!authStore.isAuthenticated || !authStore.isStudent) return;
  router.push({ query: { ...route.query, aichat: "1" } });
}
</script>

<style scoped>
.ai-fab {
  position: fixed; 
  right: 22px; 
  bottom: 22px;
  width: 56px; 
  height: 56px; 
  border-radius: 50%;
  background: #ff9800; 
  border: 2px solid #f57c00; 
  color: white;
  font-weight: 900; 
  font-size: 18px; 
  box-shadow: 0 12px 26px rgba(255, 152, 0, 0.3);
  cursor: pointer; 
  z-index: 3000;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ai-fab:hover { 
  transform: translateY(-2px) scale(1.05); 
  box-shadow: 0 16px 32px rgba(255, 152, 0, 0.4);
}

.ai-fab:active {
  transform: translateY(0) scale(0.95);
}
</style>
