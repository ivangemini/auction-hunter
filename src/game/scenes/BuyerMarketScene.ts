import Phaser from 'phaser';
import { bestBuyerMatch, dailyBuyerOffersForDay, type BuyerOfferDefinition } from '../../data/buyers';
import { ITEM_BY_ID } from '../../data/catalog';
import { localDayKey } from '../../data/daily';
import { itemTraitNames, itemTraitNamesForIds } from '../../data/itemTraits';
import type { Locale } from '../../domain/types';
import { t } from '../../i18n';
import { getPlatformLocale, setGameplayActive } from '../../platform/yandex';
import { resolveItemTexture } from '../art';
import { playFeedbackCue } from '../feedback';
import { GameStore } from '../store';
import { button } from '../ui';

const WIDTH = 1280;
const HEIGHT = 720;

export class BuyerMarketScene extends Phaser.Scene {
  private readonly store = new GameStore();
  private locale: Locale = 'en';

  constructor() {
    super('buyer-market');
  }

  create(): void {
    this.locale = getPlatformLocale();
    setGameplayActive(false);
    this.store.prepareBuyerMarket(localDayKey());
    this.renderMarket();
  }

  private renderMarket(): void {
    this.children.removeAll(true);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x101216);
    this.add.rectangle(1060, HEIGHT / 2, 440, HEIGHT, 0x63d28d, 0.018);
    this.add.rectangle(WIDTH / 2, 116, WIDTH - 120, 1, 0x2b3038);

    const copy = this.copy();
    const dayKey = localDayKey();
    this.store.prepareBuyerMarket(dayKey);
    const save = this.store.snapshot;
    const offers = dailyBuyerOffersForDay(dayKey);

    this.label(70, 40, copy.title, 30, '#f7f8fa', 'bold');
    this.label(70, 78, copy.subtitle, 15, '#737b88');
    this.label(760, 44, `${t(this.locale, 'cash')}: ${this.money(save.cash)}`, 18, '#63d28d', 'bold');
    this.label(760, 76, copy.resetHint, 13, '#737b88');

    button(this, 1130, 70, t(this.locale, 'backToCollection'), () => this.scene.start('collection'), {
      width: 210,
      height: 46,
      background: 0x61a8ff,
    });

    offers.forEach((offer, index) => this.renderOfferCard(offer, index, dayKey));

    this.centerLabel(640, 675, copy.footer, 13, '#737b88').setWordWrapWidth(1060);
  }

  private renderOfferCard(offer: BuyerOfferDefinition, index: number, dayKey: string): void {
    const copy = this.copy();
    const x = 75 + index * 390;
    const y = 165;
    const width = 350;
    const height = 455;
    const save = this.store.snapshot;
    const claimed = save.claimedBuyerOfferIds.includes(offer.id);
    const match = claimed
      ? null
      : bestBuyerMatch(save.collection, ITEM_BY_ID, offer, save.collectionItems ?? []);

    this.add.rectangle(x, y, width, height, 0x171a20, 1)
      .setOrigin(0)
      .setStrokeStyle(1, claimed ? 0x63d28d : 0xffffff, claimed ? 0.42 : 0.09);

    this.label(x + 22, y + 20, offer.name[this.locale], 22, '#f7f8fa', 'bold').setWordWrapWidth(306);
    this.label(x + 22, y + 58, offer.description[this.locale], 14, '#aeb5c0')
      .setWordWrapWidth(306)
      .setLineSpacing(3);
    this.label(x + 22, y + 120, `${copy.premium}: +${Math.round((offer.multiplier - 1) * 100)}%`, 15, '#e9b949', 'bold');

    if (claimed) {
      this.centerLabel(x + width / 2, y + 280, copy.completed, 18, '#63d28d', 'bold').setWordWrapWidth(290);
      this.centerLabel(x + width / 2, y + 320, copy.comeBack, 13, '#8b93a1');
      return;
    }

    if (!match) {
      this.centerLabel(x + width / 2, y + 270, copy.noMatch, 17, '#8b93a1', 'bold').setWordWrapWidth(290);
      this.centerLabel(x + width / 2, y + 315, copy.keepHunting, 13, '#737b88').setWordWrapWidth(285);
      return;
    }

    const item = ITEM_BY_ID.get(match.itemId);
    if (!item) return;

    this.add.rectangle(x + width / 2, y + 225, 190, 130, 0xe9b949, 0.035)
      .setStrokeStyle(1, 0xffffff, 0.08);
    this.add.image(x + width / 2, y + 225, resolveItemTexture(this, item.id)).setDisplaySize(175, 118);
    this.centerLabel(x + width / 2, y + 310, item.name[this.locale], 17, '#f7f8fa', 'bold').setWordWrapWidth(300);

    const traits = match.traitIds
      ? itemTraitNamesForIds(match.traitIds, this.locale)
      : itemTraitNames(item.id, this.locale);
    const traitText = traits.length > 0 ? traits.join(' · ') : copy.categoryMatch;
    this.centerLabel(x + width / 2, y + 340, traitText, 11, traits.length > 0 ? '#61a8ff' : '#8b93a1', 'bold')
      .setWordWrapWidth(300);

    if (match.appraisedValue !== undefined) {
      const condition = match.condition !== undefined ? ` · ${Math.round(match.condition * 100)}%` : '';
      const restored = match.restored ? ` · ${copy.restored}` : '';
      this.centerLabel(
        x + width / 2,
        y + 367,
        `${copy.appraised}: ${this.money(match.appraisedValue)}${condition}${restored}`,
        12,
        '#aeb5c0',
        'bold',
      ).setWordWrapWidth(305);
    }

    this.centerLabel(x + width / 2, y + 393, `${copy.offer}: ${this.money(match.value)}`, 19, '#63d28d', 'bold');
    if (match.copies > 1) this.centerLabel(x + width / 2, y + 416, `${copy.copies}: ${match.copies}`, 12, '#8b93a1');

    button(this, x + width / 2, y + 442, `${copy.sell} · ${this.money(match.value)}`, () => {
      const sold = this.store.sellToBuyer(offer.id, match.instanceId ?? match.itemId, dayKey);
      if (sold > 0) playFeedbackCue(this, 'sell');
      this.renderMarket();
    }, { width: 280, height: 44, background: 0xc4773a, feedback: false });
  }

  private copy(): {
    title: string;
    subtitle: string;
    resetHint: string;
    premium: string;
    completed: string;
    comeBack: string;
    noMatch: string;
    keepHunting: string;
    categoryMatch: string;
    appraised: string;
    restored: string;
    offer: string;
    copies: string;
    sell: string;
    footer: string;
  } {
    if (this.locale === 'ru') {
      return {
        title: 'Рынок покупателей',
        subtitle: 'Три покупателя в день платят премию за нужные им категории и признаки конкретных экземпляров',
        resetHint: 'Предложения обновляются каждый локальный день',
        premium: 'Премия',
        completed: 'Сделка на сегодня завершена',
        comeBack: 'У этого покупателя будет новый спрос завтра.',
        noMatch: 'Подходящей вещи пока нет',
        keepHunting: 'Оставляй подходящие находки вместо быстрой продажи и возвращайся сюда.',
        categoryMatch: 'Подходит по категории',
        appraised: 'Оценка копии',
        restored: 'реставрирован',
        offer: 'Предложение',
        copies: 'Экземпляров',
        sell: 'Продать покупателю',
        footer: 'Каждый оффер можно использовать один раз в день. Покупатель оценивает именно конкретную копию: её состояние, реставрацию и признаки уже заложены в сохранённую оценку.',
      };
    }

    return {
      title: 'Buyer Market',
      subtitle: 'Three daily buyers pay premiums for categories and traits on the concrete copies they want',
      resetHint: 'Offers refresh each local calendar day',
      premium: 'Premium',
      completed: 'Today’s deal is complete',
      comeBack: 'This buyer will have fresh demand tomorrow.',
      noMatch: 'No matching item yet',
      keepHunting: 'Hold matching finds instead of quick-selling them, then return here.',
      categoryMatch: 'Category match',
      appraised: 'Copy appraisal',
      restored: 'restored',
      offer: 'Offer',
      copies: 'Copies',
      sell: 'Sell to buyer',
      footer: 'Each offer can be used once per day. The buyer prices the concrete copy: its condition, restoration and variant traits are already reflected in the saved appraisal.',
    };
  }

  private label(x: number, y: number, text: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${size}px`,
      fontStyle: style,
      color,
    });
  }

  private centerLabel(x: number, y: number, text: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.label(x, y, text, size, color, style).setOrigin(0.5);
  }

  private money(value: number): string {
    const formatted = new Intl.NumberFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value);
    return `${formatted} ₽`;
  }
}
