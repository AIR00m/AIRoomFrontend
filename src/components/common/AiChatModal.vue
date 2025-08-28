<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="modal-fade">
      <div v-if="isOpen" class="chat-overlay" @click="close"></div>
    </Transition>

    <!-- Modal -->
    <Transition name="modal-slide">
      <div
        v-if="isOpen"
        class="chat-modal"
        role="dialog"
        aria-modal="true"
        tabindex="0"
        @click.stop
        @keydown.esc="close"
      >
        <!-- Header -->
        <div class="chat-room-header">
          <div class="chat-title">AI 학습 도우미</div>
          <button class="chat-icon-btn" title="닫기" @click="close">❌</button>
        </div>

        <!-- Body -->
        <div class="ai-modal-body">
          <!-- AiChat.vue 재사용 -->
          <AiChat />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AiChat from "@/components/common/AiChat.vue";

const route = useRoute();
const router = useRouter();

// ?aichat=1 이면 열림
const isOpen = computed(() => route.query.aichat === "1");

function close() {
  const q = { ...route.query };
  delete q.aichat;
  router.push({ query: q });
}
</script>

<style scoped>
/* Overlay/Animation: StudentChatModal/ChatModal 과 동일 톤 */
.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(85, 68, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
}
.chat-modal {
  position: fixed; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: min(900px, 96vw);
  max-height: 88vh; min-height: 80vh;
  background: #fffbf0; border-radius: 30px;
  border: 3px solid #ffe066; box-shadow: 0 20px 60px rgba(255,221,41,.15);
  display: flex; flex-direction: column; overflow: hidden; z-index: 2010;
  outline: none;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-slide-enter-active { transition: all .4s cubic-bezier(.34,1.56,.64,1); }
.modal-slide-leave-active { transition: all .3s ease-out; }
.modal-slide-enter-from, .modal-slide-leave-to {
  opacity: 0; transform: translate(-50%, calc(-50% + 30px)) scale(.95);
}

.chat-room-header{
  background: #ffdd29; color:#8c6d32; padding: 1rem 1.5rem;
  display:flex; align-items:center; gap:.75rem; flex-shrink:0;
  text-shadow: 1px 1px 3px rgba(255,255,255,.5);
}
.chat-title{ font-size:1.25rem; font-weight:800; margin:0; flex:1; }
.chat-icon-btn{
  background: rgba(255,255,255,.3); border:0; color:#a37800;
  width: 40px; height: 40px; border-radius: 12px; cursor: pointer;
}

.ai-modal-body {
  flex: 1; overflow: hidden; padding: 10px;
  background: #fff9e6;
}

/* AiChat 내부 높이 강제(모달에 맞춤) */
.ai-modal-body :deep(.ai-chat){
  height: 66vh !important;
}
</style>
