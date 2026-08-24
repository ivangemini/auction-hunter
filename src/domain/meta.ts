import type {
  AchievementMetric,
  BusinessUpgradeId,
  BusinessUpgradeState,
  PlayerSave,
} from './types';

export interface DailyContractLike {
  id: string;
}

export function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectDailyContracts<T extends DailyContractLike>(
  pool: readonly T[],
  dayKey: string,
  count = 3,
): T[] {
  return [...pool]
    .sort((left, right) => {
      const leftScore = stableHash(`${dayKey}:${left.id}`);
      const rightScore = stableHash(`${dayKey}:${right.id}`);
      return leftScore - rightScore || left.id.localeCompare(right.id);
    })
    .slice(0, Math.max(0, Math.min(count, pool.length)));
}

export function clampUpgradeLevel(level: number, maxLevel = 3): number {
  if (!Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(maxLevel, Math.floor(level)));
}

export function businessUpgradeLevel(state: BusinessUpgradeState, id: BusinessUpgradeId): number {
  return clampUpgradeLevel(state[id]);
}

export function nextUpgradeCost(costs: readonly number[], currentLevel: number): number | null {
  const level = clampUpgradeLevel(currentLevel, costs.length);
  return level >= costs.length ? null : costs[level] ?? null;
}

export function collectionResaleRate(baseRate: number, warehouseLevel: number): number {
  return Math.min(0.8, Math.max(0, baseRate) + clampUpgradeLevel(warehouseLevel) * 0.05);
}

export function contractRewardMultiplier(contractsDeskLevel: number): number {
  return 1 + clampUpgradeLevel(contractsDeskLevel) * 0.1;
}

export function setRewardMultiplier(showroomLevel: number): number {
  return 1 + clampUpgradeLevel(showroomLevel) * 0.1;
}

export function scaledReward(baseReward: number, multiplier: number): number {
  const safeBase = Number.isFinite(baseReward) ? Math.max(0, baseReward) : 0;
  const safeMultiplier = Number.isFinite(multiplier) ? Math.max(0, multiplier) : 0;
  return Math.round((safeBase * safeMultiplier) / 10) * 10;
}

export function contractRewardValue(baseReward: number, contractsDeskLevel: number): number {
  return scaledReward(baseReward, contractRewardMultiplier(contractsDeskLevel));
}

export function setRewardValue(baseReward: number, showroomLevel: number): number {
  return scaledReward(baseReward, setRewardMultiplier(showroomLevel));
}

export function achievementMetricValue(save: PlayerSave, metric: AchievementMetric): number {
  switch (metric) {
    case 'auctionsPlayed': return save.auctionsPlayed;
    case 'auctionsWon': return save.auctionsWon;
    case 'uniqueCollection': return new Set(save.collection).size;
    case 'lifetimeSales': return save.lifetimeSales;
    case 'claimedSets': return save.claimedSetRewards.length;
    case 'reputationXp': return save.reputationXp;
    case 'highestCash': return save.highestCash;
  }
}
