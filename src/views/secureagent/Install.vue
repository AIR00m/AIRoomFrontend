<template>
  <main class="p-6">
    <h1>보안 프로그램 설치 안내</h1>
    <p>학습 콘텐츠 보호를 위해 보안 프로그램 설치 및 실행 동의가 필요합니다.</p>

    <label style="display:block;margin:12px 0;">
      <input type="checkbox" v-model="agree"> 동의합니다
    </label>

    <div style="display:flex; gap:8px;">
      <button :disabled="!agree" @click="goDownload">다운로드</button>
      <button @click="checkAgent">설치/실행 확인</button>
    </div>

    <p v-if="msg" style="margin-top:10px;">{{ msg }}</p>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ensureAgent, checkAgentOnly } from '@/utils/ensureAgent'

const agree = ref(false);
const msg = ref('');
let timer = null;

function goDownload(){
  window.location.href = '/download/agent'
}

async function checkAgent(){
  msg.value = '확인 중...'
  const ok = await ensureAgent()
  if(ok){
    msg.value = '보안 프로그램 실행이 확인되었습니다.'
    window.location.href = '/login'   // 또는 원하는 보호 라우트로
  }else{
    msg.value = '아직 실행을 감지하지 못했습니다. 보안 프로그램을 실행한 뒤 다시 시도하세요.'
  }
}
</script>
