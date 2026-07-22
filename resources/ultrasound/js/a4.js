/* ═══ A4 하모닉 영상 · 애니메이션 ═══
   검증: /home/claude/work/a345.js · Fubini 검증
     · Fubini 해 (무손실 비선형 평면파의 정확해): u(σ,θ) = Σ (2/nσ)·J_n(nσ)·sin(nθ)
     · 충격 거리 z_s = ρc³/(β ω P₀) · 5MHz·1.5MPa → 18.7mm (영상 깊이 한복판)
     · σ 작을 때 2차 ≈ σ/2 → 절대진폭 ∝ P₀² (σ=0.1 → 0.0498 vs 이론 0.0500) ✓
     · 하모닉 빔 ∝ p² → sinc² → −6dB 0.886 λ₀F# (기본파 1.207 의 0.734배)
     · 사이드로브 −13.26 → −26.5 dB · 5cm 감쇠 대가 +12.5 dB                       */
const C = 1540, RHO = 1060, BA = 6.8;
const BETA = 1 + BA/2;                       /* 간 → 4.4 */
const F0 = 5e6;

function besselJ(n, x){
  let s = 0;
  for(let m=0;m<40;m++){
    let a=1, b=1;
    for(let i=1;i<=m;i++) a*=i;
    for(let i=1;i<=m+n;i++) b*=i;
    s += Math.pow(-1,m)/(a*b)*Math.pow(x/2, 2*m+n);
  }
  return s;
}
/* Fubini: n차 하모닉의 정규화 진폭 */
const Bn = (n, sig) => sig<1e-9 ? (n===1?1:0) : (2/(n*sig))*besselJ(n, n*sig);
const zShock = P0 => RHO*Math.pow(C,3)/(BETA*2*Math.PI*F0*P0);   /* m */

/* ── c1 : 파형이 스스로 일그러진다 ── */
const prS = document.getElementById("pr"), dzS = document.getElementById("dz");

const dist = makeScene("c1", 430, (ctx,W,H)=>{
  const P0 = +prS.value*1e6, z = +dzS.value/1000;
  const zs = zShock(P0);
  const sig = Math.min(z/zs, 1.0);
  const NH = 6;
  const amp = []; for(let n=1;n<=NH;n++) amp.push(Bn(n, sig));

  document.getElementById("prv").textContent = (P0/1e6).toFixed(2);
  document.getElementById("dzv").textContent = (z*1000).toFixed(1);
  document.getElementById("rzs").textContent = (zs*1000).toFixed(1);
  document.getElementById("rsig").textContent = (z/zs).toFixed(2);
  document.getElementById("rh1").textContent = amp[0].toFixed(3);
  document.getElementById("rh2").textContent = amp[1].toFixed(3);
  const q = (P0/1e6)*amp[1] / Math.pow(P0/1e6, 2);
  document.getElementById("rq").textContent = q.toFixed(3) + " (≈일정)";
  const st = document.getElementById("fstat");
  st.textContent = z/zs>=1 ? "충격 형성 — Fubini 해의 끝" : `σ = ${(z/zs).toFixed(2)} · 2차가 ${(amp[1]*100).toFixed(1)}% 까지 자람`;
  st.style.color = z/zs>=1 ? POS : SIGNAL_DK;

  /* 고대역 필터 — 1.5 f₀ 아래를 자름 (실제 장비의 대역통과 근사) */
  const HP = n => 1/(1 + Math.pow(1.5/n, 8));       /* n = 하모닉 차수 */
  const gap=16, LW=(W-gap-28)*0.56, RW=(W-gap-28)*0.44, L0=14, L1=L0+LW+gap;

  /* ── 좌상: 파형 (왜곡) ── */
  const wT=44, wB=232, base=(wT+wB)/2;
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(L0,wT,LW,wB-wT);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(L0,wT,LW,wB-wT);
  const pts=[];
  for(let px=0; px<=LW; px++){
    const th=px/LW*4*Math.PI;
    let v=0; for(let n=1;n<=NH;n++) v += amp[n-1]*Math.sin(n*th);
    pts.push([L0+px, base - v*(wB-wT)*0.38]);
  }
  fillWave(ctx, W, base, pts);
  ctx.strokeStyle="rgba(91,107,123,.5)"; ctx.lineWidth=1.4; ctx.setLineDash([4,3]); ctx.beginPath();
  for(let px=0; px<=LW; px++){ const th=px/LW*4*Math.PI, y=base-Math.sin(th)*(wB-wT)*0.38;
    px?ctx.lineTo(L0+px,y):ctx.moveTo(L0+px,y); }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="left";
  chip(ctx, `① 받은 파형 · z = ${(z*1000).toFixed(1)} mm`, L0, wT-8, INK, 10.5);
  chip(ctx, "점선 = 보낸 사인", L0+4, wB-6, MUTED, 9, 400);
  ctx.textAlign="right";
  chip(ctx, sig>0.5?"톱니로 기울었다":"거의 사인", L0+LW-3, wT+13, sig>0.5?POS:MUTED, 9.5, sig>0.5?700:400);

  /* ── 우: 스펙트럼 + 필터 ── */
  const sT=44, sB=232;
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(L1,sT,RW,sB-sT);
  ctx.strokeStyle=LINE; ctx.strokeRect(L1,sT,RW,sB-sT);
  const bw=RW/(NH+1);
  /* 필터 통과 영역 음영 — 경계 점선을 f₀ 막대 오른쪽(f₀ 와 2f₀ 사이)으로 두어 f₀ 를 포함하지 않게 */
  const HPx = L1 + bw*1.45;
  ctx.fillStyle="rgba(23,192,201,.12)";
  ctx.fillRect(HPx, sT+1, L1+RW-HPx-1, sB-sT-2);
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.6; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(HPx, sT); ctx.lineTo(HPx, sB); ctx.stroke(); ctx.setLineDash([]);
  for(let n=1;n<=NH;n++){
    const x=L1+bw*(n-0.4), h=amp[n-1]*(sB-sT-26);
    ctx.fillStyle = n===1 ? "rgba(27,79,160,.75)" : (n===2 ? "rgba(179,18,60,.75)" : "rgba(91,107,123,.45)");
    ctx.fillRect(x, sB-8-h, bw*0.7, h);
    ctx.textAlign="center"; label(ctx, n===1?"f₀":`${n}f₀`, x+bw*0.35, sB+4, n===2?POS:MUTED, 9, n===2?700:400);
  }
  ctx.textAlign="left"; chip(ctx, "② 스펙트럼", L1, sT-8, INK, 10.5);
  ctx.textAlign="right"; chip(ctx, "고대역 필터 통과 →", L1+RW-3, sT+13, SIGNAL_DK, 9.5);
  ctx.textAlign="center"; chip(ctx, "f₀ 는 버림", L1+bw*0.6, sT+13, NEG, 9);

  /* ── 하: 필터 후 = 하모닉 신호 ── */
  const hT=272, hB=H-30, hbase=(hT+hB)/2, HW=W-28;
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(L0,hT,HW,hB-hT);
  ctx.strokeStyle=LINE; ctx.strokeRect(L0,hT,HW,hB-hT);
  const hpts=[];
  let hmax=1e-6; for(let n=1;n<=NH;n++) hmax += amp[n-1]*HP(n);
  for(let px=0; px<=HW; px++){
    const th=px/HW*4*Math.PI;
    let v=0; for(let n=1;n<=NH;n++) v += amp[n-1]*HP(n)*Math.sin(n*th);
    hpts.push([L0+px, hbase - v/hmax*(hB-hT)*0.40]);
  }
  fillWave(ctx, W, hbase, hpts);
  ctx.textAlign="left";
  chip(ctx, "③ 필터 후 — 조직이 만든 2f₀ 만 남았다 · 이것으로 영상을 만든다", L0, hT-8, POS, 10.5);
  chip(ctx, `주파수가 2배 → 파장 절반 · 진폭은 원래의 ${(amp[1]*100).toFixed(1)}% (세로 확대해 그림)`,
       L0+4, hB-6, MUTED, 9, 400);
  ctx.textAlign="right";
  chip(ctx, `β = ${BETA.toFixed(1)} · 충격 거리 ${(zs*1000).toFixed(1)} mm`, W-14, 22, AMBER_DK, 10);
  ctx.textAlign="left";
  chip(ctx, "보낸 건 f₀ 하나 — 2f₀ 는 조직이 만든 것", L0, 22, MUTED, 9.5, 400);
});
prS.oninput = dzS.oninput = dist.redraw;


/* ── c2 : 기본파 빔 vs 하모닉 빔 ── */
const fnS = document.getElementById("fn");
const LAM0 = C/F0*1e3;
const sinc = x => Math.abs(x)<1e-12 ? 1 : Math.sin(x)/x;

const beam = makeScene("c2", 330, (ctx,W,H)=>{
  const F = +fnS.value;
  const g1 = mm => Math.abs(sinc(Math.PI*mm/(LAM0*F)));
  const g2 = mm => g1(mm)*g1(mm);
  const w6 = fn => { for(let X=0; X<6; X+=0.002) if(20*Math.log10(fn(X)) < -6) return 2*X; return NaN; };
  const w1 = w6(g1), w2 = w6(g2);
  document.getElementById("fnv").textContent = F.toFixed(1);
  document.getElementById("rw1").textContent = w1.toFixed(3);
  document.getElementById("rw2").textContent = w2.toFixed(3);
  document.getElementById("rr").textContent = (w2/w1).toFixed(3);
  document.getElementById("rsl").textContent = "13.3";
  const st = document.getElementById("bstat");
  st.textContent = `하모닉 빔 = 기본파²  →  dB 가 두 배로 깊어짐`;
  st.style.color = SIGNAL_DK;

  const L=54, R=16, PW=W-L-R, T=18, B=H-34, PH=B-T, DR=45;
  const SPAN = 4.0;
  const X = mm => L + (mm/SPAN/2 + 0.5)*PW;
  const Y = db => T + Math.max(0,Math.min(1,-db/DR))*PH;
  ctx.textAlign="right";
  for(let d=0; d>=-DR; d-=10){
    ctx.strokeStyle = d===0?"rgba(217,224,231,.9)":"rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y(d)); ctx.lineTo(L+PW,Y(d)); ctx.stroke();
    label(ctx, `${d}`, L-7, Y(d)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-38,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"빔 (dB)",-22,0,MUTED,9.5,400); ctx.restore();
  /* 사이드로브 기준선 */
  [[-13.26, NEG, "기본파 사이드로브 −13.3 dB"], [-26.5, POS, "하모닉 사이드로브 −26.5 dB"]].forEach(([d,c,t])=>{
    ctx.strokeStyle=c; ctx.setLineDash([4,4]); ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(L,Y(d)); ctx.lineTo(L+PW,Y(d)); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="right"; chip(ctx, t, L+PW-3, Y(d)-5, c, 9);
  });
  ctx.textAlign="left";
  const draw=(fn,col,lw)=>{ ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.beginPath();
    for(let px=0;px<=PW;px++){ const mm=(px/PW-0.5)*SPAN*2;
      const y=Y(20*Math.log10(fn(Math.abs(mm))+1e-9)); px?ctx.lineTo(L+px,y):ctx.moveTo(L+px,y); }
    ctx.stroke(); };
  draw(g1, NEG, 2.0);
  draw(g2, POS, 2.4);
  /* −6dB 자 */
  ctx.strokeStyle=NEG; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(X(-w1/2),Y(-6)); ctx.lineTo(X(w1/2),Y(-6)); ctx.stroke();
  ctx.strokeStyle=POS; ctx.lineWidth=2.4;
  ctx.beginPath(); ctx.moveTo(X(-w2/2),Y(-6)+7); ctx.lineTo(X(w2/2),Y(-6)+7); ctx.stroke();
  ctx.textAlign="center";
  chip(ctx, `기본파 ${w1.toFixed(2)} mm`, X(0), Y(-6)-8, NEG, 10);
  chip(ctx, `하모닉 ${w2.toFixed(2)} mm · ${(w2/w1).toFixed(2)}배`, X(0), Y(-6)+22, POS, 10);
  [-4,-2,0,2,4].forEach(v=> label(ctx, `${v}`, X(v), B+14, MUTED, 9, 400));
  chip(ctx,"측방향 위치 (mm) →", L+PW/2, B+27, MUTED, 9.5, 400);
  ctx.textAlign="left";
  chip(ctx, `5 MHz · F# ${F.toFixed(1)} · λ₀ = ${LAM0.toFixed(3)} mm`, L+5, T+11, MUTED, 9.5, 400);
});
fnS.oninput = beam.redraw;
