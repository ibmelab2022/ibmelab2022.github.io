/* ═══ 29 강도 · 애니메이션 ═══ */

/* ── c1 : 시간 강도 지표 — 하나의 빔, 세 개의 강도 ──
   ★ 세로축은 로그입니다. 이유:
     I_SPTP(수백 W/cm²) 와 I_SPTA(수백 mW/cm²) 는 1000배 차이라
     선형축에선 I_SPTA 가 영원히 바닥에 붙어 '아무것도 안 움직이는' 그림이 됩니다.
     로그축에선 SPPA↔SPTA 의 '세로 간격' 자체가 듀티비입니다.
   ★ 눈금은 고정입니다. 축이 데이터에 맞춰 늘어나면 선이 제자리에 멈춰
     슬라이더를 움직여도 그림이 변하지 않습니다.                      */
const ampS=document.getElementById("amp"), prfS=document.getElementById("prf"), ncS=document.getElementById("nc");
const F0 = 3;                              /* MHz 고정 — 주파수 축은 30·31장에서 */
const WIN = 1.0;                           /* 화면 가로 = 1 ms 실시간 창 */
const LO = -2, HI = 3;                     /* 로그 눈금 10^-2 ~ 10^3 W/cm² */

const tsc = makeScene("c1", 330, (ctx,W,H)=>{
  const amp=+ampS.value, prf=+prfS.value, nc=+ncS.value;
  const pulseMs = nc/(F0*1e6)*1e3;         /* 펄스 길이 (ms) */
  const PRTms   = 1/(prf*1e3)*1e3;         /* 펄스 주기 (ms) */
  const DC      = pulseMs/PRTms;           /* 듀티비 */
  const ISPPA = 360*amp*amp;               /* W/cm² — amp=1 에서 360 (FDA 사슬) */
  const ISPTP = 2.4*ISPPA;                 /* 펄스 내 순간피크 */
  const ISPTA = ISPPA*DC;                  /* W/cm² */

  document.getElementById("ampv").textContent=amp.toFixed(2);
  document.getElementById("prfv").textContent=prf.toFixed(1);
  document.getElementById("ncv").textContent=nc.toFixed(1);
  document.getElementById("dc").textContent=(DC*100).toFixed(3);
  document.getElementById("isptp").textContent=ISPTP.toFixed(0);
  document.getElementById("isppa").textContent=ISPPA.toFixed(0);
  document.getElementById("ispta").textContent=(ISPTA*1000).toFixed(0);
  const pct = ISPTA*1000/720*100;
  const vl=document.getElementById("vlim");
  vl.textContent = pct>100 ? `초과 ${pct.toFixed(0)}%` : `한계의 ${pct.toFixed(0)}%`;
  vl.style.color = pct>100 ? POS : (pct>70? AMBER_DK : SIGNAL_DK);
  const st=document.getElementById("tstat");
  st.textContent = `듀티비 ${(DC*100).toFixed(3)}% → 시간평균은 펄스평균의 1/${Math.round(1/DC)}`;
  st.style.color = SIGNAL_DK;

  const L=66,R=16,PW=W-L-R, T=16,B=H-38, PH=B-T;
  const Y = I => { const g=(Math.log10(Math.max(I,1e-4))-LO)/(HI-LO);
                   return B - Math.max(0,Math.min(1,g))*PH; };
  const X = ms => L + ms/WIN*PW;

  /* 로그 눈금 */
  ctx.textAlign="right";
  for(let d=LO; d<=HI; d++){
    const y=Y(Math.pow(10,d));
    ctx.strokeStyle = d===0 ? "rgba(217,224,231,.9)" : "rgba(238,243,247,.9)";
    ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(L,y); ctx.lineTo(L+PW,y); ctx.stroke();
    const v=Math.pow(10,d);
    label(ctx, v>=1? `${v}` : `${v*1000}m`, L-7, y+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,T-2); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-44,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"강도 W/cm² (로그)", -46, 0, MUTED, 9.5, 400); ctx.restore();

  /* 펄스 열차 — 각 펄스를 '순간강도 가우시안 봉우리'로 그림.
     봉우리 꼭대기 = I_SPTP → 출력을 올리면 봉우리가 통째로 위로 솟고,
     사이클(펄스 길이)을 늘리면 봉우리가 조금 넓어집니다. PRF 를 올리면 개수가 늘어납니다. */
  const spacingPx = PRTms/WIN*PW;
  const hwPx = Math.min(5 + nc*0.8, Math.max(spacingPx*0.42, 4));   /* 봉우리 반폭(px) — 겹치지 않게 */
  const sig  = hwPx/4.5;
  for(let ms=0.012; ms<WIN; ms+=PRTms){
    const cxp=X(ms);
    ctx.beginPath(); ctx.moveTo(cxp-hwPx, B);
    for(let dx=-hwPx; dx<=hwPx; dx+=0.8){
      const Ienv = ISPTP*Math.exp(-0.5*(dx/sig)*(dx/sig));
      ctx.lineTo(cxp+dx, Y(Ienv));
    }
    ctx.lineTo(cxp+hwPx, B); ctx.closePath();
    ctx.fillStyle="rgba(179,18,60,.18)"; ctx.fill();
    ctx.strokeStyle="rgba(179,18,60,.6)"; ctx.lineWidth=1.4; ctx.stroke();
  }
  /* 펄스 주기 자 */
  ctx.strokeStyle=MUTED; ctx.lineWidth=1.2;
  const x0=X(0.012), x1=X(0.012+PRTms);
  ctx.beginPath(); ctx.moveTo(x0,B+13); ctx.lineTo(x1,B+13);
  ctx.moveTo(x0,B+9); ctx.lineTo(x0,B+17); ctx.moveTo(x1,B+9); ctx.lineTo(x1,B+17); ctx.stroke();
  ctx.textAlign="left"; chip(ctx,`1/PRF = ${(PRTms*1000).toFixed(0)} µs`, x1+7, B+17, MUTED, 9, 400);
  ctx.textAlign="right"; label(ctx,"1 ms 창", L+PW, B+30, MUTED, 9, 400);
  ctx.textAlign="right"; chip(ctx,`3 MHz · ${nc.toFixed(1)} 사이클 · 펄스 ${(pulseMs*1000).toFixed(2)} µs`, W-8, T+9, INK, 10);
  ctx.textAlign="left";

  /* 세 지표 */
  const line=(I,col,txt,val,dash,lw)=>{
    ctx.strokeStyle=col; ctx.lineWidth=lw||2; ctx.setLineDash(dash||[]);
    ctx.beginPath(); ctx.moveTo(L,Y(I)); ctx.lineTo(L+PW,Y(I)); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="left";  chip(ctx, txt, L+6, Y(I)-5, col, 10);
    ctx.textAlign="right"; chip(ctx, val, L+PW-2, Y(I)-5, col, 10);
  };
  /* FDA 720 mW/cm² — 고정 기준선 */
  ctx.strokeStyle=POS; ctx.lineWidth=1.6; ctx.setLineDash([7,4]);
  ctx.beginPath(); ctx.moveTo(L,Y(0.72)); ctx.lineTo(L+PW,Y(0.72)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; chip(ctx,"FDA I_SPTA.3 한계 720 mW/cm²", L+PW-2, Y(0.72)+14, POS, 9.5);

  line(ISPTP, POS,      "I_SPTP 순간피크",  `${ISPTP.toFixed(0)} W/cm²`, [6,3]);
  line(ISPPA, AMBER_DK, "I_SPPA 펄스평균",  `${ISPPA.toFixed(0)} W/cm²`, [6,3]);
  line(ISPTA, SIGNAL_DK,"I_SPTA 시간평균", `${(ISPTA*1000).toFixed(0)} mW/cm²`, [], 2.6);

  /* ★ 로그축의 세로 간격 = 듀티비 */
  const xg=L+PW*0.60, ya=Y(ISPPA), yb=Y(ISPTA);
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(xg,ya); ctx.lineTo(xg,yb); ctx.stroke();
  [[ya,1],[yb,-1]].forEach(([y,s])=>{ ctx.beginPath(); ctx.moveTo(xg,y);
    ctx.lineTo(xg-4,y+5*s); ctx.lineTo(xg+4,y+5*s); ctx.closePath(); ctx.fillStyle=SIGNAL_DK; ctx.fill(); });
  ctx.textAlign="left"; chip(ctx,`이 간격이 듀티비 — ×1/${Math.round(1/DC)}`, xg+8, (ya+yb)/2, SIGNAL_DK, 10);
  ctx.textAlign="left";
});
ampS.oninput = prfS.oninput = ncS.oninput = tsc.redraw;

/* ── c2 : 공간 빔 분포 — 파워 보존, SA는 그대로 SP만 치솟음 ── */
const fnS=document.getElementById("fn");

const ssc = makeScene("c2", 300, (ctx,W,H)=>{
  const F=+fnS.value;
  const P0=100, Xmm=6, SQ2PI=Math.sqrt(2*Math.PI);
  const sigma = 0.35*F;                   /* mm — 빔 폭 ∝ F# (13장) */
  const SP = P0/(sigma*SQ2PI);            /* 피크 ∝ 1/폭 */
  const SA = P0/Xmm;                      /* 표시창 평균 = 파워/폭 → F# 무관(파워 보존!) */
  const ratio = SP/SA;

  document.getElementById("fnv").textContent=F.toFixed(1);
  document.getElementById("rsp").textContent=SP.toFixed(0);
  document.getElementById("rsa").textContent=SA.toFixed(1);
  document.getElementById("rspa").textContent=ratio.toFixed(2);
  const st=document.getElementById("sstat");
  st.textContent = `총 파워 고정 → SA ${SA.toFixed(1)} 그대로, SP만 ${SP.toFixed(0)}로`;
  st.style.color = AMBER_DK;

  const L=52,R=16,PW=W-L-R, T=16,B=H-30, PH=B-T;
  const yMax=115;                         /* F#=1 최대 피크에 맞춰 고정 → 성장이 보임 */
  const yI=v=> B-(v/yMax)*PH;
  const X=mm=> L + (mm/Xmm+0.5)*PW;       /* -3..+3 mm */

  /* 축 */
  ctx.strokeStyle=LINE; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,T-2); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  chip(ctx,"← 측방향 위치 →", L+PW/2, B+24, MUTED, 9.5, 400);
  ctx.save(); ctx.translate(L-38,(T+B)/2); ctx.rotate(-Math.PI/2); label(ctx,"강도",-16,0,MUTED,9.5,400); ctx.restore();

  /* 빔 프로파일 (양수 강도) */
  const path=new Path2D(); path.moveTo(L,B);
  for(let px=0;px<=PW;px++){
    const mm=(px/PW-0.5)*Xmm;
    const v=SP*Math.exp(-(mm*mm)/(2*sigma*sigma));
    path.lineTo(L+px, yI(v));
  }
  path.lineTo(L+PW,B); path.closePath();
  ctx.fillStyle="rgba(179,18,60,.14)"; ctx.fill(path);
  ctx.strokeStyle=POS; ctx.lineWidth=2; ctx.stroke(path);

  /* SP 피크 */
  ctx.fillStyle=POS; ctx.beginPath(); ctx.arc(X(0), yI(SP), 5, 0, 7); ctx.fill();
  ctx.textAlign="center"; chip(ctx,`SP 공간피크 ${SP.toFixed(0)}`, X(0), yI(SP)-10, POS, 10);

  /* SA 평균선 */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.2; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(L, yI(SA)); ctx.lineTo(L+PW, yI(SA)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="left"; chip(ctx,`SA 공간평균 ${SA.toFixed(1)} (파워 보존 → 고정)`, L+6, yI(SA)-6, SIGNAL_DK, 10);

  /* SP/SA */
  ctx.textAlign="right"; chip(ctx,`SP/SA = ${ratio.toFixed(2)}×`, L+PW-2, T+10, AMBER_DK, 11);
  ctx.textAlign="left";
});
fnS.oninput = ssc.redraw;
