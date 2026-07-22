/* ═══ 06 초음파 산란 · 애니메이션 ═══
   구조물을 여러 개의 재방사점으로 모델링합니다 (하위헌스 / Born 근사).
   크기가 λ보다 작으면 모두 같은 위상 → 구면파.
   크면 위상이 어긋나 간섭 → 방향성 = 반사.  물리가 스스로 드러납니다. */

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

const LAM = 44, K = 2*Math.PI/LAM, OM = 2.6;
const szS=document.getElementById("sz"), srcS=document.getElementById("src");
const F=makeCW(4);

const sc = makeScene("c1", 360, (ctx,W,H,t)=>{
  const dLam = +szS.value, d = dLam*LAM;
  document.getElementById("szv").textContent=dLam.toFixed(2);
  const spherical = srcS.value==="1";
  const cx=W*0.56, cy=H/2;
  const px=W*0.10, py=H/2;                 /* 구면파 음원 */

  /* 재방사점 배치 */
  const N = Math.max(3, Math.min(19, Math.round(d/(LAM*0.18))+3));
  const pts=[];
  for(let i=0;i<N;i++) pts.push(cy - d/2 + (N>1 ? d*i/(N-1) : 0));

  const mEl=document.getElementById("mode");
  mEl.textContent = dLam<0.35 ? "구면 산란 · 모든 방향으로 균일"
                  : dLam<1.1  ? "전이 영역 · 앞뒤로 몰리기 시작"
                              : "거울 반사 · 방향이 생김";
  mEl.style.color = dLam<0.35 ? NEG : dLam<1.1 ? MUTED : POS;

  ctx.imageSmoothingEnabled=true;
  ctx.drawImage(F.frame(W,H, OM*t, `${szS.value},${srcS.value}`, (x,y)=>{
    let re, im;
    if(spherical){
      const r0=Math.hypot(x-px,y-py), a=1.9/Math.sqrt(Math.max(r0,9));
      re = a*Math.sin(K*r0); im = a*Math.cos(K*r0);
    } else {
      re = 0.5*Math.sin(K*x); im = 0.5*Math.cos(K*x);
    }
    /* 산란: 각 재방사점이 도착한 입사파를 다시 내보냄 */
    let sr=0, si=0;
    for(let i=0;i<N;i++){
      const sy=pts[i];
      const inc = spherical ? K*Math.hypot(cx-px,sy-py) : K*cx;   /* 입사 위상 */
      const r = Math.hypot(x-cx,y-sy), a = 1/Math.sqrt(Math.max(r,7));
      sr += a*Math.sin(K*r + inc); si += a*Math.cos(K*r + inc);
    }
    const g = 2.4/Math.sqrt(N);
    return [ re + g*sr, im + g*si ];
  }),0,0,W,H);

  /* 구조물 */
  ctx.strokeStyle=AMBER; ctx.lineWidth=2.5;
  ctx.beginPath(); ctx.moveTo(cx,cy-d/2); ctx.lineTo(cx,cy+d/2); ctx.stroke();
  pts.forEach(sy=>{ ctx.beginPath(); ctx.arc(cx,sy,2.6,0,7); ctx.fillStyle=AMBER; ctx.fill(); });
  ctx.strokeStyle="rgba(217,148,0,.55)"; ctx.lineWidth=1.2; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.arc(cx,cy,Math.max(d/2,4)+7,0,7); ctx.stroke(); ctx.setLineDash([]);
  chip(ctx,`d = ${dLam.toFixed(2)} λ`, cx+Math.max(d/2,4)+12, cy+4, AMBER_DK, 11);

  if(spherical){
    ctx.beginPath(); ctx.arc(px,py,5.5,0,7); ctx.fillStyle=INK; ctx.fill();
    ctx.strokeStyle=CARD; ctx.lineWidth=1.5; ctx.stroke();
    chip(ctx,"S · 음원",px-12,py-12,INK,10.5);
  } else {
    ray(ctx,26,H-26,74,H-26,INK,2);
    chip(ctx,"평면파 진행 →",80,H-22,INK,10);
  }
  /* λ 자 */
  const yL=22;
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(10,yL); ctx.lineTo(10+LAM,yL);
  ctx.moveTo(10,yL-5); ctx.lineTo(10,yL+5); ctx.moveTo(10+LAM,yL-5); ctx.lineTo(10+LAM,yL+5); ctx.stroke();
  chip(ctx,"λ",10+LAM/2-3,yL-9,INK,11);
  chip(ctx,"←  이 길이가 기준입니다",10+LAM+10,yL+4,MUTED,9.5,400);
}, {play:"play", speed:0.034, tStill:3});
szS.oninput = srcS.onchange = sc.redraw;
