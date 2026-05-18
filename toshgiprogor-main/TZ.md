# Texnik topshiriq (TZ) — TOSHGIPROGOR sayti modernizatsiyasi va xitoy bozoriga moslashtirish

> **Loyiha:** https://tashgiprogor.uz
> **Buyurtmachi:** TOSHGIPROGOR ASJ (Toshkent shahar loyihalash instituti, 1937)
> **Yondashuv:** Bosqichma-bosqich (joriy statik struktura saqlanadi, ichki sifat tubdan yaxshilanadi)
> **Asosiy maqsad:** Saytni texnik jihatdan zamonaviylashtirish + soddalashtirilgan xitoy tilini (zh-Hans) qo'shish + xitoy kompaniyalarining e'tiborini qonuniy va faktik chegarada jalb qilish
> **Ijro vositasi:** VS Code + Claude Code (har bir blok alohida topshiriq sifatida beriladi)
> **Hujjat versiyasi:** 1.0 — 2026-05-18

---

## 0. Hujjatdan qanday foydalanish kerak

- Har bir **Epik (E1…E10)** — mustaqil ish bloki. Tartib bo'yicha bajariladi (P0 → E1 → … → E10).
- Har bir blokda: **Maqsad**, **Tegishli fayllar**, **Vazifalar (checklist)**, **Qabul mezoni (DoD)** bor.
- Claude'ga topshiriq berishda 10-bo'limdagi tayyor formuladan foydalaning.
- Hech bir vazifa **faktik haqiqatdan chetga chiqmaydi**: soxta mijoz, o'ylab topilgan sertifikat, bo'rttirilgan raqam, siyosiy bayonot — taqiqlanadi (3-bo'limga qarang).

---

## 1. Joriy holat auditi (qisqa)

**Stack:** statik ko'p sahifali HTML (8 sahifa: `index, about, services, projects, blog, blog-details, contact, corporate-management`), jQuery 3.6.0, Bootstrap (CSS+JS), ~30 jQuery plagini (owl carousel, slick, isotope, magnific-popup, barfiller, niceSelect, metisMenu, odometer, WOW, pure-counter), GSAP + ScrollTrigger + ScrollSmoother + SplitText. Build tooling **yo'q** (`package.json` yo'q), SCSS qo'lda kompilyatsiya qilinib `style.css` ichiga kommit qilingan.

**i18n — ikkita parallel tizim (asosiy muammo):**
1. `assets/js/translate.js` — `data-translate` atributli elementlarni `assets/lang/{uz,ru,en}.json` dan `textContent` bilan almashtiradi (fetch). Standart til — `ru`.
2. A11y menyusi uchun alohida tizim: HTML ichida `data-lang="uz|ru|en"` span'lar `display:none` bilan yashirib/ko'rsatiladi (`assets/js/a11y-menu.js`).
3. Til tanlagich (`<select id="languageSelector">`) har sahifada **2 marta** takrorlangan (desktop + offcanvas), `uz/ru/en` (masalan `index.html:769–771` va `874–876`).

**Blog:** Hygraph GraphQL CDN'dan client-side olinadi (`assets/js/blogs.js`), maydonlar faqat `titleUz/Ru/En`, `descriptionUz/Ru/En`.

**Backend:** kontakt forma `api/telegram.php` (PHP, Apache, `.htaccess`, CORS `*`). `api/telegram.js` — Node varianti.

**Aniqlangan muammolar:**

| # | Muammo | Ta'sir |
|---|--------|--------|
| P0 | `telegram-blog-checker.js:4–5` — bot tokeni va chat ID ochiq client-side kodda | **Kritik xavfsizlik** |
| 1 | `<html lang="zxx">` — noto'g'ri til atributi | SEO, accessibility |
| 2 | `<title>TOSHGIPROGOR</title>`, meta description / OG / hreflang / structured data yo'q | Qidiruvda topilmaslik |
| 3 | i18n `textContent` bilan — kontent qidiruv botlari uchun ko'rinmaydi, FOUC bor, til bo'yicha URL yo'q | Baidu/Google indekslamaydi |
| 4 | Og'ir yuk: `fontAwesomePro.css` 557KB, `bootstrap.min.css` 267KB, `style.css` 119KB, 30+ JS kutubxona | Sekin yuklanish (ayniqsa Xitoydan) |
| 5 | Google Fonts / tashqi CDN'lar bo'lsa — Xitoyda (GFW) bloklanadi/sekin | Xitoy foydalanuvchisi sahifani ko'rmaydi |
| 6 | Ikkita i18n tizimi — yangi til qo'shish = JSON + har sahifadagi span'lar + 2× selector | Qo'llab-quvvatlash qiyin |
| 7 | Build/minifikatsiya/optimizatsiya pipeline yo'q | Sifat va tezlik past |

---

## 2. Loyiha maqsadlari (o'lchanadigan)

1. **Xitoy tili (zh-Hans)** to'liq qo'shilgan: UI + kontent + blog + a11y menyu + til tanlagich.
2. **i18n bitta arxitekturaga** birlashtirilgan; yangi til qo'shish ≤ 1 fayl + 1 JSON.
3. **SEO:** har til indekslanadigan (server/pre-render yoki crawlable fallback), `hreflang`, `sitemap`, structured data; Baidu uchun moslashtirilgan.
4. **Xitoydan tezlik:** LCP ≤ 2.5s (3G/Xitoy shartida), barcha asset self-hosted, Google/tashqi-CDN bog'liqligi 0 ta.
5. **Xavfsizlik:** maxfiy kalitlar client'da yo'q; forma spam/abuse'dan himoyalangan.
6. **Xitoy B2B ishonch signallari:** hamkorlik sahifasi, portfolio, litsenziya/faktlar, WeChat/WhatsApp aloqa.
7. **Accessibility** saqlanadi va kuchaytiriladi (mavjud a11y menyu — O'zbekistonda majburiy).

---

## 3. Cheklovlar — "chegaradan chiqmaslik" (MAJBURIY)

Bu cheklovlar har bir blokga taalluqli va buzilishi mumkin emas:

- **Faqat faktik ma'lumot.** Loyihalar soni, yillar, mijozlar, sertifikatlar — faqat buyurtmachi tomonidan tasdiqlangan haqiqiy ma'lumot. Raqamlarni bo'rttirish taqiqlanadi.
- **Soxta ishonch elementi yo'q:** o'ylab topilgan xitoy mijoz logotipi, soxta sharh/otziv, mavjud bo'lmagan mukofot — taqiqlanadi.
- **Siyosiy neytrallik.** BRI/"Bir kamar bir yo'l", Tayvan, Sintszyan va h.k. siyosiy mavzularga **kirilmaydi**. Faqat tijoriy-texnik hamkorlik tili ishlatiladi.
- **Qonuniylik:** O'zbekiston Respublikasi reklama, shaxsiy ma'lumotlar (forma orqali yig'iladigan ma'lumot) va veb-saytlar bo'yicha qonunchiligiga rioya. Xitoy auditoriyasi uchun maxfiylik bildirgisi (Privacy / 隐私政策) qo'shiladi.
- **Tarjima sifati:** xitoycha matn **professional/native ko'rik**dan o'tadi. Muhandislik-arxitektura atamalari (loyihalash, mualliflik nazorati, ШНК/normativ) avtomatik tarjimada noto'g'ri bo'ladi — Claude qoralama beradi, yakuniy matn **inson tomonidan tasdiqlanadi**.
- **Brend ohanggi:** rasmiy, davlat institutiga mos, ortiqcha marketing shiorlarisiz.

---

## P0 — KRITIK XAVFSIZLIK (birinchi navbatda, kod ishidan oldin)

**Maqsad:** oshkor bo'lgan maxfiy kalitlarni bartaraf etish.

**Tegishli fayllar:** `assets/js/telegram-blog-checker.js`, `api/telegram.php`, `api/telegram.js`, `.gitignore`

**Vazifalar:**

- [ ] **Buyurtmachi darhol** @BotFather orqali joriy tokenni bekor qiladi va yangisini oladi (token allaqachon ommaviy — kodni tuzatish o'zi yetarli emas).
- [ ] Bot tokeni va `chat_id` client-side JS'dan **butunlay olib tashlanadi**. Telegramga yuborish faqat **server tomonda** (`api/telegram.php`) amalga oshiriladi.
- [ ] Token server muhitida `.env` / server konfiguratsiyasidan o'qiladi (`.gitignore`'da `.env` allaqachon bor — buni saqlash).
- [ ] Blog'ni Telegramga yuborish (`telegram-blog-checker.js` mantig'i) ham server tomonga (cron yoki webhook) ko'chiriladi yoki butunlay olib tashlanadi.
- [ ] Git tarixida token qolgan bo'lsa — buyurtmachi ogohlantiriladi (tarixni tozalash alohida qaror).
- [ ] `api/telegram.php` da: CORS `*` ni faqat o'z domeniga cheklash; kirish validatsiyasi va rate-limit qo'shish (E8 ga ulanadi).

**DoD:** Brauzer DevTools → Sources/Network'da hech qanday token/maxfiy kalit ko'rinmaydi. Forma va blog yuborish server orqali ishlaydi.

---

## E1 — Texnik poydevor (build & struktura)

**Maqsad:** sifat, tezlik va xitoy paketini amalga oshirish uchun minimal, lekin zamonaviy asos. Statik struktura saqlanadi.

**Vazifalar:**

- [ ] `package.json` qo'shish; build tizimi sifatida **Vite** (yoki yengil alternativ) — statik ko'p sahifali rejim.
- [ ] SCSS → CSS avtomatik kompilyatsiya + autoprefixer + minify (`assets/scss/style.scss` → optimallashtirilgan `style.css`). Qo'lda kompilyatsiya tugatiladi.
- [ ] CSS/JS minifikatsiya, hash bilan versiyalash (cache-busting), kerakmas kutubxonalarni audit qilib olib tashlash (ko'p plaginlar bitta-ikkita sahifada ishlatiladi).
- [ ] Tasvirlarni `.webp`/`.avif` ga konvertatsiya + `<picture>`/`loading="lazy"`/`width/height` (CLS uchun) — pipeline.
- [ ] `npm run dev` (lokal server) va `npm run build` (`/dist`) skriptlari.
- [ ] `.editorconfig`, `prettier`, `eslint` (minimal) — kod standartlari.
- [ ] `README.md` ni haqiqiy hujjatga almashtirish (hozir GitLab shabloni).

**DoD:** `npm install && npm run build` `/dist` ichida deploylanadigan optimallashtirilgan saytni beradi; SCSS o'zgartirilganda CSS avtomatik yangilanadi.

---

## E2 — i18n arxitekturasini birlashtirish (4 til: uz, ru, en, zh)

**Maqsad:** ikkita parallel tizimni bitta manbaga keltirish va xitoychani qo'shishni arzon qilish.

**Tegishli fayllar:** `assets/js/translate.js`, `assets/js/a11y-menu.js`, `assets/lang/*.json`, barcha `*.html`

**Vazifalar:**

- [ ] Bitta i18n manbasi: `assets/lang/{uz,ru,en,zh}.json`. A11y menyusi matnlari ham shu JSON kalitlariga ko'chiriladi (HTML ichidagi `data-lang` span'lar olib tashlanadi).
- [ ] `assets/lang/zh.json` yaratiladi — `en.json` dagi **barcha kalitlar** bilan to'liq parite (kalit yo'qolmaydi).
- [ ] Til tanlagich har sahifada bitta umumiy komponentga keltiriladi (yoki ikkala nusxa ham `zh` opsiyasini oladi): `<option value="zh">中文</option>`.
- [ ] `translate.js`: tanlangan tilga qarab `<html lang>` to'g'ri o'rnatiladi (`uz` / `ru` / `en` / `zh-Hans`) va `dir` (CJK uchun `ltr`).
- [ ] FOUC bartaraf: standart matn HTMLda til kalitiga mos statik holda bo'ladi (JS ishlamasa ham kontent ko'rinadi — SEO uchun ham muhim, E4).
- [ ] Standart til mantig'i: `localStorage` → brauzer tili → `ru`. Xitoy brauzeri (`zh*`) avtomatik `zh`.
- [ ] Til tanlash URL'da aks etadi (E4 bilan birga: `?lang=zh` yoki `/zh/` — SEO talabiga ko'ra tanlanadi).

**DoD:** Bitta JSON + bitta selector orqali 4 til ishlaydi; yangi til qo'shish faqat 1 ta JSON fayl talab qiladi; a11y menyu ham 4 tilda.

---

## E3 — Xitoy tili kontenti (zh-Hans)

**Maqsad:** sifatli, faktik, professional xitoycha matn.

**Vazifalar:**

- [ ] `zh.json` — Claude soddalashtirilgan xitoycha (zh-Hans, materik Xitoy biznes auditoriyasi uchun) **qoralama** tarjimasini beradi.
- [ ] Maxsus atamalar lug'ati tuziladi (loyihalash institut, mualliflik nazorati, ШНК normativlari, seysmik chidamlilik, smeta hujjati va h.k.) — izchillik uchun.
- [ ] Tarjima **inson/native ko'rik**ka beriladi (3-bo'lim talabi). Claude tasdiqlanmagan matnni "final" deb belgilamaydi.
- [ ] Blog xitoychasi: Hygraph CMS sxemasiga `titleZh` va `descriptionZh` maydonlari qo'shilishi kerakligi hujjatlanadi (buyurtmachi tomonida CMS ishi); `blogs.js`/`blog-details.js` `zh` fallback bilan moslashtiriladi (zh yo'q bo'lsa → en).
- [ ] Joy nomlari/manzil xitoychada to'g'ri (Toshkent — 塔什干; manzil xitoycha varianti).
- [ ] Sana, telefon, ish vaqti formati xitoy auditoriyasiga mos ko'rsatiladi.

**DoD:** Sayt to'liq zh-Hans da ko'rinadi; tarjima ko'rik holati hujjatda belgilangan; blog zh fallback bilan ishlaydi.

---

## E4 — SEO va topilish (Google + Baidu)

**Maqsad:** har til alohida indekslanadi; xitoy qidiruvida (Baidu) topiladi.

**Vazifalar:**

- [ ] Har sahifa uchun til-spetsifik `<title>`, `<meta name="description">`, Open Graph, Twitter Card.
- [ ] `hreflang` teglar (uz, ru, en, zh-Hans, x-default).
- [ ] Pre-render: build paytida har til uchun statik HTML generatsiya qilinadi (kontent JSdan emas, HTMLda bo'ladi) — bot indekslashi uchun. Til URL strategiyasi: `/zh/...` (tavsiya) yoki sub-pathsiz + hreflang.
- [ ] `sitemap.xml` (har til/URL bilan) + `robots.txt`.
- [ ] Structured data (JSON-LD): `Organization`, `LocalBusiness`, loyihalar uchun `CreativeWork`.
- [ ] Semantik HTML: bitta `<h1>`, to'g'ri sarlavha ierarxiyasi, `alt` matnlar (har tilda).
- [ ] **Baidu uchun:** Baidu SEO talablariga moslik (ICP eslatmasi 4-eslatmada), Baidu Webmaster/Tongji uchun joy; sahifa Baidu spider'iga server HTML beradi.
- [ ] Canonical URL'lar.

> **Eslatma (ICP):** Sayt Xitoy ichidagi serverda joylashtirilmasa ICP litsenziyasi shart emas, lekin Baidu indekslash va Xitoydan tezlik uchun arxitektura E5 da hal qilinadi. ICP olish — buyurtmachining biznes qarori, TZ doirasidan tashqarida.

**DoD:** Har til uchun unikal meta + hreflang; "view source" da kontent ko'rinadi; sitemap/robots/JSON-LD validatsiyadan o'tadi.

---

## E5 — Xitoydan tezlik (Great Firewall'ga bardoshli)

**Maqsad:** Xitoy foydalanuvchisi uchun tez va to'liq yuklanadigan sayt.

**Vazifalar:**

- [ ] **Barcha tashqi bog'liqliklarni audit qilish va olib tashlash:** Google Fonts, Google Analytics, Google Maps, gstatic, jsDelivr/unpkg/cdnjs, GSAP CDN va h.k. — hammasi self-hosted bo'ladi (loyiha asosan self-hosted, lekin tekshirib chiqiladi).
- [ ] Xarita: Google Maps o'rniga statik rasm yoki Amap/Baidu Map (xitoy tili sahifasida) yoki oddiy manzil bloki.
- [ ] Shriftlar self-hosted, CJK uchun subset (faqat kerakli iyerogliflar) — `font-display: swap`.
- [ ] Kritik CSS inline, qolgan CSS defer; ishlatilmaydigan CSS/JS tozalanadi (557KB FontAwesome Pro — faqat kerakli ikonkalar qoldiriladi yoki SVG sprite).
- [ ] Tasvir optimizatsiyasi (E1 pipeline), lazy-load, to'g'ri o'lcham.
- [ ] **Performance budjeti:** LCP ≤ 2.5s, jami JS ≤ 300KB (gzip), CLS < 0.1 — simulyatsiya qilingan sekin/Xitoy tarmoq sharoitida.
- [ ] (Tavsiya, buyurtmachi qaroriga) Xitoyga yaqin CDN/hosting yoki global CDN (Cloudflare China network / Alibaba Cloud) — TZ tavsiya beradi, ijro biznes qaroriga bog'liq.

**DoD:** Sahifada Xitoyda bloklanadigan tashqi so'rov 0 ta; Lighthouse Performance ≥ 90 (mobil, sekin tarmoq); performance budjeti bajariladi.

---

## E6 — Xitoy bozoriga moslashtirilgan kontent va UX

**Maqsad:** xitoy B2B (qurilish/EPC/developer) kompaniyalari uchun aniq qiymat taklifi — faktik chegarada.

**Vazifalar:**

- [ ] **"Xalqaro / Xitoy hamkorlari uchun" sahifasi** (`cooperation` / 中外合作): xitoy kompaniyasi O'zbekistonda loyiha qilganda institut nima beradi — mahalliy normativlarga (ШНК) moslashtirish, ekspertiza/ruxsatdan o'tkazish, mualliflik nazorati, loyiha lokalizatsiyasi, davlat organlari bilan ishlash. Faqat haqiqiy xizmatlar.
- [ ] Ishonch signallari (faktik): tashkil etilgan yili (1937 — "vaqt sinovidan o'tgan" mavzusi mavjud, kuchaytiriladi), real portfolio (yirik ob'ektlar foto bilan), litsenziya/normativ maqomi, davlat ob'ektlari referenslari.
- [ ] Aloqa kanallari xitoy auditoriyasiga: **WeChat QR**, **WhatsApp**, email, xalqaro formatdagi telefon, vaqt mintaqasi eslatmasi (UTC+5 / Pekin bilan farq), manzil xitoychada.
- [ ] So'rov (inquiry) formasi xitoy auditoriyasiga: oddiy, kompaniya nomi/loyiha turi maydonlari, ko'p tilli validatsiya xabarlari, server tomonga to'g'ri yo'naltirish (E8).
- [ ] CTA'lar har tilda tabiiy ("联系我们", "合作咨询" va h.k. — native ko'rikdan).
- [ ] Portfolio/loyihalar bo'limi xitoy foydalanuvchisi uchun ham filtrlanadi va tez yuklanadi.
- [ ] Maxfiylik siyosati / foydalanish shartlari sahifasi (har tilda, jumladan zh) — forma orqali ma'lumot yig'ilgani uchun majburiy.

**DoD:** Hamkorlik sahifasi 4 tilda mavjud; barcha kontent faktik (3-bo'lim); WeChat/WhatsApp/email ishlaydi; maxfiylik sahifasi mavjud.

---

## E7 — CJK tipografika va dizayn

**Maqsad:** xitoycha matn professional va o'qilishi qulay ko'rinishi.

**Vazifalar:**

- [ ] CJK font-stack: `"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif` (Noto Sans SC self-hosted subset).
- [ ] `:lang(zh)` uchun alohida `line-height` (≈1.7–1.8), `letter-spacing`, `font-weight` (Hanzi uchun italic ishlatilmaydi).
- [ ] Tugma/menyu/sarlavhalarda xitoycha matn uzunligi farqi tekshiriladi (layout buzilmasligi) — uzun ru/en va qisqa zh.
- [ ] Raqam/sana/valyuta formatlari `:lang(zh)` da to'g'ri.
- [ ] Dark/light mavzu (mavjud a11y menyu) zh da ham to'g'ri ishlaydi.

**DoD:** zh sahifalarida tipografika tekis, layout buzilmaydi, mavjud 4 tilda vizual tekshiruvdan o'tadi.

---

## E8 — Kontakt / lead pipeline (xavfsizlik va ishonchlilik)

**Maqsad:** so'rovlar yo'qolmasin, spam/abuse bo'lmasin, qonuniy bo'lsin.

**Tegishli fayllar:** `api/telegram.php`, `api/.htaccess`, `assets/js/contactForm.js`, `assets/js/main.js` (forma submit)

**Vazifalar:**

- [ ] Server tomonda kirish validatsiyasi va sanitatsiya (P0 bilan birga).
- [ ] Spam himoyasi: honeypot + rate-limit (token client'da emas — server kalitlari serverda).
- [ ] CORS faqat o'z domeni(lari)ga.
- [ ] Forma natijasi ishonchli yetkaziladi (Telegram + zaxira sifatida email yoki log); xatolik holati foydalanuvchiga 4 tilda ko'rsatiladi.
- [ ] Yig'ilgan ma'lumot bo'yicha maxfiylik bildirgisi (E6) bilan bog'lanadi (rozilik belgisi).

**DoD:** Forma 4 tilda ishlaydi, spam testdan himoyalangan, maxfiy kalit faqat serverda, so'rov ishonchli yetib boradi.

---

## E9 — Sifat, accessibility, brauzer qo'llab-quvvatlash

**Vazifalar:**

- [ ] Mavjud a11y menyu saqlanadi va 4 tilda ishlaydi; WCAG 2.1 AA bo'yicha asosiy tekshiruv (kontrast, klaviatura, `alt`, ARIA, fokus).
- [ ] Responsiv: mobil/planshet/desktop 4 tilda tekshiriladi (xitoy mobil ulushi yuqori).
- [ ] Brauzerlar: zamonaviy Chrome/Edge/Firefox/Safari + Xitoyda keng tarqalgan (WeChat ichki brauzer, UC, QQ) bo'yicha asosiy tekshiruv.
- [ ] Konsol xatolari 0 ta; buzilgan havola/rasm 0 ta.
- [ ] 404 sahifa har tilda.

**DoD:** Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 (asosiy sahifalar, mobil).

---

## E10 — Analitika va o'lchov (Google'siz, Xitoyga bardoshli)

**Vazifalar:**

- [ ] Google Analytics ishlatilmaydi (Xitoyda bloklanadi). O'rniga: self-hosted **Plausible/Umami/Matomo** yoki **Baidu Tongji** (xitoy trafigi uchun).
- [ ] Asosiy konversiyalar kuzatiladi: forma yuborish, WeChat/WhatsApp bosish, til tanlash, hamkorlik sahifasi ko'rishlari.
- [ ] Cookie/maxfiylik bildirgisi analitika bilan muvofiqlashtiriladi.

**DoD:** Trafik va konversiya Xitoydan ham o'lchanadi; Google'ga bog'liqlik 0 ta.

---

## 4. Texnik talablar (umumiy)

- **Tillar:** `uz`, `ru`, `en`, `zh` (zh-Hans). Standart: brauzer tili → `ru`.
- **Performance budjeti:** LCP ≤ 2.5s, CLS < 0.1, JS ≤ 300KB gzip, sekin/Xitoy tarmoq simulyatsiyasida.
- **Tashqi bog'liqlik:** Xitoyda bloklanadigan domenlar — **0 ta**.
- **Kod:** Prettier + ESLint; SCSS manba, `style.css` build natijasi (qo'lda tahrirlanmaydi).
- **Deploy:** joriy Apache/PHP hosting saqlanadi; build natijasi `/dist` ga.
- **Maxfiy kalitlar:** faqat serverda (`.env`), git'ga tushmaydi.

## 5. Bosqichlar (ketma-ketlik)

1. **Bosqich 0:** P0 (xavfsizlik) — darhol.
2. **Bosqich 1:** E1 (poydevor) → E2 (i18n birlashtirish).
3. **Bosqich 2:** E3 (zh kontent) → E7 (CJK) → E4 (SEO).
4. **Bosqich 3:** E5 (Xitoy tezlik) → E6 (xitoy UX/hamkorlik) → E8 (forma).
5. **Bosqich 4:** E9 (sifat) → E10 (analitika) → yakuniy QA.

Har bosqich oxirida tegishli DoD tekshiriladi.

## 6. Yakuniy qabul mezonlari (Definition of Done)

- [ ] Sayt 4 tilda to'liq ishlaydi; zh-Hans tarjimasi inson ko'rikidan o'tgan.
- [ ] Maxfiy kalit client kodda yo'q; forma/blog server orqali xavfsiz.
- [ ] Xitoyda bloklanadigan tashqi so'rov 0 ta; performance budjeti bajarilgan.
- [ ] Har til indekslanadi (view-source da kontent bor); hreflang/sitemap/JSON-LD to'g'ri.
- [ ] Xitoy hamkorlik sahifasi + WeChat/WhatsApp + maxfiylik sahifasi mavjud.
- [ ] Lighthouse maqsadli ballari (E9) bajarilgan.
- [ ] Barcha kontent faktik; 3-bo'lim cheklovlari buzilmagan.

## 7. Risklar

| Risk | Yumshatish |
|------|------------|
| Tarjima sifati (texnik atamalar) | Lug'at + majburiy native ko'rik (3-bo'lim) |
| Git tarixidagi oshkor token | Buyurtmachi tokenni bekor qiladi (P0) |
| Hygraph CMS sxemasi zh maydonsiz | E3 da hujjatlanadi; `zh→en` fallback |
| ICP/Xitoy hosting biznes qarori | TZ tavsiya beradi, ijro buyurtmachida |
| 30+ kutubxonani tozalashda regressiya | Bosqichli, har sahifani QA bilan |

## 8. Yetkazib beriladigan natijalar

- Build pipeline (`package.json`, Vite konfiguratsiya, skriptlar).
- Birlashtirilgan i18n + `assets/lang/zh.json` (qoralama, ko'rik holati belgilangan).
- 4 tilli sayt (`/dist`), pre-render qilingan, SEO/sitemap/hreflang/JSON-LD bilan.
- Xitoy hamkorlik sahifasi, maxfiylik sahifasi, WeChat/WhatsApp aloqa.
- Xavfsiz server-side forma/blog pipeline.
- Yangilangan `README.md` + ushbu `TZ.md` + tarjima atamalari lug'ati.

---

## 9. Claude + VS Code bilan ishlash — har blok uchun topshiriq formulasi

Har bir epikni alohida sessiyada bering. Tavsiya etilgan prompt shabloni:

```
Kontekst: TZ.md fayldagi <E#> blokini bajaramiz. Loyiha — TOSHGIPROGOR statik sayti.
3-bo'limdagi "chegaradan chiqmaslik" cheklovlari kuchda (faqat faktik ma'lumot).

Vazifa: <E# dagi checklist'ni keltiring>

Talab:
1. Avval o'zgartiriladigan fayllar ro'yxati va reja.
2. Keyin amalga oshirish.
3. Har bir o'zgarish uchun DoD bo'yicha qanday tekshirishni ayt.
4. Faktik ma'lumotni o'ylab topma — joy qoldir va menga "buyurtmachidan tasdiq kerak" deb belgila.
```

Tavsiya: har blokdan keyin o'zgarishlarni ko'rib chiqing, qabul mezonini tekshiring, keyin keyingisiga o'ting. Xitoycha matn va faktik raqamlar — har doim inson tasdig'i bilan.
