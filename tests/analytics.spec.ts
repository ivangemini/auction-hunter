import { expect, test } from '@playwright/test';
import { ANALYTICS_SCHEMA_VERSION, registerAnalyticsSink, trackEvent, type AnalyticsEnvelope } from '../src/analytics';

test('analytics events use a stable versioned envelope and session sequence', () => {
  const captured: AnalyticsEnvelope[] = [];
  const unsubscribe = registerAnalyticsSink((event) => captured.push(event));

  const first = trackEvent('onboarding_completed', {});
  const second = trackEvent('collection_set_reward_claimed', { setId: 'retro-tech', reward: 1200 });
  unsubscribe();

  expect(first.schemaVersion).toBe(ANALYTICS_SCHEMA_VERSION);
  expect(second.sessionId).toBe(first.sessionId);
  expect(second.sequence).toBe(first.sequence + 1);
  expect(captured).toHaveLength(2);
  expect(captured[1]?.eventName).toBe('collection_set_reward_claimed');
});
