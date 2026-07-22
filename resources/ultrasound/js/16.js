/* ═══ 16 영상 기법 · A / B / M / C 예시 ═══
   같은 에코 라인, 배열만 다름. 공유 팬텀 = 맥동하는 혈관 스캔.
   앞·뒷벽이 심박처럼 벌어졌다 좁아짐 → M-Mode 에 궤적이 그려짐. */

function wallN(t){ return 0.36 - 0.045*Math.sin(t*1.5); }   /* 혈관 앞벽 */
function wallF(t){ return 0.56 + 0.045*Math.sin(t*1.5); }   /* 혈관 뒷벽 */
function hh(a,b){ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); }
const cl = v => Math.max(0, Math.min(1, v));
const gz = (z,c,w,a)=> a*Math.exp(-((z-c)*(z-c))/(2*w*w));

/* 깊이 z 에서의 에코 진폭 (A · M 공용) */
function echoZ(z, t){
  let v = 0.10 + 0.055*hh(Math.floor(z*90), 7);
  v += gz(z, 0.10, 0.018, 0.72);              /* 피부·근막 */
  v += gz(z, wallN(t), 0.012, 0.95);          /* 앞벽 */
  v += gz(z, wallF(t), 0.012, 0.90);          /* 뒷벽 */
  if(z>wallN(t)+0.015 && z<wallF(t)-0.015) v *= 0.10;  /* 내강 (무에코) */
  v += gz(z, 0.84, 0.020, 0.55);              /* 깊은 조직 */
  return cl(v);
}
/* B-Mode: 깊이 z · 측방향 x */
function echoZX(z, x, t){
  let v = 0.09 + 0.07*hh(Math.floor(z*105), Math.floor(x*105));
  const bend = 0.012*Math.sin(x*7+1);
  v += gz(z, 0.10+0.006*Math.sin(x*11), 0.018, 0.7);
  v += gz(z, wallN(t)+bend, 0.012, 0.95);
  v += gz(z, wallF(t)+bend, 0.012, 0.90);
  if(z>wallN(t)+bend+0.015 && z<wallF(t)+bend-0.015) v *= 0.10;
  v += gz(z, 0.84, 0.020, 0.55);
  return cl(v);
}
const gray = a => { const g=Math.round(14+236*cl(a)); return `rgb(${g},${g},${g})`; };
const W_=(s)=>`rgba(255,255,255,${s})`;

const hero = makeScene("c1", 500, (ctx,W,H,t)=>{
  const M=16, gx=18, gy=14;
  const cw=(W-2*M-gx)/2, rh=(H-2*M-gy)/2;
  const cells=[[M,M],[M+cw+gx,M],[M,M+rh+gy],[M+cw+gx,M+rh+gy]];
  const titles=["A-Mode","B-Mode","M-Mode","C-Mode"];
  const subs=["진폭 · 탐촉자 고정 · 선 하나 (영상 아님)",
              "밝기 → 2D 해부 · 가로축 = 공간",
              "밝기 → 시간축에 쌓음 · 움직임의 궤적",
              "일정 깊이 정면 단면 en face · C-SAM"];
  const tcol=[POS, SIGNAL_DK, SIGNAL_DK, AMBER_DK];

  const st=document.getElementById("mstat");
  if(st){ st.textContent="넷 다 같은 에코 라인 · 배열만 다름"; st.style.color=SIGNAL_DK; }

  function drawA(ix,iy,iw,ih){
    ctx.strokeStyle=W_(.10); ctx.lineWidth=1;
    for(let d=0.25;d<1;d+=0.25){ ctx.beginPath(); ctx.moveTo(ix,iy+d*ih); ctx.lineTo(ix+iw,iy+d*ih); ctx.stroke(); }
    const p=new Path2D(); p.moveTo(ix,iy);
    for(let j=0;j<=ih;j++){ p.lineTo(ix + echoZ(j/ih,t)*iw*0.94, iy+j); }
    p.lineTo(ix,iy+ih); p.closePath();
    ctx.fillStyle="rgba(23,192,201,.28)"; ctx.fill(p);
    ctx.strokeStyle=SIGNAL; ctx.lineWidth=1.8; ctx.stroke(p);
    const wn=wallN(t);
    ctx.fillStyle=AMBER; ctx.beginPath(); ctx.arc(ix+echoZ(wn,t)*iw*0.94, iy+wn*ih, 3.4,0,7); ctx.fill();
    ctx.textAlign="left"; label(ctx,"깊이 ↓", ix+5, iy+ih-6, W_(.5), 9,400);
    ctx.textAlign="right"; label(ctx,"진폭 →", ix+iw-5, iy+13, W_(.5), 9,400); ctx.textAlign="left";
  }
  function drawB(ix,iy,iw,ih){
    for(let j=0;j<ih;j+=2){ const z=j/ih;
      for(let i=0;i<iw;i+=2){ ctx.fillStyle=gray(echoZX(z,i/iw,t)); ctx.fillRect(ix+i,iy+j,2,2); } }
    ctx.textAlign="center"; label(ctx,"측방향 →", ix+iw/2, iy+ih-6, W_(.55), 9,400); ctx.textAlign="left";
  }
  function drawM(ix,iy,iw,ih){
    const win=11;
    for(let i=0;i<iw;i+=2){ const tt=t-(1-i/iw)*win;
      for(let j=0;j<ih;j+=2){ ctx.fillStyle=gray(echoZ(j/ih,tt)); ctx.fillRect(ix+i,iy+j,2,2); } }
    ray(ctx, ix+iw-54, iy+ih-9, ix+iw-8, iy+ih-9, W_(.6), 1.3);
    ctx.textAlign="right"; label(ctx,"시간", ix+iw-58, iy+ih-6, W_(.55), 9,400); ctx.textAlign="left";
  }
  function drawC(ix,iy,iw,ih){
    /* 한 깊이의 x-y 정면(en face): 위에서 본 혈관 = 가로 원통.
       좌우 끝까지 관통(끝 캡 없음), 밝은 벽 윤곽 + 어두운 내강, 깊이밴드 없음, 정적. */
    const cy0=iy+ih/2, rr=ih*0.15;                     /* 관 반경(y) — 얇게 */
    for(let j=0;j<ih;j+=2){
      const rp=Math.abs((iy+j)-cy0)/rr;                /* rp=1 → 벽 (x 전체) */
      for(let i=0;i<iw;i+=2){
        const sp=0.055*hh(Math.floor((ix+i)*0.5), Math.floor((iy+j)*0.5));
        let v;
        if(rp<0.72) v = 0.05 + 0.35*sp;                /* 내강 — 거의 무에코 */
        else       v = 0.12 + sp + gz(rp,1.0,0.17,0.92);/* 조직 + 벽 */
        ctx.fillStyle=gray(cl(v)); ctx.fillRect(ix+i,iy+j,2,2); } }
    ctx.textAlign="left"; label(ctx,"정면 단면 (x–y) · 위에서 본 혈관", ix+6, iy+14, W_(.55), 9,400);
  }

  for(let c=0;c<4;c++){
    const cx=cells[c][0], cy=cells[c][1];
    chip(ctx, titles[c], cx, cy+2, tcol[c], 11.5);
    const ix=cx, iy=cy+20, iw=cw, ih=rh-38;
    ctx.fillStyle="#0b0f16"; ctx.fillRect(ix,iy,iw,ih);
    ctx.save(); ctx.beginPath(); ctx.rect(ix,iy,iw,ih); ctx.clip();
    if(c===0) drawA(ix,iy,iw,ih); else if(c===1) drawB(ix,iy,iw,ih);
    else if(c===2) drawM(ix,iy,iw,ih); else drawC(ix,iy,iw,ih);
    ctx.restore();
    ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(ix,iy,iw,ih);
    label(ctx, subs[c], cx, cy+rh-8, MUTED, 9.5, 400);
  }
}, {play:"play", speed:0.02, tStill:4});
