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

    // 국제 저널 (Peer-Reviewed) — 최신 논문을 맨 위에 추가하세요.
    //   형식: { c: "저자, (연도). 제목. 저널명, 권(호).", doi: "10.xxxx/xxxxx" },
    //   · doi 를 넣으면 제목이 자동으로 원문 링크가 됩니다. doi 가 없으면 doi: "" 로 두세요.
    journalIntl: [
      { c: "Kim, S., Noh, S., Jseong, S., Kim, C., Lee, H.†, Kim, J.†, (2026). Enhancing Trajectory Estimation with Convolutional IMU Transformer. IEEE Sensors Journal, 26(9). (†: co-corresponding authors)", doi: "10.1109/JSEN.2026.3673719" },
      { c: "Lee, H., Lee, K., Kim, J., (2025). Few-Shot Anomaly Detection for Medical Ultrasound Images Using Metric Learning and Multimodal BiomedCLIP Embeddings. The Journal of Korean Institute of Communication and Information Sciences, 51(10). [SCOPUS]", doi: "10.7840/kics.2025.50.10.1505" },
      { c: "Lee, H., Lee, K., Yoon, J.P., Kim, J.† and Kim, J.Y.†, (2025). Real-Time Self-Supervised Ultrasound Image Enhancement Using Test-Time Adaptation for Sophisticated Rotator Cuff Tear Diagnosis. IEEE Signal Processing Letters. (†: co-corresponding authors)", doi: "10.1109/LSP.2025.3557754" },
      { c: "Choi, H., Yu, J. and Kim, J., (2024). Improving lateral resolution in ultrasound imaging through structured illumination techniques. The Journal of the Acoustical Society of Korea, 43(6), pp.663–670. [SCOPUS]", doi: "10.7776/ASK.2024.43.6.663" },
      { c: "Lee, M., Park, H.Y., Lee, K., Kim, S., Kim, J., Hwang, J.Y. (2023). Ultrasound-optical imaging-based multimodal imaging technology for biomedical applications. The Journal of the Acoustical Society of Korea. [SCOPUS]", doi: "10.7776/ASK.2023.42.5.429" },
      { c: "Kim, S.H., Lee, K., Lee, S.W., Chang, J.H., Hwang, J.Y., Kim, J. (2023). Comparative study on keypoint detection for developmental dysplasia of hip diagnosis using deep learning models in X-ray and ultrasound images. The Journal of the Acoustical Society of Korea. [SCOPUS]", doi: "10.7776/ASK.2023.42.5.460" },
      { c: "Kou, Z., You, Q., Kim, J., Dong, Z., Lowerison, M.R., Sekaran, N.V.C., … & Oelze, M.L. (2023). High-level synthesis design of scalable ultrafast ultrasound beamformer with single FPGA. IEEE Transactions on Biomedical Circuits and Systems.", doi: "10.1109/TBCAS.2023.3267614" },
      { c: "Kim, J., Lowerison, M.R., Sekaran, N.V.C., Kou, Z., Dong, Z., Oelze, M., Llano, D.A., & Song, P. (2022). Improved Ultrasound Localization Microscopy Based on Microbubble Uncoupling via Transmit Excitation. IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, 69(3), 1041–1052.", doi: "10.1109/TUFFC.2022.3143864" },
      { c: "Dong, Z., Kim, J., Huang, C., Lowerison, M.R., Lok, U.W., Chen, S., & Song, P. (2022). Three-dimensional Shear Wave Elastography Using a 2D Row Column Addressing (RCA) Array. BME Frontiers, 2022.", doi: "10.34133/2022/9879632" },
      { c: "Kim, J., Wang, Q., Zhang, S., & Yoon, S. (2021). Compressed sensing-based super-resolution ultrasound imaging for faster acquisition and high quality images. IEEE Transactions on Biomedical Engineering, 68(11), 3317–3326.", doi: "10.1109/TBME.2021.3070487" },
      { c: "Kim, J., Lew, H.M., Kim, J.H., Youn, S., Al Faruque, H., Seo, A.N., … & Hwang, J.Y. (2020). Forward-Looking Multimodal Endoscopic System Based on Optical Multispectral and High-Frequency Ultrasound Imaging Techniques for Tumor Detection. IEEE Transactions on Medical Imaging, 40(2), 594–606.", doi: "10.1109/TMI.2020.3032275" },
      { c: "Kim, E., Anguluan, E., Youn, S., Kim, J., Hwang, J.Y., & Kim, J.G. (2019). Non-invasive measurement of hemodynamic change during 8 MHz transcranial focused ultrasound stimulation using near-infrared spectroscopy. BMC Neuroscience, 20(1), 1–7.", doi: "10.1186/s12868-019-0493-9" },
      { c: "Kim, S., Kim, J., Hwang, M., Kim, M., Jo, S.J., Je, M., … & Hwang, J.Y. (2019). Smartphone-based multispectral imaging and machine-learning based analysis for discrimination between seborrheic dermatitis and psoriasis on the scalp. Biomedical Optics Express, 10(2), 879–891.", doi: "10.1364/BOE.10.000879" },
      { c: "Youn, S., Choi, J.W., Lee, J.S., Kim, J., Yang, I.H., Chang, J.H., … & Hwang, J.Y. (2019). Acoustic trapping technique for studying calcium response of a suspended breast cancer cell: Determination of its invasion potentials. IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control, 66(4), 737–746.", doi: "10.1109/TUFFC.2019.2894662" },
      { c: "Kim, J., Al Faruque, H., Kim, S., Kim, E., & Hwang, J.Y. (2019). Multimodal endoscopic system based on multispectral and photometric stereo imaging and analysis. Biomedical Optics Express, 10(5), 2289–2302.", doi: "10.1364/BOE.10.002289" },
      { c: "Kim, J.†, Shin, T.J.†, Kong, H.J., Hwang, J.Y., & Hyun, H.K. (2019). High-frequency ultrasound imaging for examination of early dental caries. Journal of Dental Research, 98(3), 363–367. (†: co-first authors)", doi: "10.1177/0022034518811642" },
      { c: "Kim, J., Seo, A., Kim, J.Y., Choi, S.H., Yoon, H.J., Kim, E., & Hwang, J.Y. (2017). A multimodal biomicroscopic system based on high-frequency acoustic radiation force impulse and multispectral imaging techniques for tumor characterization ex vivo. Scientific Reports, 7(1), 1–12.", doi: "10.1038/s41598-017-17367-1" },
      { c: "Choi, J.†, Kim, J.†, Hwang, J.Y., Je, M., Kim, J.Y., & Kim, S.Y. (2017). A novel smart navigation system for intramedullary nailing in orthopedic surgery. PLoS ONE, 12(4), e0174407. (†: co-first authors)", doi: "10.1371/journal.pone.0174407" },
      { c: "Kim, S., Cho, D., Kim, J., Kim, M., Youn, S., Jang, J.E., … & Hwang, J.Y. (2016). Smartphone-based multispectral imaging: system development and potential for mobile skin diagnosis. Biomedical Optics Express, 7(12), 5294–5307.", doi: "10.1364/BOE.7.005294" },
      { c: "Hwang, J.Y., Kim, J., Park, J.M., Lee, C., Jung, H., Lee, J., & Shung, K.K. (2016). Cell deformation by single-beam acoustic trapping: a promising tool for measurements of cell mechanics. Scientific Reports, 6(1), 1–8.", doi: "10.1038/srep27238" },
    ],

    // 국내 저널 (Peer-Reviewed) — 없으면 [] 로 비워도 됩니다
    journalDomestic: [
      { c: "최현수, 이주영, 김지훈. (2023). IoT 기반 반려동물 추적 시스템 설계. 대한전기학회 논문지 P권. [KCI 등재]", doi: "10.5370/KIEEP.2023.72.1.70" },
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
      date: "2026.05.07 – 2026.05.09",
      text: `제주 신화월드리조트에서 개최된 2026년도 대한의용생체공학회 춘계학술대회에 참여하여 연구 발표를 진행하였습니다.

[Poster] **[우수 포스터상]** "압축 센싱 기반 초음파 국소화 현미경 기법: 미세기포 주입률 변화에 따른 in situ microvessel phantom 실험" — 문성빈, 조원빈, 김지훈
[Poster] "High Resolution Ultrasound Biomicroscopy of Ex-Vivo Bovine Eye based on IQ-domain 3D VSSA-CFW Beamforming" — 송덕미, 서정배, 이승엽, 황재윤, 김지훈`,
      images: [],
    },
    {
      date: "2026.05.01",
      text: `우리 연구실에서 2024년에 졸업한 김성현 학생(학부연구생 시절 수행)의 연구 논문이 SCIE 저널인 IEEE Sensors Journal에 최종 게재되었습니다. 본 논문은 약 2년간의 리비전 과정을 거쳐 게재가 확정되었으며, IMU 기반 궤적 추정 성능 향상을 위한 Transformer 기반 모델을 제안한 연구입니다. 긴 시간 동안 성실히 연구를 수행하여 훌륭한 성과를 이룬 것을 진심으로 축하합니다!

Kim, S., Noh, S., Jseong, S., Kim, C., Lee, H.†, Kim, J.†, (2026). Enhancing Trajectory Estimation with Convolutional IMU Transformer. IEEE Sensors Journal, 26(9).`,
      images: [],
    },
    {
      date: "2026.03.27",
      text: `서동훈 학생이 학부연구생으로서 IBME 연구실에 참여한 것을 환영합니다!`,
      images: [],
    },
    {
      date: "2026.03.01",
      text: `문성빈, 서정배, 조원빈 학생의 석사과정 진학을 환영합니다!`,
      images: [],
    },
    {
      date: "2025.11.27",
      text: `서정배 학생이 학부연구생으로서 IBME 연구실에 참여한 것을 환영합니다!`,
      images: [],
    },
    {
      date: "2025.11.18",
      text: `이서용, 이근영 학생이 학부연구생으로서 IBME 연구실에 참여한 것을 환영합니다!`,
      images: [],
    },
    {
      date: "2025.11.06 – 2025.11.08",
      text: `인제대학교에서 개최된 2025년도 대한의용생체공학회 추계학술대회에 참여해 연구 발표를 진행하였습니다.

[Poster] "Evaluation of Hybrid Synthetic Aperture and Coherence-Enhanced Beamforming Methods in Scanning Acoustic Microscopy" — 송덕미, 최호진, 이승엽, 황재윤, 김지훈
[Poster] "Ultrasound Localization Microscopy Enhanced through Compressed sensing in Frequency Domain" — 문성빈, 김지훈`,
      images: [],
    },
    {
      date: "2025.10.22 – 2025.10.25",
      text: `강원도 고성군 델피노리조트에서 개최된 2025년도 대한전기학회 정보 및 제어 부문회 (CICS'25)에 참여하여 3개 주제의 연구 발표 등을 진행하였습니다.

[Oral] **[신진연구자상]** "From Scanning Acoustic Microscopy to Coded Mask: Advanced NDT of Semiconductor Packages with Single-element Ultrasound" — 김지훈
[Poster] "Computation Ultrasound Imaging with a Single-element Transducer and Coded Mask" — 문성빈, 조원빈, 최호진, 김지훈
[Poster] "Performance Evaluation of Advanced Beamforming Algorithms for 3D Scanning Acoustic Microscopy" — 송덕미, 최호진, 김지훈`,
      images: [],
    },
    {
      date: "2025.09.23",
      text: `오은찬 학생이 학부연구생으로서 IBME 연구실에 참여한 것을 환영합니다!`,
      images: [],
    },
    {
      date: "2025.09.01",
      text: `송덕미 학생의 석사과정 진학을 환영합니다!`,
      images: [],
    },
    {
      date: "2025.06.15 – 2025.06.18",
      text: `대구광역시 수성호텔 및 DGIST에서 개최된 2025년도 16th International Conference on Ultrasound Engineering for Biomedical Applications (IC-UEBA 2025)의 Technical Program Committee로 참여하여 학회 운영, Session Chair, 연구 포스터 발표 등을 진행하였습니다.

[Poster] "Enhanced 3D Ultrasound Biomicroscopic System with Virtual-Source Synthetic Aperture with Coherence Factor Weighting" — 송덕미, 김지훈
[Poster] "Performance Benchmarking of Compressed-sensing based Microbubble-Localization for Ultrasound Localization Microscopy" — 문성빈, 최호진, 김지훈
[Poster] "Ultrasound Holographic Illumination for Improved Spatial Resolution in Endoscopic Ultrasound Imaging" — 최현수, 이문환, 황재윤, 김지훈`,
      images: [],
    },
    {
      date: "2025.06.12 – 2025.06.13",
      text: `제주도 메종글래드 제주에서 개최된 2025년도 하계종합학술대회 및 대학생논문경진대회에 참여해 연구 발표를 진행하였습니다.

[Invited Talk] "Introduction to Advanced Super-resolution Ultrasound Imaging Technique" — 김지훈
[대학생논문경진대회] **[우수 논문상·은상]** "다양한 환경 조건 하에서의 YOLOv8-OBB를 활용한 SAR 선박 탐지 성능 평가" — 조원빈, 김지훈
[대학생논문경진대회] **[우수 논문상·동상]** "4차원 블록 매칭 필터링을 이용한 반도체 웨이퍼 결함 검출용 고주파 초음파 영상 향상 기법" — 문성빈, 조원빈, 최호진, 김지훈`,
      images: [],
    },
    {
      date: "2025.05.08 – 2025.05.10",
      text: `제주도 롯데호텔 중문에서 개최된 2025년도 제65회 대한의용생체공학회 춘계학술대회에 참여해 연구 발표를 진행하였습니다.

[Invited Talk] "Advanced Technique for Super-Resolution Ultrasound Imaging" — 김지훈
[Poster] "Improving Spatial Resolution Beyond the Focal Zone in Ultrasound Biomicroscopy via 3D VSSA-CFW and Real-ESRGAN" — 송덕미, 조원빈, 이문환, 황재윤, 김지훈
[Poster] "Performance Benchmarking of Compressed Sensing based Localization Technique for Ultrasound Localization Microscopy" — 문성빈, 최호진, 김지훈`,
      images: [],
    },
    {
      date: "2025.04.18",
      text: `김지훈 교수는 2025년 4월 18일에 개최된 강남대학교 개교 79주년 기념식에서 **"교육 부문 공로상"** 과 **"우수연구자상"** 을 수상하였습니다.`,
      images: [],
    },
    {
      date: "2025.03.01",
      text: `김지훈 교수가 이끄는 IBME Lab.은 "단일 소자 트랜스듀서 기반 Single-Shot 3D 초음파 이미징 시스템 개발" 주제로 한국연구재단의 2025년도 개인기초연구(우수신진연구) 신규과제 사업에 선정되어 2025년 3월부터 2028년 2월까지 연구비를 지원받게 되었습니다.`,
      images: [],
    },
    {
      date: "2025.02.18",
      text: `최현수 석사연구생, 남택우, 안정기 학부연구생의 졸업을 축하합니다! 최현수 석사는 지난 2년 동안의 뛰어난 연구 성과를 인정받아 **우수논문상**과 **공로상**을 수상하며 석사학위를 수여받았습니다.

최현수 석사 학위논문명: "구조 조명 현미경 기법과 딥러닝을 결합한 초음파 이미지 고해상도 복원"`,
      images: [],
    },
    {
      date: "2024.11.30",
      text: `최현수 석사연구생 — 1저자로서의 첫 연구 논문 게재를 축하합니다!

Choi, H., Yu, J., Kim, J. (2024). "Improving lateral resolution in ultrasound imaging through structured illumination techniques". The Journal of the Acoustical Society of Korea. [SCOPUS]`,
      images: [],
    },
    {
      date: "2024.11.07 – 2024.11.09",
      text: `서울 스위스그랜드호텔에서 개최된 2024년도 대한의용생체공학회 추계학술대회에 참여해 수행 중인 연구를 발표하였습니다.

[Poster] **[우수 포스터 논문상]** "VSSA-CFW 기법을 적용한 고해상도 UBM 이미징" — 송덕미, 김명서, 최현수, 황재윤, 김지훈`,
      images: [],
    },
    {
      date: "2024.09.22 – 2024.09.26",
      text: `최현수 석사과정(2년차)이 IEEE UFFC-JS (IUS) 2024 (Taipei, Taiwan)에 참가하여 포스터 발표를 진행하였습니다.

[Poster] "A Novel Approach to Ultrasound Super-Resolution via Deep Learning and Structured Illumination Sequences" — Hyeonsu Choi, Qi You, Yike Wang, Jaesok Yu, Pengfei Song, Jihun Kim`,
      images: [],
    },
    {
      date: "2024.09.09",
      text: `김지훈 교수가 이끄는 IBME Lab.은 "차세대 3D IC (TSV Cu fill / HBM 고단 적층 / 웨이퍼 본딩) 공정 웨이퍼 5㎛ 이하 결함 검사 초-고대역 C-SAM (SAT) 원천 요소 기술 개발" 주제로 산업통상자원부 '소재부품기술개발(R&D)-이종기술융합형' 사업에 선정되어 2024년 7월부터 2026년 12월까지 연구비를 지원받게 되었습니다.`,
      images: [],
    },
    {
      date: "2024.08.05 – 2024.08.23",
      text: `IBME Lab. 남택우, 송덕미, 최호진 학생 3명이 독일 Fraunhofer IKTS에서 진행된 3주간의 국외 단기교육을 성공적으로 수행 후 귀국했으며, 수료증을 수여받아 글로벌 역량을 강화하는 기회를 가졌습니다.

[강남대학교 차세대반도체시스템사업단 지원]`,
      images: [],
    },
    {
      date: "2024.05.09 – 2024.05.11",
      text: `연세대학교 미래캠퍼스에서 개최된 2024년도 대한의용생체공학회 춘계학술대회에 참여해 수행 중인 연구를 발표하였습니다.

[Poster] **[우수 포스터 논문상]** "구조화된 초음파 전송을 통한 새로운 초고해상도 초음파 이미징 기법" — 최현수, 유재석, 김지훈`,
      images: [],
    },
    {
      date: "2023.11.09 – 2023.11.11",
      text: `고려대학교 하나스퀘어에서 개최된 2023년도 대한의용생체공학회 추계학술대회 및 IBEC 2023에서 진행 중인 연구를 발표하였습니다.

[Poster] "Comparative Study of Deep Learning Models Based on Ultrasound Images of Developmental Hip Dysplasia" — 김성현, 이경수, 이시욱, 장진호, 황재윤, 김지훈`,
      images: [],
    },
    {
      date: "2023.11.02 – 2023.11.04",
      text: `부산시 한화해운대리조트에서 개최된 2023년도 한국음향학회 추계학술대회에 참가하여 진행 중인 연구를 발표하였습니다.

[Poster] "초고해상도 이미징의 진보: 초음파 기반 구조화 조명 현미경 연구" — 최현수, 김지훈`,
      images: [],
    },
    {
      date: "2023.09.30",
      text: `김성현 학부연구생 — 1저자로서의 첫 연구 논문 게재를 축하합니다!

Kim, S.H., Lee, K., Lee, S.W., Chang, J.H., Hwang, J.Y., Kim, J. (2023). "Comparative study on keypoint detection for developmental dysplasia of hip diagnosis using deep learning models in X-ray and ultrasound images". The Journal of the Acoustical Society of Korea. [SCOPUS]`,
      images: [],
    },
    {
      date: "2023.09.03 – 2023.09.08",
      text: `최현수 석사과정(1년차)이 IEEE IUS 2023 (Montreal, Canada)에 참가하였습니다. IEEE 주관으로 개최된 이번 학술대회에서는 초음파 분야의 학문과 기술 발전을 위하여 1,209편의 논문 발표와 초청 강연 등 다양한 프로그램이 진행되었습니다.`,
      images: [],
    },
    {
      date: "2023.05.31 – 2023.06.02",
      text: `제주 서귀포시 부영호텔&리조트에서 열린 2023년도 한국음향학회 춘계학술대회에 참가하여 연구를 발표하였습니다.

[Poster] **[우수발표상]** "해상도 개선을 위한 구조화된 초음파 여기 및 딥러닝을 이용한 향상된 초음파 이미징 기법" — 윤유진, 최현수, 김지훈
[Oral] "초음파 및 X-선 이미지 기반 발달성 고관절 이형성증 진단에서의 키포인트 감지를 위한 딥러닝 네트워크 비교 연구" — 김성현, 이경수, 이시욱, 황재윤, 김지훈`,
      images: [],
    },
    {
      date: "2023.03",
      text: `최현수 석사과정 입학을 축하합니다!`,
      images: [],
    },
    {
      date: "2022.09",
      text: `김지훈 교수가 이끄는 IBME Lab.은 "초고속 초고해상도 뇌 영상화를 위한 차세대 구조 초음파 조사 현미경 기법 개발 연구 (Development of an Advanced Structured Ultrasound Illumination Microscopy Technique for Ultrafast Super-Resolution Brain Imaging)" 주제로 한국연구재단-생애첫연구 (2022년 하반기) 과제에 선정되어 2022년 9월부터 2025년 2월까지 연구비를 지원받게 되었습니다.`,
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
