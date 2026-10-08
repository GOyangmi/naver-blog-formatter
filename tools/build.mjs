import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { content, domain, email } from './content.mjs';
import { contentPolicy } from './security.mjs';
import { preparePublish } from './publish.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const styleVersion = createHash('sha256').update(await readFile(`${root}assets/styles.css`)).digest('hex').slice(0, 16);
const origin = `https://${domain}`;
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const paths = { ko: 'index.html', en: 'en.html' };
const privacyPaths = { ko: 'privacy.html', en: 'privacy-en.html' };

function shell(lang, body, { privacy = false, missing = false } = {}) {
  const t = content[lang];
  const other = lang === 'ko' ? 'en' : 'ko';
  const page = privacy ? privacyPaths[lang] : paths[lang];
  const canonical = `${origin}/${page === 'index.html' ? '' : page}`;
  const title = privacy ? `${t.privacyTitle} | Subpath Laboratory` : missing ? '404 | Subpath Laboratory' : t.title;
  const alternate = privacy ? privacyPaths : paths;
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="${escape(contentPolicy)}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(t.description)}">
  ${missing ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="ko" href="${origin}/${alternate.ko === 'index.html' ? '' : alternate.ko}">
  <link rel="alternate" hreflang="en" href="${origin}/${alternate.en}">
  <link rel="alternate" hreflang="x-default" href="${origin}/${alternate.ko === 'index.html' ? '' : alternate.ko}">`}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Subpath Laboratory">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(t.description)}">
  <meta property="og:url" content="${canonical}">
  <meta name="theme-color" content="#ffffff">
  <link rel="stylesheet" href="${missing ? '/' : './'}assets/styles.css?v=${styleVersion}">
</head>
<body>
  <a class="skip-link" href="#main">${t.skip}</a>
  <header class="header wrap">
    <a class="wordmark" href="${missing ? '/' : './'}${paths[lang]}" aria-label="Subpath Laboratory home">Subpath Laboratory<span class="brand-dot" aria-hidden="true"></span></a>
    <nav aria-label="${lang === 'ko' ? '주요 메뉴' : 'Main navigation'}">
      <a href="${missing ? '/' : './'}${paths[lang]}#projects">${t.nav[0]}</a>
      <a href="${missing ? '/' : './'}${paths[lang]}#about">${t.nav[1]}</a>
      <a href="${missing ? '/' : './'}${paths[lang]}#contact">${t.nav[2]}</a>
      <a class="language" href="${missing ? '/' : './'}${alternate[other]}" lang="${other}" hreflang="${other}">${other === 'en' ? 'EN' : 'KO'}</a>
    </nav>
  </header>
  ${body}
  <footer class="footer wrap">
    <p>&copy; 2026 Subpath Laboratory</p>
    <a href="${missing ? '/' : './'}${privacyPaths[lang]}">${t.privacy}</a>
  </footer>
</body>
</html>
`;
}

function projectText(project, t, url) {
  return `<div class="project-copy">
    <div class="project-meta"><span>${project.category}</span><span class="status">${t.status}</span></div>
    <h3>${project.name}${project.subtitle ? `<small>${project.subtitle}</small>` : ''}</h3>
    <p class="project-description">${project.description}</p>
    <ul>${project.features.map((feature) => `<li>${feature}</li>`).join('')}</ul>
${project.note ? `    <p class="note">${project.note}</p>` : ''}
    <a class="text-link" href="${url}">${project.link}<span aria-hidden="true"> ↗</span></a>
  </div>`;
}

function home(lang) {
  const t = content[lang];
  return shell(lang, `<main id="main" class="wrap">
    <section class="intro" aria-labelledby="company-title">
      <h1 id="company-title">Subpath Laboratory</h1>
      <p class="intro-line">${t.intro}</p>
    </section>
    <section id="projects" class="projects" aria-labelledby="projects-title">
      <h2 id="projects-title">${t.projects}</h2>
      <div class="project-grid">
        <article class="project" aria-labelledby="app-title">
          <figure>
            <div class="app-screens">
              <a href="./assets/products/byeongyeokfit-home.png" aria-label="${t.app.homeAlt}"><img src="./assets/products/byeongyeokfit-home.png" width="1320" height="2868" alt="${t.app.homeAlt}" fetchpriority="high"></a>
              <a href="./assets/products/byeongyeokfit-calendar.png" aria-label="${t.app.calendarAlt}"><img src="./assets/products/byeongyeokfit-calendar.png" width="1320" height="2868" alt="${t.app.calendarAlt}"></a>
            </div>
            <figcaption>${t.app.caption}</figcaption>
          </figure>
          ${projectText(t.app, t, 'https://byeongyeokfit.com/').replace('<h3>', '<h3 id="app-title">')}
        </article>
        <article class="project" aria-labelledby="game-title">
          <figure>
            <a class="game-screen" href="./assets/products/freeze-tag-gameplay.webp"><img src="./assets/products/freeze-tag-gameplay.webp" width="1280" height="720" alt="${t.game.alt}"></a>
            <figcaption>${t.game.caption}</figcaption>
          </figure>
          ${projectText(t.game, t, 'https://superjumpchallenger.com/').replace('<h3>', '<h3 id="game-title">')}
        </article>
      </div>
    </section>
    <section id="about" class="about info-row" aria-labelledby="about-title">
      <h2 id="about-title">${t.aboutTitle}</h2>
      <div><p>${t.about}</p></div>
    </section>
    <section id="contact" class="contact info-row" aria-labelledby="contact-title">
      <h2 id="contact-title">${t.contactTitle}</h2>
      <div><p>${t.contact}</p><a class="contact-email" href="mailto:${email}">${email}</a></div>
    </section>
  </main>`);
}

function privacy(lang) {
  const t = content[lang];
  return shell(lang, `<main id="main" class="wrap document">
    <h1>${t.privacyTitle}</h1>
    <p>${t.privacyIntro}</p>
    ${t.privacySections.map(([title, text]) => `<section><h2>${title}</h2><p>${text}</p></section>`).join('\n')}
    <section id="content-use"><h2>${t.contentTitle}</h2><p>${t.contentUse}</p><p>${t.contentRights}</p></section>
    <p><a href="mailto:${email}">${email}</a></p>
    <p><a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub Privacy Statement</a></p>
    <p><a href="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy Policy</a></p>
    <a class="text-link" href="./${paths[lang]}">${t.back}</a>
  </main>`, { privacy: true });
}

await mkdir(root, { recursive: true });
for (const lang of ['ko', 'en']) {
  await writeFile(`${root}${paths[lang]}`, home(lang));
  await writeFile(`${root}${privacyPaths[lang]}`, privacy(lang));
}
await writeFile(`${root}404.html`, shell('ko', `<main id="main" class="wrap document"><p class="eyebrow">404</p><h1>${content.ko.notFound}</h1><p>${content.ko.notFoundBody}</p><a class="text-link" href="/">${content.ko.back}</a><p lang="en">${content.en.notFoundBody}</p></main>`, { missing: true }));
await writeFile(`${root}CNAME`, `${domain}\n`);
await writeFile(`${root}robots.txt`, `# Search indexing and AI-assisted information retrieval are allowed.\n# Content use: ${origin}/privacy-en.html#content-use\nUser-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(`${root}sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', 'en.html', 'privacy.html', 'privacy-en.html'].map((path) => `  <url><loc>${origin}/${path}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Built 5 pages for ${origin}`);
await preparePublish(root, `${root}docs`);
console.log('Prepared allowlisted GitHub Pages /docs output');
