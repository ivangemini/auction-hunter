export function collectionResaleValue(baseValue: number, resaleRate: number): number {
  if (!Number.isFinite(baseValue) || baseValue <= 0) return 0;
  const safeRate = Number.isFinite(resaleRate) ? Math.max(0, Math.min(1, resaleRate)) : 0;
  return Math.max(10, Math.round((baseValue * safeRate) / 10) * 10);
}

export function ownedCopies(collectionIds: readonly string[], itemId: string): number {
  return collectionIds.reduce((count, ownedId) => count + (ownedId === itemId ? 1 : 0), 0);
}
