import type { DiscoveryChainDefinition } from '../data/discoveryChains';

export interface DiscoveryChainState {
  progress: Readonly<Record<string, number>>;
  lastAuction: Readonly<Record<string, number>>;
  completed: readonly string[];
}

export interface DiscoveryChainAdvance {
  chainId: string;
  itemId: string;
  stage: number;
  totalStages: number;
  auctionNumber: number;
  completed: boolean;
  rewardCash: number;
  rewardReputationXp: number;
}

export interface DiscoveryChainAdvanceResult {
  progress: Record<string, number>;
  lastAuction: Record<string, number>;
  completed: string[];
  advances: DiscoveryChainAdvance[];
}

export function advanceDiscoveryChains(
  definitions: readonly DiscoveryChainDefinition[],
  state: DiscoveryChainState,
  itemId: string,
  auctionNumber: number,
): DiscoveryChainAdvanceResult {
  const progress = { ...state.progress };
  const lastAuction = { ...state.lastAuction };
  const completed = [...new Set(state.completed)];
  const completedSet = new Set(completed);
  const advances: DiscoveryChainAdvance[] = [];

  if (!itemId || !Number.isFinite(auctionNumber) || auctionNumber < 1) {
    return { progress, lastAuction, completed, advances };
  }

  const normalizedAuctionNumber = Math.floor(auctionNumber);

  for (const chain of definitions) {
    if (completedSet.has(chain.id) || chain.steps.length === 0) continue;

    const rawStage = progress[chain.id] ?? 0;
    const stage = Math.max(0, Math.min(chain.steps.length, Math.floor(rawStage)));
    progress[chain.id] = stage;

    if (stage >= chain.steps.length) {
      completedSet.add(chain.id);
      completed.push(chain.id);
      continue;
    }

    const expected = chain.steps[stage];
    if (!expected || expected.itemId !== itemId) continue;
    if (lastAuction[chain.id] === normalizedAuctionNumber) continue;

    const nextStage = stage + 1;
    const isComplete = nextStage >= chain.steps.length;
    progress[chain.id] = nextStage;
    lastAuction[chain.id] = normalizedAuctionNumber;

    if (isComplete && !completedSet.has(chain.id)) {
      completedSet.add(chain.id);
      completed.push(chain.id);
    }

    advances.push({
      chainId: chain.id,
      itemId,
      stage: nextStage,
      totalStages: chain.steps.length,
      auctionNumber: normalizedAuctionNumber,
      completed: isComplete,
      rewardCash: isComplete ? chain.rewardCash : 0,
      rewardReputationXp: isComplete ? chain.rewardReputationXp : 0,
    });
  }

  return { progress, lastAuction, completed, advances };
}
