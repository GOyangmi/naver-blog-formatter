import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { domain, email } from '../tools/content.mjs';

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
  assert.match(ko, /GitHub Pages는 보안을 위해 방문자의 IP 주소를 기록/);
  assert.match(en, /only to the Subpath Laboratory company website/);
  assert.match(en, /GitHub Pages logs visitor IP addresses/);
});

test('every page busts stale blog CSS caches with a content hash', async () => {
  const hash = createHash('sha256').update(await readFile(resolve(root, 'assets/styles.css'))).digest('hex').slice(0, 16);
  for (const page of pages) assert.ok((await read(page)).includes(`assets/styles.css?v=${hash}`));
});
