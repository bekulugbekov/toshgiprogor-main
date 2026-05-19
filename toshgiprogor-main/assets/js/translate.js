const translationCache = {};

const langAttrMap = { uz: "uz", ru: "ru", en: "en", zh: "zh-Hans" };

function detectLanguage() {
  var saved = localStorage.getItem("selectedLanguage");
  if (saved && langAttrMap[saved]) return saved;

  var params = new URLSearchParams(window.location.search);
  var urlLang = params.get("lang");
  if (urlLang && langAttrMap[urlLang]) {
    localStorage.setItem("selectedLanguage", urlLang);
    return urlLang;
  }

  var bl = (navigator.language || navigator.userLanguage || "").toLowerCase();
  if (bl.startsWith("zh")) return "zh";
  if (bl.startsWith("uz")) return "uz";
  if (bl.startsWith("en")) return "en";
  return "ru";
}

function updateTranslations(translations) {
  document.querySelectorAll("[data-translate]").forEach(function (el) {
    var key = el.getAttribute("data-translate");
    if (translations[key] === undefined) return;
    var tag = el.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") {
      // Input/textarea uchun textContent ko'rinmaydi — placeholder yoki
      // (submit/button uchun) value o'rnatiladi. Shu sabab forma
      // maydonlari (kontakt, hamkorlik) tarjima qilinmay qolardi.
      var t = el.type;
      if (t === "submit" || t === "button" || t === "reset") {
        el.value = translations[key];
      } else {
        el.setAttribute("placeholder", translations[key]);
      }
    } else {
      el.textContent = translations[key];
    }
  });

  document.querySelectorAll("[data-translate-aria-label]").forEach(function (el) {
    var key = el.getAttribute("data-translate-aria-label");
    if (translations[key] !== undefined) {
      el.setAttribute("aria-label", translations[key]);
    }
  });

  document.querySelectorAll("[data-translate-title]").forEach(function (el) {
    var key = el.getAttribute("data-translate-title");
    if (translations[key] !== undefined) {
      el.setAttribute("title", translations[key]);
    }
  });

  // niceSelect (main.js: $("select").niceSelect()) til tanlagich KO'RINISHINI
  // o'zi yangilamaydi — til o'zgarsa ham eski til ko'rinib turadi. Qayta quramiz.
  if (window.jQuery && window.jQuery.fn && window.jQuery.fn.niceSelect) {
    window.jQuery("#languageSelector").niceSelect("update");
  }

  document.documentElement.removeAttribute("data-pending");

  document.dispatchEvent(
    new CustomEvent("languageChanged", {
      detail: { lang: document.documentElement.lang },
    })
  );
}

async function changeLanguage(language) {
  if (!langAttrMap[language]) language = "ru";

  localStorage.setItem("selectedLanguage", language);
  document.documentElement.lang = langAttrMap[language];

  document.querySelectorAll("#languageSelector").forEach(function (sel) {
    sel.value = language;
  });

  if (translationCache[language]) {
    updateTranslations(translationCache[language]);
    return;
  }

  try {
    var response = await fetch("/assets/lang/" + language + ".json");
    if (!response.ok) throw new Error("HTTP error: " + response.status);
    var data = await response.json();
    translationCache[language] = data;
    updateTranslations(data);
  } catch (error) {
    console.error("Translation error:", error);
    document.documentElement.removeAttribute("data-pending");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var lang = detectLanguage();

  document.querySelectorAll("#languageSelector").forEach(function (sel) {
    sel.value = lang;
    sel.addEventListener("change", function () {
      changeLanguage(this.value);
    });
  });

  // niceSelect (main.js: $("select").niceSelect()) original <select> ni yashirib,
  // o'zgarishni jQuery 'change' trigger orqali yuboradi. Native addEventListener
  // buni ushlamaydi — shu sabab jQuery delegatsiyasi qo'shamiz (mavjud bo'lsa).
  if (window.jQuery) {
    window.jQuery(document).on("change", "#languageSelector", function () {
      changeLanguage(this.value);
    });
  }

  changeLanguage(lang);
});
