import { ITEM_BY_ID } from '../data/catalog';
import { ALL_LOTS } from '../data/catalogBreadth';
import { LOT_MODIFIERS, LOT_MODIFIER_CHANCE } from '../data/lotModifiers';
import { MARKET_TRENDS, MARKET_TREND_SCHEDULE } from '../data/marketTrends';
import { getAuctionTier, highestUnlockedAuctionTier, type AuctionTierId } from '../data/tiers';
import type { RandomSource } from '../domain/auction';
import { applyLotModifier, selectLotModifier, type LotModifierDefinition } from '../domain/lotModifier';
import { chooseDistinctRandom } from '../domain/lotSelection';
import {
  activeMarketTrendForAuction,
  marketTrendMultiplier,
  trendTouchesVisibleLot,
  type ActiveMarketTrend,
} from '../domain/marketTrend';
import type { ItemCategory, LotTemplate } from '../domain/types';

const LOT_CHOICE_COUNT = 3;
const ITEM_CATEGORY_BY_ID = new Map<string, ItemCategory>(
  [...ITEM_BY_ID.entries()].map(([itemId, item]) => [itemId, item.category]),
);

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
    .map((lotId) => ALL_LOTS.find((candidate) => candidate.id === lotId))
    .filter((candidate): candidate is LotTemplate => Boolean(candidate));
  const baseLots = chooseDistinctRandom(tierLots, LOT_CHOICE_COUNT, random);
  if (baseLots.length === 0) throw new Error(`No lot templates configured for tier ${tier.id}`);

  const activeTrend = activeMarketTrendForAuction(options.auctionsPlayed, MARKET_TRENDS, MARKET_TREND_SCHEDULE);
  const choices = baseLots.map((baseLot) => {
    const rareModifier = selectLotModifier(LOT_MODIFIERS, LOT_MODIFIER_CHANCE, random);
    const trendModifier = marketTrendModifierForLot(baseLot, activeTrend);
    const modifier = combineLotModifiers(rareModifier, trendModifier);
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

function marketTrendModifierForLot(
  lot: LotTemplate,
  activeTrend: ActiveMarketTrend | null,
): LotModifierDefinition | null {
  if (!activeTrend) return null;

  const affected = trendTouchesVisibleLot(lot, activeTrend, ITEM_CATEGORY_BY_ID);
  const multiplier = affected ? marketTrendMultiplier(activeTrend) : 1;
  const remaining = activeTrend.remainingAuctions;
  const trend = activeTrend.definition;

  return {
    id: `market-${trend.id}`,
    name: {
      ru: `${trend.name.ru} · ${remaining} аукц.`,
      en: `${trend.name.en} · ${remaining} auc.`,
    },
    description: {
      ru: `${trend.description.ru} ${affected ? 'Этот лот попадает под тренд.' : 'По видимым сигналам этот лот вне тренда.'}`,
      en: `${trend.description.en} ${affected ? 'This lot is exposed to the trend.' : 'Visible signals put this lot outside the trend.'}`,
    },
    marketMultiplier: multiplier,
  };
}

function combineLotModifiers(
  rareModifier: LotModifierDefinition | null,
  trendModifier: LotModifierDefinition | null,
): LotModifierDefinition | null {
  if (!rareModifier) return trendModifier;
  if (!trendModifier) return rareModifier;

  const conditionDelta = rareModifier.conditionDelta || trendModifier.conditionDelta
    ? {
      min: (rareModifier.conditionDelta?.min ?? 0) + (trendModifier.conditionDelta?.min ?? 0),
      max: (rareModifier.conditionDelta?.max ?? 0) + (trendModifier.conditionDelta?.max ?? 0),
    }
    : undefined;
  const clueLimit = rareModifier.clueLimit === undefined
    ? trendModifier.clueLimit
    : trendModifier.clueLimit === undefined
      ? rareModifier.clueLimit
      : Math.min(rareModifier.clueLimit, trendModifier.clueLimit);

  return {
    id: `${rareModifier.id}+${trendModifier.id}`,
    name: {
      ru: `${rareModifier.name.ru} / ${trendModifier.name.ru}`,
      en: `${rareModifier.name.en} / ${trendModifier.name.en}`,
    },
    description: {
      ru: `${rareModifier.description.ru} ${trendModifier.description.ru}`,
      en: `${rareModifier.description.en} ${trendModifier.description.en}`,
    },
    itemCountDelta: (rareModifier.itemCountDelta ?? 0) + (trendModifier.itemCountDelta ?? 0),
    reserveMultiplier: (rareModifier.reserveMultiplier ?? 1) * (trendModifier.reserveMultiplier ?? 1),
    bidIncrementMultiplier: (rareModifier.bidIncrementMultiplier ?? 1) * (trendModifier.bidIncrementMultiplier ?? 1),
    marketMultiplier: (rareModifier.marketMultiplier ?? 1) * (trendModifier.marketMultiplier ?? 1),
    ...(clueLimit === undefined ? {} : { clueLimit }),
    ...(conditionDelta ? { conditionDelta } : {}),
  };
}
