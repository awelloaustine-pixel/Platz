// Renders the stills that Lite visitors see, from the real 3D scene.
//
// Run again whenever the scene or the chapter shots change:
//   npm install --no-save playwright-core
//   npm run build && npm run start -- -p 3100     (in another terminal)
//   node scripts/capture-posters.mjs
//   npm run build                                 (so the new files are served)
//
// Needs Chrome installed, and a real GPU gives far better results than software rendering.
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const BASE = process.env.POSTER_BASE ?? 'http://localhost:3100';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'posters');
mkdirSync(out, { recursive: true });

const HOME = ['arrival', 'problem', 'system', 'how', 'who', 'proof', 'begin'];
const shots = [
  ...HOME.map((id) => ({ name: `home-${id}`, route: '/', section: id })),
  { name: 'websites', route: '/websites', section: 'features' },
  { name: 'automations', route: '/automations', section: 'network' },
  { name: 'ai-visibility', route: '/ai-visibility', section: 'hero' },
  { name: 'pricing', route: '/pricing', section: 'bundle' },
  { name: 'about', route: '/about', section: 'hero' },
  { name: 'contact', route: '/contact', section: 'hero' },
];
const sizes = [
  { suffix: 'd', width: 1280, height: 720, quality: 0.62 },
  { suffix: 'm', width: 540, height: 960, quality: 0.5 },
];
// Only the scene remains: the page's own shade still sits over the still when it is used.
const HIDE = 'main, header, aside, .whatsapp-button, .cursor-ring, .scene-shade, .loader, .fixed.top-\\[30vh\\] { visibility: hidden !important; }';

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const encoder = await browser.newPage();
let total = 0;

for (const size of sizes) {
  for (const { name, route, section } of shots) {
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height } });
    const page = await context.newPage();
    await page.goto(`${BASE}${route}?quality=high`);
    await page.waitForSelector('canvas', { timeout: 60000 });
    await page.addStyleTag({ content: HIDE });
    await page.waitForTimeout(3000);
    await page.evaluate((id) => window.scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY + 2), section);
    await page.waitForTimeout(6000);
    const png = await page.screenshot({ type: 'png', timeout: 90000 });
    await context.close();

    const dataUrl = await encoder.evaluate(
      async ({ source, quality }) => {
        const image = new Image();
        image.src = source;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext('2d').drawImage(image, 0, 0);
        return canvas.toDataURL('image/webp', quality);
      },
      { source: `data:image/png;base64,${png.toString('base64')}`, quality: size.quality },
    );
    const file = join(out, `${name}-${size.suffix}.webp`);
    writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
    const kb = Math.round(statSync(file).size / 1024);
    total += kb;
    console.log(`${name}-${size.suffix}.webp ${kb}KB`);
  }
}

await browser.close();
console.log(`Total ${total}KB`);
