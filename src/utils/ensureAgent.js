const BYPASS_KEY = 'airoom:bypass';
// ---- SPA 내비게이션 주입 훅 (없으면 폴백으로 full reload) ----
let _navigate = (path) => { window.location.href = path };
export function setNavigator(fn) {
  if (typeof fn === 'function') _navigate = fn;
}

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
  iframe.src = 'airoom://launch?from=web';
  document.body.appendChild(iframe);
  setTimeout(()=>iframe.remove(), 1500);
}

export function airoomBypassed() {
  // 개발/스테이징에서만 우회 허용 (운영은 기본 금지)
  const isDev = import.meta.env.DEV || import.meta.env.VITE_STAGE === '1';

  if (!isDev) {
    // 운영에서 강제로 우회하려면 명시적으로 환경변수로만 허용
    const prodBypass = import.meta.env.VITE_AIROOM_BYPASS === '1';
    console.info(`[AIROOM] PROD mode: ${prodBypass ? 'BYPASS' : 'ENFORCE'}`);
    return prodBypass;
  }

  // 개발/스테이징에서는 아래 3가지 통로로 우회 허용
  const q = new URLSearchParams(location.search);
  const viaOn  = q.get('airoom') === 'on'; // 개발에서 임시 강제
  const viaOff = q.get('airoom') === 'off';                // 예: http://.../?airoom=off
  const viaLS  = localStorage.getItem(BYPASS_KEY) === '1'; // 콘솔: localStorage.setItem('airoom:bypass','1')
  const viaEnv = import.meta.env.VITE_AIROOM_ENFORCE !== '1'; // .env.development에서 기본 우회 (원하면 끄기)
  const bypass = !viaOn && (viaOff || viaLS || viaEnv);
  console.info(`[AIROOM] DEV/STAGE mode: ${bypass ? 'BYPASS' : 'ENFORCE'}`);
  return bypass;
}

export async function ensureAgent(){
  if (airoomBypassed()) return true; 
  let { st, port } = await discoverAgent();
  if(!st){
    tryLaunchProtocol();
    await sleep(1500);
    ({ st, port } = await discoverAgent());
    if(!st) return false;
  }
  try{
    const res = await fetch('http://43.200.2.244:8080/api/agent/verify', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sha256: st.sha256, version: st.version }),
      credentials: 'include'
    });
    const j = await res.json();
    return !!j.ok;
  }catch{ return false; }
}

let hbTimer = null;
// 온라인 복귀 순간에 호출할 콜백을 옵션으로 받게 확장
export function startHeartbeat({ onAgentOnline } = {}){
  if (airoomBypassed()) return;
  if(hbTimer) return;
  let wasOnline = null;

  hbTimer = setInterval(async ()=>{
    // 혹시 다른 곳에서 포트 갱신했으면 최신값 반영
    const cached = parseInt(localStorage.getItem('agentPort') || String(agentPort) || '4455', 10);
    if (!Number.isNaN(cached) && cached !== agentPort) agentPort = cached;

    const st = await pingOnPort(agentPort);
    const online = !!st;

    // 최초 1회 상태 고정
    if (wasOnline === null) wasOnline = online;

    // 오프라인 → 온라인 전환 순간에 콜백 실행
    if (online && !wasOnline && typeof onAgentOnline === 'function') {
       try { await onAgentOnline({ st, port: agentPort }); } catch {}
    }

    if(!st){
      const next = encodeURIComponent(location.pathname + location.search);
      fetch('http://43.200.2.244:8080/api/agent/offline', {
        method: 'POST',
        credentials: 'include',     // 세션 쿠키(JSESSIONID) 포함
        // body 없음: 프리플라이트 줄이고, 세션만 맞춰서 빠르게 플래그 제거
      }).finally(() => {
        _navigate('/agent-required?next=' + next);
      });
    }
    wasOnline = online;
  }, 3000);
}

export function bindActiveTabWatermark(){
  if (airoomBypassed()) return;
  let lastActive = null;
  let lastSentAt = 0;
  let pingTimer  = null;

  async function postActive(active, reason){
    const now = Date.now();
    if (active === lastActive && now - lastSentAt < 1500) return; // 1.5s 이내 동일 값이면 무시
    lastActive = active; lastSentAt = now;

    try{
      const hit = await discoverAgent();        // 최신 포트 보장
      if (!hit.st) return;
      await fetch(`http://127.0.0.1:${hit.port}/activate-watermark`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ active }),
        keepalive: true,
      });
    }catch{}
  }

  const sync = ()=>postActive(!document.hidden, 'sync');
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('focus',  ()=>postActive(true,  'focus'));
  window.addEventListener('blur',   ()=>postActive(false, 'blur'));
  window.addEventListener('pagehide', ()=>postActive(false, 'pagehide')); // iOS/Safari 대비
  
  // 활성 상태일 때 3초마다 keepalive(서버가 스테일로 간주하지 않도록)
  if (!pingTimer) {
    pingTimer = setInterval(() => {
      const activeNow = !document.hidden && document.hasFocus?.() !== false;
      postActive(activeNow, 'tick');
    }, 3000);
    // 탭이 완전히 내려갈 때 타이머 정리
    window.addEventListener('pagehide', () => { try{ clearInterval(pingTimer); }catch{} });
  }
  sync();
}


export async function checkAgentOnly(){
  if (airoomBypassed()) return true;
  let { st } = await discoverAgent();
  if(!st) return false;
  try{
    const res = await fetch('http://43.200.2.244:8080/api/agent/verify', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sha256: st.sha256, version: st.version }),
      credentials: 'include'
    });
    const j = await res.json();
    return !!j.ok;
  }catch{ return false; }
}

export async function bindAgentSession(memberId, jwt){
  if (airoomBypassed()) return true;
  // 항상 최신 에이전트 포트를 찾아서 사용
  const hit = await discoverAgent();
  if (!hit.st) return false;
  const url  = `http://127.0.0.1:${hit.port}/bind-session`;
  const payload = JSON.stringify({ memberId, jwt });

  try {
    // keepalive: 페이지 이동 와중에도 전송 지속
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: payload,
      keepalive: true,
      mode: 'cors'
    });
    return res.ok;
  } catch (e) {
    // 폴백: sendBeacon (응답은 못 읽지만 전송 시도)
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon?.(url, blob);
    } catch {}
    return false;
  }
}

// 에이전트가 온라인일 때 1회성으로 FE-활성 신호를 보냄
export async function postWatermarkActiveOnce(active){
  if (airoomBypassed()) return;
  try{
    // 최신 포트 확보
    let st = await pingOnPort(agentPort, 200);
    if(!st){
      // 혹시 포트가 달라졌으면 재탐색
      const candidates = [];
      for (let p=4455; p<=4460; p++) if (p !== agentPort) candidates.push(p);
      const hit = await scanPortsParallel(candidates, 200);
      if (hit?.st) { agentPort = hit.port; localStorage.setItem('agentPort', String(agentPort)); }
    }
    await fetch(`http://127.0.0.1:${agentPort}/activate-watermark`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ active }),
      keepalive: true,
    });
  }catch{}
}

