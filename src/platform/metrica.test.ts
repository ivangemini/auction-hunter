import { describe, expect, it } from 'vitest';
import type { AnalyticsEnvelope } from '../analytics';
import {
  METRICA_GOAL_EVENTS,
  metricaEventParams,
  metricaGoalId,
  parseMetricaCounterId,
} from './metrica';

describe('Yandex Metrica analytics adapter', () => {
  it('accepts only positive safe-integer counter IDs', () => {
    expect(parseMetricaCounterId('12345678')).toBe(12345678);
    expect(parseMetricaCounterId(42)).toBe(42);
    expect(parseMetricaCounterId('')).toBeNull();
    expect(parseMetricaCounterId('abc')).toBeNull();
    expect(parseMetricaCounterId('1.5')).toBeNull();
    expect(parseMetricaCounterId(0)).toBeNull();
    expect(parseMetricaCounterId(-5)).toBeNull();
  });

  it('uses stable safe JavaScript-goal identifiers', () => {
    expect(metricaGoalId('round_completed')).toBe('ah_round_completed');
    expect(METRICA_GOAL_EVENTS.has('lot_option_selected')).toBe(true);
    expect(METRICA_GOAL_EVENTS.has('auction_started')).toBe(true);
    expect(METRICA_GOAL_EVENTS.has('bid_placed')).toBe(false);
  });

  it('sends schema context and payload while omitting high-cardinality envelope IDs', () => {
    const event: AnalyticsEnvelope<'round_completed'> = {
      schemaVersion: 1,
      eventName: 'round_completed',
      eventId: 'event-private-1',
      sessionId: 'session-private-1',
      sequence: 9,
      occurredAt: '2026-08-24T08:00:00.000Z',
      payload: {
        lotId: 'garage-17',
        tierId: 'garage',
        cost: 800,
        sales: 1100,
        kept: 1,
        keptValue: 300,
        totalEstimatedResult: 600,
        daily: false,
      },
    };

    const params = metricaEventParams(event);
    expect(params).toEqual({
      auction_hunter: {
        event_name: 'round_completed',
        schema_version: 1,
        sequence: 9,
        payload: event.payload,
      },
    });
    expect(JSON.stringify(params)).not.toContain('event-private-1');
    expect(JSON.stringify(params)).not.toContain('session-private-1');
  });
});
