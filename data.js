/* ═══════════════════════════════════════════════════════════════════════
   IBME Lab 홈페이지 — 콘텐츠 파일  (data.js)
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
    tagline:  "강남대학교 전자반도체공학부 지능형의공학 연구실",
  },

  /* ───────── ③ About Us (연구실 소개) ───────── */
   about: {
    heading: "About Us",
    body: `The Intelligent Bio-Medical Engineering Laboratory (IBME Lab) was founded in April 2022 as part of the Division of Electronic & Semiconductor Engineering at Kangnam University. Our team develops high-frequency ultrasound and acoustic imaging technologies — including super-resolution ultrasound, scanning acoustic microscopy, computational imaging, and real-time hardware systems — with applications spanning both biomedical diagnostics and semiconductor inspection.

For detailed information on our specific research areas, please refer to the button below.`,
    bodyKr: `지능형 의공학 연구실(IBME Lab)은 2022년 4월 강남대학교 전자반도체공학부 소속으로 설립되었습니다. 저희 연구팀은 초고해상도 초음파 영상, 음향 현미경(SAM/UBM), 계산영상, 실시간 하드웨어 시스템 등 고주파 초음파·음향 영상 기술을 개발하며, 이를 바이오 의료 진단과 반도체 검사 양쪽에 적용하고 있습니다.

구체적인 연구 분야에 대한 자세한 내용은 아래 버튼을 참고해 주세요.`,
    learnMore: true,
    learnMoreLabel: "Learn More",
  },
  /* ───────── ④ 모집 공고 박스 (메인에 눈에 띄게 표시됨) ─────────
     당장 모집 공고가 없으면 show: false 로 바꾸면 박스가 사라집니다. */
recruit: {
    show:  true,
    tag:   "RECRUITMENT",
    title: "2026–27학년도 학부연구생 / 학·석사연계 / 석사과정 모집",
    body: `IBME Lab.은 초음파·음향 영상, 인공지능, 신호·영상처리 기반의 의료·헬스케어·반도체 연구를 함께할 학생을 모집합니다.

**지원 자격**
디지털시스템설계, 임베디드시스템, 신호·영상처리, 인공지능에 관심 있는 학생

**모집 인원**
학부연구생 1명(3학년), 대학원생 1~2명

**지원 혜택**
산학연 프로젝트 참여 장학금 · 국내외 연구기관 학술 교류 · 국내외 학회 발표 기회

관심 있는 학생은 자기소개서(1장 이내)와 성적표를 첨부하여 아래 이메일로 연락 주세요.`,
    email: "jihunk@kangnam.ac.kr",
  },
   
  /* ───────── ⑤ 지도교수 정보 (Members 페이지 상단) ───────── */
  professor: {
    nameKr:      "김지훈 (Jihun Kim), Ph.D.",
    role:        "Assistant Professor",
    affiliation: "Division of Electronic & Semiconductor Engineering (Major in Electronic Engineering), Kangnam University",
    office:      "이공관 516호 (Room 516, Science & Engineering Building at KNU)",
    email:       "jihunk@kangnam.ac.kr",
    tel:         "+82-31-280-3805",
    photo:       "images/Members/prof_jihun_kim.jpg",   // ← 교수님 사진 주소를 넣으세요. 비워두면 이니셜만 표시됩니다.

    // 학력 — 한 줄에 하나씩. 새 줄 추가는 기존 줄 복사 후 수정.
    education: [
      "Ph.D. in Information & Communication Engineering, Daegu Gyeongbuk Institute of Science & Technology (DGIST), Daegu, S. Korea (2019.08) — Dissertation: Multimodal Imaging and Analysis System for Cancer Diagnosis (Advisor: Prof. Jae Youn Hwang)",
      "B.S. in Electrical Engineering, Hannam University, Daejeon, S. Korea (2015.02)",
    ],

    // 경력
    experience: [
      "Postdoctoral Research Associate, University of Illinois Urbana-Champaign, Champaign, IL, USA (Jan. 2021 – Mar. 2022)",
      "Postdoctoral Research Associate, University of Notre Dame, Notre Dame, IN, USA (Aug. 2019 – Dec. 2020)",
      "Visiting Student, Cedars-Sinai Medical Center, Los Angeles, CA, USA (Aug. 2018 – Sept. 2019)",
    ],

    // 학회/대외 활동 (없으면 [] 로 비워도 됩니다)
    activities: [
      "대한의용생체공학회 의료초음파 분과위원",
      "Technical Program Committee Member, 16th International Conference on Ultrasound Engineering for Biomedical Applications (IC-UEBA) 2025",
      "Reviewer: IEEE Transactions on Biomedical Circuits and Systems (TBioCAS), IEEE Journal of Biomedical and Health Informatics (JBHI), Biomedical Optics Express, Scientific Reports, IEEE Transactions on Ultrasonics, Ferroelectrics, and Frequency Control (TUFFC)",
    ],
  },

  /* ───────── ⑥ 재학생 (Members) ─────────
     새 멤버 추가:  { } 한 덩어리를 통째로 복사해서 맨 아래 붙여넣고 내용만 수정. */
  students: [
    {
      name:  "송덕미 (Deokmi Song)",
      role:  "Graduate Student (M.S. course)",
      email: "dmdm9@kangnam.ac.kr",
      photo: "images/Members/song_deokmi.jpg",
    },
    {
      name:  "문성빈 (Sungbin Moon)",
      role:  "Graduate Student (M.S. course)",
      email: "plazma740@kangnam.ac.kr",
      photo: "images/Members/moon_sungbin.png",
    },
    {
      name:  "조원빈 (Wonbeen Cho)",
      role:  "Graduate Student (M.S. course)",
      email: "wb010626@kangnam.ac.kr",
      photo: "images/Members/cho_wonbeen.jpg",
    },
    {
      name:  "서정배 (Jungbae Seo)",
      role:  "Graduate Student (M.S. course)",
      email: "dreamhigh61109@gmail.com",
      photo: "images/Members/seo_jungbae.png",
    },
    {
      name:  "이서용 (SeoYong Lee)",
      role:  "Undergraduate Student",
      email: "ibluesky304@gmail.com",
      photo: "images/Members/lee_seoyong.png",
    },
    {
      name:  "이근영 (Geunyoung Lee)",
      role:  "Undergraduate Student",
      email: "qjvdls@kangnam.ac.kr",
      photo: "images/Members/lee_geunyoung.png",
    },
    {
      name:  "서동훈 (Dong Hun Seo)",
      role:  "Undergraduate Student",
      email: "sdhboseok123@gmail.com",
      photo: "images/Members/seo_donghun.png",
    },
    // ↑ 위 { … }, 를 복사해서 멤버를 계속 추가하세요.
  ],

  /* ───────── ⑦ 졸업생 (Alumni) ─────────
     note 에는 진로/현재 소속 등을 적으면 됩니다. 없으면 "" 로 두세요. */
  alumni: {
    graduate: [   // 대학원 졸업생
      { name: "최현수", period: "2023.03.01 – 2025.02.18", note: "2025 DGIST 박사과정 진학" },
    ],
    undergraduate: [  // 학부연구생 출신
      { name: "최호진", period: "2025.01.01 – 2025.12.14", note: "2026 Applied Materials" },
      { name: "김명서", period: "2024.01.01 – 2025.08.31", note: "" },
      { name: "안정기", period: "2024.01.01 – 2024.12.31", note: "2025 (주)마이크로투나노" },
      { name: "남택우", period: "2024.01.01 – 2024.12.31", note: "2025 서울과학기술대학교 석사과정 진학" },
      { name: "김성현", period: "2023.01.01 – 2024.08.31", note: "2024 GIST 석사과정 진학" },
    ],
  },

  /* ───────── ⑧ Research (연구 분야) ─────────
     연구 주제 추가:  { } 덩어리 복사 → 내용 수정. image 는 비워도 됩니다.
       · tag      : 상단 작은 분류 라벨 (영문 대문자 권장)
       · title    : 연구 분야 제목
       · subtitle : 영문 한 줄 부제 (없으면 지워도 됨)
       · bodyEn   : 영문 설명
       · bodyKr   : 국문 설명
       · image    : 대표 이미지 주소 (비우면 IBME 패턴이 표시됨) */
  research: [
    {
      tag:      "ULTRASOUND LOCALIZATION MICROSCOPY (ULM)",
      title:    "Ultrasound Localization Microscopy (ULM)",
      subtitle: "Super-Resolution Ultrasound Imaging Beyond the Diffraction Limit",
      bodyEn:   `We develop next-generation ultrasound localization microscopy (ULM) techniques to visualize microvascular networks beyond the diffraction limit. Our research focuses on ultrafast ultrasound imaging, advanced beamforming, novel microbubble localization and tracking algorithms, motion correction, and quantitative vascular imaging to advance next-generation biomedical ultrasound.`,
      bodyKr:   `초음파 회절 한계를 극복하여 미세 혈관 구조를 영상화하는 초음파 국소화 현미경(Ultrasound Localization Microscopy, ULM) 기술을 연구합니다. 초고속 초음파 영상(Ultrafast Ultrasound Imaging), 고급 빔포밍(Advanced Beamforming), 새로운 미세기포 위치 추정 및 추적 알고리즘(Novel Microbubble Localization & Tracking Algorithms), 움직임 보정(Motion Correction), 정량적 혈관 영상(Quantitative Vascular Imaging) 기술을 개발하여 차세대 초음파 의료영상 기술을 구현합니다.`,
      image:    "",
    },
    {
      tag:      "SCANNING ACOUSTIC MICROSCOPY (SAM) & UBM",
      title:    "Scanning Acoustic Microscopy (SAM) & Ultrasound Biomicroscopy (UBM)",
      subtitle: "High-Frequency Acoustic Imaging for Biomedical & Semiconductor Applications",
      bodyEn:   `We develop high-frequency acoustic imaging systems based on scanning acoustic microscopy (SAM) and ultrasound biomicroscopy (UBM), which share the same underlying principle of high-frequency ultrasound. The same core technology extends across two domains: biomedical imaging of tissues and small biological structures, and nondestructive evaluation of semiconductor devices and advanced electronic packages. By integrating acoustic imaging, signal processing, AI-based image enhancement, and automated analysis, we aim to advance both diagnostic imaging and industrial inspection.`,
      bodyKr:   `동일한 고주파 초음파 원리를 공유하는 Scanning Acoustic Microscopy(SAM)와 Ultrasound Biomicroscopy(UBM) 기반의 고주파 음향 영상 시스템을 개발합니다. 이 핵심 기술은 조직 및 미세 생체 구조의 바이오 영상과, 반도체 소자 및 첨단 전자 패키지의 비파괴 검사라는 두 분야에 모두 적용됩니다. 음향 영상 기술에 신호처리, AI 기반 영상 향상, 자동 분석 기술을 융합하여 진단 영상과 산업 검사 양쪽의 발전을 목표로 합니다.`,
      image:    "",
    },
    {
      tag:      "COMPUTATIONAL IMAGING",
      title:    "Computational Imaging",
      subtitle: "Computational Imaging for Next-Generation Ultrasound Systems",
      bodyEn:   `We investigate computational imaging techniques that enhance image quality while reducing acquisition time and hardware complexity. Our research includes coded-mask imaging, compressed sensing, sparse reconstruction, inverse imaging, and advanced beamforming algorithms.`,
      bodyKr:   `영상 품질 향상과 데이터 획득 시간 단축을 동시에 달성하기 위한 계산영상(Computational Imaging) 기술을 연구합니다. Coded-Mask Imaging, Compressed Sensing, Sparse Reconstruction, 역문제 기반 영상 복원, 고급 빔포밍 알고리즘을 통해 차세대 초음파·음향 영상 시스템을 개발합니다.`,
      image:    "",
    },
    {
      tag:      "FPGA-BASED IMAGING SYSTEMS",
      title:    "FPGA-Based Imaging Systems",
      subtitle: "Real-Time Hardware Acceleration for Imaging Applications",
      bodyEn:   `We design high-performance imaging systems on FPGA and embedded hardware platforms for real-time ultrasound and acoustic imaging. Our research focuses on high-speed data acquisition, real-time beamforming, hardware acceleration, and scalable imaging architectures.`,
      bodyKr:   `실시간 초음파 및 음향 영상 시스템을 위한 FPGA 기반 고성능 이미징 플랫폼을 개발합니다. 고속 데이터 획득, 실시간 빔포밍, 하드웨어 가속, 확장 가능한 이미징 아키텍처를 설계하여 차세대 의료·산업용 영상 시스템을 구현합니다.`,
      image:    "",
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
      { c: "Kim, S., Noh, S., Jeong, S., Kim, C., Lee, H.†, Kim, J.†, (2026). Enhancing Trajectory Estimation with Convolutional IMU Transformer. IEEE Sensors Journal, 26(9). (†: co-corresponding authors)", doi: "10.1109/JSEN.2026.3673719" },
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
      "Hwang, J.Y., Kim, J.Y., **Kim, J.**, Je, M.K., & Choi, J.S. (2021). U.S. Patent No. 10,925,686. Washington, DC: U.S. Patent and Trademark Office.",
      "Hwang, J.Y., **Kim, J.**, Shin, T.J., Hyun, H.K., & Kong, H.J. (2020). U.S. Patent Application No. 16/839,444.",
    ],

    // 국내 특허
    patentsDomestic: [
      "Yoon, H.J., Ahn, J., Kim, S., Lee, S., **Kim, J.**, Hwang, J.Y. and Kwon, S.B., \"SHOES FOR ESTIMATING BIOLOGICAL INFORMATION AND SYSTEM COMPRISING THE SAME\", 대한민국 특허 등록번호 10-2029576 (2019)",
      "Hwang, J.Y., Lee, J.H., Park, J.H., Oh, S., Kwon, B.S., **Kim, J.** and Kong, H.J., \"WEARABLE DEVICE MONITORING RESIDUAL URINE VOLUME IN BLADDER USING ULTRASONIC WAVE AND METHOD OF MONITORING RESIDUAL URINE VOLUME IN BLADDER USING ULTRASONIC WAVE\", 대한민국 특허 등록번호 10-1930883 (2018)",
      "Hwang, J.Y., Choi, J., **Kim, J.**, Je, M. and Kim, J.Y., \"AN APPARATUS FIXING THE BONES AND A SYSTEM INCORPORATING THE SAME\", 대한민국 특허 등록번호 10-1800125 (2017)",
      "Hwang, J.Y., Choi, J., **Kim, J.**, Kim, J.Y. and Je, M., \"AN APPARATUS FOR INDICATING A TARGET POSITION AND AN APPARATUS FOR FIXATION OF A FRACTURED BONE INCORPORATING THE SAME\", 대한민국 특허 등록번호 10-1800124 (2017)",
      "Je, M., Hwang, J.Y., **Kim, J.**, Choi, J. and Kim, J.Y., \"Ultrasound surgery drill and drilling method thereby\", 대한민국 특허 등록번호 10-1795928 (2017)",
    ],

    // 국제 학회 발표
    conferencesIntl: [
      { c: "Kim, J., Dong, Z., Lowerison, M.R., Sekaran, N.V.C., You, Q., Llano, D.A., & Song, P. (2022). Deep Learning-based 3D Beamforming on a 2D Row Column Addressing (RCA) Array for 3D Super-resolution Ultrasound Localization Microscopy. 2022 IEEE International Ultrasonics Symposium (IUS), pp.1–4.", doi: "10.1109/IUS54386.2022.9958375" },
      { c: "Rho, S., Hwang, G., Kim, J., Moon, S., & Yoon, S. (2020). Visualization of intracellular calcium transport between cells using high frequency ultrasound and FRET live-cell imaging. 2020 IEEE International Ultrasonics Symposium (IUS), pp.1–4.", doi: "10.1109/IUS46767.2020.9251840" },
      { c: "Kim, J., Hwang, G., Rho, S., & Yoon, S. (2020). Singular value decomposition and 2D cross-correlation based localization of gas vesicles for super-resolution ultrasound imaging. 2020 IEEE International Ultrasonics Symposium (IUS), pp.1–4.", doi: "10.1109/IUS46767.2020.9251651" },
      { c: "Kim, M., Kim, S., Hwang, M., Kim, J., Je, M., Jang, J.E., … & Hwang, J.Y. (2017). Multispectral imaging based on a smartphone with an external C-MOS camera for detection of seborrheic dermatitis on the scalp. Imaging, Manipulation, and Analysis of Biomolecules, Cells, and Tissues XV (Vol. 10068, p.188). SPIE.", doi: "10.1117/12.2251707" },
    ],

    // 저서 / 북 챕터 — 없으면 [] 로 비워도 됩니다
    books: [
      { c: "Kim, J., Youn, S. and Hwang, J.Y., \"Ch. 13 Ultrasound Imaging in Dermatology\" in Imaging Technologies and Transdermal Delivery in Skin Disorders, Wiley-VCH Verlag GmbH & Co. KGaA, pp.309–339, 2019.", doi: "10.1002/9783527814633.ch13" },
    ],
  },

  /* ───────── ⑩ Teaching (강의) ───────── */
  teaching: {
    undergraduate: {
      semester1: [   // 1학기
        "디지털시스템설계 (Digital System Design)",
        "신호및시스템 (Signals & Systems)",
        "인공지능 (Artificial Intelligence)",
        "창의종합설계1 (Creative Capstone Design 1)",
        "반도체캡스톤설계1 (Semiconductor Capstone Design 1)",
      ],
      semester2: [   // 2학기
        "공학프로그래밍언어 (Engineering Programming Language)",
        "임베디드시스템 (Embedded System)",
        "디지털영상처리이론과실습 (Digital Image Processing: Theory and Practice)",
        "창의종합설계2 (Creative Capstone Design 2)",
        "반도체캡스톤설계2 (Semiconductor Capstone Design 2)",
      ],
    },
    graduate: {
      semester1: [
        "디지털신호처리 (Digital Signal Processing)",
        "컴퓨터비전 (Computer Vision)",
      ],
      semester2: [
        "첨단이미징시스템 (Advanced Imaging Systems)",
        "인공지능특론 (Special Topics in Artificial Intelligence)",
      ],
    },
  },

  /* ───────── ⑪ Lab Q&A (자주 묻는 질문) ─────────
     · qnaIntro: 질문 목록 위에 나오는 인사말 (없으면 지워도 됩니다)
     · qna 질문 추가:  { q: "질문", a: `답변` },  형식으로 추가.
       답변에서 문단을 나누려면 빈 줄(엔터 두 번), 굵게는 **별표 2개**. */
qnaIntro: `연구실 생활과 대학원 진학을 고민하는 학생들이 자주 묻는 질문에 대한 제 생각을 정리했습니다. 진로를 결정하는 데 작은 도움이 되기를 바랍니다 🙂`,

  qna: [
    {
      q: "IBME Lab.에서 무엇을 배울 수 있나요?",
      a: `정답을 찾는 법이 아니라, 문제를 정의하는 법을 배웁니다. 수업은 답이 정해진 문제를 풀지만, 연구는 아직 답이 없는 문제를 다룹니다. 직접 얻은 데이터로 가설을 세우고, 실패하고, 다시 시도하는 과정 전체가 훈련입니다. 지도교수는 방향을 제시하지만 모든 답을 주지는 않습니다 (모든 답을 알수도 없습니다 😅). 대신 스스로 부딪혀 문제를 해결해 본 경험은, 회사와 연구소가 가장 원하는 역량이 됩니다.`,
    },
    {
      q: "연구실에 들어가면 실제로 무엇을 하나요?",
      a: `일상은 생각보다 구체적입니다. 주간 미팅에서 연구 진행 상황을 공유하고, 초음파 장비로 데이터를 얻고, 코드를 개발해서 분석하고, 그 결과를 학회 포스터와 논문으로 만듭니다. 실제로 본 연구실에서는 학부연구생이 SCIE급 논문을 1저자로 게재했고, 석사과정생이 IEEE IUS(몬트리올·타이베이) 같은 국제학회에서 직접 발표했으며, 독일 Fraunhofer IKTS 단기 연수를 다녀온 학생들도 있습니다. '시키는 일'을 하는 것이 아니라, 자기 이름이 남는 결과물을 만드는 것이 목표입니다.`,
    },
     {
      q: "어떤 툴과 기술을 배우게 되나요?",
      a: `연구 주제에 따라 다르지만, 본 연구실에서 실제로 사용하는 도구들은 다음과 같습니다.

**프로그래밍 · 신호/영상처리** — MATLAB, Python 기반의 신호·영상처리, 딥러닝 모델 개발(PyTorch 등)

**초음파 시뮬레이션 · 계측** — k-Wave 초음파 시뮬레이터, LabVIEW, 신호 계측, 데이터 획득(DAQ) 시스템 동기화, 정밀 스캐닝을 위한 모터 제어

**하드웨어 설계** — FPGA 기반 실시간 시스템, KiCad를 이용한 PCB 설계, 3D CAD 기구 설계

소프트웨어부터 하드웨어까지 시스템 전체를 직접 다뤄보는 것이 본 연구실의 특징입니다. 처음부터 모든 것을 알 필요는 없습니다 — 관심 분야에서 시작해 프로젝트를 진행하며 자연스럽게 확장해 나가게 됩니다.`,
    },
    {
      q: "석사 학위가 취업을 보장하나요?",
      a: `보장하지 않습니다. 그런 약속을 하는 곳이 있다면 오히려 의심해야 합니다. 다만 반도체·의료기기·AI R&D 분야의 좋은 포지션일수록 "스스로 문제를 정의하고 끝까지 해결해 본 사람"을 찾고, 석사과정은 그 경험을 2년간 집중적으로 쌓는 시간입니다. 학위는 문을 열어주는 열쇠라기보다, 그 문 앞까지 갈 체력을 기르는 과정입니다. 멀리 보시길 바랍니다.`,
    },
    {
      q: "의공학(Biomedical Engineering)이란 무엇인가요?",
      a: `공학의 도구로 사람의 건강 문제를 푸는 분야입니다. 병원의 초음파·MRI·CT, 손목 위 스마트워치의 심박 센서가 모두 의공학의 결과물입니다. 전자공학은 그 심장에 해당합니다. 센서와 회로가 신호를 얻고, 신호처리와 AI가 그 신호를 진단 정보로 바꿉니다. 본 연구실은 그중에서도 초음파를 다룹니다 — 방사선 없이 몸속을, 그리고 같은 원리로 반도체 내부까지 들여다볼 수 있는 기술입니다.`,
    },
  ],


  /* ───────── ⑫ Announcement (연구실 소식) ─────────
     최신 소식을 "맨 위"에 추가하세요.
       { date: "2026.05.09", text: `소식 내용`, images: ["사진주소1", "사진주소2"] },
     · 사진이 없으면  images: []  로 두세요.
     · **굵게** 별표 2개로 감싸면 굵게 표시됩니다. */
  news: [
     {
      date: "2026.07.08 – 2026.07.10",
      text: `강원도 평창군 모나용평리조트에서 개최된 2026년도 대한전기학회 하계학술대회에 참여하여 연구 발표를 진행하였습니다.
      
[Poster] "코디드 마스크 및 확산 기반 RF 재구성을 통한 단일 샷 3차원 초음파 영상화 연구" — 조원빈, 문성빈, 김지훈
[Poster] "고속 고해상도 음향현미경 영상을 위한 스캐닝 방법 최적화 연구" — 서정배, 조원빈, 김지훈`,
      images: [
         "images/News/20260709_1.jpeg",
         "images/News/20260709_2.jpeg",
         "images/News/20260709_3.png",
      ],
    },
    {
      date: "2026.05.07 – 2026.05.09",
      text: `제주 신화월드리조트에서 개최된 2026년도 대한의용생체공학회 춘계학술대회에 참여하여 연구 발표를 진행하였습니다.

[Poster] **[우수 포스터상]** "압축 센싱 기반 초음파 국소화 현미경 기법: 미세기포 주입률 변화에 따른 in situ microvessel phantom 실험" — 문성빈, 조원빈, 김지훈
[Poster] "High Resolution Ultrasound Biomicroscopy of Ex-Vivo Bovine Eye based on IQ-domain 3D VSSA-CFW Beamforming" — 송덕미, 서정배, 이승엽, 황재윤, 김지훈`,
      images: [
        "images/News/20260507.png",
      ],
    },
    {
      date: "2026.05.01",
      text: `우리 연구실에서 2024년에 졸업한 김성현 학생(학부연구생 시절 수행)의 연구 논문이 SCIE 저널인 IEEE Sensors Journal에 최종 게재되었습니다. 본 논문은 약 2년간의 리비전 과정을 거쳐 게재가 확정되었으며, IMU 기반 궤적 추정 성능 향상을 위한 Transformer 기반 모델을 제안한 연구입니다. 긴 시간 동안 성실히 연구를 수행하여 훌륭한 성과를 이룬 것을 진심으로 축하합니다!

Kim, S., Noh, S., Jeong, S., Kim, C., Lee, H.†, Kim, J.†, (2026). Enhancing Trajectory Estimation with Convolutional IMU Transformer. IEEE Sensors Journal, 26(9).`,
      images: [
        "images/News/20260501.png",
      ],
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
      images: [
        "images/News/20251106_1.png",
        "images/News/20251106_2.png",
      ],
    },
    {
      date: "2025.10.22 – 2025.10.25",
      text: `강원도 고성군 델피노리조트에서 개최된 2025년도 대한전기학회 정보 및 제어 부문회 (CICS'25)에 참여하여 3개 주제의 연구 발표 등을 진행하였습니다.

[Oral] **[신진연구자상]** "From Scanning Acoustic Microscopy to Coded Mask: Advanced NDT of Semiconductor Packages with Single-element Ultrasound" — 김지훈
[Poster] "Computation Ultrasound Imaging with a Single-element Transducer and Coded Mask" — 문성빈, 조원빈, 최호진, 김지훈
[Poster] "Performance Evaluation of Advanced Beamforming Algorithms for 3D Scanning Acoustic Microscopy" — 송덕미, 최호진, 김지훈`,
      images: [
        "images/News/20251022.png",
      ],
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
      images: [
        "images/News/20250615.png",
      ],
    },
    {
      date: "2025.06.12 – 2025.06.13",
      text: `제주도 메종글래드 제주에서 개최된 2025년도 하계종합학술대회 및 대학생논문경진대회에 참여해 연구 발표를 진행하였습니다.

[Invited Talk] "Introduction to Advanced Super-resolution Ultrasound Imaging Technique" — 김지훈
[대학생논문경진대회] **[우수 논문상·은상]** "다양한 환경 조건 하에서의 YOLOv8-OBB를 활용한 SAR 선박 탐지 성능 평가" — 조원빈, 김지훈
[대학생논문경진대회] **[우수 논문상·동상]** "4차원 블록 매칭 필터링을 이용한 반도체 웨이퍼 결함 검출용 고주파 초음파 영상 향상 기법" — 문성빈, 조원빈, 최호진, 김지훈`,
      images: [
        "images/News/20250612.png",
      ],
    },
    {
      date: "2025.05.08 – 2025.05.10",
      text: `제주도 롯데호텔 중문에서 개최된 2025년도 제65회 대한의용생체공학회 춘계학술대회에 참여해 연구 발표를 진행하였습니다.

[Invited Talk] "Advanced Technique for Super-Resolution Ultrasound Imaging" — 김지훈
[Poster] "Improving Spatial Resolution Beyond the Focal Zone in Ultrasound Biomicroscopy via 3D VSSA-CFW and Real-ESRGAN" — 송덕미, 조원빈, 이문환, 황재윤, 김지훈
[Poster] "Performance Benchmarking of Compressed Sensing based Localization Technique for Ultrasound Localization Microscopy" — 문성빈, 최호진, 김지훈`,
      images: [
        "images/News/20250508.png",
      ],
    },
    {
      date: "2025.04.18",
      text: `김지훈 교수는 2025년 4월 18일에 개최된 강남대학교 개교 79주년 기념식에서 **"교육 부문 공로상"** 과 **"우수연구자상"** 을 수상하였습니다.`,
      images: [
        "images/News/20250418_1.png",
        "images/News/20250418_2.png",
      ],
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
      images: [
        "images/News/20250218.png",
      ],
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
      images: [
        "images/News/20241107.png",
      ],
    },
    {
      date: "2024.09.22 – 2024.09.26",
      text: `최현수 석사과정(2년차)이 IEEE UFFC-JS (IUS) 2024 (Taipei, Taiwan)에 참가하여 포스터 발표를 진행하였습니다.

[Poster] "A Novel Approach to Ultrasound Super-Resolution via Deep Learning and Structured Illumination Sequences" — Hyeonsu Choi, Qi You, Yike Wang, Jaesok Yu, Pengfei Song, Jihun Kim`,
      images: [
        "images/News/20240922_1.png",
        "images/News/20240922_2.png",
      ],
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
      images: [
        "images/News/20240805.png",
      ],
    },
    {
      date: "2024.05.09 – 2024.05.11",
      text: `연세대학교 미래캠퍼스에서 개최된 2024년도 대한의용생체공학회 춘계학술대회에 참여해 수행 중인 연구를 발표하였습니다.

[Poster] **[우수 포스터 논문상]** "구조화된 초음파 전송을 통한 새로운 초고해상도 초음파 이미징 기법" — 최현수, 유재석, 김지훈`,
      images: [
        "images/News/20240509_1.png",
        "images/News/20240509_2.png",
      ],
    },
    {
      date: "2023.11.09 – 2023.11.11",
      text: `고려대학교 하나스퀘어에서 개최된 2023년도 대한의용생체공학회 추계학술대회 및 IBEC 2023에서 진행 중인 연구를 발표하였습니다.

[Poster] "Comparative Study of Deep Learning Models Based on Ultrasound Images of Developmental Hip Dysplasia" — 김성현, 이경수, 이시욱, 장진호, 황재윤, 김지훈`,
      images: [
        "images/News/20231109.jpg",
      ],
    },
    {
      date: "2023.11.02 – 2023.11.04",
      text: `부산시 한화해운대리조트에서 개최된 2023년도 한국음향학회 추계학술대회에 참가하여 진행 중인 연구를 발표하였습니다.

[Poster] "초고해상도 이미징의 진보: 초음파 기반 구조화 조명 현미경 연구" — 최현수, 김지훈`,
      images: [
        "images/News/20231102.jpg",
        "images/News/20231102_2.png",
      ],
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
      images: [
        "images/News/20230903_1.png",
        "images/News/20230903_2.png",
      ],
    },
    {
      date: "2023.05.31 – 2023.06.02",
      text: `제주 서귀포시 부영호텔&리조트에서 열린 2023년도 한국음향학회 춘계학술대회에 참가하여 연구를 발표하였습니다.

[Poster] **[우수발표상]** "해상도 개선을 위한 구조화된 초음파 여기 및 딥러닝을 이용한 향상된 초음파 이미징 기법" — 윤유진, 최현수, 김지훈
[Oral] "초음파 및 X-선 이미지 기반 발달성 고관절 이형성증 진단에서의 키포인트 감지를 위한 딥러닝 네트워크 비교 연구" — 김성현, 이경수, 이시욱, 황재윤, 김지훈`,
      images: [
        "images/News/20230531.png",
      ],
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

