import type { AuctionHistoryEntry } from './types';

export const AUCTION_HISTORY_LIMIT = 20;

export function appendAuctionHistory(
  history: readonly AuctionHistoryEntry[],
  entry: AuctionHistoryEntry,
  limit = AUCTION_HISTORY_LIMIT,
): AuctionHistoryEntry[] {
  const safeLimit = Math.max(1, Math.floor(limit));
  const withoutDuplicate = history.filter((candidate) => candidate.id !== entry.id);
  return [entry, ...withoutDuplicate].slice(0, safeLimit);
}
