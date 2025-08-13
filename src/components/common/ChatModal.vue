<template>
  <Teleport to="body">
    <div v-if="isOpen" class="chat-overlay" @click="close"></div>

    <div
      v-if="isOpen"
      class="chat-modal"
      role="dialog"
      aria-modal="true"
      @click.stop
    >
      <!-- 헤더 -->
      <div class="chat-header">
        <div class="chat-title" v-if="view === 'list'">대화</div>
        <div class="chat-title" v-else-if="view === 'room'">
          {{ currentStudentName }}
        </div>
        <div class="chat-title" v-else-if="view === 'search'">검색</div>
        <div class="chat-title" v-else-if="view === 'delete'">
          {{ currentStudentName }}
        </div>
        <button class="chat-icon-btn" title="닫기" @click="close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- 목록 화면 -->
      <div v-show="view === 'list'" class="chat-body">
        <div class="chat-info">
          <i class="bi bi-info-circle me-2"></i>선행학습을 지양하며, 건전한 학습
          대화를 나눠주세요.
        </div>

        <!-- 학생 목록 -->
        <div v-show="tab === 'students'" class="chat-list">
          <div class="d-flex align-items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="chkAll"
              class="form-check-input"
              @change="toggleAll($event)"
            />
            <label for="chkAll" class="fw-semibold"
              >전체 학생(<span>{{ students.length }}</span
              >)</label
            >
            <button
              class="btn btn-sm btn-outline-secondary ms-auto"
              @click="refreshStudents"
            >
              <i class="bi bi-arrow-clockwise"></i> 새로고침
            </button>
            <button class="btn btn-sm btn-primary" @click="openFirstSelected">
              단체 대화
            </button>
          </div>

          <div>
            <div v-for="(st, i) in students" :key="st.id" class="chat-card">
              <input
                type="checkbox"
                class="form-check-input"
                :id="'s_' + st.id"
                v-model="selectedIds"
                :value="st.id"
              />
              <div class="fw-bold text-primary" style="width: 30px">
                {{ i + 1 }}.
              </div>
              <div class="flex-grow-1 fw-semibold">{{ st.name }}</div>
              <button
                class="btn btn-sm btn-primary"
                @click="openRoom(st.id, st.name)"
              >
                대화하기
              </button>
            </div>
          </div>
        </div>

        <!-- 대화 목록 -->
        <div v-show="tab === 'threads'" class="chat-list">
          <div>
            <div
              v-for="(th, i) in threads"
              :key="th.id"
              class="chat-card"
              style="cursor: pointer"
              @click="openRoom(th.id, th.name)"
            >
              <div class="fw-bold text-primary" style="width: 30px">
                {{ i + 1 }}.
              </div>
              <div class="flex-grow-1">
                <div class="fw-semibold">{{ th.name }}</div>
                <div class="small text-secondary">{{ th.lastMessage }}</div>
                <div class="small text-muted">{{ th.date }}</div>
              </div>
              <button
                class="btn btn-sm btn-primary"
                @click.stop="openRoom(th.id, th.name)"
              >
                열기
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 채팅방 -->
      <div v-show="view === 'room'" class="chat-room" style="display: flex">
        <div class="chat-room-header">
          <button class="chat-icon-btn" title="뒤로" @click="backToList">
            <i class="bi bi-arrow-left" />
          </button>
          <div class="chat-title">{{ currentStudentName }}</div>
          <button class="chat-icon-btn" title="검색" @click="openSearch">
            <i class="bi bi-search"></i>
          </button>
          <button class="chat-icon-btn" title="삭제" @click="openDelete">
            <i class="bi bi-trash3"></i>
          </button>
          <button class="chat-icon-btn" title="닫기" @click="close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div ref="roomMsgsRef" class="chat-messages">
          <template v-for="(msg, i) in currentMessages" :key="msg.id">
            <!-- 날짜 칩 -->
            <div v-if="showDateChip(i)" class="date-chip">
              <small>{{ msg.date }}</small>
            </div>

            <!-- 말풍선 행 -->
            <div class="msg-row" :class="msg.sender === 'me' ? 'me' : 'other'">
              <div class="bubble" :class="msg.sender === 'me' ? 'me' : 'other'">
                <div class="text" v-html="msg.text"></div>
                <div class="time">{{ msg.time }}</div>
              </div>
            </div>
          </template>
        </div>

        <div class="chat-input-area">
          <input
            v-model.trim="roomInput"
            type="text"
            class="chat-input"
            placeholder="메시지를 입력하세요..."
            @keyup.enter="send"
          />
          <button class="chat-send-btn" @click="send">
            <i class="bi bi-send"></i>
          </button>
        </div>
      </div>

      <!-- 검색 -->
      <div v-show="view === 'search'" class="chat-room" style="display: flex">
        <div class="chat-room-header">
          <button class="chat-icon-btn" title="뒤로" @click="closeSearch">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div class="chat-title">검색어를 입력하세요.</div>
          <button class="chat-icon-btn" title="닫기" @click="close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div
          class="search-input-area"
          style="padding: 1rem; border-bottom: 1px solid var(--border)"
        >
          <input
            v-model.trim="keyword"
            type="text"
            class="form-control"
            placeholder="검색어를 입력하세요"
            @keyup.enter="search"
            @input="search"
          />
        </div>
        <div class="chat-messages">
          <template v-if="searchResults.length">
            <div
              v-for="msg in searchResults"
              :key="msg.id"
              class="chat-bubble"
              :class="msg.sender === 'me' ? 'me' : 'other'"
            >
              <div v-html="msg.highlighted"></div>
              <div class="small opacity-75 mt-1">{{ msg.time }}</div>
            </div>
          </template>
          <div v-else class="text-center text-muted p-4">
            검색 결과가 없습니다.
          </div>
        </div>
      </div>

      <!-- 삭제 -->
      <div v-show="view === 'delete'" class="chat-room" style="display: flex">
        <div class="chat-room-header">
          <button class="chat-icon-btn" title="뒤로" @click="closeDelete">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div class="chat-title">{{ currentStudentName }}</div>
          <button class="chat-icon-btn" title="닫기" @click="close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="chat-messages">
          <div
            v-for="msg in currentMessages"
            :key="msg.id"
            class="position-relative"
          >
            <div
              class="chat-bubble"
              :class="msg.sender === 'me' ? 'me' : 'other'"
            >
              <div v-html="msg.text"></div>
              <div class="small opacity-75 mt-1">{{ msg.time }}</div>
            </div>
            <button
              v-if="msg.sender === 'me'"
              class="btn btn-sm position-absolute"
              style="
                top: 5px;
                right: 5px;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                padding: 0;
                font-size: 12px;
              "
              @click="deleteOne(msg.id)"
            >
              ×
            </button>
          </div>
        </div>
        <div
          class="delete-bottom-area"
          style="
            padding: 1rem;
            background: var(--bg-white);
            border-top: 1px solid var(--border);
          "
        >
          <button class="btn btn-dark w-100" @click="deleteAll">
            <i class="bi bi-trash me-2"></i>전체삭제
          </button>
        </div>
      </div>

      <!-- 탭 -->
      <div v-if="view === 'list'" class="chat-tabs">
        <div
          class="chat-tab"
          :class="{ active: tab === 'students' }"
          @click="tab = 'students'"
        >
          학생 목록
        </div>
        <div
          class="chat-tab"
          :class="{ active: tab === 'threads' }"
          @click="tab = 'threads'"
        >
          대화 목록
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useChatStore } from "@/stores/chat";

const router = useRouter();
const route = useRoute();
const chat = useChatStore();
const {
  students,
  threads,
  history,
  currentRoomId,
  currentStudentName,
  view,
  tab,
} = storeToRefs(chat);

// 모달 열림 여부는 URL 쿼리로 제어 (?chat=1)
const isOpen = computed(() => route.query.chat === "1");

/* ✅ 모달이 열릴 때 더미데이터 보장 */
async function ensureData() {
  if (!students.value?.length) await chat.fetchStudents();
  if (!threads.value?.length) await chat.fetchThreads();

  // 테스트용으로 한 방에 샘플 메시지도 넣고 싶다면 (선택)
  if (!history.value[2]) {
    history.value[2] = [
      {
        id: 1,
        sender: "other",
        text: "안녕하세요!",
        time: "오후 06:55",
        date: "08.05.",
      },
      {
        id: 2,
        sender: "me",
        text: "무엇을 도와드릴까요?",
        time: "오후 07:00",
        date: "08.05.",
      },
    ];
  }
}
watch(
  isOpen,
  (v) => {
    if (v) ensureData();
  },
  { immediate: true }
);
onMounted(() => {
  if (isOpen.value) ensureData();
});

/* watch(
  () => route.query.room,
  (room) => {
    if (isOpen.value && room) {
      const target =
        chat.findStudentById(Number(room)) || chat.findThreadById(Number(room));
      if (target) openRoom(Number(room), target.name);
    }
  },
  { immediate: true }
); */

const selectedIds = ref([]);
const roomInput = ref("");
const roomMsgsRef = ref(null);

const currentMessages = computed(
  () => history.value[currentRoomId.value] || []
);
const showDateChip = (i) =>
  i === 0 ||
  currentMessages.value[i].date !== currentMessages.value[i - 1].date;

function close() {
  const q = { ...route.query };
  delete q.chat;
  delete q.room;
  router.push({ query: q });
}

function toggleAll(e) {
  selectedIds.value = e.target.checked ? students.value.map((s) => s.id) : [];
}
function openFirstSelected() {
  if (!selectedIds.value.length) return alert("대화할 학생을 선택해주세요.");
  const id = selectedIds.value[0];
  const st = chat.findStudentById(id);
  if (st) openRoom(st.id, st.name);
}

async function openRoom(id, name) {
  chat.enterRoom(id, name);
  await nextTick();
  if (roomMsgsRef.value)
    roomMsgsRef.value.scrollTop = roomMsgsRef.value.scrollHeight;
  router.push({ query: { ...route.query, chat: "1", room: String(id) } });
}
function backToList() {
  view.value = "list";
}

function nowDisplay() {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "오후" : "오전";
  const displayH = h % 12 || 12;
  const date = `${String(now.getMonth() + 1).padStart(2, "0")}. ${String(
    now.getDate()
  ).padStart(2, "0")}.`;
  return { time: `${ampm} ${displayH}:${m}`, date };
}

function send() {
  const text = roomInput.value.trim();
  if (!text || !currentRoomId.value) return;
  const { time, date } = nowDisplay();
  chat.appendMessage(currentRoomId.value, {
    id: Date.now(),
    sender: "me",
    text,
    time,
    date,
  });
  roomInput.value = "";
  nextTick(() => {
    if (roomMsgsRef.value)
      roomMsgsRef.value.scrollTop = roomMsgsRef.value.scrollHeight;
  });
}

function openSearch() {
  view.value = "search";
}
function closeSearch() {
  view.value = "room";
}
const keyword = ref("");
const searchResults = ref([]);
function search() {
  const q = keyword.value.toLowerCase();
  if (!q) return (searchResults.value = []);
  const msgs = currentMessages.value;
  const reg = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  searchResults.value = msgs
    .filter((m) => m.text.toLowerCase().includes(q))
    .map((m) => ({
      ...m,
      highlighted: m.text.replace(
        reg,
        '<mark style="background: yellow; color: black;">$1</mark>'
      ),
    }));
}

function openDelete() {
  view.value = "delete";
}
function closeDelete() {
  view.value = "room";
}
function deleteOne(id) {
  chat.deleteMessage(currentRoomId.value, id);
}
function deleteAll() {
  if (!confirm("모든 메시지를 삭제하시겠습니까?")) return;
  chat.deleteAllMine(currentRoomId.value);
}

function refreshStudents() {
  chat.fetchStudents();
}
</script>

<style scoped>
:root {
  --brand: #034582;
  --border: #e2e8f0;
  --bg-light: #f8fafc;
  --bg-white: #ffffff;
}
.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1100;
}
.chat-modal {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(720px, 92vw);
  height: min(78vh, 680px);
  background: var(--bg-white);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  z-index: 1110;
  display: block;
}
/* .chat-header {
  background: var(--brand);
  color: #fff;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
} */
.chat-header {
  background: #034582; /* var(--brand) 같은 진한 색 */
  color: #fff;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.chat-title {
  font-weight: 700;
  font-size: 1.1rem;
  flex: 1;
}
.chat-icon-btn {
  background: transparent;
  border: 0;
  color: #fff;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.3s ease;
}
.chat-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.chat-body {
  height: calc(100% - 120px);
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 40%);
  overflow: auto;
  padding: 1rem;
}
.chat-info {
  background: #e0f2fe;
  border: 1px solid var(--border);
  color: #111827;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
/* .chat-tabs {
  height: 60px;
  background: var(--bg-light);
  border-top: 1px solid var(--border);
  display: flex;
} */
/* 하단 탭바: 항상 불투명하게 붙여놓기 (목록 화면일 때) */
.chat-tabs {
  position: sticky; /* 스크롤 시에도 하단에 붙어있게 하고 싶으면 fixed 대신 sticky */
  bottom: 0;
  background: #f1f5f9; /* 불투명한 밝은 회색 */
  border-top: 1px solid #e2e8f0;
  height: 56px;
  display: flex;
}
.chat-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.3s ease;
}
.chat-tab.active {
  background: var(--brand);
  color: white;
}
.chat-tab:hover:not(.active) {
  background: #e2e8f0;
}
.chat-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.chat-card {
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}
.chat-card:hover {
  border-color: var(--brand);
  box-shadow: 0 4px 12px rgba(3, 69, 130, 0.1);
}
.chat-room {
  height: calc(100% - 60px);
  flex-direction: column;
}
.chat-room-header {
  background: #034582;
  color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.chat-messages {
  flex: 1;
  overflow: auto;
  background: #eef5ff;
  padding: 1rem;
}
.chat-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  margin: 0.5rem 0;
  line-height: 1.4;
}
.chat-bubble.me {
  background: var(--brand);
  color: #fff;
  border-bottom-right-radius: 6px;
  margin-left: auto;
}
.chat-bubble.other {
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-bottom-left-radius: 6px;
}
.chat-input-area {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  border-top: 1px solid var(--border);
  background: #ffffff; /* 불투명 흰색 */
  border-top: 1px solid #e2e8f0;
  padding: 1rem;
}
.chat-input {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
}
.chat-send-btn {
  background: var(--brand);
  color: #fff;
  border: 0;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .chat-modal {
    width: 95%;
    height: 85vh;
  }
}
/* 날짜 칩 */
.date-chip {
  display: flex;
  justify-content: center;
  margin: 8px 0 12px;
}
.date-chip > small {
  background: #f1f5f9;
  color: #6b7280;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04) inset;
}

/* 행(좌/우 정렬 담당) */
.msg-row {
  display: flex;
  margin: 8px 0;
}
.msg-row.me {
  justify-content: flex-end;
}
.msg-row.other {
  justify-content: flex-start;
}

/* 말풍선 기본 */
.bubble {
  max-width: 72%;
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.55;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.06);
  word-break: break-word;
  white-space: pre-wrap;
}

/* 내 말풍선: 짙은 파랑, 우측 정렬, 둥근 모서리 */
.bubble.me {
  background: #0b4f8a; /* 짙은 파랑(브랜드 색 계열) */
  color: #ffffff;
  border-radius: 18px 18px 6px 18px; /* 왼-아래만 살짝 각지게 */
  margin-left: 48px; /* 좌측 여백 */
}

/* 상대 말풍선: 흰색 카드 톤 */
.bubble.other {
  background: #ffffff;
  color: #111827;
  border: 1px solid #e2e8f0;
  border-radius: 18px 18px 18px 6px; /* 우-아래만 살짝 각지게 */
  margin-right: 48px; /* 우측 여백 */
}

/* 본문/시간 */
.bubble .text {
  font-size: 16px;
}
.bubble .time {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.75; /* 살짝 흐리게(텍스트는 진하게 유지) */
  color: inherit; /* 말풍선 색상에 맞추기 */
}
</style>
