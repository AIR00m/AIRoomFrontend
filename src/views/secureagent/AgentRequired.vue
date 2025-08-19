<template>
  <main class="p-6">
    <h1>보안 프로그램 실행 필요</h1>
    <p>웹 이용을 위해 보안 프로그램이 실행 중이어야 합니다.</p>
    <button @click="tryResume">다시 확인</button>
    <p v-if="msg" style="margin-top:10px">{{ msg }}</p>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ensureAgent, checkAgentOnly, startHeartbeat, bindActiveTabWatermark } from '@/utils/ensureAgent'

const msg = ref('')
let timer = null

function nextTarget(){
  const params = new URLSearchParams(location.search)
  return params.get('next') || '/login'
}

async function tryResume(){
  msg.value = '확인 중...'
  const ok = await ensureAgent()   // 필요시 프로토콜 시도 포함
  if(ok){
    startHeartbeat(); bindActiveTabWatermark();
    window.location.href = nextTarget()
  }else{
    msg.value = '아직 보안프로그램을 감지하지 못했습니다.'
  }
}

onMounted(() => {
  // 자동 복귀: 2초마다 조용히 확인
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
