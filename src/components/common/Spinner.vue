<template>
  <Transition name="fade" appear>
    <div
      v-if="isLoading"
      class="spinner-overlay"
      :class="[
        overlayType === 'fullscreen'
          ? 'overlay-fullscreen'
          : 'overlay-container',
        spinnerSizeClass,
      ]"
      :style="overlayStyle"
    >
      <div class="loading-content">
        <div class="evolution-spinner" :style="animationStyle">
          <div class="evolution-stage stage-1">🥚</div>
          <div class="evolution-stage stage-2">🐣</div>
          <div class="evolution-stage stage-3">🐥</div>
          <!-- <div class="evolution-stage stage-3">🐤</div> -->
        </div>
        <p v-if="showText" class="loading-text">{{ loadingText }}</p>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: "Spinner",
  props: {
    // 로딩 상태를 외부에서 제어
    isLoading: {
      type: Boolean,
      default: true,
    },
    // 로딩 텍스트 커스터마이징
    loadingText: {
      type: String,
      default: "정보를 불러오고 있어요...",
    },
    // 텍스트 표시 여부
    showText: {
      type: Boolean,
      default: true,
    },
    // 애니메이션 속도 (초 단위)
    animationDuration: {
      type: Number,
      default: 4,
    },
    // 스피너 크기
    size: {
      type: String,
      default: "medium", // 'small', 'medium', 'large'
      validator: (value) => ["small", "medium", "large"].includes(value),
    },
    // 오버레이 타입
    overlayType: {
      type: String,
      default: "fullscreen", // 'fullscreen', 'container'
      validator: (value) => ["fullscreen", "container"].includes(value),
    },
    // 배경 색상 (rgba, hex, 등 모든 CSS 색상 지원)
    backgroundColor: {
      type: String,
      default: "rgba(255, 255, 255, 0.9)",
    },
    // z-index 값
    zIndex: {
      type: Number,
      default: 9999,
    },
    // 배경 블러 효과
    backdropBlur: {
      type: Boolean,
      default: false,
    },
    // 클릭으로 닫기 방지
    preventClose: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    // 크기에 따른 스타일 계산
    spinnerSizeClass() {
      return `spinner-${this.size}`;
    },
    // 애니메이션 지속시간 스타일
    animationStyle() {
      return {
        "--animation-duration": `${this.animationDuration}s`,
      };
    },
    // 오버레이 스타일
    overlayStyle() {
      return {
        backgroundColor: this.backgroundColor,
        zIndex: this.zIndex,
        backdropFilter: this.backdropBlur ? "blur(4px)" : "none",
        pointerEvents: this.preventClose ? "auto" : "none",
      };
    },
  },
  methods: {
    // 오버레이 클릭 시 (배경 클릭 시)
    handleOverlayClick(event) {
      if (!this.preventClose && event.target === event.currentTarget) {
        this.$emit("close");
      }
    },
  },
};
</script>

<style scoped>
/* 오버레이 기본 스타일 */
.spinner-overlay {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

/* 전체 화면 오버레이 */
.overlay-fullscreen {
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

/* 컨테이너 오버레이 */
.overlay-container {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 로딩 컨텐츠 컨테이너 */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.evolution-spinner {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.evolution-stage {
  position: absolute;
  font-size: 60px;
  opacity: 0;
  transform: scale(0.5);
  animation: evolve var(--animation-duration, 4s) infinite ease-in-out;
}

.evolution-stage.stage-1 {
  animation-delay: 0s;
}

.evolution-stage.stage-2 {
  animation-delay: calc(var(--animation-duration, 4s) * 0.325);
}

.evolution-stage.stage-3 {
  animation-delay: calc(var(--animation-duration, 4s) * 0.65);
}

@keyframes evolve {
  0% {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
  15% {
    opacity: 1;
    transform: scale(1.2) rotate(0deg);
  }
  25% {
    opacity: 1;
    transform: scale(1) rotate(5deg);
  }
  30% {
    opacity: 1;
    transform: scale(1) rotate(-5deg);
  }
  35% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  45% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  55% {
    opacity: 0;
    transform: scale(0.8) rotate(10deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
}

.loading-text {
  font-size: 16px;
  color: #666;
  margin: 0;
  font-weight: 500;
  animation: fade 2s ease-in-out infinite;
  text-align: center;
}

@keyframes fade {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* 크기 변형 */
.spinner-small .evolution-spinner {
  width: 60px;
  height: 60px;
  margin-bottom: 16px;
}

.spinner-small .evolution-stage {
  font-size: 36px;
}

.spinner-small .loading-text {
  font-size: 14px;
}

.spinner-small .loading-content {
  padding: 24px;
}

.spinner-medium .evolution-spinner {
  width: 100px;
  height: 100px;
  margin-bottom: 24px;
}

.spinner-medium .evolution-stage {
  font-size: 60px;
}

.spinner-medium .loading-text {
  font-size: 16px;
}

.spinner-medium .loading-content {
  padding: 40px;
}

.spinner-large .evolution-spinner {
  width: 140px;
  height: 140px;
  margin-bottom: 32px;
}

.spinner-large .evolution-stage {
  font-size: 84px;
}

.spinner-large .loading-text {
  font-size: 18px;
}

.spinner-large .loading-content {
  padding: 48px;
}

/* 페이드 트랜지션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  .loading-content {
    background: rgba(30, 30, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .loading-text {
    color: #ccc;
  }
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .loading-content {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }

  .spinner-large .loading-content {
    padding: 32px;
  }

  .spinner-large .evolution-spinner {
    width: 100px;
    height: 100px;
  }

  .spinner-large .evolution-stage {
    font-size: 60px;
  }
}
</style>
