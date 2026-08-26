import Phaser from 'phaser';
import { getPlatformLocale, markGameReady } from '../../platform/yandex';
import type { Locale } from '../../domain/types';
import { preloadArt } from '../art';
import { addCharacterPortrait, preloadCharacters } from '../characters';
import { GameStore } from '../store';
import { beginTutorialSession, endTutorialSession } from '../tutorial';
import { button } from '../ui';

interface TutorialStepCard {
  title: { ru: string; en: string };
  body: { ru: string; en: string };
  accent: number;
  glyph: string;
}

const STEPS: readonly TutorialStepCard[] = [
  {
    title: { ru: 'Выберите перспективный лот', en: 'Choose a promising lot' },
    body: { ru: 'Читайте реальные сигналы и сравнивайте стартовую цену.', en: 'Read real clues and compare the opening price.' },
    accent: 0x63d28d,
    glyph: '1',
  },
  {
    title: { ru: 'Выиграйте аукцион', en: 'Win the auction' },
    body: { ru: 'Следите за ставкой и поведением соперников. Не переплачивайте.', en: 'Watch the bid and rival behavior. Do not overpay.' },
    accent: 0x61a8ff,
    glyph: '2',
  },
  {
    title: { ru: 'Оцените находку', en: 'Appraise the find' },
    body: { ru: 'Состояние, редкость и признаки определят: оставить, продать или реставрировать.', en: 'Condition, rarity and traits tell you whether to keep, sell or restore.' },
    accent: 0xb576ff,
    glyph: '3',
  },
];

export class OnboardingScene extends Phaser.Scene {
  private readonly store = new GameStore();
  private locale: Locale = 'en';

  constructor() {
    super('onboarding');
  }

  preload(): void {
    preloadArt(this);
    preloadCharacters(this);
  }

  create(): void {
    this.locale = getPlatformLocale();
    if (this.store.snapshot.onboardingComplete) {
      endTutorialSession();
      this.scene.start('campaign');
      return;
    }

    this.renderBriefing();
    markGameReady();
  }

  private renderBriefing(): void {
    this.children.removeAll(true);
    this.add.rectangle(640, 360, 1280, 720, 0x0b1016);
    this.add.circle(238, 292, 270, 0xe9b949, 0.045);
    this.add.circle(1110, 96, 230, 0x61a8ff, 0.035);
    this.add.rectangle(28, 24, 1224, 672, 0x10151b, 0.9).setStrokeStyle(2, 0xe9b949, 0.24);

    this.label(56, 48, 'AUCTION', 31, '#f0c969', 'bold');
    this.label(145, 83, 'HUNTER', 18, '#c4773a', 'bold');
    this.label(365, 54, this.locale === 'ru' ? 'ДОБРО ПОЖАЛОВАТЬ, ОХОТНИК' : 'WELCOME, HUNTER', 29, '#f7f3e8', 'bold');
    this.label(
      365,
      94,
      this.locale === 'ru'
        ? 'Я проведу тебя через первый лот — от выбора до решения, что делать с находкой.'
        : 'I will guide you through your first lot — from choosing it to deciding what to do with the find.',
      14,
      '#9ba4b0',
    ).setWordWrapWidth(760);

    addCharacterPortrait(this, 'mentor', 205, 340, 270, 338, 0xe9b949);
    this.add.rectangle(74, 524, 262, 92, 0x151a20, 0.96).setStrokeStyle(1, 0xe9b949, 0.32);
    this.centerLabel(205, 546, this.locale === 'ru' ? 'АРКАДИЙ · НАСТАВНИК' : 'ARKADY · MENTOR', 11, '#f0c969', 'bold');
    this.centerLabel(
      205,
      579,
      this.locale === 'ru' ? '«Сначала смотри. Потом ставь.»' : '“Look first. Bid second.”',
      12,
      '#c8cdd5',
    ).setWordWrapWidth(224);

    STEPS.forEach((step, index) => this.renderStep(step, index));

    button(this, 690, 622, this.locale === 'ru' ? 'Начать обучение' : 'Start tutorial', () => {
      beginTutorialSession();
      this.scene.start('auction');
    }, {
      width: 330,
      height: 58,
      background: 0xe9b949,
      accent: 0xffd260,
      hitSlop: 5,
    });

    button(this, 1035, 622, this.locale === 'ru' ? 'Пропустить' : 'Skip', () => {
      endTutorialSession();
      this.store.completeOnboarding();
      this.scene.start('campaign');
    }, {
      width: 210,
      height: 58,
      background: 0x29313b,
      accent: 0x6f7886,
      hitSlop: 5,
    });

    this.label(
      392,
      669,
      this.locale === 'ru'
        ? 'Подсказки появляются прямо на игровых экранах и исчезнут после первого полностью разобранного лота.'
        : 'Hints appear on the real game screens and disappear after your first fully resolved lot.',
      10,
      '#707985',
    ).setWordWrapWidth(820);
  }

  private renderStep(step: TutorialStepCard, index: number): void {
    const y = 176 + index * 132;
    this.add.rectangle(365, y, 800, 108, 0x131920, 0.98).setOrigin(0).setStrokeStyle(1, step.accent, 0.32);
    this.add.rectangle(365, y, 7, 108, step.accent, 0.9).setOrigin(0);
    this.add.circle(414, y + 54, 27, step.accent, 0.15).setStrokeStyle(2, step.accent, 0.64);
    this.centerLabel(414, y + 54, step.glyph, 21, this.hex(step.accent), 'bold');
    this.label(462, y + 23, step.title[this.locale], 20, '#f7f3e8', 'bold');
    this.label(462, y + 57, step.body[this.locale], 12, '#9da5af').setWordWrapWidth(650);
  }

  private label(x: number, y: number, value: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.add.text(x, y, value, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${size}px`,
      fontStyle: style,
      color,
    });
  }

  private centerLabel(x: number, y: number, value: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.label(x, y, value, size, color, style).setOrigin(0.5);
  }

  private hex(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }
}
