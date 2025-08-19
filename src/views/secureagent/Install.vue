<template>
  <main class="p-6">
    <h1>보안 프로그램 설치 안내</h1>
    <p>학습 콘텐츠 보호를 위해 보안 프로그램 설치 및 실행 동의가 필요합니다.</p>

    <label style="display:block;margin:12px 0;">
      <input type="checkbox" v-model="agree" /> 동의합니다
    </label>

    <div style="display:flex; gap:8px;">
      <button :disabled="!agree" @click="goDownload">다운로드</button>
      <button @click="checkAgent">설치/실행 확인</button>
    </div>

    <p v-if="msg" style="margin-top:10px;">{{ msg }}</p>
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ensureAgent, checkAgentOnly } from '@/utils/ensureAgent'

const agree = ref(false)
const msg = ref('')
let timer = null

function nextTarget() {
  const params = new URLSearchParams(location.search)
  return params.get('next') || '/login'
}

function downloadUrl() {
  return import.meta.env.DEV ? 'http://localhost:8080/download/agent' : '/download/agent'
}

function goDownload() {
  // 새 탭으로만 다운로드 열고, 현재 탭은 Install에 남겨 자동 감지 유지
  window.open(downloadUrl(), '_blank', 'noopener')
  msg.value = '다운로드가 시작되었습니다. 보안프로그램을 실행하면 자동으로 넘어갑니다.'
}

async function checkAgent() {
  msg.value = '확인 중...'
  const ok = await ensureAgent()
  if (ok) {
    msg.value = '보안 프로그램 실행이 확인되었습니다.'
    window.location.href = nextTarget()
  } else {
    msg.value = '아직 실행을 감지하지 못했습니다. 보안 프로그램을 실행한 뒤 다시 시도하세요.'
  }
}

onMounted(() => {
  // 조용한 자동 감지(1.5초 간격)
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
