<template>
  <RouterView />
  <NotificationModal @close="closeNotification" />
  <ChatModal v-if="route.query.chat === '1'" @close="closeChat" />
  <StudentChatModal v-if="route.query.studentchat === '1'" @close="closeChat" />
  <AiChat v-if="route.query.aichat === '1'" mode="modal" @close="closeAiChat" />
  <Spinner
    :is-loading="loadingState.isLoading"
    :loading-text="loadingState.text"
    overlay-type="fullscreen"
    :backdrop-blur="true"
    :z-index="10000"
  />
  <ChatFab v-if="showAiFab" />
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import NotificationModal from "@/components/common/NotificationModal.vue";
import ChatModal from "@/components/common/ChatModal.vue";
import StudentChatModal from "./components/common/StudentChatModal.vue";
import AiChat from "@/components/common/AiChat.vue";
import Spinner from "./components/common/Spinner.vue";
import ChatFab from "@/components/common/ChatFab.vue";
import { loadingState } from "@/utils/loading";
import presenceClient from "./utils/presenceClient";
import { computed, provide, watch, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useAiChat } from "@/composables/useAiChat";

//전역해서 WEBSOCKET 제공
provide("presenceClient", presenceClient);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { closeAiChat } = useAiChat();

watch(
  () => route.path,
  (newPath) => {
    if (newPath.startsWith("/ExamProblem") && route.query.aichat === "1") {
      closeAiChat();
    }
  }
);

watch(
  () => route.query.aichat,
  (isOpen) => {
    if (isOpen === "1" && route.path.startsWith("/ExamProblem")) {
      closeAiChat();
    }
  }
);

// 학생 로그인 시 WebSocket 전역 연결 및 이벤트 리스너 설정
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth && authStore.isStudent) {
      const tokenInfo = authStore.tokenInfo;
      const memberId = authStore.memberId;

      // 데이터가 완전히 준비되었는지 명확하게 확인
      if (
        presenceClient &&
        !presenceClient.isConnected() &&
        memberId &&
        tokenInfo &&
        tokenInfo.classroomNo
      ) {
        presenceClient.connect(
          {
            classNo: tokenInfo.classroomNo,
            userId: memberId,
            role: tokenInfo.role,
          },
          {
            onEvent: (data) => {
              console.log("App.vue에서 전역 이벤트 수신:", data);

              // 주기적인 'FOCUS_PULSE' 이벤트에 반응하여 강제 이동
              if (data.eventType === "FOCUS_PULSE" && data.unitNo) {
                const targetPath = `/classroom/view/${data.unitNo}`; // 라우터 경로 확인 필요

                // 현재 경로가 목표 경로와 다를 경우에만 이동
                if (route.path !== targetPath) {
                  console.log(
                    `[FOCUS MODE] 학습 화면으로 이동합니다 -> ${targetPath}`
                  );
                  router.replace(targetPath);
                }
              }
              // 집중학습 모드 종료 이벤트는 그대로 유지
              else if (data.eventType === "FOCUS_STOP") {
                alert("집중학습 모드가 종료되었습니다.");
              }
            },
          }
        );
        console.log("✅ [전역] 학생으로 Presence 서버에 연결했습니다.");
      }
    } else {
      if (presenceClient && presenceClient.isConnected()) {
        presenceClient.disconnect();
        console.log("🔌 [전역] 로그아웃하여 Presence 연결을 종료합니다.");
      }
    }
  },
  { immediate: true }
);

// 브라우저 창/탭 닫을 때 연결 종료 처리
const handleBeforeUnload = () => {
  if (presenceClient && presenceClient.isConnected()) {
    presenceClient.disconnect();
  }
};
window.addEventListener("beforeunload", handleBeforeUnload);

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

function closeChat() {
  const q = { ...route.query };
  delete q.chat;
  delete q.room;
  delete q.studentchat;
  router.push({ query: q }); // 모달 OFF
}

function closeNotification() {
  // 스토어를 사용한다면 noti.close() 같은 형태가 될 것입니다.
}

const showAiFab = computed(() => {
  if (route.query.aichat === "1") return false;

  if (!authStore.isAuthenticated) return false;
  if (!authStore.isStudent) return false;
  const role = authStore.tokenInfo?.role?.toLowerCase?.();
  if (role && role !== "student") return false;

  if (route.matched?.some((r) => r.meta?.hideAiChat === true)) return false;

  const blockedNames = new Set([
    "DigitalTextBook",
    "ExamReport",
    "ExamProblem",
    "Classview",
  ]);
  if (blockedNames.has(route.name)) return false;

  const path = route.path || "";
  const blockedPrefixes = [
    "/install",
    "/agent-required",
    "/forensic",
    "/textbook",
    "/ExamProblem",
    "/classroom/view",
  ];
  if (blockedPrefixes.some((p) => path.startsWith(p))) return false;

  return true;
});
</script>

<style scoped></style>
