/* ═══ 08 초음파의 응용 · 주파수 지도 ═══
   λ = c/f  (02장)  ·  침투 = 60dB / (2·α₀·f)  (03·07장)
   두 곡선이 반대로 가는 것 — 그것이 이 장의 전부입니다. */
const C = 1540, A0 = 0.5, BUDGET = 60;
const lamMM  = f => C/(f*1e6)*1e3;
const depthCM = f => BUDGET/(2*A0*f);

const APP = [
  {ko:"HIFU",     en:"HIFU",        lo:0.5, hi:3,  m:"연부조직", need:"깊은 표적 · 영상 아님", nd:null},
  {ko:"심혈관",   en:"cardiac",     lo:2.5, hi:3.5,m:"연부조직", need:"심장 ~15 cm",  nd:15},
  {ko:"복부",     en:"abdominal",   lo:3.5, hi:5,  m:"연부조직", need:"간·신장 ~14 cm", nd:14},
  {ko:"말초혈관", en:"peripheral",  lo:5,   hi:10, m:"연부조직", need:"경동맥 등 ~5 cm", nd:5},
  {ko:"소기관",   en:"small organ", lo:5,   hi:12, m:"연부조직", need:"갑상선·유방 ~4 cm", nd:4},
  {ko:"IVUS",     en:"intravasc.",  lo:10,  hi:50, m:"혈액",     need:"혈관 내 ~수 mm · 매질은 혈액", nd:0.5},
  {ko:"안과",     en:"ophthalmic",  lo:15,  hi:50, m:"물",       need:"안구 ~2.5 cm · 매질은 유리체(≈물)", nd:2.5},
  {ko:"피부",     en:"dermatologic",lo:15,  hi:50, m:"연부조직", need:"피부 ~수 mm", nd:0.4},
];

/* 표 채우기 — 숫자를 손으로 적지 않고 위 식으로 계산합니다.
   침투는 그 응용이 실제로 통과하는 매질의 감쇠로 계산합니다.
   눈(유리체)과 혈관(혈액)은 연부조직보다 감쇠가 훨씬 낮습니다. */
const tb=document.getElementById("apptab");
APP.forEach(a=>{
  const fm=(a.lo+a.hi)/2, L=lamMM(fm);
  const mm=med(a.m), aa=alphaAt(mm,fm), d=BUDGET/(2*aa);
  const ok = a.nd===null ? "" : (d>=a.nd ? ' <b style="color:var(--signal-deep)">✓</b>' : "");
  tb.insertAdjacentHTML("beforeend",
    `<tr${a.ko==="복부"?' class="hi"':''}>`+
    `<td class="m">${a.ko}<span>${a.en}</span></td>`+
    `<td class="n">${a.lo} ~ ${a.hi} MHz</td>`+
    `<td class="n">${L<0.1?(L*1e3).toFixed(0)+" µm":L.toFixed(3)+" mm"}</td>`+
    `<td class="n">${d<1?(d*10).toFixed(0)+" mm":d.toFixed(1)+" cm"}${ok}</td>`+
    `<td>${a.need}</td></tr>`);
});

const frqS=document.getElementById("frq");
let hitBoxes=[];
const s = makeScene("c1", 400, (ctx,W,H)=>{
  const f=+frqS.value;
  const L=54, R=54, PW=W-L-R, T=112, B=H-40, PH=B-T;
  const FLO=0.5, FHI=50;
  const X = ff => L + (Math.log10(ff)-Math.log10(FLO))/(Math.log10(FHI)-Math.log10(FLO))*PW;

  document.getElementById("frqv").textContent=f.toFixed(1);
  document.getElementById("fv").textContent=f.toFixed(1);
  const lam=lamMM(f), dep=depthCM(f);
  const lEl=document.getElementById("lv"), luEl=document.getElementById("lu");
  if(lam<0.1){ lEl.textContent=(lam*1e3).toFixed(0); luEl.textContent="µm"; }
  else { lEl.textContent=lam.toFixed(3); luEl.textContent="mm"; }
  document.getElementById("av").textContent=(A0*f).toFixed(1);
  const dEl=document.getElementById("dv"), duEl=document.getElementById("du");
  if(dep<1){ dEl.textContent=(dep*10).toFixed(0); duEl.textContent="mm"; }
  else { dEl.textContent=dep.toFixed(1); duEl.textContent="cm"; }

  /* ── 상단: 응용 막대 ── */
  hitBoxes=[];
  const bh=10, by=26;
  APP.forEach((a,i)=>{
    const x1=X(a.lo), x2=X(a.hi), y=by+i*(bh+0.6);
    const on = f>=a.lo && f<=a.hi;
    ctx.fillStyle = on ? AMBER : "rgba(46,61,84,.17)";
    ctx.fillRect(x1,y,x2-x1,bh);
    label(ctx,a.ko, x2+6, y+8.5, on?AMBER_DK:MUTED, 11, on?700:400);
    hitBoxes.push({x1,y1:y,x2,y2:y+bh,a});
    if(on) document.getElementById("pick").textContent=`${a.ko} · ${a.en}`;
  });
  label(ctx,"응용별 사용 주파수",8,20,INK,12.5);

  /* ── 곡선 영역 ── */
  ctx.strokeStyle=WELL2; ctx.lineWidth=1;
  [1,2,5,10,20,50].forEach(ff=>{ ctx.beginPath(); ctx.moveTo(X(ff),T); ctx.lineTo(X(ff),B); ctx.stroke(); });
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  [0.5,1,2,5,10,20,50].forEach(ff=>{
    ctx.beginPath(); ctx.moveTo(X(ff),B); ctx.lineTo(X(ff),B+6); ctx.stroke();
    ctx.textAlign="center"; label(ctx,`${ff}`,X(ff),B+18,INK,11); ctx.textAlign="left";
  });
  ctx.textAlign="center"; label(ctx,"주파수 (MHz) · 로그 축",(2*L+PW)/2,B+34,MUTED,11,400); ctx.textAlign="left";

  /* λ 곡선 (로그 정규화) */
  const lmin=lamMM(FHI), lmax=lamMM(FLO);
  const YL = v => B - (Math.log10(v)-Math.log10(lmin))/(Math.log10(lmax)-Math.log10(lmin))*PH;
  ctx.strokeStyle=NEG; ctx.lineWidth=2.6; ctx.beginPath();
  for(let i=0;i<=300;i++){ const ff=FLO*Math.pow(FHI/FLO,i/300);
    i?ctx.lineTo(X(ff),YL(lamMM(ff))):ctx.moveTo(X(ff),YL(lamMM(ff))); }
  ctx.stroke();
  ctx.textAlign="left"; chip(ctx,"파장 λ",L+8,B-44,NEG,12.5);

  /* 침투 곡선 */
  const dmin=depthCM(FHI), dmax=depthCM(FLO);
  const YD = v => B - (Math.log10(v)-Math.log10(dmin))/(Math.log10(dmax)-Math.log10(dmin))*PH;
  ctx.strokeStyle=POS; ctx.lineWidth=2.6; ctx.beginPath();
  for(let i=0;i<=300;i++){ const ff=FLO*Math.pow(FHI/FLO,i/300);
    i?ctx.lineTo(X(ff),YD(depthCM(ff))):ctx.moveTo(X(ff),YD(depthCM(ff))); }
  ctx.stroke();
  ctx.textAlign="left"; chip(ctx,"침투 깊이",L+8,B-24,POS,12.5);

  /* 현재 f 마커 */
  const xf=X(f);
  ctx.strokeStyle=AMBER; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(xf,by-4); ctx.lineTo(xf,B); ctx.stroke();
  [[YL(lam),NEG],[YD(dep),POS]].forEach(([y,c])=>{
    ctx.beginPath(); ctx.arc(xf,y,5,0,7); ctx.fillStyle=c; ctx.fill();
    ctx.strokeStyle=CARD; ctx.lineWidth=2; ctx.stroke();
  });
  ctx.textAlign="center";
  label(ctx, lam<0.1?`${(lam*1e3).toFixed(0)} µm`:`${lam.toFixed(2)} mm`, xf, YL(lam)-10,NEG,12);
  label(ctx, dep<1?`${(dep*10).toFixed(0)} mm`:`${dep.toFixed(1)} cm`, xf, YD(dep)+20,POS,12);
  ctx.textAlign="left";
  ctx.textAlign="left"; chip(ctx,"분해능 ↑",L+8,B-64,MUTED,12,400);
  ctx.textAlign="left"; label(ctx,"깊이 ↑",L+PW-52,T+14,MUTED,12,400);
});
frqS.oninput = s.redraw;

/* 막대 클릭 → 그 응용의 중앙 주파수로 */
const cv=document.getElementById("c1");
cv.style.cursor="pointer";
cv.addEventListener("click", e=>{
  const r=cv.getBoundingClientRect();
  const mx=e.clientX-r.left, my=e.clientY-r.top;
  const hit=hitBoxes.find(b=> mx>=b.x1&&mx<=b.x2&&my>=b.y1&&my<=b.y2);
  if(hit){ frqS.value=((hit.a.lo+hit.a.hi)/2).toFixed(1); s.redraw(); }
});
