export interface LinkedBudgetOffer {
  id: string;
  price: number;
  target: boolean;
}

export interface LinkedBudgetState {
  budget: number;
  spent: number;
  acquiredIds: string[];
  skippedIds: string[];
}

export type LinkedBudgetDecision =
  | { ok: true; state: LinkedBudgetState }
  | { ok: false; reason: 'already-resolved' | 'over-budget'; state: LinkedBudgetState };

export function createLinkedBudgetState(budget: number): LinkedBudgetState {
  return {
    budget: Math.max(0, Math.round(budget)),
    spent: 0,
    acquiredIds: [],
    skippedIds: [],
  };
}

export function buyLinkedBudgetOffer(state: Readonly<LinkedBudgetState>, offer: Readonly<LinkedBudgetOffer>): LinkedBudgetDecision {
  if (resolved(state, offer.id)) return { ok: false, reason: 'already-resolved', state: clone(state) };
  const price = Math.max(0, Math.round(offer.price));
  if (state.spent + price > state.budget) return { ok: false, reason: 'over-budget', state: clone(state) };
  return {
    ok: true,
    state: {
      ...clone(state),
      spent: state.spent + price,
      acquiredIds: [...state.acquiredIds, offer.id],
    },
  };
}

export function skipLinkedBudgetOffer(state: Readonly<LinkedBudgetState>, offerId: string): LinkedBudgetState {
  if (resolved(state, offerId)) return clone(state);
  return { ...clone(state), skippedIds: [...state.skippedIds, offerId] };
}

export function linkedBudgetMissionComplete(
  state: Readonly<LinkedBudgetState>,
  requiredTargetIds: readonly string[],
): boolean {
  const acquired = new Set(state.acquiredIds);
  return state.spent <= state.budget && requiredTargetIds.every((id) => acquired.has(id));
}

export function linkedBudgetMissionFailed(
  state: Readonly<LinkedBudgetState>,
  offers: readonly LinkedBudgetOffer[],
  requiredTargetIds: readonly string[],
): boolean {
  if (linkedBudgetMissionComplete(state, requiredTargetIds)) return false;
  const required = new Set(requiredTargetIds);
  if (state.skippedIds.some((id) => required.has(id))) return true;
  const unresolvedRequired = requiredTargetIds.filter((id) => !state.acquiredIds.includes(id) && !state.skippedIds.includes(id));
  if (unresolvedRequired.length === 0) return true;
  const cheapestRemainingRequired = unresolvedRequired
    .map((id) => offers.find((offer) => offer.id === id)?.price ?? Number.POSITIVE_INFINITY)
    .reduce((sum, price) => sum + price, 0);
  return state.spent + cheapestRemainingRequired > state.budget;
}

export function linkedBudgetRemaining(state: Readonly<LinkedBudgetState>): number {
  return Math.max(0, state.budget - state.spent);
}

function resolved(state: Readonly<LinkedBudgetState>, offerId: string): boolean {
  return state.acquiredIds.includes(offerId) || state.skippedIds.includes(offerId);
}

function clone(state: Readonly<LinkedBudgetState>): LinkedBudgetState {
  return {
    budget: state.budget,
    spent: state.spent,
    acquiredIds: [...state.acquiredIds],
    skippedIds: [...state.skippedIds],
  };
}
