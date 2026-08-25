import { describe, expect, it } from 'vitest';
import {
  registerAnalyticsSink,
  setMarketTrendAnalyticsContext,
  trackEvent,
  type AnalyticsEnvelope,
} from './analytics';

describe('analytics market trend context', () => {
  it('attaches active trend identity and remaining duration to lot presentation and selection', () => {
    const events: AnalyticsEnvelope[] = [];
    const unregister = registerAnalyticsSink((event) => events.push(event));
    setMarketTrendAnalyticsContext({ marketTrendId: 'watch-fever', marketTrendRemainingAuctions: 2 });

    trackEvent('lot_options_presented', {
      tierId: 'estate',
      lotIds: ['estate-42', 'studio-estate-21', 'manor-basement-5'],
      modifierIds: ['market-watch-fever', null, null],
    });
    const selected = trackEvent('lot_option_selected', {
      tierId: 'estate',
      lotId: 'estate-42',
      optionIndex: 0,
      reservePrice: 1200,
      itemCount: 4,
      modifierId: 'market-watch-fever',
    });

    unregister();
    setMarketTrendAnalyticsContext(null);

    expect(events.at(-1)?.payload).toMatchObject({
      marketTrendId: 'watch-fever',
      marketTrendRemainingAuctions: 2,
    });
    expect(selected.payload).toMatchObject({
      marketTrendId: 'watch-fever',
      marketTrendRemainingAuctions: 2,
    });
  });

  it('attributes Buyer Market sales to the same active trend context', () => {
    setMarketTrendAnalyticsContext({ marketTrendId: 'watch-fever', marketTrendRemainingAuctions: 2 });
    const sale = trackEvent('buyer_sale_completed', {
      buyerId: 'watch-specialist',
      itemId: 'pocket-watch',
      dayKey: '2026-08-25',
      value: 6200,
      premiumMultiplier: 1.2,
      traitIds: ['mechanical'],
    });
    setMarketTrendAnalyticsContext(null);

    expect(sale.payload).toMatchObject({
      marketTrendId: 'watch-fever',
      marketTrendRemainingAuctions: 2,
    });
  });

  it('clears trend attribution when the market is in cooldown', () => {
    setMarketTrendAnalyticsContext({ marketTrendId: 'art-buzz', marketTrendRemainingAuctions: 1 });
    setMarketTrendAnalyticsContext(null);

    const selected = trackEvent('lot_option_selected', {
      tierId: 'garage',
      lotId: 'garage-17',
      optionIndex: 1,
      reservePrice: 300,
      itemCount: 4,
    });

    expect(selected.payload).not.toHaveProperty('marketTrendId');
    expect(selected.payload).not.toHaveProperty('marketTrendRemainingAuctions');
  });
});
