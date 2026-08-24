import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(root, 'release', 'submission', 'generated');
const metadataSource = path.join(root, 'release', 'yandex-draft-metadata.json');
const metadataDocSource = path.join(root, 'docs', 'YANDEX_DRAFT_METADATA.md');
const gameArchiveSource = path.join(root, 'auction-hunter-yandex.zip');
const promoRoot = path.join(root, 'release', 'promotional', 'generated');
const screenshotRoot = path.join(root, 'release', 'screenshots', 'generated');

const requiredSources = [
  metadataSource,
  metadataDocSource,
  gameArchiveSource,
  path.join(promoRoot, 'icon.png'),
  path.join(promoRoot, 'cover.png'),
];

const screenshotPaths = [];
for (const locale of ['ru', 'en']) {
  for (const platform of ['desktop', 'mobile']) {
    for (const file of ['01-lot-lobby.png', '02-active-bidding.png']) {
      if (platform === 'desktop') screenshotPaths.push(path.join(screenshotRoot, locale, platform, file));
    }
    for (const file of ['01-appraised-find.png', '02-office-progression.png']) {
      if (platform === 'mobile') screenshotPaths.push(path.join(screenshotRoot, locale, platform, file));
    }
  }
}
requiredSources.push(...screenshotPaths);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function relative(filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function copy(source, destinationRelative) {
  assert(fs.existsSync(source), `Missing submission source: ${relative(source)}`);
  const destination = path.join(outputRoot, destinationRelative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  return destination;
}

for (const source of requiredSources) {
  assert(fs.existsSync(source), `Missing submission source: ${relative(source)}`);
  assert(fs.statSync(source).isFile(), `Submission source is not a file: ${relative(source)}`);
  assert(fs.statSync(source).size > 0, `Submission source is empty: ${relative(source)}`);
}

const metadata = JSON.parse(fs.readFileSync(metadataSource, 'utf8'));
assert(metadata.version === '1.0.0', `Unexpected release metadata version: ${metadata.version}`);
assert(metadata.locales?.ru?.title === 'Auction Hunter', 'RU title must be Auction Hunter');
assert(metadata.locales?.en?.title === 'Auction Hunter', 'EN title must be Auction Hunter');
assert(screenshotPaths.length === 8, `Expected 8 screenshot sources, found ${screenshotPaths.length}`);

const sourceCommitSha = process.env.SOURCE_COMMIT_SHA || process.env.GITHUB_SHA || 'local';
assert(
  sourceCommitSha === 'local' || /^[0-9a-f]{40}$/i.test(sourceCommitSha),
  `Invalid source commit SHA: ${sourceCommitSha}`,
);

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

const bundledFiles = [];
bundledFiles.push(copy(gameArchiveSource, 'game/auction-hunter-yandex.zip'));
bundledFiles.push(copy(path.join(promoRoot, 'icon.png'), 'promotional/icon.png'));
bundledFiles.push(copy(path.join(promoRoot, 'cover.png'), 'promotional/cover.png'));

for (const screenshot of screenshotPaths) {
  const insideScreenshots = path.relative(screenshotRoot, screenshot);
  bundledFiles.push(copy(screenshot, path.join('screenshots', insideScreenshots)));
}

bundledFiles.push(copy(metadataSource, 'metadata/yandex-draft-metadata.json'));
bundledFiles.push(copy(metadataDocSource, 'metadata/YANDEX_DRAFT_METADATA.md'));

const manifestFiles = bundledFiles
  .map((filePath) => ({
    path: path.relative(outputRoot, filePath).split(path.sep).join('/'),
    bytes: fs.statSync(filePath).size,
    sha256: sha256(filePath),
  }))
  .sort((left, right) => left.path.localeCompare(right.path));

assert(manifestFiles.length === 13, `Expected 13 bundled source files, found ${manifestFiles.length}`);

const manifest = {
  schemaVersion: 1,
  product: 'Auction Hunter',
  releaseVersion: metadata.version,
  commitSha: sourceCommitSha,
  files: manifestFiles,
};

const manifestPath = path.join(outputRoot, 'submission-manifest.json');
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const sumsPath = path.join(outputRoot, 'SHA256SUMS.txt');
fs.writeFileSync(
  sumsPath,
  `${manifestFiles.map((file) => `${file.sha256}  ${file.path}`).join('\n')}\n`,
);

const finalFiles = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else finalFiles.push(absolute);
  }
}
walk(outputRoot);

assert(finalFiles.length === 15, `Expected 15 files in final submission bundle, found ${finalFiles.length}`);
assert(finalFiles.every((file) => fs.statSync(file).size > 0), 'Submission bundle contains an empty file');

console.log(`Yandex submission bundle ready: ${finalFiles.length} files`);
for (const file of finalFiles.sort()) console.log(path.relative(outputRoot, file).split(path.sep).join('/'));
