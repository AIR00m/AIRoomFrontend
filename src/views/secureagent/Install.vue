<template>
  <main class="p-6">
    <h1>보안 프로그램 설치 안내</h1>
    <p>학습 콘텐츠 보호를 위해 보안 프로그램 설치 및 실행 동의가 필요합니다.</p>
    <label style="display:block;margin:12px 0;">
      <input type="checkbox" v-model="agree"> 동의합니다
    </label>
    <button :disabled="!agree" @click="goDownload">다운로드</button>
  </main>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const agree = ref(false);
function goDownload(){
  window.location.href = '/download/agent'; // BE에서 제공 예정
}
</script>
