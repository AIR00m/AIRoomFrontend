import { createApp } from "vue";
import { createPinia } from "pinia";
import { loading } from "@/utils/loading";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// 페이지 이동시 자동 로딩
router.beforeEach((to, from, next) => {
  if (to.path !== from.path) {
    loading.show("페이지를 불러오고 있어요...");
  }
  next();
});

router.afterEach(() => {
  setTimeout(() => loading.hide(), 300);
});

// 전역으로도 사용 가능하게
app.config.globalProperties.$loading = loading;

app.use(createPinia());
app.use(router);

app.mount("#app");
