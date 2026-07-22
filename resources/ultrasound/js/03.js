/* ═══ 03 매질의 음향 특성 · 인터랙티브 ═══ */

/* 침투 비교에 쓸 매질 (core.js 의 MEDIA 에서 골라옴) */
const M3 = ["물","연부조직","뼈"].map(med);
const WIN_CM = 20;

const frq = document.getElementById("frq");
const s = makeScene("c1", 310, (ctx,W,H)=>{
  const f = +frq.value;
  document.getElementById("frqv").textContent = f.toFixed(1);
  const L=94, R=16, PW=W-L-R, PX=PW/WIN_CM, rowH=68, y0=34;

  M3.forEach((m,i)=>{
    const aOne = alphaAt(m,f), aRT = 2*aOne, d60 = 60/aRT;
    const yT=y0+i*rowH, barH=30, yB=yT+8;
    ctx.fillStyle=INK; ctx.font="700 13px 'Spline Sans','Noto Sans KR',sans-serif";
    ctx.fillText(m.ko,8,yB+13);
    label(ctx,`${aOne.toFixed(aOne<0.1?3:1)} dB/cm`,8,yB+26,MUTED,9,400);
    ctx.fillStyle=WELL2; ctx.fillRect(L,yB,PW,barH);
    for(let px=0;px<PW;px+=2){
      const amp=Math.pow(10,-(aRT*(px/PX))/20);
      if(amp<0.0006) break;
      ctx.fillStyle=`rgba(179,18,60,${amp.toFixed(4)})`;
      ctx.fillRect(L+px,yB,2,barH);
    }
    if(d60<WIN_CM){
      const x=L+d60*PX;
      ctx.strokeStyle=AMBER; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(x,yB-5); ctx.lineTo(x,yB+barH+5); ctx.stroke();
      const lbl = d60<1 ? `${(d60*10).toFixed(1)} mm` : `${d60.toFixed(1)} cm`;
      ctx.font=`700 ${(10*FS).toFixed(1)}px 'Spline Sans Mono','Noto Sans KR',monospace`;
      const tw=ctx.measureText(lbl).width;
      ctx.fillStyle=WELL; ctx.fillRect(x+4,yB+barH/2-8,tw+7,15);
      label(ctx,lbl,x+7,yB+barH/2+3,AMBER_DK,10);
    } else {
      const lbl = d60>100 ? `60 dB 지점 ${(d60/100).toFixed(1)} m — 화면 밖`
                          : `60 dB 지점 ${d60.toFixed(0)} cm — 화면 밖`;
      ctx.font=`700 ${(10*FS).toFixed(1)}px 'Spline Sans Mono','Noto Sans KR',monospace`;
      label(ctx,lbl,L+PW-ctx.measureText(lbl).width-9,yB+barH/2+3,NEG,10);
    }
    ctx.fillStyle=INK; ctx.fillRect(L-7,yB+2,5,barH-4);
  });

  const yR=y0+3*rowH+2;
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,yR); ctx.lineTo(L+PW,yR); ctx.stroke();
  for(let cm=0;cm<=WIN_CM;cm++){
    const x=L+cm*PX, maj=cm%5===0;
    ctx.strokeStyle= maj?INK:MUTED; ctx.lineWidth= maj?1.4:1;
    ctx.beginPath(); ctx.moveTo(x,yR); ctx.lineTo(x,yR+(maj?8:4)); ctx.stroke();
    if(maj){ ctx.textAlign="center"; label(ctx,`${cm}`,x,yR+20,INK,10); ctx.textAlign="left"; }
  }
  label(ctx,"깊이 DEPTH (cm)",L+PW-96,yR+20,MUTED,9.5,400);
  label(ctx,`f = ${f.toFixed(1)} MHz`,8,20,INK,11);
  label(ctx,"에코 세기 (왕복 감쇠)",96,20,MUTED,9.5,400);
});
frq.oninput = s.redraw;
