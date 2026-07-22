/* ═══ A7 초음파 국소화 현미경 · 애니메이션 ═══
   검증: /home/claude/work/a7.js · a7b.js  (Renaudin 2022 · Heiles 2022 세팅)
     · 15MHz · 128×110µm → 개구 14.1mm · λ = 102.7 µm
     · 깊이 10mm → F# 0.71 → 측방향 −6dB = 1.207λF# = 88 µm · σ_PSF = FWHM/2.355 = 27.4 µm
     · CRLB: var(x₀) ≥ σ_n²/Σ|s'(x_i)|²  → σ_loc ≈ σ_PSF/SNR  (자릿수 어림)
       ⚠ 앞선 계산은 dx=0.1µm 로 적분해 σ당 274 독립표본을 가정 — 틀렸다.
         대역제한이라 독립표본 간격은 λ/2 = 51µm → σ_PSF 안에 0.5 개뿐.
         Δ=λ/2 로 제대로 세면 SNR 20dB 에서 4.0µm (대략식 2.7µm) — 같은 자릿수.
     · 논문 격자 6.875×6.25µm ≈ λ/16 → 필요한 SNR ≳ 13 dB · 회절한계의 13배 아래
     · 겹침(Poisson): ⚠ 기포는 시야 전체가 아니라 '혈관 안에만' → 유효밀도 = 1/면적비 배
       혈관 3% 가정 · PSF 5647µm² · 시야 120mm² → PSF 칸 637개
       프레임당 30개 → 겹침 2.3% · 240개 → 17.6%   (Renaudin: 검출·추적 후 ~30개)
     · 획득시간(Hingot 2019): 유량 ∝ d²v → 100µm 2.1분 · 20µm 4.4시간 · 10µm 35시간      */
const C = 1540, FQ = 15e6;
const LAM = C/FQ*1e3;                    /* mm — 0.1027 */
const APER = 0.110*128;                  /* mm — 14.08 */
const ZDEP = 10;                         /* mm — 평가 깊이 */
const FNUM = ZDEP/APER;
const FWHM = 0.886*LAM*FNUM;             /* mm */
const W6   = 1.207*LAM*FNUM;             /* mm */
const SIG_PSF = FWHM/2.3548;             /* mm */
const AXRES = C/(2*0.8*FQ)*1e3;          /* mm — 대역폭 0.8f₀ 가정 */

/* ── c1 : ULM 파이프라인 여섯 단계 (원리) ──
   Song 2018 Fig.1 의 흐름 + Errico 2015 · Heiles 2022 의 실제 수치
     ① MB 주입   조영제 1~3µm · 혈관 안에만 · 조직 클러터가 강해 기포가 묻힘(진폭 아닌 '움직임'으로 분리)
     ② 클러터 필터 SVD 시공간 (Demené 2015) 또는 프레임 차분 · 조직 제거
     ③ localization  MB 의 PSF 중심점을 부화소로 찾음 (radial-symmetry·Gauss-fit·weighted-avg 등)
     ④ pairing     프레임 n ↔ n+1 · Hungarian(Kuhn–Munkres) 또는 부분 배정
                  유속 상한으로 거리 행렬을 자름 (Song 2018: 50cm/s, Errico: 100mm/s)
     ⑤ 추적       5~10 프레임 이상 이어진 것만 채택 → 속도 벡터
     ⑥ 누적       λ/10~λ/16 격자에 수십만~수백만 개 → 미세혈관 지도                    */
const STAGES = [
  ["① MB 주입",        "미세기포가 혈관을 흐른다",         "32장 · 공명 크기"],
  ["② 클러터 필터",    "조직을 걷어낸다 — 기포만 남는다", "A6 · SVD"],
  ["③ localization",   "MB 의 PSF 중심점을 부화소로 찍는다", "17장 · CRLB"],
  ["④ pairing",        "프레임 n ↔ n+1 을 잇는다",        "배정 문제"],
  ["⑤ tracking",       "짝지은 MB 를 5~10 프레임 추적 → 궤적", "속도 벡터를 얻음"],
  ["⑥ 누적",           "수십만 개를 λ/10 격자에 쌓는다",  "미세혈관 지도"]
];
let stage = 0;
const stepBtn = document.getElementById("step");

/* ── 분기 혈관망 (3세대 트리) — 누적 단계의 결과 그림 ──
   부모 세그먼트 끝에서 자식이 갈라지며, 바깥쪽일수록 가늘어진다.        */
const VESSEL = [                   /* [x1,y1,x2,y2,폭] · 0~1 정규화 */
  [0.50,0.05, 0.50,0.34, 5.6],     /* 0 본줄기 */
  [0.50,0.34, 0.30,0.58, 4.0],     /* 1 좌 주가지 */
  [0.50,0.34, 0.69,0.56, 3.8],     /* 2 우 주가지 */
  [0.30,0.58, 0.15,0.90, 2.7],     /* 3 좌-좌 */
  [0.30,0.58, 0.41,0.89, 2.4],     /* 4 좌-우 */
  [0.69,0.56, 0.59,0.90, 2.5],     /* 5 우-좌 */
  [0.69,0.56, 0.86,0.79, 2.8],     /* 6 우-우 */
  [0.15,0.90, 0.07,0.98, 1.4],     /* 7 좌-좌 잔가지 */
  [0.41,0.89, 0.47,0.99, 1.3],     /* 8 좌-우 잔가지 */
  [0.59,0.90, 0.54,0.99, 1.2],     /* 9 우-좌 잔가지 */
  [0.86,0.79, 0.95,0.95, 1.5],     /* 10 우-우-a */
  [0.86,0.79, 0.79,0.97, 1.3],     /* 11 우-우-b */
];
/* 기포를 세그먼트에 배정 (굵은 혈관일수록 많이) */
const SEGMAP = [0,0,0, 1,1, 2,2, 3,3, 4, 5, 6,6, 7, 8, 9, 10, 11];
function bubState(i, phase){
  const k = SEGMAP[i % SEGMAP.length];
  const seg = VESSEL[k], w = seg[4];
  const sp  = 0.26 + 0.085*w;                     /* 굵을수록 빠름 (Poiseuille 근사) */
  const u   = ((phase*sp) + i*0.0837) % 1;
  const x = seg[0]+(seg[2]-seg[0])*u, y = seg[1]+(seg[3]-seg[1])*u;
  const L = Math.hypot(seg[2]-seg[0], seg[3]-seg[1]);
  return { x, y, w, k, u, sp,
           dx:(seg[2]-seg[0])/L, dy:(seg[3]-seg[1])/L };
}
const NB = 30;

/* ── c1 도우미 (고급 렌더) ── */
const SHORT7 = ["MBs Injection","Clutter Filter","Localization","Pairing","Tracking","Accumulation"];
function _rr7(ctx,x,y,w,h,r){ ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
function _bub7(ctx,x,y,r,kind){ const g=ctx.createRadialGradient(x,y,0,x,y,r);
  if(kind==="hot"){ g.addColorStop(0,"rgba(255,250,236,.98)"); g.addColorStop(.34,"rgba(255,206,120,.82)"); g.addColorStop(1,"rgba(255,150,40,0)"); }
  else { g.addColorStop(0,"rgba(234,253,255,.98)"); g.addColorStop(.42,"rgba(120,220,236,.55)"); g.addColorStop(1,"rgba(23,192,201,0)"); }
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); }
function _loc7(ctx,x,y){
  ctx.strokeStyle="rgba(125,250,255,.32)"; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(x,y,7,0,7); ctx.stroke();
  const g=ctx.createRadialGradient(x,y,0,x,y,4.5); g.addColorStop(0,"#eafdff"); g.addColorStop(1,"rgba(125,250,255,0)");
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,4.5,0,7); ctx.fill();
  ctx.fillStyle="#eafdff"; ctx.beginPath(); ctx.arc(x,y,1.5,0,7); ctx.fill();
  ctx.strokeStyle="rgba(150,250,255,.95)"; ctx.lineWidth=1; ctx.lineCap="round"; ctx.beginPath();
  ctx.moveTo(x-6.5,y); ctx.lineTo(x-3,y); ctx.moveTo(x+3,y); ctx.lineTo(x+6.5,y);
  ctx.moveTo(x,y-6.5); ctx.lineTo(x,y-3); ctx.moveTo(x,y+3); ctx.lineTo(x,y+6.5); ctx.stroke(); }
function _cap7(ctx,txt,x,y,accent){
  ctx.font=`600 ${Math.round(11.5*FS)}px 'Spline Sans','Noto Sans KR',sans-serif`;
  const tw=ctx.measureText(txt).width, padL=13, padR=11, h=23;
  _rr7(ctx,x,y-h/2,tw+padL+padR,h,7); ctx.fillStyle="rgba(6,9,13,.76)"; ctx.fill();
  ctx.fillStyle=accent; _rr7(ctx,x+4,y-h/2+4.5,3,h-9,1.5); ctx.fill();
  ctx.fillStyle="#eef3f7"; ctx.textAlign="left"; ctx.fillText(txt,x+padL,y+4); }
function _mix7(a,b,f){ return `rgb(${Math.round(a[0]+(b[0]-a[0])*f)},${Math.round(a[1]+(b[1]-a[1])*f)},${Math.round(a[2]+(b[2]-a[2])*f)})`; }
function _spc7(sp){ const u=Math.max(0,Math.min(1,(sp-0.35)/0.52));
  return u<0.5 ? _mix7([23,192,201],[240,165,0],u/0.5) : _mix7([240,165,0],[179,18,60],(u-0.5)/0.5); }
function _steps7(ctx,W,stage){
  const n=6, m=56, y=42, x0=m, sp=(W-2*m)/(n-1), nx=i=>x0+sp*i;
  ctx.lineCap="round"; ctx.strokeStyle="rgba(210,220,230,.9)"; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(nx(0),y); ctx.lineTo(nx(n-1),y); ctx.stroke();
  if(stage>0){ ctx.strokeStyle=SIGNAL; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(nx(0),y); ctx.lineTo(nx(stage),y); ctx.stroke(); }
  for(let i=0;i<n;i++){ const x=nx(i), on=i===stage, done=i<stage, r=on?13:8.5;
    if(on){ const g=ctx.createRadialGradient(x,y,2,x,y,24); g.addColorStop(0,"rgba(23,192,201,.5)"); g.addColorStop(1,"rgba(23,192,201,0)"); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,24,0,7); ctx.fill(); }
    ctx.fillStyle=(on||done)?SIGNAL:"#fff"; ctx.strokeStyle=(on||done)?SIGNAL_DK:"rgba(198,208,218,1)"; ctx.lineWidth=on?2.4:1.5;
    ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); ctx.stroke();
    ctx.textAlign="center";
    if(done){ ctx.strokeStyle="#fff"; ctx.lineWidth=2.2; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(x-3.5,y+0.5); ctx.lineTo(x-1,y+3); ctx.lineTo(x+3.6,y-3); ctx.stroke(); }
    else label(ctx,String(i+1),x,y+(on?4.5:3.5),on?"#fff":MUTED,on?12.5:10.5,700);
    label(ctx,SHORT7[i],x,y+28,on?SIGNAL_DK:MUTED,on?10:8.5,on?700:500); }
  ctx.textAlign="left";
}

const pipe = makeScene("c1", 470, (ctx,W,H,t)=>{
  document.getElementById("rstep").textContent = STAGES[stage][0];
  document.getElementById("rwhat").textContent = STAGES[stage][1];
  document.getElementById("rfrom").textContent = STAGES[stage][2];

  _steps7(ctx, W, stage);

  /* ── 아래 패널 ── */
  const px=16, py=92, pw=W-32, ph=H-py-14;
  const XX = u => px + u*pw, YY = v => py + v*ph;
  const grd=ctx.createLinearGradient(0,py,0,py+ph);
  if(stage===5){ grd.addColorStop(0,"#0b0603"); grd.addColorStop(1,"#050302"); }
  else if(stage===0){ grd.addColorStop(0,"#0f1720"); grd.addColorStop(1,"#0a1018"); }
  else { grd.addColorStop(0,"#0a0e13"); grd.addColorStop(1,"#06090d"); }
  ctx.fillStyle=grd; _rr7(ctx,px,py,pw,ph,9); ctx.fill();
  ctx.save(); _rr7(ctx,px,py,pw,ph,9); ctx.clip();

  const phase = t*0.5;
  const Fn=[], Fn1=[];
  for(let i=0;i<NB;i++){ Fn.push(bubState(i,phase)); Fn1.push(bubState(i,phase+0.055)); }

  if(stage===0){
    let sd=555; const R=()=>{sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x7fffffff;};
    for(let i=0;i<1000;i++){ ctx.fillStyle=`rgba(150,175,205,${(0.05+0.20*R()).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(px+R()*pw, py+R()*ph, 0.8+R()*1.7, 0, 7); ctx.fill(); }
    Fn.forEach(b=> _bub7(ctx, XX(b.x), YY(b.y), 10, "hot"));
    _cap7(ctx,"미세기포 주입 — 조직 클러터에 묻혀 있다", px+14, py+22, POS);
  }
  else if(stage===1){
    Fn.forEach(b=> _bub7(ctx, XX(b.x), YY(b.y), 12, "hot"));
    _cap7(ctx,"SVD 클러터 필터 — 조직이 사라지고 기포만 (A6)", px+14, py+22, SIGNAL_DK);
  }
  else if(stage===2){
    Fn.forEach(b=> _bub7(ctx, XX(b.x), YY(b.y), 10, "hot"));
    Fn.forEach(b=> _loc7(ctx, XX(b.x), YY(b.y)));
    _cap7(ctx,"국소화 — PSF 중심을 부화소로 (17장 · CRLB)", px+14, py+22, SIGNAL_DK);
  }
  else if(stage===3){
    Fn.forEach((b,i)=>{ const a=[XX(b.x),YY(b.y)], c=[XX(Fn1[i].x),YY(Fn1[i].y)];
      ctx.lineCap="round"; ctx.strokeStyle="rgba(234,241,246,.5)"; ctx.lineWidth=2.4;
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(c[0],c[1]); ctx.stroke();
      const an=Math.atan2(c[1]-a[1],c[0]-a[0]);
      ctx.beginPath(); ctx.moveTo(c[0],c[1]); ctx.lineTo(c[0]-Math.cos(an-.5)*7,c[1]-Math.sin(an-.5)*7);
      ctx.moveTo(c[0],c[1]); ctx.lineTo(c[0]-Math.cos(an+.5)*7,c[1]-Math.sin(an+.5)*7); ctx.stroke();
      _bub7(ctx,a[0],a[1],7,"cool"); ctx.fillStyle="#eafdff"; ctx.beginPath(); ctx.arc(a[0],a[1],2.1,0,7); ctx.fill();
      ctx.strokeStyle="#ffcf80"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(c[0],c[1],4,0,7); ctx.stroke(); });
    _cap7(ctx,"짝짓기 — 프레임 n(●)과 n+1(○)을 잇는다", px+14, py+22, SIGNAL_DK);
    _cap7(ctx,"★ 프레임 안이 아니라 프레임 사이를 잇는다", px+14, py+50, POS);
    ctx.textAlign="right"; label(ctx,"배정: Hungarian·최근접 · 유속 상한 넘는 짝은 잘라냄", px+pw-12, py+ph-12, "rgba(200,214,226,.8)", 10, 400); ctx.textAlign="left";
  }
  else if(stage===4){
    const NF=8;
    for(let i=0;i<NB;i++){ const path=[]; let prevK=-1, prevU=-1;
      for(let f=0;f<NF;f++){ const b=bubState(i, phase + f*0.055);
        if(prevK>=0 && b.k!==prevK) break;
        if(prevU>=0 && b.u < prevU-1e-6) break;   /* u 순환(감소) → 끊음: 역방향 화살표 방지 */
        prevK=b.k; prevU=b.u; path.push([XX(b.x),YY(b.y),b]); }
      if(path.length<2) continue;
      ctx.lineCap="round"; ctx.lineJoin="round";
      ctx.strokeStyle="rgba(23,192,201,.24)"; ctx.lineWidth=6.5; ctx.beginPath();
      path.forEach((p,j)=> j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke();
      ctx.strokeStyle="rgba(170,246,255,.95)"; ctx.lineWidth=2; ctx.beginPath();
      path.forEach((p,j)=> j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke();
      const a=path[path.length-2], c=path[path.length-1], sp=c[2].sp;
      _bub7(ctx,c[0],c[1],6,"cool");
      const ang=Math.atan2(c[1]-a[1],c[0]-a[0]), vlen=12+sp*17, tx=c[0]+Math.cos(ang)*vlen, ty=c[1]+Math.sin(ang)*vlen, vc=_spc7(sp);
      ctx.strokeStyle="rgba(0,0,0,.4)"; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(c[0],c[1]); ctx.lineTo(tx,ty); ctx.stroke();
      ctx.strokeStyle=vc; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(c[0],c[1]); ctx.lineTo(tx,ty);
      ctx.moveTo(tx,ty); ctx.lineTo(tx-Math.cos(ang-.42)*6,ty-Math.sin(ang-.42)*6);
      ctx.moveTo(tx,ty); ctx.lineTo(tx-Math.cos(ang+.42)*6,ty-Math.sin(ang+.42)*6); ctx.stroke();
    }
    _cap7(ctx,"추적 — 궤적과 속도벡터", px+14, py+22, SIGNAL_DK);
    const ly=py+ph-15, lx=px+14; ctx.lineCap="round";
    ctx.strokeStyle=_spc7(0.4); ctx.lineWidth=3.2; ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx+16,ly); ctx.stroke();
    label(ctx,"느림",lx+22,ly+3.5,"rgba(205,218,230,.9)",9.5,600);
    ctx.strokeStyle=_spc7(0.9); ctx.beginPath(); ctx.moveTo(lx+58,ly); ctx.lineTo(lx+74,ly); ctx.stroke();
    label(ctx,"빠름",lx+80,ly+3.5,"rgba(205,218,230,.9)",9.5,600);
    ctx.textAlign="right"; label(ctx,"짧은 궤적은 버림 (허위 검출 제거)", px+pw-14, ly+3.5, "rgba(200,214,226,.78)", 9.5, 400); ctx.textAlign="left";
  }
  else if(stage===5){
    VESSEL.forEach(([x1,y1,x2,y2,w])=>{ ctx.strokeStyle="rgba(255,140,45,.14)"; ctx.lineWidth=Math.max(3,w*2.3); ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(XX(x1),YY(y1)); ctx.lineTo(XX(x2),YY(y2)); ctx.stroke(); });
    let sd=2468; const R=()=>{sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x7fffffff;};
    for(let i=0;i<4200;i++){ const b=bubState(Math.floor(R()*SEGMAP.length), R()*40); const j=(R()-.5)*0.005, j2=(R()-.5)*0.005;
      const d=R(); const col= d>0.72? "255,250,222" : d>0.42? "255,206,112" : "255,150,60";
      ctx.fillStyle=`rgba(${col},${(0.12+0.28*R()).toFixed(3)})`; ctx.beginPath(); ctx.arc(XX(b.x+j),YY(b.y+j2),0.9,0,7); ctx.fill(); }
    _cap7(ctx,"누적 — 수십만 개를 λ/10 격자에 (미세혈관 지도)", px+14, py+22, AMBER_DK);
    _cap7(ctx,"★ 프레임 사이를 잇기에 프레임이 아주 많이 필요", px+14, py+50, POS);
    ctx.textAlign="right"; label(ctx,"Errico 2015: 150초 · 75,000장 → 100만 이벤트 · 화소 8×10µm (λ/10)", px+pw-12, py+ph-12, "rgba(214,190,150,.85)", 10, 400); ctx.textAlign="left";
  }

  ctx.restore();
  ctx.strokeStyle="rgba(217,224,231,.5)"; ctx.lineWidth=1; _rr7(ctx,px,py,pw,ph,9); ctx.stroke();
  ctx.textAlign="left";
}, {play:"play0", speed:0.03, tStill:6});
stepBtn.onclick = ()=>{ stage=(stage+1)%6; pipe.redraw(); };
/* ── c2 : 가를 수는 없어도 찍을 수는 있다 ── */
const sepS = document.getElementById("sep"), snrS = document.getElementById("snr");
let seed = 12345;
const rnd = () => { seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; };
const gauss = () => { let u=0,v=0; while(u===0)u=rnd(); while(v===0)v=rnd();
                      return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };

const loc = makeScene("c2", 400, (ctx,W,H,t)=>{
  const sepUM = +sepS.value, snrDb = +snrS.value;
  const snr = Math.pow(10, snrDb/20);
  const sigLoc = SIG_PSF*1000/snr;                    /* µm — 대략식 */
  document.getElementById("sepv").textContent = sepUM;
  document.getElementById("snrv").textContent = snrDb;
  document.getElementById("rpsf").textContent = (W6*1000).toFixed(0);
  document.getElementById("rloc").textContent = sigLoc.toFixed(2);
  document.getElementById("rgain").textContent = (W6*1000/sigLoc).toFixed(0);
  const rr = document.getElementById("rres");
  const resolved = sepUM > W6*1000;
  rr.textContent = resolved ? "갈라짐 ✓" : "하나로 뭉침 ✗";
  rr.style.color = resolved ? SIGNAL_DK : POS;
  const rg = document.getElementById("rgrid");
  rg.textContent = sigLoc <= 6.5 ? "맞음 ✓" : "부족";
  rg.style.color = sigLoc <= 6.5 ? SIGNAL_DK : AMBER_DK;

  const gap=16, LW=(W-gap-28)*0.54, RW=(W-gap-28)*0.46, L0=14, L1=L0+LW+gap;

  /* ── 왼쪽: 두 기포 — 가르기 ── */
  const wT=48, wB=H-38, base=wB-14;
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(L0,wT,LW,wB-wT);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(L0,wT,LW,wB-wT);
  const SPAN=400;                                     /* µm 가로 */
  const X1 = um => L0 + (um/SPAN + 0.5)*LW;
  const sg = SIG_PSF*1000;
  const prof = um => Math.exp(-Math.pow((um+sepUM/2)/sg,2)/2) + Math.exp(-Math.pow((um-sepUM/2)/sg,2)/2);
  let mx=0; for(let u=-SPAN/2;u<=SPAN/2;u+=1) mx=Math.max(mx, prof(u));
  const pts=[];
  for(let px=0;px<=LW;px++){ const um=(px/LW-0.5)*SPAN;
    pts.push([L0+px, base - prof(um)/mx*(base-wT-24)]); }
  ctx.fillStyle="rgba(27,79,160,.16)"; ctx.beginPath();
  ctx.moveTo(L0,base); pts.forEach(p=>ctx.lineTo(p[0],p[1])); ctx.lineTo(L0+LW,base); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=NEG; ctx.lineWidth=2.2; ctx.beginPath();
  pts.forEach((p,i)=> i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke();
  /* 실제 기포 위치 */
  [-sepUM/2, sepUM/2].forEach(u=>{
    ctx.fillStyle=POS; ctx.beginPath(); ctx.arc(X1(u), base+6, 3.5, 0, 7); ctx.fill(); });
  /* PSF 폭 자 */
  ctx.strokeStyle=AMBER; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(X1(-W6*1000/2), wT+18); ctx.lineTo(X1(W6*1000/2), wT+18); ctx.stroke();
  ctx.textAlign="center";
  chip(ctx, `PSF −6dB ${(W6*1000).toFixed(0)} µm`, L0+LW/2, wT+13, AMBER_DK, 10);
  chip(ctx, resolved ? `간격 ${sepUM}µm — 갈라짐` : `간격 ${sepUM}µm — 하나로 뭉침`,
       L0+LW/2, base+22, resolved?SIGNAL_DK:POS, 10.5);
  ctx.textAlign="left";
  chip(ctx, "① 가르기 — 회절 한계", L0, wT-8, NEG, 10.5);

  /* ── 오른쪽: 두 기포 — 찍기(2D 위치 지도) ── */
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(L1,wT,RW,wB-wT);
  ctx.strokeStyle=LINE; ctx.strokeRect(L1,wT,RW,wB-wT);
  ctx.save(); ctx.beginPath(); ctx.rect(L1,wT,RW,wB-wT); ctx.clip();     /* 큰 간격에서 반점이 박스 밖으로 안 나가게 */
  const cxR=L1+RW/2, cyR=(wT+wB)/2;
  const PXU = RW/SPAN;                                 /* px per µm — 왼쪽 프로파일과 같은 가로 스케일 */
  const xR  = um => cxR + um*PXU;
  const gain = W6*1000/sigLoc;
  const half = sepUM/2;
  /* PSF 흐릿한 반점 2개 (가까우면 겹쳐 하나로 뭉침) */
  [-half, half].forEach(u=>{
    const rad=W6*1000/2*PXU;
    ctx.save(); ctx.translate(xR(u), cyR); ctx.scale(1, AXRES/W6);
    const g=ctx.createRadialGradient(0,0,0, 0,0, rad);
    g.addColorStop(0,"rgba(27,79,160,.22)"); g.addColorStop(.6,"rgba(27,79,160,.09)"); g.addColorStop(1,"rgba(27,79,160,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,rad,0,7); ctx.fill(); ctx.restore();
  });
  /* localization 산포 2개 (재생하면 표본이 쌓임) */
  seed=20250717;
  const NPT=150, phase=Math.floor(t*14);
  [-half, half].forEach(u=>{
    for(let i=0;i<NPT;i++){
      const dx=gauss()*sigLoc, dy=gauss()*sigLoc*(AXRES/W6);
      const a=(i < (phase%NPT)) ? 0.8 : 0.14;
      ctx.fillStyle=`rgba(14,143,151,${a})`;
      ctx.beginPath(); ctx.arc(xR(u)+dx*PXU, cyR+dy*PXU, 1.7, 0, 7); ctx.fill();
    }
  });
  /* σ_loc 원 + 참 위치 십자 2개 */
  [-half, half].forEach(u=>{
    ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.3;
    ctx.beginPath(); ctx.arc(xR(u), cyR, Math.max(3.2, sigLoc*PXU), 0, 7); ctx.stroke();
    ctx.strokeStyle=POS; ctx.lineWidth=1.7;
    ctx.beginPath(); ctx.moveTo(xR(u)-6,cyR); ctx.lineTo(xR(u)+6,cyR);
    ctx.moveTo(xR(u),cyR-6); ctx.lineTo(xR(u),cyR+6); ctx.stroke();
  });
  ctx.restore();                                        /* clip 해제 */
  ctx.textAlign="left";
  chip(ctx, "② 찍기 — SNR 이 정한다", L1, wT-8, SIGNAL_DK, 10.5);
  ctx.textAlign="center";
  chip(ctx, `σ_loc ${sigLoc.toFixed(1)}µm · PSF의 1/${gain.toFixed(0)}`, cxR, wT+14, SIGNAL_DK, 9.5);
  let msgR, colR;
  if (sepUM > W6*1000){ msgR = "두 위치 분리 ✓ — 회절로도 가능"; colR = SIGNAL_DK; }
  else if (sepUM > 3*sigLoc){ msgR = "회절론 뭉쳐도 — 찍기론 분리 ✓"; colR = SIGNAL_DK; }
  else { msgR = "너무 가까움 — 찍기도 뭉침"; colR = POS; }
  chip(ctx, msgR, cxR, wB-8, colR, 10);
  ctx.textAlign="left";
  chip(ctx, `15 MHz · 개구 ${APER.toFixed(1)}mm · 깊이 ${ZDEP}mm · F# ${FNUM.toFixed(2)} · λ ${(LAM*1000).toFixed(0)}µm`,
       L0, 22, MUTED, 9.5, 400);
}, {play:"play", speed:0.03, tStill:9});
sepS.oninput = snrS.oninput = loc.redraw;


/* ── c3 : 농도의 거래 ── */
const nbS = document.getElementById("nb"), vfS = document.getElementById("vf");
const APSF = W6*AXRES;                   /* mm² */
const FOV = 120;                         /* mm² */

const conc = makeScene("c3", 360, (ctx,W,H)=>{
  const N = +nbS.value, vf = +vfS.value/100;
  const cells = FOV*vf/APSF;
  const lam = N/cells;
  const p0=Math.exp(-lam), p1=lam*Math.exp(-lam);
  const pOv = 1 - p1/(1-p0);
  const good = N*(1-pOv);
  document.getElementById("nbv").textContent = N;
  document.getElementById("vfv").textContent = (vf*100).toFixed(1);
  document.getElementById("rcell").textContent = Math.round(cells);
  document.getElementById("rlam").textContent = lam.toFixed(3);
  document.getElementById("rov").textContent = (pOv*100).toFixed(1);
  document.getElementById("rgood").textContent = good.toFixed(0);
  const st=document.getElementById("cstat");
  st.textContent = pOv>0.15 ? `겹침 ${(pOv*100).toFixed(0)}% — mislocalization가 지도를 더럽힘`
                            : `겹침 ${(pOv*100).toFixed(1)}% — 안전한 자리`;
  st.style.color = pOv>0.15 ? POS : SIGNAL_DK;

  const L=56, R=16, PW=W-L-R, T=18, B=H-34, PH=B-T;
  const NMAX=400;
  const X = n => L + n/NMAX*PW;
  const Y = v => B - Math.max(0,Math.min(1,v))*PH;        /* 0~1 정규화 */
  ctx.textAlign="right";
  for(let v=0; v<=1.001; v+=0.2){
    ctx.strokeStyle = v===0?"rgba(217,224,231,.9)":"rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y(v)); ctx.lineTo(L+PW,Y(v)); ctx.stroke();
    label(ctx, `${(v*100).toFixed(0)}%`, L-7, Y(v)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  /* 겹침 곡선 */
  ctx.strokeStyle=POS; ctx.lineWidth=2.4; ctx.beginPath();
  for(let n=1;n<=NMAX;n+=2){
    const l=n/cells, q=1-(l*Math.exp(-l))/(1-Math.exp(-l));
    const px=X(n), py=Y(q); (n===1)?ctx.moveTo(px,py):ctx.lineTo(px,py);
  }
  ctx.stroke();
  /* 쓸 수 있는 검출 (오른쪽 축, 0~NMAX 를 0~1 로) */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.4; ctx.beginPath();
  for(let n=1;n<=NMAX;n+=2){
    const l=n/cells, q=1-(l*Math.exp(-l))/(1-Math.exp(-l));
    const px=X(n), py=Y(n*(1-q)/NMAX); (n===1)?ctx.moveTo(px,py):ctx.lineTo(px,py);
  }
  ctx.stroke();
  /* 15% 위험선 */
  ctx.strokeStyle="rgba(179,18,60,.5)"; ctx.setLineDash([5,4]); ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,Y(0.15)); ctx.lineTo(L+PW,Y(0.15)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; chip(ctx,"겹침 15% — 실용 한계선", L+PW-3, Y(0.15)-5, POS, 9.5);
  /* 현재 점 */
  ctx.fillStyle=POS; ctx.beginPath(); ctx.arc(X(N), Y(pOv), 5, 0, 7); ctx.fill();
  ctx.fillStyle=SIGNAL_DK; ctx.beginPath(); ctx.arc(X(N), Y(good/NMAX), 5, 0, 7); ctx.fill();
  ctx.textAlign="center";
  chip(ctx, `겹침 ${(pOv*100).toFixed(1)}%`, X(N), Y(pOv)-11, POS, 10);
  chip(ctx, `쓸 수 있는 ${good.toFixed(0)}개`, X(N), Y(good/NMAX)+18, SIGNAL_DK, 10);
  /* Renaudin 30개 */
  ctx.strokeStyle=AMBER; ctx.lineWidth=1.4; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(X(30),T); ctx.lineTo(X(30),B); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="center"; chip(ctx,"Renaudin ~30", X(30), T+11, AMBER_DK, 9.5);
  [0,100,200,300,400].forEach(n=> label(ctx, `${n}`, X(n), B+14, MUTED, 9, 400));
  chip(ctx,"프레임당 기포 수 →", L+PW/2, B+27, MUTED, 9.5, 400);
  ctx.textAlign="left";
  chip(ctx, `혈관 면적비 ${(vf*100).toFixed(1)}% → 유효 밀도 ${(1/vf).toFixed(0)}배 · PSF 칸 ${Math.round(cells)}개`,
       L+4, T+11, AMBER_DK, 10);
});
nbS.oninput = vfS.oninput = conc.redraw;


/* ── c4 : 획득 시간 (Hingot 2019) ── */
const dvS = document.getElementById("dv"), ccS = document.getElementById("cc");
const velOf = d => Math.max(0.5, 0.1*d);        /* µm → mm/s · 대략 v ∝ d (Poiseuille 근사) */
function rateOf(dUM, concPerML){
  const A = Math.PI*Math.pow(dUM/2*1e-6, 2);    /* m² */
  const Q = A*(velOf(dUM)*1e-3);                /* m³/s */
  return Q*concPerML*1e6;                       /* 개/s */
}
const acq = makeScene("c4", 340, (ctx,W,H)=>{
  const d = +dvS.value, cc = +ccS.value*1e5;
  const v = velOf(d), rate = rateOf(d, cc), tSec = 1000/rate;
  document.getElementById("dvv").textContent = d;
  document.getElementById("ccv").textContent = (cc/1e5).toFixed(1);
  document.getElementById("rvel").textContent = v.toFixed(1);
  document.getElementById("rrate").textContent = rate<0.01 ? rate.toExponential(1) : rate.toFixed(2);
  const rt = document.getElementById("rtime");
  rt.textContent = tSec<60 ? `${tSec.toFixed(0)} 초` : (tSec<3600 ? `${(tSec/60).toFixed(1)} 분` : `${(tSec/3600).toFixed(1)} 시간`);
  const rv = document.getElementById("rv");
  if(tSec < 300){ rv.textContent="실용적"; rv.style.color=SIGNAL_DK; }
  else if(tSec < 3600){ rv.textContent="분 단위 — 힘듦"; rv.style.color=AMBER_DK; }
  else { rv.textContent="사실상 불가능"; rv.style.color=POS; }
  const st=document.getElementById("tstat");
  st.textContent = `지름 ${d}µm · 유속 ${v.toFixed(1)}mm/s → ${rate<0.01?rate.toExponential(1):rate.toFixed(2)} 개/s`;
  st.style.color = tSec<300 ? SIGNAL_DK : POS;

  const L=58, R=16, PW=W-L-R, T=18, B=H-34, PH=B-T;
  const DMIN=6, DMAX=200;
  const TLO=Math.log10(1), THI=Math.log10(2e5);       /* 초, 로그 */
  const X = dd => L + (Math.log10(dd)-Math.log10(DMIN))/(Math.log10(DMAX)-Math.log10(DMIN))*PW;
  const Y = s => B - Math.max(0,Math.min(1,(Math.log10(Math.max(s,1))-TLO)/(THI-TLO)))*PH;
  ctx.textAlign="right";
  [[1,"1초"],[60,"1분"],[3600,"1시간"],[86400,"1일"]].forEach(([s,l])=>{
    ctx.strokeStyle="rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y(s)); ctx.lineTo(L+PW,Y(s)); ctx.stroke();
    label(ctx, l, L-7, Y(s)+3.5, MUTED, 9, 400);
  });
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-42,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"1,000개 모으는 시간 (로그)",-58,0,MUTED,9.5,400); ctx.restore();
  /* 위험 영역 */
  ctx.fillStyle="rgba(179,18,60,.08)"; ctx.fillRect(L, T, PW, Y(3600)-T);
  ctx.textAlign="right"; chip(ctx,"1시간 이상 — 사실상 불가능", L+PW-3, Y(3600)-6, POS, 9.5);
  /* 곡선 */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.6; ctx.beginPath();
  let first=true;
  for(let dd=DMIN; dd<=DMAX; dd*=1.02){
    const s=1000/rateOf(dd,cc), px=X(dd), py=Y(s);
    first?(ctx.moveTo(px,py),first=false):ctx.lineTo(px,py);
  }
  ctx.stroke();
  /* 현재 점 */
  ctx.fillStyle = tSec<300?SIGNAL_DK:(tSec<3600?AMBER_DK:POS);
  ctx.beginPath(); ctx.arc(X(d), Y(tSec), 5.5, 0, 7); ctx.fill();
  ctx.textAlign="center";
  chip(ctx, `${d}µm → ${tSec<60?tSec.toFixed(0)+"초":(tSec<3600?(tSec/60).toFixed(1)+"분":(tSec/3600).toFixed(1)+"시간")}`,
       X(d), Y(tSec)-11, tSec<300?SIGNAL_DK:POS, 10.5);
  /* 모세혈관 구간 */
  ctx.strokeStyle="rgba(240,165,0,.5)"; ctx.setLineDash([3,4]); ctx.lineWidth=1.2;
  [10,100].forEach(dd=>{ ctx.beginPath(); ctx.moveTo(X(dd),T); ctx.lineTo(X(dd),B); ctx.stroke(); });
  ctx.setLineDash([]);
  chip(ctx,"모세혈관 10µm", X(10), T+11, AMBER_DK, 9);
  chip(ctx,"세동맥 100µm", X(100), T+11, AMBER_DK, 9);
  [6,10,20,50,100,200].forEach(dd=> label(ctx, `${dd}`, X(dd), B+14, MUTED, 9, 400));
  chip(ctx,"혈관 지름 (µm, 로그) →", L+PW/2, B+27, MUTED, 9.5, 400);
  ctx.textAlign="left";
  chip(ctx, `농도 ${(cc/1e5).toFixed(1)}×10⁵/mL · 유량 ∝ d²v`, L+4, T+11, MUTED, 9.5, 400);
});
dvS.oninput = ccS.oninput = acq.redraw;


/* ── c5 : ULM vs 파워 도플러 (같은 혈관망, 해상도 대비) ──
   A6 파워도플러(회절 한계 → 큰 혈관만·흐림) 기준 vs ULM(λ/10 초해상 → 미세혈관·선명)  */
function genTreeA7(){
  let sd=24680; const rr=()=>{ sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x7fffffff; };
  const segs=[];
  (function branch(x,y,ang,len,w,d){
    if(d>8 || len<0.015 || w<0.28) return;
    const x2=x+Math.cos(ang)*len, y2=y+Math.sin(ang)*len;
    segs.push([x,y,x2,y2,w]);
    const n = d<2 ? 2 : (rr()<0.82 ? 2 : 1);
    for(let i=0;i<n;i++){
      const da=(i-(n-1)/2)*(0.36+rr()*0.44)+(rr()-0.5)*0.2;
      branch(x2,y2,ang+da,len*(0.68+rr()*0.2),w*0.72,d+1);
    }
  })(0.5,0.05,Math.PI/2,0.17,3.6,0);
  (function branch(x,y,ang,len,w,d){
    if(d>7 || len<0.015 || w<0.28) return;
    const x2=x+Math.cos(ang)*len, y2=y+Math.sin(ang)*len;
    segs.push([x,y,x2,y2,w]);
    for(let i=0;i<2;i++){ const da=(i-0.5)*(0.44+rr()*0.4);
      branch(x2,y2,ang+da,len*(0.7+rr()*0.18),w*0.72,d+1); }
  })(0.20,0.06,Math.PI/2.3,0.15,3.0,0);
  return segs;
}
const CMP_TREE = genTreeA7();

/* 파워 도플러: 회절 한계 → 큰 혈관은 부드러운 관, 가는 혈관은 개별 해상이 안 되어 '번진 확산'으로 뭉개짐
   (A6 와 동일한 렌더 — 미세혈관이 '있긴 하나 블러로 안 갈림') */
function pdImgA7(ctx,ix,iy,iw,ih){
  ctx.fillStyle="#0b0400"; ctx.fillRect(ix,iy,iw,ih);
  ctx.save(); ctx.beginPath(); ctx.rect(ix,iy,iw,ih); ctx.clip();
  const k=iw/320; ctx.lineCap="round"; ctx.lineJoin="round";
  const colr=w=>{ const g=Math.round(95+115*Math.min(1,w/3)), b=Math.round(25+55*Math.min(1,w/4)); return [g,b]; };
  /* 1) 가는 혈관(w<1.3) = 확산 신호 — 넓고 흐리게(개별 해상 불가), shadowBlur 없이 */
  ctx.shadowBlur=0;
  [[7,0.05],[3.4,0.09]].forEach(([lw,a])=>{
    CMP_TREE.forEach(([x1,y1,x2,y2,w])=>{ if(w>=1.3) return;
      const [g,b]=colr(w);
      ctx.strokeStyle=`rgba(255,${g},${b},${a})`; ctx.lineWidth=Math.max(1.4,lw*k);
      ctx.beginPath(); ctx.moveTo(ix+x1*iw,iy+y1*ih); ctx.lineTo(ix+x2*iw,iy+y2*ih); ctx.stroke();
    });
  });
  /* 2) 큰 혈관(w≥1.3) = 부드러운 관 (shadowBlur) */
  const big=(bm,wm,am)=>CMP_TREE.forEach(([x1,y1,x2,y2,w])=>{ if(w<1.3) return;
    const [g,b]=colr(w), aa=Math.min(1,0.26+w*0.12)*am;
    ctx.shadowColor=`rgba(255,${g},${b},0.9)`; ctx.shadowBlur=Math.max(4,iw*0.024)*bm;
    ctx.strokeStyle=`rgba(255,${g},${b},${aa.toFixed(2)})`; ctx.lineWidth=Math.max(1.4,w*wm*k);
    ctx.beginPath(); ctx.moveTo(ix+x1*iw,iy+y1*ih); ctx.lineTo(ix+x2*iw,iy+y2*ih); ctx.stroke();
  });
  big(4.6,2.8,0.34); big(2.6,1.7,0.52); big(1.5,0.9,0.70);
  ctx.shadowBlur=0; ctx.shadowColor="rgba(0,0,0,0)"; ctx.restore();
  ctx.strokeStyle=LINE; ctx.strokeRect(ix,iy,iw,ih);
}
/* ULM: 모든 가지를 선명한 가는 선 + 국소화된 기포 점 */
function ulmImgA7(ctx,ix,iy,iw,ih){
  ctx.fillStyle="#0b0400"; ctx.fillRect(ix,iy,iw,ih);
  ctx.save(); ctx.beginPath(); ctx.rect(ix,iy,iw,ih); ctx.clip();
  CMP_TREE.forEach(([x1,y1,x2,y2,w])=>{
    const g=Math.round(120+110*Math.min(1,w/3));
    ctx.strokeStyle=`rgba(255,${g},70,${Math.min(1,0.55+w*0.14).toFixed(2)})`;
    ctx.lineWidth=Math.max(0.7, w*0.5); ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(ix+x1*iw,iy+y1*ih); ctx.lineTo(ix+x2*iw,iy+y2*ih); ctx.stroke();
  });
  ctx.restore();
  ctx.strokeStyle=LINE; ctx.strokeRect(ix,iy,iw,ih);
}

makeScene("c5", 360, (ctx,W,H)=>{
  const gap=22, pad=16, topLabel=42;
  const iw=(W-pad*2-gap)/2, ih=H-topLabel-16, iy=topLabel;
  const lx=pad, rx=pad+iw+gap;
  ctx.textAlign="center";
  chip(ctx,"파워 도플러 (A6)", lx+iw/2, 18, POS, 11, 700);
  chip(ctx,"회절 한계 · 미세혈관은 뭉개져 안 갈림", lx+iw/2, 34, MUTED, 9.5, 400);
  chip(ctx,"ULM", rx+iw/2, 18, SIGNAL_DK, 11, 700);
  chip(ctx,"λ/10 초해상 · 미세혈관까지 · 선명", rx+iw/2, 34, MUTED, 9.5, 400);
  pdImgA7(ctx, lx, iy, iw, ih);
  ulmImgA7(ctx, rx, iy, iw, ih);
  ctx.textAlign="center";
  chip(ctx,"같은 혈관망 · 같은 원리(기포 국소화)로부터", W/2, iy+ih+11, INK2, 10, 400);
});
