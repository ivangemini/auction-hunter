import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'release', 'screenshots', 'campaign-review', 'assets');
const previewUrl = 'http://127.0.0.1:4182';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

const CAMPAIGN_ASSETS = [
  'campaign-estate-study',
  'campaign-records-basement',
  'campaign-dealer-backroom',
  'campaign-river-archive',
  'campaign-veyr-estate',
  'closed-circle-room',
  'evidence-black-seal',
  'evidence-ledger-fragment',
  'private-invitation',
  'provenance-folder',
  'sealed-bid-card',
  'circle-sponsor-token',
  'evidence-restored-serial',
  'dealer-proxy-sheet',
  'counterfeit-table',
  'final-route-map',
  'veyr-master-ledger',
  'veyr-portrait-case',
  'veyr-cipher-cabinet',
  'veyr-chronometer',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
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
  throw new Error('Timed out waiting for campaign asset review preview server');
}

async function stopPreview(preview) {
  if (preview.exitCode !== null || preview.signalCode) return;
  const closed = new Promise((resolve) => preview.once('close', resolve));
  preview.kill('SIGTERM');
  const graceful = await Promise.race([
    closed.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 2_000)),
  ]);
  if (!graceful && preview.exitCode === null) preview.kill('SIGKILL');
}

function validatePng(buffer, name) {
  assert(buffer.length > 60_000, `${name} looks unexpectedly small (${buffer.length} bytes)`);
  assert(buffer.subarray(12, 16).toString('ascii') === 'IHDR', `${name} is not a PNG`);
  assert(buffer.readUInt32BE(16) === 1280 && buffer.readUInt32BE(20) === 720, `${name} must be 1280x720`);
}

async function validateSources() {
  for (const id of CAMPAIGN_ASSETS) {
    const response = await fetch(`${previewUrl}/assets/campaign/${id}.svg`);
    assert(response.ok, `${id} returned HTTP ${response.status}`);
    const source = await response.text();
    assert(source.includes('<svg'), `${id} is not SVG source`);
    assert(source.length > 500, `${id} looks like placeholder source`);
  }
}

async function captureSheet(browser, ids, filename, title, subtitle) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  const cards = ids.map((id, index) => `
    <article class="card">
      <div class="rank">${String(index + 1).padStart(2, '0')}</div>
      <img src="${previewUrl}/assets/campaign/${id}.svg" alt="${id}">
      <div class="name">${id.replaceAll('-', ' ')}</div>
    </article>
  `).join('');

  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;width:1280px;height:720px;overflow:hidden;background:#0b0e13;color:#f7f3e8;font-family:Arial,sans-serif}
    main{width:1280px;height:720px;padding:24px 30px;background:radial-gradient(circle at 50% 12%,#2b241b 0,#11151b 47%,#090c10 100%)}
    header{height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(233,185,73,.28);margin-bottom:14px}
    h1{font-size:22px;margin:0;letter-spacing:.02em}.meta{font-size:10px;color:#9ba3ad;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
    .grid{display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(2,1fr);gap:12px;height:582px}
    .card{position:relative;overflow:hidden;border:1px solid rgba(233,185,73,.22);background:linear-gradient(145deg,rgba(27,31,37,.98),rgba(10,13,18,.98));box-shadow:0 8px 20px rgba(0,0,0,.34)}
    img{width:100%;height:calc(100% - 34px);object-fit:contain;padding:8px 12px 2px}.rank{position:absolute;z-index:2;top:7px;left:8px;padding:4px 7px;border:1px solid rgba(233,185,73,.3);background:rgba(12,15,19,.88);color:#e9b949;font-size:9px;font-weight:700}
    .name{position:absolute;left:0;right:0;bottom:0;height:34px;padding:9px 10px 0;border-top:1px solid rgba(255,255,255,.07);background:rgba(5,8,12,.91);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
  </style></head><body><main><header><h1>${title}</h1><div class="meta">${subtitle}</div></header><section class="grid">${cards}</section></main></body></html>`, { waitUntil: 'load' });

  await page.waitForFunction((count) => [...document.images].length === count && [...document.images].every((image) => image.complete && image.naturalWidth > 0), ids.length);
  const screenshot = await page.screenshot({ type: 'png' });
  validatePng(screenshot, filename);
  fs.writeFileSync(path.join(outputRoot, filename), screenshot);
  await page.close();
}

fs.rmSync(outputRoot, { recursive: true, force: true });
ensureDirectory(outputRoot);

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4182'], {
  cwd: root,
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
});
let previewLog = '';
preview.stdout.on('data', (chunk) => { previewLog += chunk.toString(); });
preview.stderr.on('data', (chunk) => { previewLog += chunk.toString(); });

try {
  await waitForPreview();
  await validateSources();
  const browser = await chromium.launch({ headless: true });
  try {
    await captureSheet(
      browser,
      CAMPAIGN_ASSETS.slice(0, 10),
      '01-campaign-environments-evidence.png',
      'P9 · Campaign Environments & Evidence',
      '10 DIRECT SEMANTIC ASSETS · PRODUCTION BUILD',
    );
    await captureSheet(
      browser,
      CAMPAIGN_ASSETS.slice(10),
      '02-campaign-props-finale.png',
      'P9 · Campaign Props & Finale Objects',
      '10 DIRECT SEMANTIC ASSETS · PRODUCTION BUILD',
    );
  } finally {
    await browser.close();
  }
} catch (error) {
  console.error(previewLog);
  throw error;
} finally {
  await stopPreview(preview);
}

console.log('release/screenshots/campaign-review/assets/01-campaign-environments-evidence.png');
console.log('release/screenshots/campaign-review/assets/02-campaign-props-finale.png');
console.log('P9 campaign asset visual review capture OK: 20/20 semantic production assets');