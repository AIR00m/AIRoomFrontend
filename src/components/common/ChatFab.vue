<template>
  <button class="ai-fab" @click="open">AI</button>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
function open(){ router.push("/aichat"); }
</script>

<style scoped>
.ai-fab{
  position: fixed; right: 22px; bottom: 22px;
  width: 56px; height: 56px; border-radius: 50%;
  background: #ffd43b; border: 2px solid #fab005; color: #5a3c00;
  font-weight: 900; font-size: 18px; box-shadow: 0 10px 26px rgba(0,0,0,.18);
  cursor: pointer; z-index: 3000;
}
.ai-fab:hover{ transform: translateY(-1px); }
</style>
