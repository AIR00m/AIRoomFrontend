const AGENT_URL = "http://127.0.0.1:4455";

async function sleep(ms:number){ return new Promise(r=>setTimeout(r, ms)); }

async function pingAgent(timeoutMs=1200){
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), timeoutMs);
  try{
    const res = await fetch(`${AGENT_URL}/status`, { signal: ctrl.signal });
    clearTimeout(t);
    if(!res.ok) return null;
    return await res.json(); // {version, sha256, startedAt, heartbeatId}
  }catch(e){
    clearTimeout(t); return null;
  }
}

function tryLaunchProtocol(){
  const iframe = document.createElement('iframe');
  iframe.style.display='none';
  iframe.src='aidt://launch?from=web';
  document.body.appendChild(iframe);
  setTimeout(()=>iframe.remove(), 1500);
}

export async function ensureAgent(): Promise<boolean>{
  let st = await pingAgent();
  if(!st){
    tryLaunchProtocol();
    await sleep(1500);
    st = await pingAgent();
    if(!st) return false;
  }
  // 무결성 검증
  try{
    const res = await fetch('/api/agent/verify', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sha256: st.sha256, version: st.version })
    });
    const j = await res.json();
    return !!j.ok;
  }catch{ return false; }
}

let hbTimer: number | null = null;

export function startHeartbeat(){
  if(hbTimer) return;
  hbTimer = window.setInterval(async ()=>{
    const alive = await pingAgent();
    if(!alive){
      // 서버 통보 후, 차단 화면으로
      fetch('/api/agent/offline', { method:'POST' }).finally(()=>{
        window.location.href='/agent-required';
      });
    }
  }, 3000);
}

export function bindActiveTabWatermark(){
  async function postActive(active:boolean){
    try{
      await fetch(`${AGENT_URL}/activate-watermark`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ active })
      });
    }catch{}
  }
  const onFocus = ()=>postActive(true);
  const onBlur  = ()=>postActive(false);
  document.addEventListener('visibilitychange', ()=>{
    postActive(!document.hidden);
  });
  window.addEventListener('focus', onFocus);
  window.addEventListener('blur', onBlur);
  // 초기 상태 반영
  postActive(!document.hidden);
}
