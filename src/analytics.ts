import type { Locale, RestorationGrade } from './domain/types';
import type { AuctionTierId } from './data/tiers';

export const ANALYTICS_SCHEMA_VERSION = 1 as const;
export const ANALYTICS_DOM_EVENT = 'auction-hunter:analytics';

export type RewardedAdPlacement = 'round_summary_cash';
export type RewardedAdAnalyticsResult = 'rewarded' | 'closed' | 'unavailable' | 'error';

export interface AnalyticsEventMap {
  session_started: {
    locale: Locale;
  };
  onboarding_completed: Record<string, never>;
  tier_selected: {
    tierId: AuctionTierId;
    reputationXp: number;
  };
  daily_special_activated: {
    dayKey: string;
    tierId: AuctionTierId;
    lotId: string;
  };
  auction_started: {
    auctionNumber: number;
    lotId?: string;
    tierId?: AuctionTierId;
    daily?: boolean;
    openingBid?: number;
  };
  bid_placed: {
    lotId: string;
    tierId: AuctionTierId;
    bid: number;
    cash: number;
    daily: boolean;
  };
  auction_won: {
    finalBid: number;
    reputationGain: number;
    auctionsWon: number;
    lotId?: string;
    tierId?: AuctionTierId;
    daily: boolean;
  };
  auction_passed: {
    lotId: string;
    tierId: AuctionTierId;
    currentBid: number;
    daily: boolean;
  };
  item_revealed: {
    itemId: string;
    rarity: string;
  };
  item_appraised: {
    itemId: string;
    value: number;
    condition: number;
  };
  restoration_completed: {
    itemId: string;
    grade: RestorationGrade;
    conditionBefore: number;
    conditionAfter: number;
    valueGain: number;
  };
  item_dispositioned: {
    disposition: 'sell' | 'keep';
    itemId?: string;
    value?: number;
  };
  collection_set_reward_claimed: {
    setId: string;
    reward: number;
  };
  daily_special_completed: {
    dayKey: string;
    reputationGain: number;
  };
  round_completed: {
    lotId: string;
    tierId: AuctionTierId;
    cost: number;
    sales: number;
    kept: number;
    daily: boolean;
  };
  rewarded_ad_requested: {
    placement: RewardedAdPlacement;
    reward: number;
    finalBid: number;
  };
  rewarded_ad_result: {
    placement: RewardedAdPlacement;
    reward: number;
    result: RewardedAdAnalyticsResult;
  };
  rewarded_cash_granted: {
    placement: RewardedAdPlacement;
    amount: number;
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
const sinks = new Set<AnalyticsSink>();

export function trackEvent<K extends AnalyticsEventName>(
  eventName: K,
  payload: AnalyticsEventMap[K],
): AnalyticsEnvelope<K> {
  sequence += 1;
  const event: AnalyticsEnvelope<K> = {
    schemaVersion: ANALYTICS_SCHEMA_VERSION,
    eventName,
    eventId: createId('event'),
    sessionId,
    sequence,
    occurredAt: new Date().toISOString(),
    payload,
  };

  for (const sink of sinks) sink(event as AnalyticsEnvelope);

  if (typeof window !== 'undefined' && typeof window.CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ANALYTICS_DOM_EVENT, { detail: event }));
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
