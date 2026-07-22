/* ═══ 26 연속파 도플러 · 애니메이션 ═══  검증: verify25_28.py [26]
   두 소자: 위=연속 송신, 아래=연속 수신. 빔이 교차하는 마름모가 샘플볼륨.
   그 안의 모든 혈류가 동시에 잡혀 스펙트럼에 겹침 — 깊이 구별 불가, 속도 무제한. */
const F0=5e6, CS=1540;
const ovS=document.getElementById("ov"), vhS=document.getElementById("vh"), vlS=document.getElementById("vl");
const OVN=["좁게","중간","넓게"];

/* 스펙트럼 봉우리 하나 그리기용 가우시안 */
function gauss(x,mu,sg){ return Math.exp(-(x-mu)*(x-mu)/(2*sg*sg)); }

const hero=makeScene("c1", 400, (ctx,W,H,t)=>{
  const ov=+ovS.value, vh=+vhS.value, vl=+vlS.value;
  const fdh=2*F0*vh/CS, fdl=2*F0*vl/CS;      /* θ≈0 근사 */
  document.getElementById("ovv").textContent=OVN[ov];
  document.getElementById("vhv").textContent=vh.toFixed(1);
  document.getElementById("vlv").textContent=vl.toFixed(1);
  const sp=document.getElementById("spec");
  sp.textContent=`두 봉우리 ${(fdl/1000).toFixed(1)}·${(fdh/1000).toFixed(1)} kHz`;
  sp.style.color=SIGNAL_DK;
  const cs=document.getElementById("cstat");
  cs.textContent="겹침 영역의 모든 혈류가 동시에 — 깊이 구별 없음";
  cs.style.color=AMBER_DK;

  const L=54, R=18, PW=W-L-R;
  /* ── 위: 두 소자 + 교차 빔 (y 40~250) ── */
  const skinY=52;
  /* 탐촉자 두 소자 (나란히) */
  const txX=L+70, rxX=L+130;
  const half=[26,40,54][ov];                 /* 빔 반각폭 관련 */
  ctx.fillStyle=POS; ctx.fillRect(txX-16,skinY-14,30,12);
  ctx.fillStyle=SIGNAL_DK; ctx.fillRect(rxX-14,skinY-14,30,12);
  chip(ctx,"송신", txX-1, skinY-18, POS, 9);
  chip(ctx,"수신", rxX+1, skinY-18, SIGNAL_DK, 9);

  /* 두 빔: 송신빔은 우하향, 수신빔은 좌하향 → 교차 */
  const depth=250, apexTx=[txX,skinY], apexRx=[rxX,skinY];
  const crossY=skinY+130, crossX=(txX+rxX)/2;
  function beam(ap,tipx,col){
    ctx.save(); ctx.globalAlpha=0.10; ctx.fillStyle=col;
    ctx.beginPath(); ctx.moveTo(ap[0]-8,ap[1]); ctx.lineTo(ap[0]+8,ap[1]);
    ctx.lineTo(tipx+half*0.5, depth); ctx.lineTo(tipx-half*0.5, depth);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  beam(apexTx, crossX, POS);
  beam(apexRx, crossX, SIGNAL_DK);

  /* 겹침 마름모 (샘플볼륨) — 두 빔 교차부 근사 */
  const svCy=crossY, svH=[30,46,64][ov], svW=[34,50,68][ov];
  ctx.save(); ctx.globalAlpha=0.22; ctx.fillStyle=AMBER;
  ctx.beginPath();
  ctx.moveTo(crossX, svCy-svH); ctx.lineTo(crossX+svW, svCy);
  ctx.lineTo(crossX, svCy+svH); ctx.lineTo(crossX-svW, svCy); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.strokeStyle=AMBER_DK; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
  ctx.beginPath();
  ctx.moveTo(crossX, svCy-svH); ctx.lineTo(crossX+svW, svCy);
  ctx.lineTo(crossX, svCy+svH); ctx.lineTo(crossX-svW, svCy); ctx.closePath(); ctx.stroke();
  ctx.setLineDash([]);
  chip(ctx,"샘플볼륨 = 겹침", crossX, svCy+svH+16, AMBER_DK, 9.5);

  /* 두 혈관: 얕은(위) · 깊은(아래) — 겹침 안을 통과 */
  const vesShallowY=svCy-svH*0.42, vesDeepY=svCy+svH*0.42;
  [[vesShallowY,vl,"얕은 혈관"],[vesDeepY,vh,"깊은 혈관"]].forEach(([vy,vsp,nm],idx)=>{
    ctx.strokeStyle="rgba(43,61,80,.18)"; ctx.lineWidth=13;
    ctx.beginPath(); ctx.moveTo(L,vy); ctx.lineTo(L+PW,vy); ctx.stroke();
    /* 적혈구 흐름 (겹침 안에서만 색 강조) */
    const n=9;
    for(let i=0;i<n;i++){
      const ph=((t*vsp*0.5)+i/n)%1;
      const x=L+ph*PW;
      const inSV=Math.abs(x-crossX)<svW*(1-Math.abs(vy-svCy)/svH);
      ctx.beginPath(); ctx.arc(x, vy, 3.2, 0, 7);
      ctx.fillStyle=inSV? (idx?SIGNAL:POS) : "rgba(120,130,140,.5)";
      ctx.fill();
    }
    ctx.textAlign="right"; chip(ctx,`${nm} ${vsp.toFixed(1)} m/s`, L+PW, vy-11, INK2, 9, 500); ctx.textAlign="left";
  });
  chip(ctx,"피부", 8, skinY-2, MUTED, 9, 500);
  ctx.fillStyle="rgba(43,61,80,.05)"; ctx.fillRect(L,skinY,PW,depth-skinY);

  /* ── 아래: 스펙트럼 (y 262~384) ── */
  const sy0=270, sy1=384, sx0=L, sx1=L+PW, base=sy1-10;
  ctx.fillStyle=WELL; ctx.fillRect(sx0,sy0,sx1-sx0,sy1-sy0);
  ctx.strokeStyle=LINE; ctx.strokeRect(sx0,sy0,sx1-sx0,sy1-sy0);
  const FMAX=8000;                            /* Hz 표시 범위 */
  const Xf=f=> sx0+f/FMAX*(sx1-sx0);
  ctx.strokeStyle=MUTED; ctx.beginPath(); ctx.moveTo(sx0,base); ctx.lineTo(sx1,base); ctx.stroke();
  /* 두 봉우리 겹침 (아무리 커도 접히지 않음) */
  const sg=380;
  ctx.beginPath();
  for(let px=sx0;px<=sx1;px++){
    const f=(px-sx0)/(sx1-sx0)*FMAX;
    const y=base-(gauss(f,fdl,sg)+gauss(f,fdh,sg)*0.9)*(sy1-sy0)*0.72;
    px===sx0? ctx.moveTo(px,y):ctx.lineTo(px,y);
  }
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2; ctx.stroke();
  ctx.lineTo(sx1,base); ctx.lineTo(sx0,base); ctx.closePath();
  ctx.fillStyle="rgba(23,192,201,.14)"; ctx.fill();
  /* 봉우리 라벨 */
  [[fdl,"얕은",POS],[fdh,"깊은",NEG]].forEach(([fd,nm,col])=>{
    if(fd<FMAX){ ctx.strokeStyle=col; ctx.setLineDash([2,3]); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(Xf(fd),sy0+4); ctx.lineTo(Xf(fd),base); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign="center"; chip(ctx,nm,Xf(fd),sy0+16,col,9); ctx.textAlign="left"; }
  });
  chip(ctx,"스펙트럼 — 겹쳐서 나옴 · 깊이 정보 없음", sx0+6, base-4, MUTED, 9, 500);
  for(let f=0;f<=8000;f+=2000){
    ctx.textAlign="center"; label(ctx,`${f/1000}k`,Xf(f),sy1+13,MUTED,8.5,400); ctx.textAlign="left";
  }
  ctx.textAlign="right"; label(ctx,"편이 (Hz)",sx1,sy1+13,MUTED,8.5,400); ctx.textAlign="left";
},{play:"p1", speed:0.03});
ovS.oninput = vhS.oninput = vlS.oninput = hero.redraw;
