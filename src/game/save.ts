import type { AuctionHistoryEntry, BusinessUpgradeState, PlayerSave } from '../domain/types';
import { AUCTION_HISTORY_LIMIT } from '../domain/history';

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
  auctionHistory: [],
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
    auctionHistory: [],
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
    auctionHistory: cleanAuctionHistory(value.auctionHistory),
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

function cleanAuctionHistory(value: unknown): AuctionHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const history: AuctionHistoryEntry[] = [];

  for (const candidate of value) {
    if (!isRecord(candidate)) continue;
    const id = cleanRequiredString(candidate.id);
    const occurredAt = cleanRequiredString(candidate.occurredAt);
    const lotId = cleanRequiredString(candidate.lotId);
    const tierId = cleanHistoryTier(candidate.tierId);
    const outcome = candidate.outcome === 'won' || candidate.outcome === 'passed' ? candidate.outcome : null;
    if (!id || !occurredAt || !lotId || !tierId || !outcome) continue;

    const modifierId = cleanNullableString(candidate.modifierId);
    history.push({
      id,
      occurredAt,
      lotId,
      tierId,
      outcome,
      finalBid: cleanNonNegativeNumber(candidate.finalBid),
      sales: cleanNonNegativeNumber(candidate.sales),
      keptValue: cleanNonNegativeNumber(candidate.keptValue),
      estimatedResult: cleanFiniteNumber(candidate.estimatedResult),
      daily: candidate.daily === true,
      ...(modifierId ? { modifierId } : {}),
    });

    if (history.length >= AUCTION_HISTORY_LIMIT) break;
  }

  return history;
}

function cleanHistoryTier(value: unknown): AuctionHistoryEntry['tierId'] | null {
  return value === 'garage' || value === 'estate' || value === 'collector' ? value : null;
}

function cleanUpgradeLevel(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(3, Math.floor(value)))
    : 0;
}

function cleanNonNegativeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function cleanFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function cleanRequiredString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function cleanNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
