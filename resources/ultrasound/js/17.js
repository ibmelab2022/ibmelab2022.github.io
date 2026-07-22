/* ═══ 17 영상 분해능 · 애니메이션 ═══ */
const C = 1540;

/* ── 히어로: 축방향 — 두 표적이 언제 갈라지는가 ── */
const sepS=document.getElementById("sep"), frS=document.getElementById("fr"), ncS=document.getElementById("nc");

const ax = makeScene("c1", 360, (ctx,W,H)=>{
  const sep=+sepS.value, f=+frS.value, n=+ncS.value;
  const lam = C/(f*1e6)*1e3;              /* mm */
  const plen = n*lam;                      /* 펄스 공간 길이 */
  const res = plen/2;                      /* 축방향 분해능 */
  document.getElementById("sepv").textContent=sep.toFixed(2);
  document.getElementById("frv").textContent=f.toFixed(1);
  document.getElementById("ncv").textContent=n.toFixed(1);
  document.getElementById("lm").textContent=lam.toFixed(3);
  document.getElementById("pl").textContent=plen.toFixed(3);
  document.getElementById("ax").textContent=res.toFixed(3);
  document.getElementById("sp").textContent=sep.toFixed(2);
  const ok = sep > res;
  const vd=document.getElementById("vd");
  vd.textContent = ok ? "갈라짐 ✓" : "뭉침 ✗";
  vd.style.color = ok ? SIGNAL_DK : POS;
  const st=document.getElementById("astat");
  st.textContent = ok ? `간격 ${sep.toFixed(2)} > 분해능 ${res.toFixed(3)} — 두 개로 보임`
                      : `간격 ${sep.toFixed(2)} < 분해능 ${res.toFixed(3)} — 하나로 보임`;
  st.style.color = ok ? SIGNAL_DK : POS;

  const L=48,R=18,PW=W-L-R, SPAN=3.2;      /* 화면 가로 = 3.2 mm */
  const PXm = PW/SPAN;
  const X = mm => L + mm*PXm;
  const d1 = SPAN/2 - sep/2, d2 = SPAN/2 + sep/2;

  /* 위: 표적 */
  const yT=48, hT=54;
  ctx.fillStyle="rgba(43,61,80,.04)"; ctx.fillRect(L,yT,PW,hT);
  [d1,d2].forEach(d=>{ ctx.beginPath(); ctx.arc(X(d), yT+hT/2, 6, 0, 7); ctx.fillStyle=INK; ctx.fill(); });
  ctx.strokeStyle=AMBER; ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.moveTo(X(d1),yT+hT/2+14); ctx.lineTo(X(d2),yT+hT/2+14);
  ctx.moveTo(X(d1),yT+hT/2+10); ctx.lineTo(X(d1),yT+hT/2+18);
  ctx.moveTo(X(d2),yT+hT/2+10); ctx.lineTo(X(d2),yT+hT/2+18); ctx.stroke();
  ctx.textAlign="center"; chip(ctx,`${sep.toFixed(2)} mm`, X(SPAN/2), yT+hT/2+34, AMBER_DK, 10.5);
  chip(ctx,"점 표적 두 개", X(SPAN/2), yT-8, INK, 11); ctx.textAlign="left";

  /* 아래: 에코 (왕복이므로 경로차 = 2d) */
  const yE=170, hE=140, base=yE+hE/2;
  ctx.fillStyle="rgba(43,61,80,.03)"; ctx.fillRect(L,yE,PW,hE);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(L,base); ctx.lineTo(L+PW,base); ctx.stroke(); ctx.setLineDash([]);
  const sig = plen/2.3548;                 /* 가우시안 포락선 σ */
  const k = 2*Math.PI/lam;
  const pts=[], env=[];
  for(let px=0; px<=PW; px++){
    const mm = px/PXm;
    let v=0, e=0;
    [d1,d2].forEach(d=>{
      const u = mm-d;
      const g = Math.exp(-(u*u)/(2*sig*sig));
      v += g*Math.sin(k*u*2);              /* 왕복 → 위상 2배 */
      e += g;
    });
    pts.push([L+px, base - v*hE*0.30]);
    env.push([L+px, base - e*hE*0.30]);
  }
  fillWave(ctx, W, base, pts);
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2; ctx.beginPath();
  env.forEach((q,i)=> i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])); ctx.stroke();
  chip(ctx,"포락선 — 화면에 보이는 것", L+4, yE+14, SIGNAL_DK, 10);
  chip(ctx,"에코 (왕복)", L+4, yE+hE-6, MUTED, 9.5, 400);

  /* 펄스 길이 자 */
  const yP=H-24;
  ctx.strokeStyle=POS; ctx.lineWidth=1.8;
  ctx.beginPath(); ctx.moveTo(X(0.2),yP); ctx.lineTo(X(0.2+plen),yP);
  ctx.moveTo(X(0.2),yP-5); ctx.lineTo(X(0.2),yP+5);
  ctx.moveTo(X(0.2+plen),yP-5); ctx.lineTo(X(0.2+plen),yP+5); ctx.stroke();
  chip(ctx,`펄스 길이 ${plen.toFixed(2)} mm`, X(0.2+plen)+8, yP+4, POS, 10);
  ctx.textAlign="right";
  chip(ctx,`${f} MHz · ${n} 사이클 · λ=${lam.toFixed(3)} mm`, W-8, 20, INK, 10.5);
  ctx.textAlign="left";
});
sepS.oninput = frS.oninput = ncS.oninput = ax.redraw;

/* ── PSF: 나는 새 ── */
const f2S=document.getElementById("f2"), fnS=document.getElementById("fn"), drS=document.getElementById("dr");

/* PSF 렌더용 오프스크린 캔버스.
   ★ putImageData 는 캔버스 변환(makeScene 의 DPR 보정)을 무시하는 유일한 API 라,
     레티나 화면에서 그림만 '절반 위치·절반 크기'로 어긋납니다.
     오프스크린에 찍고 drawImage 로 얹으면 변환을 탑니다 (core.js 의 makeField 와 같은 방식). */
const psfOff = document.createElement("canvas");
const psfCtx = psfOff.getContext("2d");

const psf = makeScene("c2", 380, (ctx,W,H)=>{
  const f=+f2S.value, F=+fnS.value, DR=+drS.value;
  const lam=C/(f*1e6)*1e3;
  const latW = 1.02*lam*F;                 /* 측방향 −6dB 폭 */
  const axW  = 2*lam/2;                    /* 2사이클 가정 → 축방향 */
  document.getElementById("f2v").textContent=f.toFixed(1);
  document.getElementById("fnv").textContent=F.toFixed(1);
  document.getElementById("drv").textContent=DR;
  document.getElementById("rax").textContent=axW.toFixed(3);
  document.getElementById("rlat").textContent=latW.toFixed(3);
  document.getElementById("rr").textContent=(latW/axW).toFixed(2);
  const st=document.getElementById("pstat");
  st.textContent = DR>=45 ? "동적범위가 커서 날개(사이드로브)가 보입니다" : "낮은 동적범위 — 날개가 묻힙니다";
  st.style.color = DR>=45 ? POS : MUTED;

  /* 측방향 = sinc (개구), 축방향 = 가우시안 (펄스) */
  const SPAN_L = 4.0, SPAN_A = 2.0;        /* mm */
  const sinc = x => Math.abs(x)<1e-9?1:Math.sin(x)/x;
  const lat = mm => Math.abs(sinc(Math.PI*mm/(lam*F)));      /* 첫 널 = λF# */
  const sigA = axW*2/2.3548;
  const axf = mm => Math.exp(-(mm*mm)/(2*sigA*sigA));

  const PW=Math.round(Math.min(W-90, 420)), PH=260, ox=(W-PW)/2, oy=52;
  if(psfOff.width!==PW || psfOff.height!==PH){ psfOff.width=PW; psfOff.height=PH; }
  const img = psfCtx.createImageData(PW, PH);
  for(let j=0;j<PH;j++) for(let i=0;i<PW;i++){
    const l=(i/PW-0.5)*SPAN_L, a=(j/PH-0.5)*SPAN_A;
    const v = lat(l)*axf(a);
    const db = 20*Math.log10(Math.max(v,1e-9));
    const g = Math.max(0, Math.min(1, (db+DR)/DR));           /* 표시 동적범위로 압축 */
    const q=(j*PW+i)*4, c=Math.round(255-235*g);
    img.data[q]=c; img.data[q+1]=c+2; img.data[q+2]=c+5; img.data[q+3]=255;
  }
  psfCtx.putImageData(img, 0, 0);
  ctx.drawImage(psfOff, ox, oy, PW, PH);      /* ★ 변환을 타므로 테두리와 정확히 겹칩니다 */
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(ox,oy,PW,PH);

  /* 자 */
  const cx=ox+PW/2, cy=oy+PH/2;
  const pxL=PW/SPAN_L, pxA=PH/SPAN_A;
  ctx.strokeStyle=SIGNAL; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(cx-latW/2*pxL, cy); ctx.lineTo(cx+latW/2*pxL, cy); ctx.stroke();
  ctx.strokeStyle=AMBER; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(cx, cy-axW/2*pxA); ctx.lineTo(cx, cy+axW/2*pxA); ctx.stroke();
  ctx.textAlign="center";
  chip(ctx,`측방향 ${latW.toFixed(2)} mm`, cx, cy-14, SIGNAL_DK, 10);
  chip(ctx,`축방향 ${axW.toFixed(2)} mm`, cx+70, cy+16, AMBER_DK, 10);
  /* 날개 표시 */
  const wing = lam*F*1.5;
  if(DR>=42 && cx+wing*pxL < ox+PW-30){
    ctx.strokeStyle=POS; ctx.lineWidth=1.4; ctx.setLineDash([3,3]);
    [-1,1].forEach(s=>{ ctx.beginPath(); ctx.arc(cx+s*wing*pxL, cy, 13, 0, 7); ctx.stroke(); });
    ctx.setLineDash([]);
    chip(ctx,"날개 = 사이드로브", cx+wing*pxL, cy-24, POS, 10);
  }
  chip(ctx,"점 표적 하나가 이렇게 찍힙니다", cx, oy-10, INK, 11);
  chip(ctx,"← 측방향 →", cx, oy+PH+18, MUTED, 9.5, 400);
  ctx.textAlign="left";
  ctx.save(); ctx.translate(ox-14, cy); ctx.rotate(-Math.PI/2);
  label(ctx,"축방향(깊이)", -34, 0, MUTED, 9.5, 400); ctx.restore();
});
f2S.oninput = fnS.oninput = drS.oninput = psf.redraw;
