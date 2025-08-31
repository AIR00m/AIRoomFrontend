<!-- src/components/NotificationModal.vue -->
<template>
  <Transition name="modal-fade">
    <div
      v-if="noti.isOpen"
      class="notification-modal"
      @click.self="noti.close()"
      @keydown.esc="noti.close()"
      tabindex="0"
    >
      <Transition name="modal-slide">
        <div v-if="noti.isOpen" class="notification-content">
          <!-- Header -->
          <div class="notification-header">
            <div class="header-left">
              <div class="notification-icon">
                <span>📢</span>
              </div>
              <div>
                <h3 class="notification-title">알림이 도착했어요!</h3>
                <span class="notification-subtitle"
                  >놓치면 안되는 소식들이에요 ✨</span
                >
              </div>
            </div>
            <button
              class="close-btn"
              @click="handleClose"
              type="button"
              aria-label="알림 모달 닫기"
            >
              ❌
            </button>
          </div>

          <!-- Info Box with Mark All Read Button -->
          <div class="notification-info">
            <div class="info-icon">💡</div>
            <span>알림은 30일 동안 보관돼요!</span>
            <!-- ✅ notification.js에서 markAllAsRead 기능 추가 -->
            <!-- <button
              @click="noti.markAllAsRead"
              class="mark-all-read-btn"
              v-if="noti.unreadCount > 0"
            >
              모두 읽음 처리 ({{ noti.unreadCount }})
            </button> -->
          </div>

          <!-- Tabs with notification.js filter categories -->
          <div class="notification-tabs">
            <button
              v-for="t in tabs"
              :key="t"
              class="tab-button"
              :class="{ active: noti.filter === t }"
              @click="noti.setFilter(t)"
              type="button"
            >
              {{ tabLabel(t) }}
            </button>
          </div>

          <!-- ✅ 무한 스크롤 기능이 있는 알림 목록 -->
          <div
            class="notification-list"
            ref="scrollContainer"
            @scroll="handleScroll"
          >
            <!-- Empty State -->
            <div
              v-if="!noti.filtered.length && !noti.isLoading"
              class="empty-notifications"
            >
              <div class="empty-icon">🔕</div>
              <h4 class="empty-title">아직 새로운 알림이 없어요</h4>
              <p class="empty-description">
                새로운 소식이 생기면 바로 알려드릴게요!
              </p>
            </div>

            <!-- Notification Items from notification.js -->
            <div
              v-for="n in noti.filtered"
              :key="n.id"
              class="notification-item"
              :class="{ 'notification-unread': !n.read, 'has-link': !!n.url }"
              @click="handleNotificationClick(n)"
            >
              <div
                v-if="!n.read"
                class="unread-dot"
                title="읽지 않은 알림"
              ></div>
              <div class="notification-content-wrapper">
                <div class="notification-item-header">
                  <span
                    class="notification-category"
                    :class="`category-${n.type}`"
                  >
                    {{ n.type }}
                  </span>
                  <span class="notification-time">{{ n.time }}</span>
                </div>
                <div class="notification-message">{{ n.text }}</div>
                <!-- ⭐ URL이 있으면 링크 아이콘 표시 -->
                <div v-if="n.url" class="notification-link-hint">
                  🔗 클릭하면 해당 페이지로 이동합니다
                </div>
              </div>
            </div>

            <!-- ✅ 로딩 상태 (notification.js에서 추가) -->
            <div v-if="noti.isLoading" class="loading-more">
              <div class="loading-spinner"></div>
              <p>더 많은 알림을 불러오는 중...</p>
            </div>

            <!-- ✅ 더 이상 알림이 없을 때 (notification.js에서 추가) -->
            <div
              v-else-if="!noti.hasMore && noti.items.length > 0"
              class="no-more-notifications"
            >
              <p>모든 알림을 확인했습니다 ✨</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { useNotificationStore } from "@/stores/notification";
import { useRouter } from "vue-router"; // ⭐ router 추가
import { onMounted, onUnmounted, nextTick, ref } from "vue";

const noti = useNotificationStore();
const router = useRouter(); // ⭐ router 인스턴스 생성
const scrollContainer = ref(null);

// ✅ notification.js 카테고리에 맞춘 탭 설정
const tabs = ["all", "과제", "평가", "공지", "학습", "기타"];
const tabLabel = (t) => (t === "all" ? "전체" : t);

// ⭐ 알림 클릭 처리 함수
const handleNotificationClick = async (notification) => {
  try {
    console.log("알림 클릭:", notification);

    // router를 파라미터로 전달하여 markAsRead 호출
    await noti.markAsRead(notification.id);

    // notification.url에는 이미 SSE 전송 시점에서 치환됨
    if (notification.url) {
      router.push(notification.url);
    } else {
      console.log("URL이 없는 알림입니다.");
    }

    noti.close();
    // URL이 없는 경우에도 읽음 처리는 됨
  } catch (error) {
    console.error("알림 처리 실패:", error);
  }
};

// ✅ 무한 스크롤 기능 추가 (notification.js에서)
const handleScroll = () => {
  const container = scrollContainer.value;
  if (!container) return;

  const { scrollTop, scrollHeight, clientHeight } = container;
  // 하단 100px 근처에 도달하면 추가 로드
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    noti.loadMore();
  }
};

const handleClose = async () => {
  await noti.close();
  await nextTick();
};

const handleEscapeKey = (event) => {
  if (event.key === "Escape" && noti.isOpen) {
    handleClose();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscapeKey);
});
</script>

<style scoped>
/* ✅ notification.js에서 사용하는 새로운 스타일 추가 */
.mark-all-read-btn {
  background: #ffdd29;
  border: none;
  border-radius: 15px;
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b4513;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
}

.mark-all-read-btn:hover {
  background: #ffe066;
  transform: scale(1.05);
}

.loading-more {
  text-align: center;
  padding: 1rem;
  color: #ffb74d;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffe066;
  border-top: 2px solid #ffdd29;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 0.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-more-notifications {
  text-align: center;
  padding: 1rem;
  color: #ffb74d;
  font-size: 0.9rem;
}

/* ✅ notification.js 카테고리별 색상 */
.category-과제 {
  background: #27ae60;
}
.category-평가 {
  background: #e74c3c;
}
.category-공지 {
  background: #f39c12;
}
.category-학습 {
  background: #3498db;
}
.category-기타 {
  background: #95a5a6;
}

/* Base Modal Styles (원본 유지) */
.notification-modal {
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  position: fixed;
  inset: 0;
  background: rgba(85, 68, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  outline: none;
}

.notification-content {
  background: #fffbf0;
  border-radius: 30px;
  border: 3px solid #ffe066;
  box-shadow: 0 20px 60px rgba(255, 221, 41, 0.15);
  width: min(600px, 100%);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  transform: translateY(30px) scale(0.95);
}

/* Header */
.notification-header {
  background: #ffdd29;
  color: white;
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.notification-title {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
}

.notification-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 600;
}

.close-btn {
  color: #a37800;
  background: rgba(255, 255, 255, 0.3);
  border: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.125rem;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.1) rotate(90deg);
}

/* Info Box */
.notification-info {
  background: #fff9e6;
  border: 2px dashed #ffe066;
  border-radius: 15px;
  padding: 0.75rem 1rem;
  margin: 1rem 1.5rem;
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
.notification-tabs {
  display: flex;
  gap: 8px;
  padding: 6px;
  margin: 0 1.5rem 1rem;
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

/* Notification List */
.notification-list {
  padding: 0 1.5rem 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

.notification-list::-webkit-scrollbar {
  width: 8px;
}
.notification-list::-webkit-scrollbar-track {
  background: #fff5d6;
  border-radius: 4px;
}
.notification-list::-webkit-scrollbar-thumb {
  background: #ffe066;
  border-radius: 4px;
}
.notification-list::-webkit-scrollbar-thumb:hover {
  background: #ffdd29;
}

/* Empty State */
.empty-notifications {
  text-align: center;
  padding: 3rem 1rem;
  color: #ffb74d;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  display: inline-block;
  opacity: 0.8;
  animation: wiggle 2s ease-in-out infinite;
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  75% {
    transform: rotate(-5deg);
  }
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ff9800;
  margin: 0 0 0.5rem;
}

.empty-description {
  font-size: 0.9rem;
  color: #ffb74d;
  margin: 0;
}

/* Notification Item */
.notification-item {
  position: relative;
  background: white;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-item:hover {
  border-color: #ffdd29;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.2);
}

.notification-item.notification-unread {
  background: #fff9e6;
  border-color: #ffe066;
}

.unread-dot {
  width: 10px;
  height: 10px;
  background: #f57c00;
  border-radius: 50%;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 5px;
}

.notification-content-wrapper {
  flex: 1;
  min-width: 0; /* Prevents overflow issues */
}

.notification-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.notification-category {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
}

.notification-message {
  font-size: 0.9375rem;
  color: #8c6d32;
  line-height: 1.5;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.notification-time {
  font-size: 0.8125rem;
  color: #ffb74d;
  font-weight: 600;
  flex-shrink: 0;
  margin-left: 0.5rem;
}
</style>
