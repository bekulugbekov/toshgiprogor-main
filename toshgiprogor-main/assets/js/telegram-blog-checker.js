// Telegram Blog Checker
// Yangi blog'larni aniqlaydi va server (api/telegram.php) orqali Telegram'ga yuboradi.
// Token va chat_id faqat serverda (.env) saqlanadi — bu faylda yo'q.

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

// Blog ma'lumotlarini server orqali Telegram'ga yuborish
// Token/chat_id client'da yo'q — faqat api/telegram.php da (.env orqali)
async function sendBlogToTelegram(blog) {
  const blogIdentifier = getBlogIdentifier(blog);

  const response = await fetch("/api/telegram.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blog),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("Server javobi JSON emas");
  }

  if (!response.ok || !result.success) {
    console.error("❌ Server xatolik:", result);
    throw new Error(result.error || "Server xatolik");
  }

  console.log(`✅ Server orqali Telegram'ga yuborildi: ${blogIdentifier}`);
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
