const translationCache = {};

function updateTranslations(translations) {
  document.querySelectorAll("[data-translate]").forEach((element) => {
    const key = element.getAttribute("data-translate");
    if (translations[key]) {
      element.textContent = translations[key];
    }
  });

  // Select ichidagi option-larni tarjima qilish
  const languageSelector = document.getElementById("languageSelector");
  if (languageSelector) {
    languageSelector.querySelectorAll("option").forEach((option) => {
      const key = option.getAttribute("[data-translate]");
      if (translations[key]) {
        option.textContent = translations[key];
      }
    });
  }
}

async function changeLanguage(language) {
  // Tanlangan tilni localStorage ga saqlash
  localStorage.setItem("selectedLanguage", language);

  const languageSelector = document.getElementById("languageSelector");
  if (languageSelector) {
    languageSelector.value = language; // Tanlangan tilni o‘rnatish
  }

  if (translationCache[language]) {
    updateTranslations(translationCache[language]);
    return;
  }

  try {
    const response = await fetch(`assets/lang/${language}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    translationCache[language] = data;
    updateTranslations(data);
  } catch (error) {
    console.error("Tarjima faylini yuklashda xatolik yuz berdi:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const languageSelector = document.getElementById("languageSelector");

  if (!languageSelector) {
    console.error("languageSelector elementi topilmadi!");
    return;
  }

  let savedLanguage = localStorage.getItem("selectedLanguage") || "ru"; // Yangi tilni olish

  // **Select qiymatini sahifa yuklanganda o‘rnatish**
  languageSelector.value = savedLanguage;

  // **Tilni yuklash**
  changeLanguage(savedLanguage);

  languageSelector.addEventListener("change", (event) => {
    const newLanguage = event.target.value;
    changeLanguage(newLanguage); // Tilni yangilash
  });
});
