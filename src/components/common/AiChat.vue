<template>
  <Teleport to="body">
    <!-- 오버레이 -->
    <Transition name="modal-fade">
      <div class="chat-overlay" @click="emit('close')"></div>
    </Transition>

    <!-- 모달 -->
    <Transition name="modal-slide">
      <div
        class="chat-modal"
        role="dialog"
        aria-modal="true"
        @click.stop
        tabindex="0"
      >
        <div class="chat-room-header">
          <div class="chat-title">아이룸 AI</div>
          <button class="chat-icon-btn" title="닫기" @click="emit('close')">❌</button>
        </div>

        <!-- 본문 -->
        <div class="modal-body">
          <div class="ai-chat-grid">
            <!-- Sidebar: Rooms -->
            <aside class="sidebar">
              <div class="sidebar-header">
                <h3>대화방</h3>
                <button class="new-room" @click="createRoom" :disabled="creatingRoom">
                  {{ creatingRoom ? "만드는 중..." : "새 대화" }}
                </button>
              </div>

              <div class="room-list" v-if="rooms.length">
                <div
                  v-for="r in rooms"
                  :key="r.acrNo || r.roomId"
                  class="room-item"
                  :class="{ active: currentRoomId === (r.acrNo || r.roomId) }"
                  role="button"
                  tabindex="0"
                  @click="selectRoom(r)"
                >
                  <div class="room-main">
                    <div class="room-title">
                      {{ r.lastQuestion ? trim(r.lastQuestion, 24) : "새 대화" }}
                    </div>
                    <div class="room-time">
                      {{ formatDateTime(r.lastQuestionTime) }}
                    </div>
                  </div>
                  <div class="room-actions">
                    <button
                      class="room-del-btn"
                      title="방 삭제"
                      @click.stop="removeRoom(r)"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              <div class="room-empty" v-else>
                아직 대화가 없어요.
                <button class="new-room inline" @click="createRoom">첫 대화 시작</button>
              </div>
            </aside>

            <!-- Main: Chat -->
            <section class="chat-area">
              <!-- Header -->
              <header class="chat-header">
                <div class="title">
                  {{ currentRoomTitle || "AI와의 대화" }}
                </div>
                <button
                  v-if="currentRoomId"
                  class="header-del-btn"
                  title="현재 방 삭제"
                  @click="removeCurrentRoom"
                >
                  🗑️
                </button>
              </header>

              <!-- Messages -->
              <div class="messages" ref="messagesRef" @scroll="onMessagesScroll">
                <div v-if="loadingHistory" class="loading">대화 내역 불러오는 중...</div>

                <div v-if="!messages.length && !loadingHistory" class="empty-hint">
                  <div class="emoji">💬</div>
                  <div class="line1">무엇이 궁금한가요?</div>
                  <div class="line2">아래에 질문을 입력해 보세요.</div>
                </div>

                <template v-for="m in messages" :key="m.id">
                  <div class="msg-row" :class="m.type === 'QUESTION' ? 'me' : 'ai'">
                    <div class="bubble">
                      <div class="text" v-html="m.content"></div>
                      <div class="meta">
                        <span class="time">{{ formatTime(m.at) }}</span>
                        <span v-if="m.pending" class="pending">보내는 중…</span>
                        <span v-if="m.error" class="error">전송 실패</span>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Input -->
              <footer class="input-bar">
                <input
                  v-model.trim="inputText"
                  type="text"
                  class="input"
                  placeholder="질문을 입력하세요 (예: 분수는 뭐에요?)"
                  @keyup.enter="send"
                  :disabled="!currentRoomId || sending"
                />
                <button class="send" @click="send" :disabled="!canSend">
                  {{ sending ? "전송중…" : "전송" }}
                </button>
              </footer>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import apiClient from "@/utils/apiClient";

const emit = defineEmits(["close"]);

// ========== 무한스크롤 state ==========
const hasMore = ref(true);
const loadingMore = ref(false);
const rooms = ref([]);
const creatingRoom = ref(false);
const currentRoomId = ref(null);
const currentRoomTitle = ref("");
const messages = ref([]);
const loadingHistory = ref(false);
const sending = ref(false);
const inputText = ref("");
const messagesRef = ref(null);

// ---------- computed ----------
const canSend = computed(
  () => !!currentRoomId.value && !!inputText.value && !sending.value
);

function trim(s, n) { if (!s) return ""; return s.length <= n ? s : s.slice(0, n) + "…"; }
function formatDateTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${day} ${hh}:${mm}`;
}
function formatTime(dt) {
  const d = new Date(dt || Date.now());
  const h = d.getHours();
  const ap = h >= 12 ? "오후" : "오전";
  const hh = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${ap} ${hh}:${mm}`;
}
function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
    }
  });
}
function toUiMessage(serverMsg) {
  const type =
    serverMsg.acmType ||
    serverMsg.type ||
    (serverMsg.sender ? serverMsg.sender.toUpperCase() : "ANSWER");
  const content =
    serverMsg.acmContent ||
    serverMsg.content ||
    serverMsg.text ||
    "";
  const at =
    serverMsg.createdAt ||
    serverMsg.sentAt ||
    new Date().toISOString();
  return {
    id: serverMsg.acmNo || serverMsg.id || crypto.randomUUID(),
    type,
    content,
    at,
  };
}

async function loadRooms() {
  const list = await apiClient.get("/aichat/rooms");
  rooms.value = Array.isArray(list) ? list : [];
  rooms.value.sort((a, b) => {
    const ta = a.lastQuestionTime ? new Date(a.lastQuestionTime).getTime() : 0;
    const tb = b.lastQuestionTime ? new Date(b.lastQuestionTime).getTime() : 0;
    return tb - ta;
  });
  if (!currentRoomId.value && rooms.value.length) {
    selectRoom(rooms.value[0]);
  }
}

async function createRoom() {
  creatingRoom.value = true;
  try {
    const res = await apiClient.post("/aichat/rooms", {});
    const room = res || {};
    rooms.value.unshift(room);
    selectRoom(room);
  } catch (e) {
    alert(e?.response?.data?.message || "방 생성에 실패했습니다.");
  } finally {
    creatingRoom.value = false;
  }
}

async function loadHistory(roomId) {
  messages.value = [];
  loadingHistory.value = true;
  hasMore.value = true;
  try {
    const list = await apiClient.get(`/aichat/rooms/${roomId}/messages`, {
      params: { limit: 30 },
    });
    if (Array.isArray(list)) {
      messages.value = list.map(toUiMessage).reverse();
      if (list.length < 30) hasMore.value = false;
    }
  } catch (_) {
    // no-op
  } finally {
    loadingHistory.value = false;
    scrollToBottom();
  }
}

function selectRoom(room) {
  const id = room?.acrNo || room?.roomId;
  currentRoomId.value = id;
  currentRoomTitle.value = room?.lastQuestion ? trim(room.lastQuestion, 24) : "새 대화";
  hasMore.value = true;
  loadHistory(id);
}

async function loadMoreHistory() {
  if (!currentRoomId.value || loadingMore.value || !hasMore.value) return;
  const first = messages.value[0];
  if (!first) return;
  loadingMore.value = true;
  try {
    const prevHeight = messagesRef.value?.scrollHeight || 0;
    const list = await apiClient.get(`/aichat/rooms/${currentRoomId.value}/messages`, {
      params: { limit: 30, beforeId: first.id },
    });
    const older = Array.isArray(list) ? list.map(toUiMessage).reverse() : [];
    if (older.length) {
      messages.value = [...older, ...messages.value];
      await nextTick();
      // 스크롤 위치 보정 (점프 방지)
      const newHeight = messagesRef.value?.scrollHeight || 0;
      if (messagesRef.value) {
        messagesRef.value.scrollTop = newHeight - prevHeight;
      }
    }
    if (older.length < 30) hasMore.value = false;
  } finally {
    loadingMore.value = false;
  }
}

function onMessagesScroll() {
  const el = messagesRef.value;
  if (!el) return;
  if (el.scrollTop <= 20) {
    loadMoreHistory();
  }
}

async function send() {
  const text = inputText.value.trim();
  if (!text || !currentRoomId.value || sending.value) return;
  sending.value = true;

  // 1) 로컬 질문 먼저 표시
  const q = {
    id: "tmp-" + Date.now(),
    type: "QUESTION",
    content: text.replace(/\n/g, "<br/>"),
    at: new Date().toISOString(),
    pending: true,
  };
  messages.value.push(q);
  inputText.value = "";
  scrollToBottom();

  try {
    // 2) 서버 호출
    const data = await apiClient.post("/aichat/ask", {
      roomId: String(currentRoomId.value),
      message: text,
    });

    q.pending = false;

    // 3) 답변 표시
    const answerText =
      data?.answer || data?.content || data?.message || "답변을 받지 못했어요.";
    const a = {
      id: "ai-" + Date.now(),
      type: "ANSWER",
      content: ("" + answerText).replace(/\n/g, "<br/>"),
      at: new Date().toISOString(),
    };
    messages.value.push(a);
    currentRoomTitle.value = trim(text, 24);

    // 사이드바 최신 정렬 갱신
    const idx = rooms.value.findIndex(
      (r) => (r.acrNo || r.roomId) === currentRoomId.value
    );
    if (idx >= 0) {
      rooms.value[idx].lastQuestion = text;
      rooms.value[idx].lastQuestionTime = new Date().toISOString();
      const [picked] = rooms.value.splice(idx, 1);
      rooms.value.unshift(picked);
    }
    scrollToBottom();
  } catch (_) {
    q.pending = false;
    q.error = true;
  } finally {
    sending.value = false;
  }
}

async function removeRoom(room) {
  const id = room?.acrNo || room?.roomId;
  if (!id) return;
  if (!confirm("이 대화방을 삭제할까요? 대화 내용도 함께 삭제됩니다.")) return;
  try {
    await apiClient.delete(`/aichat/rooms/${id}`);
    const idx = rooms.value.findIndex((r) => (r.acrNo || r.roomId) === id);
    if (idx >= 0) rooms.value.splice(idx, 1);
    if (currentRoomId.value === id) {
      if (rooms.value.length) {
        selectRoom(rooms.value[0]);
      } else {
        currentRoomId.value = null;
        currentRoomTitle.value = "";
        messages.value = [];
      }
    }
  } catch (_) {
    alert("방 삭제에 실패했습니다.");
  }
}

async function removeCurrentRoom() {
  const r = rooms.value.find((r) => (r.acrNo || r.roomId) === currentRoomId.value);
  if (r) await removeRoom(r);
}

// ---------- lifecycle ----------
onMounted(async () => {
  try {
    await loadRooms();
  } catch (e) {
    console.warn("rooms sync failed:", e);
  }

  if (!rooms.value.length) {
    await createRoom();
  }
});
</script>

<style scoped>
/* 모달 외곽 - 오렌지 계열로 변경 */
.chat-overlay { 
  position: fixed; 
  inset: 0; 
  background: rgba(255, 152, 0, 0.4); 
  backdrop-filter: blur(4px); 
  z-index: 2000; 
}

.chat-modal { 
  position: fixed; 
  left: 50%; 
  top: 50%; 
  transform: translate(-50%, -50%);
  width: min(980px, 95vw); 
  height: 85vh; 
  max-height: 90vh; 
  background: #fffbf0; 
  border-radius: 30px;
  border: 3px solid #ffe066; 
  box-shadow: 0 20px 60px rgba(255, 152, 0, 0.15); 
  display: flex; 
  flex-direction: column; 
  overflow: hidden; 
  z-index: 2010; 
  outline: none;
}

.modal-fade-enter-active, .modal-fade-leave-active { 
  transition: opacity .3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to { 
  opacity: 0;
}

.modal-slide-enter-active { 
  transition: all .4s cubic-bezier(.34, 1.56, .64, 1); 
}

.modal-slide-leave-active { 
  transition: all .3s ease-out; 
}

.modal-slide-enter-from, .modal-slide-leave-to { 
  opacity: 0; 
  transform: translate(-50%, calc(-50% + 30px)) scale(.95); 
}

.chat-room-header { 
  background: #ff9800; 
  color: white; 
  padding: 1rem 1.5rem; 
  display: flex; 
  align-items: center; 
  gap: .75rem; 
  flex-shrink: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-title { 
  font-size: 1.3rem; 
  font-weight: 800; 
  margin: 0; 
  flex: 1;
}

.chat-icon-btn { 
  background: rgba(255, 255, 255, 0.3); 
  border: 0; 
  color: white; 
  width: 40px; 
  height: 40px; 
  border-radius: 12px; 
  cursor: pointer; 
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-icon-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.modal-body { 
  flex: 1; 
  display: flex; 
  min-height: 0; 
  overflow: hidden; 
  background: #fff9e6; 
}

/* 그리드 */
.ai-chat-grid {
  display: grid; 
  grid-template-columns: 280px 1fr;
  width: 100%; 
  height: 100%; 
  min-height: 0; 
  gap: 0;
}

/* Sidebar - 오렌지 계열로 변경 */
.sidebar {
  background: #fff3e0; 
  border-right: 2px solid #ffcc80;
  display: flex; 
  flex-direction: column; 
  min-height: 0;
}

.sidebar-header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  gap: 8px; 
  padding: 14px 12px; 
  border-bottom: 2px solid #ffcc80; 
}

.sidebar-header h3 { 
  margin: 0; 
  font-size: 18px; 
  color: #e65100; 
}

.new-room { 
  background: #ffcc80; 
  border: 1px solid #ff9800; 
  padding: 6px 10px; 
  border-radius: 10px; 
  cursor: pointer; 
  color: #e65100; 
  font-weight: 700; 
  transition: all 0.2s ease;
}

.new-room:hover {
  background: #ffb74d;
  transform: translateY(-1px);
}

.new-room.inline { 
  margin-left: 8px; 
} 

.new-room:disabled { 
  opacity: 0.7; 
  cursor: not-allowed; 
}

.room-list { 
  padding: 8px; 
  flex: 1; 
  min-height: 0; 
  overflow-y: auto; 
  -webkit-overflow-scrolling: touch; 
  overscroll-behavior: contain; 
}

.room-item { 
  width: 100%; 
  display: grid; 
  grid-template-columns: 1fr auto; 
  align-items: center; 
  background: white; 
  border: 2px solid #ffcc80;
  color: #e65100; 
  padding: 10px 12px; 
  border-radius: 12px; 
  margin-bottom: 8px; 
  cursor: pointer; 
  transition: all 0.2s ease; 
}

.room-item:hover { 
  transform: translateY(-1px); 
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
}

.room-item.active { 
  background: #ff9800;
  color: white;
  border-color: #f57c00;
}

.room-title { 
  font-weight: 800; 
  font-size: 14px; 
  margin-bottom: 4px; 
  word-break: break-word; 
}

.room-time { 
  font-size: 12px; 
  opacity: .8; 
}

.room-actions { 
  display: flex; 
  gap: 6px; 
  align-items: center; 
}

.room-del-btn { 
  background: transparent; 
  border: 0; 
  cursor: pointer; 
  font-size: 16px; 
  line-height: 1; 
  padding: 4px; 
  border-radius: 6px; 
  transition: all 0.2s ease;
}

.room-del-btn:hover { 
  background: rgba(0, 0, 0, .06); 
}

.room-empty { 
  padding: 16px; 
  color: #e65100; 
}

/* Chat */
.chat-area {
  display: grid; 
  grid-template-rows: auto 1fr auto;
  height: 100%; 
  min-height: 0;
}

.chat-header { 
  background: #fff3e0; 
  border-bottom: 2px solid #ffcc80; 
  padding: 12px 16px; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}

.chat-header .title { 
  font-weight: 800; 
  color: #e65100; 
  flex: 1; 
}

.header-del-btn { 
  background: rgba(255, 152, 0, 0.2); 
  border: 1px solid #ff9800; 
  border-radius: 10px; 
  padding: 6px 10px; 
  cursor: pointer; 
  transition: all 0.2s ease;
}

.header-del-btn:hover {
  background: rgba(255, 152, 0, 0.3);
}

.messages {
  padding: 14px 16px; 
  background: #fffdf5;
  overflow-y: auto; 
  min-height: 0; 
  -webkit-overflow-scrolling: touch; 
  overscroll-behavior: contain;
}

.loading { 
  text-align: center; 
  color: #ff9800; 
}

.empty-hint { 
  text-align: center; 
  color: #e65100; 
  padding-top: 32px; 
}

.empty-hint .emoji { 
  font-size: 40px; 
  margin-bottom: 8px; 
}

.empty-hint .line1 { 
  font-weight: 800; 
  margin-bottom: 4px; 
}

.empty-hint .line2 { 
  opacity: .9; 
}

.msg-row { 
  display: flex; 
  margin: 8px 0; 
}

.msg-row.me { 
  justify-content: flex-end; 
} 

.msg-row.ai { 
  justify-content: flex-start; 
}

.bubble { 
  max-width: 75%; 
  background: white; 
  border: 2px solid #ffe066; 
  color: #e65100; 
  padding: 10px 12px; 
  border-radius: 18px; 
  word-break: break-word; 
  white-space: pre-wrap; 
  line-height: 1.5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.msg-row.me .bubble { 
  background: #ff9800; 
  color: white; 
  border-color: #f57c00;
  border-bottom-right-radius: 6px;
}

.msg-row.ai .bubble {
  border-bottom-left-radius: 6px;
}

.bubble .meta { 
  font-size: 12px; 
  margin-top: 6px; 
  text-align: right; 
  opacity: .85; 
}

.pending { 
  margin-left: 6px; 
} 

.error { 
  color: #f44336; 
  margin-left: 6px; 
}

/* Input */
.input-bar { 
  display: grid; 
  grid-template-columns: 1fr auto; 
  gap: 8px; 
  padding: 12px; 
  border-top: 2px solid #ffcc80; 
  background: #fff3e0; 
}

.input { 
  border: 2px solid #ffcc80; 
  border-radius: 15px; 
  padding: 10px 12px; 
  font-size: 15px; 
  color: #e65100; 
  background: white; 
}

.input:focus { 
  outline: none; 
  border-color: #ff9800; 
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.25); 
}

.send { 
  background: #ff9800; 
  border: 2px solid #f57c00; 
  color: white; 
  font-weight: 800; 
  padding: 10px 16px; 
  border-radius: 15px; 
  cursor: pointer; 
  transition: all 0.2s ease;
}

.send:hover {
  background: #f57c00;
  transform: translateY(-1px);
}

.send:disabled { 
  opacity: .7; 
  cursor: not-allowed; 
}

/* 스크롤바 스타일링 */
.messages::-webkit-scrollbar,
.room-list::-webkit-scrollbar {
  width: 8px;
}

.messages::-webkit-scrollbar-track,
.room-list::-webkit-scrollbar-track {
  background: #fff3e0;
  border-radius: 4px;
}

.messages::-webkit-scrollbar-thumb,
.room-list::-webkit-scrollbar-thumb {
  background: #ffcc80;
  border-radius: 4px;
}

.messages::-webkit-scrollbar-thumb:hover,
.room-list::-webkit-scrollbar-thumb:hover {
  background: #ff9800;
}
</style>
