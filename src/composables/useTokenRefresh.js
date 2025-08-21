/**
 * 토큰 상태 체크 Composable
 * - 토큰 만료 확인
 * - 자동 갱신 로직 제거 (토큰 만료시 재로그인)
 * - 단순한 상태 모니터링만 제공
 */

import { ref, onMounted, onUnmounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

/**
 * 토큰 상태 체크 Composable
 */
export function useTokenStatus() {
  const authStore = useAuthStore();
  const router = useRouter();

  // 반응형 상태
  const lastCheckTime = ref(null);
  const checkInterval = ref(null);

  // 설정값
  const CHECK_INTERVAL = 60 * 1000; // 1분마다 체크

  // 계산된 속성
  const isTokenExpired = computed(() => {
    if (!authStore.accessToken) return true;

    try {
      const actualToken = authStore.accessToken.startsWith("Bearer ")
        ? authStore.accessToken.substring(7)
        : authStore.accessToken;

      const base64Url = actualToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp <= currentTime;
    } catch (error) {
      console.warn("토큰 만료 시간 확인 실패:", error);
      return true;
    }
  });

  const timeUntilExpiry = computed(() => {
    if (!authStore.accessToken) return 0;

    try {
      const actualToken = authStore.accessToken.startsWith("Bearer ")
        ? authStore.accessToken.substring(7)
        : authStore.accessToken;

      const base64Url = actualToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      const expiryTime = payload.exp * 1000; // 밀리초로 변환

      return Math.max(0, expiryTime - Date.now());
    } catch (error) {
      return 0;
    }
  });

  /**
   * 토큰 만료 체크
   */
  const checkTokenStatus = () => {
    lastCheckTime.value = Date.now();

    if (authStore.accessToken && isTokenExpired.value) {
      console.log("⚠️ 토큰 만료 감지");
      handleTokenExpired();
    }
  };

  /**
   * 토큰 만료 처리
   */
  const handleTokenExpired = () => {
    console.log("🔄 토큰 만료 처리 시작");

    // Auth Store를 통해 토큰 만료 처리
    const result = authStore.handleTokenExpired();

    if (result.needsTextbookSelection && result.user) {
      console.log("📚 교과서 선택 페이지로 이동");
      router.push({
        path: "/textbook",
        query: { reason: "token_expired" },
      });
    } else {
      console.log("🔐 로그인 페이지로 이동");
      router.push({
        path: "/login",
        query: { reason: "token_expired" },
      });
    }
  };

  /**
   * 토큰 상태 모니터링 시작
   */
  const startTokenMonitoring = () => {
    console.log("🔧 토큰 상태 모니터링 시작");

    // 주기적으로 토큰 상태 체크
    checkInterval.value = setInterval(() => {
      checkTokenStatus();
    }, CHECK_INTERVAL);

    // 페이지 포커스시에도 체크
    const handlePageFocus = () => {
      if (document.hidden === false) {
        checkTokenStatus();
      }
    };

    document.addEventListener("visibilitychange", handlePageFocus);
    window.addEventListener("focus", handlePageFocus);

    // 컴포넌트 언마운트시 정리
    onUnmounted(() => {
      if (checkInterval.value) {
        clearInterval(checkInterval.value);
      }
      document.removeEventListener("visibilitychange", handlePageFocus);
      window.removeEventListener("focus", handlePageFocus);
    });
  };

  /**
   * 토큰 정보 조회 (개발용)
   */
  const getTokenInfo = () => {
    if (!authStore.accessToken) return null;

    try {
      const actualToken = authStore.accessToken.startsWith("Bearer ")
        ? authStore.accessToken.substring(7)
        : authStore.accessToken;

      const base64Url = actualToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);

      return {
        subject: payload.sub,
        role: payload.role,
        memberName: payload.memberName,
        classroomNo: payload.classroomNo,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        issuer: payload.iss,
      };
    } catch (error) {
      console.warn("토큰 정보 추출 실패:", error);
      return null;
    }
  };

  /**
   * 토큰 상태 정보 반환
   */
  const getTokenStatus = () => {
    return {
      hasToken: !!authStore.accessToken,
      isExpired: isTokenExpired.value,
      timeUntilExpiry: timeUntilExpiry.value,
      lastCheckTime: lastCheckTime.value,
      expiresAt: getTokenInfo()?.expiresAt,
    };
  };

  // 생명주기 관리
  onMounted(() => {
    console.log("🔧 토큰 상태 체크 시스템 초기화");

    // 즉시 한번 체크
    checkTokenStatus();

    // 모니터링 시작 (토큰이 있을 때만)
    if (authStore.accessToken) {
      startTokenMonitoring();
    }
  });

  onUnmounted(() => {
    console.log("🧹 토큰 상태 체크 시스템 정리");

    if (checkInterval.value) {
      clearInterval(checkInterval.value);
      checkInterval.value = null;
    }
  });

  // 반환값
  return {
    // 상태
    lastCheckTime,

    // 계산된 속성
    isTokenExpired,
    timeUntilExpiry,

    // 메서드
    checkTokenStatus,
    getTokenInfo,
    getTokenStatus,
    startTokenMonitoring,
  };
}

/**
 * 전역 토큰 상태 체크 (앱 전체에서 한 번만 실행)
 */
export function useGlobalTokenStatus() {
  // 싱글톤 패턴으로 전역에서 한 번만 실행
  if (typeof window !== "undefined" && !window.__tokenStatusInstance) {
    window.__tokenStatusInstance = useTokenStatus();
  }

  return window.__tokenStatusInstance || useTokenStatus();
}
