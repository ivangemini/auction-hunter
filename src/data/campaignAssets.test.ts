import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from './campaign';

const campaignAssetRoot = path.resolve(process.cwd(), 'public', 'assets', 'campaign');
const ART_FILE_BY_ID: Record<string, string> = {
  'campaign-estate-study': 'campaign-estate-study.svg',
  'evidence-black-seal': 'evidence-black-seal.svg',
  'evidence-ledger-fragment': 'evidence-ledger-fragment.svg',
  'private-invitation': 'private-invitation.svg',
  'provenance-folder': 'provenance-folder.svg',
};

describe('P9 campaign asset coverage', () => {
  it('backs every currently referenced campaign art id with a production asset', () => {
    const referenced = new Set<string>();
    for (const mission of CAMPAIGN_MISSIONS) if (mission.artId) referenced.add(mission.artId);
    for (const evidence of CAMPAIGN_EVIDENCE) referenced.add(evidence.artId);

    for (const artId of referenced) {
      const filename = ART_FILE_BY_ID[artId];
      expect(filename, `unmapped campaign art id: ${artId}`).toBeDefined();
      expect(fs.existsSync(path.join(campaignAssetRoot, filename!)), `missing campaign asset: ${filename}`).toBe(true);
    }
  });

  it('keeps the first campaign art batch semantically distinct', () => {
    expect(new Set(Object.values(ART_FILE_BY_ID)).size).toBe(Object.keys(ART_FILE_BY_ID).length);
    expect(Object.keys(ART_FILE_BY_ID).length).toBeGreaterThanOrEqual(5);
  });
});
