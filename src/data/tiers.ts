import type { LocalizedText } from '../domain/types';

export type AuctionTierId = 'garage' | 'estate' | 'collector';

export interface AuctionTierDefinition {
  id: AuctionTierId;
  name: LocalizedText;
  minReputationXp: number;
  winXp: number;
  lotIds: string[];
  accent: number;
}

export const AUCTION_TIERS: AuctionTierDefinition[] = [
  {
    id: 'garage',
    name: { ru: 'Гаражные торги', en: 'Garage Auctions' },
    minReputationXp: 0,
    winXp: 35,
    lotIds: [
      'garage-17', 'garage-31', 'moving-unit-6', 'flea-storage-12',
      'repair-shop-4', 'student-locker-28', 'radio-repair-unit-16', 'hobby-locker-22',
      'moving-sale-35', 'club-locker-11', 'maker-locker-41', 'toy-market-crate-9',
      'photo-lab-locker-27', 'rail-hobby-unit-44',
    ],
    accent: 0xaeb5c0,
  },
  {
    id: 'estate',
    name: { ru: 'Наследственные лоты', en: 'Estate Auctions' },
    minReputationXp: 120,
    winXp: 60,
    lotIds: [
      'estate-42', 'estate-attic-9', 'studio-estate-21', 'manor-basement-5',
      'photo-estate-13', 'theater-storage-7', 'library-estate-18', 'designer-loft-27',
      'music-estate-24', 'traveler-estate-12', 'writer-estate-33', 'collector-parlor-15',
      'scholar-estate-26', 'photographer-studio-34',
    ],
    accent: 0x61a8ff,
  },
  {
    id: 'collector',
    name: { ru: 'Клуб коллекционеров', en: 'Collector Club' },
    minReputationXp: 320,
    winXp: 100,
    lotIds: [
      'collector-8', 'dealer-vault-3', 'expo-crate-11', 'archive-vault-2',
      'retro-dealer-14', 'private-gallery-6', 'horology-case-5', 'private-archive-19',
      'design-vault-21', 'prototype-vault-7', 'media-vault-31', 'mechanical-vault-18',
      'jeweler-vault-12', 'prototype-gallery-23',
    ],
    accent: 0xe9b949,
  },
];

export function getAuctionTier(id: AuctionTierId): AuctionTierDefinition {
  const tier = AUCTION_TIERS.find((candidate) => candidate.id === id);
  if (!tier) throw new Error(`Unknown auction tier: ${id}`);
  return tier;
}

export function unlockedAuctionTiers(reputationXp: number): AuctionTierDefinition[] {
  return AUCTION_TIERS.filter((tier) => reputationXp >= tier.minReputationXp);
}

export function highestUnlockedAuctionTier(reputationXp: number): AuctionTierDefinition {
  const unlocked = unlockedAuctionTiers(reputationXp);
  return unlocked[unlocked.length - 1] ?? AUCTION_TIERS[0]!;
}
