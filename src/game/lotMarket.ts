import { LOTS } from '../data/catalog';
import { LOT_MODIFIERS, LOT_MODIFIER_CHANCE } from '../data/lotModifiers';
import { getAuctionTier, highestUnlockedAuctionTier, type AuctionTierId } from '../data/tiers';
import type { RandomSource } from '../domain/auction';
import { applyLotModifier, selectLotModifier, type LotModifierDefinition } from '../domain/lotModifier';
import { chooseDistinctRandom } from '../domain/lotSelection';
import type { LotTemplate } from '../domain/types';

const LOT_CHOICE_COUNT = 3;

export interface LotChoice {
  lot: LotTemplate;
  modifier: LotModifierDefinition | null;
}

export interface LotMarketResult {
  tierId: AuctionTierId;
  choices: LotChoice[];
}

interface PrepareLotMarketOptions {
  requestedTierId: AuctionTierId;
  reputationXp: number;
  auctionsPlayed: number;
  random?: RandomSource;
}

let cachedAuctionCycle = -1;
const cachedChoicesByTier = new Map<AuctionTierId, LotChoice[]>();

export function prepareLotMarket(options: PrepareLotMarketOptions): LotMarketResult {
  const random = options.random ?? Math.random;
  let tier = getAuctionTier(options.requestedTierId);
  if (options.reputationXp < tier.minReputationXp) {
    tier = highestUnlockedAuctionTier(options.reputationXp);
  }

  if (cachedAuctionCycle !== options.auctionsPlayed) {
    cachedAuctionCycle = options.auctionsPlayed;
    cachedChoicesByTier.clear();
  }

  const cached = cachedChoicesByTier.get(tier.id);
  if (cached) return { tierId: tier.id, choices: cached };

  const tierLots = tier.lotIds
    .map((lotId) => LOTS.find((candidate) => candidate.id === lotId))
    .filter((candidate): candidate is LotTemplate => Boolean(candidate));
  const baseLots = chooseDistinctRandom(tierLots, LOT_CHOICE_COUNT, random);
  if (baseLots.length === 0) throw new Error(`No lot templates configured for tier ${tier.id}`);

  const choices = baseLots.map((baseLot) => {
    const modifier = selectLotModifier(LOT_MODIFIERS, LOT_MODIFIER_CHANCE, random);
    return {
      lot: applyLotModifier(baseLot, modifier),
      modifier,
    };
  });

  cachedChoicesByTier.set(tier.id, choices);
  return { tierId: tier.id, choices };
}

export function resetLotMarketCache(): void {
  cachedAuctionCycle = -1;
  cachedChoicesByTier.clear();
}
