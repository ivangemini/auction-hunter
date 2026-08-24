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
import { GameStore } from '../store';
import { button } from '../ui';

const WIDTH = 1280;
const HEIGHT = 720;
const SETS_PER_PAGE = 4;

const RARITY_COLORS: Record<Rarity, number> = {
  common: 0xaeb5c0,
  uncommon: 0x63d28d,
  rare: 0x61a8ff,
  epic: 0xb576ff,
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
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x101216);
    this.add.rectangle(1050, HEIGHT / 2, 460, HEIGHT, 0x61a8ff, 0.018);
    this.add.rectangle(WIDTH / 2, 116, WIDTH - 120, 1, 0x2b3038);

    this.label(70, 42, t(this.locale, 'collectionBook'), 30, '#f7f8fa', 'bold');
    this.label(70, 80, t(this.locale, 'collectionBookSubtitle'), 15, '#737b88');

    const save = this.store.snapshot;
    const uniqueCount = uniqueCollectionCount(save.collection);
    this.label(70, 137, `${t(this.locale, 'uniqueFinds')}: ${uniqueCount}/${ITEMS.length}`, 19, '#e9b949', 'bold');
    this.label(345, 137, `${t(this.locale, 'setRewardsClaimed')}: ${save.claimedSetRewards.length}/${COLLECTION_SETS.length}`, 17, '#aeb5c0');
    this.label(660, 137, `${t(this.locale, 'cash')}: ${this.money(save.cash)}`, 18, '#63d28d', 'bold');
    this.label(70, 170, t(this.locale, 'collectionManageHint'), 13, '#737b88');

    button(this, 775, 72, this.locale === 'ru' ? 'Рынок покупателей' : 'Buyer Market', () => this.scene.start('buyer-market'), {
      width: 190,
      height: 48,
      background: 0xc4773a,
    });
    button(this, 970, 72, t(this.locale, 'office'), () => this.scene.start('office'), {
      width: 160,
      height: 48,
      background: 0xe9b949,
    });
    button(this, 1140, 72, t(this.locale, 'backToAuction'), () => this.scene.start('auction'), {
      width: 170,
      height: 48,
      background: 0x61a8ff,
    });

    const pageCount = Math.max(1, Math.ceil(COLLECTION_SETS.length / SETS_PER_PAGE));
    this.pageIndex = Phaser.Math.Clamp(this.pageIndex, 0, pageCount - 1);
    const pageSets = COLLECTION_SETS.slice(
      this.pageIndex * SETS_PER_PAGE,
      this.pageIndex * SETS_PER_PAGE + SETS_PER_PAGE,
    );

    pageSets.forEach((set, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      this.renderSetCard(set, 70 + column * 585, 195 + row * 230);
    });

    if (pageCount > 1) {
      button(this, 545, 670, '‹', () => {
        this.pageIndex = Math.max(0, this.pageIndex - 1);
        this.renderBook();
      }, { width: 58, height: 42, background: 0x2c313a, disabled: this.pageIndex === 0, hitSlop: 8 });
      this.centerLabel(640, 670, `${this.pageIndex + 1}/${pageCount}`, 16, '#aeb5c0', 'bold');
      button(this, 735, 670, '›', () => {
        this.pageIndex = Math.min(pageCount - 1, this.pageIndex + 1);
        this.renderBook();
      }, { width: 58, height: 42, background: 0x2c313a, disabled: this.pageIndex >= pageCount - 1, hitSlop: 8 });
    }

    if (this.selectedItemId) this.renderInventoryModal(this.selectedItemId);
  }

  private renderSetCard(set: CollectionSetDefinition, x: number, y: number): void {
    const save = this.store.snapshot;
    const progress = collectionSetProgress(save.collection, set);
    const claimed = save.claimedSetRewards.includes(set.id);
    const reward = setRewardValue(set.reward, save.businessUpgrades.showroom);

    this.add.rectangle(x, y, 555, 205, 0x15181e, 1)
      .setOrigin(0)
      .setStrokeStyle(1, progress.complete ? 0xe9b949 : 0xffffff, progress.complete ? 0.45 : 0.08);
    this.label(x + 24, y + 18, set.name[this.locale], 22, '#f7f8fa', 'bold');
    this.label(x + 24, y + 52, `${t(this.locale, 'setProgress')}: ${progress.collected}/${progress.total}`, 15, progress.complete ? '#63d28d' : '#8b93a1', 'bold');
    this.label(x + 245, y + 52, `${t(this.locale, 'reward')}: ${this.money(reward)}`, 15, '#e9b949', 'bold');

    set.itemIds.forEach((itemId, index) => {
      const item = ITEM_BY_ID.get(itemId);
      if (!item) return;

      const copies = ownedCopies(save.collection, itemId);
      const owned = copies > 0;
      const iconX = x + 54 + index * 74;
      const iconY = y + 118;
      const rarityColor = RARITY_COLORS[item.rarity];

      const frame = this.add.rectangle(iconX, iconY, 62, 62, rarityColor, owned ? 0.09 : 0.025)
        .setStrokeStyle(1, rarityColor, owned ? 0.5 : 0.12);
      this.add.image(iconX, iconY, resolveItemTexture(this, itemId))
        .setDisplaySize(58, 42)
        .setAlpha(owned ? 1 : 0.18);

      if (owned) {
        this.centerLabel(iconX, y + 156, `×${copies}`, 12, '#aeb5c0', 'bold');
        frame.setInteractive({ useHandCursor: true });
        frame.on('pointerover', () => frame.setStrokeStyle(2, rarityColor, 0.95));
        frame.on('pointerout', () => frame.setStrokeStyle(1, rarityColor, 0.5));
        frame.on('pointerup', () => {
          playFeedbackCue(this, 'ui');
          this.selectedItemId = itemId;
          this.renderBook();
        });
      }
    });

    if (claimed) {
      this.label(x + 405, y + 151, t(this.locale, 'rewardClaimed'), 14, '#63d28d', 'bold');
      return;
    }

    if (progress.complete) {
      button(this, x + 455, y + 166, t(this.locale, 'claimReward'), () => {
        this.store.claimSetReward(set.id, set.reward, set.itemIds);
        this.renderBook();
      }, { width: 170, height: 42 });
      return;
    }

    this.label(x + 395, y + 151, t(this.locale, 'completeSet'), 14, '#737b88');
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
    const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x05070a, 0.78)
      .setInteractive({ useHandCursor: true });
    overlay.on('pointerup', () => {
      this.selectedItemId = null;
      this.renderBook();
    });

    const panel = this.add.rectangle(640, 365, 600, 390, 0x171a20, 1)
      .setStrokeStyle(1, RARITY_COLORS[item.rarity], 0.55)
      .setInteractive();

    this.add.image(500, 330, resolveItemTexture(this, itemId)).setDisplaySize(190, 138);
    this.label(635, 218, item.name[this.locale], 25, '#f7f8fa', 'bold');
    this.label(635, 260, t(this.locale, 'ownedCopies', { count: copies }), 16, '#aeb5c0');

    if (instance) {
      const instanceLabel = this.locale === 'ru' ? 'Самая дешёвая копия' : 'Lowest-value copy';
      const restored = instance.restored ? (this.locale === 'ru' ? ' · реставрирован' : ' · restored') : '';
      this.label(635, 292, `${instanceLabel}: ${this.money(instance.appraisedValue)} · ${Math.round(instance.condition * 100)}%${restored}`, 13, '#d7dbe2', 'bold')
        .setWordWrapWidth(255);
    }

    this.label(635, 326, t(this.locale, 'resaleValue', { amount: this.money(resale) }), 18, '#63d28d', 'bold');

    if (traits.length > 0) {
      this.label(635, 356, `${this.locale === 'ru' ? 'Признаки' : 'Traits'}: ${traits.join(' · ')}`, 12, '#61a8ff', 'bold')
        .setWordWrapWidth(255);
    }

    this.label(635, 400, t(this.locale, 'sellCollectionWarning'), 12, '#8b93a1')
      .setWordWrapWidth(255)
      .setLineSpacing(2);

    button(this, 690, 500, t(this.locale, 'sellOne', { amount: this.money(resale) }), () => {
      if (this.store.sellCollectionItem(itemId, resale)) playFeedbackCue(this, 'sell');
      const remaining = ownedCopies(this.store.snapshot.collection, itemId);
      this.selectedItemId = remaining > 0 ? itemId : null;
      this.renderBook();
    }, { width: 260, height: 52 });

    button(this, 690, 565, t(this.locale, 'close'), () => {
      this.selectedItemId = null;
      this.renderBook();
    }, { width: 200, height: 46, background: 0x2c313a });

    void panel;
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
