/* ═══ A2 합성 개구 영상 · 애니메이션 ═══
   검증: /home/claude/work/a2.js · a2b.js · a2c.js
     · 왕복 sinc² −6dB = 0.886 λF# (편도 1.207 보다 27% 좁음 — 17장 정정본 위)
     · DOF 수치해 9.0mm = 7.3 λF#² (5MHz·F#2) ↔ 교과서 7.1 λF#² · '왕복' 관례
     · STA SNR = 1/√Ne → 소자 100개면 −20 dB (Jensen 2006)
     · 가상음원 이득 +20log₁₀M · M=10 이면 집속 송신과 동점
     · 대가는 개구각이 아니라 음원 span = D − M·p (앞선 서술을 수치로 정정)
   ★ 근사 모델은 초점 부근서 20% 어긋나 폐기 — 개구 적분을 직접 하고 이분법으로 −6dB 를 찾는다 */
const C = 1540, F0 = 5e6;
const LAM = C/F0*1e3;                 /* mm */
const K = 2*Math.PI/LAM;
const FRX = 2;                        /* 동적 수신 F# 설정값 */
const NAP = 120;                      /* 개구 적분 표본 (400 과 오차 <1%) */

/* 고정 초점 송신 — 지연은 zf 에 맞춰 놓고 (X,z) 에서 본 진폭 */
function txAmp(X, z, zf, D){
  let re=0, im=0;
  for(let i=0;i<NAP;i++){
    const x = -D/2 + D*(i+0.5)/NAP;
    const ph = -K*(Math.hypot(X-x, z) - Math.hypot(x, zf));
    re += Math.cos(ph); im += Math.sin(ph);
  }
  return Math.hypot(re,im)/NAP;
}
/* 동적 집속 (송신이든 수신이든) — (0,z) 에 맞춘 뒤 Xs 의 산란체를 본 진폭 */
function dynAmp(Xs, z, D){
  let re=0, im=0;
  for(let i=0;i<NAP;i++){
    const x = -D/2 + D*(i+0.5)/NAP;
    const ph = K*(Math.hypot(Xs-x, z) - Math.hypot(x, z));
    re += Math.cos(ph); im += Math.sin(ph);
  }
  return Math.hypot(re,im)/NAP;
}
/* 주엽은 첫 널까지 단조감소 → 이분법으로 −6dB 반폭 */
function w6(fn){
  const p0 = fn(0); if(!(p0>0)) return NaN;
  let lo=0, hi=8;
  if(20*Math.log10(fn(hi)/p0) > -6) return NaN;
  for(let i=0;i<16;i++){ const m=(lo+hi)/2; (20*Math.log10(fn(m)/p0) > -6) ? lo=m : hi=m; }
  return lo+hi;
}
const Drx = (z,D) => Math.min(D, z/FRX);      /* 동적 개구 (F# 유지, D 가 상한) */

/* ── c1 : 소자 하나씩 쏘고 행렬을 채운다 (원리) ── */
const NE_VIS = 16;                     /* 그림용 소자 수 */
const APER_V = 20;                     /* mm */

const mat = makeScene("c1", 400, (ctx,W,H,t)=>{
  const TICK = 0.85;                     /* 그림용 — 실제는 초당 수천 회 */
  const tf = t*TICK, tickAll = Math.floor(tf), frac = tf - tickAll;
  const CYC = NE_VIS + 5;                /* 16번 송신 + '쓰는' 국면 5틱 */
  const k = tickAll % CYC;
  const filling = k < NE_VIS;            /* 채우는 중인가 */
  const txi = filling ? k : NE_VIS-1;
  const filled = filling ? txi*NE_VIS + Math.round(frac*NE_VIS) : NE_VIS*NE_VIS;
  document.getElementById("rtxi").textContent = filling ? `${txi+1} / ${NE_VIS}` : "완성";
  document.getElementById("rfill").textContent = Math.min(filled, NE_VIS*NE_VIS);
  document.getElementById("rtot").textContent = NE_VIS*NE_VIS;
  document.getElementById("rne").textContent = NE_VIS;

  const gap=14, LW=(W-gap-28)*0.44, RW=(W-gap-28)*0.56;
  const L0=14, L1=L0+LW+gap;

  /* ── 왼쪽: 배열 + 원통파 ── */
  const aT=54, aB=H-104, ay=aT+10, fH=aB-ay;
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(L0,aT,LW,aB-aT);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(L0,aT,LW,aB-aT);
  const ew = LW*0.92/NE_VIS, ex0 = L0+LW*0.04;
  const sx = ex0 + ew*(txi+0.5);
  if(filling){
    ctx.save(); ctx.beginPath(); ctx.rect(L0+1,aT+1,LW-2,aB-aT-2); ctx.clip();
    const r = frac*fH*1.5;
    for(let q=0;q<5;q++){
      const rr = r - q*16; if(rr<2) continue;
      ctx.strokeStyle=`rgba(179,18,60,${(0.6-q*0.11).toFixed(2)})`; ctx.lineWidth=q?1.6:2.8;
      ctx.beginPath(); ctx.arc(sx, ay+8, rr, 0, Math.PI); ctx.stroke();
    }
    ctx.restore();
  }
  for(let i=0;i<NE_VIS;i++){
    const x = ex0 + ew*i;
    ctx.fillStyle = (filling && i===txi) ? POS : "rgba(43,61,80,.30)";
    ctx.fillRect(x+1, ay, ew-2, 9);
  }
  if(filling && frac>0.5){
    const a=Math.min(1,(frac-0.5)/0.3);
    for(let j=0;j<NE_VIS;j+=2){
      const x = ex0 + ew*(j+0.5);
      ctx.strokeStyle=`rgba(14,143,151,${(0.7*a).toFixed(2)})`; ctx.lineWidth=1.8;
      ctx.beginPath(); ctx.moveTo(x, ay+32); ctx.lineTo(x, ay+12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x-3.5, ay+19); ctx.lineTo(x, ay+11); ctx.lineTo(x+3.5, ay+19); ctx.stroke();
    }
    ctx.textAlign="center"; chip(ctx,"16개 소자가 전부 받는다", L0+LW/2, ay+48, SIGNAL_DK, 10);
  }
  /* '쓰는' 국면: 점 P */
  if(!filling){
    const Px = L0+LW*0.58, Py = ay + fH*0.52;
    ctx.fillStyle=AMBER; ctx.beginPath(); ctx.arc(Px,Py,6,0,7); ctx.fill();
    ctx.strokeStyle=AMBER_DK; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(Px,Py,6,0,7); ctx.stroke();
    for(let i=0;i<NE_VIS;i+=3){
      const x = ex0 + ew*(i+0.5);
      ctx.strokeStyle="rgba(240,165,0,.42)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(x, ay+9); ctx.lineTo(Px, Py); ctx.stroke();
    }
    ctx.textAlign="center"; chip(ctx,"영상의 점 P", Px, Py-12, AMBER_DK, 10.5);
  }
  ctx.textAlign="left";
  chip(ctx, filling ? `소자 ${txi+1} 하나만 쏜다 — 원통파` : "행렬 완성 — 이제 아무 점이나",
       L0, aT-8, filling?POS:AMBER_DK, 10.5);

  /* ── 왼쪽 아래: 칸 하나의 속 — 에코 한 줄 ── */
  const zT=H-92, zH=64;
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(L0,zT,LW,zH);
  ctx.strokeStyle=LINE; ctx.strokeRect(L0,zT,LW,zH);
  const zb=zT+zH/2;
  const pts=[];
  for(let px=0;px<=LW;px++){
    const u=px/LW;
    let v=0;
    for(const [c0,a0] of [[0.22,0.9],[0.46,0.55],[0.71,0.35]]){
      const d=(u-c0)/0.026;
      v += a0*Math.exp(-d*d/2)*Math.cos(d*3.6);
    }
    pts.push([L0+px, zb - v*zH*0.34]);
  }
  fillWave(ctx, W, zb, pts);
  ctx.textAlign="left";
  chip(ctx, `칸 (i, j) 의 속 = 에코 한 줄`, L0, zT-8, INK, 10.5);
  chip(ctx, "깊이 →", L0+4, zT+zH-5, MUTED, 9, 400);
  if(!filling){
    /* 한 점만 뽑는다 */
    const tx = L0+LW*0.46;
    ctx.strokeStyle=AMBER_DK; ctx.lineWidth=2; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(tx,zT+3); ctx.lineTo(tx,zT+zH-3); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=AMBER; ctx.beginPath(); ctx.arc(tx, zb, 4.5, 0, 7); ctx.fill();
    ctx.textAlign="right"; chip(ctx, "τ(i,j,P) 시각의 값 하나", L0+LW-4, zT+14, AMBER_DK, 9.5);
  }

  /* ── 오른쪽: (송신 i, 수신 j) 행렬 ── */
  const mT=54, mS=Math.min((H-104-mT)/NE_VIS, RW/NE_VIS);
  const mx=L1+(RW-mS*NE_VIS)/2, my=mT;
  for(let i=0;i<NE_VIS;i++) for(let j=0;j<NE_VIS;j++){
    const done = !filling || (i<txi) || (i===txi && j < frac*NE_VIS);
    ctx.fillStyle = !filling ? "rgba(240,165,0,.34)"
                  : (done ? (i===txi ? "rgba(23,192,201,.75)" : "rgba(23,192,201,.30)")
                          : "rgba(238,243,247,.9)");
    ctx.fillRect(mx+j*mS+0.5, my+i*mS+0.5, mS-1, mS-1);
  }
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(mx, my, mS*NE_VIS, mS*NE_VIS);
  if(filling){
    ctx.strokeStyle=POS; ctx.lineWidth=2.2;
    ctx.strokeRect(mx-1.5, my+txi*mS-1.5, mS*NE_VIS+3, mS+3);
    /* 왼쪽 소자 → 이 줄 로 잇는 안내선 */
    ctx.strokeStyle="rgba(179,18,60,.45)"; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(sx, ay+9); ctx.lineTo(mx-8, my+txi*mS+mS/2); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="right";
    chip(ctx, `이 한 방이 ${txi+1}번째 줄을 채운다`, mx-10, my+txi*mS+mS/2+4, POS, 10);
  }
  ctx.textAlign="left";
  chip(ctx, "왕복 응답 행렬 · full matrix", L1, mT-8, INK, 10.5);
  ctx.textAlign="center";
  chip(ctx, "수신 소자 j  →", mx+mS*NE_VIS/2, my+mS*NE_VIS+16, MUTED, 9.5, 400);
  ctx.save(); ctx.translate(mx-12, my+mS*NE_VIS/2); ctx.rotate(-Math.PI/2);
  ctx.textAlign="center"; label(ctx,"←  송신 소자 i", 0, 0, MUTED, 9.5, 400); ctx.restore();
  ctx.textAlign="left";
  chip(ctx, "칸 하나 = 소자 i 가 쏘고 소자 j 가 받은 에코 한 줄", L1, my+mS*NE_VIS+34, MUTED, 9.5, 400);
  if(!filling){
    ctx.textAlign="center";
    chip(ctx, `${NE_VIS*NE_VIS} 칸 전부에서 한 점씩 뽑아 더하면`, mx+mS*NE_VIS/2, my+mS*NE_VIS/2-8, AMBER_DK, 11);
    chip(ctx, `→ 점 P 의 화소값 하나`, mx+mS*NE_VIS/2, my+mS*NE_VIS/2+12, AMBER_DK, 11);
  }
  ctx.textAlign="left";
  chip(ctx, `그림은 느리게 — 실제는 초당 수천 회`, L0, 24, MUTED, 9, 400);
  ctx.textAlign="right";
  chip(ctx, `${Math.min(filled,NE_VIS*NE_VIS)} / ${NE_VIS*NE_VIS} 칸`, W-14, 24, filling?SIGNAL_DK:AMBER_DK, 10.5);
  ctx.textAlign="left";
}, {play:"play", speed:0.03, tStill:14.5});


/* ── c2 : 깊이에 따른 왕복 측방향 분해능 ── */
const zfS = document.getElementById("zf"), apS = document.getElementById("ap");

const dep = makeScene("c2", 360, (ctx,W,H)=>{
  const zf = +zfS.value, D = +apS.value;
  document.getElementById("zfv").textContent = zf;
  document.getElementById("apv").textContent = D.toFixed(1);
  document.getElementById("rft").textContent = (zf/D).toFixed(2);

  const ZMIN=8, ZMAX=105, NZ=46;
  const conv=[], sa=[];
  for(let i=0;i<NZ;i++){
    const z = ZMIN + (ZMAX-ZMIN)*i/(NZ-1);
    const dr = Drx(z,D);
    conv.push([z, w6(X=> txAmp(X,z,zf,D)*dynAmp(X,z,dr))]);
    sa.push(  [z, w6(X=> dynAmp(X,z,dr)*dynAmp(X,z,dr))]);
  }
  /* 초점 심도 — 축상 송신 진폭이 왕복 −6dB (편도 0.707) 떨어지는 구간 */
  let pk=0, pz=zf;
  for(let z=ZMIN; z<ZMAX; z+=0.4){ const v=txAmp(0,z,zf,D); if(v>pk){pk=v; pz=z;} }
  let a=pz, b=pz;
  for(let z=pz; z>ZMIN; z-=0.4){ if(txAmp(0,z,zf,D)/pk < 0.7071){ a=z; break; } }
  for(let z=pz; z<ZMAX*1.6; z+=0.4){ if(txAmp(0,z,zf,D)/pk < 0.7071){ b=z; break; } }
  const DOF = b-a;
  document.getElementById("rdof").textContent = DOF.toFixed(1);

  const at = (arr,z)=>{ let best=arr[0]; for(const q of arr) if(Math.abs(q[0]-z)<Math.abs(best[0]-z)) best=q; return best[1]; };
  const cf = at(conv,zf), c8 = at(conv,80), s8 = at(sa,80);
  document.getElementById("rcf").textContent = isFinite(cf)? cf.toFixed(3) : "—";
  document.getElementById("rc8").textContent = isFinite(c8)? c8.toFixed(3) : "—";
  document.getElementById("rs8").textContent = isFinite(s8)? s8.toFixed(3) : "—";
  const st = document.getElementById("astat");
  st.textContent = `초점 심도 ${DOF.toFixed(0)}mm — 나머지 깊이는 수신만 집속`;
  st.style.color = AMBER_DK;

  const L=56, R=16, PW=W-L-R, T=18, B=H-34, PH=B-T;
  const WMAX = 2.6;                       /* 세로 고정 눈금 (mm) */
  const X = z => L + (z-ZMIN)/(ZMAX-ZMIN)*PW;
  const Y = w => B - Math.max(0,Math.min(1, w/WMAX))*PH;

  /* 눈금 */
  ctx.textAlign="right";
  for(let w=0; w<=WMAX; w+=0.5){
    ctx.strokeStyle = w===0 ? "rgba(217,224,231,.9)" : "rgba(238,243,247,.9)";
    ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(L,Y(w)); ctx.lineTo(L+PW,Y(w)); ctx.stroke();
    label(ctx, w.toFixed(1), L-7, Y(w)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-40,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"왕복 측방향 −6dB (mm)",-62,0,MUTED,9.5,400); ctx.restore();
  ctx.textAlign="center";
  [20,40,60,80,100].forEach(z=> label(ctx, `${z}`, X(z), B+14, MUTED, 9, 400));
  chip(ctx,"깊이 (mm) →", L+PW/2, B+28, MUTED, 9.5, 400);
  ctx.textAlign="left";

  /* 초점 심도 띠 */
  ctx.fillStyle="rgba(240,165,0,.13)"; ctx.fillRect(X(a), T, X(b)-X(a), B-T);
  ctx.strokeStyle="rgba(240,165,0,.55)"; ctx.lineWidth=1.2; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(X(zf),T); ctx.lineTo(X(zf),B); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="center";
  chip(ctx, `송신 초점 ${zf}mm`, X(zf), T+11, AMBER_DK, 10);
  chip(ctx, `DOF ${DOF.toFixed(0)}mm`, X((a+b)/2), B-8, AMBER_DK, 9.5);
  ctx.textAlign="left";

  /* 곡선 */
  const draw=(arr,col,lw)=>{ ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.beginPath();
    let started=false;
    arr.forEach(q=>{ if(!isFinite(q[1])) return; const px=X(q[0]), py=Y(q[1]);
      started?ctx.lineTo(px,py):(ctx.moveTo(px,py),started=true); });
    ctx.stroke(); };
  draw(sa, SIGNAL_DK, 2.4);
  draw(conv, POS, 2.4);

  /* 라벨 */
  const lz=97;
  ctx.textAlign="right";
  chip(ctx,"고정 송신 초점 + 동적 수신", X(lz), Y(at(conv,lz))-8, POS, 10);
  chip(ctx,"합성 개구 (왕복 동적)", X(lz), Y(at(sa,lz))+16, SIGNAL_DK, 10);
  ctx.textAlign="left";
  chip(ctx,`5 MHz · 개구 ${D.toFixed(1)}mm · 수신 F#${FRX}`, L+5, T+11, MUTED, 9.5, 400);
});
zfS.oninput = apS.oninput = dep.redraw;


/* ── c3 : 가상 음원 — SNR 을 되사는 법 ── */
const msS = document.getElementById("ms");
const DAP = 20, PITCH = 0.2;                 /* 개구 20mm · 소자 간격 0.2mm → 소자 100개 */
const NE = Math.round(DAP/PITCH);
const STA_LOSS = 20*Math.log10(1/Math.sqrt(NE));   /* −20 dB */
const ZF2 = 40, ZV = 3;                      /* 평가 깊이 · 가상 음원 후퇴 거리 */
const sinc = x => Math.abs(x)<1e-12 ? 1 : Math.sin(x)/x;

const vs = makeScene("c3", 360, (ctx,W,H)=>{
  const M = +msS.value;
  const span = DAP - M*PITCH;
  const gain = 20*Math.log10(M);
  const net = STA_LOSS + gain;
  const Ftx = span>0.2 ? ZF2/span : Infinity;
  const Frx = ZF2/DAP;
  const two = X => Math.abs(sinc(Math.PI*X/(LAM*Ftx))*sinc(Math.PI*X/(LAM*Frx)));
  let w2 = NaN;
  if(isFinite(Ftx)){ for(let X=0; X<8; X+=0.002){ if(20*Math.log10(two(X)) < -6){ w2 = 2*X; break; } } }
  const theta = Math.atan((M*PITCH/2)/ZV)*180/Math.PI;

  document.getElementById("msv").textContent = M;
  document.getElementById("rvg").textContent = gain.toFixed(1);
  const rn = document.getElementById("rnet");
  rn.textContent = (net>=0?"+":"") + net.toFixed(1);
  rn.style.color = net >= -1 ? SIGNAL_DK : (net > -10 ? AMBER_DK : POS);
  document.getElementById("rsp").textContent = span>0 ? span.toFixed(1) : "0";
  document.getElementById("rftx").textContent = isFinite(Ftx) ? Ftx.toFixed(2) : "∞";
  document.getElementById("rw2").textContent = isFinite(w2) ? w2.toFixed(3) : "—";
  const st = document.getElementById("vstat");
  st.textContent = span<=0.4 ? "음원이 하나뿐 — 합성 개구 소멸"
                 : net >= -1 ? `순 SNR ${net>=0?"+":""}${net.toFixed(1)} dB — 집속 송신과 대등`
                             : `아직 ${(-net).toFixed(1)} dB 부족`;
  st.style.color = span<=0.4 ? POS : (net>=-1 ? SIGNAL_DK : AMBER_DK);

  /* ── 위: 배열과 가상 음원 ── */
  const cx=W/2, ay=150, aw=Math.min(W-90, 420), sc=aw/DAP;
  ctx.textAlign="left";
  chip(ctx, `소자 ${NE}개 · 간격 ${PITCH}mm · 개구 ${DAP}mm`, 14, 22, MUTED, 9.5, 400);

  /* 배열 면 */
  ctx.fillStyle="rgba(43,61,80,.10)"; ctx.fillRect(cx-aw/2, ay, aw, 11);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(cx-aw/2, ay, aw, 11);
  for(let i=0;i<=NE;i+=2){
    const x = cx-aw/2 + i*PITCH*sc;
    ctx.strokeStyle="rgba(91,107,123,.28)"; ctx.beginPath(); ctx.moveTo(x,ay); ctx.lineTo(x,ay+11); ctx.stroke();
  }
  /* ── 활성 부개구(가운데) 하나 + 그 가상 음원 하나 ──
     예전엔 좌·중·우 3개를 동시에 그려 '개구가 3개'처럼 보였음(혼동).
     이제 활성 부개구 하나만 실선으로 그리고, 좌우 끝 위치는 얇은 점선 '이동 범위'로만 표시. */
  const half = span/2;
  const ww = M*PITCH*sc;
  /* 좌우 끝 = 부개구가 훑는 양 끝 위치 (점선 윤곽만 · 채움/음원 없음) */
  if(span>0.2){
    ctx.strokeStyle="rgba(240,165,0,.55)"; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    [-half, half].forEach(cxx=>{ const px=cx+cxx*sc;
      ctx.strokeRect(px-ww/2, ay, ww, 11); });
    ctx.setLineDash([]);
  }
  /* 활성 부개구 (가운데) */
  const px = cx;
  ctx.fillStyle="rgba(23,192,201,.55)"; ctx.fillRect(px-ww/2, ay, ww, 11);
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.6; ctx.strokeRect(px-ww/2, ay, ww, 11);
  /* 가상 음원 (배열 뒤) · y 하한을 둬서 위 라벨이 캔버스 밖으로 잘리지 않게 */
  const vy = Math.max(ay - ZV*sc*2.2, 48), ret = ay - vy;
  ctx.fillStyle=SIGNAL_DK; ctx.beginPath(); ctx.arc(px, vy, 5, 0, 7); ctx.fill();
  const th = Math.atan((M*PITCH/2)/ZV);
  for(let r=1;r<=4;r++){
    ctx.strokeStyle=`rgba(23,192,201,${(0.5-r*0.09).toFixed(2)})`; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.arc(px, vy, ret + (r-1)*28, Math.PI/2-th, Math.PI/2+th); ctx.stroke();
  }
  ctx.textAlign="center";
  chip(ctx, `가상 음원 하나 · 개구 반각 ±${theta.toFixed(0)}°`, px, vy-11, SIGNAL_DK, 10);
  ctx.textAlign="left";
  /* span 자 */
  const sy = ay+30;
  if(span>0.2){
    ctx.strokeStyle=AMBER; ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.moveTo(cx-half*sc, sy); ctx.lineTo(cx+half*sc, sy);
    ctx.moveTo(cx-half*sc, sy-5); ctx.lineTo(cx-half*sc, sy+5);
    ctx.moveTo(cx+half*sc, sy-5); ctx.lineTo(cx+half*sc, sy+5); ctx.stroke();
    ctx.textAlign="center";
    chip(ctx, `부개구가 훑는 범위 = D − M·p = ${span.toFixed(1)} mm · 각 위치가 가상 음원 하나`, cx, sy+18, AMBER_DK, 10);
  } else {
    ctx.textAlign="center"; chip(ctx, "음원 위치가 하나뿐 — 합성 개구 소멸", cx, sy+18, POS, 10.5);
  }
  ctx.textAlign="left";
  chip(ctx, `부개구 M = ${M} 소자`, cx-aw/2, ay-6, INK, 10.5);

  /* ── 아래: SNR 수지 막대 ── */
  const bT=228, bL=64, bW=W-bL-20, bH=17;
  const DBMIN=-24, DBMAX=+30;         /* M=64 에서 A3첩 막대 상단 +28 → 축 안에 들어오도록 확대 */
  const XD = db => bL + (db-DBMIN)/(DBMAX-DBMIN)*bW;
  ctx.fillStyle="rgba(238,243,247,.85)"; ctx.fillRect(bL, bT, bW, bH*3+16);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(bL, bT, bW, bH*3+16);
  /* 0 dB = 집속 송신 기준 */
  ctx.strokeStyle=INK2; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(XD(0), bT-4); ctx.lineTo(XD(0), bT+bH*3+16); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="center"; chip(ctx,"집속 송신 = 0 dB", XD(0), bT-8, INK2, 9.5); ctx.textAlign="left";

  const row=(i, db0, db1, col, txt)=>{
    const y = bT+6+i*bH;
    ctx.fillStyle=col; ctx.fillRect(XD(Math.min(db0,db1)), y, Math.abs(XD(db1)-XD(db0)), bH-5);
    label(ctx, txt, 8, y+bH-8, INK2, 9.5, 700);
  };
  row(0, 0, STA_LOSS, "rgba(179,18,60,.55)", "STA");
  row(1, STA_LOSS, STA_LOSS+gain, "rgba(23,192,201,.60)", "가상음원");
  row(2, STA_LOSS+gain, STA_LOSS+gain+12.0, "rgba(240,165,0,.45)", "A3 첩");
  ctx.textAlign="left";
  chip(ctx, `${STA_LOSS.toFixed(0)} dB`, XD(STA_LOSS)+4, bT+6+bH-8, POS, 9);
  chip(ctx, `+${gain.toFixed(1)} dB`, XD(STA_LOSS)+4, bT+6+2*bH-8, SIGNAL_DK, 9);
  chip(ctx, `+12.0 dB (→A3)`, XD(STA_LOSS+gain)+4, bT+6+3*bH-8, AMBER_DK, 9);
  /* 순 SNR 마커 */
  ctx.fillStyle = net>=-1?SIGNAL_DK:(net>-10?AMBER_DK:POS);
  ctx.beginPath(); ctx.moveTo(XD(net), bT+bH*3+16); ctx.lineTo(XD(net)-6, bT+bH*3+27);
  ctx.lineTo(XD(net)+6, bT+bH*3+27); ctx.closePath(); ctx.fill();
  ctx.textAlign="center";
  chip(ctx, `순 SNR ${net>=0?"+":""}${net.toFixed(1)} dB`, XD(net), bT+bH*3+40,
       net>=-1?SIGNAL_DK:(net>-10?AMBER_DK:POS), 10.5);
  ctx.textAlign="left";
  label(ctx, "SNR 수지 (집속 송신 대비)", 8, bT-8, MUTED, 9, 400);
});
msS.oninput = vs.redraw;
