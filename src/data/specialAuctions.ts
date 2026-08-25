import type { LotModifierDefinition } from '../domain/lotModifier';
import type { AuctionTierId } from './tiers';

export const SEALED_AUCTION_MIN_REP = 180;
export const SEALED_AUCTION_CADENCE = 5;
export const VIP_AUCTION_MIN_REP = 360;
export const VIP_AUCTION_CADENCE = 4;

export const SEALED_AUCTION_MODIFIER: LotModifierDefinition = {
  id: 'sealed-storage',
  name: { ru: 'Запечатанный склад', en: 'Sealed storage' },
  description: {
    ru: 'Доступна только одна внешняя зацепка. Внутри больше предметов и ниже старт, но состояние находок заметно менее предсказуемо.',
    en: 'Only one exterior clue is available. The lot starts cheaper and holds more items, but condition is meaningfully less predictable.',
  },
  itemCountDelta: 1,
  reserveMultiplier: 0.88,
  bidIncrementMultiplier: 1.1,
  clueLimit: 1,
  marketMultiplier: 1.08,
  conditionDelta: { min: -0.1, max: 0.05 },
};

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

export function sealedAuctionAvailable(
  tierId: AuctionTierId,
  reputationXp: number,
  auctionsPlayed: number,
): boolean {
  if (tierId !== 'estate' || reputationXp < SEALED_AUCTION_MIN_REP) return false;
  const auctionIndex = Math.max(0, Math.floor(auctionsPlayed));
  return auctionIndex % SEALED_AUCTION_CADENCE === SEALED_AUCTION_CADENCE - 1;
}

export function vipAuctionAvailable(
  tierId: AuctionTierId,
  reputationXp: number,
  auctionsPlayed: number,
): boolean {
  if (tierId !== 'collector' || reputationXp < VIP_AUCTION_MIN_REP) return false;
  const auctionIndex = Math.max(0, Math.floor(auctionsPlayed));
  return auctionIndex % VIP_AUCTION_CADENCE === VIP_AUCTION_CADENCE - 1;
}
