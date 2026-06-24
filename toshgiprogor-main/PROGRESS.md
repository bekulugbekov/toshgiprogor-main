# TOSHGIPROGOR sayti — ish holati (PROGRESS)

> Bu fayl context tozalangandan keyin ishni davom ettirish uchun. Oxirgi yangilanish: 2026-yil sessiyasi.
> Repo: https://github.com/bekulugbekov/toshgiprogor-main (branch: `master`)
> **MUHIM:** git repo ROOT = `C:\Users\Hp\Desktop\NODE_JS\toshgiprogor-main\` (TASHQI papka).
> Loyiha kodi = `toshgiprogor-main\toshgiprogor-main\` (ICHKI papka). Commit yo'llari `toshgiprogor-main/...` bilan boshlanadi.

---

## 1. Loyiha haqida

- **TOSHGIPROGOR** (ТашГИПроГор) — 1937-yildan beri ishlaydigan Toshkent loyihalash instituti sayti.
- Statik HTML sayt (Bootstrap + jQuery + GSAP), **Vite** bilan build qilinadi, **Netlify** ga deploy.
- **4 til:** uz / ru / en / zh (xitoy). Tarjima `assets/lang/*.json` + `assets/js/translate.js` orqali.
- **Xitoy auditoriyasi muhim** (cooperation.html, WeChat, Baidu Tongji) — shuning uchun tashqi API/CDN'lardan qochamiz (GFW), mahalliy yechimlarni afzal ko'ramiz.
- Deploy: Netlify (`tashgiprogor.netlify.app`), domen `tashgiprogor.uz`.

### Build / dev buyruqlari (ichki papkada)
```
npm run css      # SCSS -> assets/css/style.css (Edit qilgandan keyin SHART)
npm run dev      # vite dev server (port 3000)
npm run build    # css + vite build + pre-render (uz/en/zh dist variantlari)
```
- SCSS manbasi: `assets/scss/style.scss` (partiallar ro'yxati). HTML faqat `assets/css/style.css` ni ulaydi.
- `vite.config.js` → `viteStaticCopy` `assets/{js,css,fonts,img,docs,video}` ni `dist` ga ko'chiradi.

---

## 2. Bu sessiyada bajarilgan ishlar (commit'lar)

| Commit | Tavsif |
|---|---|
| `4eabf14` | Xaritalar Yandex iframe ga o'tkazildi (contact + index), hamkorlik forma backend |
| `10ce05c` | Bosh sahifa video to'g'ridan-to'g'ri stream (sifat tiklandi) |
| `2ac7eaf` | **Korporativ boshqaruv: uzex.uz uslubidagi mahalliy hujjatlar ko'rsatkichi** |
| `50c6224` | Fix: mobil menyu til tanlagich matni ko'rinmasdi (#171717 → #fff) |
| `d5103ed` | Korporativ: Word fayllar PDF'ga aylantirildi (9 ta .doc, tahrirlanmasin) |
| `7b72484` | Korporativ: 2023-2025 biznes-rejalari qo'shildi (PDF) |

### Boshqa tuzatishlar (oldingi commit'lardan, allaqachon tayyor)
- `contact.html` + `index.html`: Yandex Maps iframe (`oid=110804645211`), til almashganda xarita tili ham o'zgaradi (`#yandexMap` / `#yandexMapIndex` + inline script). `_contact.scss`: `filter: grayscale` → `none`.
- `cooperation.html`: hero `col-12`, forma `api/cooperation.php` ga JSON yuboradi (honeypot, rate-limit, 4-til, Telegram). WeChat SVG tuzatildi, yetishmagan skriptlar qo'shildi.
- `privacy.html`: yetishmagan plaginlar qo'shildi (loader osilib qolardi).

---

## 3. ⏳ KUTILAYOTGAN VAZIFA (eng muhim — context tozalangandan keyin davom ettirish kerak)

### Excel hisobotlarni PDF'ga aylantirish — BLOKLANGAN, buyurtmachi tayyor PDF beradi

**Holat:** `assets/docs/Otchot/` da **11 ta Excel hisobot** (.xls/.xlsx) bor. Buyurtmachi ularni ham PDF qilishni so'radi (Excel tahrirlanadi). 

**Nima bo'ldi:** Excel COM (MS Office 16.0) bu muhitda juda ishonchsiz bo'lib chiqdi — `RPC_E_CALL_REJECTED` va `Open()` null qaytarishi tufayli 11 fayldan faqat 6 tasi aylandi, 5 tasi qat'iy yiqildi (takroriy force-kill Excel holatini buzdi). Yaratilgan 6 yarim PDF **o'chirildi** (toza holat uchun). Fayllar haqiqiy formatda (BIFF/ZIP), muammo faqat Excel avtomatlashtirishida edi.

**QAROR:** Buyurtmachi (foydalanuvchi) **tayyor PDF fayllarni o'zi beradi** (xuddi biznes-rejalardek). 

**Foydalanuvchi PDF berganda QILISH KERAK:**
1. Berilgan PDF'larni `assets/docs/Otchot/<yil>/` ga joylashtirish (yoki ko'rsatilgan joydan)
2. `assets/js/corporate-docs.js` da `reports` toifasidagi 11 yozuvni yangilash:
   - `ext: "xls"/"xlsx"` → `ext: "pdf"`
   - `file:` yo'lini `.xls`/`.xlsx` → `.pdf`
   - `size:` ni haqiqiy PDF hajmiga
3. Asl `.xls`/`.xlsx` fayllarni o'chirish (faqat PDF qolsin)
4. Validatsiya: `node -e "global.window={};require('./assets/js/corporate-docs.js')..."` (yo'llar mavjudligi, ext pdf)
5. `npm run css` SHART EMAS (faqat JS + fayllar). Brauzerda tekshirish ixtiyoriy.
6. Commit + push.

**Excel fayllar ro'yxati (PDF kutilmoqda):** `assets/docs/Otchot/{2023,2024,2025}/` — choraklik (I,II,III) + yillik hisobotlar. Aniq nomlar `corporate-docs.js` `reports` bo'limida.

⚠️ Excel COM bilan QAYTA URINMANG — ishlamaydi. LibreOffice ham o'rnatilmagan. Foydalanuvchi PDF beradi.

### Buyurtmachidan kutilayotgan boshqa kontent (cooperation.html)
`cooperation.html` da placeholder'lar (HTML matn): WeChat QR rasm + ID, WhatsApp raqami, portfolio raqami, litsenziya rekvizitlari, davlat ob'ektlari ro'yxati. Buyurtmachi bergach HTML va `assets/lang/*.json` (`coopTrust*`) da almashtirish.

---

## 4. Korporativ boshqaruv bo'limi — arxitektura (asosiy ish)

**Fayl:** `corporate-management.html` + `assets/js/corporate-docs.js` (data) + `assets/js/management.js` (renderer) + `assets/scss/_corporate.scss` (stil).

- **Hygraph (tashqi CMS) o'rniga TO'LIQ MAHALLIY data** — Xitoy uchun tez/ishonchli.
- **uzex.uz uslubi:** chap sidebar (toifalar) + o'ng panel (hujjatlar, fayl turi + hajm belgisi bilan).
- **`corporate-docs.js`** — `window.CORP_DOCS.categories[]`. Har doc: `kind/year/q/num/date/file/ext/size`. Yo'llar XOM, render'da `encodeURI()` (kirill/«»/№/bo'shliq fayl nomlari → 200).
- **`management.js`** — fetch'siz renderer. Sarlavhalar 4 tilda **shablon** orqali (`docTitle()`). `languageChanged` event'da re-render. Fayl ikonkasi ext bo'yicha (pdf=qizil, xls=yashil, doc=ko'k).
- **5 toifa, 36 hujjat:** charter(1), business-plan(4), reports(11), audit(2), facts(18).
- `Tashgiprogor.xlsx` (ildizda) — ICHKI oshkor qilish tekshiruv ro'yxati, OMMAVIY ko'rsatilmaydi.
- Eski Hygraph kodi (`fetchFolders`, tailwind-subset, projects.js) OLIB TASHLANGAN.

---

## 5. Boshqa muhim eslatmalar

- **Memory:** `C:\Users\Hp\.claude\projects\...\memory\` da fakt fayllar bor (`corporate_management.md`, `project_e6_status.md`, `feedback_factual_content.md`, MEMORY.md indeks).
- **Faktik kontent qoidasi:** sayt uchun faktik ma'lumot O'YLAB TOPILMAYDI, xitoycha matn inson ko'rigidan o'tadi (repo TZ.md §3).
- **News (blog):** hali Hygraph orqali (`blogs.js`, `telegram-blog-checker.js`). Foydalanuvchi "hozircha tegmaslik" dedi. Bu sahifalarda konsolда GraphQL xatolari bor — normal (korporativ sahifaga aloqasi yo'q).
- `.claude/launch.json` (ichki va tashqi) — preview uchun, git'ga kiritilmaydi.
- **Lokal til localStorage'da** ('zh' bo'lib qolishi mumkin test'dan) — brauzer yangilash bilan til tanlanadi.

---

## 6. Git holati (sessiya oxiri)

- Branch `master`, `origin/master` bilan sinxron, oxirgi commit `7b72484`.
- Kommitlanmagan: faqat `.claude/` (lokal dev config — kiritilmaydi).
- Ish papkasi toza (Otchot'da 11 Excel fayl, stray PDF yo'q).
