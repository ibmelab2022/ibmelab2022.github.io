/* ═══ A6 파워 도플러와 클러터 필터링 · 애니메이션 ═══
   검증: /home/claude/work/a6.js
     · f_d = 2v cosθ f₀/c  · 5MHz: 미세혈관 1mm/s → 6.5Hz  <  박동 조직 10mm/s → 65Hz
       → 보고 싶은 혈류가 걷어내고 싶은 조직보다 느리다 (주파수로는 못 가름)
     · 벽필터 50Hz 차단 → 7.70 mm/s 이하 혈류 사망
     · 앙상블 8/12/200/1000 → 주파수 분해능 625/417/25/5 Hz — 8~12 로는 50Hz 벽을 못 세움
     · SVD (합성 Casorati 행렬의 실제 계산): 정지 조직 → 조직이 저차 2개, 그 뒤 −56dB 급락
       박동 조직 10mm/s → 여전히 저차 3개 (주파수가 아니라 '상관' 으로 갈리니까)
     · Demené 2015: 쥐 뇌 실데이터에서 앞 49개 특이벡터 제거 · ULM: 앞 40 + 뒤 250        */
const C = 1540, F0 = 5e6;
const fdOf = (vmm, thDeg) => 2*(vmm*1e-3)*Math.cos(thDeg*Math.PI/180)*F0/C;   /* Hz */
const PRF = 1000;

/* 합성 혈관 트리 — 파워 도플러 영상 예시용 (재귀 분기, 고정 시드) */
function vesselTree(){
  let sd=98765; const rr=()=>{ sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x7fffffff; };
  const segs=[];
  (function branch(x,y,ang,len,w,d){
    if(d>7 || len<0.018 || w<0.35) return;      /* ★ 좌표가 0~1 정규화라 종료 조건도 정규화 (버그 수정) */
    const x2=x+Math.cos(ang)*len, y2=y+Math.sin(ang)*len;
    segs.push([x,y,x2,y2,w]);
    const n = d<2 ? 2 : (rr()<0.78 ? 2 : 1);
    for(let i=0;i<n;i++){
      const da = (i - (n-1)/2)*(0.42 + rr()*0.5) + (rr()-0.5)*0.24;
      branch(x2, y2, ang+da, len*(0.66+rr()*0.22), w*0.70, d+1);
    }
  })(0.5, 0.02, Math.PI/2, 0.20, 4.2, 0);
  (function branch(x,y,ang,len,w,d){
    if(d>6 || len<0.018 || w<0.35) return;
    const x2=x+Math.cos(ang)*len, y2=y+Math.sin(ang)*len;
    segs.push([x,y,x2,y2,w]);
    for(let i=0;i<2;i++){
      const da=(i-0.5)*(0.5+rr()*0.4);
      branch(x2,y2,ang+da,len*(0.68+rr()*0.2),w*0.70,d+1);
    }
  })(0.14, 0.03, Math.PI/2.4, 0.17, 3.2, 0);
  return segs;
}
const VTREE = vesselTree();

/* 트리 경계 → 어느 패널에서도 같은 종횡비로 그림(레터박스). 패널 모양이 달라도 혈관 '형태'가 동일. */
const VB = (()=>{ let a=[1,0,1,0];
  VTREE.forEach(([x1,y1,x2,y2])=>{ a[0]=Math.min(a[0],x1,x2); a[1]=Math.max(a[1],x1,x2);
    a[2]=Math.min(a[2],y1,y2); a[3]=Math.max(a[3],y1,y2); }); return a; })();
function fitBox(ix,iy,iw,ih){
  const tw=VB[1]-VB[0], th=VB[3]-VB[2], m=0.07;
  const s=Math.min(iw*(1-2*m)/tw, ih*(1-2*m)/th);      /* 종횡비 유지, 여백 7% */
  return { s, ox: ix+(iw-tw*s)/2 - VB[0]*s, oy: iy+(ih-th*s)/2 - VB[2]*s };
}


/* 혈관 트리를 파워 도플러 영상으로 그린다 (tissueLeft: 조직 잔류 0~1, keep: 혈관 보존 0~1)
   ★ 회절한계 반영: 큰 혈관은 '부드러운 관', 가는 혈관은 개별 해상이 안 되어 '번진 확산 신호'로 뭉갠다.
      (A7 ULM 은 바로 이 한계를 넘어 개별 미세혈관을 복원한다 — 두 장의 메시지가 어긋나지 않도록.) */
function drawPD(ctx, ix, iy, iw, ih, tissueLeft, keep){
  ctx.fillStyle="#0b0400"; ctx.fillRect(ix, iy, iw, ih);
  ctx.save(); ctx.beginPath(); ctx.rect(ix,iy,iw,ih); ctx.clip();
  if(tissueLeft > 0.02){
    let sd=13579; const r2=()=>{ sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x7fffffff; };
    for(let i=0;i<900;i++){
      const g=(0.22+0.55*r2())*tissueLeft;
      ctx.fillStyle=`rgba(255,${Math.round(150+80*r2())},60,${g.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(ix+r2()*iw, iy+r2()*ih, 2+r2()*5, 0, 7); ctx.fill();
    }
  }
  const {s, ox, oy} = fitBox(ix,iy,iw,ih), k = s/320;
  const pass = w => !((w<0.65 && keep<0.82) || (w<1.1 && keep<0.55));   /* 뒤 문턱이 가는 혈관을 지움 */
  const colr = w => { const g=Math.round(95+115*Math.min(1,w/3)), b=Math.round(25+55*Math.min(1,w/4)); return [g,b]; };
  ctx.lineCap="round"; ctx.lineJoin="round";
  /* 1) 가는 혈관(w<1.3) = 확산 신호 — shadowBlur 없이 넓고 흐리게(개별 해상 불가). 값싸고 빠름. */
  ctx.shadowBlur=0;
  [[7,0.05],[3.4,0.09]].forEach(([lw,a])=>{
    VTREE.forEach(([x1,y1,x2,y2,w])=>{ if(w>=1.3 || !pass(w)) return;
      const [g,b]=colr(w);
      ctx.strokeStyle=`rgba(255,${g},${b},${(a).toFixed(3)})`; ctx.lineWidth=Math.max(1.4, lw*k);
      ctx.beginPath(); ctx.moveTo(ox+x1*s,oy+y1*s); ctx.lineTo(ox+x2*s,oy+y2*s); ctx.stroke();
    });
  });
  /* 2) 큰 혈관(w≥1.3) = 부드러운 관 (shadowBlur, 세그먼트 소수라 가벼움) */
  const bigTree=(blurMul,wMul,aMul)=> VTREE.forEach(([x1,y1,x2,y2,w])=>{ if(w<1.3) return;
    const [g,b]=colr(w), a=Math.min(1,(0.26+w*0.12))*aMul;
    ctx.shadowColor=`rgba(255,${g},${b},0.9)`; ctx.shadowBlur=Math.max(4, s*0.024)*blurMul;
    ctx.strokeStyle=`rgba(255,${g},${b},${a.toFixed(2)})`; ctx.lineWidth=Math.max(1.4, w*wMul*k);
    ctx.beginPath(); ctx.moveTo(ox+x1*s,oy+y1*s); ctx.lineTo(ox+x2*s,oy+y2*s); ctx.stroke();
  });
  bigTree(4.6, 2.8, 0.34); bigTree(2.6, 1.7, 0.52); bigTree(1.5, 0.9, 0.70);
  ctx.shadowBlur=0; ctx.shadowColor="rgba(0,0,0,0)";
  ctx.restore();
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(ix, iy, iw, ih);
}

/* ── c1 : 같은 혈관, 두 도플러 모드 — 컬러(각도의존·에일리어싱) vs 파워(불변) ── */
const thS = document.getElementById("th"), vfS = document.getElementById("vf");

/* 컬러 도플러 렌더 — 혈관을 속도색(빨강=접근/파랑=후퇴)으로. 밝기 ∝ mag(각도), sign=방향.
   drawPD 와 같은 fitBox 를 써서 형태가 완전히 일치. 가는 혈관은 번진 확산(개별 해상 불가). shadowBlur 없이 가볍게. */
function drawColorDoppler(ctx, ix, iy, iw, ih, sign, mag){
  ctx.fillStyle="#04070c"; ctx.fillRect(ix,iy,iw,ih);
  ctx.save(); ctx.beginPath(); ctx.rect(ix,iy,iw,ih); ctx.clip();
  const {s, ox, oy} = fitBox(ix,iy,iw,ih), k=s/320;
  const base = sign>=0 ? [255,72,72] : [74,142,255];   /* 빨강=접근 · 파랑=후퇴 */
  const [cr,cg,cb]=base, bright=Math.max(0.05, Math.pow(mag,1.4));
  ctx.lineCap="round"; ctx.lineJoin="round";
  /* 가는 혈관(w<1.3): 넓고 흐린 확산 */
  [[7,0.05],[3.4,0.10]].forEach(([lw,a])=>{
    VTREE.forEach(([x1,y1,x2,y2,w])=>{ if(w>=1.3) return;
      ctx.strokeStyle=`rgba(${cr},${cg},${cb},${(a*bright).toFixed(3)})`; ctx.lineWidth=Math.max(1.4, lw*k);
      ctx.beginPath(); ctx.moveTo(ox+x1*s,oy+y1*s); ctx.lineTo(ox+x2*s,oy+y2*s); ctx.stroke();
    });
  });
  /* 큰 혈관(w≥1.3): 3겹 매뉴얼 글로우 (또렷한 관) */
  [[3.4,0.10],[2.1,0.22],[1.0,0.5]].forEach(([wm,am])=>{
    VTREE.forEach(([x1,y1,x2,y2,w])=>{ if(w<1.3) return;
      const a=Math.min(1,(0.30+w*0.12))*am*bright;
      ctx.strokeStyle=`rgba(${cr},${cg},${cb},${a.toFixed(3)})`; ctx.lineWidth=Math.max(1.2, w*wm*k);
      ctx.beginPath(); ctx.moveTo(ox+x1*s,oy+y1*s); ctx.lineTo(ox+x2*s,oy+y2*s); ctx.stroke();
    });
  });
  ctx.restore();
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(ix,iy,iw,ih);
}

const two = makeScene("c1", 380, (ctx,W,H)=>{
  const th = +thS.value, v = +vfS.value;
  const fd = fdOf(v, th), ny = PRF/2;
  let fdw = fd; while(fdw> ny) fdw-=PRF; while(fdw<-ny) fdw+=PRF;   /* 나이퀴스트로 접힘 */
  const cosT = Math.cos(th*Math.PI/180);
  const vMeas = fdw*C/(2*F0*cosT+1e-9)*1e3;
  const alias = Math.abs(fd) > ny;
  const NP=16, amp=1.0, pw=NP*amp*amp;                 /* 파워 = N·진폭² — 각도·속도와 무관 */
  const colMag  = Math.abs(cosT);                       /* 컬러 밝기 ∝ |cosθ| → 90°에서 드롭아웃 */
  const colSign = fdw>=0 ? +1 : -1;                     /* 방향 — 에일리어싱이면 뒤집힘 */

  document.getElementById("thv").textContent = th;
  document.getElementById("vfv").textContent = v;
  document.getElementById("rfd").textContent = fd.toFixed(0);
  document.getElementById("rcol").textContent = vMeas.toFixed(0);
  document.getElementById("rpow").textContent = pw.toFixed(0);
  const al=document.getElementById("rali");
  al.textContent = alias ? "발생 — 방향 뒤집힘" : "없음";
  al.style.color = alias ? POS : SIGNAL_DK;

  /* 상단 안내 — 같은 느린-시간 신호를 두 가지로 축약 */
  ctx.textAlign="center";
  chip(ctx, "같은 느린-시간 신호 → 두 가지로 축약 (각도 θ · 속도 v 를 바꿔 보세요)", W/2, 16, INK, 10.5);

  const gap=18, iw2=(W-16-16-gap)/2, ih=H-40-42, iy=40, L=16;
  const cix=L, pix=L+iw2+gap;

  /* ── 왼쪽: 컬러 도플러 (속도) ── */
  drawColorDoppler(ctx, cix, iy, iw2, ih, colSign, colMag);
  ctx.textAlign="left"; chip(ctx, "컬러 도플러 · 속도", cix, iy-8, colSign>0?POS:NEG, 10.5);
  /* 코너 태그 */
  ctx.textAlign="right";
  if(colMag<0.12) chip(ctx, "드롭아웃", cix+iw2-6, iy+16, AMBER_DK, 9.5);
  else if(alias)  chip(ctx, "에일리어싱", cix+iw2-6, iy+16, POS, 9.5);
  /* 하단 상태 */
  let cstat, ccol;
  if(colMag<0.12){ cstat="색이 거의 사라짐 — 90° 근처 드롭아웃"; ccol=AMBER_DK; }
  else if(alias){ cstat=`나이퀴스트 초과 → 색이 ${colSign>0?"빨강":"파랑"}으로 뒤집힘`; ccol=POS; }
  else { cstat=`${colSign>0?"▲ 접근(빨강)":"▼ 후퇴(파랑)"} · v ≈ ${vMeas.toFixed(0)} mm/s`; ccol=colSign>0?POS:NEG; }
  ctx.textAlign="left"; chip(ctx, cstat, cix+2, iy+ih+16, ccol, 9.5);

  /* ── 오른쪽: 파워 도플러 (파워) — 좋아하신 그림 그대로 ── */
  drawPD(ctx, pix, iy, iw2, ih, 0, 1);
  ctx.textAlign="left"; chip(ctx, "파워 도플러 · 파워", pix, iy-8, POS, 10.5);
  ctx.textAlign="right"; chip(ctx, `Σ|p|² = ${pw.toFixed(0)}`, pix+iw2-6, iy+16, AMBER_DK, 9.5);
  ctx.textAlign="left"; chip(ctx, "각도·속도 무관 — 늘 그대로 (혈관이 '있다')", pix+2, iy+ih+16, SIGNAL_DK, 9.5);
});
thS.oninput = vfS.oninput = two.redraw;
two.redraw();


/* ── c2 : 벽 필터 — 주파수로만 자른다 ── */
const cutS=document.getElementById("cut"), vtS=document.getElementById("vt"), ensS=document.getElementById("ens");

const wall = makeScene("c2", 340, (ctx,W,H)=>{
  const fc = +cutS.value, vt = +vtS.value, NE = +ensS.value;
  const fRes = PRF/NE*5;                      /* 앙상블이 정하는 필터 전이폭 (≈ 5·PRF/N) */
  const fdT = fdOf(vt, 0), fdB = fdOf(5, 0);  /* 조직 · 느린 혈류 5mm/s */
  const vCut = fc*C/(2*F0)*1e3;
  document.getElementById("cutv").textContent = fc;
  document.getElementById("vtv").textContent = vt.toFixed(1);
  document.getElementById("ensv").textContent = NE;
  document.getElementById("rres").textContent = (PRF/NE).toFixed(1);
  document.getElementById("rcv").textContent = vCut.toFixed(2);
  document.getElementById("rvt").textContent = fdT.toFixed(1);
  /* 필터 이득 (뭉툭한 고대역) */
  const Hf = f => 1/(1 + Math.pow(fc/Math.max(Math.abs(f),0.1), 2*Math.max(1, 12/(fRes/fc+1))));
  const leak = 20*Math.log10(Hf(fdT)+1e-9);
  const keep = 20*Math.log10(Hf(fdB)+1e-9);
  const rw = document.getElementById("rw");
  if(leak > -20){ rw.textContent="조직 통과 — 플래시"; rw.style.color=POS; }
  else if(keep < -6){ rw.textContent="느린 혈류도 잘림"; rw.style.color=AMBER_DK; }
  else { rw.textContent="이 조건은 통과"; rw.style.color=SIGNAL_DK; }
  const st=document.getElementById("wstat");
  st.textContent = leak>-20 ? `조직 f_d ${fdT.toFixed(0)}Hz 가 차단 ${fc}Hz 를 넘음 — 그대로 통과`
                            : `앙상블 ${NE} → 전이폭 ${fRes.toFixed(0)}Hz`;
  st.style.color = leak>-20 ? POS : MUTED;

  const L=54, R=16, PW=W-L-R, T=18, B=H-34, PH=B-T;
  const FMAX=400;
  const X = f => L + f/FMAX*PW;
  const Y = db => T + Math.max(0,Math.min(1,-db/60))*PH;
  ctx.textAlign="right";
  for(let d=0; d>=-60; d-=15){
    ctx.strokeStyle = d===0?"rgba(217,224,231,.9)":"rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y(d)); ctx.lineTo(L+PW,Y(d)); ctx.stroke();
    label(ctx, `${d}`, L-7, Y(d)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-38,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"파워 (dB)",-28,0,MUTED,9.5,400); ctx.restore();
  /* 봉우리: 조직(클러터 46dB 세다) · 혈류 */
  const peak=(f0v,w,top,col,lbl)=>{
    ctx.strokeStyle=col; ctx.lineWidth=2.2; ctx.beginPath();
    for(let px=0;px<=PW;px++){ const f=px/PW*FMAX;
      const g=top-Math.pow((f-f0v)/w,2)*40;
      const y=Y(Math.max(g,-60)); px?ctx.lineTo(L+px,y):ctx.moveTo(L+px,y); }
    ctx.stroke();
    ctx.textAlign="center"; chip(ctx,lbl, X(Math.min(f0v,FMAX*0.9)), Y(top)-8, col, 10);
  };
  peak(fdT, 14, 0, NEG, `조직 ${fdT.toFixed(0)}Hz`);
  peak(fdB, 22, -46, POS, `혈류 5mm/s`);
  /* 벽 필터 */
  ctx.strokeStyle=MUTED; ctx.lineWidth=2.4; ctx.setLineDash([6,4]); ctx.beginPath();
  for(let px=0;px<=PW;px++){ const f=px/PW*FMAX;
    const y=Y(Math.max(20*Math.log10(Hf(f)+1e-9), -60)); px?ctx.lineTo(L+px,y):ctx.moveTo(L+px,y); }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle=AMBER; ctx.lineWidth=1.6; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(X(fc),T); ctx.lineTo(X(fc),B); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="center"; chip(ctx,`차단 ${fc}Hz`, X(fc), T+11, AMBER_DK, 9.5);
  ctx.textAlign="right"; chip(ctx,"벽 필터", L+PW-3, Y(-3)-5, MUTED, 9.5);
  ctx.textAlign="center";
  [0,100,200,300,400].forEach(f=> label(ctx, `${f}`, X(f), B+14, MUTED, 9, 400));
  chip(ctx,"도플러 주파수 (Hz) →", L+PW/2, B+27, MUTED, 9.5, 400);
  ctx.textAlign="left";
  chip(ctx, `앙상블 ${NE} → 분해능 ${(PRF/NE).toFixed(0)}Hz · 전이폭 ${fRes.toFixed(0)}Hz`,
       L+5, T+11, NE<32?POS:SIGNAL_DK, 10);
});
cutS.oninput = vtS.oninput = ensS.oninput = wall.redraw;


/* ── c3 : SVD — 시공간 상관으로 자른다 (실제 계산) ── */
const vt2S=document.getElementById("vt2"), ktS=document.getElementById("kt"), knS=document.getElementById("kn");
const NPIX = 32, NFRM = 48;

function buildCasorati(vTis){
  let seed = 7;
  const rnd = () => { seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff-0.5; };
  const S=[]; for(let i=0;i<NPIX;i++) S.push(new Float64Array(NFRM));
  const A = Math.pow(10, 46/20);              /* 클러터 46 dB */
  /* 조직: 매끈한 공간 패턴 3개 (이웃과 함께 움직이는 연속체) */
  for(let m=1;m<=3;m++){
    const ph0=rnd()*6, w=2*Math.PI*fdOf(vTis,0)*(1+0.15*m)/PRF;
    for(let i=0;i<NPIX;i++){ const g=Math.cos(Math.PI*m*i/NPIX + ph0);
      for(let t=0;t<NFRM;t++) S[i][t] += A*g*Math.cos(w*t + ph0); }
  }
  /* 혈류: 픽셀마다 독립 스페클이 프레임마다 재배열 */
  const wB = 2*Math.PI*fdOf(5,0)/PRF;
  for(let i=0;i<NPIX;i++) for(let t=0;t<NFRM;t++)
    S[i][t] += (rnd()*2)*Math.cos(wB*t + rnd()*6);
  /* 잡음 */
  for(let i=0;i<NPIX;i++) for(let t=0;t<NFRM;t++) S[i][t] += 0.06*rnd()*2;
  return S;
}
/* S·Sᵀ 의 고유값 → 특이값 (Jacobi) */
function singvals(S){
  const n=S.length, A=[]; for(let i=0;i<n;i++) A.push(new Float64Array(n));
  for(let i=0;i<n;i++) for(let j=i;j<n;j++){
    let s=0; for(let t=0;t<S[0].length;t++) s+=S[i][t]*S[j][t]; A[i][j]=s; A[j][i]=s; }
  for(let sw=0; sw<14; sw++){
    let off=0; for(let i=0;i<n;i++) for(let j=i+1;j<n;j++) off+=A[i][j]*A[i][j];
    if(off<1e-10) break;
    for(let p=0;p<n;p++) for(let q=p+1;q<n;q++){
      if(Math.abs(A[p][q])<1e-13) continue;
      const th=0.5*Math.atan2(2*A[p][q], A[p][p]-A[q][q]), c=Math.cos(th), s=Math.sin(th);
      for(let k=0;k<n;k++){ const akp=A[k][p], akq=A[k][q]; A[k][p]=c*akp+s*akq; A[k][q]=-s*akp+c*akq; }
      for(let k=0;k<n;k++){ const apk=A[p][k], aqk=A[q][k]; A[p][k]=c*apk+s*aqk; A[q][k]=-s*apk+c*aqk; }
    }
  }
  const ev=[]; for(let i=0;i<n;i++) ev.push(Math.sqrt(Math.max(A[i][i],0)));
  return ev.sort((a,b)=>b-a);
}
let SVCACHE=null, SVKEY=null;
const getSV = vTis => { const k=vTis.toFixed(1); if(k!==SVKEY){ SVCACHE=singvals(buildCasorati(vTis)); SVKEY=k; } return SVCACHE; };

const svd = makeScene("c3", 400, (ctx,W,H)=>{
  const vTis = +vt2S.value, kt = +ktS.value, kn = +knS.value;
  const sv = getSV(vTis);
  const top = sv[0];
  const dB = sv.map(v => 20*Math.log10(v/top + 1e-12));
  /* 조직 부분공간: −30dB 아래로 급락하는 지점 */
  let rank=0; for(let i=1;i<dB.length;i++){ if(dB[i] < -30){ rank=i; break; } }
  const keep = Math.max(0, NPIX - kt - kn);
  /* 조직 제거량: 버린 앞쪽 kt 개가 담고 있던 에너지 비율 */
  let tot=0, rej=0;
  for(let i=0;i<NPIX;i++){ tot += sv[i]*sv[i]; if(i<kt) rej += sv[i]*sv[i]; }
  const rejDb = 10*Math.log10(Math.max(1-rej/tot, 1e-12));
  document.getElementById("vt2v").textContent = vTis.toFixed(1);
  document.getElementById("ktv").textContent = kt;
  document.getElementById("knv").textContent = kn;
  document.getElementById("rrank").textContent = rank;
  document.getElementById("rkeep").textContent = keep;
  document.getElementById("rrej").textContent = rejDb.toFixed(1);
  const rs = document.getElementById("rs");
  if(kt < rank){ rs.textContent="조직 남음"; rs.style.color=POS; }
  else if(keep < 4){ rs.textContent="혈류까지 버림"; rs.style.color=AMBER_DK; }
  else { rs.textContent="조직 제거 · 혈류 살림"; rs.style.color=SIGNAL_DK; }
  const st=document.getElementById("sstat");
  st.textContent = `조직 속도 ${vTis.toFixed(1)}mm/s → 조직이 앞 ${rank}개 차수에 몰림 (f_d = ${fdOf(vTis,0).toFixed(0)}Hz)`;
  st.style.color = SIGNAL_DK;

  const IMW = Math.min(300, W*0.34);                 /* 오른쪽 파워 도플러 영상 폭 */
  const L=54, R=16+IMW+16, PW=W-L-R, T=18, B=H-34, PH=B-T, DR=80;
  const X = i => L + (i+0.5)/NPIX*PW;
  const Y = d => T + Math.max(0,Math.min(1,-d/DR))*PH;
  ctx.textAlign="right";
  for(let d=0; d>=-DR; d-=20){
    ctx.strokeStyle = d===0?"rgba(217,224,231,.9)":"rgba(238,243,247,.9)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(L,Y(d)); ctx.lineTo(L+PW,Y(d)); ctx.stroke();
    label(ctx, `${d}`, L-7, Y(d)+3.5, MUTED, 9, 400);
  }
  ctx.textAlign="left";
  ctx.strokeStyle=LINE; ctx.beginPath(); ctx.moveTo(L,T); ctx.lineTo(L,B); ctx.lineTo(L+PW,B); ctx.stroke();
  ctx.save(); ctx.translate(L-38,(T+B)/2); ctx.rotate(-Math.PI/2);
  label(ctx,"특이값 σ (dB)",-34,0,MUTED,9.5,400); ctx.restore();
  /* 버린 영역 음영 */
  if(kt>0){ ctx.fillStyle="rgba(27,79,160,.14)"; ctx.fillRect(L, T, X(kt-0.5)-L, B-T); }
  if(kn>0){ ctx.fillStyle="rgba(91,107,123,.14)"; ctx.fillRect(X(NPIX-kn-0.5), T, L+PW-X(NPIX-kn-0.5), B-T); }
  /* 막대 */
  const bw = PW/NPIX*0.72;
  for(let i=0;i<NPIX;i++){
    const y=Y(dB[i]);
    ctx.fillStyle = i<kt ? "rgba(27,79,160,.75)" : (i>=NPIX-kn ? "rgba(91,107,123,.55)" : "rgba(179,18,60,.75)");
    ctx.fillRect(X(i)-bw/2, y, bw, B-y);
  }
  /* 문턱선 */
  if(kt>0){ ctx.strokeStyle=NEG; ctx.lineWidth=2; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(X(kt-0.5),T); ctx.lineTo(X(kt-0.5),B); ctx.stroke(); ctx.setLineDash([]); }
  if(kn>0){ ctx.strokeStyle=MUTED; ctx.lineWidth=2; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(X(NPIX-kn-0.5),T); ctx.lineTo(X(NPIX-kn-0.5),B); ctx.stroke(); ctx.setLineDash([]); }
  ctx.textAlign="left";
  chip(ctx, `조직 (앞 ${kt})`, L+4, T+11, NEG, 10);
  ctx.textAlign="center";
  chip(ctx, `혈류 — 남긴 ${keep} 차수`, (X(kt)+X(NPIX-kn))/2, T+11, POS, 10);
  ctx.textAlign="right";
  chip(ctx, `잡음 (뒤 ${kn})`, L+PW-3, T+11, MUTED, 10);
  ctx.textAlign="center";
  [1,8,16,24,32].forEach(i=> label(ctx, `${i}`, X(i-1), B+14, MUTED, 9, 400));
  chip(ctx,"특이값 차수 →", L+PW/2, B+27, MUTED, 9.5, 400);
  ctx.textAlign="center";
  chip(ctx, `Casorati ${NPIX}픽셀 × ${NFRM}프레임 · 클러터 46dB · 혈류 5mm/s`, (X(kt)+X(NPIX-kn))/2, T+30, MUTED, 9, 400);

  /* ── 오른쪽: 그 문턱으로 만든 파워 도플러 영상 ── */
  const ix = W-16-IMW, iy = T, ih = B-T;
  const leftFrac = Math.max(0, 1 - kt/Math.max(rank,1));
  const keepFrac = Math.max(0, 1 - kn/14);
  drawPD(ctx, ix, iy, IMW, ih, leftFrac, keepFrac);
  ctx.textAlign="left";
  chip(ctx, "파워 도플러 영상", ix, iy-8, POS, 10.5);
  ctx.font=`400 ${(9*FS).toFixed(1)}px ${MONO}`; ctx.fillStyle="#c9b8a8";
  ctx.fillText("PW(x,z) = ∫ |s_blood|² dt", ix+6, iy+15);
  ctx.fillStyle = leftFrac>0.35 ? "#ff9a5c" : (keepFrac<0.55 ? "#ff9a5c" : "#9fd8dc");
  ctx.fillText(leftFrac>0.35 ? "조직 잔류 — 앞 문턱을 더 올리세요"
             : (keepFrac<0.55 ? "가는 혈관이 지워짐 — 뒤 문턱 과다" : "조직 제거 · 혈관 드러남"),
               ix+6, iy+ih-8);
});
vt2S.oninput = ktS.oninput = knS.oninput = svd.redraw;
