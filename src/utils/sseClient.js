import { EventSourcePolyfill } from "event-source-polyfill";
import { useAuthStore } from "@/stores/auth";

let eventSource = null;

export function connectSSE(url, onMessage, onError) {
  const authStore = useAuthStore();

  // if (eventSource) {
  //   eventSource.close();
  // }
  //새로운 SSE연결 생성
  eventSource = new EventSourcePolyfill(url, {
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`, // ✅ JWT 헤더 부착
    },
  });
  eventSource.onopen = (e) => {
    console.log(e);
  };
  //서버에서 새로운 알림이 올 때마다 자동으로 화면에 표시
  // 사용자가 새로고침하지 않아도 실시간으로 알림을 받음
  eventSource.onmessage = (event) => {
    console.log(event);
    if (onMessage) onMessage(event);
  };

  eventSource.onerror = (err) => {
    console.error("SSE 오류:", err);
    if (onError) onError(err);
  };

  return eventSource;
}

export function disconnectSSE() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}
