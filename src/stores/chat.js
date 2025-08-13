// src/stores/chat.js
import { defineStore } from "pinia";

export const useChatStore = defineStore("chat", {
  state: () => ({
    students: [],
    threads: [],
    history: {}, // { [roomId]: ChatMsg[] }
    currentRoomId: null,
    currentStudentName: "",
    view: "list", // 'list' | 'room' | 'search' | 'delete'
    tab: "students", // 'students' | 'threads'
  }),

  actions: {
    async fetchStudents() {
      // TODO: 실제 API로 교체
      this.students = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `학생${i + 1}`,
      }));
    },

    async fetchThreads() {
      // TODO: 실제 API로 교체
      this.threads = [
        {
          id: 2,
          name: "학생2",
          lastMessage: "네, 알겠습니다!",
          date: "07. 02. 오후 02:21",
        },
        {
          id: 6,
          name: "학생6",
          lastMessage: "감사합니다",
          date: "06. 26. 오후 05:33",
        },
        {
          id: 7,
          name: "학생7",
          lastMessage: "안녕하세요",
          date: "06. 25. 오후 04:10",
        },
      ];
    },

    findStudentById(id) {
      return this.students.find((s) => s.id === id);
    },

    findThreadById(id) {
      return this.threads.find((t) => t.id === id);
    },

    enterRoom(id, name) {
      this.currentRoomId = id;
      this.currentStudentName = name;
      this.view = "room";
      if (!this.history[id]) this.history[id] = [];
    },

    appendMessage(roomId, msg) {
      if (!this.history[roomId]) this.history[roomId] = [];
      this.history[roomId].push(msg);
      // TODO: 서버 전송 API 호출
    },

    deleteMessage(roomId, messageId) {
      if (!roomId || !this.history[roomId]) return;
      this.history[roomId] = this.history[roomId].filter(
        (m) => m.id !== messageId
      );
      // TODO: 서버 삭제 API 호출
    },

    deleteAllMine(roomId) {
      if (!roomId || !this.history[roomId]) return;
      this.history[roomId] = this.history[roomId].filter(
        (m) => m.sender !== "me"
      );
      // TODO: 서버 일괄 삭제 API 호출
    },
  },
});
