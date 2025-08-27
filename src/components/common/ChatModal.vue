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
                <div
                  v-for="(st, i) in students"
                  :key="st.classroomStudentNo"
                  class="chat-card"
                >
                  <input
                    type="checkbox"
                    class="form-check-input"
                    v-model="selectedIds"
                    :value="st.classroomStudentNo"
                  />
                  <div class="card-index">{{ i + 1 }}.</div>
                  <div class="card-name">{{ st.studentName }}</div>
                  <button
                    class="btn-primary"
                    @click="openRoom(st.classroomStudentNo, st.studentName)"
                  >
                    대화하기
                  </button>
                </div>
              </div>
            </div>

            <!-- 대화 목록 -->
            <div v-show="tab === 'threads'">
              <div class="chat-list">
                <div
                  v-for="(th, i) in sortedThreads"
                  :key="th.crNo"
                  class="chat-card"
                  @click="openRoomById(th.crNo)"
                >
                  <div class="card-index">{{ i + 1 }}.</div>
                  <div class="card-content">
                    <div class="card-name">
                      {{ getStudentNameByRoomId(th.crNo) }}
                    </div>
                    <div class="card-message">
                      {{ th.lastMessage || "대화를 시작해보세요" }}
                    </div>
                    <div class="card-time">
                      {{ formatDateTime(th.lastMessageTime) }}
                    </div>
                  </div>
                  <div v-if="th.unreadCount > 0" class="unread-badge">
                    {{ th.unreadCount }}
                  </div>
                  <button
                    class="btn-primary"
                    @click.stop="openRoomById(th.crNo)"
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
          <div ref="roomMsgsRef" class="chat-messages" @scroll="onScroll">
            <div v-if="loadingMessages" class="loading-more">
              <span>메시지를 불러오는 중...</span>
            </div>
            <template v-for="(msg, i) in currentMessages" :key="msg.messageId">
              <div v-if="showDateChip(i)" class="date-chip">
                <span>{{ formatDate(msg.sentAt) }}</span>
              </div>
              <div
                :id="`msg-${msg.messageId}`"
                class="msg-row"
                :class="msg.writerRole === 'TEACHER' ? 'me' : 'other'"
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
            <template v-for="(msg, i) in searchResults" :key="msg.messageId">
              <div v-if="showDateChip(i, searchResults)" class="date-chip">
                <span>{{ formatDate(msg.sentAt) }}</span>
              </div>
              <div
                :id="`search-msg-${msg.messageId}`"
                class="msg-row"
                :class="[
                  msg.writerRole === 'TEACHER' ? 'me' : 'other',
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
            <template v-for="(msg, i) in currentMessages" :key="msg.messageId">
              <div v-if="showDateChip(i)" class="date-chip">
                <span>{{ formatDate(msg.sentAt) }}</span>
              </div>
              <div
                class="msg-row"
                :class="msg.writerRole === 'TEACHER' ? 'me' : 'other'"
              >
                <div class="bubble delete-mode">
                  <div class="text" v-html="msg.content"></div>
                  <div class="time">{{ formatTime(msg.sentAt) }}</div>
                  <button
                    v-if="msg.writerRole === 'TEACHER'"
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
</template>

<script setup>
import { computed, nextTick, ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import apiClient from "@/utils/apiClient";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 모달 열림 여부는 URL 쿼리로 제어 (?chat=1)
const isOpen = computed(() => route.query.chat === "1");

// 상태 관리
const view = ref("list");
const tab = ref("students");
const students = ref([]);
const threads = ref([]);
const currentMessages = ref([]);
const currentRoomId = ref(null);
const currentStudentNo = ref(null);
const currentStudentName = ref("");
const selectedIds = ref([]);
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
//const API_BASE_URL = "http://localhost:8080";
const API_BASE_URL = "http://43.200.2.244:8080";

// 현재 사용자 정보
const currentUser = computed(() => ({
  classroomNo:
    authStore.tokenInfo?.classroomNo ||
    parseInt(localStorage.getItem("classroomNo")) ||
    1,
  teacherNo:
    authStore.tokenInfo?.memberNo ||
    parseInt(localStorage.getItem("memberNo")) ||
    1,
  role: "TEACHER",
}));

// WebSocket 연결
const connectWebSocket = () => {
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
  });

  stompClient.activate();
};

// WebSocket 구독
const subscribeToRoom = (roomId) => {
  if (stompClient && stompClient.connected) {
    // 기존 구독 해제
    if (subscription) {
      subscription.unsubscribe();
    }

    // 새 채팅방 구독
    subscription = stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
      const chatMessage = JSON.parse(message.body);
      console.log("실시간 메시지 수신:", chatMessage);

      // 현재 채팅방의 메시지인 경우에만 추가
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

// 데이터 초기화
const ensureData = async () => {
  try {
    await Promise.all([fetchStudents(), fetchThreads()]);
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  }
};

// 학생 목록 조회
const fetchStudents = async () => {
  try {
    const data = await apiClient.get(
      `/chat/students/list/${currentUser.value.classroomNo}`
    );
    students.value = data || [];
    console.log("학생 목록:", students.value);
  } catch (error) {
    console.error("학생 목록 조회 실패:", error);
    students.value = [];
  }
};

// 대화 목록 조회
const fetchThreads = async () => {
  try {
    const data = await apiClient.get(
      `/chat/rooms/list/${currentUser.value.teacherNo}`
    );
    threads.value = data || [];
    console.log("대화 목록:", threads.value);
  } catch (error) {
    console.error("대화 목록 조회 실패:", error);
    threads.value = [];
  }
};

// 채팅방 열기 (학생 번호로)
const openRoom = async (studentNo, studentName) => {
  try {
    const chatRoomRequest = {
      classroomTeacherNo: currentUser.value.teacherNo,
      classroomStudentNo: studentNo,
      classroomNo: currentUser.value.classroomNo,
    };

    const roomId = await apiClient.post("/chat/rooms/open", chatRoomRequest);

    currentRoomId.value = roomId;
    currentStudentNo.value = studentNo;
    currentStudentName.value = studentName;
    view.value = "room";

    // 메시지 로드
    await loadMessages(roomId);

    markAsRead();

    // WebSocket 구독
    subscribeToRoom(roomId);

    // URL 업데이트
    router.push({ query: { ...route.query, chat: "1", room: String(roomId) } });
  } catch (error) {
    console.error("채팅방 열기 실패:", error);
    alert("채팅방을 열 수 없습니다.");
  }
};

// 채팅방 열기 (채팅방 ID로)
const openRoomById = async (roomId) => {
  try {
    currentRoomId.value = roomId;
    view.value = "room";

    // 학생 이름 찾기
    const student = findStudentByRoomId(roomId);
    if (student) {
      currentStudentName.value = student.studentName;
      currentStudentNo.value = student.classroomStudentNo;
    }

    // 메시지 로드
    await loadMessages(roomId);

    markAsRead();

    // WebSocket 구독
    subscribeToRoom(roomId);

    // URL 업데이트
    router.push({ query: { ...route.query, chat: "1", room: String(roomId) } });
  } catch (error) {
    console.error("채팅방 열기 실패:", error);
  }
};

// 메시지 로드
const loadMessages = async (roomId, beforeId = null) => {
  try {
    loadingMessages.value = true;

    const scrollRequest = {
      crNo: roomId,
      beforeId: beforeId,
    };

    const messages = await apiClient.post(
      "/chat/rooms/messages",
      scrollRequest
    );

    if (beforeId) {
      const scrollElement = roomMsgsRef.value;
      const scrollHeightBefore = scrollElement?.scrollHeight || 0;
      // 무한 스크롤로 이전 메시지 추가
      currentMessages.value = [...messages, ...currentMessages.value];
      // 스크롤 위치 조정하여 현재 보던 메시지 위치 유지
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
    currentMessages.value = [];
  } finally {
    loadingMessages.value = false;
  }
};

const markAsRead = () => {
  if (!currentRoomId.value || !currentMessages.value.length) return;

  const lastMessage = currentMessages.value[currentMessages.value.length - 1];

  if (lastMessage) {
    const chatReadRequest = {
      crNo: currentRoomId.value,
      lastReadMessageId: lastMessage.messageId,
      readerRole: "TEACHER",
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

const sortedThreads = computed(() => {
  return [...threads.value].sort((a, b) => {
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
  });
});

// 메시지 전송
const send = () => {
  const text = roomInput.value.trim();
  if (!text || !currentRoomId.value || !stompClient || !stompClient.connected)
    return;

  const message = {
    crNo: currentRoomId.value,
    content: text,
    writerRole: "TEACHER",
  };

  // WebSocket으로 메시지 전송
  stompClient.publish({
    destination: "/app/chat/send",
    body: JSON.stringify(message),
  });

  roomInput.value = "";
};

// 스크롤 이벤트 (무한 스크롤을 위한)
const onScroll = async () => {
  if (!roomMsgsRef.value) return;

  const { scrollTop } = roomMsgsRef.value;

  // 스크롤이 맨 위에 있고, 더 불러올 메시지가 있으면
  if (scrollTop == 0 && hasMoreMessages.value && !loadingMessages.value) {
    const oldestMessageId = currentMessages.value[0]?.messageId;
    if (oldestMessageId) {
      await loadMessages(currentRoomId.value, oldestMessageId);
    }
  }
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

const formatDateTime = (dateTime) => {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  return `${formatDate(dateTime)} ${formatTime(dateTime)}`;
};

const findStudentByRoomId = (roomId) => {
  // threads에서 해당 roomId의 학생 정보를 찾는 로직
  // 실제로는 API에서 학생 정보도 함께 제공해야 함
  return students.value.find(
    (s) => s.classroomStudentNo === currentStudentNo.value
  );
};

const getStudentNameByRoomId = (roomId) => {
  // 실제로는 threads에 학생 이름도 포함되어야 함
  const student = findStudentByRoomId(roomId);
  return student?.studentName || "학생";
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
      (msg) => msg.writerRole !== "TEACHER"
    );
  } catch (error) {
    console.error("메시지 전체 삭제 실패:", error);
    alert("메시지 삭제에 실패했습니다.");
  }
};

// 기타 이벤트 핸들러들
const close = () => {
  const q = { ...route.query };
  delete q.chat;
  delete q.room;
  router.push({ query: q });

  // WebSocket 구독 해제
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
};

const toggleAll = (e) => {
  selectedIds.value = e.target.checked
    ? students.value.map((s) => s.classroomStudentNo)
    : [];
};

const openFirstSelected = () => {
  if (!selectedIds.value.length) return alert("대화할 학생을 선택해주세요.");
  const studentNo = selectedIds.value[0];
  const student = students.value.find(
    (s) => s.classroomStudentNo === studentNo
  );
  if (student) openRoom(student.classroomStudentNo, student.studentName);
};

const backToList = () => {
  view.value = "list";
  // WebSocket 구독 해제
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

const refreshStudents = () => {
  fetchStudents();
};

// 라이프사이클 훅
onMounted(() => {
  if (isOpen.value) {
    ensureData();
  }
  connectWebSocket();
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
      ensureData();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* 기존 스타일 유지하되 메시지 정렬 부분만 수정 */

/* 메시지 정렬 - 선생님(me)은 오른쪽, 학생(other)은 왼쪽 */
.msg-row.me {
  justify-content: flex-end;
}

.msg-row.other {
  justify-content: flex-start;
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

/* 무한 스크롤 로딩 표시 */
.loading-more {
  text-align: center;
  padding: 1rem;
  color: #ff9800;
  font-size: 0.9rem;
}

/* 기존 스타일들은 그대로 유지 */
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

/* 나머지 기존 스타일들은 동일하게 유지 */
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

.unread-badge {
  background: #ff4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  animation: pulse 2s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>
