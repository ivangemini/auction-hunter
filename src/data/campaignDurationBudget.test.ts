import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CHAPTERS } from './campaign';

describe('P9 authored duration budget', () => {
  it('keeps all five chapters inside a credible campaign-sized time envelope', () => {
    expect(CAMPAIGN_CHAPTERS).toHaveLength(5);

    for (const chapter of CAMPAIGN_CHAPTERS) {
      const [minimum, maximum] = chapter.targetMinutes;
      expect(minimum, `${chapter.id} minimum`).toBeGreaterThanOrEqual(30);
      expect(maximum, `${chapter.id} maximum`).toBeGreaterThan(minimum);
      expect(maximum, `${chapter.id} maximum`).toBeLessThanOrEqual(180);
    }

    const minimumMinutes = CAMPAIGN_CHAPTERS.reduce((sum, chapter) => sum + chapter.targetMinutes[0], 0);
    const maximumMinutes = CAMPAIGN_CHAPTERS.reduce((sum, chapter) => sum + chapter.targetMinutes[1], 0);
    const midpointMinutes = (minimumMinutes + maximumMinutes) / 2;

    // This protects authored scope, not observed player time. Human/telemetry timing
    // remains the release acceptance source of truth for the advertised 6–10 hour target.
    expect(minimumMinutes).toBeGreaterThanOrEqual(360);
    expect(minimumMinutes).toBeLessThanOrEqual(540);
    expect(maximumMinutes).toBeGreaterThanOrEqual(480);
    expect(maximumMinutes).toBeLessThanOrEqual(660);
    expect(midpointMinutes).toBeGreaterThanOrEqual(420);
    expect(midpointMinutes).toBeLessThanOrEqual(600);
  });
});