let agentPort = parseInt(localStorage.getItem('agentPort') || '4455', 10);

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function pingOnPort(port, timeoutMs=150){
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), timeoutMs);
  try{
    const res = await fetch(`http://127.0.0.1:${port}/status`, { signal: ctrl.signal });
    clearTimeout(t);
    if(!res.ok) return null;
    return await res.json().catch(()=>null);
  }catch(e){ clearTimeout(t); return null; }
}

async function scanPortsParallel(ports, timeout){
  const tasks = ports.map(p => pingOnPort(p, timeout).then(st => st ? {st, port:p} : null));
  const results = await Promise.allSettled(tasks);
  const hit = results.find(r => r.status === 'fulfilled' && r.value);
  return hit ? hit.value : { st:null, port:null };
}

async function discoverAgent(){
  // 1) 캐시 포트(짧게)
  let st = await pingOnPort(agentPort, 120);
  if (st) return { st, port: agentPort };

  // 2) 4455~4460 병렬 스캔(짧게)
  const candidates = [];
  for (let p=4455; p<=4460; p++) if (p !== agentPort) candidates.push(p);
  let hit = await scanPortsParallel(candidates, 150);
  if (hit.st){
    agentPort = hit.port; localStorage.setItem('agentPort', String(agentPort));
    return hit;
  }

  // 3) 프로토콜로 기동 유도
  tryLaunchProtocol();
  await sleep(1200);

  // 4) 최종 재스캔(여유 있게)
  st = await pingOnPort(agentPort, 300);
  if (st) return { st, port: agentPort };
  hit = await scanPortsParallel(candidates, 500);
  if (hit.st){
    agentPort = hit.port; localStorage.setItem('agentPort', String(agentPort));
    return hit;
  }
  return { st:null, port:null };
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
      const next = encodeURIComponent(location.pathname + location.search);
      fetch('/api/agent/offline', { method:'POST' }).finally(()=>{
        window.location.href='/agent-required?next=' + next;
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

export async function checkAgentOnly(){
  let { st } = await discoverAgent();
  if(!st) return false;
  try{
    const res = await fetch('/api/agent/verify', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sha256: st.sha256, version: st.version })
    });
    const j = await res.json();
    return !!j.ok;
  }catch{ return false; }
}

export async function bindAgentSession(memberId, jwt){
  const port = parseInt(localStorage.getItem('agentPort') || '4455', 10);
  try{
    await fetch(`http://127.0.0.1:${port}/bind-session`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ memberId, jwt })
    });
    return true;
  }catch{ return false; }
}

