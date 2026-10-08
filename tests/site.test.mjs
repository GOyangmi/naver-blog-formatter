import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { content, domain, email, publicName } from '../tools/content.mjs';
import { contentPolicy, responseHeaders } from '../tools/security.mjs';
import { listFiles, preparePublish, publicFiles } from '../tools/publish.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const pages = ['index.html', 'en.html', 'privacy.html', 'privacy-en.html', '404.html'];
const read = (name) => readFile(resolve(root, name), 'utf8');

test('both languages identify real products and pre-release status', async () => {
  for (const name of ['index.html', 'en.html']) {
    const html = await read(name);
    assert.match(html, /Subpath Laboratory/);
    assert.match(html, /Freeze Tag/);
    assert.match(html, /Penguins vs Seals/);
    assert.match(html, /href="https:\/\/byeongyeokfit.com\/"/);
    assert.match(html, /href="https:\/\/superjumpchallenger.com\/"/);
    assert.equal((html.match(/class="status"/g) ?? []).length, 2);
    assert.match(html, name === 'index.html' ? /출시 준비 중/ : /Preparing for release/);
    assert.doesNotMatch(html, /Plus|스테이지|HD.?2D|App Store|Google Play|다운로드|download now/i);
  }
});

test('generated pages contain no trackers, forms or legacy blog tools', async () => {
  for (const name of pages) {
    const html = await read(name);
    assert.doesNotMatch(html, /<script|<iframe|<form|adsbygoogle|googletagmanager|ca-pub-|localStorage|<input/i);
    assert.doesNotMatch(html, /블로거|블로그 안내|formatter|proofread|readability|guide-adsense/);
    assert.match(html, /href="mailto:jaesic@subpathlabo.com"|404/);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.match(html, /id="main"/);
    assert.doesNotMatch(html, /maximum-scale|user-scalable/);
  }
});

test('local assets, page links and fragment targets exist', async () => {
  for (const name of pages) {
    const html = await read(name);
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https:|mailto:)/.test(value)) continue;
      const [pathname, fragment] = value.split('#');
      const cleanPath = pathname.split('?')[0];
      const target = cleanPath ? resolve(root, cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\//, '')) : resolve(root, name);
      assert.ok(target.startsWith(root));
      assert.ok((await stat(target)).isFile(), `${name}: ${value}`);
      if (fragment) assert.ok((await readFile(target, 'utf8')).includes(`id="${fragment}"`), `${name}: ${value}`);
    }
    for (const image of html.matchAll(/<img\b[^>]+>/g)) {
      assert.match(image[0], /alt="[^"]+"/);
      assert.match(image[0], /width="\d+"/);
      assert.match(image[0], /height="\d+"/);
    }
  }
});

test('domain metadata and sitemap match Pages CNAME', async () => {
  assert.equal((await read('CNAME')).trim(), domain);
  for (const name of pages.filter((p) => p !== '404.html')) {
    const html = await read(name);
    assert.ok(html.includes(`rel="canonical" href="https://${domain}/`));
    assert.match(html, /hreflang="en"/);
    assert.match(html, /hreflang="ko"/);
  }
  const sitemap = await read('sitemap.xml');
  assert.equal((sitemap.match(/<loc>/g) ?? []).length, 4);
  assert.ok((await read('robots.txt')).includes(`https://${domain}/sitemap.xml`));
  assert.match(await read('404.html'), /name="robots" content="noindex"/);
});

test('the company website and business email share the same domain', async () => {
  assert.equal(domain, 'subpathlabo.com');
  assert.equal(email.split('@')[1], domain);
  for (const name of pages) {
    const html = await read(name);
    assert.doesNotMatch(html, /https:\/\/(?:www\.)?subpathlaboratory\.com/);
    assert.ok(html.includes(`property="og:url" content="https://${domain}/`));
  }
  assert.doesNotMatch(await read('sitemap.xml'), /subpathlaboratory\.com/);
});

test('old generated pages, advertising files and tool engines are removed', async () => {
  const rootFiles = await readdir(root);
  assert.deepEqual(rootFiles.filter((name) => name.endsWith('.html')).sort(), [...pages].sort());
  assert.ok(!rootFiles.includes('ads.txt'));
  const assets = await readdir(resolve(root, 'assets'));
  assert.deepEqual(assets.sort(), ['products', 'styles.css']);
  assert.ok(!rootFiles.includes('DNS-SETUP.txt'));
});

test('privacy copy is scoped to this website and names hosting IP logs', async () => {
  const ko = await read('privacy.html');
  const en = await read('privacy-en.html');
  assert.match(ko, /회사 소개 사이트에만 적용/);
  assert.match(ko, /GitHub Pages와 Cloudflare가 IP 주소/);
  assert.match(en, /only to the Subpath Laboratory company website/);
  assert.match(en, /GitHub Pages and Cloudflare process connection information, including IP addresses/);
});

test('the public operator name is jaesic and the introduction is minimal', async () => {
  assert.equal(publicName, 'jaesic');
  assert.equal(content.ko.about, 'Subpath Laboratory는 jaesic이 운영하는 1인 앱·게임 개발 스튜디오입니다.');
  assert.equal(content.en.about, 'Subpath Laboratory is a one-person app and game studio run by jaesic.');
  for (const lang of ['ko', 'en']) {
    assert.equal(content[lang].location, undefined);
    assert.equal(content[lang].aboutLegal, undefined);
    assert.ok((await read(lang === 'ko' ? 'index.html' : 'en.html')).includes(content[lang].about));
  }
  for (const page of pages) {
    assert.doesNotMatch(await read(page), /\uCD5C\uC7AC\uC11D|Jae(?:seok)|Seoul|서울|생활을 정리|작게 시작/i);
  }
});

test('all pages have a script-free CSP without pretending meta can block framing', async () => {
  for (const name of pages) {
    const html = await read(name);
    assert.ok(html.includes(`<meta http-equiv="Content-Security-Policy" content="${contentPolicy}">`));
    assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<link rel="stylesheet"'));
    assert.doesNotMatch(html, /<script\b|\son\w+\s*=|javascript:|<base\b/i);
  }
  assert.ok(contentPolicy.includes("default-src 'none'"));
  assert.ok(contentPolicy.includes("script-src 'none'"));
  assert.ok(contentPolicy.includes("form-action 'none'"));
  assert.ok(!contentPolicy.includes('frame-ancestors'));
  assert.ok(responseHeaders['Content-Security-Policy'].includes("frame-ancestors 'none'"));
  assert.equal(responseHeaders['X-Content-Type-Options'], 'nosniff');
});

test('crawling and AI retrieval are allowed without granting unrestricted reuse', async () => {
  const robots = await read('robots.txt');
  assert.match(robots, /User-agent: \*\nAllow: \/\n/);
  assert.doesNotMatch(robots, /Disallow:/);
  for (const name of ['index.html', 'en.html', 'privacy.html', 'privacy-en.html']) {
    assert.doesNotMatch(await read(name), /noindex|nofollow|noai|noimageai/i);
  }
  const ko = await read('privacy.html');
  const en = await read('privacy-en.html');
  assert.match(ko, /AI 기반 정보 조회·요약을 허용/);
  assert.match(ko, /법령이 허용하는 이용과 개별 라이선스/);
  assert.match(en, /Search indexing and AI-assisted retrieval and summarization/);
  assert.match(en, /Uses permitted by law and individual licenses remain unaffected/);
  assert.match(en, /Third-party materials/);
});

test('the deployed directory contains only the public allowlist with identical bytes', async () => {
  assert.deepEqual(await listFiles(resolve(root, 'docs')), [...publicFiles].sort());
  for (const file of publicFiles) {
    assert.deepEqual(await readFile(resolve(root, 'docs', file)), await readFile(resolve(root, file)), file);
    assert.doesNotMatch(file, /(?:^|\/)(?:tools|tests|\.git|\.env|\.backups|package\.json)(?:\/|$)/);
    if (/\.(html|css|txt|xml)$/.test(file)) {
      const text = await read(file);
      assert.doesNotMatch(text, /-----BEGIN [A-Z ]*PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}|sk-ant-[A-Za-z0-9_-]{20,}/);
    }
  }
});

test('publish refuses unknown output files and symlinks', async () => {
  const scratch = resolve(root, '.test-output');
  await mkdir(scratch, { recursive: true });
  const fixture = await mkdtemp(`${scratch}/publish-`);
  try {
    const unexpected = resolve(fixture, 'unexpected');
    await mkdir(unexpected);
    await writeFile(resolve(unexpected, '.env'), 'synthetic-do-not-publish');
    await assert.rejects(preparePublish(root, unexpected), /Unexpected publish files/);
    assert.equal(await readFile(resolve(unexpected, '.env'), 'utf8'), 'synthetic-do-not-publish');
    const linked = resolve(fixture, 'linked');
    await mkdir(linked);
    await symlink(resolve(root, 'index.html'), resolve(linked, 'index.html'));
    await assert.rejects(preparePublish(root, linked), /Non-regular publish entry/);
    const source = resolve(fixture, 'source');
    await mkdir(source);
    await symlink(resolve(root, '.nojekyll'), resolve(source, '.nojekyll'));
    await assert.rejects(preparePublish(source, resolve(fixture, 'output')), /Not a regular source file/);
  } finally {
    await rm(fixture, { recursive: true });
  }
});

test('every page busts stale blog CSS caches with a content hash', async () => {
  const hash = createHash('sha256').update(await readFile(resolve(root, 'assets/styles.css'))).digest('hex').slice(0, 16);
  for (const page of pages) assert.ok((await read(page)).includes(`assets/styles.css?v=${hash}`));
});
