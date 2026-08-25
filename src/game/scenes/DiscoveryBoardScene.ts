import Phaser from 'phaser';
import { ITEM_BY_ID } from '../../data/catalog';
import { DISCOVERY_CHAINS, type DiscoveryChainDefinition } from '../../data/discoveryChains';
import type { Locale, PlayerSave } from '../../domain/types';
import { t } from '../../i18n';
import { getPlatformLocale } from '../../platform/yandex';
import { resolveItemTexture } from '../art';
import { enterWithStagger } from '../motion';
import { GameStore } from '../store';
import { button } from '../ui';
import { addAtmosphere, addChip, addProgressBar, addSurface, VISUAL } from '../visual';

const WIDTH = 1280;
const HEIGHT = 720;
const CARD_WIDTH = 364;
const CARD_HEIGHT = 468;

interface BoardCopy {
  title: string;
  subtitle: string;
  archiveChip: string;
  solved: string;
  active: string;
  reputation: string;
  caseLabel: string;
  nextLead: string;
  noLeadYet: string;
  futureLead: string;
  solvedCase: string;
  reward: string;
  earned: string;
  progress: string;
}

const BOARD_COPY: Record<Locale, BoardCopy> = {
  ru: {
    title: 'Доска расследований',
    subtitle: 'Связывай находки из разных аукционов и доводи редкие истории до конца',
    archiveChip: 'ЛЕГЕНДАРНЫЕ ДЕЛА',
    solved: 'ЗАКРЫТО ДЕЛ',
    active: 'АКТИВНЫЕ СЛЕДЫ',
    reputation: 'РЕПУТАЦИЯ',
    caseLabel: 'ДЕЛО',
    nextLead: 'СЛЕДУЮЩАЯ ЗАЦЕПКА',
    noLeadYet: 'Начни цепочку с первой подходящей находки.',
    futureLead: 'Следующая часть истории откроется после текущей зацепки.',
    solvedCase: 'ДЕЛО ЗАКРЫТО',
    reward: 'НАГРАДА ЗА ДЕЛО',
    earned: 'ПОЛУЧЕНО',
    progress: 'Прогресс расследования',
  },
  en: {
    title: 'Discovery Board',
    subtitle: 'Connect finds from separate auctions and finish rare stories over multiple wins',
    archiveChip: 'LEGENDARY CASES',
    solved: 'CASES SOLVED',
    active: 'ACTIVE TRAILS',
    reputation: 'REPUTATION',
    caseLabel: 'CASE',
    nextLead: 'NEXT LEAD',
    noLeadYet: 'Start the trail with its first matching find.',
    futureLead: 'The next part of the story unlocks after the current lead.',
    solvedCase: 'CASE SOLVED',
    reward: 'CASE REWARD',
    earned: 'EARNED',
    progress: 'Investigation progress',
  },
};

export class DiscoveryBoardScene extends Phaser.Scene {
  private readonly store = new GameStore();
  private locale: Locale = 'en';

  constructor() {
    super('discovery-board');
  }

  create(): void {
    this.locale = getPlatformLocale();
    this.renderBoard();
  }

  private renderBoard(): void {
    this.children.removeAll(true);
    const copy = BOARD_COPY[this.locale];
    const save = this.store.snapshot;

    addAtmosphere(this, WIDTH, HEIGHT, VISUAL.copper, 690);
    this.add.rectangle(WIDTH / 2, 116, WIDTH - 112, 1, VISUAL.warm, 0.18);
    this.add.rectangle(44, 25, 5, 74, VISUAL.copper, 0.92).setOrigin(0);

    this.label(64, 29, copy.title, 31, VISUAL.text, 'bold');
    this.label(64, 69, copy.subtitle, 14, VISUAL.muted).setWordWrapWidth(700);
    addChip(this, 137, 106, copy.archiveChip, VISUAL.copper, {
      width: 188,
      filled: true,
      fontSize: 10,
    });

    const solved = DISCOVERY_CHAINS.filter((chain) => save.completedDiscoveryChains.includes(chain.id)).length;
    const active = DISCOVERY_CHAINS.filter((chain) => {
      const stage = save.discoveryChainProgress[chain.id] ?? 0;
      return stage > 0 && !save.completedDiscoveryChains.includes(chain.id);
    }).length;

    this.addStatPlate(64, 128, copy.solved, `${solved}/${DISCOVERY_CHAINS.length}`, VISUAL.success);
    this.addStatPlate(270, 128, copy.active, `${active}`, VISUAL.rare);
    this.addStatPlate(476, 128, copy.reputation, `${Math.round(save.reputationXp)} REP`, VISUAL.warm);

    button(this, 995, 72, t(this.locale, 'backToCollection'), () => this.scene.start('collection'), {
      width: 168,
      height: 48,
      background: VISUAL.steel,
      fontSize: this.locale === 'ru' ? 13 : 14,
    });
    button(this, 1160, 72, t(this.locale, 'backToAuction'), () => this.scene.start('auction'), {
      width: 156,
      height: 48,
      background: VISUAL.rare,
      fontSize: this.locale === 'ru' ? 12 : 14,
    });

    DISCOVERY_CHAINS.forEach((chain, index) => {
      this.renderCaseCard(chain, save, 52 + index * 398, 194, index);
    });
  }

  private renderCaseCard(
    chain: DiscoveryChainDefinition,
    save: Readonly<PlayerSave>,
    x: number,
    y: number,
    entranceIndex: number,
  ): void {
    const copy = BOARD_COPY[this.locale];
    const completed = save.completedDiscoveryChains.includes(chain.id);
    const rawStage = save.discoveryChainProgress[chain.id] ?? 0;
    const stage = Phaser.Math.Clamp(Math.floor(rawStage), 0, chain.steps.length);
    const accent = completed ? VISUAL.success : stage > 0 ? VISUAL.warm : VISUAL.rare;
    const card = this.add.container(x, y);

    card.add(addSurface(this, 0, 0, CARD_WIDTH, CARD_HEIGHT, {
      accent,
      fill: VISUAL.panel,
      strokeAlpha: completed ? 0.46 : stage > 0 ? 0.34 : 0.19,
      glowAlpha: completed ? 0.032 : stage > 0 ? 0.022 : 0.012,
    }));

    card.add(addChip(this, 58, 28, `${copy.caseLabel} ${entranceIndex + 1}`, accent, {
      width: 92,
      height: 28,
      filled: stage > 0 || completed,
      fontSize: 9,
    }));
    card.add(this.label(18, 50, chain.title[this.locale], 21, VISUAL.text, 'bold').setWordWrapWidth(328));
    card.add(this.label(18, 82, chain.premise[this.locale], 11, VISUAL.muted)
      .setWordWrapWidth(328)
      .setLineSpacing(3));

    card.add(this.label(18, 132, copy.progress, 9, VISUAL.faint, 'bold'));
    card.add(addProgressBar(this, 18, 153, 328, chain.steps.length > 0 ? stage / chain.steps.length : 0, accent));
    card.add(addChip(this, 307, 132, `${stage}/${chain.steps.length}`, accent, {
      width: 58,
      height: 24,
      filled: completed,
      fontSize: 9,
    }));

    const slotY = 219;
    const slotXs = [66, 182, 298];
    for (let index = 0; index < chain.steps.length; index += 1) {
      const step = chain.steps[index];
      const slotX = slotXs[index] ?? 66 + index * 116;
      const done = index < stage;
      const current = index === stage && !completed;
      const locked = !done && !current;

      if (index < chain.steps.length - 1) {
        card.add(this.add.rectangle(slotX + 58, slotY, 64, 2, done ? VISUAL.success : VISUAL.steel, done ? 0.75 : 0.52));
      }

      const slot = this.add.container(slotX, slotY);
      const slotAccent = done ? VISUAL.success : current ? VISUAL.warm : VISUAL.steel;
      slot.add(this.add.rectangle(0, 3, 88, 96, 0x000000, 0.34));
      slot.add(this.add.rectangle(0, 0, 88, 96, VISUAL.panelDeep, 0.98)
        .setStrokeStyle(current ? 2 : 1, slotAccent, current ? 0.82 : done ? 0.54 : 0.22));

      if (!locked && step) {
        const item = ITEM_BY_ID.get(step.itemId);
        if (item) {
          slot.add(this.add.image(0, -9, resolveItemTexture(this, item.id))
            .setDisplaySize(78, 55)
            .setAlpha(done ? 1 : 0.82));
          slot.add(this.label(0, 31, done ? '✓' : '●', 14, done ? '#63d28d' : '#e9b949', 'bold').setOrigin(0.5));
        }
      } else {
        slot.add(this.label(0, -6, '?', 30, '#59616c', 'bold').setOrigin(0.5));
        slot.add(this.label(0, 30, `${index + 1}`, 9, VISUAL.faint, 'bold').setOrigin(0.5));
      }
      card.add(slot);
    }

    const leadPanel = addSurface(this, 18, 283, 328, 96, {
      accent,
      fill: VISUAL.panelDeep,
      strokeAlpha: completed ? 0.28 : 0.21,
      glowAlpha: completed ? 0.014 : 0.008,
    });
    if (completed) {
      leadPanel.add(addChip(this, 82, 24, copy.solvedCase, VISUAL.success, {
        width: 142,
        filled: true,
        fontSize: 9,
      }));
      leadPanel.add(this.label(16, 47, chain.steps[chain.steps.length - 1]?.clue[this.locale] ?? '', 11, '#bfe8ce', 'bold')
        .setWordWrapWidth(296)
        .setLineSpacing(2));
    } else {
      leadPanel.add(this.label(16, 12, copy.nextLead, 9, VISUAL.faint, 'bold'));
      const nextStep = chain.steps[stage];
      const lead = nextStep?.clue[this.locale] ?? (stage === 0 ? copy.noLeadYet : copy.futureLead);
      leadPanel.add(this.label(16, 34, lead, 12, stage > 0 ? '#f0c55d' : '#c5cbd3', 'bold')
        .setWordWrapWidth(296)
        .setLineSpacing(3));
    }
    card.add(leadPanel);

    const rewardPanel = addSurface(this, 18, 394, 328, 54, {
      accent: VISUAL.warm,
      fill: VISUAL.panelDeep,
      strokeAlpha: completed ? 0.3 : 0.17,
      glowAlpha: completed ? 0.02 : 0.008,
    });
    rewardPanel.add(this.label(14, 9, completed ? copy.earned : copy.reward, 8, completed ? '#63d28d' : VISUAL.faint, 'bold'));
    rewardPanel.add(this.label(14, 24, `${this.money(chain.rewardCash)}  ·  +${chain.rewardReputationXp} REP`, 15, completed ? '#bfe8ce' : '#e9b949', 'bold'));
    card.add(rewardPanel);

    enterWithStagger(this, card, y, entranceIndex);
  }

  private addStatPlate(x: number, y: number, caption: string, value: string, accent: number): void {
    const surface = addSurface(this, x, y, 184, 52, {
      accent,
      fill: VISUAL.panelDeep,
      strokeAlpha: 0.18,
      glowAlpha: 0.01,
    });
    surface.add(this.label(14, 8, caption, 8, VISUAL.faint, 'bold'));
    surface.add(this.label(14, 24, value, 16, this.hex(accent), 'bold'));
  }

  private label(
    x: number,
    y: number,
    text: string,
    size: number,
    color: string,
    style: 'normal' | 'bold' = 'normal',
  ): Phaser.GameObjects.Text {
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
