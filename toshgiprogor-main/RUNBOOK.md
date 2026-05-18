# RUNBOOK — TOSHGIPROGOR modernizatsiyasi (VS Code + Claude)

> Bu fayl `TZ.md` ni bosqichma-bosqich ijro qilish uchun amaliy qo'llanma.
> Tartib (TZ §5): **P0 → E1 → E2 → E3 → E7 → E4 → E5 → E6 → E8 → E9 → E10 → yakuniy QA**

## Umumiy qoidalar

- Har blokdan **oldin** toza sessiya: `/clear` qiling (yoki `claude` ni qayta ishga tushiring) — kontekst aralashmasligi uchun.
- Commit'ni faqat o'sha blokning **DoD'i tasdiqlangach** qiling.
- Faktik ma'lumot (raqam, mijoz, sertifikat, sana) hech qachon o'ylab topilmaydi — `TZ.md` §3 cheklovlari kuchda.
- Xitoycha (zh-Hans) matn "yakuniy" emas — inson/native ko'rik talab qilinadi.

## Boshlang'ich sozlama (bir marta)

```powershell
code "C:\Users\Hp\Desktop\NODE_JS\toshgiprogor-main\toshgiprogor-main"
git init
git add -A
git commit -m "Boshlang'ich holat (modernizatsiyadan oldin)"
```

Keyin VS Code terminalida `claude` ni ishga tushiring.

---

## Bosqich 0 — P0: Kritik xavfsizlik

> ⚠️ Koddan OLDIN: @BotFather'da eski tokenni bekor qilib, yangi token oling (qo'lda qadam).

**Prompt:**

```
Kontekst: TZ.md fayldagi P0 (kritik xavfsizlik) blokini bajaramiz.
3-bo'limdagi "chegaradan chiqmaslik" cheklovlari kuchda.

Vazifa: telegram-blog-checker.js dagi ochiq token/chat_id ni client koddan
butunlay olib tashla; Telegramga yuborishni faqat server tomonda
(api/telegram.php) qoldir; maxfiy kalitlar serverdagi .env dan o'qilsin;
api/telegram.php da CORS ni faqat o'z domeniga chekla.

Talab:
1. Avval o'zgartiriladigan fayllar ro'yxati va reja.
2. Keyin amalga oshirish.
3. DoD bo'yicha qanday tekshirishni ayt (DevTools'da token ko'rinmasligi).
4. Faktik ma'lumotni o'ylab topma.
```

**Commit:**

```powershell
git add -A; git commit -m "P0: maxfiy kalitlar client koddan olib tashlandi"
```

---

## Bosqich 1 — E1: Texnik poydevor

**Prompt:**

```
Kontekst: TZ.md dagi E1 (Texnik poydevor) blokini bajaramiz.
3-bo'limdagi "chegaradan chiqmaslik" cheklovlari kuchda.

Vazifa: TZ.md ning E1 bo'limini o'qib, undagi checklist'ni bajar
(package.json + Vite, SCSS avtomatik kompilyatsiya, minify, rasm pipeline,
dev/build skriptlari, prettier/eslint, README).

Talab:
1. Avval o'zgartiriladigan/qo'shiladigan fayllar ro'yxati va reja.
2. Keyin amalga oshirish.
3. E1 DoD bo'yicha tekshirishni ayt (npm install && npm run build /dist beradi).
4. Faktik ma'lumotni o'ylab topma.
```

**Commit:**

```powershell
git add -A; git commit -m "E1: build poydevori (Vite, SCSS, optimizatsiya pipeline)"
```

---

## Bosqich 1 — E2: i18n birlashtirish

**Prompt:**

```
Kontekst: TZ.md dagi E2 (i18n arxitekturasini birlashtirish) blokini bajaramiz.
Cheklovlar kuchda.

Vazifa: TZ.md ning E2 bo'limini o'qib bajar — ikkita parallel i18n tizimini
(data-translate JSON + a11y data-lang span'lar) bittaga keltir, zh.json
yarat (en.json bilan to'liq kalit pariteti), til tanlagichga zh qo'sh,
<html lang> dinamik o'rnatilsin, FOUC bartaraf.

Talab:
1. Fayllar ro'yxati va reja.
2. Amalga oshirish.
3. E2 DoD tekshiruvi (4 til + a11y menyu, yangi til = 1 JSON).
4. zh.json matnini hozircha bo'sh/inglizcha placeholder qoldir — tarjima E3 da.
```

**Commit:**

```powershell
git add -A; git commit -m "E2: i18n bitta arxitekturaga birlashtirildi, zh tayyorlandi"
```

---

## Bosqich 2 — E3: Xitoy tili kontenti (zh-Hans)

**Prompt:**

```
Kontekst: TZ.md dagi E3 (Xitoy tili kontenti) blokini bajaramiz.
3-bo'lim cheklovlari kuchda: faktik ma'lumot o'ylab topilmaydi.

Vazifa: TZ.md ning E3 bo'limini bajar — zh.json uchun zh-Hans QORALAMA
tarjima, atamalar lug'ati tuz, blogs.js/blog-details.js da zh->en fallback,
Hygraph CMS sxemasiga titleZh/descriptionZh kerakligini hujjatla.

Talab:
1. Reja + atamalar lug'ati.
2. Qoralama tarjima (final emas).
3. Har bir tasdiqlanmagan faktik qiymatni "buyurtmachidan tasdiq kerak" deb belgila.
4. zh matnini "yakuniy" deb belgilama — inson/native ko'rik kerak.
```

**Commit:**

```powershell
git add -A; git commit -m "E3: zh-Hans qoralama tarjima + atamalar lug'ati (inson korigi kutilmoqda)"
```

---

## Bosqich 2 — E7: CJK tipografika

**Prompt:**

```
Kontekst: TZ.md dagi E7 (CJK tipografika va dizayn) blokini bajaramiz.
Cheklovlar kuchda.

Vazifa: TZ.md ning E7 bo'limini bajar — CJK font-stack (Noto Sans SC
self-hosted subset), :lang(zh) uchun line-height/letter-spacing,
tugma/menyu matn uzunligi tekshiruvi, dark/light zh da.

Talab:
1. Fayllar + reja.
2. Amalga oshirish.
3. E7 DoD: zh layout buzilmaydi, 4 tilda vizual tekshiruv.
```

**Commit:**

```powershell
git add -A; git commit -m "E7: CJK tipografika va zh layout moslashtirildi"
```

---

## Bosqich 2 — E4: SEO va topilish

**Prompt:**

```
Kontekst: TZ.md dagi E4 (SEO) blokini bajaramiz. Cheklovlar kuchda.

Vazifa: TZ.md ning E4 bo'limini bajar — til-spetsifik meta/OG, hreflang,
har til uchun pre-render (kontent HTMLda), sitemap.xml/robots.txt,
JSON-LD (Organization/LocalBusiness), semantik HTML, Baidu uchun moslik,
canonical.

Talab:
1. Fayllar + reja (URL strategiyasi: /zh/ vs hreflang — tavsiya ber).
2. Amalga oshirish.
3. E4 DoD: view-source da kontent bor, hreflang/sitemap/JSON-LD valid.
4. Faktik kompaniya ma'lumotini o'ylab topma.
```

**Commit:**

```powershell
git add -A; git commit -m "E4: SEO (meta, hreflang, pre-render, sitemap, JSON-LD)"
```

---

## Bosqich 3 — E5: Xitoydan tezlik (GFW)

**Prompt:**

```
Kontekst: TZ.md dagi E5 (Xitoydan tezlik) blokini bajaramiz. Cheklovlar kuchda.

Vazifa: TZ.md ning E5 bo'limini bajar — barcha tashqi bog'liqlikni audit
qilib self-host qil (Google Fonts/Analytics/Maps/CDN), xaritani statik/Amap
ga almashtir, font subset, kritik CSS, ishlatilmaydigan CSS/JS tozalash,
performance budjeti (LCP<=2.5s, JS<=300KB gzip).

Talab:
1. Tashqi so'rovlar audit ro'yxati + reja.
2. Amalga oshirish.
3. E5 DoD: Xitoyda bloklanadigan so'rov 0 ta, Lighthouse Perf >=90 (mobil).
```

**Commit:**

```powershell
git add -A; git commit -m "E5: Xitoydan tezlik (tashqi boglanishlar 0, performance budjeti)"
```

---

## Bosqich 3 — E6: Xitoy bozori UX / hamkorlik

**Prompt:**

```
Kontekst: TZ.md dagi E6 (Xitoy bozoriga moslashtirilgan kontent/UX)
blokini bajaramiz. 3-bo'lim cheklovlari KUCHLI kuchda: faqat faktik
xizmatlar, soxta mijoz/sertifikat yo'q, siyosiy mavzu yo'q.

Vazifa: TZ.md ning E6 bo'limini bajar — "Xitoy hamkorlari uchun" sahifasi,
faktik ishonch signallari, WeChat QR/WhatsApp/email aloqa, inquiry forma,
4 tilli CTA, maxfiylik siyosati sahifasi.

Talab:
1. Fayllar + reja.
2. Amalga oshirish.
3. Har bir faktik da'voni "buyurtmachidan tasdiq kerak" deb belgila;
   real bo'lmagan logotip/sharh/raqam qo'shma.
4. E6 DoD: 4 tilda hamkorlik + maxfiylik sahifasi, aloqa kanallari ishlaydi.
```

**Commit:**

```powershell
git add -A; git commit -m "E6: Xitoy hamkorlik sahifasi, WeChat/WhatsApp, maxfiylik (faktik)"
```

---

## Bosqich 3 — E8: Kontakt/lead pipeline

**Prompt:**

```
Kontekst: TZ.md dagi E8 (Kontakt/lead pipeline xavfsizligi) blokini
bajaramiz. Cheklovlar kuchda.

Vazifa: TZ.md ning E8 bo'limini bajar — server tomonda validatsiya/
sanitatsiya, honeypot + rate-limit, CORS faqat o'z domeni, ishonchli
yetkazish (Telegram + zaxira), 4 tilli xato xabarlari, rozilik belgisi.

Talab:
1. Fayllar + reja.
2. Amalga oshirish.
3. E8 DoD: forma 4 tilda, spam himoyalangan, kalit faqat serverda.
```

**Commit:**

```powershell
git add -A; git commit -m "E8: kontakt forma xavfsizligi va ishonchli yetkazish"
```

---

## Bosqich 4 — E9: Sifat / accessibility

**Prompt:**

```
Kontekst: TZ.md dagi E9 (Sifat, accessibility, brauzer) blokini bajaramiz.
Cheklovlar kuchda.

Vazifa: TZ.md ning E9 bo'limini bajar — a11y menyu 4 tilda + WCAG 2.1 AA
tekshiruvi, responsiv 4 tilda, WeChat/UC/QQ brauzer tekshiruvi,
konsol/havola xatolari 0, 404 sahifa har tilda.

Talab:
1. Tekshiruv ro'yxati + topilgan muammolar.
2. Tuzatish.
3. E9 DoD: Lighthouse Perf>=90, A11y>=95, BP>=95, SEO>=95 (mobil).
```

**Commit:**

```powershell
git add -A; git commit -m "E9: sifat, accessibility (WCAG AA), brauzer moslik"
```

---

## Bosqich 4 — E10: Analitika

**Prompt:**

```
Kontekst: TZ.md dagi E10 (Analitika, Google'siz) blokini bajaramiz.
Cheklovlar kuchda.

Vazifa: TZ.md ning E10 bo'limini bajar — Google'siz analitika
(Plausible/Umami/Matomo yoki Baidu Tongji), asosiy konversiyalar
(forma, WeChat/WhatsApp bosish, til, hamkorlik sahifasi),
cookie/maxfiylik muvofiqligi.

Talab:
1. Tavsiya (qaysi analitika) + reja.
2. Amalga oshirish.
3. E10 DoD: Xitoydan o'lchanadi, Google bog'liqligi 0.
```

**Commit:**

```powershell
git add -A; git commit -m "E10: Google'siz analitika va konversiya o'lchovi"
```

---

## Yakuniy QA

**Prompt:**

```
Kontekst: TZ.md ning 6-bo'limidagi yakuniy "Definition of Done"
ro'yxatini tekshiramiz. Cheklovlar kuchda.

Vazifa: 6-bo'limdagi har bir punktni tekshir, bajarilmaganlarini ro'yxatla
va tuzat. npm run build qilib /dist ni yakuniy tekshir.

Talab: To'liq DoD jadvali — bajarilgan/bajarilmagan, qolgan ishlar bilan.
```

**Commit:**

```powershell
git add -A; git commit -m "Yakuniy QA: TZ Definition of Done bajarildi"
```
