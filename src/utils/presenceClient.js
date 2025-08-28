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

  /** 연결 + (교사) 구독 / (학생) enter+하트비트 시작 */
  async connect({ classNo, userId, role }, { onEvent } = {}) {
    // 토큰 만료면 ApiClient 로직 사용
    if (!apiClient.isTokenValid()) {
      await this._handleAuthFail();
      return;
    }

    this.ctx = { classNo: String(classNo), userId: String(userId), role };

    // 예: http://localhost:8080/ws
    const wsUrl = `${apiClient.baseURL}${this.wsPath}`;

    // Bearer 토큰
    const token = apiClient.getStoredToken();
    const authHeader = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;

    // STOMP 클라이언트
    this.client = new Client({
      // SockJS로 핸드쉐이크
      webSocketFactory: () => new SockJS(wsUrl),
      // STOMP CONNECT 프레임 헤더 (PresenceHeaderInterceptor가 읽음)
      connectHeaders: {
        Authorization: authHeader, // (선택) 서버에서 안 쓰면 무시됨
        classNo: this.ctx.classNo,
        userId: this.ctx.userId,
        role: this.ctx.role, // 'student' | 'teacher'
      },
      reconnectDelay: 5000, // 재연결
      debug: () => {}, // 필요시 console.log
    });

    this.client.onConnect = () => {
      if (this.ctx.role === "teacher") {
        // 교사: 실시간 구독
        this._subscribe(onEvent);
      } else if (this.ctx.role === "student") {
        // 학생: 입장 + 하트비트 시작
        this._sendEnter();
        this._startHeartbeat();
      }
    };

    this.client.onStompError = async () => {
      // 권한 문제 등으로 CONNECT 실패했다면 재인증 루트로 보냄
      await this._handleAuthFail();
    };
    this.client.onWebSocketClose = () => {
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
    const dest = `${this.topicPrefix}/presence.${this.ctx.classNo}`;
    this.subscription = this.client.subscribe(dest, (msg) => {
      try {
        const ev = JSON.parse(msg.body); // PresenceEvent 형태 가정
        onEvent && onEvent(ev);
      } catch {
        // 무시
      }
    });
  }

  _sendEnter() {
    this._publish(`${this.appPrefix}/presence.enter`);
  }

  _sendHeartbeat() {
    this._publish(`${this.appPrefix}/presence.heartbeat`);
    console.log("연결됨");
  }
  //웹소켓서버에 데이터를 전송하는 함수
  _publish(destination, payload = {}) {
    if (!this.client || !this.client.connected) return;
    this.client.publish({
      destination,
      // 서버는 헤더만 쓰는 구조로 가정(본문 불필요). 필요하면 JSON body 넣기.
      headers: {
        classNo: this.ctx.classNo,
        userId: this.ctx.userId,
        role: this.ctx.role,
      },
      body: payload, // 선택
    });
  }

  _startHeartbeat() {
    this._stopHeartbeat();
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
      // ApiClient의 공통 만료 처리 사용
      await apiClient.handleTokenExpired();
    } catch {
      // handleTokenExpired가 throw 하므로 추가 조치 불필요
    }
  }
}

const presenceClient = new PresenceClient();
export default presenceClient;
export { PresenceClient };
