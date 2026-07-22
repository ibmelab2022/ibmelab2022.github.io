/* ═══ A9 음향방사력과 전단파 탄성영상 · 애니메이션 ═══
   검증: /home/claude/work/a89.js
     · 종파 c = √(K/ρ) · K=2.5GPa, ρ=1060 → 1536 m/s  (02장)
     · 전단파 c_s = √(µ/ρ) · E ≈ 3µ (비압축성)
       정상 간 E5 → 1.25 · F4 경변 E20 → 2.51 · 악성 E60 → 4.34 · 유방암 E100 → 5.61 m/s
     · K 는 조직간 4.1% 차이 → 종파 대비 거의 없음 · µ 는 20배 → 전단파 4.5배 (347%)
     · 종파 : 전단파 = 1229 : 1 (같은 매질에서 세 자릿수)
     · F = 2αI/c = q/c  (31장의 q = 2αI 와 같은 흡수)
       5MHz α=28.8 Np/m · ARFI 1000 W/cm² → q 576 MW/m³ · F 374 kN/m³
     · 2cm 통과: 정상 간 16.0ms · 경변 7.7ms · 종양 3.6ms
       10 표본 추적에 필요한 fps: 625 / 1300 / 2800 → 평면파(A1) 필수
     · Supersonic: 푸시 10 m/s ÷ c_s 1.25 = Mach 8.0 → 원뿔 반각 7.2° (Bercoff 2004)      */
const RHO_E = 1060;
const K_BULK = 2.5e9;
const C_LONG = Math.sqrt(K_BULK/RHO_E);
const csOf = EkPa => Math.sqrt((EkPa*1e3/3)/RHO_E);      /* m/s */

/* ── c1 : 밀고 · 퍼지고 · 초고속으로 본다 ── */
const eeS = document.getElementById("ee"), fpsS = document.getElementById("fps");

const push = makeScene("c1", 400, (ctx,W,H,t)=>{
  const E = +eeS.value, fps = +fpsS.value;
  const cs = csOf(E);
  const tt = 0.02/cs*1000;                               /* ms — 2cm 통과 */
  const nf = tt/1000*fps;
  document.getElementById("eev").textContent = E;
  document.getElementById("fpsv").textContent = fps;
  document.getElementById("rmu").textContent = (E/3).toFixed(2);
  document.getElementById("rcs").textContent = cs.toFixed(2);
  document.getElementById("rtt").textContent = tt.toFixed(1);
  document.getElementById("rnf").textContent = nf.toFixed(1);
  const rok = document.getElementById("rok");
  if(nf >= 10){ rok.textContent="충분 ✓"; rok.style.color=SIGNAL_DK; }
  else if(nf >= 3){ rok.textContent="빠듯"; rok.style.color=AMBER_DK; }
  else { rok.textContent="불가능 ✗"; rok.style.color=POS; }

  const L=16, R=16, PW=W-L-R, T=44, B=H-70, PH=B-T;
  const FW=40;                                            /* mm 가로 시야 */
  const X = mm => L + (mm/FW + 0.5)*PW;
  const sc = PW/FW;
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(L,T,PW,PH);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(L,T,PW,PH);

  /* 시간 순환: 0~1.4 (1.0 에서 2cm 도달) */
  const cyc = (t*0.55) % 1.45;
  const pushPhase = cyc < 0.12;
  const wavePos = Math.max(0, (cyc-0.12)/1.0) * 20;      /* mm */

  /* 푸시 빔 */
  const bw = 3*sc;
  ctx.fillStyle = pushPhase ? "rgba(27,79,160,.55)" : "rgba(27,79,160,.12)";
  ctx.fillRect(X(0)-bw/2, T+2, bw, PH-4);
  ctx.textAlign="center";
  chip(ctx, pushPhase ? "ARFI 푸시 — 밀고 있음" : "푸시 끝", X(0), T-8, NEG, 10.5);

  /* 변위 프로파일 + 전단파 */
  const base=(T+B)/2;
  ctx.save(); ctx.beginPath(); ctx.rect(L+1,T+1,PW-2,PH-2); ctx.clip();
  const disp = mm => {
    const d = Math.abs(mm);
    if(pushPhase) return Math.exp(-Math.pow(d/2.2,2))*(cyc/0.12);
    const front = wavePos;
    const env = Math.exp(-Math.pow((d-front)/2.6,2))*Math.exp(-front/22);
    return env;
  };
  const pts=[];
  for(let px=0;px<=PW;px++){ const mm=(px/PW-0.5)*FW;
    pts.push([L+px, base - disp(mm)*PH*0.34]); }
  ctx.fillStyle= pushPhase ? "rgba(27,79,160,.20)" : "rgba(179,18,60,.20)";
  ctx.beginPath(); ctx.moveTo(L,base); pts.forEach(p=>ctx.lineTo(p[0],p[1])); ctx.lineTo(L+PW,base);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle= pushPhase ? NEG : POS; ctx.lineWidth=2.4; ctx.beginPath();
  pts.forEach((p,i)=> i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle="rgba(217,224,231,.9)"; ctx.setLineDash([2,4]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(L,base); ctx.lineTo(L+PW,base); ctx.stroke(); ctx.setLineDash([]);

  /* 전단파 위치 표시 */
  if(!pushPhase && wavePos>0.5){
    [-1,1].forEach(s=>{
      ctx.strokeStyle=POS; ctx.lineWidth=1.4; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(X(s*wavePos), T+2); ctx.lineTo(X(s*wavePos), B-2); ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.textAlign="center";
    chip(ctx, `전단파 ${wavePos.toFixed(1)} mm · ${cs.toFixed(2)} m/s`, X(wavePos), B-10, POS, 10);
  }
  ctx.textAlign="left";
  chip(ctx, "변위 (µm 규모)", L+4, T+13, MUTED, 9.5, 400);
  ctx.textAlign="right";
  chip(ctx, `E = ${E} kPa · µ = ${(E/3).toFixed(2)} kPa`, L+PW-4, T+13, INK, 10);

  /* ── 아래: 추적 프레임 타임라인 ── */
  const ty=B+30, tw=PW;
  ctx.fillStyle="rgba(238,243,247,.9)"; ctx.fillRect(L,ty,tw,16);
  ctx.strokeStyle=LINE; ctx.strokeRect(L,ty,tw,16);
  const nShow = Math.min(200, Math.max(1, Math.round(nf)));
  for(let i=0;i<nShow;i++){
    const x = L + tw*(i+0.5)/Math.max(nShow,1);
    ctx.fillStyle = nf>=10 ? SIGNAL_DK : (nf>=3?AMBER_DK:POS);
    ctx.fillRect(x-1, ty+2, 2, 12);
  }
  ctx.textAlign="left";
  label(ctx, `${fps.toLocaleString()} fps 로 ${tt.toFixed(1)} ms 동안 → ${nf.toFixed(1)} 장`, L, ty-5, MUTED, 9.5, 400);
  ctx.textAlign="right";
  chip(ctx, nf>=10 ? "추적 충분" : (nf>=3?"빠듯":"파를 놓친다"), L+tw, ty+28,
       nf>=10?SIGNAL_DK:(nf>=3?AMBER_DK:POS), 10.5);
  ctx.textAlign="left";
  chip(ctx, "10장 이상이면 도달 시각을 제대로 잰다", L, ty+28, MUTED, 9, 400);
}, {play:"play", speed:0.03, tStill:0.55});
eeS.oninput = fpsS.oninput = push.redraw;


/* ── c2 : K 는 다 물이라 같고, µ 만 다르다 ── */
const e2S = document.getElementById("e2");

const cmp2 = makeScene("c2", 340, (ctx,W,H)=>{
  const E = +e2S.value;
  const cs = csOf(E);
  /* 종파: K 가 조직간 ±2% 흔들린다고 보면 c 는 ±1% — E 와 무관 */
  const cl = C_LONG*(1 + 0.01*Math.tanh((E-30)/40));
  document.getElementById("e2v").textContent = E;
  document.getElementById("rcl").textContent = cl.toFixed(0);
  document.getElementById("rcs2").textContent = cs.toFixed(2);
  document.getElementById("rrat").textContent = Math.round(cl/cs).toLocaleString();
  document.getElementById("rctr").textContent = (cs/csOf(5)).toFixed(2);
  const st=document.getElementById("mstat");
  st.textContent = `E ${E} kPa → 전단파 ${cs.toFixed(2)} m/s (정상 간의 ${(cs/csOf(5)).toFixed(2)}배) · 종파는 ${cl.toFixed(0)} m/s 그대로`;
  st.style.color = SIGNAL_DK;

  const L=56, R=16, PW=W-L-R, T=18, B=H-34, PH=B-T;
  const EMIN=2, EMAX=100;
  const X = e => L + (Math.log10(e)-Math.log10(EMIN))/(Math.log10(EMAX)-Math.log10(EMIN))*PW;
  /* 세로: 로그 (0.5 ~ 3000 m/s) */
  const VLO=Math.log10(0.5), VHI=Math.log10(3000);
  const Y = v => B - (Math.log10(Math.max(v,0.5))-VLO)/(VHI-VLO)*PH;
  ctx.textAlign="right";
  [0.5,1,5,10,100,1000].forEach(v=>{
    ctx.strokeStyle="rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y(v)); ctx.lineTo(L+PW,Y(v)); ctx.stroke();
    label(ctx, `${v}`, L-7, Y(v)+3.5, MUTED, 9, 400);
  });
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-40,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"파속 (m/s, 로그)",-40,0,MUTED,9.5,400); ctx.restore();
  /* 종파 */
  ctx.strokeStyle=NEG; ctx.lineWidth=2.6; ctx.beginPath();
  for(let e=EMIN;e<=EMAX;e+=0.5){ const v=C_LONG*(1+0.01*Math.tanh((e-30)/40));
    const px=X(e), py=Y(v); (e===EMIN)?ctx.moveTo(px,py):ctx.lineTo(px,py); }
  ctx.stroke();
  /* 전단파 */
  ctx.strokeStyle=POS; ctx.lineWidth=2.6; ctx.beginPath();
  for(let e=EMIN;e<=EMAX;e+=0.5){ const px=X(e), py=Y(csOf(e)); (e===EMIN)?ctx.moveTo(px,py):ctx.lineTo(px,py); }
  ctx.stroke();
  /* 현재 */
  ctx.fillStyle=NEG; ctx.beginPath(); ctx.arc(X(E), Y(cl), 5, 0, 7); ctx.fill();
  ctx.fillStyle=POS; ctx.beginPath(); ctx.arc(X(E), Y(cs), 5, 0, 7); ctx.fill();
  ctx.textAlign="left";
  chip(ctx, `종파 c = √(K/ρ) — 거의 평평 (K 는 다 "물")`, L+4, Y(C_LONG)-8, NEG, 10);
  chip(ctx, `전단파 c_s = √(µ/ρ) — 4.5배 오름`, L+4, Y(csOf(50))+16, POS, 10);
  ctx.textAlign="center";
  chip(ctx, `${cl.toFixed(0)} m/s`, X(E), Y(cl)-11, NEG, 10);
  chip(ctx, `${cs.toFixed(2)} m/s`, X(E), Y(cs)+18, POS, 10);
  /* 조직 눈금 */
  [[5,"정상 간"],[20,"경변"],[60,"악성"],[100,"유방암"]].forEach(([e,n])=>{
    ctx.strokeStyle="rgba(240,165,0,.4)"; ctx.setLineDash([3,4]); ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(X(e),T); ctx.lineTo(X(e),B); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="center"; label(ctx, n, X(e), T+11, AMBER_DK, 9, 400);
  });
  [2,5,10,20,50,100].forEach(e=> label(ctx, `${e}`, X(e), B+14, MUTED, 9, 400));
  chip(ctx,"조직 탄성 E (kPa, 로그) →", L+PW/2, B+27, MUTED, 9.5, 400);
  ctx.textAlign="right";
  chip(ctx, `속도비 ${Math.round(cl/cs).toLocaleString()} : 1`, L+PW-3, T+11, AMBER_DK, 10.5);
  ctx.textAlign="left";
});
e2S.oninput = cmp2.redraw;


/* ── c3 : 재구성 파이프라인 — 밀기 → Mach 원뿔 → 추적 → 도달시각(TOF) → 탄성 지도 ──
   검증(/tmp/a9swe.py):
     c_s=√(µ/ρ) E20→2.51 m/s · µ=ρc_s² · TOF c_s=Δx/Δt, x-t 기울기=1/c_s
     Mach 반각=arcsin(c_s/v_push) E5→7.2°·E20→14.5°·E100→34° (v_push 10 m/s, Bercoff SSI)
     추적 평면파 수천 fps (Montaldo 5PW 10kHz→2kHz · Song CUSE 3각도 3745Hz)               */
/* ═══ c3 : SWEI 파이프라인 (밀기→퍼짐→추적→속도→지도) ═══ */
const e3S = document.getElementById("e3");
let stage3 = 0;
const STAGES3 = [
  ["① ARFI 푸시",    "초점에 방사력 → 조직이 밀림"],
  ["② 전단파 퍼짐",  "밀린 자리에서 옆으로 → 준평면(Mach 원뿔)"],
  ["③ 초고속 추적",  "평면파로 전체를 한 번에 → 화소별 변위"],
  ["④ 속도 측정",    "x-t 기울기 → c_s = Δx/Δt"],
  ["⑤ 탄성 지도",    "c_s → µ = ρc_s² → 딱딱함 지도"],
];
const SHORT3 = ["밀기","퍼짐","추적","속도","지도"];
const VPUSH = 10;
function csColor(c,a){ const u=Math.max(0,Math.min(1,(c-1.0)/4.6)); let r,g,b;
  if(u<0.5){ const k=u/0.5; r=27+(240-27)*k|0; g=79+(200-79)*k|0; b=160-160*k|0; }
  else { const k=(u-0.5)/0.5; r=240-(240-179)*k|0; g=200-200*k|0; b=0+60*k|0; }
  return `rgba(${r},${g},${b},${a})`; }

/* 공통 : 조직 깊이 격자 (축방향 변위 disp 로 흔들림) */
function shearGrid(ctx,px,py,pw,ph,disp,tint){
  ctx.fillStyle=tint; ctx.fillRect(px,py,pw,ph);
  ctx.strokeStyle="rgba(134,154,180,.36)"; ctx.lineWidth=1; const nz=9;
  for(let i=1;i<nz;i++){ const z0=py+ph*i/nz; ctx.beginPath();
    for(let gx=px+4;gx<=px+pw-4;gx+=5){ const yy=z0+disp(gx,z0); gx===px+4?ctx.moveTo(gx,yy):ctx.lineTo(gx,yy); } ctx.stroke(); }
}

/* ── ① 밀기 : 집속빔이 초점의 격자를 축방향으로 민다 ── */
function drawPush(ctx,px,py,pw,ph,t){
  const xf=px+pw*0.30, zf=py+ph*0.52, build=Math.min(1,((t*0.6)%2)/0.9), dip=build*ph*0.12;
  shearGrid(ctx,px,py,pw,ph,(gx,z0)=>dip*Math.exp(-Math.pow((gx-xf)/(pw*0.11),2))*Math.exp(-Math.pow((z0-zf)/(ph*0.30),2)),"#0c1420");
  const tdY=py+20;
  ctx.fillStyle="rgba(210,225,240,.92)"; ctx.fillRect(xf-pw*0.11,tdY,pw*0.22,7);
  ctx.strokeStyle="rgba(60,120,220,.45)"; ctx.lineWidth=1.3;
  for(let k=-3;k<=3;k++){ ctx.beginPath(); ctx.moveTo(xf+k*pw*0.033,tdY+7); ctx.lineTo(xf,zf); ctx.stroke(); }
  const g=ctx.createRadialGradient(xf,zf,1,xf,zf,pw*0.09); g.addColorStop(0,"rgba(70,130,235,.95)"); g.addColorStop(1,"rgba(27,79,160,0)");
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(xf,zf,pw*0.09,0,7); ctx.fill();
  ctx.strokeStyle=NEG; ctx.lineWidth=2.8; ctx.fillStyle=NEG;
  ctx.beginPath(); ctx.moveTo(xf,zf+2); ctx.lineTo(xf,zf+11+dip); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(xf-4.5,zf+6+dip); ctx.lineTo(xf,zf+11+dip); ctx.lineTo(xf+4.5,zf+6+dip); ctx.fill();
  ctx.textAlign="center"; label(ctx,"집속 트랜스듀서",xf,tdY-6,"#a8bccf",11.5,600);
  chip(ctx,"방사력 F = 2αI/c 로 조직을 민다", px+pw*0.5, py+ph-26, NEG, 12.5, 700);
  label(ctx,"초점의 조직 격자가 축방향으로 밀림 ↓", px+pw*0.5, py+ph-9, "#e0c8b6", 11.5, 600);
}

/* ── ② 퍼짐 : 초점이 빠르게 내려가며 밀린 자리들이 정렬(Mach 원뿔) ── */
function drawSpread(ctx,px,py,pw,ph,t,cs,halfAng,mach){
  const xf=px+pw*0.30, top=py+20, prog=((t*0.5)%2)/2, zTop=py+ph*0.30, zBot=py+ph*0.74, zPush=zTop+prog*(zBot-zTop), dip=ph*0.10;
  shearGrid(ctx,px,py,pw,ph,(gx,z0)=>dip*Math.exp(-Math.pow((gx-xf)/(pw*0.075),2))*Math.exp(-Math.pow((z0-zPush)/(ph*0.12),2)),"#120a06");
  ctx.fillStyle="rgba(60,120,220,.4)"; for(let z=zTop;z<zPush;z+=ph*0.05){ ctx.beginPath(); ctx.arc(xf,z,3,0,7); ctx.fill(); }
  ctx.fillStyle=NEG; ctx.beginPath(); ctx.arc(xf,zPush,5.5,0,7); ctx.fill();
  const rad=halfAng*Math.PI/180;
  ctx.strokeStyle=POS; ctx.lineWidth=2.8;
  [-1,1].forEach(s=>{ const room=s<0?(xf-px-6):(px+pw-xf-6); const L=Math.min((zPush-top)/Math.cos(rad), room/Math.max(0.05,Math.sin(rad))); ctx.beginPath(); ctx.moveTo(xf,zPush); ctx.lineTo(xf+s*Math.sin(rad)*L,zPush-Math.cos(rad)*L); ctx.stroke(); });
  ctx.strokeStyle="rgba(179,18,60,.35)"; ctx.lineWidth=1.5;
  [-1,1].forEach(s=>{ for(let k=1;k<=2;k++){ const zz=zPush+k*ph*0.11; const room=s<0?(xf-px-6):(px+pw-xf-6); const L=Math.min((zz-top)/Math.cos(rad), room/Math.max(0.05,Math.sin(rad))); if(L<10)continue; ctx.beginPath(); ctx.moveTo(xf,zz); ctx.lineTo(xf+s*Math.sin(rad)*L,zz-Math.cos(rad)*L); ctx.stroke(); } });
  ctx.textAlign="center"; label(ctx,"초점을 전단파보다 빠르게 내림 ↓",xf+pw*0.02,top-6,"#a8b8e0",11.5,700);
  chip(ctx,`Mach ${mach.toFixed(1)} · 반각 ${halfAng.toFixed(0)}° → 준평면 전단파`, px+pw*0.5, py+ph-26, POS, 12, 700);
  label(ctx,"밀린 자리들이 정렬 → 거의 평면인 전단파", px+pw*0.5, py+ph-9, "#e0c8b6", 11.5, 600);
}

/* ── ③ 추적 : 전단파가 (Mach 반각만큼 기울어) 우측 전파 · 평면파 이미징 + 후처리 ── */
function drawTrack(ctx,px,py,pw,ph,t,cs){
  const gy0=py+22, gh=ph-22, src=px+pw*0.14, prog=((t*0.4)%2)/2, wx=src+prog*pw*0.76, amp=gh*0.05;
  const tilt=Math.min(0.7, Math.asin(Math.min(1,cs/VPUSH)));   /* Mach 반각(수직 기준) — 깊이별 시작시각 차이 */
  const zMid=gy0+gh*0.5, wxAt=z=>wx+(zMid-z)*Math.tan(tilt);
  const disp=(gx,z)=>{ const d=gx-wxAt(z); return amp*Math.sin(d/(pw*0.032))*Math.exp(-Math.pow(d/(pw*0.06),2)); };
  shearGrid(ctx,px,gy0,pw,gh,disp,"#0e0a12");
  /* 평면파 트랜스듀서(전체 개구) + 하강 평면파 */
  ctx.fillStyle="rgba(210,225,240,.92)"; ctx.fillRect(px+pw*0.08, gy0, pw*0.84, 6);
  const pwp=((t*1.6)%1), zPW=py+32+pwp*(ph-56);
  ctx.strokeStyle=`rgba(23,192,201,${(0.55*(1-pwp)+0.18).toFixed(3)})`; ctx.lineWidth=2.2; ctx.setLineDash([7,5]);
  ctx.beginPath(); ctx.moveTo(px+pw*0.08,zPW); ctx.lineTo(px+pw*0.92,zPW); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle="rgba(23,192,201,.45)"; for(let k=0;k<6;k++){ const ax=px+pw*(0.17+0.13*k); ctx.beginPath(); ctx.moveTo(ax-3,zPW-3); ctx.lineTo(ax+3,zPW-3); ctx.lineTo(ax,zPW+3); ctx.fill(); }
  /* 전단파 파면 — 기울어진 직선 (얕을수록 앞섬) */
  const zt=gy0+8, zb=py+ph-34;
  ctx.strokeStyle=POS; ctx.lineWidth=2.6; ctx.beginPath(); ctx.moveTo(wxAt(zt),zt); ctx.lineTo(wxAt(zb),zb); ctx.stroke();
  /* 전파 방향 화살표 (파면에 수직 = 우측·약간 하향) */
  ctx.strokeStyle=POS; ctx.lineWidth=2.2; ctx.fillStyle=POS; const ay=zMid, axs=wxAt(ay);
  const dx=Math.cos(tilt), dz=Math.sin(tilt), aL=pw*0.09;
  ctx.beginPath(); ctx.moveTo(axs+6*dx,ay+6*dz); ctx.lineTo(axs+aL*dx,ay+aL*dz); ctx.stroke();
  const hx=axs+aL*dx, hz=ay+aL*dz, ang=Math.atan2(dz,dx);
  ctx.beginPath(); ctx.moveTo(hx,hz); ctx.lineTo(hx-Math.cos(ang-.5)*6,hz-Math.sin(ang-.5)*6); ctx.moveTo(hx,hz); ctx.lineTo(hx-Math.cos(ang+.5)*6,hz-Math.sin(ang+.5)*6); ctx.stroke();
  /* 후처리 추적 마커 — 두 깊이선에서, 얕은 깊이가 먼저 도달(기울기 확인) */
  [gy0+gh*0.34, gy0+gh*0.64].forEach((zTrack,ti)=>{
    for(let k=0;k<8;k++){ const gx=px+pw*(0.15+0.7*k/7), d=gx-wxAt(zTrack), near=Math.abs(d)<pw*0.08;
      ctx.fillStyle=near?(ti?"#ffd0d8":"#ffe0b0"):"rgba(200,210,220,.5)"; ctx.beginPath(); ctx.arc(gx, zTrack+disp(gx,zTrack), near?4:2.3, 0,7); ctx.fill(); } });
  ctx.textAlign="center"; label(ctx,"전체 개구로 평면파 송신 (수천 fps)",px+pw*0.5,py+18,SIGNAL_DK,11.5,700);
  chip(ctx,"전단파가 격자를 흔들며 우측 전파 (얕을수록 먼저)", px+pw*0.5, py+ph-26, POS, 12, 700);
  label(ctx,"깊이마다 시작 시각이 달라 파면이 기울어짐 · 변위는 상관(post-processing)으로 추정", px+pw*0.5, py+ph-9, "#e0c8b6", 10.5, 600);
}


/* ── ④ 속도 : x-t 기울기 (라벨 겹침 수정) ── */
function drawTOF(ctx,px,py,pw,ph,cs){
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(px,py,pw,ph); ctx.strokeStyle=LINE; ctx.strokeRect(px,py,pw,ph);
  const mL=px+52,mT=py+32,mR=px+pw-16,mB=py+ph-40, XMM=20,TMS=Math.max(6,20/cs*1.15);
  const X=mm=>mL+mm/XMM*(mR-mL), Y=ms=>mT+ms/TMS*(mB-mT);
  ctx.strokeStyle="rgba(217,224,231,.9)"; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(mL,mT); ctx.lineTo(mL,mB); ctx.lineTo(mR,mB); ctx.stroke();
  /* 눈금 (축 아래) + 축 제목 (더 아래, 겹침 방지) */
  [0,10,20].forEach(mm=>label(ctx,`${mm}`,X(mm),mB+15,MUTED,10,500));
  ctx.textAlign="center"; label(ctx,"측방 위치 x (mm) →",(mL+mR)/2,mB+30,MUTED,11,600);
  /* Y 제목 — 축에 더 붙임 */
  ctx.save(); ctx.translate(mL-24,(mT+mB)/2); ctx.rotate(-Math.PI/2); label(ctx,"느린 시간 t (ms) ↓",0,0,MUTED,11,600); ctx.restore();
  /* 줄무늬 */
  ctx.strokeStyle="rgba(179,18,60,.22)"; ctx.lineWidth=9; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(X(0.5),Y(0.5/cs)); ctx.lineTo(X(XMM),Y(XMM/cs)); ctx.stroke();
  ctx.strokeStyle=POS; ctx.lineWidth=2.6; ctx.beginPath(); ctx.moveTo(X(0.5),Y(0.5/cs)); ctx.lineTo(X(XMM),Y(XMM/cs)); ctx.stroke(); ctx.lineCap="butt";
  const x1=6,x2=12,t1=x1/cs,t2=x2/cs,dt=(x2-x1)/cs;
  [x1,x2].forEach((xx,i)=>{ ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.3; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(X(xx),Y(xx/cs)); ctx.lineTo(X(xx),mB); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=SIGNAL_DK; ctx.beginPath(); ctx.arc(X(xx),Y(xx/cs),4.5,0,7); ctx.fill();
    ctx.textAlign="center"; label(ctx,`x${i+1}`,X(xx),Y(xx/cs)-9,SIGNAL_DK,10.5,700); });
  ctx.strokeStyle=AMBER_DK; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(X(x2)+9,Y(t1)); ctx.lineTo(X(x2)+9,Y(t2)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X(x2)+6,Y(t1)); ctx.lineTo(X(x2)+12,Y(t1)); ctx.moveTo(X(x2)+6,Y(t2)); ctx.lineTo(X(x2)+12,Y(t2)); ctx.stroke();
  ctx.textAlign="left"; chip(ctx,`Δt ${dt.toFixed(2)} ms`, X(x2)+15, (Y(t1)+Y(t2))/2+3, AMBER_DK, 11);
  ctx.textAlign="left"; chip(ctx,"완만할수록 빠름 = 딱딱", mL+3, mT-4, MUTED, 10.5, 600);
  ctx.textAlign="right"; chip(ctx,`c_s = Δx/Δt = ${cs.toFixed(2)} m/s`, mR-3, mB-8, POS, 12, 700);
}

/* ── ⑤ 지도 ── */
function drawMap(ctx,px,py,pw,ph,E,cs){
  const mapW=pw-72, cs0=csOf(5);
  ctx.fillStyle=csColor(cs0,1); ctx.fillRect(px,py,mapW,ph);
  const icx=px+mapW*0.54, icy=py+ph*0.5, ir=Math.min(mapW,ph)*0.27;
  const rg=ctx.createRadialGradient(icx,icy,ir*0.3,icx,icy,ir*1.15); rg.addColorStop(0,csColor(cs,1)); rg.addColorStop(0.82,csColor(cs,1)); rg.addColorStop(1,csColor((cs+cs0)/2,1));
  ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(icx,icy,ir,0,7); ctx.fill();
  ctx.strokeStyle="rgba(255,255,255,.55)"; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(icx,icy,ir,0,7); ctx.stroke();
  ctx.strokeStyle=LINE; ctx.strokeRect(px,py,mapW,ph);
  ctx.textAlign="left"; label(ctx,"배경 · 정상",px+8,py+18,"#fff",11.5,700);
  ctx.textAlign="center"; label(ctx,`내포물 E=${E}kPa`,icx,icy-4,"#fff",11.5,700); label(ctx,`c_s ${cs.toFixed(2)} m/s`,icx,icy+13,"#fff",11,600);
  const cbX=px+mapW+22,cbW=18,cbT=py+8,cbH=ph-36;
  for(let k=0;k<=cbH;k++){ ctx.fillStyle=csColor(1.0+(1-k/cbH)*4.6,1); ctx.fillRect(cbX,cbT+k,cbW,1); }
  ctx.strokeStyle=LINE; ctx.strokeRect(cbX,cbT,cbW,cbH);
  ctx.textAlign="left"; label(ctx,"딱딱",cbX+cbW+3,cbT+7,POS,10,700); label(ctx,"무름",cbX+cbW+3,cbT+cbH,NEG,10,700);
  ctx.textAlign="right"; chip(ctx,`µ = ρc_s² = ${(E/3).toFixed(2)} kPa`, px+mapW-4, py+ph-8, INK, 12, 700);
}

/* 스테퍼 */
function _step9(ctx,W,stage){
  const n=5,m=60,y=32,x0=m,sp=(W-2*m)/(n-1),nx=i=>x0+sp*i;
  ctx.lineCap="round"; ctx.strokeStyle="rgba(210,220,230,.9)"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(nx(0),y); ctx.lineTo(nx(n-1),y); ctx.stroke();
  if(stage>0){ ctx.strokeStyle=SIGNAL; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(nx(0),y); ctx.lineTo(nx(stage),y); ctx.stroke(); }
  for(let i=0;i<n;i++){ const x=nx(i),on=i===stage,done=i<stage,r=on?13:8.5;
    if(on){ const gg=ctx.createRadialGradient(x,y,2,x,y,22); gg.addColorStop(0,"rgba(23,192,201,.5)"); gg.addColorStop(1,"rgba(23,192,201,0)"); ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(x,y,22,0,7); ctx.fill(); }
    ctx.fillStyle=(on||done)?SIGNAL:"#fff"; ctx.strokeStyle=(on||done)?SIGNAL_DK:"rgba(198,208,218,1)"; ctx.lineWidth=on?2.4:1.5; ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill(); ctx.stroke();
    ctx.textAlign="center"; if(done){ ctx.strokeStyle="#fff"; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(x-3.5,y+0.5); ctx.lineTo(x-1,y+3); ctx.lineTo(x+3.6,y-3); ctx.stroke(); }
    else label(ctx,String(i+1),x,y+(on?4.5:3.5),on?"#fff":MUTED,on?13:11,700);
    label(ctx,SHORT3[i],x,y+27,on?SIGNAL_DK:MUTED,on?12.5:11,on?700:500); }
  ctx.textAlign="left";
}

const rec = makeScene("c3", 456, (ctx,W,H,t)=>{
  const E=+e3S.value, cs=csOf(E), mu=E/3, mach=VPUSH/cs, halfAng=Math.asin(Math.min(1,cs/VPUSH))*180/Math.PI;
  document.getElementById("e3v").textContent=E;
  document.getElementById("r3cs").textContent=cs.toFixed(2);
  document.getElementById("r3mu").textContent=mu.toFixed(2);
  document.getElementById("r3step").textContent=STAGES3[stage3][0];
  document.getElementById("r3what").textContent=STAGES3[stage3][1];
  _step9(ctx,W,stage3);
  const px=16, py=78, pw=W-32, ph=H-py-14;
  ctx.save(); ctx.beginPath(); ctx.rect(px,py,pw,ph); ctx.clip();
  if(stage3===0) drawPush(ctx,px,py,pw,ph,t);
  else if(stage3===1) drawSpread(ctx,px,py,pw,ph,t,cs,halfAng,mach);
  else if(stage3===2) drawTrack(ctx,px,py,pw,ph,t,cs);
  else if(stage3===3) drawTOF(ctx,px,py,pw,ph,cs);
  else drawMap(ctx,px,py,pw,ph,E,cs);
  ctx.restore();
  ctx.strokeStyle="rgba(217,224,231,.6)"; ctx.lineWidth=1; ctx.strokeRect(px,py,pw,ph);
}, {play:"play3", speed:0.03, tStill:0.5});
document.getElementById("step3").onclick=()=>{ stage3=(stage3+1)%5; rec.redraw(); };
e3S.oninput=rec.redraw;
