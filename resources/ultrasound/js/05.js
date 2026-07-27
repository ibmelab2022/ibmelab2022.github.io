/* ═══ 05 초음파 굴절 · 애니메이션 ═══ */

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

const OM = 2.6;
const PAIR = [
  {a:med("연부조직"), b:med("뼈")},
  {a:med("지방"),     b:med("근육")},
  {a:med("근육"),     b:med("지방")},
  {a:med("연부조직"), b:med("물")},
];

/* ── 히어로: 평면파 굴절 ── */
const preS=document.getElementById("pre"), angS=document.getElementById("ang");
const F1=makeCW(3);
const hero = makeScene("c1", 340, (ctx,W,H,t)=>{
  const {a:A,b:B} = PAIR[+preS.value];
  const c1=A.c, c2=B.c, Z1=A.Z, Z2=B.Z;
  const ti=(+angS.value)*Math.PI/180;
  const LAM1=52, K1=2*Math.PI/LAM1, K2=K1*c1/c2;   /* λ₂ = λ₁·c₂/c₁ */
  const st=(c2/c1)*Math.sin(ti), TIR=st>=1;
  const tt=TIR?null:Math.asin(st);
  const tc=c2>c1?Math.asin(c1/c2):null;
  /* 반사계수. 전반사에서는 cosθₜ = i·√(st²−1) 이므로 R 이 복소수가 됩니다.
     |R| = 1 이지만 위상이 0 이 아니므로, 입사측 정상파 마디 위치가 각도에 따라 이동합니다.
     임계각에서는 R = +1 로 투과 영역과 연속입니다. */
  let Rre, Rim;
  if(TIR){
    const q = Z1*Math.sqrt(st*st-1), b = Z2*Math.cos(ti);
    const den = b*b + q*q;
    Rre = (b*b - q*q)/den;  Rim = -2*b*q/den;
  } else {
    Rre = (Z2*Math.cos(ti)-Z1*Math.cos(tt))/(Z2*Math.cos(ti)+Z1*Math.cos(tt));  Rim = 0;
  }
  const Rmag = Math.hypot(Rre,Rim);
  const Tre = 1+Rre, Tim = Rim;

  document.getElementById("angv").textContent=angS.value+"°";
  document.getElementById("tiv").textContent=angS.value;
  document.getElementById("ttv").textContent=TIR?"없음":(tt*180/Math.PI).toFixed(1);
  document.getElementById("tcv").textContent=tc?(tc*180/Math.PI).toFixed(1):"없음";
  document.getElementById("lrv").textContent=(c2/c1).toFixed(2);
  document.getElementById("rrv").textContent=Rmag.toFixed(3);
  const st2=document.getElementById("tir");
  st2.textContent = TIR?"전반사 · TOTAL INTERNAL REFLECTION"
                      :(tc?`임계각 ${(tc*180/Math.PI).toFixed(1)}°`:"임계각 없음 (느려짐)");
  st2.style.color = TIR?AMBER:"";

  const xi=W*0.52, cy=H/2, dx=Math.cos(ti), dy=Math.sin(ti);
  const ev = TIR ? K2*Math.sqrt(st*st-1) : 0;    /* 소멸파 감쇠상수 */

  ctx.imageSmoothingEnabled=true;
  ctx.drawImage(F1.frame(W,H, OM*t, `${preS.value},${angS.value}`, (x,y)=>{
    if(x<=xi){
      const p1=K1*(x*dx+y*dy), p2=K1*((2*xi-x)*dx+y*dy);
      const s2=Math.sin(p2), c2p=Math.cos(p2);
      return [ 0.6*(Math.sin(p1) + Rre*s2 + Rim*c2p),
               0.6*(Math.cos(p1) + Rre*c2p - Rim*s2) ];
    }
    /* 투과: 경계면에서 위상이 이어지도록 맞춤 */
    const base = K1*Math.sin(ti)*y + K1*xi*dx;
    if(TIR){ const a=0.6*Math.exp(-ev*(x-xi)), sb=Math.sin(base), cb=Math.cos(base);
             return [a*(Tre*sb + Tim*cb), a*(Tre*cb - Tim*sb)]; }
    const ph = K2*Math.cos(tt)*(x-xi) + base;
    return [ 0.6*Tre*Math.sin(ph), 0.6*Tre*Math.cos(ph) ];
  }),0,0,W,H);

  ctx.strokeStyle=AMBER; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(xi,4); ctx.lineTo(xi,H-4); ctx.stroke();
  ctx.strokeStyle="rgba(110,125,147,.65)"; ctx.setLineDash([4,4]); ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(xi-300,cy); ctx.lineTo(xi+300,cy); ctx.stroke(); ctx.setLineDash([]);
  chip(ctx,"법선 NORMAL",8,cy-6,MUTED,9,400);

  const len=Math.min(190,W*0.24);
  /* 레이 길이를 각도에 따라 줄여 캔버스 위·아래로 삐져나가지 않게 합니다.
     스침각(θ→90°)에서는 sin θ 가 1 에 가까워 세로로 가장 많이 뻗습니다. */
  const fit = th => Math.min(len, (H/2-42)/Math.max(Math.abs(Math.sin(th)),0.02));
  const li = fit(ti);
  ray(ctx, xi-li*dx, cy-li*dy, xi, cy, INK, 3);
  chip(ctx,"입사 INCIDENT", xi-li*dx-4, cy-li*dy-10, INK, 11);
  if(!TIR){
    const lt=fit(tt);
    const tx=xi+lt*Math.cos(tt), ty=cy+lt*Math.sin(tt);   /* +y = 아래. 입사와 같은 쪽으로 진행 */
    ray(ctx, xi, cy, tx, ty, AMBER, 3);
    chip(ctx,`투과 θₜ=${(tt*180/Math.PI).toFixed(1)}°`, tx-30, Math.min(ty+22,H-10), AMBER_DK, 11);
    ctx.strokeStyle=AMBER; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.arc(xi,cy,44,0,tt); ctx.stroke();   /* 투과각도 법선 아래쪽 */
    /* θₜ 칩은 호 위에 얹습니다 (예전엔 고정 위치라 각도가 크면 호에서 벗어났습니다). */
    chip(ctx,"θₜ", xi+50*Math.cos(tt*0.55)+6, cy+50*Math.sin(tt*0.55)+10, AMBER_DK, 11);
  } else {
    /* 전반사에서는 θₜ 가 없으므로 칩을 그리지 않습니다 —
       예전에는 tt=null 이 0 으로 처리되어 이 배너와 정확히 겹쳤습니다. */
    ctx.fillStyle=AMBER; ctx.fillRect(xi+12,cy-14,206,28);
    label(ctx,"전반사 · 소멸파만 남음",xi+21,cy+4,CARD,11);
  }
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.arc(xi,cy,56,Math.PI,Math.PI+ti); ctx.stroke();
  chip(ctx,"θᵢ",xi-72,cy-24*Math.sin(ti/2)-3,INK,11);

  chip(ctx,`${A.ko}  c₁=${c1}  λ₁`,8,20,INK,11.5);
  chip(ctx,`${B.ko}  c₂=${c2}  λ₂ = λ₁ × ${(c2/c1).toFixed(2)}`,xi+10,20,INK,11.5);
}, {play:"play", speed:0.034, tStill:3});
preS.onchange = angS.oninput = hero.redraw;
