import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'release', 'promotional');
const outputDir = path.join(sourceDir, 'generated');

const targets = [
  { source: 'icon.svg', output: 'icon.png', width: 512, height: 512 },
  { source: 'cover.svg', output: 'cover.png', width: 800, height: 470 },
];

fs.mkdirSync(outputDir, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function pngDimensions(buffer) {
  const signature = buffer.subarray(0, 8).toString('hex');
  assert(signature === '89504e470d0a1a0a', 'Generated file is not a PNG');
  assert(buffer.subarray(12, 16).toString('ascii') === 'IHDR', 'Generated PNG is missing IHDR');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const iconSvg = fs.readFileSync(path.join(sourceDir, 'icon.svg'), 'utf8');
assert(!/<text\b/i.test(iconSvg), 'Icon must not contain text');

const coverSvg = fs.readFileSync(path.join(sourceDir, 'cover.svg'), 'utf8');
const coverText = [...coverSvg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/gi)]
  .map((match) => match[1].trim())
  .filter(Boolean);
assert(coverText.join(' ') === 'Auction Hunter', `Cover text must be language-neutral and contain only the canonical title; found: ${coverText.join(' | ')}`);

const browser = await chromium.launch({ headless: true });
try {
  for (const target of targets) {
    const sourcePath = path.join(sourceDir, target.source);
    const outputPath = path.join(outputDir, target.output);
    assert(fs.existsSync(sourcePath), `Missing promotional source: ${sourcePath}`);

    const svg = fs.readFileSync(sourcePath, 'utf8');
    assert(svg.includes('<svg'), `${target.source} is not SVG markup`);

    const page = await browser.newPage({ viewport: { width: target.width, height: target.height }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#0d0f13}svg{display:block;width:100%;height:100%}</style></head><body>${svg}</body></html>`);
    await page.screenshot({ path: outputPath, type: 'png', fullPage: false });
    await page.close();

    const png = fs.readFileSync(outputPath);
    const dimensions = pngDimensions(png);
    assert(dimensions.width === target.width && dimensions.height === target.height, `${target.output} dimensions are ${dimensions.width}x${dimensions.height}; expected ${target.width}x${target.height}`);
    assert(png.length > 20_000, `${target.output} looks unexpectedly small (${png.length} bytes)`);
    console.log(`${target.output}: ${dimensions.width}x${dimensions.height}, ${png.length} bytes`);
  }
} finally {
  await browser.close();
}

console.log('Yandex promotional PNG render OK');
