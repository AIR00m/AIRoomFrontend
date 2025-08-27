/**
 * 에러 처리 Composable
 * - 백엔드 JWT 에러에 맞게 수정
 * - API 에러 분류 및 처리
 * - 사용자 친화적 에러 메시지
 * - refresh 로직 제거 (토큰 만료시 재로그인)
 */

import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

/**
 * 에러 처리 Composable
 */
export function useErrorHandler() {
  const router = useRouter();
  const authStore = useAuthStore();

  // 에러 상태
  const currentError = ref(null);
  const errorHistory = ref([]);
  const isHandlingError = ref(false);

  // 에러 카운터 (같은 에러 반복 방지)
  const errorCounts = reactive({});

  /**
   * 일반적인 에러 처리
   */
  const handleError = (error, context = "") => {
    console.error(`🚨 에러 발생 [${context}]:`, error);

    try {
      isHandlingError.value = true;

      // 에러 객체 정규화
      const normalizedError = normalizeError(error);

      // 에러 히스토리에 추가
      addToErrorHistory(normalizedError, context);

      // 반복 에러 체크
      if (isRepeatingError(normalizedError)) {
        console.warn("⚠️ 반복되는 에러 감지, 특별 처리");
        return handleRepeatingError(normalizedError);
      }

      // 에러 타입별 처리
      return handleByErrorType(normalizedError, context);
    } finally {
      isHandlingError.value = false;
    }
  };

  /**
   * 폼 에러 처리 (유효성 검사 등)
   */
  const handleFormError = (error, formErrors = {}) => {
    console.error("🚨 폼 에러:", error);

    const normalizedError = normalizeError(error);

    // 백엔드 유효성 검사 에러 처리
    if (normalizedError.status === 400 || normalizedError.status === 422) {
      return handleValidationError(normalizedError, formErrors);
    }

    // 인증 에러
    if (normalizedError.isAuthError) {
      return handleAuthError(normalizedError);
    }

    // 일반 에러 처리
    return handleError(error, "form");
  };

  /**
   * API 에러 처리
   */
  const handleApiError = (error, apiContext = "") => {
    console.error(`🚨 API 에러 [${apiContext}]:`, error);

    const normalizedError = normalizeError(error);

    // JWT 토큰 관련 에러 특별 처리
    if (isTokenError(normalizedError)) {
      return handleTokenError(normalizedError);
    }

    // 인증 에러
    if (normalizedError.isAuthError) {
      return handleAuthError(normalizedError);
    }

    // 서버 에러
    if (normalizedError.isServerError) {
      return handleServerError(normalizedError);
    }

    // 네트워크 에러
    if (normalizedError.isNetworkError) {
      return handleNetworkError(normalizedError);
    }

    // 일반 에러 처리
    return handleError(error, `api-${apiContext}`);
  };

  /**
   * 에러 객체 정규화
   */
  const normalizeError = (error) => {
    if (!error) {
      return {
        message: "알 수 없는 오류가 발생했습니다.",
        status: 0,
        isNetworkError: true,
        isAuthError: false,
        isServerError: false,
        isValidationError: false,
        originalError: error,
      };
    }

    // 이미 정규화된 에러
    if (error.isAuthError !== undefined) {
      return error;
    }

    // API 에러 객체
    if (error.status !== undefined) {
      return {
        message: error.message || "서버 오류가 발생했습니다.",
        status: error.status,
        data: error.data,
        isNetworkError: error.status === 0,
        isAuthError: error.status === 401 || error.status === 403,
        isServerError: error.status >= 500,
        isValidationError: error.status === 400 || error.status === 422,
        originalError: error,
      };
    }

    // 문자열 에러
    if (typeof error === "string") {
      return {
        message: error,
        status: 0,
        isNetworkError: false,
        isAuthError: false,
        isServerError: false,
        isValidationError: false,
        originalError: error,
      };
    }

    // Error 객체
    if (error instanceof Error) {
      return {
        message: error.message,
        status: 0,
        isNetworkError:
          error.name === "TypeError" && error.message.includes("fetch"),
        isAuthError: false,
        isServerError: false,
        isValidationError: false,
        originalError: error,
      };
    }

    // 기타 객체
    return {
      message: error.message || "알 수 없는 오류가 발생했습니다.",
      status: 0,
      isNetworkError: false,
      isAuthError: false,
      isServerError: false,
      isValidationError: false,
      originalError: error,
    };
  };

  /**
   * JWT 토큰 에러 감지
   */
  const isTokenError = (error) => {
    const tokenErrorMessages = [
      "토큰 형식이 올바르지 않습니다",
      "아이디가 토큰에 존재하지 않습니다",
      "발급자가 올바르지 않습니다",
      "토큰이 만료되었습니다",
      "알 수 없는 토큰 타입입니다",
      "RefreshToken이 존재하지 않습니다",
      "jti가 올바르지 않습니다",
    ];

    return tokenErrorMessages.some(
      (msg) => error.message && error.message.includes(msg)
    );
  };

  /**
   * 에러 타입별 처리
   */
  const handleByErrorType = (error, context) => {
    currentError.value = error;

    // 인증 에러
    if (error.isAuthError) {
      return handleAuthError(error);
    }

    // 유효성 검사 에러
    if (error.isValidationError) {
      return handleValidationError(error);
    }

    // 서버 에러
    if (error.isServerError) {
      return handleServerError(error);
    }

    // 네트워크 에러
    if (error.isNetworkError) {
      return handleNetworkError(error);
    }

    // 일반 에러
    return handleGenericError(error, context);
  };

  /**
   * JWT 토큰 에러 처리
   */
  const handleTokenError = (error) => {
    console.error("🔑 JWT 토큰 에러:", error.message);

    // Auth Store를 통해 토큰 만료 처리
    const result = authStore.handleTokenExpired();

    // 사용자 친화적 메시지
    const userMessage = getTokenErrorMessage(error.message);

    alert(`🔑 ${userMessage}`);

    // 적절한 페이지로 이동
    if (result.needsTextbookSelection && result.user) {
      router.push({
        path: "/textbook",
        query: { reason: "token_expired" },
      });
    } else {
      router.push({
        path: "/login",
        query: { reason: "token_error" },
      });
    }

    return {
      handled: true,
      userMessage,
      action: "redirect_to_appropriate_page",
    };
  };

  /**
   * 인증 에러 처리
   */
  const handleAuthError = (error) => {
    console.error("🔒 인증 에러:", error);

    // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
    if (router.currentRoute.value.path !== "/login") {
      // Auth Store를 통해 토큰 만료 처리
      const result = authStore.handleTokenExpired();

      alert("🔒 인증이 만료되었습니다. 다시 로그인해주세요.");

      if (result.needsTextbookSelection) {
        router.push({
          path: "/textbook",
          query: { reason: "auth_expired" },
        });
      } else {
        router.push({
          path: "/login",
          query: { reason: "auth_expired" },
        });
      }
    }

    return {
      handled: true,
      userMessage: "인증이 필요합니다.",
      action: "redirect_to_appropriate_page",
    };
  };

  /**
   * 유효성 검사 에러 처리
   */
  const handleValidationError = (error, formErrors = {}) => {
    console.error("📝 유효성 검사 에러:", error);

    // 백엔드에서 필드별 에러 정보를 제공하는 경우
    if (error.data && error.data.fieldErrors) {
      Object.keys(error.data.fieldErrors).forEach((field) => {
        if (formErrors[field] !== undefined) {
          formErrors[field] = error.data.fieldErrors[field];
        }
      });
    }

    const userMessage = error.message || "입력 정보를 확인해주세요.";

    return {
      handled: true,
      userMessage,
      action: "show_form_errors",
      formErrors,
    };
  };

  /**
   * 서버 에러 처리
   */
  const handleServerError = (error) => {
    console.error("🖥️ 서버 에러:", error);

    const userMessage =
      "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";

    alert(`🖥️ ${userMessage}`);

    return {
      handled: true,
      userMessage,
      action: "show_error_message",
      canRetry: true,
    };
  };

  /**
   * 네트워크 에러 처리
   */
  const handleNetworkError = (error) => {
    console.error("🌐 네트워크 에러:", error);

    const userMessage = "네트워크 연결을 확인해주세요.";

    alert(`🌐 ${userMessage}`);

    return {
      handled: true,
      userMessage,
      action: "show_error_message",
      canRetry: true,
    };
  };

  /**
   * 일반 에러 처리
   */
  const handleGenericError = (error, context) => {
    console.error("❗ 일반 에러:", error);

    const userMessage = error.message || "오류가 발생했습니다.";

    alert(`❗ ${userMessage}`);

    return {
      handled: true,
      userMessage,
      action: "show_error_message",
      context,
    };
  };

  /**
   * 반복 에러 처리
   */
  const handleRepeatingError = (error) => {
    console.error("🔄 반복 에러:", error);

    const userMessage =
      "계속해서 같은 오류가 발생하고 있습니다. 페이지를 새로고침하거나 관리자에게 문의해주세요.";

    if (confirm(`🔄 ${userMessage}\n\n페이지를 새로고침하시겠습니까?`)) {
      window.location.reload();
    }

    return {
      handled: true,
      userMessage,
      action: "suggest_reload",
    };
  };

  /**
   * 토큰 에러 메시지 변환
   */
  const getTokenErrorMessage = (errorMessage) => {
    const messageMap = {
      "토큰 형식이 올바르지 않습니다": "로그인 정보가 올바르지 않습니다.",
      "아이디가 토큰에 존재하지 않습니다": "로그인 정보가 손상되었습니다.",
      "발급자가 올바르지 않습니다": "인증 서버 정보가 일치하지 않습니다.",
      "토큰이 만료되었습니다": "로그인 시간이 만료되었습니다.",
      "알 수 없는 토큰 타입입니다": "인증 토큰 타입이 올바르지 않습니다.",
      "RefreshToken이 존재하지 않습니다": "자동 로그인 정보가 없습니다.",
      "jti가 올바르지 않습니다": "토큰 식별자가 올바르지 않습니다.",
    };

    for (const [key, value] of Object.entries(messageMap)) {
      if (errorMessage && errorMessage.includes(key)) {
        return value;
      }
    }

    return "인증에 문제가 발생했습니다. 다시 로그인해주세요.";
  };

  /**
   * 에러 히스토리 관리
   */
  const addToErrorHistory = (error, context) => {
    const errorEntry = {
      error,
      context,
      timestamp: new Date(),
      id: Date.now() + Math.random(),
    };

    errorHistory.value.unshift(errorEntry);

    // 최대 50개까지만 보관
    if (errorHistory.value.length > 50) {
      errorHistory.value = errorHistory.value.slice(0, 50);
    }

    // 에러 카운트 증가
    const errorKey = `${error.status}-${error.message}`;
    errorCounts[errorKey] = (errorCounts[errorKey] || 0) + 1;
  };

  /**
   * 반복 에러 체크
   */
  const isRepeatingError = (error) => {
    const errorKey = `${error.status}-${error.message}`;
    return (errorCounts[errorKey] || 0) >= 3; // 3번 이상 반복시 반복 에러로 판단
  };

  /**
   * 에러 히스토리 정리
   */
  const clearErrorHistory = () => {
    errorHistory.value = [];
    Object.keys(errorCounts).forEach((key) => {
      delete errorCounts[key];
    });
    currentError.value = null;
  };

  /**
   * 에러 상태 조회
   */
  const getErrorStatus = () => {
    return {
      currentError: currentError.value,
      errorHistory: errorHistory.value.slice(0, 10), // 최근 10개만
      errorCounts: { ...errorCounts },
      isHandlingError: isHandlingError.value,
    };
  };

  return {
    // 상태
    currentError,
    errorHistory,
    isHandlingError,

    // 메서드
    handleError,
    handleFormError,
    handleApiError,
    handleTokenError,
    handleAuthError,
    clearErrorHistory,
    getErrorStatus,
  };
}

/**
 * 전역 에러 핸들러 설정
 */
export function setupGlobalErrorHandler() {
  const { handleError } = useErrorHandler();

  // 전역 에러 이벤트 리스너
  window.addEventListener("error", (event) => {
    handleError(event.error, "global");
  });

  // Promise rejection 이벤트 리스너
  window.addEventListener("unhandledrejection", (event) => {
    handleError(event.reason, "promise");
  });

  console.log("🛡️ 전역 에러 핸들러 설정 완료");
}
