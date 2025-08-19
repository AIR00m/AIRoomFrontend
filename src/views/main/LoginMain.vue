<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Brand Panel -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="logo">
            <div class="logo-icon">🐤</div>
            아이룸
          </div>
          <h1 class="brand-title">재미있는 공부<br />시작해볼까요? 🎈</h1>
          <p class="brand-subtitle">
            우리 친구들과 함께 즐겁게 배워요! 매일매일 새로운 것을 발견해봐요 ✨
          </p>
          <ul class="feature-list">
            <li class="feature-item">
              <span class="feature-icon">🎯</span>
              나만의 특별한 공부
            </li>
            <li class="feature-item">
              <span class="feature-icon">🏆</span>
              실시간 응원과 칭찬
            </li>
            <li class="feature-item">
              <span class="feature-icon">📚</span>
              재미있는 디지털 교과서
            </li>
            <li class="feature-item">
              <span class="feature-icon">🤖</span>
              언제든지 도와주는 AI 친구
            </li>
          </ul>

          <!-- 귀여운 캐릭터들 -->
          <div class="cute-characters">
            <div class="character char1">🐥</div>
            <div class="character char2">🐤</div>
            <div class="character char3">🐣</div>
          </div>
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
            🔑 들어가기
          </button>
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'signup' }"
            @click="switchTab('signup')"
          >
            ✨ 가입하기
          </button>
        </div>

        <!-- Success Message -->
        <div v-show="showSuccessMessage" class="success-message">
          🎉 와! 가입 완료! 이제 로그인해서 공부 시작해요!
        </div>

        <!-- Login Form -->
        <form
          v-show="currentTab === 'login'"
          class="auth-form active"
          @submit.prevent="handleLogin"
        >
          <h2 class="form-title">만나서 반가워요! 🤗</h2>
          <p class="form-subtitle">아이디와 비밀번호를 입력해주세요</p>

          <div class="form-group">
            <label class="form-label">📧 이메일</label>
            <input
              v-model="loginForm.email"
              type="email"
              class="form-input"
              :class="{ error: loginErrors.email }"
              placeholder="이메일 주소를 적어주세요"
              @input="clearLoginError('email')"
              required
            />
            <div v-show="loginErrors.email" class="error-message">
              {{ loginErrors.email }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">🔒 비밀번호</label>
            <div class="password-field">
              <input
                v-model="loginForm.password"
                :type="showLoginPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: loginErrors.password }"
                placeholder="비밀번호를 적어주세요"
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
              <label for="rememberMe">👍 로그인 상태 기억하기</label>
            </div>
            <a href="#" class="forgot-link" @click.prevent="showForgotPassword">
              🤔 비밀번호 까먹었어요
            </a>
          </div>

          <button type="submit" class="submit-btn" :disabled="loginLoading">
            <span v-show="loginLoading" class="loading-spinner"></span>
            🚀 로그인하기
          </button>

          <div class="divider">
            <span>또는</span>
          </div>

          <div class="social-login">
            <button
              type="button"
              class="social-btn google"
              @click="socialLogin('google')"
            >
              🔍 Google로 시작
            </button>
            <button
              type="button"
              class="social-btn naver"
              @click="socialLogin('naver')"
            >
              🟢 Naver로 시작
            </button>
            <button
              type="button"
              class="social-btn kakao"
              @click="socialLogin('kakao')"
            >
              💬 Kakao로 시작
            </button>
          </div>

          <p class="switch-form">
            아직 계정이 없나요? 🤷‍♀️
            <a
              href="#"
              class="switch-link"
              @click.prevent="switchTab('signup')"
            >
              새로 가입하기
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
          <h2 class="form-title">아이룸에 온 걸 환영해요! 🎊</h2>
          <p class="form-subtitle">
            새로운 계정을 만들어서 공부 여행을 시작해요
          </p>

          <div class="form-group">
            <label class="form-label">👦👧 나는 누구일까요?</label>
            <div class="user-type-group">
              <div
                class="user-type-btn"
                :class="{ selected: signupForm.userType === 'student' }"
                @click="selectUserType('student')"
              >
                <span class="user-type-icon">🐣</span>
                <div>학생</div>
              </div>
              <div
                class="user-type-btn"
                :class="{ selected: signupForm.userType === 'teacher' }"
                @click="selectUserType('teacher')"
              >
                <span class="user-type-icon">🌟</span>
                <div>선생님</div>
              </div>
            </div>
            <div v-show="signupErrors.userType" class="error-message">
              {{ signupErrors.userType }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">✏️ 이름</label>
            <input
              v-model="signupForm.name"
              type="text"
              class="form-input"
              :class="{ error: signupErrors.name }"
              placeholder="이름을 적어주세요"
              @input="clearSignupError('name')"
              required
            />
            <div v-show="signupErrors.name" class="error-message">
              {{ signupErrors.name }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">📧 이메일</label>
            <input
              v-model="signupForm.email"
              type="email"
              class="form-input"
              :class="{ error: signupErrors.email }"
              placeholder="이메일 주소를 적어주세요"
              @input="clearSignupError('email')"
              required
            />
            <div v-show="signupErrors.email" class="error-message">
              {{ signupErrors.email }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">🔒 비밀번호</label>
            <div class="password-field">
              <input
                v-model="signupForm.password"
                :type="showSignupPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: signupErrors.password }"
                placeholder="비밀번호를 만들어주세요 (8자 이상)"
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
                🛡️ 비밀번호 강도:
                <span>{{
                  getPasswordStrengthText(passwordStrength.level)
                }}</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">🔒 비밀번호 확인</label>
            <div class="password-field">
              <input
                v-model="signupForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: signupErrors.confirmPassword }"
                placeholder="비밀번호를 다시 적어주세요"
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
                📜 <a href="#" class="forgot-link">이용약관</a> 및
                <a href="#" class="forgot-link">개인정보처리방침</a>에 동의해요
              </label>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="signupLoading">
            <span v-show="signupLoading" class="loading-spinner"></span>
            🎉 가입하기
          </button>

          <div class="divider">
            <span>또는</span>
          </div>

          <div class="social-login">
            <button
              type="button"
              class="social-btn google"
              @click="socialLogin('google')"
            >
              🔍 Google로 가입
            </button>
            <button
              type="button"
              class="social-btn naver"
              @click="socialLogin('naver')"
            >
              🟢 Naver로 가입
            </button>
          </div>

          <p class="switch-form">
            이미 계정이 있나요? 😊
            <a href="#" class="switch-link" @click.prevent="switchTab('login')">
              로그인하기
            </a>
          </p>
        </form>
      </div>
    </div>

    <!-- 떠다니는 장식 요소들 -->
    <div class="floating-decorations">
      <div class="floating-item item1">🐥</div>
      <div class="floating-item item2">🌻</div>
      <div class="floating-item item3">☀️</div>
      <div class="floating-item item4">🌟</div>
      <div class="floating-item item5">🥚</div>
      <div class="floating-item item6">🐤</div>
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
      const levels = { weak: "약함 😟", medium: "보통 😐", strong: "강함 😊" };
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

        // 테스트 계정 검증 및 디지털 교과서 페이지로 이동
        if (
          loginForm.email === "st@airoom.com" &&
          loginForm.password === "1234"
        ) {
          // 학생 계정으로 로그인 성공
          localStorage.setItem("userType", "student");
          localStorage.setItem("userEmail", loginForm.email);
          // alert("🎉 로그인 성공! 디지털 교과서를 선택해주세요!");
          window.location.href = "/textbook";
        } else if (
          loginForm.email === "te@airoom.com" &&
          loginForm.password === "1234"
        ) {
          // 교사 계정으로 로그인 성공
          localStorage.setItem("userType", "teacher");
          localStorage.setItem("userEmail", loginForm.email);
          // alert("🎓 로그인 성공! 디지털 교과서를 선택해주세요!");
          window.location.href = "/textbook";
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

        // 회원가입 성공 후 디지털 교과서 페이지로 이동
        setTimeout(() => {
          alert("🎉 회원가입 완료! 디지털 교과서를 선택해주세요!");
          window.location.href = "/textbook";
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
      alert(`🎈 ${provider} 로그인을 진행합니다!`);
      // 실제 구현에서는 각 소셜 로그인 API 호출
    };

    const showForgotPassword = () => {
      const email = prompt("가입시 사용한 이메일 주소를 입력해주세요:");
      if (email && validateEmail(email)) {
        alert("📧 비밀번호 재설정 링크를 이메일로 발송했습니다!");
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
      console.log("🎮 데모 계정:");
      console.log("🎒 학생: st@airoom.com / 1234");
      console.log("🎓 교사: te@airoom.com / 1234");
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
  font-family: "Comic Sans MS", "Segoe UI", -apple-system, BlinkMacSystemFont,
    sans-serif;
  background: #fff9e6;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
}

.auth-container {
  background: white;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(255, 221, 41, 0.15);
  border: 3px solid #ffe066;
  overflow: hidden;
  width: 100%;
  max-width: 1000px;
  min-height: 650px;
  display: flex;
  position: relative;
  animation: bounceIn 0.8s ease;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Left Panel - Brand Section */
.brand-panel {
  background: #ffdd29;
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
    rgba(255, 255, 255, 0.2) 0%,
    transparent 70%
  );
  animation: sparkle 4s ease-in-out infinite;
}

@keyframes sparkle {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.7;
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
  font-size: 2.2rem;
  font-weight: 800;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  animation: wiggle 2s ease-in-out infinite;
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(5deg);
  }
  75% {
    transform: rotate(-5deg);
  }
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.brand-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.feature-list {
  list-style: none;
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 1.2rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  animation: slideInLeft 0.6s ease;
  animation-delay: var(--delay, 0s);
}

.feature-item:nth-child(1) {
  --delay: 0.2s;
}
.feature-item:nth-child(2) {
  --delay: 0.4s;
}
.feature-item:nth-child(3) {
  --delay: 0.6s;
}
.feature-item:nth-child(4) {
  --delay: 0.8s;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.feature-icon {
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 1.2rem;
}

.cute-characters {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.character {
  font-size: 2.5rem;
  animation: bounce 2s infinite;
  animation-delay: var(--bounce-delay, 0s);
}

.char1 {
  --bounce-delay: 0s;
}
.char2 {
  --bounce-delay: 0.3s;
}
.char3 {
  --bounce-delay: 0.6s;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* Right Panel - Auth Forms */
.auth-panel {
  width: 55%;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  background: #fffbf0;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  background: #fff5d6;
  border-radius: 20px;
  padding: 6px;
  border: 2px solid #ffe066;
}

.tab-btn {
  flex: 1;
  background: none;
  border: none;
  padding: 15px 20px;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  color: #ff9800;
}

.tab-btn.active {
  background: #ffdd29;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 221, 41, 0.3);
  transform: translateY(-2px);
}

.auth-form {
  animation: slideInUp 0.5s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #ff9800;
  margin-bottom: 0.8rem;
  text-align: center;
}

.form-subtitle {
  color: #ffb74d;
  margin-bottom: 2rem;
  font-size: 1rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 700;
  color: #ff9800;
  font-size: 1rem;
}

.form-input {
  width: 100%;
  padding: 15px 20px;
  border: 3px solid #fff5d6;
  border-radius: 15px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fffef9;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #ffdd29;
  background: white;
  box-shadow: 0 0 0 5px rgba(255, 221, 41, 0.1);
  transform: translateY(-2px);
}

.form-input.error {
  border-color: #e74c3c;
  background: #ffeaea;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 600;
}

.password-field {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #ffdd29;
  font-size: 1.2rem;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  background: rgba(255, 221, 41, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  accent-color: #ffdd29;
}

.forgot-link {
  color: #ff9800;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.forgot-link:hover {
  color: #f57c00;
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  background: #ffdd29;
  color: white;
  border: none;
  padding: 18px 25px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(255, 221, 41, 0.4);
}

.submit-btn:disabled {
  background: #ddd;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #ff9800;
  font-size: 0.9rem;
  font-weight: 600;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 2px;
  background: #fff5d6;
}

.divider span {
  padding: 0 1rem;
}

.social-login {
  display: flex;
  gap: 10px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.social-btn {
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 3px solid #fff5d6;
  border-radius: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.9rem;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.social-btn.google {
  border-color: #4285f4;
  color: #4285f4;
}

.social-btn.naver {
  border-color: #03c75a;
  color: #03c75a;
}

.social-btn.kakao {
  border-color: #fee500;
  color: #3c1e1e;
  background: #fee500;
}

.switch-form {
  text-align: center;
  color: #ff9800;
  font-size: 0.95rem;
  font-weight: 600;
}

.switch-link {
  color: #f57c00;
  text-decoration: none;
  font-weight: 700;
}

.switch-link:hover {
  text-decoration: underline;
}

/* User Type Selection */
.user-type-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 1.5rem;
}

.user-type-btn {
  padding: 20px 15px;
  border: 3px solid #fff5d6;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-weight: 700;
}

.user-type-btn.selected {
  border-color: #ffdd29;
  background: #fff5d6;
  color: #ff9800;
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(255, 221, 41, 0.2);
}

.user-type-btn:hover:not(.selected) {
  border-color: #ffe066;
  transform: translateY(-2px);
}

.user-type-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  display: block;
}

/* Loading Spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #ffffff40;
  border-top: 3px solid #ffffff;
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
  background: #d4edda;
  border: 3px solid #28a745;
  color: #155724;
  padding: 15px 20px;
  border-radius: 15px;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  animation: successPulse 0.6s ease;
}

@keyframes successPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Password Strength Indicator */
.password-strength {
  margin-top: 10px;
}

.strength-bar {
  width: 100%;
  height: 6px;
  background: #fff5d6;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
  width: 0%;
}

.strength-fill.weak {
  background: #e74c3c;
}

.strength-fill.medium {
  background: #f39c12;
}

.strength-fill.strong {
  background: #27ae60;
}

.strength-text {
  font-size: 0.85rem;
  color: #ff9800;
  font-weight: 600;
}

/* Floating Decorations */
.floating-decorations {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-item {
  position: absolute;
  font-size: 2rem;
  opacity: 0.6;
  animation: float 6s ease-in-out infinite;
}

.item1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.item2 {
  top: 20%;
  right: 10%;
  animation-delay: 1s;
}

.item3 {
  top: 60%;
  left: 5%;
  animation-delay: 2s;
}

.item4 {
  top: 80%;
  right: 20%;
  animation-delay: 3s;
}

.item5 {
  top: 40%;
  left: 80%;
  animation-delay: 4s;
}

.item6 {
  top: 70%;
  right: 5%;
  animation-delay: 5s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
  }
  50% {
    transform: translateY(0px) rotate(180deg);
  }
  75% {
    transform: translateY(-10px) rotate(270deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    max-width: 400px;
    min-height: auto;
    border-radius: 20px;
  }

  .brand-panel {
    width: 100%;
    padding: 2rem 1.5rem;
    text-align: center;
  }

  .brand-title {
    font-size: 2rem;
  }

  .cute-characters {
    justify-content: center;
    gap: 1rem;
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
    gap: 10px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .floating-item {
    font-size: 1.5rem;
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

/* 포커스 스타일 개선 */
.form-input:focus,
.submit-btn:focus,
.social-btn:focus,
.tab-btn:focus {
  outline: 3px solid #ffdd29;
  outline-offset: 2px;
}

/* 호버 효과 개선 */
.user-type-btn {
  transform: scale(1);
  transition: all 0.3s ease;
}

.user-type-btn:hover {
  transform: scale(1.02);
}

.user-type-btn.selected {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 221, 41, 0.25);
}

/* 모바일 터치 개선 */
@media (hover: none) {
  .user-type-btn:hover {
    transform: scale(1);
  }

  .social-btn:hover {
    background: white;
    border-color: #fff5d6;
  }
}
</style>