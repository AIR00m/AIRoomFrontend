<template>
  <main class="p-6 cute-wrap">
    <div class="card">
      <div class="emoji">🛡️💤</div>
      <h1>앗! 보안 도우미가 잠들었어요</h1>
      <p>수업 자료를 지키려면 <b>보안 도우미</b>가 깨어 있어야 해요.</p>

      <div class="btns">
        <button class="primary" @click="tryResume">다시 확인하기</button>
        <button class="ghost" @click="goInstall">설치하러 가기</button>
      </div>

      <p v-if="msg" class="msg">{{ msg }}</p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ensureAgent, checkAgentOnly, startHeartbeat, bindActiveTabWatermark } from '@/utils/ensureAgent'

const msg = ref('')
let timer = null

function nextTarget(){
  const p = new URLSearchParams(location.search).get('next')
  return p || '/login'
}

async function tryResume(){
  msg.value = '확인 중...'
  const ok = await ensureAgent()   // 필요 시 프로토콜 시도 포함
  if(ok){
    startHeartbeat(); bindActiveTabWatermark();
    window.location.href = nextTarget()
  }else{
    msg.value = '아직 보안 도우미를 찾지 못했어요.'
  }
}

function goInstall(){
  const next = encodeURIComponent(nextTarget())
  window.location.href = `/install?next=${next}`
}

onMounted(() => {
  // 자동 복귀: 2초 간격으로 조용히 확인
  timer = setInterval(async () => {
    const ok = await checkAgentOnly()
    if (ok) {
      startHeartbeat(); bindActiveTabWatermark();
      clearInterval(timer)
      window.location.href = nextTarget()
    }
  }, 2000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.cute-wrap { display:flex; align-items:center; justify-content:center; min-height:70vh; }
.card { max-width:640px; width:100%; background:#fff; border-radius:20px; padding:28px;
        box-shadow:0 8px 24px rgba(0,0,0,.08); text-align:center; }
.emoji { font-size:56px; margin-bottom:8px; }
h1 { font-size:26px; margin:6px 0 10px; }
p { font-size:16px; color:#444; }
.btns { display:flex; gap:10px; justify-content:center; margin-top:16px; }
button { border:0; border-radius:14px; padding:12px 18px; font-size:16px; cursor:pointer; }
.primary { background:#6ac1ff; }
.ghost { background:#f0f0f0; }
.msg { margin-top:10px; color:#666; }
</style>
