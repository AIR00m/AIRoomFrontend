/**
 * HTTP 통신 기본 클라이언트
 * - 백엔드 JWT 구조에 맞게 수정
 * - 401 에러 시 토큰 만료 처리 (refresh 대신 재로그인)
 * - Bearer 토큰 자동 포함
 */

//const API_BASE_URL = 'http://localhost:8080';
const API_BASE_URL = "http://43.200.2.244:8080";

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * 기본 요청 함수
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // 쿠키 포함 (Refresh Token용)
      ...options,
    };

    // 토큰이 필요한 요청에 자동으로 토큰 추가
    if (this.shouldIncludeToken(endpoint)) {
      const token = this.getStoredToken();
      if (token) {
        // Bearer prefix가 없으면 추가
        const bearerToken = token.startsWith('Bearer ')
          ? token
          : `Bearer ${token}`;
        config.headers['Authorization'] = bearerToken;
      }
    }

    try {
      console.log(`🌐 API 요청: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, config);

      // 401 에러 시 토큰 만료 처리 (refresh 대신)
      if (response.status === 401 && this.shouldHandleTokenExpired(endpoint)) {
        console.log('🔄 401 에러 감지, 토큰 만료 처리');
        return await this.handleTokenExpired();
      }

      return await this.handleResponse(response);
    } catch (error) {
      console.error('🚨 API 요청 실패:', error);
      throw this.transformError(error);
    }
  }

  /**
   * 응답 처리
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // 백엔드에서 JSON 에러 메시지를 반환하는 경우
      const errorMessage =
        typeof data === 'object' && data.message
          ? data.message
          : `HTTP ${response.status}: ${response.statusText}`;

      throw new ApiError(errorMessage, response.status, data);
    }

    console.log('✅ API 응답 성공:', response.status);
    return data;
  }

  /**
   * 토큰 만료 처리 (refresh 대신)
   */
  async handleTokenExpired() {
    console.log('⚠️ 토큰 만료, 인증 처리 시작');

    // 토큰 및 관련 정보 제거
    const tokenKeys = ['authToken', 'tokenInfo', 'selectedTextbook'];
    tokenKeys.forEach((key) => localStorage.removeItem(key));

    // Auth Store를 통해 토큰 만료 처리
    try {
      const { useAuthStore } = await import('@/stores/auth');
      const authStore = useAuthStore();
      const result = authStore.handleTokenExpired();

      if (result.needsTextbookSelection && result.user) {
        // 사용자 정보가 있으면 교과서 선택 페이지로
        console.log('🔄 교과서 선택 페이지로 이동');
        this.redirectToTextbookSelection();
      } else {
        // 사용자 정보가 없으면 로그인 페이지로
        console.log('🔄 로그인 페이지로 이동');
        this.redirectToLogin('token_expired');
      }
    } catch (error) {
      console.warn('Auth Store 접근 실패, 로그인 페이지로 이동:', error);
      this.redirectToLogin('auth_error');
    }

    // 401 에러를 던져서 호출한 곳에서 적절히 처리하도록 함
    throw new ApiError('토큰이 만료되었습니다. 다시 로그인해주세요.', 401);
  }

  /**
   * 로그인 페이지로 리다이렉트
   */
  redirectToLogin(reason = 'auth_required') {
    import('@/router').then(({ default: router }) => {
      router.push({
        path: '/login',
        query: { reason },
      });
    });
  }

  /**
   * 교과서 선택 페이지로 리다이렉트
   */
  redirectToTextbookSelection() {
    import('@/router').then(({ default: router }) => {
      router.push({
        path: '/textbook',
        query: { reason: 'token_expired' },
      });
    });
  }

  /**
   * HTTP 메서드별 헬퍼 함수들
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * 파일 업로드용 (FormData)
   */
  async upload(endpoint, formData, options = {}) {
    const uploadOptions = {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        // Content-Type을 설정하지 않음 (브라우저가 자동으로 boundary 설정)
        ...options.headers,
      },
    };

    // Content-Type 제거 (FormData일 때)
    delete uploadOptions.headers['Content-Type'];

    return this.request(endpoint, uploadOptions);
  }

  /**
   * 유틸리티 함수들
   */
  shouldIncludeToken(endpoint) {
    const publicEndpoints = [
      '/auth/login',
      '/auth/signup',
      '/auth/logout', // 로그아웃도 토큰 필요할 수 있음
      '/auth/social',
    ];
    return !publicEndpoints.some((path) => endpoint.startsWith(path));
  }

  shouldHandleTokenExpired(endpoint) {
    // 로그인, 회원가입 등의 요청에서는 토큰 만료 처리를 하지 않음
    const authEndpoints = ['/auth/login', '/auth/signup', '/auth/social'];
    return !authEndpoints.some((path) => endpoint.startsWith(path));
  }

  getStoredToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * 토큰 유효성 체크
   */
  isTokenValid() {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      // JWT 토큰 만료 시간 체크
      const actualToken = token.startsWith('Bearer ')
        ? token.substring(7)
        : token;
      const base64Url = actualToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp > currentTime;
    } catch (error) {
      console.warn('토큰 유효성 체크 실패:', error);
      return false;
    }
  }

  /**
   * 에러 변환
   */
  transformError(error) {
    if (error instanceof ApiError) {
      return error;
    }

    // 네트워크 에러
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new ApiError('네트워크 연결을 확인해주세요.', 0, {
        originalError: error,
      });
    }

    // 기타 에러
    return new ApiError(error.message || '알 수 없는 오류가 발생했습니다.', 0, {
      originalError: error,
    });
  }
}

/**
 * 커스텀 API 에러 클래스
 */
class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  get isValidationError() {
    return this.status === 422 || this.status === 400;
  }

  get isServerError() {
    return this.status >= 500;
  }

  get isTokenExpired() {
    return (
      this.status === 401 &&
      (this.message.includes('만료') || this.message.includes('expired'))
    );
  }
}

// 싱글톤 인스턴스 생성
const apiClient = new ApiClient();

export { apiClient, ApiClient, ApiError };
export default apiClient;
