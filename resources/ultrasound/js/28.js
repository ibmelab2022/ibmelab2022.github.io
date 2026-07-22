/* ═══ 28 컬러 혈류 영상 · 애니메이션 ═══  검증: verify25_28.py [28]
   히어로: B모드 위 컬러 박스. 휜 혈관 → cosθ 로 색 변화, 스케일 초과 → 접힘, 벽필터 → 조직 회색.
   패널: 프레임률 = 1/(라인×앙상블×PRP) */
const CS=1540, F0=5e6, PRP=1/5e3;
const pkS=document.getElementById("pk"), scS=document.getElementById("sc");
const WALL=0.03;                              /* 벽 필터 문턱 (m/s 상당) */

/* 속도(부호 포함) → BART 색.  scale 넘으면 접힘 */
function bartColor(vsigned, scale){
  let v=vsigned;
  let aliased=false;
  while(v> scale){ v-=2*scale; aliased=true; }
  while(v<-scale){ v+=2*scale; aliased=true; }
  const mag=Math.min(1,Math.abs(v)/scale);
  let col;
  if(v>0) col=`rgb(${179+ (255-179)*mag|0},${18+ (90-18)*(1-mag)|0},${60*(1-mag)|0})`;    /* 빨강 계열 */
  else    col=`rgb(${27*(1-mag)|0},${79+(120-79)*(1-mag)|0},${160+(255-160)*mag|0})`;      /* 파랑 계열 */
  return {col, aliased, mag, v};
}

const hero=makeScene("c1", 400, (ctx,W,H,t)=>{
  const pk=+pkS.value, sc=+scS.value;
  const aliasing=pk>sc;
  document.getElementById("pkv").textContent=pk.toFixed(2);
  document.getElementById("scv").textContent=sc.toFixed(2);
  const wf=document.getElementById("wfv");
  wf.textContent = pk>WALL? "혈류 통과 ✓" : "느려서 잘림";
  wf.style.color = pk>WALL? SIGNAL_DK : POS;
  const al=document.getElementById("alv"), cs=document.getElementById("cstat");
  al.textContent = aliasing? "접힘 (색 반전) ✗" : "정상 ✓";
  al.style.color = aliasing? POS : SIGNAL_DK;
  cs.textContent = aliasing? `최대속도 ${pk.toFixed(2)} > 스케일 ${sc.toFixed(2)} — 접힘`
                           : `BART · 스케일 ±${sc.toFixed(2)} m/s`;
  cs.style.color = aliasing? POS : AMBER_DK;

  const L=54, R=18, PW=W-L-R, top=44, H0=340;
  /* B모드 배경 (스페클 느낌 옅게) */
  ctx.fillStyle="#e9edf1"; ctx.fillRect(L,top,PW,H0);
  /* 컬러 박스 */
  const bx0=L+PW*0.12, bx1=L+PW*0.88, by0=top+22, by1=top+H0-30;
  ctx.strokeStyle=AMBER_DK; ctx.lineWidth=1.6; ctx.setLineDash([6,4]);
  ctx.strokeRect(bx0,by0,bx1-bx0,by1-by0); ctx.setLineDash([]);
  chip(ctx,"컬러 박스", bx0+4, by0-6, AMBER_DK, 9.5);

  /* 휜 혈관 (사인 곡선) — 위치마다 접선 방향이 달라 cosθ 변화.
     빔은 세로(아래 방향) 가정 → cosθ = |혈관 접선의 세로성분| */
  const cx=(x)=> x;
  const vesselY=(x)=>{ const u=(x-bx0)/(bx1-bx0); return by0+(by1-by0)*(0.5+0.32*Math.sin(u*Math.PI*2.1)); };
  const tangent=(x)=>{ const u=(x-bx0)/(bx1-bx0);
    const dy=(by1-by0)*0.32*Math.cos(u*Math.PI*2.1)*(Math.PI*2.1)/(bx1-bx0);
    const len=Math.hypot(1,dy); return {tx:1/len, ty:dy/len}; };

  /* 혈관 벽 */
  ctx.strokeStyle="rgba(43,61,80,.22)"; ctx.lineWidth=17; ctx.beginPath();
  for(let x=bx0;x<=bx1;x+=3){ const y=vesselY(x); x===bx0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
  ctx.stroke();

  /* 혈류 색: 위치별 세그먼트 채색 (흐름 방향 = +x 라고 두고, 빔 세로 → cosθ=|ty| 부호는 tx 방향 무관, ty 로) */
  for(let x=bx0;x<bx1;x+=6){
    const y=vesselY(x); const {tx,ty}=tangent(x);
    /* 혈류 벡터가 +x 로 흐른다고 가정. 빔 방향 = +y(아래로 멀어짐).
       다가옴/멀어짐 = 혈류의 빔축 성분 = v*ty (ty>0이면 아래=멀어짐=파랑) */
    const vAxial = pk * ty;                  /* +면 멀어짐 */
    const signedTowardPos = -vAxial;         /* 빨강(+)=다가옴 → 부호 뒤집기 */
    if(pk<=WALL){ ctx.strokeStyle="rgba(150,158,166,.6)"; }
    else { const {col}=bartColor(signedTowardPos, sc); ctx.strokeStyle=col; }
    ctx.lineWidth=12; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+6,vesselY(x+6)); ctx.stroke();
  }
  /* 흐르는 적혈구 점 */
  if(pk>WALL) for(let i=0;i<14;i++){
    const u=((t*pk*0.4)+i/14)%1, x=bx0+u*(bx1-bx0), y=vesselY(x);
    ctx.beginPath(); ctx.arc(x,y,2,0,7); ctx.fillStyle="rgba(255,255,255,.7)"; ctx.fill();
  }

  /* 90° 지점 표시 (접선이 수평 = ty≈0 = 검정) */
  for(let x=bx0;x<bx1;x+=3){
    const {ty}=tangent(x);
    if(Math.abs(ty)<0.03){
      const y=vesselY(x);
      ctx.strokeStyle=INK; ctx.lineWidth=1; ctx.setLineDash([2,2]);
      ctx.beginPath(); ctx.arc(x,y,11,0,7); ctx.stroke(); ctx.setLineDash([]);
      chip(ctx,"90° → 검정",x,y-16,INK,8.5); break;
    }
  }

  /* 정지 조직 (벽 필터가 지움) */
  ctx.fillStyle="rgba(120,128,138,.15)";
  [[bx0+30,by0+20],[bx1-40,by1-30],[bx0+60,by1-24]].forEach(([px,py])=>{
    ctx.beginPath(); ctx.arc(px,py,8,0,7); ctx.fill();
  });
  chip(ctx,"정지 조직 — 벽 필터로 회색", bx0+4, by1+16, MUTED, 9);

  /* 컬러바 (오른쪽) */
  const cbX=L+PW+2, cbY=top+30, cbH=H0-80, cbW=14;
  if(cbX+cbW<W){
    for(let i=0;i<cbH;i++){
      const vv=sc*(1-2*i/cbH);              /* 위=+빨강 */
      const {col}=bartColor(vv,sc);
      ctx.fillStyle=col; ctx.fillRect(cbX,cbY+i,cbW,1);
    }
    ctx.strokeStyle=LINE; ctx.strokeRect(cbX,cbY,cbW,cbH);
    ctx.textAlign="left";
    label(ctx,`+${sc.toFixed(1)}`,cbX-2,cbY-4,POS,8.5,600);
    label(ctx,"다가옴",cbX-2,cbY-14,MUTED,8,400);
    label(ctx,`−${sc.toFixed(1)}`,cbX-2,cbY+cbH+12,NEG,8.5,600);
  }
  if(aliasing) chip(ctx,"빠른 곳이 반대색으로 접힘 (모자이크)", bx0+PW*0.30, by0+14, POS, 9.5);
},{play:"p1", speed:0.03});
pkS.oninput = scS.oninput = hero.redraw;

/* ── 앙상블 vs 프레임률 (정적) ── */
const enS=document.getElementById("en"), bxS=document.getElementById("bx");
const frame=makeScene("c2", 300, (ctx,W,H)=>{
  const N=+enS.value, lines=+bxS.value;
  const ft=lines*N*PRP;                      /* s */
  const fps=1/ft;
  document.getElementById("env").textContent=N;
  document.getElementById("bxv").textContent=lines;
  document.getElementById("ftv").textContent=(ft*1000).toFixed(0);
  document.getElementById("fpv").textContent=fps.toFixed(0);
  const qt=document.getElementById("qtv"), st=document.getElementById("fstat");
  qt.textContent = N>=12? "안정적" : N>=6? "보통" : "거침";
  qt.style.color = N>=12? SIGNAL_DK : N>=6? AMBER_DK : POS;
  st.textContent = fps>=20? `실시간 ${fps.toFixed(0)} fps — 심장도 OK` :
                   fps>=10? `${fps.toFixed(0)} fps — 복부엔 충분` :
                            `${fps.toFixed(0)} fps — 느림, 빠른 심장 놓침`;
  st.style.color = fps>=20? SIGNAL_DK : fps>=10? AMBER_DK : POS;

  const L=54, R=20, PW=W-L-R, sy0=40, sy1=250;
  /* 프레임률 곡선: fps vs 앙상블 (현재 라인수 고정) */
  const Xn=n=> L+(n-3)/(20-3)*PW;
  const fpsAt=n=> 1/(lines*n*PRP);
  const fpsMax=fpsAt(3), fpsMin=fpsAt(20);
  const Yf=f=> sy1-(f-fpsMin)/(fpsMax-fpsMin)*(sy1-sy0)*0.9;
  ctx.fillStyle=WELL; ctx.fillRect(L,sy0,PW,sy1-sy0);
  ctx.strokeStyle=LINE; ctx.strokeRect(L,sy0,PW,sy1-sy0);
  /* 30fps·15fps 기준선 */
  [[30,"30 fps 심장",SIGNAL_DK],[15,"15 fps",MUTED]].forEach(([f,txt,col])=>{
    if(f>=fpsMin&&f<=fpsMax){ ctx.strokeStyle=col; ctx.setLineDash([4,4]); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(L,Yf(f)); ctx.lineTo(L+PW,Yf(f)); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign="right"; label(ctx,txt,L+PW-4,Yf(f)-4,col,8.5,500); ctx.textAlign="left"; }
  });
  /* 곡선 */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.2; ctx.beginPath();
  for(let n=3;n<=20;n+=0.2){ const x=Xn(n),y=Yf(fpsAt(n)); n===3?ctx.moveTo(x,y):ctx.lineTo(x,y); }
  ctx.stroke();
  /* 현재점 */
  ctx.fillStyle=POS; ctx.beginPath(); ctx.arc(Xn(N),Yf(fps),5,0,7); ctx.fill();
  ctx.textAlign="center"; chip(ctx,`${N}펄스 · ${fps.toFixed(0)} fps`,Xn(N),Yf(fps)-12,POS,9.5); ctx.textAlign="left";
  /* 축 */
  for(let n=4;n<=20;n+=4){ ctx.textAlign="center"; label(ctx,`${n}`,Xn(n),sy1+16,MUTED,9,500); ctx.textAlign="left"; }
  label(ctx,"앙상블 길이 (펄스/라인)",L+PW-160,sy1+30,MUTED,9,500);
  ctx.save(); ctx.translate(L-30,(sy0+sy1)/2+30); ctx.rotate(-Math.PI/2);
  label(ctx,"프레임률 (fps)",0,0,MUTED,9,500); ctx.restore();
  chip(ctx,`라인 ${lines}개 · PRP ${(PRP*1e6).toFixed(0)}µs`,L+8,sy0+16,INK2,9);
});
enS.oninput = bxS.oninput = frame.redraw;
