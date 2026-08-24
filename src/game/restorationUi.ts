import Phaser from 'phaser';
import {
  RESTORATION_MODE_RULES,
  baseRestorationTargetHalfWidth,
  restorationTargetHalfWidth,
  type RestorationMode,
} from '../domain/restoration';
import type { Locale, RevealedItem } from '../domain/types';
import { t } from '../i18n';
import { resolveItemTexture } from './art';
import { button } from './ui';

interface RestorationBaseOptions {
  scene: Phaser.Scene;
  locale: Locale;
  item: RevealedItem;
  prepareFrame: () => void;
}

interface RestorationModePickerOptions extends RestorationBaseOptions {
  onChoose: (mode: RestorationMode) => void;
}

interface RestorationTimingOptions extends RestorationBaseOptions {
  mode: RestorationMode;
  onStop: (markerPosition: number, targetCenter: number) => void;
}

const MODE_COLORS: Record<RestorationMode, number> = {
  safe: 0x63d28d,
  pro: 0x61a8ff,
  risky: 0xc4773a,
};

export function renderRestorationModePicker(options: RestorationModePickerOptions): void {
  const { scene, locale, item, prepareFrame, onChoose } = options;
  prepareFrame();

  panel(scene, 120, 135, 1040, 525);
  centerLabel(scene, 640, 178, t(locale, 'restorationChooseModeTitle'), 32, '#e9b949', 'bold');
  centerLabel(scene, 640, 212, t(locale, 'restorationChooseModeHelp'), 14, '#aeb5c0').setWordWrapWidth(880);

  scene.add.image(285, 355, resolveItemTexture(scene, item.definition.id)).setDisplaySize(270, 190);
  centerLabel(scene, 285, 470, item.definition.name[locale], 18, '#f7f8fa', 'bold').setWordWrapWidth(280);
  centerLabel(scene, 285, 503, `${t(locale, 'condition')}: ${Math.round(item.condition * 100)}%`, 14, '#aeb5c0');
  centerLabel(scene, 285, 535, t(locale, 'restorationAttemptWarning'), 12, '#e9b949', 'bold').setWordWrapWidth(290);

  const cards: Array<{ mode: RestorationMode; x: number }> = [
    { mode: 'safe', x: 500 },
    { mode: 'pro', x: 730 },
    { mode: 'risky', x: 960 },
  ];

  cards.forEach(({ mode, x }) => {
    const color = MODE_COLORS[mode];
    scene.add.rectangle(x, 405, 205, 300, 0x171a20).setStrokeStyle(2, color, 0.58);
    centerLabel(scene, x, 292, modeTitle(locale, mode), 20, hexColor(color), 'bold');
    centerLabel(scene, x, 340, modeDescription(locale, mode), 12, '#c3c8d0').setWordWrapWidth(175);
    centerLabel(scene, x, 430, modeTradeoff(locale, mode), 11, '#8b93a1', 'bold').setWordWrapWidth(175);
    button(scene, x, 523, t(locale, 'restorationChooseMode'), () => onChoose(mode), {
      width: 165,
      height: 42,
      background: color,
      hitSlop: 4,
    });
  });
}

export function renderRestorationTimingGame(options: RestorationTimingOptions): void {
  const { scene, locale, item, prepareFrame, mode, onStop } = options;
  prepareFrame();

  panel(scene, 180, 145, 920, 500);
  centerLabel(scene, 640, 190, `${t(locale, 'restorationTitle')} · ${modeTitle(locale, mode)}`, 32, '#e9b949', 'bold');

  scene.add.image(380, 315, resolveItemTexture(scene, item.definition.id)).setDisplaySize(300, 210);
  centerLabel(scene, 380, 433, `${t(locale, 'condition')}: ${Math.round(item.condition * 100)}%`, 18, '#d7dbe2', 'bold');

  label(scene, 565, 255, t(locale, 'restorationTimingHelp'), 17, '#d7dbe2').setWordWrapWidth(420);
  label(scene, 565, 326, modeTradeoff(locale, mode), 13, hexColor(MODE_COLORS[mode]), 'bold').setWordWrapWidth(410);

  const barX = 320;
  const barY = 500;
  const barWidth = 640;
  const baseHalfWidth = baseRestorationTargetHalfWidth(item.definition.rarity);
  const targetHalfWidth = restorationTargetHalfWidth(baseHalfWidth, mode);
  const edge = targetHalfWidth + 0.08;
  const targetCenter = Phaser.Math.FloatBetween(edge, 1 - edge);
  const targetX = barX + barWidth * targetCenter;
  const targetWidth = barWidth * targetHalfWidth * 2;

  scene.add.rectangle(barX, barY, barWidth, 26, 0x2b3038).setOrigin(0, 0.5).setStrokeStyle(1, 0xffffff, 0.12);
  scene.add.rectangle(targetX, barY, targetWidth, 26, 0x63d28d, 0.52).setStrokeStyle(2, 0x63d28d, 0.9);
  const marker = scene.add.rectangle(barX, barY, 8, 54, 0xf7f8fa).setOrigin(0.5);
  const tween = scene.tweens.add({
    targets: marker,
    x: barX + barWidth,
    duration: RESTORATION_MODE_RULES[mode].markerDurationMs,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.inOut',
  });

  button(scene, 640, 585, t(locale, 'restorationStop'), () => {
    const markerPosition = Phaser.Math.Clamp((marker.x - barX) / barWidth, 0, 1);
    tween.stop();
    onStop(markerPosition, targetCenter);
  }, { width: 260, height: 60, background: MODE_COLORS[mode] });
}

function modeTitle(locale: Locale, mode: RestorationMode): string {
  switch (mode) {
    case 'safe': return t(locale, 'restorationModeSafe');
    case 'pro': return t(locale, 'restorationModePro');
    case 'risky': return t(locale, 'restorationModeRisky');
  }
}

function modeDescription(locale: Locale, mode: RestorationMode): string {
  switch (mode) {
    case 'safe': return t(locale, 'restorationModeSafeDesc');
    case 'pro': return t(locale, 'restorationModeProDesc');
    case 'risky': return t(locale, 'restorationModeRiskyDesc');
  }
}

function modeTradeoff(locale: Locale, mode: RestorationMode): string {
  switch (mode) {
    case 'safe': return t(locale, 'restorationModeSafeTradeoff');
    case 'pro': return t(locale, 'restorationModeProTradeoff');
    case 'risky': return t(locale, 'restorationModeRiskyTradeoff');
  }
}

function panel(scene: Phaser.Scene, x: number, y: number, width: number, height: number): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(x, y, width, height, 0x15181e, 1).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.08);
}

function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size: number,
  color: string,
  style: 'normal' | 'bold' = 'normal',
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    fontFamily: 'Arial, sans-serif',
    fontSize: `${size}px`,
    fontStyle: style,
    color,
  });
}

function centerLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size: number,
  color: string,
  style: 'normal' | 'bold' = 'normal',
): Phaser.GameObjects.Text {
  return label(scene, x, y, text, size, color, style).setOrigin(0.5);
}

function hexColor(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}
