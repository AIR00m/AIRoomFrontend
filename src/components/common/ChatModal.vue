<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="modal-fade">
      <div v-if="isOpen" class="chat-overlay" @click="close"></div>
    </Transition>

    <!-- Modal Content -->
    <Transition name="modal-slide">
      <div
        v-if="isOpen"
        class="chat-modal"
        role="dialog"
        aria-modal="true"
        @click.stop
        @keydown.esc="close"
        tabindex="0"
      >
        <!-- 헤더 (목록 화면용) -->
        <div v-if="view === 'list'" class="chat-header">
          <div class="header-left">
            <div class="header-icon"><span>💬</span></div>
            <div>
              <div class="chat-title">대화</div>
            </div>
          </div>
          <button class="close-btn" title="닫기" @click="close">❌</button>
        </div>

        <!-- 채팅방 헤더 -->
        <div v-else-if="view === 'room'" class="chat-room-header">
          <button class="chat-icon-btn" title="뒤로" @click="backToList">
            <span>←</span>
          </button>
          <div class="chat-title">{{ currentStudentName }}</div>
          <button class="chat-icon-btn" title="검색" @click="openSearch">
            🔍
          </button>
          <button class="chat-icon-btn" title="삭제" @click="openDelete">
            🗑️
          </button>
          <button class="chat-icon-btn" title="닫기" @click="close">❌</button>
        </div>

        <!-- 검색 헤더 -->
        <div v-else-if="view === 'search'" class="chat-room-header">
          <button class="chat-icon-btn" title="뒤로" @click="closeSearch">
            <span>←</span>
          </button>
          <div class="chat-title">검색</div>
          <button class="chat-icon-btn" title="닫기" @click="close">❌</button>
        </div>

        <!-- 삭제 헤더 -->
        <div v-else-if="view === 'delete'" class="chat-room-header">
          <button class="chat-icon-btn" title="뒤로" @click="closeDelete">
            <span>←</span>
          </button>
          <div class="chat-title">{{ currentStudentName }}</div>
          <button class="chat-icon-btn" title="닫기" @click="close">❌</button>
        </div>

        <!-- 목록 화면 -->
        <div v-if="view === 'list'" class="chat-body">
          <div class="chat-info">
            <div class="info-icon">💡</div>
            <span>선행학습을 지양하며, 건전한 학습 대화를 나눠주세요.</span>
          </div>

          <!-- 탭 -->
          <div class="chat-tabs">
            <button
              class="tab-button"
              :class="{ active: tab === 'students' }"
              @click="tab = 'students'"
              type="button"
            >
              학생 목록
            </button>
            <button
              class="tab-button"
              :class="{ active: tab === 'threads' }"
              @click="tab = 'threads'"
              type="button"
            >
              대화 목록
            </button>
          </div>

          <!-- 목록 컨텐츠 -->
          <div class="list-content">
            <!-- 학생 목록 -->
            <div v-show="tab === 'students'">
              <div class="list-controls">
                <label>
                  <input
                    type="checkbox"
                    @change="toggleAll($event)"
                    class="form-check-input"
                  />
                  전체 학생 ({{ students.length }})
                </label>
                <div class="list-buttons">
                  <button class="btn-secondary" @click="refreshStudents">
                    새로고침
                  </button>
                  <button class="btn-primary" @click="openFirstSelected">
                    단체 대화
                  </button>
                </div>
              </div>

              <div class="chat-list">
                <div v-for="(st, i) in students" :key="st.id" class="chat-card">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    v-model="selectedIds"
                    :value="st.id"
                  />
                  <div class="card-index">{{ i + 1 }}.</div>
                  <div class="card-name">{{ st.name }}</div>
                  <button class="btn-primary" @click="openRoom(st.id, st.name)">
                    대화하기
                  </button>
                </div>
              </div>
            </div>

            <!-- 대화 목록 -->
            <div v-show="tab === 'threads'">
              <div class="chat-list">
                <div
                  v-for="(th, i) in threads"
                  :key="th.id"
                  class="chat-card"
                  @click="openRoom(th.id, th.name)"
                >
                  <div class="card-index">{{ i + 1 }}.</div>
                  <div class="card-content">
                    <div class="card-name">{{ th.name }}</div>
                    <div class="card-message">{{ th.lastMessage }}</div>
                    <div class="card-time">{{ th.date }}</div>
                  </div>
                  <button
                    class="btn-primary"
                    @click.stop="openRoom(th.id, th.name)"
                  >
                    열기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 채팅방 -->
        <div v-else-if="view === 'room'" class="chat-room">
          <div ref="roomMsgsRef" class="chat-messages">
            <template v-for="(msg, i) in currentMessages" :key="msg.id">
              <div v-if="showDateChip(i)" class="date-chip">
                <span>{{ msg.date }}</span>
              </div>
              <div
                :id="`msg-${msg.id}`"
                class="msg-row"
                :class="msg.sender === 'me' ? 'me' : 'other'"
              >
                <div class="bubble">
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
            <button class="chat-send-btn" @click="send" title="전송">➤</button>
          </div>
        </div>

        <!-- 검색 화면 -->
        <div v-else-if="view === 'search'" class="chat-room">
          <div class="search-input-area">
            <input
              v-model.trim="keyword"
              type="text"
              class="chat-input"
              placeholder="검색어를 입력하세요"
              @keyup.enter="search"
              @input="search"
            />
          </div>
          <div ref="searchMsgsRef" class="chat-messages">
            <template v-for="(msg, i) in currentMessages" :key="msg.id">
              <div v-if="showDateChip(i)" class="date-chip">
                <span>{{ msg.date }}</span>
              </div>
              <div
                :id="`search-msg-${msg.id}`"
                class="msg-row"
                :class="[
                  msg.sender === 'me' ? 'me' : 'other',
                  { 'search-match': isSearchMatch(msg) },
                ]"
                @click="scrollToMessage(msg.id)"
              >
                <div class="bubble">
                  <div class="text" v-html="getHighlightedText(msg)"></div>
                  <div class="time">{{ msg.time }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 삭제 화면 -->
        <div v-else-if="view === 'delete'" class="chat-room">
          <div class="chat-messages">
            <template v-for="(msg, i) in currentMessages" :key="msg.id">
              <div v-if="showDateChip(i)" class="date-chip">
                <span>{{ msg.date }}</span>
              </div>
              <div
                class="msg-row"
                :class="msg.sender === 'me' ? 'me' : 'other'"
              >
                <div class="bubble delete-mode">
                  <div class="text" v-html="msg.text"></div>
                  <div class="time">{{ msg.time }}</div>
                  <button
                    v-if="msg.sender === 'me'"
                    class="delete-single-btn"
                    @click="deleteOne(msg.id)"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </template>
          </div>
          <div class="delete-bottom-area">
            <button class="btn-delete-all" @click="deleteAll">
              🗑️ 전체삭제
            </button>
          </div>
        </div>
      </div>
    </Transition>
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

const selectedIds = ref([]);
const roomInput = ref("");
const roomMsgsRef = ref(null);
const searchMsgsRef = ref(null);

// 검색 관련
const keyword = ref("");
const highlightedMsgId = ref(null);

const currentMessages = computed(
  () => history.value[currentRoomId.value] || []
);

const showDateChip = (i) =>
  i === 0 ||
  currentMessages.value[i].date !== currentMessages.value[i - 1].date;

// 검색 관련 함수들
function isSearchMatch(msg) {
  const q = keyword.value.toLowerCase();
  return q && msg.text.toLowerCase().includes(q);
}

function getHighlightedText(msg) {
  const q = keyword.value.toLowerCase();
  if (!q) return msg.text;

  if (msg.text.toLowerCase().includes(q)) {
    const reg = new RegExp(
      `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return msg.text.replace(
      reg,
      '<mark style="background: #ffdd29; color: #8c6d32; padding: 2px 4px; border-radius: 4px;">$1</mark>'
    );
  }
  return msg.text;
}

function scrollToMessage(msgId) {
  // 검색 화면에서 채팅방으로 이동하면서 해당 메시지로 스크롤
  view.value = "room";
  highlightedMsgId.value = msgId;

  nextTick(() => {
    const targetElement = document.getElementById(`msg-${msgId}`);
    if (targetElement && roomMsgsRef.value) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // 임시로 하이라이트 효과
      targetElement.classList.add("highlighted");
      setTimeout(() => {
        targetElement.classList.remove("highlighted");
        highlightedMsgId.value = null;
      }, 2000);
    }
  });
}

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

// 검색 기능
function openSearch() {
  view.value = "search";
  keyword.value = "";
  nextTick(() => {
    if (searchMsgsRef.value && roomMsgsRef.value) {
      // 현재 채팅방의 스크롤 위치를 검색 화면에도 동일하게 적용
      searchMsgsRef.value.scrollTop = roomMsgsRef.value.scrollTop;
    }
  });
}

function closeSearch() {
  view.value = "room";
}

function search() {
  // 검색어가 변경될 때마다 실행
  // 현재는 별도 로직 없이 템플릿에서 하이라이팅만 처리
}

// 삭제 기능
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

function nowDisplay() {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "오후" : "오전";
  const displayH = h % 12 || 12;
  const date = `${String(now.getMonth() + 1).padStart(2, "0")}.${String(
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

function refreshStudents() {
  chat.fetchStudents();
}
</script>

<style scoped>
/* Base Modal & Overlay */
.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(85, 68, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
}
.chat-modal {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(600px, 95vw);
  max-height: 85vh;
  min-height: 80vh;
  background: #fffbf0;
  border-radius: 30px;
  border: 3px solid #ffe066;
  box-shadow: 0 20px 60px rgba(255, 221, 41, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2010;
  outline: none;
}

/* 채팅방/검색/삭제 모드에서도 같은 크기 유지 */
/* .chat-modal.room-mode {
  width: min(600px, 95vw);
  max-height: 85vh;
} */

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-slide-leave-active {
  transition: all 0.3s ease-out;
}
.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 30px)) scale(0.95);
}

/* Header */
.chat-header {
  background: #ffdd29;
  color: #8c6d32;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.5);
}

/* 채팅방 헤더 */
.chat-room-header {
  background: #ffdd29;
  color: #8c6d32;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.5);
}

.chat-icon-btn {
  background: rgba(255, 255, 255, 0.3);
  border: 0;
  color: #a37800;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-icon-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.header-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}
.chat-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
  flex: 1;
}
.close-btn {
  color: #a37800;
  background: rgba(255, 255, 255, 0.3);
  border: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.125rem;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.1) rotate(90deg);
}

/* Common Body Styles */
.chat-body,
.chat-room {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}
.chat-body {
  padding: 1rem 1.5rem 1.5rem;
}

/* Info Box */
.chat-info {
  background: #fff9e6;
  border: 2px dashed #ffe066;
  border-radius: 15px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #f57c00;
  font-weight: 600;
  flex-shrink: 0;
}
.info-icon {
  font-size: 1.2rem;
}

/* Tabs */
.chat-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  margin-bottom: 1rem;
  background: #fff5d6;
  border-radius: 20px;
  border: 2px solid #ffe066;
  flex-shrink: 0;
}
.tab-button {
  flex: 1;
  padding: 10px 15px;
  border: 0;
  border-radius: 15px;
  background: none;
  color: #ff9800;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}
.tab-button:hover:not(.active) {
  background: rgba(255, 221, 41, 0.3);
}
.tab-button.active {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  transform: translateY(-2px);
}

/* List Content */
.list-content {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 8px;
}
.list-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #a37800;
}
.list-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.list-buttons {
  display: flex;
  gap: 0.5rem;
}
.btn-primary,
.btn-secondary {
  border: none;
  padding: 8px 12px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-primary {
  background-color: #ff9800;
  color: white;
}
.btn-primary:hover {
  background-color: #f57c00;
  transform: translateY(-1px);
}
.btn-secondary {
  background-color: #fff5d6;
  color: #a37800;
}
.btn-secondary:hover {
  background-color: #ffe066;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.chat-card {
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.chat-card:hover {
  border-color: #ffdd29;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.2);
}
.card-index {
  color: #ff9800;
  font-weight: 700;
  width: 30px;
}
.card-name {
  flex: 1;
  font-weight: 700;
  color: #8c6d32;
}
.card-content {
  flex: 1;
  min-width: 0;
}
.card-message,
.card-time {
  font-size: 0.85rem;
  color: #a37800;
}
.card-message {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Chat Room */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  background: #fff9e6;
  padding: 1rem;
}
.date-chip {
  text-align: center;
  margin: 0.75rem 0;
}
.date-chip span {
  background: #ffe066;
  color: #a37800;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}
.msg-row {
  display: flex;
  margin: 0.5rem 0;
  transition: all 0.3s ease;
}
.msg-row.me {
  justify-content: flex-end;
}
.msg-row.other {
  justify-content: flex-start;
}

/* 검색 매치 스타일 */
.msg-row.search-match {
  cursor: pointer;
  transform: scale(1.02);
}

.msg-row.search-match .bubble {
  box-shadow: 0 4px 12px rgba(255, 221, 41, 0.4);
  border: 2px solid #ffdd29;
}

/* 하이라이트 애니메이션 */
.msg-row.highlighted {
  animation: highlight 2s ease-in-out;
}

@keyframes highlight {
  0% {
    background: transparent;
  }
  20% {
    background: rgba(255, 221, 41, 0.3);
  }
  80% {
    background: rgba(255, 221, 41, 0.3);
  }
  100% {
    background: transparent;
  }
}

.bubble {
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  line-height: 1.5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  word-break: break-word;
  white-space: pre-wrap;
  position: relative;
  transition: all 0.2s ease;
}
.msg-row.me .bubble {
  background: #ff9800;
  color: white;
  border-bottom-right-radius: 6px;
}
.msg-row.other .bubble {
  background: white;
  border: 2px solid #ffe066;
  color: #8c6d32;
  border-bottom-left-radius: 6px;
}
.bubble .text {
  font-size: 0.9375rem;
}
.bubble .time {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  opacity: 0.8;
  text-align: right;
}

/* 검색 입력 영역 */
.search-input-area {
  padding: 1rem;
  background: #fffbf0;
  border-bottom: 2px solid #ffe066;
}

/* 삭제 모드 */
.bubble.delete-mode {
  padding-right: 3rem;
}

.delete-single-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
  padding: 0;
}

.delete-single-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.delete-bottom-area {
  padding: 1rem;
  background: #fffbf0;
  border-top: 2px solid #ffe066;
}

.btn-delete-all {
  width: 100%;
  background: #ff4444;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete-all:hover {
  background: #cc3333;
  transform: translateY(-1px);
}

.chat-input-area {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem;
  background: #fffbf0;
  border-top: 2px solid #ffe066;
}
.chat-input {
  flex: 1;
  border: 2px solid #ffe066;
  background: white;
  border-radius: 15px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #8c6d32;
}
.chat-input:focus {
  outline: none;
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.3);
}
.chat-send-btn {
  background: #ffdd29;
  color: #a37800;
  border: 0;
  width: 50px;
  height: 50px;
  border-radius: 15px;
  font-weight: 600;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-send-btn:hover {
  background: #ffc729;
  transform: scale(1.1);
}

/* Scrollbar */
.list-content::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar {
  width: 8px;
}
.list-content::-webkit-scrollbar-track,
.chat-messages::-webkit-scrollbar-track {
  background: #fff5d6;
  border-radius: 4px;
}
.list-content::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb {
  background: #ffe066;
  border-radius: 4px;
}
.list-content::-webkit-scrollbar-thumb:hover,
.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #ffdd29;
}

.form-check-input {
  border-color: #ffe066;
}
.form-check-input:checked {
  background-color: #ff9800;
  border-color: #ff9800;
}
</style>
