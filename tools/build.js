#!/usr/bin/env node
/**
 * 정적 페이지 생성기
 *
 *   node tools/build.js
 *
 * src/<이름>.html 의 본문을 읽어 공통 머리말·헤더·푸터를 씌운 뒤
 * 저장소 루트에 <이름>.html 로 씁니다. sitemap.xml, robots.txt, ads.txt 도
 * 함께 갱신합니다.
 *
 * 페이지를 추가하려면 tools/pages.js 에 항목을 넣고 src/ 에 본문 파일을 만드세요.
 * 루트의 .html 은 생성물이므로 직접 고치지 말고 src/ 를 고친 뒤 다시 실행하세요.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { SITE, NAV, FOOTER_NAV, PAGES } = require('./pages.js');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fullTitle(page) {
  return page.file === 'index.html'
    ? `${page.title} | ${SITE.name}`
    : `${page.title} | ${SITE.name}`;
}

function canonicalOf(page) {
  return page.canonical || `${SITE.url}/${page.file}`;
}

function renderHeader(page) {
  const links = NAV.map(item => {
    const current = item.file === page.file ? ' aria-current="page"' : '';
    return `<a href="${item.file}"${current}>${item.label}</a>`;
  }).join('');

  return `  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="index.html" aria-label="${escapeAttr(SITE.name)} 홈">
        <span class="brand-mark" aria-hidden="true">${SITE.mark}</span>
        <span><strong>${SITE.name}</strong><small>${SITE.tagline}</small></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">메뉴</button>
      <nav class="site-nav" id="site-nav" aria-label="주요 메뉴">${links}</nav>
    </div>
  </header>`;
}

function renderFooter() {
  const links = FOOTER_NAV.map(item => `        <a href="${item.file}">${item.label}</a>`).join('\n');

  return `  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <strong>${SITE.name}</strong>
        <p>입력한 글을 서버로 보내지 않고 브라우저 안에서만 처리합니다.</p>
      </div>
      <nav aria-label="하단 메뉴">
${links}
      </nav>
      <p class="copyright">© <span data-current-year>2026</span> ${SITE.tagline}. All rights reserved.</p>
    </div>
  </footer>`;
}

function renderPage(page, body) {
  const scripts = (page.scripts || []).map(src => `  <script src="${src}"></script>`).join('\n');
  // AdSense 게시자 스크립트는 정적으로 넣는다.
  // JS로 주입하면 HTML 소스에 남지 않아 소유권 확인 크롤러가 못 볼 수 있다.
  const adsScript = page.ads
    ? `\n  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}" crossorigin="anonymous"></script>`
    : '';
  const robots = page.noindex ? '\n  <meta name="robots" content="noindex" />' : '';
  const naver = SITE.naverVerification
    ? `\n  <meta name="naver-site-verification" content="${escapeAttr(SITE.naverVerification)}" />`
    : '';
  const title = fullTitle(page);

  return `<!doctype html>
<html lang="ko" data-adsense-eligible="${page.ads ? 'true' : 'false'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="google-adsense-account" content="${SITE.adsenseClient}" />
  <meta name="description" content="${escapeAttr(page.desc)}" />
  <meta name="theme-color" content="${SITE.themeColor}" />
  <meta property="og:type" content="${page.file === 'index.html' ? 'website' : 'article'}" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="og:site_name" content="${escapeAttr(SITE.name)}" />
  <meta property="og:title" content="${escapeAttr(title)}" />
  <meta property="og:description" content="${escapeAttr(page.desc)}" />
  <meta property="og:url" content="${canonicalOf(page)}" />
  <meta name="twitter:card" content="summary" />
  <link rel="canonical" href="${canonicalOf(page)}" />
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <link rel="manifest" href="manifest.webmanifest" />
  <link rel="stylesheet" href="assets/styles.css" />
  <title>${title}</title>${robots}${naver}
  <script defer src="assets/site.js"></script>${adsScript}
</head>
<body>
  <a class="skip-link" href="#main">본문으로 건너뛰기</a>
${renderHeader(page)}

  <main id="main">
${body.trimEnd()}
  </main>

${renderFooter()}
${scripts ? `\n${scripts}\n` : ''}</body>
</html>
`;
}

function buildSitemap() {
  const entries = PAGES
    .filter(page => page.sitemap !== false)
    .map(page => {
      const loc = page.file === 'index.html' ? `${SITE.url}/` : `${SITE.url}/${page.file}`;
      return `  <url><loc>${loc}</loc><lastmod>${SITE.updatedAt}</lastmod></url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`;
}

function buildAdsTxt() {
  const publisher = SITE.adsenseClient.replace(/^ca-/, '');
  return `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`;
}

function main() {
  const written = [];
  const missing = [];

  for (const page of PAGES) {
    const srcPath = path.join(SRC, page.file);
    if (!fs.existsSync(srcPath)) {
      missing.push(page.file);
      continue;
    }
    const body = fs.readFileSync(srcPath, 'utf8');
    fs.writeFileSync(path.join(ROOT, page.file), renderPage(page, body), 'utf8');
    written.push(page.file);
  }

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), buildRobots(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'ads.txt'), buildAdsTxt(), 'utf8');

  console.log(`페이지 ${written.length}개 생성 완료`);
  console.log(`  광고 로드: ${PAGES.filter(p => p.ads).length}개 / 광고 없음: ${PAGES.filter(p => !p.ads).length}개`);
  console.log('  sitemap.xml, robots.txt, ads.txt 갱신');
  if (missing.length) {
    console.error(`\n본문 파일이 없습니다: ${missing.join(', ')}`);
    console.error(`  src/ 아래에 만들어 주세요.`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { renderPage, buildSitemap, buildAdsTxt, buildRobots };
