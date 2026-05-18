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
    if (translations[key] !== undefined) {
      el.textContent = translations[key];
    }
  });

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
    var response = await fetch("assets/lang/" + language + ".json");
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

  changeLanguage(lang);
});
