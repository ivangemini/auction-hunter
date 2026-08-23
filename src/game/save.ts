import type { PlayerSave } from '../domain/types';

export const SAVE_STORAGE_KEY = 'auction-hunter.save.v1';

const DEFAULT_SAVE: PlayerSave = {
  version: 1,
  updatedAt: 0,
  cash: 2500,
  collection: [],
  claimedSetRewards: [],
  reputationXp: 0,
  lastDailyCompletedDay: null,
  onboardingComplete: false,
  auctionsWon: 0,
  auctionsPlayed: 0,
  lifetimeSales: 0,
};

export function createDefaultSave(): PlayerSave {
  return { ...DEFAULT_SAVE, collection: [], claimedSetRewards: [] };
}

export function normalizeSave(value: unknown): PlayerSave {
  if (!isRecord(value) || value.version !== 1) return createDefaultSave();

  return {
    version: 1,
    updatedAt: cleanNonNegativeNumber(value.updatedAt),
    cash: cleanNonNegativeNumber(value.cash, DEFAULT_SAVE.cash),
    collection: cleanStringArray(value.collection),
    claimedSetRewards: cleanStringArray(value.claimedSetRewards),
    reputationXp: cleanNonNegativeNumber(value.reputationXp),
    lastDailyCompletedDay: cleanNullableString(value.lastDailyCompletedDay),
    onboardingComplete: value.onboardingComplete === true,
    auctionsWon: cleanNonNegativeNumber(value.auctionsWon),
    auctionsPlayed: cleanNonNegativeNumber(value.auctionsPlayed),
    lifetimeSales: cleanNonNegativeNumber(value.lifetimeSales),
  };
}

export function loadLocalSave(): PlayerSave {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    return raw ? normalizeSave(JSON.parse(raw)) : createDefaultSave();
  } catch {
    return createDefaultSave();
  }
}

export function writeLocalSave(save: PlayerSave, touchTimestamp = true): PlayerSave {
  const normalized = normalizeSave(save);
  const next: PlayerSave = touchTimestamp
    ? { ...normalized, updatedAt: Math.max(Date.now(), normalized.updatedAt + 1) }
    : normalized;

  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('[Save] Failed to persist local progress.', error);
  }
  return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function cleanStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
}

function cleanNonNegativeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function cleanNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
