// Enforces the "≤ 200KB gzipped before 3D" budget against a production build.
// Counts every script referenced by each pre-rendered page's HTML, which is what
// a visitor downloads before the lazily imported 3D chunks.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 200;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index', 'websites', 'automations', 'ai-visibility', 'pricing', 'about', 'contact'];

const kb = (bytes) => (bytes / 1024).toFixed(1);
const gzipSize = (file) => gzipSync(readFileSync(file)).length;

let failed = false;
for (const page of pages) {
  const htmlPath = join(root, '.next', 'server', 'app', `${page}.html`);
  if (!existsSync(htmlPath)) {
    console.error(`${page}: no pre-rendered HTML at ${htmlPath}. Run npm run build first.`);
    failed = true;
    continue;
  }
  const html = readFileSync(htmlPath, 'utf8');
  // noModule polyfills are skipped by every browser that can run the site's modules.
  const scripts = new Set(
    [...html.matchAll(/<script\b[^>]*>/g)]
      .filter(([tag]) => !/nomodule/i.test(tag))
      .map(([tag]) => tag.match(/src="\/_next\/(static\/[^"?]+\.js)/)?.[1])
      .filter(Boolean),
  );
  let total = 0;
  for (const script of scripts) total += gzipSize(join(root, '.next', decodeURIComponent(script)));

  const within = total <= BUDGET_KB * 1024;
  failed ||= !within;
  console.log(`${within ? 'ok  ' : 'OVER'} /${page === 'index' ? '' : page}: ${kb(total)}KB gz JS in ${scripts.size} files`);
}

console.log(`Budget: ${BUDGET_KB}KB gz before 3D.`);
process.exit(failed ? 1 : 0);
