/* ═══ A10 고주파 단일소자 초음파 · 애니메이션 ═══
   검증: δ_lat=1.02cF/fc · δ_ax=2c·ln2/πΔf · 침투≈DR/(2q·f) (Passmann1996)
   초점빔 = 나비/모래시계: 수렴각=발산각=atan(1/2F#) (F#1.2→22.6°) — 콘 아님
   Hwang2016: 30MHz LiNbO₃ press-focus F0.75 · 변형 D=(A−A0)/A0, 압력↑↑ · 최소 방사력 없으면 트랩 풀림 */
const C = 1540;

/* ─────────── c1 : 초점(렌즈) ⟂ 주파수 — 분리된 두 파라미터 ─────────── */
const fcS=document.getElementById("fc"), fdS=document.getElementById("fd");
const trade=makeScene("c1", 400, (ctx,W,H)=>{
  const fcM=+fcS.value, fc=fcM*1e6, z0=+fdS.value, D=3.0, F=z0/D, df=0.8*fc;
  const dlat=1.02*(C/fc)*F*1e6, dax=2*C*Math.log(2)/(Math.PI*df)*1e6, pen=50/(2*1.0*fcM)*10;
  document.getElementById("fcv").textContent=fcM;
  document.getElementById("fdv").textContent=z0.toFixed(1);
  document.getElementById("rlat").textContent=dlat<20?dlat.toFixed(1):dlat.toFixed(0);
  document.getElementById("rax").textContent=dax.toFixed(1);
  document.getElementById("rpen").textContent=pen.toFixed(1);
  document.getElementById("rfn").textContent="F/"+F.toFixed(2);

  const LX=46, RX=W-16, top=62, bot=H-30, cx=(LX+RX)/2, pw=RX-LX;
  const Dmax=16, yD=d=>top+d/Dmax*(bot-top);
  const zf=yD(z0), apH=pw*0.15, waistH=Math.max(2.5,Math.min(apH*0.8, dlat/2*0.5));

  /* 조직 감쇠 */
  for(let py=top;py<bot;py++){ const d=(py-top)/(bot-top)*Dmax, at=Math.exp(-d/(pen/2.3)), v=Math.max(8,at*54)|0;
    ctx.fillStyle=`rgb(${(v*0.5)|0},${(v*0.58)|0},${(v*0.78)|0})`; ctx.fillRect(LX,py,pw,1); }

  /* 집속 나비빔 — 각도는 조리개↔초점(z₀) 기하, 허리는 δ_lat */
  const slope=(apH-waistH)/(zf-top), wAt=y=>Math.max(waistH,waistH+slope*Math.abs(y-zf));
  const frac=Math.max(0.02,Math.min(0.98,(zf-top)/(bot-top)));
  const grd=ctx.createLinearGradient(0,top,0,bot);
  grd.addColorStop(0,"rgba(23,192,201,.18)"); grd.addColorStop(frac,"rgba(160,240,248,.9)"); grd.addColorStop(1,"rgba(23,192,201,.06)");
  ctx.save(); ctx.beginPath(); ctx.rect(LX,top,pw,bot-top); ctx.clip();
  ctx.fillStyle=grd; ctx.beginPath();
  ctx.moveTo(cx-apH,top); ctx.lineTo(cx-waistH,zf); ctx.lineTo(cx-wAt(bot),bot);
  ctx.lineTo(cx+wAt(bot),bot); ctx.lineTo(cx+waistH,zf); ctx.lineTo(cx+apH,top); ctx.closePath(); ctx.fill();
  const belowPen=z0>pen, gg=Math.max(waistH*3.4,13);
  const g2=ctx.createRadialGradient(cx,zf,0,cx,zf,gg); g2.addColorStop(0,`rgba(240,255,255,${belowPen?0.4:0.98})`); g2.addColorStop(.4,`rgba(155,240,248,${belowPen?0.25:0.6})`); g2.addColorStop(1,"rgba(23,192,201,0)");
  ctx.fillStyle=g2; ctx.beginPath(); ctx.arc(cx,zf,gg,0,7); ctx.fill();
  ctx.restore();
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(LX,top,pw,bot-top);

  /* 트랜스듀서 — 조리개 고정, 렌즈 곡률 ∝ 1/z₀ (초점 슬라이더로만 변함) */
  const apW=pw*0.30, lensY=top, sag=Math.max(4,Math.min(24,52/z0));
  ctx.fillStyle="#c4cdd6"; ctx.beginPath();
  ctx.moveTo(cx-apW/2,lensY-17); ctx.lineTo(cx+apW/2,lensY-17); ctx.lineTo(cx+apW/2,lensY);
  ctx.quadraticCurveTo(cx,lensY+sag,cx-apW/2,lensY); ctx.closePath(); ctx.fill();
  ctx.fillStyle="#9aa5b0"; ctx.fillRect(cx-apW/2,lensY-20,apW,4);

  /* 초점선·침투선 */
  ctx.strokeStyle="rgba(255,255,255,.5)"; ctx.lineWidth=1.2; ctx.setLineDash([3,2]); ctx.beginPath(); ctx.moveTo(cx-waistH-16,zf); ctx.lineTo(cx+waistH+16,zf); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle=AMBER; ctx.lineWidth=2.2; ctx.setLineDash([6,3]); ctx.beginPath(); ctx.moveTo(LX,yD(pen)); ctx.lineTo(RX,yD(pen)); ctx.stroke(); ctx.setLineDash([]);

  /* 깊이 눈금 */
  ctx.textAlign="right"; [0,5,10,15].forEach(d=>{ label(ctx,d+" mm",LX-8,yD(d)+4,MUTED,10,600);
    ctx.strokeStyle="rgba(150,160,170,.7)"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(LX-4,yD(d)); ctx.lineTo(LX,yD(d)); ctx.stroke(); });
  ctx.textAlign="center";
  chip(ctx,"초점 빔폭 (−6 dB) = 분해능", cx, zf+waistH+18, INK, 11.5, 700);
  label(ctx,`측방 ${dlat<20?dlat.toFixed(1):dlat.toFixed(0)} × 축방 ${dax.toFixed(1)} µm`, cx, zf+waistH+36, "#e6f8fb", 11.5, 700);
  ctx.textAlign="right"; chip(ctx,`초점 거리 z₀ ${z0.toFixed(1)} mm`, RX-6, zf+4, SIGNAL_DK, 10.5, 700);
  chip(ctx,`침투 한계 ${pen.toFixed(1)} mm`, RX-6, yD(pen)+14, AMBER_DK, 10.5, 700);
  if(belowPen){ ctx.textAlign="center"; chip(ctx,"초점이 침투보다 깊음", cx, zf-14, POS, 9.5, 700); }
  ctx.textAlign="left"; chip(ctx,`렌즈/press-focus · F#=z₀/D=${F.toFixed(2)}`, LX+6, lensY-26, INK, 10.5, 700);
  ctx.textAlign="center"; label(ctx,"렌즈(z₀) = 초점·각도 (기하) · 주파수 = 빔폭·침투", cx, bot+18, "rgba(120,135,150,.95)", 10, 600);
});
fcS.oninput=trade.redraw; fdS.oninput=trade.redraw;

/* ─────────── c2 : 획득(래스터) → 볼륨(3D) → 단면(영상) ─────────── */
const cdS=document.getElementById("cd"), kwS=document.getElementById("kw"), mipB=document.getElementById("mip");
let MIP=false;
if(mipB) mipB.onclick=()=>{ MIP=!MIP; mipB.textContent=MIP?"C-scan 보기":"MIP 보기"; };
const BLOBS=[ {x:0.32,y:0.34,z:0.24,v:0.95},{x:0.60,y:0.56,z:0.42,v:0.85},{x:0.45,y:0.30,z:0.54,v:0.90},
              {x:0.70,y:0.66,z:0.64,v:0.80},{x:0.28,y:0.64,z:0.74,v:0.85},{x:0.56,y:0.44,z:0.86,v:0.75} ];
function projC(x,y,z,ox,oy,s){ return [ox+x*s+y*s*0.46, oy+z*s*1.05-y*s*0.34]; }
const cube=makeScene("c2", 404, (ctx,W,H,t)=>{
  const cd=+cdS.value/100, kw=+kwS.value/100;
  document.getElementById("cdv").textContent=(cd*100)|0;
  document.getElementById("kwv").textContent=(kw*100)|0;
  document.getElementById("rmode").textContent=MIP?`MIP · 커널 ${(kw*100)|0}%`:"C-scan · 한 깊이";
  const cs2=document.getElementById("cstat"); cs2.textContent=MIP?"MIP — 커널 속 최대값을 X-Y 로":"C-scan — 한 깊이의 X-Y 단면"; cs2.style.color=MIP?POS:SIGNAL_DK;

  const pad=14, cTop=46, botM=30, us=W-pad*2, gap=us*0.03;
  const S=Math.min((us-2*gap)/3, H-cTop-botM), x1=pad, x2=pad+S+gap, x3=pad+2*(S+gap), iy=cTop+2;

  /* ── 열1: 기계 래스터 — 균일 격자 + 균일 점 ── */
  ctx.fillStyle="#0a0e13"; ctx.fillRect(x1,iy,S,S);
  const gn=12, gc=S/gn;
  ctx.strokeStyle="rgba(80,98,116,.45)"; ctx.lineWidth=0.6;
  for(let i=0;i<=gn;i++){ ctx.beginPath(); ctx.moveTo(x1+i*gc,iy); ctx.lineTo(x1+i*gc,iy+S); ctx.moveTo(x1,iy+i*gc); ctx.lineTo(x1+S,iy+i*gc); ctx.stroke(); }
  const prog=(t*0.14)%1, done=Math.floor(prog*gn*gn); let ii=0;
  for(let row=0;row<gn;row++){ const rr=row%2===0; for(let k=0;k<gn;k++){ const col=rr?k:(gn-1-k);
    if(ii<done){ ctx.fillStyle="rgba(23,192,201,.85)"; ctx.beginPath(); ctx.arc(x1+(col+0.5)*gc, iy+(row+0.5)*gc, gc*0.22, 0,7); ctx.fill(); } ii++; } }
  if(prog<0.999){ const cr=Math.floor(done/gn), rr=cr%2===0, k=done%gn, col=rr?k:(gn-1-k), tx=x1+(col+0.5)*gc, ty=iy+(cr+0.5)*gc;
    ctx.strokeStyle=AMBER; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(tx-7,ty); ctx.lineTo(tx+7,ty); ctx.moveTo(tx,ty-7); ctx.lineTo(tx,ty+7); ctx.stroke(); }
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(x1,iy,S,S);
  ctx.textAlign="center"; chip(ctx,"① 기계 래스터", x1+S/2, cTop-14, INK, 11, 700);
  label(ctx,"X →    Y ↓", x1+S/2, iy+S+20, "rgba(90,110,130,1)", 11.5, 700);

  /* ── 열2: 3D 볼륨 ── */
  const s=S/1.46, ox=x2+(S-1.46*s)/2, oy=iy+(S-1.39*s)/2+0.34*s;
  const cc=(x,y,z)=>projC(x,y,z,ox,oy,s);
  const edge=(a,b,col,lw,dash)=>{ ctx.strokeStyle=col; ctx.lineWidth=lw; if(dash)ctx.setLineDash([3,3]); const p=cc(...a),q=cc(...b); ctx.beginPath(); ctx.moveTo(p[0],p[1]); ctx.lineTo(q[0],q[1]); ctx.stroke(); ctx.setLineDash([]); };
  edge([0,1,0],[1,1,0],"rgba(150,160,170,.3)",1,true); edge([0,1,0],[0,1,1],"rgba(150,160,170,.3)",1,true); edge([0,1,0],[0,0,0],"rgba(150,160,170,.3)",1,true);
  const E="rgba(120,132,146,.9)";
  edge([0,0,0],[1,0,0],E,1.1); edge([1,0,0],[1,1,0],E,1.1); edge([1,1,0],[1,1,1],E,1.1); edge([0,0,0],[0,0,1],E,1.1); edge([1,0,0],[1,0,1],E,1.1); edge([0,0,1],[1,0,1],E,1.1); edge([1,0,1],[1,1,1],E,1.1); edge([0,0,1],[0,1,1],E,1.1); edge([0,1,1],[1,1,1],E,1.1); edge([0,0,0],[0,1,0],E,1.1);
  const bm=0.5, Bp=[cc(0,bm,0),cc(1,bm,0),cc(1,bm,1),cc(0,bm,1)];
  ctx.fillStyle="rgba(240,165,0,.13)"; ctx.beginPath(); Bp.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=AMBER; ctx.lineWidth=1.5; ctx.beginPath(); Bp.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.stroke();
  const drawP=(z,col,fa)=>{ const P=[cc(0,0,z),cc(1,0,z),cc(1,1,z),cc(0,1,z)]; ctx.fillStyle=fa; ctx.beginPath(); P.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.fill(); ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.beginPath(); P.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.stroke(); };
  if(MIP){ drawP(cd,"rgba(23,192,201,.5)","rgba(23,192,201,.08)"); drawP(Math.min(1,cd+kw),SIGNAL,"rgba(23,192,201,.14)");
    ctx.strokeStyle="rgba(23,192,201,.45)"; ctx.lineWidth=1; [[0,0],[1,0],[1,1],[0,1]].forEach(([x,y])=>{ const a=cc(x,y,cd),b=cc(x,y,Math.min(1,cd+kw)); ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke(); });
    const cl=cc(0.5,1,Math.min(1,cd+kw)); ctx.textAlign="center"; chip(ctx,"x-y (c-mode) MIP", cl[0], cl[1]+11, SIGNAL_DK, 9.5, 700);
  } else { drawP(cd,SIGNAL,"rgba(23,192,201,.16)"); const cl=cc(0.5,1,cd); ctx.textAlign="center"; chip(ctx,"x-y (c-mode)", cl[0], cl[1]+11, SIGNAL_DK, 9.5, 700); }
  BLOBS.forEach(b=>{ const p=cc(b.x,b.y,b.z), inC=MIP?(b.z>=cd&&b.z<=cd+kw):(Math.abs(b.z-cd)<0.05); ctx.fillStyle=inC?"#eafdff":"rgba(255,255,255,.25)"; ctx.beginPath(); ctx.arc(p[0],p[1],inC?3.3:2.1,0,7); ctx.fill(); });
  ctx.textAlign="center"; chip(ctx,"② 볼륨 (3D)", x2+S/2, cTop-14, INK, 11, 700);
  /* B단면 라벨 — 좌상단 고정 */
  ctx.textAlign="left"; chip(ctx,"z-x (B-mode)", x2+4, iy+11, AMBER_DK, 9.5, 700);
  /* 축 삼각 — 좌측 모서리 끝(0,0,0)에서 모서리 따라 */
  const o0=cc(0,0,0), xt=cc(0.20,0,0), yt=cc(0,0.20,0), zt=cc(0,0,0.20);
  const arw=(tp,lab)=>{ ctx.strokeStyle="rgba(70,86,102,1)"; ctx.lineWidth=1.6; ctx.beginPath(); ctx.moveTo(o0[0],o0[1]); ctx.lineTo(tp[0],tp[1]); ctx.stroke();
    const an=Math.atan2(tp[1]-o0[1],tp[0]-o0[0]); ctx.beginPath(); ctx.moveTo(tp[0],tp[1]); ctx.lineTo(tp[0]-Math.cos(an-.4)*5,tp[1]-Math.sin(an-.4)*5); ctx.moveTo(tp[0],tp[1]); ctx.lineTo(tp[0]-Math.cos(an+.4)*5,tp[1]-Math.sin(an+.4)*5); ctx.stroke();
    label(ctx,lab, tp[0]+(tp[0]-o0[0])*0.25, tp[1]+(tp[1]-o0[1])*0.25+3, INK2, 10.5, 700); };
  arw(xt,"X"); arw(yt,"Y"); arw(zt,"Z");

  /* ── 열3: 추출 단면 영상 ── */
  ctx.fillStyle="#07090c"; ctx.fillRect(x3,iy,S,S); const gc3=3;
  for(let py=0;py<S;py+=gc3) for(let px=0;px<S;px+=gc3){ const u=px/S,v=py/S; let val=0.05;
    BLOBS.forEach(b=>{ const lat=Math.exp(-(Math.pow((u-b.x)/0.07,2)+Math.pow((v-b.y)/0.07,2))); let dw; if(MIP) dw=(b.z>=cd&&b.z<=cd+kw)?1:0; else dw=Math.exp(-Math.pow((b.z-cd)/0.05,2)); val=Math.max(val,b.v*lat*dw); });
    const g=Math.max(0,Math.min(235,val*235))|0; ctx.fillStyle=`rgb(${g},${g},${g})`; ctx.fillRect(x3+px,iy+py,gc3+0.5,gc3+0.5); }
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(x3,iy,S,S);
  ctx.textAlign="center"; chip(ctx, MIP?"③ x-y · MIP":"③ x-y · C-scan", x3+S/2, cTop-14, MIP?POS:SIGNAL_DK, 11, 700);
  label(ctx,"X →    Y ↓", x3+S/2, iy+S+20, "rgba(90,110,130,1)", 11.5, 700);
}, {play:"p2", speed:0.03, t0:3, tStill:6.9});
cdS.oninput=cube.redraw; kwS.oninput=cube.redraw;

/* ─────────── c3 : 음향 집게(Hwang 2016) — 포획·변형·부피 + 하한(풀림)·상한(손상) ─────────── */
const prS=document.getElementById("pr");
const TH=0.35, THH=1.3;                            /* 하한 포획 · 상한 손상 */
const grip=makeScene("c3", 384, (ctx,W,H)=>{
  const P=+prS.value, trapped=P>=TH, damage=P>THH, dV=trapped?0.18*Math.min(1,P/1.6):0;
  document.getElementById("prv").textContent=P.toFixed(2);
  document.getElementById("rdef").textContent=(dV*100).toFixed(1);
  const rs=document.getElementById("rstate");
  rs.textContent=!trapped?"풀림":(damage?"손상 위험":"포획 중");
  rs.style.color=!trapped?MUTED:(damage?POS:SIGNAL_DK);
  const gs=document.getElementById("gstat");
  gs.textContent=!trapped?`음압 ${TH} MPa 미만 → 트랩 풀림`:(damage?`음압 ${THH} MPa 초과 → 발열·캐비테이션 손상 위험`:"안전 창 — 포획·변형");
  gs.style.color=!trapped?MUTED:(damage?POS:SIGNAL_DK);

  const pad=14, top=48, bot=H-16, LW=W*0.44, midY=(top+bot)/2;

  /* ── 좌상: 세포 변형(줌) ── */
  const dcx=pad+LW*0.5, dcy=(top+midY)/2+4;
  ctx.fillStyle="#f7fafc"; ctx.fillRect(pad,top,LW,midY-top-6); ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(pad,top,LW,midY-top-6);
  const r0=LW*0.16, rx=r0*Math.pow(1+dV,0.68), ry=r0*Math.pow(1+dV,0.32);
  ctx.setLineDash([4,3]); ctx.strokeStyle="rgba(150,160,170,.8)"; ctx.lineWidth=1.3; ctx.beginPath(); ctx.arc(dcx,dcy,r0,0,7); ctx.stroke(); ctx.setLineDash([]);
  if(trapped){ ctx.beginPath(); for(let a=0;a<=Math.PI*2+0.01;a+=0.12){ let wob=1+0.05*Math.sin(a*3+1); if(damage) wob+=0.16*Math.max(0,Math.sin(a*5+0.7)); const x=dcx+Math.cos(a)*rx*wob, y=dcy+Math.sin(a)*ry*wob; a===0?ctx.moveTo(x,y):ctx.lineTo(x,y); } ctx.closePath();
    ctx.fillStyle=damage?"rgba(179,18,60,.20)":"rgba(23,192,201,.24)"; ctx.fill(); ctx.strokeStyle=damage?"rgba(179,18,60,.95)":"rgba(23,192,201,.95)"; ctx.lineWidth=2.2; ctx.stroke(); }
  else { ctx.fillStyle="rgba(150,165,180,.18)"; ctx.beginPath(); ctx.arc(dcx,dcy,r0,0,7); ctx.fill(); }
  ctx.textAlign="left"; chip(ctx,"① 음압 → 세포 변형", pad+4, top-14, INK, 10.5, 700);
  ctx.textAlign="center"; label(ctx, !trapped?"눌림 없음":(damage?"막돌기(blebbing) 위험":`부피 +${(dV*100).toFixed(0)}%`), dcx, dcy+r0+16, !trapped?MUTED:(damage?POS:SIGNAL_DK), 10, 700);

  /* ── 좌하: 부피 변화 막대 + 안전 창 ── */
  const gTop=midY+8, gBot=bot-6, gH=gBot-gTop-14, gX=pad+34, gW=LW-44;
  ctx.textAlign="left"; chip(ctx,"② 부피 변화 (막대)", pad+4, midY-2, INK, 10.5, 700);
  const vmaxAx=0.20, yV=v=>gBot-v/vmaxAx*gH, Pmax=1.6, xP=p=>gX+p/Pmax*gW;
  /* 안전 창 음영 [TH,THH] */
  ctx.fillStyle="rgba(23,192,201,.08)"; ctx.fillRect(xP(TH), yV(vmaxAx), xP(THH)-xP(TH), gBot-yV(vmaxAx));
  ctx.strokeStyle="rgba(179,18,60,.5)"; ctx.lineWidth=1; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(xP(THH),yV(vmaxAx)); ctx.lineTo(xP(THH),gBot); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(gX,gBot); ctx.lineTo(gX+gW,gBot); ctx.stroke();
  ctx.textAlign="right"; [0,0.1,0.2].forEach(v=>{ label(ctx,(v*100)+"%",gX-3,yV(v)+3,MUTED,8,500); });
  const PL=[0.35,0.7,1.0,1.3,1.6], bw=gW/PL.length*0.5;
  PL.forEach(pp=>{ const dv=pp>=TH?0.18*Math.min(1,pp/1.6):0, bx=xP(pp)-bw/2, sel=Math.abs(pp-P)<0.16, dmg=pp>THH;
    ctx.fillStyle=sel?(dmg?"rgba(179,18,60,.85)":"rgba(23,192,201,.9)"):(dmg?"rgba(179,18,60,.3)":"rgba(23,192,201,.32)"); ctx.fillRect(bx,yV(dv),bw,gBot-yV(dv));
    ctx.strokeStyle=dmg?"rgba(179,18,60,.9)":SIGNAL_DK; ctx.lineWidth=sel?1.8:0.8; ctx.strokeRect(bx,yV(dv),bw,gBot-yV(dv)); });
  ctx.textAlign="center"; label(ctx,"안전 창", (xP(TH)+xP(THH))/2, gBot+11, SIGNAL_DK, 8.5, 700);
  label(ctx,"손상", (xP(THH)+gX+gW)/2, gBot+11, POS, 8.5, 700);
  label(ctx,"음압(MPa) →",gX+gW/2,gBot+22,MUTED,8.5,500);

  /* ── 우측: 음향 집게 포획 ── */
  const rX=pad+LW+16, rW=W-rX-14, rcx=rX+rW*0.5, fy=(top+bot)*0.56, half=rW*0.16;
  ctx.fillStyle="#f7fafc"; ctx.fillRect(rX,top,rW,bot-top); ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(rX,top,rW,bot-top);
  ctx.strokeStyle="#c4cdd6"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(rcx,top+8-half*0.7,half*1.7,Math.PI*0.75,Math.PI*0.25,true); ctx.stroke();
  const beamCol=damage?"179,18,60":"240,165,0", beamA=trapped?(0.10+0.28*(P/1.6)):0.05;
  ctx.fillStyle=`rgba(${beamCol},${beamA.toFixed(3)})`; ctx.beginPath(); ctx.moveTo(rcx-half,top+10); ctx.lineTo(rcx,fy); ctx.lineTo(rcx+half,top+10); ctx.closePath(); ctx.fill();
  ctx.strokeStyle=`rgba(${beamCol},${trapped?(0.45+0.4*P/1.6):0.25})`; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(rcx-half,top+10); ctx.lineTo(rcx,fy); ctx.lineTo(rcx+half,top+10); ctx.stroke();
  if(damage){ const gd=ctx.createRadialGradient(rcx,fy,0,rcx,fy,half*1.3); gd.addColorStop(0,"rgba(255,120,90,.5)"); gd.addColorStop(1,"rgba(179,18,60,0)"); ctx.fillStyle=gd; ctx.beginPath(); ctx.arc(rcx,fy,half*1.3,0,7); ctx.fill(); }
  ctx.fillStyle=`rgba(${beamCol},.9)`; ctx.beginPath(); ctx.arc(rcx,fy,2.5,0,7); ctx.fill();
  const cellX=trapped?rcx:rcx+rW*0.16, cellY=trapped?fy:fy+40, cr=rW*0.075, crx=cr*Math.pow(1+dV,0.68), cry=cr*Math.pow(1+dV,0.32);
  ctx.beginPath(); for(let a=0;a<=Math.PI*2+0.01;a+=0.12){ let wob=1+0.05*Math.sin(a*3+1); if(damage) wob+=0.16*Math.max(0,Math.sin(a*5+0.7)); const x=cellX+Math.cos(a)*crx*wob, y=cellY+Math.sin(a)*cry*wob; a===0?ctx.moveTo(x,y):ctx.lineTo(x,y); } ctx.closePath();
  ctx.fillStyle=!trapped?"rgba(150,165,180,.28)":(damage?"rgba(179,18,60,.22)":"rgba(23,192,201,.24)"); ctx.fill(); ctx.strokeStyle=!trapped?"rgba(150,165,180,.9)":(damage?"rgba(179,18,60,.95)":"rgba(23,192,201,.95)"); ctx.lineWidth=2; ctx.stroke();
  if(!trapped){ ctx.strokeStyle="rgba(150,160,170,.7)"; ctx.lineWidth=1.4; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(rcx,fy+6); ctx.lineTo(cellX,cellY-cry-3); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="center"; chip(ctx,"트랩 풀림 — 세포 이탈", rcx, fy+70, MUTED, 10, 700); }
  else if(damage){ ctx.textAlign="center"; chip(ctx,"발열·캐비테이션 → 손상", rcx, fy+72, POS, 10, 700); }
  ctx.textAlign="left"; chip(ctx,"③ 음향 집게 — 포획", rX+4, top-14, INK, 11, 700);
  ctx.textAlign="right"; label(ctx,"Hwang et al., Sci. Rep. 2016", W-18, bot-8, "rgba(150,165,180,.9)", 8.5, 500);
  ctx.textAlign="center"; chip(ctx,`음압 ${P.toFixed(2)} MPa`, rcx, top+16, damage?POS:(trapped?AMBER_DK:MUTED), 9.5, 600);
});
prS.oninput=grip.redraw;
