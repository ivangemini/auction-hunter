import type { LotModifierDefinition } from '../domain/lotModifier';
import type { AuctionTierId } from './tiers';

export const VIP_AUCTION_MIN_REP = 650;
export const VIP_AUCTION_CADENCE = 5;

export const VIP_AUCTION_MODIFIER: LotModifierDefinition = {
  id: 'vip-invitation',
  name: { ru: 'VIP-приглашение', en: 'VIP invitation' },
  description: {
    ru: 'Закрытые торги клуба: сильнее состав находок, выше резерв и дилеры готовы идти дальше обычного.',
    en: 'Closed club bidding: stronger finds, a higher reserve and dealers willing to push further than usual.',
  },
  itemCountDelta: 1,
  reserveMultiplier: 1.15,
  bidIncrementMultiplier: 1.25,
  marketMultiplier: 1.22,
  conditionDelta: { min: 0.05, max: 0.04 },
};

export function vipAuctionAvailable(
  tierId: AuctionTierId,
  reputationXp: number,
  auctionsPlayed: number,
): boolean {
  if (tierId !== 'collector' || reputationXp < VIP_AUCTION_MIN_REP) return false;
  const auctionIndex = Math.max(0, Math.floor(auctionsPlayed));
  return auctionIndex % VIP_AUCTION_CADENCE === VIP_AUCTION_CADENCE - 1;
}
