<template>
  <!-- 학생이고, 이미 모달이 열려있지 않을 때만 버튼 노출 -->
  <button
    v-if="isStudent && route.query.studentchat !== '1'"
    class="ai-floating-bot"
    title="학습 챗봇"
    @click="openChat"
  >
    🤖
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

// role 정보는 프로젝트 상황에 맞춰 하나 선택(둘 다 대비)
const isStudent = computed(() => {
  const role = auth?.tokenInfo?.role || auth?.user?.role;
  return String(role).toLowerCase() === "student";
});

function openChat() {
  const q = { ...route.query, studentchat: "1" };
  router.push({ query: q });
}
</script>

<style scoped>
.ai-floating-bot {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 0;
  cursor: pointer;
  font-size: 1.8rem;
  background: linear-gradient(135deg, #ffd54f, #ffc107);
  color: #fff;
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.3);
  border: 3px solid #ffe082;
  transition: all 0.2s ease;
  z-index: 1500; /* App의 모달(학생용)은 z-index 2010이므로 버튼이 그 아래에 있어도 OK */
}
.ai-floating-bot:hover {
  transform: translateY(-3px) scale(1.06);
  box-shadow: 0 12px 35px rgba(255, 193, 7, 0.4);
}
</style>
