import { describe, expect, it } from 'vitest';
import { createDefaultSave, normalizeSave } from '../game/save';
import { pickStartupSave } from './cloudSave';

describe('cloud save reconciliation', () => {
  it('prefers newer cloud progress at startup', () => {
    const local = { ...createDefaultSave(), updatedAt: 100, auctionsWon: 4, reputationXp: 140 };
    const cloud = { ...createDefaultSave(), updatedAt: 200, auctionsWon: 5, reputationXp: 200 };

    const choice = pickStartupSave(local, cloud);
    expect(choice.source).toBe('cloud');
    expect(choice.save.reputationXp).toBe(200);
  });

  it('prefers stronger progression when legacy timestamps are equal', () => {
    const local = { ...createDefaultSave(), updatedAt: 0, auctionsWon: 4, reputationXp: 140 };
    const cloud = { ...createDefaultSave(), updatedAt: 0, auctionsWon: 1, reputationXp: 35 };

    expect(pickStartupSave(local, cloud).source).toBe('local');
  });

  it('normalizes older v1 saves without resetting progress', () => {
    const migrated = normalizeSave({
      version: 1,
      cash: 4200,
      collection: ['film-camera'],
      auctionsWon: 3,
    });

    expect(migrated.cash).toBe(4200);
    expect(migrated.collection).toEqual(['film-camera']);
    expect(migrated.updatedAt).toBe(0);
    expect(migrated.onboardingComplete).toBe(false);
    expect(migrated.lastDailyCompletedDay).toBeNull();
  });
});
