/* ═══ 11 배열 탐촉자 · 애니메이션 ═══ */

/* ── 히어로: 배열 종류와 스캔 형상 ── */
const typS = document.getElementById("typ");
const TYPES = [
  {ko:"선형 배열",  n:128, ap:32, pitch:"< 1 λ",   use:"복부·혈관",  shape:"직사각형"},
  {ko:"위상 배열",  n:64,  ap:64, pitch:"< λ/2",   use:"심장",       shape:"부채꼴"},
  {ko:"볼록 배열",  n:128, ap:32, pitch:"< 1 λ",   use:"복부 광범위", shape:"부채꼴"},
  {ko:"환형 배열",  n:8,   ap:8,  pitch:"—",       use:"고정밀 집속", shape:"축 위 한 줄"},
];

const hero = makeScene("c1", 340, (ctx,W,H,t)=>{
  const k = +typS.value, T = TYPES[k];
  document.getElementById("nall").textContent = k===3 ? "8 고리" : T.n;
  document.getElementById("nap").textContent  = k===3 ? "8 고리" : `${T.ap} 소자`;
  document.getElementById("pit").textContent  = T.pitch;
  document.getElementById("use").textContent  = T.use;
  const sh=document.getElementById("shape");
  sh.textContent = `${T.ko} · ${T.shape} 스캔`; sh.style.color = SIGNAL_DK;

  const cx = W/2, top = 44;

  if(k===3){
    /* ── 환형: 위에서 본 고리 + 옆에서 본 집속 빔 ── */
    const ox = W*0.24, oy = H*0.52, RR = Math.min(96, H*0.30);
    for(let i=8;i>=1;i--){
      ctx.beginPath(); ctx.arc(ox,oy,RR*Math.sqrt(i/8),0,7);
      ctx.fillStyle = i%2 ? "rgba(23,192,201,.5)" : "rgba(23,192,201,.24)";
      ctx.fill(); ctx.strokeStyle=CARD; ctx.lineWidth=1.6; ctx.stroke();
    }
    ctx.textAlign="center"; chip(ctx,"위에서 본 모습",ox,oy+RR+22,MUTED,10,400);
    chip(ctx,"고리마다 면적이 같음 → 임피던스도 같음",ox,oy-RR-14,INK,10); ctx.textAlign="left";

    /* 옆에서 본 집속 */
    const bx=W*0.60, by=H*0.5, fl=Math.min(150,W*0.20);
    ctx.fillStyle=INK; ctx.fillRect(bx,by-46,8,92);
    const foc = bx+fl+30*Math.sin(t*0.5);      /* 초점 깊이가 전자적으로 움직임 */
    ctx.fillStyle="rgba(23,192,201,.16)";
    ctx.beginPath(); ctx.moveTo(bx+8,by-46); ctx.lineTo(foc,by-3); ctx.lineTo(foc,by+3);
    ctx.lineTo(bx+8,by+46); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(foc,by-3); ctx.lineTo(W-14,by-34); ctx.lineTo(W-14,by+34);
    ctx.lineTo(foc,by+3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(foc,by,5,0,7); ctx.fillStyle=AMBER; ctx.fill();
    ctx.textAlign="center"; chip(ctx,"초점 깊이 전자 조절",foc,by-16,AMBER_DK,10); ctx.textAlign="left";
    chip(ctx,"옆에서 본 빔",bx,by+64,MUTED,10,400);
    chip(ctx,"조향은 안 됨 → 기계적으로 움직여야 함",bx,H-14,MUTED,10,400);
    return;
  }

  /* ── 선형 / 위상 / 볼록 ── */
  const N=T.n, AP=T.ap;
  let pos=[];                                   /* 각 소자의 위치·법선 */
  if(k===2){                                    /* 볼록 */
    const R=Math.min(300,W*0.5), arc=Math.PI*0.44, oy=top-R+92;
    for(let i=0;i<N;i++){
      const a=-arc/2+arc*i/(N-1);
      pos.push({x:cx+R*Math.sin(a), y:oy+R*Math.cos(a), nx:Math.sin(a), ny:Math.cos(a)});
    }
  } else {
    const wd=Math.min(W-56, 640);
    for(let i=0;i<N;i++) pos.push({x:cx-wd/2+wd*i/(N-1), y:top, nx:0, ny:1});
  }

  /* 활성 개구 / 조향각 */
  let a0=0, steer=0;
  if(k===1){ steer = Math.sin(t*0.42)*0.60; }            /* 위상: 전 소자, 빔이 흔들림 */
  else { a0 = Math.round((0.5+0.5*Math.sin(t*0.34))*(N-AP)); }  /* 선형·볼록: 개구가 미끄러짐 */

  /* 스캔 영역 */
  const DEP=Math.min(224,H-top-52);
  ctx.fillStyle="rgba(23,192,201,.09)";
  if(k===1){
    const p=pos[Math.floor(N/2)];
    ctx.beginPath(); ctx.moveTo(pos[0].x,top); ctx.lineTo(pos[N-1].x,top);
    ctx.lineTo(p.x+DEP*Math.sin(0.62), top+DEP*Math.cos(0.62));
    ctx.lineTo(p.x-DEP*Math.sin(0.62), top+DEP*Math.cos(0.62));
    ctx.closePath(); ctx.fill();
  } else if(k===2){
    ctx.beginPath();
    pos.forEach((p,i)=> i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    for(let i=N-1;i>=0;i--) ctx.lineTo(pos[i].x+pos[i].nx*DEP, pos[i].y+pos[i].ny*DEP);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.fillRect(pos[0].x, top, pos[N-1].x-pos[0].x, DEP);
  }

  /* 소자 */
  const ew=Math.max(2,(pos[1].x-pos[0].x)*0.72);
  pos.forEach((p,i)=>{
    const on = k===1 ? true : (i>=a0 && i<a0+AP);
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(Math.atan2(p.nx,p.ny));
    ctx.fillStyle = on ? SIGNAL : "rgba(91,107,123,.42)";
    ctx.fillRect(-ew/2,-9,ew,18); ctx.restore();
  });

  /* 빔 */
  if(k===1){
    const p=pos[Math.floor(N/2)];
    const bx=p.x+DEP*Math.sin(steer), by=top+DEP*Math.cos(steer);
    ctx.strokeStyle=AMBER; ctx.lineWidth=3.5; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(p.x,top); ctx.lineTo(bx,by); ctx.stroke();
    ctx.textAlign="center";
    chip(ctx,`조향 ${(steer*180/Math.PI).toFixed(0)}°`, bx, by+18, AMBER_DK, 10.5);
    ctx.textAlign="left";
    /* 지연 프로파일 */
    ctx.strokeStyle=POS; ctx.lineWidth=1.6; ctx.beginPath();
    pos.forEach((p2,i)=>{ const d=(p2.x-cx)*Math.sin(steer);
      const y=top-16-d*0.10; i?ctx.lineTo(p2.x,y):ctx.moveTo(p2.x,y); });
    ctx.stroke();
    chip(ctx,"소자별 송신 지연", pos[0].x, top-26, POS, 10);
  } else {
    const c=pos[a0+Math.floor(AP/2)];
    ctx.strokeStyle=AMBER; ctx.lineWidth=3.5; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(c.x+c.nx*DEP, c.y+c.ny*DEP); ctx.stroke();
    const l=pos[a0], r=pos[Math.min(N-1,a0+AP-1)];
    ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(l.x-ew,top-15); ctx.lineTo(r.x+ew,top-15);
    ctx.moveTo(l.x-ew,top-19); ctx.lineTo(l.x-ew,top-11);
    ctx.moveTo(r.x+ew,top-19); ctx.lineTo(r.x+ew,top-11); ctx.stroke();
    ctx.textAlign="center";
    chip(ctx,`활성 개구 ${AP} 소자 — 미끄러짐`,(l.x+r.x)/2,top-24,SIGNAL_DK,10.5);
    ctx.textAlign="left";
  }
  chip(ctx,`${T.ko} · 전체 ${N} 소자 · 피치 ${T.pitch}`, 10, 20, INK, 11.5);
  chip(ctx,`${T.shape} 스캔`, 10, H-14, MUTED, 10.5, 400);
}, {play:"play", speed:0.026, tStill:2.6});
typS.onchange = hero.redraw;

/* ══════════════════════════════════════════════════════════
   03절 · 완전 행렬 vs Row-Column · 구조 비교
   등각 투영(isometric)으로 '전극이 어떻게 붙어 있는가' 를 보여줍니다.
     완전 행렬 : 소자마다 따로 배선          → M × N
     RCA       : 앞면에 열 띠, 뒷면에 행 띠  → M + N
   RCA 의 요점은 '소자가 적다'가 아니라 '같은 판을 양면에서 직교로 나눠 부른다' 입니다.
   ══════════════════════════════════════════════════════════ */
const nnS = document.getElementById("nn");
const G = 8;                       /* 그림에 그릴 격자 (실제 N 은 숫자로 표시) */
const AX = 15, AY = 7.6, AZ = 30;  /* 등각 투영 계수 */
let MT = 0;                        /* ★ 두 패널이 공유하는 시간 */

function iso(u, v, w, ox, oy){ return [ox + (u-v)*AX, oy + (u+v)*AY - w*AZ]; }

/* (u,v) 칸을 높이 w 에 그리기.  du,dv 로 띠(strip)도 그림 */
function tile(ctx, u, v, du, dv, w, ox, oy, fill, stroke, lw){
  const p = [iso(u,v,w,ox,oy), iso(u+du,v,w,ox,oy), iso(u+du,v+dv,w,ox,oy), iso(u,v+dv,w,ox,oy)];
  ctx.beginPath(); ctx.moveTo(p[0][0],p[0][1]);
  for(let i=1;i<4;i++) ctx.lineTo(p[i][0],p[i][1]);
  ctx.closePath();
  if(fill){ ctx.fillStyle=fill; ctx.fill(); }
  if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=lw||1; ctx.stroke(); }
  return p;
}

/* ★ 지금 짚고 있는 소자 — 두 패널이 '같은 순서로 같은 소자'를 짚습니다.
   그래야 "같은 일을 하는데 배선만 다르다" 는 비교가 성립합니다. */
const cell = () => {
  const idx = Math.floor(MT*1.1) % (G*G);
  return [Math.floor(idx/G), idx % G];      /* [u, v] = [열, 행] */
};

function updNums(){
  const N=+nnS.value, full=N*N, red=2*N;
  document.getElementById("nnv").textContent=N;
  document.getElementById("nnv2").textContent=N;
  document.getElementById("chf").textContent=full.toLocaleString();
  document.getElementById("chr").textContent=red;
  document.getElementById("red").textContent=(full/red).toFixed(0);
  document.getElementById("apw").textContent=(N*0.154).toFixed(1);
  const [u,v]=cell();
  const st=document.getElementById("rcstat");
  st.textContent=`지금 짚는 소자 (${u+1}, ${v+1}) — 왼쪽은 배선 1가닥, 오른쪽은 2가닥으로`;
  st.style.color=AMBER_DK;
}

/* ══ ① 완전 행렬 ══ */
const scM = makeScene("cM", 330, (ctx,W,H)=>{
  FS *= 1.45;
  updNums();
  const N=+nnS.value, [su,sv]=cell();
  const ox=W*0.52, oy=92, bx=ox, by=H-46;

  /* 배선 — 소자마다 한 가닥. 지금 쓰는 가닥만 밝게. */
  for(let u=0;u<G;u++) for(let v=0;v<G;v++){
    const p=iso(u+0.43,v+0.43,0,ox,oy);
    const on = (u===su && v===sv);
    ctx.strokeStyle = on ? AMBER : "rgba(179,18,60,.16)";
    ctx.lineWidth = on ? 2.2 : 0.7;
    ctx.beginPath(); ctx.moveTo(p[0],p[1]); ctx.lineTo(bx,by); ctx.stroke();
  }
  /* 소자 타일 (뒤→앞) */
  for(let s=0;s<2*G-1;s++){
    for(let u=0;u<G;u++){
      const v=s-u; if(v<0||v>=G) continue;
      const on = (u===su && v===sv);
      tile(ctx,u,v,0.86,0.86,0, ox,oy, on?"rgba(240,165,0,.95)":"rgba(179,18,60,.50)", CARD, 1);
    }
  }
  ctx.fillStyle=POS; ctx.fillRect(bx-30,by,60,9);
  ctx.textAlign="center";
  chip(ctx,`${(N*N).toLocaleString()} 가닥`, bx, by+24, POS, 13.5);
  chip(ctx,"소자마다 배선 하나", ox, 22, POS, 13.5);
  const pc=iso(su+0.43,sv+0.43,0,ox,oy);
  chip(ctx,`(${su+1}, ${sv+1})`, pc[0], pc[1]-14, AMBER_DK, 12.5);
  ctx.textAlign="left";
  chip(ctx,`그림은 ${G}×${G} 로 축약`, 8, H-10, MUTED, 12, 400);
});

/* ══ ② Row-Column ══ */
const scR = makeScene("cR", 330, (ctx,W,H)=>{
  FS *= 1.45;
  const N=+nnS.value, [su,sv]=cell();        /* ★ 왼쪽과 똑같은 소자 */
  const ox=W*0.52, oy=104;

  /* 1) 뒷면 = 행 띠 (아래층).  지금 쓰는 행만 밝게. */
  for(let v=G-1;v>=0;v--){
    const on = v===sv;
    tile(ctx, 0, v+0.08, G, 0.84, -1, ox,oy,
         on?"rgba(23,192,201,.85)":"rgba(23,192,201,.20)", on?SIGNAL_DK:"rgba(23,192,201,.42)", on?1.8:0.8);
  }
  /* 2) 압전판 */
  tile(ctx, 0,0,G,G, 0, ox,oy, "rgba(43,61,80,.12)", INK2, 1.2);
  /* 교차점 = 지금 정해지는 소자 */
  tile(ctx, su+0.08, sv+0.08, 0.84,0.84, 0, ox,oy, "rgba(240,165,0,.95)", AMBER_DK, 1.6);
  /* 3) 앞면 = 열 띠 (위층).  지금 쓰는 열만 밝게. */
  for(let u=G-1;u>=0;u--){
    const on = u===su;
    tile(ctx, u+0.08, 0, 0.84, G, 1, ox,oy,
         on?"rgba(179,18,60,.80)":"rgba(179,18,60,.16)", on?POS:"rgba(179,18,60,.38)", on?1.8:0.8);
  }
  /* 배선 : 행 N + 열 N.  쓰는 두 가닥만 밝게. */
  for(let v=0;v<G;v++){
    const p=iso(-0.3,v+0.5,-1,ox,oy), on=v===sv;
    ctx.strokeStyle = on ? AMBER : "rgba(23,192,201,.45)";
    ctx.lineWidth = on ? 2.4 : 1.0;
    ctx.beginPath(); ctx.moveTo(p[0],p[1]); ctx.lineTo(p[0]-20,p[1]+10); ctx.stroke();
  }
  for(let u=0;u<G;u++){
    const p=iso(u+0.5,-0.3,1,ox,oy), on=u===su;
    ctx.strokeStyle = on ? AMBER : "rgba(179,18,60,.45)";
    ctx.lineWidth = on ? 2.4 : 1.0;
    ctx.beginPath(); ctx.moveTo(p[0],p[1]); ctx.lineTo(p[0]+20,p[1]-10); ctx.stroke();
  }

  const pT=iso(su+0.5,-0.4,1,ox,oy);
  ctx.textAlign="left";
  chip(ctx,`앞면 · 열 ${su+1}`, Math.min(pT[0]+22, W-90), pT[1]-10, POS, 12.5);
  const pB=iso(-0.4,sv+0.5,-1,ox,oy);
  ctx.textAlign="right";
  chip(ctx,`뒷면 · 행 ${sv+1}`, Math.max(pB[0]-20, 82), pB[1]+14, SIGNAL_DK, 12.5);
  ctx.textAlign="center";
  const pC=iso(su+0.5,sv+0.5,0,ox,oy);
  chip(ctx,`(${su+1}, ${sv+1}) = 겹치는 자리`, pC[0], pC[1]+36, AMBER_DK, 12.5);
  chip(ctx,`행 ${N} + 열 ${N} = ${2*N} 가닥`, ox, 22, SIGNAL_DK, 13.5);
  ctx.textAlign="left";
  chip(ctx,`그림은 ${G}×${G} 로 축약`, 8, H-10, MUTED, 12, 400);
});

/* ★ 두 패널을 하나의 루프로 함께 돌립니다.
   makeScene 의 redraw() 는 't 를 올리지 않으므로' 시간은 여기서 관리합니다. */
(function(){
  let run = !REDUCE;
  const btn = document.getElementById("play2");
  const lbl = ()=>{ btn.textContent = run ? "일시정지" : "재생"; };
  btn.onclick = ()=>{ run=!run; lbl(); if(run) loop(); };
  function loop(){ if(!run) return; MT += 0.026; scM.redraw(); scR.redraw(); requestAnimationFrame(loop); }
  lbl();
  nnS.oninput = ()=>{ scM.redraw(); scR.redraw(); };
  if(run) loop(); else { MT = 12; scM.redraw(); scR.redraw(); }
})();
