import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'release', 'screenshots', 'item-review', 'generated');
const previewUrl = 'http://127.0.0.1:4176';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

const REVIEW_BATCHES = [
  {
    id: '01',
    items: [
      'toolbox', 'toy-robot', 'film-camera', 'pocket-watch', 'porcelain-figurine',
      'arcade-handheld', 'clockwork-automaton', 'art-deco-lamp', 'master-study',
    ],
  },
  {
    id: '02',
    items: [
      'cassette-player', 'vinyl-box', 'brass-clock', 'telescope', 'signed-poster',
      'silver-ring', 'mini-console', 'chronograph-watch', 'first-edition-book',
    ],
  },
  {
    id: '03',
    items: [
      'prototype-toy', 'multimeter', 'portable-radio', 'comic-stack', 'tin-car',
      'travel-clock', 'instant-camera', 'binoculars', 'gallery-print',
    ],
  },
  {
    id: '04',
    items: [
      'enamel-brooch', 'military-watch', 'preproduction-figure', 'soldering-station', 'pocket-tv',
      'model-train', 'manual-typewriter', 'fountain-pen', 'signed-vinyl',
    ],
  },
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
  throw new Error('Timed out waiting for item-art review preview server');
}

async function validateSourceContracts(itemIds) {
  for (const id of itemIds) {
    const url = `${previewUrl}/assets/items/${id}.svg`;
    const response = await fetch(url);
    assert(response.ok, `${id} review asset returned HTTP ${response.status}`);
    const source = await response.text();
    assert(
      /viewBox=["']\s*0\s+0\s+512\s+360\s*["']/i.test(source),
      `${id} must preserve the 512x360 SVG viewBox contract`,
    );
    assert(!/<text\b/i.test(source), `${id} must not embed UI/pseudo-text in production art`);
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

function displayName(id) {
  return id.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function reviewMarkup(batch) {
  const cards = batch.items.map((id, index) => `
    <article class="card">
      <div class="rank">${String(index + 1).padStart(2, '0')}</div>
      <div class="art"><img src="${previewUrl}/assets/items/${id}.svg" alt="${id}"></div>
      <div class="name">${displayName(id)}</div>
    </article>
  `).join('');

  return `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; width: 1280px; height: 720px; overflow: hidden; background: #0b0e13; color: #f7f3e8; font-family: Arial, sans-serif; }
          main { width: 1280px; height: 720px; padding: 28px 34px 30px; background: radial-gradient(circle at 50% 20%, #1b2028 0, #0b0e13 58%); }
          header { display: flex; align-items: end; justify-content: space-between; height: 64px; margin-bottom: 18px; border-bottom: 1px solid rgba(233,185,73,.22); }
          h1 { margin: 0 0 13px; font-size: 25px; letter-spacing: .03em; }
          .meta { margin-bottom: 15px; color: #8f98a4; font-size: 12px; font-weight: 700; letter-spacing: .08em; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 14px; height: 572px; }
          .card { position: relative; min-width: 0; border: 1px solid rgba(233,185,73,.24); background: linear-gradient(145deg, rgba(24,29,36,.98), rgba(12,16,22,.98)); box-shadow: 0 8px 18px rgba(0,0,0,.34); overflow: hidden; }
          .rank { position: absolute; top: 10px; left: 11px; z-index: 2; width: 32px; height: 25px; border: 1px solid rgba(233,185,73,.32); background: rgba(18,22,28,.86); color: #d8a94e; font-size: 10px; line-height: 23px; text-align: center; font-weight: 700; }
          .art { height: calc(100% - 33px); display: flex; align-items: center; justify-content: center; padding: 4px 28px 0; background: radial-gradient(circle at 50% 50%, rgba(233,185,73,.055), transparent 62%); }
          img { width: 100%; height: 100%; object-fit: contain; }
          .name { position: absolute; bottom: 0; left: 0; right: 0; height: 34px; padding: 9px 14px 0; background: rgba(5,8,12,.84); border-top: 1px solid rgba(255,255,255,.06); font-size: 12px; font-weight: 700; letter-spacing: .02em; }
        </style>
      </head>
      <body>
        <main>
          <header><h1>P7 · Authored Item Art — Batch ${batch.id}</h1><div class="meta">9 SEMANTIC IDS · 512×360 VECTOR SOURCE</div></header>
          <section class="grid">${cards}</section>
        </main>
      </body>
    </html>`;
}

async function renderBatch(page, batch) {
  assert(batch.items.length === 9, `Review batch ${batch.id} must contain exactly nine items`);
  await validateSourceContracts(batch.items);
  await page.setContent(reviewMarkup(batch), { waitUntil: 'load' });

  await page.waitForFunction((count) => {
    const images = [...document.images];
    return images.length === count && images.every((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
  }, batch.items.length);

  const dimensions = await page.evaluate(() => [...document.images].map((image) => ({
    src: image.getAttribute('src'),
    width: image.naturalWidth,
    height: image.naturalHeight,
  })));
  assert(dimensions.length === batch.items.length, `Expected ${batch.items.length} loaded item assets, got ${dimensions.length}`);
  for (const image of dimensions) {
    assert(image.width > 0 && image.height > 0, `${image.src} did not decode to a visible browser image`);
  }

  const outputPath = path.join(outputRoot, `p7-item-art-batch-${batch.id}.png`);
  const screenshot = await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
  assert(screenshot.length > 80_000, `${outputPath} looks unexpectedly small (${screenshot.length} bytes)`);
  assert(screenshot.subarray(12, 16).toString('ascii') === 'IHDR', `${outputPath} is not a PNG`);
  assert(screenshot.readUInt32BE(16) === 1280 && screenshot.readUInt32BE(20) === 720, `${outputPath} must be 1280x720`);
  console.log(path.relative(root, outputPath).split(path.sep).join('/'));
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4176'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
});

let previewLog = '';
preview.stdout.on('data', (chunk) => { previewLog += chunk.toString(); });
preview.stderr.on('data', (chunk) => { previewLog += chunk.toString(); });

try {
  await waitForPreview();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    for (const batch of REVIEW_BATCHES) await renderBatch(page, batch);
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

console.log(`P7 item-art visual review capture OK (${REVIEW_BATCHES.length} batches)`);
