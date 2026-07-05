/* ═══════════════════════════════════════════════════════════════════════
   IBME Lab 홈페이지 — 콘텐츠 파일  (data.js)

   ★★★ 이 파일 하나만 고치면 홈페이지 내용이 바뀝니다. index.html은 안 건드려도 돼요. ★★★

   [ 편집하는 법 ]
   1) GitHub에서 이 파일(data.js)을 엽니다
   2) 오른쪽 위 연필(✏️) 아이콘을 누릅니다
   3) 아래 내용에서 따옴표 " " 안의 글자만 바꿉니다
   4) 맨 아래 "Commit changes" 버튼을 누릅니다  →  1~2분 뒤 홈페이지에 자동 반영

   [ 꼭 지킬 규칙 ]  ← 이것만 지키면 안 깨져요
   · 따옴표(")로 감싼 글자만 바꾸세요. 따옴표 자체는 지우지 마세요.
   · 항목 끝의 쉼표(,)는 그대로 두세요.
   · 새 항목을 추가할 때는 "기존 한 줄(또는 { } 한 덩어리)을 통째로 복사"한 뒤 내용만 바꾸는 게 가장 안전합니다.
   · 글 안에서 줄바꿈을 하고 싶으면 그냥 엔터를 치면 됩니다. (백틱 ` ` 으로 감싼 항목에서)
   · **굵게** 처럼 별표 2개로 감싸면 그 부분이 굵게 표시됩니다.

   ※ 아래 사진 주소(https://...)는 예시입니다. 교수님 사진 주소로 바꾸는 법은
     맨 아래 [사진 넣는 법] 설명을 참고하세요.
   ═══════════════════════════════════════════════════════════════════════ */

const SITE = {

  /* ───────── ① 기본 정보 (맨 위 로고/제목/푸터에 쓰임) ───────── */
  meta: {
    labShort:   "IBME Lab",
    labFull:    "Intelligent Bio-Medical Engineering Laboratory",
    university: "Kangnam University",
    division:   "Division of Electronic & Semiconductor Engineering",
    since:      "Since April 2022",
  },

  /* ───────── ② 메인 상단 큰 문구 (Hero) ───────── */
  hero: {
    eyebrow:  "INTELLIGENT BIO-MEDICAL ENGINEERING LABORATORY",
    title:    "IBME Lab",
    subtitle: "AI · Ultrasound Imaging · IoT for Healthcare",
    tagline:  "강남대학교 전자반도체공학부 지능형 의공학 연구실",
  },

  /* ───────── ③ About Us (연구실 소개) ───────── */
  about: {
    heading: "About Us",
    // 문단을 나누려면 그냥 빈 줄(엔터 두 번)을 넣으세요.
    body: `The Intelligent Bio-Medical Engineering Laboratory (IBME Lab.) was established in April 2022 and belongs to the Division of Electronic & Semiconductor Engineering at Kangnam University.

Our laboratory focuses on developing AI-driven intelligent biomedical systems for improving human healthcare. To this end, we are researching various fields such as artificial intelligence, biomedical ultrasound imaging systems, IoT device design, deep learning, image processing, digital signal processing, and embedded systems.

(← 이 부분을 실제 연구실 소개 문구로 바꾸세요. 원하는 만큼 문단을 추가해도 됩니다.)`,
  },

  /* ───────── ④ 모집 공고 박스 (메인에 눈에 띄게 표시됨) ─────────
     당장 모집 공고가 없으면 show: false 로 바꾸면 박스가 사라집니다. */
  recruit: {
    show:  true,
    tag:   "RECRUITMENT",
    title: "2026학년도 학부연구생 / 대학원생 모집",
    body: `IBME Lab.에서 함께 연구할 학부연구생과 대학원생을 모집합니다.

관심 있는 학생은 자기소개서(1장 이내)와 성적표를 첨부하여 아래 이메일로 연락 주세요.

(← 실제 모집 내용으로 바꾸세요.)`,
    email: "jihunk@kangnam.ac.kr",
  },

  /* ───────── ⑤ 지도교수 정보 (Members 페이지 상단) ───────── */
  professor: {
    nameKr:      "김지훈 (Jihun Kim, Ph.D.)",
    role:        "Assistant Professor",
    affiliation: "Division of Electronic & Semiconductor Engineering, Kangnam University",
    office:      "이공관 000호 (Room 000, Science & Engineering Bldg.)",
    email:       "jihunk@kangnam.ac.kr",
    tel:         "+82-31-280-0000",
    photo:       "",   // ← 교수님 사진 주소를 넣으세요. 비워두면 이니셜만 표시됩니다.

    // 학력 — 한 줄에 하나씩. 새 줄 추가는 기존 줄 복사 후 수정.
    education: [
      "Ph.D. in ○○○ Engineering, ○○ University, Korea (2019)",
      "B.S. in ○○ Engineering, ○○ University, Korea (2015)",
    ],

    // 경력
    experience: [
      "Postdoctoral Researcher, ○○ University, USA (2021 – 2022)",
      "Postdoctoral Researcher, ○○ University, USA (2019 – 2020)",
    ],

    // 학회/대외 활동 (없으면 [] 로 비워도 됩니다)
    activities: [
      "대한의용생체공학회 의료초음파 분과위원",
      "Reviewer: IEEE TUFFC, IEEE JBHI, Biomedical Optics Express",
    ],
  },

  /* ───────── ⑥ 재학생 (Members) ─────────
     새 멤버 추가:  { } 한 덩어리를 통째로 복사해서 맨 아래 붙여넣고 내용만 수정. */
  students: [
    {
      name:  "홍길동 (Gildong Hong)",
      role:  "M.S. Student",          // 예: "M.S. Student" / "Undergraduate Researcher"
      email: "student@kangnam.ac.kr",
      photo: "",                       // 사진 주소 (비워두면 이니셜 표시)
    },
    {
      name:  "김영희 (Younghee Kim)",
      role:  "Undergraduate Researcher",
      email: "student2@kangnam.ac.kr",
      photo: "",
    },
    // ↑ 위 { … }, 를 복사해서 멤버를 계속 추가하세요.
  ],

  /* ───────── ⑦ 졸업생 (Alumni) ─────────
     note 에는 진로/현재 소속 등을 적으면 됩니다. 없으면 "" 로 두세요. */
  alumni: {
    graduate: [   // 대학원 졸업생
      { name: "○○○", period: "2023.03 – 2025.02", note: "現 ○○대학교 박사과정" },
    ],
    undergraduate: [  // 학부연구생 출신
      { name: "○○○", period: "2024.01 – 2024.12", note: "現 (주)○○○" },
    ],
  },

  /* ───────── ⑧ Research (연구 분야) ─────────
     연구 주제 추가:  { } 덩어리 복사 → 내용 수정. image 는 비워도 됩니다. */
  research: [
    {
      tag:   "ULTRASOUND IMAGING",
      title: "초해상도 초음파 영상 (Super-Resolution Ultrasound Imaging)",
      body:  `(연구 주제에 대한 설명을 여기에 적으세요.)

Ultrasound localization microscopy (ULM) 등 회절 한계를 넘어서는 초해상도 영상 기법과, 딥러닝 기반 영상 복원 기술을 연구합니다.`,
      image: "",
    },
    {
      tag:   "MEDICAL AI",
      title: "딥러닝 기반 의료영상 분석",
      body:  `(연구 주제에 대한 설명을 여기에 적으세요.)`,
      image: "",
    },
    // ↑ 복사해서 연구 주제를 계속 추가하세요.
  ],

  /* ───────── ⑨ Publications (논문·특허·학회·저서) ─────────
     새 논문 추가:  목록 "맨 위"에 아래 형식으로 한 줄 추가하는 걸 추천 (최신순 유지)
       { c: "저자, (연도). 제목. 저널명, 권(호).", doi: "10.xxxx/xxxxx" },
     · doi(논문 고유번호)가 없으면 doi 부분을 빼고  { c: "..." },  만 써도 됩니다.
     · doi 를 넣으면 제목이 자동으로 원문 링크가 됩니다. */
  publications: {

    // 국제 저널 (SCI 등)
    journalIntl: [
      { c: "Author, A., Kim, J. (2025). Paper title goes here. Journal Name, 00(0).", doi: "10.0000/example" },
      { c: "Author, B., Kim, J. (2024). Another paper title. Journal Name, 00(0).", doi: "" },
    ],

    // 국내 저널 (KCI 등) — 없으면 [] 로 비워도 됩니다
    journalDomestic: [
      { c: "저자, (2023). 국내 논문 제목. 학회지명. [KCI 등재]", doi: "" },
    ],

    // 국제 특허
    patentsIntl: [
      "Inventor, **Kim, J.**, et al. (2021). U.S. Patent No. 00,000,000.",
    ],

    // 국내 특허
    patentsDomestic: [
      "발명자, **김지훈**, 외, \"특허 제목\", 대한민국 특허 등록번호 10-0000000 (2022.00.00)",
    ],

    // 국제 학회 발표
    conferencesIntl: [
      "**Jihun Kim**, et al., \"Conference paper title\", 2024 IEEE IUS, City, Country (2024.09)",
    ],

    // 저서 / 북 챕터 — 없으면 [] 로 비워도 됩니다
    books: [
      { c: "Kim, J., et al., \"Chapter title\" in Book Title, Publisher, pp.000–000, 2019.", doi: "" },
    ],
  },

  /* ───────── ⑩ Teaching (강의) ───────── */
  teaching: {
    undergraduate: {
      semester1: [   // 1학기
        "논리회로설계 (Logic Circuit Design)",
        "디지털시스템설계 (Digital System Design)",
      ],
      semester2: [   // 2학기
        "인공지능 (Artificial Intelligence)",
        "마이크로프로세서 (Microprocessor)",
      ],
    },
    graduate: {
      semester1: [
        "고급인공지능특론 (Advanced Artificial Intelligence)",
      ],
      semester2: [
        "의료영상처리특론 (Advanced Medical Image Processing)",
      ],
    },
  },

  /* ───────── ⑪ Lab Q&A (자주 묻는 질문) ─────────
     질문 추가:  { q: "질문", a: `답변` },  형식으로 추가. */
  qna: [
    {
      q: "연구실에서는 어떤 연구를 하나요?",
      a: `(답변을 여기에 적으세요.)

IBME Lab.은 인공지능 기반 지능형 의공학 시스템 개발을 목표로 다양한 분야를 연구합니다.`,
    },
    {
      q: "학부연구생은 어떤 활동을 하나요?",
      a: `(답변을 여기에 적으세요.)`,
    },
    {
      q: "연구실 합류를 위해 무엇을 준비해야 하나요?",
      a: `(답변을 여기에 적으세요.)

관심 있는 학생은 jihunk@kangnam.ac.kr 로 연락 주세요.`,
    },
  ],

  /* ───────── ⑫ Announcement (연구실 소식) ─────────
     최신 소식을 "맨 위"에 추가하세요.
       { date: "2026.05.09", text: `소식 내용`, images: ["사진주소1", "사진주소2"] },
     · 사진이 없으면  images: []  로 두세요.
     · **굵게** 별표 2개로 감싸면 굵게 표시됩니다. */
  news: [
    {
      date: "2026.05.09",
      text: `2026 대한의용생체공학회 춘계학술대회에 참가하여 포스터 발표를 진행하였습니다. **우수 포스터상**을 수상하였습니다. 축하합니다!`,
      images: [],
    },
    {
      date: "2026.03.01",
      text: `○○○, ○○○ 학생이 석사과정으로 진학하였습니다. 환영합니다!`,
      images: [],
    },
    {
      date: "2025.03.01",
      text: `김지훈 교수가 한국연구재단 ○○연구 과제에 선정되었습니다.`,
      images: [],
    },
    // ↑ 복사해서 소식을 계속 추가하세요. (최신 소식이 맨 위)
  ],
};

/* ═══════════════════════════════════════════════════════════════════════
   [ 사진 넣는 법 ]

   방법 A) 이 저장소(GitHub)에 사진 파일을 올려서 쓰기  ← 가장 추천
     1) GitHub 저장소에서 "images" 폴더를 클릭
     2) "Add file" → "Upload files" 로 사진을 올림 (예: prof.jpg)
     3) 이 파일에서 photo 칸에  "images/prof.jpg"  라고 적으면 끝
        (예:  photo: "images/prof.jpg",  )

   방법 B) 이미 인터넷에 있는 사진 주소 붙여넣기
     · 사진 주소(https://... 로 끝나는 것)를 photo 칸에 그대로 붙여넣으면 됩니다.

   ※ 사진을 안 넣으면 멤버는 이름 이니셜이 예쁘게 표시되고,
     연구/소식은 사진 없이 글만 깔끔하게 나옵니다. 급하지 않으면 나중에 넣어도 돼요.
   ═══════════════════════════════════════════════════════════════════════ */
