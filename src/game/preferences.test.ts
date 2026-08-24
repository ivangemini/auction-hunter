import { describe, expect, it } from 'vitest';
import { normalizeAccessibilityPreferences } from './preferences';

describe('accessibility preferences', () => {
  it('defaults sound on and respects system reduced-motion preference', () => {
    expect(normalizeAccessibilityPreferences(null, true)).toEqual({
      soundFeedback: true,
      reducedMotion: true,
      highContrast: false,
    });
  });

  it('preserves explicit user choices over system defaults', () => {
    expect(normalizeAccessibilityPreferences({
      soundFeedback: false,
      reducedMotion: false,
      highContrast: true,
    }, true)).toEqual({
      soundFeedback: false,
      reducedMotion: false,
      highContrast: true,
    });
  });
});
