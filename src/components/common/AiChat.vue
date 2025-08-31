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
          <div class="chat-title">
            <span class="ai-icon">🤖</span>
            <span class="title-text">학습 도우미</span>
          </div>
          <button class="chat-icon-btn" title="닫기" @click="emit('close')">❌</button>
        </div>

        <!-- 본문 -->
        <div class="modal-body">
          <div class="ai-chat-grid">
            <!-- Sidebar: Rooms -->
            <aside class="sidebar">
              <div class="sidebar-header">
                <h3>📝 질문 목록</h3>
                <button class="new-room" @click="createRoom" :disabled="creatingRoom">
                  {{ creatingRoom ? "만드는 중..." : "새 질문" }}
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
                      {{ r.lastQuestion ? trim(r.lastQuestion, 24) : "새 질문" }}
                    </div>
                    <div class="room-time">
                      {{ formatDateTime(r.lastQuestionTime) }}
                    </div>
                  </div>
                  <div class="room-actions">
                    <button
                      class="room-del-btn"
                      title="질문 삭제"
                      @click.stop="removeRoom(r)"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              <div class="room-empty" v-else>
                아직 질문이 없어요.
                <button class="new-room inline" @click="createRoom">첫 질문하기</button>
              </div>
            </aside>

            <!-- Main: Chat -->
            <section class="chat-area">
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
                  placeholder="궁금한 것을 물어보세요! (예: 분수는 뭐에요?)"
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

// ---------- utils ----------
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

// ---------- API ----------
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
    alert(e?.response?.data?.message || "새 질문을 만들지 못했어요.");
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
  currentRoomTitle.value = room?.lastQuestion ? trim(room.lastQuestion, 24) : "새 질문";
  hasMore.value = true;
  loadHistory(id);
}

// 이전 메시지 더 불러오기 (상단 근접 시)
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
  if (!confirm("이 질문을 삭제할까요? 대화 내용도 함께 삭제됩니다.")) return;
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
    alert("질문 삭제에 실패했습니다.");
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
/* 모달 외곽 */
.chat-overlay{ position: fixed; inset:0; background: rgba(85,68,0,.3); backdrop-filter: blur(3px); z-index:2000; }
.chat-modal{ position: fixed; left:50%; top:50%; transform: translate(-50%,-50%);
  width:min(980px,95vw); height:85vh; max-height:90vh; background:#fefcf0; border-radius:30px;
  border:2px solid #e6d18a; box-shadow:0 20px 60px rgba(255,221,41,.12); display:flex; flex-direction:column; overflow:hidden; z-index:2010; outline:none;
  font-family: "Comic Sans MS", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif !important;
}
.modal-fade-enter-active,.modal-fade-leave-active{ transition: opacity .3s ease;}
.modal-fade-enter-from,.modal-fade-leave-to{ opacity:0;}
.modal-slide-enter-active{ transition: all .4s cubic-bezier(.34,1.56,.64,1); }
.modal-slide-leave-active{ transition: all .3s ease-out; }
.modal-slide-enter-from,.modal-slide-leave-to{ opacity:0; transform: translate(-50%, calc(-50% + 30px)) scale(.95); }

.chat-room-header{ 
  background: linear-gradient(135deg, #f5d63d 0%, #f0ca47 50%, #e6b800 100%); 
  color: white; 
  padding:1rem 1.5rem; 
  display:flex; 
  align-items:center; 
  gap:.75rem; 
  flex-shrink:0;
  border-bottom: 2px solid #d4b570;
}

.chat-title{ 
  font-size:1.3rem; 
  font-weight:800; 
  margin:0; 
  flex:1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
}

.ai-icon {
  font-size: 1.4rem;
  animation: bounce 2s infinite;
}

.title-text {
  color: white;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

.chat-icon-btn{ 
  background:rgba(255,255,255,.25); 
  border: 2px solid rgba(255,255,255,.4); 
  color: white; 
  width:40px; 
  height:40px; 
  border-radius:12px; 
  cursor:pointer; 
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-icon-btn:hover {
  background: rgba(255,255,255,.4);
  transform: scale(1.05);
}

.modal-body{ flex:1; display:flex; min-height:0; overflow:hidden; background:#faf7eb; }

/* 그리드 */
.ai-chat-grid{
  display:grid; grid-template-columns:280px 1fr;
  width:100%; height:100%; min-height:0; gap:0;
}

/* Sidebar */
.sidebar{
  background: linear-gradient(135deg, #f7f3c4, #f5f2cd); 
  border-right:2px solid #d4b570;
  display:flex; 
  flex-direction:column; 
  min-height:0;
}

.sidebar-header{ 
  display:flex; 
  align-items:center; 
  justify-content:space-between; 
  gap:8px; 
  padding:14px 12px; 
  border-bottom:2px solid #d4b570; 
  background: rgba(245, 210, 61, 0.2);
}

.sidebar-header h3{ 
  margin:0; 
  font-size:16px; 
  color:#8b6914; 
  font-weight: 800;
}

.new-room{ 
  background: linear-gradient(135deg, #f7f3c4, #f5f2cd);
  border:2px solid #d4b570; 
  padding:8px 12px; 
  border-radius:15px; 
  cursor:pointer; 
  color:#8b6914; 
  font-weight:700; 
  transition: all 0.3s ease;
  font-size: 12px;
}

.new-room:hover {
  background: linear-gradient(135deg, #e6d18a, #f7f3c4);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(245, 210, 61, 0.2);
}

.new-room.inline{ margin-left:8px; } 
.new-room:disabled{ opacity:0.7; cursor:not-allowed; }

.room-list{ 
  padding:8px; 
  flex:1; 
  min-height:0; 
  overflow-y:auto; 
  -webkit-overflow-scrolling:touch; 
  overscroll-behavior:contain; 
}

.room-item{ 
  width:100%; 
  display:grid; 
  grid-template-columns:1fr auto; 
  align-items:center; 
  background: #fdfbf2;
  border:2px solid #d4b570;
  color:#8b6914; 
  padding:12px; 
  border-radius:15px; 
  margin-bottom:8px; 
  cursor:pointer; 
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(245, 210, 61, 0.08);
}

.room-item:hover{ 
  transform: translateY(-2px); 
  box-shadow: 0 5px 15px rgba(245, 210, 61, 0.15);
}

.room-item.active{ 
  background: linear-gradient(135deg, #f7f3c4, #f5f2cd);
  border-color: #e6b800;
  box-shadow: 0 5px 15px rgba(245, 210, 61, 0.2);
}

.room-title{ 
  font-weight:800; 
  font-size:14px; 
  margin-bottom:4px; 
  word-break:break-word; 
  color: #b8860b;
}

.room-time{ 
  font-size:12px; 
  opacity:.8; 
  color: #cd853f;
}

.room-actions{ 
  display:flex; 
  gap:6px; 
  align-items:center; 
}

.room-del-btn{ 
  background:transparent; 
  border:0; 
  cursor:pointer; 
  font-size:16px; 
  line-height:1; 
  padding:6px; 
  border-radius:8px; 
  transition: all 0.3s ease;
}

.room-del-btn:hover{ 
  background: rgba(245,210,61,.15); 
  transform: scale(1.1);
}

.room-empty{ 
  padding:20px 16px; 
  color:#8b6914; 
  text-align: center;
  font-weight: 600;
}

/* Chat */
.chat-area{
  display:grid; 
  grid-template-rows: 1fr auto;
  height:100%; 
  min-height:0;
}

.messages{
  padding:16px; 
  background: #fdfcf7;
  overflow-y:auto; 
  min-height:0; 
  -webkit-overflow-scrolling:touch; 
  overscroll-behavior:contain;
}

.loading{ 
  text-align:center; 
  color:#b8860b; 
  font-weight: 600;
  padding: 20px;
}

.empty-hint{ 
  text-align:center; 
  color:#8b6914; 
  padding-top:40px; 
}

.empty-hint .emoji{ 
  font-size:48px; 
  margin-bottom:12px; 
}

.empty-hint .line1{ 
  font-weight:800; 
  margin-bottom:8px; 
  font-size: 1.2rem;
  color: #b8860b;
}

.empty-hint .line2{ 
  opacity:.8; 
  color: #cd853f;
  font-weight: 600;
}

.msg-row{ 
  display:flex; 
  margin:12px 0; 
}

.msg-row.me{ 
  justify-content:flex-end; 
} 

.msg-row.ai{ 
  justify-content:flex-start; 
}

.bubble{ 
  max-width:75%; 
  background:#fdfcf7; 
  border:2px solid #d4b570; 
  color:#8b6914; 
  padding:12px 16px; 
  border-radius:18px; 
  word-break:break-word; 
  white-space:pre-wrap; 
  box-shadow: 0 2px 8px rgba(245, 210, 61, 0.08);
}

.msg-row.me .bubble{ 
  background: linear-gradient(135deg, #f7f3c4, #f5f2cd);
  color:#6b5216; 
  border-color:#e6b800; 
}

.bubble .meta{ 
  font-size:12px; 
  margin-top:8px; 
  text-align:right; 
  opacity:.7; 
  font-weight: 600;
}

.pending{ 
  margin-left:6px; 
  color: #cd853f;
} 

.error{ 
  color:#c92a2a; 
  margin-left:6px; 
}

/* Input */
.input-bar{ 
  display:grid; 
  grid-template-columns:1fr auto; 
  gap:10px; 
  padding:16px; 
  border-top:2px solid #d4b570; 
  background: linear-gradient(135deg, #f5f2cd, #f2efdc);
}

.input{ 
  border:2px solid #d4b570; 
  border-radius:15px; 
  padding:12px 16px; 
  font-size:15px; 
  color:#8b6914; 
  background:#fdfcf7; 
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(245, 210, 61, 0.08);
}

.input:focus{ 
  outline:none; 
  border-color:#e6b800; 
  box-shadow:0 0 0 3px rgba(230,184,0,.2); 
}

.send{ 
  background: linear-gradient(135deg, #e6b800, #cd853f);
  border:2px solid #b8860b; 
  color: white; 
  font-weight:800; 
  padding:12px 20px; 
  border-radius:15px; 
  cursor:pointer; 
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(230, 184, 0, 0.25);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
}

.send:hover:not(:disabled) {
  background: linear-gradient(135deg, #cd853f, #b8860b);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(230, 184, 0, 0.3);
}

.send:disabled{ 
  opacity:.7; 
  cursor:not-allowed; 
  transform: none;
  box-shadow: 0 2px 8px rgba(230, 184, 0, 0.15);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .chat-modal {
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    border: none;
  }
  
  .ai-chat-grid {
    grid-template-columns: 250px 1fr;
  }
  
  .sidebar-header h3 {
    font-size: 14px;
  }
  
  .new-room {
    font-size: 11px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .ai-chat-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 200px 1fr;
  }
  
  .sidebar {
    border-right: none;
    border-bottom: 2px solid #d4b570;
  }
  
  .room-list {
    max-height: 120px;
  }
}

/* 접근성 */
.chat-icon-btn:focus,
.new-room:focus,
.room-del-btn:focus,
.send:focus,
.input:focus {
  outline: 3px solid #f5d63d;
  outline-offset: 2px;
}

/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  .ai-icon {
    animation: none;
  }
  
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
