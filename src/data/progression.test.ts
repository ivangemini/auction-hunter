import { describe, expect, it } from 'vitest';
import { FIRST_SESSION_CURVE, projectedReputation } from './progression';
import { getAuctionTier } from './tiers';

describe('first-session progression', () => {
  it('requires four Garage wins for Estate', () => {
    const estate = getAuctionTier('estate');
    expect(projectedReputation(3, 0)).toBeLessThan(estate.minReputationXp);
    expect(projectedReputation(4, 0)).toBeGreaterThanOrEqual(estate.minReputationXp);
  });

  it('unlocks Collector after seven planned wins at the 30-minute target', () => {
    const collector = getAuctionTier('collector');
    const reputation = projectedReputation(4, 3);
    const finalMilestone = FIRST_SESSION_CURVE[FIRST_SESSION_CURVE.length - 1];

    expect(reputation).toBe(collector.minReputationXp);
    expect(finalMilestone?.id).toBe('collector-unlock');
    expect(finalMilestone?.targetWins).toBe(7);
    expect(finalMilestone?.targetMinute).toBe(30);
  });
});
