import Phaser from 'phaser';
import type { BuyerOfferDefinition } from '../../data/buyers';
import { ITEM_BY_ID } from '../../data/catalog';
import { COLLECTOR_REQUESTS, COLLECTOR_REQUEST_WINDOW_AUCTIONS } from '../../data/collectorRequests';
import { itemTraitNamesForIds } from '../../data/itemTraits';
import { MARKET_TRENDS, MARKET_TREND_SCHEDULE } from '../../data/marketTrends';
import { bestCollectorRequestMatch, collectorRequestForAuction, type ActiveCollectorRequest } from '../../domain/collectorRequests';
import {
  activeMarketTrendForAuction,
  marketTrendMultiplierForCategory,
  type ActiveMarketTrend,
} from '../../domain/marketTrend';
import type { ItemCategory, Locale } from '../../domain/types';
import { getPlatformLocale } from '../../platform/yandex';
import { resolveItemTexture } from '../art';
import { playFeedbackCue } from '../feedback';
import { MOTION, prefersReducedMotion } from '../motion';
import { GameStore } from '../store';
import { button } from '../ui';
import { addChip, addSurface, VISUAL } from '../visual';
import { BuyerMarketScene } from './BuyerMarketScene';

type BuyerMarketRuntime = Phaser.Scene & {
  renderMarket: () => void;
  renderOfferCard: (offer: BuyerOfferDefinition, index: number, dayKey: string) => void;
};

const TIER_ACCENT = {
  common: VISUAL.rare,
  demanding: VISUAL.warm,
  rare: VISUAL.purple,
} as const;

/**
 * Adds longer-horizon collector commissions and persistent category trends to the
 * existing daily Buyer Market. Matching, pricing and persistence stay outside UI.
 */
export class CollectorRequestBuyerMarketScene extends BuyerMarketScene {
  private readonly requestStore = new GameStore();
  private localeForRequests: Locale = 'en';
  private rerenderMarket: () => void = () => undefined;

  constructor() {
    super();
    const runtime = this as unknown as BuyerMarketRuntime;
    const renderDailyMarket = runtime.renderMarket.bind(runtime);
    const renderDailyOfferCard = runtime.renderOfferCard.bind(runtime);

    this.rerenderMarket = () => runtime.renderMarket();
    runtime.renderOfferCard = (offer, index, dayKey) => {
      renderDailyOfferCard(this.withMarketTrend(offer), index, dayKey);
    };
    runtime.renderMarket = () => {
      renderDailyMarket();
      this.localeForRequests = getPlatformLocale();
      this.renderCollectorRequestEntry();
      this.renderMarketTrendStatus();
    };
  }

  private activeMarketTrend(): ActiveMarketTrend | null {
    return activeMarketTrendForAuction(
      this.requestStore.snapshot.auctionsPlayed,
      MARKET_TRENDS,
      MARKET_TREND_SCHEDULE,
    );
  }

  private withMarketTrend(offer: BuyerOfferDefinition): BuyerOfferDefinition {
    const trend = this.activeMarketTrend();
    const multiplier = marketTrendMultiplierForCategory(trend, offer.category);
    if (!trend || multiplier === 1) return offer;

    const direction = multiplier > 1 ? '+' : '';
    const change = `${direction}${Math.round((multiplier - 1) * 100)}%`;
    return {
      ...offer,
      multiplier: offer.multiplier * multiplier,
      description: {
        ru: `${offer.description.ru} Тренд «${trend.definition.name.ru}» меняет спрос на ${change}.`,
        en: `${offer.description.en} ${trend.definition.name.en} shifts current demand by ${change}.`,
      },
    };
  }

  private renderMarketTrendStatus(): void {
    const trend = this.activeMarketTrend();
    if (!trend) {
      addChip(this, 620, 106, this.localeForRequests === 'ru' ? 'РЫНОК · ПАУЗА' : 'MARKET · COOLDOWN', VISUAL.steel, {
        width: 206,
        height: 30,
        fontSize: 9,
      });
      return;
    }

    const multiplier = trend.definition.valueMultiplier;
    const delta = Math.round((multiplier - 1) * 100);
    const sign = delta > 0 ? '+' : '';
    const accent = delta >= 0 ? VISUAL.success : VISUAL.copper;
    addChip(this, 620, 106, `${trend.definition.name[this.localeForRequests]} · ${sign}${delta}% · ${trend.remainingAuctions}`, accent, {
      width: 248,
      height: 30,
      filled: true,
      fontSize: this.localeForRequests === 'ru' ? 9 : 10,
    });
  }

  private renderCollectorRequestEntry(): void {
    const save = this.requestStore.snapshot;
    const active = collectorRequestForAuction(
      save.auctionsPlayed,
      COLLECTOR_REQUESTS,
      COLLECTOR_REQUEST_WINDOW_AUCTIONS,
    );
    if (!active) return;

    const claimed = save.claimedCollectorRequests.includes(active.requestKey);
    const accent = claimed ? VISUAL.success : TIER_ACCENT[active.definition.tier];
    const label = this.localeForRequests === 'ru'
      ? `${claimed ? 'ЗАКАЗ ЗАКРЫТ' : 'ЗАКАЗ КОЛЛЕКЦИОНЕРА'} · ${active.remainingAuctions} аукц.`
      : `${claimed ? 'REQUEST CLOSED' : 'COLLECTOR REQUEST'} · ${active.remainingAuctions} auc.`;

    button(this, 618, 67, label, () => this.renderCollectorRequestModal(active), {
      width: 262,
      height: 34,
      background: claimed ? 0x244c3b : 0x49315f,
      accent,
      foreground: claimed ? '#c9f2d8' : '#f4e7ff',
      fontSize: this.localeForRequests === 'ru' ? 10 : 11,
      hitSlop: 4,
    });
  }

  private renderCollectorRequestModal(active: ActiveCollectorRequest): void {
    const locale = this.localeForRequests;
    const save = this.requestStore.snapshot;
    const claimed = save.claimedCollectorRequests.includes(active.requestKey);
    const match = claimed
      ? null
      : bestCollectorRequestMatch(save.collectionItems ?? [], ITEM_BY_ID, active);
    const accent = claimed ? VISUAL.success : TIER_ACCENT[active.definition.tier];

    this.add.rectangle(640, 360, 1280, 720, 0x05070a, 0.82).setDepth(50).setInteractive();
    const modal = addSurface(this, 250, 106, 780, 520, {
      accent,
      fill: VISUAL.panel,
      strokeAlpha: 0.48,
      glowAlpha: 0.035,
    }).setDepth(51);

    modal.add(this.add.rectangle(0, 0, 8, 520, accent, 0.92).setOrigin(0));
    modal.add(this.requestText(34, 26, locale === 'ru' ? 'ЧАСТНЫЙ ЗАКАЗ' : 'PRIVATE COMMISSION', 10, '#8e96a2', 'bold'));
    modal.add(this.requestText(34, 50, active.definition.name[locale], 27, '#f7f3e8', 'bold').setWordWrapWidth(500));
    modal.add(this.requestText(34, 91, active.definition.description[locale], 13, '#b2b8c1')
      .setWordWrapWidth(500)
      .setLineSpacing(4));

    modal.add(addChip(this, 642, 43, this.tierLabel(active, locale), accent, {
      width: 172,
      height: 30,
      filled: true,
      fontSize: 9,
    }));
    modal.add(addChip(this, 642, 81, locale === 'ru'
      ? `${active.remainingAuctions} АУКЦ. ДО СМЕНЫ`
      : `${active.remainingAuctions} AUC. REMAIN`, VISUAL.steel, {
      width: 172,
      height: 28,
      fontSize: 9,
    }));

    const criteria = addSurface(this, 34, 142, 712, 76, {
      accent: VISUAL.steel,
      fill: VISUAL.panelDeep,
      strokeAlpha: 0.18,
      glowAlpha: 0.006,
    });
    criteria.add(this.requestText(16, 11, locale === 'ru' ? 'ТРЕБОВАНИЯ' : 'REQUIREMENTS', 9, '#737c88', 'bold'));
    criteria.add(this.requestText(16, 31, this.criteriaText(active, locale), 12, '#d6dbe2', 'bold')
      .setWordWrapWidth(515));
    criteria.add(this.requestText(556, 18, `+${Math.round((active.definition.multiplier - 1) * 100)}%`, 27, '#63d28d', 'bold'));
    criteria.add(this.requestText(558, 49, locale === 'ru' ? 'К ОЦЕНКЕ' : 'VS APPRAISAL', 8, '#76808b', 'bold'));
    modal.add(criteria);

    if (claimed) {
      const done = addSurface(this, 34, 244, 712, 190, {
        accent: VISUAL.success,
        fill: VISUAL.panelDeep,
        strokeAlpha: 0.32,
        glowAlpha: 0.02,
      });
      done.add(this.add.circle(86, 90, 50, VISUAL.success, 0.09).setStrokeStyle(2, VISUAL.success, 0.48));
      done.add(this.requestText(86, 90, '✓', 38, '#63d28d', 'bold').setOrigin(0.5));
      done.add(this.requestText(164, 54, locale === 'ru' ? 'Заказ выполнен' : 'Commission fulfilled', 22, '#c5efd5', 'bold'));
      done.add(this.requestText(164, 92, locale === 'ru'
        ? 'Следующий заказ появится после смены текущего шестиаукционного окна.'
        : 'A new commission appears when the current six-auction window rotates.', 12, '#98a6a0')
        .setWordWrapWidth(480));
      modal.add(done);
    } else if (match) {
      const itemPanel = addSurface(this, 34, 238, 712, 214, {
        accent,
        fill: VISUAL.panelDeep,
        strokeAlpha: 0.28,
        glowAlpha: 0.018,
      });
      itemPanel.add(this.add.ellipse(130, 100, 210, 144, accent, 0.055));
      itemPanel.add(this.add.image(130, 96, resolveItemTexture(this, match.item.id)).setDisplaySize(210, 150));
      itemPanel.add(this.requestText(262, 25, match.item.name[locale], 20, '#f7f3e8', 'bold').setWordWrapWidth(410));
      itemPanel.add(this.requestText(262, 60, `${locale === 'ru' ? 'Состояние' : 'Condition'} · ${Math.round(match.instance.condition * 100)}%`, 11, '#9ca6b1', 'bold'));
      const traits = itemTraitNamesForIds(match.instance.traitIds, locale);
      itemPanel.add(this.requestText(262, 84, traits.length > 0 ? traits.join(' · ') : (locale === 'ru' ? 'Подходит по категории/состоянию' : 'Matches category/condition'), 10, '#8fc3ff', 'bold')
        .setWordWrapWidth(410));
      itemPanel.add(this.requestText(262, 122, locale === 'ru' ? 'ПРЕДЛОЖЕНИЕ' : 'OFFER', 9, '#737c88', 'bold'));
      itemPanel.add(this.requestText(262, 142, this.requestMoney(match.value, locale), 28, '#63d28d', 'bold'));
      itemPanel.add(this.requestText(262, 179, `${locale === 'ru' ? 'Оценка копии' : 'Copy appraisal'} · ${this.requestMoney(match.instance.appraisedValue, locale)}`, 10, '#8d96a1'));
      modal.add(itemPanel);

      button(this, 835, 574, locale === 'ru'
        ? `Выполнить заказ · ${this.requestMoney(match.value, locale)}`
        : `Fulfill request · ${this.requestMoney(match.value, locale)}`, () => {
        const value = this.requestStore.fulfillCollectorRequest(active.requestKey, match.instance.id);
        if (value <= 0) {
          this.rerenderMarket();
          return;
        }
        playFeedbackCue(this, 'sell');
        if (prefersReducedMotion()) {
          this.rerenderMarket();
          return;
        }
        this.tweens.add({
          targets: modal,
          scaleX: 1.018,
          scaleY: 1.018,
          alpha: 0.45,
          duration: MOTION.selectMs,
          ease: 'Cubic.Out',
          onComplete: () => this.rerenderMarket(),
        });
      }, {
        width: 330,
        height: 42,
        background: VISUAL.copper,
        accent: VISUAL.warm,
        fontSize: locale === 'ru' ? 11 : 12,
        feedback: false,
      }).setDepth(52);
    } else {
      const empty = addSurface(this, 34, 244, 712, 190, {
        accent,
        fill: VISUAL.panelDeep,
        strokeAlpha: 0.24,
        glowAlpha: 0.01,
      });
      empty.add(this.add.circle(94, 91, 50, VISUAL.steel, 0.17).setStrokeStyle(2, accent, 0.28));
      empty.add(this.requestText(94, 91, '?', 36, this.requestHex(accent), 'bold').setOrigin(0.5));
      empty.add(this.requestText(174, 50, locale === 'ru' ? 'Подходящего экземпляра пока нет' : 'No matching copy yet', 20, '#d7dce2', 'bold'));
      empty.add(this.requestText(174, 86, locale === 'ru'
        ? 'Ищи нужную категорию и признаки на аукционах. Заказ не требует отдельного режима и не блокирует обычные продажи.'
        : 'Hunt the required category and traits in normal auctions. The commission does not require a separate mode or block normal sales.', 12, '#959eaa')
        .setWordWrapWidth(490)
        .setLineSpacing(3));
      modal.add(empty);
    }

    button(this, 926, 132, locale === 'ru' ? 'Закрыть' : 'Close', () => this.rerenderMarket(), {
      width: 124,
      height: 34,
      background: VISUAL.steel,
      fontSize: 11,
      hitSlop: 4,
    }).setDepth(52);
  }

  private criteriaText(active: ActiveCollectorRequest, locale: Locale): string {
    const request = active.definition;
    const parts: string[] = [];
    if (request.category) parts.push(this.categoryLabel(request.category, locale));
    if (request.traitIds && request.traitIds.length > 0) {
      const traits = itemTraitNamesForIds(request.traitIds, locale);
      if (traits.length > 0) parts.push(traits.join(request.requireAllTraits ? ' + ' : ' / '));
    }
    if (request.minCondition !== undefined) {
      parts.push(locale === 'ru'
        ? `состояние ≥ ${Math.round(request.minCondition * 100)}%`
        : `condition ≥ ${Math.round(request.minCondition * 100)}%`);
    }
    if (request.maxCondition !== undefined) {
      parts.push(locale === 'ru'
        ? `состояние ≤ ${Math.round(request.maxCondition * 100)}%`
        : `condition ≤ ${Math.round(request.maxCondition * 100)}%`);
    }
    return parts.join(' · ');
  }

  private tierLabel(active: ActiveCollectorRequest, locale: Locale): string {
    const labels = locale === 'ru'
      ? { common: 'ОБЫЧНЫЙ ЗАКАЗ', demanding: 'ТРЕБОВАТЕЛЬНЫЙ', rare: 'РЕДКИЙ ЗАКАЗ' }
      : { common: 'COMMON REQUEST', demanding: 'DEMANDING', rare: 'RARE REQUEST' };
    return labels[active.definition.tier];
  }

  private categoryLabel(category: ItemCategory, locale: Locale): string {
    if (locale === 'en') return category.toUpperCase();
    const labels: Record<ItemCategory, string> = {
      electronics: 'ЭЛЕКТРОНИКА',
      watches: 'ЧАСЫ',
      toys: 'ИГРУШКИ',
      art: 'ИСКУССТВО',
      tools: 'ИНСТРУМЕНТЫ',
      collectibles: 'РЕДКОСТИ',
    };
    return labels[category];
  }

  private requestText(
    x: number,
    y: number,
    value: string,
    size: number,
    color: string,
    style: 'normal' | 'bold' = 'normal',
  ): Phaser.GameObjects.Text {
    return this.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${size}px`,
      fontStyle: style,
      color,
    });
  }

  private requestMoney(value: number, locale: Locale): string {
    return `${new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value)} ₽`;
  }

  private requestHex(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }
}
