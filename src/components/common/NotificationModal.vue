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
                <i class="bi bi-bell-fill"></i>
              </div>
              <div>
                <h3 class="notification-title">알림</h3>
                <span class="notification-subtitle"
                  >새로운 소식을 확인하세요</span
                >
              </div>
            </div>
            <button
              class="close-btn"
              @click="handleClose"
              type="button"
              aria-label="알림 모달 닫기"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="notification-info">
            <div class="info-icon">
              <i class="bi bi-info-circle-fill"></i>
            </div>
            <span>수신된 알림은 30일 이후 자동 삭제됩니다</span>
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
              <span class="tab-text">{{ tabLabel(t) }}</span>
              <span v-if="noti.filter === t" class="tab-indicator"></span>
            </button>
          </div>

          <div class="notification-list">
            <div v-if="!noti.filtered.length" class="empty-notifications">
              <div class="empty-icon">
                <i class="bi bi-bell-slash"></i>
              </div>
              <h4 class="empty-title">알림이 없습니다</h4>
              <p class="empty-description">
                새로운 알림이 도착하면 여기에 표시됩니다
              </p>
            </div>

            <div
              v-for="n in noti.filtered"
              :key="n.id"
              class="notification-item"
              :class="{ 'notification-unread': !n.read }"
              @click="noti.markAsRead(n.id)"
            >
              <div v-if="!n.read" class="unread-dot"></div>

              <div class="notification-content-wrapper">
                <div class="notification-item-header">
                  <span class="notification-category" :class="n.type">
                    {{ n.type }}
                  </span>
                  <span class="notification-time">{{ n.time }}</span>
                </div>
                <div class="notification-message">{{ n.text }}</div>
              </div>

              <div class="notification-actions">
                <button
                  class="action-btn"
                  @click.stop="noti.markAsRead(n.id)"
                  v-if="!n.read"
                  type="button"
                >
                  <i class="bi bi-check"></i>
                </button>
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
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-slide-leave-active {
  transition: all 0.2s ease;
}

.modal-slide-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.modal-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.notification-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  outline: none;
}

.notification-content {
  background: #fff;
  border-radius: 20px;
  width: min(640px, 100%);
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notification-header {
  background: linear-gradient(135deg, #034582 0%, #0369a1 100%);
  color: #fff;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.notification-header::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30px, -30px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.notification-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.notification-subtitle {
  font-size: 0.875rem;
  opacity: 0.8;
  font-weight: 400;
}

.close-btn {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  border: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.125rem;
  position: relative;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.close-btn:active {
  transform: scale(0.95);
}

.close-btn:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.notification-info {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #0369a1;
  font-weight: 500;
}

.info-icon {
  color: #0284c7;
  font-size: 1.125rem;
}

.notification-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.25rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.tab-button {
  position: relative;
  padding: 0.75rem 1.25rem;
  border: 0;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  overflow: hidden;
}

.tab-button:hover {
  background: #f1f5f9;
  color: #475569;
  transform: translateY(-1px);
}

.tab-button.active {
  background: #034582;
  color: #fff;
  box-shadow: 0 4px 12px rgba(3, 69, 130, 0.3);
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
}

.notification-list {
  padding: 0 1.25rem 1.25rem;
  max-height: 50vh;
  overflow-y: auto;
}

.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.empty-notifications {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: #94a3b8;
  border: 2px solid #e2e8f0;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.notification-item {
  position: relative;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 1.25rem;
  margin: 0.75rem 0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  overflow: hidden;
}

.notification-item:hover {
  background: #fafbfc;
  border-color: #e2e8f0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.notification-item.notification-unread {
  background: linear-gradient(
    135deg,
    #f0f9ff 0%,
    rgba(240, 249, 255, 0.5) 100%
  );
  border-color: #bae6fd;
}

.notification-item.notification-unread::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #0284c7 0%, #0369a1 100%);
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #0284c7;
  border-radius: 50%;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.notification-content-wrapper {
  flex: 1;
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
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: #fff;
}

.notification-category.학습 {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.notification-category.공지 {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.notification-category.기타 {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
}

.notification-message {
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.5;
  font-weight: 400;
  margin-bottom: 0.5rem;
}

.notification-time {
  font-size: 0.8125rem;
  color: #9ca3af;
  font-weight: 500;
}

.notification-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.action-btn:hover {
  background: #034582;
  color: #fff;
  transform: scale(1.05);
}
</style>
