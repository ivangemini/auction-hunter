import type { AuctionTierId } from './tiers';

export const ADVANCED_INSPECTION_MIN_REP = 220;

export const ADVANCED_INSPECTION_COST: Record<AuctionTierId, number> = {
  garage: 120,
  estate: 250,
  collector: 450,
};
