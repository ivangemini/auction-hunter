import Phaser from 'phaser';
import { ITEMS, ITEM_BY_ID } from '../../data/catalog';
import { COLLECTION_SETS, collectionSetProgress, uniqueCollectionCount, type CollectionSetDefinition } from '../../data/collections';
import type { Locale, Rarity } from '../../domain/types';
import { t } from '../../i18n';
import { getPlatformLocale } from '../../platform/yandex';
import { resolveItemTexture } from '../art';
import { GameStore } from '../store';
import { button } from '../ui';

const WIDTH = 1280;
const HEIGHT = 720;

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
    this.label(70, 145, `${t(this.locale, 'uniqueFinds')}: ${uniqueCount}/${ITEMS.length}`, 20, '#e9b949', 'bold');
    this.label(350, 145, `${t(this.locale, 'setRewardsClaimed')}: ${save.claimedSetRewards.length}/${COLLECTION_SETS.length}`, 18, '#aeb5c0');

    button(this, 1110, 72, t(this.locale, 'backToAuction'), () => this.scene.start('auction'), {
      width: 220,
      height: 48,
      background: 0x61a8ff,
    });

    COLLECTION_SETS.forEach((set, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      this.renderSetCard(set, 70 + column * 585, 200 + row * 225);
    });
  }

  private renderSetCard(set: CollectionSetDefinition, x: number, y: number): void {
    const save = this.store.snapshot;
    const progress = collectionSetProgress(save.collection, set);
    const claimed = save.claimedSetRewards.includes(set.id);

    this.add.rectangle(x, y, 555, 200, 0x15181e, 1).setOrigin(0).setStrokeStyle(1, progress.complete ? 0xe9b949 : 0xffffff, progress.complete ? 0.45 : 0.08);
    this.label(x + 24, y + 18, set.name[this.locale], 22, '#f7f8fa', 'bold');
    this.label(x + 24, y + 52, `${t(this.locale, 'setProgress')}: ${progress.collected}/${progress.total}`, 15, progress.complete ? '#63d28d' : '#8b93a1', 'bold');
    this.label(x + 245, y + 52, `${t(this.locale, 'reward')}: ${this.money(set.reward)}`, 15, '#e9b949', 'bold');

    set.itemIds.forEach((itemId, index) => {
      const item = ITEM_BY_ID.get(itemId);
      if (!item) return;

      const owned = save.collection.includes(itemId);
      const iconX = x + 54 + index * 74;
      const iconY = y + 118;
      const rarityColor = RARITY_COLORS[item.rarity];

      this.add.rectangle(iconX, iconY, 62, 62, rarityColor, owned ? 0.09 : 0.025)
        .setStrokeStyle(1, rarityColor, owned ? 0.5 : 0.12);
      this.add.image(iconX, iconY, resolveItemTexture(this, itemId))
        .setDisplaySize(58, 42)
        .setAlpha(owned ? 1 : 0.18);
    });

    if (claimed) {
      this.label(x + 420, y + 151, t(this.locale, 'rewardClaimed'), 15, '#63d28d', 'bold');
      return;
    }

    if (progress.complete) {
      button(this, x + 455, y + 165, t(this.locale, 'claimReward'), () => {
        this.store.claimSetReward(set.id, set.reward, set.itemIds);
        this.renderBook();
      }, { width: 170, height: 44 });
      return;
    }

    this.label(x + 395, y + 151, t(this.locale, 'completeSet'), 14, '#737b88');
  }

  private label(x: number, y: number, text: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${size}px`,
      fontStyle: style,
      color,
    });
  }

  private money(value: number): string {
    const formatted = new Intl.NumberFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value);
    return `${formatted} ₽`;
  }
}
