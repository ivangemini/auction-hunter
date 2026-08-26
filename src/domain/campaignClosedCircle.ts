import type { CampaignProgressState } from './types';

export interface ClosedCirclePreviewItem {
  id: string;
  clueStrength: number;
  linkedToVeyr: boolean;
}

export interface ClosedCirclePreviewState {
  inspectedIds: string[];
  maxInspections: number;
}

export interface SealedBidResult {
  won: boolean;
  overpaid: boolean;
  bid: number;
  minimumWinningBid: number;
  softCap: number;
}

export interface SponsorOption {
  rivalId: string;
  trust: number;
  debt: number;
  rivalry: number;
  eligible: boolean;
  cashSettlement: number;
}

export function createClosedCirclePreview(maxInspections: number): ClosedCirclePreviewState {
  return {
    inspectedIds: [],
    maxInspections: Math.max(1, Math.trunc(maxInspections)),
  };
}

export function inspectClosedCircleItem(
  state: Readonly<ClosedCirclePreviewState>,
  itemId: string,
): { ok: boolean; state: ClosedCirclePreviewState } {
  if (state.inspectedIds.includes(itemId)) return { ok: true, state: clonePreview(state) };
  if (state.inspectedIds.length >= state.maxInspections) return { ok: false, state: clonePreview(state) };
  return {
    ok: true,
    state: {
      maxInspections: state.maxInspections,
      inspectedIds: [...state.inspectedIds, itemId],
    },
  };
}

export function closedCirclePreviewComplete(
  state: Readonly<ClosedCirclePreviewState>,
  requiredIds: readonly string[],
): boolean {
  return requiredIds.every((id) => state.inspectedIds.includes(id));
}

export function resolveClosedCircleSealedBid(
  bid: number,
  minimumWinningBid = 8200,
  softCap = 9600,
): SealedBidResult {
  const normalized = Math.max(0, Math.round(bid));
  return {
    won: normalized >= minimumWinningBid,
    overpaid: normalized > softCap,
    bid: normalized,
    minimumWinningBid,
    softCap,
  };
}

export function closedCircleSponsorOptions(
  progress: Readonly<CampaignProgressState>,
  rivalIds: readonly string[] = ['npc-0', 'npc-1'],
): SponsorOption[] {
  return rivalIds.map((rivalId) => {
    const trust = progress.relationshipTrust[rivalId] ?? 0;
    const debt = progress.relationshipDebt[rivalId] ?? 0;
    const rivalry = progress.relationshipRivalry[rivalId] ?? 0;
    const relationshipScore = trust - rivalry - Math.max(0, debt - 8) * 0.5;
    const eligible = relationshipScore >= 5;
    const cashSettlement = eligible ? 0 : Math.max(900, Math.round(1800 + debt * 45 + rivalry * 35 - trust * 25));
    return { rivalId, trust, debt, rivalry, eligible, cashSettlement };
  });
}

export function bestClosedCircleSponsor(options: readonly SponsorOption[]): SponsorOption | null {
  const eligible = options.filter((option) => option.eligible);
  if (eligible.length === 0) return null;
  return [...eligible].sort((left, right) => {
    const leftScore = left.trust - left.rivalry - left.debt * 0.25;
    const rightScore = right.trust - right.rivalry - right.debt * 0.25;
    return rightScore - leftScore || left.rivalId.localeCompare(right.rivalId);
  })[0] ?? null;
}

function clonePreview(state: Readonly<ClosedCirclePreviewState>): ClosedCirclePreviewState {
  return { maxInspections: state.maxInspections, inspectedIds: [...state.inspectedIds] };
}
