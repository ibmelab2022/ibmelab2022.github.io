/* ═══ 19 시스템과 펄서 · 애니메이션 ═══  검증: verify19.py */

/* ── c1 : 전체 신호 사슬 지도 — 한 소자, 송신 kV·수신 µV 여정 (아날로그│디지털 경계) ── */
const s1=document.getElementById("s1");
const chain=makeScene("c1", 440, (ctx,W,H,t)=>{
  const pad=14, LTY=78, LBY=252, bh=48;
  const fpX=pad, fpW=58, fpCx=fpX+fpW/2;
  const bodyW=62, bodyX=W-pad-bodyW;
  const arW=44, arX=bodyX-12-arW, arCx=arX+arW/2;
  const trW=66, trX=arX-14-trW, trCx=trX+trW/2;
  const midL=fpX+fpW+16, midR=trX-16;
  const tallT=LTY-bh/2, tallB=LBY+bh/2, midY=(LTY+LBY)/2;
  const reflX=bodyX+bodyW*0.6;
  const txCx=i=> midL+(i+0.5)/3*(midR-midL);
  const rxCx=j=> midR-(j+0.5)/5*(midR-midL);
  const txW=(midR-midL)/3-12, rxW=(midR-midL)/5-9;
  const GOLD=AMBER_DK, RED=POS, TEAL=SIGNAL_DK;

  const blocks=[
    [fpCx, midY, fpW, "FPGA", "타이밍·처리", "12·13", NEG, 'tall'],
    [txCx(0), LTY, txW, "DAC", "파형 생성", "이 장", GOLD, 'tx'],
    [txCx(1), LTY, txW, "HV 펄서", "±95V", "이 장", RED, 'tx'],
    [txCx(2), LTY, txW, "HV MUX", "채널 선택", "이 장", RED, 'tx'],
    [trCx, midY, trW, "T/R 스위치", "송·수신 분리", "20", GOLD, 'tall'],
    [arCx, midY, arW, "배열", "전기↔음향", "09·11", INK, 'tall'],
    [rxCx(0), LBY, rxW, "LNA", "저잡음", "21", TEAL, 'rx'],
    [rxCx(1), LBY, rxW, "VCA", "TGC 이득", "21", TEAL, 'rx'],
    [rxCx(2), LBY, rxW, "PGA", "가변 이득", "21", TEAL, 'rx'],
    [rxCx(3), LBY, rxW, "필터", "대역제한", "21", GOLD, 'rx'],
    [rxCx(4), LBY, rxW, "ADC", "디지털화", "22", GOLD, 'rx'],
  ];
  const WP=[
    {x:fpCx, y:LTY, V:null, lab:"FPGA — 송신 타이밍·지연 생성 (디지털)", col:NEG},
    {x:txCx(0), y:LTY, V:1.0, lab:"DAC — 파형을 전압으로 · ≈ 수 V · 이 장", col:GOLD},
    {x:txCx(1), y:LTY, V:95, lab:"HV 펄서 — 고전압 구동 · ≈ ±수십~수백 V · 이 장", col:RED},
    {x:txCx(2), y:LTY, V:95, lab:"HV MUX — 활성 채널로 라우팅 · ≈ ±수십~수백 V", col:RED},
    {x:trCx, y:LTY, V:95, lab:"T/R — 송신 통과 · 수신단은 리미터가 보호 · 20장", col:RED},
    {x:arCx, y:LTY, V:95, lab:"배열 — 전기를 음파로 (체내 송신)", col:RED},
    {x:reflX, y:midY, V:100e-6, lab:"체내 — 반사돼 백만 배 작아진 에코로 (≈ µV 급)", col:TEAL},
    {x:arCx, y:LBY, V:100e-6, lab:"배열 — 에코를 전기로 · ≈ 수 µV~수 mV", col:TEAL},
    {x:trCx, y:LBY, V:100e-6, lab:"T/R — 작은 에코는 문이 열려 통과 · 20장", col:TEAL},
    {x:rxCx(0), y:LBY, V:1e-3, lab:"LNA — 저잡음 1차(+~20 dB) · ≈ 수백 µV~수 mV · 21장", col:TEAL},
    {x:rxCx(1), y:LBY, V:32e-3, lab:"VCA — 시간이득 TGC(+~30 dB) · ≈ 수 mV~수십 mV · 21장", col:TEAL},
    {x:rxCx(2), y:LBY, V:1.0, lab:"PGA — 가변 이득(+~30 dB) · ≈ ADC 풀스케일(~1 V) · 21장", col:TEAL},
    {x:rxCx(3), y:LBY, V:1.0, lab:"필터 — 나이퀴스트 대역제한 · 21장", col:GOLD},
    {x:rxCx(4), y:LBY, V:1.0, lab:"ADC — 디지털화 (여기부터 디지털) · 22장", col:GOLD},
    {x:fpCx, y:LBY, V:null, lab:"FPGA — ① DAS(빔포밍) → 검파 → 영상 (23·24장)", col:NEG},
  ];
  const NSEG=WP.length, cyc=(t*0.05)%1;
  const seg=Math.floor(cyc*NSEG), loc=cyc*NSEG-seg;
  const a=WP[seg], b=WP[(seg+1)%NSEG];
  const px=a.x+(b.x-a.x)*loc, py=a.y+(b.y-a.y)*loc, cur=a;

  if(s1){ if(seg<=5){s1.textContent="송신 경로 — kV 급으로 민다";s1.style.color=POS;}
    else if(seg===6){s1.textContent="반사 — 백만 배 작아진다";s1.style.color=MUTED;}
    else{s1.textContent="수신 경로 — µV 를 되살린다";s1.style.color=SIGNAL_DK;} }

  /* 체내 스트립 + 반사체 */
  ctx.fillStyle="rgba(43,61,80,.05)"; ctx.fillRect(bodyX,tallT,bodyW,tallB-tallT);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(bodyX,tallT,bodyW,tallB-tallT);
  ctx.textAlign="center"; label(ctx,"체내",bodyX+bodyW/2,tallT+13,MUTED,9,500);
  ctx.strokeStyle="rgba(43,61,80,.3)"; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(reflX,tallT+20); ctx.lineTo(reflX,tallB-6); ctx.stroke(); ctx.setLineDash([]);

  /* 흐름선 */
  ctx.strokeStyle="rgba(43,61,80,.26)"; ctx.lineWidth=1.4;
  ctx.beginPath();
  ctx.moveTo(fpX+fpW,LTY); ctx.lineTo(arX,LTY);
  ctx.moveTo(arX+arW,LTY); ctx.lineTo(reflX,midY);
  ctx.moveTo(reflX,midY); ctx.lineTo(arX+arW,LBY);
  ctx.moveTo(arX,LBY); ctx.lineTo(fpX+fpW,LBY);
  ctx.moveTo(fpCx,LTY); ctx.lineTo(fpCx,LBY);
  ctx.stroke();

  /* ★ 아날로그 │ 디지털 경계선 (FPGA ↔ ADC 사이) */
  const bx=(fpX+fpW + (rxCx(4)-rxW/2))/2;
  ctx.strokeStyle="rgba(240,165,0,.65)"; ctx.setLineDash([5,4]); ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(bx,tallT-6); ctx.lineTo(bx,tallB+18); ctx.stroke(); ctx.setLineDash([]);

  /* 블록 */
  ctx.textAlign="center";
  blocks.forEach(([cx,cy,w,name,sub,ref,col,lane])=>{
    const h=lane==='tall'?(tallB-tallT):bh, y=lane==='tall'?tallT:cy-bh/2;
    const active=Math.abs(px-cx)<w/2+8 && py>y-24 && py<y+h+24;
    ctx.fillStyle=active?"#fff":"#fbfcfe";
    ctx.strokeStyle=active?col:LINE; ctx.lineWidth=active?2.4:1.2;
    ctx.fillRect(cx-w/2,y,w,h); ctx.strokeRect(cx-w/2,y,w,h);
    const ty=lane==='tall'?midY:cy;
    label(ctx,name,cx,ty-1,active?col:INK,10.5,700);
    label(ctx,sub,cx,ty+13,MUTED,8.5,500);
    if(ref){ ctx.textAlign="right"; const rt = ref==="이 장" ? "이 장" : ref+"장";
      chip(ctx,"▸"+rt,cx+w/2-4,y+h-5,active?col:MUTED,7.5); ctx.textAlign="center"; }
  });
  /* 경계 라벨 + DAS (블록 위) */
  ctx.textAlign="right"; label(ctx,"◀ 디지털",bx-5,tallT-9,NEG,8.5,700);
  ctx.textAlign="left";  label(ctx,"아날로그 프런트엔드 ▶",bx+5,tallT-9,AMBER_DK,8.5,700);
  ctx.textAlign="center"; chip(ctx,"① DAS",bx,LBY+13,NEG,8.5);

  /* 이동 패킷 (크기 ∝ log 전압) */
  let rr=6;
  if(cur.V!=null){ rr=3.5+5.5*(Math.log10(cur.V)+6)/(Math.log10(200)+6); rr=Math.max(3,rr); }
  ctx.shadowColor=cur.col; ctx.shadowBlur=13; ctx.fillStyle=cur.col;
  ctx.beginPath(); ctx.arc(px,py,rr,0,7); ctx.fill(); ctx.shadowBlur=0; ctx.shadowColor="rgba(0,0,0,0)";

  /* 상단 현재-단 라벨 */
  ctx.textAlign="left"; chip(ctx,cur.lab,pad,22,cur.col,11);

  /* 하단 로그 전압 축 */
  const vx0=pad+96, vx1=W-pad, vy=H-52, Vlo=1e-6, Vhi=200;
  const Xv=v=> vx0+(Math.log10(v)-Math.log10(Vlo))/(Math.log10(Vhi)-Math.log10(Vlo))*(vx1-vx0);
  ctx.fillStyle="rgba(238,243,247,.9)"; ctx.fillRect(vx0,vy,vx1-vx0,13);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(vx0,vy,vx1-vx0,13);
  [[1e-6,"1 µV"],[1e-3,"1 mV"],[1,"1 V"],[100,"100 V"]].forEach(([v,s])=>{
    ctx.strokeStyle="rgba(91,107,123,.35)"; ctx.beginPath(); ctx.moveTo(Xv(v),vy); ctx.lineTo(Xv(v),vy+13); ctx.stroke();
    ctx.textAlign="center"; label(ctx,s,Xv(v),vy+26,MUTED,8.5,500);
  });
  ctx.textAlign="left"; label(ctx,"신호 전압 (로그)",pad,vy+10,MUTED,9,500);
  if(cur.V!=null){
    const mx=Xv(Math.max(Vlo,Math.min(Vhi,cur.V)));
    const lo=Xv(Math.max(Vlo,cur.V/4)), hi=Xv(Math.min(Vhi,cur.V*4));
    ctx.fillStyle=cur.col+"26"; ctx.fillRect(lo,vy,Math.max(3,hi-lo),13);   /* 대략적 범위 밴드 (~한 자릿수) */
    ctx.fillStyle=cur.col; ctx.beginPath();
    ctx.moveTo(mx,vy-5); ctx.lineTo(mx-5,vy-13); ctx.lineTo(mx+5,vy-13); ctx.closePath(); ctx.fill();
    const vs = "≈ "+(cur.V>=1?`${cur.V.toFixed(0)} V`:(cur.V>=1e-3?`${(cur.V*1e3).toFixed(0)} mV`:`${(cur.V*1e6).toFixed(0)} µV`));
    ctx.textAlign="center"; chip(ctx,vs,mx,vy-17,cur.col,9.5);
  } else { ctx.textAlign="right"; chip(ctx,"디지털 영역 — 전압 아님",vx1-4,vy-6,NEG,9.5); }
  ctx.textAlign="left";
},{play:"p0", speed:0.03, tStill:2.0});

/* ── c2 : 펄서 — 스파이크(단극성) vs 버스트(양극성) ── */
const ncS=document.getElementById("nc");
const pul=makeScene("c2", 360, (ctx,W,H)=>{
  const N=+ncS.value, f0=5;
  document.getElementById("ncv").textContent=N;
  const L=16, gap=16, half=(W-2*L-gap)/2, R=L+half+gap;
  const wy=58, wh=92, sy=206, sh=110, my=wy+wh*0.55;
  function pane(x,y,w,h,title,col){ ctx.fillStyle="#fbfcfe"; ctx.fillRect(x,y,w,h);
    ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);
    ctx.textAlign="left"; chip(ctx,title,x,y-8,col,10.5); }
  const zero=(x,w,y)=>{ ctx.strokeStyle="rgba(217,224,231,.9)"; ctx.setLineDash([2,3]);
    ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.stroke(); ctx.setLineDash([]); };

  /* 단극성 스파이크 */
  pane(L,wy,half,wh,"단극성 · 스파이크",POS); zero(L,half,my);
  ctx.strokeStyle=INK2; ctx.lineWidth=2.2; ctx.beginPath();
  for(let x=0;x<=half;x++){ const u=(x-half*0.30)/(half*0.045);
    const v=u<0?Math.exp(-u*u*0.5):Math.exp(-u*0.5);
    (x===0?ctx.moveTo:ctx.lineTo).call(ctx, L+x, my - v*wh*0.42); }
  ctx.stroke();
  /* 양극성 버스트 */
  pane(R,wy,half,wh,`양극성 · ${N}사이클 버스트`,SIGNAL_DK); zero(R,half,my);
  ctx.strokeStyle=INK2; ctx.lineWidth=2.2; ctx.beginPath();
  const bx0=0.14, bx1=0.86, span=bx1-bx0;
  for(let x=0;x<=half;x++){ const xx=(x/half-bx0)/span; let v=0;
    if(xx>=0&&xx<=1) v=Math.sin(xx*N*2*Math.PI)*Math.sin(xx*Math.PI);
    (x===0?ctx.moveTo:ctx.lineTo).call(ctx, R+x, my - v*wh*0.40); }
  ctx.stroke();

  /* 스펙트럼 (주파수 0~20MHz) */
  const Fmax=20;
  pane(L,sy,half,sh,"스펙트럼 — 광대역(주파수 없음)",POS);
  ctx.fillStyle="rgba(179,18,60,.20)"; ctx.strokeStyle=POS; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,sy+sh);
  for(let x=0;x<=half;x++){ const f=x/half*Fmax; const A=Math.exp(-f*0.055); ctx.lineTo(L+x, sy+sh-A*sh*0.82); }
  ctx.lineTo(L+half,sy+sh); ctx.closePath(); ctx.fill();
  pane(R,sy,half,sh,`스펙트럼 — f₀ 에 몰림 (폭 ∝ 1/N)`,SIGNAL_DK);
  ctx.fillStyle="rgba(14,143,151,.22)";
  ctx.beginPath(); ctx.moveTo(R,sy+sh);
  for(let x=0;x<=half;x++){ const f=x/half*Fmax; const d=(f-f0)*N/f0*Math.PI;
    const A=Math.abs(d)<1e-3?1:Math.abs(Math.sin(d)/d); ctx.lineTo(R+x, sy+sh-A*A*sh*0.82); }
  ctx.lineTo(R+half,sy+sh); ctx.closePath(); ctx.fill();
  const Xf=(base,f)=> base + f/Fmax*half;
  ctx.strokeStyle=AMBER; ctx.setLineDash([3,3]); ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(Xf(R,f0),sy); ctx.lineTo(Xf(R,f0),sy+sh); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="center"; label(ctx,`f₀ ${f0}MHz`,Xf(R,f0),sy+sh+15,AMBER_DK,9,600);
  ctx.textAlign="left"; label(ctx,"주파수 →",L+2,sy+sh+15,MUTED,8.5,500);
});
ncS.oninput=pul.redraw;

/* ═══ 펄서 회로 (2열) ═══  물리 검증: verify19.py / verify20.py */
function polyDots(ctx, pts, prog, n, col){
  let L=0; const seg=[];
  for(let i=1;i<pts.length;i++){ const d=Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]); seg.push(d); L+=d; }
  ctx.fillStyle=col;
  for(let i=0;i<n;i++){
    let s=(((i/n)+prog)%1+1)%1*L, k=0;
    while(k<seg.length && s>seg[k]){ s-=seg[k]; k++; }
    if(k>=seg.length) k=seg.length-1;
    const f=seg[k]?s/seg[k]:0;
    const x=pts[k][0]+(pts[k+1][0]-pts[k][0])*f, y=pts[k][1]+(pts[k+1][1]-pts[k][1])*f;
    ctx.beginPath(); ctx.arc(x,y,2.5,0,7); ctx.fill();
  }
}
const HV=100, RDS=2.5, R1H=10e3, RL0=50, VDF=0.7, CS=1540, VPK=(HV-VDF)*RL0/(RL0+RDS);
const CLOOP=6, RCWIN=400;

/* ── c3 : 단극성 RC 펄서 (트리거 폭만 조절, C·부하 고정) ── */
const twS=document.getElementById("tw");
const rc=makeScene("c3", 452, (ctx,W,H,t)=>{
  FS = 1.22 * Math.min(1, W/480);       /* 회로는 반폭이라도 글자 크게 (폭 스케일 완화) */
  const trig=+twS.value, C1=0.5e-9, RL=RL0;
  const tauD=(RDS+RL)*C1*1e9, tauC=(R1H+RL)*C1*1e9, kdiv=RL/(RL+RDS);
  const t5=5*tauD, rcMode=trig>=t5, width=rcMode?t5:trig;
  const f1=x=> x>=100? x.toFixed(0): x.toFixed(1);
  document.getElementById("twv").textContent=trig;
  document.getElementById("pkR").textContent=(-HV*kdiv).toFixed(0);
  document.getElementById("pwR").textContent=f1(width);
  const st=document.getElementById("stR");
  st.textContent = rcMode ? `트리거 ${trig}ns ≥ 5τ(${f1(t5)}ns) — 폭은 부하 RC 결정`
                          : `트리거 ${trig}ns < 5τ(${f1(t5)}ns) — 폭은 트리거 결정`;
  st.style.color = rcMode? SIGNAL_DK : AMBER_DK;

  const ph=(t%CLOOP)/CLOOP, ffwd=ph>0.92;
  const tn=ffwd? RCWIN : ph/0.92*RCWIN;
  const ton=60, toff=ton+trig;
  const xoff=HV*Math.exp(-Math.max(0,(toff-ton))/tauD);
  const vout=x=>{ if(x<ton) return 0; if(x<toff) return -HV*kdiv*Math.exp(-(x-ton)/tauD);
    const rec=HV-(HV-xoff)*Math.exp(-(x-toff)/tauC); return (HV-rec)*RL/(R1H+RL); };
  const vcap=x=>{ if(x<ton) return HV; if(x<toff) return HV*Math.exp(-(x-ton)/tauD);
    return HV-(HV-xoff)*Math.exp(-(x-toff)/tauC); };

  /* 회로 */
  const X0=Math.max(10,(W-330)/2);
  const A=[X0+120,100], VO=[X0+275,100], GY=180;
  ctx.strokeStyle=INK2; ctx.lineWidth=1.6; ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(X0+120,26); ctx.lineTo(X0+120,38);
  ctx.moveTo(X0+120,82); ctx.lineTo(X0+120,114);
  ctx.moveTo(A[0],A[1]); ctx.lineTo(X0+190,100);
  ctx.moveTo(X0+204,100); ctx.lineTo(VO[0],VO[1]);
  ctx.moveTo(VO[0],VO[1]); ctx.lineTo(VO[0],116);
  ctx.moveTo(VO[0],162); ctx.lineTo(VO[0],GY);
  ctx.moveTo(X0+120,160); ctx.lineTo(X0+120,GY);
  ctx.moveTo(X0+120,GY); ctx.lineTo(VO[0],GY);
  ctx.stroke();
  const zig=(x,y0,y1)=>{ ctx.beginPath(); ctx.moveTo(x,y0); const n=6, hh=(y1-y0)/n;
    for(let i=0;i<n;i++) ctx.lineTo(x+((i%2)?-6:6), y0+hh*(i+0.5)); ctx.lineTo(x,y1); ctx.stroke(); };
  zig(X0+120,38,82); zig(VO[0],116,162);
  ctx.lineWidth=3; ctx.beginPath();
  ctx.moveTo(X0+190,86); ctx.lineTo(X0+190,114); ctx.moveTo(X0+204,86); ctx.lineTo(X0+204,114); ctx.stroke();
  ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(X0+120,22,4,0,7); ctx.stroke();
  const gx=X0+197;
  ctx.beginPath(); ctx.moveTo(gx,GY); ctx.lineTo(gx,GY+6); ctx.moveTo(gx-9,GY+6); ctx.lineTo(gx+9,GY+6);
  ctx.moveTo(gx-5.5,GY+10); ctx.lineTo(gx+5.5,GY+10); ctx.moveTo(gx-2,GY+14); ctx.lineTo(gx+2,GY+14); ctx.stroke();
  const on = tn>=ton && tn<toff;
  ctx.beginPath(); ctx.moveTo(X0+120,114); ctx.lineTo(X0+120,126); ctx.lineTo(X0+114,126);
  ctx.moveTo(X0+114,152); ctx.lineTo(X0+120,152); ctx.lineTo(X0+120,160); ctx.stroke();
  ctx.strokeStyle = on? SIGNAL : INK2; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(X0+114,122); ctx.lineTo(X0+114,156); ctx.stroke();
  ctx.strokeStyle = on? AMBER : MUTED; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(X0+106,126); ctx.lineTo(X0+106,152); ctx.moveTo(X0+62,139); ctx.lineTo(X0+106,139); ctx.stroke();
  const vc=ffwd? (xoff+(HV-xoff)*Math.min(1,(ph-0.92)/0.07)) : vcap(tn);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(X0+164,50,66,10);
  ctx.fillStyle="rgba(179,18,60,.6)"; ctx.fillRect(X0+165,51,64*Math.max(0,vc)/HV,8);
  const chP=[[X0+120,26],[X0+120,100],[X0+188,100],[X0+206,100],[VO[0],100],[VO[0],GY],[gx,GY]];
  const diP=[[X0+188,100],[X0+120,100],[X0+120,GY],[VO[0],GY],[VO[0],100],[X0+206,100]];
  if(on)            polyDots(ctx,diP,(t*1.4)%1,14,POS);
  else if(ffwd)     polyDots(ctx,chP,(t*0.9)%1,9,INK2);
  else if(tn>=toff) polyDots(ctx,chP,(t*0.1)%1,5,MUTED);
  ctx.strokeStyle=INK2;
  label(ctx,"HV",X0+132,26,INK,10.5); label(ctx,"R1 10kΩ",X0+132,62,MUTED,9.5,500);
  label(ctx,"M1",X0+126,146,MUTED,9.5,500);
  ctx.textAlign="right"; label(ctx,"트리거",X0+58,143,on?AMBER_DK:MUTED,9.5);
  ctx.textAlign="center"; label(ctx,"C1",X0+197,80,INK,10.5); chip(ctx,`${vc.toFixed(0)}V`,X0+197,46,POS,9);
  chip(ctx,"Vout",VO[0],90,SIGNAL_DK,10); ctx.textAlign="left";
  ctx.fillStyle=SIGNAL_DK; ctx.beginPath(); ctx.arc(VO[0],VO[1],3.5,0,7); ctx.fill();
  label(ctx,`RL ${RL0}Ω`,VO[0]+12,136,MUTED,9.5,500); label(ctx,"(탐촉자)",VO[0]+12,150,MUTED,8.5,400);
  chip(ctx, ffwd?"재충전 빨리감기":(tn<ton?"충전 완료·대기":(on?"발사 — C1 이 RL 로 방전":"재충전 시작")), X0+2,20,INK2,9.5);

  /* 스코프 */
  const sx0=54, sx1=W-14, sy0=232, sy1=414;
  const Xs=ns=> sx0+ns/RCWIN*(sx1-sx0);
  const vmin=-118, vspan=148, Ys=v=> sy1-(v-vmin)/vspan*(sy1-sy0);
  ctx.fillStyle=WELL; ctx.fillRect(sx0,210,sx1-sx0,16); ctx.fillRect(sx0,sy0,sx1-sx0,sy1-sy0);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(sx0,210,sx1-sx0,16); ctx.strokeRect(sx0,sy0,sx1-sx0,sy1-sy0);
  ctx.fillStyle="rgba(240,165,0,.75)"; ctx.fillRect(Xs(ton),211,Xs(Math.min(toff,RCWIN))-Xs(ton),14);
  label(ctx,"트리거",sx0+3,206,AMBER_DK,9);
  [0,-50,-100].forEach(v=>{ ctx.strokeStyle=v===0?MUTED:LINE; ctx.lineWidth=1; if(v===0) ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(sx0,Ys(v)); ctx.lineTo(sx1,Ys(v)); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="right"; label(ctx,String(v),sx0-5,Ys(v)+4,MUTED,9,500); ctx.textAlign="left"; });
  [0,100,200,300,400].forEach(ns=>{ ctx.textAlign="center"; label(ctx,String(ns),Xs(ns),428,MUTED,8.5,400); ctx.textAlign="left"; });
  label(ctx,"ns",sx1+1,428,MUTED,8.5,400);
  const pts=[]; const pxEnd=Xs(tn);
  for(let px=sx0; px<=pxEnd; px++){ const ns=(px-sx0)/(sx1-sx0)*RCWIN;
    if(ns>=ton && (px-1-sx0)/(sx1-sx0)*RCWIN<ton) pts.push([px,Ys(0)]);
    pts.push([px,Ys(vout(ns))]); }
  if(pts.length>1){ fillWave(ctx,W,Ys(0),pts); ctx.strokeStyle=INK2; ctx.lineWidth=1.5;
    ctx.beginPath(); pts.forEach((q,i)=> i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.stroke(); }
  const rEnd=Math.min(RCWIN,ton+t5), cut=ton+t5>RCWIN;
  ctx.strokeStyle=POS; ctx.lineWidth=1.8; ctx.beginPath();
  ctx.moveTo(Xs(ton),404); ctx.lineTo(Xs(rEnd),404); ctx.moveTo(Xs(ton),399); ctx.lineTo(Xs(ton),409);
  if(!cut){ ctx.moveTo(Xs(rEnd),399); ctx.lineTo(Xs(rEnd),409); } ctx.stroke();
  chip(ctx,`5τ = ${f1(t5)}ns${cut?"(창 밖)":""}`,Xs(ton)+8,398,POS,9.5);
  chip(ctx,"Vout — 탐촉자 전압",sx0+4,246,INK,10);
  ctx.strokeStyle=MUTED; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(pxEnd,sy0); ctx.lineTo(pxEnd,sy1); ctx.stroke();
},{play:"pR", speed:0.02, tStill:5.4});
twS.oninput=rc.redraw;

/* ── c4 : 양극성 H-브리지 (사이클 수만 조절, 주파수 고정 5MHz) ── */
const cycS=document.getElementById("cyc");
const hb=makeScene("c4", 452, (ctx,W,H,t)=>{
  FS = 1.22 * Math.min(1, W/480);       /* 회로는 반폭이라도 글자 크게 (폭 스케일 완화) */
  const f=5, n=+cycS.value, T=1000/f, h=T/2, lam=CS/(f*1e6)*1e3;
  document.getElementById("cycv").textContent=n;
  document.getElementById("pkH").textContent="±"+VPK.toFixed(0);
  document.getElementById("plH").textContent=(n*lam).toFixed(2);
  const st=document.getElementById("stH");
  st.textContent=`f₀ 5MHz · T/2 = ${h.toFixed(0)}ns · ${n}사이클 → 펄스 ${(n*lam).toFixed(2)}mm`;
  st.style.color=SIGNAL_DK;

  const t0=40, dur=n*T, TWIN=dur*1.2+90;
  const ph=(t%CLOOP)/CLOOP, hold=ph>0.86, tn=hold? TWIN : ph/0.86*TWIN;
  const rel=tn-t0, halfIdx=(rel>=0 && rel<dur)? Math.floor(rel/h) : -1;
  const onA=halfIdx>=0 && halfIdx%2===0, onB=halfIdx>=0 && halfIdx%2===1;

  const X0=Math.max(10,(W-340)/2);
  const xr=X0+110, xn=X0+240, xl=X0+288;
  ctx.strokeStyle=INK2; ctx.lineWidth=1.6; ctx.lineCap="round"; ctx.beginPath();
  ctx.moveTo(xr,22); ctx.lineTo(xr,44);
  ctx.moveTo(xr,80); ctx.lineTo(xr,98); ctx.lineTo(X0+146,98);
  ctx.moveTo(X0+163,98); ctx.lineTo(xn,98);
  ctx.moveTo(xr,152); ctx.lineTo(xr,134); ctx.lineTo(X0+146,134);
  ctx.moveTo(X0+163,134); ctx.lineTo(xn,134);
  ctx.moveTo(xn,98); ctx.lineTo(xn,134);
  ctx.moveTo(xn,116); ctx.lineTo(xl,116);
  ctx.moveTo(xl,162); ctx.lineTo(xl,176);
  ctx.moveTo(xr,188); ctx.lineTo(xr,206);
  ctx.stroke();
  const zig=(x,y0,y1)=>{ ctx.beginPath(); ctx.moveTo(x,y0); const m=6, hh=(y1-y0)/m;
    for(let i=0;i<m;i++) ctx.lineTo(x+((i%2)?-6:6), y0+hh*(i+0.5)); ctx.lineTo(x,y1); ctx.stroke(); };
  zig(xl,116,162);
  ctx.beginPath(); ctx.arc(xr,18,4,0,7); ctx.stroke(); ctx.beginPath(); ctx.arc(xr,210,4,0,7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xl-9,176); ctx.lineTo(xl+9,176); ctx.moveTo(xl-5.5,180); ctx.lineTo(xl+5.5,180);
  ctx.moveTo(xl-2,184); ctx.lineTo(xl+2,184); ctx.stroke();
  const fet=(yTop,onx)=>{ ctx.strokeStyle=INK2; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(xr,yTop); ctx.lineTo(xr,yTop+4); ctx.lineTo(X0+104,yTop+4);
    ctx.moveTo(X0+104,yTop+32); ctx.lineTo(xr,yTop+32); ctx.lineTo(xr,yTop+36); ctx.stroke();
    ctx.strokeStyle=onx?SIGNAL:INK2; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(X0+104,yTop); ctx.lineTo(X0+104,yTop+36); ctx.stroke();
    ctx.strokeStyle=onx?AMBER:MUTED; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(X0+96,yTop+4); ctx.lineTo(X0+96,yTop+32); ctx.moveTo(X0+46,yTop+18); ctx.lineTo(X0+96,yTop+18); ctx.stroke(); };
  fet(44,onA); fet(152,onB);
  const diode=(x0,y,dir)=>{ ctx.fillStyle=INK2; ctx.beginPath();
    if(dir>0){ ctx.moveTo(x0,y-8); ctx.lineTo(x0,y+8); ctx.lineTo(x0+17,y); } else { ctx.moveTo(x0+17,y-8); ctx.lineTo(x0+17,y+8); ctx.lineTo(x0,y); }
    ctx.closePath(); ctx.fill(); const xb=dir>0? x0+17 : x0;
    ctx.strokeStyle=INK2; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(xb,y-8); ctx.lineTo(xb,y+8); ctx.stroke(); };
  diode(X0+146,98,+1); diode(X0+146,134,-1);
  const pA=[[xr,22],[xr,98],[X0+146,98],[X0+163,98],[xn,98],[xn,116],[xl,116],[xl,176]];
  const pB=[[xl,176],[xl,116],[xn,116],[xn,134],[X0+163,134],[X0+146,134],[xr,134],[xr,206]];
  if(onA) polyDots(ctx,pA,(t*1.3)%1,12,POS);
  if(onB) polyDots(ctx,pB,(t*1.3)%1,12,NEG);
  label(ctx,"HV",xr+12,22,INK,10.5); label(ctx,"−HV",xr+12,214,INK,10.5);
  label(ctx,"M1(P)",X0+118,66,MUTED,9,500); label(ctx,"M2(N)",X0+118,178,MUTED,9,500);
  label(ctx,"D1",X0+147,88,MUTED,9.5,500); label(ctx,"D2",X0+147,156,MUTED,9.5,500);
  ctx.textAlign="right"; label(ctx,"트리거A(−)",X0+40,66,onA?AMBER_DK:MUTED,9); label(ctx,"트리거B(+)",X0+40,174,onB?AMBER_DK:MUTED,9); ctx.textAlign="left";
  ctx.fillStyle=SIGNAL_DK; ctx.beginPath(); ctx.arc(xn,116,3.5,0,7); ctx.fill(); chip(ctx,"Vout",xn+8,112,SIGNAL_DK,10);
  label(ctx,`RL ${RL0}Ω`,xl+12,134,MUTED,9.5,500); label(ctx,"(탐촉자)",xl+12,148,MUTED,8.5,400);
  chip(ctx, tn<t0?"대기":(onA?"M1이 미는 중 (+)":(onB?"M2가 당기는 중 (−)":"송신 끝 — 다이오드 닫힘")), X0+2,228,INK2,9.5);

  const sx0=54, sx1=W-14, sy0=276, sy1=452;
  const Xs=ns=> sx0+ns/TWIN*(sx1-sx0), Ys=v=> (sy0+sy1)/2 - v/120*(sy1-sy0)/2;
  ctx.fillStyle=WELL; ctx.fillRect(sx0,240,sx1-sx0,13); ctx.fillRect(sx0,257,sx1-sx0,13); ctx.fillRect(sx0,sy0,sx1-sx0,sy1-sy0);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(sx0,240,sx1-sx0,13); ctx.strokeRect(sx0,257,sx1-sx0,13); ctx.strokeRect(sx0,sy0,sx1-sx0,sy1-sy0);
  ctx.fillStyle="rgba(240,165,0,.75)";
  for(let c=0;c<n;c++){ ctx.fillRect(Xs(t0+c*T),241,Xs(t0+c*T+h)-Xs(t0+c*T),11); ctx.fillRect(Xs(t0+c*T+h),258,Xs(t0+(c+1)*T)-Xs(t0+c*T+h),11); }
  ctx.textAlign="right"; label(ctx,"A(−)",sx0-5,250,AMBER_DK,8); label(ctx,"B(+)",sx0-5,267,AMBER_DK,8); ctx.textAlign="left";
  [0,50,100,-50,-100].forEach(v=>{ ctx.strokeStyle=v===0?MUTED:LINE; ctx.lineWidth=1; if(v===0) ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(sx0,Ys(v)); ctx.lineTo(sx1,Ys(v)); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="right"; label(ctx,String(v),sx0-5,Ys(v)+4,MUTED,9,500); ctx.textAlign="left"; });
  const stepNs=Math.max(10,Math.ceil(TWIN/5/10)*10);
  for(let ns=0; ns<=TWIN; ns+=stepNs){ ctx.textAlign="center"; label(ctx,String(ns),Xs(ns),466,MUTED,8.5,400); ctx.textAlign="left"; }
  label(ctx,"ns",sx1+1,466,MUTED,8.5,400);
  const te=0.09*h, S=2*VPK/te, dtpx=TWIN/(sx1-sx0); const pts=[]; let v=0;
  for(let px=sx0; px<=sx1; px++){ const ns=(px-sx0)*dtpx, r=ns-t0;
    const tgt=(r>=0 && r<dur)? (Math.floor(r/h)%2===0? VPK : -VPK) : 0;
    v += Math.max(-S*dtpx, Math.min(S*dtpx, tgt-v)); if(ns<=tn) pts.push([px,Ys(v)]); }
  if(pts.length>1){ fillWave(ctx,W,Ys(0),pts); ctx.strokeStyle=INK2; ctx.lineWidth=1.5;
    ctx.beginPath(); pts.forEach((q,i)=> i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.stroke(); }
  ctx.strokeStyle=AMBER_DK; ctx.lineWidth=1.8; ctx.beginPath();
  ctx.moveTo(Xs(t0),Ys(-108)); ctx.lineTo(Xs(t0+h),Ys(-108)); ctx.moveTo(Xs(t0),Ys(-108)-5); ctx.lineTo(Xs(t0),Ys(-108)+5);
  ctx.moveTo(Xs(t0+h),Ys(-108)-5); ctx.lineTo(Xs(t0+h),Ys(-108)+5); ctx.stroke();
  chip(ctx,`T/2 = ${h.toFixed(0)}ns`,Xs(t0+h)+8,Ys(-108)+4,AMBER_DK,9.5);
  chip(ctx,"Vout — 탐촉자 전압",sx0+4,290,INK,10);
  const cxr=Xs(tn); ctx.strokeStyle=MUTED; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(cxr,sy0); ctx.lineTo(cxr,sy1); ctx.stroke();
},{play:"pH", speed:0.02, tStill:5.4});
cycS.oninput=hb.redraw;

/* ── c5 : HV MUX — 소자 수 > 시스템 채널 → 활성 조리개만 연결 ── */
const apS=document.getElementById("ap");
const mux=makeScene("c5", 290, (ctx,W,H)=>{
  const NE=128, NCH=64;
  const apPct=+apS.value, apStart=Math.round(apPct/100*(NE-NCH));
  document.getElementById("apv").textContent=apStart+"–"+(apStart+NCH-1);
  document.getElementById("rne").textContent=NE;
  document.getElementById("rnch").textContent=NCH;

  const L=30, R=30, PW=W-L-R;
  const eY=58, mY0=112, mY1=158, cY=224;
  const eW=PW/NE, eX=i=> L+i*eW+eW/2;
  const cW=PW/NCH, cX=i=> L+(i+0.5)*cW;
  /* 배열 소자 */
  for(let i=0;i<NE;i++){ const on=i>=apStart && i<apStart+NCH;
    ctx.fillStyle=on?AMBER:"rgba(150,160,170,.45)"; ctx.fillRect(eX(i)-eW*0.35, eY, eW*0.7, 14); }
  /* 활성 조리개 테두리 */
  ctx.strokeStyle=AMBER_DK; ctx.lineWidth=1.6; ctx.strokeRect(eX(apStart)-eW*0.5, eY-3, eW*NCH, 20);
  /* MUX 블록 */
  ctx.fillStyle="rgba(23,192,201,.10)"; ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.6;
  ctx.fillRect(L, mY0, PW, mY1-mY0); ctx.strokeRect(L, mY0, PW, mY1-mY0);
  ctx.textAlign="center"; label(ctx,"HV MUX — 활성 조리개를 채널로 라우팅", L+PW/2, (mY0+mY1)/2+4, SIGNAL_DK, 11, 700);
  ctx.textAlign="left";
  /* 시스템 채널 */
  for(let i=0;i<NCH;i++){ ctx.fillStyle=SIGNAL_DK; ctx.fillRect(cX(i)-cW*0.32, cY, cW*0.64, 12); }
  /* 대표 연결선 (활성 소자 → MUX 상단, MUX 하단 → 채널) */
  ctx.strokeStyle="rgba(240,165,0,.55)"; ctx.lineWidth=1;
  for(let k=0;k<=8;k++){ const ei=apStart+Math.round(k/8*(NCH-1));
    ctx.beginPath(); ctx.moveTo(eX(ei),eY+16); ctx.lineTo(eX(ei),mY0); ctx.stroke(); }
  ctx.strokeStyle="rgba(23,192,201,.5)";
  for(let k=0;k<=8;k++){ const ci=Math.round(k/8*(NCH-1));
    ctx.beginPath(); ctx.moveTo(cX(ci),mY1); ctx.lineTo(cX(ci),cY); ctx.stroke(); }
  /* 라벨 */
  ctx.textAlign="left";
  chip(ctx,`배열 소자 ${NE}개`,L,eY-10,INK,10,600);
  chip(ctx,`활성 조리개 ${NCH}개 (지금 연결)`,eX(apStart),eY-26,AMBER_DK,9.5);
  chip(ctx,`시스템 채널 ${NCH}개 (송수신 전자회로)`,L,cY+26,SIGNAL_DK,10,600);
  chip(ctx,"빔이 옆으로 가면 조리개가 미끄러지고 MUX 가 다시 연결",L,cY+42,MUTED,9.5);
});
apS.oninput=mux.redraw;
