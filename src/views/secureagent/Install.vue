<template>
  <div class="auth-page">
    <div class="install-container">
      <!-- 설치 안내 패널 -->
      <div class="install-panel">
        <div class="install-content">
          <div class="install-header">
            <div class="logo-section">
              <div class="logo-icon">🛡️</div>
              <h1 class="install-title">보안 지킴이 설치하기</h1>
            </div>
            <p class="install-subtitle">
              아이룸에서 안전하게 공부하려면 보안 지킴이가 필요해요! ✨
            </p>
          </div>

          <!-- 설치 단계 -->
          <div class="install-steps">
            <h3 class="steps-title">📝 설치 방법</h3>
            <div class="steps-list">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-content">
                  <strong>아래 버튼을 눌러서</strong> 보안 지킴이를 받아요
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <strong>다운로드된 파일을 두 번 클릭</strong>해서 설치해요
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  설치가 끝나면 <strong>자동으로 다음 화면</strong>으로 넘어가요!
                </div>
              </div>
            </div>
          </div>

          <!-- 개인정보 보호 안내 -->
          <div class="privacy-info">
            <h3 class="privacy-title">🔒 개인정보 보호 안내</h3>
            <div class="privacy-content">
              <div class="privacy-item">
                <span class="privacy-icon">🛡️</span>
                <div>
                  <strong>보안 지킴이는 무엇인가요?</strong>
                  <p>여러분의 수업 자료와 개인정보를 안전하게 지켜주는 작은 프로그램이에요.</p>
                </div>
              </div>
              <div class="privacy-item">
                <span class="privacy-icon">👀</span>
                <div>
                  <strong>어떤 정보를 사용하나요?</strong>
                  <p>수업에 필요한 최소한의 정보만 사용하고, 여러분의 사생활은 절대 들여다보지 않아요.</p>
                </div>
              </div>
              <div class="privacy-item">
                <span class="privacy-icon">🔐</span>
                <div>
                  <strong>정보는 안전하게 보관되나요?</strong>
                  <p>모든 정보는 강력한 암호로 보호되고, 수업이 끝나면 안전하게 삭제돼요.</p>
                </div>
              </div>
              <div class="privacy-item">
                <span class="privacy-icon">👨‍👩‍👧‍👦</span>
                <div>
                  <strong>부모님께 알려드려요</strong>
                  <p>보안 지킴이 설치에 대해 부모님께서도 알 수 있도록 안내문을 보내드려요.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 동의 체크박스 -->
          <div class="consent-section">
            <div class="consent-group">
              <label class="consent-item">
                <input 
                  type="checkbox" 
                  v-model="consents.install"
                  class="consent-checkbox"
                />
                <span class="checkmark">✓</span>
                <span class="consent-text">
                  <strong>보안 지킴이 설치</strong>에 동의해요
                </span>
              </label>
              
              <label class="consent-item">
                <input 
                  type="checkbox" 
                  v-model="consents.privacy"
                  class="consent-checkbox"
                />
                <span class="checkmark">✓</span>
                <span class="consent-text">
                  <strong>개인정보 수집·이용</strong>에 동의해요 
                  <button class="detail-link" @click="showPrivacyDetail">자세히 보기</button>
                </span>
              </label>
              
              <label class="consent-item">
                <input 
                  type="checkbox" 
                  v-model="consents.parentNotice"
                  class="consent-checkbox"
                />
                <span class="checkmark">✓</span>
                <span class="consent-text">
                  <strong>부모님 알림</strong>에 동의해요
                </span>
              </label>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="action-buttons">
            <button 
              class="btn btn-primary" 
              :disabled="!allConsentsGiven" 
              @click="goDownload"
            >
              <span class="btn-icon">⬇️</span>
              보안 지킴이 받기
            </button>
            <button class="btn btn-secondary" @click="checkAgent">
              <span class="btn-icon">🔍</span>
              이미 설치했어요
            </button>
          </div>

          <!-- 상태 메시지 -->
          <div v-if="msg" class="status-message" :class="{ checking: msg.includes('확인') }">
            <div class="status-icon">{{ getStatusIcon() }}</div>
            {{ msg }}
          </div>
        </div>

        <!-- 귀여운 캐릭터들 -->
        <div class="install-characters">
          <div class="character char1">🔧</div>
          <div class="character char2">⚡</div>
          <div class="character char3">🌟</div>
        </div>
      </div>
    </div>

    <!-- 개인정보 상세 모달 -->
    <div v-if="showPrivacyModal" class="privacy-modal" @click="closePrivacyModal">
      <div class="privacy-modal-content" @click.stop>
        <div class="modal-header">
          <h3>🔒 개인정보 수집·이용 안내</h3>
          <button class="close-btn" @click="closePrivacyModal">×</button>
        </div>
        <div class="modal-body">
          <div class="privacy-detail-item">
            <h4>📋 수집하는 정보</h4>
            <ul>
              <li>학습 진도 정보 (어떤 페이지를 보고 있는지)</li>
              <li>수업 참여 시간 (언제부터 언제까지 공부했는지)</li>
              <li>컴퓨터 보안 상태 (바이러스 검사 결과 등)</li>
            </ul>
          </div>
          <div class="privacy-detail-item">
            <h4>🎯 사용 목적</h4>
            <ul>
              <li>안전한 온라인 수업 환경 제공</li>
              <li>학습 자료 보호</li>
              <li>수업 품질 향상</li>
            </ul>
          </div>
          <div class="privacy-detail-item">
            <h4>⏰ 보관 기간</h4>
            <ul>
              <li>수업이 끝나는 즉시 자동 삭제</li>
              <li>최대 보관 기간: 1일</li>
            </ul>
          </div>
          <div class="privacy-detail-item">
            <h4>👨‍👩‍👧‍👦 부모님 권리</h4>
            <ul>
              <li>언제든지 정보 삭제 요청 가능</li>
              <li>수집된 정보 확인 요청 가능</li>
              <li>정보 처리 중단 요청 가능</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="closePrivacyModal">확인했어요</button>
        </div>
      </div>
    </div>

    <!-- 떠다니는 장식 요소들 -->
    <div class="floating-decorations">
      <div class="floating-item item1">🛡️</div>
      <div class="floating-item item2">⭐</div>
      <div class="floating-item item3">🔧</div>
      <div class="floating-item item4">🌈</div>
      <div class="floating-item item5">💝</div>
      <div class="floating-item item6">✨</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ensureAgent, checkAgentOnly } from '@/utils/ensureAgent'

export default {
  name: "Install",
  setup() {
    const msg = ref('')
    const showPrivacyModal = ref(false)
    const consents = ref({
      install: false,
      privacy: false,
      parentNotice: false
    })
    let timer = null

    const allConsentsGiven = computed(() => {
      return consents.value.install && consents.value.privacy && consents.value.parentNotice
    })

    function nextTarget() {
      const params = new URLSearchParams(location.search)
      return params.get('next') || '/login'
    }

    function downloadUrl() {
      return import.meta.env.DEV ? 'http://localhost:8080/download/agent' : '/download/agent'
    }

    function goDownload() {
      window.open(downloadUrl(), '_blank', 'noopener')
      msg.value = '🎉 다운로드가 시작됐어요! 설치 후 보안 지킴이가 켜지면 자동으로 다음 화면으로 넘어가요.'
    }

    async function checkAgent() {
      msg.value = '보안 지킴이를 찾고 있어요...'
      const ok = await ensureAgent()
      if (ok) {
        window.location.href = nextTarget()
      } else {
        msg.value = '아직 보안 지킴이를 찾지 못했어요. 설치를 완료한 후 다시 시도해주세요!'
      }
    }

    function showPrivacyDetail() {
      showPrivacyModal.value = true
    }

    function closePrivacyModal() {
      showPrivacyModal.value = false
    }

    function getStatusIcon() {
      if (msg.value.includes('확인') || msg.value.includes('찾고')) return '🔄'
      if (msg.value.includes('다운로드')) return '⬇️'
      if (msg.value.includes('못했어요')) return '❌'
      return '💬'
    }

    onMounted(() => {
      // 조용한 자동 감지
      timer = setInterval(async () => {
        const ok = await checkAgentOnly()
        if (ok) {
          clearInterval(timer)
          window.location.href = nextTarget()
        }
      }, 2000)
    })

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer)
    })

    return {
      msg,
      showPrivacyModal,
      consents,
      allConsentsGiven,
      goDownload,
      checkAgent,
      showPrivacyDetail,
      closePrivacyModal,
      getStatusIcon
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

.install-container {
  background: white;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(255, 221, 41, 0.15);
  border: 3px solid #ffe066;
  overflow: hidden;
  width: 100%;
  max-width: 900px;
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

.install-panel {
  padding: 3rem 2.5rem;
  position: relative;
  overflow: hidden;
}

.install-panel::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 221, 41, 0.1) 0%,
    transparent 70%
  );
  animation: sparkle 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0.3;
    transform: rotate(0deg);
  }
  50% {
    opacity: 0.7;
    transform: rotate(180deg);
  }
}

.install-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

/* 헤더 섹션 */
.install-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ffdd29, #ffc107);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  animation: wiggle 2s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  75% {
    transform: rotate(-5deg);
  }
}

.install-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #f57c00;
  margin: 0;
}

.install-subtitle {
  font-size: 1.2rem;
  color: #ff9800;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

/* 설치 단계 */
.install-steps {
  background: linear-gradient(135deg, #fff9c4, #fffacd);
  border: 2px solid #ffe066;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.steps-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #f57c00;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.2rem;
  border-radius: 15px;
  border: 2px solid #fff9c4;
  transition: all 0.3s ease;
}

.step-item:hover {
  transform: translateX(5px);
  border-color: #ffe066;
  box-shadow: 0 5px 15px rgba(255, 221, 41, 0.15);
}

.step-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ffdd29, #ffc107);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 800;
  flex-shrink: 0;
}

.step-content {
  font-size: 1rem;
  color: #f57c00;
  font-weight: 600;
  line-height: 1.4;
}

.step-content strong {
  color: #f57c00;
}

/* 개인정보 보호 안내 */
.privacy-info {
  background: linear-gradient(135deg, #f3e5f5, #fce4ec);
  border: 2px solid #ce93d8;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.privacy-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #7b1fa2;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.privacy-content {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.privacy-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.privacy-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.privacy-item strong {
  display: block;
  font-size: 1rem;
  color: #7b1fa2;
  margin-bottom: 0.3rem;
  font-weight: 800;
}

.privacy-item p {
  color: #8e24aa;
  font-weight: 600;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* 동의 섹션 */
.consent-section {
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  border: 2px solid #81c784;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.consent-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.consent-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 15px;
  border: 2px solid #c8e6c9;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.consent-item:hover {
  border-color: #81c784;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(129, 199, 132, 0.15);
}

.consent-checkbox {
  display: none;
}

.checkmark {
  width: 24px;
  height: 24px;
  border: 3px solid #c8e6c9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
  color: transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.consent-checkbox:checked + .checkmark {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  border-color: #4caf50;
  color: white;
}

.consent-text {
  font-size: 1rem;
  color: #2e7d32;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.detail-link {
  background: none;
  border: none;
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 5px;
  transition: background 0.2s ease;
}

.detail-link:hover {
  background: rgba(25, 118, 210, 0.1);
}

/* 액션 버튼 */
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
  min-width: 180px;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, #ffdd29, #ffc107);
  color: white;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.3);
}

.btn-primary:hover:not(:disabled) {
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
}

.status-message.checking .status-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 캐릭터들 */
.install-characters {
  position: absolute;
  right: 2rem;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1;
}

.character {
  font-size: 2rem;
  animation: bounce 2s infinite;
  animation-delay: var(--delay, 0s);
}

.char1 {
  --delay: 0s;
}
.char2 {
  --delay: 0.3s;
}
.char3 {
  --delay: 0.6s;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 개인정보 상세 모달 */
.privacy-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  animation: fadeIn 0.3s ease;
}

.privacy-modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  border: 3px solid #ffe066;
}

.modal-header {
  background: linear-gradient(135deg, #7b1fa2, #8e24aa);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 2rem;
  max-height: 400px;
  overflow-y: auto;
}

.privacy-detail-item {
  margin-bottom: 1.5rem;
}

.privacy-detail-item h4 {
  color: #7b1fa2;
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0 0 0.8rem 0;
}

.privacy-detail-item ul {
  margin: 0;
  padding-left: 1.5rem;
}

.privacy-detail-item li {
  color: #8e24aa;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 2px solid #f0f0f0;
  text-align: center;
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
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .install-container {
    max-width: 95%;
    border-radius: 20px;
  }

  .install-panel {
    padding: 2rem 1.5rem;
  }

  .logo-section {
    flex-direction: column;
    gap: 0.5rem;
  }

  .install-title {
    font-size: 1.8rem;
  }

  .install-subtitle {
    font-size: 1rem;
  }

  .step-item {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }

  .privacy-item {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 280px;
  }

  .install-characters {
    position: static;
    flex-direction: row;
    justify-content: center;
    margin-top: 1rem;
  }

  .privacy-modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .floating-item {
    font-size: 1.5rem;
  }

  .consent-text {
    flex-direction: column;
    align-items: flex-start;
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

/* 접근성 */
button:focus, .consent-item:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 호버 효과 개선 */
@media (hover: none) {
  .step-item:hover {
    transform: none;
  }

  .consent-item:hover {
    transform: none;
  }
}
</style>