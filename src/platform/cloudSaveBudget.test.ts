import { describe, expect, test } from 'vitest';
import { createDefaultSave } from '../game/save';

const YANDEX_PLAYER_DATA_LIMIT_BYTES = 200 * 1024;
const V1_STRESS_BUDGET_BYTES = 150 * 1024;
const INVENTORY_STRESS_COPIES = 5_000;

function utf8Bytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

describe('Yandex cloud-save payload budget', () => {
  test('a deliberately heavy v1 save remains well below the 200 KB Player-data limit', () => {
    const base = createDefaultSave();
    const history = Array.from({ length: 20 }, (_, index) => ({
      id: `stress-history-${index}`,
      occurredAt: '2026-08-24T11:00:00.000Z',
      lotId: 'collector-gallery-clearance',
      tierId: 'collector' as const,
      outcome: index % 2 === 0 ? 'won' as const : 'passed' as const,
      finalBid: 99_999,
      sales: 120_000,
      keptValue: 85_000,
      estimatedResult: 105_001,
      daily: index % 3 === 0,
      modifierId: 'collector-fever',
    }));

    const stressSave = {
      ...base,
      updatedAt: 9_999_999_999_999,
      cash: 9_999_999,
      highestCash: 9_999_999,
      reputationXp: 999_999,
      auctionsWon: 99_999,
      auctionsPlayed: 120_000,
      lifetimeSales: 999_999_999,
      collection: Array.from({ length: INVENTORY_STRESS_COPIES }, () => 'preproduction-figure'),
      claimedSetRewards: Array.from({ length: 100 }, (_, index) => `set-${index}`),
      contractProgress: Object.fromEntries(
        Array.from({ length: 100 }, (_, index) => [`contract-${index}`, 99_999]),
      ),
      claimedContractRewards: Array.from({ length: 100 }, (_, index) => `contract-${index}`),
      claimedAchievements: Array.from({ length: 100 }, (_, index) => `achievement-${index}`),
      businessUpgrades: { warehouse: 3, contractsDesk: 3, showroom: 3 },
      auctionHistory: history,
    };

    const envelope = { schemaVersion: 1, save: stressSave };
    const bytes = utf8Bytes(envelope);

    expect(bytes).toBeLessThan(V1_STRESS_BUDGET_BYTES);
    expect(bytes).toBeLessThan(YANDEX_PLAYER_DATA_LIMIT_BYTES);
  });

  test('the default save leaves essentially the whole platform budget available for progression', () => {
    const bytes = utf8Bytes({ schemaVersion: 1, save: createDefaultSave() });
    expect(bytes).toBeLessThan(2 * 1024);
    expect(bytes / YANDEX_PLAYER_DATA_LIMIT_BYTES).toBeLessThan(0.01);
  });
});
