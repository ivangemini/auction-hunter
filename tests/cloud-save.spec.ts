import { expect, test } from '@playwright/test';
import { createDefaultSave, normalizeSave } from '../src/game/save';
import { pickStartupSave } from '../src/platform/cloudSave';

test('newer cloud progress wins startup conflict resolution', () => {
  const local = { ...createDefaultSave(), updatedAt: 100, auctionsWon: 4, reputationXp: 140 };
  const cloud = { ...createDefaultSave(), updatedAt: 200, auctionsWon: 5, reputationXp: 200 };

  const choice = pickStartupSave(local, cloud);
  expect(choice.source).toBe('cloud');
  expect(choice.save.reputationXp).toBe(200);
});

test('equal legacy timestamps prefer the save with stronger progression', () => {
  const local = { ...createDefaultSave(), updatedAt: 0, auctionsWon: 4, reputationXp: 140 };
  const cloud = { ...createDefaultSave(), updatedAt: 0, auctionsWon: 1, reputationXp: 35 };

  expect(pickStartupSave(local, cloud).source).toBe('local');
});

test('older v1 saves normalize without reset', () => {
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
