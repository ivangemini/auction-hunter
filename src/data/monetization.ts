import type { InterstitialPolicy, RewardedCashPolicy } from '../domain/monetization';

export const MONETIZATION_POLICY = {
  rewardedSummary: {
    rate: 0.25,
    minReward: 150,
    maxReward: 600,
  } satisfies RewardedCashPolicy,
  interstitial: {
    firstEligibleAuction: 2,
    everyAuctions: 3,
  } satisfies InterstitialPolicy,
} as const;
