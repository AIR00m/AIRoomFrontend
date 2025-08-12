<!-- src/components/ChatModal.vue -->
<template>
  <div v-if="chat.isOpen" class="chat-overlay" @click.self="chat.close()">
    <div class="chat-panel">
      <div class="chat-header">
        <strong>{{ chat.activeRoom?.name ?? "대화" }}</strong>
        <div class="d-flex align-items-center gap-3">
          <i class="bi bi-search"></i>
          <i class="bi bi-trash"></i>
          <button class="btn btn-sm btn-light" @click="chat.close()">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- 방이 선택되지 않았을 때: 학생/대화 목록 뷰 -->
      <div v-if="!chat.activeRoom" class="flex-grow-1 d-flex">
        <aside class="list-pane">
          <div class="pane-title">학생 목록</div>
          <button
            v-for="r in chat.rooms"
            :key="r.id"
            class="list-item"
            @click="chat.enterRoom(r.id)"
          >
            <span>{{ r.name }}</span>
            <span v-if="r.unread" class="badge bg-primary">{{ r.unread }}</span>
          </button>
        </aside>
        <section class="list-pane border-start">
          <div class="pane-title">대화 목록</div>
          <button
            v-for="r in chat.rooms"
            :key="r.id"
            class="list-item"
            @click="chat.enterRoom(r.id)"
          >
            {{ r.name }} 대화방
          </button>
        </section>
      </div>

      <!-- 방 입장 시: 메시지 + 입력 -->
      <div v-else class="room-area">
        <div ref="scrollBox" class="msg-scroll">
          <template v-for="m in chat.activeMessages" :key="m.id">
            <!-- 날짜 칩 예: 필요하면 조건 넣어 그룹핑 -->
            <div v-if="m.dateChip" class="date-chip">{{ m.dateChip }}</div>
            <div class="msg" :class="m.sender === '선생님' ? 'me' : 'you'">
              <div class="bubble">{{ m.text }}</div>
              <div class="time">{{ m.time }}</div>
            </div>
          </template>
        </div>

        <div class="input-row">
          <input
            v-model="text"
            @keyup.enter="send"
            class="form-control flex-grow-1"
            placeholder="대화를 입력하세요."
          />
          <button class="btn btn-primary ms-2" @click="send">
            <i class="bi bi-send-fill"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onUpdated, ref } from "vue";
import { useChatStore } from "@/stores/chat";
const chat = useChatStore();

const text = ref("");
const scrollBox = ref(null);

const send = () => {
  if (!text.value.trim()) return;
  chat.send(text.value);
  text.value = "";
  nextTick(() => {
    scrollBox.value?.scrollTo({
      top: scrollBox.value.scrollHeight,
      behavior: "smooth",
    });
  });
};

// 새 메시지 들어오면 자동 스크롤
onUpdated(() => {
  nextTick(() => {
    scrollBox.value?.scrollTo({ top: scrollBox.value.scrollHeight });
  });
});
</script>

<style scoped>
.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}
.chat-panel {
  width: min(900px, 95vw);
  height: min(600px, 88vh);
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}
.chat-header {
  background: #0b4576;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
.list-pane {
  width: 50%;
  padding: 1rem;
  overflow: auto;
}
.pane-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
}
.list-item {
  width: 100%;
  text-align: left;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 10px;
  padding: 0.7rem 0.9rem;
  margin-bottom: 0.6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.room-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.msg-scroll {
  flex: 1;
  overflow: auto;
  padding: 1rem;
  background: #f8fbff;
}
.date-chip {
  align-self: center;
  background: #edf2f7;
  color: #4a5568;
  font-size: 0.8rem;
  border-radius: 16px;
  padding: 0.2rem 0.6rem;
  margin: 0.4rem auto;
}
.msg {
  display: flex;
  flex-direction: column;
  max-width: 72%;
  margin: 0.25rem 0;
}
.msg.me {
  align-self: flex-end;
}
.msg.you {
  align-self: flex-start;
}
.bubble {
  border-radius: 16px;
  padding: 0.6rem 0.8rem;
}
.msg.me .bubble {
  background: #1160ff;
  color: #fff;
}
.msg.you .bubble {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}
.time {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.2rem;
}
.input-row {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
  background: #fff;
}
</style>
