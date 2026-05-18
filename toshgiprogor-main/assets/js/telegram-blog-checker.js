// Telegram Blog Checker - Webhook'siz yechim
// Bu fayl frontend'da blogs API'ni tekshirib, yangi blog'larni Telegram'ga yuboradi

const TELEGRAM_TOKEN = "8241722112:AAELqsade6qDEyZJpM96KvcC_GPidMZqP2U";
const TELEGRAM_CHAT_ID = "-1002723401340";
const SITE_URL = "https://tashgiprogor.uz";
// blogs.js faylida ham BLOGS_GRAPHQL_API_URL bor, shuning uchun boshqa nom ishlatamiz
const TELEGRAM_BLOGS_API_URL =
  "https://eu-west-2.cdn.hygraph.com/content/cm5hkvhzr011507ulay5rda62/master";

// LocalStorage'da saqlash uchun kalitlar
const STORAGE_KEY = "last_checked_blogs";
const LAST_CHECK_TIMESTAMP_KEY = "last_check_timestamp";

// Blog'ning muhim ma'lumotlaridan hash yaratish
function createBlogHash(blog) {
  // Blog'ning barcha muhim ma'lumotlarini birlashtirish
  const content = [
    blog.id || "",
    blog.slug || "",
    blog.titleUz || "",
    blog.titleRu || "",
    blog.titleEn || "",
    blog.descriptionUz?.text || "",
    blog.descriptionRu?.text || "",
    blog.descriptionEn?.text || "",
    blog.image?.url || "",
    blog.blogDate || "",
    blog.author || "",
  ].join("|");

  // Oddiy hash funksiyasi (CRC32 yoki oddiy hash)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32-bit integer ga aylantirish
  }
  return Math.abs(hash).toString(36); // Base36 formatida qaytarish
}

// Blog'ning unique identifikatorini olish (ID'siz - slug + date kombinatsiyasi)
function getBlogUniqueKey(blog) {
  // Slug va blogDate kombinatsiyasi - ID'dan mustaqil va har doim mavjud
  return `${blog.slug || blog.id || "unknown"}_${blog.blogDate || "nodate"}`;
}

// Blog sanasini timestamp'ga aylantirish
function parseBlogDate(blogDate) {
  if (!blogDate) return null;
  try {
    // Turli formatlarni qo'llab-quvvatlash
    const date = new Date(blogDate);
    return isNaN(date.getTime()) ? null : date.getTime();
  } catch (e) {
    return null;
  }
}

// Blog'ning yaratilish yoki yangilanish vaqtini olish (createdAt yoki updatedAt)
function getBlogTimestamp(blog) {
  // Avval updatedAt'ni tekshirish (agar blog o'zgargan bo'lsa)
  if (blog.updatedAt) {
    const updatedAt = parseBlogDate(blog.updatedAt);
    if (updatedAt) return updatedAt;
  }

  // Keyin createdAt'ni tekshirish
  if (blog.createdAt) {
    const createdAt = parseBlogDate(blog.createdAt);
    if (createdAt) return createdAt;
  }

  // Oxirgi variant - blogDate
  if (blog.blogDate) {
    const blogDate = parseBlogDate(blog.blogDate);
    if (blogDate) return blogDate;
  }

  return null;
}

// Oxirgi tekshiruv vaqtini olish
function getLastCheckTimestamp() {
  try {
    const stored = localStorage.getItem(LAST_CHECK_TIMESTAMP_KEY);
    return stored ? parseInt(stored, 10) : null;
  } catch (e) {
    console.error("Error reading last check timestamp:", e);
    return null;
  }
}

// Oxirgi tekshiruv vaqtini saqlash
function saveLastCheckTimestamp(timestamp = Date.now()) {
  try {
    localStorage.setItem(LAST_CHECK_TIMESTAMP_KEY, timestamp.toString());
  } catch (e) {
    console.error("Error saving last check timestamp:", e);
  }
}

// Blogs API'dan ma'lumotlarni olish
async function fetchAllBlogs() {
  try {
    const query = `
      query MyQuery {
        blogConnection {
          edges {
            node {
              id
              slug
              titleEn
              titleRu
              titleUz
              descriptionEn {
                text
              }
              descriptionRu {
                text
              }
              descriptionUz {
                text
              }
              image {
                url
              }
              blogDate
              author
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const response = await fetch(TELEGRAM_BLOGS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL error:", result.errors);
      return [];
    }

    return result.data.blogConnection.edges.map((edge) => edge.node);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

// LocalStorage'dan saqlangan blog ma'lumotlarini olish
// Format: { "blogId": { "hash": "...", "sentAt": "..." } }
function getStoredBlogs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Eski format (faqat array) bo'lsa, yangi formatga o'tkazish
      if (Array.isArray(parsed)) {
        const newFormat = {};
        parsed.forEach((id) => {
          newFormat[id] = { hash: null, sentAt: Date.now() };
        });
        saveStoredBlogs(newFormat);
        return newFormat;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error reading localStorage:", e);
  }
  return {};
}

// LocalStorage'ga blog ma'lumotlarini saqlash
function saveStoredBlogs(blogs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs));
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
}

// Eski format bilan moslik uchun (faqat ID ro'yxati)
function getLastCheckedBlogIds() {
  const stored = getStoredBlogs();
  return Object.keys(stored);
}

function saveLastCheckedBlogIds(blogIds) {
  const stored = getStoredBlogs();
  const newStored = {};
  blogIds.forEach((id) => {
    newStored[id] = stored[id] || { hash: null, sentAt: Date.now() };
  });
  saveStoredBlogs(newStored);
}

// Blog'ning identifikatorini olish (id yoki slug)
function getBlogIdentifier(blog) {
  return blog.id || blog.slug;
}

// Telegram'ga blog yuborish va ID'sini saqlash
async function sendBlogToTelegram(blog) {
  const blogUrl = `${SITE_URL}/blog-details.html?slug=${blog.slug}`;
  const author = blog.author || "Tashgiprogor";
  const blogDate = blog.blogDate || "Noma'lum";
  const blogIdentifier = getBlogIdentifier(blog);

  // Har doim barcha 3 ta tilni ko'rsatish (admin panelda majburiy)
  // Format: UZ → RU → EN (har doim to'liq - birinchi marta ham)
  let message = ``;

  // Uzbek tilida ma'lumotlar (har doim ko'rsatish - majburiy)
  const titleUz = blog.titleUz || "";
  const descUz = blog.descriptionUz?.text || "";
  const descUzShort =
    descUz.length > 200 ? descUz.substring(0, 200) + "..." : descUz;

  message += `🇺🇿 <b>UZ:</b>\n`;
  message += `📰 <b>${titleUz || ""}</b>\n`;
  if (descUzShort) {
    message += `${descUzShort}\n`;
  }
  message += `\n`;

  // Russian tilida ma'lumotlar (har doim ko'rsatish - majburiy)
  const titleRu = blog.titleRu || "";
  const descRu = blog.descriptionRu?.text || "";
  const descRuShort =
    descRu.length > 200 ? descRu.substring(0, 200) + "..." : descRu;

  message += `🇷🇺 <b>RU:</b>\n`;
  message += `📰 <b>${titleRu || ""}</b>\n`;
  if (descRuShort) {
    message += `${descRuShort}\n`;
  }
  message += `\n`;

  // English tilida ma'lumotlar (har doim ko'rsatish - majburiy)
  const titleEn = blog.titleEn || "";
  const descEn = blog.descriptionEn?.text || "";
  const descEnShort =
    descEn.length > 200 ? descEn.substring(0, 200) + "..." : descEn;

  message += `🇬🇧 <b>EN:</b>\n`;
  message += `📰 <b>${titleEn || ""}</b>\n`;
  if (descEnShort) {
    message += `${descEnShort}\n`;
  }
  message += `\n`;

  // Muallif va sana (har doim rus tilida)
  message += `👤 Автор: ${author}\n`;
  message += `📅 Дата: ${blogDate}\n\n`;
  message += `🔗 <a href="${blogUrl}">Подробнее</a>`;

  // Barcha rasmlarni to'plash
  const allImages = [];

  // Agar images array bo'lsa va bo'sh bo'lmasa
  if (blog.images && Array.isArray(blog.images) && blog.images.length > 0) {
    blog.images.forEach((img) => {
      if (img?.url) {
        allImages.push(img.url);
      }
    });
  }

  // Agar image (bitta rasm) bo'lsa va images array'da yo'q bo'lsa
  if (blog.image?.url && !allImages.includes(blog.image.url)) {
    allImages.unshift(blog.image.url); // Birinchi o'ringa qo'shish
  }

  // Agar rasm(lar) bo'lsa
  if (allImages.length > 0) {
    // Birinchi rasm bilan caption bilan yuborish
    const firstImage = allImages[0];
    const photoUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;
    const text = `chat_id=${TELEGRAM_CHAT_ID}&photo=${encodeURIComponent(
      firstImage
    )}&caption=${encodeURIComponent(message)}&parse_mode=HTML`;

    try {
      const response = await fetch(`${photoUrl}?${text}`);
      const result = await response.json();

      if (result.ok) {
        console.log(`✅ Telegram'ga yuborildi (rasm bilan): ${blogIdentifier}`);
        // markBlogAsSent allaqachon yuborishdan oldin chaqirilgan

        // Qolgan rasmlarni alohida yuborish (caption'siz)
        if (allImages.length > 1) {
          for (let i = 1; i < allImages.length; i++) {
            const photoUrl2 = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;
            const text2 = `chat_id=${TELEGRAM_CHAT_ID}&photo=${encodeURIComponent(
              allImages[i]
            )}`;

            await fetch(`${photoUrl2}?${text2}`);
            console.log(
              `✅ Qo'shimcha rasm ${i + 1}/${allImages.length} yuborildi`
            );

            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      } else {
        console.error("❌ Telegram API xatolik:", result);
        throw new Error(result.description || "Telegram API xatolik");
      }
    } catch (error) {
      console.error("❌ Telegram'ga yuborishda xatolik:", error);
      throw error; // Xatolikni yuqoriga chiqarish
    }
  } else {
    // Faqat matn yuborish
    const messageUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const text = `chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(
      message
    )}&parse_mode=HTML`;

    try {
      const response = await fetch(`${messageUrl}?${text}`);
      const result = await response.json();

      if (result.ok) {
        console.log(`✅ Telegram'ga yuborildi (matn): ${blogIdentifier}`);
        // markBlogAsSent allaqachon yuborishdan oldin chaqirilgan
      } else {
        console.error("❌ Telegram API xatolik:", result);
        throw new Error(result.description || "Telegram API xatolik");
      }
    } catch (error) {
      console.error("❌ Telegram'ga yuborishda xatolik:", error);
      throw error; // Xatolikni yuqoriga chiqarish
    }
  }
}

// Blog'ni yuborilgan deb belgilash (unique key va hash bilan - ID'siz)
function markBlogAsSent(blog) {
  const blogIdentifier = getBlogIdentifier(blog);
  const blogUniqueKey = getBlogUniqueKey(blog);
  const blogHash = createBlogHash(blog);
  const stored = getStoredBlogs();

  // Unique key asosida saqlash (asosiy - ID'dan mustaqil)
  stored[blogUniqueKey] = {
    hash: blogHash,
    sentAt: Date.now(),
    identifier: blogIdentifier,
  };

  // ID-based fallback (eski usul bilan moslik)
  stored[blogIdentifier] = {
    hash: blogHash,
    sentAt: Date.now(),
    uniqueKey: blogUniqueKey,
  };

  saveStoredBlogs(stored);
  console.log(
    `💾 Blog saqlandi: ${blogUniqueKey} (hash: ${blogHash.substring(0, 8)}...)`
  );
}

// Blog yangi yoki o'zgarganligini tekshirish (3 ta usul bilan - ID'siz)
function isBlogNewOrChanged(blog) {
  const blogIdentifier = getBlogIdentifier(blog);
  const blogUniqueKey = getBlogUniqueKey(blog);
  const currentHash = createBlogHash(blog);
  const stored = getStoredBlogs();
  const lastCheckTime = getLastCheckTimestamp();

  // AVVAL: Agar blog allaqachon yuborilgan bo'lsa, tekshirishni to'xtatish
  // Bu takrorlanishni oldini oladi
  if (stored[blogUniqueKey]?.sentAt) {
    // Agar hash o'zgarganga, blog o'zgargan deb hisoblash
    const storedHash = stored[blogUniqueKey].hash;
    if (storedHash && storedHash !== currentHash) {
      console.log(
        `🔄 Blog o'zgargan (hash): ${blogUniqueKey} (eski: ${storedHash?.substring(
          0,
          8
        )}..., yangi: ${currentHash.substring(0, 8)}...)`
      );
      return true;
    }
    // Hash bir xil, blog o'zgarmagan va allaqachon yuborilgan
    return false;
  }

  // USUL 1: Timestamp-based (eng optimal) - createdAt, updatedAt, blogDate barchasini tekshirish
  if (lastCheckTime) {
    const timestamps = [];
    const timestampTypes = [];

    // updatedAt tekshirish
    if (blog.updatedAt) {
      const updatedAt = parseBlogDate(blog.updatedAt);
      if (updatedAt && updatedAt > lastCheckTime) {
        timestamps.push(updatedAt);
        timestampTypes.push("updatedAt");
      }
    }

    // createdAt tekshirish
    if (blog.createdAt) {
      const createdAt = parseBlogDate(blog.createdAt);
      if (createdAt && createdAt > lastCheckTime) {
        timestamps.push(createdAt);
        timestampTypes.push("createdAt");
      }
    }

    // blogDate tekshirish
    if (blog.blogDate) {
      const blogDate = parseBlogDate(blog.blogDate);
      if (blogDate && blogDate > lastCheckTime) {
        timestamps.push(blogDate);
        timestampTypes.push("blogDate");
      }
    }

    // Agar har qanday timestamp oxirgi tekshiruvdan keyin bo'lsa
    if (timestamps.length > 0) {
      const latestTimestamp = Math.max(...timestamps);
      const latestType = timestampTypes[timestamps.indexOf(latestTimestamp)];
      console.log(
        `🆕 Yangi blog (timestamp ${timestampTypes.join(
          " + "
        )}): ${blogUniqueKey} - ${new Date(latestTimestamp).toLocaleString()}`
      );
      return true;
    }
  }

  // USUL 2: Unique key (slug + date) asosida tekshirish - ID'dan mustaqil
  if (!stored[blogUniqueKey]) {
    console.log(`🆕 Yangi blog (unique key): ${blogUniqueKey}`);
    return true;
  }

  // USUL 3: Hash-based - kontent o'zgarganligini aniqlash
  const storedHash = stored[blogUniqueKey]?.hash;
  if (storedHash && storedHash !== currentHash) {
    console.log(
      `🔄 Blog o'zgargan (hash): ${blogUniqueKey} (eski: ${storedHash?.substring(
        0,
        8
      )}..., yangi: ${currentHash.substring(0, 8)}...)`
    );
    return true;
  }

  // ID-based fallback (eski usul bilan moslik)
  if (!stored[blogIdentifier]) {
    console.log(`🆕 Yangi blog (ID fallback): ${blogIdentifier}`);
    return true;
  }

  // Hash bir xil, blog o'zgarmagan
  return false;
}

// Yangi blog'larni tekshirish va Telegram'ga yuborish
async function checkForNewBlogs() {
  const checkStartTime = Date.now();
  console.log("🔍 Yangi blog'larni tekshirilmoqda...");

  // Barcha blog'larni olish
  const allBlogs = await fetchAllBlogs();
  if (allBlogs.length === 0) {
    console.log("⚠️ Blog'lar topilmadi");
    return;
  }

  console.log(`📊 Jami ${allBlogs.length} ta blog topildi`);

  // Yangi yoki o'zgargan blog'larni topish
  const newBlogs = allBlogs.filter((blog) => {
    return isBlogNewOrChanged(blog);
  });

  if (newBlogs.length > 0) {
    console.log(`📬 ${newBlogs.length} ta yangi/o'zgargan blog topildi!`);

    // Har bir yangi blog'ni Telegram'ga yuborish
    for (const blog of newBlogs) {
      const blogUniqueKey = getBlogUniqueKey(blog);

      // Yuborishdan oldin yana bir bor tekshirish (takrorlanishni oldini olish)
      const stored = getStoredBlogs();
      if (stored[blogUniqueKey]?.sentAt) {
        console.log(
          `⏭️ Blog allaqachon yuborilgan, o'tkazib yuborilmoqda: ${blogUniqueKey}`
        );
        continue; // Bu blogni o'tkazib yuborish
      }

      // Yuborishdan OLDIN darhol saqlash (takrorlanishni oldini olish)
      markBlogAsSent(blog);
      console.log(`💾 Blog yuborishdan oldin saqlandi: ${blogUniqueKey}`);

      try {
        await sendBlogToTelegram(blog);
        // Har bir blog orasida 1 sekund kutish (Telegram rate limit uchun)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Blog yuborishda xatolik (${blogUniqueKey}):`, error);
        // Xatolik bo'lsa ham davom etish (keyingi blogni yuborish)
      }
    }

    // Barcha blog'larning hash'larini yangilash (unique key asosida)
    const stored = getStoredBlogs();
    allBlogs.forEach((blog) => {
      const uniqueKey = getBlogUniqueKey(blog);
      const identifier = getBlogIdentifier(blog);
      const hash = createBlogHash(blog);

      // Unique key asosida saqlash (asosiy)
      if (!stored[uniqueKey] || !stored[uniqueKey].sentAt) {
        stored[uniqueKey] = {
          hash: hash,
          sentAt: stored[uniqueKey]?.sentAt || null,
          identifier: identifier,
        };
      } else {
        stored[uniqueKey].hash = hash; // Hash'ni yangilash
      }

      // ID-based fallback
      if (!stored[identifier] || !stored[identifier].sentAt) {
        stored[identifier] = {
          hash: hash,
          sentAt: stored[identifier]?.sentAt || null,
          uniqueKey: uniqueKey,
        };
      } else {
        stored[identifier].hash = hash;
      }
    });
    saveStoredBlogs(stored);
    console.log(
      `💾 Jami ${Object.keys(stored).length} ta blog ma'lumotlari saqlandi`
    );
  } else {
    console.log("✅ Yangi blog'lar yo'q");
  }

  // Oxirgi tekshiruv vaqtini yangilash
  saveLastCheckTimestamp(checkStartTime);
  console.log(
    `⏰ Tekshiruv yakunlandi: ${new Date(checkStartTime).toLocaleString()}`
  );
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    checkForNewBlogs();
  }, 3000);

  setInterval(() => {
    checkForNewBlogs();
  }, 60000); // 1 minut
});
