/* ═══ 18 영상 아티팩트 · 갤러리 ═══
   합성 B-Mode 위에 아티팩트를 하나씩 얹습니다.
   기본 구조: 횡격막(평면) · 낭종(액체) · 결석 · 공기방울 · 점 표적 */
const ON = [false,false,false,false,false,false];
const NAMES = ["잔향","거울상","음향 음영","후방 증강","사이드로브","혜성꼬리"];
ON.forEach((_,i)=>{
  const b=document.getElementById("t"+i);
  b.onclick=()=>{ ON[i]=!ON[i]; b.classList.toggle("on",ON[i]); scene.redraw(); };
});

const rnd = (a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };

const scene = makeScene("c1", 440, (ctx,W,H)=>{
  const st=document.getElementById("astat");
  const on=NAMES.filter((_,i)=>ON[i]);
  st.textContent = on.length ? on.join(" · ") + " 켜짐" : "기본 영상 — 아티팩트 없음";
  st.style.color = on.length ? POS : MUTED;

  const L=44, R=16, T=34, PW=W-L-R, PH=H-T-30;
  /* 정규화 좌표 */
  const DIA = 0.30;      /* 횡격막 깊이 */
  const CYST = {x:0.30, y:0.55, r:0.10};
  const STONE= {x:0.62, y:0.42, r:0.035};
  const BUB  = {x:0.82, y:0.30, r:0.018};
  const PT   = {x:0.47, y:0.22};

  function amp(x,y){
    let v = 0.10 + 0.07*rnd(Math.floor(x*260), Math.floor(y*260));   /* 스페클 */
    /* 횡격막 — 밝은 평면 */
    v += 0.85*Math.exp(-((y-DIA)**2)/(2*0.008**2));
    /* 낭종 — 무에코 */
    const dc = Math.hypot((x-CYST.x)*1.0, (y-CYST.y)*1.0);
    if(dc < CYST.r) v = 0.02;
    else if(dc < CYST.r+0.012) v = 0.55;                              /* 낭종 벽 */
    /* 결석 — 아주 밝음 */
    const ds = Math.hypot(x-STONE.x, y-STONE.y);
    if(ds < STONE.r) v = 1.0;
    /* 공기방울 */
    const db = Math.hypot(x-BUB.x, y-BUB.y);
    if(db < BUB.r) v = 1.0;
    /* 점 표적 */
    const dp = Math.hypot((x-PT.x)*2.2, (y-PT.y)*4.0);
    v += 0.9*Math.exp(-(dp*dp)/(2*0.012**2));

    /* ── 아티팩트 ── */
    if(ON[0] && Math.abs(x-0.5)<0.42){                                /* 잔향 */
      for(let n=2;n<=4;n++){
        const yy = DIA*n;
        if(yy<1) v += 0.85/(n*n)*Math.exp(-((y-yy)**2)/(2*0.008**2));
      }
    }
    if(ON[1] && y>DIA){                                               /* 거울상 */
      const ym = 2*DIA - y;                                            /* 횡격막에 대한 거울 */
      if(ym>0.05){
        const dpm = Math.hypot((x-PT.x)*2.2, (ym-PT.y)*4.0);
        v += 0.35*Math.exp(-(dpm*dpm)/(2*0.012**2));
        const dcm = Math.hypot(x-CYST.x, ym-CYST.y);
        if(dcm<CYST.r) v *= 0.45;
      }
    }
    if(ON[2] && Math.abs(x-STONE.x)<STONE.r && y>STONE.y+STONE.r) v *= 0.06;   /* 음영 */
    if(ON[3] && Math.abs(x-CYST.x)<CYST.r && y>CYST.y+CYST.r)                  /* 후방 증강 */
      v *= 1.0 + 1.9*Math.exp(-((y-CYST.y-CYST.r)**2)/(2*0.16**2));
    if(ON[4]){                                                        /* 사이드로브 = 나는 새 */
      for(const s of [-1,1]) for(let n=1;n<=3;n++){
        const lx = PT.x + s*n*0.045;                                   /* 옆으로 */
        const ly = PT.y + n*n*0.010;                                   /* 경로가 길어 깊게 */
        const d = Math.hypot((x-lx)*2.2, (y-ly)*4.0);
        v += (0.34/n)*Math.exp(-(d*d)/(2*0.011**2));
      }
    }
    if(ON[5] && Math.abs(x-BUB.x)<BUB.r*1.6 && y>BUB.y)               /* 혜성꼬리 */
      v += 0.9*Math.exp(-((y-BUB.y)/0.34));
    return Math.min(1.2, v);
  }

  /* 렌더 */
  for(let j=0;j<PH;j+=2) for(let i=0;i<PW;i+=2){
    const g = Math.round(255-232*Math.min(1,amp(i/PW, j/PH)));
    ctx.fillStyle = `rgb(${g},${g+2},${g+5})`;
    ctx.fillRect(L+i, T+j, 2, 2);
  }
  ctx.strokeStyle=LINE; ctx.lineWidth=1; ctx.strokeRect(L,T,PW,PH);
  ctx.fillStyle=INK; ctx.fillRect(L,T-8,PW,6);

  const X = x=>L+x*PW, Y = y=>T+y*PH;
  const mark = (x,y,txt,col)=>{ ctx.textAlign="center"; chip(ctx,txt,x,y,col,9.5); ctx.textAlign="left"; };
  /* 진짜 구조 라벨 */
  mark(X(0.12), Y(DIA)-10, "횡격막", INK);
  mark(X(CYST.x), Y(CYST.y), "낭종", INK);
  mark(X(STONE.x), Y(STONE.y)-14, "결석", INK);
  mark(X(BUB.x), Y(BUB.y)-14, "공기", INK);
  mark(X(PT.x)+2, Y(PT.y)-14, "점 표적", INK);

  /* 아티팩트 라벨 — 붉은색 = 실제로 없는 것 */
  if(ON[0]) for(let n=2;n<=3;n++) if(DIA*n<0.95) mark(X(0.14), Y(DIA*n)-9, `잔향 ${n}차`, POS);
  if(ON[1]) mark(X(PT.x), Y(2*DIA-PT.y)+16, "거울상 (가짜)", POS);
  if(ON[2]) mark(X(STONE.x), Y(0.78), "음영", POS);
  if(ON[3]) mark(X(CYST.x), Y(0.84), "후방 증강", POS);
  if(ON[4]) mark(X(PT.x)+66, Y(PT.y)+30, "날개 = 사이드로브", POS);
  if(ON[5]) mark(X(BUB.x), Y(0.62), "혜성꼬리", POS);
  if(ON[1]){
    ctx.strokeStyle="rgba(179,18,60,.55)"; ctx.lineWidth=1.4; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(X(PT.x), Y(PT.y)); ctx.lineTo(X(PT.x), Y(2*DIA-PT.y)); ctx.stroke();
    ctx.setLineDash([]);
  }
  chip(ctx,"합성 B-Mode", L+4, T+14, INK, 11);
  ctx.textAlign="right";
  chip(ctx, on.length? `${on.length}개 아티팩트` : "아티팩트 없음", W-8, 20, on.length?POS:MUTED, 10.5);
  ctx.textAlign="left";
  ctx.save(); ctx.translate(L-14, T+PH/2); ctx.rotate(-Math.PI/2);
  label(ctx,"깊이", -14, 0, MUTED, 9.5, 400); ctx.restore();
});
