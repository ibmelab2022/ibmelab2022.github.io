/* ═══ 27 펄스파 도플러 · 애니메이션 (v3 — 맥동 혈류 · 45° · 스펙트로그램) ═══
   검증: verify25_28.py [27] · v_max·D_max = c²/8f0 · f_d > PRF/2 → 앨리어싱

   v3 에서 바뀐 것 ★
   ① 혈관을 빔축과 45° 로 — 도플러 각이 v_max 와 편이에 함께 들어갑니다
        v_max = c·PRF/(4·f0·cosθ) → 45°면 θ=0 대비 1.414 배
   ② 혈류를 맥동으로 (수축기 피크 + 중복맥파 + 이완기 기저, PI ≈ 2.1)
        → 아래가 단일 선이 아니라 진짜 스펙트로그램이 됩니다
        → 피크만 나이퀴스트를 넘어 '수축기 꼭대기만 접히는' 임상 현실 재현
           (피크 0.9 m/s · PRF 8k 일 때 한 주기의 3.2% 만 접힘) */

const CS=1540, DEPTH_CM=24, THETA=45;
const COST=Math.cos(THETA*Math.PI/180);
const CYC=2.2;                        /* 스펙트로그램에 담는 심장 주기 수 */
const BEAT=3.4;                       /* 한 심장 주기 = t 단위 */
const prS=document.getElementById("pr"), vfS=document.getElementById("vf"), f0S=document.getElementById("f0");

/* 맥동 파형 — 0.22(이완기) ~ 1.0(수축기 피크) */
function pulse(ph){
  ph=((ph%1)+1)%1;
  const sys=Math.exp(-Math.pow((ph-0.17)/0.10,2));
  const dic=0.20*Math.exp(-Math.pow((ph-0.38)/0.06,2));
  return 0.22+0.78*sys+dic;
}
function alias(fd,prf){
  let f=fd;
  while(f> prf/2) f-=prf;
  while(f<-prf/2) f+=prf;
  return f;
}

const hero=makeScene("c1", 420, (ctx,W,H,t)=>{
  const prf=+prS.value*1000, vpk=+vfS.value, f0=+f0S.value*1e6;
  const dmax=CS/prf/2*100;                       /* cm — 15장 */
  const vmax=CS*prf/(4*f0*COST)*100;             /* cm/s — θ=45° 반영 */
  const fdPk=2*f0*vpk*COST/CS;                   /* 수축기 피크 편이 */
  const aliased=Math.abs(fdPk)>prf/2;
  const gate=Math.min(8, dmax*0.85);

  document.getElementById("prv").textContent=(+prS.value).toFixed(1);
  document.getElementById("vfv").textContent=vpk.toFixed(2);
  document.getElementById("f0v").textContent=(+f0S.value).toFixed(1);
  document.getElementById("dmv").textContent=dmax.toFixed(1);
  document.getElementById("vmv").textContent=vmax.toFixed(0);
  document.getElementById("fdv").textContent=Math.round(fdPk).toLocaleString();
  const al=document.getElementById("alv"), st=document.getElementById("pstat");
  if(aliased){ al.textContent="피크 접힘 ✗"; al.style.color=POS;
    st.textContent=`수축기 피크 ${(fdPk/1000).toFixed(1)} kHz > 나이퀴스트 ${(prf/2000).toFixed(1)} kHz — 꼭대기만 접힘`;
    st.style.color=POS; }
  else { al.textContent="정상 ✓"; al.style.color=SIGNAL_DK;
    st.textContent=`수축기 피크 ${(fdPk/1000).toFixed(1)} kHz < 나이퀴스트 ${(prf/2000).toFixed(1)} kHz · 도플러 각 45°`;
    st.style.color=SIGNAL_DK; }

  const L=54, R=18, PW=W-L-R;
  const X=cm=> L + cm/DEPTH_CM*PW;
  const phNow=(t/BEAT)%1;
  const vNow=vpk*pulse(phNow);

  /* ══ 위: 깊이 축(가로) + 45° 혈관 ══ */
  const yT=44, hT=128, mid=yT+hT/2;
  ctx.fillStyle="rgba(43,61,80,.045)"; ctx.fillRect(L,yT,PW,hT);
  ctx.fillStyle=INK; ctx.fillRect(L-9, mid-26, 7, 52);
  chip(ctx,"탐촉자", 4, yT-8, INK, 10);

  /* 혈관 — 게이트 지점을 지나며 45° */
  const gx=X(gate);
  const ux=Math.cos(-THETA*Math.PI/180), uy=Math.sin(-THETA*Math.PI/180);  /* 오른쪽 위 */
  const half=(hT/2-10)/Math.abs(uy);
  ctx.save(); ctx.beginPath(); ctx.rect(L,yT,PW,hT); ctx.clip();
  ctx.strokeStyle="rgba(43,61,80,.20)"; ctx.lineWidth=20;
  ctx.beginPath();
  ctx.moveTo(gx-ux*half, mid-uy*half); ctx.lineTo(gx+ux*half, mid+uy*half); ctx.stroke();
  /* 적혈구 — 맥동 속도로 혈관을 따라 (누적 위상으로 흘러감) */
  const flow=(t*0.9)%1;
  for(let i=0;i<12;i++){
    const s=((flow + i/12)%1)*2-1;                 /* -1~1 */
    const spd=pulse(phNow);
    const px=gx+ux*half*s, py=mid+uy*half*s;
    const inGate=Math.abs(px-gx)<7;
    ctx.beginPath(); ctx.arc(px,py, inGate?3.6:2.6, 0,7);
    ctx.fillStyle=inGate? POS : `rgba(120,130,140,${0.30+0.45*spd})`;
    ctx.fill();
  }
  ctx.restore();
  /* 게이트 창 (빔축 = 가로이므로 세로 직사각형) */
  const gw=13;
  ctx.fillStyle="rgba(240,165,0,.30)"; ctx.fillRect(gx-gw/2, mid-19, gw, 38);
  ctx.strokeStyle=AMBER_DK; ctx.lineWidth=1.6; ctx.strokeRect(gx-gw/2, mid-19, gw, 38);
  ctx.textAlign="center";
  chip(ctx,`게이트 ${gate.toFixed(1)} cm`, gx, mid-26, AMBER_DK, 9.5);
  ctx.textAlign="left";
  /* 45° 표시 */
  ctx.strokeStyle=AMBER; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(gx, mid, 26, -THETA*Math.PI/180, 0); ctx.stroke();
  chip(ctx,"θ=45°", gx+30, mid-4, AMBER_DK, 9);
  /* 빔축 */
  ctx.strokeStyle="rgba(90,106,125,.5)"; ctx.setLineDash([5,4]); ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(L, mid); ctx.lineTo(L+PW, mid); ctx.stroke(); ctx.setLineDash([]);
  chip(ctx,"빔 축", L+6, mid-5, MUTED, 8.5, 500);
  /* 현재 속도 배지 */
  chip(ctx,`지금 v = ${vNow.toFixed(2)} m/s`, gx+46, yT+16, phNow<0.3?POS:MUTED, 9.5);

  /* 최대 깊이 (15장과 같은 언어) */
  if(dmax < DEPTH_CM){
    ctx.strokeStyle=AMBER; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(X(dmax), yT-4); ctx.lineTo(X(dmax), yT+hT+6); ctx.stroke();
    ctx.textAlign="center";
    chip(ctx,`게이트 최대 ${dmax.toFixed(1)} cm`, Math.min(X(dmax), W-80), yT+hT+20, AMBER_DK, 10);
    ctx.textAlign="left";
    ctx.fillStyle="rgba(179,18,60,.05)"; ctx.fillRect(X(dmax), yT, L+PW-X(dmax), hT);
    if(X(dmax) < L+PW-70) chip(ctx,"PRF 가 높아 여기는 못 봄", X(dmax)+8, yT+hT-10, POS, 9, 500);
  }
  ctx.textAlign="right";
  chip(ctx,`v_max × D_max = c²/8f₀ (PRF 와 무관)`, W-8, yT-8, INK2, 9.5);
  ctx.textAlign="left";
  /* 깊이 눈금 */
  const yR=yT+hT+34;
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,yR); ctx.lineTo(L+PW,yR); ctx.stroke();
  for(let cm=0; cm<=DEPTH_CM; cm+=4){
    ctx.beginPath(); ctx.moveTo(X(cm),yR); ctx.lineTo(X(cm),yR+6); ctx.stroke();
    ctx.textAlign="center"; label(ctx,`${cm}`,X(cm),yR+19,INK,10); ctx.textAlign="left";
  }
  label(ctx,"깊이 (cm)", L+PW-64, yR+19, MUTED, 9.5, 400);

  /* ══ 아래: 스펙트로그램 ══ */
  const sy0=248, sy1=406, smid=(sy0+sy1)/2, sx0=L, sx1=L+PW;
  ctx.fillStyle=WELL; ctx.fillRect(sx0,sy0,sx1-sx0,sy1-sy0);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(sx0,sy0,sx1-sx0,sy1-sy0);
  const VS=(sy1-sy0)/2*0.86;
  const Yf=f=> smid - f/(prf/2)*VS;
  /* ±나이퀴스트 · 0 */
  ctx.strokeStyle=SIGNAL; ctx.setLineDash([5,4]); ctx.lineWidth=1.5;
  [smid-VS,smid+VS].forEach(y=>{ ctx.beginPath(); ctx.moveTo(sx0,y); ctx.lineTo(sx1,y); ctx.stroke(); });
  ctx.setLineDash([]);
  ctx.strokeStyle=MUTED; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(sx0,smid); ctx.lineTo(sx1,smid); ctx.stroke();
  /* 파형 — 스펙트럼 띠(포락선 두께)로 */
  const NPX=Math.max(2, Math.floor(sx1-sx0));
  for(let i=0;i<NPX;i++){
    const px=sx0+i;
    const ph=(i/NPX)*CYC;
    const v=vpk*pulse(ph);
    const fd=2*f0*v*COST/CS;
    const fa=alias(fd,prf);
    const isAl=Math.abs(fd)>prf/2;
    const y=Yf(fa);
    const th2=2.5+3.5*pulse(ph);                  /* 층류: 피크에서 살짝 두꺼움 */
    ctx.fillStyle=isAl? "rgba(179,18,60,.62)" : "rgba(23,192,201,.62)";
    ctx.fillRect(px, y-th2/2, 1, th2);
  }
  /* 스윕 커서 */
  const cur=sx0+(( (t/BEAT)%CYC )/CYC)*(sx1-sx0);
  ctx.strokeStyle="rgba(43,61,80,.5)"; ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(cur,sy0); ctx.lineTo(cur,sy1); ctx.stroke();
  /* 라벨 */
  ctx.textAlign="right";
  label(ctx,`+${(prf/2000).toFixed(1)}k`,sx1-6,smid-VS-4,SIGNAL_DK,9,600);
  label(ctx,`−${(prf/2000).toFixed(1)}k`,sx1-6,smid+VS+12,SIGNAL_DK,9,600);
  label(ctx,"0",sx1-6,smid-4,MUTED,9,500);
  ctx.textAlign="left";
  chip(ctx,"스펙트로그램 — 가로 시간 · 세로 편이", sx0+6, sy0+16, INK, 10);
  if(aliased){
    chip(ctx,"수축기 꼭대기가 반대편으로 접힘 ↕", sx0+6, sy1-8, POS, 9.5);
  } else {
    chip(ctx,"밴드 안 — 정상", sx0+6, sy1-8, SIGNAL_DK, 9.5);
  }
  ctx.textAlign="right";
  chip(ctx,`한 주기 ${(BEAT*0.24).toFixed(1)} 초 상당 · 표본 간격 1/PRF = ${(1e6/prf).toFixed(0)} µs`,
       sx1-6, sy1-8, MUTED, 9, 500);
  ctx.textAlign="left";
},{play:"p1", speed:0.03, tStill:0.58});
prS.oninput = vfS.oninput = f0S.oninput = hero.redraw;
