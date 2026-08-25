import type { ItemCategory } from '../domain/types';
import { dailyBuyerOffersForDay } from './buyers';

export interface BuyerMarketForecast {
  dayKey: string;
  category: ItemCategory;
}

export function nextDayKey(dayKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);
  if (!match) throw new Error(`Invalid local day key: ${dayKey}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) throw new Error(`Invalid local day key: ${dayKey}`);
  date.setUTCDate(date.getUTCDate() + 1);
  return [
    String(date.getUTCFullYear()).padStart(4, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Reveals one guaranteed category from tomorrow's market without exposing the
 * premium multiplier or specialist. This creates a hold/return decision while
 * keeping today's auction information and tomorrow's best deal hidden.
 */
export function buyerMarketForecastForDay(dayKey: string): BuyerMarketForecast {
  const tomorrow = nextDayKey(dayKey);
  const categoryOffer = dailyBuyerOffersForDay(tomorrow).find((offer) => offer.category);
  if (!categoryOffer?.category) throw new Error(`No category buyer forecast for ${tomorrow}`);
  return { dayKey: tomorrow, category: categoryOffer.category };
}
