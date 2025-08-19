import { createRouter, createWebHistory } from 'vue-router';
import Install from '../views/secureagent/Install.vue';
import AgentRequired from '../views/secureagent/AgentRequired.vue';
import { ensureAgent, startHeartbeat, bindActiveTabWatermark } from '../utils/ensureAgent';

const routes = [
  { path: '/install', component: Install },
  { path: '/agent-required', component: AgentRequired },
  // ... 기존 라우트들
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 전역 가드: install/agent-required는 제외
router.beforeEach(async (to, from, next)=>{
  if (to.path.startsWith('/install') || to.path.startsWith('/agent-required') || to.path.startsWith('/login')) {
    return next();
  }
  const ok = await ensureAgent();
  if(!ok) return next('/install');
  startHeartbeat();
  bindActiveTabWatermark();
  next();
});

export default router;
