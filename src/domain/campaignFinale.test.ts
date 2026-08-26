import { describe, expect, it } from 'vitest';
import { acquireFinaleLot, createFinaleState, FINALE_LOTS, finaleReady, resolveCampaignEpilogue } from './campaignFinale';
import type { CampaignProgressState } from './types';

function progress(): CampaignProgressState {
  return {
    started: true,
    activeMissionId: null,
    completedMissionIds: [],
    evidenceIds: [],
    branchChoiceIds: [],
    missionBaselineAuctionsPlayed: {},
    missionBaselineAuctionsWon: {},
    relationshipTrust: {},
    relationshipRivalry: {},
    relationshipDebt: {},
    completed: false,
    epilogueId: null,
  };
}

describe('P9 Lost Collection finale', () => {
  it('cannot buy all four finale lots', () => {
    let state = createFinaleState();
    for (const lot of FINALE_LOTS) {
      const next = acquireFinaleLot(state, lot);
      if (next.ok) state = next.state;
    }
    expect(state.acquiredLotIds.length).toBeLessThan(FINALE_LOTS.length);
  });

  it('allows a complete evidence route within the shared budget', () => {
    let state = createFinaleState();
    state = acquireFinaleLot(state, FINALE_LOTS[0]!).state;
    state = acquireFinaleLot(state, FINALE_LOTS[2]!).state;
    expect(finaleReady(state)).toBe(true);
    expect(resolveCampaignEpilogue(state, progress())).toBe('ledger-restored');
  });

  it('turns the evidence route into shared truth when a trusted ally remains', () => {
    let state = createFinaleState();
    state = acquireFinaleLot(state, FINALE_LOTS[0]!).state;
    state = acquireFinaleLot(state, FINALE_LOTS[2]!).state;
    const p = progress();
    p.relationshipTrust['npc-1'] = 18;
    expect(resolveCampaignEpilogue(state, p)).toBe('shared-truth');
  });

  it('supports a profit-first ending', () => {
    let state = createFinaleState();
    state = acquireFinaleLot(state, FINALE_LOTS[1]!).state;
    state = acquireFinaleLot(state, FINALE_LOTS[3]!).state;
    expect(resolveCampaignEpilogue(state, progress())).toBe('dealer-king');
  });
});
