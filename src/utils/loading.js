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
