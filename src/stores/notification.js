// src/stores/notification.js
import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    items: [
      {
        id: 1,
        type: "학습",
        text: "칭찬 도장(+50)이 도착했어요.",
        time: "05.14 11:18",
        read: false,
      },
      {
        id: 2,
        type: "공지",
        text: "수학 3-1 단원 평가가 등록되었습니다.",
        time: "05.13 14:30",
        read: false,
      },
      {
        id: 3,
        type: "기타",
        text: "새 학습 자료가 업로드되었습니다.",
        time: "05.12 09:15",
        read: true,
      },
    ],
    filter: "all", // all | 학습 | 공지 | 기타
    isOpen: false, // 알림 모달 열림 여부
  }),
  getters: {
    unreadCount: (s) => s.items.filter((i) => !i.read).length,
    filtered: (s) =>
      s.filter === "all" ? s.items : s.items.filter((i) => i.type === s.filter),
  },
  actions: {
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
    setFilter(f) {
      this.filter = f;
    },
    markAsRead(id) {
      const t = this.items.find((i) => i.id === id);
      if (t) t.read = true;
    },
    push({ type, text, time = new Date().toLocaleString() }) {
      const id = (this.items.at(-1)?.id ?? 0) + 1;
      this.items.unshift({ id, type, text, time, read: false });
    },
    clearRead() {
      this.items = this.items.filter((i) => !i.read);
    },
  },
});
