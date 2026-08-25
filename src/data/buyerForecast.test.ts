import { describe, expect, it } from 'vitest';
import { dailyBuyerOffersForDay } from './buyers';
import { buyerMarketForecastForDay, nextDayKey } from './buyerForecast';

describe('Buyer Market forecast', () => {
  it('advances calendar day keys across month and year boundaries', () => {
    expect(nextDayKey('2026-08-31')).toBe('2026-09-01');
    expect(nextDayKey('2026-12-31')).toBe('2027-01-01');
    expect(nextDayKey('2028-02-28')).toBe('2028-02-29');
  });

  it('rejects malformed or impossible day keys', () => {
    expect(() => nextDayKey('2026-02-30')).toThrow();
    expect(() => nextDayKey('2026/08/25')).toThrow();
  });

  it('forecasts one category that is guaranteed to appear tomorrow', () => {
    for (const dayKey of ['2026-08-25', '2026-12-31', '2027-03-14']) {
      const forecast = buyerMarketForecastForDay(dayKey);
      const tomorrowOffers = dailyBuyerOffersForDay(forecast.dayKey);
      expect(forecast.dayKey).toBe(nextDayKey(dayKey));
      expect(tomorrowOffers.some((offer) => offer.category === forecast.category)).toBe(true);
      expect(buyerMarketForecastForDay(dayKey)).toEqual(forecast);
    }
  });
});
