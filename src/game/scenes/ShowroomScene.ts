import Phaser from 'phaser';
import { ITEM_BY_ID } from '../../data/catalog';
import { itemTraitNamesForIds } from '../../data/itemTraits';
import { curateShowroom, showroomDisplayedValue, showroomSlotCount, showroomTierIndex, type ShowroomDisplayCopy } from '../../domain/showroom';
import type { Locale, Rarity } from '../../domain/types';
import { getPlatformLocale, setGameplayActive } from '../../platform/yandex';
import { resolveItemTexture } from '../art';
import { playFeedbackCue } from '../feedback';
import { enterWithStagger, MOTION, prefersReducedMotion } from '../motion';
import { GameStore } from '../store';
import { button } from '../ui';
import { addAtmosphere, addChip, addSurface, enableHoverLift, VISUAL } from '../visual';

const WIDTH = 1280;
const HEIGHT = 720;
const MAX_SLOTS = 10;

const RARITY_COLORS: Record<Rarity, number> = {
  common: 0xaeb5c0,
  uncommon: 0x63d28d,
  rare: 0x61a8ff,
  epic: 0xb576ff,
  legendary: 0xffc857,
};

export class ShowroomScene extends Phaser.Scene {
  private readonly store = new GameStore();
  private locale: Locale = 'en';

  constructor() {
    super('showroom');
  }

  create(): void {
    this.locale = getPlatformLocale();
    setGameplayActive(false);
    this.render();
  }

  private render(): void {
    this.children.removeAll(true);
    const save = this.store.snapshot;
    const level = showroomTierIndex(save.businessUpgrades.showroom);
    const slots = showroomSlotCount(level);
    const display = curateShowroom(save.collection, save.collectionItems, ITEM_BY_ID, level);

    addAtmosphere(this, WIDTH, HEIGHT, level >= 2 ? VISUAL.warm : VISUAL.copper, 990);
    this.renderRoomShell(level);
    this.renderHeader(level, slots, display);
    this.renderHero(display[0]);
    this.renderCabinet(display.slice(1), slots - 1);

    this.add.text(640, 686, this.locale === 'ru'
      ? 'Витрина автоматически выбирает лучший экземпляр каждой находки. Ручная расстановка появится на следующем этапе P10.'
      : 'The cabinet automatically curates the strongest copy of each find. Manual pinning and layout are the next P10 layer.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#777f89',
      align: 'center',
      wordWrap: { width: 980 },
    }).setOrigin(0.5);
  }

  private renderRoomShell(level: number): void {
    const wallAccent = [0x4f4031, 0x6f4b31, 0x8b6539, 0xb48648][level]!;
    this.add.rectangle(640, 425, 1190, 500, 0x0d0f12, 0.72).setStrokeStyle(1, wallAccent, 0.18);
    this.add.rectangle(640, 222, 1170, 7, wallAccent, 0.24);
    this.add.rectangle(640, 648, 1180, 13, 0x090b0e, 0.92);

    const floor = this.add.graphics();
    floor.fillStyle(0x141517, 0.96);
    floor.fillTriangle(42, 642, 1238, 642, 1090, 720);
    floor.fillTriangle(42, 642, 1090, 720, 190, 720);
    floor.lineStyle(1, wallAccent, 0.08);
    for (let x = 190; x <= 1090; x += 150) floor.lineBetween(640, 642, x, 720);

    const lightXs = level === 0 ? [220, 760] : level === 1 ? [180, 560, 940] : [160, 440, 720, 1000];
    lightXs.forEach((x, index) => {
      const beam = this.add.graphics();
      beam.fillStyle(0xf0c969, level >= 2 ? 0.045 : 0.026);
      beam.fillTriangle(x, 152, x - 115, 640, x + 115, 640);
      const lamp = this.add.rectangle(x, 155, 64, 8, 0xe7c16e, 0.75).setStrokeStyle(1, 0xffe3a0, 0.38);
      const glow = this.add.ellipse(x, 177, 165, 34, 0xf0c969, 0.045 + level * 0.012);
      if (!prefersReducedMotion() && level > 0) {
        this.tweens.add({
          targets: glow,
          alpha: { from: 0.035 + level * 0.01, to: 0.085 + level * 0.012 },
          duration: 2100 + index * 260,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut',
        });
      }
      lamp.setDepth(1);
    });

    if (level >= 1) {
      this.add.rectangle(92, 592, 245, 38, 0x3b2b1e, 0.72).setOrigin(0).setStrokeStyle(1, wallAccent, 0.35);
      this.add.rectangle(938, 592, 245, 38, 0x3b2b1e, 0.72).setOrigin(0).setStrokeStyle(1, wallAccent, 0.35);
    }
    if (level >= 3) {
      this.add.rectangle(50, 154, 1180, 10, 0xd2a353, 0.1).setOrigin(0);
      this.add.circle(74, 175, 8, 0xe9b949, 0.48);
      this.add.circle(1206, 175, 8, 0xe9b949, 0.48);
    }
  }

  private renderHeader(level: number, slots: number, display: readonly ShowroomDisplayCopy[]): void {
    const copy = this.copy();
    this.add.rectangle(46, 28, 5, 88, VISUAL.warm, 0.9).setOrigin(0);
    this.add.text(66, 30, copy.title, {
      fontFamily: 'Georgia, serif', fontSize: '31px', fontStyle: 'bold', color: '#f2d17c',
    });
    this.add.text(66, 72, copy.subtitle, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#a9b0b9', wordWrap: { width: 530 },
    });
    addChip(this, 134, 118, copy.tierNames[level]!, VISUAL.warm, { width: 176, filled: true, fontSize: 10 });

    this.statPlate(610, 34, copy.displaySlots, `${display.length}/${slots}`, VISUAL.rare);
    this.statPlate(775, 34, copy.displayValue, this.money(showroomDisplayedValue(display)), VISUAL.success);
    this.statPlate(940, 34, copy.roomLevel, `${level}/3`, VISUAL.purple);

    button(this, 1096, 62, copy.office, () => this.scene.start('office'), {
      width: 140, height: 46, background: VISUAL.warm, accent: 0xffd260, fontSize: 12,
    });
    button(this, 1096, 112, copy.collection, () => this.scene.start('collection'), {
      width: 140, height: 38, background: VISUAL.rare, accent: 0x8fc3ff, fontSize: 11,
    });
  }

  private statPlate(x: number, y: number, caption: string, value: string, accent: number): void {
    const plate = addSurface(this, x, y, 146, 82, {
      fill: VISUAL.panelDeep, accent, strokeAlpha: 0.24, glowAlpha: 0.014, shadowAlpha: 0.2,
    });
    plate.add(this.add.text(13, 12, caption.toUpperCase(), {
      fontFamily: 'Arial, sans-serif', fontSize: '8px', fontStyle: 'bold', color: '#707985',
    }));
    plate.add(this.add.text(13, 37, value, {
      fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: this.hex(accent),
    }));
  }

  private renderHero(copy: ShowroomDisplayCopy | undefined): void {
    const text = this.copy();
    const x = 48;
    const y = 188;
    const width = 370;
    const height = 454;
    const item = copy ? ITEM_BY_ID.get(copy.itemId) : undefined;
    const accent = item ? RARITY_COLORS[item.rarity] : VISUAL.steel;

    addSurface(this, x, y, width, height, {
      fill: 0x15171a, accent, strokeAlpha: item ? 0.42 : 0.18, glowAlpha: item ? 0.026 : 0.006,
    });
    this.add.text(x + 22, y + 18, text.heroLabel, {
      fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#8d96a0',
    });

    if (!copy || !item) {
      this.add.circle(x + width / 2, y + 190, 92, 0xffffff, 0.018).setStrokeStyle(1, VISUAL.steel, 0.24);
      this.add.text(x + width / 2, y + 190, '?', {
        fontFamily: 'Georgia, serif', fontSize: '72px', color: '#59616b',
      }).setOrigin(0.5);
      this.add.text(x + width / 2, y + 330, text.emptyHero, {
        fontFamily: 'Arial, sans-serif', fontSize: '15px', color: '#8f98a3', align: 'center', wordWrap: { width: 290 },
      }).setOrigin(0.5);
      return;
    }

    this.add.ellipse(x + width / 2, y + 166, 310, 225, accent, 0.055);
    const image = this.add.image(x + width / 2, y + 165, resolveItemTexture(this, item.id)).setDisplaySize(292, 205);
    if (!prefersReducedMotion()) {
      image.setAlpha(0).setScale(0.94);
      this.tweens.add({ targets: image, alpha: 1, scaleX: 1, scaleY: 1, duration: MOTION.revealSettleMs, ease: 'Cubic.Out' });
    }

    addChip(this, x + 85, y + 285, item.rarity.toUpperCase(), accent, { width: 126, filled: true, fontSize: 10 });
    addChip(this, x + 266, y + 285, `${Math.round(copy.condition * 100)}%`, VISUAL.rare, { width: 74, fontSize: 10 });
    this.add.text(x + width / 2, y + 316, item.name[this.locale], {
      fontFamily: 'Georgia, serif', fontSize: '23px', fontStyle: 'bold', color: '#f4f0e5', align: 'center', wordWrap: { width: 318 },
    }).setOrigin(0.5, 0);
    this.add.text(x + width / 2, y + 365, this.money(copy.appraisedValue), {
      fontFamily: 'Arial, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#63d28d',
    }).setOrigin(0.5);
    const status = copy.restored ? text.restored : copy.legacyFallback ? text.legacy : text.originalCopy;
    this.add.text(x + width / 2, y + 404, status, {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: copy.restored ? '#e9b949' : '#8f98a3',
    }).setOrigin(0.5);
  }

  private renderCabinet(copies: readonly ShowroomDisplayCopy[], unlockedSlots: number): void {
    for (let index = 0; index < MAX_SLOTS - 1; index += 1) {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const x = 446 + column * 258;
      const y = 188 + row * 156;
      const unlocked = index < unlockedSlots;
      const copy = unlocked ? copies[index] : undefined;
      this.renderCabinetSlot(copy, x, y, index, unlocked);
    }
  }

  private renderCabinetSlot(copy: ShowroomDisplayCopy | undefined, x: number, y: number, index: number, unlocked: boolean): void {
    const text = this.copy();
    const item = copy ? ITEM_BY_ID.get(copy.itemId) : undefined;
    const accent = item ? RARITY_COLORS[item.rarity] : unlocked ? VISUAL.steel : 0x414750;
    const card = this.add.container(x, y);
    card.add(addSurface(this, 0, 0, 246, 142, {
      fill: unlocked ? 0x15181c : 0x101216,
      accent,
      strokeAlpha: item ? 0.34 : unlocked ? 0.14 : 0.07,
      glowAlpha: item ? 0.018 : 0.003,
      shadowAlpha: 0.22,
    }));

    if (!unlocked) {
      card.add(this.add.rectangle(58, 71, 82, 72, 0xffffff, 0.018).setStrokeStyle(1, 0x59606a, 0.18));
      card.add(this.add.text(58, 66, '×', { fontFamily: 'Arial, sans-serif', fontSize: '28px', color: '#555c66' }).setOrigin(0.5));
      card.add(this.add.text(112, 44, text.locked, { fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#707781' }));
      card.add(this.add.text(112, 69, text.upgradeHint, { fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#5f6670', wordWrap: { width: 118 } }));
      enterWithStagger(this, card, y, index);
      return;
    }

    if (!copy || !item) {
      card.add(this.add.circle(60, 69, 34, VISUAL.steel, 0.08).setStrokeStyle(1, VISUAL.steel, 0.28));
      card.add(this.add.text(60, 68, '+', { fontFamily: 'Arial, sans-serif', fontSize: '28px', color: '#707985' }).setOrigin(0.5));
      card.add(this.add.text(112, 43, text.emptySlot, { fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#929aa4', wordWrap: { width: 115 } }));
      card.add(this.add.text(112, 83, text.keepHunting, { fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#676f79', wordWrap: { width: 116 } }));
      enterWithStagger(this, card, y, index);
      return;
    }

    card.add(this.add.ellipse(60, 67, 106, 92, accent, 0.045));
    card.add(this.add.image(60, 65, resolveItemTexture(this, item.id)).setDisplaySize(104, 76));
    card.add(this.add.text(118, 22, item.name[this.locale], {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#f1f3f5', wordWrap: { width: 112 },
    }));
    card.add(this.add.text(118, 74, this.money(copy.appraisedValue), {
      fontFamily: 'Arial, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#63d28d',
    }));
    card.add(addChip(this, 174, 116, item.rarity.toUpperCase(), accent, { width: 112, height: 23, filled: false, fontSize: 8 }));

    card.setSize(246, 142).setInteractive({ useHandCursor: true });
    enableHoverLift(this, card, y, { lift: 4, scale: 1.018 });
    card.on('pointerup', () => {
      playFeedbackCue(this, 'ui');
      this.renderInspect(copy);
    });
    enterWithStagger(this, card, y, index);
  }

  private renderInspect(copy: ShowroomDisplayCopy): void {
    const item = ITEM_BY_ID.get(copy.itemId);
    if (!item) return;
    const text = this.copy();
    const accent = RARITY_COLORS[item.rarity];
    const traits = itemTraitNamesForIds(copy.traitIds, this.locale);

    const overlay = this.add.rectangle(640, 360, WIDTH, HEIGHT, 0x050608, 0.84).setInteractive({ useHandCursor: true });
    const modal = this.add.container(640, 360);
    modal.add(addSurface(this, -390, -220, 780, 440, { fill: 0x17191d, accent, strokeAlpha: 0.52, glowAlpha: 0.034 }));
    modal.add(this.add.ellipse(-190, -20, 310, 250, accent, 0.055));
    modal.add(this.add.image(-190, -20, resolveItemTexture(this, item.id)).setDisplaySize(300, 210));
    modal.add(addChip(this, -190, 135, item.rarity.toUpperCase(), accent, { width: 138, filled: true, fontSize: 10 }));

    modal.add(this.add.text(20, -170, item.name[this.locale], {
      fontFamily: 'Georgia, serif', fontSize: '28px', fontStyle: 'bold', color: '#f4f0e5', wordWrap: { width: 330 },
    }));
    modal.add(this.add.text(20, -92, this.money(copy.appraisedValue), {
      fontFamily: 'Arial, sans-serif', fontSize: '27px', fontStyle: 'bold', color: '#63d28d',
    }));
    modal.add(this.add.text(20, -42, `${text.condition}: ${Math.round(copy.condition * 100)}%`, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#b7c0c9',
    }));
    modal.add(this.add.text(20, -12, `${text.restoration}: ${copy.restored ? text.yes : text.no}`, {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', fontStyle: 'bold', color: copy.restored ? '#e9b949' : '#8e97a1',
    }));
    modal.add(this.add.text(20, 34, text.traits, { fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#6f7884' }));
    modal.add(this.add.text(20, 54, traits.length > 0 ? traits.join(' · ') : text.noTraits, {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: traits.length > 0 ? '#8fc3ff' : '#7b838d', wordWrap: { width: 330 }, lineSpacing: 4,
    }));
    modal.add(this.add.text(0, 178, text.inspectHint, {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#707985', align: 'center', wordWrap: { width: 680 },
    }).setOrigin(0.5));

    overlay.on('pointerup', () => {
      overlay.destroy();
      modal.destroy(true);
    });
  }

  private copy(): {
    title: string; subtitle: string; tierNames: string[]; displaySlots: string; displayValue: string; roomLevel: string;
    office: string; collection: string; heroLabel: string; emptyHero: string; restored: string; legacy: string; originalCopy: string;
    locked: string; upgradeHint: string; emptySlot: string; keepHunting: string; condition: string; restoration: string; yes: string; no: string;
    traits: string; noTraits: string; inspectHint: string;
  } {
    if (this.locale === 'ru') return {
      title: 'Витрина дилера',
      subtitle: 'Лучшие находки получают физическое место в твоём бизнесе. Редкость важнее голой цены, а лучший конкретный экземпляр выбирается автоматически.',
      tierNames: ['ГАРАЖНАЯ ПОЛКА', 'ОСВЕЩЁННАЯ ВИТРИНА', 'КУРАТОРСКИЙ ЗАЛ', 'ГАЛЕРЕЯ ДИЛЕРА'],
      displaySlots: 'Мест занято', displayValue: 'Цена витрины', roomLevel: 'Уровень зала', office: 'Офис', collection: 'Коллекция',
      heroLabel: 'ГЛАВНЫЙ ЭКСПОНАТ', emptyHero: 'Оставь ценную находку в коллекции — она станет первым экспонатом.',
      restored: 'РЕСТАВРИРОВАННЫЙ ЭКСПОНАТ', legacy: 'ЭКСПОНАТ ИЗ СТАРОГО СОХРАНЕНИЯ', originalCopy: 'КОНКРЕТНЫЙ ЭКЗЕМПЛЯР ИЗ КОЛЛЕКЦИИ',
      locked: 'Место закрыто', upgradeHint: 'Улучши Выставочный зал в Офисе.', emptySlot: 'Пустой пьедестал', keepHunting: 'Оставляй редкие находки вместо мгновенной продажи.',
      condition: 'Состояние', restoration: 'Реставрация', yes: 'да', no: 'нет', traits: 'ПРИЗНАКИ ЭКЗЕМПЛЯРА', noTraits: 'Особых признаков нет',
      inspectHint: 'Нажми вне карточки, чтобы вернуться к витрине.',
    };
    return {
      title: 'Dealer Showroom',
      subtitle: 'Your strongest finds earn a physical place in the business. Rarity outranks raw price and the best concrete copy is curated automatically.',
      tierNames: ['GARAGE SHELF', 'LIT DISPLAY', 'CURATED HALL', 'DEALER GALLERY'],
      displaySlots: 'Slots filled', displayValue: 'Display value', roomLevel: 'Room level', office: 'Office', collection: 'Collection',
      heroLabel: 'CENTERPIECE', emptyHero: 'Keep a valuable find in your collection and it will become the first centerpiece.',
      restored: 'RESTORED DISPLAY PIECE', legacy: 'LEGACY-SAVE DISPLAY PIECE', originalCopy: 'CONCRETE COLLECTION COPY',
      locked: 'Slot locked', upgradeHint: 'Upgrade Showroom in the Office.', emptySlot: 'Empty pedestal', keepHunting: 'Keep rare finds instead of immediately selling everything.',
      condition: 'Condition', restoration: 'Restoration', yes: 'yes', no: 'no', traits: 'COPY TRAITS', noTraits: 'No special traits',
      inspectHint: 'Tap outside the dossier to return to the showroom.',
    };
  }

  private money(value: number): string {
    return `${Math.round(value).toLocaleString(this.locale === 'ru' ? 'ru-RU' : 'en-US')} ₽`;
  }

  private hex(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }
}
