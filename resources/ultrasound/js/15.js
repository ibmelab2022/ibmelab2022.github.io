/* ═══ 15 펄스-에코 방식 · 애니메이션 (v2 — 실제 파형·감쇠 표현) ═══

   시간표는 v1 과 동일:
     펄스 깊이 d_p(τ)=c·τ · 에코 탄생 τ=d/c · 에코 깊이 d_e(τ)=2d−c·τ · 도착 τ=2d/c
   v2 에서 바뀐 것:
   ① 펄스·에코를 막대 대신 파형(압축 빨강/희박 파랑)으로 그림
   ② 표적을 지날 때마다 진폭이 한 단계씩 줆(×T=0.82) — 반사가 떼어간 몫
   ③ 감쇠 exp(−µd) 를 왕복 내내 적용 — A-라인 막대 높이가 이 원장을 그대로 따름
   ★ 화면용 µ=0.03/cm(≈0.26 dB/cm)는 실제(5MHz, 2.5 dB/cm)의 약 1/10.
     실제 값이면 깊은 에코는 화면에서 보이지도 않습니다 — 그걸 살리는 게 22장 TGC. */

const C = 154000;               /* cm/s */
const DMAX_CM = 24;
const TARGETS = [3.2, 7.5, 12.4, 18.6];
const F0 = 5, NCYC = 2;
const SCREEN_PRP = 4.0;
const MU = 0.03, TRANS = 0.82, REFL = 0.30;   /* 화면용 감쇠·투과·반사 */
const prfS = document.getElementById("prf");

/* 진폭 원장: a↔b 구간을 지나는 동안의 감쇠 × (사이에 낀 표적들의 투과) */
function attn(a, b){
  const lo = Math.min(a,b), hi = Math.max(a,b);
  let A = Math.exp(-MU*(hi-lo));
  TARGETS.forEach(d => { if(d > lo && d < hi) A *= TRANS; });
  return A;
}
/* 에코 도착 진폭(왕복 대칭) — A-라인 정규화 기준 */
const ARR = {}; TARGETS.forEach(d => ARR[d] = attn(0,d)*REFL*attn(0,d));
const ARRMAX = Math.max(...Object.values(ARR));

/* 파형 하나 (압축 위/희박 아래) — amp 0~1 이 높이와 진하기를 함께 정함 */
function wavelet(ctx, W, xcm, mid, amp, X){
  const span = 0.75, sg = 0.20, pts = [];
  for(let u = -span; u <= span; u += 0.025){
    const e = Math.exp(-u*u/(2*sg*sg));
    pts.push([X(xcm+u), mid - e*Math.sin(2*Math.PI*u/0.42)*34*Math.min(1,amp)]);
  }
  ctx.save(); ctx.globalAlpha = 0.35 + 0.65*Math.min(1,amp);
  fillWave(ctx, W, mid, pts); ctx.restore();
}

const hero = makeScene("c1", 400, (ctx,W,H,t)=>{
  const prf = +prfS.value * 1000;
  const prp = 1/prf;
  const dmax = C*prp/2;
  const dur = NCYC/(F0*1e6);
  document.getElementById("prfv").textContent = (+prfS.value).toFixed(1);
  document.getElementById("prp").textContent  = (prp*1e6).toFixed(0);
  document.getElementById("dmax").textContent = dmax.toFixed(1);
  document.getElementById("duty").textContent = (dur/prp*100).toFixed(3);
  const folded = TARGETS.filter(d => 2*d/C >= prp);
  const fEl=document.getElementById("fold");
  fEl.textContent = folded.length ? `${folded.length}개 — 가짜 위치` : "없음 ✓";
  fEl.style.color = folded.length ? POS : SIGNAL_DK;

  const gT  = (t/SCREEN_PRP) * prp;
  const cyc = Math.floor(gT/prp);
  const tau = gT - cyc*prp;

  const txing = tau < dur*20;
  const st=document.getElementById("pstat");
  st.textContent = txing ? "송신 중" : "수신 중 (듣기)";
  st.style.color = txing ? POS : SIGNAL_DK;

  const L=52, R=18, PW=W-L-R, PX=PW/DMAX_CM;
  const X = d => L + d*PX;
  const yM=54, hM=118;
  const yA=228, hA=112;

  /* ══ 위: 트랜스듀서 + 조직 ══ */
  ctx.fillStyle="rgba(43,61,80,.04)"; ctx.fillRect(L,yM,PW,hM);
  const mid = yM+hM/2;
  ctx.fillStyle = txing ? POS : INK; ctx.fillRect(L-9, mid-26, 7, 52);
  chip(ctx, `트랜스듀서 — ${txing?"송신":"수신"}`, 6, yM-8, txing?POS:SIGNAL_DK, 10);

  /* 파형은 조직 띠 안에서만 보이도록 클립 */
  ctx.save(); ctx.beginPath(); ctx.rect(L,yM,PW,hM); ctx.clip();
  /* ① 나가는 펄스 — 표적을 지날 때마다 한 단계 옅어짐 */
  const dp = C*tau;
  let pulseA = 0;
  if(dp < DMAX_CM + 0.8){
    pulseA = attn(0, dp);
    wavelet(ctx, W, dp, mid, pulseA, X);
  }
  /* ② 에코 — 태어난 자리의 펄스 진폭 × R, 돌아오며 다시 감쇠·투과 */
  const echoes=[];
  for(let k=0;k<=2;k++){
    const tk = gT - (cyc-k)*prp;
    if(tk < 0) continue;
    TARGETS.forEach(d=>{
      if(tk < d/C || tk > 2*d/C) return;
      const de = 2*d - C*tk;
      const A  = attn(0,d)*REFL*attn(de,d);
      echoes.push({d, de, k, A});
    });
  }
  echoes.forEach(e=>{
    if(e.de < -0.8 || e.de > DMAX_CM) return;
    wavelet(ctx, W, e.de, mid, e.A/REFL*0.9, X);   /* 눈에 보이게 R 정규화 */
  });
  ctx.restore();

  /* 표적 + 화살표·라벨 (파형 위에) */
  TARGETS.forEach(d=>{
    ctx.beginPath(); ctx.arc(X(d), mid, 5, 0, 7); ctx.fillStyle=INK2; ctx.fill();
    ctx.textAlign="center"; chip(ctx,`${d}`, X(d), yM-8, INK2, 9, 400); ctx.textAlign="left";
  });
  if(dp < DMAX_CM){
    ray(ctx, X(dp)+10, mid-40, X(dp)+34, mid-40, POS, 1.8);
    chip(ctx, `펄스 ${Math.round(pulseA*100)}%`, X(dp)+8, mid-46, POS, 9.5);
  }
  echoes.forEach(e=>{
    if(e.de < 1.2 || e.de > DMAX_CM) return;
    const old = e.k > 0;
    ray(ctx, X(e.de)-10, mid+40, X(e.de)-32, mid+40, old?AMBER:SIGNAL_DK, 1.6);
    chip(ctx, old?`이전 펄스 에코 ${e.d}cm`:`에코 ${e.d}cm · ${Math.round(e.A*100)}%`,
         X(e.de)-32, mid+56, old?AMBER_DK:SIGNAL_DK, 9.5);
  });
  /* 최대 무모호 깊이 */
  if(dmax < DMAX_CM){
    ctx.strokeStyle=AMBER; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(X(dmax), yM-2); ctx.lineTo(X(dmax), yA+hA+4); ctx.stroke();
    ctx.textAlign="center";
    chip(ctx,`최대 무모호 ${dmax.toFixed(1)} cm`, Math.min(X(dmax), W-72), yM+hM+16, AMBER_DK, 10);
    ctx.textAlign="left";
  }

  /* ══ 아래: A-라인 — 막대 높이 = 도착 진폭 원장 ══ */
  ctx.fillStyle="rgba(43,61,80,.03)"; ctx.fillRect(L,yA,PW,hA);
  const base = yA+hA-14;
  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,base); ctx.lineTo(L+PW,base); ctx.stroke();
  TARGETS.forEach(d=>{
    const arr = 2*d/C;
    const app = (arr % prp) * C/2;
    const wrapped = arr >= prp;
    const shown = (arr % prp) <= tau;
    if(!shown) return;
    const hgt = (hA-30) * (0.10 + 0.90*ARR[d]/ARRMAX);
    ctx.strokeStyle = wrapped ? POS : SIGNAL_DK; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(X(app), base); ctx.lineTo(X(app), base-hgt); ctx.stroke();
    ctx.textAlign="center";
    chip(ctx, wrapped?`${d}cm 인데 여기에`:`${d}cm`, X(app), base-hgt-8, wrapped?POS:SIGNAL_DK, 9.5);
    ctx.textAlign="left";
  });
  const cur = C*tau/2;
  if(cur < DMAX_CM){
    ctx.strokeStyle="rgba(43,61,80,.45)"; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(X(cur), yA); ctx.lineTo(X(cur), base); ctx.stroke(); ctx.setLineDash([]);
    chip(ctx,"지금", X(cur)+5, yA+13, MUTED, 9.5, 400);
  }
  chip(ctx,"A-라인 · 도착 시각을 깊이로 — 깊을수록 작게 도착", 6, yA+14, INK, 11);

  /* 깊이 눈금 */
  const yR = yA+hA+26;
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,yR); ctx.lineTo(L+PW,yR); ctx.stroke();
  for(let d=0; d<=DMAX_CM; d+=4){
    ctx.beginPath(); ctx.moveTo(X(d),yR); ctx.lineTo(X(d),yR+6); ctx.stroke();
    ctx.textAlign="center"; label(ctx,`${d}`,X(d),yR+19,INK,10); ctx.textAlign="left";
  }
  label(ctx,"깊이 (cm)", L+PW-64, yR+19, MUTED, 9.5, 400);
  ctx.textAlign="right";
  chip(ctx, `τ = ${(tau*1e6).toFixed(0)} µs / PRP ${(prp*1e6).toFixed(0)} µs`, W-8, 20, INK, 10.5);
  ctx.textAlign="left";
}, {play:"play", speed:0.016, tStill:1.6});
prfS.oninput = hero.redraw;
