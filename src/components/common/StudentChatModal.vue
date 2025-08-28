<template>
  <div class="chat-modal-wrapper">
    <Teleport to="body">
      <!-- Overlay -->
      <Transition name="modal-fade">
        <div v-if="isOpen" class="chat-overlay" @click="close"></div>
      </Transition>

      <!-- Modal Content (학생: 채팅방, 검색, 삭제만) -->
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
          <!-- 헤더 -->
          <div v-if="view === 'room'" class="chat-room-header">
            <div class="chat-title">
              {{ currentTeacherName || "선생님과의 대화" }}
            </div>
            <button class="chat-icon-btn" title="검색" @click="openSearch">
              🔍
            </button>
            <button class="chat-icon-btn" title="삭제" @click="openDelete">
              🗑️
            </button>
            <button class="chat-icon-btn" title="닫기" @click="close">
              ❌
            </button>
          </div>

          <div v-else-if="view === 'search'" class="chat-room-header">
            <button class="chat-icon-btn" title="뒤로" @click="closeSearch">
              ←
            </button>
            <div class="chat-title">검색</div>
            <button class="chat-icon-btn" title="닫기" @click="close">
              ❌
            </button>
          </div>

          <div v-else-if="view === 'delete'" class="chat-room-header">
            <button class="chat-icon-btn" title="뒤로" @click="closeDelete">
              ←
            </button>
            <div class="chat-title">
              {{ currentTeacherName || "선생님과의 대화" }}
            </div>
            <button class="chat-icon-btn" title="닫기" @click="close">
              ❌
            </button>
          </div>

          <!-- 로딩 상태 -->
          <div v-if="loading" class="loading-more">
            <span>메시지를 불러오는 중...</span>
          </div>

          <!-- 에러 상태 -->
          <div v-else-if="error" class="error-state">
            <div class="error-icon">❌</div>
            <h3>채팅방을 열 수 없습니다</h3>
            <p>{{ error }}</p>
            <button @click="initializeChat" class="retry-btn">다시 시도</button>
          </div>

          <!-- 채팅방 본문 -->
          <div v-else-if="view === 'room'" class="chat-room">
            <div ref="roomMsgsRef" class="chat-messages" @scroll="onScroll">
              <div v-if="loadingMessages" class="loading-more">
                <span>메시지를 불러오는 중...</span>
              </div>
              <template
                v-for="(msg, i) in currentMessages"
                :key="msg.messageId"
              >
                <div v-if="showDateChip(i)" class="date-chip">
                  <span>{{ formatDate(msg.sentAt) }}</span>
                </div>
                <div
                  :id="`msg-${msg.messageId}`"
                  class="msg-row"
                  :class="msg.writerRole === 'STUDENT' ? 'me' : 'other'"
                >
                  <div class="bubble">
                    <div class="text" v-html="msg.content"></div>
                    <div class="time">{{ formatTime(msg.sentAt) }}</div>
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
              <button class="chat-send-btn" @click="send" title="전송">
                ➤
              </button>
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
              <template v-for="(msg, i) in searchResults" :key="msg.messageId">
                <div v-if="showDateChip(i, searchResults)" class="date-chip">
                  <span>{{ formatDate(msg.sentAt) }}</span>
                </div>
                <div
                  :id="`search-msg-${msg.messageId}`"
                  class="msg-row"
                  :class="[
                    msg.writerRole === 'STUDENT' ? 'me' : 'other',
                    { 'search-match': isSearchMatch(msg) },
                  ]"
                  @click="scrollToMessage(msg.messageId)"
                >
                  <div class="bubble">
                    <div class="text" v-html="getHighlightedText(msg)"></div>
                    <div class="time">{{ formatTime(msg.sentAt) }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- 삭제 화면 -->
          <div v-else-if="view === 'delete'" class="chat-room">
            <div class="chat-messages">
              <template
                v-for="(msg, i) in currentMessages"
                :key="msg.messageId"
              >
                <div v-if="showDateChip(i)" class="date-chip">
                  <span>{{ formatDate(msg.sentAt) }}</span>
                </div>
                <div
                  class="msg-row"
                  :class="msg.writerRole === 'STUDENT' ? 'me' : 'other'"
                >
                  <div class="bubble delete-mode">
                    <div class="text" v-html="msg.content"></div>
                    <div class="time">{{ formatTime(msg.sentAt) }}</div>
                    <button
                      v-if="msg.writerRole === 'STUDENT'"
                      class="delete-single-btn"
                      @click="deleteOne(msg.messageId)"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              </template>
            </div>
            <div class="delete-bottom-area">
              <button class="btn-delete-all" @click="deleteAll">
                🗑️ 내 메시지 전체삭제
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/utils/apiClient";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";

// emits 선언
const emit = defineEmits(["close"]);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 모달 열림 여부 (쿼리에서 studentchat=1)
const isOpen = computed(() => route.query.studentchat === "1");

// 상태 관리
const view = ref("room");
const loading = ref(false);
const error = ref(null);
const currentMessages = ref([]);
const currentRoomId = ref(null);
const currentTeacherNo = ref(null);
const currentTeacherName = ref("");
const roomInput = ref("");
const roomMsgsRef = ref(null);
const searchMsgsRef = ref(null);
const keyword = ref("");
const searchResults = ref([]);
const loadingMessages = ref(false);
const hasMoreMessages = ref(true);

// WebSocket 관련
let stompClient = null;
let subscription = null;
const API_BASE_URL = apiClient.baseURL;

// 현재 사용자 정보
const currentUser = computed(() => ({
  classroomNo:
    authStore.tokenInfo?.classroomNo ||
    parseInt(localStorage.getItem("classroomNo")) ||
    1,
  studentNo:
    authStore.tokenInfo?.classRoomStudent ||
    parseInt(localStorage.getItem("memberNo")) ||
    1,
  role: "STUDENT",
}));

// WebSocket 연결
const connectWebSocket = () => {
  try {
    const socket = new SockJS(`${API_BASE_URL}/ws-chat`);
    stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("STOMP Debug:", str),
      onConnect: () => {
        console.log("WebSocket 연결 성공");
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame);
      },
      onWebSocketError: (error) => {
        console.error("WebSocket Error:", error);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.activate();
  } catch (error) {
    console.error("WebSocket 연결 실패:", error);
  }
};

// WebSocket 구독
const subscribeToRoom = (roomId) => {
  if (stompClient && stompClient.connected) {
    if (subscription) {
      subscription.unsubscribe();
    }

    subscription = stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
      const chatMessage = JSON.parse(message.body);
      console.log("실시간 메시지 수신:", chatMessage);

      if (chatMessage.crNo === currentRoomId.value) {
        currentMessages.value.push(chatMessage);
        nextTick(() => {
          scrollToBottom();
          markAsRead();
        });
      }
    });
  }
};

// 채팅방 초기화
const initializeChat = async () => {
  try {
    loading.value = true;
    error.value = null;

    // 1. 교사 번호 조회
    console.log("교사 번호 조회 시작...");
    const teacherNo = await apiClient.get(
      `/chat/teacher/${currentUser.value.classroomNo}`
    );
    console.log("교사 번호:", teacherNo);
    currentTeacherNo.value = teacherNo;

    // 2. 채팅방 생성/조회
    console.log("채팅방 연결 시작...");
    const chatRoomRequest = {
      classroomTeacherNo: teacherNo,
      classroomStudentNo: currentUser.value.studentNo,
      classroomNo: currentUser.value.classroomNo,

      //const teacherName = await apiClient.get(`/chat/teacher-name`)
    };

    const roomId = await apiClient.post("/chat/rooms/open", chatRoomRequest);
    console.log("채팅방 ID:", roomId);

    currentRoomId.value = roomId;
    //currentTeacherName.value = "선생님"; // 실제로는 교사 이름을 가져와야 함

    // 3. 메시지 로드
    await loadMessages(roomId);

    setTimeout(() => {
      scrollToBottom();
    }, 100);

    markAsRead();

    // 4. WebSocket 구독
    subscribeToRoom(roomId);
  } catch (err) {
    console.error("채팅방 초기화 실패:", err);
    error.value = err.message || "채팅방을 불러오는데 실패했습니다.";
  } finally {
    loading.value = false;
  }
};

const markAsRead = () => {
  if (!currentRoomId.value || !currentMessages.value.length) return;

  const lastMessage = currentMessages.value[currentMessages.value.length - 1];

  if (lastMessage) {
    const chatReadRequest = {
      crNo: currentRoomId.value,
      lastReadMessageId: lastMessage.messageId,
      readerRole: "STUDENT",
    };

    // WebSocket으로 읽음 처리
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/chat/read",
        body: JSON.stringify(chatReadRequest),
      });
    }
  }
};

// 메시지 로드 (무한 스크롤)
const loadMessages = async (roomId, beforeId = null) => {
  try {
    loadingMessages.value = true;

    const scrollRequest = { crNo: roomId };
    if (beforeId) {
      scrollRequest.beforeId = beforeId;
    }

    const messages = await apiClient.post(
      "/chat/rooms/messages",
      scrollRequest
    );

    if (beforeId) {
      const scrollElement = roomMsgsRef.value;
      const scrollHeightBefore = scrollElement?.scrollHeight || 0;
      // 무한 스크롤로 이전 메시지 추가
      currentMessages.value = [...messages, ...currentMessages.value];
      // 스크롤 위치 조정 (새로 추가된 메시지만큼 아래로 이동하여 위치 유지)
      nextTick(() => {
        if (scrollElement) {
          const scrollHeightAfter = scrollElement.scrollHeight;
          const heightDifference = scrollHeightAfter - scrollHeightBefore;
          scrollElement.scrollTop = scrollElement.scrollTop + heightDifference;
        }
      });
    } else {
      // 초기 로드
      currentMessages.value = messages || [];
      nextTick(() => {
        scrollToBottom();
      });
    }

    hasMoreMessages.value = messages && messages.length >= 0;
  } catch (error) {
    console.error("메시지 로드 실패:", error);
    if (!beforeId) {
      currentMessages.value = [];
    }
  } finally {
    loadingMessages.value = false;
  }
};

// 무한 스크롤
const onScroll = async () => {
  if (!roomMsgsRef.value) return;

  const { scrollTop } = roomMsgsRef.value;

  if (scrollTop == 0 && hasMoreMessages.value && !loadingMessages.value) {
    const oldestMessageId = currentMessages.value[0]?.messageId;
    if (oldestMessageId) {
      await loadMessages(currentRoomId.value, oldestMessageId);
    }
  }
};

// 메시지 전송
const send = () => {
  const text = roomInput.value.trim();
  if (!text || !currentRoomId.value || !stompClient || !stompClient.connected) {
    console.log("전송 조건 미충족:", {
      text,
      roomId: currentRoomId.value,
      connected: stompClient?.connected,
    });
    return;
  }

  const message = {
    crNo: currentRoomId.value,
    content: text,
    writerRole: "STUDENT",
  };

  console.log("메시지 전송:", message);

  stompClient.publish({
    destination: "/app/chat/send",
    body: JSON.stringify(message),
  });

  roomInput.value = "";
};

// 유틸리티 함수들
const scrollToBottom = () => {
  if (roomMsgsRef.value) {
    roomMsgsRef.value.scrollTop = roomMsgsRef.value.scrollHeight;
  }
};

const showDateChip = (i, messages = currentMessages.value) => {
  if (i === 0) return true;
  const current = formatDate(messages[i]?.sentAt);
  const previous = formatDate(messages[i - 1]?.sentAt);
  return current !== previous;
};

const formatDate = (dateTime) => {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}.`;
};

const formatTime = (dateTime) => {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "오후" : "오전";
  const displayH = h % 12 || 12;
  return `${ampm} ${displayH}:${m}`;
};

// 검색 관련 함수들
const isSearchMatch = (msg) => {
  const q = keyword.value.toLowerCase();
  return q && msg.content.toLowerCase().includes(q);
};

const getHighlightedText = (msg) => {
  const q = keyword.value.toLowerCase();
  if (!q) return msg.content;

  if (msg.content.toLowerCase().includes(q)) {
    const reg = new RegExp(
      `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return msg.content.replace(
      reg,
      '<mark style="background: #ffdd29; color: #8c6d32; padding: 2px 4px; border-radius: 4px;">$1</mark>'
    );
  }
  return msg.content;
};

const search = () => {
  if (!keyword.value.trim()) {
    searchResults.value = currentMessages.value;
    return;
  }

  searchResults.value = currentMessages.value.filter((msg) =>
    msg.content.toLowerCase().includes(keyword.value.toLowerCase())
  );
};

const scrollToMessage = (msgId) => {
  view.value = "room";
  nextTick(() => {
    const targetElement = document.getElementById(`msg-${msgId}`);
    if (targetElement && roomMsgsRef.value) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      targetElement.classList.add("highlighted");
      setTimeout(() => {
        targetElement.classList.remove("highlighted");
      }, 2000);
    }
  });
};

// 삭제 관련 함수들
const deleteOne = async (messageId) => {
  try {
    await apiClient.delete(`/chat/messages/${messageId}`);
    currentMessages.value = currentMessages.value.filter(
      (msg) => msg.messageId !== messageId
    );
  } catch (error) {
    console.error("메시지 삭제 실패:", error);
    alert("메시지 삭제에 실패했습니다.");
  }
};

const deleteAll = async () => {
  if (!confirm("내가 보낸 모든 메시지를 삭제하시겠습니까?")) return;

  try {
    await apiClient.delete(`/chat/rooms/${currentRoomId.value}/my-messages`);
    currentMessages.value = currentMessages.value.filter(
      (msg) => msg.writerRole !== "STUDENT"
    );
  } catch (error) {
    console.error("메시지 전체 삭제 실패:", error);
    alert("메시지 삭제에 실패했습니다.");
  }
};

// 기타 이벤트 핸들러들
const close = () => {
  const q = { ...route.query };
  delete q.studentchat;
  delete q.room;
  router.push({ query: q });

  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
};

const openSearch = () => {
  view.value = "search";
  keyword.value = "";
  searchResults.value = currentMessages.value;
};

const closeSearch = () => {
  view.value = "room";
};

const openDelete = () => {
  view.value = "delete";
};

const closeDelete = () => {
  view.value = "room";
};

// 라이프사이클 훅
onMounted(() => {
  if (isOpen.value) {
    connectWebSocket();
    // WebSocket 연결 후 초기화
    setTimeout(() => {
      initializeChat();
    }, 500);
  }
});

onUnmounted(() => {
  if (stompClient) {
    stompClient.deactivate();
  }
});

watch(
  isOpen,
  (v) => {
    if (v) {
      document.body.style.overflow = "hidden";
      connectWebSocket();
      setTimeout(() => {
        initializeChat();
      }, 500);
    } else {
      document.body.style.overflow = "";
    }
  },
  { immediate: false }
);
</script>

<!-- 기존 스타일과 동일 -->
<style scoped>
/* ChatModal.vue와 동일한 스타일 사용 */

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

/* 로딩 및 에러 상태 */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  border: 3px solid #fff5d6;
  margin: 2rem;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.2rem;
  color: #ffb74d;
  margin: 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  font-size: 1.5rem;
  color: #ff9800;
  margin: 0 0 0.5rem 0;
}

.error-state p {
  font-size: 1.1rem;
  color: #ffb74d;
  margin: 0 0 2rem 0;
}

.retry-btn {
  background: #ff9800;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: #f57c00;
  transform: translateY(-2px);
}

/* 무한 스크롤 로딩 표시 */
.loading-more {
  text-align: center;
  padding: 1rem;
  color: #ff9800;
  font-size: 0.9rem;
}

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

.chat-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
  flex: 1;
}

.chat-room {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

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

.msg-row.search-match {
  cursor: pointer;
  transform: scale(1.02);
}

.msg-row.search-match .bubble {
  box-shadow: 0 4px 12px rgba(255, 221, 41, 0.4);
  border: 2px solid #ffdd29;
}

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

.search-input-area {
  padding: 1rem;
  background: #fffbf0;
  border-bottom: 2px solid #ffe066;
}

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

.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #fff5d6;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #ffe066;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #ffdd29;
}
</style>
