/* ═══ 02 초음파 파라미터 · 인터랙티브 ═══ */

/* 히어로에 쓸 매질 (core.js 의 MEDIA 에서 골라옴) */
const M2 = ["지방","물","연부조직","근육","뼈"].map(med);
const WIN_MM = 4.0;                       /* 화면 가로 = 실제 4 mm */

const selM = document.getElementById("med"), frq = document.getElementById("frq");
M2.forEach((m,i)=> selM.insertAdjacentHTML("beforeend",
  `<option value="${i}">${m.ko} · ${m.en} — c=${m.c} m/s</option>`));
selM.value = 2;

const s1 = makeScene("c1", 270, (ctx,W,H)=>{
  const m = M2[+selM.value], f = +frq.value*1e6;
  const lamMM = (m.c/f)*1e3;
  document.getElementById("frqv").textContent = (+frq.value).toFixed(1);
  document.getElementById("cv").textContent = m.c;
  document.getElementById("fv").textContent = (+frq.value).toFixed(1);
  const lEl = document.getElementById("lv"), uEl = document.getElementById("lu");
  if(lamMM<0.1){ lEl.textContent=(lamMM*1e3).toFixed(0); uEl.textContent="µm"; }
  else { lEl.textContent=lamMM.toFixed(3); uEl.textContent="mm"; }

  const PX = W/WIN_MM, lamPX = lamMM*PX, base = H*0.42, amp = H*0.30;
  ctx.fillStyle="rgba(46,61,84,.03)"; ctx.fillRect(0,0,W,base+amp+14);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(0,base); ctx.lineTo(W,base); ctx.stroke(); ctx.setLineDash([]);

  const k = 2*Math.PI/lamPX, pts=[];
  for(let x=0;x<=W;x++) pts.push([x, base-Math.sin(k*x)*amp]);
  fillWave(ctx,W,base,pts);

  const p1=lamPX*0.25, p2=p1+lamPX;
  if(p2<W-6){
    const yB=base+amp+26;
    ctx.strokeStyle=AMBER; ctx.lineWidth=1.6;
    ctx.beginPath();
    ctx.moveTo(p1,base-amp); ctx.lineTo(p1,yB+5);
    ctx.moveTo(p2,base-amp); ctx.lineTo(p2,yB+5);
    ctx.moveTo(p1,yB); ctx.lineTo(p2,yB); ctx.stroke();
    const lbl = lamMM<0.1 ? `λ = ${(lamMM*1e3).toFixed(0)} µm` : `λ = ${lamMM.toFixed(3)} mm`;
    ctx.font="700 12px 'Spline Sans Mono','Noto Sans KR',monospace";
    const tw=ctx.measureText(lbl).width;
    ctx.fillStyle=WELL; ctx.fillRect((p1+p2)/2-tw/2-5,yB-9,tw+10,16);
    ctx.textAlign="center"; label(ctx,lbl,(p1+p2)/2,yB+3,AMBER_DK,12); ctx.textAlign="left";
  }

  const yR=H-30;
  ctx.strokeStyle=INK; ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(0,yR); ctx.lineTo(W,yR); ctx.stroke();
  for(let mm=0; mm<=WIN_MM*10; mm++){
    const x=mm*PX/10; if(x>W) break;
    const maj=mm%10===0, mid=mm%5===0;
    ctx.strokeStyle= maj?INK:MUTED; ctx.lineWidth= maj?1.4:1;
    ctx.beginPath(); ctx.moveTo(x,yR); ctx.lineTo(x,yR+(maj?9:mid?6:3.5)); ctx.stroke();
    if(maj&&mm>0){ ctx.textAlign="center"; label(ctx,`${mm/10} mm`,x,yR+21,INK,10); ctx.textAlign="left"; }
  }
  label(ctx,"실제 거리 REAL DISTANCE",3,yR+21,MUTED,9.5,400);
  label(ctx,`${m.ko}  c=${m.c} m/s   f=${(+frq.value).toFixed(1)} MHz`,8,20,INK,11.5);
  label(ctx,`4 mm 안에 ${(W/lamPX).toFixed(1)} 사이클`,8,36,POS,11.5);
});
selM.onchange = frq.oninput = s1.redraw;

/* ── 파라미터 사슬:  ξ₀ → u₀ → p₀ → I ── */
const xiS=document.getElementById("xi"), f2S=document.getElementById("f2");
const Zst = med("연부조직").Z * 1e6;      /* Pa·s/m */
function updChain(){
  const x0=+xiS.value*1e-9, f=+f2S.value*1e6;
  const u0=2*Math.PI*f*x0, p0=Zst*u0, I=p0*p0/(2*Zst);
  document.getElementById("xiv").textContent=(+xiS.value).toFixed(1);
  document.getElementById("f2v").textContent=(+f2S.value).toFixed(1);
  document.getElementById("n1").textContent=(+xiS.value).toFixed(1);
  document.getElementById("n2").textContent=u0.toFixed(3);
  document.getElementById("n3").textContent=p0>=1e6?(p0/1e6).toFixed(2):Math.round(p0/1e3);
  document.querySelector("#n3").nextElementSibling.textContent=p0>=1e6?"MPa":"kPa";
  document.getElementById("n4").textContent=(I/1e4).toFixed(2);
  document.getElementById("op1").textContent=`× 2π·${(+f2S.value).toFixed(1)}M`;
  const I2=(Zst*2*Math.PI*2*f*x0)**2/(2*Zst);
  document.getElementById("dbl").textContent =
    `지금 f=${(+f2S.value).toFixed(1)} MHz 에서 I=${(I/1e4).toFixed(2)} W/cm².  `+
    `f 를 2배(${(2*f2S.value).toFixed(1)} MHz)로 하면 I=${(I2/1e4).toFixed(2)} W/cm² — 정확히 4배입니다.`;
}
xiS.oninput=f2S.oninput=updChain; updChain();
