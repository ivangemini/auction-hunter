import { ITEM_BY_ID } from '../data/catalog';
import { ALL_LOTS } from '../data/catalogBreadth';
import { LOT_MODIFIERS, LOT_MODIFIER_CHANCE } from '../data/lotModifiers';
import { MARKET_TRENDS, MARKET_TREND_SCHEDULE } from '../data/marketTrends';
import { VIP_AUCTION_MODIFIER, vipAuctionAvailable } from '../data/specialAuctions';
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
  marketTrendId?: string;
  marketTrendRemainingAuctions?: number;
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

  const activeTrend = activeMarketTrendForAuction(options.auctionsPlayed, MARKET_TRENDS, MARKET_TREND_SCHEDULE);
  const trendMetadata = activeTrend
    ? {
      marketTrendId: activeTrend.definition.id,
      marketTrendRemainingAuctions: activeTrend.remainingAuctions,
    }
    : {};

  const cached = cachedChoicesByTier.get(tier.id);
  if (cached) return { tierId: tier.id, choices: cached, ...trendMetadata };

  const tierLots = tier.lotIds
    .map((lotId) => ALL_LOTS.find((candidate) => candidate.id === lotId))
    .filter((candidate): candidate is LotTemplate => Boolean(candidate));
  const baseLots = chooseDistinctRandom(tierLots, LOT_CHOICE_COUNT, random);
  if (baseLots.length === 0) throw new Error(`No lot templates configured for tier ${tier.id}`);

  const vipAvailable = vipAuctionAvailable(tier.id, options.reputationXp, options.auctionsPlayed);
  const choices = baseLots.map((baseLot, index) => {
    const rareModifier = vipAvailable && index === 0
      ? null
      : selectLotModifier(LOT_MODIFIERS, LOT_MODIFIER_CHANCE, random);
    const trendModifier = marketTrendModifierForLot(baseLot, activeTrend);
    const vipModifier = vipAvailable && index === 0 ? VIP_AUCTION_MODIFIER : null;
    const modifier = combineLotModifiers(combineLotModifiers(rareModifier, trendModifier), vipModifier);
    return {
      lot: applyLotModifier(baseLot, modifier),
      modifier,
    };
  });

  cachedChoicesByTier.set(tier.id, choices);
  return { tierId: tier.id, choices, ...trendMetadata };
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
  left: LotModifierDefinition | null,
  right: LotModifierDefinition | null,
): LotModifierDefinition | null {
  if (!left) return right;
  if (!right) return left;

  const conditionDelta = left.conditionDelta || right.conditionDelta
    ? {
      min: (left.conditionDelta?.min ?? 0) + (right.conditionDelta?.min ?? 0),
      max: (left.conditionDelta?.max ?? 0) + (right.conditionDelta?.max ?? 0),
    }
    : undefined;
  const clueLimit = left.clueLimit === undefined
    ? right.clueLimit
    : right.clueLimit === undefined
      ? left.clueLimit
      : Math.min(left.clueLimit, right.clueLimit);

  return {
    id: `${left.id}+${right.id}`,
    name: {
      ru: `${left.name.ru} / ${right.name.ru}`,
      en: `${left.name.en} / ${right.name.en}`,
    },
    description: {
      ru: `${left.description.ru} ${right.description.ru}`,
      en: `${left.description.en} ${right.description.en}`,
    },
    itemCountDelta: (left.itemCountDelta ?? 0) + (right.itemCountDelta ?? 0),
    reserveMultiplier: (left.reserveMultiplier ?? 1) * (right.reserveMultiplier ?? 1),
    bidIncrementMultiplier: (left.bidIncrementMultiplier ?? 1) * (right.bidIncrementMultiplier ?? 1),
    marketMultiplier: (left.marketMultiplier ?? 1) * (right.marketMultiplier ?? 1),
    ...(clueLimit === undefined ? {} : { clueLimit }),
    ...(conditionDelta ? { conditionDelta } : {}),
  };
}
