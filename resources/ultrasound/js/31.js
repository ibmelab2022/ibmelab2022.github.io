/* ═══ 31 열 지수 · 애니메이션 ═══ */
const mix=(a,b,f)=>[a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f, a[2]+(b[2]-a[2])*f];
const PAPER=[245,247,249], AMBc=[240,165,0], POSc=[179,18,60];
function heatColor(v){                 /* v: 0(차가움)~1+(뜨거움) */
  v=Math.max(0,Math.min(1.15,v));
  const c = v<0.5 ? mix(PAPER,AMBc,v/0.5*0.85) : mix(AMBc,POSc,Math.min(1,(v-0.5)/0.65));
  return `rgb(${c.map(x=>Math.round(x)).join(",")})`;
}

/* ── c1 : 조직 발열 컬럼 — 연부조직 vs 뼈 ── */
let boneOn=true;
const pwS=document.getElementById("pw"), frS=document.getElementById("fr"), boneBtn=document.getElementById("bone");

const heat = makeScene("c1", 330, (ctx,W,H)=>{
  const P=+pwS.value, f=+frS.value;
  const dTs=P*f/5.0;                    /* 연부조직 ΔT (모델): P=1,f=5 → 1.0°C */
  const dTb=dTs*3.6;                    /* 뼈 표면 ΔT (모델): 흡수 집중 */
  document.getElementById("pwv").textContent=P.toFixed(2);
  document.getElementById("frv").textContent=f.toFixed(1);
  document.getElementById("qrel").textContent=(P*f/5).toFixed(2);
  document.getElementById("dts").textContent=dTs.toFixed(2);
  document.getElementById("dtb").textContent=boneOn? dTb.toFixed(2) : "—";

  const bx0=W*0.12, bx1=W*0.70, top=34, bot=H-22, depthCm=8;
  const yD=cm=> top + cm/depthCm*(bot-top);
  const beamL=(bx0+bx1)/2-30, beamR=(bx0+bx1)/2+30;
  const boneCm=4.4, focusCm=2.2;

  /* 조직 블록 배경 */
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(bx0,top,bx1-bx0,bot-top);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(bx0,top,bx1-bx0,bot-top);

  /* 빔 발열 컬럼 (깊이별 온도색) */
  const boneY=yD(boneCm);
  for(let y=top; y<bot; y+=2){
    const cm=(y-top)/(bot-top)*depthCm;
    let v;
    if(!boneOn || cm<boneCm){
      /* 연부조직: 초점 부근서 최대, 위아래로 감소 */
      const prof=Math.exp(-Math.pow((cm-focusCm)/2.4,2));
      v=dTs/2.6*prof;                    /* 상대 스케일 */
    } else {
      /* 뼈 내부: 표면서 뜨겁고 감소 */
      v=dTb/2.6*Math.exp(-(cm-boneCm)/1.2);
    }
    ctx.fillStyle=heatColor(v);
    ctx.fillRect(beamL, y, beamR-beamL, 2.2);
  }
  /* 뼈 표면 열점 강조 밴드 */
  if(boneOn){
    ctx.fillStyle=heatColor(dTb/2.6);
    ctx.fillRect(beamL-6, boneY-1, beamR-beamL+12, 9);
    ctx.strokeStyle=POS; ctx.lineWidth=1.4; ctx.strokeRect(beamL-6, boneY-1, beamR-beamL+12, 9);
    /* 뼈 층 */
    ctx.fillStyle="rgba(43,61,80,.13)"; ctx.fillRect(bx0, boneY+8, bx1-bx0, bot-(boneY+8));
    ctx.strokeStyle="rgba(43,61,80,.4)"; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(bx0,boneY+8); ctx.lineTo(bx1,boneY+8); ctx.stroke(); ctx.setLineDash([]);
  }

  /* 탐촉자 */
  ctx.fillStyle=INK; ctx.fillRect(beamL-6, top-14, (beamR-beamL)+12, 12);
  ctx.textAlign="center"; chip(ctx,"탐촉자", (beamL+beamR)/2, top-18, INK, 9.5, 400);

  /* 라벨 */
  ctx.textAlign="left";
  chip(ctx,`연부조직 ΔT≈${dTs.toFixed(2)}°C`, bx0+6, yD(1.0), AMBER_DK, 10);
  if(boneOn){
    chip(ctx,`뼈 표면 ΔT≈${dTb.toFixed(2)}°C — 열점`, beamR+10, boneY+3.5, POS, 10);
    chip(ctx,"뼈", bx0+6, boneY+26, INK, 10);
  } else {
    chip(ctx,"뼈 없음 — 연부조직만 은은히 발열", beamR+10, yD(4), MUTED, 9.5, 400);
  }
  chip(ctx,"피부", bx0+6, top+13, MUTED, 9, 400);
  ctx.textAlign="right"; chip(ctx,`${f.toFixed(1)} MHz · 출력 ${P.toFixed(2)}`, bx1-4, top+13, INK, 10);
  ctx.textAlign="left";
});
boneBtn.onclick=()=>{ boneOn=!boneOn; boneBtn.textContent=boneOn?"뼈 있음":"뼈 없음"; boneBtn.classList.toggle("on",boneOn); heat.redraw(); };
pwS.oninput = frS.oninput = heat.redraw;

/* ── c2 : 온도 × 시간 안전 경계 (태아 기준) ── */
const tiS=document.getElementById("ti");

const bnd = makeScene("c2", 300, (ctx,W,H)=>{
  const TI=+tiS.value, dT=TI;
  const tAllow = dT<=1.5 ? Infinity : 4*Math.pow(4, 4-dT);   /* 분 */
  document.getElementById("tiv").textContent=TI.toFixed(1);
  document.getElementById("rdt").textContent=dT.toFixed(1);
  const rt=document.getElementById("rtime");
  rt.textContent = !isFinite(tAllow)||tAllow>250 ? "무제한" : (tAllow>=1? `${tAllow.toFixed(0)}분` : `${Math.round(tAllow*60)}초`);
  const rv=document.getElementById("rver");
  if(dT<=1.5){ rv.textContent="무제한 안전"; rv.style.color=SIGNAL_DK; }
  else if(TI>=6){ rv.textContent="체류 최소화"; rv.style.color=POS; }
  else { rv.textContent="시간 제한 필요"; rv.style.color=AMBER_DK; }
  const st=document.getElementById("tstat");
  st.textContent = dT<=1.5? "1.5°C 이하 — 시간 제한 없음" : `${!isFinite(tAllow)?"":tAllow.toFixed(0)+"분 넘기면 주의"}`;
  st.style.color = dT<=1.5? SIGNAL_DK : AMBER_DK;

  const L=48,R=16,PW=W-L-R, T=16,B=H-30, PH=B-T, dMax=6.5;
  const tmin=0.25, tmax=256, lt=Math.log(tmin), lT=Math.log(tmax);
  const X=t=> L + (Math.log(t)-lt)/(lT-lt)*PW;
  const Y=d=> B - d/dMax*PH;
  const dTh=t=> Math.max(1.5, Math.min(dMax, 4 - Math.log(t/4)/Math.log(4)));

  /* 위험 영역 채움 (경계 위) */
  const haz=new Path2D(); haz.moveTo(L,T);
  for(let t=tmin;t<=tmax;t*=1.06){ haz.lineTo(X(t), Y(dTh(t))); }
  haz.lineTo(L+PW,T); haz.closePath();
  ctx.fillStyle="rgba(179,18,60,.09)"; ctx.fill(haz);

  /* 축 */
  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,T-2); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-34,(T+B)/2); ctx.rotate(-Math.PI/2); label(ctx,"온도 상승 ΔT (°C)",-46,0,MUTED,9.5,400); ctx.restore();
  chip(ctx,"체류시간 (분, 로그) →", L+PW/2, B+24, MUTED,9.5,400);
  [1,4,16,64,256].forEach(t=>{ ctx.textAlign="center"; chip(ctx,`${t}`, X(t), B+13, MUTED,9,400); });

  /* 경계 곡선 */
  ctx.strokeStyle=POS; ctx.lineWidth=2; ctx.beginPath();
  let first=true;
  for(let t=tmin;t<=tmax;t*=1.03){ const px=X(t),py=Y(dTh(t)); first?(ctx.moveTo(px,py),first=false):ctx.lineTo(px,py); }
  ctx.stroke();
  ctx.textAlign="left"; chip(ctx,"잠재적 위험 (태아)", X(2), Y(dTh(2))-8, POS, 9.5);

  /* 1.5°C 무제한선 */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.8; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(L,Y(1.5)); ctx.lineTo(L+PW,Y(1.5)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="left"; chip(ctx,"1.5°C — 무제한 안전", L+6, Y(1.5)+13, SIGNAL_DK, 9.5);

  /* 현재 TI 수평선 */
  const col = dT<=1.5? SIGNAL_DK : (TI>=6? POS : AMBER_DK);
  ctx.strokeStyle=col; ctx.lineWidth=2.2; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(L,Y(dT)); ctx.lineTo(L+PW,Y(dT)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; chip(ctx,`현재 TI=${TI.toFixed(1)} → ΔT≈${dT.toFixed(1)}°C`, L+PW-2, Y(dT)-6, col, 10);

  /* 교차점 마커 */
  if(isFinite(tAllow) && tAllow<=tmax){
    ctx.fillStyle=AMBER; ctx.beginPath(); ctx.arc(X(tAllow),Y(dT),5,0,7); ctx.fill();
    ctx.strokeStyle=AMBER_DK; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(X(tAllow),Y(dT),5,0,7); ctx.stroke();
    ctx.textAlign="center"; chip(ctx,`${tAllow>=1?tAllow.toFixed(0)+"분":Math.round(tAllow*60)+"초"}부터 주의`, X(tAllow), Y(dT)+18, AMBER_DK, 9.5);
  }
  ctx.textAlign="left";
});
tiS.oninput = bnd.redraw;
