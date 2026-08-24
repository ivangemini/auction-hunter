import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const metadataPath = path.join(root, 'release', 'yandex-draft-metadata.json');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

function length(value) {
  return Array.from(value).length;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertRange(label, value, min, max) {
  const size = length(value);
  assert(size >= min && size <= max, `${label}: ${size} characters; expected ${min}-${max}`);
  return size;
}

assert(metadata.version && typeof metadata.version === 'string', 'version is required');
assert(metadata.orientation === 'landscape', 'Auction Hunter release metadata must declare landscape orientation');
assert(Array.isArray(metadata.supportedPlatforms), 'supportedPlatforms must be an array');
assert(metadata.supportedPlatforms.includes('desktop'), 'desktop platform is required');
assert(metadata.supportedPlatforms.includes('mobile'), 'mobile platform is required');

const locales = ['ru', 'en'];
const titles = new Set();
const report = [];

for (const locale of locales) {
  const entry = metadata.locales?.[locale];
  assert(entry, `${locale}: metadata is missing`);

  const titleLength = assertRange(`${locale}.title`, entry.title, 1, 50);
  const seoLength = assertRange(`${locale}.seoDescription`, entry.seoDescription, 50, 160);
  const descriptionLength = assertRange(`${locale}.description`, entry.description, 100, 1000);
  const howLength = assertRange(`${locale}.howToPlay`, entry.howToPlay, 100, 1000);
  const shortLength = assertRange(`${locale}.shortDescription`, entry.shortDescription, 1, 70);

  assert(entry.title === 'Auction Hunter', `${locale}.title must match the in-game brand exactly`);
  assert(entry.title !== entry.title.toUpperCase(), `${locale}.title must not be all caps`);
  assert(/^\p{Lu}/u.test(entry.title), `${locale}.title must start with a capital letter`);

  const normalizedTitle = entry.title.toLocaleLowerCase(locale);
  assert(!entry.seoDescription.toLocaleLowerCase(locale).includes(normalizedTitle), `${locale}.seoDescription must not repeat the title`);
  assert(!entry.shortDescription.toLocaleLowerCase(locale).includes(normalizedTitle), `${locale}.shortDescription must not repeat the title`);

  const textFields = [entry.seoDescription, entry.shortDescription, entry.description, entry.howToPlay];
  assert(new Set(textFields).size === textFields.length, `${locale}: draft text fields must not duplicate each other`);
  assert(/[.!]$/.test(entry.seoDescription), `${locale}.seoDescription should end with a period or exclamation mark`);

  titles.add(entry.title);
  report.push({ locale, titleLength, seoLength, shortLength, descriptionLength, howLength });
}

assert(titles.size === 1, 'Title must be identical across RU/EN materials');

const visuals = metadata.visualRequirements;
assert(visuals?.icon?.width === 512 && visuals.icon.height === 512 && visuals.icon.format === 'png', 'Icon requirement must remain 512x512 PNG');
assert(visuals?.cover?.width === 800 && visuals.cover.height === 470 && visuals.cover.format === 'png', 'Cover requirement must remain 800x470 PNG');
assert(visuals?.screenshots?.landscapeRatio === '16:9', 'Landscape screenshots must remain 16:9');
assert(visuals?.screenshots?.longSideMin === 1280 && visuals.screenshots.longSideMax === 2560, 'Screenshot long-side range must remain 1280-2560 px');
assert(visuals?.screenshots?.minimumPerSelectedPlatform >= 2, 'At least two screenshots per selected platform are required');

for (const row of report) {
  console.log(`${row.locale}: title=${row.titleLength}, seo=${row.seoLength}, short=${row.shortLength}, description=${row.descriptionLength}, howToPlay=${row.howLength}`);
}
console.log('Yandex draft metadata validation OK');
