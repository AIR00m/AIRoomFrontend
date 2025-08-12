// src/stores/chat.js
import { defineStore } from "pinia";

export const useChatStore = defineStore("chat", {
  state: () => ({
    // 방 목록(학생 목록과 동일시해도 됨)
    rooms: [
      { id: "stu1", name: "학생1", unread: 0 },
      { id: "stu2", name: "학생2", unread: 3 },
      { id: "stu3", name: "학생3", unread: 1 },
    ],
    // 메시지 맵(방별)
    messages: {
      stu2: [
        { id: 1, sender: "학생", text: "집중!!!", time: "오후 06:55" },
        { id: 2, sender: "선생님", text: "문자발송", time: "오후 04:31" },
        { id: 3, sender: "학생", text: "ㄴㅇㄹ", time: "오후 05:33" },
        { id: 4, sender: "학생", text: "11", time: "오후 02:21" },
      ],
    },
    activeRoomId: null, // 현재 들어간 방
    isOpen: false, // 채팅 모달 열림 여부
  }),
  getters: {
    activeRoom(state) {
      return state.rooms.find((r) => r.id === state.activeRoomId) || null;
    },
    activeMessages(state) {
      return state.messages[state.activeRoomId] ?? [];
    },
    totalUnread(state) {
      return state.rooms.reduce((a, b) => a + (b.unread || 0), 0);
    },
  },
  actions: {
    open(roomId = null) {
      this.isOpen = true;
      if (roomId) this.enterRoom(roomId);
    },
    close() {
      this.isOpen = false;
    },
    enterRoom(roomId) {
      this.activeRoomId = roomId;
      const room = this.rooms.find((r) => r.id === roomId);
      if (room) room.unread = 0;
    },
    send(text, sender = "선생님") {
      if (!this.activeRoomId || !text?.trim()) return;
      const list = (this.messages[this.activeRoomId] ??= []);
      list.push({
        id: crypto.randomUUID(),
        sender,
        text,
        time: new Date().toLocaleTimeString(),
      });
    },
    receive(roomId, text) {
      const list = (this.messages[roomId] ??= []);
      list.push({
        id: crypto.randomUUID(),
        sender: "학생",
        text,
        time: new Date().toLocaleTimeString(),
      });
      const room = this.rooms.find((r) => r.id === roomId);
      if (room && roomId !== this.activeRoomId)
        room.unread = (room.unread || 0) + 1;
    },
  },
});
