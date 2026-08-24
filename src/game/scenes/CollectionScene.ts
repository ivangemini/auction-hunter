import Phaser from 'phaser';
import { ITEMS, ITEM_BY_ID } from '../../data/catalog';
import {
  COLLECTION_RESALE_RATE,
  COLLECTION_SETS,
  collectionSetProgress,
  uniqueCollectionCount,
  type CollectionSetDefinition,
} from '../../data/collections';
import { itemTraitNames, itemTraitNamesForIds } from '../../data/itemTraits';
import { collectionResaleValue, ownedCopies } from '../../domain/collection';
import { collectionResaleRate, setRewardValue } from '../../domain/meta';
import type { Locale, Rarity } from '../../domain/types';
import { t } from '../../i18n';
import { getPlatformLocale } from '../../platform/yandex';
import { resolveItemTexture } from '../art';
import { playFeedbackCue } from '../feedback';
import { enterWithStagger, MOTION, prefersReducedMotion } from '../motion';
import { GameStore } from '../store';
import { button } from '../ui';
import { centerText, chip, hex, insetSurface, surface, text, VISUAL } from '../visual';

const WIDTH = 1280;
const HEIGHT = 720;
const SETS_PER_PAGE = 4;
const SET_ACCENTS = [VISUAL.gold, VISUAL.blue, VISUAL.violet, VISUAL.copper] as const;

const RARITY_COLORS: Record<Rarity, number> = {
  common: 0xaeb5c0,
  uncommon: VISUAL.green,
  rare: VISUAL.blue,
  epic: VISUAL.violet,
  legendary: 0xffc857,
};

export class CollectionScene extends Phaser.Scene {
  private readonly store = new GameStore();
  private locale: Locale = 'en';
  private selectedItemId: string | null = null;
  private pageIndex = 0;

  constructor() {
    super('collection');
  }

  create(): void {
    this.locale = getPlatformLocale();
    this.renderBook();
  }

  private renderBook(): void {
    this.children.removeAll(true);
    this.renderBackdrop();
    this.renderHeader();

    const pageCount = Math.max(1, Math.ceil(COLLECTION_SETS.length / SETS_PER_PAGE));
    this.pageIndex = Phaser.Math.Clamp(this.pageIndex, 0, pageCount - 1);
    const pageSets = COLLECTION_SETS.slice(
      this.pageIndex * SETS_PER_PAGE,
      this.pageIndex * SETS_PER_PAGE + SETS_PER_PAGE,
    );

    pageSets.forEach((set, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      this.renderSetCard(set, 42 + column * 610, 168 + row * 238, index);
    });

    if (pageCount > 1) this.renderPager(pageCount);
    if (this.selectedItemId) this.renderInventoryModal(this.selectedItemId);
  }

  private renderBackdrop(): void {
    this.add.rectangle(0, 0, WIDTH, HEIGHT, VISUAL.background, 1).setOrigin(0);
    this.add.rectangle(0, 0, WIDTH, 136, VISUAL.backgroundRaised, 0.98).setOrigin(0);
    this.add.rectangle(0, 136, 380, HEIGHT - 136, VISUAL.gold, 0.018).setOrigin(0);
    this.add.rectangle(900, 136, 380, HEIGHT - 136, VISUAL.blue, 0.014).setOrigin(0);
    this.add.rectangle(28, 135, 1224, 1, VISUAL.line, 0.08).setOrigin(0);
  }

  private renderHeader(): void {
    const save = this.store.snapshot;
    const uniqueCount = uniqueCollectionCount(save.collection);

    surface(this, 28, 20, 206, 92, VISUAL.gold, 0.46);
    text(this, 48, 35, 'COLLECTION', 20, '#f0c969', 'bold');
    text(this, 82, 68, 'ARCHIVE', 13, VISUAL.muted, 'bold');

    text(this, 266, 28, t(this.locale, 'collectionBook'), 28, VISUAL.text, 'bold');
    text(this, 266, 65, t(this.locale, 'collectionBookSubtitle'), 12, VISUAL.muted).setWordWrapWidth(390);

    this.headerStat(720, t(this.locale, 'uniqueFinds'), `${uniqueCount}/${ITEMS.length}`, VISUAL.gold);
    this.headerStat(852, t(this.locale, 'setRewardsClaimed'), `${save.claimedSetRewards.length}/${COLLECTION_SETS.length}`, VISUAL.blue);
    this.headerStat(984, t(this.locale, 'cash'), this.money(save.cash), VISUAL.green);

    button(this, 1124, 46, this.locale === 'ru' ? 'Рынок' : 'Market', () => this.scene.start('buyer-market'), {
      width: 112,
      height: 38,
      background: VISUAL.copper,
      accent: 0xe39a58,
      fontSize: 13,
      hitSlop: 4,
    });
    button(this, 1124, 94, t(this.locale, 'backToAuction'), () => this.scene.start('auction'), {
      width: 112,
      height: 36,
      background: 0x253a55,
      accent: VISUAL.blue,
      fontSize: 11,
      hitSlop: 4,
    });
  }

  private headerStat(x: number, title: string, value: string, accent: number): void {
    insetSurface(this, x, 25, 120, 64, accent, 0.28);
    text(this, x + 11, 34, title.toUpperCase(), 7, VISUAL.dim, 'bold').setWordWrapWidth(98);
    this.add.circle(x + 15, 68, 6, accent, 0.9);
    text(this, x + 28, 56, value, 15, VISUAL.text, 'bold').setWordWrapWidth(82);
  }

  private renderSetCard(set: CollectionSetDefinition, x: number, y: number, index: number): void {
    const save = this.store.snapshot;
    const progress = collectionSetProgress(save.collection, set);
    const claimed = save.claimedSetRewards.includes(set.id);
    const reward = setRewardValue(set.reward, save.businessUpgrades.showroom);
    const accent = progress.complete ? VISUAL.gold : SET_ACCENTS[index] ?? VISUAL.blue;

    const card = this.add.container(x, y);
    const shadow = this.add.rectangle(5, 7, 586, 222, 0x000000, 0.34).setOrigin(0);
    const body = this.add.rectangle(0, 0, 586, 222, VISUAL.surface, 0.99)
      .setOrigin(0)
      .setStrokeStyle(1, accent, progress.complete ? 0.56 : 0.24);
    const topBand = this.add.rectangle(0, 0, 586, 54, accent, progress.complete ? 0.12 : 0.065).setOrigin(0);
    const spine = this.add.rectangle(0, 0, 5, 222, accent, 0.88).setOrigin(0);
    const title = text(this, 24, 15, set.name[this.locale], 20, VISUAL.text, 'bold').setWordWrapWidth(300);
    const progressText = `${progress.collected}/${progress.total}`;
    const progressChip = chip(
      this,
      365,
      14,
      88,
      `${t(this.locale, 'setProgress').toUpperCase()} ${progressText}`,
      progress.complete ? VISUAL.green : accent,
    );
    const rewardChip = chip(this, 463, 14, 104, this.money(reward), VISUAL.gold, '#f0c969');
    card.add([shadow, body, topBand, spine, title, progressChip, rewardChip]);

    const track = this.add.rectangle(24, 68, 538, 7, 0x2b3038, 1).setOrigin(0).setStrokeStyle(1, VISUAL.line, 0.05);
    const fill = this.add.rectangle(24, 68, 538 * (progress.total > 0 ? progress.collected / progress.total : 0), 7, progress.complete ? VISUAL.green : accent, 0.9).setOrigin(0);
    card.add([track, fill]);

    const slotAreaX = 24;
    const slotAreaWidth = 538;
    const slotGap = 8;
    const slotWidth = Math.min(98, (slotAreaWidth - slotGap * Math.max(0, set.itemIds.length - 1)) / Math.max(1, set.itemIds.length));
    const slotsWidth = slotWidth * set.itemIds.length + slotGap * Math.max(0, set.itemIds.length - 1);
    const firstX = slotAreaX + (slotAreaWidth - slotsWidth) / 2;

    set.itemIds.forEach((itemId, itemIndex) => {
      const item = ITEM_BY_ID.get(itemId);
      if (!item) return;
      const copies = ownedCopies(save.collection, itemId);
      const owned = copies > 0;
      const rarityColor = RARITY_COLORS[item.rarity];
      const slotX = firstX + itemIndex * (slotWidth + slotGap);
      const slot = this.add.container(slotX, 88);
      const slotBody = this.add.rectangle(0, 0, slotWidth, 88, 0x0c1016, 1)
        .setOrigin(0)
        .setStrokeStyle(1, rarityColor, owned ? 0.44 : 0.1);
      const image = this.add.image(slotWidth / 2, 38, resolveItemTexture(this, itemId))
        .setDisplaySize(Math.max(48, slotWidth - 12), 56)
        .setAlpha(owned ? 1 : 0.16);
      const state = centerText(
        this,
        slotWidth / 2,
        76,
        owned ? `×${copies}` : '—',
        10,
        owned ? '#c8cdd5' : '#4d545e',
        'bold',
      );
      slot.add([slotBody, image, state]);
      card.add(slot);

      if (owned) {
        slotBody.setInteractive({ useHandCursor: true });
        slotBody.on('pointerover', () => slotBody.setStrokeStyle(2, rarityColor, 0.92));
        slotBody.on('pointerout', () => slotBody.setStrokeStyle(1, rarityColor, 0.44));
        slotBody.on('pointerup', () => {
          playFeedbackCue(this, 'ui');
          this.selectedItemId = itemId;
          this.renderBook();
        });
      }
    });

    const footerY = 188;
    if (claimed) {
      const stamp = chip(this, 24, footerY, 180, t(this.locale, 'rewardClaimed').toUpperCase(), VISUAL.green, '#7ee0a0');
      card.add(stamp);
    } else if (progress.complete) {
      const claim = button(this, 474, 198, t(this.locale, 'claimReward'), () => {
        this.store.claimSetReward(set.id, set.reward, set.itemIds);
        playFeedbackCue(this, 'ui');
        this.renderBook();
      }, { width: 178, height: 38, background: VISUAL.gold, accent: 0xffd260, fontSize: 13, hitSlop: 5 });
      card.add(claim);
      card.add(text(this, 24, footerY + 6, this.locale === 'ru' ? 'КОМПЛЕКТ СОБРАН' : 'SET COMPLETE', 10, '#7ee0a0', 'bold'));
    } else {
      card.add(text(this, 24, footerY + 6, t(this.locale, 'completeSet'), 10, VISUAL.dim, 'bold').setWordWrapWidth(520));
    }

    this.installCardHover(card, body, accent, y);
    enterWithStagger(this, card, y, index);
  }

  private installCardHover(card: Phaser.GameObjects.Container, body: Phaser.GameObjects.Rectangle, accent: number, baseY: number): void {
    const hit = this.add.rectangle(293, 110, 586, 220, 0xffffff, 0.001);
    card.addAt(hit, 0);
    hit.setInteractive({ useHandCursor: false });
    const reduced = prefersReducedMotion();
    hit.on('pointerover', () => {
      body.setStrokeStyle(1, accent, 0.5);
      if (reduced) return;
      this.tweens.killTweensOf(card);
      this.tweens.add({ targets: card, y: baseY - 3, duration: MOTION.hoverMs, ease: 'Cubic.Out' });
    });
    hit.on('pointerout', () => {
      body.setStrokeStyle(1, accent, 0.24);
      if (reduced) return;
      this.tweens.killTweensOf(card);
      this.tweens.add({ targets: card, y: baseY, duration: MOTION.settleMs, ease: 'Cubic.Out' });
    });
  }

  private renderPager(pageCount: number): void {
    button(this, 548, 682, '‹', () => {
      this.pageIndex = Math.max(0, this.pageIndex - 1);
      this.renderBook();
    }, { width: 54, height: 34, background: 0x2c313a, disabled: this.pageIndex === 0, hitSlop: 8, fontSize: 22 });
    centerText(this, 640, 682, `${this.pageIndex + 1} / ${pageCount}`, 13, VISUAL.muted, 'bold');
    button(this, 732, 682, '›', () => {
      this.pageIndex = Math.min(pageCount - 1, this.pageIndex + 1);
      this.renderBook();
    }, { width: 54, height: 34, background: 0x2c313a, disabled: this.pageIndex >= pageCount - 1, hitSlop: 8, fontSize: 22 });
  }

  private renderInventoryModal(itemId: string): void {
    const item = ITEM_BY_ID.get(itemId);
    if (!item) {
      this.selectedItemId = null;
      return;
    }

    const save = this.store.snapshot;
    const copies = ownedCopies(save.collection, itemId);
    if (copies <= 0) {
      this.selectedItemId = null;
      return;
    }

    const instances = (save.collectionItems ?? [])
      .filter((candidate) => candidate.itemId === itemId)
      .sort((left, right) => left.appraisedValue - right.appraisedValue || left.acquiredAt - right.acquiredAt);
    const instance = instances[0];
    const rate = collectionResaleRate(COLLECTION_RESALE_RATE, save.businessUpgrades.warehouse);
    const resaleBasis = instance?.appraisedValue ?? item.baseValue;
    const resale = collectionResaleValue(resaleBasis, rate);
    const traits = instance
      ? itemTraitNamesForIds(instance.traitIds, this.locale)
      : itemTraitNames(itemId, this.locale);
    const accent = RARITY_COLORS[item.rarity];

    const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x05070a, 0.82)
      .setInteractive({ useHandCursor: true });
    overlay.on('pointerup', () => {
      this.selectedItemId = null;
      this.renderBook();
    });

    const modal = this.add.container(210, 132);
    const body = surface(this, 0, 0, 860, 500, accent, 0.54);
    const artFrame = insetSurface(this, 26, 28, 350, 360, accent, 0.28);
    const halo = this.add.circle(201, 205, 142, accent, 0.04).setStrokeStyle(1, accent, 0.12);
    const image = this.add.image(201, 205, resolveItemTexture(this, itemId)).setDisplaySize(318, 228);
    centerText(this, 201, 350, item.name[this.locale], 21, VISUAL.text, 'bold').setWordWrapWidth(310).setAlign('center');
    const rarity = chip(this, 120, 400, 162, item.rarity.toUpperCase(), accent, hex(accent));

    text(this, 414, 36, this.locale === 'ru' ? 'КАРТОЧКА ЭКЗЕМПЛЯРА' : 'COPY RECORD', 9, hex(accent), 'bold');
    text(this, 414, 64, item.name[this.locale], 28, VISUAL.text, 'bold').setWordWrapWidth(410);
    text(this, 414, 110, t(this.locale, 'ownedCopies', { count: copies }), 13, VISUAL.muted, 'bold');

    if (instance) {
      const copyLabel = this.locale === 'ru' ? 'Самая дешёвая копия' : 'Lowest-value copy';
      const restored = instance.restored ? (this.locale === 'ru' ? ' · реставрирован' : ' · restored') : '';
      insetSurface(this, 414, 146, 410, 66, accent, 0.18);
      text(this, 430, 157, copyLabel.toUpperCase(), 8, VISUAL.dim, 'bold');
      text(this, 430, 179, `${this.money(instance.appraisedValue)} · ${Math.round(instance.condition * 100)}%${restored}`, 16, VISUAL.text, 'bold').setWordWrapWidth(380);
    }

    text(this, 414, 238, t(this.locale, 'resaleValue', { amount: this.money(resale) }), 21, '#7ee0a0', 'bold');
    if (traits.length > 0) {
      text(this, 414, 278, this.locale === 'ru' ? 'ПРИЗНАКИ' : 'TRAITS', 8, VISUAL.dim, 'bold');
      text(this, 414, 299, traits.join(' · '), 12, '#8fc3ff', 'bold').setWordWrapWidth(405);
    }
    text(this, 414, 352, t(this.locale, 'sellCollectionWarning'), 11, VISUAL.muted)
      .setWordWrapWidth(405)
      .setLineSpacing(2);

    const sell = button(this, 619, 426, t(this.locale, 'sellOne', { amount: this.money(resale) }), () => {
      if (this.store.sellCollectionItem(itemId, resale)) playFeedbackCue(this, 'sell');
      const remaining = ownedCopies(this.store.snapshot.collection, itemId);
      this.selectedItemId = remaining > 0 ? itemId : null;
      this.renderBook();
    }, { width: 330, height: 54, background: VISUAL.copper, accent: 0xe39a58, fontSize: 15, feedback: false });
    const close = button(this, 619, 474, t(this.locale, 'close'), () => {
      this.selectedItemId = null;
      this.renderBook();
    }, { width: 160, height: 34, background: 0x2c313a, fontSize: 12 });

    modal.add([body, artFrame, halo, image, rarity, sell, close]);
    if (!prefersReducedMotion()) {
      modal.setAlpha(0).setScale(0.97);
      this.tweens.add({ targets: modal, alpha: 1, scaleX: 1, scaleY: 1, duration: MOTION.cardEnterMs, ease: 'Back.Out' });
    }
  }

  private money(value: number): string {
    const formatted = new Intl.NumberFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value);
    return `${formatted} ₽`;
  }
}
