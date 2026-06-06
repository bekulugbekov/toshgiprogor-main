/*
  Korporativ boshqaruv — mahalliy hujjatlar ko'rsatkichi (uzex.uz uslubida).
  Manba: window.CORP_DOCS (assets/js/corporate-docs.js).
  Tashqi API yo'q — Xitoy auditoriyasi uchun tez va ishonchli.
*/
(function () {
  "use strict";

  var ROMAN = ["I", "II", "III", "IV"];

  function getLang() {
    var l = localStorage.getItem("selectedLanguage") || "ru";
    return ["uz", "ru", "en", "zh"].indexOf(l) >= 0 ? l : "ru";
  }

  // UI matnlari (4 til)
  var UI = {
    download: { uz: "Yuklab olish", ru: "Скачать", en: "Download", zh: "下载" },
    empty: {
      uz: "Bu bo'limda hozircha hujjat yo'q.",
      ru: "В этом разделе пока нет документов.",
      en: "No documents in this section yet.",
      zh: "本节暂无文件。",
    },
    yearLabel: { uz: "yil", ru: "год", en: "", zh: "年" },
  };

  // Hujjat sarlavhasini 4 tilda generatsiya qilish
  function docTitle(doc, lang) {
    var y = doc.year;
    switch (doc.kind) {
      case "charter":
        return {
          uz: "«TASHGIPROGOR» AJ ustavi",
          ru: "Устав АО «TASHGIPROGOR»",
          en: "Charter of JSC TASHGIPROGOR",
          zh: "TASHGIPROGOR 股份公司章程",
        }[lang];
      case "business-plan":
        return {
          uz: y + "-yilgi biznes-reja",
          ru: "Бизнес-план на " + y + " год",
          en: "Business plan for " + y,
          zh: y + "年度商业计划",
        }[lang];
      case "report-annual":
        return {
          uz: y + "-yil yillik hisoboti",
          ru: "Годовой отчёт за " + y + " год",
          en: "Annual report " + y,
          zh: y + "年度报告",
        }[lang];
      case "report-quarter":
        var r = ROMAN[doc.q - 1] || doc.q;
        return {
          uz: y + "-yil " + doc.q + "-chorak hisoboti",
          ru: "Отчёт за " + r + " квартал " + y + " года",
          en: "Q" + doc.q + " " + y + " quarterly report",
          zh: y + "年第" + doc.q + "季度报告",
        }[lang];
      case "audit":
        return {
          uz: y + "-yil auditorlik xulosasi",
          ru: "Аудиторское заключение за " + y + " год",
          en: "Audit report " + y,
          zh: y + "年审计报告",
        }[lang];
      case "fact":
        var lbl = doc.date || y;
        return {
          uz: "№" + doc.num + " muhim fakt (" + lbl + ")",
          ru: "Существенный факт №" + doc.num + " (" + lbl + ")",
          en: "Material fact No." + doc.num + " (" + lbl + ")",
          zh: "重大事实 第" + doc.num + "号 (" + lbl + ")",
        }[lang];
      default:
        return doc.file.split("/").pop();
    }
  }

  // Bayt → "644 Kb" / "1.6 Mb"
  function fmtSize(bytes) {
    if (!bytes) return "";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " Mb";
    return Math.round(bytes / 1024) + " Kb";
  }

  function catIcon(name) {
    var map = {
      landmark: "la-landmark",
      briefcase: "la-briefcase",
      chart: "la-chart-line",
      certificate: "la-certificate",
      info: "la-info-circle",
      file: "la-folder",
    };
    return '<i class="las ' + (map[name] || map.file) + '"></i>';
  }

  function extClass(ext) {
    if (ext === "pdf") return "is-pdf";
    if (ext === "doc" || ext === "docx") return "is-doc";
    if (ext === "xls" || ext === "xlsx") return "is-xls";
    return "is-file";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Bitta hujjat qatori
  function renderDocRow(doc, lang) {
    var title = escapeHtml(docTitle(doc, lang));
    var href = encodeURI(doc.file);
    var badge = doc.ext.toUpperCase();
    var size = fmtSize(doc.size);
    var dl = UI.download[lang];
    return (
      '<a class="corp-doc" href="' +
      href +
      '" target="_blank" rel="noopener noreferrer" title="' +
      escapeHtml(dl) +
      '">' +
      '<span class="corp-doc-name">' +
      '<i class="las la-file-' +
      (doc.ext === "pdf" ? "pdf" : doc.ext.indexOf("xls") === 0 ? "excel" : "word") +
      ' corp-doc-ic"></i>' +
      title +
      "</span>" +
      '<span class="corp-doc-meta ' +
      extClass(doc.ext) +
      '">' +
      badge +
      (size ? ' <span class="corp-doc-size">(' + size + ")</span>" : "") +
      '<i class="las la-download corp-dl-ic"></i>' +
      "</span>" +
      "</a>"
    );
  }

  // Toifa hujjatlari (kerak bo'lsa yil bo'yicha guruhlash)
  function renderDocs(cat, lang) {
    if (!cat.docs || !cat.docs.length) {
      return '<p class="corp-empty">' + UI.empty[lang] + "</p>";
    }
    if (!cat.grouped) {
      return cat.docs.map(function (d) { return renderDocRow(d, lang); }).join("");
    }
    // Yil bo'yicha guruhlash (tartibi data'dagidek — yangi yil birinchi)
    var order = [];
    var groups = {};
    cat.docs.forEach(function (d) {
      var y = d.year;
      if (!groups[y]) {
        groups[y] = [];
        order.push(y);
      }
      groups[y].push(d);
    });
    return order
      .map(function (y) {
        return (
          '<div class="corp-year">' +
          '<h4 class="corp-year-title">' +
          y +
          "</h4>" +
          groups[y].map(function (d) { return renderDocRow(d, lang); }).join("") +
          "</div>"
        );
      })
      .join("");
  }

  var activeId = null;

  function render() {
    var root = window.CORP_DOCS;
    if (!root || !root.categories) return;
    var lang = getLang();
    var cats = root.categories;

    if (!activeId || !cats.some(function (c) { return c.id === activeId; })) {
      activeId = cats[0].id;
    }
    var active = cats.filter(function (c) { return c.id === activeId; })[0];

    // Sidebar
    var sidebar = document.getElementById("corp-categories");
    if (sidebar) {
      sidebar.innerHTML = cats
        .map(function (c) {
          return (
            '<button type="button" class="corp-cat' +
            (c.id === activeId ? " active" : "") +
            '" data-cat="' +
            c.id +
            '">' +
            catIcon(c.icon) +
            "<span>" +
            escapeHtml(c.label[lang]) +
            "</span></button>"
          );
        })
        .join("");
    }

    // Sarlavha + hujjatlar
    var titleEl = document.getElementById("corp-cat-title");
    if (titleEl) titleEl.textContent = active.label[lang];

    var docsEl = document.getElementById("corp-docs");
    if (docsEl) docsEl.innerHTML = renderDocs(active, lang);
  }

  function init() {
    var sidebar = document.getElementById("corp-categories");
    if (!sidebar) return; // sahifa boshqa

    sidebar.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-cat]");
      if (!btn) return;
      activeId = btn.getAttribute("data-cat");
      render();
      // Mobil: hujjatlar ko'rinishiga silliq o'tish
      var panel = document.getElementById("corp-panel");
      if (panel && window.innerWidth < 992) {
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
  // Til almashganda qayta render
  document.addEventListener("languageChanged", render);
})();
