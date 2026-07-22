/* ═══ 22 아날로그 프런트엔드 Ⅱ (ADC) · 애니메이션 ═══
   검증: 나이퀴스트 fs≥2·f_max · 겉보기 |f−round(f/fs)·fs| · 양자화 DR = 6.02·N+1.76 dB */

/* ── c1 : 표본화와 나이퀴스트 (에일리어싱) ── */
const sfS=document.getElementById("sf"), fsS=document.getElementById("fs");
const samp=makeScene("c1", 340, (ctx,W,H)=>{
  const f=+sfS.value, fs=+fsS.value;                    /* MHz */
  FS*=1.16;
  const k=Math.round(f/fs), fa=Math.abs(f-k*fs);        /* 겉보기 주파수 */
  const alias=fs<2*f;
  document.getElementById("sfv").textContent=f.toFixed(1);
  document.getElementById("fsv").textContent=fs.toFixed(0);
  document.getElementById("rny").textContent=(fs/2).toFixed(1);
  document.getElementById("rfa").textContent=fa.toFixed(2);
  const st=document.getElementById("sstat");
  st.textContent = alias ? `에일리어싱 — ${f}MHz 가 ${fa.toFixed(1)}MHz 로 접혀 보임` : "정상 — 원래 주파수 복원";
  st.style.color = alias ? POS : SIGNAL_DK;

  const L=20, R=20, PW=W-L-R, Tw=1.4;                   /* µs 창 */
  const mid=H/2-6, amp=H*0.30;
  const X=t=> L+t/Tw*PW, Yv=v=> mid - v*amp;
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(L,mid); ctx.lineTo(L+PW,mid); ctx.stroke();
  /* 원신호 (연한 회색) */
  ctx.strokeStyle="rgba(90,106,125,.5)"; ctx.lineWidth=1.4; ctx.beginPath();
  for(let px=0;px<=PW;px++){ const t=px/PW*Tw, v=Math.sin(2*Math.PI*f*t); px?ctx.lineTo(L+px,Yv(v)):ctx.moveTo(L+px,Yv(v)); } ctx.stroke();
  /* 복원(겉보기) 사인 — 표본을 지나는 최저주파 */
  ctx.strokeStyle=alias?POS:SIGNAL_DK; ctx.lineWidth=2.4; ctx.beginPath();
  const sgn=(f-k*fs)>=0?1:-1;
  for(let px=0;px<=PW;px++){ const t=px/PW*Tw, v=Math.sin(2*Math.PI*fa*t*sgn); px?ctx.lineTo(L+px,Yv(v)):ctx.moveTo(L+px,Yv(v)); } ctx.stroke();
  /* 표본 점 + 스템 */
  ctx.fillStyle=INK; ctx.strokeStyle="rgba(43,61,80,.4)"; ctx.lineWidth=1;
  for(let n=0; n/fs<=Tw; n++){ const t=n/fs, v=Math.sin(2*Math.PI*f*t);
    ctx.beginPath(); ctx.moveTo(X(t),mid); ctx.lineTo(X(t),Yv(v)); ctx.stroke();
    ctx.beginPath(); ctx.arc(X(t),Yv(v),3.5,0,7); ctx.fill(); }
  ctx.textAlign="left";
  chip(ctx,"원신호 f",L+4,24,MUTED,10);
  chip(ctx,alias?"복원 — 엉뚱한 저주파":"복원 — 원래대로",L+4,H-14,alias?POS:SIGNAL_DK,10);
  chip(ctx,"표본 (fs 마다)",L+PW-118,24,INK,10);
  label(ctx,"시간 (µs) →",L+PW-88,H-14,MUTED,9,400);
});
sfS.oninput = fsS.oninput = samp.redraw;

/* ── c2 : 양자화 — 비트수 → 계단·양자화 잡음·동적범위 ── */
const nbS=document.getElementById("nb");
const quant=makeScene("c2", 320, (ctx,W,H)=>{
  FS*=1.16;
  const N=+nbS.value, levels=Math.pow(2,N), DR=6.02*N+1.76;
  document.getElementById("nbv").textContent=N;
  document.getElementById("rlev").textContent=levels.toLocaleString();
  document.getElementById("rdr").textContent=DR.toFixed(0);

  const L=20, R=20, PW=W-L-R, Tw=1.0;
  const top=34, bot=H-46, PH=bot-top;
  const X=t=> L+t/Tw*PW;
  const sig=t=> 0.5 + 0.42*Math.sin(2*Math.PI*2.5*t)*Math.exp(-t*0.4);   /* 0~1 아날로그 */
  const Yv=v=> bot - v*PH;
  /* 준위선 (많으면 성기게) */
  const showLv=Math.min(levels,32);
  ctx.strokeStyle="rgba(217,224,231,.7)"; ctx.lineWidth=1;
  for(let i=0;i<=showLv;i++){ const y=bot-i/showLv*PH; ctx.beginPath(); ctx.moveTo(L,y); ctx.lineTo(L+PW,y); ctx.stroke(); }
  /* 아날로그 (연한) */
  ctx.strokeStyle="rgba(90,106,125,.55)"; ctx.lineWidth=1.4; ctx.beginPath();
  for(let px=0;px<=PW;px++){ const t=px/PW*Tw, v=sig(t); px?ctx.lineTo(L+px,Yv(v)):ctx.moveTo(L+px,Yv(v)); } ctx.stroke();
  /* 양자화 계단 + 오차 채움 */
  const q=v=> Math.round(v*(levels-1))/(levels-1);
  ctx.fillStyle="rgba(179,18,60,.16)";
  for(let px=0;px<PW;px++){ const t=px/PW*Tw, v=sig(t), vq=q(v);
    ctx.fillRect(L+px, Math.min(Yv(v),Yv(vq)), 1, Math.abs(Yv(v)-Yv(vq))); }
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2; ctx.beginPath();
  let prev=null;
  for(let px=0;px<=PW;px++){ const t=px/PW*Tw, vq=q(sig(t)), y=Yv(vq);
    if(prev!==null && Math.abs(y-prev)>0.5){ ctx.lineTo(L+px,prev); }
    px?ctx.lineTo(L+px,y):ctx.moveTo(L+px,y); prev=y; } ctx.stroke();
  ctx.textAlign="left";
  chip(ctx,"아날로그",L+4,26,MUTED,10);
  chip(ctx,`양자화 — ${levels.toLocaleString()}준위`,L+PW-150,26,SIGNAL_DK,10);
  chip(ctx,"오차 = 양자화 잡음",L+4,bot+18,POS,9.5);
  label(ctx,"시간 →",L+PW-56,bot+18,MUTED,9,400);
});
nbS.oninput=quant.redraw;
