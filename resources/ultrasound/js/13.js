/* ═══ 13 빔 집속 · 애니메이션 ═══ */

/* ★ core.js 버전 가드 — 이 검사만은 core.js 에 의존하면 안 됩니다.
   옛 core.js 면 makeCW 가 없어 스크립트가 조용히 죽고 캔버스가 빕니다.
   그래서 여기서 직접 캔버스에 안내를 찍습니다. */
if (typeof makeCW !== "function") {
  document.querySelectorAll("canvas").forEach(c => {
    const g = c.getContext("2d"); if (!g) return;
    g.fillStyle = "#FFF5F7"; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "#B3123C"; g.lineWidth = 2; g.strokeRect(1, 1, c.width-2, c.height-2);
    g.fillStyle = "#B3123C"; g.font = "700 17px system-ui,sans-serif";
    g.fillText("assets/core.js 가 옛 버전입니다", 24, 44);
    g.fillStyle = "#2b3d50"; g.font = "400 14px system-ui,sans-serif";
    g.fillText("① 최신 assets/core.js 로 덮어쓰기", 24, 76);
    g.fillText("② 브라우저에서 Ctrl+Shift+R (맥: Cmd+Shift+R) 로 강력 새로고침", 24, 100);
    g.fillStyle = "#5b6b7b"; g.font = "400 13px system-ui,sans-serif";
    g.fillText("_check.html 을 열면 무엇이 빠졌는지 알려줍니다.", 24, 128);
  });
  throw new Error("core.js 가 옛 버전입니다 (makeCW 없음)");
}

const LAM = 15, K = 2*Math.PI/LAM, OM = 2.0;

/* ── 히어로: 오목 파면 → 초점 ──
   음장 = 소자들의 합.  각 소자에 (초점까지 거리) 만큼 지연을 주면
   모든 파동이 초점에 동시에 도착합니다. 이것이 집속의 전부입니다. */
const howS=document.getElementById("how"), fnS=document.getElementById("fn"), neS=document.getElementById("ne");
const F1=makeCW(4);

const hero = makeScene("c1", 360, (ctx,W,H,t)=>{
  const mech = howS.value==="1";
  const F=+fnS.value, N=+neS.value;
  document.getElementById("fnv").textContent=F.toFixed(1);
  document.getElementById("nev").textContent=N;
  const ms=document.getElementById("mstat");
  ms.textContent = mech ? "오목하게 깎은 면 — 초점 고정" : `배열 ${N} 소자 + 지연 — 초점 가변`;
  ms.style.color = mech ? MUTED : SIGNAL_DK;

  const x0=30, cy=H/2;
  const AP=Math.min(H-56, 250);            /* 개구 크기 (px) */
  const FL=AP*F;                            /* 초점 깊이 = F# × 개구 */
  const fx=x0+FL, fy=cy;

  /* 소자 위치. 기계식이면 곡면 위에, 전자식이면 평면 위에. */
  const M = mech ? 40 : N;   /* 기계식 = 오목면을 점 음원으로 근사.
                                40개면 음원 간격 < λ/2 라 충분합니다 (34개가 하한). */
  const el=[];
  for(let i=0;i<M;i++){
    const yy = cy - AP/2 + AP*(M>1? i/(M-1):0.5);
    const dy = yy-fy;
    const xx = mech ? x0 + (FL - Math.sqrt(Math.max(0,FL*FL-dy*dy))) : x0;
    el.push({x:xx, y:yy});
  }
  /* 지연: 초점까지 거리가 먼 소자를 먼저 쏨 */
  const dist = el.map(e=>Math.hypot(fx-e.x, fy-e.y));
  const dmax = Math.max(...dist);
  const tau  = dist.map(d=>(dmax-d));

  ctx.imageSmoothingEnabled=true;
  ctx.drawImage(F1.frame(W,H, OM*t, `${howS.value},${fnS.value},${neS.value}`, (x,y)=>{
    if(x < x0-4) return null;
    let sr=0, si=0;
    for(let i=0;i<M;i++){
      const r=Math.hypot(x-el[i].x, y-el[i].y), a=1/Math.sqrt(Math.max(r,6));
      const ph=K*(r+tau[i]);
      sr += a*Math.sin(ph); si += a*Math.cos(ph);
    }
    const g = 3.4/Math.sqrt(M);
    return [g*sr, g*si];
  }),0,0,W,H);

  /* 소자 */
  if(mech){
    ctx.strokeStyle=INK; ctx.lineWidth=6; ctx.lineCap="round";
    ctx.beginPath(); el.forEach((e,i)=> i?ctx.lineTo(e.x,e.y):ctx.moveTo(e.x,e.y)); ctx.stroke();
  } else {
    const eh=Math.max(2,AP/N*0.74);
    el.forEach((e,i)=>{ ctx.fillStyle=SIGNAL; ctx.fillRect(e.x-4, e.y-eh/2, 8, eh); });
    /* 지연 프로파일 */
    ctx.strokeStyle=POS; ctx.lineWidth=1.8; ctx.beginPath();
    el.forEach((e,i)=>{ const px=x0-10-tau[i]*0.42; i?ctx.lineTo(px,e.y):ctx.moveTo(px,e.y); });
    ctx.stroke();
    chip(ctx,"송신 지연", 8, cy-AP/2-10, POS, 10);
  }
  /* 초점 */
  if(fx<W-10){
    ctx.strokeStyle=AMBER; ctx.lineWidth=2; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.arc(fx,fy,13,0,7); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(fx,fy,4,0,7); ctx.fillStyle=AMBER; ctx.fill();
    ctx.textAlign="center"; chip(ctx,"초점 FOCUS",fx,fy-20,AMBER_DK,10.5); ctx.textAlign="left";
  }
  /* 개구 표시 */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(x0-18,cy-AP/2); ctx.lineTo(x0-18,cy+AP/2);
  ctx.moveTo(x0-22,cy-AP/2); ctx.lineTo(x0-14,cy-AP/2);
  ctx.moveTo(x0-22,cy+AP/2); ctx.lineTo(x0-14,cy+AP/2); ctx.stroke();
  chip(ctx, mech?"오목면 (초점 고정)":`배열 ${N} 소자 · F# = ${F.toFixed(1)}`, 10, 20, INK, 11.5);
  if(!mech && N<10) chip(ctx,"소자가 적어 파면이 계단처럼 부서집니다", 10, H-14, POS, 10.5);
  else chip(ctx, `초점 깊이 = ${F.toFixed(1)} × 개구`, 10, H-14, MUTED, 10.5, 400);
}, {play:"play", speed:0.030, tStill:3});
howS.onchange = fnS.oninput = neS.oninput = hero.redraw;

/* ── F# 트레이드오프 ── */
const f2S=document.getElementById("f2"), frS=document.getElementById("fr");
const bw  = (lam,F)=> 1.02*lam*F;        /* −6dB 빔 폭 (원형 개구) */
const dof = (lam,F)=> 7.1*lam*F*F;       /* −6dB 초점 영역 길이 */

const tw = makeScene("c2", 330, (ctx,W,H)=>{
  const F=+f2S.value, f=+frS.value;
  const lam=1540/(f*1e6)*1e3;
  const w=bw(lam,F), d=dof(lam,F);
  document.getElementById("f2v").textContent=F.toFixed(1);
  document.getElementById("frv").textContent=f.toFixed(1);
  document.getElementById("lv").textContent=lam.toFixed(3);
  document.getElementById("bw").textContent=w.toFixed(2);
  document.getElementById("dof").textContent=d.toFixed(1);
  document.getElementById("ar").textContent="1 : "+(d/w).toFixed(0);
  const ts=document.getElementById("tstat");
  ts.textContent=`종횡비 1 : ${(d/w).toFixed(0)}  ≈ 7 × F#  — 주파수와 무관`;
  ts.style.color=AMBER_DK;

  /* 왼쪽: 트랜스듀서(개념도) → 실제 축척 초점 스팟 */
  const boxX=8, boxW=W*0.46, boxT=26, boxB=H-32;
  const PXmm = Math.min(9, (boxW*0.56)/Math.max(d,1));
  const cx=boxX+boxW*0.60, cy=(boxT+boxB)/2;
  ctx.fillStyle="rgba(43,61,80,.03)"; ctx.fillRect(boxX,boxT,boxW,boxB-boxT);
  const hw=w*PXmm/2, hl=d*PXmm/2;
  /* 트랜스듀서 + 수렴/발산 빔 (개념도, 축척 아님) */
  const tdX=boxX+10, tdH=(boxB-boxT)*0.58, spotX=cx;
  const fillCone=(x1,y1a,y1b,x2,ya,yb)=>{ ctx.beginPath(); ctx.moveTo(x1,y1a); ctx.lineTo(x2,ya); ctx.lineTo(x2,yb); ctx.lineTo(x1,y1b); ctx.closePath(); ctx.fill(); };
  ctx.fillStyle="rgba(179,18,60,.09)";
  fillCone(tdX+6,cy-tdH/2,cy+tdH/2, spotX, cy-hw-3, cy+hw+3);
  fillCone(spotX,cy-hw-3,cy+hw+3, boxX+boxW-8, cy-tdH*0.44, cy+tdH*0.44);
  ctx.strokeStyle="rgba(179,18,60,.32)"; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(tdX+6,cy-tdH/2); ctx.lineTo(spotX,cy); ctx.lineTo(tdX+6,cy+tdH/2);
  ctx.moveTo(spotX,cy); ctx.lineTo(boxX+boxW-8,cy-tdH*0.44); ctx.moveTo(spotX,cy); ctx.lineTo(boxX+boxW-8,cy+tdH*0.44); ctx.stroke();
  ctx.fillStyle="#c4cdd6"; ctx.fillRect(tdX, cy-tdH/2, 7, tdH);
  ctx.fillStyle="#9aa5b0"; ctx.fillRect(tdX-2, cy-tdH/2, 3, tdH);
  ctx.textAlign="left"; label(ctx,"트랜스듀서",tdX-2,cy-tdH/2-7,MUTED,10.5,600);
  /* 초점 스팟 (실제 축척 · 글로우) */
  const g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(hl,4));
  g.addColorStop(0,"rgba(255,238,242,.98)"); g.addColorStop(.4,"rgba(179,18,60,.88)"); g.addColorStop(1,"rgba(179,18,60,0)");
  ctx.save(); ctx.translate(cx,cy); ctx.scale(1, Math.max(hw,1.2)/Math.max(hl,1.2));
  ctx.beginPath(); ctx.arc(0,0,Math.max(hl,4),0,7); ctx.fillStyle=g; ctx.fill(); ctx.restore();
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.moveTo(cx-hl,cy); ctx.lineTo(cx+hl,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy-hw); ctx.lineTo(cx,cy+hw); ctx.stroke();
  ctx.textAlign="center";
  chip(ctx,`길이 ${d.toFixed(1)} mm`, cx, cy+Math.max(hw,10)+22, POS, 11);
  chip(ctx,`폭 ${w.toFixed(2)} mm`, cx, cy-Math.max(hw,10)-10, SIGNAL_DK, 11);
  chip(ctx,"초점 스팟 · 실제 축척", boxX+boxW*0.5, 20, MUTED, 10.5, 400);
  ctx.textAlign="left";

  /* 오른쪽: F# 에 따른 두 곡선 */
  const L=W*0.56, R=16, T=44, B=H-38, PW=W-L-R, PH=B-T;
  const X = ff => L + (ff-1)/4*PW;
  const wmax=bw(lam,5), dmax=dof(lam,5);
  ctx.strokeStyle=WELL2; ctx.lineWidth=1;
  for(let ff=1;ff<=5;ff++){ ctx.beginPath(); ctx.moveTo(X(ff),T); ctx.lineTo(X(ff),B); ctx.stroke(); }
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  for(let ff=1;ff<=5;ff++){
    ctx.beginPath(); ctx.moveTo(X(ff),B); ctx.lineTo(X(ff),B+6); ctx.stroke();
    ctx.textAlign="center"; label(ctx,`${ff}`,X(ff),B+18,INK,11); ctx.textAlign="left";
  }
  label(ctx,"F 넘버",L+PW-52,B+18,MUTED,11,400);
  /* 빔 폭 — 직선 */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.6; ctx.beginPath();
  for(let i=0;i<=100;i++){ const ff=1+4*i/100; const y=B-bw(lam,ff)/wmax*PH;
    i?ctx.lineTo(X(ff),y):ctx.moveTo(X(ff),y); }
  ctx.stroke();
  /* 초점 영역 — 포물선 */
  ctx.strokeStyle=POS; ctx.lineWidth=2.6; ctx.beginPath();
  for(let i=0;i<=100;i++){ const ff=1+4*i/100; const y=B-dof(lam,ff)/dmax*PH;
    i?ctx.lineTo(X(ff),y):ctx.moveTo(X(ff),y); }
  ctx.stroke();
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(L+8,T+16); ctx.lineTo(L+26,T+16); ctx.stroke();
  ctx.textAlign="left"; label(ctx,"빔 폭 ∝ F#",L+30,T+20,SIGNAL_DK,11,700);
  ctx.strokeStyle=POS; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(L+8,T+34); ctx.lineTo(L+26,T+34); ctx.stroke();
  label(ctx,"초점 영역 ∝ F#²",L+30,T+38,POS,11,700);
  /* 현재 F# */
  ctx.strokeStyle=AMBER; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(X(F),T); ctx.lineTo(X(F),B); ctx.stroke();
  [[B-w/wmax*PH,SIGNAL_DK],[B-d/dmax*PH,POS]].forEach(([y,c])=>{
    ctx.beginPath(); ctx.arc(X(F),y,5,0,7); ctx.fillStyle=c; ctx.fill();
    ctx.strokeStyle=CARD; ctx.lineWidth=2; ctx.stroke();
  });
  ctx.textAlign="left"; chip(ctx,`f = ${f.toFixed(1)} MHz · λ = ${lam.toFixed(3)} mm`, L, 20, INK, 11);
});
f2S.oninput = frS.oninput = tw.redraw;
