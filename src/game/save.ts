import type { BusinessUpgradeState, PlayerSave } from '../domain/types';

export const SAVE_STORAGE_KEY = 'auction-hunter.save.v1';

const DEFAULT_UPGRADES: BusinessUpgradeState = {
  warehouse: 0,
  contractsDesk: 0,
  showroom: 0,
};

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
  highestCash: 2500,
  contractDayKey: null,
  contractProgress: {},
  claimedContractRewards: [],
  claimedAchievements: [],
  businessUpgrades: DEFAULT_UPGRADES,
};

export function createDefaultSave(): PlayerSave {
  return {
    ...DEFAULT_SAVE,
    collection: [],
    claimedSetRewards: [],
    contractProgress: {},
    claimedContractRewards: [],
    claimedAchievements: [],
    businessUpgrades: { ...DEFAULT_UPGRADES },
  };
}

export function normalizeSave(value: unknown): PlayerSave {
  if (!isRecord(value) || value.version !== 1) return createDefaultSave();

  const cash = cleanNonNegativeNumber(value.cash, DEFAULT_SAVE.cash);
  return {
    version: 1,
    updatedAt: cleanNonNegativeNumber(value.updatedAt),
    cash,
    collection: cleanStringArray(value.collection),
    claimedSetRewards: cleanStringArray(value.claimedSetRewards),
    reputationXp: cleanNonNegativeNumber(value.reputationXp),
    lastDailyCompletedDay: cleanNullableString(value.lastDailyCompletedDay),
    onboardingComplete: value.onboardingComplete === true,
    auctionsWon: cleanNonNegativeNumber(value.auctionsWon),
    auctionsPlayed: cleanNonNegativeNumber(value.auctionsPlayed),
    lifetimeSales: cleanNonNegativeNumber(value.lifetimeSales),
    highestCash: Math.max(cash, cleanNonNegativeNumber(value.highestCash, cash)),
    contractDayKey: cleanNullableString(value.contractDayKey),
    contractProgress: cleanNumberRecord(value.contractProgress),
    claimedContractRewards: cleanStringArray(value.claimedContractRewards),
    claimedAchievements: cleanStringArray(value.claimedAchievements),
    businessUpgrades: cleanBusinessUpgrades(value.businessUpgrades),
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

function cleanNumberRecord(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, amount]) => typeof amount === 'number' && Number.isFinite(amount))
      .map(([key, amount]) => [key, Math.max(0, amount as number)]),
  );
}

function cleanBusinessUpgrades(value: unknown): BusinessUpgradeState {
  if (!isRecord(value)) return { ...DEFAULT_UPGRADES };
  return {
    warehouse: cleanUpgradeLevel(value.warehouse),
    contractsDesk: cleanUpgradeLevel(value.contractsDesk),
    showroom: cleanUpgradeLevel(value.showroom),
  };
}

function cleanUpgradeLevel(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(3, Math.floor(value)))
    : 0;
}

function cleanNonNegativeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function cleanNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
