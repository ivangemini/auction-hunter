import { describe, expect, it } from 'vitest';
import { DISCOVERY_CHAINS } from '../data/discoveryChains';
import { advanceDiscoveryProgress, discoveryChainComplete, normalizeDiscoveryProgress } from './discovery';

const chain = DISCOVERY_CHAINS[0]!;

describe('legendary discovery chains', () => {
  it('only advances when the next required kept item is found', () => {
    expect(advanceDiscoveryProgress(0, 'toolbox', chain)).toEqual({
      progress: 0,
      advanced: false,
      complete: false,
    });

    expect(advanceDiscoveryProgress(0, chain.steps[0]!.itemId, chain)).toEqual({
      progress: 1,
      advanced: true,
      complete: false,
    });
  });

  it('does not reset progress when unrelated or repeated earlier items are kept', () => {
    expect(advanceDiscoveryProgress(2, 'toolbox', chain).progress).toBe(2);
    expect(advanceDiscoveryProgress(2, chain.steps[0]!.itemId, chain).progress).toBe(2);
  });

  it('completes on the final ordered find and remains complete afterwards', () => {
    const finalIndex = chain.steps.length - 1;
    const result = advanceDiscoveryProgress(finalIndex, chain.steps[finalIndex]!.itemId, chain);
    expect(result).toEqual({ progress: chain.steps.length, advanced: true, complete: true });
    expect(discoveryChainComplete(result.progress, chain)).toBe(true);
    expect(advanceDiscoveryProgress(result.progress, 'anything', chain)).toEqual({
      progress: chain.steps.length,
      advanced: false,
      complete: true,
    });
  });

  it('normalizes corrupt progress into the valid step range', () => {
    expect(normalizeDiscoveryProgress(-4, 4)).toBe(0);
    expect(normalizeDiscoveryProgress(999, 4)).toBe(4);
    expect(normalizeDiscoveryProgress(Number.NaN, 4)).toBe(0);
  });
});
