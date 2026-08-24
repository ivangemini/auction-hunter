import { ITEM_BY_ID } from '../data/catalog';
import { isItemTraitId, itemTraitsFor } from '../data/itemTraits';
import type {
  AuctionHistoryEntry,
  BusinessUpgradeState,
  CollectionItem,
  PlayerSave,
  RestorationGrade,
} from '../domain/types';
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
  collectionItems: [],
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
  buyerMarketDayKey: null,
  claimedBuyerOfferIds: [],
};

export function createDefaultSave(): PlayerSave {
  return {
    ...DEFAULT_SAVE,
    collection: [],
    collectionItems: [],
    claimedSetRewards: [],
    contractProgress: {},
    claimedContractRewards: [],
    claimedAchievements: [],
    businessUpgrades: { ...DEFAULT_UPGRADES },
    auctionHistory: [],
    claimedBuyerOfferIds: [],
  };
}

export function normalizeSave(value: unknown): PlayerSave {
  if (!isRecord(value) || value.version !== 1) return createDefaultSave();

  const cash = cleanNonNegativeNumber(value.cash, DEFAULT_SAVE.cash);
  const collection = cleanStringArray(value.collection);
  const collectionItems = reconcileCollectionItems(collection, cleanCollectionItems(value.collectionItems));

  return {
    version: 1,
    updatedAt: cleanNonNegativeNumber(value.updatedAt),
    cash,
    collection,
    collectionItems,
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
    buyerMarketDayKey: cleanNullableString(value.buyerMarketDayKey),
    claimedBuyerOfferIds: cleanStringArray(value.claimedBuyerOfferIds),
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

function reconcileCollectionItems(collection: readonly string[], persisted: readonly CollectionItem[]): CollectionItem[] {
  const byItemId = new Map<string, CollectionItem[]>();
  for (const instance of persisted) {
    const bucket = byItemId.get(instance.itemId) ?? [];
    bucket.push(instance);
    byItemId.set(instance.itemId, bucket);
  }

  const usedIds = new Set<string>();
  return collection.map((itemId, index) => {
    const bucket = byItemId.get(itemId);
    while (bucket && bucket.length > 0) {
      const candidate = bucket.shift();
      if (candidate && !usedIds.has(candidate.id)) {
        usedIds.add(candidate.id);
        return candidate;
      }
    }

    let id = `legacy-${index}-${itemId}`;
    let suffix = 1;
    while (usedIds.has(id)) {
      id = `legacy-${index}-${itemId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    return createLegacyCollectionItem(id, itemId);
  });
}

function createLegacyCollectionItem(id: string, itemId: string): CollectionItem {
  const definition = ITEM_BY_ID.get(itemId);
  return {
    id,
    itemId,
    appraisedValue: Math.max(1, definition?.baseValue ?? 1),
    condition: 1,
    restored: false,
    traitIds: itemTraitsFor(itemId),
    acquiredAt: 0,
  };
}

function cleanCollectionItems(value: unknown): CollectionItem[] {
  if (!Array.isArray(value)) return [];
  const result: CollectionItem[] = [];

  for (const candidate of value) {
    if (!isRecord(candidate)) continue;
    const id = cleanRequiredString(candidate.id);
    const itemId = cleanRequiredString(candidate.itemId);
    if (!id || !itemId) continue;

    const restorationGrade = cleanRestorationGrade(candidate.restorationGrade);
    result.push({
      id,
      itemId,
      appraisedValue: Math.max(1, cleanNonNegativeNumber(candidate.appraisedValue, ITEM_BY_ID.get(itemId)?.baseValue ?? 1)),
      condition: cleanUnitInterval(candidate.condition, 1),
      restored: candidate.restored === true,
      traitIds: cleanTraitIds(candidate.traitIds),
      acquiredAt: cleanNonNegativeNumber(candidate.acquiredAt),
      ...(restorationGrade ? { restorationGrade } : {}),
    });
  }

  return result;
}

function cleanTraitIds(value: unknown): CollectionItem['traitIds'] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(isItemTraitId))];
}

function cleanRestorationGrade(value: unknown): RestorationGrade | null {
  return value === 'perfect' || value === 'good' || value === 'rough' ? value : null;
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

function cleanUnitInterval(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
    : fallback;
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
