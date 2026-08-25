import Phaser from 'phaser';
import { ITEM_BY_ID } from '../../data/catalog';
import { DISCOVERY_CHAINS, type DiscoveryChainDefinition } from '../../data/discoveryChains';
import { discoveryChainComplete } from '../../domain/discovery';
import type { Locale } from '../../domain/types';
import { getPlatformLocale } from '../../platform/yandex';
import { preloadArt, resolveItemTexture } from '../art';
import { playFeedbackCue } from '../feedback';
import { enterWithStagger, prefersReducedMotion } from '../motion';
import { GameStore } from '../store';
import { button } from '../ui';
import { addAtmosphere, addChip, addProgressBar, addSurface, VISUAL } from '../visual';

const WIDTH = 1280;
const HEIGHT = 720;

export class DiscoveryScene extends Phaser.Scene {
  private readonly store = new GameStore();
  private locale: Locale = 'en';

  constructor() {
    super('discovery');
  }

  preload(): void {
    preloadArt(this);
  }

  create(): void {
    this.locale = getPlatformLocale();
    this.renderBoard();
  }

  private renderBoard(): void {
    this.children.removeAll(true);
    addAtmosphere(this, WIDTH, HEIGHT, 0xb576ff, 1030);
    this.add.rectangle(44, 25, 5, 74, 0xb576ff, 0.82).setOrigin(0);
    this.add.rectangle(WIDTH / 2, 114, WIDTH - 110, 1, 0xb576ff, 0.18);

    this.label(64, 30, this.locale === 'ru' ? 'Легендарные досье' : 'Legendary Leads', 31, VISUAL.text, 'bold');
    this.label(
      64,
      70,
      this.locale === 'ru'
        ? 'Сохраняй отмеченные находки в нужном порядке. Прогресс переживает аукционы и облачную синхронизацию.'
        : 'Keep the marked finds in order. Progress persists across auctions and cloud sync.',
      13,
      VISUAL.muted,
    ).setWordWrapWidth(770);

    const save = this.store.snapshot;
    const claimed = save.claimedDiscoveryChainRewards.length;
    addChip(this, 860, 70, `${this.locale === 'ru' ? 'ЗАКРЫТО' : 'CLOSED'} ${claimed}/${DISCOVERY_CHAINS.length}`, VISUAL.success, {
      width: 128,
      filled: claimed > 0,
      fontSize: 10,
    });
    button(this, 1138, 70, this.locale === 'ru' ? 'К коллекции' : 'Back to Collection', () => this.scene.start('collection'), {
      width: 210,
      height: 48,
      background: VISUAL.rare,
      fontSize: this.locale === 'ru' ? 13 : 14,
    });

    DISCOVERY_CHAINS.forEach((chain, index) => {
      this.renderChainCard(chain, 46 + index * 407, 154, index);
    });
  }

  private renderChainCard(chain: DiscoveryChainDefinition, x: number, y: number, entranceIndex: number): void {
    const save = this.store.snapshot;
    const progress = save.discoveryChainProgress[chain.id] ?? 0;
    const complete = discoveryChainComplete(progress, chain);
    const claimed = save.claimedDiscoveryChainRewards.includes(chain.id);
    const accent = claimed ? VISUAL.success : complete ? VISUAL.warm : chain.accent;
    const card = this.add.container(x, y);

    card.add(addSurface(this, 0, 0, 378, 520, {
      accent,
      fill: VISUAL.panel,
      strokeAlpha: complete || claimed ? 0.44 : 0.2,
      glowAlpha: complete ? 0.032 : 0.014,
    }));
    card.add(this.add.rectangle(0, 0, 6, 520, accent, 0.78).setOrigin(0));

    card.add(this.label(20, 18, chain.name[this.locale], 22, VISUAL.text, 'bold').setWordWrapWidth(245));
    card.add(addChip(this, 315, 31, claimed
      ? (this.locale === 'ru' ? 'ЗАКРЫТО' : 'CLOSED')
      : `${Math.min(progress, chain.steps.length)}/${chain.steps.length}`,
    accent, { width: 92, height: 28, filled: complete || claimed, fontSize: 10 }));
    card.add(this.label(20, 54, chain.description[this.locale], 11, VISUAL.muted).setWordWrapWidth(338).setLineSpacing(2));
    card.add(addProgressBar(this, 20, 104, 338, chain.steps.length > 0 ? Math.min(progress, chain.steps.length) / chain.steps.length : 0, accent));

    chain.steps.forEach((step, index) => {
      const stepY = 127 + index * 67;
      const done = claimed || index < progress;
      const current = !claimed && index === progress && progress < chain.steps.length;
      const future = !done && !current;
      const item = ITEM_BY_ID.get(step.itemId);
      const rowAccent = done ? VISUAL.success : current ? chain.accent : VISUAL.steel;

      const row = addSurface(this, 18, stepY, 342, 58, {
        accent: rowAccent,
        fill: current ? VISUAL.panelDeep : 0x11151b,
        strokeAlpha: current ? 0.44 : done ? 0.25 : 0.1,
        glowAlpha: current ? 0.025 : 0.004,
      });
      const image = this.add.image(35, 29, resolveItemTexture(this, step.itemId)).setDisplaySize(62, 44);
      image.setAlpha(future ? 0.1 : done ? 0.9 : 1);
      row.add(image);
      row.add(addChip(this, 82, 18, `${index + 1}`, rowAccent, { width: 28, height: 22, filled: done, fontSize: 9 }));

      if (future) {
        row.add(this.label(103, 13, this.locale === 'ru' ? 'УЛИКА ЗАШИФРОВАНА' : 'CLUE ENCRYPTED', 9, VISUAL.faint, 'bold'));
        row.add(this.label(103, 31, this.locale === 'ru' ? 'Закрой предыдущий шаг' : 'Complete the previous lead', 10, VISUAL.muted));
      } else {
        row.add(this.label(103, 8, step.title[this.locale], 11, done ? '#bfe8ce' : VISUAL.text, 'bold').setWordWrapWidth(220));
        const detail = done
          ? (item?.name[this.locale] ?? step.clue[this.locale])
          : step.clue[this.locale];
        row.add(this.label(103, 29, detail, 9, done ? VISUAL.muted : '#d5c9f2').setWordWrapWidth(220).setLineSpacing(1));
      }
      card.add(row);
    });

    const rewardY = 404;
    card.add(this.label(20, rewardY, this.locale === 'ru' ? 'НАГРАДА ЗА ДОСЬЕ' : 'DOSSIER REWARD', 9, VISUAL.faint, 'bold'));
    card.add(this.label(20, rewardY + 19, `${this.money(chain.rewardCash)}  ·  +${chain.rewardReputationXp} REP`, 18, complete ? '#e9b949' : VISUAL.muted, 'bold'));

    if (claimed) {
      card.add(addChip(this, 189, 482, this.locale === 'ru' ? 'ДОСЬЕ ЗАКРЫТО' : 'DOSSIER CLOSED', VISUAL.success, {
        width: 190,
        height: 34,
        filled: true,
        fontSize: 11,
      }));
    } else if (complete) {
      card.add(button(this, 189, 482, this.locale === 'ru' ? 'Забрать награду' : 'Claim dossier reward', () => {
        const reward = this.store.claimDiscoveryChainReward(chain.id);
        if (reward) playFeedbackCue(this, 'reward');
        this.renderBoard();
      }, {
        width: 250,
        height: 42,
        background: VISUAL.warm,
        accent: VISUAL.success,
        fontSize: this.locale === 'ru' ? 12 : 13,
      }));
    } else {
      const nextStep = chain.steps[Math.min(progress, chain.steps.length - 1)];
      card.add(this.label(
        20,
        464,
        nextStep
          ? `${this.locale === 'ru' ? 'ТЕКУЩАЯ УЛИКА' : 'CURRENT LEAD'} · ${nextStep.title[this.locale]}`
          : '',
        9,
        this.hex(chain.accent),
        'bold',
      ).setWordWrapWidth(330));
    }

    enterWithStagger(this, card, y, entranceIndex);
    if (!prefersReducedMotion() && complete && !claimed) {
      this.tweens.add({ targets: card, alpha: { from: 0.88, to: 1 }, duration: 780, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
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

  private money(value: number): string {
    const formatted = new Intl.NumberFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value);
    return `${formatted} ₽`;
  }

  private hex(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }
}
