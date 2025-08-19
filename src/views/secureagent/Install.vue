<template>
  <main class="p-6 cute-wrap">
    <div class="card">
      <div class="emoji">🛡️✨</div>
      <h1>보안 도우미 설치하기</h1>
      <ol class="steps">
        <li>아래 버튼을 눌러 <b>보안 도우미</b>를 받아요.</li>
        <li>다운로드된 파일을 <b>두 번 클릭</b>해서 설치해요.</li>
        <li>설치가 끝나면 이 화면이 <b>자동으로 다음으로</b> 넘어가요!</li>
      </ol>

      <label class="agree">
        <input type="checkbox" v-model="agree"> 보안 도우미 설치/실행에 동의해요
      </label>

      <div class="btns">
        <button class="primary" :disabled="!agree" @click="goDownload">보안 도우미 받기</button>
        <button class="ghost" @click="checkAgent">이미 실행했어요</button>
      </div>

      <p v-if="msg" class="msg">{{ msg }}</p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ensureAgent, checkAgentOnly } from '@/utils/ensureAgent'

const agree = ref(false)
const msg = ref('')
let timer = null

function nextTarget(){
  const params = new URLSearchParams(location.search)
  return params.get('next') || '/login'
}

function downloadUrl(){
  return import.meta.env.DEV ? 'http://localhost:8080/download/agent' : '/download/agent'
}

function goDownload(){
  window.open(downloadUrl(), '_blank', 'noopener')
  msg.value = '다운로드가 시작되었어요! 설치 후 도우미가 켜지면 자동으로 넘어가요.'
}

async function checkAgent(){
  msg.value = '확인 중...'
  const ok = await ensureAgent()
  if(ok){
    window.location.href = nextTarget()
  }else{
    msg.value = '아직 보안 도우미를 찾지 못했어요. 설치/실행을 확인해 주세요.'
  }
}

onMounted(() => {
  // 조용한 자동 감지
  timer = setInterval(async () => {
    const ok = await checkAgentOnly()
    if (ok) {
      clearInterval(timer)
      window.location.href = nextTarget()
    }
  }, 1500)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.cute-wrap { display:flex; align-items:center; justify-content:center; min-height:70vh; }
.card { max-width:720px; width:100%; background:#fff; border-radius:20px; padding:28px;
        box-shadow:0 8px 24px rgba(0,0,0,.08); }
.emoji { font-size:56px; text-align:center; }
h1 { text-align:center; font-size:26px; margin:6px 0 16px; }
.steps { margin:0 0 10px 18px; padding:0; }
.steps li { margin:6px 0; font-size:16px; }
.agree { display:block; margin:10px 0; }
.btns { display:flex; gap:10px; flex-wrap:wrap; }
button { border:0; border-radius:14px; padding:12px 18px; font-size:16px; cursor:pointer; }
.primary { background:#6ac1ff; }
.ghost { background:#f0f0f0; }
.msg { margin-top:10px; color:#666; }
</style>
