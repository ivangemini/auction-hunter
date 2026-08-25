import { describe, expect, it } from 'vitest';
import { ITEM_BY_ID } from '../data/catalog';
import { DISCOVERY_CHAINS, discoveryStepItemIds } from '../data/discoveryChains';
import { advanceDiscoveryChains } from './discoveryChains';

const emptyState = () => ({
  progress: {},
  lastAuction: {},
  completed: [] as string[],
});

describe('legendary discovery chains', () => {
  it('references real catalog items and keeps primary ordered steps unique', () => {
    const seenPrimary = new Set<string>();
    let branchingSteps = 0;
    for (const chain of DISCOVERY_CHAINS) {
      expect(chain.steps.length).toBeGreaterThanOrEqual(3);
      for (const step of chain.steps) {
        expect(ITEM_BY_ID.has(step.itemId)).toBe(true);
        expect(seenPrimary.has(step.itemId)).toBe(false);
        seenPrimary.add(step.itemId);

        const alternatives = step.alternativeItemIds ?? [];
        if (alternatives.length > 0) branchingSteps += 1;
        expect(new Set(discoveryStepItemIds(step)).size).toBe(discoveryStepItemIds(step).length);
        alternatives.forEach((itemId) => expect(ITEM_BY_ID.has(itemId)).toBe(true));
      }
    }
    expect(branchingSteps).toBeGreaterThanOrEqual(5);
  });

  it('keeps at least one long authored case with multiple converging branches', () => {
    const longCases = DISCOVERY_CHAINS.filter((chain) => chain.steps.length >= 5);
    expect(longCases.length).toBeGreaterThanOrEqual(1);
    const caseWithMultipleBranches = longCases.find(
      (chain) => chain.steps.filter((step) => (step.alternativeItemIds?.length ?? 0) > 0).length >= 2,
    );
    expect(caseWithMultipleBranches).toBeDefined();
    expect(caseWithMultipleBranches?.rewardCash ?? 0).toBeGreaterThanOrEqual(3500);
    expect(caseWithMultipleBranches?.rewardReputationXp ?? 0).toBeGreaterThanOrEqual(75);
  });

  it('requires ordered discoveries and advances at most once per auction', () => {
    const chain = DISCOVERY_CHAINS[0]!;
    const first = chain.steps[0]!;
    const second = chain.steps[1]!;

    const outOfOrder = advanceDiscoveryChains(DISCOVERY_CHAINS, emptyState(), second.itemId, 1);
    expect(outOfOrder.advances).toEqual([]);

    const started = advanceDiscoveryChains(DISCOVERY_CHAINS, emptyState(), first.itemId, 1);
    expect(started.progress[chain.id]).toBe(1);
    expect(started.advances[0]).toMatchObject({ chainId: chain.id, stage: 1, completed: false });

    const sameAuction = advanceDiscoveryChains(
      DISCOVERY_CHAINS,
      {
        progress: started.progress,
        lastAuction: started.lastAuction,
        completed: started.completed,
      },
      second.itemId,
      1,
    );
    expect(sameAuction.progress[chain.id]).toBe(1);
    expect(sameAuction.advances).toEqual([]);
  });

  it('accepts either branch item for a branching stage and converges on the same next stage', () => {
    const chain = DISCOVERY_CHAINS.find((candidate) => candidate.steps.some((step) => (step.alternativeItemIds?.length ?? 0) > 0));
    if (!chain) throw new Error('Expected at least one branching discovery chain');
    const branchIndex = chain.steps.findIndex((step) => (step.alternativeItemIds?.length ?? 0) > 0);
    expect(branchIndex).toBeGreaterThan(0);
    const branchStep = chain.steps[branchIndex]!;
    const alternative = branchStep.alternativeItemIds?.[0];
    if (!alternative) throw new Error('Expected a branch alternative');

    let state = emptyState();
    for (let index = 0; index < branchIndex; index += 1) {
      const result = advanceDiscoveryChains(DISCOVERY_CHAINS, state, chain.steps[index]!.itemId, index + 1);
      state = { progress: result.progress, lastAuction: result.lastAuction, completed: result.completed };
    }

    const branched = advanceDiscoveryChains(DISCOVERY_CHAINS, state, alternative, branchIndex + 1);
    expect(branched.progress[chain.id]).toBe(branchIndex + 1);
    expect(branched.advances.find((advance) => advance.chainId === chain.id)).toMatchObject({
      itemId: alternative,
      stage: branchIndex + 1,
    });
  });

  it('completes only across multiple auctions and emits the reward once', () => {
    const chain = DISCOVERY_CHAINS[0]!;
    let state = emptyState();

    for (let index = 0; index < chain.steps.length; index += 1) {
      const result = advanceDiscoveryChains(
        DISCOVERY_CHAINS,
        state,
        chain.steps[index]!.itemId,
        index + 1,
      );
      state = {
        progress: result.progress,
        lastAuction: result.lastAuction,
        completed: result.completed,
      };

      const advance = result.advances.find((candidate) => candidate.chainId === chain.id);
      expect(advance?.stage).toBe(index + 1);
      expect(advance?.completed).toBe(index === chain.steps.length - 1);
    }

    expect(state.completed).toContain(chain.id);

    const duplicate = advanceDiscoveryChains(
      DISCOVERY_CHAINS,
      state,
      chain.steps[chain.steps.length - 1]!.itemId,
      chain.steps.length + 1,
    );
    expect(duplicate.advances).toEqual([]);
  });
});
