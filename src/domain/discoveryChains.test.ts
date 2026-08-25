import { describe, expect, it } from 'vitest';
import { ITEM_BY_ID } from '../data/catalog';
import { DISCOVERY_CHAINS } from '../data/discoveryChains';
import { advanceDiscoveryChains } from './discoveryChains';

const emptyState = () => ({
  progress: {},
  lastAuction: {},
  completed: [] as string[],
});

describe('legendary discovery chains', () => {
  it('references real catalog items and uses unique ordered steps', () => {
    const seen = new Set<string>();
    for (const chain of DISCOVERY_CHAINS) {
      expect(chain.steps.length).toBeGreaterThanOrEqual(3);
      for (const step of chain.steps) {
        expect(ITEM_BY_ID.has(step.itemId)).toBe(true);
        expect(seen.has(step.itemId)).toBe(false);
        seen.add(step.itemId);
      }
    }
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
