import Phaser from 'phaser';
import { ITEMS, ITEM_BY_ID } from '../../data/catalog';
import {
  COLLECTION_RESALE_RATE,
  COLLECTION_SETS,
  collectionExpertiseBonus,
  collectionExpertiseResaleRate,
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
import { addAtmosphere, addChip, addProgressBar, addSurface, enableHoverLift, VISUAL } from '../visual';

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
    addAtmosphere(this, WIDTH, HEIGHT, VISUAL.rare, 1010);
    this.add.rectangle(WIDTH / 2, 114, WIDTH - 110, 1, VISUAL.rare, 0.18);
    this.add.rectangle(44, 25, 5, 74, VISUAL.warm, 0.82).setOrigin(0);

    this.label(64, 30, t(this.locale, 'collectionBook'), 31, VISUAL.text, 'bold');
    this.label(64, 70, t(this.locale, 'collectionBookSubtitle'), 14, VISUAL.muted);
    addChip(this, 111, 105, this.locale === 'ru' ? 'АРХИВ НАХОДОК' : 'FIND ARCHIVE', VISUAL.warm, {
      width: 138,
      filled: true,
      fontSize: 10,
    });

    const save = this.store.snapshot;
    const uniqueCount = uniqueCollectionCount(save.collection);
    this.addStatPlate(62, 126, this.locale === 'ru' ? 'УНИКАЛЬНЫЕ' : 'UNIQUE FINDS', `${uniqueCount}/${ITEMS.length}`, VISUAL.warm);
    this.addStatPlate(265, 126, this.locale === 'ru' ? 'НАБОРЫ' : 'SET REWARDS', `${save.claimedSetRewards.length}/${COLLECTION_SETS.length}`, VISUAL.rare);
    this.addStatPlate(468, 126, this.locale === 'ru' ? 'БАЛАНС' : 'CASH', this.money(save.cash), VISUAL.success);

    button(this, 820, 70, this.locale === 'ru' ? 'Рынок покупателей' : 'Buyer Market', () => this.scene.start('buyer-market'), {
      width: 195,
      height: 48,
      background: VISUAL.copper,
      accent: VISUAL.warm,
      fontSize: this.locale === 'ru' ? 13 : 15,
    });
    button(this, 1000, 70, t(this.locale, 'office'), () => this.scene.start('office'), {
      width: 145,
      height: 48,
      background: VISUAL.warm,
    });
    button(this, 1160, 70, t(this.locale, 'backToAuction'), () => this.scene.start('auction'), {
      width: 155,
      height: 48,
      background: VISUAL.rare,
      fontSize: this.locale === 'ru' ? 13 : 15,
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
      this.renderSetCard(set, 54 + column * 612, 194 + row * 225, index);
    });

    if (pageCount > 1) {
      button(this, 545, 674, '‹', () => {
        this.pageIndex = Math.max(0, this.pageIndex - 1);
        this.renderBook();
      }, { width: 58, height: 40, background: VISUAL.steel, disabled: this.pageIndex === 0, hitSlop: 8 });
      addChip(this, 640, 674, `${this.pageIndex + 1} / ${pageCount}`, VISUAL.warm, { width: 86, height: 30, filled: true, fontSize: 12 });
      button(this, 735, 674, '›', () => {
        this.pageIndex = Math.min(pageCount - 1, this.pageIndex + 1);
        this.renderBook();
      }, { width: 58, height: 40, background: VISUAL.steel, disabled: this.pageIndex >= pageCount - 1, hitSlop: 8 });
    }

    this.label(62, 650, t(this.locale, 'collectionManageHint'), 12, VISUAL.faint);

    if (this.selectedItemId) this.renderInventoryModal(this.selectedItemId);
  }

  private addStatPlate(x: number, y: number, caption: string, value: string, accent: number): void {
    const surface = addSurface(this, x, y, 184, 54, {
      accent,
      fill: VISUAL.panelDeep,
      strokeAlpha: 0.18,
      glowAlpha: 0.012,
    });
    const captionText = this.label(14, 9, caption, 9, VISUAL.faint, 'bold');
    const valueText = this.label(14, 25, value, 17, this.hex(accent), 'bold');
    surface.add([captionText, valueText]);
  }

  private renderSetCard(set: CollectionSetDefinition, x: number, y: number, entranceIndex: number): void {
    const save = this.store.snapshot;
    const progress = collectionSetProgress(save.collection, set);
    const claimed = save.claimedSetRewards.includes(set.id);
    const reward = setRewardValue(set.reward, save.businessUpgrades.showroom);
    const accent = claimed ? VISUAL.success : progress.complete ? VISUAL.warm : VISUAL.rare;
    const width = 580;
    const height = 210;
    const card = this.add.container(x, y);

    card.add(addSurface(this, 0, 0, width, height, {
      accent,
      fill: VISUAL.panel,
      strokeAlpha: progress.complete || claimed ? 0.38 : 0.16,
      glowAlpha: progress.complete ? 0.026 : 0.012,
    }));

    card.add(this.label(20, 16, set.name[this.locale], 21, VISUAL.text, 'bold'));
    const progressText = `${progress.collected}/${progress.total}`;
    card.add(addChip(this, 336, 31, progress.complete ? (this.locale === 'ru' ? 'НАБОР СОБРАН' : 'SET COMPLETE') : progressText, accent, {
      width: progress.complete ? 126 : 64,
      height: 28,
      filled: progress.complete,
      fontSize: 10,
    }));
    card.add(this.label(20, 51, this.locale === 'ru' ? 'Прогресс набора' : 'Set progress', 10, VISUAL.faint, 'bold'));
    card.add(addProgressBar(this, 20, 74, 340, progress.total > 0 ? progress.collected / progress.total : 0, accent));

    const rewardPanel = addSurface(this, 382, 18, 174, 174, {
      accent: VISUAL.warm,
      fill: VISUAL.panelDeep,
      strokeAlpha: claimed ? 0.18 : 0.24,
      glowAlpha: claimed ? 0.008 : 0.018,
    });
    rewardPanel.add(this.label(14, 13, this.locale === 'ru' ? 'НАГРАДА' : 'SET REWARD', 9, VISUAL.faint, 'bold'));
    rewardPanel.add(this.label(14, 31, this.money(reward), 18, '#e9b949', 'bold'));
    rewardPanel.add(this.label(14, 57, claimed
      ? t(this.locale, 'rewardClaimed')
      : progress.complete
        ? (this.locale === 'ru' ? 'Готово к получению' : 'Ready to claim')
        : t(this.locale, 'completeSet'), 10, claimed ? '#63d28d' : progress.complete ? '#f0c55d' : VISUAL.muted, 'bold').setWordWrapWidth(146));
    rewardPanel.add(this.label(14, 84, claimed
      ? (this.locale === 'ru' ? 'НАВЫК АКТИВЕН' : 'EXPERTISE ACTIVE')
      : (this.locale === 'ru' ? 'ПОСТОЯННЫЙ НАВЫК' : 'PERMANENT EXPERTISE'), 8, claimed ? '#63d28d' : VISUAL.faint, 'bold'));
    rewardPanel.add(this.label(14, 99, set.perk.description[this.locale], 9, claimed ? '#bfe8ce' : VISUAL.muted, claimed ? 'bold' : 'normal')
      .setWordWrapWidth(146)
      .setLineSpacing(1));
    card.add(rewardPanel);

    if (!claimed && progress.complete) {
      const claimButton = button(this, 469, 164, t(this.locale, 'claimReward'), () => {
        this.store.claimSetReward(set.id, set.reward, set.itemIds);
        this.renderBook();
      }, { width: 148, height: 38, background: VISUAL.warm, fontSize: this.locale === 'ru' ? 12 : 13 });
      card.add(claimButton);
    } else {
      card.add(addChip(this, 469, 161, claimed ? (this.locale === 'ru' ? 'ПОЛУЧЕНО' : 'CLAIMED') : (this.locale === 'ru' ? 'НЕПОЛНЫЙ' : 'INCOMPLETE'), claimed ? VISUAL.success : VISUAL.steel, {
        width: 128,
        height: 28,
        filled: claimed,
        fontSize: 10,
      }));
    }

    const itemCount = Math.max(1, set.itemIds.length);
    const available = 330;
    const spacing = itemCount <= 1 ? 0 : Math.min(78, available / (itemCount - 1));
    const startX = itemCount <= 1 ? 54 : 30;

    set.itemIds.forEach((itemId, index) => {
      const item = ITEM_BY_ID.get(itemId);
      if (!item) return;
      const copies = ownedCopies(save.collection, itemId);
      const owned = copies > 0;
      const rarityColor = RARITY_COLORS[item.rarity];
      const slotX = startX + index * spacing + 28;
      const slotY = 130;
      const slot = this.add.container(slotX, slotY);
      const shadow = this.add.rectangle(2, 4, 68, 72, 0x000000, 0.34);
      const frame = this.add.rectangle(0, 0, 68, 72, rarityColor, owned ? 0.085 : 0.018)
        .setStrokeStyle(1, rarityColor, owned ? 0.5 : 0.12);
      const image = this.add.image(0, -5, resolveItemTexture(this, itemId))
        .setDisplaySize(64, 46)
        .setAlpha(owned ? 1 : 0.15);
      const count = this.add.text(0, 29, owned ? `×${copies}` : '—', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: owned ? '#d9dee5' : '#555d67',
      }).setOrigin(0.5);
      slot.add([shadow, frame, image, count]);
      card.add(slot);

      if (owned) {
        slot.setSize(74, 80).setInteractive({ useHandCursor: true });
        enableHoverLift(this, slot, slotY, { lift: 4, scale: 1.045 });
        slot.on('pointerover', () => frame.setStrokeStyle(2, rarityColor, 0.95));
        slot.on('pointerout', () => frame.setStrokeStyle(1, rarityColor, 0.5));
        slot.on('pointerup', () => {
          playFeedbackCue(this, 'ui');
          this.selectedItemId = itemId;
          this.renderBook();
        });
      }
    });

    enterWithStagger(this, card, y, entranceIndex);
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
    const warehouseRate = collectionResaleRate(COLLECTION_RESALE_RATE, save.businessUpgrades.warehouse);
    const expertiseBonus = collectionExpertiseBonus(save.claimedSetRewards, item.category);
    const rate = collectionExpertiseResaleRate(warehouseRate, save.claimedSetRewards, item.category);
    const resaleBasis = instance?.appraisedValue ?? item.baseValue;
    const resale = collectionResaleValue(resaleBasis, rate);
    const traits = instance
      ? itemTraitNamesForIds(instance.traitIds, this.locale)
      : itemTraitNames(itemId, this.locale);
    const rarityColor = RARITY_COLORS[item.rarity];

    const overlay = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x05070a, 0.82)
      .setInteractive({ useHandCursor: true });
    overlay.on('pointerup', () => {
      this.selectedItemId = null;
      this.renderBook();
    });

    const modal = this.add.container(640, 365);
    modal.add(addSurface(this, -370, -218, 740, 436, {
      accent: rarityColor,
      fill: VISUAL.panel,
      strokeAlpha: 0.5,
      glowAlpha: 0.035,
    }));

    const hero = addSurface(this, -338, -178, 292, 300, {
      accent: rarityColor,
      fill: VISUAL.panelDeep,
      strokeAlpha: 0.3,
      glowAlpha: 0.02,
    });
    hero.add(this.add.ellipse(146, 137, 236, 190, rarityColor, 0.055));
    hero.add(this.add.image(146, 137, resolveItemTexture(this, itemId)).setDisplaySize(250, 180));
    hero.add(addChip(this, 70, 270, item.rarity.toUpperCase(), rarityColor, { width: 108, filled: true, fontSize: 10 }));
    hero.add(addChip(this, 215, 270, t(this.locale, 'ownedCopies', { count: copies }), VISUAL.steel, { width: 132, fontSize: 10 }));
    modal.add(hero);

    modal.add(this.label(-18, -174, item.name[this.locale], 27, VISUAL.text, 'bold').setWordWrapWidth(330));
    modal.add(this.label(-18, -132, this.locale === 'ru' ? 'КОНКРЕТНАЯ КОПИЯ' : 'CONCRETE COPY', 9, VISUAL.faint, 'bold'));

    if (instance) {
      const restored = instance.restored ? (this.locale === 'ru' ? 'РЕСТАВРИРОВАН' : 'RESTORED') : (this.locale === 'ru' ? 'ИСХОДНОЕ СОСТОЯНИЕ' : 'ORIGINAL STATE');
      modal.add(addChip(this, 58, -91, `${Math.round(instance.condition * 100)}%`, VISUAL.rare, { width: 76, filled: true }));
      modal.add(addChip(this, 170, -91, restored, instance.restored ? VISUAL.success : VISUAL.steel, { width: 142, fontSize: 9 }));
      modal.add(this.label(-18, -63, `${this.locale === 'ru' ? 'Оценка копии' : 'Copy appraisal'}: ${this.money(instance.appraisedValue)}`, 15, '#dce2e8', 'bold'));
    }

    modal.add(this.label(-18, -23, `${t(this.locale, 'resaleValue', { amount: this.money(resale) })}`, 22, '#63d28d', 'bold'));
    if (expertiseBonus > 0) {
      modal.add(addChip(
        this,
        280,
        -10,
        `${this.locale === 'ru' ? 'ЭКСПЕРТИЗА' : 'EXPERTISE'} +${Math.round(expertiseBonus * 100)}%`,
        VISUAL.success,
        { width: 142, filled: true, fontSize: 9 },
      ));
    }
    modal.add(this.label(-18, 12, this.locale === 'ru' ? 'Рыночные признаки' : 'Market traits', 10, VISUAL.faint, 'bold'));
    modal.add(this.label(-18, 32, traits.length > 0 ? traits.join(' · ') : (this.locale === 'ru' ? 'Нет особых признаков' : 'No special traits'), 12, traits.length > 0 ? '#61a8ff' : VISUAL.muted, 'bold')
      .setWordWrapWidth(340)
      .setLineSpacing(3));
    modal.add(this.label(-18, 92, t(this.locale, 'sellCollectionWarning'), 11, VISUAL.muted)
      .setWordWrapWidth(340)
      .setLineSpacing(3));

    const sell = button(this, 92, 164, t(this.locale, 'sellOne', { amount: this.money(resale) }), () => {
      if (this.store.sellCollectionItem(itemId, resale)) playFeedbackCue(this, 'sell');
      const remaining = ownedCopies(this.store.snapshot.collection, itemId);
      this.selectedItemId = remaining > 0 ? itemId : null;
      this.renderBook();
    }, { width: 292, height: 50, background: VISUAL.copper, accent: VISUAL.warm, fontSize: this.locale === 'ru' ? 12 : 14 });
    const close = button(this, 277, 164, t(this.locale, 'close'), () => {
      this.selectedItemId = null;
      this.renderBook();
    }, { width: 112, height: 50, background: VISUAL.steel, fontSize: 13 });
    modal.add([sell, close]);

    if (!prefersReducedMotion()) {
      modal.setAlpha(0).setScale(0.965);
      this.tweens.add({
        targets: modal,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: MOTION.revealMs,
        ease: 'Back.Out',
      });
    }
  }

  private label(x: number, y: number, text: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${size}px`,
      fontStyle: style,
      color,
    });
  }

  private hex(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }

  private money(value: number): string {
    const formatted = new Intl.NumberFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value);
    return `${formatted} ₽`;
  }
}
