export interface RewardedCashPolicy {
  rate: number;
  minReward: number;
  maxReward: number;
}

export interface InterstitialPolicy {
  firstEligibleAuction: number;
  everyAuctions: number;
}

export function rewardedSummaryBonus(roundSales: number, policy: RewardedCashPolicy): number {
  const safeSales = Number.isFinite(roundSales) ? Math.max(0, roundSales) : 0;
  const safeRate = Number.isFinite(policy.rate) ? Math.max(0, policy.rate) : 0;
  const minimum = Number.isFinite(policy.minReward) ? Math.max(0, policy.minReward) : 0;
  const maximumInput = Number.isFinite(policy.maxReward) ? Math.max(0, policy.maxReward) : minimum;
  const maximum = Math.max(minimum, maximumInput);
  const rawReward = safeSales * safeRate;
  return roundToTen(Math.min(maximum, Math.max(minimum, rawReward)));
}

export function shouldRequestInterstitial(auctionsPlayed: number, policy: InterstitialPolicy): boolean {
  const auctionNumber = Math.max(0, Math.floor(auctionsPlayed));
  const firstEligible = Math.max(1, Math.floor(policy.firstEligibleAuction));
  const cadence = Math.max(1, Math.floor(policy.everyAuctions));

  if (auctionNumber < firstEligible) return false;
  return (auctionNumber - firstEligible) % cadence === 0;
}

function roundToTen(value: number): number {
  return Math.round(value / 10) * 10;
}
