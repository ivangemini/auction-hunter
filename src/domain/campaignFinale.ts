import type { CampaignProgressState } from './types';

export interface FinaleLot {
  id: string;
  price: number;
  kind: 'evidence' | 'value';
  weight: number;
}

export interface FinaleState {
  budget: number;
  spent: number;
  acquiredLotIds: string[];
}

export type CampaignEpilogueId = 'ledger-restored' | 'dealer-king' | 'shared-truth' | 'unfinished-ledger';

export const FINALE_LOTS: readonly FinaleLot[] = [
  { id: 'veyr-master-ledger', price: 7800, kind: 'evidence', weight: 3 },
  { id: 'veyr-portrait-case', price: 6500, kind: 'value', weight: 1 },
  { id: 'veyr-cipher-cabinet', price: 7200, kind: 'evidence', weight: 3 },
  { id: 'veyr-chronometer', price: 9000, kind: 'value', weight: 2 },
] as const;

export function createFinaleState(budget = 16500): FinaleState {
  return { budget, spent: 0, acquiredLotIds: [] };
}

export function acquireFinaleLot(state: Readonly<FinaleState>, lot: FinaleLot): { ok: boolean; state: FinaleState } {
  if (state.acquiredLotIds.includes(lot.id)) return { ok: false, state: clone(state) };
  if (state.spent + lot.price > state.budget) return { ok: false, state: clone(state) };
  return {
    ok: true,
    state: {
      budget: state.budget,
      spent: state.spent + lot.price,
      acquiredLotIds: [...state.acquiredLotIds, lot.id],
    },
  };
}

export function remainingFinaleBudget(state: Readonly<FinaleState>): number {
  return Math.max(0, state.budget - state.spent);
}

export function resolveCampaignEpilogue(
  state: Readonly<FinaleState>,
  progress: Readonly<CampaignProgressState>,
): CampaignEpilogueId {
  const acquired = new Set(state.acquiredLotIds);
  const evidenceScore = FINALE_LOTS
    .filter((lot) => lot.kind === 'evidence' && acquired.has(lot.id))
    .reduce((sum, lot) => sum + lot.weight, 0);
  const valueScore = FINALE_LOTS
    .filter((lot) => lot.kind === 'value' && acquired.has(lot.id))
    .reduce((sum, lot) => sum + lot.weight, 0);
  const victorTrust = progress.relationshipTrust['npc-0'] ?? 0;
  const miraTrust = progress.relationshipTrust['npc-1'] ?? 0;
  const relationshipSupport = Math.max(victorTrust, miraTrust);

  if (evidenceScore >= 6) return relationshipSupport >= 12 ? 'shared-truth' : 'ledger-restored';
  if (valueScore >= 3) return 'dealer-king';
  return 'unfinished-ledger';
}

export function finaleReady(state: Readonly<FinaleState>): boolean {
  return state.acquiredLotIds.length >= 2;
}

function clone(state: Readonly<FinaleState>): FinaleState {
  return { budget: state.budget, spent: state.spent, acquiredLotIds: [...state.acquiredLotIds] };
}
