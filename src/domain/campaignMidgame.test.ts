import { describe, expect, it } from 'vitest';
import {
  evaluateCounterfeitSelection,
  resolveFinaleRoute,
  resolveProxyBidAllocation,
  resolveRestorationTrace,
} from './campaignMidgame';

describe('P9 campaign midgame rules', () => {
  it('makes the restoration trace a real preservation tradeoff', () => {
    expect(resolveRestorationTrace('dry-brush')).toMatchObject({ revealedSerial: true, preservedEvidence: true });
    expect(resolveRestorationTrace('solvent-wash')).toMatchObject({ revealedSerial: false, preservedEvidence: true });
    expect(resolveRestorationTrace('abrasive-polish')).toMatchObject({ revealedSerial: false, preservedEvidence: false, conditionDelta: -8 });
  });

  it('forces proxy bids to respect one shared envelope', () => {
    expect(resolveProxyBidAllocation({ targetBid: 6700, decoyBid: 1700 })).toMatchObject({ withinBudget: true, winsTarget: true, efficient: true });
    expect(resolveProxyBidAllocation({ targetBid: 5200, decoyBid: 4200 })).toMatchObject({ withinBudget: true, winsTarget: false });
    expect(resolveProxyBidAllocation({ targetBid: 6900, decoyBid: 4300 })).toMatchObject({ withinBudget: false, winsTarget: false });
  });

  it('requires the complete genuine pair at the counterfeit table', () => {
    expect(evaluateCounterfeitSelection(['folder-17'], ['folder-17', 'wax-card-c'])).toMatchObject({ complete: false, correct: false });
    expect(evaluateCounterfeitSelection(['folder-17', 'wax-card-c'], ['folder-17', 'wax-card-c'])).toMatchObject({ complete: true, correct: true });
    expect(evaluateCounterfeitSelection(['folder-17', 'blue-certificate'], ['folder-17', 'wax-card-c'])).toMatchObject({ complete: true, correct: false });
  });

  it('resolves the finale route from already discovered evidence only', () => {
    const evidence = ['lost-collection-index', 'veyr-buyer-list'];
    expect(resolveFinaleRoute('river-archive', evidence)).toMatchObject({ correct: true, evidenceScore: 2 });
    expect(resolveFinaleRoute('north-depot', evidence).correct).toBe(false);
    expect(resolveFinaleRoute('river-archive', ['lost-collection-index']).correct).toBe(false);
  });
});
