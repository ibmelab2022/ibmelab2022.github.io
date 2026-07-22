/* ═══ 32 공동화 · 애니메이션 ═══ */

/* ── c1 : 기포 반경 R(t) — 실제 Rayleigh–Plesset 수치해 ──────────────
   ★ 예전 판은 MI<0.7 이면 '잔잔한 사인', MI≥0.7 이면 '대팽창+붕괴' 로
     if/else 분기시켰습니다. 그건 물리가 아니라 인공 불연속이었습니다.
     RP 를 직접 풀면 (검증: rp5.js)
        Pr 1.20 MPa → R_max/R₀ = 2.001
        Pr 1.25 MPa → R_max/R₀ = 2.032   (1.6% 변화 — 급변 없음)
     MI=0.7 은 연속 곡선 위에 그은 '관례선'이지 물리적 단절이 아닙니다.

   ρ(R R̈ + 1.5 Ṙ²) = p_B(R) − p_∞(t) − 4μṘ/R − 2σ/R
   p_B(R) = (p₀ + 2σ/R₀ − p_v)(R₀/R)^{3κ} + p_v
   p_∞(t) = p₀ − P_r sin(ωt)                     (희박 반주기 먼저)

   적응 스텝 RK4 — 240개 슬라이더 조합 전부 안정 확인 (최대 7,423 스텝).
   makeCW 와 같은 방식으로 슬라이더가 바뀔 때만 다시 풉니다.            */
const RHO=998, SIG=0.0725, P0=101325, PV=2330, KAP=1.4, MU=4e-3;  /* 혈액 근사 */
const R0 = 3e-6;          /* 자유 기체 핵 반경 3 µm — 3 MHz 에서 관성 임계가 MI≈0.69 로 떨어짐 */
const NCYC = 2;
const RSPAN = 5.2;        /* 세로 고정 눈금 (f≥2MHz 에서 R_max/R₀ 최대 4.69) */

function rpSolve(Pa, f){
  const w=2*Math.PI*f, T=1/f, tEnd=NCYC*T;
  const A=P0+2*SIG/R0-PV;
  const acc=(t,R,V)=>{
    const pB=A*Math.pow(R0/R,3*KAP)+PV;
    return (pB-(P0-Pa*Math.sin(w*t))-4*MU*V/R-2*SIG/R)/(RHO*R) - 1.5*V*V/R;
  };
  const dtMax=T/3000, dtMin=T/3e6, fl=R0/25;
  let R=R0, V=0, t=0, Rm=R0, guard=0;
  const pts=[[0,1]];
  while(t<tEnd && guard++<60000){
    let dt=dtMax;
    const vr=Math.abs(V)/R;                 /* 한 스텝에 반경이 0.4% 넘게 안 변하도록 */
    if(vr>0) dt=Math.min(dt, 0.004/vr);
    if(dt<dtMin) dt=dtMin;
    if(t+dt>tEnd) dt=tEnd-t;
    const cl=x=> x<fl?fl:x;
    const a1=acc(t,R,V),                            r1=V;
    const a2=acc(t+dt/2, cl(R+dt/2*r1), V+dt/2*a1), r2=V+dt/2*a1;
    const a3=acc(t+dt/2, cl(R+dt/2*r2), V+dt/2*a2), r3=V+dt/2*a2;
    const a4=acc(t+dt,   cl(R+dt*r3),   V+dt*a3),   r4=V+dt*a3;
    let Rn=R+dt/6*(r1+2*r2+2*r3+r4), Vn=V+dt/6*(a1+2*a2+2*a3+a4);
    if(!isFinite(Rn)||!isFinite(Vn)||Rn<=0){ Rn=fl; Vn=0; }    /* 안전망 */
    if(Rn<fl){ Rn=fl; Vn=Vn>0?Vn:0; }
    R=Rn; V=Vn; t+=dt;
    if(R>Rm) Rm=R;
    const last=pts[pts.length-1];
    if(t-last[0] > tEnd/1400 || Math.abs(R/R0-last[1])>0.02) pts.push([t, R/R0]);
  }
  pts.push([tEnd, R/R0]);
  return {pts, Rmax:Rm/R0, tEnd};
}

const prS=document.getElementById("pr"), frS=document.getElementById("fr");
let SOL=null, SOLKEY=null;
const solve=(Pa,f)=>{ const k=`${Pa},${f}`; if(k!==SOLKEY){ SOL=rpSolve(Pa,f); SOLKEY=k; } return SOL; };
const Rat = (sol,t)=>{                       /* 궤적에서 시각 t 의 R/R₀ */
  const p=sol.pts; let lo=0, hi=p.length-1;
  while(hi-lo>1){ const m=(lo+hi)>>1; (p[m][0]<=t)?lo=m:hi=m; }
  const a=p[lo], b=p[hi], u=(b[0]-a[0])>0 ? (t-a[0])/(b[0]-a[0]) : 0;
  return a[1]+(b[1]-a[1])*u;
};

const rt = makeScene("c1", 340, (ctx,W,H,t)=>{
  const Pr=+prS.value, f=+frS.value, MI=Pr/Math.sqrt(f);
  const sol=solve(Pr*1e6, f*1e6);
  const inert = sol.Rmax>=2;                 /* 관례적 관성 기준 R_max/R₀ ≥ 2 */
  document.getElementById("prv").textContent=Pr.toFixed(2);
  document.getElementById("frv").textContent=f.toFixed(1);
  document.getElementById("mi").textContent=MI.toFixed(2);
  const rg=document.getElementById("regime");
  rg.textContent = inert? "관성 붕괴" : "안정 진동";
  rg.style.color = inert? POS : SIGNAL_DK;
  document.getElementById("rmax").textContent=sol.Rmax.toFixed(2);

  const L=52,R=16,PW=W-L-R;
  const pT=H-52, pB=H-22, pBase=(pT+pB)/2;   /* 압력 띠 */
  const T=18, B=pT-14, PH=B-T;               /* R 플롯 */
  const X=tt=> L + tt/sol.tEnd*PW;
  const Y=r => B - Math.min(r,RSPAN)/RSPAN*PH;

  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,T-2); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-36,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"기포 반경 R/R₀",-44,0,MUTED,9.5,400); ctx.restore();
  ctx.textAlign="right";
  for(let r=1;r<=5;r++) label(ctx,`${r}`, L-7, Y(r)+3.5, MUTED, 9, 400);
  ctx.textAlign="left";

  /* 평형 R₀ · 관성 기준 2R₀ */
  ctx.strokeStyle="rgba(217,224,231,.95)"; ctx.setLineDash([3,4]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,Y(1)); ctx.lineTo(L+PW,Y(1)); ctx.stroke(); ctx.setLineDash([]);
  chip(ctx,"평형 R₀", L+4, Y(1)+13, MUTED, 9, 400);
  ctx.strokeStyle=AMBER; ctx.setLineDash([6,4]); ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(L,Y(2)); ctx.lineTo(L+PW,Y(2)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; chip(ctx,"관성 기준 2R₀ (관례)", L+PW-2, Y(2)-6, AMBER_DK, 9.5);
  ctx.textAlign="left";

  /* R(t) — 실제 RP 해 */
  const col = inert? POS : SIGNAL_DK;
  const path=new Path2D(); path.moveTo(L,B);
  sol.pts.forEach(p=> path.lineTo(X(p[0]), Y(p[1])));
  path.lineTo(L+PW,B); path.closePath();
  ctx.fillStyle= inert? "rgba(179,18,60,.09)" : "rgba(23,192,201,.10)"; ctx.fill(path);
  ctx.strokeStyle=col; ctx.lineWidth=2.2; ctx.beginPath();
  sol.pts.forEach((p,i)=> i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));
  ctx.stroke();
  ctx.textAlign="right";
  chip(ctx,`R_max/R₀ = ${sol.Rmax.toFixed(2)}`, L+PW-2, T+10, col, 10.5);
  ctx.textAlign="left";
  chip(ctx,`자유 기체 핵 R₀ = 3 µm · Rayleigh–Plesset 직접 해`, L+4, T+10, MUTED, 9, 400);

  /* 압력 띠 */
  const pAmp=(pB-pT)/2-2;
  const pts=[]; for(let px=0;px<=PW;px++){
    const tt=px/PW*sol.tEnd;
    pts.push([L+px, pBase - (-Math.sin(2*Math.PI*f*1e6*tt))*pAmp]);
  }
  fillWave(ctx, W, pBase, pts);
  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,pBase); ctx.lineTo(L+PW,pBase); ctx.stroke();
  chip(ctx,"압축(누름)", L+4, pT+10, POS, 9, 500);
  chip(ctx,"희박(당김) — 여기서 팽창", L+4, pB-3, NEG, 9, 500);

  /* 재생 헤드 + 기포 */
  const th=(t*0.45)%1, tt=th*sol.tEnd, rH=Rat(sol,tt);
  ctx.strokeStyle="rgba(43,61,80,.35)"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(X(tt),T); ctx.lineTo(X(tt),pB); ctx.stroke();
  const br=Math.max(2.5, rH/RSPAN*PH*0.16);
  const gg=ctx.createRadialGradient(X(tt)-br*0.3,Y(rH)-br*0.3,1,X(tt),Y(rH),br);
  gg.addColorStop(0,"rgba(255,255,255,.92)");
  gg.addColorStop(1, inert?"rgba(179,18,60,.32)":"rgba(23,192,201,.32)");
  ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(X(tt),Y(rH),br,0,7); ctx.fill();
  ctx.strokeStyle=col; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(X(tt),Y(rH),br,0,7); ctx.stroke();
}, {play:"play", speed:0.03, tStill:0.42});
prS.oninput = frS.oninput = rt.redraw;

/* ── c2 : Minnaert 공명 — 주파수 ↔ 공명 기포 크기 ── */
const f2S=document.getElementById("f2");
const MINN=3.283;   /* f₀·R₀ (m/s), 공기/물 · verify.js에서 확인 */

const res = makeScene("c2", 300, (ctx,W,H)=>{
  const f=+f2S.value;
  const R0=MINN/f;                       /* µm */
  const inBand = R0>=0.5 && R0<=3;
  document.getElementById("f2v").textContent=f.toFixed(1);
  document.getElementById("rr").textContent=R0.toFixed(2);
  document.getElementById("rd").textContent=(2*R0).toFixed(2);
  const ri=document.getElementById("rin");
  ri.textContent = inBand? "예 · 공명" : (R0>3? "너무 큼":"너무 작음");
  ri.style.color = inBand? SIGNAL_DK : MUTED;
  const st=document.getElementById("rstat");
  st.textContent = inBand? `공명 기포 ${R0.toFixed(2)}µm — 조영제와 일치` : `공명 반경 ${R0.toFixed(2)}µm`;
  st.style.color = inBand? SIGNAL_DK : MUTED;

  const L=50,R=16,PW=W-L-R, T=16,B=H-30, PH=B-T;
  const fMin=0.5,fMax=10, rMax=7;
  const X=v=> L + (v-fMin)/(fMax-fMin)*PW;
  const Y=r=> B - r/rMax*PH;

  /* 조영제 크기대 (반경 0.5~3µm) */
  ctx.fillStyle="rgba(23,192,201,.12)";
  ctx.fillRect(L, Y(3), PW, Y(0.5)-Y(3));
  ctx.strokeStyle="rgba(23,192,201,.5)"; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(L,Y(3)); ctx.lineTo(L+PW,Y(3)); ctx.moveTo(L,Y(0.5)); ctx.lineTo(L+PW,Y(0.5)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="left"; chip(ctx,"조영제 미세기포 (반경 0.5~3 µm)", L+6, Y(3)-6, SIGNAL_DK, 9.5);

  /* 축 */
  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,T-2); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-34,(T+B)/2); ctx.rotate(-Math.PI/2); label(ctx,"공명 반경 R₀ (µm)",-46,0,MUTED,9.5,400); ctx.restore();
  chip(ctx,"주파수 (MHz) →", L+PW/2, B+24, MUTED,9.5,400);
  [1,3,5,7,10].forEach(v=>{ ctx.textAlign="center"; chip(ctx,`${v}`, X(v), B+13, MUTED,9,400); });

  /* 공명 곡선 R0 = 3.283/f */
  ctx.strokeStyle=INK2; ctx.lineWidth=2.2; ctx.beginPath();
  let first=true;
  for(let v=fMin;v<=fMax;v+=0.05){ const r=MINN/v; if(r>rMax)continue; const px=X(v),py=Y(r); first?(ctx.moveTo(px,py),first=false):ctx.lineTo(px,py); }
  ctx.stroke();
  ctx.textAlign="right"; chip(ctx,"R₀ = 3.3 / f", L+PW-2, Y(MINN/fMax)+2, INK2, 9.5);

  /* 진단대 강조 (1~7 MHz) */
  ctx.strokeStyle="rgba(240,165,0,.4)"; ctx.setLineDash([3,4]); ctx.lineWidth=1.2;
  [1,7].forEach(v=>{ ctx.beginPath(); ctx.moveTo(X(v),T); ctx.lineTo(X(v),B); ctx.stroke(); });
  ctx.setLineDash([]);
  ctx.textAlign="center"; chip(ctx,"진단 대역", X(4), T+11, AMBER_DK, 9.5);

  /* 현재 f 마커 */
  ctx.strokeStyle=inBand?SIGNAL_DK:MUTED; ctx.lineWidth=1.4; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(X(f),T); ctx.lineTo(X(f),Y(Math.min(R0,rMax))); ctx.stroke(); ctx.setLineDash([]);
  if(R0<=rMax){
    ctx.fillStyle=inBand?SIGNAL_DK:MUTED; ctx.beginPath(); ctx.arc(X(f),Y(R0),5,0,7); ctx.fill();
    ctx.textAlign="center"; chip(ctx,`${f.toFixed(1)}MHz → ${R0.toFixed(2)}µm`, X(f), Y(R0)-11, inBand?SIGNAL_DK:MUTED, 10);
  }
  ctx.textAlign="left";
});
f2S.oninput = res.redraw;
