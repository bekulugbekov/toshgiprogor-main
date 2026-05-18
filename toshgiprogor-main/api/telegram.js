// Vercel Serverless Function
export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // OPTIONS request'ni qaytarish
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Faqat POST so'rovlarni qabul qilish
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Telegram Bot konfiguratsiyasi
  const TOKEN = "8314016456:AAFx4hDqN3WtZKK_4qGT3VoKk90RBEX4CN4";
  const CHAT_ID = "-1002696318657";
  const SITE_URL = "https://tashgiprogor.uz";

  try {
    let payload = null;


    if (req.body && typeof req.body === "object") {
      payload = req.body;
    }
    else if (req.body && typeof req.body === "string") {
      try {
        payload = JSON.parse(req.body);
      } catch (e) {
        console.error("❌ JSON parse xatolik:", e);
        return res.status(400).json({
          error: "Invalid JSON",
          body: req.body,
          message: "Body string formatida, lekin JSON parse qilib bo'lmadi",
        });
      }
    }
    // Variant 3: req.body undefined yoki null
    else {
      console.error("❌ req.body undefined yoki null");
      return res.status(400).json({
        error: "Request body yo'q",
        debug: {
          body: req.body,
          bodyType: typeof req.body,
          message:
            "Vercel'da req.body undefined. Content-Type header'ni tekshiring.",
        },
      });
    }

    // Agar payload bo'sh bo'lsa
    if (!payload) {
      console.error("❌ Payload null yoki undefined");
      return res.status(400).json({
        error: "Payload bo'sh",
        debug: {
          body: req.body,
          bodyType: typeof req.body,
        },
      });
    }

    // Agar payload bo'sh object bo'lsa
    if (typeof payload === "object" && Object.keys(payload).length === 0) {
      console.error("❌ Payload bo'sh object");
      return res.status(400).json({
        error: "Payload bo'sh object",
        debug: {
          body: req.body,
          bodyType: typeof req.body,
          payload: payload,
        },
      });
    }

    // Hygraph webhook payload formatida ma'lumotlar data ichida keladi
    // Lekin ba'zida to'g'ridan-to'g'ri ham kelishi mumkin
    // Shuningdek, ba'zida payload.model yoki payload.node ichida ham bo'lishi mumkin
    let blog = null;

    // Variant 1: payload.data ichida
    if (payload.data) {
      blog = payload.data;
    }
    // Variant 2: payload.model ichida (ba'zi Hygraph versiyalarida)
    else if (payload.model) {
      blog = payload.model;
    }
    // Variant 3: payload.node ichida (GraphQL connection formatida)
    else if (payload.node) {
      blog = payload.node;
    }
    // Variant 4: payload to'g'ridan-to'g'ri blog ma'lumotlari
    else if (payload.slug || payload.id) {
      blog = payload;
    }
    // Variant 5: payload[0] array ichida
    else if (Array.isArray(payload) && payload.length > 0) {
      blog = payload[0];
    }

    // Agar blog mavjud bo'lmasa
    if (!blog) {
      console.error("❌ Blog ma'lumotlari yo'q");
      console.error("❌ Payload keys:", Object.keys(payload || {}));
      console.error("❌ Payload structure:", JSON.stringify(payload, null, 2));
      return res.status(400).json({
        error: "Blog ma'lumotlari kerak",
        debug: {
          payload: payload,
          payloadKeys: Object.keys(payload || {}),
          hasData: !!payload.data,
          hasModel: !!payload.model,
          hasNode: !!payload.node,
          isArray: Array.isArray(payload),
          payloadType: typeof payload,
        },
      });
    }

    // Agar blog object bo'lmasa
    if (typeof blog !== "object") {
      console.error("❌ Blog object emas:", typeof blog);
      return res.status(400).json({
        error: "Blog object emas",
        debug: {
          blog: blog,
          blogType: typeof blog,
        },
      });
    }

    // Agar slug bo'lmasa
    if (!blog.slug) {
      console.error("❌ Blog slug yo'q");
      console.error("❌ Blog:", JSON.stringify(blog, null, 2));
      console.error("❌ Blog keys:", Object.keys(blog || {}));
      return res.status(400).json({
        error: "Blog slug yo'q",
        debug: {
          received: blog,
          keys: Object.keys(blog || {}),
          blogType: typeof blog,
        },
      });
    }

    // Description'ni parse qilish (raw formatdan text olish)
    function extractTextFromRichText(richText) {
      if (!richText) return "";

      // Agar richText string bo'lsa
      if (typeof richText === "string") {
        return richText;
      }

      // Agar richText object bo'lsa va raw mavjud bo'lsa
      if (richText.raw) {
        try {
          const raw = richText.raw;
          // Agar raw string bo'lsa va JSON bo'lsa
          if (typeof raw === "string") {
            try {
              const parsed = JSON.parse(raw);
              if (parsed.children && Array.isArray(parsed.children)) {
                return parsed.children
                  .map((child) => {
                    if (child.children && Array.isArray(child.children)) {
                      return child.children.map((c) => c.text || "").join("");
                    }
                    return child.text || "";
                  })
                  .join(" ");
              }
            } catch (e) {
              // JSON emas, oddiy string
              return raw;
            }
          }
          // Agar raw object bo'lsa
          if (raw.children && Array.isArray(raw.children)) {
            return raw.children
              .map((child) => {
                if (child.children && Array.isArray(child.children)) {
                  return child.children.map((c) => c.text || "").join("");
                }
                return child.text || "";
              })
              .join(" ");
          }
        } catch (e) {
          console.error("❌ Rich text parse xatolik:", e);
          return "";
        }
      }

      // Agar richText.text mavjud bo'lsa
      if (richText.text) {
        return richText.text;
      }

      return "";
    }

    // Ma'lumotlarni tayyorlash - barcha 3 ta tilda
    const blogUrl = `${SITE_URL}/blog-details.html?slug=${blog.slug}`;
    const author = blog.author || "Tashgiprogor";
    const blogDate = blog.blogDate || "Noma'lum";

    // Har doim barcha 3 ta tilni ko'rsatish (admin panelda majburiy)
    let message = ``;

    // Uzbek tilida ma'lumotlar
    const titleUz = blog.titleUz || "";
    const descUz = extractTextFromRichText(blog.descriptionUz) || "";
    const descUzShort =
      descUz.length > 200 ? descUz.substring(0, 200) + "..." : descUz;

    message += `🇺🇿 UZ: ${titleUz || ""}\n`;
    if (descUzShort) {
      message += `${descUzShort}\n`;
    }
    message += `\n`;

    // Russian tilida ma'lumotlar
    const titleRu = blog.titleRu || "";
    const descRu = extractTextFromRichText(blog.descriptionRu) || "";
    const descRuShort =
      descRu.length > 200 ? descRu.substring(0, 200) + "..." : descRu;

    message += `🇷🇺 RU: ${titleRu || ""}\n`;
    if (descRuShort) {
      message += `${descRuShort}\n`;
    }
    message += `\n`;

    // English tilida ma'lumotlar
    const titleEn = blog.titleEn || "";
    const descEn = extractTextFromRichText(blog.descriptionEn) || "";
    const descEnShort =
      descEn.length > 200 ? descEn.substring(0, 200) + "..." : descEn;

    message += `🇬🇧 EN: ${titleEn || ""}\n`;
    if (descEnShort) {
      message += `${descEnShort}\n`;
    }
    message += `\n`;

    // Muallif va sana (har doim rus tilida)
    message += `👤 Автор: ${author}\n`;
    message += `📅 Дата: ${blogDate}\n\n`;
    message += `🔗 <a href="${blogUrl}">Подробнее</a>`;

    // Image URL - webhook payload'da image faqat id bilan keladi
    // Agar image.url bo'lmasa, GraphQL API'dan olish kerak
    let imageUrl = null;

    // Variant 1: image.url mavjud bo'lsa
    if (blog.image?.url) {
      imageUrl = blog.image.url;
    }
    // Variant 2: image.id mavjud bo'lsa, lekin url yo'q bo'lsa
    // GraphQL API'dan image URL'ni olish
    else if (blog.image?.id) {
      try {
        // GraphQL API'dan image URL'ni olish
        const GRAPHQL_API_URL =
          "https://eu-west-2.cdn.hygraph.com/content/cm5hkvhzr011507ulay5rda62/master";
        const assetQuery = `
          query {
            asset(where: {id: "${blog.image.id}"}) {
              url
            }
          }
        `;
        const assetResponse = await fetch(GRAPHQL_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: assetQuery }),
        });
        const assetResult = await assetResponse.json();
        if (assetResult.data?.asset?.url) {
          imageUrl = assetResult.data.asset.url;
        }
      } catch (error) {
        console.error("❌ GraphQL API'dan image URL olishda xatolik:", error);
      }
    }

    // Telegram API'ga yuborish
    if (imageUrl) {
      // Rasm bilan yuborish
      const photoUrl = `https://api.telegram.org/bot${TOKEN}/sendPhoto`;
      const response = await fetch(photoUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          chat_id: CHAT_ID,
          photo: imageUrl,
          caption: message,
          parse_mode: "HTML",
        }),
      });
      const result = await response.json();

      if (!result.ok) {
        console.error("❌ Telegram xatolik:", result);
        return res.status(500).json({
          error: result.description || "Telegram API xatolik",
          telegramError: result,
        });
      }
    } else {
      // Faqat matn yuborish
      const messageUrl = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
      const response = await fetch(messageUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      });
      const result = await response.json();

      if (!result.ok) {
        console.error("❌ Telegram xatolik:", result);
        return res.status(500).json({
          error: result.description || "Telegram API xatolik",
          telegramError: result,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Telegram kanalga yuborildi",
      blog: {
        slug: blog.slug,
        titleUz: blog.titleUz,
        titleRu: blog.titleRu,
        titleEn: blog.titleEn,
      },
    });
  } catch (error) {
    console.error("❌ ========== XATOLIK ==========");
    console.error("❌ Error:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    return res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
}
