export type RestorationTraceMethod = 'dry-brush' | 'solvent-wash' | 'abrasive-polish';

export interface RestorationTraceResult {
  method: RestorationTraceMethod;
  revealedSerial: boolean;
  preservedEvidence: boolean;
  conditionDelta: number;
}

/**
 * Campaign-only evidence choice. It deliberately does not mutate normal item
 * condition/economy; the scene uses the result to frame the story decision.
 */
export function resolveRestorationTrace(method: RestorationTraceMethod): RestorationTraceResult {
  if (method === 'dry-brush') {
    return { method, revealedSerial: true, preservedEvidence: true, conditionDelta: 0 };
  }
  if (method === 'solvent-wash') {
    return { method, revealedSerial: false, preservedEvidence: true, conditionDelta: 0 };
  }
  return { method, revealedSerial: false, preservedEvidence: false, conditionDelta: -8 };
}

export interface ProxyBidAllocation {
  targetBid: number;
  decoyBid: number;
}

export interface ProxyBidResult extends ProxyBidAllocation {
  totalBid: number;
  withinBudget: boolean;
  winsTarget: boolean;
  winsDecoy: boolean;
  efficient: boolean;
}

/**
 * Two simultaneous proxy slips share one hard campaign envelope. The player
 * must fund the evidence lot without spending the whole envelope on the decoy.
 */
export function resolveProxyBidAllocation(
  allocation: ProxyBidAllocation,
  targetThreshold = 6400,
  decoyThreshold = 4300,
  budget = 9500,
): ProxyBidResult {
  const targetBid = Math.max(0, Math.round(allocation.targetBid));
  const decoyBid = Math.max(0, Math.round(allocation.decoyBid));
  const totalBid = targetBid + decoyBid;
  const withinBudget = totalBid <= budget;
  const winsTarget = withinBudget && targetBid >= targetThreshold;
  const winsDecoy = withinBudget && decoyBid >= decoyThreshold;
  return {
    targetBid,
    decoyBid,
    totalBid,
    withinBudget,
    winsTarget,
    winsDecoy,
    efficient: winsTarget && totalBid <= Math.round(budget * 0.92),
  };
}

export interface CounterfeitSelectionResult {
  selectedIds: string[];
  complete: boolean;
  correct: boolean;
}

export function evaluateCounterfeitSelection(
  selectedIds: readonly string[],
  genuineIds: readonly string[],
  requiredSelections = 2,
): CounterfeitSelectionResult {
  const unique = [...new Set(selectedIds)].slice(0, Math.max(1, requiredSelections));
  const genuine = new Set(genuineIds);
  const complete = unique.length === requiredSelections;
  return {
    selectedIds: unique,
    complete,
    correct: complete && unique.every((id) => genuine.has(id)) && genuineIds.every((id) => unique.includes(id)),
  };
}

export type FinaleRouteId = 'river-archive' | 'north-depot' | 'museum-annex';

export interface FinaleRouteResult {
  routeId: FinaleRouteId;
  correct: boolean;
  evidenceScore: number;
}

/**
 * Route truth is derived from already discovered evidence. No hidden future
 * lot value or exact rival ceiling is exposed by this helper.
 */
export function resolveFinaleRoute(routeId: FinaleRouteId, evidenceIds: readonly string[]): FinaleRouteResult {
  const evidence = new Set(evidenceIds);
  let score = 0;
  if (evidence.has('lost-collection-index')) score += 1;
  if (evidence.has('veyr-buyer-list')) score += 1;
  if (evidence.has('circle-sponsor-token')) score += 1;
  return {
    routeId,
    correct: routeId === 'river-archive' && score >= 2,
    evidenceScore: score,
  };
}
