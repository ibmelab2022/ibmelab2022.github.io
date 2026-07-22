/* ═══ A8 정량 초음파 영상 · 애니메이션 ═══
   검증: /home/claude/work/a89.js
     · 지연 오차 = (D²/8z)(1/c − 1/c₀) · 5MHz·D=20·z=40 → 45°(λ/8) 허용 = ±49 m/s = ±3.2%
       지방 1450 (−5.8%) → 50.4ns → 위상 90.7° → 초점 붕괴 (05장 '안 보이는데 빔은 휨')
     · 지방 30% → c ≈ 1520 m/s (간 1550 · 지방 1450 선형 혼합)
     · BSC 기울기 (가우시안 형상인자 exp(−0.827(ka)²)): a=25µm 에서 ka 0.20 → 3.93 · ka 1.02 → 2.19
     · 감쇠 보정 필수: 3cm·5MHz 왕복 15dB · 3cm·8MHz 24dB — 안 하면 기울기가 통째로 틀어짐        */
const CQ = 1540, FQ8 = 5e6;
const APQ = 20, ZFQ = 40;                /* 개구·초점 mm */
const LAMQ = CQ/FQ8*1e3;

/* ── c1 : 음속을 틀리면 초점이 무너진다 ── */
const ctS = document.getElementById("ct"), c0S = document.getElementById("c0");
/* 개구 위치 x 의 지연 오차 (s) — 2차 근사 */
const dTau = (x, c, c0) => (x*x/(2*ZFQ))*1e-3*(1/c - 1/c0);
/* 결맞음 = 개구 전체에서 위상자 합의 크기 (0~1) */
function coher(c, c0){
  let re=0, im=0; const N=64;
  for(let i=0;i<N;i++){
    const x = -APQ/2 + APQ*(i+0.5)/N;
    const ph = 2*Math.PI*FQ8*dTau(x, c, c0);
    re += Math.cos(ph); im += Math.sin(ph);
  }
  return Math.hypot(re,im)/N;
}
/* 틀린 c₀ 로 빔포밍했을 때 측방향 빔 (개구 적분) */
function beam(Xmm, c, c0){
  let re=0, im=0; const N=64, k=2*Math.PI/LAMQ;
  for(let i=0;i<N;i++){
    const x = -APQ/2 + APQ*(i+0.5)/N;
    const ph = k*(Xmm*x/ZFQ) + 2*Math.PI*FQ8*dTau(x, c, c0);
    re += Math.cos(ph); im += Math.sin(ph);
  }
  return Math.hypot(re,im)/N;
}
const sos = makeScene("c1", 380, (ctx,W,H)=>{
  const c = +ctS.value, c0 = +c0S.value;
  const dtEdge = dTau(APQ/2, c, c0);
  const ph = 2*Math.PI*FQ8*dtEdge*180/Math.PI;
  const co = coher(c, c0);
  document.getElementById("ctv").textContent = c;
  document.getElementById("c0v").textContent = c0;
  document.getElementById("rerr").textContent = ((c-c0)/c0*100).toFixed(1);
  document.getElementById("rdt").textContent = (dtEdge*1e9).toFixed(1);
  document.getElementById("rph").textContent = ph.toFixed(1);
  document.getElementById("rco").textContent = (co*100).toFixed(1);
  const rv = document.getElementById("rv");
  if(Math.abs(ph)<45){ rv.textContent="허용"; rv.style.color=SIGNAL_DK; }
  else if(Math.abs(ph)<90){ rv.textContent="흐려짐"; rv.style.color=AMBER_DK; }
  else { rv.textContent="초점 붕괴"; rv.style.color=POS; }
  const st=document.getElementById("sstat");
  st.textContent = Math.abs(c-c0)<5 ? "c₀ = c — 결맞음 최대. 이 봉우리가 곧 측정값"
                                    : `가정이 ${((c0-c)/c*100).toFixed(1)}% 어긋남 → 위상 ${Math.abs(ph).toFixed(0)}°`;
  st.style.color = Math.abs(c-c0)<5 ? SIGNAL_DK : POS;

  const L=56, R=16, PW=W-L-R;
  /* ── 위: c₀ 를 훑은 결맞음 곡선 ── */
  const T=26, B=176, PH=B-T;
  const CMIN=1400, CMAX=1700;
  const X = cc => L + (cc-CMIN)/(CMAX-CMIN)*PW;
  const Y = v => B - Math.max(0,Math.min(1,v))*PH;
  ctx.textAlign="right";
  for(let v=0; v<=1.001; v+=0.25){
    ctx.strokeStyle = v===0?"rgba(217,224,231,.9)":"rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y(v)); ctx.lineTo(L+PW,Y(v)); ctx.stroke();
    label(ctx, `${(v*100).toFixed(0)}%`, L-7, Y(v)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  const path=new Path2D(); path.moveTo(L, Y(0));
  for(let cc=CMIN; cc<=CMAX; cc+=1) path.lineTo(X(cc), Y(coher(c, cc)));
  path.lineTo(L+PW, Y(0)); path.closePath();
  ctx.fillStyle="rgba(23,192,201,.12)"; ctx.fill(path);
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.4; ctx.beginPath();
  for(let cc=CMIN; cc<=CMAX; cc+=1){ const px=X(cc), py=Y(coher(c,cc)); (cc===CMIN)?ctx.moveTo(px,py):ctx.lineTo(px,py); }
  ctx.stroke();
  /* 실제 c · 가정 c₀ */
  ctx.strokeStyle=AMBER; ctx.lineWidth=1.8; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(X(c),T); ctx.lineTo(X(c),B); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="center"; chip(ctx, `실제 c = ${c}`, X(c), T+11, AMBER_DK, 10);
  ctx.fillStyle=POS; ctx.beginPath(); ctx.arc(X(c0), Y(co), 5.5, 0, 7); ctx.fill();
  chip(ctx, `가정 c₀ = ${c0} → 결맞음 ${(co*100).toFixed(0)}%`, X(c0), Y(co)-11, POS, 10);
  [1450,1540,1590].forEach(cc=> label(ctx, `${cc}`, X(cc), B+14, MUTED, 9, 400));
  chip(ctx,"가정 음속 c₀ (m/s) →", L+PW/2, B+27, MUTED, 9.5, 400);
  ctx.textAlign="left";
  chip(ctx, "① c₀ 를 훑으면 봉우리가 실제 c 에 선다", L+4, T+11, SIGNAL_DK, 10.5);

  /* ── 아래: 그때의 측방향 빔 ── */
  const T2=214, B2=H-30, PH2=B2-T2, DR=36, SPAN=4;
  const X2 = mm => L + (mm/SPAN/2 + 0.5)*PW;
  const Y2 = db => T2 + Math.max(0,Math.min(1,-db/DR))*PH2;
  ctx.textAlign="right";
  for(let d=0; d>=-DR; d-=12){
    ctx.strokeStyle="rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y2(d)); ctx.lineTo(L+PW,Y2(d)); ctx.stroke();
    label(ctx, `${d}`, L-7, Y2(d)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,T2); ctx.lineTo(L,B2); ctx.lineTo(L+PW,B2); ctx.stroke();
  const b0 = beam(0, c, c);                       /* 완벽한 경우의 피크 */
  const drawB=(cc,col,lw)=>{ ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.beginPath();
    for(let px=0;px<=PW;px++){ const mm=(px/PW-0.5)*SPAN;
      const y=Y2(20*Math.log10(Math.max(beam(mm,c,cc)/b0,1e-4)));
      px?ctx.lineTo(L+px,y):ctx.moveTo(L+px,y); }
    ctx.stroke(); };
  drawB(c, "rgba(91,107,123,.55)", 1.6);          /* 정답 */
  drawB(c0, Math.abs(ph)<45?SIGNAL_DK:POS, 2.4);  /* 실제 쓴 가정 */
  ctx.textAlign="left";
  chip(ctx, `② 그때의 측방향 빔 · 회색 = c₀ 가 맞았을 때`, L+4, T2+11, INK, 10);
  ctx.textAlign="center";
  chip(ctx,"측방향 (mm) →", L+PW/2, B2+22, MUTED, 9.5, 400);
  ctx.textAlign="left";
});
ctS.oninput = c0S.oninput = sos.redraw;

/* ── c2 : BSC 스펙트럼 기울기 ── */
const saS = document.getElementById("sa"), dpS8 = document.getElementById("dp");
const kaOf = (fMHz, aUM) => 2*Math.PI*(fMHz*1e6)/CQ*(aUM*1e-6);
const FFq  = (fMHz, aUM) => Math.exp(-0.827*Math.pow(kaOf(fMHz,aUM),2));
const bscOf = (fMHz, aUM) => Math.pow(fMHz,4)*FFq(fMHz,aUM);
const attDb = (fMHz, dCM) => 2*0.5*fMHz*dCM;

const bsc = makeScene("c2", 360, (ctx,W,H)=>{
  const a = +saS.value, d = +dpS8.value;
  const ka6 = kaOf(6,a);
  const s1=bscOf(6,a), s2=bscOf(6*1.05,a);
  const slope = Math.log(s2/s1)/Math.log(1.05);
  const att6 = attDb(6,d);
  document.getElementById("sav").textContent = a;
  document.getElementById("dpv").textContent = d.toFixed(1);
  document.getElementById("rka").textContent = ka6.toFixed(3);
  document.getElementById("rsl").textContent = slope.toFixed(2);
  document.getElementById("ratt").textContent = att6.toFixed(1);
  /* 보정 안 한 기울기: 감쇠가 dB/MHz 로 기울이므로 log-log 기울기에 −2·0.5·d·f/(4.34) 만큼 */
  const u1 = s1*Math.pow(10,-attDb(6,d)/10), u2 = s2*Math.pow(10,-attDb(6*1.05,d)/10);
  const uslope = Math.log(u2/u1)/Math.log(1.05);
  const rb = document.getElementById("rbias");
  rb.textContent = `기울기 ${uslope.toFixed(2)} (${(uslope-slope).toFixed(2)})`;
  rb.style.color = Math.abs(uslope-slope)>0.5 ? POS : AMBER_DK;
  const st=document.getElementById("bstat");
  st.textContent = ka6<0.5 ? `ka ${ka6.toFixed(2)} — 레일리 영역 (기울기 ≈ 4, 06장)`
                           : `ka ${ka6.toFixed(2)} — 기울기가 ${slope.toFixed(2)} 로 꺾임`;
  st.style.color = ka6<0.5 ? SIGNAL_DK : AMBER_DK;

  const L=56, R=16, PW=W-L-R, T=18, B=H-34, PH=B-T;
  const FMIN=1, FMAX=12, DBLO=-45, DBHI=15;
  const X = f => L + (Math.log10(f)-Math.log10(FMIN))/(Math.log10(FMAX)-Math.log10(FMIN))*PW;
  const Y = db => B - Math.max(0,Math.min(1,(db-DBLO)/(DBHI-DBLO)))*PH;
  ctx.textAlign="right";
  for(let db=DBLO; db<=DBHI; db+=15){
    ctx.strokeStyle="rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y(db)); ctx.lineTo(L+PW,Y(db)); ctx.stroke();
    label(ctx, `${db}`, L-7, Y(db)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-40,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"BSC (dB, 상대)",-36,0,MUTED,9.5,400); ctx.restore();
  const ref = bscOf(3,a);
  /* 레일리 f⁴ 기준선 */
  ctx.strokeStyle="rgba(91,107,123,.45)"; ctx.setLineDash([4,4]); ctx.lineWidth=1.4; ctx.beginPath();
  for(let f=FMIN; f<=FMAX; f+=0.05){ const px=X(f), py=Y(10*Math.log10(Math.pow(f,4)/ref));
    (f===FMIN)?ctx.moveTo(px,py):ctx.lineTo(px,py); }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; chip(ctx,"레일리 f⁴ (06장)", L+PW-3, Y(10*Math.log10(Math.pow(11,4)/ref))-6, MUTED, 9);
  /* 참 BSC */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.6; ctx.beginPath();
  for(let f=FMIN; f<=FMAX; f+=0.05){ const px=X(f), py=Y(10*Math.log10(bscOf(f,a)/ref));
    (f===FMIN)?ctx.moveTo(px,py):ctx.lineTo(px,py); }
  ctx.stroke();
  /* 감쇠 보정 전 */
  ctx.strokeStyle=POS; ctx.lineWidth=2.2; ctx.setLineDash([5,3]); ctx.beginPath();
  for(let f=FMIN; f<=FMAX; f+=0.05){
    const v = bscOf(f,a)*Math.pow(10,-attDb(f,d)/10);
    const px=X(f), py=Y(10*Math.log10(v/ref)); (f===FMIN)?ctx.moveTo(px,py):ctx.lineTo(px,py); }
  ctx.stroke(); ctx.setLineDash([]);
  /* ka=1 */
  const fka1 = CQ/(2*Math.PI*(a*1e-6))/1e6;
  if(fka1>=FMIN && fka1<=FMAX){
    ctx.strokeStyle=AMBER; ctx.lineWidth=1.6; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(X(fka1),T); ctx.lineTo(X(fka1),B); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="center"; chip(ctx,`ka = 1 (${fka1.toFixed(1)} MHz)`, X(fka1), T+11, AMBER_DK, 9.5);
  }
  ctx.textAlign="left";
  chip(ctx, `참 BSC · 기울기 ${slope.toFixed(2)}`, L+4, T+11, SIGNAL_DK, 10);
  ctx.textAlign="right";
  chip(ctx, `보정 전 · 기울기 ${uslope.toFixed(2)} (${att6.toFixed(0)}dB @6MHz)`, L+PW-3, T+27, POS, 10);
  ctx.textAlign="center";
  [1,2,4,6,8,12].forEach(f=> label(ctx, `${f}`, X(f), B+14, MUTED, 9, 400));
  chip(ctx,"주파수 (MHz, 로그) →", L+PW/2, B+27, MUTED, 9.5, 400);
  ctx.textAlign="left";
});
saS.oninput = dpS8.oninput = bsc.redraw;
