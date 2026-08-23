export type Locale = 'ru' | 'en';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type RestorationGrade = 'perfect' | 'good' | 'rough';

export interface LocalizedText {
  ru: string;
  en: string;
}

export interface ItemDefinition {
  id: string;
  name: LocalizedText;
  category: 'electronics' | 'watches' | 'toys' | 'art' | 'tools' | 'collectibles';
  rarity: Rarity;
  baseValue: number;
}

export interface LotTemplate {
  id: string;
  name: LocalizedText;
  location: LocalizedText;
  clues: LocalizedText[];
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
  restorationGrade?: RestorationGrade;
  restorationGain?: number;
}

export interface PlayerSave {
  version: 1;
  updatedAt: number;
  cash: number;
  collection: string[];
  claimedSetRewards: string[];
  reputationXp: number;
  lastDailyCompletedDay: string | null;
  onboardingComplete: boolean;
  auctionsWon: number;
  auctionsPlayed: number;
  lifetimeSales: number;
}
