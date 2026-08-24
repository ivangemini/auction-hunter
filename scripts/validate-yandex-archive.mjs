import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const maxUncompressedBytes = 100 * 1024 * 1024;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function walk(directory) {
  const entries = [];
  for (const dirent of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, dirent.name);
    if (dirent.isDirectory()) entries.push(...walk(absolute));
    else if (dirent.isFile()) entries.push(absolute);
  }
  return entries;
}

assert(fs.existsSync(dist) && fs.statSync(dist).isDirectory(), 'dist/ is missing; run the production build first');
assert(fs.existsSync(path.join(dist, 'index.html')), 'dist/index.html is missing');

const files = walk(dist);
const indexFiles = files.filter((file) => path.basename(file) === 'index.html');
assert(indexFiles.length === 1, `Expected exactly one index.html in the archive, found ${indexFiles.length}`);
assert(path.relative(dist, indexFiles[0]) === 'index.html', 'index.html must be at archive root');

let totalBytes = 0;
const invalidPaths = [];
const sourceMaps = [];
for (const file of files) {
  const relative = path.relative(dist, file).split(path.sep).join('/');
  totalBytes += fs.statSync(file).size;
  if (relative.includes(' ') || /[^\x00-\x7F]/.test(relative)) invalidPaths.push(relative);
  if (relative.endsWith('.map')) sourceMaps.push(relative);
}

assert(invalidPaths.length === 0, `Archive paths contain spaces/non-ASCII characters: ${invalidPaths.join(', ')}`);
assert(sourceMaps.length === 0, `Production archive must not contain source maps: ${sourceMaps.join(', ')}`);
assert(totalBytes <= maxUncompressedBytes, `Uncompressed archive exceeds 100 MB: ${totalBytes} bytes`);

const builtIndex = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
assert(builtIndex.includes('/sdk.js'), 'Built index.html must retain the Yandex Games /sdk.js loader');
assert(/<title>Auction Hunter<\/title>/i.test(builtIndex), 'Built index.html must retain the canonical Auction Hunter title');

console.log(`Yandex archive validation OK: ${files.length} files, ${totalBytes} bytes uncompressed, no source maps`);
