/* ═══ 23 검파와 압축 · 애니메이션 ═══  (디지털 백엔드 시작)
   검증: 포락선 = |해석신호| = √(I²+Q²) · IQ→baseband, Hilbert→통과대역(90°차), 둘 다 |·|=포락선
          로그압축 gray = 255·(dB+DR)/DR (dB≤0) */

function env23(t){
  return 0.92*Math.exp(-Math.pow((t-0.26)/0.052,2))
       + 0.46*Math.exp(-Math.pow((t-0.55)/0.05,2))
       + 0.70*Math.exp(-Math.pow((t-0.82)/0.055,2));
}

/* 스펙트럼 봉우리 (가우시안) · fillA 채움 or null · dash 점선 */
function hump(ctx, cx, base, h, w, stroke, fillA, dash){
  const path=()=>{ ctx.beginPath(); for(let dx=-w;dx<=w;dx+=1){ const y=base-h*Math.exp(-Math.pow(dx/w*2.0,2)); dx===-w?ctx.moveTo(cx+dx,y):ctx.lineTo(cx+dx,y);} };
  ctx.save(); if(dash) ctx.setLineDash([3,3]);
  if(fillA){ path(); ctx.lineTo(cx+w,base); ctx.lineTo(cx-w,base); ctx.closePath(); ctx.fillStyle=fillA; ctx.fill(); }
  path(); ctx.strokeStyle=stroke; ctx.lineWidth=1.8; ctx.stroke(); ctx.restore();
}
function xmark(ctx,x,y){ ctx.strokeStyle=POS; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(x-6,y-6); ctx.lineTo(x+6,y+6); ctx.moveTo(x+6,y-6); ctx.lineTo(x-6,y+6); ctx.stroke(); }

/* ── c1 : 검파 — IQ(하향혼합+LPF+decimation) vs Hilbert · 시간 + 스펙트럼 ── */
const methB=document.getElementById("meth");
let HILB=false;
if(methB) methB.onclick=()=>{ HILB=!HILB; methB.textContent=HILB?"IQ 복조 보기":"Hilbert 보기"; det.redraw(); };
const det=makeScene("c1", 328, (ctx,W,H)=>{
  FS*=1.1;
  const f0=13;
  document.getElementById("mname").textContent = HILB? "Hilbert 변환" : "IQ 복조";
  const st=document.getElementById("dstat");
  st.textContent = HILB
    ? "Hilbert — 음의 주파수만 제거(한쪽 스펙트럼) · 반송파 f₀ 유지(통과대역)"
    : "IQ — 하향혼합으로 0 Hz 로 · LPF 제거 · 대역 좁아 decimation(↓데이터율) · DAS·도플러도 이 IQ 에서";
  st.style.color = SIGNAL_DK;

  const L=22,R=22,PW=W-L-R;
  /* === 시간 영역 (위) === */
  const tMid=84, tAmp=46, Yr=v=>tMid-v*tAmp;
  ctx.textAlign="left"; chip(ctx,"시간 영역",L,24,INK,12,700);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(L,tMid); ctx.lineTo(L+PW,tMid); ctx.stroke();
  const drawEnv=sgn=>{ ctx.strokeStyle=sgn>0?AMBER_DK:"rgba(138,95,0,.4)"; ctx.lineWidth=sgn>0?2.4:1.3;
    ctx.beginPath(); for(let px=0;px<=PW;px++){ const t=px/PW, v=sgn*env23(t); px?ctx.lineTo(L+px,Yr(v)):ctx.moveTo(L+px,Yr(v)); } ctx.stroke(); };
  if(HILB){
    ctx.strokeStyle="rgba(23,192,201,.85)"; ctx.lineWidth=1.3; ctx.beginPath();
    for(let px=0;px<=PW;px++){ const t=px/PW, v=env23(t)*Math.cos(2*Math.PI*f0*t); px?ctx.lineTo(L+px,Yr(v)):ctx.moveTo(L+px,Yr(v)); } ctx.stroke();
    ctx.strokeStyle="rgba(27,79,160,.7)"; ctx.lineWidth=1.2; ctx.beginPath();
    for(let px=0;px<=PW;px++){ const t=px/PW, v=env23(t)*Math.sin(2*Math.PI*f0*t); px?ctx.lineTo(L+px,Yr(v)):ctx.moveTo(L+px,Yr(v)); } ctx.stroke();
    drawEnv(1); drawEnv(-1);
    chip(ctx,"x = RF (반송파 유지)",L+120,24,SIGNAL_DK,11);
    chip(ctx,"x_H = 90°",L+300,24,NEG,11);
    chip(ctx,"|·| = 포락선",L+PW-108,24,AMBER_DK,11);
  } else {
    const phi=t=>2*Math.PI*1.2*t;
    ctx.strokeStyle="rgba(90,106,125,.3)"; ctx.lineWidth=1; ctx.beginPath();
    for(let px=0;px<=PW;px++){ const t=px/PW, v=env23(t)*Math.cos(2*Math.PI*f0*t); px?ctx.lineTo(L+px,Yr(v)):ctx.moveTo(L+px,Yr(v)); } ctx.stroke();
    ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2; ctx.beginPath();
    for(let px=0;px<=PW;px++){ const t=px/PW, v=env23(t)*Math.cos(phi(t)); px?ctx.lineTo(L+px,Yr(v)):ctx.moveTo(L+px,Yr(v)); } ctx.stroke();
    ctx.strokeStyle=NEG; ctx.lineWidth=2; ctx.beginPath();
    for(let px=0;px<=PW;px++){ const t=px/PW, v=env23(t)*Math.sin(phi(t)); px?ctx.lineTo(L+px,Yr(v)):ctx.moveTo(L+px,Yr(v)); } ctx.stroke();
    drawEnv(1); drawEnv(-1);
    chip(ctx,"I (기저대역)",L+118,24,SIGNAL_DK,11);
    chip(ctx,"Q",L+262,24,NEG,11);
    chip(ctx,"|·| = 포락선",L+PW-108,24,AMBER_DK,11);
    chip(ctx,"회색 = 원 RF",L+2,tMid+tAmp+6,MUTED,10);
  }

  /* === 주파수 스펙트럼 (아래, 바짝 붙임) === */
  const sBase=298, hMax=98, cx=L+PW*0.46, du=PW*0.18, w=du*0.4;
  ctx.textAlign="left"; chip(ctx,"주파수 스펙트럼",L,152,INK,12,700);
  ctx.strokeStyle=INK; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(L,sBase); ctx.lineTo(L+PW,sBase); ctx.stroke();
  const fx=u=> cx+u*du;
  ctx.textAlign="center";
  [[-2,"−2f₀"],[-1,"−f₀"],[0,"0"],[1,"f₀"],[2,"2f₀"]].forEach(([u,s])=>{ const x=fx(u);
    ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(x,sBase); ctx.lineTo(x,sBase+4); ctx.stroke();
    label(ctx,s,x,sBase+18,MUTED,10.5,600); });
  label(ctx,"주파수 →",L+PW-38,sBase+18,MUTED,9.5,400);
  if(HILB){
    hump(ctx, fx(-1), sBase, hMax*0.66, w, "rgba(150,160,170,.6)", null, true); xmark(ctx, fx(-1), sBase-hMax*0.33);
    hump(ctx, fx(1),  sBase, hMax, w, SIGNAL_DK, "rgba(23,192,201,.16)", false);
    chip(ctx,"−f₀ 제거",fx(-1),sBase-hMax*0.66-10,POS,10.5);
    chip(ctx,"+f₀ 유지 (반송파)",fx(1),190,SIGNAL_DK,10.5);
    ctx.textAlign="right"; label(ctx,"통과대역 · 표본율 그대로",L+PW-4,172,MUTED,10,500); ctx.textAlign="center";
  } else {
    hump(ctx, fx(-1), sBase, hMax*0.55, w, "rgba(150,160,170,.5)", null, true);
    hump(ctx, fx(1),  sBase, hMax*0.55, w, "rgba(150,160,170,.5)", null, true);
    /* 하향혼합 화살표 +f0 → 0 */
    ctx.strokeStyle=AMBER_DK; ctx.lineWidth=1.6; ctx.beginPath();
    ctx.moveTo(fx(1),sBase-hMax*0.55-8); ctx.quadraticCurveTo((fx(1)+fx(0))/2, 180, fx(0)+8, sBase-hMax*0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx(0)+8,sBase-hMax*0.9); ctx.lineTo(fx(0)+15,sBase-hMax*0.9-4); ctx.moveTo(fx(0)+8,sBase-hMax*0.9); ctx.lineTo(fx(0)+15,sBase-hMax*0.9+3); ctx.stroke();
    chip(ctx,"×e^(−j2πf₀t)",(fx(1)+fx(0))/2,172,AMBER_DK,10);
    hump(ctx, fx(-2), sBase, hMax*0.5, w, "rgba(150,160,170,.5)", null, true); xmark(ctx, fx(-2), sBase-hMax*0.25);
    chip(ctx,"LPF 제거",fx(-2),sBase-hMax*0.5-10,POS,10.5);
    hump(ctx, fx(0), sBase, hMax, w*0.9, SIGNAL_DK, "rgba(23,192,201,.16)", false);
    chip(ctx,"기저대역 I+jQ",fx(0),190,SIGNAL_DK,10.5);
    ctx.fillStyle=AMBER_DK; for(let k=-2;k<=2;k++){ ctx.beginPath(); ctx.arc(fx(0)+k*du*0.16, sBase+9, 1.6,0,7); ctx.fill(); }
    ctx.textAlign="right"; label(ctx,"대역 좁음 → decimation (↓fs)",L+PW-4,172,AMBER_DK,10,600); ctx.textAlign="center";
  }
  ctx.textAlign="left";
});

/* ── c2 : 로그 압축 — 동적범위 창에 따른 B-모드 영상 변화 ── */
const drS=document.getElementById("dr");
const comp=makeScene("c2", 350, (ctx,W,H)=>{
  FS*=1.12;
  const DR=+drS.value;
  document.getElementById("drv").textContent=DR;
  const gray=db=> Math.max(0,Math.min(255, 255*(db+DR)/DR));
  const st=document.getElementById("cstat");
  if(DR<=45){ st.textContent="좁은 창 — 약한 조직 검게 잘림, 경계 대비↑"; st.style.color=AMBER_DK; }
  else if(DR>=75){ st.textContent="넓은 창 — 미세 계조 다 보이나 전체가 흐릿"; st.style.color=SIGNAL_DK; }
  else { st.textContent="중간 — 대비와 계조의 절충"; st.style.color=SIGNAL_DK; }

  const spk=(bx,by)=>{ let h=(bx*73856093)^(by*19349663); h=Math.imul(h^(h>>>13),1274126177); return ((h>>>0)%1000)/1000; };
  /* 구조별 에코 세기 (dB, 0 = 최강) */
  const imX=22, imY=40, imW=Math.min(300,(W-70)*0.56), imH=H-imY-42, bs=4;
  const struct=(u,v)=>{                      /* u,v: 0~1 */
    if(v<0.12) return -4;                     /* 피부/경계 (강) */
    const lesx=0.36, lesy=0.5, lr=Math.hypot((u-lesx)/0.14,(v-lesy)/0.20);
    if(lr<1) return -58;                       /* 저에코 병변 (약) */
    const cyx=0.7, cyy=0.42, cr=Math.hypot((u-cyx)/0.10,(v-cyy)/0.13);
    if(cr<1) return -80;                       /* 낭종 (거의 무에코) */
    if(v>0.72) return -30 - (v-0.72)*70;       /* 심부 (감쇠) */
    return -26;                                /* 일반 조직 (중) */
  };
  ctx.fillStyle="#000"; ctx.fillRect(imX,imY,imW,imH);
  for(let py=0;py<imH;py+=bs) for(let px=0;px<imW;px+=bs){
    const u=px/imW, v=py/imH, db=struct(u,v);
    const g=Math.max(0,Math.min(238, gray(db)*(0.55+0.45*spk((px/bs)|0,(py/bs)|0))))|0;
    ctx.fillStyle=`rgb(${g},${g},${g})`; ctx.fillRect(imX+px,imY+py,bs,bs);
  }
  ctx.strokeStyle=LINE; ctx.strokeRect(imX,imY,imW,imH);
  ctx.textAlign="center"; chip(ctx,`B-모드 · 표시 동적범위 ${DR} dB`,imX+imW/2,imY-10,INK,10,700); ctx.textAlign="left";

  /* 오른쪽: 압축 곡선 + 구조 표시 */
  const cX=imX+imW+40, cW=W-cX-20, cTop=imY+8, cBot=imY+imH-30, cPH=cBot-cTop;
  const Xdb=db=> cX+(db+100)/100*cW, Yg=g=> cBot-g/255*cPH;
  ctx.strokeStyle=AMBER; ctx.lineWidth=2.4; ctx.beginPath();
  for(let db=-100;db<=0;db+=1){ const x=Xdb(db),y=Yg(gray(db)); db===-100?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();
  ctx.strokeStyle="rgba(240,165,0,.5)"; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(Xdb(-DR),cTop); ctx.lineTo(Xdb(-DR),cBot); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="left"; chip(ctx,`창 = ${DR} dB`,Xdb(-DR)+5,cTop+10,AMBER_DK,9);
  ctx.strokeStyle=INK; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(cX,cBot); ctx.lineTo(cX+cW,cBot); ctx.stroke();
  ctx.textAlign="center"; [-100,-60,-20,0].forEach(db=> label(ctx,String(db),Xdb(db),cBot+15,MUTED,8.5,400));
  label(ctx,"입력 dB → 회색",cX+cW/2,cBot+30,MUTED,9,500);
  /* 구조 점 표시 */
  [[-4,"경계"],[-30,"조직"],[-58,"병변"],[-80,"낭종"]].forEach(([db,n])=>{ const g=gray(db)|0;
    ctx.fillStyle=`rgb(${g},${g},${g})`; ctx.strokeStyle=INK2; ctx.beginPath(); ctx.arc(Xdb(db),Yg(gray(db)),4.5,0,7); ctx.fill(); ctx.stroke();
    ctx.textAlign="center"; label(ctx,n,Xdb(db),Yg(gray(db))-9,g>10?INK:MUTED,8.5,600); });
  ctx.textAlign="center"; chip(ctx,"창을 좁히면 병변·낭종이 검게 잘림 → 대비↑",cX+cW/2,cTop-6,MUTED,9);
});
drS.oninput=comp.redraw;
