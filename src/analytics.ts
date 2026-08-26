import type { BusinessUpgradeId, ItemTraitId, Locale, RestorationGrade } from './domain/types';
import type { InspectionConditionBand } from './domain/inspection';
import type { RestorationMode } from './domain/restoration';
import type { AuctionTierId } from './data/tiers';
import type { RivalSignatureBehavior } from './domain/auction';
import type { CampaignChapterId } from './data/campaign';

export const ANALYTICS_SCHEMA_VERSION = 1 as const;
export const ANALYTICS_DOM_EVENT = 'auction-hunter:analytics';

interface MarketTrendAnalyticsContext {
  marketTrendId?: string;
  marketTrendRemainingAuctions?: number;
}

export interface AnalyticsEventMap {
  session_started: { locale: Locale };
  onboarding_completed: Record<string, never>;
  campaign_mission_started: { chapterId: CampaignChapterId; missionId: string };
  campaign_mission_completed: {
    chapterId: CampaignChapterId;
    missionId: string;
    rewardCash: number;
    rewardRep: number;
    evidenceIds: string[];
  };
  campaign_branch_chosen: { choiceId: string; rivalId?: string };
  campaign_relationship_auction_effect: {
    rivalId: string;
    pressureMultiplier: number;
    intelLevel: 0 | 1 | 2;
    trust: number;
    rivalry: number;
    debt: number;
  };
  tier_selected: { tierId: AuctionTierId; reputationXp: number };
  lot_options_presented: {
    tierId: AuctionTierId;
    lotIds: string[];
    modifierIds: Array<string | null>;
    marketTrendId?: string;
    marketTrendRemainingAuctions?: number;
    marketCycle?: number;
  };
  lot_option_selected: {
    tierId: AuctionTierId;
    lotId: string;
    optionIndex: number;
    reservePrice: number;
    itemCount: number;
    modifierId?: string;
    marketTrendId?: string;
    marketTrendRemainingAuctions?: number;
    marketCycle?: number;
  };
  daily_special_activated: { dayKey: string; tierId: AuctionTierId; lotId: string };
  auction_started: {
    auctionNumber: number;
    lotId?: string;
    tierId?: AuctionTierId;
    daily?: boolean;
    openingBid?: number;
    modifierId?: string;
  };
  advanced_inspection_used: {
    lotId: string;
    tierId: AuctionTierId;
    fee: number;
    conditionBand: InspectionConditionBand;
    premiumFinds: number;
    daily: boolean;
    modifierId?: string;
  };
  bid_placed: { lotId: string; tierId: AuctionTierId; bid: number; cash: number; daily: boolean };
  auction_won: {
    finalBid: number;
    reputationGain: number;
    auctionsWon: number;
    lotId?: string;
    tierId?: AuctionTierId;
    daily: boolean;
  };
  auction_passed: { lotId: string; tierId: AuctionTierId; currentBid: number; daily: boolean };
  rival_auction_resolved: {
    opponentIds: string[];
    outcome: 'player-win' | 'player-pass';
    winningRivalId?: string;
  };
  rival_signature_move_used: {
    rivalId: string;
    behavior: RivalSignatureBehavior;
    lotId: string;
    bid: number;
  };
  item_revealed: { itemId: string; rarity: string };
  item_appraised: {
    itemId: string;
    value: number;
    condition: number;
    traitIds?: ItemTraitId[];
    traitMultiplier?: number;
  };
  jackpot_variant_revealed: {
    variantId: string;
    itemId: string;
    traitIds: ItemTraitId[];
    appraisedValue: number;
  };
  restoration_completed: {
    itemId: string;
    mode?: RestorationMode;
    grade: RestorationGrade;
    conditionBefore: number;
    conditionAfter: number;
    valueGain: number;
  };
  item_dispositioned: {
    disposition: 'sell' | 'keep';
    itemId?: string;
    value?: number;
    source?: 'round' | 'collection';
  };
  discovery_chain_progressed: {
    chainId: string;
    itemId: string;
    stage: number;
    totalStages: number;
    auctionNumber: number;
    completed: boolean;
    rewardCash: number;
    rewardReputationXp: number;
  };
  buyer_sale_completed: {
    buyerId: string;
    itemId: string;
    dayKey: string;
    value: number;
    premiumMultiplier: number;
    traitIds: ItemTraitId[];
    marketTrendId?: string;
    marketTrendRemainingAuctions?: number;
  };
  collector_request_completed: {
    requestId: string;
    requestKey: string;
    tier: 'common' | 'demanding' | 'rare';
    itemId: string;
    value: number;
    premiumMultiplier: number;
    remainingAuctions: number;
    traitIds: ItemTraitId[];
  };
  collection_set_reward_claimed: { setId: string; reward: number };
  daily_special_completed: { dayKey: string; reputationGain: number };
  daily_contract_reward_claimed: { contractId: string; dayKey: string; reward: number };
  achievement_reward_claimed: { achievementId: string; reward: number };
  business_upgrade_purchased: { upgradeId: BusinessUpgradeId; level: number; cost: number };
  round_completed: {
    lotId: string;
    tierId: AuctionTierId;
    cost: number;
    sales: number;
    kept: number;
    keptValue?: number;
    totalEstimatedResult?: number;
    daily: boolean;
  };
  rewarded_ad_requested: { placement: 'round_summary'; reward: number };
  rewarded_ad_rewarded: { placement: 'round_summary'; reward: number };
  rewarded_ad_closed: {
    placement: 'round_summary';
    reward: number;
    rewarded: boolean;
    wasShown: boolean;
    outcome: 'rewarded' | 'closed' | 'unavailable' | 'error';
  };
  interstitial_ad_requested: { placement: 'between_auctions'; auctionNumber: number };
  interstitial_ad_closed: {
    placement: 'between_auctions';
    auctionNumber: number;
    wasShown: boolean;
    outcome: 'closed' | 'unavailable' | 'error';
  };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;

export interface AnalyticsEnvelope<K extends AnalyticsEventName = AnalyticsEventName> {
  schemaVersion: typeof ANALYTICS_SCHEMA_VERSION;
  eventName: K;
  eventId: string;
  sessionId: string;
  sequence: number;
  occurredAt: string;
  payload: AnalyticsEventMap[K];
}

export type AnalyticsSink = (event: AnalyticsEnvelope) => void;

const sessionId = createId('session');
let sequence = 0;
let marketCycle = 1;
let marketTrendContext: MarketTrendAnalyticsContext = {};
const presentedTiersInMarketCycle = new Set<AuctionTierId>();
const sinks = new Set<AnalyticsSink>();

export function setMarketTrendAnalyticsContext(context: MarketTrendAnalyticsContext | null): void {
  marketTrendContext = context
    ? {
      ...(context.marketTrendId ? { marketTrendId: context.marketTrendId } : {}),
      ...(context.marketTrendRemainingAuctions === undefined
        ? {}
        : { marketTrendRemainingAuctions: Math.max(0, Math.floor(context.marketTrendRemainingAuctions)) }),
    }
    : {};
}

export function trackEvent<K extends AnalyticsEventName>(
  eventName: K,
  payload: AnalyticsEventMap[K],
): AnalyticsEnvelope<K> {
  let effectivePayload = payload;
  let shouldDispatch = true;

  if (eventName === 'lot_options_presented') {
    const selectionPayload = payload as AnalyticsEventMap['lot_options_presented'];
    effectivePayload = { ...selectionPayload, ...marketTrendContext, marketCycle } as AnalyticsEventMap[K];
    if (presentedTiersInMarketCycle.has(selectionPayload.tierId)) {
      shouldDispatch = false;
    } else {
      presentedTiersInMarketCycle.add(selectionPayload.tierId);
    }
  } else if (eventName === 'lot_option_selected') {
    const selectionPayload = payload as AnalyticsEventMap['lot_option_selected'];
    effectivePayload = { ...selectionPayload, ...marketTrendContext, marketCycle } as AnalyticsEventMap[K];
  } else if (eventName === 'buyer_sale_completed') {
    const buyerPayload = payload as AnalyticsEventMap['buyer_sale_completed'];
    effectivePayload = { ...buyerPayload, ...marketTrendContext } as AnalyticsEventMap[K];
  }

  sequence += 1;
  const event: AnalyticsEnvelope<K> = {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    eventName,
    eventId: createId('event'),
    sessionId,
    sequence,
    occurredAt: new Date().toISOString(),
    payload: effectivePayload,
  };

  if (shouldDispatch) {
    for (const sink of sinks) sink(event as AnalyticsEnvelope);

    if (typeof window !== 'undefined' && typeof window.CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ANALYTICS_DOM_EVENT, { detail: event }));
    }
  }

  if (eventName === 'auction_started') {
    marketCycle += 1;
    presentedTiersInMarketCycle.clear();
  }

  return event;
}

export function registerAnalyticsSink(sink: AnalyticsSink): () => void {
  sinks.add(sink);
  return () => sinks.delete(sink);
}

function createId(prefix: string): string {
  const randomId = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
}
