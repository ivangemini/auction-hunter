import type { CampaignProgressState } from './types';

export interface CampaignRivalEffect {
  trust: number;
  rivalry: number;
  debt: number;
  pressureMultiplier: number;
  intelLevel: 0 | 1 | 2;
}

export function campaignRivalEffect(
  progress: Readonly<CampaignProgressState>,
  rivalId: string,
): CampaignRivalEffect {
  const trust = bounded(progress.relationshipTrust[rivalId] ?? 0);
  const rivalry = bounded(progress.relationshipRivalry[rivalId] ?? 0);
  const debt = bounded(progress.relationshipDebt[rivalId] ?? 0);

  // Trust makes a rival less willing to run the player up. Rivalry and owed favors
  // create leverage in the opposite direction. Keep the total effect deliberately
  // bounded so campaign state changes tactics without invalidating economy balance.
  const pressureDelta = (-trust * 0.0008) + (rivalry * 0.001) + (Math.max(0, debt) * 0.00045);
  const pressureMultiplier = clamp(1 + pressureDelta, 0.9, 1.12);

  const intelScore = trust - rivalry * 0.35 - Math.max(0, debt) * 0.2;
  const intelLevel: 0 | 1 | 2 = intelScore >= 18 ? 2 : intelScore >= 6 ? 1 : 0;

  return { trust, rivalry, debt, pressureMultiplier, intelLevel };
}

function bounded(value: number): number {
  return Math.max(-100, Math.min(100, Math.trunc(value)));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
