import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'release', 'screenshots', 'campaign-review', 'assets-compact');
const previewUrl = 'http://127.0.0.1:4184';
const viteCli = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const WIDTH = 844;
const HEIGHT = 390;

const ASSET_GROUPS = [
  {
    file: '01-environments-evidence-compact.png',
    title: 'P9 · Environments & Evidence',
    ids: [
      'campaign-estate-study', 'campaign-records-basement', 'campaign-dealer-backroom', 'campaign-river-archive', 'campaign-veyr-estate',
      'closed-circle-room', 'evidence-black-seal', 'evidence-ledger-fragment', 'private-invitation', 'provenance-folder',
    ],
  },
  {
    file: '02-props-finale-compact.png',
    title: 'P9 · Props & Finale Objects',
    ids: [
      'sealed-bid-card', 'circle-sponsor-token', 'evidence-restored-serial', 'dealer-proxy-sheet', 'counterfeit-table',
      'final-route-map', 'veyr-master-ledger', 'veyr-portrait-case', 'veyr-cipher-cabinet', 'veyr-chronometer',
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
  throw new Error('Timed out waiting for compact campaign asset preview server');
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
  const ids = ASSET_GROUPS.flatMap((group) => group.ids);
  assert(ids.length === 20, `Expected 20 semantic campaign assets, got ${ids.length}`);
  assert(new Set(ids).size === ids.length, 'Compact campaign asset review has duplicate semantic IDs');
  for (const id of ids) {
    const response = await fetch(`${previewUrl}/assets/campaign/${id}.svg`);
    assert(response.ok, `${id} returned HTTP ${response.status}`);
    const source = await response.text();
    assert(source.includes('<svg'), `${id} is not SVG source`);
    assert(source.length > 500, `${id} looks like placeholder source`);
  }
}

async function captureGroup(browser, group) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  const cards = group.ids.map((id, index) => `
    <article class="card">
      <span class="rank">${String(index + 1).padStart(2, '0')}</span>
      <img src="${previewUrl}/assets/campaign/${id}.svg" alt="${id}">
      <span class="name">${id.replaceAll('-', ' ').toUpperCase()}</span>
    </article>`).join('');

  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#090c10;color:#f7f3e8;font-family:Arial,sans-serif}
    main{width:100%;height:100%;padding:10px 12px;background:radial-gradient(circle at 50% 8%,#2a2219 0,#11151b 49%,#090c10 100%)}
    header{height:31px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(233,185,73,.25);margin-bottom:7px}
    h1{margin:0;font-size:13px}.meta{font-size:6px;color:#9ba3ad;font-weight:700;letter-spacing:.08em}
    .grid{height:332px;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(2,1fr);gap:5px}
    .card{position:relative;overflow:hidden;border:1px solid rgba(233,185,73,.21);background:linear-gradient(145deg,rgba(27,31,37,.98),rgba(10,13,18,.98))}
    img{width:100%;height:calc(100% - 20px);object-fit:contain;padding:3px 5px 0}.rank{position:absolute;z-index:2;top:3px;left:4px;padding:2px 3px;background:rgba(10,13,18,.88);border:1px solid rgba(233,185,73,.3);color:#e9b949;font-size:5px;font-weight:700}
    .name{position:absolute;left:0;right:0;bottom:0;height:20px;padding:6px 4px 0;background:rgba(5,8,12,.92);border-top:1px solid rgba(255,255,255,.07);font-size:5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  </style></head><body><main><header><h1>${group.title}</h1><div class="meta">844×390 · 10 DIRECT ASSETS</div></header><section class="grid">${cards}</section></main></body></html>`, { waitUntil: 'load' });

  await page.waitForFunction((count) => [...document.images].length === count && [...document.images].every((image) => image.complete && image.naturalWidth > 0), group.ids.length);
  const screenshot = await page.screenshot({ type: 'png' });
  assert(screenshot.length > 25_000, `${group.file} looks unexpectedly small (${screenshot.length} bytes)`);
  assert(screenshot.subarray(12, 16).toString('ascii') === 'IHDR', `${group.file} is not PNG`);
  assert(screenshot.readUInt32BE(16) === WIDTH && screenshot.readUInt32BE(20) === HEIGHT, `${group.file} must be ${WIDTH}x${HEIGHT}`);
  fs.writeFileSync(path.join(outputRoot, group.file), screenshot);
  await page.close();
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

const preview = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4184'], {
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
    for (const group of ASSET_GROUPS) await captureGroup(browser, group);
  } finally {
    await browser.close();
  }
} catch (error) {
  console.error(previewLog);
  throw error;
} finally {
  await stopPreview(preview);
}

for (const group of ASSET_GROUPS) console.log(`release/screenshots/campaign-review/assets-compact/${group.file}`);
console.log('P9 compact campaign asset review OK: 20/20 semantic assets at 844x390');
