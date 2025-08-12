import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    userType: null, // 'student' or 'teacher'
  }),
  actions: {
    setUserType(type) {
      this.userType = type;
    },
  },
});
