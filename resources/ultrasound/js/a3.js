/* ═══ A3 부호화 여기와 펄스 압축 · 애니메이션 ═══
   검증: /home/claude/work/a345.js · a345b.js
     · 축방향 = c/2B · 2사이클 펄스 B=2.21MHz → 0.436mm (복소 기저대역 정합필터 수치해)
     · 32사이클 첩(길이 16배) 같은 B → 0.436mm — 완전히 같음
     · TB = T·B = 6.4µs × 2.21MHz = 14.1 → SNR +12.0 dB (에너지비 16 → +12.0, 10log₁₀TB → +11.5)
       ⚠ '사이클 수 = TB' 는 오해 (비대역폭 100% 가정) — +15dB 는 64사이클
     · 사이드로브 rect −14.3 dB / hann −25.7 dB (주엽은 0.436 → 0.885mm)                */
const C = 1540, F0 = 5e6;
let hann = false;

/* ── 복소 기저대역 첩 · 정합필터 (포락선이 바로 나옴) ── */
const SRATE = 60e6, DT = 1/SRATE;
function chirpBB(T, B, useHann){
  const N = Math.max(8, Math.round(T*SRATE));
  const re = new Float64Array(N), im = new Float64Array(N);
  for(let i=0;i<N;i++){
    const t = i*DT, u = t/T;
    const w = useHann ? 0.5-0.5*Math.cos(2*Math.PI*u) : 1;
    const ph = 2*Math.PI*(-B/2*t + B*t*t/(2*T));
    re[i] = w*Math.cos(ph); im[i] = w*Math.sin(ph);
  }
  return {re, im, N};
}
function mfEnvSigned(s, maxLag){
  const N=s.N, L=Math.min(maxLag,N-1), out=new Float64Array(L+1);
  for(let lag=0; lag<=L; lag++){
    let ar=0;
    for(let i=lag;i<N;i++) ar += s.re[i]*s.re[i-lag] + s.im[i]*s.im[i-lag];
    out[lag]=ar;
  }
  return out;
}
function mfEnv(s, maxLag){
  const N = s.N, L = Math.min(maxLag, N-1), out = new Float64Array(L+1);
  for(let lag=0; lag<=L; lag++){
    let ar=0, ai=0;
    for(let i=lag;i<N;i++){
      const j = i-lag;
      ar += s.re[i]*s.re[j] + s.im[i]*s.im[j];
      ai += s.im[i]*s.re[j] - s.re[i]*s.im[j];
    }
    out[lag] = Math.hypot(ar,ai);
  }
  return out;
}
const lag2mm = lag => lag*DT*C/2*1e3;      /* 왕복 → 거리 */

/* ── c1 : 네 부호 한눈에 비교 (송신 구조 → 압축 후) ──
   검증(/tmp/a3verify.py · /tmp/golay.py):
     chirp rect PSL −13.2~−14 dB · Barker-13 PSL −22.3 dB (=20log10 1/13, 존재하는 최장)
     Golay 상보쌍은 부호 있는 자기상관을 합산 → 이론상 완전 상쇄(0), 대역제한 시 ~−34 dB
     네 경우 모두 같은 대역폭 → 압축 후 주엽폭(축방향) 동일. 다른 건 에너지와 사이드로브뿐.  */
const B13 = [1,1,1,1,1,-1,-1,1,1,-1,1,-1,1];
function golayPair(steps){ let A=[1], B=[1];
  for(let s=0;s<steps;s++){ [A,B]=[A.concat(B), A.concat(B.map(x=>-x))]; } return [A,B]; }
const [GA,GB] = golayPair(4);          /* 길이 16 */

const CODES = [
  {ko:"짧은 펄스", en:"short pulse",       type:"pulse",  energy:1,  ntx:1, psl:null},
  {ko:"chirp",    en:"linear FM",         type:"chirp",  energy:16, ntx:1, psl:-13},
  {ko:"Barker-13",en:"biphase",           type:"barker", seq:B13,   energy:13, ntx:1, psl:-22},
  {ko:"Golay",    en:"complementary A+B", type:"golay",  seq:GA, seqB:GB, energy:16, ntx:2, psl:0},
];

/* 압축 후(오른쪽) 스키매틱: 주엽폭은 넷 다 같게, 사이드로브 층만 다르게 */
/* SNR 이득(에너지비) → 여분 침투 깊이 · 왕복 감쇠 5 dB/cm @5MHz (검증) */
const RT_DBCM = 2*(0.5*5);                                    /* 왕복 dB/cm = 5 */
const extraCmOf = energy => 10*Math.log10(energy)/RT_DBCM;   /* 짧은펄스 0 · chirp/Golay 2.4 · Barker 2.2 */
const PEN_MAX = 2.6;                                          /* 침투 막대 눈금 (cm) */

function drawCompressed(ctx, x, y0, w, h, cd){
  const psl=cd.psl;
  const DR=35, pad=9, penH=18, bt=y0+pad, bb=y0+h-pad-penH, cx=x+w*0.5;
  const Y = db => bt + Math.max(0,Math.min(1,-db/DR))*(bb-bt);
  ctx.textAlign="right";
  [0,-20].forEach(d=>{ ctx.strokeStyle=d===0?"rgba(217,224,231,.9)":"rgba(238,243,247,.95)";
    ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,Y(d)); ctx.lineTo(x+w,Y(d)); ctx.stroke();
    label(ctx,`${d}`, x-4, Y(d)+3, MUTED, 8, 400); });
  ctx.strokeStyle=LINE; ctx.strokeRect(x,bt,w,bb-bt);
  const halfW=w*0.075, sc=halfW/1.177;
  const mainDb = mm => 20*Math.log10(Math.exp(-0.5*(mm/sc)*(mm/sc))+1e-9);
  /* 사이드로브 이빨: 첫 로브 = peak, 바깥으로 3.4 dB 씩 감쇠 */
  const sideDb = (mm, peak) => { let v=-99;
    for(let j=2;j<=5;j++){ const p=peak-(j-2)*3.4, ww=halfW*0.6;
      for(const s of [-1,1]){ const c=s*(j+0.4)*halfW, d=(mm-c)/ww;
        v=Math.max(v, p + 20*Math.log10(Math.exp(-0.5*d*d)+1e-9)); } }
    return v; };
  const fillTeeth = (col, peak) => {
    ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(x,Y(-DR));
    for(let px=0;px<=w;px++){ const mm=(x+px)-cx; ctx.lineTo(x+px, Y(Math.max(sideDb(mm,peak),-DR))); }
    ctx.lineTo(x+w,Y(-DR)); ctx.closePath(); ctx.fill();
  };

  if(cd.type==="golay"){
    /* A·B 각자는 −10dB 사이드로브를 가짐 (유령으로 표시) → 합하면 상쇄 */
    const gp=-10;
    fillTeeth("rgba(91,107,123,.20)", gp);
    ctx.strokeStyle="rgba(91,107,123,.6)"; ctx.setLineDash([3,3]); ctx.lineWidth=1.2; ctx.beginPath();
    let f=true; for(let px=0;px<=w;px++){ const mm=(x+px)-cx, sd=sideDb(mm,gp);
      if(sd<-DR+1){ f=true; continue; } const py=Y(sd); f?(ctx.moveTo(x+px,py),f=false):ctx.lineTo(x+px,py); }
    ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign="left"; chip(ctx,"A·B 각자 −10 dB", x+6, Y(gp)-5, MUTED, 8.5);
    /* 합 = 깨끗한 주엽만 */
    ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.4; ctx.beginPath();
    for(let px=0;px<=w;px++){ const mm=(x+px)-cx, py=Y(Math.max(mainDb(mm),-DR));
      px===0?ctx.moveTo(x+px,py):ctx.lineTo(x+px,py); }
    ctx.stroke();
    ctx.textAlign="center"; chip(ctx,"A + B → 부호 반대라 상쇄 → 0 ✓", cx, bb-6, SIGNAL_DK, 9.5);
  } else {
    if(psl!==null && psl<-1){
      fillTeeth("rgba(179,18,60,.36)", psl);
      ctx.strokeStyle="rgba(179,18,60,.5)"; ctx.setLineDash([5,3]); ctx.lineWidth=1.1;
      ctx.beginPath(); ctx.moveTo(x,Y(psl)); ctx.lineTo(x+w,Y(psl)); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.3; ctx.beginPath();
    for(let px=0;px<=w;px++){ const mm=(x+px)-cx;
      let db=mainDb(mm); if(psl!==null && psl<-1) db=Math.max(db, sideDb(mm,psl));
      const py=Y(Math.max(db,-DR)); px===0?ctx.moveTo(x+px,py):ctx.lineTo(x+px,py); }
    ctx.stroke();
    ctx.textAlign="center";
    if(psl===null) chip(ctx,"사이드로브 없음 · 그러나 에너지 1배", cx, bb-6, AMBER_DK, 9.5);
    else           chip(ctx,`사이드로브 ${psl} dB`, cx, Y(psl)-6, POS, 9.5);
  }
  ctx.strokeStyle="rgba(240,165,0,.55)"; ctx.setLineDash([4,3]); ctx.lineWidth=1.1;
  ctx.beginPath(); ctx.moveTo(x,Y(-6)); ctx.lineTo(x+w,Y(-6)); ctx.stroke(); ctx.setLineDash([]);

  /* ── 도달 깊이 막대 (에너지 → 침투) · 네 부호 공통 눈금 ── */
  const pyT = bb+5, penMid = pyT+5;
  const shallow = cd.type==="pulse", extra = extraCmOf(cd.energy), frac = Math.min(1, extra/PEN_MAX);
  ctx.textAlign="left"; label(ctx,"도달 깊이", x, penMid+3, MUTED, 8.5, 400);
  const pbarL = x+56, pbarW = w-56-98;
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(pbarL, pyT, pbarW, 10);
  ctx.fillStyle = shallow ? "rgba(179,18,60,.50)" : "rgba(23,192,201,.60)";
  ctx.fillRect(pbarL, pyT, Math.max(pbarW*frac, 2.5), 10);
  ctx.textAlign="left";
  chip(ctx, shallow ? "기준 · 가장 얕음" : `+${extra.toFixed(1)} cm 깊이`,
       pbarL+pbarW+5, penMid+3, shallow?POS:SIGNAL_DK, 9, 700);
  ctx.textAlign="left";
}

makeScene("c1", 460, (ctx,W,H)=>{
  const padL=14, padR=14, nameW=94, g1=12, g2=18, headTop=20, rowsTop=30;
  const rest=W-padL-padR-nameW-g1-g2;
  const txW=rest*0.54, cpW=rest*0.46;
  const nameX=padL, txX=padL+nameW+g1, cpX=txX+txW+g2;
  const rowH=(H-rowsTop-6)/4;

  ctx.textAlign="left";
  chip(ctx,"송신 신호의 구조", txX, headTop, INK, 10);
  chip(ctx,"정합 필터로 압축한 뒤", cpX, headTop, INK, 10);

  CODES.forEach((cd,ci)=>{
    const y0=rowsTop+ci*rowH, base=y0+rowH*0.5;
    if(ci>0){ ctx.strokeStyle=WELL2; ctx.lineWidth=1; ctx.beginPath();
      ctx.moveTo(padL,y0); ctx.lineTo(W-padR,y0); ctx.stroke(); }

    /* ── 이름 칸 ── */
    ctx.textAlign="left";
    ctx.fillStyle=INK;     ctx.font=`700 ${(12*FS).toFixed(1)}px ${MONO}`; ctx.fillText(cd.ko, nameX, base-4);
    ctx.fillStyle=MUTED;   ctx.font=`400 ${(9.5*FS).toFixed(1)}px ${MONO}`; ctx.fillText(cd.en, nameX, base+11);
    ctx.fillStyle=AMBER_DK;ctx.font=`700 ${(9.5*FS).toFixed(1)}px ${MONO}`; ctx.fillText(`에너지 ${cd.energy}배`, nameX, base+27);
    if(cd.ntx>1){ ctx.fillStyle=POS; ctx.fillText(`송신 ${cd.ntx}회`, nameX, base+41); }

    /* ── TX 상자 ── */
    const pad=10, bt=y0+pad, bb=y0+rowH-pad, amp=(bb-bt)*0.30, tbase=(bt+bb)/2;
    ctx.fillStyle="#fbfcfe"; ctx.fillRect(txX,bt,txW,bb-bt);
    ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(txX,bt,txW,bb-bt);

    if(cd.type==="pulse"){
      const wcyc=Math.min(txW*0.26,44), pts=[];
      for(let px=0;px<=txW;px++){ const t=px/wcyc, v=t<=2?Math.cos(2*Math.PI*t):0;
        pts.push([txX+px, tbase - v*amp]); }
      fillWave(ctx,W,tbase,pts);
      ctx.textAlign="left"; chip(ctx,"정진폭 2 사이클", txX+6, bt+13, MUTED, 9, 400);
    }
    else if(cd.type==="chirp"){
      const nvis=9, flo=0.6, fhi=2.7, pts=[];
      for(let px=0;px<=txW;px++){ const u=px/txW;
        const ph=2*Math.PI*(flo*u+(fhi-flo)*u*u/2)*nvis;
        pts.push([txX+px, tbase - Math.cos(ph)*amp]); }
      fillWave(ctx,W,tbase,pts);
      ctx.strokeStyle=AMBER_DK; ray(ctx, txX+txW*0.12, bb-9, txX+txW*0.9, bb-9, AMBER_DK, 2);
      ctx.textAlign="left"; chip(ctx,"주파수 낮음 → 높음", txX+6, bt+13, AMBER_DK, 9.5);
    }
    else {
      const strip=(arr,sy,sh)=>{ const bw=txW/arr.length;
        arr.forEach((s,k)=>{ ctx.fillStyle=s>0?"rgba(179,18,60,.80)":"rgba(27,79,160,.80)";
          ctx.fillRect(txX+k*bw+0.5, sy, bw-1, sh); }); };
      if(cd.type==="barker"){
        const sh=(bb-bt)*0.46, sy=tbase-sh/2, bw=txW/cd.seq.length;
        strip(cd.seq,sy,sh);
        cd.seq.forEach((s,k)=>{ ctx.textAlign="center";
          label(ctx,s>0?"+":"−", txX+(k+0.5)*bw, sy+sh+12, s>0?POS:NEG, 9, 700); });
        ctx.textAlign="left"; chip(ctx,"13칩 · 위상 ± · 정진폭", txX+6, bt+13, MUTED, 9, 400);
      } else {
        const sh=(bb-bt)*0.24;
        strip(cd.seq,  tbase-sh-7, sh);
        strip(cd.seqB, tbase+7,    sh);
        ctx.textAlign="left";
        label(ctx,"A", txX+4, tbase-sh-7+sh*0.66, "#fff", 9, 700);
        label(ctx,"B", txX+4, tbase+7+sh*0.66, "#fff", 9, 700);
        chip(ctx,"두 부호 · 송신 2회 · 정진폭", txX+6, bt+13, MUTED, 9, 400);
      }
    }

    /* ── 압축 후 ── */
    drawCompressed(ctx, cpX, y0, cpW, rowH, cd);
  });
});


/* ── c2 : 16배 길게 쏘고도 축방향이 그대로 ── */
const ncS = document.getElementById("nc"), bwS = document.getElementById("bw"),
      winBtn = document.getElementById("win");

const comp = makeScene("c2", 380, (ctx,W,H)=>{
  const n = +ncS.value, B = +bwS.value*1e6;
  const T = n/F0;
  const s = chirpBB(T, B, hann);
  const env = mfEnv(s, Math.round(3e-6*SRATE));
  const p0 = env[0];
  let ax = NaN;
  for(let k=0;k<env.length;k++) if(20*Math.log10(env[k]/p0) < -6){ ax = 2*lag2mm(k); break; }
  let fell=false, sl=-99;
  for(let k=1;k<env.length;k++){ const v=20*Math.log10(env[k]/p0+1e-15);
    if(!fell && v<-25) fell=true; else if(fell) sl=Math.max(sl,v); }
  const TB = T*B;
  const Ts = 2/F0;                          /* 기준 2사이클 펄스 */
  const snr = 10*Math.log10(T/Ts);

  document.getElementById("ncv").textContent = n;
  document.getElementById("bwv").textContent = (B/1e6).toFixed(2);
  document.getElementById("rt").textContent  = (T*1e6).toFixed(2);
  document.getElementById("rtb").textContent = TB.toFixed(1);
  document.getElementById("rax").textContent = isFinite(ax)? ax.toFixed(3) : "—";
  document.getElementById("rsl").textContent = sl>-90? sl.toFixed(1) : "없음";
  document.getElementById("rsnr").textContent = (snr>=0?"+":"") + snr.toFixed(1);

  const L=54, R=16, PW=W-L-R;
  /* ── 위: 송신 첩 파형 ── */
  const tT=26, tB=150, tBase=(tT+tB)/2;
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(L,tT,PW,tB-tT);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(L,tT,PW,tB-tT);
  const TWIN = 26e-6;                        /* 가로 고정 26µs 창 */
  const XT = t => L + t/TWIN*PW;
  const pts=[];
  for(let px=0; px<=PW; px++){
    const t = px/PW*TWIN;
    if(t>T){ pts.push([L+px, tBase]); continue; }
    const u=t/T, w = hann ? 0.5-0.5*Math.cos(2*Math.PI*u) : 1;
    const ph = 2*Math.PI*((F0-B/2)*t + B*t*t/(2*T));
    pts.push([L+px, tBase - w*Math.cos(ph)*(tB-tT)*0.40]);
  }
  fillWave(ctx, W, tBase, pts);
  ctx.strokeStyle=MUTED; ctx.setLineDash([2,4]); ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(XT(T),tT); ctx.lineTo(XT(T),tB); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="left";
  chip(ctx, `송신 첩 · ${n} 사이클 · ${(T*1e6).toFixed(2)} µs`, L+5, tT+13, INK, 10.5);
  ctx.textAlign="right";
  chip(ctx, `${((F0-B/2)/1e6).toFixed(2)} → ${((F0+B/2)/1e6).toFixed(2)} MHz 로 쓸며`, L+PW-3, tT+13, MUTED, 9.5, 400);
  ctx.textAlign="left";
  chip(ctx, "0", L, tB+13, MUTED, 9, 400);
  ctx.textAlign="center"; chip(ctx, "26 µs", L+PW, tB+13, MUTED, 9, 400);
  ctx.textAlign="left";

  /* ── 아래: 압축 후 포락선 (dB) ── */
  const cT=192, cB=H-32, PH=cB-cT, DR=40;
  const SPANmm = 3.0;
  const XC = mm => L + PW/2 + mm/SPANmm*PW/2;
  const YC = db => cT + Math.max(0,Math.min(1,-db/DR))*PH;
  ctx.textAlign="right";
  for(let d=0; d>=-DR; d-=10){
    ctx.strokeStyle = d===0?"rgba(217,224,231,.9)":"rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,YC(d)); ctx.lineTo(L+PW,YC(d)); ctx.stroke();
    label(ctx, `${d}`, L-7, YC(d)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,cT); ctx.lineTo(L,cB); ctx.lineTo(L+PW,cB); ctx.stroke();
  /* −6dB 선 */
  ctx.strokeStyle="rgba(240,165,0,.6)"; ctx.setLineDash([5,4]); ctx.lineWidth=1.4;
  ctx.beginPath(); ctx.moveTo(L,YC(-6)); ctx.lineTo(L+PW,YC(-6)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; chip(ctx,"−6 dB", L+PW-3, YC(-6)-5, AMBER_DK, 9); ctx.textAlign="left";
  /* 포락선 (좌우 대칭) */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.2; ctx.beginPath();
  let first=true;
  for(let sgn of [-1,1]){
    for(let k=(sgn<0?env.length-1:0); sgn<0?k>=0:k<env.length; k+=(sgn<0?-1:1)){
      const mm = sgn*lag2mm(k); if(Math.abs(mm)>SPANmm) continue;
      const y = YC(20*Math.log10(env[k]/p0+1e-15));
      first?(ctx.moveTo(XC(mm),y),first=false):ctx.lineTo(XC(mm),y);
    }
  }
  ctx.stroke();
  /* 축방향 자 */
  if(isFinite(ax)){
    ctx.strokeStyle=SIGNAL; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.moveTo(XC(-ax/2), YC(-6)); ctx.lineTo(XC(ax/2), YC(-6)); ctx.stroke();
    ctx.textAlign="center";
    chip(ctx, `압축 후 축방향 ${ax.toFixed(3)} mm`, XC(0), YC(-6)-9, SIGNAL_DK, 10.5);
    ctx.textAlign="left";
  }
  ctx.textAlign="left";
  chip(ctx, `정합 필터 압축 후 · B = ${(B/1e6).toFixed(2)} MHz`, L+5, cT+12, INK, 10);
  ctx.textAlign="center";
  chip(ctx, "거리 (mm) →", L+PW/2, cB+22, MUTED, 9.5, 400);
  ctx.textAlign="left";
});
winBtn.onclick = ()=>{ hann=!hann; winBtn.textContent = hann?"Hann 창":"창 없음";
                       winBtn.classList.toggle("on",hann); comp.redraw(); };
ncS.oninput = bwS.oninput = comp.redraw;


/* ── c3 : MI 천장 아래에서 에너지를 버는 법 ── */
const n2S = document.getElementById("n2");
const STA_LOSS = -20;                        /* A2 · 소자 100개 */

const en = makeScene("c3", 330, (ctx,W,H)=>{
  const n = +n2S.value, T = n/F0, Ts = 2/F0;
  const gain = 10*Math.log10(T/Ts);
  const net = STA_LOSS + gain;
  document.getElementById("n2v").textContent = n;
  document.getElementById("rmi").textContent = "P_r";
  document.getElementById("ren").textContent = (T/Ts).toFixed(1);
  document.getElementById("rg2").textContent = (gain>=0?"+":"") + gain.toFixed(1);
  const rn = document.getElementById("rnet2");
  rn.textContent = net>=0 ? `+${net.toFixed(1)} dB 남음` : `${(-net).toFixed(1)} dB 부족`;
  rn.style.color = net>=0 ? SIGNAL_DK : (net>-10 ? AMBER_DK : POS);
  const st = document.getElementById("estat");
  st.textContent = gain>20 ? "문헌 상한(~20 dB)을 넘어섬 — 현실에선 감쇠·사각지대가 막음"
                           : `에너지 ${(T/Ts).toFixed(0)}배 → SNR +${gain.toFixed(1)} dB`;
  st.style.color = gain>20 ? POS : SIGNAL_DK;

  /* ── 위: 파형 면적 비교 (최대 음압 고정) ── */
  const L=54, R=16, PW=W-L-R, T0=22, B0=150, base=(T0+B0)/2;
  const TWIN=26e-6, X=t=>L+t/TWIN*PW;
  ctx.fillStyle="#fbfcfe"; ctx.fillRect(L,T0,PW,B0-T0);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(L,T0,PW,B0-T0);
  /* MI 천장 */
  const amp=(B0-T0)*0.36;
  [-1,1].forEach(s=>{
    ctx.strokeStyle=POS; ctx.lineWidth=1.8; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(L,base+s*amp); ctx.lineTo(L+PW,base+s*amp); ctx.stroke(); ctx.setLineDash([]);
  });
  ctx.textAlign="left";
  chip(ctx,"MI 천장 — 최대 음압 (30·33장)", L+5, base-amp-6, POS, 10);
  /* 첩 (면적) */
  ctx.fillStyle="rgba(240,165,0,.30)"; ctx.fillRect(L, base-amp, X(T)-L, 2*amp);
  ctx.strokeStyle=AMBER_DK; ctx.lineWidth=1.4; ctx.strokeRect(L, base-amp, X(T)-L, 2*amp);
  /* 기준 2사이클 */
  ctx.fillStyle="rgba(43,61,80,.35)"; ctx.fillRect(L, base-amp, X(Ts)-L, 2*amp);
  ctx.textAlign="left";
  chip(ctx, `기준 2사이클`, L+2, base+amp+15, INK2, 9);
  ctx.textAlign="center";
  chip(ctx, `${n} 사이클 첩 · 면적 ${(T/Ts).toFixed(0)}배`, (L+X(T))/2, base+4, AMBER_DK, 11);
  ctx.textAlign="left";
  chip(ctx, "높이는 못 올린다 · 늘릴 수 있는 건 길이뿐", L+5, T0+13, INK, 10);

  /* ── 아래: SNR 이득 곡선 ── */
  const gT=188, gB=H-30, GH=gB-gT;
  const NMAX=128, GMAX=26;
  const XG = nn => L + (nn-2)/(NMAX-2)*PW;
  const YG = g => gB - Math.max(0,Math.min(1,g/GMAX))*GH;
  ctx.textAlign="right";
  for(let g=0; g<=GMAX; g+=5){
    ctx.strokeStyle="rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,YG(g)); ctx.lineTo(L+PW,YG(g)); ctx.stroke();
    label(ctx, `${g}`, L-7, YG(g)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,gT); ctx.lineTo(L,gB); ctx.lineTo(L+PW,gB); ctx.stroke();
  /* 문헌 상한 20dB */
  ctx.strokeStyle=POS; ctx.setLineDash([5,4]); ctx.lineWidth=1.6;
  ctx.beginPath(); ctx.moveTo(L,YG(20)); ctx.lineTo(L+PW,YG(20)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="right"; chip(ctx,"문헌 현실 상한 ~20 dB", L+PW-3, YG(20)-5, POS, 9.5); ctx.textAlign="left";
  /* A2 손실 메우기 선 (20dB) 은 위와 같은 자리 → 별도 표기 */
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=2.4; ctx.beginPath();
  for(let nn=2; nn<=NMAX; nn+=1){
    const g = 10*Math.log10((nn/F0)/(2/F0));
    const px=XG(nn), py=YG(g); (nn===2)?ctx.moveTo(px,py):ctx.lineTo(px,py);
  }
  ctx.stroke();
  ctx.fillStyle=SIGNAL_DK; ctx.beginPath(); ctx.arc(XG(n), YG(gain), 5, 0, 7); ctx.fill();
  ctx.textAlign="center";
  chip(ctx, `${n}사이클 → +${gain.toFixed(1)} dB`, XG(n), YG(gain)-11, SIGNAL_DK, 10);
  [2,32,64,128].forEach(v=> label(ctx, `${v}`, XG(v), gB+14, MUTED, 9, 400));
  chip(ctx,"첩 길이 (사이클) →", L+PW/2, gB+26, MUTED, 9.5, 400);
  ctx.textAlign="left";
  ctx.save(); ctx.translate(L-38,(gT+gB)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"SNR 이득 (dB)",-34,0,MUTED,9.5,400); ctx.restore();
});
n2S.oninput = en.redraw;
