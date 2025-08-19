<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ensureAgent, checkAgentOnly } from '@/utils/ensureAgent'

const agree = ref(false);
const msg = ref('');
let timer = null;

// 개발/운영 자동 분기: dev에서는 BE로 바로, 운영은 리버스프록시(/download/agent)
function downloadUrl(){
  return import.meta.env.DEV
    ? 'http://localhost:8080/download/agent'
    : '/download/agent';
}

function goDownload(){
  // 새 탭으로 파일만 열고, 현재 페이지(Install)에 남아 자동 확인을 계속 돌림
  const url = downloadUrl();
  window.open(url, '_blank', 'noopener');  // ← 핵심
  msg.value = '다운로드가 시작되었습니다. 보안프로그램을 실행하면 자동으로 넘어갑니다.';
}

function nextTarget(){
  const params = new URLSearchParams(location.search)
  return params.get('next') || '/login'
}

async function checkAgent(){
  msg.value = '확인 중...'
  const ok = await ensureAgent()
  if(ok){
    msg.value = '보안 프로그램 실행이 확인되었습니다.'
    window.location.href = nextTarget()
  }else{
    msg.value = '아직 실행을 감지하지 못했습니다. 보안 프로그램을 실행한 뒤 다시 시도하세요.'
  }
}

// 자동 감지(1.5s) — 에이전트 실행 시 자동으로 서비스 진입
onMounted(() => {
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
