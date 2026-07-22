/* ═══ 14 빔 조향 · 애니메이션 ═══ */

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


/* ── 히어로: 지연 사다리 → 기울어진 파면 → 조향 ── */
const LAMs = 30, Ks = 2*Math.PI/LAMs, OMs = 2.2;
const stS = document.getElementById("st"), ptS = document.getElementById("pt");
const F1 = makeCW(4);

const hero = makeScene("c1", 380, (ctx,W,H,t)=>{
  const th = (+stS.value)*Math.PI/180;
  const pL = +ptS.value;                 /* 피치 (λ 단위) */
  const p  = pL*LAMs;                    /* 피치 (px) */
  const N  = 24;
  const x0 = 96, cy = H/2;
  const el = [];
  for(let i=0;i<N;i++) el.push(cy - p*(N-1)/2 + p*i);

  document.getElementById("stv").textContent = stS.value;
  document.getElementById("ptv").textContent = pL.toFixed(2);
  /* 격자엽:  sinθg = sinθs ± λ/피치   (m = ∓1)
     조향하면 반대편으로 먼저 들어옵니다. */
  const gls = [Math.sin(th)-1/pL, Math.sin(th)+1/pL].filter(v=>Math.abs(v)<=1);
  const hasG = gls.length>0;
  const st2 = document.getElementById("gstat");
  st2.textContent = hasG ? `격자엽 ${gls.map(v=>(Math.asin(v)*180/Math.PI).toFixed(0)+"°").join(", ")} 에 생김`
                         : "격자엽 없음 ✓";
  st2.style.color = hasG ? AMBER_DK : SIGNAL_DK;

  /* 지연: 위치에 비례 (사다리) */
  const tau = el.map(y => (y-cy)*Math.sin(th));

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(F1.frame(W,H, OMs*t, `${stS.value},${ptS.value}`, (x,y)=>{
    if(x < x0-2) return null;
    let sr=0, si=0;
    for(let i=0;i<N;i++){
      const r = Math.hypot(x-x0, y-el[i]), a = 1/Math.sqrt(Math.max(r,5));
      const ph = Ks*(r + tau[i]);
      sr += a*Math.sin(ph); si += a*Math.cos(ph);
    }
    const g = 3.6/Math.sqrt(N);
    return [g*sr, g*si];
  }),0,0,W,H);

  /* 소자 */
  const eh = Math.max(2, p*0.7);
  el.forEach(y=>{ ctx.fillStyle=SIGNAL; ctx.fillRect(x0-4, y-eh/2, 8, eh); });

  /* 지연 사다리 */
  ctx.strokeStyle=POS; ctx.lineWidth=2.2; ctx.beginPath();
  el.forEach((y,i)=>{ const px = x0-16-tau[i]*0.42; i?ctx.lineTo(px,y):ctx.moveTo(px,y); });
  ctx.stroke();
  el.forEach((y,i)=>{ const px=x0-16-tau[i]*0.42;
    ctx.beginPath(); ctx.arc(px,y,1.8,0,7); ctx.fillStyle=POS; ctx.fill(); });
  chip(ctx,"time delay · τⱼ", 6, 22, POS, 11.5);

  /* 조향 방향 */
  const L = Math.min(W-x0-14, 300);
  ctx.strokeStyle=AMBER; ctx.lineWidth=2; ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(x0,cy); ctx.lineTo(x0+L*Math.cos(th), cy+L*Math.sin(th)); ctx.stroke();
  ctx.setLineDash([]);
  chip(ctx,`θs = ${stS.value}°`, x0+L*0.72, cy+L*0.72*Math.sin(th)-10, AMBER_DK, 11);
  /* 법선 */
  ctx.strokeStyle="rgba(91,107,123,.55)"; ctx.lineWidth=1; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(x0,cy); ctx.lineTo(x0+L,cy); ctx.stroke(); ctx.setLineDash([]);

  /* 격자엽 방향 (있는 것 모두) */
  gls.forEach(v=>{
    if(Math.abs(v-Math.sin(th)) < 0.02) return;
    const tg = Math.asin(v);
    ctx.strokeStyle=POS; ctx.lineWidth=1.8; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(x0,cy); ctx.lineTo(x0+L*Math.cos(tg), cy+L*Math.sin(tg)); ctx.stroke();
    ctx.setLineDash([]);
    chip(ctx,`격자엽 ${(tg*180/Math.PI).toFixed(0)}°`, x0+L*0.5*Math.cos(tg)+6, cy+L*0.5*Math.sin(tg)+14, POS, 10.5);
  });
  ctx.textAlign="right";
  chip(ctx, `피치 ${pL.toFixed(2)} λ · 소자 ${N}개`, W-8, 22, hasG?POS:SIGNAL_DK, 11);
  ctx.textAlign="left";
}, {play:"play", speed:0.030, tStill:3});
stS.oninput = ptS.oninput = hero.redraw;

/* ── 빔 패턴 (dB vs 각도) ──
   배열 인자 AF(θ) = |sin(Nψ/2) / (N sin(ψ/2))| ,  ψ = k·p·(sinθ − sinθs)
   소자 지향성 EF(θ) = sinc(π·w·sinθ/λ)
   최종 = AF × EF.   격자엽은 AF 의 반복 봉우리이고, EF 가 그것을 눌러줍니다. */
const st2S=document.getElementById("st2"), pt2S=document.getElementById("pt2"), ewS=document.getElementById("ew");
const NEL = 32;

const pat = makeScene("c2", 360, (ctx,W,H)=>{
  const ths=(+st2S.value)*Math.PI/180, pL=+pt2S.value, wL=+ewS.value;
  document.getElementById("st2v").textContent=st2S.value;
  document.getElementById("pt2v").textContent=pL.toFixed(2);
  document.getElementById("ewv").textContent=wL.toFixed(2);

  const sinc = x => Math.abs(x)<1e-9 ? 1 : Math.sin(x)/x;
  const EF = th => Math.abs(sinc(Math.PI*wL*Math.sin(th)));
  const AF = th => {
    const psi = 2*Math.PI*pL*(Math.sin(th)-Math.sin(ths));
    const d = Math.sin(psi/2);
    return Math.abs(d)<1e-9 ? 1 : Math.abs(Math.sin(NEL*psi/2)/(NEL*d));
  };
  const TOT = th => AF(th)*EF(th);

  const gls = [Math.sin(ths)-1/pL, Math.sin(ths)+1/pL].filter(v=>Math.abs(v)<=1);
  const glEl=document.getElementById("gl");
  glEl.textContent = gls.length ? gls.map(v=>(Math.asin(v)*180/Math.PI).toFixed(0)+"°").join(", ") : "없음 ✓";
  glEl.style.color = gls.length ? AMBER_DK : SIGNAL_DK;
  const c=Math.cos(ths);
  document.getElementById("ea").textContent=(c*100).toFixed(0);
  document.getElementById("bw").textContent=(1/c).toFixed(2);
  document.getElementById("ed").textContent=(EF(ths)*100).toFixed(0);
  const ps=document.getElementById("pstat");
  ps.textContent = gls.length ? `격자엽이 ${gls.map(v=>(Math.asin(v)*180/Math.PI).toFixed(0)+"°").join(", ")} 에 있습니다 — 주엽 반대편`
                              : "피치가 충분히 작아 격자엽 없음";
  ps.style.color = gls.length ? POS : SIGNAL_DK;

  const L=52,R=18,T=30,B=H-40,PW=W-L-R,PH=B-T;
  const DBMIN=-42;
  const X = d => L + (d+90)/180*PW;
  const Y = v => { const db=20*Math.log10(Math.max(v,1e-6));
                   return B - Math.max(0,(db-DBMIN)/(0-DBMIN))*PH; };

  /* 격자 */
  ctx.strokeStyle=WELL2; ctx.lineWidth=1;
  for(let d=-90;d<=90;d+=30){ ctx.beginPath(); ctx.moveTo(X(d),T); ctx.lineTo(X(d),B); ctx.stroke(); }
  for(let db=-40;db<0;db+=10){ const y=B-(db-DBMIN)/(0-DBMIN)*PH;
    ctx.beginPath(); ctx.moveTo(L,y); ctx.lineTo(L+PW,y); ctx.stroke();
    label(ctx,`${db}`,L-30,y+4,MUTED,9.5,400); }
  label(ctx,"dB",L-32,T-6,MUTED,9.5,400);
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  for(let d=-90;d<=90;d+=30){
    ctx.beginPath(); ctx.moveTo(X(d),B); ctx.lineTo(X(d),B+6); ctx.stroke();
    ctx.textAlign="center"; label(ctx,`${d}°`,X(d),B+19,INK,10); ctx.textAlign="left";
  }
  label(ctx,"각도",L+PW-34,B+19,MUTED,9.5,400);

  /* 소자 지향성 포락선 */
  ctx.strokeStyle=MUTED; ctx.lineWidth=1.6; ctx.setLineDash([4,3]); ctx.beginPath();
  for(let i=0;i<=500;i++){ const d=-90+180*i/500, y=Y(EF(d*Math.PI/180));
    i?ctx.lineTo(X(d),y):ctx.moveTo(X(d),y); }
  ctx.stroke(); ctx.setLineDash([]);

  /* 최종 패턴 */
  const p=new Path2D(); p.moveTo(X(-90),B);
  for(let i=0;i<=1400;i++){ const d=-90+180*i/1400; p.lineTo(X(d), Y(TOT(d*Math.PI/180))); }
  p.lineTo(X(90),B); p.closePath();
  ctx.fillStyle="rgba(179,18,60,.42)"; ctx.fill(p);
  ctx.strokeStyle=POS; ctx.lineWidth=1.5; ctx.stroke(p);

  /* 주엽 · 격자엽 마커 */
  const ds=ths*180/Math.PI;
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(X(ds),B); ctx.lineTo(X(ds),T+14); ctx.stroke();
  ctx.textAlign="center"; chip(ctx,`주엽 ${ds.toFixed(0)}°`,X(ds),T+10,SIGNAL_DK,10.5);
  gls.forEach(v=>{
    const dg=Math.asin(v)*180/Math.PI;
    if(Math.abs(dg-ds)<0.5) return;
    ctx.strokeStyle=AMBER; ctx.lineWidth=2; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(X(dg),B); ctx.lineTo(X(dg),T+30); ctx.stroke(); ctx.setLineDash([]);
    chip(ctx,`격자엽 ${dg.toFixed(0)}°`,X(dg),T+26,AMBER_DK,10.5);
  });
  ctx.textAlign="left";
  chip(ctx,"소자 지향성",L+6,T+12,MUTED,10);
  ctx.textAlign="right";
  chip(ctx,`소자 ${NEL}개 · 피치 ${pL.toFixed(2)}λ · 폭 ${wL.toFixed(2)}λ`,W-8,18,INK,10.5);
  ctx.textAlign="left";
});
st2S.oninput = pt2S.oninput = ewS.oninput = pat.redraw;
