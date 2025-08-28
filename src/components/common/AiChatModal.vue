<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="chat-overlay" @click="close"></div>
    </Transition>

    <Transition name="modal-slide">
      <div
        v-if="isOpen"
        class="chat-modal"
        role="dialog"
        aria-modal="true"
        @click.stop
        @keydown.esc="close"
        tabindex="0"
      >
        <div class="chat-room-header">
          <div class="chat-title">아이룸 AI</div>
          <button class="chat-icon-btn" title="닫기" @click="close">❌</button>
        </div>

        <div class="chat-room">
          <div ref="msgsRef" class="chat-messages">
            <template v-for="(m, i) in msgs" :key="i">
              <div class="msg-row" :class="m.role === 'user' ? 'me' : 'other'">
                <div class="bubble">
                  <div class="text" v-html="m.html"></div>
                  <div class="time">{{ formatTime(m.ts) }}</div>

                  <!-- 출처 표시(assistant만) -->
                  <div v-if="m.sources?.length" class="sources">
                    <span class="src-chip" v-for="(s, idx) in m.sources" :key="idx">
                      문서 {{ idx+1 }}
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <div v-if="loading" class="loading-more"><span>생각 중이에요…</span></div>
            <div v-if="error" class="error-state">
              <div class="error-icon">❌</div>
              <p>{{ error }}</p>
            </div>
          </div>

          <div class="chat-input-area">
            <input
              v-model.trim="input"
              type="text"
              class="chat-input"
              placeholder="무엇이 궁금한가요?"
              @keyup.enter="send"
              :disabled="loading"
            />
            <button class="chat-send-btn" @click="send" title="전송" :disabled="loading">➤</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/utils/apiClient";

const route = useRoute();
const router = useRouter();

const isOpen = computed(() => route.query.aichat === "1");

const msgsRef = ref(null);
const msgs = ref([]);  // { role: 'user'|'assistant', html: string, ts: number, sources?: any[] }
const input = ref("");
const loading = ref(false);
const error = ref("");

function close(){
  const q = { ...route.query };
  delete q.aichat;
  router.push({ query: q });
}

watch(isOpen, (v)=>{
  if (v) {
    // 첫 진입 안내(한 번만)
    if (msgs.value.length === 0) {
      msgs.value.push({
        role: "assistant",
        html: "안녕하세요! 😊 무엇이 궁금한가요? 쉽고 재미있게 알려드릴게요!",
        ts: Date.now()
      });
    }
    nextTick(scrollToBottom);
  }
});

function scrollToBottom(){
  if (msgsRef.value) msgsRef.value.scrollTop = msgsRef.value.scrollHeight;
}

function formatTime(ts){
  const d = new Date(ts);
  const h = d.getHours(); const m = String(d.getMinutes()).padStart(2,"0");
  const ap = h >= 12 ? "오후" : "오전"; const hh = (h % 12) || 12;
  return `${ap} ${hh}:${m}`;
}

async function send(){
  const q = input.value.trim();
  if (!q || loading.value) return;

  // push user
  msgs.value.push({ role:"user", html: escapeHtml(q), ts: Date.now() });
  input.value = ""; error.value = "";
  nextTick(scrollToBottom);

  try{
    loading.value = true;

    // 서버 호출 (context는 서버에서 주입하는 전략이니 생략)
    const res = await apiClient.post("/aichat/ask", { message: q });
    const answer = res?.answer || res?.content || "답변 생성에 문제가 있었어요.";
    const sources = Array.isArray(res?.sources) ? res.sources : [];

    msgs.value.push({
      role:"assistant",
      html: linkify(escapeHtml(answer)).replace(/\n/g, "<br>"),
      ts: Date.now(),
      sources
    });
  }catch(e){
    console.error(e);
    error.value = e?.message || "네트워크 오류가 발생했어요.";
  }finally{
    loading.value = false;
    nextTick(scrollToBottom);
  }
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, (m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}
function linkify(t){
  return t.replace(/(https?:\/\/[^\s)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}
</script>

<style scoped>
/* StudentChatModal과 거의 동일한 톤 */
.chat-overlay{ position: fixed; inset:0; background: rgba(85,68,0,.4); backdrop-filter: blur(4px); z-index:2000; }
.chat-modal{ position: fixed; left:50%; top:50%; transform: translate(-50%,-50%);
  width:min(600px,95vw); max-height:85vh; min-height:80vh; background:#fffbf0; border-radius:30px;
  border:3px solid #ffe066; box-shadow:0 20px 60px rgba(255,221,41,.15); display:flex; flex-direction:column; overflow:hidden; z-index:2010; outline:none;}
.modal-fade-enter-active,.modal-fade-leave-active{ transition: opacity .3s ease;}
.modal-fade-enter-from,.modal-fade-leave-to{ opacity:0;}
.modal-slide-enter-active{ transition: all .4s cubic-bezier(.34,1.56,.64,1);}
.modal-slide-leave-active{ transition: all .3s ease-out;}
.modal-slide-enter-from,.modal-slide-leave-to{ opacity:0; transform: translate(-50%, calc(-50% + 30px)) scale(.95);}

.chat-room-header{ background:#ffdd29; color:#8c6d32; padding:1rem 1.5rem; display:flex; align-items:center; gap:.75rem; flex-shrink:0;}
.chat-title{ font-size:1.3rem; font-weight:800; margin:0; flex:1;}
.chat-icon-btn{ background:rgba(255,255,255,.3); border:0; color:#a37800; width:40px; height:40px; border-radius:12px; cursor:pointer; }

.chat-room{ display:flex; flex-direction:column; flex-grow:1; overflow:hidden;}
.chat-messages{ flex:1; overflow-y:auto; background:#fff9e6; padding:1rem;}
.msg-row{ display:flex; margin:.5rem 0;}
.msg-row.me{ justify-content:flex-end;}
.msg-row.other{ justify-content:flex-start;}
.bubble{ max-width:75%; padding:.75rem 1rem; border-radius:18px; line-height:1.5; box-shadow:0 2px 5px rgba(0,0,0,.05); word-break:break-word; white-space:pre-wrap; }
.msg-row.me .bubble{ background:#ff9800; color:white; border-bottom-right-radius:6px;}
.msg-row.other .bubble{ background:white; border:2px solid #ffe066; color:#8c6d32; border-bottom-left-radius:6px;}
.bubble .text{ font-size:.9375rem;}
.bubble .time{ margin-top:.25rem; font-size:.75rem; opacity:.8; text-align:right;}
.sources{ margin-top:.5rem; display:flex; gap:.35rem; flex-wrap:wrap;}
.src-chip{ font-size:.7rem; padding:.1rem .4rem; border-radius:.5rem; border:1px dashed #ffdd29; color:#a37800; background:#fffdf4;}

.chat-input-area{ display:flex; gap:.75rem; align-items:center; padding:1rem; background:#fffbf0; border-top:2px solid #ffe066;}
.chat-input{ flex:1; border:2px solid #ffe066; background:white; border-radius:15px; padding:.75rem 1rem; font-size:1rem; color:#8c6d32;}
.chat-input:focus{ outline:none; border-color:#ff9800; box-shadow:0 0 0 3px rgba(255,152,0,.3);}
.chat-send-btn{ background:#ffdd29; color:#a37800; border:0; width:50px; height:50px; border-radius:15px; font-weight:600; font-size:1.5rem; cursor:pointer;}
.loading-more{ text-align:center; padding:1rem; color:#ff9800; font-size:.9rem;}
.error-state{ text-align:center; padding:1rem; color:#ff9800; }
</style>
