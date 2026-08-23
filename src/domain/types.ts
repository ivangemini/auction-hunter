export type Locale = 'ru' | 'en';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

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
}

export interface PlayerSave {
  version: 1;
  cash: number;
  collection: string[];
  auctionsWon: number;
  auctionsPlayed: number;
  lifetimeSales: number;
}
