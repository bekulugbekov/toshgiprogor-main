# TOSHGIPROGOR — Rasmiy veb-sayt

**TOSHGIPROGOR ASJ** (Toshkent shahar bosh loyihalash instituti, 1937-yildan).
Sayt manzili: [tashgiprogor.uz](https://tashgiprogor.uz)

---

## Texnik stack

| Qatlam | Texnologiya |
|--------|-------------|
| Markup | Statik ko'p sahifali HTML (8 sahifa) |
| Stil | SCSS → CSS (Vite + sass + autoprefixer + cssnano) |
| Skriptlar | jQuery 3.6.0 + Bootstrap 5 + vendor pluginlar |
| Build | [Vite 5](https://vitejs.dev/) |
| i18n | `assets/lang/{uz,ru,en,zh}.json` + `translate.js` |
| Backend | PHP (`api/telegram.php`) — kontakt forma |

---

## O'rnatish va ishga tushirish

**Talablar:** Node.js ≥ 20, npm ≥ 10

```bash
npm install
```

### Lokal ishlab chiqish

```bash
npm run dev
```
Brauzer avtomatik http://localhost:3000 da ochiladi. SCSS va HTML o'zgarishlari hot-reload bilan darhol aks etadi.

### Production build

```bash
npm run build
```
Natija: `dist/` papkasi — to'liq deploylanadigan statik sayt (minifikatsiya qilingan CSS/JS, content-hash fayl nomlari).

### Build natijasini ko'rish

```bash
npm run preview
```

---

## Fayl strukturasi

```
├── assets/
│   ├── css/          vendor CSS fayllar (bootstrap, owl, slick va h.k.)
│   ├── scss/
│   │   └── style.scss   ← asosiy stil manbasi (shu faylni tahrirlang)
│   ├── js/           vendor + maxsus JS fayllar
│   ├── img/          rasmlar (.jpg/.png + .webp/.avif build pipeline orqali)
│   ├── fonts/        self-hosted shriftlar
│   └── lang/
│       ├── uz.json   O'zbek tili
│       ├── ru.json   Rus tili
│       ├── en.json   Ingliz tili
│       └── zh.json   Xitoy tili (zh-Hans) ← E3 da qo'shiladi
├── api/
│   └── telegram.php  kontakt forma server-side handler
├── scripts/
│   └── optimize-images.js  rasm konvertatsiya pipeline
├── dist/             build natijasi (git'ga tushmaydi)
├── vite.config.js
├── postcss.config.js
└── TZ.md             texnik topshiriq hujjati
```

---

## Stil manbasi: SCSS

Barcha maxsus stillar `assets/scss/style.scss` da saqlanadi.
**`assets/css/style.css` ni bevosita tahrirlash taqiqlanadi** — u build natijasi.

```bash
# Dev rejimida SCSS o'zgarishlari avtomatik aks etadi.
# Build uchun:
npm run build
```

---

## Rasmlarni optimallashtirish

```bash
npm run images
```

Bu skript `assets/img/` ichidagi barcha `.jpg`/`.png` rasmlardan `.webp` va `.avif` variantlar yaratadi. Keyin HTML da `<picture>` tegi orqali ishlating:

```html
<picture>
  <source srcset="assets/img/rasm.avif" type="image/avif">
  <source srcset="assets/img/rasm.webp" type="image/webp">
  <img src="assets/img/rasm.jpg" alt="..." loading="lazy" width="800" height="600">
</picture>
```

---

## Kod standartlari

```bash
npm run lint      # ESLint — JS fayllar
npm run format    # Prettier — JS, SCSS, HTML
```

Konfiguratsiya: `.editorconfig`, `.prettierrc`, `eslint.config.js`

---

## Ko'p tillilik (i18n)

Sahifada matn `data-translate="kalit"` atributi orqali belgilanadi.
Tarjimalar `assets/lang/` papkasidagi JSON fayllarda saqlanadi.
Yangi til qo'shish: bitta JSON fayl + til tanlagichga `<option>` qo'shish.

---

## Deploy

Build natijasi (`dist/`) Apache serveriga to'g'ridan-to'g'ri ko'chiriladi.
`.env` da maxfiy kalitlar (Telegram bot token va boshqalar) saqlanadi — **git'ga tushmaydi**.

---

## Loyiha hujjati

Batafsil texnik topshiriq va modernizatsiya rejasi: [TZ.md](TZ.md)
