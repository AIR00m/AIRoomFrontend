/**
 * 클라이언트 상태 관리 (Pinia Store)
 * - 백엔드 JWT 구조에 맞게 수정
 * - 로그인/토큰발급 분리
 * - 토큰 디코딩 및 정보 추출
 * - refresh 로직 제거 (토큰 만료시 재로그인)
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as authApi from "@/api/auth";
import { bindAgentSession, checkAgentOnly } from "@/utils/ensureAgent";

export const useAuthStore = defineStore("auth", () => {
  // State (반응형 상태)
  const user = ref(null);
  const accessToken = ref(null);
  const tokenInfo = ref(null); // JWT 토큰에서 추출한 정보
  const textbooks = ref([]);
  const selectedTextbook = ref(null);
  const isLoading = ref(false);
  const lastLoginTime = ref(null);
  let sseInitialized = false;
  // Getters (계산된 속성)
  const isAuthenticated = computed(() => {
    return !!accessToken.value && !!user.value && !isTokenExpired.value;
  });

  const isLoggedIn = computed(() => {
    // 로그인은 했지만 토큰이 없는 상태 (교과서 선택 필요)
    return !!user.value;
  });

  const isStudent = computed(() => {
    return (
      tokenInfo.value?.role === "student" || user.value?.userType === "student"
    );
  });

  const isTeacher = computed(() => {
    return (
      tokenInfo.value?.role === "teacher" || user.value?.userType === "teacher"
    );
  });

  const hasTextbooks = computed(() => {
    return textbooks.value && textbooks.value.length > 0;
  });

  const currentTextbook = computed(() => {
    return selectedTextbook.value;
  });

  const isTokenExpired = computed(() => {
    if (!accessToken.value) return true;
    return authApi.isTokenExpired(accessToken.value);
  });

  const memberName = computed(() => {
    return (
      tokenInfo.value?.memberName ||
      user.value?.memberName ||
      user.value?.userName ||
      user.value?.name
    );
  });

  const classroomNo = computed(() => {
    return tokenInfo.value?.classroomNo;
  });

  // Actions (메서드)

  /**
   * 로그인 (1단계: 사용자 인증)
   */
  const login = async (credentials) => {
    try {
      isLoading.value = true;

      console.log("🔐 로그인 시도:", { id: credentials.id });

      const result = await authApi.login(credentials);

      if (result.success) {
        // 사용자 정보 저장
        user.value = {
          memberId: result.data.memberId,
          memberName: result.data.memberName || result.data.memberId, // fallback
          userType: result.data.role || "student", // fallback
        };

        // 교재 정보 저장
        textbooks.value = result.data.textbooks || [];
        lastLoginTime.value = new Date().toISOString();

        // 사용자 타입 추론 (백엔드에서 role이 없는 경우)
        if (!result.data.role) {
          const userType =
            credentials.id.includes("teacher") || credentials.id.includes("te")
              ? "teacher"
              : "student";
          user.value.userType = userType;
        }

        // localStorage에 기본 정보 저장
        saveBasicInfoToStorage();

        console.log("✅ 로그인 성공, 사용자 정보 저장됨:", {
          memberId: user.value.memberId,
          userType: user.value.userType,
          textbooksCount: textbooks.value.length,
        });

        return { success: true };
      } else {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error("🚨 로그인 실패:", error);
      return {
        success: false,
        error: error.message || "로그인에 실패했습니다.",
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 토큰 요청 (2단계: 교과서 선택 후 토큰 발급)
   */
  const requestAccessToken = async (textbookNo) => {
    if (!user.value?.memberId) {
      throw new Error("사용자 정보가 없습니다.");
    }

    try {
      isLoading.value = true;

      console.log("🎫 토큰 발급 요청:", {
        memberId: user.value.memberId,
        textbookNo,
      });

      const result = await authApi.requestToken({
        memberId: user.value.memberId,
        textbookNo: textbookNo,
      });

      if (result.success) {
        // 토큰 저장 (Bearer prefix 없이 저장)
        accessToken.value = result.data.accessToken;

        console.log(
          "🎫 토큰 저장됨:",
          accessToken.value?.substring(0, 20) + "..."
        );

        // 토큰에서 정보 추출
        const decoded = authApi.decodeToken(accessToken.value);
        if (decoded) {
          tokenInfo.value = decoded;
          console.log("🎫 토큰에서 추출한 정보:", {
            memberName: decoded.memberName,
            role: decoded.role,
            classroomNo: decoded.classroomNo,
          });
        } else {
          console.warn("⚠️ 토큰 디코딩 실패");
        }

        // 선택된 교과서 저장
        const selectedBook = textbooks.value.find(
          (book) => book.textbookNo === textbookNo
        );
        if (selectedBook) {
          selectedTextbook.value = {
            id: selectedBook.textbookNo,
            title: selectedBook.textbookTitle,
            publisher: selectedBook.textbookPublisher,
            grade: selectedBook.textbookGrade,
            subject: selectedBook.textbookSubject,
            semester: selectedBook.textbookSemester,
            image: selectedBook.textbookImageUrl,
            url: selectedBook.textbookPdfUrl,
          };
          console.log("📚 교과서 선택됨:", selectedTextbook.value.title);
        }

        // localStorage에 저장
        saveToLocalStorage();

        // ⭐ JWT 토큰 발급 후 SSE 연결 시작
        await initializeSSEConnection();

        // 에이전트 세션 바인딩 (토큰과 함께)
        try {
          const ok = await checkAgentOnly();
          if (ok) {
            await bindAgentSession(user.value.memberId, accessToken.value);
          }
        } catch (agentError) {
          console.warn("에이전트 세션 바인딩 실패:", agentError);
        }

        console.log("✅ 토큰 발급 및 교과서 선택 완료");
        return { success: true };
      } else {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error("🚨 토큰 요청 실패:", error);
      return {
        success: false,
        error: error.message || "토큰 발급에 실패했습니다.",
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 로그아웃
   */
  const logout = async () => {
    try {
      isLoading.value = true;

      // 서버에 로그아웃 요청
      await authApi.logout();

      console.log("서버 로그아웃 완료");
    } catch (error) {
      console.warn("서버 로그아웃 실패, 클라이언트 정리 진행:", error);
    } finally {
      const { disconnectSSE } = await import("@/utils/sseClient");
      disconnectSSE();
      // 클라이언트 상태 정리
      clearAuthState();
      clearLocalStorage();
      isLoading.value = false;

      console.log("✅ 로그아웃 완료");
    }
  };

  /**
   * 토큰 만료시 처리
   */
  const handleTokenExpired = () => {
    console.log("⚠️ 토큰 만료됨");
    clearAuthState();
    clearLocalStorage();

    return {
      needsTextbookSelection: false,
      user: null,
      textbooks: [],
    };
  };

  /**
   * 회원가입
   */
  const signup = async (userData) => {
    try {
      isLoading.value = true;

      const signupFunction =
        userData.userType === "student"
          ? authApi.signupStudent
          : authApi.signupTeacher;

      const result = await signupFunction(userData);

      if (result.success) {
        console.log("✅ 회원가입 성공");
        return { success: true };
      } else {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error("🚨 회원가입 실패:", error);
      return {
        success: false,
        error: error.message || "회원가입에 실패했습니다.",
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 상태 초기화
   */
  const clearAuthState = () => {
    user.value = null;
    accessToken.value = null;
    tokenInfo.value = null;
    textbooks.value = [];
    selectedTextbook.value = null;
    lastLoginTime.value = null;
  };

  /**
   * localStorage에 기본 정보만 저장 (로그인 후)
   */
  const saveBasicInfoToStorage = () => {
    try {
      if (user.value) {
        localStorage.setItem("memberId", user.value.memberId);
        localStorage.setItem("userType", user.value.userType);
        localStorage.setItem("memberName", user.value.memberName || "");
        localStorage.setItem(
          "userName",
          user.value.memberName || user.value.userName || ""
        );
      }

      if (textbooks.value.length > 0) {
        localStorage.setItem(
          "availableTextbooks",
          JSON.stringify(textbooks.value)
        );
      }

      if (lastLoginTime.value) {
        localStorage.setItem("lastLoginTime", lastLoginTime.value);
      }

      console.log("💾 기본 정보 localStorage 저장 완료");
    } catch (error) {
      console.warn("localStorage 저장 실패:", error);
    }
  };

  /**
   * localStorage에 전체 상태 저장 (토큰 발급 후)
   */
  const saveToLocalStorage = () => {
    try {
      saveBasicInfoToStorage();

      if (accessToken.value) {
        localStorage.setItem("authToken", accessToken.value);
      }

      if (tokenInfo.value) {
        localStorage.setItem("tokenInfo", JSON.stringify(tokenInfo.value));
        localStorage.setItem("userType", tokenInfo.value.role);
        localStorage.setItem("memberName", tokenInfo.value.memberName || "");
      }

      if (selectedTextbook.value) {
        localStorage.setItem(
          "selectedTextbook",
          JSON.stringify(selectedTextbook.value)
        );
      }

      console.log("💾 전체 상태 localStorage 저장 완료");
    } catch (error) {
      console.warn("localStorage 저장 실패:", error);
    }
  };

  /**
   * localStorage에서 상태 복원
   */
  const loadFromLocalStorage = () => {
    try {
      const memberId = localStorage.getItem("memberId");
      const userType = localStorage.getItem("userType");
      const userName = localStorage.getItem("userName");
      const memberName = localStorage.getItem("memberName");

      if (memberId && userType) {
        user.value = {
          memberId,
          userType,
          userName: userName || memberName || "",
          memberName: memberName || userName || "",
        };
        console.log("👤 사용자 정보 복원:", user.value);
      }

      const storedAccessToken = localStorage.getItem("authToken");
      if (storedAccessToken && !authApi.isTokenExpired(storedAccessToken)) {
        accessToken.value = storedAccessToken;

        // 토큰 정보 복원
        const storedTokenInfo = localStorage.getItem("tokenInfo");
        if (storedTokenInfo) {
          try {
            tokenInfo.value = JSON.parse(storedTokenInfo);
            console.log("🎫 토큰 정보 복원:", tokenInfo.value);
          } catch (parseError) {
            console.warn("토큰 정보 파싱 실패:", parseError);
            // tokenInfo가 없으면 토큰에서 추출
            const decoded = authApi.decodeToken(storedAccessToken);
            if (decoded) {
              tokenInfo.value = decoded;
            }
          }
        } else {
          // tokenInfo가 없으면 토큰에서 추출
          const decoded = authApi.decodeToken(storedAccessToken);
          if (decoded) {
            tokenInfo.value = decoded;
          }
        }
      } else if (storedAccessToken) {
        // 만료된 토큰 제거
        console.log("⚠️ 만료된 토큰 제거");
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenInfo");
      }

      const storedTextbooks = localStorage.getItem("availableTextbooks");
      if (storedTextbooks) {
        try {
          textbooks.value = JSON.parse(storedTextbooks);
          console.log("📚 교과서 정보 복원:", textbooks.value.length + "개");
        } catch (parseError) {
          console.warn("교과서 정보 파싱 실패:", parseError);
        }
      }

      const storedSelectedTextbook = localStorage.getItem("selectedTextbook");
      if (storedSelectedTextbook) {
        try {
          selectedTextbook.value = JSON.parse(storedSelectedTextbook);
          console.log("📖 선택된 교과서 복원:", selectedTextbook.value?.title);
        } catch (parseError) {
          console.warn("선택된 교과서 정보 파싱 실패:", parseError);
        }
      }

      const storedLastLoginTime = localStorage.getItem("lastLoginTime");
      if (storedLastLoginTime) {
        lastLoginTime.value = storedLastLoginTime;
      }

      console.log("✅ localStorage에서 상태 복원 완료");
      // 🔧 최소 수정: 복원 완료 후, 유효 토큰 & memberId가 있으면 한 번만 SSE 시작
      if (accessToken.value && user.value?.memberId && !sseInitialized) {
        setTimeout(() => initializeSSEConnection(), 0);
      }
    } catch (error) {
      console.warn("localStorage 복원 실패:", error);
      clearLocalStorage();
    }
  };

  /**
   * localStorage 정리
   */
  const clearLocalStorage = () => {
    const authKeys = [
      "memberId",
      "userType",
      "userName",
      "memberName",
      "authToken",
      "tokenInfo",
      "availableTextbooks",
      "selectedTextbook",
      "lastLoginTime",
    ];

    authKeys.forEach((key) => localStorage.removeItem(key));
    console.log("🧹 localStorage 정리 완료");
  };

  /**
   * 교과서 선택
   */
  const selectTextbook = (textbook) => {
    selectedTextbook.value = textbook;
    saveToLocalStorage();

    // 커스텀 이벤트 발생
    window.dispatchEvent(
      new CustomEvent("textbook-selected", {
        detail: textbook,
      })
    );
  };

  /**
   * 자동 로그인 체크
   */
  const checkAutoLogin = () => {
    // 완전한 인증 상태 (토큰 있고 유효함)
    if (isAuthenticated.value) {
      console.log("🔄 인증 상태 복원됨");
      loadFromLocalStorage();
      return { isAuthenticated: true };
    }

    // 사용자 정보가 있지만 토큰이 없는 경우 (교과서 선택 필요)
    if (user.value && !accessToken.value) {
      console.log("🔄 사용자 정보 복원됨, 교과서 선택 필요");
      return { needsTextbookSelection: true };
    }

    // 로그인 필요
    console.log("🔄 로그인 필요");
    return { needsLogin: true };
  };

  /**
   * 사용자 정보 조회 (토큰에서)
   */
  const getUserInfo = () => {
    return {
      memberId: user.value?.memberId,
      userType: user.value?.userType || tokenInfo.value?.role,
      memberName: memberName.value,
      classroomNo: classroomNo.value,
      classroomTeacherNo: tokenInfo.value?.classroomTeacherNo,
      classRoomStudentNo: tokenInfo.value?.classRoomStudentNo,
    };
  };

  // SSE 연결 초기화 함수 추가
  const initializeSSEConnection = async () => {
    if (!user.value?.memberId || sseInitialized) return; // ⭐ 이미 초기화되었으면 return

    try {
      // notification store에서 초기 알림 로드
      const { useNotificationStore } = await import("@/stores/notification");
      const noti = useNotificationStore();

      await noti.loadInitialNotifications();

      // SSE 연결
      const { connectSSE } = await import("@/utils/sseClient");
      const apiClient = await import("@/utils/apiClient");

      const sseUrl = `${apiClient.default.baseURL}/sse/connect?memberId=${user.value.memberId}`;

      connectSSE(
        sseUrl,
        // onMessage
        (data) => {
          console.log("SSE 메시지:", data);
          noti.addNotification(data);
        },
        // onError
        (error) => {
          console.error("SSE 에러:", error);
        }
      );

      console.log("SSE 연결 완료");
      sseInitialized = true;
    } catch (error) {
      console.error("SSE 연결 실패:", error);
    }
  };

  // 스토어 초기화시 localStorage에서 상태 복원
  loadFromLocalStorage();

  return {
    // State
    user,
    accessToken,
    tokenInfo,
    textbooks,
    selectedTextbook,
    isLoading,
    lastLoginTime,

    // Getters
    isAuthenticated,
    isLoggedIn,
    isStudent,
    isTeacher,
    hasTextbooks,
    currentTextbook,
    isTokenExpired,
    memberName,
    classroomNo,

    // Actions
    login,
    logout,
    signup,
    requestAccessToken,
    handleTokenExpired, // refresh 대신 추가
    selectTextbook,
    checkAutoLogin,
    getUserInfo,
    clearAuthState,
    saveToLocalStorage,
    loadFromLocalStorage,
    initializeSSEConnection,
  };
});
