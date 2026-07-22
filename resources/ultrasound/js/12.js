/* ═══ 12 초음파 빔 형성 · 애니메이션 ═══
   두 장면 모두 '점 파원을 늘어놓고 더한 것' 뿐입니다 (하위헌스).
   빔은 코드 어디에도 없습니다 — 간섭의 결과로 나타납니다. */

/* ★ core.js 버전 가드 — 이 검사만은 core.js 에 의존하면 안 됩니다.
   옛 core.js 면 makeCW 가 없어 스크립트가 조용히 죽고 캔버스가 빕니다.
   그래서 여기서 직접 캔버스에 안내를 찍습니다. */
if (typeof makeCW !== "function") {
  document.querySelectorAll("canvas").forEach(c => {
    const g = c.getContext("2d"); if (!g) return;
    g.fillStyle = "#FFF5F7"; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "#B3123C"; g.lineWidth = 2; g.strokeRect(1, 1, c.width-2, c.height-2);
    g.fillStyle = "#B3123C"; g.font = "700 17px system-ui,sans-serif";
    g.fillText("assets/core.js 가 옛 버전입니다", 24, 44);
    g.fillStyle = "#2b3d50"; g.font = "400 14px system-ui,sans-serif";
    g.fillText("① 최신 assets/core.js 로 덮어쓰기", 24, 76);
    g.fillText("② 브라우저에서 Ctrl+Shift+R (맥: Cmd+Shift+R) 로 강력 새로고침", 24, 100);
    g.fillStyle = "#5b6b7b"; g.font = "400 13px system-ui,sans-serif";
    g.fillText("_check.html 을 열면 무엇이 빠졌는지 알려줍니다.", 24, 128);
  });
  throw new Error("core.js 가 옛 버전입니다 (makeCW 없음)");
}


/* ── 히어로: 개구 D/λ 가 빔을 만든다 ── */
const LAM1 = 34, K1 = 2*Math.PI/LAM1, OM1 = 2.2;
const dlS = document.getElementById("dl");
const F1 = makeCW(4);

const hero = makeScene("c1", 360, (ctx,W,H,t)=>{
  const DL = +dlS.value;                 /* 개구 = DL 파장 */
  const D  = DL*LAM1;                    /* 화면상 개구 (px) */
  const x0 = 30, cy = H/2;
  const N  = Math.max(2, Math.min(41, Math.round(DL*3)+2));   /* 점 파원 개수 */
  const el = [];
  for(let i=0;i<N;i++) el.push(cy - D/2 + D*(N>1? i/(N-1):0.5));

  document.getElementById("dlv").textContent = DL.toFixed(1);
  document.getElementById("dlr").textContent = DL.toFixed(1);
  const s = 1.22/DL;
  const dv = document.getElementById("dvg");
  dv.textContent = s<=1 ? (Math.asin(s)*180/Math.PI).toFixed(1) : "널 없음";
  const beh = document.getElementById("beh");
  if(DL < 0.6){ beh.textContent="점 파원 — 사방으로"; beh.style.color=NEG; }
  else if(DL < 3){ beh.textContent="퍼짐 — 빔이라 하기 어려움"; beh.style.color=MUTED; }
  else { beh.textContent="빔 — 앞으로 뻗음"; beh.style.color=SIGNAL_DK; }
  const st=document.getElementById("bstat");
  st.textContent = `점 파원 ${N}개 · 개구 ${DL.toFixed(1)} λ`;
  st.style.color = MUTED;

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(F1.frame(W,H, OM1*t, `${dlS.value}`, (x,y)=>{
    if(x < x0-2) return null;
    let sr=0, si=0;
    for(let i=0;i<N;i++){
      const r = Math.hypot(x-x0, y-el[i]), a = 1/Math.sqrt(Math.max(r,5));
      sr += a*Math.sin(K1*r); si += a*Math.cos(K1*r);
    }
    const g = 4.0/Math.sqrt(N);
    return [g*sr, g*si];
  }),0,0,W,H);

  /* 파원 */
  el.forEach(y=>{ ctx.beginPath(); ctx.arc(x0,y,2.6,0,7); ctx.fillStyle=SIGNAL; ctx.fill(); });
  /* 개구 자 */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(x0-16,cy-D/2); ctx.lineTo(x0-16,cy+D/2);
  ctx.moveTo(x0-20,cy-D/2); ctx.lineTo(x0-12,cy-D/2);
  ctx.moveTo(x0-20,cy+D/2); ctx.lineTo(x0-12,cy+D/2); ctx.stroke();
  /* λ 자 (비교 기준) */
  const ly=H-22;
  ctx.strokeStyle=INK; ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(x0,ly); ctx.lineTo(x0+LAM1,ly);
  ctx.moveTo(x0,ly-5); ctx.lineTo(x0,ly+5); ctx.moveTo(x0+LAM1,ly-5); ctx.lineTo(x0+LAM1,ly+5); ctx.stroke();
  chip(ctx,"λ", x0+LAM1/2-4, ly-8, INK, 11);
  chip(ctx,"← 이 길이와 개구를 견줍니다", x0+LAM1+10, ly+4, MUTED, 9.5, 400);
  /* 확산각 */
  if(s<=1 && DL>=1.5){
    const th=Math.asin(s), L=Math.min(W-x0-10, 300);
    ctx.strokeStyle=AMBER; ctx.lineWidth=1.6; ctx.setLineDash([4,3]);
    [1,-1].forEach(sg=>{ ctx.beginPath(); ctx.moveTo(x0,cy);
      ctx.lineTo(x0+L*Math.cos(th), cy+sg*L*Math.sin(th)); ctx.stroke(); });
    ctx.setLineDash([]);
    chip(ctx,`확산각 ${(th*180/Math.PI).toFixed(1)}°`, x0+L*0.62, cy-L*Math.sin(th)*0.62-8, AMBER_DK, 10.5);
  }
  ctx.textAlign="right";
  chip(ctx, `개구 D = ${DL.toFixed(1)} λ · 점 파원 ${N}개`, W-8, 22, SIGNAL_DK, 11);
  ctx.textAlign="left";
}, {play:"play", speed:0.030, tStill:3});
dlS.oninput = hero.redraw;

/* ── 근거리장 · 원거리장 · 자연 초점 ──
   같은 선음원 모델로 음장과 축상 음압을 '함께' 계산합니다.
   그래서 마커와 그림이 어긋나지 않습니다.
   (원형 피스톤의 고전 결과 D²/4λ 는 본문에 따로 제시) */
const dl2S = document.getElementById("dl2"), fr2S = document.getElementById("fr2");
const F2 = makeField(4);
const C_TIS = 1540;

const nf = makeScene("c2", 400, (ctx,W,H)=>{
  const Dmm = +dl2S.value, fMHz = +fr2S.value;
  const lam = C_TIS/(fMHz*1e6)*1e3;          /* mm */
  const DL  = Dmm/lam;
  document.getElementById("dl2v").textContent = Dmm.toFixed(1);
  document.getElementById("fr2v").textContent = fMHz.toFixed(1);
  document.getElementById("lm").textContent   = lam.toFixed(3);
  document.getElementById("dlr2").textContent = DL.toFixed(1);
  const sd = 1.22*lam/Dmm;
  document.getElementById("dv2").textContent = sd<=1 ? (Math.asin(sd)*180/Math.PI).toFixed(1) : "—";

  /* 물리 좌표 (mm) — 화면 깊이 범위는 근거리장의 2.2배 */
  const Nf_circ = (Dmm*Dmm/4 - lam*lam/4)/lam;     /* 원형 피스톤 근거리장 D²/4λ (교과서) */
  const ZMAX = Math.max(10, Nf_circ*1.6 + 10);     /* 덜 비례 → 초점거리 변화가 화면에 보임 */
  const FY = 26, FH = 200, PY = FY+FH+52, PH = 76;
  const PXz = W/ZMAX;                               /* px per mm (깊이) */
  const PXy = FH/26;                               /* px per mm (횡방향) — 고정: 개구 D 커지면 개구·빔도 넓어짐 */
  const cy  = FY + FH/2;
  const a   = Dmm/2;
  const k   = 2*Math.PI/lam;
  const NS  = 33;                                    /* 선음원 표본 수 */

  /* 축상 음압(아래 프로파일용) — 정확한 원형 피스톤 |p|/p₀ = 2|sin((k/2)(√(z²+a²)−z))| */
  const piston = zmm => 2*Math.abs(Math.sin((k/2)*(Math.hypot(zmm,a)-zmm)));
  /* 세로 음장(위)용 — 선음원 회절 모델(실제 간섭 무늬). zsc=자연초점 위치 맞춤, 정규화는 근접 스파이크 제외 */
  function axialLine(zmm){
    let re=0, im=0;
    for(let i=0;i<NS;i++){
      const y=-a+2*a*i/(NS-1), r=Math.hypot(zmm,y);
      re+=Math.cos(k*r)/Math.sqrt(Math.max(r,0.05));
      im+=Math.sin(k*r)/Math.sqrt(Math.max(r,0.05));
    }
    return Math.hypot(re,im)/NS;
  }
  const ZL=Nf_circ*4; let pv=axialLine(0.05), rising=false, lineLast=0;
  for(let z=0.05+ZL/1200; z<=ZL; z+=ZL/1200){ const v=axialLine(z);
    if(v>pv) rising=true; else if(rising){ lineLast=z-ZL/1200; rising=false; } pv=v; }
  const zsc = lineLast>0 ? lineLast/Nf_circ : 1.44;
  const NF = Nf_circ;                                /* 근거리장(자연 초점) = D²/4λ */
  let amax=0; const zA=Math.max(1, Nf_circ*0.06);    /* 근접(z→0) 수치 스파이크 제외 → D 무관하게 밝게 */
  for(let z=zA; z<=ZMAX*zsc; z+=ZMAX*zsc/700){ const v=axialLine(z); if(v>amax)amax=v; }
  document.getElementById("nf").textContent = NF.toFixed(1);
  const st=document.getElementById("nstat");
  st.textContent = `D/λ = ${DL.toFixed(1)} · 근거리장 ${NF.toFixed(1)} mm`;
  st.style.color = SIGNAL_DK;

  /* 세로 단면 음장 (|p|) — 선음원 회절: 실제 간섭 무늬 */
  ctx.imageSmoothingEnabled=true;
  ctx.drawImage(F2.render(W, FY+FH, (px,py)=>{
    if(py<FY) return null;
    const zmm=px/PXz*zsc, ymm=(py-cy)/PXy;
    if(zmm<0.05) return null;
    let re=0, im=0;
    for(let i=0;i<NS;i++){
      const ys=-a+2*a*i/(NS-1), r=Math.hypot(zmm, ymm-ys);
      re+=Math.cos(k*r)/Math.sqrt(Math.max(r,0.05));
      im+=Math.sin(k*r)/Math.sqrt(Math.max(r,0.05));
    }
    return Math.min(1, Math.hypot(re,im)/NS/amax*1.15);
  }),0,0,W,FY+FH);

  /* 개구 */
  ctx.fillStyle=INK; ctx.fillRect(0, cy-a*PXy, 5, 2*a*PXy);
  /* 근거리장 경계 */
  const xN=NF*PXz;
  if(xN<W-4){
    ctx.strokeStyle=AMBER; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(xN,FY); ctx.lineTo(xN,PY+PH+6); ctx.stroke();
    ctx.textAlign="center";
    chip(ctx,`자연 초점 ${NF.toFixed(1)} mm`, Math.min(xN, W-80), FY+13, AMBER_DK, 11);
    ctx.textAlign="left";
    chip(ctx,"근거리장", Math.max(6,xN/2-30), FY+FH-8, MUTED, 10);
    if(xN<W-90) chip(ctx,"원거리장", xN+12, FY+FH-8, MUTED, 10);
  }

  /* 축상 음압 프로파일 */
  ctx.fillStyle="rgba(43,61,80,.03)"; ctx.fillRect(0,PY-6,W,PH+12);
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(0,PY+PH); ctx.lineTo(W,PY+PH); ctx.stroke();
  const p=new Path2D(); p.moveTo(0,PY+PH);
  for(let px=1;px<=W;px++) p.lineTo(px, PY+PH - Math.min(1,piston(px/PXz)/2)*PH);
  p.lineTo(W,PY+PH); p.closePath();
  ctx.fillStyle="rgba(179,18,60,.32)"; ctx.fill(p);
  /* 포락선: 근거리장 2p₀ 일정 → 원거리장 단조 감소 (개구 커져도 2p₀ 그대로, Nf만 멀어짐) */
  ctx.strokeStyle=POS; ctx.lineWidth=2.2; ctx.beginPath();
  for(let px=1;px<=W;px++){ const z=px/PXz, e=z<=NF?2:piston(z);
    const yy=PY+PH-Math.min(1,e/2)*PH; px===1?ctx.moveTo(px,yy):ctx.lineTo(px,yy); }
  ctx.stroke();
  chip(ctx,"축 위 음압", 6, PY+12, POS, 10.5);
  ctx.textAlign="left"; label(ctx,"포락선 2p₀ (개구 무관)", 76, PY+12, POS, 9.5, 400);

  /* 깊이 눈금 */
  const gs = ZMAX>80?20: ZMAX>40?10: ZMAX>16?5:2;
  for(let z=gs; z<ZMAX; z+=gs){
    const x=z*PXz;
    ctx.strokeStyle=LINE; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(x,PY+PH); ctx.lineTo(x,PY+PH+5); ctx.stroke();
    ctx.textAlign="center"; label(ctx,`${z}`,x,PY+PH+18,INK,10); ctx.textAlign="left";
  }
  label(ctx,"깊이 (mm)", W-72, PY+PH+18, MUTED, 9.5, 400);
  ctx.textAlign="right";
  chip(ctx,`D = ${Dmm} mm · f = ${fMHz} MHz · λ = ${lam.toFixed(3)} mm`, W-8, 18, INK, 10.5);
  ctx.textAlign="left";
});
dl2S.oninput = fr2S.oninput = nf.redraw;
