import type { AuctionHistoryEntry } from './types';

export const AUCTION_HISTORY_LIMIT = 20;

export interface LotHistorySummary {
  visits: number;
  wins: number;
  averageEstimatedResult: number | null;
}

export function appendAuctionHistory(
  history: readonly AuctionHistoryEntry[],
  entry: AuctionHistoryEntry,
  limit = AUCTION_HISTORY_LIMIT,
): AuctionHistoryEntry[] {
  const safeLimit = Math.max(1, Math.floor(limit));
  const withoutDuplicate = history.filter((candidate) => candidate.id !== entry.id);
  return [entry, ...withoutDuplicate].slice(0, safeLimit);
}

export function summarizeLotHistory(
  history: readonly AuctionHistoryEntry[],
  lotId: string,
): LotHistorySummary {
  const relevant = history.filter((entry) => entry.lotId === lotId && !entry.daily);
  const wins = relevant.filter((entry) => entry.outcome === 'won');
  const averageEstimatedResult = wins.length === 0
    ? null
    : Math.round(wins.reduce((sum, entry) => sum + entry.estimatedResult, 0) / wins.length);

  return {
    visits: relevant.length,
    wins: wins.length,
    averageEstimatedResult,
  };
}
