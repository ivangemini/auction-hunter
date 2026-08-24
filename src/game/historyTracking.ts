import { registerAnalyticsSink, type AnalyticsEventMap } from '../analytics';
import type { AuctionHistoryEntry } from '../domain/types';
import { GameStore } from './store';

export function installAuctionHistoryTracking(): () => void {
  const store = new GameStore();
  let activeModifierId: string | undefined;

  return registerAnalyticsSink((event) => {
    if (event.eventName === 'auction_started') {
      const payload = event.payload as AnalyticsEventMap['auction_started'];
      activeModifierId = payload.modifierId;
      return;
    }

    if (event.eventName === 'auction_passed') {
      const payload = event.payload as AnalyticsEventMap['auction_passed'];
      store.recordAuctionHistory({
        id: event.eventId,
        occurredAt: event.occurredAt,
        lotId: payload.lotId,
        tierId: payload.tierId,
        outcome: 'passed',
        finalBid: payload.currentBid,
        sales: 0,
        keptValue: 0,
        estimatedResult: 0,
        daily: payload.daily,
        ...(activeModifierId ? { modifierId: activeModifierId } : {}),
      });
      activeModifierId = undefined;
      return;
    }

    if (event.eventName === 'round_completed') {
      const payload = event.payload as AnalyticsEventMap['round_completed'];
      const entry: AuctionHistoryEntry = {
        id: event.eventId,
        occurredAt: event.occurredAt,
        lotId: payload.lotId,
        tierId: payload.tierId,
        outcome: 'won',
        finalBid: payload.cost,
        sales: payload.sales,
        keptValue: payload.keptValue ?? 0,
        estimatedResult: payload.totalEstimatedResult ?? payload.sales - payload.cost,
        daily: payload.daily,
        ...(activeModifierId ? { modifierId: activeModifierId } : {}),
      };
      store.recordAuctionHistory(entry);
      activeModifierId = undefined;
    }
  });
}
