import { EventSourcePolyfill } from "event-source-polyfill";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";

let eventSource = null;

export function connectSSE(url, onMessage, onError) {
  const notificationStore = useNotificationStore();
  const authStore = useAuthStore();

  // if (eventSource) {
  //   eventSource.close();
  // }
  //새로운 SSE연결 생성
  eventSource = new EventSource(url);
  eventSource.onopen = (e) => {
    console.log("SSE오픈!!!!!!!!!!!", e);
  };
  //서버에서 새로운 알림이 올 때마다 자동으로 화면에 표시
  // 사용자가 새로고침하지 않아도 실시간으로 알림을 받음
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("알림수신!!!!!!!!!!!!!!! ", data);
      if (onMessage) onMessage(event);
    } catch (err) {
      console.error("SSE 메시지 파싱 실패:", err);
    }
  };
  eventSource.addEventListener("notification", (event) => {
    console.log("새 알림 도착!!!!!!!!!!!!!!:", event.data);
    console.log(typeof event.data); // string
    const data = JSON.parse(event.data); // 객체로 변환
    notificationStore.markNew();
    console.log(data.message); // "새 알림"
  });

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
