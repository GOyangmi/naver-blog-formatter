import { copyFile, lstat, mkdir, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export const publicFiles = [
  '.nojekyll', 'CNAME', 'index.html', 'en.html', 'privacy.html', 'privacy-en.html',
  '404.html', 'robots.txt', 'sitemap.xml', 'assets/styles.css',
  'assets/products/byeongyeokfit-home.png',
  'assets/products/byeongyeokfit-calendar.png',
  'assets/products/freeze-tag-gameplay.webp',
];

export async function listFiles(root, relative = '') {
  const directory = resolve(root, relative);
  if (!(await lstat(directory)).isDirectory()) throw new Error(`Not a regular directory: ${relative || '.'}`);
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) result.push(...await listFiles(root, path));
    else if (entry.isFile()) result.push(path);
    else throw new Error(`Non-regular publish entry: ${path}`);
  }
  return result.sort();
}

export async function preparePublish(root, destination) {
  await mkdir(destination, { recursive: true });
  const unexpected = (await listFiles(destination)).filter((file) => !publicFiles.includes(file));
  if (unexpected.length) throw new Error(`Unexpected publish files: ${unexpected.join(', ')}`);
  // Refuse unknown files and symlinks instead of silently deleting or publishing them.
  for (const path of publicFiles) {
    const source = resolve(root, path);
    const parts = path.split('/');
    for (let depth = 0; depth < parts.length - 1; depth++) {
      const parent = resolve(root, ...parts.slice(0, depth + 1));
      if (!(await lstat(parent)).isDirectory()) throw new Error(`Not a regular source directory: ${path}`);
    }
    if (!(await lstat(source)).isFile()) throw new Error(`Not a regular source file: ${path}`);
    await mkdir(dirname(resolve(destination, path)), { recursive: true });
    await copyFile(source, resolve(destination, path));
  }
}
