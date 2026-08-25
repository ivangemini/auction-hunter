import { afterEach, describe, expect, it } from 'vitest';
import { beginTutorialSession, endTutorialSession, isTutorialSessionActive } from './tutorial';

describe('tutorial session state', () => {
  afterEach(() => endTutorialSession());

  it('starts inactive, becomes active for the coached first-session flow and can be ended explicitly', () => {
    expect(isTutorialSessionActive()).toBe(false);

    beginTutorialSession();
    expect(isTutorialSessionActive()).toBe(true);

    endTutorialSession();
    expect(isTutorialSessionActive()).toBe(false);
  });

  it('is idempotent when tutorial start/end are repeated by scene transitions', () => {
    beginTutorialSession();
    beginTutorialSession();
    expect(isTutorialSessionActive()).toBe(true);

    endTutorialSession();
    endTutorialSession();
    expect(isTutorialSessionActive()).toBe(false);
  });
});
