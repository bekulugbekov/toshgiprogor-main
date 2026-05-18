// E8: Kontakt forma — xavfsiz server-side yuborish
// Token yoki maxfiy kalit bu faylda YO'Q — faqat api/contact.php da
(function () {
  // 4-tilli xato/muvaffaqiyat xabarlari (server xabarlari bilan sinxron)
  var MSGS = {
    uz: {
      errorName:    "Ism va familiya kamida 2 belgidan iborat bo'lishi kerak.",
      errorPhone:   "Telefon raqami noto'g'ri kiritilgan.",
      errorConsent: "Davom etish uchun maxfiylik siyosatiga rozilik bering.",
      errorRate:    "Juda ko'p so'rov yuborildi. Iltimos, keyinroq urinib ko'ring.",
      errorServer:  "Server xatosi. info@tashgiprogor.uz ga yozing.",
    },
    ru: {
      errorName:    'Имя должно содержать не менее 2 символов.',
      errorPhone:   'Номер телефона введён некорректно.',
      errorConsent: 'Необходимо согласие с политикой конфиденциальности.',
      errorRate:    'Слишком много запросов. Пожалуйста, попробуйте позже.',
      errorServer:  'Ошибка сервера. Напишите на info@tashgiprogor.uz.',
    },
    en: {
      errorName:    'Name must be at least 2 characters.',
      errorPhone:   'Phone number is invalid.',
      errorConsent: 'Please agree to the privacy policy to continue.',
      errorRate:    'Too many requests. Please try again later.',
      errorServer:  'Server error. Email info@tashgiprogor.uz.',
    },
    zh: {
      errorName:    '姓名至少需要2个字符。',
      errorPhone:   '电话号码格式不正确。',
      errorConsent: '请同意隐私政策以继续。',
      errorRate:    '请求过于频繁，请稍后再试。',
      errorServer:  '服务器错误，请发邮件至 info@tashgiprogor.uz。',
    },
  };

  function getLang() {
    var stored = localStorage.getItem('selectedLanguage');
    if (stored && MSGS[stored]) return stored;
    var html = document.documentElement.lang || '';
    if (html.startsWith('zh')) return 'zh';
    if (html === 'uz') return 'uz';
    if (html === 'en') return 'en';
    return 'ru';
  }

  function showMessage(text, isSuccess) {
    var box = document.getElementById('messageBox');
    if (!box) return;
    box.textContent = text;
    box.style.display = 'block';
    box.className = 'message-box mb-30 ' + (isSuccess ? 'msg-success' : 'msg-error');
    if (isSuccess) {
      setTimeout(function () { box.style.display = 'none'; }, 6000);
    }
  }

  var form = document.getElementById('contactForm');
  if (!form) return;

  // Capture phase — jQuery-ning bubble-phase handleri ishlamasin
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var lang = getLang();
    var msgs = MSGS[lang];

    // Honeypot tekshiruvi (bot to'ldirsa — jim rad etish)
    var honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value !== '') return;

    var name    = (form.querySelector('[name="name"]')?.value    || '').trim();
    var phone   = (form.querySelector('[name="phone"]')?.value   || '').trim();
    var email   = (form.querySelector('[name="email"]')?.value   || '').trim();
    var message = (form.querySelector('[name="message"]')?.value || '').trim();
    var company = (form.querySelector('[name="company"]')?.value || '').trim();
    var consent = form.querySelector('[name="consent"]')?.checked || false;

    // Client-side validatsiya (server ham tekshiradi)
    if (name.length < 2) {
      showMessage(msgs.errorName, false);
      return;
    }
    if (phone.replace(/\D/g, '').length < 7) {
      showMessage(msgs.errorPhone, false);
      return;
    }
    if (!consent) {
      showMessage(msgs.errorConsent, false);
      return;
    }

    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
    }

    fetch('api/contact.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name:    name,
        phone:   phone,
        email:   email,
        message: message,
        company: company,
        consent: '1',
        lang:    lang,
        website: '', // honeypot — har doim bo'm-bo'sh
      }),
    })
      .then(function (resp) { return resp.json().then(function (data) { return { status: resp.status, data: data }; }); })
      .then(function (r) {
        if (r.status === 429) {
          showMessage(msgs.errorRate, false);
        } else if (r.data.success) {
          showMessage(r.data.message, true);
          form.reset();
        } else {
          showMessage(r.data.message || msgs.errorServer, false);
        }
      })
      .catch(function () {
        showMessage(msgs.errorServer, false);
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
        }
      });
  }, true); // true = capture phase
})();
