/* ═══ 25 도플러 효과 · 애니메이션 (v2 — 인과적 파면) ═══
   검증: verify25_28.py [25] · f_d = 2 f0 v cosθ / c

   v2 에서 고친 것 ★
   ① 인과: 송신 파면이 적혈구에 '도착한 순간'에만 에코 파면이 태어납니다.
      (v1 은 송신·에코를 따로 돌려서 도착 전에 에코가 나갔습니다)
   ② 도플러를 '흉내내지' 않습니다 — 적혈구가 실제로 움직이며 되쏘므로
      에코 파면의 중심이 이동하고, 간격 압축/팽창이 저절로 나옵니다.
      검증: 다가옴 비율 0.915(압축) · 멀어짐 1.108(팽창) · v=0 이면 1.000
      압축률의 θ 의존성 0.0974/0.1385 = 0.703 ≈ cos45° = 0.707 ✓
   ③ 흐름 방향 토글 (rev) — 편이 부호가 뒤집힙니다. */

const CS=1540;
/* ★ v4 — 파면을 '보이게' 만드는 조정
   ① GAP 26→55 : 동시 표시 파면 17개→6개. 겹쳐서 생기던 모아레·에일리어싱이 사라집니다.
   ② 모든 것은 β 하나가 정합니다:  β = 적혈구 속도 / 파면 속도 = (LEN/LOOP)·v·cosθ / SP
        보이는 파면 간격 = GAP·(1−β)/(1+β)   ← 다가옴 (멀어지면 부호 반대)
      β=0.30 (v=1·θ=0) 으로 맞췄습니다:
        v=0.5 θ=45°(기본) : 다가옴 44.5px / 멀어짐  68.1px  → 23.6px 차이 (토글하면 확연)
        v=1.0 θ=0°        : 다가옴 29.6px / 멀어짐 102.1px  → 72.5px 차이 (극적)
   ③ LOOP=17·SP=32 : 파면 도착 10 t + 에코 4개가 화면에 남음 (β 를 키우면 에코가 2개로 줄어듦)
   ★ 이 간격은 '보이게 하려고' 약 400배 과장한 것입니다.
     실제 편이 비율은 판독창의 '편이 비율'(≈5e−4) — 실제 스케일이면 아무것도 안 보입니다. */
const SP=32, GAP=55, PER=GAP/SP;    /* 파면 속도(px/t) · 간격(px) · 발사 주기(t) */
const LOOP=17;                      /* 적혈구가 혈관을 한 번 통과하는 시간 */
const velS=document.getElementById("vel"), angS=document.getElementById("ang"),
      f0S=document.getElementById("f0"), revB=document.getElementById("rev");
let DIR=+1;                          /* +1 = 다가옴 · −1 = 멀어짐 */
revB.onclick=()=>{
  DIR=-DIR;
  revB.textContent = DIR>0? "흐름 ← 다가옴" : "흐름 → 멀어짐";
  hero.redraw();
};

const hero=makeScene("c1", 380, (ctx,W,H,t)=>{
  const v=+velS.value, th=+angS.value, f0=+f0S.value*1e6;
  const vc=v*Math.cos(th*Math.PI/180)*DIR;      /* 빔축 성분 (+ = 다가옴) */
  const fd=2*f0*vc/CS;
  document.getElementById("velv").textContent=v.toFixed(2);
  document.getElementById("angv").textContent=th;
  document.getElementById("f0v").textContent=(+f0S.value).toFixed(1);
  document.getElementById("fd").textContent=Math.round(fd).toLocaleString();
  document.getElementById("vc").textContent=vc.toFixed(3);
  document.getElementById("rat").textContent=(2*Math.abs(vc)/CS).toExponential(1);
  const de=document.getElementById("dir");
  de.textContent = Math.abs(vc)<1e-6? "정지(수직)" : vc>0? "다가옴 ▲" : "멀어짐 ▼";
  de.style.color = Math.abs(vc)<1e-6? MUTED : vc>0? POS : NEG;
  const st=document.getElementById("dstat");
  st.textContent = Math.abs(vc)<1e-6? "θ=90° — cosθ=0, 편이 없음"
    : `f_d = ${Math.round(fd).toLocaleString()} Hz — ${vc>0?"파면 촘촘 · 주파수 상승":"파면 성글게 · 주파수 하강"}`;
  st.style.color = Math.abs(vc)<1e-6? MUTED : (vc>0?POS:NEG);

  /* ── 기하 ── */
  const cx=96, cy=H/2 - 6;                       /* 탐촉자 */
  const R0=Math.min(320, (W-cx-80)*0.72);        /* 빔 경로 — 짧을수록 파면이 성깁니다 */
  const X0=cx+R0, Y0=cy;                         /* 혈관 중심 */
  const rad=th*Math.PI/180;
  const ux=Math.cos(rad), uy=-Math.sin(rad);     /* 혈관 방향 (오른쪽 위) */
  const LEN=R0*0.51;                             /* 적혈구 통과 구간 — β=0.30 이 되도록 */

  /* 적혈구 위치 — LOOP 동안 한 방향으로 통과 (v=1 이면 LEN 전부) */
  const tL=t%LOOP;
  function rbcAt(T){
    const d=v*(LEN/LOOP)*Math.max(0,T);
    const off = DIR>0? (LEN/2 - d) : (-LEN/2 + d);
    return [X0+ux*off, Y0+uy*off];
  }
  /* 파면 k 가 적혈구에 도착하는 시각 — 적혈구가 움직이므로 반복해석 (4회면 수렴) */
  function arriveT(k){
    let T=k*PER + Math.hypot(X0-cx, Y0-cy)/SP;
    for(let i=0;i<4;i++){
      const p=rbcAt(T);
      T=k*PER + Math.hypot(p[0]-cx, p[1]-cy)/SP;
    }
    return T;
  }

  const rbc=rbcAt(tL);

  /* ── 혈관 ── */
  const bl=LEN/2+40;
  ctx.strokeStyle="rgba(43,61,80,.16)"; ctx.lineWidth=30;
  ctx.beginPath();
  ctx.moveTo(X0-ux*bl, Y0-uy*bl); ctx.lineTo(X0+ux*bl, Y0+uy*bl); ctx.stroke();
  ctx.strokeStyle=LINE; ctx.lineWidth=1.2; ctx.setLineDash([6,5]);
  [[-15,-15],[15,15]].forEach(([o1,o2])=>{
    ctx.beginPath();
    ctx.moveTo(X0-ux*bl - uy*o1, Y0-uy*bl + ux*o1);
    ctx.lineTo(X0+ux*bl - uy*o2, Y0+uy*bl + ux*o2); ctx.stroke();
  });
  ctx.setLineDash([]);

  /* ── 파면: 하나의 파면이 '나갔다가(회색) → 닿는 순간 되쏘아진다(색)' ── */
  const kNow=Math.floor(tL/PER);
  const NW=Math.ceil(LOOP/PER)+2;               /* 한 사이클에 발사되는 파면 수 */
  for(let k=kNow; k>=Math.max(0,kNow-NW); k--){
    const Tk=k*PER;
    if(tL<Tk) continue;
    const Ta=arriveT(k);
    if(tL < Ta){
      /* 아직 가는 중 — 송신 파면 (탐촉자 중심 · 빔축은 수평으로 고정) */
      const r=(tL-Tk)*SP;
      if(r<2 || r>R0*1.15) continue;
      const a=0.60*(1-r/(R0*1.15));
      if(a<=0.02) continue;
      ctx.strokeStyle=`rgba(120,134,150,${a.toFixed(3)})`;
      ctx.lineWidth=2.0;
      ctx.beginPath(); ctx.arc(cx,cy,r,-0.62,0.62); ctx.stroke();
    } else {
      /* 도착함 — 그 순간 그 자리에서 에코 파면이 태어남 (중심이 이동 → 도플러) */
      const p=rbcAt(Ta);
      const rE=(tL-Ta)*SP;
      if(rE<2 || rE>R0*1.15) continue;
      const a=0.75*(1-rE/(R0*1.2));
      if(a<=0.02) continue;
      ctx.strokeStyle = Math.abs(vc)<1e-6? `rgba(120,134,150,${a.toFixed(3)})`
                      : vc>0? `rgba(179,18,60,${a.toFixed(3)})` : `rgba(27,79,160,${a.toFixed(3)})`;
      ctx.lineWidth=2.6;
      const back=Math.atan2(cy-p[1], cx-p[0]);
      ctx.beginPath(); ctx.arc(p[0],p[1],rE,back-0.72,back+0.72); ctx.stroke();
    }
  }

  /* ── 빔 축 — 고정 (빔은 가만히 있고 적혈구가 그 안을 지나갑니다) ── */
  ctx.strokeStyle="rgba(90,106,125,.45)"; ctx.lineWidth=1.2; ctx.setLineDash([6,5]);
  ctx.beginPath(); ctx.moveTo(cx+16, cy); ctx.lineTo(X0+R0*0.16, Y0); ctx.stroke(); ctx.setLineDash([]);
  ray(ctx, cx+16, cy, cx+72, cy, MUTED, 1.3);
  chip(ctx,"빔 축", cx+26, cy-8, MUTED, 9, 500);

  /* ── 각도 호 — 빔축(0) 과 혈관축 사이 · 교점(혈관 중심)에 고정 ── */
  if(th>2){
    const a1=Math.atan2(uy, ux);                 /* 혈관축 = −θ */
    ctx.strokeStyle=AMBER; ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.arc(X0, Y0, 36, Math.min(0,a1), Math.max(0,a1)); ctx.stroke();
    chip(ctx,`θ=${th}°`, X0+42, Y0-16, AMBER_DK, 9.5);
  }

  /* ── 흐름 화살표 ── */
  const fdir=DIR>0? -1 : 1;
  ray(ctx, rbc[0]-ux*fdir*34, rbc[1]-uy*fdir*34, rbc[0]+ux*fdir*44, rbc[1]+uy*fdir*44,
      Math.abs(vc)<1e-6? MUTED : (vc>0?POS:NEG), 2.4);

  /* ── 적혈구 ── */
  ctx.fillStyle=INK; ctx.beginPath(); ctx.ellipse(rbc[0],rbc[1],9,5.5,rad,0,7); ctx.fill();
  chip(ctx,"적혈구", rbc[0]+16, rbc[1]+22, INK, 9.5);
  chip(ctx,"혈관", X0+ux*bl*0.82 - uy*30, Y0+uy*bl*0.82 + ux*30, MUTED, 9.5);

  /* ── 탐촉자 ── */
  ctx.fillStyle=SIGNAL_DK; ctx.fillRect(cx-9,cy-24,10,48);
  chip(ctx,"탐촉자", cx-8, cy-31, SIGNAL_DK, 9.5);

  /* ── 스피커 ── */
  ctx.fillStyle=Math.abs(vc)<1e-6?MUTED:AMBER_DK;
  ctx.beginPath(); ctx.moveTo(W-70,H-40); ctx.lineTo(W-58,H-40); ctx.lineTo(W-46,H-52);
  ctx.lineTo(W-46,H-28); ctx.lineTo(W-58,H-40); ctx.closePath(); ctx.fill();
  if(Math.abs(vc)>1e-6){
    for(let i=1;i<=3;i++){ ctx.strokeStyle=`rgba(138,95,0,${0.7/i})`; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.arc(W-46,H-40,6+i*6,-0.6,0.6); ctx.stroke(); }
    ctx.textAlign="right";
    chip(ctx,`♪ ${Math.abs(Math.round(fd)).toLocaleString()} Hz`, W-78, H-58, AMBER_DK, 9.5);
    ctx.textAlign="left";
  }
  /* 상태 배지 */
  ctx.textAlign="right";
  chip(ctx, Math.abs(vc)<1e-6? "편이 없음" : (vc>0? "에코 파면 간격 ↓ 압축" : "에코 파면 간격 ↑ 팽창"),
       W-8, 22, Math.abs(vc)<1e-6? MUTED : (vc>0?POS:NEG), 10);
  chip(ctx, "파면 간격은 보이도록 과장 — 실제 편이는 0.05% 남짓", W-8, 40, MUTED, 9, 500);
  ctx.textAlign="left";
}, {play:"p1", speed:0.05, tStill:14.0});
velS.oninput = angS.oninput = f0S.oninput = hero.redraw;

/* ── cosθ 곡선 + 각도 오차 (정적) ── */
const a2S=document.getElementById("a2");
const cosc=makeScene("c2", 320, (ctx,W,H)=>{
  const th=+a2S.value, c=Math.cos(th*Math.PI/180);
  const ve=Math.abs(Math.cos((th+3)*Math.PI/180)-c)/c*100;
  document.getElementById("a2v").textContent=th;
  document.getElementById("ct").textContent=c.toFixed(3);
  document.getElementById("mt").textContent=(c*100).toFixed(0);
  document.getElementById("ve").textContent=ve.toFixed(1);
  const st=document.getElementById("astat");
  st.textContent = th>60? "60° 초과 — 오차 급증 구간" : "임상 허용 구간 (≤60°)";
  st.style.color = th>60? POS : SIGNAL_DK;

  const L=54,R=20,B=H-40,Tp=24, PW=W-L-R, PH=B-Tp;
  const X=d=>L+d/90*PW, Y=y=>B-y*PH;
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,Tp); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  for(let d=0;d<=90;d+=15){ ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(X(d),B); ctx.lineTo(X(d),B+5); ctx.stroke();
    ctx.textAlign="center"; label(ctx,`${d}°`,X(d),B+18,MUTED,9,500); ctx.textAlign="left"; }
  [0,0.5,1].forEach(y=>{ ctx.textAlign="right"; label(ctx,y.toFixed(1),L-6,Y(y)+4,MUTED,9,500); ctx.textAlign="left";
    ctx.strokeStyle=LINE; ctx.setLineDash([2,4]); ctx.beginPath(); ctx.moveTo(L,Y(y)); ctx.lineTo(L+PW,Y(y)); ctx.stroke(); ctx.setLineDash([]); });
  ctx.fillStyle="rgba(179,18,60,.07)"; ctx.fillRect(X(60),Tp,X(90)-X(60),PH);
  ctx.strokeStyle=POS; ctx.setLineDash([5,4]); ctx.beginPath(); ctx.moveTo(X(60),Tp); ctx.lineTo(X(60),B); ctx.stroke(); ctx.setLineDash([]);
  chip(ctx,"60° 상한", X(60)+6, Tp+14, POS, 9.5);
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.4; ctx.beginPath();
  for(let d=0;d<=90;d++){ const yy=Y(Math.cos(d*Math.PI/180)); d?ctx.lineTo(X(d),yy):ctx.moveTo(X(d),yy); }
  ctx.stroke();
  ctx.fillStyle="rgba(240,165,0,.25)";
  ctx.fillRect(X(Math.max(0,th-3)),Tp,X(th+3)-X(Math.max(0,th-3)),PH);
  ctx.fillStyle=POS; ctx.beginPath(); ctx.arc(X(th),Y(c),5,0,7); ctx.fill();
  ctx.strokeStyle=POS; ctx.lineWidth=1; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(X(th),Y(c)); ctx.lineTo(X(th),B); ctx.moveTo(X(th),Y(c)); ctx.lineTo(L,Y(c)); ctx.stroke(); ctx.setLineDash([]);
  chip(ctx,`θ=${th}° · cos=${c.toFixed(2)}`, Math.min(X(th)+8,W-120), Y(c)-10, POS, 9.5);
  label(ctx,"도플러 각 θ", L+PW-70, B+18, MUTED, 9.5, 400);
  ctx.save(); ctx.translate(L-40,(Tp+B)/2+30); ctx.rotate(-Math.PI/2);
  label(ctx,"cos θ = 측정/참", 0,0, MUTED, 9.5, 400); ctx.restore();
});
a2S.oninput = cosc.redraw;
