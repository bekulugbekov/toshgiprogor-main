#!/usr/bin/env node
// E4 Pre-render script
// Runs AFTER `vite build`. Reads dist/*.html, generates per-language copies,
// injects SEO tags, replaces data-translate content, writes sitemap + robots.txt.

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const LANG_DIR = resolve(ROOT, 'assets', 'lang');

// Load SEO config
const { SITE_URL, ORG, LANGS, PAGES } = await import('./seo-config.js');

// Load all translation JSON files
const translations = {};
for (const lang of Object.keys(LANGS)) {
  const jsonPath = resolve(LANG_DIR, `${lang}.json`);
  translations[lang] = JSON.parse(readFileSync(jsonPath, 'utf8'));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function replaceDataTranslate(html, t) {
  // Replace text content of elements with data-translate="key".
  // Uses backreference \2 so <h1> only matches </h1>, <a> only matches </a>.
  // <\/\2\s*> handles split closing tags like </a\n  > in Prettier-formatted HTML.
  return html.replace(
    /(<([a-zA-Z][a-zA-Z0-9]*)[^>]*?\sdata-translate="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2\s*>)/g,
    (match, openTag, _tagName, key, _content, closeTag) => {
      const val = t[key];
      return val !== undefined ? openTag + val + closeTag : match;
    }
  );
}

function setHtmlLang(html, htmlLang) {
  return html.replace(/(<html\b[^>]*?\s)lang="[^"]*"/, `$1lang="${htmlLang}"`);
}

function setTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildHeadTags(pageKey, lang, pageUrl) {
  const page = PAGES[pageKey];
  const langCfg = LANGS[lang];
  const t = translations[lang];
  const title = page.title[lang];
  const desc = page.description[lang];
  const orgName = ORG.name[lang];

  // hreflang alternates for this page
  const hreflangTags = Object.entries(LANGS).map(([l, cfg]) => {
    const alt = cfg.urlPrefix
      ? `${SITE_URL}${cfg.urlPrefix}/${page.slug || 'index.html'}`.replace(/\/+$/, '/')
      : `${SITE_URL}/${page.slug}`;
    return `  <link rel="alternate" hreflang="${cfg.hreflang}" href="${alt}">`;
  });
  hreflangTags.push(
    `  <link rel="alternate" hreflang="x-default" href="${SITE_URL}/${page.slug}">`
  );

  // Canonical URL
  const canonicalTag = `  <link rel="canonical" href="${pageUrl}">`;

  // Open Graph
  const ogTags = [
    `  <meta property="og:type" content="website">`,
    `  <meta property="og:url" content="${pageUrl}">`,
    `  <meta property="og:title" content="${escapeHtml(title)}">`,
    `  <meta property="og:description" content="${escapeHtml(desc)}">`,
    `  <meta property="og:image" content="${ORG.image}">`,
    `  <meta property="og:locale" content="${langCfg.locale}">`,
    `  <meta property="og:site_name" content="${orgName}">`,
  ].join('\n');

  // Twitter Card
  const twitterTags = [
    `  <meta name="twitter:card" content="summary_large_image">`,
    `  <meta name="twitter:title" content="${escapeHtml(title)}">`,
    `  <meta name="twitter:description" content="${escapeHtml(desc)}">`,
    `  <meta name="twitter:image" content="${ORG.image}">`,
  ].join('\n');

  // Meta description + robots
  const metaTags = [
    `  <meta name="description" content="${escapeHtml(desc)}">`,
    `  <meta name="robots" content="index, follow">`,
    // Baidu: explicit verification placeholder (client adds actual code via Baidu Webmaster)
    // `  <meta name="baidu-site-verification" content="BUYURTMACHIDAN_TASDIQ_KERAK">`,
  ].join('\n');

  // JSON-LD — Organization + LocalBusiness
  const addr = ORG.address[lang];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'LocalBusiness'],
        '@id': SITE_URL + '/#organization',
        name: orgName,
        url: SITE_URL,
        foundingDate: ORG.foundingDate,
        image: ORG.image,
        address: {
          '@type': 'PostalAddress',
          streetAddress: addr.street,
          addressLocality: addr.city,
          addressRegion: addr.region,
          postalCode: addr.postalCode,
          addressCountry: addr.country,
        },
        // telephone and email omitted — requires client confirmation (TZ §3)
        sameAs: [SITE_URL],
      },
    ],
  };

  const jsonLdTag = `  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`;

  return [metaTags, canonicalTag, hreflangTags.join('\n'), ogTags, twitterTags, jsonLdTag].join('\n');
}

function injectHeadTags(html, tags) {
  // Insert before </head>
  return html.replace('</head>', tags + '\n</head>');
}

// For subdirectory pages: fix relative asset paths → absolute
function fixAssetPaths(html) {
  // src="assets/ → src="/assets/
  html = html.replace(/\ssrc="assets\//g, ' src="/assets/');
  // href="assets/ → href="/assets/
  html = html.replace(/\shref="assets\//g, ' href="/assets/');
  // Also fix translate.js lang fetch path if inline
  return html;
}

// ─── Main ────────────────────────────────────────────────────────────────────

const pageKeys = Object.keys(PAGES);

for (const pageKey of pageKeys) {
  const page = PAGES[pageKey];
  const srcFile = resolve(DIST, page.file);

  if (!existsSync(srcFile)) {
    console.warn(`[pre-render] WARNING: ${srcFile} not found, skipping.`);
    continue;
  }

  const srcHtml = readFileSync(srcFile, 'utf8');

  for (const lang of Object.keys(LANGS)) {
    const langCfg = LANGS[lang];
    const t = translations[lang];
    const isRoot = lang === 'ru';

    // Determine output path and page URL
    let outPath, pageUrl;
    if (isRoot) {
      outPath = resolve(DIST, page.file);
      pageUrl = page.slug ? `${SITE_URL}/${page.slug}` : `${SITE_URL}/`;
    } else {
      const langDir = resolve(DIST, lang);
      mkdirSync(langDir, { recursive: true });
      outPath = resolve(langDir, page.file);
      const slugPart = page.slug || 'index.html';
      pageUrl = `${SITE_URL}${langCfg.urlPrefix}/${slugPart}`;
    }

    let html = srcHtml;

    // 1. Replace data-translate content
    html = replaceDataTranslate(html, t);

    // 2. Set <html lang>
    html = setHtmlLang(html, langCfg.htmlLang);

    // 3. Set <title>
    html = setTitle(html, page.title[lang]);

    // 4. Inject SEO head tags
    const headTags = buildHeadTags(pageKey, lang, pageUrl);
    html = injectHeadTags(html, headTags);

    // 5. Fix relative asset paths for subdirectory pages
    if (!isRoot) {
      html = fixAssetPaths(html);
    }

    // 6. Write output
    writeFileSync(outPath, html, 'utf8');
    console.log(`[pre-render] ${lang}: ${outPath.replace(DIST, '')}`);
  }
}

// ─── Copy lang JSON files to dist (for runtime translate.js) ────────────────

const distLangDir = resolve(DIST, 'assets', 'lang');
mkdirSync(distLangDir, { recursive: true });
for (const lang of Object.keys(LANGS)) {
  copyFileSync(resolve(LANG_DIR, `${lang}.json`), resolve(distLangDir, `${lang}.json`));
}
console.log('[pre-render] Copied lang JSON files to dist/assets/lang/');

// ─── sitemap.xml ─────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];
const sitemapUrls = [];

for (const pageKey of pageKeys) {
  const page = PAGES[pageKey];
  // Skip blog-details — dynamic content, no fixed URL
  if (pageKey === 'blog-details') continue;

  for (const [lang, langCfg] of Object.entries(LANGS)) {
    const slugPart = page.slug || 'index.html';
    const loc = lang === 'ru'
      ? (page.slug ? `${SITE_URL}/${page.slug}` : `${SITE_URL}/`)
      : `${SITE_URL}${langCfg.urlPrefix}/${slugPart}`;

    // Hreflang alternates for sitemap xhtml
    const alternates = Object.entries(LANGS).map(([l, cfg]) => {
      const altSlug = page.slug || 'index.html';
      const altLoc = l === 'ru'
        ? (page.slug ? `${SITE_URL}/${page.slug}` : `${SITE_URL}/`)
        : `${SITE_URL}${cfg.urlPrefix}/${altSlug}`;
      return `    <xhtml:link rel="alternate" hreflang="${cfg.hreflang}" href="${altLoc}"/>`;
    });
    alternates.push(
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${page.slug ? SITE_URL + '/' + page.slug : SITE_URL + '/'}"/>`
    );

    // Priority: index = 1.0, others = 0.8
    const priority = pageKey === 'index' ? '1.0' : '0.8';
    // changefreq: index weekly, blog weekly, others monthly
    const changefreq = (pageKey === 'index' || pageKey === 'blog') ? 'weekly' : 'monthly';

    sitemapUrls.push(`  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates.join('\n')}
  </url>`);
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls.join('\n')}
</urlset>`;

writeFileSync(resolve(DIST, 'sitemap.xml'), sitemap, 'utf8');
console.log('[pre-render] sitemap.xml written');

// ─── robots.txt ──────────────────────────────────────────────────────────────

const robots = `User-agent: *
Allow: /

# Baidu Spider
User-agent: Baiduspider
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeFileSync(resolve(DIST, 'robots.txt'), robots, 'utf8');
console.log('[pre-render] robots.txt written');

// ─── 404.html ─────────────────────────────────────────────────────────────────

const src404 = resolve(ROOT, '404.html');
if (existsSync(src404)) {
  copyFileSync(src404, resolve(DIST, '404.html'));
  for (const lang of Object.keys(LANGS)) {
    if (lang === 'ru') continue;
    const langDir = resolve(DIST, lang);
    mkdirSync(langDir, { recursive: true });
    copyFileSync(src404, resolve(langDir, '404.html'));
  }
  console.log('[pre-render] 404.html copied to all language dirs');
}

// ─── .htaccess for Apache 404 routing ─────────────────────────────────────────

const htaccess = `# Custom 404 page
ErrorDocument 404 /404.html

# Pretty URLs for language subdirectories
Options -Indexes

# Force HTTPS (enable when SSL is configured)
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
`;

writeFileSync(resolve(DIST, '.htaccess'), htaccess, 'utf8');
console.log('[pre-render] .htaccess written');

console.log('[pre-render] E4 complete.');
