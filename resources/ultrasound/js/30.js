/* ═══ 30 기계적 지수 · 애니메이션 ═══ */

/* ── c1 : MI 게이지 + 기포 (안정 진동 ↔ 관성 붕괴) ── */
const prS=document.getElementById("pr"), frS=document.getElementById("fr");

function bubbleRadius(MI, t){
  const R0=22;
  if(MI < 0.7) return {R:R0*(1+0.13*Math.sin(t*3.2)), phase:"stable", u:0};
  const u=(t*0.6)%1;
  const grow=Math.min(1,(MI-0.7)/1.5);
  const Rmax=R0*(1.4+2.5*grow), Rmin=R0*0.28;
  let R;
  if(u<0.6)       R=R0+(Rmax-R0)*Math.sin(u/0.6*Math.PI/2);
  else if(u<0.70) R=Rmax+(Rmin-Rmax)*((u-0.6)/0.10);
  else            R=Rmin+(R0-Rmin)*((u-0.70)/0.30);
  return {R, phase:"inertial", u, Rmax};
}

const gauge = makeScene("c1", 330, (ctx,W,H,t)=>{
  const Pr=+prS.value, f=+frS.value;
  const MI=Pr/Math.sqrt(f);
  document.getElementById("prv").textContent=Pr.toFixed(2);
  document.getElementById("frv").textContent=f.toFixed(1);
  document.getElementById("mi").textContent=MI.toFixed(2);
  let zoneCol, vtxt;
  if(MI<0.3){ zoneCol=SIGNAL_DK; vtxt="조영제도 안전"; }
  else if(MI<0.7){ zoneCol=SIGNAL_DK; vtxt="안정 — 진동만"; }
  else if(MI<1.9){ zoneCol=AMBER_DK; vtxt="주의 — 공동화 가능"; }
  else { zoneCol=POS; vtxt="FDA 한계 초과"; }
  const vd=document.getElementById("verdict"); vd.textContent=vtxt; vd.style.color=zoneCol;

  /* ── 왼쪽: 기포 챔버 ── */
  const bx=W*0.30, by=H*0.50;
  ctx.fillStyle="rgba(43,61,80,.04)";
  ctx.beginPath(); ctx.arc(bx,by,74,0,7); ctx.fill();
  const b=bubbleRadius(MI,t);

  if(b.phase==="inertial" && b.u>=0.70 && b.u<0.94){    /* 붕괴 충격파 */
    const rr=22*(1+(b.u-0.70)/0.24*3.4);
    ctx.strokeStyle=`rgba(179,18,60,${0.55*(1-(b.u-0.70)/0.24)})`;
    ctx.lineWidth=3; ctx.beginPath(); ctx.arc(bx,by,rr,0,7); ctx.stroke();
  }
  /* 기포 */
  const g=ctx.createRadialGradient(bx-b.R*0.3,by-b.R*0.3,1,bx,by,b.R);
  g.addColorStop(0,"rgba(255,255,255,.95)"); g.addColorStop(1, MI<0.7?"rgba(23,192,201,.30)":"rgba(240,165,0,.30)");
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(bx,by,b.R,0,7); ctx.fill();
  ctx.strokeStyle=MI<0.7?SIGNAL_DK:(MI<1.9?AMBER_DK:POS); ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(bx,by,b.R,0,7); ctx.stroke();

  if(b.phase==="stable"){                                /* 미세흐름 */
    ctx.strokeStyle="rgba(23,192,201,.5)"; ctx.lineWidth=1.4;
    for(let a=0;a<4;a++){
      const an=a*Math.PI/2+t*0.8, r1=b.R+8, r2=b.R+20;
      ctx.beginPath();
      ctx.arc(bx+Math.cos(an)*(r1+r2)/2, by+Math.sin(an)*(r1+r2)/2, 6, an+0.4, an+2.0);
      ctx.stroke();
    }
  } else if(b.u<0.70 && b.u>0.15){                        /* 팽창 화살표 */
    ctx.strokeStyle="rgba(240,165,0,.55)"; ctx.lineWidth=1.4;
    for(let a=0;a<6;a++){ const an=a*Math.PI/3;
      ctx.beginPath(); ctx.moveTo(bx+Math.cos(an)*(b.R+4),by+Math.sin(an)*(b.R+4));
      ctx.lineTo(bx+Math.cos(an)*(b.R+13),by+Math.sin(an)*(b.R+13)); ctx.stroke(); }
  }
  ctx.textAlign="center";
  chip(ctx, MI<0.7?"안정 진동 (미세흐름)":"관성 붕괴 (충격파·열점)", bx, by+92, MI<0.7?SIGNAL_DK:POS, 10.5);
  chip(ctx, MI<0.7?"기포가 잔잔히 숨쉼":"부풀었다 격렬히 무너짐", bx, H-14, MUTED, 9.5, 400);
  ctx.textAlign="left";

  /* ── 오른쪽: MI 세로 게이지 ── */
  const gx=W*0.62, gw=30, yTop=26, yBot=H-30, span=yBot-yTop, MImax=3;
  const yFor=mi=> yBot - Math.min(mi,MImax)/MImax*span;
  const zone=(lo,hi,col)=>{ ctx.fillStyle=col; ctx.fillRect(gx, yFor(hi), gw, yFor(lo)-yFor(hi)); };
  zone(0,0.3,"rgba(23,192,201,.12)");
  zone(0.3,0.7,"rgba(23,192,201,.26)");
  zone(0.7,1.9,"rgba(240,165,0,.24)");
  zone(1.9,MImax,"rgba(179,18,60,.24)");
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(gx,yTop,gw,span);

  const tick=(mi,txt,col)=>{
    ctx.strokeStyle=col; ctx.lineWidth=1.6; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(gx-4,yFor(mi)); ctx.lineTo(gx+gw+4,yFor(mi)); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="left"; chip(ctx,txt, gx+gw+9, yFor(mi)+3.5, col, 9.5);
  };
  tick(0.3,"조영제 0.3", SIGNAL_DK);
  tick(0.7,"공동화 0.7", AMBER_DK);
  tick(1.9,"FDA 1.9", POS);

  /* 현재 MI 마커 */
  const ym=yFor(MI);
  ctx.fillStyle=zoneCol; ctx.beginPath();
  ctx.moveTo(gx-6,ym); ctx.lineTo(gx-15,ym-6); ctx.lineTo(gx-15,ym+6); ctx.closePath(); ctx.fill();
  ctx.fillRect(gx, ym-1.4, gw, 2.8);
  ctx.textAlign="right"; chip(ctx,`MI ${MI.toFixed(2)}`, gx-17, ym+3.5, zoneCol, 11);
  ctx.textAlign="center"; chip(ctx,"MI", gx+gw/2, yTop-8, INK, 10.5); ctx.textAlign="left";
}, {play:"play", speed:0.04, tStill:0.45});
prS.oninput = frS.oninput = gauge.redraw;

/* ── c2 : 감쇠 보정 + 초점 — MI 최대 위치 ── */
const f2S=document.getElementById("f2"), fdS=document.getElementById("fd");

const der = makeScene("c2", 300, (ctx,W,H)=>{
  const f=+f2S.value, d=+fdS.value;
  const Dmax=14, Gmax=3.2, w=1.3;
  const Dp=x=> Math.pow(10, -0.3*f*x/20);          /* 감쇠(압력) */
  const G =x=> 1+(Gmax-1)*Math.exp(-Math.pow((x-d)/w,2)); /* 집속 이득 */
  const P =x=> Dp(x)*G(x);
  let xpk=0,Ppk=0; for(let x=0;x<=Dmax;x+=0.02){ const p=P(x); if(p>Ppk){Ppk=p;xpk=x;} }
  const attF=0.3*f*d;

  document.getElementById("f2v").textContent=f.toFixed(1);
  document.getElementById("fdv").textContent=d.toFixed(1);
  document.getElementById("ratt").textContent=attF.toFixed(1);
  document.getElementById("rpk").textContent=xpk.toFixed(1);
  document.getElementById("rgain").textContent=Ppk.toFixed(2);
  const st=document.getElementById("dstat");
  st.textContent = Ppk<1 ? `깊은 초점 — 감쇠가 집속 이득을 이김 (표면보다 약함)` : `초점서 ${Ppk.toFixed(2)}배로 증폭`;
  st.style.color = Ppk<1? POS : AMBER_DK;

  const L=50,R=16,PW=W-L-R, T=16,B=H-30, PH=B-T, yMax=3.6;
  const X=x=> L + x/Dmax*PW;
  const Y=p=> B - p/yMax*PH;

  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,T-2); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  chip(ctx,"깊이 (cm) →", L+PW/2, B+24, MUTED, 9.5, 400);
  ctx.save(); ctx.translate(L-36,(T+B)/2); ctx.rotate(-Math.PI/2); label(ctx,"음압 (송신=1)",-40,0,MUTED,9.5,400); ctx.restore();
  /* 송신=1 기준선 */
  ctx.strokeStyle="rgba(217,224,231,.9)"; ctx.setLineDash([2,4]);
  ctx.beginPath(); ctx.moveTo(L,Y(1)); ctx.lineTo(L+PW,Y(1)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="left"; chip(ctx,"송신 1.0", L+4, Y(1)-4, MUTED, 9, 400);

  /* 감쇠 포락선 */
  ctx.strokeStyle=NEG; ctx.lineWidth=1.6; ctx.setLineDash([5,4]); ctx.beginPath();
  for(let x=0;x<=Dmax;x+=0.1){ const px=X(x),py=Y(Dp(x)); x?ctx.lineTo(px,py):ctx.moveTo(px,py); }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; chip(ctx,"감쇠만 (0.3 dB/cm/MHz)", L+PW-2, Y(Dp(Dmax*0.62))-4, NEG, 9);

  /* 실효 음압 = 감쇠 × 집속 */
  const path=new Path2D(); path.moveTo(L,B);
  for(let x=0;x<=Dmax;x+=0.05){ path.lineTo(X(x),Y(P(x))); }
  path.lineTo(X(Dmax),B); path.closePath();
  ctx.fillStyle="rgba(179,18,60,.12)"; ctx.fill(path);
  ctx.strokeStyle=POS; ctx.lineWidth=2.2; ctx.beginPath();
  for(let x=0;x<=Dmax;x+=0.05){ const px=X(x),py=Y(P(x)); x?ctx.lineTo(px,py):ctx.moveTo(px,py); }
  ctx.stroke();

  /* 설정 초점 */
  ctx.strokeStyle="rgba(240,165,0,.5)"; ctx.lineWidth=1.4; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(X(d),T); ctx.lineTo(X(d),B); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="center"; chip(ctx,"설정 초점", X(d), B-4, AMBER_DK, 9);

  /* MI 최대 마커 */
  ctx.fillStyle=AMBER; ctx.beginPath(); ctx.arc(X(xpk),Y(Ppk),5,0,7); ctx.fill();
  ctx.strokeStyle=AMBER_DK; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(X(xpk),Y(Ppk),5,0,7); ctx.stroke();
  chip(ctx,`MI 최대 ×${Ppk.toFixed(2)}`, X(xpk), Y(Ppk)-11, AMBER_DK, 10);
  ctx.textAlign="left";
});
f2S.oninput = fdS.oninput = der.redraw;
