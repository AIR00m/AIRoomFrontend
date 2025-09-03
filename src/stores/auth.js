/**
 * 인증 관련 서버 통신
 * - 백엔드 JWT 구조에 맞게 수정
 * - 로그인/토큰발급 분리
 * - 쿠키 기반 Refresh Token
 * - * - refresh 엔드포인트 추가 ✅
 */

import apiClient from "@/utils/apiClient";

/**
 * 로그인 API
 * 백엔드: POST /auth/login { id, pwd } → { memberId, memberName, role, textbooks }
 */
export const login = async (credentials) => {
  try {
    console.log("🔐 로그인 요청:", { id: credentials.id });

    const response = await apiClient.post("/auth/login", {
      id: credentials.id,
      pwd: credentials.password,
    });

    console.log("✅ 로그인 성공:", {
      memberId: response.memberId,
      memberName: response.memberName,
      role: response.role,
      textbooksCount: response.textbooks?.length || 0,
    });

    return {
      success: true,
      data: {
        memberId: response.memberId,
        memberName: response.memberName, // 백엔드에서 제공되지 않을 수 있음
        role: response.role, // 백엔드에서 제공되지 않을 수 있음
        textbooks: response.textbooks || [],
      },
    };
  } catch (error) {
    console.error("🚨 로그인 실패:", error.message);

    return {
      success: false,
      error: {
        message: error.message || "로그인에 실패했습니다.",
        status: error.status,
      },
    };
  }
};

/**
 * 토큰 발급 API (교과서 선택 시)
 * 백엔드: POST /auth/token { memberId, textbookNo } → { Access_Token } + 쿠키
 */
export const requestToken = async (tokenRequest) => {
  try {
    console.log("🎫 토큰 발급 요청:", tokenRequest);

    const response = await apiClient.post("/auth/token", {
      memberId: tokenRequest.memberId,
      textbookNo: tokenRequest.textbookNo,
    });

    console.log("✅ 토큰 발급 성공");

    return {
      success: true,
      data: {
        accessToken: response.Access_Token,
        // Refresh Token은 HttpOnly 쿠키로 자동 설정됨
      },
    };
  } catch (error) {
    console.error("🚨 토큰 발급 실패:", error.message);

    return {
      success: false,
      error: {
        message: error.message || "토큰 발급에 실패했습니다.",
        status: error.status,
      },
    };
  }
};

/**
 * 로그아웃 API
 */
export const logout = async () => {
  try {
    await apiClient.post("/auth/logout");

    console.log("✅ 로그아웃 성공");

    await apiClient.redirectToLogin("logout");
    return {
      success: true,
    };
  } catch (error) {
    console.error("🚨 로그아웃 실패:", error.message);
    return {
      success: false,
      error: {
        message: error.message || "로그아웃 처리 중 오류가 발생했습니다.",
        status: error.status,
      },
    };
  }
};

/**
 * 회원가입 API (학생)
 */
export const signupStudent = async (userData) => {
  try {
    console.log("👥 학생 회원가입 요청:", { email: userData.email });

    const response = await apiClient.post("/auth/signup/student", {
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });

    console.log("✅ 학생 회원가입 성공");

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("🚨 학생 회원가입 실패:", error.message);

    return {
      success: false,
      error: {
        message: error.message || "회원가입에 실패했습니다.",
        status: error.status,
      },
    };
  }
};

/**
 * 회원가입 API (교사)
 */
export const signupTeacher = async (userData) => {
  try {
    console.log("👨‍🏫 교사 회원가입 요청:", { email: userData.email });

    const response = await apiClient.post("/auth/signup/teacher", {
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });

    console.log("✅ 교사 회원가입 성공");

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("🚨 교사 회원가입 실패:", error.message);

    return {
      success: false,
      error: {
        message: error.message || "회원가입에 실패했습니다.",
        status: error.status,
      },
    };
  }
};

/**
 * 토큰 유효성 검증 API
 */
export const validateToken = async () => {
  try {
    const response = await apiClient.get("/auth/validate");

    return {
      success: true,
      data: {
        isValid: response.valid,
        user: response.user,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: "토큰이 유효하지 않습니다.",
        status: error.status,
      },
    };
  }
};

/**
 * JWT 토큰에서 정보 추출 (클라이언트 사이드)
 */
export const decodeToken = (token) => {
  try {
    if (!token || typeof token !== "string") {
      console.warn("토큰이 없거나 문자열이 아닙니다:", token);
      return null;
    }

    // Bearer prefix가 있으면 제거, 없으면 그대로 사용
    const actualToken = token.startsWith("Bearer ")
      ? token.substring(7)
      : token;

    if (!actualToken || actualToken.split(".").length !== 3) {
      console.warn("유효하지 않은 JWT 형식:", actualToken);
      return null;
    }

    const base64Url = actualToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    const result = {
      subject: payload.sub, // memberId
      role: payload.role, // teacher or student
      memberName: payload.memberName,
      classroomNo: payload.classroomNo,
      classroomTeacherNo: payload.classroomTeacherNo,
      classRoomStudentNo: payload.classRoomStudentNo,
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
    };

    console.log("🎫 토큰 디코딩 성공:", {
      subject: result.subject,
      role: result.role,
      memberName: result.memberName,
      exp: new Date(result.exp * 1000).toLocaleString(),
    });

    return result;
  } catch (error) {
    console.error("토큰 디코딩 실패:", error);
    return null;
  }
};

/**
 * 토큰 만료 체크
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = decoded.exp < currentTime;

  if (isExpired) {
    console.log("⚠️ 토큰 만료됨:", {
      현재시간: new Date().toLocaleString(),
      만료시간: new Date(decoded.exp * 1000).toLocaleString(),
    });
  }

  return isExpired;
};

/**
 * 토큰 재발급 API
 * 백엔드: POST /auth/refresh (쿠키의 Refresh Token 사용) → { Access_Token }
 */
export const refreshAccessToken = async () => {
  try {
    console.log("🔄 Access Token 재발급 요청");

    // apiClient를 사용하지 않고 직접 fetch (무한 재귀 방지)
    const response = await fetch(`http://43.200.2.244:8080/auth/refresh`, {
      method: "POST",
      credentials: "include", // Refresh Token 쿠키 포함
      headers: {
        "Content-Type": "application/json",
      },
      // body 없음 - 기본 토큰만 재발급
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Access Token 재발급 성공");

    return {
      success: true,
      data: {
        accessToken: data.Access_Token,
      },
    };
  } catch (error) {
    console.error("🚨 Access Token 재발급 실패:", error.message);

    return {
      success: false,
      error: {
        message: error.message || "토큰 재발급에 실패했습니다.",
        status: error.status || 0,
      },
    };
  }
};
