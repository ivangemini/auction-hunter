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
    lotIds: ['garage-17'],
    accent: 0xaeb5c0,
  },
  {
    id: 'estate',
    name: { ru: 'Наследственные лоты', en: 'Estate Auctions' },
    minReputationXp: 120,
    winXp: 60,
    lotIds: ['estate-42'],
    accent: 0x61a8ff,
  },
  {
    id: 'collector',
    name: { ru: 'Клуб коллекционеров', en: 'Collector Club' },
    minReputationXp: 320,
    winXp: 100,
    lotIds: ['collector-8'],
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
