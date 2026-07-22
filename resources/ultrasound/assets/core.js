/* ═══════════════════════════════════════════════════════════
   IBME LAB · 초음파 물리 교육자료 · 공통 유틸
   각 장의 애니메이션이 공유하는 코드입니다.
   보통은 이 파일을 고칠 일이 없습니다.
   ═══════════════════════════════════════════════════════════ */

/* ★ 버전 도장 — _check.html 이 이 값을 읽습니다.
   core.js 를 고칠 때마다 날짜를 올리세요. */
const CORE_VERSION = "2026-07-17";

/* ── 안전망 ─────────────────────────────────────────────────
   스크립트가 어디선가 죽으면 캔버스가 '조용히' 비어버려서
   원인을 알 수가 없습니다. 그래서 오류를 캔버스에 직접 찍습니다.
   가장 흔한 원인: assets/core.js 만 옛 버전이고 js/ 는 새 버전인 경우.  */
window.addEventListener("error", (ev) => {
  document.querySelectorAll("canvas").forEach(cv => {
    if (cv.dataset.errShown) return;
    const g = cv.getContext("2d");
    if (!g) return;
    cv.dataset.errShown = "1";
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#FFF5F7"; g.fillRect(0, 0, cv.width, cv.height);
    g.strokeStyle = "#B3123C"; g.lineWidth = 2; g.strokeRect(1, 1, cv.width - 2, cv.height - 2);
    g.fillStyle = "#B3123C"; g.font = "700 15px system-ui,sans-serif";
    g.fillText("애니메이션을 불러오지 못했습니다", 20, 36);
    g.fillStyle = "#2b3d50"; g.font = "400 12px monospace";
    g.fillText(String(ev.message).slice(0, 96), 20, 62);
    g.fillStyle = "#5b6b7b"; g.font = "400 13px system-ui,sans-serif";
    g.fillText("assets/core.js 와 js/ 폴더가 모두 최신인지 확인하세요.", 20, 90);
  });
});

/* 접근성: 사용자가 '동작 줄이기'를 켜두면 애니메이션을 정지 상태로 보여줍니다. */
const REDUCE = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── 캔버스 색상 · style.css 의 :root 와 같은 값이어야 합니다 ──
   캔버스는 CSS 변수를 못 읽으므로 여기에 한 번 더 적어둡니다.
   색을 바꾸실 땐 style.css 와 이 블록 두 곳을 같이 고치세요.        */
const BG        = [245, 247, 249];  /* --paper  #f5f7f9 */
const INK       = "#0b1622";
const INK2      = "#2b3d50";
const MUTED     = "#5b6b7b";
const LINE      = "#d9e0e7";
const SIGNAL    = "#17c0c9";        /* 시그니처 청록 */
const SIGNAL_DK = "#0e8f97";
const AMBER     = "#f0a500";        /* 경계면·λ·임계각 = '여기를 보세요' */
const AMBER_DK  = "#8a5f00";
const CARD      = "#ffffff";        /* --card */
const WELL      = "#fbfcfe";        /* 패널 안쪽 옅은 면 */
const WELL2     = "#eef3f7";        /* --line2 */
const POS       = "#B3123C";        /* 압축 */
const NEG       = "#1B4FA0";        /* 희박 */

/* ── 매질 물성 ──────────────────────────────────────────────
   c  = 음속 (m/s)          rho = 밀도 (kg/m³)
   a  = 감쇠 (dB/cm/MHz, 물만 dB/cm/MHz² 이라 sq:true)
   Z  = ρc / 1e6 로 자동 계산 (MRayl)
   ★ 수치를 고치려면 여기만 고치면 모든 장에 반영됩니다.       */
const MEDIA = [
  {ko:"공기",     en:"air",         rho:1.2,  c:343,  a:null, sq:false},
  {ko:"지방",     en:"fat",         rho:950,  c:1450, a:0.6,  sq:false},
  {ko:"물",       en:"water",       rho:1000, c:1480, a:0.0022, sq:true},
  {ko:"간",       en:"liver",       rho:1060, c:1550, a:0.5,  sq:false},
  {ko:"혈액",     en:"blood",       rho:1060, c:1570, a:0.2,  sq:false},
  {ko:"연부조직", en:"soft tissue", rho:1060, c:1540, a:0.5,  sq:false},
  {ko:"근육",     en:"muscle",      rho:1065, c:1590, a:1.0,  sq:false},
  {ko:"뼈",       en:"bone",        rho:1912, c:4080, a:20,   sq:false},
  {ko:"PZT-5H",   en:"PZT-5H",      rho:7500, c:4560, a:null, sq:false},
];
MEDIA.forEach(m => m.Z = m.rho * m.c / 1e6);
/* 이름으로 찾기:  med("근육")  */
const med = ko => MEDIA.find(m => m.ko === ko);

/* 감쇠계수 (dB/cm, 편도) — 주어진 주파수(MHz)에서 */
const alphaAt = (m, fMHz) => m.sq ? m.a * fMHz * fMHz : m.a * fMHz;

/* 수직입사 압력 반사계수 */
const reflCoef = (Z1, Z2) => (Z2 - Z1) / (Z2 + Z1);


/* ── makeScene ─────────────────────────────────────────────
   캔버스 하나를 통째로 관리합니다. draw(ctx, W, H, t) 만 쓰면
   크기조정 · DPR 보정 · 재생/일시정지 · 동작줄이기를 알아서 처리.

   makeScene("c1", 300, (ctx,W,H,t)=>{ ...그리기... }, {
     play : "play",    // 재생 버튼 id      (없으면 정지 화면)
     state: "hstate",  // 상태 표시 id      (선택)
     speed: 0.03,      // 프레임당 t 증가량
     tStill: 1.4       // 동작줄이기일 때 고정할 t
   });
   반환값의 .redraw() 를 슬라이더 oninput 에 연결하세요.        */
function makeScene(id, H, draw, opts = {}) {
  const cv = document.getElementById(id);
  const ctx = cv.getContext("2d");
  const speed = opts.speed ?? 0.03;
  let W = 900, t = opts.t0 ?? 0;
  let run = !!opts.play && !REDUCE;

  if (REDUCE && opts.tStill != null) t = opts.tStill;

  function size() {
    const d = window.devicePixelRatio || 1;
    W = cv.clientWidth;
    cv.width = W * d; cv.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }
  function render() { FS = 1.22 * Math.min(1, W / 946); ctx.clearRect(0, 0, W, H); draw(ctx, W, H, t); }
  function loop() { if (!run) return; t += speed; render(); requestAnimationFrame(loop); }

  if (opts.play) {
    const b = document.getElementById(opts.play);
    const s = opts.state ? document.getElementById(opts.state) : null;
    const label = () => {
      b.textContent = run ? "일시정지" : "재생";
      if (s) s.textContent = run ? "재생 중" : "정지";
    };
    b.onclick = () => { run = !run; label(); if (run) loop(); };
    label();
  }

  size();
  new ResizeObserver(() => { size(); render(); }).observe(cv);
  render();
  if (run) loop();
  return { redraw: render, reset() { t = opts.t0 ?? 0; render(); } };
}


/* ── 거울상법 (method of images) ───────────────────────────
   점 (x,y) 를, 점 p0 를 지나고 법선이 n 인 평면에 대해 거울반사.
   반환 [x', y', sd] — sd 는 부호거리 (음수면 음원측).
   04장 반사, 이후 굴절 장에서 공유합니다.                      */
function mirror(x, y, p0x, p0y, nx, ny) {
  const sd = nx * (x - p0x) + ny * (y - p0y);
  return [x - 2 * sd * nx, y - 2 * sd * ny, sd];
}


/* ── makeField ─────────────────────────────────────────────
   2D 음장을 픽셀 단위로 그립니다. 저해상도로 계산해 확대하므로
   느린 기기에서도 돌아갑니다. (S 를 키우면 더 빨라지고 거칠어짐)

   const F = makeField();
   ctx.drawImage(F.render(W,H,(x,y)=> 압력값 -1~1 또는 null), 0,0,W,H);
   null 을 반환하면 '영역 밖'(회색)으로 칠합니다.                */
function makeField(S = 3) {
  const off = document.createElement("canvas");
  const octx = off.getContext("2d");
  let img = null;
  return {
    render(W, H, fn) {
      const w = Math.ceil(W / S), h = Math.ceil(H / S);
      if (off.width !== w || off.height !== h) {
        off.width = w; off.height = h; img = octx.createImageData(w, h);
      }
      const d = img.data;
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          const p = fn(i * S, j * S);
          const o = (j * w + i) * 4;
          if (p === null) { d[o] = 241; d[o+1] = 243; d[o+2] = 247; d[o+3] = 255; continue; }
          const a = Math.min(1, Math.abs(p));
          const c = p > 0 ? [179, 18, 60] : [27, 79, 160];   /* POS / NEG */
          d[o]   = BG[0] + (c[0] - BG[0]) * a;
          d[o+1] = BG[1] + (c[1] - BG[1]) * a;
          d[o+2] = BG[2] + (c[2] - BG[2]) * a;
          d[o+3] = 255;
        }
      }
      octx.putImageData(img, 0, 0);
      return off;
    }
  };
}


/* ── makeCW ────────────────────────────────────────────────
   단일 주파수(CW) 음장 전용 고속 렌더러.  makeField 보다 수백 배 빠릅니다.

   원리 — 시간을 분리합니다:
       sin(kr − ωt) = sin(kr)·cos(ωt) − cos(kr)·sin(ωt)
                      └─ 시간 무관 ─┘
       p(x,y,t) = cos(ωt)·Re(x,y) − sin(ωt)·Im(x,y)
   Re, Im 은 슬라이더가 바뀔 때만 계산하면 되고,
   매 프레임은 곱셈 두 번이면 끝납니다.
   (수학적으로 makeField 와 완전히 동일합니다 — 근사가 아닙니다)

   const F = makeCW(4);
   ctx.drawImage(F.frame(W, H, OM*t, key, (x,y)=>{
       let re=0, im=0;
       for(...){ const r=...; const a=진폭;
                 re += a*Math.sin(k*r + φ);      // sin 성분
                 im += a*Math.cos(k*r + φ); }    // cos 성분
       return [re, im];                          // 영역 밖이면 null
   }), 0, 0, W, H);

     key : 슬라이더 값들을 이어 붙인 문자열. 바뀌면 위상자를 다시 계산합니다.
           예)  `${angS.value},${preS.value}`                             */
function makeCW(S = 3) {
  const off = document.createElement("canvas");
  const octx = off.getContext("2d");
  let img = null, RE = null, IM = null, MASK = null, lastKey = null;
  return {
    frame(W, H, phase, key, phasorFn) {
      const w = Math.ceil(W/S), h = Math.ceil(H/S), n = w*h;
      if (off.width !== w || off.height !== h) {
        off.width = w; off.height = h;
        img = octx.createImageData(w, h);
        RE = new Float32Array(n); IM = new Float32Array(n); MASK = new Uint8Array(n);
        lastKey = null;                     /* 크기가 바뀌면 무조건 재계산 */
      }
      if (key !== lastKey) {                /* ── 느린 부분 · 슬라이더 바뀔 때만 ── */
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
          const o = j*w + i, p = phasorFn(i*S, j*S);
          if (p === null) { MASK[o] = 0; RE[o] = IM[o] = 0; }
          else { MASK[o] = 1; RE[o] = p[0]; IM[o] = p[1]; }
        }
        lastKey = key;
      }
      /* ── 빠른 부분 · 매 프레임 ── */
      const ct = Math.cos(phase), st = Math.sin(phase), d = img.data;
      for (let o = 0; o < n; o++) {
        const q = o << 2;
        if (!MASK[o]) { d[q]=241; d[q+1]=243; d[q+2]=247; d[q+3]=255; continue; }
        const p = RE[o]*ct - IM[o]*st;
        const m = p < 0 ? -p : p, a = m > 1 ? 1 : m;
        if (p > 0) { d[q]=BG[0]+(179-BG[0])*a; d[q+1]=BG[1]+( 18-BG[1])*a; d[q+2]=BG[2]+( 60-BG[2])*a; }
        else       { d[q]=BG[0]+( 27-BG[0])*a; d[q+1]=BG[1]+( 79-BG[1])*a; d[q+2]=BG[2]+(160-BG[2])*a; }
        d[q+3] = 255;
      }
      octx.putImageData(img, 0, 0);
      return off;
    }
  };
}


/* ── 캔버스 그리기 도우미 ─────────────────────────────────── */

/* 화살표 달린 선 */
function ray(ctx, x1, y1, x2, y2, col, w) {
  ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const an = Math.atan2(y2 - y1, x2 - x1);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 12 * Math.cos(an - 0.4), y2 - 12 * Math.sin(an - 0.4));
  ctx.lineTo(x2 - 12 * Math.cos(an + 0.4), y2 - 12 * Math.sin(an + 0.4));
  ctx.closePath(); ctx.fill();
}

/* 캔버스 글자 배율 — 가시성이 부족하면 이 숫자만 키우세요. 모든 장에 반영됩니다. */
let FS = 1.22;      /* 폰트 스케일 — makeScene 이 캔버스 폭에 맞춰 갱신(좁은 창·2열에서 글자 겹침 방지) */
/* 캔버스 mono 폰트 — 홈페이지와 동일 */
const MONO = "'Spline Sans Mono','Noto Sans KR',monospace";

/* mono 라벨 (배경 없음 — 이미 단색 위에 얹을 때) */
function label(ctx, txt, x, y, col = INK, size = 11, weight = 700) {
  ctx.fillStyle = col;
  ctx.font = `${weight} ${(size * FS).toFixed(1)}px ${MONO}`;
  ctx.fillText(txt, x, y);
}

/* 배경 있는 라벨 — 음장·그림 위에 얹어도 항상 읽힙니다.
   글자가 뒤 그림과 겹쳐 안 보이면 label() 대신 이걸 쓰세요. */
function chip(ctx, txt, x, y, col = INK, size = 11, weight = 700) {
  ctx.font = `${weight} ${(size * FS).toFixed(1)}px ${MONO}`;
  const w = ctx.measureText(txt).width;
  const h = size * FS * 1.45;
  let x0 = x;
  if (ctx.textAlign === "center") x0 = x - w / 2;
  else if (ctx.textAlign === "right") x0 = x - w;
  ctx.fillStyle = "rgba(255,255,255,.88)";
  ctx.fillRect(x0 - 5, y - h * 0.78, w + 10, h);
  ctx.fillStyle = col;
  ctx.fillText(txt, x, y);
}

/* 압력 파형 채우기 (위=압축 빨강, 아래=희박 파랑) */
function fillWave(ctx, W, base, pts) {
  const path = new Path2D();
  path.moveTo(pts[0][0], base);
  pts.forEach(q => path.lineTo(q[0], q[1]));
  path.lineTo(pts[pts.length - 1][0], base);
  path.closePath();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, base); ctx.clip();
  ctx.fillStyle = "rgba(179,18,60,.78)"; ctx.fill(path); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, base, W, 9999); ctx.clip();
  ctx.fillStyle = "rgba(27,79,160,.78)"; ctx.fill(path); ctx.restore();
}
