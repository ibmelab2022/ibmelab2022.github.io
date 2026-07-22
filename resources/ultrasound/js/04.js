/* ═══ 04 초음파 반사 · 애니메이션 ═══
   두 애니메이션 모두 core.js 의 mirror() — 거울상법 — 를 씁니다. */

/* ★ core.js 버전 가드 — 이 검사만은 core.js 에 의존하면 안 됩니다.
   옛 core.js 면 makeCW 가 없어 스크립트가 조용히 죽고 캔버스가 빕니다.
   그래서 여기서 직접 캔버스에 안내를 찍습니다. */
if (typeof makeCW !== "function") {
  document.querySelectorAll("canvas").forEach(c => {
    const g = c.getContext("2d"); if (!g) return;
    g.fillStyle = "#FFF5F7"; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = "#B3123C"; g.lineWidth = 2; g.strokeRect(1, 1, c.width-2, c.height-2);
    g.fillStyle = "#B3123C"; g.font = "700 17px system-ui,sans-serif";
    g.fillText("assets/core.js 가 옛 버전입니다", 24, 44);
    g.fillStyle = "#2b3d50"; g.font = "400 14px system-ui,sans-serif";
    g.fillText("① 최신 assets/core.js 로 덮어쓰기", 24, 76);
    g.fillText("② 브라우저에서 Ctrl+Shift+R (맥: Cmd+Shift+R) 로 강력 새로고침", 24, 100);
    g.fillStyle = "#5b6b7b"; g.font = "400 13px system-ui,sans-serif";
    g.fillText("_check.html 을 열면 무엇이 빠졌는지 알려줍니다.", 24, 128);
  });
  throw new Error("core.js 가 옛 버전입니다 (makeCW 없음)");
}


const LAM = 46, K = 2*Math.PI/LAM, OM = 2.6;

/* ── 히어로: 점 음원의 구면파 반사 ── */
const syS=document.getElementById("sy"), tlS=document.getElementById("tl"), ghB=document.getElementById("gh");
const F1 = makeCW(3);
let ghost = true;

const hero = makeScene("c1", 360, (ctx,W,H,t)=>{
  const th=(+tlS.value)*Math.PI/180;
  document.getElementById("tlv").textContent = tlS.value+"°";
  const nx=Math.cos(th), ny=Math.sin(th);
  const p0x=W*0.66, p0y=H/2;
  const sx=W*0.22, sy=H/2+(+syS.value)*0.85;
  const [vx,vy] = mirror(sx,sy,p0x,p0y,nx,ny);     /* ← 거울상 음원 S′ */

  /* 음장 = 실제 음원 + 거울상 음원.  이것이 정확해입니다. */
  ctx.imageSmoothingEnabled=true;
  ctx.drawImage(F1.frame(W,H, OM*t, `${syS.value},${tlS.value}`, (x,y)=>{
    if(nx*(x-p0x)+ny*(y-p0y) > 0) return null;     /* 경계면 너머 */
    const r=Math.hypot(x-sx,y-sy), r2=Math.hypot(x-vx,y-vy);
    const a1=5.2/Math.sqrt(Math.max(r,9)), a2=5.2/Math.sqrt(Math.max(r2,9));
    return [ a1*Math.sin(K*r) + a2*Math.sin(K*r2),
             a1*Math.cos(K*r) + a2*Math.cos(K*r2) ];
  }),0,0,W,H);

  const L=1400;
  if(ghost){
    ctx.save(); ctx.beginPath();
    ctx.moveTo(p0x-ny*L,p0y+nx*L); ctx.lineTo(p0x+ny*L,p0y-nx*L);
    ctx.lineTo(p0x+ny*L+nx*L,p0y-nx*L+ny*L); ctx.lineTo(p0x-ny*L+nx*L,p0y+nx*L+ny*L);
    ctx.closePath(); ctx.clip();
    ctx.setLineDash([3,4]); ctx.lineWidth=1.3; ctx.strokeStyle="rgba(179,18,60,.42)";
    const base=(((OM*t)/K)%LAM+LAM)%LAM;
    for(let n=0;n<46;n++){
      const rr=base+n*LAM; if(rr<6) continue; if(rr>W+H) break;
      ctx.beginPath(); ctx.arc(vx,vy,rr,0,7); ctx.stroke();
    }
    ctx.restore(); ctx.setLineDash([]);
  }
  ctx.strokeStyle=AMBER; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(p0x-ny*L,p0y+nx*L); ctx.lineTo(p0x+ny*L,p0y-nx*L); ctx.stroke();

  ctx.strokeStyle="rgba(14,22,38,.5)"; ctx.setLineDash([4,4]); ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(vx,vy); ctx.stroke(); ctx.setLineDash([]);
  const fx=(sx+vx)/2, fy=(sy+vy)/2;
  [[sx,sy,fx,fy],[fx,fy,vx,vy]].forEach(([ax,ay,bx,by])=>{
    const mx=(ax+bx)/2, my=(ay+by)/2;
    ctx.strokeStyle=INK; ctx.lineWidth=1.8;
    ctx.beginPath();
    ctx.moveTo(mx-4*ny-3*nx,my+4*nx-3*ny); ctx.lineTo(mx+4*ny-3*nx,my-4*nx-3*ny);
    ctx.moveTo(mx-4*ny+3*nx,my+4*nx+3*ny); ctx.lineTo(mx+4*ny+3*nx,my-4*nx+3*ny); ctx.stroke();
  });
  ctx.textAlign="center"; chip(ctx,"같은 거리",fx,fy-9,INK,9.5); ctx.textAlign="left";

  ctx.beginPath(); ctx.arc(sx,sy,6.5,0,7); ctx.fillStyle=INK; ctx.fill();
  ctx.strokeStyle=CARD; ctx.lineWidth=1.6; ctx.stroke();
  chip(ctx,"S · 음원",sx-18,sy-13,INK,11);

  if(ghost){
    ctx.setLineDash([3,3]); ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(vx,vy,6.5,0,7); ctx.strokeStyle=POS; ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle="rgba(179,18,60,.22)"; ctx.fill();
    const lbl="S′ · 거울상 음원";
    chip(ctx,lbl,Math.min(vx-24,W-118),vy-13,POS,11);
  }
  chip(ctx,"경계면 INTERFACE",8,17,AMBER_DK,10);
  chip(ctx,"반사파 = S′ 를 중심으로 한 동심원",8,H-10,MUTED,9.5,400);
}, {play:"play", state:"hstate", speed:0.034, tStill:4.2});

syS.oninput = tlS.oninput = hero.redraw;
ghB.onclick = ()=>{ ghost=!ghost; ghB.classList.toggle("on",ghost);
  ghB.textContent = ghost?"보이는 중":"숨김"; hero.redraw(); };

/* ── 평면파 반사:  θᵣ = θᵢ ── */
const angS = document.getElementById("ang");
const F2 = makeCW(3);
const pw = makeScene("c2", 340, (ctx,W,H,t)=>{
  const a=(+angS.value)*Math.PI/180;
  ["angv"].forEach(id=>document.getElementById(id).textContent=angS.value+"°");
  document.getElementById("tiv").textContent=angS.value;
  document.getElementById("trv").textContent=angS.value;
  const xi=W*0.68, cy=H/2, dx=Math.cos(a), dy=Math.sin(a);

  /* 반사파 = 입사파를 거울점 (2xi−x) 에서 평가한 것 */
  ctx.imageSmoothingEnabled=true;
  ctx.drawImage(F2.frame(W,H, OM*t, `${angS.value}`, (x,y)=>{
    if(x>xi) return null;
    const p1=K*(x*dx+y*dy), p2=K*((2*xi-x)*dx+y*dy);
    return [ 0.62*(Math.sin(p1)+Math.sin(p2)), 0.62*(Math.cos(p1)+Math.cos(p2)) ];
  }),0,0,W,H);

  ctx.strokeStyle=AMBER; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(xi,4); ctx.lineTo(xi,H-4); ctx.stroke();
  ctx.strokeStyle="rgba(110,125,147,.65)"; ctx.setLineDash([4,4]); ctx.lineWidth=1.2;
  ctx.beginPath(); ctx.moveTo(xi-330,cy); ctx.lineTo(xi+16,cy); ctx.stroke(); ctx.setLineDash([]);
  chip(ctx,"법선 NORMAL",xi-326,cy-6,MUTED,9,400);

  const len=Math.min(240,W*0.30);
  const sx=xi-len*dx, sy=cy-len*dy, rx=xi-len*dx, ry=cy+len*dy;
  ctx.strokeStyle=AMBER; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.arc(xi,cy,52,Math.PI,Math.PI+a); ctx.stroke();
  ctx.beginPath(); ctx.arc(xi,cy,64,Math.PI-a,Math.PI); ctx.stroke();
  chip(ctx,"θᵢ",xi-70,cy-22*Math.sin(a/2)-2,AMBER_DK,11);
  chip(ctx,"θᵣ",xi-82,cy+22*Math.sin(a/2)+9,AMBER_DK,11);

  ray(ctx,sx,sy,xi,cy,INK,3);
  ray(ctx,xi,cy,rx,ry,POS,3);
  chip(ctx,"입사 INCIDENT",sx-4,sy-26,INK,11);
  chip(ctx,"반사 REFLECTED",rx+34,ry+6,POS,11);
  ctx.save(); ctx.translate(sx,sy); ctx.rotate(a);
  ctx.fillStyle=INK; ctx.fillRect(-11,-20,12,40); ctx.restore();

  const hit=Math.abs(ry-sy)<36, rc=document.getElementById("rcv");
  rc.textContent = hit?"수신됨":"빗나감";
  rc.style.color  = hit?"var(--pos)":"var(--muted)";
  ctx.fillStyle = hit?"rgba(179,18,60,.12)":"rgba(110,125,147,.16)";
  ctx.fillRect(8,H-36,hit?214:246,25);
  label(ctx, hit?"에코가 탐촉자로 귀환 — 밝게 보임":"에코가 탐촉자를 비껴감 — 구조가 사라짐",
        17,H-19, hit?POS:INK2,10.5);
  chip(ctx,"경계면",xi-46,16,AMBER_DK,10);
}, {play:"play2", state:"hstate2", speed:0.034, tStill:3});
angS.oninput = pw.redraw;
