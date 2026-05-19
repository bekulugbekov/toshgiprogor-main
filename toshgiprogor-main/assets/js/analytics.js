// E10: Google-free analytics — Umami (cookie-free) + Baidu Tongji (China)
// ─────────────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS (client fills in IDs):
//
//   1. Umami (international, cookie-free, GDPR-friendly):
//      a. Register at https://cloud.umami.is (free tier: 10k events/mo)
//         OR self-host: https://github.com/umami-software/umami
//      b. Add your site → copy the Website ID (UUID format)
//      c. Set CONF.umamiId and CONF.umamiSrc below
//
//   2. Baidu Tongji 百度统计 (required for accurate China traffic):
//      a. Register at https://tongji.baidu.com
//      b. Add site (新增网站) → copy the 32-char hex tracking code
//      c. Set CONF.baiduId below
//
//   Until IDs are set, this file loads silently with zero overhead.
// ─────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── Configuration ────────────────────────────────────────────────────────
  var CONF = {
    // Umami Website ID — replace with real UUID after registration
    // umamiId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    // umamiSrc: 'https://cloud.umami.is/script.js',

    // Baidu Tongji ID — replace with 32-char hex code from tongji.baidu.com
    // baiduId: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  };

  // ── Umami loader (async, non-blocking) ───────────────────────────────────
  function loadUmami() {
    if (!CONF.umamiId || !CONF.umamiSrc) return;
    var s = document.createElement('script');
    s.defer = true;
    s.src = CONF.umamiSrc;
    s.setAttribute('data-website-id', CONF.umamiId);
    s.setAttribute('data-auto-track', 'true');
    document.head.appendChild(s);
  }

  // ── Baidu Tongji loader (async, non-blocking) ─────────────────────────
  function loadBaidu() {
    if (!CONF.baiduId) return;
    window._hmt = window._hmt || [];
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://hm.baidu.com/hm.js?' + CONF.baiduId;
    document.head.appendChild(s);
  }

  // ── Generic event tracker ─────────────────────────────────────────────
  function trackEvent(name, category, label) {
    // Umami custom event
    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track(name, { category: category, label: label });
    }
    // Baidu Tongji event (category / action / label)
    if (window._hmt) {
      window._hmt.push(['_trackEvent', category, name, label || '']);
    }
  }

  // ── Conversion tracking ───────────────────────────────────────────────

  // 1. Language change — fires whenever translate.js dispatches languageChanged
  document.addEventListener('languageChanged', function (e) {
    var lang = (e.detail && e.detail.lang) || document.documentElement.lang || '';
    trackEvent('language_change', 'i18n', lang);
  });

  document.addEventListener('DOMContentLoaded', function () {

    // 2. Contact form submission (capture phase — before fetch)
    var form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', function () {
        trackEvent('form_submit', 'contact', 'contact_form');
      }, true);
    }

    // 3. WeChat interaction (QR placeholder + any weixin:// links)
    document.querySelectorAll(
      'a[href^="weixin://"], .wechat-qr-placeholder, [data-translate="coopWechatLabel"]'
    ).forEach(function (el) {
      el.addEventListener('click', function () {
        trackEvent('wechat_click', 'contact', 'wechat');
      });
    });

    // 4. WhatsApp link click
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(function (el) {
      el.addEventListener('click', function () {
        trackEvent('whatsapp_click', 'contact', 'whatsapp');
      });
    });

    // 5. Telegram link click (social / footer)
    document.querySelectorAll('a[href*="t.me"]').forEach(function (el) {
      el.addEventListener('click', function () {
        trackEvent('telegram_click', 'social', 'telegram');
      });
    });

    // 6. Page-level conversion goals
    var path = window.location.pathname;
    if (path.indexOf('cooperation') !== -1) {
      trackEvent('cooperation_view', 'pages', 'cooperation');
    }
    if (path.indexOf('privacy') !== -1) {
      trackEvent('privacy_view', 'pages', 'privacy');
    }
    if (path.indexOf('contact') !== -1) {
      trackEvent('contact_view', 'pages', 'contact');
    }

  });

  // ── Boot ─────────────────────────────────────────────────────────────────
  loadUmami();
  loadBaidu();
})();
