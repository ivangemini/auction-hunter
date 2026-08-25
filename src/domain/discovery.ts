import type { DiscoveryChainDefinition } from '../data/discoveryChains';

export interface DiscoveryAdvanceResult {
  progress: number;
  advanced: boolean;
  complete: boolean;
}

export function normalizeDiscoveryProgress(progress: number, totalSteps: number): number {
  const total = Math.max(0, Math.floor(totalSteps));
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(total, Math.floor(progress)));
}

export function discoveryChainComplete(progress: number, chain: DiscoveryChainDefinition): boolean {
  return normalizeDiscoveryProgress(progress, chain.steps.length) >= chain.steps.length;
}

export function advanceDiscoveryProgress(
  progress: number,
  keptItemId: string,
  chain: DiscoveryChainDefinition,
): DiscoveryAdvanceResult {
  const current = normalizeDiscoveryProgress(progress, chain.steps.length);
  if (current >= chain.steps.length) {
    return { progress: current, advanced: false, complete: true };
  }

  const nextStep = chain.steps[current];
  if (!nextStep || nextStep.itemId !== keptItemId) {
    return { progress: current, advanced: false, complete: false };
  }

  const next = current + 1;
  return {
    progress: next,
    advanced: true,
    complete: next >= chain.steps.length,
  };
}
