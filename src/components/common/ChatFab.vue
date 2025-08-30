<template>
  <Teleport to="body">
    <button class="ai-fab" @click="open" aria-label="학습 도우미 열기">
      <div class="ai-fab-content">
        <div class="ai-icon">🤖</div>
        <div class="ai-text">도우미</div>
      </div>
      <div class="ai-fab-pulse"></div>
    </button>
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
  position: fixed !important;
  right: 33px !important;
  bottom: 100px !important;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffeb3b 0%, #ffd54f 50%, #ffc107 100%);
  border: 3px solid #ffe082;
  color: white;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  cursor: pointer;
  z-index: 9999 !important;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ai-fab:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 35px rgba(255, 193, 7, 0.4);
  background: linear-gradient(135deg, #ffc107 0%, #ff8f00 50%, #f57c00 100%);
}

.ai-fab-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.ai-icon {
  font-size: 24px;
  margin-bottom: 2px;
  animation: bounce 2s infinite;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.ai-text {
  font-size: 10px;
  font-weight: 800;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1;
}

.ai-fab-pulse {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffeb3b, #ffc107);
  opacity: 0.6;
  animation: pulse 2s infinite;
  z-index: 1;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .ai-fab {
    width: 60px;
    height: 60px;
    right: 25px !important;
    bottom: 90px !important;
  }
  
  .ai-icon {
    font-size: 20px;
  }
  
  .ai-text {
    font-size: 9px;
  }
}

/* 접근성 */
.ai-fab:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  .ai-fab-pulse,
  .ai-icon {
    animation: none;
  }
  
  .ai-fab {
    transition: none;
  }
}
</style>
