// src/stores/presenceStore.js
import { defineStore } from "pinia";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { apiFetch } from "@/utils/api";

const BASE = import.meta.env.VITE_BACKEND_URL || "";

export const usePresenceStore = defineStore("presence", {
  state: () => ({
    // { studentId: { online:boolean, lastSeen:string } }  (단원 구독용 상태)
    unitPresence: {},
    // 글로벌 상태가 필요하면 별도 map 사용 가능
    globalPresence: {},
    _globalClient: null,
    _unitClient: null,
    _heartbeatTimerGlobal: null,
    _heartbeatTimerUnit: null,
    me: { role: "TEACHER", studentId: null }, // 프로젝트에서 setMe로 갱신
  }),

  actions: {
    setMe(me) {
      this.me = me || { role: "TEACHER", studentId: null };
    },

    // 로그인 직후 호출(학생이면 글로벌 온라인 유지)
    connectGlobal() {
      if (this._globalClient) return;
      const headers = {
        studentId: this.me.studentId || `teacher-${Date.now()}`,
        unitNo: String(0), // 글로벌 채널: 0
        role: this.me.role,
      };
      const c = new Client({
        webSocketFactory: () => new SockJS(`${BASE}/ws`),
        connectHeaders: headers,
        debug: () => {},
        reconnectDelay: 3000,
      });
      c.onConnect = () => {
        c.subscribe(`/topic/presence/0`, (frame) => {
          const msg = JSON.parse(frame.body);
          this.globalPresence[msg.studentId] = {
            online: msg.online,
            lastSeen: msg.lastSeen,
          };
        });
        if (this.me.role === "STUDENT") {
          this._heartbeatTimerGlobal = setInterval(() => {
            c.publish({ destination: "/app/presence.ping", body: "" });
          }, 5000);
        }
      };
      c.activate();
      this._globalClient = c;
    },

    disconnectGlobal() {
      if (this._heartbeatTimerGlobal) {
        clearInterval(this._heartbeatTimerGlobal);
        this._heartbeatTimerGlobal = null;
      }
      if (this._globalClient) {
        try {
          this._globalClient.deactivate();
        } catch (_) {}
        this._globalClient = null;
      }
      this.globalPresence = {};
    },

    // 교사용 페이지에서 단원 입장시 호출
    async connectUnit(unitNo) {
      await this.loadSnapshot(unitNo);
      if (this._unitClient) {
        // unit 변경 시 이전 연결 정리
        this.disconnectUnit();
      }
      const headers = {
        studentId: this.me.studentId || `teacher-${Date.now()}`,
        unitNo: String(unitNo),
        role: this.me.role,
      };
      const c = new Client({
        webSocketFactory: () => new SockJS(`${BASE}/ws`),
        connectHeaders: headers,
        debug: () => {},
        reconnectDelay: 3000,
      });
      c.onConnect = () => {
        c.subscribe(`/topic/presence/${unitNo}`, (frame) => {
          const msg = JSON.parse(frame.body);
          this.unitPresence[msg.studentId] = {
            online: msg.online,
            lastSeen: msg.lastSeen,
          };
        });
        if (this.me.role === "STUDENT") {
          this._heartbeatTimerUnit = setInterval(() => {
            c.publish({ destination: "/app/presence.ping", body: "" });
          }, 5000);
        }
      };
      c.activate();
      this._unitClient = c;
    },

    disconnectUnit() {
      if (this._heartbeatTimerUnit) {
        clearInterval(this._heartbeatTimerUnit);
        this._heartbeatTimerUnit = null;
      }
      if (this._unitClient) {
        try {
          this._unitClient.deactivate();
        } catch (_) {}
        this._unitClient = null;
      }
      this.unitPresence = {};
    },

    async loadSnapshot(unitNo) {
      try {
        const list = await apiFetch(`/api/presence/${unitNo}`);
        const map = {};
        list.forEach((m) => {
          map[m.studentId] = { online: m.online, lastSeen: m.lastSeen };
        });
        this.unitPresence = map;
      } catch (e) {
        console.error("presence snapshot 실패", e);
      }
    },

    isOnline(mapName, studentId) {
      const map = mapName === "unit" ? this.unitPresence : this.globalPresence;
      return map[studentId]?.online === true;
    },
    lastSeenText(mapName, studentId) {
      const map = mapName === "unit" ? this.unitPresence : this.globalPresence;
      const iso = map[studentId]?.lastSeen;
      if (!iso) return "";
      const d = new Date(iso);
      const t = (n) => String(n).padStart(2, "0");
      return `${t(d.getHours())}:${t(d.getMinutes())}:${t(d.getSeconds())}`;
    },

    // 탭 닫기 보조(학생만)
    sendOfflineBeacon(unitNo) {
      if (!(this.me.role === "STUDENT" && this.me.studentId)) return;
      try {
        const data = JSON.stringify({ studentId: this.me.studentId, unitNo });
        navigator.sendBeacon(
          `${BASE}/api/presence/offline`,
          new Blob([data], { type: "application/json" })
        );
      } catch (_) {}
    },
  },
});
