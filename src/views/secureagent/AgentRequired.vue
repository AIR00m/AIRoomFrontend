<template>
  <Spinner
    :is-loading="loadingState.isLoading"
    :loading-text="loadingState.text"
    size="large"
    overlay-type="fullscreen"
    :backdrop-blur="true"
  />
  <div class="auth-page">
    <div class="agent-container">
      <!-- 귀여운 캐릭터와 메시지 -->
      <div class="content-panel">
        <div class="cute-characters">
          <div class="character main-char">🐤</div>
          <div class="character side-char1">😴</div>
          <div class="character side-char2">🔧</div>
        </div>
        
        <div class="message-content">
          <h1 class="main-title">앗! 우리 지킴이가 잠들었어요 💤</h1>
          <div class="sub-message">
            <p>아이룸에서 안전하게 공부하려면 <span class="highlight">보안 지킴이</span>가 깨어 있어야 해요!</p>
            <p>걱정하지 마세요. 금방 다시 깨울 수 있어요 🌟</p>
          </div>

          <div class="action-buttons">
            <button class="btn btn-primary" @click="tryResume">
              <span class="btn-icon">🔍</span>
              다시 찾아보기
            </button>
            <button class="btn btn-secondary" @click="goInstall">
              <span class="btn-icon">⬇️</span>
              새로 설치하기
            </button>
          </div>

          <div v-if="msg" class="status-message" :class="{ checking: msg.includes('확인') }">
            <div class="status-icon">{{ msg.includes('확인') ? '🔄' : '❌' }}</div>
            {{ msg }}
          </div>

          <!-- 도움말 박스 -->
          <div class="help-box">
            <div class="help-icon">💡</div>
            <div class="help-content">
              <strong>보안 지킴이가 뭐예요?</strong>
              <p>여러분의 공부 자료를 안전하게 지켜주는 작은 프로그램이에요!</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 떠다니는 장식 요소들 -->
    <div class="floating-decorations">
      <div class="floating-item item1">🛡️</div>
      <div class="floating-item item2">⭐</div>
      <div class="floating-item item3">🌈</div>
      <div class="floating-item item4">🎈</div>
      <div class="floating-item item5">🔐</div>
      <div class="floating-item item6">💝</div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ensureAgent, 
  checkAgentOnly, 
  startHeartbeat, 
  bindActiveTabWatermark, 
  currentNextTarget
} from '@/utils/ensureAgent';
import { loadingState, loading } from "@/utils/loading"; 
import Spinner from '@/components/common/Spinner.vue';  

export default {
  name: "AgentRequired",
  components: { Spinner },
  setup() {
    const router = useRouter()
    const msg = ref('')
    let timer = null

    function nextTarget() {
      return currentNextTarget('/login');   // 항상 중첩 next 제거됨
    }

    async function tryResume() {
      msg.value = '지킴이를 찾고 있어요...'
      const ok = await ensureAgent()
      if (ok) {
        startHeartbeat()
        bindActiveTabWatermark()
        router.replace(nextTarget())
      } else {
        msg.value = '지킴이를 찾지 못했어요. 새로 설치해주세요! 이미 설치를 마쳤다면 바탕화면 지킴이를 두 번 클릭해주세요!'
      }
    }

    function goInstall() {
      const next = nextTarget();            // raw 경로
      router.replace({ path: '/install', query: { next } });
    }

    onMounted(() => {
      // 자동 복귀: 3초 간격으로 조용히 확인
      timer = setInterval(async () => {
        const ok = await checkAgentOnly()
        if (ok) {
          startHeartbeat()
          bindActiveTabWatermark()
          clearInterval(timer)
          router.replace(nextTarget())
        }
      }, 3000)
    })

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer)
    })

    return {
      msg,
      tryResume,
      goInstall,
      loadingState,
    }
  }
}
</script>

<style scoped>
/* 전체 페이지 스타일 */
.auth-page {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
  background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 50%, #fff9e6 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
}

.agent-container {
  background: white;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(255, 221, 41, 0.15);
  border: 3px solid #ffe066;
  overflow: hidden;
  width: 100%;
  max-width: 800px;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: bounceIn 0.8s ease;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.content-panel {
  padding: 3rem 2.5rem;
  text-align: center;
  position: relative;
  z-index: 2;
}

/* 귀여운 캐릭터들 */
.cute-characters {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.character {
  font-size: 4rem;
  animation: bounce 2s infinite;
}

.main-char {
  animation-delay: 0s;
}

.side-char1 {
  animation-delay: 0.3s;
  opacity: 0.8;
}

.side-char2 {
  animation-delay: 0.6s;
  opacity: 0.8;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-15px);
  }
  60% {
    transform: translateY(-8px);
  }
}

/* 메시지 콘텐츠 */
.message-content {
  max-width: 600px;
  margin: 0 auto;
}

.main-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #f57c00;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.sub-message {
  margin-bottom: 2.5rem;
}

.sub-message p {
  font-size: 1.2rem;
  color: #ff9800;
  margin-bottom: 0.8rem;
  font-weight: 600;
  line-height: 1.4;
}

.highlight {
  color: #f57c00;
  font-weight: 800;
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  border: 2px solid #ffe066;
}

/* 버튼 스타일 */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  font-family: inherit;
  min-width: 160px;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #ffdd29, #ffc107);
  color: white;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.3);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(255, 221, 41, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  color: #f57c00;
  border: 2px solid #ffe066;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.15);
}

.btn-secondary:hover {
  transform: translateY(-3px);
  background: linear-gradient(135deg, #ffe066, #fff9c4);
  box-shadow: 0 12px 30px rgba(255, 221, 41, 0.25);
}

.btn-icon {
  font-size: 1.2rem;
}

/* 상태 메시지 */
.status-message {
  background: linear-gradient(135deg, #fff2e5, #fff9f0);
  border: 2px solid #ffe066;
  border-radius: 15px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 600;
  color: #f57c00;
  animation: fadeIn 0.5s ease;
}

.status-message.checking {
  background: linear-gradient(135deg, #e3f2fd, #f0f9ff);
  border-color: #81c784;
  color: #2e7d32;
}

.status-icon {
  font-size: 1.3rem;
  animation: spin 2s linear infinite;
}

.status-message.checking .status-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 도움말 박스 */
.help-box {
  background: linear-gradient(135deg, #f3e5f5, #fce4ec);
  border: 2px solid #ce93d8;
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  text-align: left;
  margin-top: 1rem;
}

.help-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.help-content strong {
  display: block;
  font-size: 1.1rem;
  color: #7b1fa2;
  margin-bottom: 0.5rem;
  font-weight: 800;
}

.help-content p {
  color: #8e24aa;
  font-weight: 600;
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
}

/* 떠다니는 장식들 */
.floating-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-item {
  position: absolute;
  font-size: 2rem;
  opacity: 0.4;
  animation: float 6s ease-in-out infinite;
}

.item1 {
  top: 15%;
  left: 10%;
  animation-delay: 0s;
}

.item2 {
  top: 25%;
  right: 15%;
  animation-delay: 1s;
}

.item3 {
  top: 55%;
  left: 8%;
  animation-delay: 2s;
}

.item4 {
  top: 75%;
  right: 20%;
  animation-delay: 3s;
}

.item5 {
  top: 35%;
  left: 85%;
  animation-delay: 4s;
}

.item6 {
  top: 65%;
  right: 8%;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
  }
  50% {
    transform: translateY(0px) rotate(180deg);
  }
  75% {
    transform: translateY(-10px) rotate(270deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .agent-container {
    max-width: 90%;
    min-height: 400px;
    border-radius: 20px;
  }

  .content-panel {
    padding: 2rem 1.5rem;
  }

  .main-title {
    font-size: 1.8rem;
  }

  .sub-message p {
    font-size: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 280px;
  }

  .cute-characters {
    gap: 1rem;
  }

  .character {
    font-size: 3rem;
  }

  .floating-item {
    font-size: 1.5rem;
  }
}

/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
