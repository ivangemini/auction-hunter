import { describe, expect, it } from 'vitest';
import { appendAuctionHistory, AUCTION_HISTORY_LIMIT } from './history';
import type { AuctionHistoryEntry } from './types';

function entry(index: number): AuctionHistoryEntry {
  return {
    id: `event-${index}`,
    occurredAt: `2026-08-24T07:${String(index).padStart(2, '0')}:00.000Z`,
    lotId: 'garage-17',
    tierId: 'garage',
    outcome: 'won',
    finalBid: 1000 + index,
    sales: 1400,
    keptValue: 0,
    estimatedResult: 400,
    daily: false,
  };
}

describe('auction history', () => {
  it('keeps newest outcomes first and caps persisted history', () => {
    let history: AuctionHistoryEntry[] = [];
    for (let index = 0; index < AUCTION_HISTORY_LIMIT + 5; index += 1) {
      history = appendAuctionHistory(history, entry(index));
    }

    expect(history).toHaveLength(AUCTION_HISTORY_LIMIT);
    expect(history[0]?.id).toBe(`event-${AUCTION_HISTORY_LIMIT + 4}`);
    expect(history.at(-1)?.id).toBe('event-5');
  });

  it('deduplicates by analytics event id', () => {
    const original = entry(1);
    const replacement = { ...original, estimatedResult: 999 };
    const history = appendAuctionHistory([original], replacement);

    expect(history).toHaveLength(1);
    expect(history[0]?.estimatedResult).toBe(999);
  });
});
