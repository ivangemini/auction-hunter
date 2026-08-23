import { getAuctionTier } from './tiers';

export interface FirstSessionMilestone {
  id: 'first-win' | 'estate-unlock' | 'first-estate-win' | 'collector-unlock';
  targetMinute: number;
  targetWins: number;
  targetReputationXp: number;
}

const garage = getAuctionTier('garage');
const estate = getAuctionTier('estate');
const collector = getAuctionTier('collector');

export const FIRST_SESSION_CURVE: FirstSessionMilestone[] = [
  { id: 'first-win', targetMinute: 5, targetWins: 1, targetReputationXp: garage.winXp },
  { id: 'estate-unlock', targetMinute: 15, targetWins: 4, targetReputationXp: estate.minReputationXp },
  { id: 'first-estate-win', targetMinute: 20, targetWins: 5, targetReputationXp: garage.winXp * 4 + estate.winXp },
  { id: 'collector-unlock', targetMinute: 30, targetWins: 7, targetReputationXp: collector.minReputationXp },
];

export function projectedReputation(
  garageWins: number,
  estateWins: number,
  collectorWins = 0,
): number {
  return Math.max(0, garageWins) * garage.winXp
    + Math.max(0, estateWins) * estate.winXp
    + Math.max(0, collectorWins) * collector.winXp;
}
