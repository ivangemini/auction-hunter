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
import { enterWithStagger, MOTION, prefersReducedMotion } from '../motion';
import { GameStore } from '../store';
import { button } from '../ui';
import { addAtmosphere, addChip, addSurface, VISUAL } from '../visual';

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
    addAtmosphere(this, WIDTH, HEIGHT, VISUAL.copper, 980);
    this.add.rectangle(WIDTH / 2, 116, WIDTH - 110, 1, VISUAL.copper, 0.2);
    this.add.rectangle(44, 25, 5, 74, VISUAL.copper, 0.9).setOrigin(0);

    const copy = this.copy();
    const dayKey = localDayKey();
    this.store.prepareBuyerMarket(dayKey);
    const save = this.store.snapshot;
    const offers = dailyBuyerOffersForDay(dayKey);

    this.label(64, 30, copy.title, 31, VISUAL.text, 'bold');
    this.label(64, 70, copy.subtitle, 14, VISUAL.muted).setWordWrapWidth(650);
    addChip(this, 112, 105, this.locale === 'ru' ? 'ЧАСТНЫЙ СПРОС' : 'PRIVATE DEMAND', VISUAL.copper, {
      width: 140,
      filled: true,
      fontSize: 10,
    });

    const cashPlate = addSurface(this, 760, 35, 190, 62, {
      accent: VISUAL.success,
      fill: VISUAL.panelDeep,
      strokeAlpha: 0.2,
      glowAlpha: 0.012,
    });
    cashPlate.add(this.label(14, 10, this.locale === 'ru' ? 'БАЛАНС' : 'CASH', 9, VISUAL.faint, 'bold'));
    cashPlate.add(this.label(14, 29, this.money(save.cash), 18, '#63d28d', 'bold'));

    const resetPlate = addSurface(this, 966, 35, 126, 62, {
      accent: VISUAL.steel,
      fill: VISUAL.panelDeep,
      strokeAlpha: 0.15,
      glowAlpha: 0.006,
    });
    resetPlate.add(this.label(12, 10, this.locale === 'ru' ? 'СБРОС' : 'REFRESH', 9, VISUAL.faint, 'bold'));
    resetPlate.add(this.label(12, 29, this.locale === 'ru' ? 'Ежедневно' : 'Daily', 15, '#d9dee5', 'bold'));

    button(this, 1175, 68, t(this.locale, 'backToCollection'), () => this.scene.start('collection'), {
      width: 160,
      height: 48,
      background: VISUAL.rare,
      fontSize: this.locale === 'ru' ? 12 : 13,
    });

    offers.forEach((offer, index) => this.renderOfferCard(offer, index, dayKey));

    this.centerLabel(640, 690, copy.footer, 11, VISUAL.faint).setWordWrapWidth(1100);
  }

  private renderOfferCard(offer: BuyerOfferDefinition, index: number, dayKey: string): void {
    const copy = this.copy();
    const x = 48 + index * 405;
    const y = 144;
    const width = 382;
    const height = 518;
    const save = this.store.snapshot;
    const claimed = save.claimedBuyerOfferIds.includes(offer.id);
    const match = claimed
      ? null
      : bestBuyerMatch(save.collection, ITEM_BY_ID, offer, save.collectionItems ?? [], save.claimedSetRewards);
    const expertiseBonus = match?.expertiseBonus ?? 0;
    const shownMultiplier = match?.effectiveMultiplier ?? offer.multiplier;
    const shownPremium = Math.round((shownMultiplier - 1) * 100);
    const accent = this.offerAccent(offer, index);
    const cardAccent = claimed ? VISUAL.success : accent;
    const card = this.add.container(x, y);

    card.add(addSurface(this, 0, 0, width, height, {
      accent: cardAccent,
      fill: VISUAL.panel,
      strokeAlpha: claimed ? 0.38 : 0.22,
      glowAlpha: claimed ? 0.02 : 0.014,
    }));

    const medallionGlow = this.add.circle(54, 58, 38, accent, 0.09).setStrokeStyle(1, accent, 0.24);
    const medallion = this.add.circle(54, 58, 29, VISUAL.panelDeep, 1).setStrokeStyle(2, accent, 0.72);
    const monogram = this.centerLabel(54, 58, this.buyerMonogram(offer.name[this.locale]), 17, this.hex(accent), 'bold');
    card.add([medallionGlow, medallion, monogram]);

    card.add(this.label(98, 25, offer.name[this.locale], 20, VISUAL.text, 'bold').setWordWrapWidth(185));
    card.add(addChip(this, 307, 47, `+${shownPremium}%`, VISUAL.warm, {
      width: 90,
      height: 32,
      filled: true,
      fontSize: 13,
      foreground: '#fff0c2',
    }));
    card.add(this.label(98, 77, offer.description[this.locale], 12, '#b0b7c0')
      .setWordWrapWidth(250)
      .setLineSpacing(3));
    card.add(addChip(this, 106, 133, this.demandLabel(offer), accent, {
      width: 188,
      height: 29,
      filled: false,
      fontSize: 9,
    }));
    if (expertiseBonus > 0) {
      card.add(addChip(this, 294, 133, `${this.locale === 'ru' ? 'ЭКСПЕРТ' : 'EXPERTISE'} +${Math.round(expertiseBonus * 100)}%`, VISUAL.success, {
        width: 148,
        height: 29,
        filled: true,
        fontSize: 9,
      }));
    } else {
      card.add(this.label(221, 124, `${copy.premium}: +${shownPremium}%`, 11, '#e9b949', 'bold'));
    }
    card.add(this.add.rectangle(20, 157, width - 40, 1, accent, 0.18).setOrigin(0));

    if (claimed) {
      const stamp = this.add.circle(width / 2, 280, 68, VISUAL.success, 0.075).setStrokeStyle(2, VISUAL.success, 0.42);
      const check = this.centerLabel(width / 2, 274, '✓', 48, '#63d28d', 'bold');
      const done = this.centerLabel(width / 2, 350, copy.completed, 18, '#63d28d', 'bold').setWordWrapWidth(300);
      const again = this.centerLabel(width / 2, 395, copy.comeBack, 12, VISUAL.muted).setWordWrapWidth(290);
      card.add([stamp, check, done, again]);
      card.add(addChip(this, width / 2, 469, this.locale === 'ru' ? 'СДЕЛКА ЗАКРЫТА' : 'DEAL CLOSED', VISUAL.success, {
        width: 170,
        height: 30,
        filled: true,
        fontSize: 10,
      }));
      enterWithStagger(this, card, y, index);
      return;
    }

    if (!match) {
      const searchRing = this.add.circle(width / 2, 276, 58, VISUAL.steel, 0.16).setStrokeStyle(2, accent, 0.28);
      const question = this.centerLabel(width / 2, 272, '?', 38, this.hex(accent), 'bold');
      const noMatch = this.centerLabel(width / 2, 351, copy.noMatch, 17, '#a8b0ba', 'bold').setWordWrapWidth(295);
      const keep = this.centerLabel(width / 2, 399, copy.keepHunting, 12, VISUAL.muted).setWordWrapWidth(302);
      card.add([searchRing, question, noMatch, keep]);
      card.add(addChip(this, width / 2, 469, this.locale === 'ru' ? 'ЖДЁТ НАХОДКУ' : 'WAITING FOR A FIND', accent, {
        width: 182,
        height: 30,
        fontSize: 10,
      }));
      enterWithStagger(this, card, y, index);
      return;
    }

    const item = ITEM_BY_ID.get(match.itemId);
    if (!item) return;

    const hero = addSurface(this, 28, 176, 326, 173, {
      accent,
      fill: VISUAL.panelDeep,
      strokeAlpha: 0.24,
      glowAlpha: 0.018,
    });
    hero.add(this.add.ellipse(163, 77, 240, 126, accent, 0.045));
    hero.add(this.add.image(163, 78, resolveItemTexture(this, item.id)).setDisplaySize(210, 142));
    hero.add(addChip(this, 66, 148, item.rarity.toUpperCase(), accent, { width: 112, filled: true, fontSize: 9 }));
    if (match.condition !== undefined) {
      hero.add(addChip(this, 248, 148, `${Math.round(match.condition * 100)}%`, VISUAL.rare, { width: 72, fontSize: 10 }));
    }
    card.add(hero);

    card.add(this.centerLabel(width / 2, 366, item.name[this.locale], 17, VISUAL.text, 'bold').setWordWrapWidth(315));
    const traits = match.traitIds
      ? itemTraitNamesForIds(match.traitIds, this.locale)
      : itemTraitNames(item.id, this.locale);
    const traitText = traits.length > 0 ? traits.join(' · ') : copy.categoryMatch;
    card.add(this.centerLabel(width / 2, 391, traitText, 10, traits.length > 0 ? '#61a8ff' : VISUAL.muted, 'bold')
      .setWordWrapWidth(315));

    if (match.appraisedValue !== undefined) {
      const restored = match.restored ? ` · ${copy.restored}` : '';
      card.add(this.centerLabel(width / 2, 416, `${copy.appraised}: ${this.money(match.appraisedValue)}${restored}`, 11, '#b7c0c9', 'bold')
        .setWordWrapWidth(315));
    }

    card.add(this.centerLabel(width / 2, 445, `${copy.offer}: ${this.money(match.value)}`, 21, '#63d28d', 'bold'));
    if (match.copies > 1) card.add(addChip(this, 72, 474, `${copy.copies}: ${match.copies}`, VISUAL.steel, { width: 105, height: 26, fontSize: 9 }));

    const sellButton = button(this, width / 2, 488, `${copy.sell} · ${this.money(match.value)}`, () => {
      const sold = this.store.sellToBuyer(offer.id, match.instanceId ?? match.itemId, dayKey);
      if (sold > 0) playFeedbackCue(this, 'sell');
      if (sold > 0 && !prefersReducedMotion()) {
        this.tweens.add({
          targets: card,
          scaleX: 1.025,
          scaleY: 1.025,
          alpha: 0.68,
          duration: MOTION.selectMs,
          ease: 'Cubic.Out',
          onComplete: () => this.renderMarket(),
        });
      } else {
        this.renderMarket();
      }
    }, { width: 292, height: 42, background: VISUAL.copper, accent: VISUAL.warm, feedback: false, fontSize: this.locale === 'ru' ? 11 : 12 });
    card.add(sellButton);

    enterWithStagger(this, card, y, index);
  }

  private offerAccent(offer: BuyerOfferDefinition, index: number): number {
    if (offer.traitIds && offer.traitIds.length > 0) return VISUAL.purple;
    switch (offer.category) {
      case 'watches': return VISUAL.warm;
      case 'electronics': return VISUAL.rare;
      case 'toys': return VISUAL.copper;
      case 'art': return VISUAL.purple;
      case 'tools': return 0x9aa5af;
      case 'collectibles': return VISUAL.success;
      default: return index === 2 ? VISUAL.purple : VISUAL.copper;
    }
  }

  private demandLabel(offer: BuyerOfferDefinition): string {
    if (offer.category) {
      const ru: Record<string, string> = {
        watches: 'ЧАСЫ', electronics: 'ЭЛЕКТРОНИКА', toys: 'ИГРУШКИ', art: 'ИСКУССТВО', tools: 'ИНСТРУМЕНТЫ', collectibles: 'РЕДКОСТИ',
      };
      return this.locale === 'ru' ? `КАТЕГОРИЯ · ${ru[offer.category] ?? offer.category.toUpperCase()}` : `CATEGORY · ${offer.category.toUpperCase()}`;
    }
    return this.locale === 'ru' ? 'СПЕЦИАЛИСТ · ПРИЗНАКИ' : 'SPECIALIST · TRAITS';
  }

  private buyerMonogram(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
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
        footer: 'Каждый оффер можно использовать один раз в день. Завершённые наборы дают постоянную экспертную надбавку к подходящей категории; состояние, реставрация и признаки конкретной копии уже входят в её оценку.',
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
      footer: 'Each offer can be used once per day. Claimed collection sets add a permanent expertise premium for their category; condition, restoration and traits are already reflected in the concrete copy appraisal.',
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

  private hex(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }

  private money(value: number): string {
    const formatted = new Intl.NumberFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value);
    return `${formatted} ₽`;
  }
}
