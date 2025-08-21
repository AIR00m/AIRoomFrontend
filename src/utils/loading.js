import { reactive } from "vue";

export const loadingState = reactive({
  isLoading: false,
  text: "로딩 중...",
});

export const loading = {
  show(text = "로딩 중...") {
    loadingState.text = text;
    loadingState.isLoading = true;
  },

  hide() {
    loadingState.isLoading = false;
  },
};

// 🔥 즉시 로딩 시작!
if (typeof window !== "undefined") {
  loadingState.isLoading = true;
  loadingState.text = "페이지를 준비하고 있어요...";
}
