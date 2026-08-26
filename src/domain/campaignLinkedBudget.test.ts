import { describe, expect, it } from 'vitest';
import {
  buyLinkedBudgetOffer,
  createLinkedBudgetState,
  linkedBudgetMissionComplete,
  linkedBudgetMissionFailed,
  linkedBudgetRemaining,
  skipLinkedBudgetOffer,
  type LinkedBudgetOffer,
} from './campaignLinkedBudget';

const offers: LinkedBudgetOffer[] = [
  { id: 'decorative-decoy', price: 2600, target: false },
  { id: 'estate-ledger-box', price: 3100, target: true },
  { id: 'estate-photo-box', price: 2800, target: true },
];

describe('campaign linked-budget missions', () => {
  it('rewards preserving enough budget for both required targets', () => {
    let state = createLinkedBudgetState(6200);
    const first = buyLinkedBudgetOffer(state, offers[1]!);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    state = first.state;
    const second = buyLinkedBudgetOffer(state, offers[2]!);
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    state = second.state;

    expect(state.spent).toBe(5900);
    expect(linkedBudgetRemaining(state)).toBe(300);
    expect(linkedBudgetMissionComplete(state, ['estate-ledger-box', 'estate-photo-box'])).toBe(true);
  });

  it('makes an attractive decoy create a real opportunity cost', () => {
    let state = createLinkedBudgetState(6200);
    const decoy = buyLinkedBudgetOffer(state, offers[0]!);
    expect(decoy.ok).toBe(true);
    if (!decoy.ok) return;
    state = decoy.state;
    const ledger = buyLinkedBudgetOffer(state, offers[1]!);
    expect(ledger.ok).toBe(true);
    if (!ledger.ok) return;
    state = ledger.state;

    const photo = buyLinkedBudgetOffer(state, offers[2]!);
    expect(photo.ok).toBe(false);
    expect(photo.ok ? null : photo.reason).toBe('over-budget');
    expect(linkedBudgetMissionFailed(state, offers, ['estate-ledger-box', 'estate-photo-box'])).toBe(true);
  });

  it('fails cleanly when a required lot is deliberately skipped', () => {
    let state = createLinkedBudgetState(6200);
    state = skipLinkedBudgetOffer(state, 'estate-ledger-box');
    expect(linkedBudgetMissionFailed(state, offers, ['estate-ledger-box', 'estate-photo-box'])).toBe(true);
  });
});
