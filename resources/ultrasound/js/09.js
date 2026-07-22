/* ═══ 09 압전 효과 · 애니메이션 ═══ */

/* ══════════════════════════════════════════════════════════
   히어로 · 압전 효과의 양방향성
     왼쪽  역효과: 전압 버스트 → 판이 떨림 → 음파 나감   (송신)
     오른쪽 정효과: 음파 버스트 들어옴 → 판이 떨림 → 전압 (수신)

   연속파가 아니라 '버스트'입니다. 영상 초음파가 실제로 하는 일이
   짧은 펄스를 쏘고 조용히 듣는 것이기 때문입니다 (펄스-에코).

   지킨 물리:
     · 면의 변위 ξ ∝ sin(ωt)  →  면의 속도 u = dξ/dt ∝ cos(ωt)
       방사 음압 p = Z·u ∝ cos(ωt).   즉 음압은 변위가 아니라 '속도'를 따라감.
       (가장 많이 나왔을 때가 아니라, 가장 빨리 움직일 때 압력이 최대)
     · 버스트는 지연시간 τ = t − 거리/속도 로 전파. 포락선이 실제로 이동함.
   ══════════════════════════════════════════════════════════ */
const OMp = 2.0, LAMp = 76, Kp = 2*Math.PI/LAMp;
const Cp  = OMp/Kp;          /* 화면상 파동 속도 (px/틱) */
const TREP = 20;             /* 버스트 반복 주기 (틱) */
const SIGB = 2.67;           /* 버스트 폭 → 약 2 사이클 */
const exgS = document.getElementById("exg");
let PT = 0;                  /* 두 패널이 공유하는 시간 */

/* 버스트 포락선. τ = 0 (mod TREP) 에서 봉우리, 그 사이는 정적. */
function burst(tau){
  let u = tau % TREP; if(u < 0) u += TREP;
  const d = Math.min(u, TREP - u);
  return Math.exp(-(d*d)/(2*SIGB*SIGB));
}

/* 판 + 전극 공통 그리기.  hw = 현재 반두께,  polarity = 전극 극성(−1~1) */
function plate(ctx, cx, cy, hw, polarity){
  const HH = 58;
  const g = ctx.createLinearGradient(cx-hw, 0, cx+hw, 0);
  g.addColorStop(0, "rgba(43,61,80,.30)"); g.addColorStop(0.5, "rgba(43,61,80,.16)");
  g.addColorStop(1, "rgba(43,61,80,.30)");
  ctx.fillStyle = g; ctx.fillRect(cx-hw, cy-HH, hw*2, HH*2);
  ctx.strokeStyle = INK2; ctx.lineWidth = 1.2; ctx.strokeRect(cx-hw, cy-HH, hw*2, HH*2);
  const pos = polarity >= 0;
  ctx.fillStyle = pos ? POS : NEG; ctx.fillRect(cx-hw-5, cy-HH, 5, HH*2);
  ctx.fillStyle = pos ? NEG : POS; ctx.fillRect(cx+hw, cy-HH, 5, HH*2);
  if(Math.abs(polarity) > 0.15){
    ctx.textAlign = "center";
    label(ctx, pos?"+":"−", cx-hw-2.5, cy-HH-6, pos?POS:NEG, 14);
    label(ctx, pos?"−":"+", cx+hw+2.5, cy-HH-6, pos?NEG:POS, 14);
    ctx.textAlign = "left";
  }
  for(let i=0;i<4;i++){
    const yy = cy-HH+HH*2*(i+0.5)/4;
    ctx.strokeStyle = "rgba(23,192,201,.75)"; ctx.lineWidth = 1.8; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(cx-hw*0.5, yy); ctx.lineTo(cx+hw*0.5, yy); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx+hw*0.5, yy, 2.2, 0, 7); ctx.fillStyle = SIGNAL; ctx.fill();
  }
  return HH;
}

/* 작은 V(t) 트레이스. 좌상단 전용. */
function trace(ctx, tx, ty, col, fn, now){
  const tw = 62;
  ctx.strokeStyle = LINE; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx+tw, ty); ctx.stroke();
  ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath();
  for(let i=0;i<=tw;i++){
    const tt = now - (tw-i)*0.10;
    const y = ty - fn(tt)*10;
    i ? ctx.lineTo(tx+i, y) : ctx.moveTo(tx+i, y);
  }
  ctx.stroke();
  ctx.beginPath(); ctx.arc(tx+tw, ty - fn(now)*10, 3, 0, 7); ctx.fillStyle = col; ctx.fill();
  chip(ctx, "V(t)", tx-2, ty-16, col, 13);
}

/* ── ① 역효과 · 송신 ── */
const scA = makeScene("cA", 310, (ctx,W,H)=>{
  FS *= 1.5;
  const E = +exgS.value;
  const cy = H*0.48, cx = W*0.34, hw0 = 17, x0 = cx + hw0 + 6;
  const drive = tt => burst(tt) * Math.sin(OMp*tt);     /* 인가 전압 버스트 */
  const V  = drive(PT);
  const hw = hw0 + E*V;                                  /* 두께는 전압을 따라감 */

  /* 방사 음압: p ∝ 면의 속도 ∝ cos(ωt),  포락선은 지연시간으로 전파 */
  if(E > 0.05){
    const pts=[];
    for(let x=x0; x<=W-4; x++){
      const tau = PT - (x-x0)/Cp;
      pts.push([x, cy - burst(tau)*Math.cos(Kp*(x-x0) - OMp*PT)*44*(E/12)]);
    }
    if(pts.length>2) fillWave(ctx, W, cy, pts);
  }
  const HH = plate(ctx, cx, cy, hw, V);

  /* 교류 전원 + 배선 */
  const sx = 34;
  ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(sx, cy-16); ctx.lineTo(sx, cy-HH-16); ctx.lineTo(cx-hw-2.5, cy-HH-16); ctx.lineTo(cx-hw-2.5, cy-HH);
  ctx.moveTo(sx, cy+16); ctx.lineTo(sx, cy+HH+16); ctx.lineTo(cx+hw+2.5, cy+HH+16); ctx.lineTo(cx+hw+2.5, cy+HH);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(sx, cy, 15, 0, 7);
  ctx.fillStyle = CARD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = Math.abs(V)>0.05 ? (V>=0?POS:NEG) : MUTED; ctx.lineWidth = 2; ctx.beginPath();
  for(let i=-7;i<=7;i++) ctx.lineTo(sx+i, cy - Math.sin(i/7*Math.PI)*5);
  ctx.stroke();
  ctx.textAlign="center"; chip(ctx,"교류 전원", sx, cy+32, INK, 12.5); ctx.textAlign="left";

  trace(ctx, 22, 30, POS, drive, PT);

  /* 두께 자 */
  ctx.strokeStyle=AMBER; ctx.lineWidth=1.6;
  const yb=cy+HH+13;
  ctx.beginPath(); ctx.moveTo(cx-hw,yb-5); ctx.lineTo(cx-hw,yb+5);
  ctx.moveTo(cx+hw,yb-5); ctx.lineTo(cx+hw,yb+5); ctx.moveTo(cx-hw,yb); ctx.lineTo(cx+hw,yb); ctx.stroke();
  ctx.textAlign="center"; chip(ctx,"두께가 떨림", cx, yb+18, AMBER_DK, 12.5); ctx.textAlign="left";

  /* ★ 사슬 라벨 — 우측 상단 (좌상단 V(t) 와 겹치지 않게) */
  ctx.textAlign="right";
  chip(ctx, "전압 → 변형 → 음파", W-8, 22, SIGNAL_DK, 13.5);
  ctx.textAlign="left";

  if(E>0.05){
    ray(ctx, x0+14, H-16, x0+64, H-16, POS, 1.8);
    chip(ctx, burst(PT)>0.05 ? "버스트 발사 →" : "…다음 버스트 대기", x0+70, H-12, burst(PT)>0.05?POS:MUTED, 12.5);
  }
});

/* ── ② 정효과 · 수신 ── */
const scB = makeScene("cB", 310, (ctx,W,H)=>{
  FS *= 1.5;
  const E = +exgS.value;
  const cy = H*0.48, cx = W*0.34, hw0 = 17, x0 = cx + hw0 + 6;
  /* 오른쪽 끝에서 들어와 왼쪽으로 가는 버스트 */
  const arrive = W - x0;                                  /* 앞면까지의 거리 */
  const Pface = tt => burst(tt - arrive/Cp) * Math.cos(OMp*tt);   /* 앞면 음압 */
  const P  = Pface(PT);
  const hw = hw0 - E*P*0.85;                              /* 눌리면 얇아짐 */

  if(E > 0.05){
    const pts=[];
    for(let x=x0; x<=W-4; x++){
      const tau = PT - (W-x)/Cp;
      pts.push([x, cy - burst(tau)*Math.cos(Kp*(x-x0) + OMp*PT)*44*(E/12)]);
    }
    if(pts.length>2) fillWave(ctx, W, cy, pts);
  }
  const HH = plate(ctx, cx, cy, hw, -P);

  /* 전압계 + 배선 */
  const sx = 34;
  ctx.strokeStyle = INK; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(sx, cy-16); ctx.lineTo(sx, cy-HH-16); ctx.lineTo(cx-hw-2.5, cy-HH-16); ctx.lineTo(cx-hw-2.5, cy-HH);
  ctx.moveTo(sx, cy+16); ctx.lineTo(sx, cy+HH+16); ctx.lineTo(cx+hw+2.5, cy+HH+16); ctx.lineTo(cx+hw+2.5, cy+HH);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(sx, cy, 15, 0, 7);
  ctx.fillStyle = CARD; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign="center"; label(ctx,"V", sx, cy+5, Math.abs(P)>0.15?SIGNAL_DK:MUTED, 15);
  chip(ctx,"전압계", sx, cy+32, INK, 12.5); ctx.textAlign="left";

  trace(ctx, 22, 30, SIGNAL_DK, tt => Pface(tt)*(E/12), PT);

  ctx.strokeStyle=AMBER; ctx.lineWidth=1.6;
  const yb=cy+HH+13;
  ctx.beginPath(); ctx.moveTo(cx-hw,yb-5); ctx.lineTo(cx-hw,yb+5);
  ctx.moveTo(cx+hw,yb-5); ctx.lineTo(cx+hw,yb+5); ctx.moveTo(cx-hw,yb); ctx.lineTo(cx+hw,yb); ctx.stroke();
  ctx.textAlign="center"; chip(ctx,"두께가 떨림", cx, yb+18, AMBER_DK, 12.5); ctx.textAlign="left";

  /* ★ 사슬 라벨 — 우측 상단 */
  ctx.textAlign="right";
  chip(ctx, "음파 → 변형 → 전압", W-8, 22, SIGNAL_DK, 13.5);
  ctx.textAlign="left";

  if(E>0.05){
    ray(ctx, W-24, H-16, W-74, H-16, POS, 1.8);
    ctx.textAlign="right";
    chip(ctx, Math.abs(P)>0.05 ? "← 버스트 도착" : "…버스트 오는 중", W-80, H-12, Math.abs(P)>0.05?POS:MUTED, 12.5);
    ctx.textAlign="left";
  }
});

/* 두 패널을 하나의 루프로 함께 돌립니다 */
(function(){
  let run = !REDUCE;
  const btn = document.getElementById("pzplay"), st = document.getElementById("pzstat");
  const lbl = ()=>{ btn.textContent = run?"일시정지":"재생"; st.textContent = run?"재생 중":"정지"; };
  btn.onclick = ()=>{ run=!run; lbl(); if(run) loop(); };
  function loop(){ if(!run) return; PT += 0.042; scA.redraw(); scB.redraw(); requestAnimationFrame(loop); }
  lbl();
  exgS.oninput = ()=>{ scA.redraw(); scB.redraw(); };
  if(run) loop(); else { PT = 0.5; scA.redraw(); scB.redraw(); }
})();

/* ══════════════════════════════════════════════════════════
   02절 · 도메인 · 폴링 · 퀴리 온도
   ══════════════════════════════════════════════════════════ */
/* ── 도메인 ──
   도메인마다 방향을 갖고, 전압/온도에 따라 정렬되거나 흐트러집니다.
   상태가 프레임 간에 유지되므로 배열을 밖에 둡니다. */
const voltS=document.getElementById("volt"), tempS=document.getElementById("temp");
const COLS=16, ROWS=7;
let DOM=[];
function reseed(){
  DOM=[];
  for(let j=0;j<ROWS;j++) for(let i=0;i<COLS;i++)
    DOM.push({i,j, a: Math.random()*Math.PI*2});
}
reseed();
document.getElementById("rst").onclick=()=>{ reseed(); domainScene.redraw(); };

const domainScene = makeScene("c1", 330, (ctx,W,H)=>{
  const V=+voltS.value, T=+tempS.value;
  document.getElementById("voltv").textContent=V.toFixed(2);
  document.getElementById("tempv").textContent=T.toFixed(2);

  /* 물리 규칙: Tc 위 → 무작위화.  Vc 위 → 전기장(0°) 쪽으로 정렬. */
  DOM.forEach(d=>{
    if(T>1){                                   /* 퀴리 온도 초과 */
      d.a += (Math.random()-0.5)*0.55*(T-1)*4;
    } else if(V>1){                            /* 항전압 초과 → 폴링 */
      let diff=((0-d.a+Math.PI)%(2*Math.PI))-Math.PI;
      d.a += diff*Math.min(0.13,(V-1)*0.10);
    }
    /* 열 요동 (항상 조금씩) */
    d.a += (Math.random()-0.5)*0.035*T;
  });
  const P = DOM.reduce((s,d)=>s+Math.cos(d.a),0)/DOM.length;   /* 알짜 분극 */

  const GW=W-150, cw=GW/COLS, ch=(H-96)/ROWS, x0=14, y0=42;
  /* 시료 */
  ctx.fillStyle="rgba(43,61,80,.05)"; ctx.fillRect(x0-6,y0-8,GW+12,ROWS*ch+12);
  /* 전극 */
  const hot = V>0.02;
  ctx.fillStyle = hot?POS:INK; ctx.fillRect(x0-13,y0-8,6,ROWS*ch+12);
  ctx.fillStyle = hot?NEG:INK; ctx.fillRect(x0+GW+7,y0-8,6,ROWS*ch+12);
  if(hot){
    label(ctx,"+",x0-11,y0-12,POS,12);
    label(ctx,"−",x0+GW+9,y0-12,NEG,12);
    /* 전기장선 */
    ctx.strokeStyle=`rgba(240,165,0,${Math.min(0.5,V*0.3)})`; ctx.lineWidth=1;
    ctx.setLineDash([2,5]);
    for(let j=0;j<ROWS;j++){ const y=y0+ch*(j+0.5);
      ctx.beginPath(); ctx.moveTo(x0-6,y); ctx.lineTo(x0+GW+6,y); ctx.stroke(); }
    ctx.setLineDash([]);
  }
  /* 도메인 화살표 */
  DOM.forEach(d=>{
    const cx=x0+cw*(d.i+0.5), cy=y0+ch*(d.j+0.5), r=Math.min(cw,ch)*0.34;
    const al=Math.cos(d.a);
    ctx.strokeStyle = al>0.4?`rgba(23,192,201,${0.45+al*0.55})`
                    : al<-0.4?`rgba(179,18,60,${0.45+Math.abs(al)*0.4})`
                    : "rgba(91,107,123,.5)";
    ctx.lineWidth=2.2; ctx.lineCap="round";
    const dx=Math.cos(d.a)*r, dy=Math.sin(d.a)*r;
    ctx.beginPath(); ctx.moveTo(cx-dx,cy-dy); ctx.lineTo(cx+dx,cy+dy); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx+dx,cy+dy,2.3,0,7); ctx.fillStyle=ctx.strokeStyle; ctx.fill();
  });
  /* 알짜 분극 막대 */
  const bx=W-118, bw=100, by=y0+10, bh=ROWS*ch-20;
  ctx.fillStyle=WELL2; ctx.fillRect(bx,by,bw,bh);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(bx,by,bw,bh);
  const fill=Math.max(0,Math.min(1,Math.abs(P)));
  ctx.fillStyle=`rgba(23,192,201,${0.25+fill*0.75})`;
  ctx.fillRect(bx,by+bh*(1-fill),bw,bh*fill);
  ctx.textAlign="center";
  label(ctx,"알짜 분극",bx+bw/2,by-8,MUTED,9.5,400);
  label(ctx,`${(fill*100).toFixed(0)}%`,bx+bw/2,by+bh/2+6, fill>0.5?CARD:INK,17);
  ctx.textAlign="left";

  /* 상태 */
  const st=document.getElementById("stat");
  let msg,col;
  if(T>1){ msg="퀴리 온도 초과 — 압전성 상실"; col=POS; }
  else if(fill>0.55){ msg="폴링됨 — 압전성 있음"; col=SIGNAL_DK; }
  else if(V>1){ msg="폴링 진행 중…"; col=AMBER_DK; }
  else if(V>0){ msg="항전압 미달 — 변화 없음"; col=MUTED; }
  else { msg="무작위 — 압전성 없음"; col=MUTED; }
  st.textContent=msg; st.style.color=col;

  label(ctx,`V = ${V.toFixed(2)} Vc    T = ${T.toFixed(2)} Tc`,x0,22,INK,11.5);
  if(T>1){ ctx.fillStyle="rgba(179,18,60,.10)"; ctx.fillRect(x0-6,y0-8,GW+12,ROWS*ch+12);
    label(ctx,"열 요동이 정렬을 이깁니다",x0+GW-190,y0+ROWS*ch+22,POS,10.5); }
  else if(V>0 && V<=1) label(ctx,"전압이 항전압 Vc 보다 낮아 도메인이 꿈쩍하지 않습니다",x0,y0+ROWS*ch+22,MUTED,10.5,400);
});
voltS.oninput = tempS.oninput = domainScene.redraw;

/* 도메인이 매 프레임 변하므로 자체 루프로 돌립니다 (재생 버튼 없음).
   30fps 로 제한해 눈이 편하도록 했습니다. '동작 줄이기' 설정은 존중합니다. */
if(!REDUCE){
  let last=0;
  (function tick(now){
    if(now-last > 33){ domainScene.redraw(); last=now; }
    requestAnimationFrame(tick);
  })(0);
}

/* ── kt 와 전기 임피던스 (BVD 등가회로) ──
   압전성이 없으면 Z = 1/(jωC0) — 순수 축전기, 실수부 0.
   압전성이 있으면 운동분지(Lm·Cm·Rm)가 붙어 공진에서 실수부가 생깁니다. */
const ktS=document.getElementById("kt");
const FS0 = 5e6, C0 = 1e-9;
const ktFromX = x => Math.sqrt((Math.PI/2)*(1-x)*Math.tan(Math.PI*x/2));
function xFromKt(kt){                       /* IEEE 식 수치 역산 */
  let lo=1e-7, hi=0.6;
  for(let i=0;i<50;i++){ const m=(lo+hi)/2; if(ktFromX(m)<kt) lo=m; else hi=m; }
  return (lo+hi)/2;
}
const ktScene = makeScene("c2", 330, (ctx,W,H)=>{
  const kt=+ktS.value;
  const x = kt<0.005 ? 0 : xFromKt(kt);
  const fp = kt<0.005 ? FS0 : FS0/(1-x);
  const r  = (fp/FS0)**2 - 1;               /* Cm/C0 */
  const Cm = r*C0, Lm = Cm>0 ? 1/((2*Math.PI*FS0)**2*Cm) : 0;
  const Rm = 6;                              /* 손실 */
  document.getElementById("ktv").textContent=kt.toFixed(2);
  document.getElementById("ktr").textContent=kt.toFixed(3);
  document.getElementById("fpv").textContent=(fp/1e6).toFixed(3);
  document.getElementById("dfv").textContent=((fp-FS0)/1e6).toFixed(3);
  const ks=document.getElementById("ktstat");
  ks.textContent = kt<0.005 ? "압전성 없음 — 순수 축전기 (실수부 0)" : "공진에서 실수부 발생 → 음향 방사";
  ks.style.color = kt<0.005 ? MUTED : SIGNAL_DK;

  /* Z(f) = (1/jωC0) ∥ (Rm + jωLm + 1/jωCm) */
  function Z(f){
    const w=2*Math.PI*f;
    const zc={re:0, im:-1/(w*C0)};
    if(Cm<=0) return zc;
    const zm={re:Rm, im:w*Lm - 1/(w*Cm)};
    const nr=zc.re*zm.re-zc.im*zm.im, ni=zc.re*zm.im+zc.im*zm.re;
    const dr=zc.re+zm.re, di=zc.im+zm.im, d2=dr*dr+di*di;
    return {re:(nr*dr+ni*di)/d2, im:(ni*dr-nr*di)/d2};
  }
  const L=58,R=18,T=26,B=H-40,PW=W-L-R,PH=B-T;
  const F1=3.5e6, F2=8e6;
  const X = f => L + (f-F1)/(F2-F1)*PW;
  let zmax=0, remax=0;
  for(let i=0;i<=600;i++){ const f=F1+(F2-F1)*i/600, z=Z(f);
    zmax=Math.max(zmax,Math.hypot(z.re,z.im)); remax=Math.max(remax,z.re); }
  const YZ = v => B - Math.min(1,v/zmax)*PH;
  const YR = v => B - Math.min(1,remax>0? v/remax:0)*PH*0.92;

  ctx.strokeStyle=WELL2; ctx.lineWidth=1;
  for(let f=4e6;f<=8e6;f+=1e6){ ctx.beginPath(); ctx.moveTo(X(f),T); ctx.lineTo(X(f),B); ctx.stroke(); }
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  for(let f=4e6;f<=8e6;f+=1e6){
    ctx.beginPath(); ctx.moveTo(X(f),B); ctx.lineTo(X(f),B+6); ctx.stroke();
    ctx.textAlign="center"; label(ctx,`${f/1e6}`,X(f),B+19,INK,10); ctx.textAlign="left";
  }
  label(ctx,"주파수 (MHz)",L+PW-88,B+19,MUTED,9.5,400);

  /* Re(Z) — 채움 */
  if(remax>1e-9){
    const p=new Path2D(); p.moveTo(X(F1),B);
    for(let i=0;i<=600;i++){ const f=F1+(F2-F1)*i/600; p.lineTo(X(f),YR(Z(f).re)); }
    p.lineTo(X(F2),B); p.closePath();
    ctx.fillStyle="rgba(179,18,60,.55)"; ctx.fill(p);
    ctx.strokeStyle=POS; ctx.lineWidth=1.6; ctx.stroke(p);
  }
  /* |Z| */
  ctx.strokeStyle=MUTED; ctx.lineWidth=2.4; ctx.beginPath();
  for(let i=0;i<=600;i++){ const f=F1+(F2-F1)*i/600, z=Z(f);
    const y=YZ(Math.hypot(z.re,z.im)); i?ctx.lineTo(X(f),y):ctx.moveTo(X(f),y); }
  ctx.stroke();

  if(kt>=0.005){
    [[FS0,INK],[fp,SIGNAL_DK]].forEach(([f,col])=>{
      ctx.strokeStyle=col; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(X(f),T+30); ctx.lineTo(X(f),B); ctx.stroke(); ctx.setLineDash([]);
    });
    /* kt 분리 폭 — 최상단 */
    ray(ctx,X(FS0),T+14,X(fp),T+14,AMBER,1.6);
    ctx.textAlign="center"; chip(ctx,`kt = ${kt.toFixed(2)}`,(X(FS0)+X(fp))/2,T+8,AMBER_DK,11.5);
    /* fs 왼쪽 · fp 오른쪽 (겹침 방지) */
    ctx.textAlign="right"; chip(ctx,"fs · 직렬공진",X(FS0)-5,T+34,INK,11);
    ctx.textAlign="left";  chip(ctx,"fp · 병렬공진",X(fp)+5,T+34,SIGNAL_DK,11);
  } else {
    chip(ctx,"실수부 없음 — 에너지가 나가지 못합니다",L+14,T+30,MUTED,11.5);
  }
  label(ctx,"|Z|",L-46,YZ(zmax)+14,MUTED,11.5);
  label(ctx,"Re(Z)",L-52,B-16,POS,11.5);
});
ktS.oninput = ktScene.redraw;
