export type Locale = 'ru' | 'en';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type RestorationGrade = 'perfect' | 'good' | 'rough';
export type ItemCategory = 'electronics' | 'watches' | 'toys' | 'art' | 'tools' | 'collectibles';
export type ItemTraitId =
  | 'signed'
  | 'first-edition'
  | 'original-packaging'
  | 'limited-run'
  | 'prototype'
  | 'mechanical'
  | 'period-design'
  | 'provenance'
  | 'complete-set'
  | 'rare-variant'
  | 'documented-history'
  | 'replacement-parts'
  | 'incomplete'
  | 'replica-risk';
export type ContractMetric = 'auctionsPlayed' | 'auctionsWon' | 'itemsSold' | 'itemsKept' | 'salesValue';
export type AchievementMetric = 'auctionsPlayed' | 'auctionsWon' | 'uniqueCollection' | 'lifetimeSales' | 'claimedSets' | 'reputationXp' | 'highestCash';
export type BusinessUpgradeId = 'warehouse' | 'contractsDesk' | 'showroom';
export type AuctionHistoryOutcome = 'won' | 'passed';

export interface LocalizedText {
  ru: string;
  en: string;
}

export type LotClueSignal =
  | { categories: ItemCategory[] }
  | { itemIds: string[] };

export interface LotClue {
  text: LocalizedText;
  signal: LotClueSignal;
}

export interface ItemDefinition {
  id: string;
  name: LocalizedText;
  category: ItemCategory;
  rarity: Rarity;
  baseValue: number;
}

export interface LotTemplate {
  id: string;
  artId?: string;
  name: LocalizedText;
  location: LocalizedText;
  clues: LotClue[];
  reservePrice: number;
  bidIncrement: number;
  itemCount: number;
  itemPool: string[];
}

export interface RevealedItem {
  definition: ItemDefinition;
  appraisedValue: number;
  condition: number;
  restored: boolean;
  traitIds?: ItemTraitId[];
  restorationGrade?: RestorationGrade;
  restorationGain?: number;
}

export interface CollectionItem {
  id: string;
  itemId: string;
  appraisedValue: number;
  condition: number;
  restored: boolean;
  traitIds: ItemTraitId[];
  acquiredAt: number;
  restorationGrade?: RestorationGrade;
}

export interface BusinessUpgradeState {
  warehouse: number;
  contractsDesk: number;
  showroom: number;
}

export interface AuctionHistoryEntry {
  id: string;
  occurredAt: string;
  lotId: string;
  tierId: 'garage' | 'estate' | 'collector';
  outcome: AuctionHistoryOutcome;
  finalBid: number;
  sales: number;
  keptValue: number;
  estimatedResult: number;
  daily: boolean;
  modifierId?: string;
}

export interface PlayerSave {
  version: 1;
  updatedAt: number;
  cash: number;
  collection: string[];
  collectionItems?: CollectionItem[];
  claimedSetRewards: string[];
  reputationXp: number;
  lastDailyCompletedDay: string | null;
  onboardingComplete: boolean;
  auctionsWon: number;
  auctionsPlayed: number;
  lifetimeSales: number;
  highestCash: number;
  contractDayKey: string | null;
  contractProgress: Record<string, number>;
  claimedContractRewards: string[];
  claimedAchievements: string[];
  businessUpgrades: BusinessUpgradeState;
  auctionHistory: AuctionHistoryEntry[];
  buyerMarketDayKey: string | null;
  claimedBuyerOfferIds: string[];
  discoveryChainProgress: Record<string, number>;
  discoveryChainLastAuction: Record<string, number>;
  completedDiscoveryChains: string[];
}
