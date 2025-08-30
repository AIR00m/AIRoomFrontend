import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// ✨ 전역 상태 + localStorage 동기화
const isTransitioning = ref(false)
const STORAGE_KEY = 'aiChat_global_state'

// localStorage에서 현재 모달 상태 읽기
function getGlobalModalState() {
  try {
    const state = localStorage.getItem(STORAGE_KEY)
    return state ? JSON.parse(state) : null
  } catch {
    return null
  }
}

// localStorage에 모달 상태 저장
function setGlobalModalState(state) {
  try {
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // ignore localStorage errors
  }
}

// ✨ 강화된 stale localStorage 정리 (1분 이상 된 데이터 삭제)
function cleanupStaleState() {
  const state = getGlobalModalState();
  if (state && state.openedAt) {
    const oneMinuteAgo = Date.now() - (1 * 60 * 1000); // 1분으로 단축
    if (state.openedAt < oneMinuteAgo) {
      console.log('🧹 stale AI chat state 정리:', state);
      setGlobalModalState(null);
      return true; // 정리했음을 반환
    }
  }
  return false;
}

// ✨ 현재 탭에서 열린 모달인지 확인
function isCurrentTabModal(state) {
  if (!state) return false;
  
  // tabId가 같으면 현재 탭
  if (state.tabId === window.tabId) return true;
  
  // tabId가 없거나 다르면서, 최근 1분 이내면 같은 탭일 가능성 체크
  const oneMinuteAgo = Date.now() - (1 * 60 * 1000);
  if (state.openedAt > oneMinuteAgo) {
    // 최근 데이터라면 현재 URL 쿼리 파라미터로 확인
    const currentUrl = window.location.href;
    if (currentUrl.includes('aichat=1')) {
      console.log('🔄 같은 탭의 모달로 판단 (URL 기반)');
      return true;
    }
  }
  
  return false;
}

// 다른 탭에서의 모달 상태 변경 감지
function watchGlobalModalState(callback) {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      callback(e.newValue ? JSON.parse(e.newValue) : null)
    }
  })
}

export function useAiChat() {
  const route = useRoute()
  const router = useRouter()
  
  // ✨ 페이지 로드 시 stale data 정리
  cleanupStaleState();
  
  // ✨ 브라우저 창/탭 닫힐 때 localStorage 정리
  const handleWindowClose = () => {
    const globalState = getGlobalModalState();
    if (globalState && globalState.tabId === window.tabId) {
      console.log('🔚 창 닫힘 감지 - localStorage 정리');
      setGlobalModalState(null);
    }
  };
  
  // ✨ 브라우저 가시성 변경 시 상태 확인
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 탭이 숨겨질 때는 잠시 대기
      setTimeout(() => {
        if (document.hidden) {
          console.log('👁️ 탭 숨김 상태 - 상태 체크');
          // 10초 후에도 숨겨져 있으면 정리 (너무 길면 조정)
          setTimeout(() => {
            if (document.hidden) {
              handleWindowClose();
            }
          }, 10000);
        }
      }, 1000);
    }
  };
  
  // ✨ 이벤트 리스너 등록 (페이지 로드 시 한 번만)
  if (!window._aiChatListenersAdded) {
    // 창 닫힘 감지 이벤트들
    window.addEventListener('beforeunload', handleWindowClose);
    window.addEventListener('unload', handleWindowClose);
    window.addEventListener('pagehide', handleWindowClose);
    
    // 가시성 변경 감지
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 플래그 설정 (중복 등록 방지)
    window._aiChatListenersAdded = true;
    
    console.log('✅ AI 챗봇 창 닫힘 감지 이벤트 등록 완료');
  }
  
  // ✨ 다른 탭에서 모달 열렸는지 확인 (개선된 로직)
  const checkOtherTabModal = () => {
    const globalState = getGlobalModalState()
    
    // ✨ 디버깅 로그 추가
    console.log('🔍 AI 챗봇 상태 확인:');
    console.log('- localStorage state:', globalState);
    console.log('- 현재 tabId:', window.tabId);
    console.log('- 현재 URL:', window.location.href);
    
    // 상태가 없으면 다른 탭 모달 없음
    if (!globalState) {
      console.log('- localStorage 상태 없음');
      return false;
    }

    // ✨ 더 적극적인 만료 시간 (30초로 단축)
    const thirtySecondsAgo = Date.now() - (30 * 1000);
    if (globalState.openedAt < thirtySecondsAgo) {
      console.log('🧹 30초 이상 된 데이터 정리');
      setGlobalModalState(null);
      return false;
    }
    
    // 현재 탭의 모달이면 다른 탭 아님
    if (isCurrentTabModal(globalState)) {
      console.log('- 현재 탭의 모달임');
      return false;
    }
    
    // 오래된 데이터면 정리 후 다른 탭 아님으로 처리
    if (cleanupStaleState()) {
      console.log('- 오래된 데이터 정리 후 허용');
      return false;
    }
    
    console.log('- 다른 탭에서 모달 열림 감지');
    return true;
  }
  
  // ✨ 현재 탭 고유 ID 생성 (페이지 로드시)
  if (!window.tabId) {
    window.tabId = Date.now() + '-' + Math.random()
    console.log('🆔 새 tabId 생성:', window.tabId);
  }
  
  // AI 챗봇 모달 열기 (중복 방지 포함)
  const openAiChat = async () => {
    // ✨ 시험 모드 체크 추가
    if (window.isExamMode) {
      alert("시험 중에는 학습 도우미를 사용할 수 없습니다! 📝");
      return;
    }
    
    if (isTransitioning.value) return
    
    // ✨ 다른 탭에서 열려있으면 알림
    if (checkOtherTabModal()) {
      alert("다른 창에서 학습 도우미가 이미 열려있어요! 먼저 닫아주세요. 🤖")
      return
    }
    
    // 현재 탭에서 이미 열려있으면 알림
    if (route.query.aichat === "1") {
      alert("학습 도우미가 이미 열려있어요! 😊")
      return
    }
    
    isTransitioning.value = true
    
    try {
      // ✨ 전역 상태에 현재 탭 정보 저장
      setGlobalModalState({
        isOpen: true,
        tabId: window.tabId,
        openedAt: Date.now(),
        url: window.location.href // ✨ URL도 저장
      })
      
      console.log('✅ AI 모달 열기:', window.tabId);
      
      // 새 모달 열기
      await router.push({ 
        query: { ...route.query, aichat: "1" } 
      })
    } finally {
      setTimeout(() => {
        isTransitioning.value = false
      }, 100)
    }
  }
  
  // AI 챗봇 모달 닫기
  const closeAiChat = async () => {
    if (isTransitioning.value) return
    
    isTransitioning.value = true
    
    try {
      // ✨ 전역 상태 제거
      setGlobalModalState(null)
      console.log('🚪 AI 모달 닫기:', window.tabId);
      
      const q = { ...route.query }
      delete q.aichat
      await router.push({ query: q })
    } finally {
      setTimeout(() => {
        isTransitioning.value = false
      }, 100)
    }
  }
  
  // 토글 (열려있으면 닫고, 닫혀있으면 열기)
  const toggleAiChat = () => {
    if (route.query.aichat === "1") {
      closeAiChat()
    } else {
      openAiChat()
    }
  }
  
  // ✨ 다른 탭에서 모달 상태 변경 감지
  watchGlobalModalState((newState) => {
    if (!newState && route.query.aichat === "1") {
      // 다른 탭에서 모달을 닫았으면 현재 탭도 닫기
      const q = { ...route.query }
      delete q.aichat
      router.push({ query: q })
    }
  })
  
  return {
    openAiChat,
    closeAiChat,
    toggleAiChat,
    isTransitioning: isTransitioning.value
  }
}
