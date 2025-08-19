<template>
  <main class="p-6">
    <h1>보안 프로그램 실행 필요</h1>
    <p>웹 이용을 위해 보안 프로그램이 실행 중이어야 합니다.</p>
    <button @click="retry">다시 확인</button>
  </main>
</template>
<script setup lang="ts">
function retry(){ window.location.reload(); }
</script>
