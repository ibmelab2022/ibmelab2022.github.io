/* ═══ A5 펄스 반전과 진폭 변조 · 애니메이션 ═══
   검증: /home/claude/work/a345.js · a345b.js
     · PI : r(p) + r(−p)   = 0.3000 ↔ 이론 2a₂p²           (a₂=.15, a₃=.04, p=1)
     · AM : r(p) − 2r(p/2) = 0.1050 ↔ 이론 a₂p²/2 + 3a₃p³/4
       → PI 는 선형·홀수 상쇄 / AM 은 선형만 상쇄 (홀수는 송신 대역 안으로 접힘)
     · 움직임 잔류 = 2|sin(kΔx)| · PRF 5kHz: 5mm/s → −27.8dB · 20mm/s → −15.8dB
     · PI 도플러는 같은 펄스 하모닉 영상 대비 조영/조직 대비 +3~10 dB (Simpson 1999)      */
const C = 1540, F0 = 5e6;
const LAM = C/F0*1e3;                  /* mm */
let isPI = true;

/* ── c1 : 두 번 쏘고 더하면 ── */
const a2S = document.getElementById("a2"), a3S = document.getElementById("a3"),
      modeBtn = document.getElementById("mode");
const resp = (p, a2, a3) => p + a2*p*p + a3*p*p*p;    /* a₁ = 1 고정 */

const pi = makeScene("c1", 404, (ctx,W,H)=>{
  const a2 = +a2S.value, a3 = +a3S.value;
  /* 스펙트럼(푸리에) 값 — 판독도 여기 맞춤 */
  const before = [1 + 0.75*a3, a2/2, a3/4];
  const after  = isPI ? [0, a2, 0] : [9*a3/16, a2/4, 3*a3/16];
  document.getElementById("a2v").textContent = a2.toFixed(2);
  document.getElementById("a3v").textContent = a3.toFixed(3);
  document.getElementById("rlin").textContent = "0 (정확)";
  document.getElementById("re2").textContent = after[1].toFixed(4);              /* 2f₀ 짝수 */
  document.getElementById("re3").textContent = isPI ? "0 (죽음)" : after[0].toFixed(4);  /* f₀ 홀수 잔류 */
  document.getElementById("rtx").textContent = isPI ? "2" : "3";

  const TX = isPI
    ? [{amp:+1, lbl:"+p"}, {amp:-1, lbl:"−p"}]
    : [{amp:+0.5, lbl:"½p"}, {amp:+1, lbl:"p"}, {amp:+0.5, lbl:"½p"}];

  const padL=14, padR=14, gap=18;
  const SPW = (W-padL-padR)*0.30, LW = (W-padL-padR)-SPW-gap;
  const LX = padL, SX = padL+LW+gap;
  const topY=38, rowGap=12, rowH=(H-topY-14-2*rowGap)/3;
  const NCYC=2, hann = u => 0.5-0.5*Math.cos(2*Math.PI*u);
  const sOf = u => hann(u)*Math.sin(2*Math.PI*NCYC*u);
  const strokeC = (pts,col,lw)=>{ ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.lineCap="round"; ctx.lineJoin="round";
    ctx.beginPath(); pts.forEach((p,i)=> i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke(); };
  const panel=(y)=>{ ctx.fillStyle="#fbfcfe"; ctx.fillRect(LX,y,LW,rowH); ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(LX,y,LW,rowH);
    ctx.strokeStyle="rgba(217,224,231,.9)"; ctx.setLineDash([2,4]); ctx.beginPath(); ctx.moveTo(LX,y+rowH/2); ctx.lineTo(LX+LW,y+rowH/2); ctx.stroke(); ctx.setLineDash([]); };

  /* ── 행 1 : 송신 파형 ── */
  const r1y=topY, r1b=r1y+rowH/2, ampPx=rowH*0.38;
  panel(r1y);
  const nT=TX.length, slotGap=10, slotW=(LW-slotGap*(nT+1))/nT;
  TX.forEach((tx,i)=>{ const x0=LX+slotGap*(i+1)+slotW*i, pts=[];
    for(let px=0;px<=slotW;px++){ const u=px/slotW; pts.push([x0+px, r1b - tx.amp*sOf(u)*ampPx]); }
    fillWave(ctx, W, r1b, pts);
    ctx.textAlign="center"; chip(ctx, tx.lbl, x0+slotW/2, r1y+rowH-7, isPI?INK2:SIGNAL_DK, 11.5, 700); });
  ctx.textAlign="left"; chip(ctx, "① 송신 파형 (실제 진폭)", LX+4, r1y-8, INK, 10.5);
  ctx.textAlign="right"; chip(ctx, isPI?"크기 = · 부호 ↔":"크기 ↔ · 부호 =", LX+LW-4, r1y-8, isPI?INK2:SIGNAL_DK, 9.5, 700);

  /* ── 행 2 : 두 에코 (거의 상쇄) — 실제 스케일 ── */
  const r2y=topY+rowH+rowGap, r2b=r2y+rowH/2, e2sc=(rowH*0.40)/1.32;
  panel(r2y);
  const echoA = s => s + a2*s*s + a3*s*s*s;
  const echoB = s => isPI ? (-s + a2*s*s - a3*s*s*s) : 2*(0.5*s + a2*0.25*s*s + a3*0.125*s*s*s);
  const pA=[], pB=[];
  for(let px=0;px<=LW;px++){ const s=sOf(px/LW); pA.push([LX+px, r2b-echoA(s)*e2sc]); pB.push([LX+px, r2b-echoB(s)*e2sc]); }
  strokeC(pB, "rgba(179,18,60,.85)", 2);
  strokeC(pA, "rgba(27,79,160,.9)", 2);
  ctx.textAlign="left"; chip(ctx, isPI?"② 에코  r(+p)  ·  r(−p)":"② 에코  r(p)  ·  2·r(½p)", LX+4, r2y-8, INK, 10.5);
  ctx.textAlign="right"; chip(ctx, isPI?"뒤집혀 → 더하면 상쇄":"거의 같아 → 빼면 상쇄", LX+LW-4, r2y-8, MUTED, 9.5, 600);

  /* ── 행 3 : 남는 것 = 비선형 (자동 확대) ── */
  const r3y=topY+2*(rowH+rowGap), r3b=r3y+rowH/2;
  panel(r3y);
  const comb = s => isPI ? (echoA(s)+echoB(s)) : (echoA(s)-echoB(s));
  let cmax=1e-6; for(let px=0;px<=LW;px++){ cmax=Math.max(cmax, Math.abs(comb(sOf(px/LW)))); }
  const csc=(rowH*0.40)/cmax, zoom=csc/e2sc, cpts=[];
  for(let px=0;px<=LW;px++){ const s=sOf(px/LW); cpts.push([LX+px, r3b-comb(s)*csc]); }
  fillWave(ctx, W, r3b, cpts);
  ctx.textAlign="left"; chip(ctx, isPI?"③ 합 = r(+p)+r(−p)":"③ 차 = r(p)−2·r(½p)", LX+4, r3y-8, POS, 10.5);
  ctx.textAlign="right"; chip(ctx, `선형 0 · ×${zoom.toFixed(0)} 확대`, LX+LW-4, r3y-8, MUTED, 9.5, 400);
  ctx.textAlign="center"; chip(ctx, isPI?"짝수 2f₀ 만 남음":"짝수 2f₀ + 홀수 f₀ 남음", LX+LW/2, r3y+rowH-7, isPI?SIGNAL_DK:AMBER_DK, 10);

  /* ── 오른쪽: 스펙트럼 (푸리에 정확값) ── */
  const mx = Math.max(1, ...before, ...after);
  const sT=topY, halfH=(rowH*3+rowGap*2-6)/2, bw=SPW/6.4;
  const drawSpec=(y0,hh,vals,lbl,col)=>{
    ctx.fillStyle="#fbfcfe"; ctx.fillRect(SX,y0,SPW,hh); ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(SX,y0,SPW,hh);
    ctx.textAlign="left"; chip(ctx, lbl, SX+4, y0-8, col, 9.5);
    for(let n=1;n<=3;n++){ const x=SX+bw*(2*n-1.35), h=vals[n-1]/mx*(hh-24);
      ctx.fillStyle = n===1?"rgba(27,79,160,.8)":(n===2?"rgba(179,18,60,.8)":"rgba(240,165,0,.78)");
      ctx.fillRect(x, y0+hh-14-h, bw*1.05, Math.max(h,0.8));
      ctx.textAlign="center"; label(ctx, n===1?"f₀":`${n}f₀`, x+bw*0.52, y0+hh-3, MUTED, 8.5, 500); }
  };
  drawSpec(sT+12, halfH-12, before, "송신 하나의 응답", INK2);
  drawSpec(sT+halfH+16, halfH-12, after, isPI?"조합 → 짝수만":"조합 → 홀수도 남음", POS);
  ctx.textAlign="center"; chip(ctx, isPI?"f₀·3f₀ 소멸":"f₀ 는 선형만 소멸", SX+SPW/2, sT+halfH*2+12, isPI?SIGNAL_DK:AMBER_DK, 9.5);
});
modeBtn.onclick = ()=>{ isPI=!isPI; modeBtn.textContent = isPI?"PI":"AM";
                        modeBtn.classList.toggle("on",isPI); pi.redraw(); };
a2S.oninput = a3S.oninput = pi.redraw;


/* ── c2 : 움직임이 상쇄를 깬다 ── */
const vtS = document.getElementById("vt"), pfS = document.getElementById("pf");
const K = 2*Math.PI/(LAM*1e-3);        /* rad/m */

const mot = makeScene("c2", 330, (ctx,W,H)=>{
  const v = +vtS.value, prf = +pfS.value*1e3;
  const dtp = 1/prf;
  const dx = v*1e-3*dtp;                              /* m */
  const res = 2*Math.abs(Math.sin(K*dx));
  const resDb = res>1e-9 ? 20*Math.log10(res) : -99;
  document.getElementById("vtv").textContent = v.toFixed(1);
  document.getElementById("pfv").textContent = (prf/1e3).toFixed(1);
  document.getElementById("rdt").textContent = (dtp*1e6).toFixed(0);
  document.getElementById("rdx").textContent = (dx*1e6).toFixed(3);
  document.getElementById("rres").textContent = resDb<-90 ? "−∞" : resDb.toFixed(1);
  const ctr = document.getElementById("rctr");
  ctr.textContent = resDb < -30 ? "하모닉이 이김" : (resDb < -20 ? "위태로움" : "잔류가 덮음");
  ctr.style.color = resDb < -30 ? SIGNAL_DK : (resDb < -20 ? AMBER_DK : POS);
  const st = document.getElementById("mstat");
  st.textContent = resDb<-90 ? "정지 조직 — 완전 상쇄" : `${(dx*1e6).toFixed(2)} µm 움직임이 ${resDb.toFixed(0)} dB 를 남김`;
  st.style.color = resDb < -30 ? SIGNAL_DK : POS;

  const L=56, R=16, PW=W-L-R, T=18, B=H-34, PH=B-T;
  const VMAX=60, DBMIN=-60;
  const X = vv => L + vv/VMAX*PW;
  const Y = db => T + Math.max(0,Math.min(1, db/DBMIN))*PH;   /* 0dB 위, −60 아래 */
  ctx.textAlign="right";
  for(let d=0; d>=DBMIN; d-=10){
    ctx.strokeStyle = d===0?"rgba(217,224,231,.9)":"rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y(d)); ctx.lineTo(L+PW,Y(d)); ctx.stroke();
    label(ctx, `${d}`, L-7, Y(d)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-40,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"선형 잔류 (dB)",-40,0,MUTED,9.5,400); ctx.restore();

  /* 하모닉 신호 수준 (기준선) — 잔류가 이걸 넘으면 진다 */
  ctx.strokeStyle=SIGNAL_DK; ctx.setLineDash([6,4]); ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(L,Y(-30)); ctx.lineTo(L+PW,Y(-30)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; chip(ctx,"하모닉 신호 수준 (대략 −30 dB)", L+PW-3, Y(-30)-5, SIGNAL_DK, 9.5);
  ctx.textAlign="left";
  /* 심근 구간 */
  ctx.fillStyle="rgba(179,18,60,.09)"; ctx.fillRect(X(20), T, X(50)-X(20), B-T);
  ctx.textAlign="center"; chip(ctx,"심근 20~50 mm/s", X(35), T+11, POS, 9.5); ctx.textAlign="left";

  /* 곡선 */
  ctx.strokeStyle=POS; ctx.lineWidth=2.4; ctx.beginPath();
  let first=true;
  for(let vv=0; vv<=VMAX; vv+=0.15){
    const d = 2*Math.abs(Math.sin(K*vv*1e-3*dtp));
    const db = d>1e-9 ? 20*Math.log10(d) : -99;
    if(db < DBMIN){ first=true; continue; }
    const px=X(vv), py=Y(db); first?(ctx.moveTo(px,py),first=false):ctx.lineTo(px,py);
  }
  ctx.stroke();
  /* 현재 점 */
  if(resDb > DBMIN){
    ctx.fillStyle=resDb<-30?SIGNAL_DK:POS;
    ctx.beginPath(); ctx.arc(X(v), Y(resDb), 5, 0, 7); ctx.fill();
    ctx.textAlign="center";
    chip(ctx, `${v.toFixed(1)} mm/s → ${resDb.toFixed(0)} dB`, X(v), Y(resDb)-11, resDb<-30?SIGNAL_DK:POS, 10);
    ctx.textAlign="left";
  }
  ctx.textAlign="center";
  [0,10,20,30,40,50,60].forEach(vv=> label(ctx, `${vv}`, X(vv), B+14, MUTED, 9, 400));
  chip(ctx,"조직 속도 (mm/s) →", L+PW/2, B+27, MUTED, 9.5, 400);
  ctx.textAlign="left";
  chip(ctx, `5 MHz · PRF ${(prf/1e3).toFixed(1)} kHz · 간격 ${(dtp*1e6).toFixed(0)} µs`, L+5, T+11, MUTED, 9.5, 400);
});
vtS.oninput = pfS.oninput = mot.redraw;
