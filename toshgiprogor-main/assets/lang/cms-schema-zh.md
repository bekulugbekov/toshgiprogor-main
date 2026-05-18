# Hygraph CMS — zh-Hans Maydonlari Hujjati
# Hygraph CMS — 简体中文字段说明

> **Bajaruvchi:** Buyurtmachi (CMS admin) — bu o'zgarishlar Hygraph CMS boshqaruv panelida amalga oshiriladi.
> **Holat:** Texnik tavsiya — kod tomonidan fallback tayyorlangan, CMS tomoni kutilmoqda.

---

## Qo'shilishi kerak bo'lgan maydonlar

Hygraph CMS'dagi `Blog` kontentida quyidagi ikkita yangi maydon yaratilishi kerak:

### 1. `titleZh` — Sarlavha (xitoycha)

| Xususiyat | Qiymat |
|-----------|--------|
| **Maydon nomi (API ID)** | `titleZh` |
| **Ko'rsatiladigan nom** | Title (Chinese) / 标题（中文） |
| **Maydon turi** | Single line text |
| **Majburiyligi** | Ixtiyoriy (optional) |
| **Izoh** | Xitoycha sarlavha; bo'sh qoldirilsa, kod avtomatik `titleEn` ga qaytadi (fallback) |

### 2. `descriptionZh` — Tavsif (xitoycha)

| Xususiyat | Qiymat |
|-----------|--------|
| **Maydon nomi (API ID)** | `descriptionZh` |
| **Ko'rsatiladigan nom** | Description (Chinese) / 描述（中文） |
| **Maydon turi** | Rich text (xuddi `descriptionEn` kabi) |
| **Majburiyligi** | Ixtiyoriy (optional) |
| **Izoh** | Xitoycha tavsif; bo'sh qoldirilsa, kod avtomatik `descriptionEn` ga qaytadi (fallback) |

---

## Fallback mantiqi (kod tomonida amalga oshirilgan)

```
zh tili tanlanganda:
  title  = titleZh  || titleEn   (zh bo'sh bo'lsa → en)
  description = descriptionZh.text || descriptionEn.text
```

Bu mantiq quyidagi fayllarda allaqachon yozilgan:
- [assets/js/blogs.js](../js/blogs.js) — `renderBlogs()` funksiyasi
- [assets/js/blog-details.js](../js/blog-details.js) — `renderLastBlogs()` va `renderBlogDetails()` funksiyalari

---

## CMS da qo'shish bosqichlari (Hygraph boshqaruv paneli)

1. **Hygraph dashboard** → Content → Schema → `Blog` modelini oching.
2. **"Add field"** tugmasini bosing:
   - Field type: **Single line text**
   - API ID: `titleZh`
   - Display name: `Title (Chinese)`
   - Save.
3. Yana **"Add field"**:
   - Field type: **Rich text**
   - API ID: `descriptionZh`
   - Display name: `Description (Chinese)`
   - Save.
4. Har bir blog postini tahrirlashda `titleZh` va `descriptionZh` maydonlarini xitoycha matn bilan to'ldiring.

---

## GraphQL so'rov namunasi (maydonlar qo'shilgandan keyin)

```graphql
query BlogsWithZh {
  blogConnection {
    edges {
      node {
        id
        slug
        titleEn
        titleZh
        descriptionEn { text }
        descriptionZh { text }
        image { url }
        blogDate
        author
      }
    }
  }
}
```

---

## Muhim eslatmalar

- `titleZh` va `descriptionZh` maydonlari **ixtiyoriy** qilib qo'yilishi kerak — bo'sh bo'lganda sayt tushib qolmasin (fallback ishlaydi).
- Blog kontentini xitoycha to'ldirish — native ko'rikdan o'tgan tarjimachilar bilan amalga oshiriladi (TZ.md §3 talabi).
- CMS sxemasi o'zgargandan keyin `blogs.js` va `blog-details.js` dagi GraphQL so'rovlari allaqachon yangi maydonlarni so'rash uchun tayyor.

---

> **Bog'liq fayllar:**
> - [assets/lang/zh.json](zh.json) — UI tarjimalari
> - [assets/lang/glossary-zh.md](glossary-zh.md) — Atamalar lug'ati
