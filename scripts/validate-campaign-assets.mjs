import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const campaignSource = fs.readFileSync(path.join(root, 'src', 'data', 'campaign.ts'), 'utf8');
const assetRoot = path.join(root, 'public', 'assets', 'campaign');
const assetById = {
  'campaign-estate-study': 'campaign-estate-study.svg',
  'evidence-black-seal': 'evidence-black-seal.svg',
  'evidence-ledger-fragment': 'evidence-ledger-fragment.svg',
  'private-invitation': 'private-invitation.svg',
  'provenance-folder': 'provenance-folder.svg',
  'closed-circle-room': 'closed-circle-room.svg',
  'sealed-bid-card': 'sealed-bid-card.svg',
  'circle-sponsor-token': 'circle-sponsor-token.svg',
};

const referenced = new Set();
for (const match of campaignSource.matchAll(/artId:\s*['"]([^'"]+)['"]/g)) referenced.add(match[1]);

if (referenced.size < 8) throw new Error(`Campaign art breadth regressed: expected >=8 semantic art IDs, got ${referenced.size}`);
for (const artId of referenced) {
  const filename = assetById[artId];
  if (!filename) throw new Error(`Campaign art id is not mapped to a production asset: ${artId}`);
  const filepath = path.join(assetRoot, filename);
  if (!fs.existsSync(filepath)) throw new Error(`Campaign production asset is missing: ${filename}`);
  const stats = fs.statSync(filepath);
  if (stats.size < 500) throw new Error(`Campaign asset looks like a placeholder/empty file: ${filename}`);
}

if (new Set(Object.values(assetById)).size !== Object.keys(assetById).length) {
  throw new Error('Campaign semantic art IDs must not silently alias the same source file in the production batch');
}

console.log(`Campaign asset coverage OK: ${referenced.size} semantic assets`);
