let agentPort = parseInt(localStorage.getItem('agentPort') || '4455', 10);

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function pingOnPort(port, timeoutMs=600){
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), timeoutMs);
  try{
    const res = await fetch(`http://127.0.0.1:${port}/status`, { signal: ctrl.signal });
    clearTimeout(t);
    if(!res.ok) return null;
    const j = await res.json().catch(()=>null);
    return j;
  }catch(e){ clearTimeout(t); return null; }
}

async function discoverAgent(){
  // 우선 캐시된 포트 시도 → 실패 시 4455~4460 스캔
  const tried = new Set([agentPort]);
  let st = await pingOnPort(agentPort);
  if (st) return { st, port: agentPort };

  for (let p=4455; p<=4460; p++){
    if (tried.has(p)) continue;
    st = await pingOnPort(p);
    if (st) { localStorage.setItem('agentPort', String(p)); agentPort = p; return { st, port: p }; }
  }
  return { st: null, port: null };
}

function tryLaunchProtocol(){
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = 'aidt://launch?from=web';
  document.body.appendChild(iframe);
  setTimeout(()=>iframe.remove(), 1500);
}

export async function ensureAgent(){
  let { st, port } = await discoverAgent();
  if(!st){
    tryLaunchProtocol();
    await sleep(1500);
    ({ st, port } = await discoverAgent());
    if(!st) return false;
  }
  try{
    const res = await fetch('/api/agent/verify', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sha256: st.sha256, version: st.version })
    });
    const j = await res.json();
    return !!j.ok;
  }catch{ return false; }
}

let hbTimer = null;

export function startHeartbeat(){
  if(hbTimer) return;
  hbTimer = setInterval(async ()=>{
    const st = await pingOnPort(agentPort);
    if(!st){
      fetch('/api/agent/offline', { method:'POST' }).finally(()=>{
        window.location.href='/agent-required';
      });
    }
  }, 3000);
}

export function bindActiveTabWatermark(){
  async function postActive(active){
    try{
      await fetch(`http://127.0.0.1:${agentPort}/activate-watermark`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ active })
      });
    }catch{}
  }
  const sync = ()=>postActive(!document.hidden);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('focus', ()=>postActive(true));
  window.addEventListener('blur',  ()=>postActive(false));
  sync();
}
