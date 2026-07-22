/* ═══ 24 주사 변환과 후처리 · 애니메이션 ═══
   검증: 섹터 θ/빔수 N → 빔간격 θ/N · r 에서 옆 빔까지 = (θ/N·π/180)·r (깊을수록 벌어짐) */

/* ── c1 : 주사 변환 — 같은 echo memory 가 트랜스듀서 종류에 따라 다른 형태로 ── */
const typeB=document.getElementById("ttype");
const TNAME=["선형 (Linear)","컨벡스 (Convex)","위상 (Phased)"];
let TT=0;
if(typeB) typeB.onclick=()=>{ TT=(TT+1)%3; typeB.textContent="다음: "+TNAME[(TT+1)%3].split(" ")[0]; scan.redraw(); };
const scan=makeScene("c1", 420, (ctx,W,H)=>{
  FS*=1.1;
  document.getElementById("ttv").textContent=TNAME[TT];
  const st=document.getElementById("sstat");
  st.textContent=["선형 — 빔이 나란히 직진 → 사각형(폭 = 배열 크기)",
                  "컨벡스 — 곡면 배열에서 부챗살로 퍼짐 → 넓은 곡면 부채꼴",
                  "위상 — 작은 배열에서 넓은 각도로 조향 → 뾰족한 섹터"][TT];
  st.style.color=SIGNAL_DK;

  const NB=9, TGT=[[2,0.28],[5,0.5],[7,0.72]];   /* 표적: [빔 인덱스, 깊이비] */
  /* 왼쪽: Echo Memory (빔 데이터 — 종류와 무관) */
  const emX=22, emY=52, emW=140, emH=H-emY-58;
  ctx.fillStyle="#0b0c0f"; ctx.fillRect(emX,emY,emW,emH); ctx.strokeStyle=INK; ctx.lineWidth=1.8; ctx.strokeRect(emX,emY,emW,emH);
  for(let i=0;i<NB;i++){ const x=emX+10+i*(emW-20)/(NB-1);
    ctx.strokeStyle="rgba(190,200,210,.45)"; ctx.lineWidth=1;
    for(let d=0;d<emH-18;d+=7){ ctx.beginPath(); ctx.moveTo(x-2.5,emY+9+d); ctx.lineTo(x+2.5,emY+9+d); ctx.stroke(); } }
  TGT.forEach(([bi,df])=>{ const x=emX+10+bi*(emW-20)/(NB-1), y=emY+9+df*(emH-26);
    ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(x,y,3.5,0,7); ctx.fill(); });
  ctx.textAlign="center"; chip(ctx,"Echo Memory",emX+emW/2,emY-10,INK,10.5,700);
  label(ctx,"S₁ … S_N (빔 데이터)",emX+emW/2,emY+emH+16,MUTED,9,500); ctx.textAlign="left";
  /* 화살표 */
  ctx.strokeStyle=INK2; ctx.lineWidth=2.2; const ax=emX+emW+10, ay=emY+emH/2;
  ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax+24,ay); ctx.moveTo(ax+24,ay); ctx.lineTo(ax+17,ay-5); ctx.moveTo(ax+24,ay); ctx.lineTo(ax+17,ay+5); ctx.stroke();

  /* 오른쪽: 선택 종류의 기하 */
  const gX0=emX+emW+46, gW=W-gX0-22, cx=gX0+gW/2, py=emY+8, Rmax=emH-24;
  const tgtDot=(x,y)=>{ ctx.fillStyle="#dfe7ee"; ctx.strokeStyle=INK2; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(x,y,4.2,0,7); ctx.fill(); ctx.stroke(); };
  if(TT===0){                                   /* 선형: 나란한 빔, 사각형 */
    const pw=Math.min(gW*0.72, Rmax*0.85), x0=cx-pw/2, bx=i=> x0+i/(NB-1)*pw;
    ctx.fillStyle="rgba(23,192,201,.06)"; ctx.fillRect(x0,py,pw,Rmax);
    ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.8; ctx.strokeRect(x0,py,pw,Rmax);
    ctx.strokeStyle="rgba(23,192,201,.4)"; ctx.lineWidth=1;
    for(let i=0;i<NB;i++){ ctx.beginPath(); ctx.moveTo(bx(i),py); ctx.lineTo(bx(i),py+Rmax); ctx.stroke(); }
    ctx.strokeStyle=INK; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(x0,py); ctx.lineTo(x0+pw,py); ctx.stroke();
    TGT.forEach(([bi,df])=> tgtDot(bx(bi),py+df*Rmax));
    ctx.textAlign="center"; chip(ctx,"평평한 배열 · 빔 평행",cx,py-10,INK,10,600);
    label(ctx,"사각형 영상",cx,py+Rmax+18,SIGNAL_DK,10,700); ctx.textAlign="left";
  } else {                                       /* 컨벡스·위상: 섹터 */
    const halfA=(TT===1?26:44)*Math.PI/180;
    const apex={x:cx, y: TT===1? py-Rmax*0.72 : py};
    const rIn = TT===1? Rmax*0.72 : 0, rOut = rIn + Rmax*(TT===1?0.9:1.0);
    const P=(r,a)=>({x:apex.x+r*Math.sin(a), y:apex.y+r*Math.cos(a)});
    ctx.fillStyle="rgba(23,192,201,.06)"; ctx.beginPath();
    { const p=P(rIn,-halfA); ctx.moveTo(p.x,p.y); }
    for(let a=-halfA;a<=halfA;a+=0.02){ const p=P(rOut,a); ctx.lineTo(p.x,p.y); }
    for(let a=halfA;a>=-halfA;a-=0.02){ const p=P(rIn,a); ctx.lineTo(p.x,p.y); }
    ctx.closePath(); ctx.fill(); ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.8; ctx.stroke();
    ctx.strokeStyle="rgba(23,192,201,.4)"; ctx.lineWidth=1;
    for(let i=0;i<NB;i++){ const a=-halfA+i/(NB-1)*2*halfA, p1=P(rIn,a), p2=P(rOut,a);
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke(); }
    ctx.strokeStyle=INK; ctx.lineWidth=5; ctx.beginPath();
    if(TT===1){ for(let a=-halfA;a<=halfA;a+=0.02){ const p=P(rIn,a); a===-halfA?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);} }
    else { ctx.moveTo(cx-15,py); ctx.lineTo(cx+15,py); } ctx.stroke();
    TGT.forEach(([bi,df])=>{ const a=-halfA+bi/(NB-1)*2*halfA, r=rIn+df*(rOut-rIn), p=P(r,a); tgtDot(p.x,p.y); });
    ctx.textAlign="center";
    chip(ctx, TT===1?"곡면 배열 · 부챗살":"작은 배열 · 넓은 조향", cx, py-10, INK,10,600);
    label(ctx, TT===1?"넓은 곡면 부채꼴":"뾰족한 섹터", cx, py+Rmax+18, SIGNAL_DK,10,700); ctx.textAlign="left";
  }
  ctx.textAlign="left"; chip(ctx,"같은 빔 데이터 · 표적 위치도 종류 따라 다르게 배치",gX0,H-14,MUTED,9.5);
});

/* ── c2 : 후처리 — 감마(계조)와 평활(스페클 억제) ── */
const gmS=document.getElementById("gm"), smS=document.getElementById("sm");
const post=makeScene("c2", 300, (ctx,W,H)=>{
  const gm=+gmS.value, sm=+smS.value;
  document.getElementById("gmv").textContent=gm.toFixed(1);
  document.getElementById("smv").textContent=sm;
  const st=document.getElementById("pstat");
  st.textContent = `감마 ${gm.toFixed(1)} · 평활 ${sm} — ${sm>=3?"매끄러움(경계 뭉툭)":gm<1?"밝은 쪽 강조":gm>1.6?"어두운 쪽 눌러 대비↑":"기본"}`;
  st.style.color=SIGNAL_DK;
  const spk=(bx,by)=>{ let h=(bx*73856093)^(by*19349663); h=Math.imul(h^(h>>>13),1274126177); return ((h>>>0)%1000)/1000; };
  const L=20,R=20,PW=W-L-R, top=34, bh=H-70, bs=4;
  /* 기반 밝기: 밝은 덩어리 + 배경 + 스페클 */
  const baseB=(x,y)=>{ const cx=PW*0.42, cy=bh*0.5, r=Math.hypot((x-cx)/(PW*0.28),(y-cy)/(bh*0.42));
    return 0.24 + 0.55*Math.exp(-r*r); };
  /* 두 반쪽: 원본 | 후처리 */
  const hw=PW/2-14;
  const draw=(x0,apply)=>{ for(let py=0;py<bh;py+=bs){ for(let px=0;px<hw;px+=bs){
      let v=baseB(px+ (apply?0:0),py)*(0.5+0.5*spk((px/bs)|0,(py/bs)|0));
      if(apply){ if(sm>0){ let a=0,cc=0; for(let j=-sm;j<=sm;j++)for(let k=-sm;k<=sm;k++){ const xx=px+k*bs,yy=py+j*bs; a+=baseB(xx,yy)*(0.5+0.5*spk((xx/bs)|0,(yy/bs)|0)); cc++; } v=a/cc; } v=Math.pow(Math.min(1,Math.max(0,v)),gm); }
      const g=Math.max(4,Math.min(238,v*255))|0; ctx.fillStyle=`rgb(${g},${g},${g})`; ctx.fillRect(x0+px,top+py,bs,bs);
    }} ctx.strokeStyle=LINE; ctx.strokeRect(x0,top,hw,bh); };
  ctx.fillStyle="#0b0c0f"; ctx.fillRect(L,top,PW,bh);
  draw(L,false); draw(L+hw+28,true);
  ctx.textAlign="center";
  chip(ctx,"원본 (검파·압축 직후)",L+hw/2,top-10,MUTED,10,600);
  chip(ctx,"후처리 (감마·평활)",L+hw+28+hw/2,top-10,SIGNAL_DK,10,700);
  chip(ctx,"스페클은 잡음이 아니라 조직의 지문 — 평활은 절충",L+PW/2,top+bh+18,MUTED,9.5);
});
gmS.oninput = smS.oninput = post.redraw;
