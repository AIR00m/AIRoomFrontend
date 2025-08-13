<!-- src/components/NotificationModal.vue -->
<template>
  <div v-if="noti.isOpen" class="notification-modal" @click.self="noti.close()">
    <div class="notification-content">
      <div class="notification-header">
        <h3 class="notification-title">알림</h3>
        <button class="close-btn" @click="noti.close()">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="notification-info">
        <i class="bi bi-info-circle me-2"></i> 수신된 알림은 30일 이후 자동
        삭제됩니다.
      </div>

      <div class="notification-tabs">
        <button
          v-for="t in tabs"
          :key="t"
          class="tab-button"
          :class="{ active: noti.filter === t }"
          @click="noti.setFilter(t)"
        >
          {{ tabLabel(t) }}
        </button>
      </div>

      <div class="notification-list">
        <div
          v-if="!noti.filtered.length"
          class="empty-notifications text-center py-5 text-muted"
        >
          <i class="bi bi-bell-slash display-5 d-block mb-2"></i>
          알림이 없습니다
        </div>

        <div
          v-for="n in noti.filtered"
          :key="n.id"
          class="notification-item"
          :class="n.read ? 'read' : 'unread'"
          @click="noti.markAsRead(n.id)"
        >
          <div class="notification-item-header">
            <span class="notification-category" :class="n.type">{{
              n.type
            }}</span>
          </div>
          <div class="notification-message">{{ n.text }}</div>
          <div class="notification-time">{{ n.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotificationStore } from "@/stores/notification";
const noti = useNotificationStore();

const tabs = ["all", "학습", "공지", "기타"];
const tabLabel = (t) => (t === "all" ? "전체" : t);
</script>

<style scoped>
/* 필요한 최소 스타일만 (나머진 기존 CSS 재사용) */
.notification-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.notification-content {
  background: #fff;
  border-radius: 12px;
  width: min(600px, 92vw);
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.notification-header {
  background: #034582;
  color: #fff;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.notification-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
}
.tab-button {
  padding: 0.6rem 1rem;
  border: 0;
  border-radius: 24px;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
}
.tab-button.active {
  background: #034582;
  color: #fff;
}
.notification-list {
  padding: 0 1.25rem 1.25rem;
  max-height: 48vh;
  overflow: auto;
}
.notification-item {
  background: #f8fafc;
  border-left: 4px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.75rem 0;
  cursor: pointer;
}
.notification-item.unread {
  background: #f0f9ff;
  border-left-color: #034582;
}
.notification-category.학습 {
  background: #059669;
}
.notification-category.공지 {
  background: #dc2626;
}
.notification-category.기타 {
  background: #7c3aed;
}
.close-btn {
  color: #fff;
  background: transparent;
  border: 0;
}
</style>
