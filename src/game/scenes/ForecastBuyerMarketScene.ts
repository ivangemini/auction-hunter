import type { ItemCategory } from '../../domain/types';
import { buyerMarketForecastForDay } from '../../data/buyerForecast';
import { localDayKey } from '../../data/daily';
import { getPlatformLocale } from '../../platform/yandex';
import { addChip, VISUAL } from '../visual';
import { BuyerMarketScene } from './BuyerMarketScene';

const RU_CATEGORY: Record<ItemCategory, string> = {
  watches: 'ЧАСЫ',
  electronics: 'ЭЛЕКТРОНИКА',
  toys: 'ИГРУШКИ',
  art: 'ИСКУССТВО',
  tools: 'ИНСТРУМЕНТЫ',
  collectibles: 'РЕДКОСТИ',
};

/**
 * Retention presentation layer for Buyer Market. The underlying offers, sale
 * limits, persistence and prices remain owned by BuyerMarketScene/GameStore.
 */
export class ForecastBuyerMarketScene extends BuyerMarketScene {
  create(): void {
    super.create();
    const locale = getPlatformLocale();
    const forecast = buyerMarketForecastForDay(localDayKey());
    const category = locale === 'ru'
      ? RU_CATEGORY[forecast.category]
      : forecast.category.toUpperCase();
    const label = locale === 'ru'
      ? `ЗАВТРА · ${category}`
      : `TOMORROW · ${category}`;

    addChip(this, 345, 105, label, VISUAL.rare, {
      width: locale === 'ru' ? 250 : 235,
      filled: false,
      fontSize: 10,
    });
  }
}
