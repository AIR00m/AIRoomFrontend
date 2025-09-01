// src/utils/presenceClient.js
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import apiClient from "@/utils/apiClient"; // 질문에 준 파일의 default export

/**
 * Presence 클라이언트
 * - 스냅샷: apiClient로 HTTP GET
 * - 실시간: STOMP (Authorization + classNo/userId/role 헤더 포함)
 */
class PresenceClient {
  constructor({
    // ws 엔드포인트: 추측으로 /ws. 다르면 바꿔주세요.
    wsPath = "/ws-presence",
    topicPrefix = "/topic",
    appPrefix = "/app",
    // 하트비트 간격은 PresenceService.ONLINE_WINDOW_MS보다 짧게
    heartbeatMs = 5_000,
  } = {}) {
    this.wsPath = wsPath;
    this.topicPrefix = topicPrefix;
    this.appPrefix = appPrefix;
    this.heartbeatMs = heartbeatMs;

    this.client = null;
    this.subscription = null;
    this.heartbeatTimer = null;
    this.ctx = null; // { classNo, userId, role }
  }

  // ---- 공개 API ----

  /** 교사 초기 스냅샷 */
  snapshot(classNo) {
    return apiClient.get(`/api/presence/${classNo}`);
  }

  /** 웹소켓 연결 여부 확인 메서드 추가 */
  isConnected() {
    return this.client && this.client.active;
  }

  /** 연결 + (교사) 구독 / (학생) enter+하트비트 시작 */
  async connect({ classNo, userId, role }, { onEvent } = {}) {
    // 토큰 만료면 ApiClient 로직 사용
    if (!apiClient.isTokenValid()) {
      await this._handleAuthFail();
      return;
    }

    this.ctx = { classNo: String(classNo), userId: String(userId), role };

    // 예: http://localhost:8080/ws-presence
    const wsUrl = `${apiClient.baseURL}${this.wsPath}`;
    // Bearer 토큰
    const token = localStorage.getItem("accessToken"); // apiClient에서 직접 가져오기보다 localStorage 사용
    const authHeader = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;

    // STOMP 클라이언트
    this.client = new Client({
      // SockJS로 핸드쉐이크
      webSocketFactory: () => new SockJS(wsUrl),
      // STOMP CONNECT 프레임 헤더 (PresenceHeaderInterceptor가 읽음)
      connectHeaders: {
        Authorization: authHeader,
        classNo: this.ctx.classNo,
        userId: this.ctx.userId,
        role: this.ctx.role, // 'student' | 'teacher'
      },
      reconnectDelay: 5000, // 재연결
      debug: () => {}, // 필요시 console.log
    });

    this.client.onConnect = () => {
      // 역할에 관계없이 classNo 기반 토픽 구독
      this._subscribe(onEvent);

      if (this.ctx.role === "student") {
        // 학생: 하트비트 시작
        this._startHeartbeat();
      }
    };

    this.client.onStompError = async (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
      // 권한 문제 등으로 CONNECT 실패했다면 재인증 루트로 보냄
      await this._handleAuthFail();
    };

    this.client.onWebSocketClose = () => {
      console.log("WebSocket connection closed.");
      // 끊김 시 타이머 정리
      this._stopHeartbeat();
    };

    this.client.activate();
  }

  /** 명시적 종료 */
  disconnect() {
    this._stopHeartbeat();
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
      } catch {}
      this.subscription = null;
    }
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.client = null;
    this.ctx = null;
  }

  // ---- 내부 유틸 ----

  _subscribe(onEvent) {
    if (!this.ctx || !this.ctx.classNo) return;
    const dest = `${this.topicPrefix}/presence.${this.ctx.classNo}`;
    console.log(`Subscribing to ${dest}`);
    this.subscription = this.client.subscribe(dest, (msg) => {
      try {
        const ev = JSON.parse(msg.body); // PresenceEvent 형태 가정
        onEvent && onEvent(ev);
      } catch (e) {
        console.error("Failed to parse message body:", msg.body, e);
      }
    });
  }

  _sendHeartbeat() {
    this._publish(`${this.appPrefix}/presence.heartbeat`);
  }

  _publish(destination, body = {}) {
    if (!this.client || !this.client.connected || !this.ctx) return;
    this.client.publish({
      destination,
      headers: {
        classNo: this.ctx.classNo,
        userId: this.ctx.userId,
      },
      body: JSON.stringify(body),
    });
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    // 첫 하트비트는 즉시 전송하여 빠른 온라인 상태 반영
    this._sendHeartbeat();
    this.heartbeatTimer = setInterval(
      () => this._sendHeartbeat(),
      this.heartbeatMs
    );
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  async _handleAuthFail() {
    try {
      // ApiClient의 공통 만료 처리 사용 (만약 존재한다면)
      if (apiClient.handleTokenExpired) {
        await apiClient.handleTokenExpired();
      } else {
        console.error("Authentication failed. Please log in again.");
        // 로그인 페이지로 리디렉션 등의 로직 추가 가능
      }
    } catch {
      // handleTokenExpired가 throw 하므로 추가 조치 불필요
    }
  }
}

const presenceClient = new PresenceClient();
export default presenceClient;
export { PresenceClient };
