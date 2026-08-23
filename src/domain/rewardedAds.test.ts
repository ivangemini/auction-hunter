import { describe, expect, it } from 'vitest';
import {
  calculateRoundRewardedBonus,
  ROUND_REWARDED_BONUS_MAX,
  ROUND_REWARDED_BONUS_MIN,
} from './rewardedAds';

describe('calculateRoundRewardedBonus', () => {
  it('keeps early-game rewards meaningful with a floor', () => {
    expect(calculateRoundRewardedBonus(300)).toBe(ROUND_REWARDED_BONUS_MIN);
    expect(calculateRoundRewardedBonus(0)).toBe(ROUND_REWARDED_BONUS_MIN);
  });

  it('scales from the final bid and rounds to readable cash increments', () => {
    expect(calculateRoundRewardedBonus(900)).toBe(125);
    expect(calculateRoundRewardedBonus(1_000)).toBe(150);
    expect(calculateRoundRewardedBonus(2_000)).toBe(300);
  });

  it('caps the reward so rewarded video cannot dominate the economy', () => {
    expect(calculateRoundRewardedBonus(20_000)).toBe(ROUND_REWARDED_BONUS_MAX);
  });
});
