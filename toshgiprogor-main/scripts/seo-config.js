// E4 SEO — per-page, per-language metadata
// Factual data only (TZ.md §3). Phone/email omitted — requires client confirmation.

export const SITE_URL = 'https://tashgiprogor.uz';

// Confirmed from TZ.md §0 and translation JSONs
export const ORG = {
  name: { ru: 'АО «Ташгипрогор»', en: "JSC 'Tashgiprogor'", uz: "TOSHGIPROGOR ASJ", zh: '塔什甘吉普罗格尔股份公司' },
  foundingDate: '1937',
  url: SITE_URL,
  // OG image: use banner if available
  image: `${SITE_URL}/assets/img/banner.png`,
  // address per lang from translation JSONs (already confirmed)
  address: {
    ru: { street: 'просп. Навои, 40', city: 'Ташкент', region: 'Шайхантахурский район', postalCode: '100021', country: 'UZ' },
    en: { street: 'Navoi Ave., 40', city: 'Tashkent', region: 'Shaykhantakhur District', postalCode: '100021', country: 'UZ' },
    uz: { street: 'Navoiy shoh. 40', city: 'Toshkent', region: 'Shayxontohur tumani', postalCode: '100021', country: 'UZ' },
    zh: { street: '纳沃伊大道40号', city: '塔什干', region: '沙赫汉塔胡尔区', postalCode: '100021', country: 'UZ' },
  },
};

export const LANGS = {
  ru: { hreflang: 'ru',      htmlLang: 'ru',      urlPrefix: '',     locale: 'ru_RU' },
  en: { hreflang: 'en',      htmlLang: 'en',      urlPrefix: '/en',  locale: 'en_US' },
  uz: { hreflang: 'uz',      htmlLang: 'uz',      urlPrefix: '/uz',  locale: 'uz_UZ' },
  zh: { hreflang: 'zh-Hans', htmlLang: 'zh-Hans', urlPrefix: '/zh',  locale: 'zh_CN' },
};

// Page slugs match the HTML file names (without .html)
// title/desc are per-language strings — derived from confirmed translation content
export const PAGES = {
  index: {
    file: 'index.html',
    // path used in sitemap and hreflang ('' = root)
    slug: '',
    title: {
      ru: 'ТАШГИПРОГОР — Архитектура, проверенная временем | Проектный институт Ташкента',
      en: "TOSHGIPROGOR – Architecture Tested by Time | Tashkent Design Institute",
      uz: "TOSHGIPROGOR – Vaqt sinovidan o'tgan arxitektura | Toshkent loyihalash instituti",
      zh: '塔什甘吉普罗格尔 – 经时间检验的建筑 | 乌兹别克斯坦城市规划设计研究院',
    },
    description: {
      ru: 'АО «Ташгипрогор» — ведущий проектный институт Ташкента с 1937 года. Проектирование административных, жилых, культурных объектов в Узбекистане.',
      en: "Toshgiprogor JSC – Tashkent's leading design institute since 1937. Administrative, residential, cultural facility design in Uzbekistan.",
      uz: "TOSHGIPROGOR ASJ – 1937 yildan Toshkentning yetakchi loyihalash instituti. Ma'muriy, turar-joy, madaniy inshootlar loyihasi O'zbekistonda.",
      zh: '塔什甘吉普罗格尔股份公司成立于1937年，是乌兹别克斯坦领先的建筑设计机构，专注于行政、住宅及文化设施设计。',
    },
  },
  about: {
    file: 'about.html',
    slug: 'about.html',
    title: {
      ru: 'О нас | ТАШГИПРОГОР — Проектный институт с 1937 года',
      en: 'About Us | TOSHGIPROGOR – Design Institute since 1937',
      uz: "Biz haqimizda | TOSHGIPROGOR – 1937 yildan loyihalash instituti",
      zh: '关于我们 | 塔什甘吉普罗格尔 – 1937年成立的建筑设计研究院',
    },
    description: {
      ru: 'Ташкентский государственный институт по проектированию городских объектов — Ташгипрогор — с 1937 года формирует архитектурный облик Ташкента и Узбекистана.',
      en: 'The Tashkent State Institute of Urban Planning, Toshgiprogor, established in 1937, has been shaping the architectural landscape of Tashkent and Uzbekistan.',
      uz: "Toshkent shahar loyihalash davlat instituti — TOSHGIPROGOR — 1937 yildan Toshkent va O'zbekistonning me'moriy qiyofasini shakllantirmoqda.",
      zh: '塔什干城市规划国家设计研究院（塔什甘吉普罗格尔）成立于1937年，持续塑造着塔什干及乌兹别克斯坦的建筑风貌。',
    },
  },
  services: {
    file: 'services.html',
    slug: 'services.html',
    title: {
      ru: 'Услуги | ТАШГИПРОГОР — Архитектура, строительство, инженерия',
      en: 'Services | TOSHGIPROGOR – Architecture, Engineering, Design',
      uz: "Xizmatlar | TOSHGIPROGOR – Me'morchilik, muhandislik, loyihalash",
      zh: '服务项目 | 塔什甘吉普罗格尔 – 建筑、工程与设计',
    },
    description: {
      ru: 'Полный спектр проектных услуг: архитектура, конструктивные решения, инженерные системы, сметная документация, авторский надзор и техническое обследование.',
      en: 'Full range of design services: architecture, structural engineering, building systems, cost estimation, author supervision, and technical inspection.',
      uz: "To'liq loyihalash xizmatlari: me'morchilik, konstruktiv yechimlar, muhandislik tizimlari, smeta hujjati, mualliflik nazorati va texnik ko'rik.",
      zh: '全方位建筑设计服务：建筑设计、结构工程、工程系统、造价预算、设计施工监理及技术检测。',
    },
  },
  projects: {
    file: 'projects.html',
    slug: 'projects.html',
    title: {
      ru: 'Проекты | ТАШГИПРОГОР — Архитектурные объекты Узбекистана',
      en: 'Projects | TOSHGIPROGOR – Architectural Works in Uzbekistan',
      uz: "Loyihalar | TOSHGIPROGOR – O'zbekistondagi me'moriy ob'ektlar",
      zh: '项目案例 | 塔什甘吉普罗格尔 – 乌兹别克斯坦建筑作品',
    },
    description: {
      ru: 'Портфолио реализованных проектов: административные здания, жилые комплексы, спортивные объекты, общественные и культурные сооружения.',
      en: 'Portfolio of completed projects: administrative buildings, residential complexes, sports facilities, public and cultural structures.',
      uz: "Bajarilgan loyihalar portfoliosi: ma'muriy binolar, turar-joy majmualari, sport inshootlari, ijtimoiy va madaniy ob'ektlar.",
      zh: '已完成项目集：行政建筑、住宅综合体、体育设施、公共及文化建筑。',
    },
  },
  blog: {
    file: 'blog.html',
    slug: 'blog.html',
    title: {
      ru: 'Новости | ТАШГИПРОГОР — Архитектура и строительство',
      en: 'News | TOSHGIPROGOR – Architecture and Construction',
      uz: "Yangiliklar | TOSHGIPROGOR – Me'morchilik va qurilish",
      zh: '新闻动态 | 塔什甘吉普罗格尔 – 建筑与工程资讯',
    },
    description: {
      ru: 'Актуальные новости, статьи и события института Ташгипрогор в сфере архитектуры, проектирования и городского строительства.',
      en: 'Latest news, articles and events from Toshgiprogor in the field of architecture, design and urban construction.',
      uz: "TOSHGIPROGOR institutining me'morchilik, loyihalash va shahar qurilishi sohasidagi so'nggi yangiliklari va maqolalari.",
      zh: '塔什甘吉普罗格尔在建筑、设计及城市建设领域的最新动态、文章与活动。',
    },
  },
  'blog-details': {
    file: 'blog-details.html',
    slug: 'blog-details.html',
    title: {
      ru: 'Статья | ТАШГИПРОГОР',
      en: 'Article | TOSHGIPROGOR',
      uz: "Maqola | TOSHGIPROGOR",
      zh: '文章详情 | 塔什甘吉普罗格尔',
    },
    description: {
      ru: 'Новости и статьи ТАШГИПРОГОР — Ташкентского государственного института по проектированию городских объектов.',
      en: 'News and articles from TOSHGIPROGOR – Tashkent State Institute of Urban Planning.',
      uz: "TOSHGIPROGOR — Toshkent shahar loyihalash davlat institutining yangiliklari va maqolalari.",
      zh: '塔什甘吉普罗格尔（塔什干城市规划国家设计研究院）新闻与文章。',
    },
  },
  contact: {
    file: 'contact.html',
    slug: 'contact.html',
    title: {
      ru: 'Контакты | ТАШГИПРОГОР — Ташкент, просп. Навои, 40',
      en: 'Contact | TOSHGIPROGOR – Tashkent, Navoi Ave., 40',
      uz: "Aloqa | TOSHGIPROGOR – Toshkent, Navoiy shoh. 40",
      zh: '联系方式 | 塔什甘吉普罗格尔 – 塔什干纳沃伊大道40号',
    },
    description: {
      ru: 'Свяжитесь с ТАШГИПРОГОР: адрес — Ташкент, просп. Навои, 40. Вопросы о проектировании и сотрудничестве.',
      en: 'Contact TOSHGIPROGOR: address – Tashkent, Navoi Ave., 40. Inquiries about design and cooperation.',
      uz: "TOSHGIPROGOR bilan bog'laning: manzil — Toshkent, Navoiy shoh. 40. Loyihalash va hamkorlik bo'yicha savollar.",
      zh: '联系塔什甘吉普罗格尔：地址——塔什干纳沃伊大道40号。欢迎洽谈设计与合作事宜。',
    },
  },
  'corporate-management': {
    file: 'corporate-management.html',
    slug: 'corporate-management.html',
    title: {
      ru: 'Корпоративное управление | ТАШГИПРОГОР',
      en: 'Corporate Management | TOSHGIPROGOR',
      uz: "Korporativ boshqaruv | TOSHGIPROGOR",
      zh: '公司管理 | 塔什甘吉普罗格尔',
    },
    description: {
      ru: 'Руководство и управленческая команда АО «Ташгипрогор» — ведущего проектного института Узбекистана.',
      en: "Leadership and management team of JSC 'Toshgiprogor' – Uzbekistan's leading design institute.",
      uz: "TOSHGIPROGOR ASJ — O'zbekistonning yetakchi loyihalash institutining rahbariyati va boshqaruv jamoasi.",
      zh: '塔什甘吉普罗格尔股份公司——乌兹别克斯坦领先建筑设计机构的领导层与管理团队。',
    },
  },
  cooperation: {
    file: 'cooperation.html',
    slug: 'cooperation.html',
    title: {
      ru: 'Сотрудничество с Китаем | ТАШГИПРОГОР',
      en: 'China Cooperation | TOSHGIPROGOR',
      uz: "Xitoy bilan hamkorlik | TOSHGIPROGOR",
      zh: '中乌合作 | 塔什甘吉普罗格尔',
    },
    description: {
      ru: 'Сотрудничество АО «Ташгипрогор» с китайскими компаниями в области градостроительства и проектирования.',
      en: "TOSHGIPROGOR's cooperation with Chinese companies in urban planning and architectural design.",
      uz: "TOSHGIPROGOR ASJ ning xitoy kompaniyalari bilan shaharsozlik va arxitektura loyihalash sohasidagi hamkorlik.",
      zh: '塔什甘吉普罗格尔与中国企业在城市规划与建筑设计领域的合作。',
    },
  },
  privacy: {
    file: 'privacy.html',
    slug: 'privacy.html',
    title: {
      ru: 'Политика конфиденциальности | ТАШГИПРОГОР',
      en: 'Privacy Policy | TOSHGIPROGOR',
      uz: "Maxfiylik siyosati | TOSHGIPROGOR",
      zh: '隐私政策 | 塔什甘吉普罗格尔',
    },
    description: {
      ru: 'Политика конфиденциальности АО «Ташгипрогор»: обработка и защита персональных данных.',
      en: "TOSHGIPROGOR's privacy policy: personal data processing and protection.",
      uz: "TOSHGIPROGOR ASJ ning maxfiylik siyosati: shaxsiy ma'lumotlarni qayta ishlash va himoya qilish.",
      zh: '塔什甘吉普罗格尔股份公司隐私政策：个人数据的处理与保护。',
    },
  },
};
