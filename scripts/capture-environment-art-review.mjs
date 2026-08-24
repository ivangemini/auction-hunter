import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'release', 'screenshots', 'environment-review', 'generated');
const outputPath = path.join(outputRoot, 'p7-garage-collector-environments.png');
const previewUrl = 'http://127.0.0.1:4177';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

const ENVIRONMENTS = [
  { id: 'garage-17', label: 'Garage 17', family: 'GARAGE' },
  { id: 'garage-workshop', label: 'Garage Workshop', family: 'GARAGE' },
  { id: 'garage-market', label: 'Garage Market', family: 'GARAGE' },
  { id: 'collector-8', label: 'Collector 8', family: 'COLLECTOR' },
  { id: 'collector-vault', label: 'Collector Vault', family: 'COLLECTOR' },
  { id: 'collector-gallery', label: 'Collector Gallery', family: 'COLLECTOR' },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForPreview() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(previewUrl);
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Timed out waiting for environment-art review preview server');
}

async function validateSourceContracts() {
  for (const environment of ENVIRONMENTS) {
    const url = `${previewUrl}/assets/lots/${environment.id}.svg`;
    const response = await fetch(url);
    assert(response.ok, `${environment.id} review asset returned HTTP ${response.status}`);
    const source = await response.text();
    assert(
      /viewBox=["']\s*0\s+0\s+512\s+360\s*["']/i.test(source),
      `${environment.id} must preserve the 512x360 SVG viewBox contract`,
    );
    assert(!/<text\b/i.test(source), `${environment.id} must not embed interface/pseudo-text in environment art`);
  }
}

async function stopPreview(preview) {
  if (preview.exitCode !== null || preview.signalCode) return;
  const closed = new Promise((resolve) => preview.once('close', resolve));
  preview.kill('SIGTERM');
  const graceful = await Promise.race([
    closed.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 2_000)),
  ]);
  if (!graceful && preview.exitCode === null) {
    preview.kill('SIGKILL');
    await Promise.race([closed, new Promise((resolve) => setTimeout(resolve, 1_000))]);
  }
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4177'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
});

let previewLog = '';
preview.stdout.on('data', (chunk) => { previewLog += chunk.toString(); });
preview.stderr.on('data', (chunk) => { previewLog += chunk.toString(); });

try {
  await waitForPreview();
  await validateSourceContracts();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const cards = ENVIRONMENTS.map((environment, index) => `
      <article class="card">
        <div class="index">${String(index + 1).padStart(2, '0')}</div>
        <div class="family">${environment.family}</div>
        <img src="${previewUrl}/assets/lots/${environment.id}.svg" alt="${environment.id}">
        <div class="caption">${environment.label}</div>
      </article>
    `).join('');

    await page.setContent(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; width: 1280px; height: 720px; overflow: hidden; background: #0a0d11; color: #f5f0e4; font-family: Arial, sans-serif; }
            main { width: 1280px; height: 720px; padding: 24px 32px 28px; background: radial-gradient(circle at 50% 8%, #20262e 0, #0a0d11 62%); }
            header { height: 66px; display: flex; align-items: end; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid rgba(233,185,73,.24); }
            h1 { margin: 0 0 13px; font-size: 25px; letter-spacing: .03em; }
            .meta { margin-bottom: 15px; color: #929ba5; font-size: 12px; font-weight: 700; letter-spacing: .08em; }
            .grid { height: 586px; display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr); gap: 14px; }
            .card { position: relative; overflow: hidden; border: 1px solid rgba(233,185,73,.24); background: #11161c; box-shadow: 0 10px 22px rgba(0,0,0,.36); }
            img { width: 100%; height: 100%; object-fit: cover; display: block; }
            .card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 58%, rgba(5,8,11,.92) 100%); pointer-events: none; }
            .index { position: absolute; z-index: 2; top: 10px; left: 10px; width: 31px; height: 24px; line-height: 22px; text-align: center; font-size: 10px; font-weight: 700; color: #d8aa51; background: rgba(12,16,21,.84); border: 1px solid rgba(233,185,73,.34); }
            .family { position: absolute; z-index: 2; top: 11px; right: 12px; color: #e4d6b8; font-size: 10px; font-weight: 700; letter-spacing: .12em; text-shadow: 0 1px 3px #000; }
            .caption { position: absolute; z-index: 2; left: 14px; right: 14px; bottom: 12px; font-size: 13px; font-weight: 700; letter-spacing: .02em; }
          </style>
        </head>
        <body>
          <main>
            <header><h1>P7 · Garage + Collector Environment Fidelity</h1><div class="meta">6 SEMANTIC IDS · 512×360 SVG · NO EMBEDDED TEXT</div></header>
            <section class="grid">${cards}</section>
          </main>
        </body>
      </html>`, { waitUntil: 'load' });

    await page.waitForFunction((count) => {
      const images = [...document.images];
      return images.length === count && images.every((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
    }, ENVIRONMENTS.length);

    const decoded = await page.evaluate(() => [...document.images].map((image) => ({
      src: image.getAttribute('src'),
      width: image.naturalWidth,
      height: image.naturalHeight,
    })));
    assert(decoded.length === ENVIRONMENTS.length, `Expected ${ENVIRONMENTS.length} environment images, got ${decoded.length}`);
    for (const image of decoded) {
      assert(image.width > 0 && image.height > 0, `${image.src} did not decode to a visible browser image`);
    }

    const screenshot = await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    assert(screenshot.length > 100_000, `Environment review screenshot looks unexpectedly small (${screenshot.length} bytes)`);
    assert(screenshot.subarray(12, 16).toString('ascii') === 'IHDR', 'Environment review output is not a PNG');
    assert(screenshot.readUInt32BE(16) === 1280 && screenshot.readUInt32BE(20) === 720, 'Environment review must be 1280x720');
    await page.close();
  } finally {
    await browser.close();
  }
} catch (error) {
  console.error(previewLog);
  throw error;
} finally {
  await stopPreview(preview);
}

console.log(path.relative(root, outputPath).split(path.sep).join('/'));
console.log('P7 Garage/Collector environment visual review capture OK');
