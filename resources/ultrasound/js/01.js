/* ═══ 01 진동과 파동 · 애니메이션 ═══
   공통 유틸은 assets/core.js 에 있습니다. */

/* 이 장의 파동 상수 — 숫자를 바꾸면 두 애니메이션에 함께 반영됩니다. */
const LAM = 132, K = 2*Math.PI/LAM, OM = 1.9;

/* 가우시안 없는 순수 정현파: 변위 ξ = A·sin(kx − ωt)
   압력은 p ∝ −∂ξ/∂x ∝ −cos(kx − ωt)  ← 압축 띠와 정확히 정렬됨 */

/* ── 히어로: 종파 + 압력 ── */
const ampS = document.getElementById("amp");
const hero = makeScene("c1", 330, (ctx,W,H,t)=>{
  const A = +ampS.value;
  document.getElementById("ampv").textContent = A;
  const ROWS=8, DX=9, FY=26, FH=176, PY=222, PH=48;

  ctx.fillStyle="rgba(46,61,84,.03)"; ctx.fillRect(0,FY-8,W,FH+16);
  for(let x=0;x<W;x+=3){
    const p=-Math.cos(K*x-OM*t), a=Math.abs(p)*(A/14)*0.16;
    ctx.fillStyle = p>0 ? `rgba(179,18,60,${a})` : `rgba(27,79,160,${a})`;
    ctx.fillRect(x,FY-8,3,FH+16);
  }
  const trackX0 = Math.round(W*0.42/DX)*DX, trackRow = 4;
  for(let r=0;r<ROWS;r++){
    const y = FY+12+r*((FH-24)/(ROWS-1));
    for(let x0=DX;x0<W-DX;x0+=DX){
      if(x0===trackX0 && r===trackRow) continue;
      ctx.beginPath(); ctx.arc(x0+A*Math.sin(K*x0-OM*t),y,2.1,0,7);
      ctx.fillStyle="rgba(27,79,160,.5)"; ctx.fill();
    }
  }
  const ty = FY+12+trackRow*((FH-24)/(ROWS-1));
  const tx = trackX0 + A*Math.sin(K*trackX0-OM*t);
  ctx.strokeStyle="rgba(179,18,60,.32)"; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(trackX0-A-4,ty); ctx.lineTo(trackX0+A+4,ty); ctx.stroke();
  [-1,1].forEach(s=>{ ctx.beginPath(); ctx.moveTo(trackX0+s*(A+4),ty-4); ctx.lineTo(trackX0+s*(A+4),ty+4); ctx.stroke(); });
  ctx.strokeStyle="rgba(110,125,147,.45)"; ctx.setLineDash([2,3]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(trackX0,FY); ctx.lineTo(trackX0,ty-7); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(tx,ty,4.6,0,7); ctx.fillStyle=POS; ctx.fill();
  ctx.textAlign="center"; label(ctx,"제자리 진동",trackX0,ty+20,POS,9.5);
  label(ctx,"평형 위치",trackX0,FY-3,MUTED,8.5,400); ctx.textAlign="left";

  let cx=((Math.PI+OM*t)/K)%LAM;
  while(cx<W){
    if(cx>16&&cx<W-16){ ctx.fillStyle=POS; ctx.beginPath();
      ctx.moveTo(cx,FY-11); ctx.lineTo(cx-4.5,FY-19); ctx.lineTo(cx+4.5,FY-19); ctx.closePath(); ctx.fill(); }
    cx+=LAM;
  }
  label(ctx,"압축 띠가 이동 →",8,FY-11,POS,9.5);

  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(0,PY); ctx.lineTo(W,PY); ctx.stroke(); ctx.setLineDash([]);
  const pts=[]; for(let x=0;x<=W;x++) pts.push([x, PY-(-Math.cos(K*x-OM*t))*PH*(A/14)]);
  fillWave(ctx,W,PY,pts);
  label(ctx,"음압 PRESSURE",8,PY-PH-6,MUTED,9.5);

  let a1=((Math.PI+OM*t)/K)%LAM; if(a1<40) a1+=LAM;
  const a2=a1+LAM;
  if(a2<W-8){
    const yL=H-16;
    ctx.strokeStyle=AMBER; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(a1,yL-7); ctx.lineTo(a1,yL+5); ctx.moveTo(a2,yL-7); ctx.lineTo(a2,yL+5);
    ctx.moveTo(a1,yL); ctx.lineTo(a2,yL); ctx.stroke();
    ctx.fillStyle=WELL; ctx.fillRect((a1+a2)/2-13,yL-8,26,15);
    ctx.textAlign="center"; label(ctx,"λ",(a1+a2)/2,yL+4,AMBER_DK,12); ctx.textAlign="left";
  }
  ray(ctx,W-108,H-14,W-72,H-14,INK,1.6);
  label(ctx,"파동 WAVE",W-66,H-11,INK,9.5);
}, {play:"play", state:"hstate", speed:0.018, tStill:1.4});
ampS.oninput = hero.redraw;

/* ── 종파 vs 횡파 비교 ── */
makeScene("c2", 330, (ctx,W,H,t)=>{
  const A=7.5, DX=9, ROWS=5;
  const trackX0=Math.round(W*0.42/DX)*DX;
  const lam=(cy0,cy1)=>{
    let a1=((Math.PI+OM*t)/K)%LAM; if(a1<40) a1+=LAM;
    const a2=a1+LAM; if(a2>W-8) return;
    ctx.strokeStyle=AMBER; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(a1,cy0); ctx.lineTo(a1,cy1); ctx.moveTo(a2,cy0); ctx.lineTo(a2,cy1);
    ctx.moveTo(a1,cy1-1); ctx.lineTo(a2,cy1-1); ctx.stroke();
    ctx.fillStyle=WELL; ctx.fillRect((a1+a2)/2-13,cy1-9,26,15);
    ctx.textAlign="center"; label(ctx,"λ",(a1+a2)/2,cy1+3,AMBER_DK,12); ctx.textAlign="left";
  };
  /* 상단: 종파 */
  const y0=40, hgt=90;
  ctx.fillStyle="rgba(46,61,84,.03)"; ctx.fillRect(0,y0-8,W,hgt+16);
  for(let x=0;x<W;x+=3){
    const p=-Math.cos(K*x-OM*t);
    ctx.fillStyle = p>0?`rgba(179,18,60,${Math.abs(p)*0.13})`:`rgba(27,79,160,${Math.abs(p)*0.13})`;
    ctx.fillRect(x,y0-8,3,hgt+16);
  }
  for(let r=0;r<ROWS;r++){
    const y=y0+8+r*((hgt-16)/(ROWS-1));
    for(let x0=DX;x0<W-DX;x0+=DX){
      if(x0===trackX0&&r===2) continue;
      ctx.beginPath(); ctx.arc(x0+A*Math.sin(K*x0-OM*t),y,2.1,0,7);
      ctx.fillStyle="rgba(27,79,160,.5)"; ctx.fill();
    }
  }
  const ty1=y0+8+2*((hgt-16)/(ROWS-1));
  ctx.strokeStyle="rgba(179,18,60,.32)"; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(trackX0-A-5,ty1); ctx.lineTo(trackX0+A+5,ty1); ctx.stroke();
  ctx.beginPath(); ctx.arc(trackX0+A*Math.sin(K*trackX0-OM*t),ty1,4.6,0,7); ctx.fillStyle=POS; ctx.fill();
  label(ctx,"종파 LONGITUDINAL",8,22,INK,12);
  label(ctx,"입자 ← →  (전파 방향과 나란함)",176,22,POS,10);
  lam(y0-8,y0+hgt+16);
  /* 하단: 횡파 */
  const y1=196, hgt2=90;
  ctx.fillStyle="rgba(46,61,84,.03)"; ctx.fillRect(0,y1-8,W,hgt2+16);
  for(let r=0;r<ROWS;r++){
    const yb=y1+8+r*((hgt2-16)/(ROWS-1));
    for(let x0=DX;x0<W-DX;x0+=DX){
      if(x0===trackX0&&r===2) continue;
      ctx.beginPath(); ctx.arc(x0,yb+A*Math.sin(K*x0-OM*t),2.1,0,7);
      ctx.fillStyle="rgba(27,160,90,.5)"; ctx.fill();
    }
  }
  const ty2=y1+8+2*((hgt2-16)/(ROWS-1));
  ctx.strokeStyle="rgba(179,18,60,.32)"; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(trackX0,ty2-A-5); ctx.lineTo(trackX0,ty2+A+5); ctx.stroke();
  ctx.beginPath(); ctx.arc(trackX0,ty2+A*Math.sin(K*trackX0-OM*t),4.6,0,7); ctx.fillStyle=POS; ctx.fill();
  label(ctx,"횡파 TRANSVERSE",8,y1-18,INK,12);
  label(ctx,"입자 ↑ ↓  (전파 방향과 수직)",162,y1-18,POS,10);
  lam(y1-8,y1+hgt2+16);

  ray(ctx,W-108,H-14,W-72,H-14,INK,1.6);
  label(ctx,"파동 WAVE →",W-66,H-11,INK,9.5);
  label(ctx,"두 파동 모두 파장 λ 와 주파수가 같습니다 — 다른 것은 입자의 진동 방향뿐입니다.",8,H-11,MUTED,9.5,400);
}, {play:"play2", state:"hstate2", speed:0.018, tStill:1.4});
