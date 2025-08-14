<template>
  <nav class="navbar navbar-expand-lg" style="background-color: #034582">
    <div class="container" style="max-width: 1200px">
      <!-- 로고 -->
      <a class="navbar-brand d-flex align-items-center text-white" href="#">
        <i class="bi bi-mortarboard-fill me-2 fs-3"></i>
        <strong>아이룸</strong>
      </a>

      <!-- 과목/학생 정보 pill -->
      <span
        class="badge rounded-pill text-white me-2 d-none d-lg-inline-block"
        style="background: rgba(255, 255, 255, 0.15); font-weight: 500"
      >
        {{ subjectInfo }}
      </span>

      <!-- 모바일 토글 버튼 -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon" style="filter: invert(1)"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNavbar">
        <!-- 좌측 메뉴 -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
          <li class="nav-item">
            <a class="nav-link text-white" href="#">우리 반 수업</a>
          </li>
          <li class="nav-item">
            <router-link class="nav-link text-white" to="/assignment"
              >과제</router-link
            >
          </li>
          <li class="nav-item">
            <a class="nav-link text-white" href="#">평가</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white" href="#">학습 자료</a>
          </li>
          <li class="nav-item">
            <a class="nav-link text-white" href="#">마이페이지</a>
          </li>
        </ul>

        <!-- 우측 아이콘: 알림/채팅 -->
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
          <!-- 과목/학생 정보 pill (모바일에서는 오른쪽에 표시) -->
          <li class="nav-item d-lg-none mb-2 text-center">
            <span
              class="badge rounded-pill text-white"
              style="background: rgba(255, 255, 255, 0.15); font-weight: 500"
            >
              {{ subjectInfo }}
            </span>
          </li>

          <!-- 알림 -->
          <li class="nav-item me-2">
            <button
              class="btn position-relative text-white"
              @click="noti.open()"
            >
              <i class="bi bi-bell fs-5"></i>
              <span
                v-if="noti.unreadCount"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              >
                {{ noti.unreadCount }}
              </span>
            </button>
          </li>

          <!-- 채팅 -->
          <li class="nav-item">
            <!-- 채팅 버튼 -->
            <button
              class="btn position-relative text-white"
              @click="openChat()"
            >
              <i class="bi bi-chat-dots fs-5"></i>
              <span
                v-if="chat.totalUnread"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
              >
                {{ chat.totalUnread }}
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useNotificationStore } from "@/stores/notification";
import { useChatStore } from "@/stores/chat";
import { useRouter, useRoute } from "vue-router";

import { computed } from "vue";

const noti = useNotificationStore();
const chat = useChatStore();

const router = useRouter();
const route = useRoute();

const isTeacher = computed(() => {
  return localStorage.getItem("userType") === "teacher";
});
const props = defineProps({
  subjectInfo: {
    type: String,
    default: "",
  },
});

function openChat() {
  router.push({
    query: { ...route.query, chat: "1" }, // 모달 ON
  });
}
</script>

<style scoped></style>
