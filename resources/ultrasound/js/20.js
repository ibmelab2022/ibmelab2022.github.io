/* ═══ 20 송수신기 · 애니메이션 ═══  검증: verify21_23.py · 클램프전류 = (VP−0.7)/R */
const VP=94.6, IS=1e-9, NVT=0.04;

function limOut(Vin, R){ let lo=0, hi=1.5;
  for(let i=0;i<40;i++){ const v=(lo+hi)/2;
    if((Vin-v)/R > IS*(Math.exp(v/NVT)-1)) lo=v; else hi=v; } return (lo+hi)/2; }

function polyDots(ctx, pts, prog, n, col){
  let L=0; const seg=[];
  for(let i=1;i<pts.length;i++){ const d=Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]); seg.push(d); L+=d; }
  ctx.fillStyle=col;
  for(let i=0;i<n;i++){ let s=(((i/n)+prog)%1+1)%1*L, k=0;
    while(k<seg.length && s>seg[k]){ s-=seg[k]; k++; } if(k>=seg.length) k=seg.length-1;
    const f=seg[k]?s/seg[k]:0, x=pts[k][0]+(pts[k+1][0]-pts[k][0])*f, y=pts[k][1]+(pts[k+1][1]-pts[k][1])*f;
    ctx.beginPath(); ctx.arc(x,y,2.6,0,7); ctx.fill(); }
}
/* 다이오드 (vert=false: 가로 ▶◀ · vert=true: 세로 ▲▼) · on 이면 강조색 */
function diode(ctx, cx, cy, dir, vert, on, col){
  const c = on?col:"rgba(150,160,170,.55)", L=15;
  ctx.fillStyle=c; ctx.strokeStyle=c; ctx.lineWidth=1.7; ctx.beginPath();
  if(!vert){ const x0=cx-L/2, x1=cx+L/2;
    if(dir>0){ ctx.moveTo(x0,cy-7); ctx.lineTo(x0,cy+7); ctx.lineTo(x1,cy); } else { ctx.moveTo(x1,cy-7); ctx.lineTo(x1,cy+7); ctx.lineTo(x0,cy); }
    ctx.closePath(); ctx.fill(); const xb=dir>0?x1:x0; ctx.beginPath(); ctx.moveTo(xb,cy-7); ctx.lineTo(xb,cy+7); ctx.stroke();
  } else { const y0=cy-L/2, y1=cy+L/2;
    if(dir>0){ ctx.moveTo(cx-7,y1); ctx.lineTo(cx+7,y1); ctx.lineTo(cx,y0); } else { ctx.moveTo(cx-7,y0); ctx.lineTo(cx+7,y0); ctx.lineTo(cx,y1); }
    ctx.closePath(); ctx.fill(); const yb=dir>0?y0:y1; ctx.beginPath(); ctx.moveTo(cx-7,yb); ctx.lineTo(cx+7,yb); ctx.stroke();
  }
}
/* 1주기 전압 파형 스코프 (Vamp: 진폭 V · Vmax: 축 반경 V · clamp: ±클램프 V 있으면 눌림) */
function vscope(ctx, x, y, w, h, Vamp, Vmax, clamp, scaleTxt, col){
  ctx.fillStyle=WELL; ctx.fillRect(x,y,w,h); ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);
  const mid=y+h/2, A=h/2-8;
  ctx.strokeStyle="rgba(217,224,231,.9)"; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(x+4,mid); ctx.lineTo(x+w-4,mid); ctx.stroke(); ctx.setLineDash([]);
  if(clamp!=null){ /* 눌리기 전 원 파형(연하게) */
    ctx.strokeStyle="rgba(150,160,170,.5)"; ctx.lineWidth=1.2; ctx.beginPath();
    for(let px=0;px<=w-8;px++){ const v=Math.sin(2*Math.PI*px/(w-8))*Vamp, yy=mid-Math.max(-Vmax,Math.min(Vmax,v))/Vmax*A; px?ctx.lineTo(x+4+px,yy):ctx.moveTo(x+4+px,yy); } ctx.stroke();
  }
  ctx.strokeStyle=col; ctx.lineWidth=2.2; ctx.beginPath();
  for(let px=0;px<=w-8;px++){ let v=Math.sin(2*Math.PI*px/(w-8))*Vamp; if(clamp!=null) v=Math.max(-clamp,Math.min(clamp,v));
    const yy=mid-Math.max(-Vmax,Math.min(Vmax,v))/Vmax*A; px?ctx.lineTo(x+4+px,yy):ctx.moveTo(x+4+px,yy); } ctx.stroke();
  ctx.textAlign="right"; label(ctx,scaleTxt,x+w-4,y+11,MUTED,8,500); ctx.textAlign="left";
}

/* ── c1 : expander + limiter 회로 · 송신/수신 동작 ── */
const rrS=document.getElementById("rr"), modeB=document.getElementById("mode");
let TX=true;
if(modeB) modeB.onclick=()=>{ TX=!TX; modeB.textContent=TX?"수신 보기":"송신 보기"; c1.redraw(); };
const c1=makeScene("c1", 420, (ctx,W,H,t)=>{
  const R=+rrS.value*1000, clampI=(VP-0.7)/R*1000;   /* mA */
  document.getElementById("rrv").textContent=(+rrS.value).toFixed(1);
  document.getElementById("rlna").textContent = TX? "±0.7" : "µV 그대로";
  document.getElementById("rcl").textContent = TX? clampI.toFixed(0) : "0";
  const st=document.getElementById("tstat");
  st.textContent = TX ? "송신 — 익스팬더 열림 · 리미터 닫힘(LNA 보호)" : "수신 — 익스팬더 닫힘(송신기 분리) · 리미터 열림(에코 통과)";
  st.style.color = TX? POS : SIGNAL_DK;

  const X0=Math.max(6,(W-472)/2), RY=92;
  const puX=X0+24, puR=X0+88, exL=X0+114, exR=X0+166, nd=X0+222, rL=X0+254, rR=X0+332, lnX=X0+366, lnBox=X0+408, lnBoxR=X0+466;
  /* 배선 (주 레일) */
  ctx.strokeStyle=INK2; ctx.lineWidth=1.7; ctx.lineCap="round"; ctx.beginPath();
  ctx.moveTo(puR,RY); ctx.lineTo(exL,RY);
  ctx.moveTo(exR,RY); ctx.lineTo(nd,RY);
  ctx.moveTo(nd,RY); ctx.lineTo(rL,RY);
  ctx.moveTo(rR,RY); ctx.lineTo(lnBox,RY);
  ctx.moveTo(nd,RY); ctx.lineTo(nd,RY+28);
  ctx.stroke();
  /* R 지그재그 */
  ctx.beginPath(); ctx.moveTo(rL,RY); const nn=6, hh=(rR-rL)/nn;
  for(let i=0;i<nn;i++) ctx.lineTo(rL+hh*(i+0.5),RY+((i%2)?-6:6)); ctx.lineTo(rR,RY); ctx.stroke();
  /* 익스팬더 = 역병렬(가로) — 위 가지 ▶, 아래 가지 ◀ */
  const eTop=RY-13, eBot=RY+13, eC=(exL+exR)/2;
  ctx.strokeStyle=INK2; ctx.lineWidth=1.7; ctx.beginPath();
  ctx.moveTo(exL,RY); ctx.lineTo(exL,eTop); ctx.lineTo(eC-8,eTop); ctx.moveTo(eC+8,eTop); ctx.lineTo(exR,eTop); ctx.lineTo(exR,RY);
  ctx.moveTo(exL,RY); ctx.lineTo(exL,eBot); ctx.lineTo(eC-8,eBot); ctx.moveTo(eC+8,eBot); ctx.lineTo(exR,eBot); ctx.lineTo(exR,RY);
  ctx.stroke();
  diode(ctx,eC,eTop,+1,false, TX, SIGNAL_DK); diode(ctx,eC,eBot,-1,false, TX, SIGNAL_DK);
  /* 리미터 = 역병렬(세로) 션트 — 왼 ▼, 오 ▲ */
  const sY=RY+24, jY=RY+74, gY=jY+16, dC=(sY+jY)/2;
  ctx.strokeStyle=INK2; ctx.lineWidth=1.7; ctx.beginPath();
  ctx.moveTo(lnX,RY); ctx.lineTo(lnX,sY);
  ctx.moveTo(lnX-11,sY); ctx.lineTo(lnX+11,sY);
  ctx.moveTo(lnX-11,sY); ctx.lineTo(lnX-11,dC-8); ctx.moveTo(lnX-11,dC+8); ctx.lineTo(lnX-11,jY);
  ctx.moveTo(lnX+11,sY); ctx.lineTo(lnX+11,dC-8); ctx.moveTo(lnX+11,dC+8); ctx.lineTo(lnX+11,jY);
  ctx.moveTo(lnX-11,jY); ctx.lineTo(lnX+11,jY);
  ctx.moveTo(lnX,jY); ctx.lineTo(lnX,gY);
  ctx.stroke();
  diode(ctx,lnX-11,dC,-1,true, TX, POS); diode(ctx,lnX+11,dC,+1,true, TX, POS);
  /* gnd */
  ctx.beginPath(); ctx.moveTo(lnX-9,gY); ctx.lineTo(lnX+9,gY); ctx.moveTo(lnX-5.5,gY+4); ctx.lineTo(lnX+5.5,gY+4); ctx.moveTo(lnX-2,gY+8); ctx.lineTo(lnX+2,gY+8); ctx.stroke();
  /* 상자 */
  const box=(x0,x1,txt,col)=>{ ctx.strokeStyle=col; ctx.lineWidth=1.7; ctx.strokeRect(x0,RY-16,x1-x0,32);
    ctx.fillStyle=col; ctx.textAlign="center"; label(ctx,txt,(x0+x1)/2,RY+4,col,11,700); ctx.textAlign="left"; };
  box(puX,puR,"Pulser",INK2); box(lnBox,lnBoxR,"LNA",TX?INK2:SIGNAL_DK);
  /* 탐촉자 노드 · 음파 화살표 */
  ctx.fillStyle=INK; ctx.beginPath(); ctx.arc(nd,RY,4,0,7); ctx.fill();
  /* 음파 화살표 (송신 ↓ 체내 / 수신 ↑ 노드) */
  ctx.strokeStyle=TX?POS:SIGNAL_DK; ctx.lineWidth=2; ctx.beginPath();
  if(TX){ ctx.moveTo(nd,RY+28); ctx.lineTo(nd,RY+44); ctx.lineTo(nd-4,RY+38); ctx.moveTo(nd,RY+44); ctx.lineTo(nd+4,RY+38); }
  else  { ctx.moveTo(nd,RY+44); ctx.lineTo(nd,RY+28); ctx.lineTo(nd-4,RY+34); ctx.moveTo(nd,RY+28); ctx.lineTo(nd+4,RY+34); }
  ctx.stroke();
  ctx.textAlign="center"; label(ctx,"탐촉자",nd,RY-24,INK,11,700); label(ctx,TX?"↓ 체내 (송신)":"↑ 체내 (에코)",nd,RY+58,MUTED,9.5,500); ctx.textAlign="left";
  /* 전류 점 (느리게) */
  const bodyY=RY+40;
  const pTx=[[puR,RY],[exL,RY],[exR,RY],[nd,RY]];
  const pBody=[[nd,RY],[nd,bodyY]];                       /* 송신: 노드 → 체내(주 경로) */
  const pR=[[nd,RY],[rL,RY],[rR,RY],[lnBox,RY]];
  const pLim=[[lnX,RY],[lnX,sY],[lnX,gY]];
  const pEcho=[[nd,bodyY],[nd,RY],[rL,RY],[rR,RY],[lnBox,RY]];   /* 수신: 체내 → 노드 → R → LNA */
  if(TX){ polyDots(ctx,pTx,(t*0.42)%1,5,POS); polyDots(ctx,pBody,(t*0.42)%1,3,POS); polyDots(ctx,pR,(t*0.42)%1,4,POS); polyDots(ctx,pLim,(t*0.5)%1,4,POS); }
  else  { polyDots(ctx,pEcho,(t*0.3)%1,7,SIGNAL_DK); }
  /* 라벨 */
  ctx.textAlign="center";
  label(ctx,"익스팬더",eC,RY-34,TX?SIGNAL_DK:MUTED,10,700); label(ctx,"D1 ‖ D2",eC,eBot+16,MUTED,9,500);
  label(ctx,"R",(rL+rR)/2,RY-14,INK,11,700);
  label(ctx,"리미터",lnX,gY+16,TX?POS:MUTED,10,700); label(ctx,"교차 다이오드",lnX,gY+28,MUTED,9,500);
  ctx.textAlign="left";

  /* ── 아래: 두 전압 스코프 (1주기 파형) ── */
  const scY=RY+156, scH=104, scW=(472-40)/2, sc1=X0+20, sc2=X0+20+scW+8;
  ctx.textAlign="center";
  label(ctx,"탐촉자 전압",sc1+scW/2,scY-8,INK,11,700);
  label(ctx,TX?"LNA 입력 (클램프 후)":"LNA 입력 (통과)",sc2+scW/2,scY-8,TX?POS:SIGNAL_DK,11,700);
  ctx.textAlign="left";
  if(TX){
    vscope(ctx,sc1,scY,scW,scH, 95,100,null, "±100 V", POS);
    vscope(ctx,sc2,scY,scW,scH, 95,100,0.7, "±100 V", POS);
    ctx.textAlign="center";
    chip(ctx,"±95 V — 거대한 송신 펄스",sc1+scW/2,scY+scH-8,POS,9.5);
    chip(ctx,"±0.7 V 로 클램프 (거의 평탄)",sc2+scW/2,scY+scH-8,POS,9.5);
    ctx.textAlign="left";
  } else {
    vscope(ctx,sc1,scY,scW,scH, 40,50,null, "±50 µV", SIGNAL_DK);
    vscope(ctx,sc2,scY,scW,scH, 40,50,null, "±50 µV", SIGNAL_DK);
    ctx.textAlign="center";
    chip(ctx,"µV 에코",sc1+scW/2,scY+scH-8,SIGNAL_DK,9.5);
    chip(ctx,"손실 없이 통과 (같은 크기)",sc2+scW/2,scY+scH-8,SIGNAL_DK,9.5);
    ctx.textAlign="left";
  }
},{play:"p1", speed:0.014, tStill:5.4});
rrS.oninput=c1.redraw;

/* ── 전달곡선 (정적 · R=1 kΩ) ── */
makeScene("c2", 300, (ctx,W,H)=>{
  const sx0=64, sx1=W-16, sy0=34, sy1=250;
  const U0=-5, U1=2.35;                     /* log10(V): 10 µV ~ 224 V */
  const Xu=u=> sx0+(u-U0)/(U1-U0)*(sx1-sx0);
  const Yv=v=> sy1 - v/0.85*(sy1-sy0);
  ctx.fillStyle=WELL; ctx.fillRect(sx0,sy0,sx1-sx0,sy1-sy0);
  ctx.strokeStyle=LINE; ctx.strokeRect(sx0,sy0,sx1-sx0,sy1-sy0);
  ctx.strokeStyle=AMBER; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(sx0,Yv(0.7)); ctx.lineTo(sx1,Yv(0.7)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; label(ctx,"0.7 V",sx0-5,Yv(0.7)+4,AMBER_DK,9,600);
  label(ctx,"0",sx0-5,Yv(0)+4,MUTED,9,500); ctx.textAlign="left";
  ctx.strokeStyle=INK2; ctx.lineWidth=2.2; ctx.beginPath();
  for(let i=0;i<=140;i++){ const u=U0+(U1-U0)*i/140, vi=Math.pow(10,u), vo=limOut(vi,1000);
    i? ctx.lineTo(Xu(u),Yv(vo)) : ctx.moveTo(Xu(u),Yv(vo)); }
  ctx.stroke();
  const mark=(vi,col,txt,dy)=>{ const vo=limOut(vi,1000);
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(Xu(Math.log10(vi)),Yv(vo),4.5,0,7); ctx.fill();
    ctx.textAlign="center"; chip(ctx,txt,Xu(Math.log10(vi)),Yv(vo)+dy,col,9.5); ctx.textAlign="left"; };
  mark(94.6, POS, "송신 94.6 V → 0.73 V", -12);
  mark(1e-3, SIGNAL_DK, "에코 1 mV → 1 mV", -14);
  chip(ctx,"기울기 1 — 그대로 통과",Xu(-4.6),Yv(0.06),MUTED,9,500);
  chip(ctx,"눌림 — R 가 나머지를 받음",Xu(0.35),Yv(0.80),INK2,9,500);
  [[-5,"10 µV"],[-3,"1 mV"],[-1,"0.1 V"],[1,"10 V"],[2,"100 V"]].forEach(([u,s])=>{
    ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(Xu(u),sy1); ctx.lineTo(Xu(u),sy1+4); ctx.stroke();
    ctx.textAlign="center"; label(ctx,s,Xu(u),sy1+18,MUTED,9,500); ctx.textAlign="left"; });
  label(ctx,"들어온 크기 (로그)",sx1-108,sy1+34,MUTED,9,500);
  ctx.save(); ctx.translate(sx0-44,(sy0+sy1)/2+34); ctx.rotate(-Math.PI/2);
  label(ctx,"나가는 크기 (V)",0,0,MUTED,9,500); ctx.restore();
});

