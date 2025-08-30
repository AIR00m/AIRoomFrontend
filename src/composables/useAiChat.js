import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// ✨ 전역 상태 (파일 외부에 선언하여 모든 인스턴스가 공유)
const isTransitioning = ref(false)

export function useAiChat() {
  const route = useRoute()
  const router = useRouter()
  
  // AI 챗봇 모달 열기 (중복 방지 포함)
  const openAiChat = async () => {
    // 이미 전환 중이면 무시
    if (isTransitioning.value) return
    
    // 이미 열려있으면 알림
    if (route.query.aichat === "1") {
      alert("학습 도우미가 이미 열려있어요! 😊")
      return
    }
    
    isTransitioning.value = true
    
    try {
      // 새 모달 열기
      await router.push({ 
        query: { ...route.query, aichat: "1" } 
      })
    } finally {
      // 0.1초 후 전환 상태 해제
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
  
  return {
    openAiChat,
    closeAiChat,
    toggleAiChat,
    isTransitioning: isTransitioning.value
  }
}
