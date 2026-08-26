import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'release', 'screenshots', 'item-breadth-review', 'compact');
const previewUrl = 'http://127.0.0.1:4183';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const WIDTH = 844;
const HEIGHT = 390;

const P9_WAVES = [
  {
    file: '01-first-campaign-batch.png',
    title: 'P9 · Archive Leads',
    items: ['archivist-loupe', 'microfilm-reader', 'wax-seal-box', 'auctioneers-ledger', 'brass-cipher-wheel', 'expedition-camera'],
  },
  {
    file: '02-investigation-expedition.png',
    title: 'P9 · Investigation & Expedition',
    items: ['field-recorder', 'postal-scale', 'negative-album', 'brass-map-case', 'surveyor-transit', 'lacquer-document-case'],
  },
  {
    file: '03-records-communications.png',
    title: 'P9 · Records & Communications',
    items: ['telegraph-key', 'survey-notebook', 'stamp-press', 'plate-camera', 'coded-postcard-album', 'portable-duplicator'],
  },
  {
    file: '04-border-archive.png',
    title: 'P9 · Border Archive',
    items: ['archive-card-index', 'brass-letter-opener', 'folding-field-lamp', 'customs-stamp-book', 'wire-photo-transmitter', 'locksmith-gauge-set'],
  },
  {
    file: '05-clearance-dispatch.png',
    title: 'P9 · Clearance & Dispatch',
    items: ['estate-key-register', 'cipher-tape-reader', 'brass-seal-calipers', 'river-signal-lantern', 'consignment-token-board', 'railway-chronometer'],
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
  throw new Error('Timed out waiting for compact P9 item review preview server');
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

async function validateSources() {
  const ids = P9_WAVES.flatMap((wave) => wave.items);
  assert(ids.length === 30, `Expected 30 P9 catalog additions, got ${ids.length}`);
  assert(new Set(ids).size === ids.length, 'Compact P9 review contains duplicate semantic item IDs');
  for (const id of ids) {
    const response = await fetch(`${previewUrl}/assets/items/${id}.svg`);
    assert(response.ok, `${id} returned HTTP ${response.status}`);
    const source = await response.text();
    assert(/viewBox=["']\s*0\s+0\s+512\s+360\s*["']/i.test(source), `${id} must use a 512x360 viewBox`);
    assert(!/<text\b/i.test(source), `${id} must not embed pseudo-text`);
  }
}

function label(id) {
  return id.replaceAll('-', ' ').toUpperCase();
}

async function captureWave(browser, wave) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  const cards = wave.items.map((id, index) => `
    <article class="card">
      <span class="rank">${String(index + 1).padStart(2, '0')}</span>
      <img src="${previewUrl}/assets/items/${id}.svg" alt="${id}">
      <span class="name">${label(id)}</span>
    </article>`).join('');

  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#090c10;color:#f7f3e8;font-family:Arial,sans-serif}
    main{width:100%;height:100%;padding:12px 16px;background:radial-gradient(circle at 50% 10%,#242018 0,#11151b 48%,#090c10 100%)}
    header{height:35px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(233,185,73,.26);margin-bottom:8px}
    h1{margin:0;font-size:14px;letter-spacing:.02em}.meta{font-size:7px;color:#9ba3ad;font-weight:700;letter-spacing:.07em}
    .grid{height:323px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:7px}
    .card{position:relative;overflow:hidden;border:1px solid rgba(233,185,73,.22);background:linear-gradient(145deg,rgba(27,31,37,.98),rgba(10,13,18,.98))}
    img{width:100%;height:calc(100% - 22px);object-fit:contain;padding:3px 8px 0}.rank{position:absolute;z-index:2;top:4px;left:5px;padding:2px 4px;background:rgba(10,13,18,.88);border:1px solid rgba(233,185,73,.3);color:#e9b949;font-size:6px;font-weight:700}
    .name{position:absolute;left:0;right:0;bottom:0;height:22px;padding:6px 7px 0;background:rgba(5,8,12,.92);border-top:1px solid rgba(255,255,255,.07);font-size:6px;font-weight:700;letter-spacing:.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  </style></head><body><main><header><h1>${wave.title}</h1><div class="meta">844×390 · DIRECT ART</div></header><section class="grid">${cards}</section></main></body></html>`, { waitUntil: 'load' });

  await page.waitForFunction((count) => [...document.images].length === count && [...document.images].every((image) => image.complete && image.naturalWidth > 0), wave.items.length);
  const screenshot = await page.screenshot({ type: 'png' });
  assert(screenshot.length > 25_000, `${wave.file} looks unexpectedly small (${screenshot.length} bytes)`);
  assert(screenshot.subarray(12, 16).toString('ascii') === 'IHDR', `${wave.file} is not PNG`);
  assert(screenshot.readUInt32BE(16) === WIDTH && screenshot.readUInt32BE(20) === HEIGHT, `${wave.file} must be ${WIDTH}x${HEIGHT}`);
  fs.writeFileSync(path.join(outputRoot, wave.file), screenshot);
  await page.close();
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4183'], {
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
    for (const wave of P9_WAVES) await captureWave(browser, wave);
  } finally {
    await browser.close();
  }
} catch (error) {
  console.error(previewLog);
  throw error;
} finally {
  await stopPreview(preview);
}

for (const wave of P9_WAVES) console.log(`release/screenshots/item-breadth-review/compact/${wave.file}`);
console.log('P9 compact item-art review OK: 30/30 campaign catalog additions at 844x390');
