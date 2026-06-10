/*
  Korporativ boshqaruv — hujjatlar ma'lumotlar bazasi (mahalliy, Hygraph'siz).
  Fayllar: assets/docs/...  (vite.config.js → viteStaticCopy orqali dist'ga ko'chiriladi)

  Har bir hujjat "kind" maydoniga ega — sarlavha management.js'da 4 tilda
  shablon orqali generatsiya qilinadi (takror yozishni kamaytirish uchun).
  Yo'llar XOM saqlanadi; render paytida encodeURI() bilan kodlanadi.
*/
window.CORP_DOCS = {
  categories: [
    {
      id: "charter",
      icon: "landmark",
      label: { uz: "Ustav", ru: "Устав", en: "Charter", zh: "公司章程" },
      grouped: false,
      docs: [
        { kind: "charter", file: "assets/docs/Ustav.pdf", ext: "pdf", size: 7224259 },
      ],
    },

    {
      id: "business-plan",
      icon: "briefcase",
      label: { uz: "Biznes-reja", ru: "Бизнес-план", en: "Business plan", zh: "商业计划" },
      grouped: false,
      docs: [
        { kind: "business-plan", year: 2026, file: "assets/docs/Бизнес План на 2026.pdf", ext: "pdf", size: 2147374 },
      ],
    },

    {
      id: "reports",
      icon: "chart",
      label: {
        uz: "Yillik va choraklik hisobotlar",
        ru: "Годовые и квартальные отчёты",
        en: "Annual & quarterly reports",
        zh: "年度及季度报告",
      },
      grouped: true,
      docs: [
        // 2025
        { kind: "report-quarter", year: 2025, q: 3, file: "assets/docs/Otchot/2025/АО_«TASHGIPROGOR»_квартальный_отчет_за_III_квартал_2025_года.xls", ext: "xls", size: 116736 },
        { kind: "report-quarter", year: 2025, q: 2, file: "assets/docs/Otchot/2025/АО_«TASHGIPROGOR»_квартальный_отчет_за_II_квартал_2025_года.xls", ext: "xls", size: 116736 },
        { kind: "report-quarter", year: 2025, q: 1, file: "assets/docs/Otchot/2025/АО_«TASHGIPROGOR»_квартальный_отчет_за_I_квартал_2025_года.xls", ext: "xls", size: 116736 },
        // 2024
        { kind: "report-annual", year: 2024, file: "assets/docs/Otchot/2024/Годовой_отчет_АО_«TASHGIPROGOR»_за_2024г.xls", ext: "xls", size: 180736 },
        { kind: "report-quarter", year: 2024, q: 3, file: "assets/docs/Otchot/2024/АО_«TASHGIPROGOR»_квартальный_отчет_за_III_квартал_2024_года.xls", ext: "xls", size: 117760 },
        { kind: "report-quarter", year: 2024, q: 2, file: "assets/docs/Otchot/2024/АО_«TASHGIPROGOR»_квартальный_отчет_за_II_квартал_2024_года.xls", ext: "xls", size: 116736 },
        { kind: "report-quarter", year: 2024, q: 1, file: "assets/docs/Otchot/2024/АО_«TASHGIPROGOR»_квартальный_отчет_за_I_квартал_2024_года.xlsx", ext: "xlsx", size: 37058 },
        // 2023
        { kind: "report-annual", year: 2023, file: "assets/docs/Otchot/2023/Годовой_отчет_АО_«TASHGIPROGOR»_за_2023г (5).xls", ext: "xls", size: 179712 },
        { kind: "report-quarter", year: 2023, q: 3, file: "assets/docs/Otchot/2023/АО_«TASHGIPROGOR»_квартальный_отчет_за_III_квартал_2023_года.xls", ext: "xls", size: 115712 },
        { kind: "report-quarter", year: 2023, q: 2, file: "assets/docs/Otchot/2023/АО_«TASHGIPROGOR»_квартальный_отчет_за_II_квартал_2023_года.xls", ext: "xls", size: 115200 },
        { kind: "report-quarter", year: 2023, q: 1, file: "assets/docs/Otchot/2023/АО_«TASHGIPROGOR»_квартальный_отчет_за_1_квартал_2023_года.xls", ext: "xls", size: 115200 },
      ],
    },

    {
      id: "audit",
      icon: "certificate",
      label: {
        uz: "Audit xulosalari",
        ru: "Аудиторские заключения",
        en: "Audit reports",
        zh: "审计报告",
      },
      grouped: false,
      docs: [
        { kind: "audit", year: 2024, file: "assets/docs/Audit xulosalari/Аудиторское заключение за 2024.pdf", ext: "pdf", size: 3509967 },
        { kind: "audit", year: 2023, file: "assets/docs/Audit xulosalari/Аудиторское заключение за 2023.pdf", ext: "pdf", size: 7638995 },
      ],
    },

    {
      id: "facts",
      icon: "info",
      label: {
        uz: "Muhim faktlar",
        ru: "Существенные факты",
        en: "Material facts",
        zh: "重大事实",
      },
      grouped: true,
      docs: [
        // 2025 (Word'dan PDF'ga aylantirildi — sana bilan)
        { kind: "fact", year: 2025, num: 36, date: "25.12.2025", file: "assets/docs/Muhim faktlar/2025/существенный_факт_№36 (25.12.2025).pdf", ext: "pdf", size: 267058 },
        { kind: "fact", year: 2025, num: 36, date: "20.03.2025", file: "assets/docs/Muhim faktlar/2025/существенный_факт_№36 (20.03.2025).pdf", ext: "pdf", size: 259217 },
        { kind: "fact", year: 2025, num: 8, date: "25.12.2025", file: "assets/docs/Muhim faktlar/2025/существенный_факт_№08 (25.12.2025).pdf", ext: "pdf", size: 289182 },
        { kind: "fact", year: 2025, num: 8, date: "25.06.2025", file: "assets/docs/Muhim faktlar/2025/существенный_факт_№08 (25.06.2025).pdf", ext: "pdf", size: 335348 },
        { kind: "fact", year: 2025, num: 8, date: "20.03.2025", file: "assets/docs/Muhim faktlar/2025/существенный_факт_№08 (20.03.2025).pdf", ext: "pdf", size: 335348 },
        { kind: "fact", year: 2025, num: 6, date: "25.12.2025", file: "assets/docs/Muhim faktlar/2025/существенный_факт_№06 (25.12.2025).pdf", ext: "pdf", size: 238668 },
        { kind: "fact", year: 2025, num: 6, date: "25.06.2025", file: "assets/docs/Muhim faktlar/2025/существенный_факт_№06 (25.06.2025).pdf", ext: "pdf", size: 282826 },
        { kind: "fact", year: 2025, num: 6, date: "20.03.2025", file: "assets/docs/Muhim faktlar/2025/существенный_факт_№06 (20.03.2025).pdf", ext: "pdf", size: 248343 },
        // 2024 (.pdf)
        { kind: "fact", year: 2024, num: 41, file: "assets/docs/Muhim faktlar/2024/open info dan skachat qilingan/41-muhim fakt.pdf", ext: "pdf", size: 56980 },
        { kind: "fact", year: 2024, num: 38, file: "assets/docs/Muhim faktlar/2024/open info dan skachat qilingan/38-muhim fakt.pdf", ext: "pdf", size: 55901 },
        { kind: "fact", year: 2024, num: 36, file: "assets/docs/Muhim faktlar/2024/open info dan skachat qilingan/36-muhim fakt.pdf", ext: "pdf", size: 68051 },
        { kind: "fact", year: 2024, num: 8, file: "assets/docs/Muhim faktlar/2024/open info dan skachat qilingan/8-muhim_fakt.pdf", ext: "pdf", size: 71353 },
        { kind: "fact", year: 2024, num: 6, file: "assets/docs/Muhim faktlar/2024/open info dan skachat qilingan/6-muhim fakt.pdf", ext: "pdf", size: 83020 },
        // 2023 (.pdf)
        { kind: "fact", year: 2023, num: 42, file: "assets/docs/Muhim faktlar/2023/open info dan skachat qilingan/42-muhim fakt.pdf", ext: "pdf", size: 59637 },
        { kind: "fact", year: 2023, num: 41, file: "assets/docs/Muhim faktlar/2023/open info dan skachat qilingan/41-muhim fakt.pdf", ext: "pdf", size: 57277 },
        { kind: "fact", year: 2023, num: 32, file: "assets/docs/Muhim faktlar/2023/open info dan skachat qilingan/32-muhim fakt.pdf", ext: "pdf", size: 59831 },
        { kind: "fact", year: 2023, num: 8, file: "assets/docs/Muhim faktlar/2023/open info dan skachat qilingan/8-muhim fakt.pdf", ext: "pdf", size: 67547 },
        { kind: "fact", year: 2023, num: 6, file: "assets/docs/Muhim faktlar/2023/open info dan skachat qilingan/6-muhim fakt.pdf", ext: "pdf", size: 96553 },
      ],
    },
  ],
};
