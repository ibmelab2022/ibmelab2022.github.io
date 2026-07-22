/* ═══ A1 평면파 영상과 결맞음 합성 · 애니메이션 ═══
   검증: /home/claude/work/a1.js · a1b.js · a1c.js
     · 집속 지연 범위 (D=20, z_f=40): (√((D/2)²+z_f²) − z_f)/c = 1.231mm/1540 = 0.799 µs
     · 조향 10° 지연 범위 = D·sin10°/c = 3.472mm/1540 = 2.255 µs
     · 조명 폭: 집속 1.207λF# = 0.744mm  vs  평면파 = 개구 20mm → 27배
     · 깊이 5cm → 왕복 64.9µs → 최대 송신 15,400/s → 128라인 120 fps / 평면파 15,400 fps
     · 합성 송신 H(Δx) = (1/N)Σ exp(jkΔx sinα_i) ← 배열 인자와 같은 꼴
     · 격자엽 Δx_g = λ/sinΔα (측정 8.86 ↔ 예측 8.83mm · 11각도·±10°)
     · 광대역: 빔포머는 t=0 에 샘플 → 지연 τ_i 에 가우시안 가중 → 11각도 격자엽 CW 0dB → 2사이클 −14.3dB
   ★ 캔버스 c1 의 음장은 가로세로 같은 배율(uniform scale)로 그립니다 — 파면이 일그러지면 안 되니까. */
const C = 1540, FRQ = 5e6;
const LAM = C/FRQ*1e3;                 /* mm */
const APER = 20, ZFOC = 40, ASTEER = 10*Math.PI/180;   /* mm, mm, rad */
const NEL = 32;                        /* 그림용 소자 수 */
const NLINE = 128;

/* ── c1 : 지연이 파면을 정한다 (원리) ── */
let mode = 0;                          /* 0 집속 · 1 평면파 · 2 조향 */
const MODES = ["집속", "평면파", "조향"];
const modeBtn = document.getElementById("mode");

const DMAX = Math.hypot(APER/2, ZFOC);
/* 발사 시각 (s) — x 는 mm */
function fireT(x){
  if(mode===0) return (DMAX - Math.hypot(x, ZFOC))/1000/C;
  if(mode===1) return 0;
  return (x + APER/2)*Math.sin(ASTEER)/1000/C;
}
const TFOC = DMAX/1000/C;              /* 집속 파면이 초점에 닿는 시각 */

const prin = makeScene("c1", 400, (ctx,W,H,t)=>{
  const tus = (t*7) % 42;              /* 0~42 µs 반복 */
  const tt = tus*1e-6;                 /* s */
  const d = C*tt*1000;                 /* 파면이 간 거리 (mm) */

  /* 지연 범위 */
  let tmin=1e9, tmax=-1e9;
  for(let i=0;i<NEL;i++){ const x=-APER/2+APER*(i+0.5)/NEL, v=fireT(x);
    tmin=Math.min(tmin,v); tmax=Math.max(tmax,v); }
  const span = (tmax-tmin)*1e6;
  const illum = mode===0 ? 1.207*LAM*(ZFOC/APER) : APER;
  document.getElementById("rdel").textContent = span.toFixed(3);
  document.getElementById("rill").textContent = illum.toFixed(2);
  document.getElementById("rtx1").textContent = mode===0 ? NLINE : 1;
  const sh = document.getElementById("rsh");
  sh.textContent = ["오목 — 한 점으로","평평 — 전체","기울어짐 — 전체"][mode];
  sh.style.color = mode===0 ? POS : SIGNAL_DK;

  /* ── 위: 지연 막대 ── */
  const bT=26, bB=82, ay=88, aH=8;
  /* 같은 배율(uniform)로 그리려면 세로가 제약 — 시야를 가운데 정렬 */
  const fT = ay+aH, fB = H-14;
  const DEPTH = 44, WIDE = 32;
  const sc = Math.min((fB-fT)/DEPTH, (W-120)/WIDE);
  const cx = W/2;
  const X = mm => cx + mm*sc;
  const Y = mm => fT + mm*sc;

  const tref = Math.max(tmax, 1e-9);
  for(let i=0;i<NEL;i++){
    const x = -APER/2 + APER*(i+0.5)/NEL;
    const h = (fireT(x)-tmin)/(tref-tmin||1)*(bB-bT);
    ctx.fillStyle = "rgba(240,165,0,.62)";
    ctx.fillRect(X(x)-APER*sc/NEL*0.36, bB-h, APER*sc/NEL*0.72, Math.max(h,1.2));
  }
  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(X(-APER/2),bB); ctx.lineTo(X(APER/2),bB); ctx.stroke();
  ctx.textAlign="left";
  chip(ctx, `소자별 발사 시각 · 지연 범위 ${span.toFixed(3)} µs`, 14, bT+4, AMBER_DK, 10.5);
  chip(ctx, ["곡선 (가장자리 먼저)","전부 0 — 동시","선형 램프"][mode], 14, bT+22, MUTED, 9.5, 400);

  /* 배열 */
  ctx.fillStyle=INK; ctx.fillRect(X(-APER/2), ay, APER*sc, aH);

  /* ── 아래: 조직 + 조명 영역 + 파면 ── */
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(X(-WIDE/2), fT, WIDE*sc, DEPTH*sc);
  ctx.strokeStyle=LINE; ctx.strokeRect(X(-WIDE/2), fT, WIDE*sc, DEPTH*sc);

  /* 조명 영역 */
  ctx.save(); ctx.beginPath(); ctx.rect(X(-WIDE/2), fT, WIDE*sc, DEPTH*sc); ctx.clip();
  ctx.fillStyle="rgba(23,192,201,.16)";
  if(mode===0){
    const wf = 1.207*LAM*(ZFOC/APER);
    ctx.beginPath();
    for(let z=0;z<=DEPTH;z+=0.5) ctx.lineTo(X(-Math.hypot(APER/2*(1-z/ZFOC), wf/2)), Y(z));
    for(let z=DEPTH;z>=0;z-=0.5) ctx.lineTo(X( Math.hypot(APER/2*(1-z/ZFOC), wf/2)), Y(z));
    ctx.closePath(); ctx.fill();
  } else {
    const sh2 = mode===2 ? Math.tan(ASTEER) : 0;
    ctx.beginPath();
    ctx.moveTo(X(-APER/2), Y(0)); ctx.lineTo(X(-APER/2+DEPTH*sh2), Y(DEPTH));
    ctx.lineTo(X(APER/2+DEPTH*sh2), Y(DEPTH)); ctx.lineTo(X(APER/2), Y(0));
    ctx.closePath(); ctx.fill();
  }
  /* Huygens 잔물결 */
  ctx.strokeStyle="rgba(43,61,80,.20)"; ctx.lineWidth=1;
  for(let i=0;i<NEL;i+=3){
    const x=-APER/2+APER*(i+0.5)/NEL, r=(tt-fireT(x))*C*1000;
    if(r>0.3) { ctx.beginPath(); ctx.arc(X(x), Y(0), r*sc, 0, Math.PI); ctx.stroke(); }
  }
  /* 파면 (포락선) */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.8;
  if(mode===0){
    const R = Math.abs((TFOC-tt)*C*1000);
    if(R>0.2 && R<DEPTH*1.6){
      const th = Math.min(Math.asin(Math.min(1,(APER/2)/Math.max(R,APER/2))), Math.PI/2);
      ctx.beginPath();
      ctx.arc(X(0), Y(ZFOC), R*sc, (tt<TFOC? -Math.PI/2-th : Math.PI/2-th), (tt<TFOC? -Math.PI/2+th : Math.PI/2+th));
      ctx.stroke();
    }
  } else {
    const a = mode===2 ? ASTEER : 0;
    const off = mode===2 ? (APER/2)*Math.sin(a) : 0;
    const rhs = d - off;
    ctx.beginPath();
    let started=false;
    for(let xx=-WIDE/2; xx<=WIDE/2; xx+=0.4){
      const yy = (rhs - xx*Math.sin(a))/Math.cos(a);
      if(yy<0 || yy>DEPTH){ started=false; continue; }
      started ? ctx.lineTo(X(xx),Y(yy)) : (ctx.moveTo(X(xx),Y(yy)), started=true);
    }
    ctx.stroke();
  }
  ctx.restore();

  /* 라벨 */
  ctx.textAlign="left";
  chip(ctx, `${MODES[mode]} · t = ${tus.toFixed(1)} µs`, 14, fT+16, INK, 11);
  chip(ctx, `조명 폭 ${illum.toFixed(2)} mm`, 14, fT+34, SIGNAL_DK, 10);
  chip(ctx, `프레임당 송신 ${mode===0?NLINE:1} 회`, 14, fT+52, mode===0?POS:SIGNAL_DK, 10);
  if(mode===0){
    ctx.fillStyle=POS; ctx.beginPath(); ctx.arc(X(0), Y(ZFOC), 4, 0, 7); ctx.fill();
    ctx.textAlign="left"; chip(ctx, "초점", X(0)+8, Y(ZFOC)+4, POS, 9.5);
  }
  ctx.textAlign="right";
  chip(ctx, "얇은 원 = Huygens 잔물결", W-14, fT+16, MUTED, 9.5, 400);
  chip(ctx, "굵은 선 = 파면 (포락선)", W-14, fT+34, SIGNAL_DK, 9.5, 400);
  chip(ctx, `개구 ${APER}mm · 초점 ${ZFOC}mm`, W-14, bT+4, MUTED, 9.5, 400);
  ctx.textAlign="left";
}, {play:"play", speed:0.03, tStill:2.6});
modeBtn.onclick = ()=>{ mode=(mode+1)%3; modeBtn.textContent=MODES[mode];
                        modeBtn.classList.toggle("on", mode>0); prin.redraw(); };


/* ── c2 : 같은 시간에 몇 프레임을 만드나 ── */
const dpS = document.getElementById("dp"), naS = document.getElementById("na");

const fr = makeScene("c2", 360, (ctx,W,H,t)=>{
  const dcm = +dpS.value, N = +naS.value;
  const PRT = 2*(dcm/100)/C, maxTx = 1/PRT;
  const fpsLine = maxTx/NLINE, fpsPW = maxTx/N;
  document.getElementById("dpv").textContent = dcm.toFixed(1);
  document.getElementById("nav").textContent = N;
  document.getElementById("rprt").textContent = (PRT*1e6).toFixed(1);
  document.getElementById("rtx").textContent  = Math.round(maxTx).toLocaleString();
  document.getElementById("rline").textContent = fpsLine.toFixed(0);
  document.getElementById("rpw").textContent   = Math.round(fpsPW).toLocaleString();
  document.getElementById("rgain").textContent = (fpsPW/fpsLine).toFixed(0);

  /* ★ 애니메이션을 실제 송신률에 묶지 않습니다.
     실제는 초당 15,400회라 어떤 화면에서도 에일리어싱이 납니다.
     그림은 '조향이 보이는' 속도로만 돌리고, 물리(프레임률 비)는 아래 카운터와 막대가 정직하게 냅니다. */
  const angPer = 2.3;                      /* 각도 하나를 보여주는 시간 (초 비례) · 2배 느리게 — 각도 변화가 눈에 보이도록 */
  const af = t/angPer, angIdx = Math.floor(af) % N, frac = af - Math.floor(af);
  const SWRATE = 30;                                  /* 라인 빔이 훑는 속도 (t당 라인 수) — 한 번 훑는 데 ~2.4초 */
  const lineIdx = Math.floor(t*SWRATE) % NLINE;
  /* 완성 프레임 카운터를 '보이는' 라인 스캔에 묶는다 (실제 초당 수천 프레임은 눈이 못 따라감).
     라인 빔이 한 번 다 훑으면 = B-mode 한 프레임 → 왼쪽 +1.
     평면파는 한 프레임에 N번만 송신하므로, 같은 시간에 NLINE/N 배 많은 프레임 → 오른쪽은 그만큼 껑충 올라간다.
     (정확한 fps 값은 아래 막대·판독이 낸다. 카운터는 '한 프레임 쌓는 동안 몇 배냐'를 읽히는 속도로 보여줌.) */
  const sweeps = Math.floor(t*SWRATE / NLINE);        /* 완성된 라인 스캔 프레임 수 */
  const ratio  = Math.max(1, Math.round(NLINE/N));    /* 평면파 프레임률 이득 = NLINE/N (각도 N 을 늘리면 줄어듦) */
  const frameL = sweeps, frameR = sweeps*ratio;
  const gap=10, half=(W-gap)/2 - 8, L0=8, L1=L0+half+gap+8;
  const top=44, bot=H-84, dh=bot-top;

  function panel(x0, title, sub, col){
    ctx.fillStyle="#fbfcfe"; ctx.fillRect(x0, top, half, dh);
    ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(x0, top, half, dh);
    ctx.fillStyle=INK; ctx.fillRect(x0, top-13, half, 11);
    ctx.textAlign="left";  chip(ctx, title, x0, top-20, col, 11);
    ctx.textAlign="right"; chip(ctx, sub,  x0+half, top-20, MUTED, 9.5, 400);
    ctx.textAlign="left";
  }
  panel(L0, "한 줄씩 · line-by-line", `${NLINE} 라인`, NEG);
  for(let i=0;i<NLINE;i+=2){
    const x = L0 + (i+0.5)/NLINE*half;
    ctx.strokeStyle = i<=lineIdx ? "rgba(27,79,160,.20)" : "rgba(217,224,231,.55)";
    ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,top+2); ctx.lineTo(x,bot-2); ctx.stroke();
  }
  const xl = L0 + (lineIdx+0.5)/NLINE*half;
  const g1 = ctx.createLinearGradient(0,top,0,bot);
  g1.addColorStop(0,"rgba(27,79,160,.55)"); g1.addColorStop(1,"rgba(27,79,160,.05)");
  ctx.fillStyle=g1; ctx.fillRect(xl-3, top+2, 6, dh-4);
  ctx.strokeStyle=NEG; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(xl,top+2); ctx.lineTo(xl,bot-2); ctx.stroke();
  ctx.textAlign="left"; chip(ctx, `라인 ${lineIdx+1} / ${NLINE}`, L0+5, bot-8, NEG, 10);

  panel(L1, "평면파 · plane wave", `${N} 각도 합성`, SIGNAL_DK);
  const amax = 10*Math.PI/180;
  const ang = N===1 ? 0 : -amax + 2*amax*angIdx/(N-1);
  /* 파면이 천천히 훑어 내려간다 — 조향각이 눈에 보이게 (에일리어싱 없음) */
  /* 조향빔은 파면에 '수직'인 방향(빔 방향)으로 전파한다 — 아래로만 쓸면 파면 기울기와 어긋난다.
     θ = 조향각(연직 기준). 빔 방향 d=(sinθ,cosθ), 파면 방향 w=(−cosθ,sinθ) (d에 수직). */
  const sx = Math.sin(ang), sy = Math.cos(ang);     /* d : 전파 방향 */
  const wx = -Math.cos(ang), wy = Math.sin(ang);    /* w : 파면을 따라가는 방향 */
  const Ax = L1 + half/2, Ay = top;                 /* 배열(송신면) 중앙 */
  const maxP = dh*1.28, p = frac*maxP;              /* 파면이 나아간 수직 거리 */
  const SPC = 20, BIG = half*1.7;
  ctx.save(); ctx.beginPath(); ctx.rect(L1+1, top+1, half-2, dh-2); ctx.clip();
  /* 지나간(조명된) 영역 — 선두 파면의 '뒤쪽'(빔 방향 반대) */
  const Lx = Ax + p*sx, Ly = Ay + p*sy;
  ctx.fillStyle="rgba(23,192,201,.09)";
  ctx.beginPath();
  ctx.moveTo(Lx + BIG*wx, Ly + BIG*wy);
  ctx.lineTo(Lx - BIG*wx, Ly - BIG*wy);
  ctx.lineTo(Lx - BIG*wx - BIG*sx, Ly - BIG*wy - BIG*sy);
  ctx.lineTo(Lx + BIG*wx - BIG*sx, Ly + BIG*wy - BIG*sy);
  ctx.closePath(); ctx.fill();
  /* 파면들 — 빔 방향으로 SPC 간격, 각 선은 w 방향으로 그림(파면은 d에 수직) */
  for(let k=0;k<7;k++){
    const pk = p - k*SPC;
    if(pk < -SPC || pk > maxP+SPC) continue;
    const Px = Ax + pk*sx, Py = Ay + pk*sy;
    ctx.strokeStyle=`rgba(23,192,201,${(0.78-k*0.11).toFixed(3)})`; ctx.lineWidth = k?1.8:3;
    ctx.beginPath();
    ctx.moveTo(Px + BIG*wx, Py + BIG*wy);
    ctx.lineTo(Px - BIG*wx, Py - BIG*wy);
    ctx.stroke();
  }
  ctx.restore();
  ctx.textAlign="left";
  chip(ctx, N===1 ? "각도 0° · 한 방" : `각도 ${(ang*180/Math.PI).toFixed(1)}° · ${angIdx+1}/${N}`,
       L1+5, bot-8, SIGNAL_DK, 10);

  const cy = bot+26;
  ctx.textAlign="center";
  chip(ctx, `완성 프레임  ${frameL}`, L0+half/2, cy, NEG, 13);
  chip(ctx, `완성 프레임  ${frameR}`, L1+half/2 - 30, cy, SIGNAL_DK, 13);
  ctx.textAlign="left"; label(ctx, `= ${frameL} × ${ratio}`, L1+half/2 + 34, cy+1, MUTED, 9.5, 400);
  ctx.textAlign="left";

  const by=bot+42, bw=W-24, bx=12, bh=13;
  const lo=Math.log10(10), hi=Math.log10(30000);
  const XB = v => bx + (Math.log10(Math.max(v,10))-lo)/(hi-lo)*bw;
  ctx.fillStyle="rgba(238,243,247,.9)"; ctx.fillRect(bx,by,bw,bh);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(bx,by,bw,bh);
  ctx.fillStyle=NEG; ctx.fillRect(bx, by, XB(fpsLine)-bx, bh);
  ctx.fillStyle="rgba(23,192,201,.55)"; ctx.fillRect(XB(fpsLine), by, XB(fpsPW)-XB(fpsLine), bh);
  [10,100,1000,10000].forEach(v=>{
    ctx.strokeStyle="rgba(91,107,123,.35)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(XB(v),by); ctx.lineTo(XB(v),by+bh); ctx.stroke();
    ctx.textAlign="center"; label(ctx, `${v}`, XB(v), by+bh+13, MUTED, 8.5, 400);
  });
  ctx.textAlign="left";  chip(ctx, `${fpsLine.toFixed(0)} fps`, bx+4, by+10, "#fff", 9.5);
  ctx.textAlign="right"; chip(ctx, `${Math.round(fpsPW).toLocaleString()} fps · ×${(fpsPW/fpsLine).toFixed(0)}`,
                              XB(fpsPW)-4, by+10, SIGNAL_DK, 9.5);
  ctx.textAlign="left";  label(ctx, "프레임률 (fps, 로그)", bx, by-4, MUTED, 9, 400);
}, {play:"play2", speed:0.03, tStill:1.9});
dpS.oninput = naS.oninput = fr.redraw;


/* ── c3 : 합성 송신 빔 패턴 (광대역) ── */
const n2S = document.getElementById("n2"), amS = document.getElementById("am");
const NCYC = 2, SIG_T = NCYC/(2.3548*FRQ);
const angles = (N, amaxDeg) => {
  const am = amaxDeg*Math.PI/180;
  return N===1 ? [0] : Array.from({length:N}, (_,i)=> -am + 2*am*i/(N-1));
};
function Hbb(dxMM, angs){
  let re=0, im=0;
  for(const a of angs){
    const tau = (dxMM*1e-3)*Math.sin(a)/C;
    const w = Math.exp(-(tau*tau)/(2*SIG_T*SIG_T));
    re += w*Math.cos(2*Math.PI*FRQ*tau);
    im -= w*Math.sin(2*Math.PI*FRQ*tau);
  }
  return Math.hypot(re,im)/angs.length;
}
const cmp = makeScene("c3", 340, (ctx,W,H)=>{
  const N = +n2S.value, amax = +amS.value;
  const angs = angles(N, amax);
  const Fn = 1/(2*Math.sin(amax*Math.PI/180));
  const dA = N>1 ? (2*amax/(N-1))*Math.PI/180 : 0;
  const xg = N>1 ? LAM/Math.sin(dA) : Infinity;
  document.getElementById("n2v").textContent = N;
  document.getElementById("amv").textContent = amax.toFixed(1);
  document.getElementById("rfn").textContent = Fn.toFixed(2);
  const SPAN = 20;
  let w6 = 0;
  for(let dx=0; dx<SPAN; dx+=0.004){ if(20*Math.log10(Hbb(dx,angs)) < -6){ w6 = 2*dx; break; } }
  document.getElementById("rw6").textContent = w6 ? w6.toFixed(3) : "평탄";
  const inView = isFinite(xg) && xg < SPAN;
  const glDb = inView ? 20*Math.log10(Hbb(xg,angs)) : NaN;
  document.getElementById("rgx").textContent = N===1 ? "—" : (inView ? xg.toFixed(1) : "시야 밖");
  document.getElementById("rgl").textContent = inView ? glDb.toFixed(1) : "—";
  const fps5 = (1/(2*0.05/C))/N;
  document.getElementById("rfps").textContent = Math.round(fps5).toLocaleString();
  const st = document.getElementById("cstat");
  st.textContent = N===1 ? "각도 1개 — 송신 집속이 0 (완전 평탄)"
                 : inView ? `격자엽이 ${xg.toFixed(1)} mm 안쪽 — 영상을 더럽힘`
                          : "격자엽이 시야 밖으로 밀려남";
  st.style.color = N===1 ? POS : (inView ? AMBER_DK : SIGNAL_DK);

  const L=54, R=16, PW=W-L-R, T=18, B=H-34, PH=B-T, DR=40;
  const X = mm => L + (mm/SPAN/2 + 0.5)*PW;
  const Y = db => T + Math.max(0, Math.min(1, -db/DR))*PH;
  ctx.textAlign="right";
  for(let d=0; d>=-DR; d-=10){
    ctx.strokeStyle = d===0 ? "rgba(217,224,231,.9)" : "rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y(d)); ctx.lineTo(L+PW,Y(d)); ctx.stroke();
    label(ctx, `${d}`, L-7, Y(d)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-38,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"합성 송신 (dB)",-42,0,MUTED,9.5,400); ctx.restore();
  ctx.textAlign="center";
  [-20,-10,0,10,20].forEach(v=> label(ctx, `${v}`, X(v), B+14, MUTED, 9, 400));
  chip(ctx,"측방향 위치 Δx (mm) →", L+PW/2, B+28, MUTED, 9.5, 400);
  ctx.textAlign="left";
  ctx.strokeStyle="rgba(240,165,0,.55)"; ctx.setLineDash([5,4]); ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,Y(-6)); ctx.lineTo(L+PW,Y(-6)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; chip(ctx,"−6 dB", L+PW-2, Y(-6)-5, AMBER_DK, 9); ctx.textAlign="left";
  const col = N===1 ? POS : SIGNAL_DK;
  const path=new Path2D(); path.moveTo(L, Y(-DR));
  for(let px=0; px<=PW; px++){
    const mm = (px/PW - 0.5)*SPAN*2;
    path.lineTo(L+px, Y(20*Math.log10(Math.max(Hbb(mm,angs),1e-6))));
  }
  path.lineTo(L+PW, Y(-DR)); path.closePath();
  ctx.fillStyle = N===1 ? "rgba(179,18,60,.10)" : "rgba(23,192,201,.10)"; ctx.fill(path);
  ctx.strokeStyle=col; ctx.lineWidth=2.2; ctx.beginPath();
  for(let px=0; px<=PW; px++){
    const mm = (px/PW - 0.5)*SPAN*2;
    const y = Y(20*Math.log10(Math.max(Hbb(mm,angs),1e-6)));
    px?ctx.lineTo(L+px,y):ctx.moveTo(L+px,y);
  }
  ctx.stroke();
  if(inView && glDb > -DR){
    [-1,1].forEach(s=>{
      const gx = X(s*xg);
      ctx.strokeStyle=POS; ctx.lineWidth=1.4; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(gx, Y(glDb)); ctx.lineTo(gx, B); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle=POS; ctx.beginPath(); ctx.arc(gx, Y(glDb), 4.5, 0, 7); ctx.fill();
    });
    ctx.textAlign="center";
    chip(ctx, `격자엽 λ/sinΔα = ${xg.toFixed(1)} mm · ${glDb.toFixed(0)} dB`, X(xg), Y(glDb)-11, POS, 10);
  }
  ctx.textAlign="left";
  chip(ctx, N===1 ? "송신 집속 없음 — 수신 빔포밍만 남음" : `${N} 각도 · Δα = ${(dA*180/Math.PI).toFixed(2)}°`,
       L+5, T+11, N===1?POS:INK, 10.5);
  ctx.textAlign="right";
  chip(ctx, `5 MHz · 2사이클 · 유효 F# ${Fn.toFixed(2)}`, L+PW-2, T+11, MUTED, 9.5, 400);
  ctx.textAlign="left";
});
n2S.oninput = amS.oninput = cmp.redraw;
