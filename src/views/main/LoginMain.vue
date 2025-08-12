<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Brand Panel -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="logo">
            <div class="logo-icon">AI</div>
            아이룸
          </div>
          <h1 class="brand-title">스마트 학습의<br />새로운 시작</h1>
          <p class="brand-subtitle">
            개인 맞춤형 교육으로 더 효과적이고 재미있는 학습을 경험하세요
          </p>
          <ul class="feature-list">
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              맞춤형 학습 분석
            </li>
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              실시간 학습 모니터링
            </li>
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              디지털 교과서
            </li>
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              24/7 학습 지원 서비스
            </li>
          </ul>
        </div>
      </div>

      <!-- Auth Panel -->
      <div class="auth-panel">
        <!-- Auth Tabs -->
        <div class="auth-tabs">
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'login' }"
            @click="switchTab('login')"
          >
            로그인
          </button>
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'signup' }"
            @click="switchTab('signup')"
          >
            회원가입
          </button>
        </div>

        <!-- Success Message -->
        <div v-show="showSuccessMessage" class="success-message">
          회원가입이 완료되었습니다! 로그인해주세요.
        </div>

        <!-- Login Form -->
        <form
          v-show="currentTab === 'login'"
          class="auth-form active"
          @submit.prevent="handleLogin"
        >
          <h2 class="form-title">다시 오신 것을 환영합니다!</h2>
          <p class="form-subtitle">계정 정보를 입력해 로그인하세요</p>

          <div class="form-group">
            <label class="form-label">이메일</label>
            <input
              v-model="loginForm.email"
              type="email"
              class="form-input"
              :class="{ error: loginErrors.email }"
              placeholder="이메일 주소를 입력하세요"
              @input="clearLoginError('email')"
              required
            />
            <div v-show="loginErrors.email" class="error-message">
              {{ loginErrors.email }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <div class="password-field">
              <input
                v-model="loginForm.password"
                :type="showLoginPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: loginErrors.password }"
                placeholder="비밀번호를 입력하세요"
                @input="clearLoginError('password')"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="toggleLoginPassword"
              >
                {{ showLoginPassword ? "🙈" : "👁️" }}
              </button>
            </div>
            <div v-show="loginErrors.password" class="error-message">
              {{ loginErrors.password }}
            </div>
          </div>

          <div class="form-options">
            <div class="checkbox-group">
              <input
                v-model="loginForm.rememberMe"
                type="checkbox"
                id="rememberMe"
              />
              <label for="rememberMe">로그인 상태 유지</label>
            </div>
            <a href="#" class="forgot-link" @click.prevent="showForgotPassword">
              비밀번호 찾기
            </a>
          </div>

          <button type="submit" class="submit-btn" :disabled="loginLoading">
            <span v-show="loginLoading" class="loading-spinner"></span>
            로그인
          </button>

          <div class="divider">
            <span>또는</span>
          </div>

          <div class="social-login">
            <button
              type="button"
              class="social-btn"
              @click="socialLogin('google')"
            >
              🔍 Google
            </button>
            <button
              type="button"
              class="social-btn"
              @click="socialLogin('naver')"
            >
              🟢 Naver
            </button>
            <button
              type="button"
              class="social-btn"
              @click="socialLogin('kakao')"
            >
              💬 Kakao
            </button>
          </div>

          <p class="switch-form">
            아직 계정이 없으신가요?
            <a
              href="#"
              class="switch-link"
              @click.prevent="switchTab('signup')"
            >
              회원가입
            </a>
          </p>
        </form>

        <!-- Signup Form -->
        <form
          v-show="currentTab === 'signup'"
          class="auth-form"
          :class="{ active: currentTab === 'signup' }"
          @submit.prevent="handleSignup"
        >
          <h2 class="form-title">아이룸에 오신 것을 환영합니다!</h2>
          <p class="form-subtitle">새로운 계정을 만들어 시작하세요</p>

          <div class="form-group">
            <label class="form-label">사용자 유형</label>
            <div class="user-type-group">
              <div
                class="user-type-btn"
                :class="{ selected: signupForm.userType === 'student' }"
                @click="selectUserType('student')"
              >
                <span class="user-type-icon">🎓</span>
                <div>학생</div>
              </div>
              <div
                class="user-type-btn"
                :class="{ selected: signupForm.userType === 'teacher' }"
                @click="selectUserType('teacher')"
              >
                <span class="user-type-icon">👨‍🏫</span>
                <div>교사</div>
              </div>
            </div>
            <div v-show="signupErrors.userType" class="error-message">
              {{ signupErrors.userType }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">이름</label>
            <input
              v-model="signupForm.name"
              type="text"
              class="form-input"
              :class="{ error: signupErrors.name }"
              placeholder="이름을 입력하세요"
              @input="clearSignupError('name')"
              required
            />
            <div v-show="signupErrors.name" class="error-message">
              {{ signupErrors.name }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">이메일</label>
            <input
              v-model="signupForm.email"
              type="email"
              class="form-input"
              :class="{ error: signupErrors.email }"
              placeholder="이메일 주소를 입력하세요"
              @input="clearSignupError('email')"
              required
            />
            <div v-show="signupErrors.email" class="error-message">
              {{ signupErrors.email }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <div class="password-field">
              <input
                v-model="signupForm.password"
                :type="showSignupPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: signupErrors.password }"
                placeholder="비밀번호를 입력하세요 (8자 이상)"
                @input="clearSignupError('password')"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="toggleSignupPassword"
              >
                {{ showSignupPassword ? "🙈" : "👁️" }}
              </button>
            </div>
            <div v-show="signupErrors.password" class="error-message">
              {{ signupErrors.password }}
            </div>

            <!-- Password Strength Indicator -->
            <div v-if="signupForm.password" class="password-strength">
              <div class="strength-bar">
                <div
                  class="strength-fill"
                  :class="passwordStrength.level"
                  :style="{ width: passwordStrength.strength * 20 + '%' }"
                ></div>
              </div>
              <div class="strength-text">
                비밀번호 강도:
                <span>{{
                  getPasswordStrengthText(passwordStrength.level)
                }}</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호 확인</label>
            <div class="password-field">
              <input
                v-model="signupForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: signupErrors.confirmPassword }"
                placeholder="비밀번호를 다시 입력하세요"
                @input="clearSignupError('confirmPassword')"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="toggleConfirmPassword"
              >
                {{ showConfirmPassword ? "🙈" : "👁️" }}
              </button>
            </div>
            <div v-show="signupErrors.confirmPassword" class="error-message">
              {{ signupErrors.confirmPassword }}
            </div>
          </div>

          <div class="form-options">
            <div class="checkbox-group">
              <input
                v-model="signupForm.agreeTerms"
                type="checkbox"
                id="agreeTerms"
                required
              />
              <label for="agreeTerms">
                <a href="#" class="forgot-link">이용약관</a> 및
                <a href="#" class="forgot-link">개인정보처리방침</a>에
                동의합니다
              </label>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="signupLoading">
            <span v-show="signupLoading" class="loading-spinner"></span>
            회원가입
          </button>

          <div class="divider">
            <span>또는</span>
          </div>

          <div class="social-login">
            <button
              type="button"
              class="social-btn"
              @click="socialLogin('google')"
            >
              🔍 Google로 가입
            </button>
            <button
              type="button"
              class="social-btn"
              @click="socialLogin('naver')"
            >
              🟢 Naver로 가입
            </button>
          </div>

          <p class="switch-form">
            이미 계정이 있으신가요?
            <a href="#" class="switch-link" @click.prevent="switchTab('login')">
              로그인
            </a>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "AuthPage",
  setup() {
    const router = useRouter();
    // 반응형 데이터
    const currentTab = ref("login");
    const showSuccessMessage = ref(false);
    const loginLoading = ref(false);
    const signupLoading = ref(false);

    // 비밀번호 표시 상태
    const showLoginPassword = ref(false);
    const showSignupPassword = ref(false);
    const showConfirmPassword = ref(false);

    // 로그인 폼 데이터
    const loginForm = reactive({
      email: "",
      password: "",
      rememberMe: false,
    });

    // 회원가입 폼 데이터
    const signupForm = reactive({
      userType: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    });

    // 에러 상태
    const loginErrors = reactive({
      email: "",
      password: "",
    });

    const signupErrors = reactive({
      userType: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    // 계산된 속성 - 비밀번호 강도
    const passwordStrength = computed(() => {
      return checkPasswordStrength(signupForm.password);
    });

    // 메서드들
    const switchTab = (tab) => {
      currentTab.value = tab;
      clearAllErrors();
    };

    const selectUserType = (type) => {
      signupForm.userType = type;
      clearSignupError("userType");
    };

    const toggleLoginPassword = () => {
      showLoginPassword.value = !showLoginPassword.value;
    };

    const toggleSignupPassword = () => {
      showSignupPassword.value = !showSignupPassword.value;
    };

    const toggleConfirmPassword = () => {
      showConfirmPassword.value = !showConfirmPassword.value;
    };

    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    };

    const checkPasswordStrength = (password) => {
      let strength = 0;
      let feedback = [];

      if (password.length >= 8) strength++;
      else feedback.push("8자 이상");

      if (/[a-z]/.test(password)) strength++;
      else feedback.push("소문자");

      if (/[A-Z]/.test(password)) strength++;
      else feedback.push("대문자");

      if (/[0-9]/.test(password)) strength++;
      else feedback.push("숫자");

      if (/[^A-Za-z0-9]/.test(password)) strength++;
      else feedback.push("특수문자");

      return {
        strength: strength,
        feedback: feedback,
        level: strength < 2 ? "weak" : strength < 4 ? "medium" : "strong",
      };
    };

    const getPasswordStrengthText = (level) => {
      const levels = { weak: "약함", medium: "보통", strong: "강함" };
      return levels[level] || "";
    };

    const clearLoginError = (field) => {
      loginErrors[field] = "";
    };

    const clearSignupError = (field) => {
      signupErrors[field] = "";
    };

    const clearAllErrors = () => {
      Object.keys(loginErrors).forEach((key) => {
        loginErrors[key] = "";
      });
      Object.keys(signupErrors).forEach((key) => {
        signupErrors[key] = "";
      });
    };

    const validateLoginForm = () => {
      let isValid = true;

      if (!loginForm.email || !validateEmail(loginForm.email)) {
        loginErrors.email = "올바른 이메일 주소를 입력해주세요";
        isValid = false;
      }

      if (!loginForm.password) {
        loginErrors.password = "비밀번호를 입력해주세요";
        isValid = false;
      }

      return isValid;
    };

    const validateSignupForm = () => {
      let isValid = true;

      if (!signupForm.userType) {
        signupErrors.userType = "사용자 유형을 선택해주세요";
        isValid = false;
      }

      if (!signupForm.name.trim()) {
        signupErrors.name = "이름을 입력해주세요";
        isValid = false;
      }

      if (!signupForm.email || !validateEmail(signupForm.email)) {
        signupErrors.email = "올바른 이메일 주소를 입력해주세요";
        isValid = false;
      }

      if (!signupForm.password || signupForm.password.length < 8) {
        signupErrors.password = "8자 이상의 비밀번호를 입력해주세요";
        isValid = false;
      }

      if (signupForm.password !== signupForm.confirmPassword) {
        signupErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
        isValid = false;
      }

      if (!signupForm.agreeTerms) {
        alert("이용약관 및 개인정보처리방침에 동의해주세요.");
        isValid = false;
      }

      return isValid;
    };

    const handleLogin = async () => {
      if (!validateLoginForm()) return;

      loginLoading.value = true;

      try {
        // 서버 요청 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 테스트 계정 검증 및 페이지 이동
        if (
          loginForm.email === "st@airoom.com" &&
          loginForm.password === "1234"
        ) {
          // 학생 계정으로 로그인 성공
          localStorage.setItem("userType", "student");
          localStorage.setItem("userEmail", loginForm.email);
          alert("학생 대시보드로 이동합니다.");
          router.push("/student");
        } else if (
          loginForm.email === "te@airoom.com" &&
          loginForm.password === "1234"
        ) {
          // 교사 계정으로 로그인 성공
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("userEmail", loginForm.email);
          alert("교사 대시보드로 이동합니다.");
          router.push("/teacher");
        } else {
          // 잘못된 계정 정보
          loginErrors.email =
            "등록되지 않은 계정이거나 비밀번호가 올바르지 않습니다.";
          loginErrors.password = "이메일과 비밀번호를 확인해주세요.";
        }
      } catch (error) {
        console.error("로그인 오류:", error);
        alert("로그인 중 오류가 발생했습니다.");
      } finally {
        loginLoading.value = false;
      }
    };

    const handleSignup = async () => {
      if (!validateSignupForm()) return;

      signupLoading.value = true;

      try {
        // 서버 요청 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // 성공 메시지 표시
        showSuccessMessage.value = true;

        // 사용자 정보 저장
        localStorage.setItem("userType", signupForm.userType);
        localStorage.setItem("userEmail", signupForm.email);
        localStorage.setItem("userName", signupForm.name);

        // 폼 초기화
        Object.keys(signupForm).forEach((key) => {
          if (typeof signupForm[key] === "boolean") {
            signupForm[key] = false;
          } else {
            signupForm[key] = "";
          }
        });

        // 회원가입 성공 후 해당 유형의 페이지로 이동
        setTimeout(() => {
          const userType = localStorage.getItem("userType");
          if (userType === "student") {
            router.push("/student");
          } else if (userType === "teacher") {
            router.push("/teacher");
          }
          showSuccessMessage.value = false;
        }, 2000);
      } catch (error) {
        console.error("회원가입 오류:", error);
        alert("회원가입 중 오류가 발생했습니다.");
      } finally {
        signupLoading.value = false;
      }
    };

    const socialLogin = (provider) => {
      alert(`${provider} 로그인을 진행합니다.`);
      // 실제 구현에서는 각 소셜 로그인 API 호출
    };

    const showForgotPassword = () => {
      const email = prompt("가입시 사용한 이메일 주소를 입력해주세요:");
      if (email && validateEmail(email)) {
        alert("비밀번호 재설정 링크를 이메일로 발송했습니다.");
      } else if (email) {
        alert("올바른 이메일 주소를 입력해주세요.");
      }
    };

    const handleKeydown = (e) => {
      // Ctrl + Tab으로 탭 전환
      if (e.ctrlKey && e.key === "Tab") {
        e.preventDefault();
        switchTab(currentTab.value === "login" ? "signup" : "login");
      }
    };

    // 라이프사이클 훅
    onMounted(() => {
      document.addEventListener("keydown", handleKeydown);

      // 데모 계정 정보 표시 (개발용)
      console.log("데모 계정:");
      console.log("학생: student@airoom.com / password123");
      console.log("교사: teacher@airoom.com / password123");
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", handleKeydown);
    });

    return {
      // 데이터
      currentTab,
      showSuccessMessage,
      loginLoading,
      signupLoading,
      showLoginPassword,
      showSignupPassword,
      showConfirmPassword,
      loginForm,
      signupForm,
      loginErrors,
      signupErrors,

      // 계산된 속성
      passwordStrength,

      // 메서드
      switchTab,
      selectUserType,
      toggleLoginPassword,
      toggleSignupPassword,
      toggleConfirmPassword,
      clearLoginError,
      clearSignupError,
      handleLogin,
      handleSignup,
      socialLogin,
      showForgotPassword,
      getPasswordStrengthText,
    };
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-page {
  font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  width: 100%;
  max-width: 900px;
  min-height: 600px;
  display: flex;
  position: relative;
}

/* Left Panel - Brand Section */
.brand-panel {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  padding: 3rem 2.5rem;
  width: 45%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.brand-panel::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.brand-content {
  position: relative;
  z-index: 2;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
}

.logo-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.feature-list {
  list-style: none;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.feature-icon {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 0.8rem;
}

/* Right Panel - Auth Forms */
.auth-panel {
  width: 55%;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  background: #f8fafc;
  border-radius: 12px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  color: #64748b;
}

.tab-btn.active {
  background: white;
  color: #2563eb;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
}

.auth-form {
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.password-field {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 0.9rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
}

.forgot-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.25);
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #9ca3af;
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  padding: 0 1rem;
}

.social-login {
  display: flex;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.social-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.9rem;
}

.social-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.switch-form {
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
}

.switch-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.switch-link:hover {
  text-decoration: underline;
}

/* User Type Selection */
.user-type-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 1.5rem;
}

.user-type-btn {
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-weight: 500;
}

.user-type-btn.selected {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.user-type-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
  display: block;
}

/* Loading Spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Success Message */
.success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

/* Password Strength Indicator */
.password-strength {
  margin-top: 8px;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
  width: 0%;
}

.strength-fill.weak {
  background: #ef4444;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.strong {
  background: #10b981;
}

.strength-text {
  font-size: 0.8rem;
  color: #6b7280;
}

/* Responsive Design */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    max-width: 400px;
    min-height: auto;
  }

  .brand-panel {
    width: 100%;
    padding: 2rem 1.5rem;
    text-align: center;
  }

  .brand-title {
    font-size: 2rem;
  }

  .feature-list {
    display: none;
  }

  .auth-panel {
    width: 100%;
    padding: 2rem 1.5rem;
  }

  .social-login {
    flex-direction: column;
  }

  .user-type-group {
    grid-template-columns: 1fr;
  }
}

/* 포커스 스타일 개선 */
.form-input:focus,
.submit-btn:focus,
.social-btn:focus,
.tab-btn:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* 애니메이션 개선 */
.user-type-btn {
  transform: scale(1);
  transition: all 0.2s ease;
}

.user-type-btn:hover {
  transform: scale(1.02);
}

.user-type-btn.selected {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

/* 모바일 터치 개선 */
@media (hover: none) {
  .user-type-btn:hover {
    transform: scale(1);
  }

  .social-btn:hover {
    background: white;
    border-color: #e5e7eb;
  }
}

/* 애니메이션 감소 설정 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 테스트 계정 안내 */
.test-accounts {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.test-accounts h4 {
  color: #374151;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.test-accounts p {
  color: #6b7280;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  font-family: "Courier New", monospace;
}

.test-accounts p:last-child {
  margin-bottom: 0;
}
</style>
