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
              <div class="messages" ref="messagesRef">
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
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/utils/apiClient";

const emit = defineEmits(["close"]);

// ---- state ----
const authStore = useAuthStore();
const rooms = ref([]);
const creatingRoom = ref(false);
const currentRoomId = ref(null);
const currentRoomTitle = ref("");
const messages = ref([]);
const loadingHistory = ref(false);
const sending = ref(false);
const inputText = ref("");
const messagesRef = ref(null);

// JWT만 신뢰해서 memberNo 결정 (없으면 memberId → 최후 1)
const currentUser = computed(() => {
  const info = (authStore.getUserInfo && authStore.getUserInfo()) || {};
  const memberNo = info.classRoomStudentNo || info.memberId || 1;
  return { memberNo };
});

const canSend = computed(
  () => !!currentRoomId.value && !!inputText.value && !sending.value
);

// ---- utils ----
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
  const ampm = h >= 12 ? "오후" : "오전";
  const hh = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${ampm} ${hh}:${mm}`;
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

// ---- API ----
async function loadRooms() {
  const list = await apiClient.get("/aichat/rooms", {
    params: { memberNo: currentUser.value.memberNo },
  });
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
  try {
    creatingRoom.value = true;
    const res = await apiClient.post("/aichat/rooms", {
      memberNo: currentUser.value.memberNo,
    });
    const room = res || {};
    rooms.value.unshift(room);
    selectRoom(room);
  } finally {
    creatingRoom.value = false;
  }
}

async function loadHistory(roomId) {
  messages.value = [];
  loadingHistory.value = true;
  try {
    const list = await apiClient.get(`/aichat/rooms/${roomId}/messages`, {
      params: { limit: 30 },
    });
    if (Array.isArray(list)) {
      messages.value = list.map(toUiMessage).reverse();
    }
  } catch (_) {
    // MVP: 히스토리 없으면 조용히 빈 화면
  } finally {
    loadingHistory.value = false;
    scrollToBottom();
  }
}

function selectRoom(room) {
  const id = room?.acrNo || room?.roomId;
  currentRoomId.value = id;
  currentRoomTitle.value = room?.lastQuestion ? trim(room.lastQuestion, 24) : "새 대화";
  loadHistory(id);
}

async function send() {
  const text = inputText.value.trim();
  if (!text || !currentRoomId.value || sending.value) return;
  sending.value = true;

  // 1) 로컬 질문 띄우기
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
    // 2) 백엔드 호출
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

    // 사이드바 최근 정렬 갱신
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

// ---- lifecycle ----
onMounted(async () => {
  await loadRooms();
  if (!rooms.value.length) {
    await createRoom();
  }
});
</script>

<style scoped>
/* 모달 외곽 */
.chat-overlay{ position: fixed; inset:0; background: rgba(85,68,0,.4); backdrop-filter: blur(4px); z-index:2000; }
.chat-modal{ position: fixed; left:50%; top:50%; transform: translate(-50%,-50%);
  width:min(980px,95vw); max-height:90vh; min-height:80vh; background:#fffbf0; border-radius:30px;
  border:3px solid #ffe066; box-shadow:0 20px 60px rgba(255,221,41,.15); display:flex; flex-direction:column; overflow:hidden; z-index:2010; outline:none;}
.modal-fade-enter-active,.modal-fade-leave-active{ transition: opacity .3s ease;}
.modal-fade-enter-from,.modal-fade-leave-to{ opacity:0;}
.modal-slide-enter-active{ transition: all .4s cubic-bezier(.34,1.56,.64,1); }
.modal-slide-leave-active{ transition: all .3s ease-out; }
.modal-slide-enter-from,.modal-slide-leave-to{ opacity:0; transform: translate(-50%, calc(-50% + 30px)) scale(.95); }
.chat-room-header{ background:#ffdd29; color:#8c6d32; padding:1rem 1.5rem; display:flex; align-items:center; gap:.75rem; flex-shrink:0;}
.chat-title{ font-size:1.3rem; font-weight:800; margin:0; flex:1;}
.chat-icon-btn{ background:rgba(255,255,255,.3); border:0; color:#a37800; width:40px; height:40px; border-radius:12px; cursor:pointer; }
.modal-body{ flex:1; overflow: hidden; background:#fff9e6; }

/* 그리드 */
.ai-chat-grid{ display:grid; grid-template-columns:280px 1fr; height: calc(90vh - 120px); gap:0; }

/* Sidebar */
.sidebar{ background:#fff3bf; border-right:2px solid #ffe08a; display:flex; flex-direction:column; }
.sidebar-header{ display:flex; align-items:center; justify-content:space-between; gap:8px; padding:14px 12px; border-bottom:2px solid #ffe08a; }
.sidebar-header h3{ margin:0; font-size:18px; color:#79520a; }
.new-room{ background:#ffec99; border:1px solid #ffd43b; padding:6px 10px; border-radius:10px; cursor:pointer; color:#704800; font-weight:700; }
.new-room.inline{ margin-left:8px; } .new-room:disabled{ opacity:0.7; cursor:not-allowed; }
.room-list{ overflow-y:auto; padding:8px; flex:1; }
.room-item{ width:100%; display:grid; grid-template-columns:1fr auto; align-items:center; background:#fff9db; border:2px solid #ffd43b;
  color:#704800; padding:10px 12px; border-radius:12px; margin-bottom:8px; cursor:pointer; transition: transform .08s ease; }
.room-item:hover{ transform: translateY(-1px); }
.room-item.active{ background:#ffe066; }
.room-title{ font-weight:800; font-size:14px; margin-bottom:4px; word-break:break-word; }
.room-time{ font-size:12px; opacity:.8; }
.room-actions{ display:flex; gap:6px; align-items:center; }
.room-del-btn{ background:transparent; border:0; cursor:pointer; font-size:16px; line-height:1; padding:4px; border-radius:6px; }
.room-del-btn:hover{ background: rgba(0,0,0,.06); }
.room-empty{ padding:16px; color:#79520a; }

/* Chat */
.chat-area{ display:grid; grid-template-rows:auto 1fr auto; height:100%; }
.chat-header{ background:#ffec99; border-bottom:2px solid #ffe08a; padding:12px 16px; display:flex; align-items:center; gap:8px; }
.chat-header .title{ font-weight:800; color:#704800; flex:1; }
.header-del-btn{ background: rgba(255,255,255,.5); border:1px solid #ffd43b; border-radius:10px; padding:6px 10px; cursor:pointer; }

.messages{ padding:14px 16px; overflow-y:auto; background:#fffdf5; }
.loading{ text-align:center; color:#b08900; }
.empty-hint{ text-align:center; color:#6b4c00; padding-top:32px; }
.empty-hint .emoji{ font-size:40px; margin-bottom:8px; }
.empty-hint .line1{ font-weight:800; margin-bottom:4px; }
.empty-hint .line2{ opacity:.9; }

.msg-row{ display:flex; margin:8px 0; }
.msg-row.me{ justify-content:flex-end; } .msg-row.ai{ justify-content:flex-start; }
.bubble{ max-width:75%; background:white; border:2px solid #ffe08a; color:#704800; padding:10px 12px; border-radius:14px; word-break:break-word; white-space:pre-wrap; }
.msg-row.me .bubble{ background:#ffd43b; color:#5a3c00; border-color:#fab005; }
.bubble .meta{ font-size:12px; margin-top:6px; text-align:right; opacity:.85; }
.pending{ margin-left:6px; } .error{ color:#c92a2a; margin-left:6px; }

/* Input */
.input-bar{ display:grid; grid-template-columns:1fr auto; gap:8px; padding:12px; border-top:2px solid #ffe08a; background:#fffbe6; }
.input{ border:2px solid #ffe08a; border-radius:12px; padding:10px 12px; font-size:15px; color:#704800; background:white; }
.input:focus{ outline:none; border-color:#fab005; box-shadow:0 0 0 3px rgba(250,176,5,.25); }
.send{ background:#ffd43b; border:2px solid #fab005; color:#5a3c00; font-weight:800; padding:10px 16px; border-radius:12px; cursor:pointer; }
.send:disabled{ opacity:.7; cursor:not-allowed; }
</style>
