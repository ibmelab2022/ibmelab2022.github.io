/* ═══ 33 규정 · 애니메이션 ═══ */

/* ── c1 : 출력 표시(ODS) 대시보드 — MI·TI 한 화면에 ── */
let doppler=false;
const outS=document.getElementById("out"), frS=document.getElementById("fr"), modeBtn=document.getElementById("mode");
const SCREEN_BG="#0b1622", SCR_TXT="#dfe7ee", SCR_RED="#ff6584";  /* 어두운 화면용 밝은 적색 (물리색 POS 와 별개, 가독용) */

const dash = makeScene("c1", 420, (ctx,W,H)=>{
  const O=(+outS.value)/100, f=+frS.value, mf=doppler?4:1;
  const MI = 2.687*O/Math.sqrt(f);        /* 압력∝출력 → MI∝O · O=1,f=2 에서 1.9 */
  const TI = 0.2*O*O*f*mf;                /* 파워∝출력² · B모드 f=5,O=1 → 1.0 */
  document.getElementById("outv").textContent=(O*100).toFixed(0);
  document.getElementById("frv").textContent=f.toFixed(1);
  document.getElementById("mi").textContent=MI.toFixed(2);
  document.getElementById("ti").textContent=TI.toFixed(1);

  const miCol = MI<0.7?SIGNAL_DK:(MI<1.9?AMBER_DK:POS);
  const tiCol = TI<1?SIGNAL_DK:(TI<6?AMBER_DK:POS);

  let adv, advCol;
  if(TI>6){ adv="TI 초과 · 출력↓ 또는 체류 최소화"; advCol=POS; }
  else if(MI>1.7){ adv="MI 한계 근처 · 필요한 최소만"; advCol=AMBER_DK; }
  else if(doppler && TI>2){ adv="도플러 발열 주의 · 체류시간 관리"; advCol=AMBER_DK; }
  else if(MI>0.7){ adv="조영제 사용 시 MI < 0.3 유지"; advCol=AMBER_DK; }
  else { adv="여유 · ALARA 유지"; advCol=SIGNAL_DK; }
  const ad=document.getElementById("adv"); ad.textContent=adv; ad.style.color=advCol;

  const L=16, scR=W-16, scT=14, scB=252;   /* ★ 화면을 크게 — 실제 장비 비율에 가깝게 */
  const scW=scR-L, scH=scB-scT;

  /* ── 모니터 화면 ── */
  ctx.fillStyle=SCREEN_BG; ctx.fillRect(L,scT,scW,scH);
  ctx.strokeStyle="#33465b"; ctx.lineWidth=1; ctx.strokeRect(L,scT,scW,scH);

  ctx.font=`700 ${(11.5*FS).toFixed(1)}px ${MONO}`; ctx.fillStyle=SIGNAL;
  ctx.textAlign="left"; ctx.fillText(doppler?"PW DOPPLER":"B-MODE", L+16, scT+26);
  ctx.font=`400 ${(10*FS).toFixed(1)}px ${MONO}`; ctx.fillStyle="#8fa0b4";
  ctx.fillText(`${f.toFixed(1)} MHz · 출력 ${(O*100).toFixed(0)}%`, L+16, scT+45);

  /* 화면 속 지수 — 실제 기기처럼 우상단 */
  ctx.textAlign="right";
  ctx.font=`700 ${(16*FS).toFixed(1)}px ${MONO}`;
  ctx.fillStyle = MI<0.7?SCR_TXT:(MI<1.9?AMBER:SCR_RED);
  ctx.fillText(`MI ${MI.toFixed(2)}`, scR-16, scT+28);
  ctx.fillStyle = TI<1?SCR_TXT:(TI<6?AMBER:SCR_RED);
  ctx.fillText(`TIS ${TI.toFixed(1)}`, scR-16, scT+50);
  ctx.textAlign="left";

  const cx=(L+scR)/2;
  if(!doppler){
    /* ── B 모드 섹터 — 화면 높이를 거의 다 씀 ── */
    const apex=scT+50, rad=scB-apex-8, half=0.76;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(cx,apex);
    ctx.arc(cx, apex, rad, Math.PI/2-half, Math.PI/2+half); ctx.closePath();
    ctx.clip();
    ctx.fillStyle="#111d2c"; ctx.fillRect(L,scT,scW,scH);
    /* ── 주파수·출력에 반응하는 스페클 / 침투 ──
       주파수↑ → 스페클 결 미세(점이 작아짐) + 침투 얕아짐(깊은 곳이 잡음에 묻힘)
       출력↑   → 침투 깊어지고 전체가 밝아짐.  시드 고정 → 무늬는 그대로, 성질만 변함. */
    const fRef=5;
    const penFrac  = Math.max(0.30, Math.min(1.0, (0.52*O+0.18)*(fRef/f)));   /* 잘 보이는 깊이 비율 (∝ 출력/주파수) */
    const bright   = 0.62 + 0.55*O;                                           /* 출력 → 밝기 */
    const dotScale = Math.max(0.6, Math.min(1.7, Math.pow(fRef/f, 0.7)));     /* 주파수 → 결 굵기 (∝ 1/f) */
    const depthOf  = reach => reach<=1 ? (1-0.30*reach) : Math.max(0.05, 0.70*Math.exp(-(reach-1)*2.4));
    let s=12345; const rnd=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
    for(let i=0;i<620;i++){
      const a=(rnd()-0.5)*2*half, r=rnd()*rad, rg=rnd(), rs=rnd();
      const g=(0.09+0.32*rg)*depthOf(r/(penFrac*rad))*bright;
      ctx.fillStyle=`rgba(190,208,226,${Math.min(0.75,g).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(cx+Math.sin(a)*r, apex+Math.cos(a)*r, (1.0+rs*1.5)*dotScale, 0, 7); ctx.fill();
    }
    /* 구조물 두 개 — 침투 한계보다 깊으면 잡음에 묻혀 사라짐 */
    [[-34,0.50,24,15,0.3],[40,0.66,19,12,-0.2]].forEach(([dx,fr,ra,rb,rot])=>{
      const dep=depthOf(fr/penFrac);
      ctx.fillStyle=`rgba(150,172,196,${(0.40*dep*bright).toFixed(3)})`;
      ctx.beginPath(); ctx.ellipse(cx+dx, apex+rad*fr, ra, rb, rot, 0, 7); ctx.fill();
    });
    ctx.restore();
    /* 섹터 테두리 */
    ctx.strokeStyle="#3d5570"; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(cx,apex);
    ctx.arc(cx, apex, rad, Math.PI/2-half, Math.PI/2+half); ctx.closePath(); ctx.stroke();
    /* 깊이 눈금 */
    ctx.strokeStyle="#2a3a4d"; ctx.lineWidth=1;
    for(let k=1;k<=4;k++){ const r=rad*k/4;
      ctx.beginPath(); ctx.arc(cx, apex, r, Math.PI/2-half, Math.PI/2+half); ctx.stroke(); }
    /* 침투 한계 — 주파수↑·출력↓ 이면 얕아짐 */
    if(penFrac < 0.97){
      const pr=rad*penFrac;
      ctx.strokeStyle="rgba(240,165,0,.75)"; ctx.setLineDash([5,4]); ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.arc(cx, apex, pr, Math.PI/2-half, Math.PI/2+half); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle=AMBER; ctx.font=`700 ${(9.5*FS).toFixed(1)}px ${MONO}`; ctx.textAlign="center";
      ctx.fillText("침투 한계", cx, apex+pr-6); ctx.textAlign="left";
    }
  } else {
    /* ── 스펙트럴 도플러 — 화면을 가득 ── */
    const bx=L+16, bw=scW-32, baseY=scB-30, hgt=scB-scT-96;
    /* 출력·주파수에 반응: 신호세기 ∝ 출력/감쇠(f) → 밝기, 출력↑ → 포락선이 잡음 위로 더 드러남 → 높이 */
    const snr  = Math.max(0.25, Math.min(1.0, (0.5*O+0.25)*(5/f)));
    const hFac = 0.60 + 0.40*O;
    ctx.strokeStyle="#2a3a4d"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(bx,baseY); ctx.lineTo(bx+bw,baseY); ctx.stroke();
    const grad=ctx.createLinearGradient(0,baseY-hgt,0,baseY);
    grad.addColorStop(0,`rgba(23,192,201,${(0.15*snr).toFixed(3)})`); grad.addColorStop(1,`rgba(23,192,201,${(0.55*snr).toFixed(3)})`);
    ctx.fillStyle=grad; ctx.beginPath(); ctx.moveTo(bx,baseY);
    for(let px=0;px<=bw;px++){
      const u=px/bw, beat=(u*3.4)%1;
      const env=Math.pow(Math.max(0,Math.sin(beat*Math.PI)),0.62)*(0.55+0.45*Math.sin(u*Math.PI));
      ctx.lineTo(bx+px, baseY-env*hFac*hgt);
    }
    ctx.lineTo(bx+bw,baseY); ctx.closePath(); ctx.fill();
    ctx.strokeStyle=`rgba(23,192,201,${(0.40+0.60*snr).toFixed(3)})`; ctx.lineWidth=1.4; ctx.beginPath();
    for(let px=0;px<=bw;px++){
      const u=px/bw, beat=(u*3.4)%1;
      const env=Math.pow(Math.max(0,Math.sin(beat*Math.PI)),0.62)*(0.55+0.45*Math.sin(u*Math.PI));
      px?ctx.lineTo(bx+px, baseY-env*hFac*hgt):ctx.moveTo(bx+px, baseY-env*hFac*hgt);
    }
    ctx.stroke();
    ctx.fillStyle="#8fa0b4"; ctx.font=`400 ${(9.5*FS).toFixed(1)}px ${MONO}`;
    ctx.fillText("샘플 게이트 고정 — 빔이 한 곳에 계속 머묾 → 발열 누적", bx, scB-12);
  }

  /* ── 임계 트랙 (밝은 배경) ── */
  const tL=L+52, tR=W-18, tw=tR-tL;
  function track(y, val, vmax, zones, ticks, name, col){
    const X=v=> tL + Math.min(v,vmax)/vmax*tw;
    zones.forEach(z=>{ ctx.fillStyle=z[2]; ctx.fillRect(X(z[0]),y, X(z[1])-X(z[0]), 16); });
    ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(tL,y,tw,16);
    ticks.forEach(tk=>{
      ctx.strokeStyle=tk[1]; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(X(tk[0]),y-3); ctx.lineTo(X(tk[0]),y+19); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign="center"; chip(ctx,tk[2], X(tk[0]), y-6, tk[1], 9);
    });
    const xm=X(val);
    ctx.fillStyle=col; ctx.beginPath();
    ctx.moveTo(xm,y-2); ctx.lineTo(xm-5,y-10); ctx.lineTo(xm+5,y-10); ctx.closePath(); ctx.fill();
    ctx.fillRect(xm-1.4,y,2.8,16);
    ctx.textAlign="left"; label(ctx,name, L, y+12, INK, 10.5, 700);
  }
  track(scB+30, MI, 2.2,
    [[0,0.3,"rgba(23,192,201,.12)"],[0.3,0.7,"rgba(23,192,201,.26)"],[0.7,1.9,"rgba(240,165,0,.22)"],[1.9,2.2,"rgba(179,18,60,.24)"]],
    [[0.3,SIGNAL_DK,"조영 0.3"],[0.7,AMBER_DK,"공동화 0.7"],[1.9,POS,"FDA 1.9"]], "MI", miCol);
  track(scB+76, TI, 7,
    [[0,1,"rgba(23,192,201,.12)"],[1,6,"rgba(240,165,0,.18)"],[6,7,"rgba(179,18,60,.24)"]],
    [[1,AMBER_DK,"1"],[6,POS,"FDA 6"]], "TIS", tiCol);

  ctx.textAlign="left";
  chip(ctx, "▶ "+adv, L, scB+120, advCol, 11);
  ctx.fillStyle=MUTED; ctx.font=`400 ${(10*FS).toFixed(1)}px ${MONO}`;
  ctx.fillText("표시값 = 표면값 × 감쇠보정 0.3 dB/cm/MHz (실제 조직 아닌 규격 가정 · 7장)", L, scB+146);
  ctx.fillText("지수가 1.0 을 넘을 수 있는 기기만 실시간 표시 의무 (ODS)", L, scB+164);
});
modeBtn.onclick=()=>{ doppler=!doppler; modeBtn.textContent=doppler?"도플러":"B-모드"; modeBtn.classList.toggle("on",doppler); dash.redraw(); };
outS.oninput = frS.oninput = dash.redraw;
