/* ═══ 10 탐촉자 구조와 특성 · 애니메이션 ═══

   공진기 손실 모형:   1/Q = 1/Q_front + 1/Q_back + 1/Q_int
     Q_front ← 정합층이 좋을수록 작아짐 (앞으로 잘 빠져나감)
     Q_back  ← 후면재가 무거울수록 작아짐 (뒤로 흡수됨)
   감도 = 앞으로 나간 에너지 비율 = Q_total / Q_front
   → 정합층은 Q 를 낮추면서 감도를 '올리고',
     후면재는 Q 를 낮추지만 감도를 '떨어뜨립니다'.  이 비대칭이 이 장의 핵심입니다. */

const F0 = 5.0;                    /* 중심 주파수 (MHz) */
const Q_INT = 150;                 /* 내부 손실 (고정) */
const C_TIS = 1540;                /* 연부조직 음속 (m/s) */

const bkS = document.getElementById("bk"), mtS = document.getElementById("mt");

/* 슬라이더(0~100) → Q_back / Q_front.  로그 보간이라 감각이 자연스럽습니다. */
const qBack  = s => 200 * Math.pow(4/200,  s/100);   /* 200(없음) → 4(무거움)  */
const qFront = s => 60  * Math.pow(2.5/60, s/100);   /*  60(없음) → 2.5 (1-3 복합재 + 2층 정합)
                                                        상용 탐촉자 비대역폭 60~90% 에 맞춘 값 */

const hero = makeScene("c1", 380, (ctx,W,H)=>{
  const b=+bkS.value, m=+mtS.value;
  const Qb=qBack(b), Qf=qFront(m);
  const Q  = 1/(1/Qf + 1/Qb + 1/Q_INT);
  const sens = Q/Qf;                         /* 앞으로 나간 에너지 비율 */
  const BW = F0/Q;                           /* −6dB 대역폭 (MHz) */
  const sigF = BW/2.3548;                    /* 가우시안 σ_f */
  const sigT = 1/(2*Math.PI*sigF);           /* σ_t (µs) — MHz 와 짝 */
  const plen = 2.3548*sigT*C_TIS*1e-3;       /* 펄스 공간 길이 (mm) */

  document.getElementById("bkv").textContent = b<3?"없음":b<40?"가벼움":b<75?"보통":"무거움";
  document.getElementById("mtv").textContent = m<3?"없음":m<40?"1층":m<75?"1층 (양호)":"2층";
  document.getElementById("qv").textContent  = Q.toFixed(2);
  document.getElementById("bwv").textContent = BW.toFixed(2);
  document.getElementById("fbv").textContent = (BW/F0*100).toFixed(0);
  document.getElementById("plv").textContent = plen.toFixed(2);
  document.getElementById("sev").textContent = (sens*100).toFixed(0);

  const st=document.getElementById("qstat");
  if(sens>0.8 && Q<8){ st.textContent="넓은 대역 + 높은 감도 — 좋은 영상용 설계"; st.style.color=SIGNAL_DK; }
  else if(sens<0.15){ st.textContent="후면재가 에너지를 다 먹었습니다 — 감도 붕괴"; st.style.color=POS; }
  else if(Q>15){ st.textContent="좁은 대역 — 펄스가 길어 분해능이 나쁩니다"; st.style.color=AMBER_DK; }
  else { st.textContent=`Q = ${Q.toFixed(2)} · 감도 ${(sens*100).toFixed(0)}%`; st.style.color=MUTED; }

  const T=44, B=H-52;

  /* ── 열1: 트랜스듀서 단면 (신규) ── */
  const c1x=16, c1w=W*0.25, bx=c1x+14, bw=c1w*0.46, bcx=bx+bw/2;
  const Ht=B-T-16;
  const hasBack=b>=3, hasMatch=m>=3, twoM=m>=75;
  const hBack=hasBack?Ht*(0.18+0.18*(b/100)):0, hPz=Ht*0.22, hM=hasMatch?Ht*(twoM?0.14:0.09):0;
  ctx.textAlign="left"; chip(ctx,"① 트랜스듀서 단면", c1x, 26, INK, 11.5);
  const lab=(yc,nm,nt,c)=>{ ctx.strokeStyle="rgba(120,135,150,.55)"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(bx+bw,yc); ctx.lineTo(bx+bw+8,yc); ctx.stroke();
    ctx.textAlign="left"; label(ctx,nm,bx+bw+11,yc-1,c||INK2,11.5,700); if(nt) label(ctx,nt,bx+bw+11,yc+14,MUTED,9.5,400); };
  let y=T+4;
  /* 후면재 — b 클수록 진하고 두꺼움. b<3(없음)이면 아예 그리지 않음 */
  if(hasBack){
    ctx.fillStyle=`rgba(64,72,82,${(0.40+0.50*b/100).toFixed(2)})`; ctx.fillRect(bx,y,bw,hBack);
    ctx.strokeStyle="rgba(30,35,42,.55)"; ctx.lineWidth=1; ctx.strokeRect(bx,y,bw,hBack);
    lab(y+hBack/2,"후면재","후방 흡수",INK2);
  }
  y+=hBack;
  /* 전극 위 */ ctx.fillStyle="#b8901f"; ctx.fillRect(bx,y-1,bw,2.5);
  /* 압전소자 */ ctx.fillStyle="rgba(206,186,156,.75)"; ctx.fillRect(bx,y+1.5,bw,hPz-3);
  ctx.strokeStyle="rgba(120,100,70,.7)"; ctx.strokeRect(bx,y+1.5,bw,hPz-3);
  ctx.textAlign="center"; label(ctx,"+",bx-9,y+9,POS,13); label(ctx,"−",bx-9,y+hPz-1,NEG,13);
  lab(y+hPz/2,"압전소자","전압↔진동",INK2);
  /* 전극 아래 */ ctx.fillStyle="#b8901f"; ctx.fillRect(bx,y+hPz-1.5,bw,2.5); y+=hPz;
  /* 정합층 1 or 2 — m<3(없음)이면 아예 그리지 않음 */
  if(hasMatch){
    if(twoM){ ctx.fillStyle="rgba(23,192,201,.34)"; ctx.fillRect(bx,y,bw,hM/2); ctx.fillStyle="rgba(23,192,201,.56)"; ctx.fillRect(bx,y+hM/2,bw,hM/2); }
    else { ctx.fillStyle="rgba(23,192,201,.5)"; ctx.fillRect(bx,y,bw,hM); }
    ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1; ctx.strokeRect(bx,y,bw,hM);
    lab(y+hM/2,"정합층", twoM?"λ/4·2층":"λ/4·1층", SIGNAL_DK);
  }
  y+=hM;
  /* 조직 */
  ctx.fillStyle="rgba(179,18,60,.09)"; ctx.fillRect(bx,y,bw,B-y);
  ctx.strokeStyle="rgba(179,18,60,.25)"; ctx.strokeRect(bx,y,bw,B-y);
  lab((y+B)/2,"조직","→ 몸",POS);
  /* 전방 방출 화살표 */
  ctx.strokeStyle=POS; ctx.lineWidth=2.6; ctx.fillStyle=POS;
  ctx.beginPath(); ctx.moveTo(bcx,y+8); ctx.lineTo(bcx,B-10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bcx-5,B-16); ctx.lineTo(bcx,B-10); ctx.lineTo(bcx+5,B-16); ctx.fill();
  /* 후방(흡수) — 위로 향하다 사라짐. 후면재 없으면 흡수도 없음 */
  if(hasBack){
    ctx.strokeStyle="rgba(64,72,82,.55)"; ctx.lineWidth=2; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(bcx,T+hBack*0.7); ctx.lineTo(bcx,T+10); ctx.stroke(); ctx.setLineDash([]);
  }

  /* ── 열2: 시간 영역 펄스 ── */
  const L1=W*0.33, W1=W*0.25, cy=(T+B)/2;
  ctx.fillStyle="rgba(43,61,80,.03)"; ctx.fillRect(L1-6,T-8,W1+12,B-T+16);
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(L1-6,cy); ctx.lineTo(L1+W1,cy); ctx.stroke(); ctx.setLineDash([]);
  const TSPAN=Math.max(2.4,7*sigT), tc=TSPAN/2, amp=(B-T)/2-6;
  const pts=[];
  for(let px=0;px<=W1;px++){ const tt=px/W1*TSPAN, env=Math.exp(-((tt-tc)**2)/(2*sigT*sigT)); pts.push([L1+px, cy-env*Math.sin(2*Math.PI*F0*(tt-tc))*amp*sens]); }
  fillWave(ctx,W,cy,pts);
  ctx.strokeStyle="rgba(43,61,80,.5)"; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
  [1,-1].forEach(sg=>{ ctx.beginPath(); for(let px=0;px<=W1;px++){ const tt=px/W1*TSPAN, yy=cy-sg*Math.exp(-((tt-tc)**2)/(2*sigT*sigT))*amp*sens; px?ctx.lineTo(L1+px,yy):ctx.moveTo(L1+px,yy); } ctx.stroke(); });
  ctx.setLineDash([]);
  const x1=L1+(tc-1.1774*sigT)/TSPAN*W1, x2=L1+(tc+1.1774*sigT)/TSPAN*W1;
  if(x2<L1+W1){ const yB=B+8; ctx.strokeStyle=AMBER; ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.moveTo(x1,yB-6); ctx.lineTo(x1,yB+6); ctx.moveTo(x2,yB-6); ctx.lineTo(x2,yB+6); ctx.moveTo(x1,yB); ctx.lineTo(x2,yB); ctx.stroke();
    ctx.textAlign="center"; chip(ctx,`${plen.toFixed(2)} mm`,(x1+x2)/2,yB+4,AMBER_DK,10.5); }
  ctx.textAlign="left"; chip(ctx,"② 시간 영역 · 송신 펄스",L1-6,26,INK,11);
  chip(ctx,"상대 진폭 = 감도",L1-6,H-14,MUTED,9.5,400);

  /* ── 열3: 스펙트럼 ── */
  const L2=W*0.63, W2=W-L2-16, T2=T, B2=B-14;
  const FMAX=11, X=f=>L2+f/FMAX*W2, G=f=>Math.exp(-((f-F0)**2)/(2*sigF*sigF));
  ctx.strokeStyle=WELL2; ctx.lineWidth=1;
  for(let f=2;f<=10;f+=2){ ctx.beginPath(); ctx.moveTo(X(f),T2); ctx.lineTo(X(f),B2); ctx.stroke(); }
  ctx.strokeStyle=INK; ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(L2,B2); ctx.lineTo(L2+W2,B2); ctx.stroke();
  for(let f=2;f<=10;f+=2){ ctx.beginPath(); ctx.moveTo(X(f),B2); ctx.lineTo(X(f),B2+6); ctx.stroke();
    ctx.textAlign="center"; label(ctx,`${f}`,X(f),B2+19,INK,10); }
  ctx.textAlign="center"; label(ctx,"주파수 (MHz)",L2+W2/2,B2+34,MUTED,9.5,400);
  const PH=B2-T2, pa=new Path2D(); pa.moveTo(X(0),B2);
  for(let i=0;i<=400;i++){ const f=FMAX*i/400; pa.lineTo(X(f), B2-G(f)*PH*sens); }
  pa.lineTo(X(FMAX),B2); pa.closePath();
  ctx.fillStyle="rgba(23,192,201,.55)"; ctx.fill(pa);
  ctx.strokeStyle=SIGNAL_DK; ctx.lineWidth=1.8; ctx.stroke(pa);
  [[0.5,"−6dB",POS,1.1774],[0.7071,"−3dB",MUTED,0.8326]].forEach(([lev,txt,col,k])=>{
    const yy=B2-lev*PH*sens, aa=X(F0-k*sigF), bb2=X(F0+k*sigF);
    ctx.strokeStyle=col; ctx.lineWidth=1.4; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(aa,yy); ctx.lineTo(bb2,yy); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(aa,yy-4); ctx.lineTo(aa,yy+4); ctx.moveTo(bb2,yy-4); ctx.lineTo(bb2,yy+4); ctx.stroke();
    ctx.textAlign="right"; chip(ctx,txt,aa-4,yy+4,col,10); ctx.textAlign="left"; chip(ctx,`${(2*k*sigF).toFixed(2)} MHz`,bb2+4,yy+4,col,10);
  });
  ctx.strokeStyle=AMBER; ctx.lineWidth=1.6; ctx.setLineDash([2,3]);
  ctx.beginPath(); ctx.moveTo(X(F0),B2); ctx.lineTo(X(F0),B2-PH*sens-10); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign="center"; chip(ctx,`f₀ = ${F0}`,X(F0),B2-PH*sens-14,AMBER_DK,10);
  ctx.textAlign="left"; chip(ctx,`③ 주파수 영역 · Q = ${Q.toFixed(2)}`,L2,26,INK,11);
  chip(ctx,"−6dB 가 −3dB 의 √2 배",L2,H-14,MUTED,9.5,400);
});
bkS.oninput = mtS.oninput = hero.redraw;
