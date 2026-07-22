/* ═══ 21 아날로그 프런트엔드 Ⅰ (LNA·VCA/TGC·PGA·필터) · 애니메이션 ═══
   검증: 왕복감쇠 ≈ f dB/cm · 보정후[dB] = (기울기−감쇠)·깊이 · 잡음 = −46 + 기울기·깊이 */

/* ── c1 : TGC — 실제 스캐너처럼 두 영상(없이|적용) + 깊이별 이득 pot ── */
const tgS=document.getElementById("tg"), fzS=document.getElementById("fz");
const tgc=makeScene("c1", 440, (ctx,W,H)=>{
  const slope=+tgS.value, freq=+fzS.value, att=freq;      /* 왕복 감쇠 dB/cm */
  document.getElementById("tgv").textContent=slope.toFixed(1);
  document.getElementById("fzv").textContent=freq.toFixed(1);
  document.getElementById("rneed").textContent=att.toFixed(1);
  document.getElementById("rdeep").textContent=(slope*18).toFixed(0);
  const match=Math.abs(slope-att)<=0.4;
  const vd=document.getElementById("rvd");
  if(match){ vd.textContent="균일 — 깊이가 지워짐 ✓"; vd.style.color=SIGNAL_DK; }
  else if(slope<att){ vd.textContent="저보정 — 깊을수록 어두움"; vd.style.color=POS; }
  else { vd.textContent="과보정 — 깊이서 잡음(스노우)"; vd.style.color=POS; }

  const top=46, bot=H-38, DH=bot-top, DMX=18;
  const Y=d=> top+d/DMX*DH, Dof=y=> (y-top)/DH*DMX;
  const SW=Math.min(200,(W-150)/3.2);
  const rawX=58, corrX=W-18-SW;
  const NF=-46, MID=190, K=3.1;
  const spk=(bx,by)=>{ let h=(bx*73856093)^(by*19349663); h=Math.imul(h^(h>>>13),1274126177); return ((h>>>0)%1000)/1000; };

  function strip(x0, withTGC){
    ctx.fillStyle="#0b0c0f"; ctx.fillRect(x0,top,SW,DH);
    const bs=4;
    for(let py=top; py<bot; py+=bs){
      const d=Dof(py+bs/2);
      const tis = withTGC ? (slope-att)*d : -att*d;    /* 조직 에코 dB */
      const noi = withTGC ? (NF+slope*d) : NF;          /* 잡음 바닥 dB */
      const snow = noi>tis;
      const g = MID + K*Math.max(tis,noi);
      for(let px=x0; px<x0+SW; px+=bs){
        const s=spk((px/bs)|0,(py/bs)|0);
        const spec = snow ? (0.12+1.0*s) : (0.52+0.48*s);
        const gg = Math.max(4, Math.min(238, g*spec))|0;
        ctx.fillStyle=`rgb(${gg},${gg},${gg})`; ctx.fillRect(px,py,bs,bs);
      }
    }
    ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(x0,top,SW,DH);
  }
  strip(rawX,false); strip(corrX,true);

  ctx.textAlign="center";
  chip(ctx,"TGC 없이",rawX+SW/2,top-10,POS,11,700);
  chip(ctx,"깊을수록 어두움",rawX+SW/2,bot+16,MUTED,9.5);
  chip(ctx,"TGC 적용",corrX+SW/2,top-10,SIGNAL_DK,11,700);
  if(match) chip(ctx,"깊이가 밝기에서 지워졌다",corrX+SW/2,bot+16,SIGNAL_DK,9.5);
  else if(slope>att) chip(ctx,"깊이서 스노우",corrX+SW/2,bot+16,POS,9.5);
  else chip(ctx,"아직 어두움",corrX+SW/2,bot+16,POS,9.5);

  /* 깊이 축 */
  ctx.strokeStyle=INK; ctx.lineWidth=1.2;
  for(let d=0;d<=18;d+=3){ ctx.textAlign="right"; label(ctx,String(d),rawX-8,Y(d)+4,MUTED,9,500);
    ctx.beginPath(); ctx.moveTo(rawX-5,Y(d)); ctx.lineTo(rawX-2,Y(d)); ctx.stroke(); }
  ctx.textAlign="left"; label(ctx,"깊이 cm",rawX-52,top-10,MUTED,9,500);
  ctx.textAlign="right"; label(ctx,"(= 시간축)",rawX-8,bot+16,MUTED,8.5,400); ctx.textAlign="left";

  /* 중앙: TGC pot 뱅크 (깊이별 이득 슬라이더 = 이득 곡선) */
  const mL=rawX+SW+34, mR=corrX-34, mW=mR-mL, maxG=90;
  ctx.textAlign="center"; chip(ctx,"TGC 이득 — 깊이별 손잡이",(mL+mR)/2,top-10,AMBER_DK,11,700);
  const GX=g=> mL + Math.min(g,maxG)/maxG*mW;
  ctx.strokeStyle="rgba(240,165,0,.85)"; ctx.lineWidth=2.2;
  ctx.beginPath(); ctx.moveTo(GX(0),Y(0)); ctx.lineTo(GX(slope*DMX),Y(DMX)); ctx.stroke();
  const NB=8;
  for(let i=0;i<NB;i++){
    const d=(i+0.5)/NB*DMX, y=Y(d), g=slope*d;
    ctx.strokeStyle="rgba(217,224,231,.85)"; ctx.lineWidth=5; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(mL,y); ctx.lineTo(mR,y); ctx.stroke();
    ctx.strokeStyle="rgba(240,165,0,.30)"; ctx.beginPath(); ctx.moveTo(mL,y); ctx.lineTo(GX(g),y); ctx.stroke();
    ctx.fillStyle=AMBER_DK; ctx.beginPath(); ctx.arc(GX(g),y,5.5,0,7); ctx.fill();
    ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(GX(g),y,2,0,7); ctx.fill();
  }
  ctx.textAlign="center"; [0,30,60,90].forEach(g=>label(ctx,g+" dB",GX(g),bot+16,MUTED,8.5,500));
  ctx.textAlign="left"; label(ctx,"이득 G(d) = 기울기 × 깊이",mL,top+DH+32,MUTED,9.5,500);
});
tgS.oninput = fzS.oninput = tgc.redraw;

/* ── c2 : 대역 필터 — 에코 대역만 통과, 저역 클러터·고역 잡음 버림 ── */
const bwS=document.getElementById("bw");
const flt=makeScene("c2", 320, (ctx,W,H)=>{
  const bwPct=+bwS.value, f0=5, bw=f0*bwPct/100;          /* 대역폭 (MHz) */
  document.getElementById("bwv").textContent=bwPct;
  const flo=f0-bw/2, fhi=f0+bw/2;
  document.getElementById("rlo").textContent=flo.toFixed(1);
  document.getElementById("rhi").textContent=fhi.toFixed(1);
  const st=document.getElementById("fstat");
  if(bwPct<40){ st.textContent="너무 좁음 — 에코 가장자리도 깎임(펄스 길어짐)"; st.style.color=POS; }
  else if(bwPct>90){ st.textContent="너무 넓음 — 잡음·클러터가 더 샘"; st.style.color=AMBER_DK; }
  else { st.textContent="적당 — 에코 통과 · 잡음 억제"; st.style.color=SIGNAL_DK; }

  const L=54, R=18, PW=W-L-R, Fmax=14;
  const X=f=> L+f/Fmax*PW;
  const topP=42, botP=H-42, PH=botP-topP;
  const Y=v=> botP - v*PH;                                 /* v: 0~1 */
  ctx.fillStyle=WELL; ctx.fillRect(L,topP,PW,PH);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(L,topP,PW,PH);

  /* 입력 스펙트럼: 저역 클러터(0~1.5) + 에코 험프(f0) + 고역 잡음(완만 상승) */
  const inSpec=f=>{
    const clutter=Math.exp(-Math.pow(f/1.1,2))*0.9;
    const echo=Math.exp(-Math.pow((f-f0)/2.4,2))*0.85;
    const noise=0.10+0.016*f;
    return Math.min(1, clutter+echo+noise);
  };
  /* 밴드패스 응답 (부드러운 사다리꼴) */
  const Hf=f=>{ const edge=Math.max(0.35,bw*0.28);
    return 1/(1+Math.pow((f-f0)/(bw/2+1e-6),8)) ; };

  /* 입력(회색 채움) */
  ctx.fillStyle="rgba(90,106,125,.28)"; ctx.beginPath(); ctx.moveTo(X(0),Y(0));
  for(let f=0;f<=Fmax;f+=0.1) ctx.lineTo(X(f),Y(inSpec(f)));
  ctx.lineTo(X(Fmax),Y(0)); ctx.closePath(); ctx.fill();
  /* 출력(입력×응답, 청록 채움) */
  ctx.fillStyle="rgba(23,192,201,.30)"; ctx.beginPath(); ctx.moveTo(X(0),Y(0));
  for(let f=0;f<=Fmax;f+=0.1) ctx.lineTo(X(f),Y(inSpec(f)*Hf(f)));
  ctx.lineTo(X(Fmax),Y(0)); ctx.closePath(); ctx.fill();
  /* 필터 응답 곡선 (앰버 점선) */
  ctx.strokeStyle=AMBER; ctx.lineWidth=2; ctx.setLineDash([5,3]); ctx.beginPath();
  for(let f=0;f<=Fmax;f+=0.1){ const x=X(f),y=Y(Hf(f)); f===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke(); ctx.setLineDash([]);
  /* 통과대역 표시 */
  ctx.strokeStyle="rgba(240,165,0,.5)"; ctx.lineWidth=1;
  [flo,fhi].forEach(f=>{ ctx.setLineDash([2,3]); ctx.beginPath(); ctx.moveTo(X(f),topP); ctx.lineTo(X(f),botP); ctx.stroke(); ctx.setLineDash([]); });

  ctx.textAlign="left";
  chip(ctx,"입력 — 클러터+에코+잡음",L+4,topP+14,MUTED,9.5);
  chip(ctx,"출력 — 에코 대역만",L+4,topP+30,SIGNAL_DK,9.5);
  ctx.textAlign="center";
  chip(ctx,"저역 클러터",X(0.7),Y(inSpec(0.7))-8,POS,8.5);
  chip(ctx,`에코 f₀=${f0}MHz`,X(f0),Y(inSpec(f0))-8,SIGNAL_DK,9);
  chip(ctx,"고역 잡음",X(11.5),Y(inSpec(11.5))-8,AMBER_DK,8.5);
  chip(ctx,`통과대역 ${flo.toFixed(1)}–${fhi.toFixed(1)} MHz`,X(f0),topP+14,AMBER_DK,9);
  /* 주파수 눈금 */
  ctx.strokeStyle=INK; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(L,botP); ctx.lineTo(L+PW,botP); ctx.stroke();
  for(let f=0;f<=Fmax;f+=2){ ctx.beginPath(); ctx.moveTo(X(f),botP); ctx.lineTo(X(f),botP+5); ctx.stroke();
    ctx.textAlign="center"; label(ctx,String(f),X(f),botP+18,MUTED,8.5,400); }
  ctx.textAlign="left"; label(ctx,"주파수 (MHz) →",L+PW-118,botP+18,MUTED,9,400);
});
bwS.oninput=flt.redraw;
