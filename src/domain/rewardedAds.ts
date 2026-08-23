export const ROUND_REWARDED_BONUS_RATE = 0.15;
export const ROUND_REWARDED_BONUS_MIN = 100;
export const ROUND_REWARDED_BONUS_MAX = 1000;
export const ROUND_REWARDED_BONUS_STEP = 25;

export function calculateRoundRewardedBonus(finalBid: number): number {
  const normalizedBid = Math.max(0, finalBid);
  const rawBonus = normalizedBid * ROUND_REWARDED_BONUS_RATE;
  const clampedBonus = Math.min(
    ROUND_REWARDED_BONUS_MAX,
    Math.max(ROUND_REWARDED_BONUS_MIN, rawBonus),
  );

  return Math.round(clampedBonus / ROUND_REWARDED_BONUS_STEP) * ROUND_REWARDED_BONUS_STEP;
}
