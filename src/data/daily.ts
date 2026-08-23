import { unlockedAuctionTiers, type AuctionTierId } from './tiers';

export interface DailySpecialDefinition {
  dayKey: string;
  tierId: AuctionTierId;
  lotId: string;
  valueMultiplier: number;
  reputationMultiplier: number;
}

export function localDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailySpecial(dayKey: string, reputationXp: number): DailySpecialDefinition {
  const candidates = unlockedAuctionTiers(reputationXp).flatMap((tier) =>
    tier.lotIds.map((lotId) => ({ tierId: tier.id, lotId })),
  );
  const fallback = candidates[0];
  if (!fallback) throw new Error('No unlocked daily auction candidates');

  const selected = candidates[stableHash(dayKey) % candidates.length] ?? fallback;
  return {
    dayKey,
    tierId: selected.tierId,
    lotId: selected.lotId,
    valueMultiplier: 1.2,
    reputationMultiplier: 1.5,
  };
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
