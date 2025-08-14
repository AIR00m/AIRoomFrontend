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

          <div class="notification-info">
            <div class="info-icon">💡</div>
            <span>알림은 30일 동안 보관돼요!</span>
          </div>

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

          <div class="notification-list">
            <div v-if="!noti.filtered.length" class="empty-notifications">
              <div class="empty-icon">🔕</div>
              <h4 class="empty-title">아직 새로운 알림이 없어요</h4>
              <p class="empty-description">
                새로운 소식이 생기면 바로 알려드릴게요!
              </p>
            </div>

            <div
              v-for="n in noti.filtered"
              :key="n.id"
              class="notification-item"
              :class="{ 'notification-unread': !n.read }"
              @click="noti.markAsRead(n.id)"
            >
              <div
                v-if="!n.read"
                class="unread-dot"
                title="읽지 않은 알림"
              ></div>
              <div class="notification-content-wrapper">
                <div class="notification-item-header">
                  <span class="notification-category" :class="n.type">
                    {{ n.type }}
                  </span>
                  <span class="notification-time">{{ n.time }}</span>
                </div>
                <div class="notification-message">{{ n.text }}</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { useNotificationStore } from "@/stores/notification";
import { onMounted, onUnmounted, nextTick } from "vue";

const noti = useNotificationStore();

const tabs = ["all", "학습", "공지", "기타"];
const tabLabel = (t) => (t === "all" ? "전체" : t);

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
/* Base Modal Styles */
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

.notification-category.학습 {
  background: #27ae60;
}
.notification-category.공지 {
  background: #e74c3c;
}
.notification-category.기타 {
  background: #f39c12;
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
