/* ═══ 07 초음파 감쇠 · 스펙트럼 하향 이동 ═══
   S(f,d) = exp(−(f−f0)²/2σ²) · 10^(−α0·f·d/20)
   지수를 정리하면 다시 가우시안이 되고, 중심만 이동합니다:
       f0'(d) = f0 − σ²βd ,   β = α0·ln10/20 ,   σ 는 불변
   → 측방향(λ∝1/f0')은 나빠지지만 축방향(대역폭)은 보존됩니다. */
const A0 = 0.5;                       /* 연부조직 dB/cm/MHz — core.js 값과 동일 */
const SIG = 1.5;                      /* 대역폭 σ (MHz) — 광대역 탐촉자 */
const BETA = A0*Math.LN10/20;
const C = 1540;

const depS=document.getElementById("dep"), f0S=document.getElementById("f0");
const s = makeScene("c1", 330, (ctx,W,H)=>{
  const d=+depS.value, f0=+f0S.value;
  const fc = f0 - SIG*SIG*BETA*d;                 /* 이동한 중심 주파수 */
  const lam = C/(fc*1e6)*1e3;
  document.getElementById("depv").textContent=d.toFixed(1);
  document.getElementById("f0v").textContent=f0.toFixed(1);
  document.getElementById("dv").textContent=d.toFixed(1);
  document.getElementById("fcv").textContent=fc.toFixed(2);
  document.getElementById("lv").textContent=lam.toFixed(3);
  document.getElementById("degv").textContent=(f0/fc).toFixed(2);
  document.getElementById("dbtot").textContent=`왕복 총 감쇠 ${(2*A0*f0*d).toFixed(0)} dB`;

  const L=52, R=18, B=H-42, T=26, PW=W-L-R, PH=B-T;
  const FMAX=14;
  const X = f => L + (f/FMAX)*PW;
  const G = (f,dd) => Math.exp(-((f-f0)**2)/(2*SIG*SIG)) * Math.pow(10,-A0*f*dd/20);
  const PHu = PH*0.70;                            /* 봉우리 상단 여백(라벨·화살표용) */

  /* 축 */
  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  for(let f=0;f<=FMAX;f+=2){ ctx.beginPath(); ctx.moveTo(X(f),T); ctx.lineTo(X(f),B); ctx.stroke(); }
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  for(let f=0;f<=FMAX;f+=2){
    ctx.beginPath(); ctx.moveTo(X(f),B); ctx.lineTo(X(f),B+6); ctx.stroke();
    ctx.textAlign="center"; label(ctx,`${f}`,X(f),B+18,INK,11); ctx.textAlign="left";
  }
  ctx.textAlign="center"; label(ctx,"주파수 FREQUENCY (MHz)",(2*L+PW)/2,B+34,MUTED,11,400); ctx.textAlign="left";
  label(ctx,"진폭",8,T+4,MUTED,11,400);

  /* 원래 스펙트럼 (d=0) — 옅게 */
  ctx.strokeStyle="rgba(110,125,147,.55)"; ctx.lineWidth=1.6; ctx.setLineDash([4,3]);
  ctx.beginPath();
  for(let i=0;i<=400;i++){ const f=FMAX*i/400; const y=B-G(f,0)*PHu;
    i?ctx.lineTo(X(f),y):ctx.moveTo(X(f),y); }
  ctx.stroke(); ctx.setLineDash([]);

  /* 감쇠된 스펙트럼 — 채움 */
  const path=new Path2D(); path.moveTo(X(0),B);
  for(let i=0;i<=400;i++){ const f=FMAX*i/400; path.lineTo(X(f), B-G(f,d)*PHu); }
  path.lineTo(X(FMAX),B); path.closePath();
  ctx.fillStyle="rgba(179,18,60,.72)"; ctx.fill(path);
  ctx.strokeStyle=POS; ctx.lineWidth=1.6; ctx.stroke(path);

  /* 중심 주파수 마커 */
  const peak=G(fc,d);
  ctx.strokeStyle=AMBER; ctx.lineWidth=2; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(X(fc),B); ctx.lineTo(X(fc),B-peak*PHu-14); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle=AMBER; ctx.beginPath();
  ctx.arc(X(fc),B-peak*PHu,4.5,0,7); ctx.fill();
  ctx.textAlign="center";
  chip(ctx,`f₀′ = ${fc.toFixed(2)}`,X(fc),T+25,AMBER_DK,11.5);
  ctx.textAlign="left";

  /* f0 원위치 마커 */
  if(d>0){
    ctx.strokeStyle="rgba(110,125,147,.5)"; ctx.lineWidth=1; ctx.setLineDash([2,3]);
    ctx.beginPath(); ctx.moveTo(X(f0),B); ctx.lineTo(X(f0),T+8); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="center"; chip(ctx,`원래 f₀=${f0.toFixed(1)}`,X(f0),T+3,MUTED,10.5,400); ctx.textAlign="left";
    /* 이동량 화살표 */
    const yA=T+48;
    ray(ctx,X(f0),yA,X(fc)+6,yA,AMBER,1.6);
    ctx.textAlign="right";
    chip(ctx,`−${(f0-fc).toFixed(2)} MHz`,X(fc)-10,yA+4,AMBER_DK,11);
    ctx.textAlign="left";
  }
  /* σ 폭 표시 — 봉우리 높이의 절반 지점 */
  const yS=B-peak*PHu*0.607;
  ctx.strokeStyle="rgba(14,22,38,.45)"; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(X(fc-SIG),yS); ctx.lineTo(X(fc+SIG),yS);
  ctx.moveTo(X(fc-SIG),yS-4); ctx.lineTo(X(fc-SIG),yS+4);
  ctx.moveTo(X(fc+SIG),yS-4); ctx.lineTo(X(fc+SIG),yS+4); ctx.stroke();
  ctx.textAlign="center"; chip(ctx,`σ = ${SIG} — 불변`,X(fc),yS-7,INK2,10.5); ctx.textAlign="left";

  label(ctx,`깊이 ${d.toFixed(1)} cm · 연부조직 α₀ = ${A0} dB/cm/MHz`,L,17,INK,12);
});
depS.oninput = f0S.oninput = s.redraw;
