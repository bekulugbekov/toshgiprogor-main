/**
 * ============================================
 * ACCESSIBILITY TOOLS MENU - JavaScript
 * ============================================
 * Barcha funksiyalar va Web Speech API integratsiyasi
 * LocalStorage orqali state saqlash va restore
 */

(function () {
  "use strict";

  // ============================================
  // 1. INITIALIZATION
  // ============================================
  let voiceSynthesis = null;
  let isPlaying = false;
  let currentSelection = null;

  // Focus Mode uchun helper functions (IIFE ichida, lekin window ga ham qo'yiladi)
  let scrollFocusHandler = null;

  function enableScrollBasedFocusMode() {
    // Eski handler ni olib tashlash
    if (scrollFocusHandler) {
      window.removeEventListener("scroll", scrollFocusHandler, true);
      window.removeEventListener("resize", scrollFocusHandler);
    }

    scrollFocusHandler = function () {
      const spotlight = document.getElementById("a11y-focus-spotlight");
      if (!spotlight || !spotlight.classList.contains("active")) {
        return;
      }

      // Viewport markazidagi elementni topish
      const viewportCenterY = window.innerHeight / 2 + window.scrollY;
      const viewportCenterX = window.innerWidth / 2;

      // Scroll qilingan joydagi elementlarni topish
      const elements = document.querySelectorAll(
        "#smooth-content p, #smooth-content h1, #smooth-content h2, #smooth-content h3, #smooth-content h4, #smooth-content h5, #smooth-content h6, #smooth-content li, #smooth-content span, #smooth-content div"
      );

      let targetElement = null;
      let minDistance = Infinity;

      elements.forEach(function (el) {
        const rect = el.getBoundingClientRect();
        const elementCenterY = rect.top + rect.height / 2 + window.scrollY;
        const elementCenterX = rect.left + rect.width / 2;

        // Viewport markaziga eng yaqin elementni topish
        const distance = Math.abs(elementCenterY - viewportCenterY);
        if (distance < minDistance && rect.height > 0 && rect.width > 0) {
          minDistance = distance;
          targetElement = el;
        }
      });

      if (targetElement && spotlight) {
        const rect = targetElement.getBoundingClientRect();
        const viewportX = rect.left + rect.width / 2;
        const viewportY = rect.top + rect.height / 2;
        // Kattaroq radius - oq joylarni yaxshiroq ko'rsatish uchun (rasmdagidek)
        const width = Math.max(rect.width + 300, window.innerWidth * 0.95);
        const height = Math.max(rect.height + 300, 500);
        const radius = Math.max(width, height) / 2 + 150;
        const clipPath = `circle(${radius}px at ${viewportX}px ${viewportY}px)`;
        spotlight.style.clipPath = clipPath;
        spotlight.style.transition =
          "clip-path 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      } else if (spotlight) {
        // Agar element topilmasa, viewport markazida default spotlight
        const viewportX = window.innerWidth / 2;
        const viewportY = window.innerHeight / 2;
        const radius =
          Math.min(window.innerWidth, window.innerHeight) / 2 + 200;
        const clipPath = `circle(${radius}px at ${viewportX}px ${viewportY}px)`;
        spotlight.style.clipPath = clipPath;
        spotlight.style.transition =
          "clip-path 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      }
    };

    // Scroll va resize event listener qo'shish
    window.addEventListener("scroll", scrollFocusHandler, true);
    window.addEventListener("resize", scrollFocusHandler);

    // Dastlabki pozitsiyani o'rnatish
    setTimeout(scrollFocusHandler, 100);
  }

  function disablePageFocusModeInternal() {
    const overlay = document.getElementById("a11y-focus-overlay");
    const spotlight = document.getElementById("a11y-focus-spotlight");
    const banner = document.getElementById("a11y-focus-banner");
    document.body.classList.remove("a11y-page-focus-mode");

    // Scroll handler ni olib tashlash
    if (scrollFocusHandler) {
      window.removeEventListener("scroll", scrollFocusHandler, true);
      window.removeEventListener("resize", scrollFocusHandler);
      scrollFocusHandler = null;
    }

    if (overlay) {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
    }
    if (spotlight) {
      spotlight.classList.remove("active");
      spotlight.setAttribute("aria-hidden", "true");
    }
    if (banner) {
      banner.classList.remove("active");
      banner.setAttribute("aria-hidden", "true");
    }
  }

  function disableElementFocusModeInternal() {
    document.body.classList.remove("a11y-element-focus-mode");
    const overlay = document.getElementById("a11y-focus-overlay");
    const spotlight = document.getElementById("a11y-focus-spotlight");
    const banner = document.getElementById("a11y-focus-banner");
    if (overlay) {
      overlay.classList.remove("active");
      overlay.setAttribute("aria-hidden", "true");
    }
    if (spotlight) {
      spotlight.classList.remove("active");
      spotlight.setAttribute("aria-hidden", "true");
      spotlight.style.clipPath = "circle(0% at 50% 50%)";
    }
    if (banner) {
      banner.classList.remove("active");
      banner.setAttribute("aria-hidden", "true");
    }
  }

  // Window ga qo'yish (global access uchun)
  window.disablePageFocusMode = disablePageFocusModeInternal;
  window.disableElementFocusMode = disableElementFocusModeInternal;

  // ============================================
  // 0. LANGUAGE SWITCHER — translate.js bilan integratsiya
  // ============================================
  let currentLang =
    localStorage.getItem("selectedLanguage") || "ru";

  function updateAllTexts() {
    if (
      typeof translationCache !== "undefined" &&
      translationCache[currentLang] &&
      typeof updateTranslations === "function"
    ) {
      updateTranslations(translationCache[currentLang]);
    } else if (typeof changeLanguage === "function") {
      changeLanguage(currentLang);
    }
  }

  function initLanguageSwitcher() {
    const savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang) currentLang = savedLang;

    updateAllTexts();

    // translate.js languageChanged eventini tinglash
    document.addEventListener("languageChanged", function (e) {
      const newLang = localStorage.getItem("selectedLanguage") || "ru";
      if (newLang !== currentLang) {
        currentLang = newLang;
      }
    });

    // Boshqa tab/window dan til o'zgarganda
    window.addEventListener("storage", function (e) {
      if (e.key === "selectedLanguage" && e.newValue) {
        currentLang = e.newValue;
        updateAllTexts();
      }
    });
  }

  // ============================================
  // 0.5. INJECT ACCESSIBILITY MENU HTML
  // ============================================
  function injectA11yMenuHTML() {
    // Agar menu allaqachon mavjud bo'lsa, qo'shmaslik
    if (document.getElementById("a11y-menu")) {
      return;
    }

    // Message Modal
    if (!document.getElementById("messageContainer")) {
      const messageContainer = document.createElement("div");
      messageContainer.id = "messageContainer";
      messageContainer.className = "message-container";
      document.body.insertBefore(messageContainer, document.body.firstChild);
    }

    const menuHTML = `
    <!-- Accessibility Tools Menu -->
    <div
      id="a11y-menu"
      class="a11y-menu"
      role="complementary"
      aria-label="Accessibility Tools"
    >
      <!-- Toggle Button -->
      <button
        id="a11y-toggle"
        class="a11y-toggle"
        aria-label="Ochish"
        title="Moslashuvchanlik"
        aria-expanded="false"
        aria-controls="a11y-panel"
      >
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm161.5-86.1c-12.2-5.2-26.3 .4-31.5 12.6s.4 26.3 12.6 31.5l11.9 5.1c17.3 7.4 35.2 12.9 53.6 16.3l0 50.1c0 4.3-.7 8.6-2.1 12.6l-28.7 86.1c-4.2 12.6 2.6 26.2 15.2 30.4s26.2-2.6 30.4-15.2l24.4-73.2c1.3-3.8 4.8-6.4 8.8-6.4s7.6 2.6 8.8 6.4l24.4 73.2c4.2 12.6 17.8 19.4 30.4 15.2S339 397 334.8 384.4l-28.7-86.1c-1.4-4.1-2.1-8.3-2.1-12.6l0-50.1c18.4-3.5 36.3-8.9 53.6-16.3l11.9-5.1c12.2-5.2 17.8-19.3 12.6-31.5s-19.3-17.8-31.5-12.6L338.7 175c-26.1 11.2-54.2 17-82.7 17s-56.5-5.8-82.7-17l-11.9-5.1zM256 160a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"/></svg>
      </button>

      <!-- Menu Panel -->
      <div
        id="a11y-panel"
        class="a11y-panel"
        role="region"
        aria-labelledby="a11y-menu-title"
      >
        <div class="a11y-panel-header">
          <h2 id="a11y-menu-title" class="a11y-menu-title">
            <span data-translate="a11y_title">Accessibility</span>
          </h2>
          <button id="a11y-close" class="a11y-close" aria-label="Yopish">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="a11y-panel-content">
          <!-- 1. Mavzuni tanlash -->
          <div class="a11y-control-group">
            <label class="a11y-label">
              <span data-translate="a11y_theme">Choose theme</span>
            </label>
            <div class="a11y-theme-buttons">
              <button
                id="a11y-theme-adaptive"
                class="a11y-theme-btn"
                data-theme="adaptive"
                aria-label="Moslashuvchan mavzu"
              >
                <div class="a11y-theme-preview">
                  <div class="a11y-theme-preview-top"></div>
                  <div class="a11y-theme-preview-bottom"></div>
                  <div class="a11y-theme-preview-circle"></div>
                </div>
                <span data-translate="a11y_adaptive">Adaptive</span>
              </button>
              <button
                id="a11y-theme-light"
                class="a11y-theme-btn active"
                data-theme="light"
                aria-label="Oddiy mavzu"
              >
                <div class="a11y-theme-preview">
                  <div class="a11y-theme-preview-top"></div>
                  <div class="a11y-theme-preview-bottom"></div>
                  <div class="a11y-theme-preview-circle"></div>
                </div>
                <span data-translate="a11y_day">Day</span>
              </button>
              <button
                id="a11y-theme-dark"
                class="a11y-theme-btn"
                data-theme="dark"
                aria-label="Tungi mavzu"
              >
                <div class="a11y-theme-preview">
                  <div class="a11y-theme-preview-top"></div>
                  <div class="a11y-theme-preview-bottom"></div>
                  <div class="a11y-theme-preview-circle"></div>
                </div>
                <span data-translate="a11y_night">Night</span>
              </button>
            </div>
          </div>

          <!-- 2. Matn hajmi slayder (0% dan 100% gacha) -->
          <div class="a11y-control-group">
            <!-- Font size slider (ko'chirilgan) -->
            <label
              class="a11y-label"
              for="a11y-font-scale"
              style="margin-top: 16px"
            >
              <span class="a11y-icon-text">Aa</span>
              <span data-translate="a11y_text_size">Font size</span>
              <span id="a11y-font-scale-value" class="a11y-value">0%</span>
            </label>
            <p class="a11y-description">
              <span data-translate="a11y_text_size_desc">Increase or decrease text size</span>
            </p>
            <div class="a11y-slider-wrapper">
              <button
                class="a11y-slider-btn"
                id="a11y-font-scale-decrease"
                aria-label="Kamaytirish"
              >
                <span>A-</span>
              </button>
              <input
                type="range"
                id="a11y-font-scale"
                class="a11y-slider"
                min="0"
                max="100"
                value="0"
                step="10"
                aria-label="Shrift o'lchami"
              />
              <button
                class="a11y-slider-btn"
                id="a11y-font-scale-increase"
                aria-label="Oshirish"
              >
                <span>A+</span>
              </button>
            </div>
          </div>

          <!-- 3. Shrift o'lchami (So'z uzunligi / So'z oralig'i) -->
          <div class="a11y-control-group">
            <label class="a11y-label">
              <span class="a11y-icon-text">Aa</span>
              <span data-translate="a11y_font_size">Font size</span>
            </label>
            <p class="a11y-description">
              <span data-translate="a11y_font_size_desc">Increase or decrease font size</span>
            </p>
            <div class="a11y-word-controls">
              <button
                id="a11y-word-length-btn"
                class="a11y-word-btn"
                aria-label="So'z uzunligi"
              >
                <span data-translate="a11y_word_length">Word length</span>
              </button>
              <button
                id="a11y-word-spacing-btn"
                class="a11y-word-btn active"
                aria-label="So'z oralig'i"
              >
                <span data-translate="a11y_word_spacing">Word spacing</span>
              </button>
            </div>
          </div>

          <!-- 6. Ekran suhandoni (Voice Assistant) -->
          <div class="a11y-control-group">
            <div class="a11y-voice-header">
              <div class="a11y-voice-header-left">
                <svg
                  class="a11y-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path
                    d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                  ></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                <div class="a11y-voice-header-text">
                  <label class="a11y-label" style="margin-bottom: 4px">
                    <span data-translate="a11y_voice_assistant">Voice assistant</span>
                  </label>
                  <p class="a11y-description" style="margin: 0">
                    <span data-translate="a11y_voice_desc">Tool for visually impaired</span>
                  </p>
                </div>
              </div>
              <div class="a11y-toggle-wrapper">
                <input
                  type="checkbox"
                  id="a11y-voice-assistant"
                  class="a11y-toggle-switch"
                  aria-describedby="a11y-voice-desc"
                />
                <label
                  for="a11y-voice-assistant"
                  class="a11y-toggle-label"
                ></label>
              </div>
            </div>

            <!-- Voice Assistant Controls (hidden by default) -->
            <div
              id="a11y-voice-controls"
              class="a11y-voice-controls"
              style="display: none"
            >
              <!-- O'qish tezligi -->
              <div class="a11y-voice-option">
                <label class="a11y-voice-label">
                  <span data-translate="a11y_read_speed">Reading speed</span>
                </label>
                <div class="a11y-speed-slider-wrapper">
                  <input
                    type="range"
                    id="a11y-speed-slider"
                    class="a11y-speed-slider"
                    min="0"
                    max="4"
                    value="2"
                    step="1"
                    aria-label="O'qish tezligi"
                  />
                </div>
                <div class="a11y-speed-values">
                  <span class="a11y-speed-value" data-value="0.5">0.5x</span>
                  <span class="a11y-speed-value" data-value="0.75">0.75x</span>
                  <span class="a11y-speed-value" data-value="1.0">1x</span>
                  <span class="a11y-speed-value" data-value="1.5">1.5x</span>
                  <span class="a11y-speed-value" data-value="2.0">2x</span>
                </div>
              </div>

              <!-- Ovoz ohangi -->
              <div class="a11y-voice-option">
                <label class="a11y-voice-label">
                  <span data-translate="a11y_voice_tone">Voice tone</span>
                </label>
                <div class="a11y-tone-buttons">
                  <button
                    id="a11y-tone-neutral"
                    class="a11y-tone-btn"
                    data-tone="neutral"
                    aria-label="Betaraf"
                  >
                    <span data-translate="a11y_tone_neutral">Neutral</span>
                  </button>
                  <button
                    id="a11y-tone-friendly"
                    class="a11y-tone-btn active"
                    data-tone="friendly"
                    aria-label="Samimiy"
                  >
                    <span data-translate="a11y_tone_friendly">Friendly</span>
                  </button>
                  <button
                    id="a11y-tone-formal"
                    class="a11y-tone-btn"
                    data-tone="formal"
                    aria-label="Rasmiy"
                  >
                    <span data-translate="a11y_tone_formal">Formal</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 7. Ko'rsatkich (Cursor) -->
          <div class="a11y-control-group a11y-cursor-group">
            <label class="a11y-label">
              <svg
                class="a11y-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
              </svg>
              <span data-translate="a11y_cursor">Cursor</span>
            </label>
            <p class="a11y-description">
              <span data-translate="a11y_cursor_desc">Magnify cursor and change its color</span>
            </p>
            <div class="a11y-cursor-color-btns">
              <button
                id="a11y-cursor-black"
                class="a11y-cursor-color-btn"
                data-color="black"
                aria-label="Qora"
              >
                <span data-translate="a11y_cursor_black">Black</span>
              </button>
              <button
                id="a11y-cursor-white"
                class="a11y-cursor-color-btn"
                data-color="white"
                aria-label="Oq"
              >
                <span data-translate="a11y_cursor_white">White</span>
              </button>
            </div>
          </div>

          <!-- 8. Maxsus rang rejimlari -->
          <div class="a11y-control-group">
            <label class="a11y-label">
              <svg
                class="a11y-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
                <circle cx="11.5" cy="11.5" r=".5" fill="currentColor"></circle>
                <path
                  d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"
                ></path>
              </svg>
              <span data-translate="a11y_special_color">Special color</span>
            </label>
            <p class="a11y-description">
              <span data-translate="a11y_color_desc">Change site colors</span>
            </p>
            <div class="a11y-color-mode-buttons">
              <button
                id="a11y-color-none"
                class="a11y-color-mode-btn"
                data-mode="none"
                aria-label="Rangsiz ko'rinish"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 20h9"></path>
                  <path
                    d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                  ></path>
                  <line x1="15" y1="5" x2="19" y2="9"></line>
                </svg>
                <span data-translate="a11y_colorless">Colorless view</span>
              </button>
            </div>
            <!-- Yorug'lik slideri -->
            <div class="a11y-control-group" style="margin-top: 16px">
              <label class="a11y-label" for="a11y-brightness-scale">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <span data-translate="a11y_brightness">Brightness</span>
                <span id="a11y-brightness-scale-value" class="a11y-value">100%</span>
              </label>
              <p class="a11y-description">
                <span data-translate="a11y_brightness_desc">Increase or decrease site brightness</span>
              </p>
              <div class="a11y-slider-wrapper">
                <button
                  class="a11y-slider-btn"
                  id="a11y-brightness-scale-decrease"
                  aria-label="Kamaytirish"
                >
                  <span>-</span>
                </button>
                <input
                  type="range"
                  id="a11y-brightness-scale"
                  class="a11y-slider"
                  min="0"
                  max="100"
                  value="100"
                  step="10"
                  aria-label="Yorug'lik"
                />
                <button
                  class="a11y-slider-btn"
                  id="a11y-brightness-scale-increase"
                  aria-label="Oshirish"
                >
                  <span>+</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Reset Button -->
          <div class="a11y-control-group">
            <button
              id="a11y-reset"
              class="a11y-btn-reset"
              aria-label="Barcha sozlamalarni tiklash"
            >
              <span data-translate="a11y_reset">Reset all settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Focus Mode Overlay -->
    <div
      id="a11y-focus-overlay"
      class="a11y-focus-overlay"
      aria-hidden="true"
      role="presentation"
    ></div>

    <!-- Focus Mode Spotlight -->
    <div
      id="a11y-focus-spotlight"
      class="a11y-focus-spotlight"
      aria-hidden="true"
      role="presentation"
    ></div>

    <!-- Focus Mode Banner -->
    <div
      id="a11y-focus-banner"
      class="a11y-focus-banner"
      aria-hidden="true"
      role="region"
      aria-label="Diqqatni jamlash rejimi"
    >
      <div class="a11y-focus-banner-content">
        <span class="a11y-focus-banner-text">
          <span data-translate="a11y_focus_disable">Disable focus mode</span>
        </span>
        <button
          id="a11y-focus-banner-close"
          class="a11y-focus-banner-close"
          aria-label="Rejimni o'chirish"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    `;

    // HTML ni DOM ga qo'shish
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = menuHTML.trim();

    // smooth-wrapper dan oldin qo'shish
    const smoothWrapper = document.getElementById("smooth-wrapper");
    const insertBefore = smoothWrapper || document.body.firstElementChild;

    // Barcha elementlarni qo'shish
    while (tempDiv.children.length > 0) {
      document.body.insertBefore(tempDiv.children[0], insertBefore);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectA11yMenuHTML();
    initA11yMenu();
    initAllControls();
    loadSavedSettings();
    initLanguageSwitcher();
  });

  // ============================================
  // 2. MENU TOGGLE FUNCTIONALITY
  // ============================================
  function initA11yMenu() {
    const toggleBtn = document.getElementById("a11y-toggle");
    const closeBtn = document.getElementById("a11y-close");
    const menu = document.getElementById("a11y-menu");
    const panel = document.getElementById("a11y-panel");

    if (!toggleBtn || !closeBtn || !menu || !panel) {
      console.warn("Accessibility menu elements not found");
      return;
    }

    // Toggle button click
    toggleBtn.addEventListener("click", function () {
      const isActive = menu.classList.contains("active");
      menu.classList.toggle("active");
      toggleBtn.setAttribute("aria-expanded", !isActive);

      // Menu ochilganda body scroll ni o'chirish (faqat menu ochilganda)
      if (!isActive) {
        // Menu ochildi
        document.body.style.overflow = "hidden";
        setTimeout(function () {
          const firstFocusable = panel.querySelector("button, input, select");
          if (firstFocusable) firstFocusable.focus();
        }, 100);
      } else {
        // Menu yopildi
        document.body.style.overflow = "";
      }
    });

    // Close button click
    closeBtn.addEventListener("click", function () {
      menu.classList.remove("active");
      toggleBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = ""; // Body scroll ni qaytarish
      toggleBtn.focus();
    });

    // ESC key bilan yopish
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("active")) {
        menu.classList.remove("active");
        toggleBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = ""; // Body scroll ni qaytarish
        toggleBtn.focus();
      }
    });

    // Click outside to close
    document.addEventListener("click", function (e) {
      if (
        menu.classList.contains("active") &&
        !menu.contains(e.target) &&
        e.target !== toggleBtn
      ) {
        menu.classList.remove("active");
        toggleBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = ""; // Body scroll ni qaytarish
      }
    });
  }

  // ============================================
  // 3. THEME MODES (Moslashuvchan, Oddiy, Tungi)
  // ============================================
  function initThemeButtons() {
    const themeButtons = document.querySelectorAll(".a11y-theme-btn");
    let deviceThemeListener = null;

    // Device theme ni aniqlash funksiyasi
    function getDeviceTheme() {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
      return "light";
    }

    // Adaptive theme uchun device theme ni qo'llash
    function applyAdaptiveTheme() {
      const deviceTheme = getDeviceTheme();
      document.body.classList.remove("a11y-theme-light", "a11y-theme-dark");
      if (deviceTheme === "dark") {
        document.body.classList.add("a11y-theme-dark");
      } else {
        document.body.classList.add("a11y-theme-light");
      }
    }

    // Device theme listener ni o'rnatish
    function setupDeviceThemeListener() {
      // Eski listener ni olib tashlash
      if (deviceThemeListener && window.matchMedia) {
        const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
        darkModeQuery.removeEventListener("change", deviceThemeListener);
      }

      // Yangi listener qo'shish
      if (window.matchMedia) {
        const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
        deviceThemeListener = function (e) {
          const activeBtn = document.querySelector(".a11y-theme-btn.active");
          if (
            activeBtn &&
            activeBtn.getAttribute("data-theme") === "adaptive"
          ) {
            applyAdaptiveTheme();
          }
        };
        darkModeQuery.addEventListener("change", deviceThemeListener);
      }
    }

    themeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const theme = this.getAttribute("data-theme");

        // Barcha active classlarni olib tashlash
        themeButtons.forEach(function (b) {
          b.classList.remove("active");
        });

        // Tanlangan buttonga active qo'shish
        this.classList.add("active");

        // Body classlarni yangilash
        document.body.classList.remove(
          "a11y-theme-light",
          "a11y-theme-dark",
          "a11y-theme-adaptive"
        );

        if (theme === "adaptive") {
          // Adaptive theme - device theme ni qo'llash
          applyAdaptiveTheme();
          // Device theme listener ni o'rnatish
          setupDeviceThemeListener();
        } else {
          document.body.classList.add("a11y-theme-" + theme);
          // Adaptive bo'lmagan theme da listener ni olib tashlash
          if (deviceThemeListener && window.matchMedia) {
            const darkModeQuery = window.matchMedia(
              "(prefers-color-scheme: dark)"
            );
            darkModeQuery.removeEventListener("change", deviceThemeListener);
            deviceThemeListener = null;
          }
        }

        saveSetting("a11y-theme", theme);
      });
    });

    // Saved theme ni yuklash va active state ni to'g'ri o'rnatish
    const savedTheme = loadSetting("a11y-theme");
    if (savedTheme) {
      const savedBtn = document.getElementById("a11y-theme-" + savedTheme);
      if (savedBtn) {
        themeButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        savedBtn.classList.add("active");

        // Adaptive theme bo'lsa, device theme ni qo'llash va listener o'rnatish
        if (savedTheme === "adaptive") {
          applyAdaptiveTheme();
          setupDeviceThemeListener();
        } else {
          document.body.classList.add("a11y-theme-" + savedTheme);
        }
      }
    } else {
      // Default: light theme active
      const lightBtn = document.getElementById("a11y-theme-light");
      if (lightBtn) {
        themeButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        lightBtn.classList.add("active");
        document.body.classList.add("a11y-theme-light");
      }
    }
  }

  // ============================================
  // 4. TEXT SCALE SLIDER (0% dan 200% gacha)
  // ============================================
  function initTextScale() {
    const slider = document.getElementById("a11y-text-scale");
    const valueDisplay = document.getElementById("a11y-text-scale-value");
    const decreaseBtn = document.getElementById("a11y-text-scale-decrease");
    const increaseBtn = document.getElementById("a11y-text-scale-increase");

    if (!slider || !valueDisplay) return;

    function updateTextScale(value) {
      valueDisplay.textContent = value + "%";
      slider.value = value;

      // CSS variable orqali text scale qo'llash
      document.documentElement.style.setProperty(
        "--a11y-text-scale",
        value + "%"
      );
      document.body.classList.add("a11y-text-scale");
      document.documentElement.classList.add("a11y-text-scale");

      // Header tepasida oq fon ko'rinmasligi uchun
      const headerArea = document.querySelector(".header-area");
      const headerSticky = document.getElementById("header-sticky");
      const smoothWrapper = document.getElementById("smooth-wrapper");

      if (headerArea) {
        headerArea.style.marginTop = "0";
        headerArea.style.paddingTop = "0";
        headerArea.style.top = "0";
      }

      if (headerSticky) {
        headerSticky.style.marginTop = "0";
        headerSticky.style.paddingTop = "0";
        headerSticky.style.top = "0";
      }

      if (smoothWrapper) {
        smoothWrapper.style.marginTop = "0";
        smoothWrapper.style.paddingTop = "0";
      }

      // Body va html elementlarini ham tekshirish
      document.documentElement.style.marginTop = "0";
      document.documentElement.style.paddingTop = "0";
      document.documentElement.style.margin = "0";
      document.documentElement.style.padding = "0";
      document.body.style.marginTop = "0";
      document.body.style.paddingTop = "0";
      document.body.style.margin = "0";
      document.body.style.padding = "0";

      saveSetting("a11y-text-scale", value);
    }

    slider.addEventListener("input", function () {
      updateTextScale(this.value);
    });

    if (decreaseBtn) {
      decreaseBtn.addEventListener("click", function () {
        const currentValue = parseInt(slider.value) || 0;
        const newValue = Math.max(0, currentValue - 10);
        updateTextScale(newValue);
      });
    }

    if (increaseBtn) {
      increaseBtn.addEventListener("click", function () {
        const currentValue = parseInt(slider.value) || 0;
        const newValue = Math.min(100, currentValue + 10);
        updateTextScale(newValue);
      });
    }
  }

  // ============================================
  // 5. FONT SIZE CONTROLS (0% dan 100% gacha)
  // ============================================
  function initFontSizeControls() {
    const slider = document.getElementById("a11y-font-scale");
    const valueDisplay = document.getElementById("a11y-font-scale-value");
    const decreaseBtn = document.getElementById("a11y-font-scale-decrease");
    const increaseBtn = document.getElementById("a11y-font-scale-increase");

    if (!slider || !valueDisplay) return;

    function updateFontScale(value) {
      valueDisplay.textContent = value + "%";
      slider.value = value;

      // CSS variable orqali font scale qo'llash (faqat raqam sifatida)
      document.documentElement.style.setProperty(
        "--a11y-font-scale-value",
        value
      );
      document.body.classList.add("a11y-font-scale");

      saveSetting("a11y-font-scale", value);
    }

    slider.addEventListener("input", function () {
      updateFontScale(this.value);
    });

    if (decreaseBtn) {
      decreaseBtn.addEventListener("click", function () {
        const currentValue = parseInt(slider.value) || 0;
        const newValue = Math.max(0, currentValue - 10);
        updateFontScale(newValue);
      });
    }

    if (increaseBtn) {
      increaseBtn.addEventListener("click", function () {
        const currentValue = parseInt(slider.value) || 0;
        const newValue = Math.min(100, currentValue + 10);
        updateFontScale(newValue);
      });
    }
  }

  // ============================================
  // 6. WORD CONTROLS (So'z uzunligi / So'z oralig'i)
  // ============================================
  function initWordControls() {
    const wordLengthBtn = document.getElementById("a11y-word-length-btn");
    const wordSpacingBtn = document.getElementById("a11y-word-spacing-btn");

    if (!wordLengthBtn || !wordSpacingBtn) return;

    let currentMode = "spacing"; // 'length' yoki 'spacing'
    const spacingLevels = ["small", "medium", "large"];
    let currentSpacingLevel = 0;
    let currentLengthLevel = 0; // 0 = o'chirilgan, 1 = yoqilgan

    function updateWordControls() {
      // Button active holatini yangilash
      if (currentMode === "length") {
        wordLengthBtn.classList.add("active");
        wordSpacingBtn.classList.remove("active");
        // So'z uzunligi funksiyasi - matnlar orasini ochish
        document.body.classList.remove(
          "a11y-word-spacing-small",
          "a11y-word-spacing-medium",
          "a11y-word-spacing-large"
        );
        if (currentLengthLevel === 1) {
          document.body.classList.add("a11y-word-length");
        } else {
          document.body.classList.remove("a11y-word-length");
        }
      } else {
        wordSpacingBtn.classList.add("active");
        wordLengthBtn.classList.remove("active");
        // So'z oralig'i funksiyasi - darhol spacing qo'llash
        document.body.classList.remove(
          "a11y-word-spacing-small",
          "a11y-word-spacing-medium",
          "a11y-word-spacing-large"
        );
        if (currentSpacingLevel === 1) {
          document.body.classList.add("a11y-word-spacing-small");
        } else if (currentSpacingLevel === 2) {
          document.body.classList.add("a11y-word-spacing-medium");
        } else if (currentSpacingLevel === 3) {
          document.body.classList.add("a11y-word-spacing-large");
        }
      }
      saveSetting("a11y-word-mode", currentMode);
      saveSetting("a11y-word-spacing", currentSpacingLevel);
      saveSetting("a11y-word-length", currentLengthLevel);
    }

    wordLengthBtn.addEventListener("click", function () {
      currentMode = "length";
      // So'z uzunligi button bosilganda toggle qilish
      // Agar o'chirilgan bo'lsa (0), uni yoqish (1)
      // Agar yoqilgan bo'lsa, uni o'chirish (0)
      if (currentLengthLevel === 0) {
        currentLengthLevel = 1; // Matnlar orasini ochish
      } else {
        currentLengthLevel = 0; // O'chirish
      }
      updateWordControls();
    });

    wordSpacingBtn.addEventListener("click", function () {
      currentMode = "spacing";
      // So'z oralig'i button bosilganda toggle qilish
      // Agar spacing o'chirilgan bo'lsa (0), uni yoqish (1 = medium)
      // Agar spacing yoqilgan bo'lsa, uni o'chirish (0)
      if (currentSpacingLevel === 0) {
        currentSpacingLevel = 2; // Medium spacing (darhol spacing qo'llash)
      } else {
        currentSpacingLevel = 0; // Spacing o'chirish
      }
      updateWordControls();
    });

    // Saved mode ni yuklash
    const savedMode = loadSetting("a11y-word-mode");
    if (savedMode) {
      currentMode = savedMode;
    }
    const savedLevel = loadSetting("a11y-word-spacing");
    if (savedLevel !== null) {
      currentSpacingLevel = parseInt(savedLevel);
    }
    const savedLengthLevel = loadSetting("a11y-word-length");
    if (savedLengthLevel !== null) {
      currentLengthLevel = parseInt(savedLengthLevel);
    }
    updateWordControls();
  }

  // ============================================
  // 8. FOCUS MODE - PAGE FOCUS MODE
  // ============================================
  /**
   * Page Focus Mode - Butun sahifa qoraytiriladi, faqat markaziy kontent yoritiladi
   * Bu funksiya sahifaning barcha qismlarini qoraytiradi va faqat markaziy kontentni yoritadi
   */
  function initPageFocusMode() {
    const pageFocusBtn = document.getElementById("a11y-page-focus-mode-btn");
    const elementFocusBtn = document.getElementById(
      "a11y-element-focus-mode-btn"
    );
    const overlay = document.getElementById("a11y-focus-overlay");
    const spotlight = document.getElementById("a11y-focus-spotlight");
    const banner = document.getElementById("a11y-focus-banner");

    if (!pageFocusBtn || !elementFocusBtn || !overlay || !spotlight || !banner)
      return;

    pageFocusBtn.addEventListener("click", function () {
      // Element Focus Mode ni o'chirish (ikkalasi bir vaqtda ishlamasligi uchun)
      elementFocusBtn.classList.remove("active");
      disableElementFocusModeInternal();

      // Page Focus Mode ni yoqish
      this.classList.add("active");
      document.body.classList.add("a11y-page-focus-mode");
      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");
      spotlight.classList.add("active");
      spotlight.setAttribute("aria-hidden", "false");
      banner.classList.add("active");
      banner.setAttribute("aria-hidden", "false");

      // Scroll-based focus mode'ni yoqish
      enableScrollBasedFocusMode();

      saveSetting("a11y-page-focus-mode", true);
      saveSetting("a11y-element-focus-mode", false);
    });

    elementFocusBtn.addEventListener("click", function () {
      // Page Focus Mode ni o'chirish
      pageFocusBtn.classList.remove("active");
      disablePageFocusModeInternal();

      // Element Focus Mode ni yoqish
      this.classList.add("active");
      document.body.classList.add("a11y-element-focus-mode");
      overlay.classList.add("active");
      overlay.setAttribute("aria-hidden", "false");
      spotlight.classList.add("active");
      spotlight.setAttribute("aria-hidden", "false");
      banner.classList.add("active");
      banner.setAttribute("aria-hidden", "false");

      // Click event listener qo'shish
      enableElementFocusTracking();

      saveSetting("a11y-element-focus-mode", true);
      saveSetting("a11y-page-focus-mode", false);
    });

    function enableElementFocusTracking() {
      const clickHandler = function (e) {
        if (
          e.target.closest("#a11y-menu") ||
          e.target.closest("#a11y-focus-banner") ||
          e.target.closest("#a11y-focus-overlay") ||
          e.target.closest("#a11y-focus-spotlight")
        ) {
          return;
        }
        if (e.shiftKey) {
          return;
        }
        const targetElement = e.target.closest(
          "section, article, div, main, header, footer, aside, nav, p, h1, h2, h3, h4, h5, h6, ul, ol, li, a, button, form, input, textarea, select"
        );
        if (targetElement && spotlight) {
          const rect = targetElement.getBoundingClientRect();
          const viewportX = rect.left + rect.width / 2;
          const viewportY = rect.top + rect.height / 2;
          const width = Math.max(rect.width, 200);
          const height = Math.max(rect.height, 100);
          const radius = Math.max(width, height) / 2 + 50;
          const clipPath = `circle(${radius}px at ${viewportX}px ${viewportY}px)`;
          spotlight.style.clipPath = clipPath;
        }
      };
      document.addEventListener("click", clickHandler, true);
    }
  }

  function disablePageFocusMode() {
    disablePageFocusModeInternal();
  }

  // ============================================
  // 9. FOCUS MODE - ELEMENT FOCUS MODE (initPageFocusMode ichida birlashtirildi)
  // ============================================
  // Element Focus Mode funksiyasi initPageFocusMode ichida birlashtirildi

  // ============================================
  // 9. VOICE ASSISTANT (Web Speech API)
  // ============================================
  function initVoiceAssistant() {
    const checkbox = document.getElementById("a11y-voice-assistant");
    const voiceControls = document.getElementById("a11y-voice-controls");
    const voiceSelect = document.getElementById("a11y-voice-select");
    const speedSlider = document.getElementById("a11y-speed-slider");
    const speedValues = document.querySelectorAll(".a11y-speed-value");
    const toneButtons = document.querySelectorAll(".a11y-tone-btn");
    if (!checkbox || !voiceControls) return;

    let selectedVoice = "Dilnavoz";
    let selectedSpeed = 1.0;
    let selectedTone = "friendly";

    // Speed values mapping: slider index -> speed value
    const speedValuesArray = [0.5, 0.75, 1.0, 1.5, 2.0];

    // Convert slider value (0-4) to speed value
    function sliderValueToSpeed(sliderValue) {
      const index = parseInt(sliderValue);
      return speedValuesArray[index] || 1.0;
    }

    // Convert speed value to slider value (0-4)
    function speedToSliderValue(speed) {
      const index = speedValuesArray.findIndex(function (val) {
        return Math.abs(val - speed) < 0.05;
      });
      return index >= 0 ? index : 2; // default to 1.0x (index 2)
    }

    // Load saved speed setting
    const savedSpeed = loadSetting("a11y-voice-speed");
    if (savedSpeed !== null) {
      selectedSpeed = parseFloat(savedSpeed);
      // Snap to nearest value
      const nearestValue = speedValuesArray.reduce(function (prev, curr) {
        return Math.abs(curr - selectedSpeed) < Math.abs(prev - selectedSpeed)
          ? curr
          : prev;
      });
      selectedSpeed = nearestValue;
      if (speedSlider) {
        speedSlider.value = speedToSliderValue(selectedSpeed);
      }
      updateActiveValue();
    } else {
      if (speedSlider) {
        speedSlider.value = 2; // default to 1.0x
      }
      updateActiveValue();
    }

    // Update active value display
    function updateActiveValue() {
      speedValues.forEach(function (valueEl) {
        const value = parseFloat(valueEl.getAttribute("data-value"));
        if (Math.abs(value - selectedSpeed) < 0.05) {
          valueEl.classList.add("active");
        } else {
          valueEl.classList.remove("active");
        }
      });
    }

    // Checkbox change
    checkbox.addEventListener("change", function () {
      if (this.checked) {
        voiceControls.style.display = "block";
        initSpeechSynthesis();
        enableTextSelectionReading();
        saveSetting("a11y-voice-assistant", true);
      } else {
        voiceControls.style.display = "none";
        stopVoice();
        disableTextSelectionReading();
        saveSetting("a11y-voice-assistant", false);
      }
    });

    // Speed slider with snapping
    if (speedSlider) {
      speedSlider.addEventListener("input", function () {
        const sliderValue = parseInt(this.value);
        selectedSpeed = sliderValueToSpeed(sliderValue);
        updateActiveValue();
        saveSetting("a11y-voice-speed", selectedSpeed);
      });

      speedSlider.addEventListener("change", function () {
        const sliderValue = parseInt(this.value);
        selectedSpeed = sliderValueToSpeed(sliderValue);
        updateActiveValue();
        saveSetting("a11y-voice-speed", selectedSpeed);
      });
    }

    // Click on values to set speed
    speedValues.forEach(function (valueEl) {
      valueEl.addEventListener("click", function () {
        const value = parseFloat(this.getAttribute("data-value"));
        selectedSpeed = value;
        if (speedSlider) {
          speedSlider.value = speedToSliderValue(value);
          updateActiveValue();
          saveSetting("a11y-voice-speed", selectedSpeed);
          speedSlider.dispatchEvent(new Event("change"));
        }
      });
    });

    // Tone buttons
    toneButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        toneButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        this.classList.add("active");
        selectedTone = this.getAttribute("data-tone");
        saveSetting("a11y-voice-tone", selectedTone);
      });
    });

    function initSpeechSynthesis() {
      if ("speechSynthesis" in window) {
        voiceSynthesis = window.speechSynthesis;

        // Voice'lar yuklanguncha kutish
        if (voiceSynthesis.getVoices().length === 0) {
          voiceSynthesis.onvoiceschanged = function () {
            console.log(
              "Voice'lar yuklandi. Mavjud voice'lar:",
              voiceSynthesis.getVoices()
            );
            // Uzbek voice'larini ko'rsatish
            const uzbekVoices = voiceSynthesis
              .getVoices()
              .filter(function (voice) {
                return (
                  voice.lang.includes("uz") ||
                  voice.name.toLowerCase().includes("uzbek")
                );
              });
            console.log("Uzbek voice'lar:", uzbekVoices);
          };
        } else {
          // Voice'lar allaqachon yuklangan
          console.log("Mavjud voice'lar:", voiceSynthesis.getVoices());
          const uzbekVoices = voiceSynthesis
            .getVoices()
            .filter(function (voice) {
              return (
                voice.lang.includes("uz") ||
                voice.name.toLowerCase().includes("uzbek")
              );
            });
          console.log("Uzbek voice'lar:", uzbekVoices);
        }
      } else {
        console.warn("Speech Synthesis API not supported");
        if (checkbox) checkbox.checked = false;
        if (voiceControls) voiceControls.style.display = "none";
      }
    }

    function startVoice(voiceName, speed, tone) {
      if (!voiceSynthesis) {
        initSpeechSynthesis();
        if (!voiceSynthesis) return;
      }

      stopVoice();

      const utterance = new SpeechSynthesisUtterance();

      // Matnni olish - sahifadagi barcha matn yoki tanlangan matn
      let textToRead =
        currentSelection || document.body.innerText.substring(0, 500);

      utterance.text = textToRead;
      utterance.rate = speed;
      utterance.pitch = tone === "friendly" ? 1.2 : tone === "formal" ? 0.8 : 1;
      utterance.volume = 1;
      utterance.lang = "uz-UZ";

      // Voice tanlash
      const voices = voiceSynthesis.getVoices();
      const selectedVoiceObj = voices.find(function (voice) {
        return voice.name.includes(voiceName) || voice.lang.includes("uz");
      });

      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
      }

      utterance.onstart = function () {
        isPlaying = true;
      };

      utterance.onend = function () {
        isPlaying = false;
      };

      utterance.onerror = function (e) {
        console.error("Speech synthesis error:", e);
        isPlaying = false;
      };

      voiceSynthesis.speak(utterance);
    }

    function stopVoice() {
      if (voiceSynthesis && isPlaying) {
        voiceSynthesis.cancel();
        isPlaying = false;
      }
    }

    // Text selection reading funksiyasi
    function enableTextSelectionReading() {
      document.addEventListener("mouseup", handleTextSelection, true);
    }

    function disableTextSelectionReading() {
      document.removeEventListener("mouseup", handleTextSelection, true);
    }

    function handleTextSelection(e) {
      if (!checkbox || !checkbox.checked) return;

      // Tanlangan textni olish (ACCESSIBILITY menu ichidagi textlar ham)
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText.length > 0) {
        // Tanlangan textni o'qish
        readSelectedText(
          selectedText,
          selectedVoice,
          selectedSpeed,
          selectedTone
        );
      }
    }

    let selectedTextVoiceSynthesis = null;

    function readSelectedText(text, voiceName, speed, tone) {
      if (!voiceSynthesis) {
        initSpeechSynthesis();
        if (!voiceSynthesis) return;
      }

      // Oldingi o'qishni to'xtatish
      stopSelectedTextVoice();

      // Tanlangan tilni olish
      const lang =
        currentLang ||
        localStorage.getItem("selectedLanguage") ||
        localStorage.getItem("a11y-lang") ||
        "uz";

      // Til kodini Speech Synthesis API uchun formatlash
      let langCode = "uz-UZ"; // Default
      if (lang === "ru") {
        langCode = "ru-RU";
      } else if (lang === "en") {
        langCode = "en-US";
      } else if (lang === "uz") {
        langCode = "uz-UZ";
      }

      const utterance = new SpeechSynthesisUtterance();
      utterance.text = text;
      utterance.rate = speed;
      utterance.pitch = tone === "friendly" ? 1.2 : tone === "formal" ? 0.8 : 1;
      utterance.volume = 1;
      utterance.lang = langCode;

      // Voice tanlash - tanlangan tilga mos
      const voices = voiceSynthesis.getVoices();
      let selectedVoiceObj = null;

      if (lang === "uz") {
        // Uzbek tilida - avval Uzbek voice'larini qidirish
        // Avval uz-UZ lang kodiga ega voice'lar
        selectedVoiceObj = voices.find(function (voice) {
          return voice.lang === "uz-UZ" || voice.lang === "uz";
        });

        // Agar topilmasa, voice name'da "uzbek" yoki "uzbekistan" bo'lgan voice'lar
        if (!selectedVoiceObj) {
          selectedVoiceObj = voices.find(function (voice) {
            const name = voice.name.toLowerCase();
            return (
              (name.includes("uzbek") ||
                name.includes("uzbekistan") ||
                name.includes("o'zbek") ||
                name.includes("uzbekcha")) &&
              (voice.lang.startsWith("uz") || voice.lang.includes("uz"))
            );
          });
        }

        // Agar hali ham topilmasa, faqat uz lang kodiga ega voice'lar
        if (!selectedVoiceObj) {
          selectedVoiceObj = voices.find(function (voice) {
            return voice.lang.startsWith("uz") || voice.lang.includes("uz");
          });
        }

        // Agar Uzbek voice topilmasa, Rus voice'ni ishlatish
        if (!selectedVoiceObj) {
          // Rus voice'larini qidirish
          selectedVoiceObj = voices.find(function (voice) {
            return (
              voice.lang === "ru-RU" ||
              voice.lang === "ru" ||
              voice.lang.startsWith("ru")
            );
          });

          // Agar Rus voice topilsa, lang kodini ham o'zgartirish
          if (selectedVoiceObj) {
            utterance.lang = "ru-RU";
            console.log(
              "Uzbek voice topilmadi. Rus voice ishlatilmoqda:",
              selectedVoiceObj.name
            );
          }
        }

        // Debug: Uzbek voice'larini console'da ko'rsatish
        if (!selectedVoiceObj) {
          const uzbekVoices = voices.filter(function (voice) {
            return (
              voice.lang.includes("uz") ||
              voice.name.toLowerCase().includes("uzbek")
            );
          });
          console.log("Uzbek voice'lar topilmadi. Mavjud voice'lar:", voices);
          console.log("Uzbek voice'lar:", uzbekVoices);

          // Agar Uzbek va Rus voice topilmasa, lang kodini uz-UZ qilib qoldiramiz
          utterance.lang = "uz-UZ";
          console.warn(
            "Uzbek va Rus voice'lar topilmadi. Default voice ishlatiladi."
          );
        }
      } else if (lang === "ru") {
        // Rus tilida - faqat Rus voice'larini qidirish
        selectedVoiceObj = voices.find(function (voice) {
          return (
            voice.lang === "ru-RU" ||
            voice.lang === "ru" ||
            voice.lang.startsWith("ru")
          );
        });
      } else if (lang === "en") {
        // Ingliz tilida - faqat Ingliz voice'larini qidirish
        selectedVoiceObj = voices.find(function (voice) {
          return (
            voice.lang === "en-US" ||
            voice.lang === "en-GB" ||
            voice.lang.startsWith("en")
          );
        });
      }

      // Agar hali ham topilmasa, default voice tanlash
      if (!selectedVoiceObj && voices.length > 0) {
        // Tanlangan tilga mos birinchi voice'ni tanlash
        selectedVoiceObj = voices.find(function (voice) {
          return voice.lang.startsWith(lang);
        });
      }

      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
        console.log(
          "Tanlangan voice:",
          selectedVoiceObj.name,
          selectedVoiceObj.lang
        );
      } else {
        console.warn(
          "Tanlangan tilga mos voice topilmadi. Default voice ishlatiladi."
        );
      }

      selectedTextVoiceSynthesis = utterance;
      voiceSynthesis.speak(utterance);
    }

    function stopSelectedTextVoice() {
      if (voiceSynthesis && selectedTextVoiceSynthesis) {
        voiceSynthesis.cancel();
        selectedTextVoiceSynthesis = null;
      }
    }

    // Voices yuklanganda
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = function () {
        // Voices ready
      };
    }

    // Global funksiyalar - loadSavedSettings dan chaqirish uchun
    window.enableTextSelectionReading = enableTextSelectionReading;
    window.disableTextSelectionReading = disableTextSelectionReading;
  }

  // ============================================
  // 10. CURSOR CONTROLS
  // ============================================
  function initCursorControls() {
    const sizeButtons = document.querySelectorAll(".a11y-cursor-size-btn");
    const colorButtons = document.querySelectorAll(".a11y-cursor-color-btn");

    let currentSize = "small";
    let currentColor = "black";

    // Size buttons
    sizeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        sizeButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        this.classList.add("active");
        currentSize = this.getAttribute("data-size");

        document.body.classList.remove(
          "a11y-cursor-small",
          "a11y-cursor-medium",
          "a11y-cursor-large"
        );
        document.body.classList.add("a11y-cursor-" + currentSize);

        saveSetting("a11y-cursor-size", currentSize);
      });
    });

    // Color buttons
    colorButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        colorButtons.forEach(function (b) {
          b.classList.remove("active");
        });
        this.classList.add("active");
        currentColor = this.getAttribute("data-color");

        // Cursor rangini o'zgartirish
        document.body.classList.remove("a11y-cursor-white");
        if (currentColor === "white") {
          document.body.classList.add("a11y-cursor-white");
        }

        // Cursor kattaligini o'zgartirish (bir marta bosilganda darhol kattalashtirish)
        // Avvalgi kattalikni aniqlash
        let previousSize = "small";
        if (document.body.classList.contains("a11y-cursor-medium")) {
          previousSize = "medium";
        } else if (document.body.classList.contains("a11y-cursor-large")) {
          previousSize = "large";
        }

        // Kattalikni o'zgartirish
        document.body.classList.remove(
          "a11y-cursor-small",
          "a11y-cursor-medium",
          "a11y-cursor-large"
        );

        // Birinchi marta bosilganda darhol o'rta kattalikka o'tkazish
        // Agar kichik yoki yo'q bo'lsa, o'rta qilish
        if (previousSize === "small") {
          currentSize = "medium";
          document.body.classList.add("a11y-cursor-medium");
        } else {
          // Agar allaqachon o'rta yoki katta bo'lsa, o'rta qilib qoldirish
          currentSize = "medium";
          document.body.classList.add("a11y-cursor-medium");
        }

        // currentSize ni yangilash
        currentSize = currentSize;

        saveSetting("a11y-cursor-color", currentColor);
        saveSetting("a11y-cursor-size", currentSize);
      });
    });
  }

  // ============================================
  // 11. COLOR MODE BUTTONS
  // ============================================
  function initColorModes() {
    const colorButtons = document.querySelectorAll(".a11y-color-mode-btn");

    colorButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const mode = this.getAttribute("data-mode");

        // Barcha active classlarni olib tashlash
        colorButtons.forEach(function (b) {
          b.classList.remove("active");
        });

        // Tanlangan buttonga active qo'shish
        this.classList.add("active");

        // Body classlarni yangilash
        document.body.classList.remove(
          "a11y-color-none",
          "a11y-color-low-light",
          "a11y-color-high-light"
        );

        // Har qanday mode uchun class qo'shish
        document.body.classList.add("a11y-color-" + mode);

        saveSetting("a11y-color-mode", mode);
      });
    });
  }

  // ============================================
  // 11.5. BRIGHTNESS SCALE CONTROLS
  // ============================================
  function initBrightnessScale() {
    const slider = document.getElementById("a11y-brightness-scale");
    const valueDisplay = document.getElementById("a11y-brightness-scale-value");
    const decreaseBtn = document.getElementById(
      "a11y-brightness-scale-decrease"
    );
    const increaseBtn = document.getElementById(
      "a11y-brightness-scale-increase"
    );

    if (!slider || !valueDisplay) return;

    function updateBrightness(value) {
      const numValue = parseInt(value);
      if (isNaN(numValue)) {
        return;
      }
      valueDisplay.textContent = numValue + "%";
      slider.value = numValue;

      // CSS variable orqali brightness qo'llash
      // 0% = 0.5 brightness (qorong'i), 100% = 1.5 brightness (yorug')
      const brightnessValue = 0.5 + (numValue / 100) * 1.0; // 0.5 dan 1.5 gacha
      document.documentElement.style.setProperty(
        "--a11y-brightness-value",
        brightnessValue
      );
      document.body.classList.add("a11y-brightness-scale");

      // Body classlarni yangilash - brightness mode'ni olib tashlash
      document.body.classList.remove(
        "a11y-color-low-light",
        "a11y-color-high-light"
      );

      // Agar 100% bo'lsa (default), brightness class'ni ham olib tashlash
      if (numValue === 100) {
        document.body.classList.remove("a11y-brightness-scale");
        document.documentElement.style.removeProperty(
          "--a11y-brightness-value"
        );
      } else {
        // 0% dan 99% gacha brightness class va CSS variable o'rnatilishi kerak
        document.body.classList.add("a11y-brightness-scale");
      }

      saveSetting("a11y-brightness-scale", numValue);
    }

    slider.addEventListener("input", function () {
      updateBrightness(this.value);
    });

    if (decreaseBtn) {
      decreaseBtn.addEventListener("click", function () {
        const currentValue = parseInt(slider.value);
        if (isNaN(currentValue)) {
          return;
        }
        const newValue = Math.max(0, currentValue - 10);
        updateBrightness(newValue);
      });
    }

    if (increaseBtn) {
      increaseBtn.addEventListener("click", function () {
        const currentValue = parseInt(slider.value);
        if (isNaN(currentValue)) {
          return;
        }
        const newValue = Math.min(100, currentValue + 10);
        updateBrightness(newValue);
      });
    }
  }

  // ============================================
  // 12. RESET ALL SETTINGS
  // ============================================
  function initResetButton() {
    const resetBtn = document.getElementById("a11y-reset");
    if (!resetBtn) return;

    resetBtn.addEventListener("click", function () {
      // Barcha classlarni olib tashlash
      document.body.classList.remove(
        "a11y-theme-light",
        "a11y-theme-dark",
        "a11y-theme-adaptive",
        "a11y-text-scale",
        "a11y-font-scale",
        "a11y-font-small",
        "a11y-font-medium",
        "a11y-font-large",
        "a11y-font-xlarge",
        "a11y-font-xxlarge",
        "a11y-word-spacing-small",
        "a11y-word-spacing-medium",
        "a11y-word-spacing-large",
        "a11y-page-focus-mode",
        "a11y-element-focus-mode",
        "a11y-cursor-small",
        "a11y-cursor-medium",
        "a11y-cursor-large",
        "a11y-cursor-white",
        "a11y-color-none",
        "a11y-color-low-light",
        "a11y-color-high-light"
      );

      // CSS variable reset
      document.documentElement.style.removeProperty("--a11y-text-scale");

      // Barcha checkboxlarni unchecked qilish
      const checkboxes = document.querySelectorAll(".a11y-checkbox");
      checkboxes.forEach(function (checkbox) {
        checkbox.checked = false;
      });

      // Barcha buttonlarni reset qilish
      const themeButtons = document.querySelectorAll(".a11y-theme-btn");
      themeButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });
      document.getElementById("a11y-theme-adaptive")?.classList.add("active");

      // Slider reset
      const slider = document.getElementById("a11y-text-scale");
      if (slider) {
        slider.value = 0;
        document.getElementById("a11y-text-scale-value").textContent = "0%";

        const fontSlider = document.getElementById("a11y-font-scale");
        if (fontSlider) {
          fontSlider.value = 0;
          document.getElementById("a11y-font-scale-value").textContent = "0%";
        }
      }

      // Font size reset
      const fontDisplay = document.getElementById("a11y-font-size-value");
      if (fontDisplay) {
        fontDisplay.textContent = "16px";
      }

      // Voice controls yopish
      const voiceControls = document.getElementById("a11y-voice-controls");
      if (voiceControls) {
        voiceControls.style.display = "none";
      }
      stopVoice();

      // Focus mode ni o'chirish
      disablePageFocusModeInternal();
      disableElementFocusModeInternal();
      const pageFocusBtn = document.getElementById("a11y-page-focus-mode-btn");
      const elementFocusBtn = document.getElementById(
        "a11y-element-focus-mode-btn"
      );
      if (pageFocusBtn) pageFocusBtn.classList.remove("active");
      if (elementFocusBtn) elementFocusBtn.classList.remove("active");

      // localStorage ni tozalash
      localStorage.removeItem("a11y-theme");
      localStorage.removeItem("a11y-text-scale");
      localStorage.removeItem("a11y-font-scale");
      localStorage.removeItem("a11y-font-size-index");
      localStorage.removeItem("a11y-word-mode");
      localStorage.removeItem("a11y-word-spacing");
      localStorage.removeItem("a11y-word-length");
      localStorage.removeItem("a11y-page-focus-mode");
      localStorage.removeItem("a11y-element-focus-mode");
      localStorage.removeItem("a11y-voice-assistant");
      localStorage.removeItem("a11y-voice-name");
      localStorage.removeItem("a11y-voice-speed");
      localStorage.removeItem("a11y-voice-tone");
      localStorage.removeItem("a11y-cursor-size");
      localStorage.removeItem("a11y-cursor-color");
      localStorage.removeItem("a11y-color-mode");
      localStorage.removeItem("a11y-brightness-scale");

      alert("Barcha sozlamalar tiklandi!");
    });
  }

  // ============================================
  // 13. INIT ALL CONTROLS
  // ============================================
  function initAllControls() {
    initThemeButtons();
    initTextScale();
    initFontSizeControls();
    initWordControls();
    initPageFocusMode();
    initVoiceAssistant();
    initCursorControls();
    initColorModes();
    initBrightnessScale();
    initResetButton();
  }

  // ============================================
  // 14. LOCALSTORAGE FUNCTIONS
  // ============================================
  function saveSetting(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage save failed:", e);
    }
  }

  function loadSetting(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.warn("localStorage load failed:", e);
      return null;
    }
  }

  // ============================================
  // 15. LOAD SAVED SETTINGS
  // ============================================
  function loadSavedSettings() {
    // Theme - initThemeButtons ichida boshqariladi, shuning uchun bu yerda faqat body class qo'shamiz
    const theme = loadSetting("a11y-theme");
    if (theme && theme !== "adaptive") {
      document.body.classList.add("a11y-theme-" + theme);
    }

    // Text Scale
    const textScale = loadSetting("a11y-text-scale");
    if (textScale) {
      const slider = document.getElementById("a11y-text-scale");
      const valueDisplay = document.getElementById("a11y-text-scale-value");
      if (slider && valueDisplay) {
        slider.value = textScale;
        valueDisplay.textContent = textScale + "%";
        document.documentElement.style.setProperty(
          "--a11y-text-scale",
          textScale + "%"
        );
        document.body.classList.add("a11y-text-scale");
        document.documentElement.classList.add("a11y-text-scale");

        // Header tepasida oq fon ko'rinmasligi uchun
        setTimeout(function () {
          const headerArea = document.querySelector(".header-area");
          const headerSticky = document.getElementById("header-sticky");
          const smoothWrapper = document.getElementById("smooth-wrapper");

          if (headerArea) {
            headerArea.style.marginTop = "0";
            headerArea.style.paddingTop = "0";
            headerArea.style.top = "0";
          }

          if (headerSticky) {
            headerSticky.style.marginTop = "0";
            headerSticky.style.paddingTop = "0";
            headerSticky.style.top = "0";
          }

          if (smoothWrapper) {
            smoothWrapper.style.marginTop = "0";
            smoothWrapper.style.paddingTop = "0";
          }

          document.documentElement.style.marginTop = "0";
          document.documentElement.style.paddingTop = "0";
          document.documentElement.style.margin = "0";
          document.documentElement.style.padding = "0";
          document.body.style.marginTop = "0";
          document.body.style.paddingTop = "0";
          document.body.style.margin = "0";
          document.body.style.padding = "0";
        }, 100);
      }
    }

    // Font Scale (0-100%)
    const fontScale = loadSetting("a11y-font-scale");
    if (fontScale) {
      const fontSlider = document.getElementById("a11y-font-scale");
      const fontValueDisplay = document.getElementById("a11y-font-scale-value");
      if (fontSlider && fontValueDisplay) {
        fontSlider.value = fontScale;
        fontValueDisplay.textContent = fontScale + "%";
        document.documentElement.style.setProperty(
          "--a11y-font-scale-value",
          fontScale
        );
        document.body.classList.add("a11y-font-scale");
      }
    }

    // Font Size (Rasmda ko'rsatilmagan, lekin localStorage dan restore qilish)
    const fontIndex = loadSetting("a11y-font-size-index");
    if (fontIndex !== null) {
      const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];
      const size = fontSizes[parseInt(fontIndex)];
      if (size <= 14) {
        document.body.classList.add("a11y-font-small");
      } else if (size <= 16) {
        document.body.classList.add("a11y-font-medium");
      } else if (size <= 18) {
        document.body.classList.add("a11y-font-large");
      } else if (size <= 20) {
        document.body.classList.add("a11y-font-xlarge");
      } else {
        document.body.classList.add("a11y-font-xxlarge");
      }
    }

    // Word Controls
    const wordMode = loadSetting("a11y-word-mode");
    const wordSpacing = loadSetting("a11y-word-spacing");
    if (wordMode) {
      const wordLengthBtn = document.getElementById("a11y-word-length-btn");
      const wordSpacingBtn = document.getElementById("a11y-word-spacing-btn");
      if (wordMode === "length" && wordLengthBtn) {
        wordLengthBtn.classList.add("active");
        wordSpacingBtn?.classList.remove("active");
      } else if (wordSpacingBtn) {
        wordSpacingBtn.classList.add("active");
        wordLengthBtn?.classList.remove("active");
      }
    }
    if (wordSpacing !== null && wordSpacing > 0) {
      const levels = ["small", "medium", "large"];
      document.body.classList.add("a11y-word-spacing-" + levels[wordSpacing]);
    }

    // Voice Assistant - faqat UI holatini tiklash, funksiyalarni avtomatik yoqmaslik
    if (loadSetting("a11y-voice-assistant")) {
      const checkbox = document.getElementById("a11y-voice-assistant");
      const voiceControls = document.getElementById("a11y-voice-controls");
      if (checkbox && voiceControls) {
        checkbox.checked = true;
        voiceControls.style.display = "block";
        // Funksiyalarni avtomatik yoqmaslik - faqat UI holatini tiklash
        // Foydalanuvchi checkbox'ni o'zi yoqishi kerak
      }

      const voiceName = loadSetting("a11y-voice-name");
      if (voiceName) {
        const voiceBtn = document.querySelector(`[data-voice="${voiceName}"]`);
        if (voiceBtn) {
          document.querySelectorAll(".a11y-voice-btn").forEach(function (b) {
            b.classList.remove("active");
          });
          voiceBtn.classList.add("active");
        }
      }

      const speed = loadSetting("a11y-voice-speed");
      if (speed !== null) {
        const speedSlider = document.getElementById("a11y-speed-slider");
        const speedValues = document.querySelectorAll(".a11y-speed-value");
        if (speedSlider) {
          // Snap to nearest value
          const speedValuesArray = [0.5, 0.75, 1.0, 1.5, 2.0];
          const snappedValue = speedValuesArray.reduce(function (prev, curr) {
            return Math.abs(curr - parseFloat(speed)) <
              Math.abs(prev - parseFloat(speed))
              ? curr
              : prev;
          });

          // Convert speed to slider value (0-4)
          const sliderIndex = speedValuesArray.findIndex(function (val) {
            return Math.abs(val - snappedValue) < 0.05;
          });
          speedSlider.value = sliderIndex >= 0 ? sliderIndex : 2;

          // Update active value display
          speedValues.forEach(function (valueEl) {
            const value = parseFloat(valueEl.getAttribute("data-value"));
            if (Math.abs(value - snappedValue) < 0.05) {
              valueEl.classList.add("active");
            } else {
              valueEl.classList.remove("active");
            }
          });
        }
      }

      const tone = loadSetting("a11y-voice-tone");
      if (tone) {
        const toneBtn = document.querySelector('[data-tone="' + tone + '"]');
        if (toneBtn) {
          document.querySelectorAll(".a11y-tone-btn").forEach(function (b) {
            b.classList.remove("active");
          });
          toneBtn.classList.add("active");
        }
      }
    }

    // Cursor Size
    const cursorSize = loadSetting("a11y-cursor-size");
    if (cursorSize) {
      const sizeBtn = document.querySelector(
        '[data-size="' + cursorSize + '"]'
      );
      if (sizeBtn) {
        document
          .querySelectorAll(".a11y-cursor-size-btn")
          .forEach(function (b) {
            b.classList.remove("active");
          });
        sizeBtn.classList.add("active");
        document.body.classList.add("a11y-cursor-" + cursorSize);
      }
    }

    // Cursor Color
    const cursorColor = loadSetting("a11y-cursor-color");
    if (cursorColor) {
      const colorBtn = document.querySelector(
        '[data-color="' + cursorColor + '"]'
      );
      if (colorBtn) {
        document
          .querySelectorAll(".a11y-cursor-color-btn")
          .forEach(function (b) {
            b.classList.remove("active");
          });
        colorBtn.classList.add("active");
        if (cursorColor === "white") {
          document.body.classList.add("a11y-cursor-white");
        }
      }
    }

    // Brightness Scale
    const brightnessScale = loadSetting("a11y-brightness-scale");
    if (brightnessScale) {
      const brightnessSlider = document.getElementById("a11y-brightness-scale");
      const brightnessValueDisplay = document.getElementById(
        "a11y-brightness-scale-value"
      );
      if (brightnessSlider && brightnessValueDisplay) {
        brightnessSlider.value = brightnessScale;
        brightnessValueDisplay.textContent = brightnessScale + "%";
        // 0% = 0.5 brightness (qorong'i), 100% = 1.5 brightness (yorug')
        const brightnessValue = 0.5 + (brightnessScale / 100) * 1.0;
        document.documentElement.style.setProperty(
          "--a11y-brightness-value",
          brightnessValue
        );
        if (brightnessScale != 100) {
          document.body.classList.add("a11y-brightness-scale");
        }
      }
    }

    // Color Mode
    const colorMode = loadSetting("a11y-color-mode");
    if (colorMode) {
      const colorBtn = document.querySelector(
        '[data-mode="' + colorMode + '"]'
      );
      if (colorBtn) {
        document.querySelectorAll(".a11y-color-mode-btn").forEach(function (b) {
          b.classList.remove("active");
        });
        colorBtn.classList.add("active");
        document.body.classList.add("a11y-color-" + colorMode);
      }
    }
  }
})();
