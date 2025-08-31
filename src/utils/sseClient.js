// src/utils/sseClient.js
import EventSourcePkg from "event-source-polyfill";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";

let es = null;
let lastUrl = null; // 재시작용 URL 보관
let currentMemberId = null; // lastEventId 저장 키 생성용

const KEY = (memberId) => `sse:lastEventId:${memberId}`;

// default / named 둘 다 대응
// 어떤 번들러에서도 안전하게 생성자 뽑기
const ES =
  (EventSourcePkg && EventSourcePkg.EventSourcePolyfill) || // 보통 default 객체 안에 들어있음
  EventSourcePkg; // 드물게 default 자체가 생성자인 경우
function withLastId(rawUrl, memberId) {
  try {
    const u = new URL(rawUrl, window.location.origin);
    const last = localStorage.getItem(KEY(memberId));
    if (last && !u.searchParams.has("lastEventId")) {
      u.searchParams.set("lastEventId", last);
    }
    return u.toString();
  } catch {
    // rawUrl이 절대경로면 바로 사용
    return rawUrl;
  }
}

/**
 * rawUrl: `${API_BASE}/sse/connect?memberId=${memberId}`
 * onMessage/onError: 선택 (기존 콜백 호환)
 */
export function connectSSE(rawUrl, onMessage, onError) {
  const auth = useAuthStore();
  const noti = useNotificationStore();

  const memberId = auth?.user?.memberId || localStorage.getItem("memberId");
  const jwt = auth?.accessToken;

  if (!memberId) {
    console.warn("[SSE] memberId 없음 — 연결 생략");
    return null;
  }
  currentMemberId = String(memberId);
  lastUrl = rawUrl;

  // 이미 연결되어 있으면 재사용
  if (es) return es;

  const url = withLastId(rawUrl, currentMemberId);

  es = new ES(url, {
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
    withCredentials: true, // 쿠키도 쓰면 true 유지
    heartbeatTimeout: 60000, // 서버 하트비트(25s)보다 충분히 크게
  });

  es.onopen = (e) => {
    console.log("[SSE] open", e);
  };

  // 서버가 .name("notification")으로 보냄
  es.addEventListener("notification", (event) => {
    // lastEventId 저장
    const lastId = event && event.lastEventId;
    if (lastId && currentMemberId) {
      localStorage.setItem(KEY(currentMemberId), String(lastId));
    }

    let payload = event.data;
    try {
      if (typeof payload === "string") payload = JSON.parse(payload);
    } catch {
      /* 문자열이면 그대로 둠 */
    }

    try {
      noti.addNotification(payload);
    } catch (e) {
      console.warn("[SSE] 알림 store 반영 실패", e);
    }

    if (onMessage) {
      try {
        onMessage(payload);
      } catch {}
    }
  });

  // 초기 연결 이벤트(옵션)
  es.addEventListener("connect", (event) => {
    const lastId = event && event.lastEventId;
    if (lastId && currentMemberId) {
      localStorage.setItem(KEY(currentMemberId), String(lastId));
    }
    console.log("[SSE] connect event 수신");
  });

  // 폴리필이 자동으로 재시도한다. 여기서 close/retry 금지
  es.onerror = async (err) => {
    console.warn("[SSE] error (자동 재시도 예정)", err);

    // (선택) 401이면 토큰 갱신 후 한 번만 재시작 시도
    try {
      const status = err && (err.status || err?.detail?.status);
      if (status === 401) {
        const refreshed = await tryRefreshAccessToken();
        if (refreshed) restartSSE(); // 갱신 성공 시 한 번 재연결
      }
    } catch {}

    if (onError) {
      try {
        onError(err);
      } catch {}
    }
  };

  return es;
}

export function disconnectSSE() {
  if (es) {
    try {
      es.close();
    } catch {}
    es = null;
  }
}

export function restartSSE() {
  if (!lastUrl) return;
  disconnectSSE();
  connectSSE(lastUrl);
}

/** (선택) 토큰 갱신 시도: auth 스토어에 메서드가 있으면 호출 */
async function tryRefreshAccessToken() {
  try {
    const auth = useAuthStore();
    if (typeof auth?.refreshAccessToken === "function") {
      await auth.refreshAccessToken(); // 스토어 구현체에 맞게
      return true;
    }
    return false;
  } catch (e) {
    console.warn("[SSE] 토큰 갱신 실패", e);
    return false;
  }
}
