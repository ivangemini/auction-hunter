import { describe, expect, it } from 'vitest';
import { createDefaultSave } from '../game/save';
import {
  bestClosedCircleSponsor,
  closedCirclePreviewComplete,
  closedCircleSponsorOptions,
  createClosedCirclePreview,
  inspectClosedCircleItem,
  resolveClosedCircleSealedBid,
} from './campaignClosedCircle';

describe('P9 Closed Circle rules', () => {
  it('limits private preview inspections and requires both target objects', () => {
    let state = createClosedCirclePreview(3);
    state = inspectClosedCircleItem(state, 'ledger-frame').state;
    state = inspectClosedCircleItem(state, 'decoy-statue').state;
    state = inspectClosedCircleItem(state, 'ivory-catalogue').state;
    expect(closedCirclePreviewComplete(state, ['ledger-frame', 'ivory-catalogue'])).toBe(true);
    expect(inspectClosedCircleItem(state, 'fourth-object').ok).toBe(false);
  });

  it('makes sealed bidding a real win/overpay window', () => {
    expect(resolveClosedCircleSealedBid(7900)).toMatchObject({ won: false, overpaid: false });
    expect(resolveClosedCircleSealedBid(8800)).toMatchObject({ won: true, overpaid: false });
    expect(resolveClosedCircleSealedBid(10200)).toMatchObject({ won: true, overpaid: true });
  });

  it('derives sponsorship from persistent trust, rivalry and debt', () => {
    const progress = createDefaultSave().campaign;
    progress.relationshipTrust['npc-0'] = 20;
    progress.relationshipDebt['npc-0'] = 4;
    progress.relationshipRivalry['npc-1'] = 18;
    const options = closedCircleSponsorOptions(progress);
    expect(options.find((option) => option.rivalId === 'npc-0')?.eligible).toBe(true);
    expect(options.find((option) => option.rivalId === 'npc-1')?.eligible).toBe(false);
    expect(bestClosedCircleSponsor(options)?.rivalId).toBe('npc-0');
  });
});
