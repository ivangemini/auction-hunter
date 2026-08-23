import { describe, expect, it } from 'vitest';
import { rewardedSummaryBonus, shouldRequestInterstitial } from './monetization';

const rewardedPolicy = {
  rate: 0.25,
  minReward: 150,
  maxReward: 600,
};

const interstitialPolicy = {
  firstEligibleAuction: 2,
  everyAuctions: 3,
};

describe('rewarded summary bonus', () => {
  it('keeps the optional reward useful without allowing runaway cash inflation', () => {
    expect(rewardedSummaryBonus(0, rewardedPolicy)).toBe(150);
    expect(rewardedSummaryBonus(1000, rewardedPolicy)).toBe(250);
    expect(rewardedSummaryBonus(10000, rewardedPolicy)).toBe(600);
  });
});

describe('interstitial cadence', () => {
  it('starts after two auctions and then only requests ads every three auctions', () => {
    expect(shouldRequestInterstitial(1, interstitialPolicy)).toBe(false);
    expect(shouldRequestInterstitial(2, interstitialPolicy)).toBe(true);
    expect(shouldRequestInterstitial(3, interstitialPolicy)).toBe(false);
    expect(shouldRequestInterstitial(4, interstitialPolicy)).toBe(false);
    expect(shouldRequestInterstitial(5, interstitialPolicy)).toBe(true);
    expect(shouldRequestInterstitial(8, interstitialPolicy)).toBe(true);
  });
});
