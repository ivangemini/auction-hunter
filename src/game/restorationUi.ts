import Phaser from 'phaser';
import {
  RESTORATION_MODE_RULES,
  baseRestorationTargetHalfWidth,
  restorationTargetHalfWidth,
  type RestorationMode,
  type RestorationOutcome,
} from '../domain/restoration';
import type { Locale, RevealedItem, RestorationGrade } from '../domain/types';
import { t } from '../i18n';
import { resolveItemTexture } from './art';
import { enterWithStagger, MOTION, prefersReducedMotion } from './motion';
import { button } from './ui';

interface RestorationBaseOptions {
  scene: Phaser.Scene;
  locale: Locale;
  item: RevealedItem;
  prepareFrame: () => void;
  formatMoney: (value: number) => string;
}

interface RestorationModePickerOptions extends RestorationBaseOptions {
  onChoose: (mode: RestorationMode) => void;
}

interface RestorationTimingOptions extends RestorationBaseOptions {
  mode: RestorationMode;
  onStop: (markerPosition: number, targetCenter: number) => void;
}

interface RestorationResultOptions extends RestorationBaseOptions {
  outcome: RestorationOutcome;
  onContinue: () => void;
}

const MODE_COLORS: Record<RestorationMode, number> = {
  safe: 0x63d28d,
  pro: 0x61a8ff,
  risky: 0xc4773a,
};

const GRADE_COLORS: Record<RestorationGrade, number> = {
  perfect: 0xe9b949,
  good: 0x63d28d,
  rough: 0xc4773a,
};

export function renderRestorationModePicker(options: RestorationModePickerOptions): void {
  const { scene, locale, item, prepareFrame, formatMoney, onChoose } = options;
  prepareFrame();
  renderBackdrop(scene);
  renderWorkbenchHeader(scene, locale, item, formatMoney);

  const itemPanel = scene.add.container(44, 144);
  itemPanel.add([
    surface(scene, 0, 0, 356, 510, 0xe9b949),
    scene.add.rectangle(20, 22, 316, 284, 0x0c1016, 1).setOrigin(0).setStrokeStyle(1, 0xe9b949, 0.2),
  ]);
  const itemHalo = scene.add.circle(178, 164, 126, 0xe9b949, 0.035).setStrokeStyle(1, 0xe9b949, 0.14);
  const image = scene.add.image(178, 165, resolveItemTexture(scene, item.definition.id)).setDisplaySize(300, 210);
  const itemTitle = centerLabel(scene, 178, 330, item.definition.name[locale], 20, '#f7f3e8', 'bold')
    .setWordWrapWidth(300)
    .setAlign('center');
  const conditionLabel = label(scene, 30, 379, t(locale, 'condition').toUpperCase(), 9, '#7f8996', 'bold');
  const conditionValue = label(scene, 326, 374, `${Math.round(item.condition * 100)}%`, 20, conditionColor(item.condition), 'bold').setOrigin(1, 0);
  const conditionTrack = scene.add.rectangle(30, 413, 296, 12, 0x2b3038, 1).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.08);
  const conditionFill = scene.add.rectangle(30, 413, 296 * item.condition, 12, hexColorToNumber(conditionColor(item.condition)), 0.88).setOrigin(0);
  const appraisalLabel = label(scene, 30, 447, t(locale, 'estimatedValue').toUpperCase(), 9, '#7f8996', 'bold');
  const appraisalValue = label(scene, 326, 441, formatMoney(item.appraisedValue), 22, '#63d28d', 'bold').setOrigin(1, 0);
  const warning = centerLabel(scene, 178, 486, t(locale, 'restorationAttemptWarning'), 10, '#d8a46c', 'bold')
    .setWordWrapWidth(300)
    .setAlign('center');
  itemPanel.add([
    itemHalo,
    image,
    itemTitle,
    conditionLabel,
    conditionValue,
    conditionTrack,
    conditionFill,
    appraisalLabel,
    appraisalValue,
    warning,
  ]);

  if (!prefersReducedMotion()) {
    image.setY(174).setAlpha(0.72);
    scene.tweens.add({ targets: image, y: 165, alpha: 1, duration: MOTION.cardEnterMs, ease: 'Cubic.Out' });
    scene.tweens.add({ targets: itemHalo, alpha: { from: 0.018, to: 0.055 }, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  let choicePending = false;
  const cards: Array<{ mode: RestorationMode; x: number }> = [
    { mode: 'safe', x: 420 },
    { mode: 'pro', x: 688 },
    { mode: 'risky', x: 956 },
  ];

  cards.forEach(({ mode, x }, index) => {
    const color = MODE_COLORS[mode];
    const rules = RESTORATION_MODE_RULES[mode];
    const card = scene.add.container(x, 170);
    const shadow = scene.add.rectangle(5, 7, 248, 452, 0x000000, 0.34).setOrigin(0);
    const body = scene.add.rectangle(0, 0, 248, 452, 0x11151c, 1)
      .setOrigin(0)
      .setStrokeStyle(2, color, mode === 'pro' ? 0.7 : 0.46);
    const topBand = scene.add.rectangle(0, 0, 248, 62, color, mode === 'pro' ? 0.16 : 0.1).setOrigin(0);
    const iconPlate = scene.add.rectangle(24, 19, 34, 34, color, 0.13).setOrigin(0).setStrokeStyle(1, color, 0.45);
    const icon = centerLabel(scene, 41, 36, modeGlyph(mode), 18, hexColor(color), 'bold');
    const title = label(scene, 72, 18, modeTitle(locale, mode), 20, '#f7f3e8', 'bold');
    const speedPips = renderSpeedPips(scene, 24, 86, mode, color);
    const targetPreview = renderTargetPreview(scene, 24, 126, mode, color);
    const description = label(scene, 24, 177, modeDescription(locale, mode), 11, '#c2c8d1').setWordWrapWidth(200);
    const divider = scene.add.rectangle(24, 284, 200, 1, 0xffffff, 0.08).setOrigin(0);
    const rewardTitle = label(scene, 24, 304, `${t(locale, 'restorationPerfect').toUpperCase()} / ${t(locale, 'restorationGood').toUpperCase()}`, 8, '#737c88', 'bold');
    const reward = label(
      scene,
      24,
      325,
      `+${Math.round(rules.perfectConditionGain * 100)} / +${Math.round(rules.goodConditionGain * 100)} п.п.`,
      18,
      hexColor(color),
      'bold',
    );
    const tradeoff = label(scene, 24, 357, modeTradeoff(locale, mode), 9, '#8f98a4', 'bold').setWordWrapWidth(200);
    const choose = button(scene, 124, 414, t(locale, 'restorationChooseMode'), () => {
      if (choicePending) return;
      choicePending = true;
      onChoose(mode);
    }, {
      width: 200,
      height: 46,
      background: color,
      accent: color,
      hitSlop: 5,
      fontSize: 15,
    });
    card.add([
      shadow,
      body,
      topBand,
      iconPlate,
      icon,
      title,
      ...speedPips,
      ...targetPreview,
      description,
      divider,
      rewardTitle,
      reward,
      tradeoff,
      choose,
    ]);
    installCardHover(scene, card, body, color);
    enterWithStagger(scene, card, 170, index);
  });
}

export function renderRestorationTimingGame(options: RestorationTimingOptions): void {
  const { scene, locale, item, prepareFrame, formatMoney, mode, onStop } = options;
  prepareFrame();
  renderBackdrop(scene);
  renderWorkbenchHeader(scene, locale, item, formatMoney, mode);

  surface(scene, 42, 148, 476, 492, MODE_COLORS[mode]);
  const artFrame = scene.add.rectangle(66, 173, 428, 310, 0x0b0f14, 1).setOrigin(0).setStrokeStyle(1, MODE_COLORS[mode], 0.26);
  const halo = scene.add.circle(280, 326, 168, MODE_COLORS[mode], 0.035).setStrokeStyle(2, MODE_COLORS[mode], 0.12);
  const image = scene.add.image(280, 322, resolveItemTexture(scene, item.definition.id)).setDisplaySize(392, 274);
  label(scene, 72, 511, t(locale, 'condition').toUpperCase(), 9, '#7f8996', 'bold');
  label(scene, 490, 504, `${Math.round(item.condition * 100)}%`, 22, conditionColor(item.condition), 'bold').setOrigin(1, 0);
  scene.add.rectangle(72, 545, 418, 12, 0x2b3038, 1).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.08);
  scene.add.rectangle(72, 545, 418 * item.condition, 12, hexColorToNumber(conditionColor(item.condition)), 0.88).setOrigin(0);
  label(scene, 72, 580, t(locale, 'estimatedValue').toUpperCase(), 9, '#7f8996', 'bold');
  label(scene, 490, 572, formatMoney(item.appraisedValue), 23, '#63d28d', 'bold').setOrigin(1, 0);

  surface(scene, 542, 148, 696, 492, MODE_COLORS[mode]);
  const color = MODE_COLORS[mode];
  scene.add.rectangle(572, 177, 142, 34, color, 0.13).setOrigin(0).setStrokeStyle(1, color, 0.45);
  label(scene, 588, 186, modeTitle(locale, mode).toUpperCase(), 11, hexColor(color), 'bold');
  label(scene, 572, 236, t(locale, 'restorationTimingHelp'), 15, '#f0f2f5', 'bold').setWordWrapWidth(622);
  label(scene, 572, 292, modeTradeoff(locale, mode), 11, hexColor(color), 'bold').setWordWrapWidth(612);

  const barX = 598;
  const barY = 414;
  const barWidth = 584;
  const baseHalfWidth = baseRestorationTargetHalfWidth(item.definition.rarity);
  const targetHalfWidth = restorationTargetHalfWidth(baseHalfWidth, mode);
  const goodHalfWidth = targetHalfWidth + RESTORATION_MODE_RULES[mode].goodMargin;
  const edge = targetHalfWidth + 0.08;
  const targetCenter = Phaser.Math.FloatBetween(edge, 1 - edge);
  const targetX = barX + barWidth * targetCenter;
  const targetWidth = barWidth * targetHalfWidth * 2;
  const goodLeft = Math.max(barX, targetX - barWidth * goodHalfWidth);
  const goodRight = Math.min(barX + barWidth, targetX + barWidth * goodHalfWidth);
  const goodWidth = Math.max(0, goodRight - goodLeft);

  label(scene, barX, 352, t(locale, 'restorationGood').toUpperCase(), 8, '#aeb5c0', 'bold');
  scene.add.rectangle(barX + 82, 358, 14, 7, 0xe9b949, 0.5).setOrigin(0.5);
  label(scene, barX + 111, 352, t(locale, 'restorationPerfect').toUpperCase(), 8, '#aeb5c0', 'bold');
  scene.add.rectangle(barX + 222, 358, 14, 7, 0x63d28d, 0.72).setOrigin(0.5);

  scene.add.rectangle(barX, barY, barWidth, 42, 0x20262e, 1).setOrigin(0, 0.5).setStrokeStyle(1, 0xffffff, 0.1);
  scene.add.rectangle(goodLeft, barY, goodWidth, 42, 0xe9b949, 0.14).setOrigin(0, 0.5).setStrokeStyle(1, 0xe9b949, 0.32);
  const target = scene.add.rectangle(targetX, barY, targetWidth, 42, 0x63d28d, 0.44).setStrokeStyle(2, 0x63d28d, 0.86);
  scene.add.rectangle(targetX, barY, 2, 58, 0xffffff, 0.24);

  const markerGlow = scene.add.rectangle(0, 0, 18, 78, 0xffffff, 0.08).setStrokeStyle(1, 0xffffff, 0.08);
  const marker = scene.add.rectangle(0, 0, 8, 66, 0xf7f8fa, 1).setStrokeStyle(2, color, 0.75);
  const markerContainer = scene.add.container(barX, barY, [markerGlow, marker]);
  const tween = scene.tweens.add({
    targets: markerContainer,
    x: barX + barWidth,
    duration: RESTORATION_MODE_RULES[mode].markerDurationMs,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.InOut',
  });

  if (!prefersReducedMotion()) {
    image.setScale(0.965).setAlpha(0.82);
    scene.tweens.add({ targets: image, scaleX: 1, scaleY: 1, alpha: 1, duration: MOTION.cardEnterMs, ease: 'Cubic.Out' });
    scene.tweens.add({ targets: halo, alpha: { from: 0.018, to: 0.055 }, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    scene.tweens.add({ targets: target, alpha: { from: 0.72, to: 1 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }

  let stopped = false;
  button(scene, 890, 557, t(locale, 'restorationStop'), () => {
    if (stopped) return;
    stopped = true;
    const markerPosition = Phaser.Math.Clamp((markerContainer.x - barX) / barWidth, 0, 1);
    tween.stop();
    onStop(markerPosition, targetCenter);
  }, {
    width: 300,
    height: 68,
    background: color,
    accent: color,
    hitSlop: 8,
    fontSize: 22,
  });
}

export function renderRestorationResult(options: RestorationResultOptions): void {
  const { scene, locale, item, prepareFrame, formatMoney, outcome, onContinue } = options;
  prepareFrame();
  renderBackdrop(scene);
  renderWorkbenchHeader(scene, locale, item, formatMoney, outcome.mode);

  const accent = GRADE_COLORS[outcome.grade];
  surface(scene, 96, 154, 1088, 486, accent);
  scene.add.rectangle(118, 176, 468, 442, 0x0b0f14, 1).setOrigin(0).setStrokeStyle(1, accent, 0.24);
  const halo = scene.add.circle(352, 362, 188, accent, 0.045).setStrokeStyle(2, accent, 0.16);
  const image = scene.add.image(352, 352, resolveItemTexture(scene, item.definition.id)).setDisplaySize(420, 294);
  centerLabel(scene, 352, 557, item.definition.name[locale], 20, '#f7f3e8', 'bold').setWordWrapWidth(410).setAlign('center');

  label(scene, 630, 188, `${t(locale, 'restorationTitle').toUpperCase()} · ${modeTitle(locale, outcome.mode).toUpperCase()}`, 10, '#777f8b', 'bold');
  label(scene, 630, 226, gradeTitle(locale, outcome.grade), 38, hexColor(accent), 'bold').setWordWrapWidth(500);
  scene.add.rectangle(630, 286, 502, 1, 0xffffff, 0.08).setOrigin(0);

  resultMetric(
    scene,
    630,
    318,
    t(locale, 'condition'),
    `${Math.round(outcome.conditionBefore * 100)}% → ${Math.round(outcome.conditionAfter * 100)}%`,
    outcome.conditionAfter > outcome.conditionBefore ? 0x63d28d : 0xaeb5c0,
  );
  resultMetric(
    scene,
    630,
    390,
    t(locale, 'estimatedValue'),
    `${formatMoney(outcome.valueBefore)} → ${formatMoney(outcome.valueAfter)}`,
    outcome.valueGain > 0 ? 0x63d28d : 0xaeb5c0,
  );

  scene.add.rectangle(630, 472, 502, 58, outcome.valueGain > 0 ? 0x173522 : 0x2b2118, 0.9)
    .setOrigin(0)
    .setStrokeStyle(1, outcome.valueGain > 0 ? 0x63d28d : 0xc4773a, 0.34);
  label(
    scene,
    650,
    489,
    t(locale, 'restorationGain', { amount: formatMoney(outcome.valueGain) }),
    17,
    outcome.valueGain > 0 ? '#7ee0a0' : '#d8a46c',
    'bold',
  );
  label(scene, 630, 544, t(locale, 'restorationSpent'), 10, '#777f8b', 'bold').setWordWrapWidth(500);

  let continued = false;
  button(scene, 882, 590, t(locale, 'onboardingNext'), () => {
    if (continued) return;
    continued = true;
    onContinue();
  }, {
    width: 300,
    height: 58,
    background: accent,
    accent,
    fontSize: 17,
  });

  if (!prefersReducedMotion()) {
    image.setScale(0.94).setAlpha(0.55);
    scene.tweens.add({ targets: image, scaleX: 1, scaleY: 1, alpha: 1, y: { from: 368, to: 352 }, duration: MOTION.revealSettleMs, ease: 'Back.Out' });
    scene.tweens.add({ targets: halo, scaleX: { from: 0.88, to: 1.05 }, scaleY: { from: 0.88, to: 1.05 }, alpha: { from: 0.025, to: 0.07 }, duration: MOTION.celebrateMs, yoyo: true, ease: 'Sine.Out' });
    if (outcome.grade === 'perfect') renderPerfectSparks(scene, 352, 352, accent);
  }
}

function renderBackdrop(scene: Phaser.Scene): void {
  scene.add.rectangle(0, 0, 1280, 720, 0x0b0e13, 1).setOrigin(0);
  scene.add.rectangle(0, 0, 1280, 118, 0x10141a, 0.98).setOrigin(0);
  scene.add.rectangle(0, 118, 1280, 602, 0x101216, 0.84).setOrigin(0);
  scene.add.rectangle(0, 118, 420, 602, 0xe9b949, 0.018).setOrigin(0);
  scene.add.rectangle(860, 118, 420, 602, 0x61a8ff, 0.014).setOrigin(0);
  scene.add.rectangle(28, 116, 1224, 1, 0xffffff, 0.08).setOrigin(0);
}

function renderWorkbenchHeader(
  scene: Phaser.Scene,
  locale: Locale,
  item: RevealedItem,
  formatMoney: (value: number) => string,
  mode?: RestorationMode,
): void {
  scene.add.rectangle(28, 20, 204, 82, 0x11151c, 0.98).setOrigin(0).setStrokeStyle(2, 0xc4773a, 0.48);
  label(scene, 48, 33, 'RESTORATION', 19, '#d8a46c', 'bold');
  label(scene, 82, 64, 'BENCH', 13, '#7f8996', 'bold');
  label(scene, 266, 28, t(locale, 'restorationTitle'), 26, '#f7f3e8', 'bold');
  label(scene, 266, 63, item.definition.name[locale], 12, '#8f98a4').setWordWrapWidth(380);
  if (mode) {
    const color = MODE_COLORS[mode];
    scene.add.rectangle(650, 34, 142, 34, color, 0.12).setOrigin(0).setStrokeStyle(1, color, 0.4);
    label(scene, 665, 43, modeTitle(locale, mode).toUpperCase(), 10, hexColor(color), 'bold');
  }
  headerStat(scene, 832, t(locale, 'condition'), `${Math.round(item.condition * 100)}%`, conditionColor(item.condition));
  headerStat(scene, 1010, t(locale, 'estimatedValue'), formatMoney(item.appraisedValue), '#63d28d');
}

function headerStat(scene: Phaser.Scene, x: number, title: string, value: string, color: string): void {
  scene.add.rectangle(x, 25, 164, 64, 0x11151c, 0.96).setOrigin(0).setStrokeStyle(1, hexColorToNumber(color), 0.28);
  label(scene, x + 12, 34, title.toUpperCase(), 8, '#707985', 'bold');
  label(scene, x + 12, 55, value, 17, color, 'bold');
}

function surface(scene: Phaser.Scene, x: number, y: number, width: number, height: number, accent: number): Phaser.GameObjects.Rectangle {
  scene.add.rectangle(x + 5, y + 7, width, height, 0x000000, 0.34).setOrigin(0);
  return scene.add.rectangle(x, y, width, height, 0x11151c, 0.98).setOrigin(0).setStrokeStyle(2, accent, 0.26);
}

function renderSpeedPips(
  scene: Phaser.Scene,
  x: number,
  y: number,
  mode: RestorationMode,
  color: number,
): Phaser.GameObjects.GameObject[] {
  const count = mode === 'safe' ? 1 : mode === 'pro' ? 2 : 3;
  const objects: Phaser.GameObjects.GameObject[] = [label(scene, x, y, 'SPEED', 8, '#69717d', 'bold')];
  for (let index = 0; index < 3; index += 1) {
    objects.push(scene.add.rectangle(x + 84 + index * 22, y + 5, 15, 6, index < count ? color : 0x303640, index < count ? 0.88 : 0.7));
  }
  return objects;
}

function renderTargetPreview(
  scene: Phaser.Scene,
  x: number,
  y: number,
  mode: RestorationMode,
  color: number,
): Phaser.GameObjects.GameObject[] {
  const baseWidth = 180;
  const halfWidth = restorationTargetHalfWidth(0.12, mode);
  const targetWidth = Math.max(22, baseWidth * halfWidth * 2);
  const labelText = label(scene, x, y, 'TIMING WINDOW', 8, '#69717d', 'bold');
  const track = scene.add.rectangle(x, y + 27, baseWidth, 11, 0x2b3038, 1).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.06);
  const target = scene.add.rectangle(x + baseWidth / 2, y + 32.5, targetWidth, 11, color, 0.62).setStrokeStyle(1, color, 0.8);
  return [labelText, track, target];
}

function installCardHover(
  scene: Phaser.Scene,
  card: Phaser.GameObjects.Container,
  body: Phaser.GameObjects.Rectangle,
  color: number,
): void {
  const hit = scene.add.rectangle(124, 226, 248, 452, 0xffffff, 0.001);
  card.addAt(hit, 0);
  hit.setInteractive({ useHandCursor: true });
  const reduced = prefersReducedMotion();
  const settle = (hovered: boolean): void => {
    scene.tweens.killTweensOf(card);
    body.setStrokeStyle(2, color, hovered ? 0.82 : 0.46);
    if (reduced) {
      card.setScale(hovered ? 1.008 : 1).setY(hovered ? 168 : 170);
      return;
    }
    scene.tweens.add({
      targets: card,
      y: hovered ? 164 : 170,
      scaleX: hovered ? 1.014 : 1,
      scaleY: hovered ? 1.014 : 1,
      duration: hovered ? MOTION.hoverMs : MOTION.settleMs,
      ease: hovered ? 'Cubic.Out' : 'Back.Out',
    });
  };
  hit.on('pointerover', () => settle(true));
  hit.on('pointerout', () => settle(false));
}

function resultMetric(scene: Phaser.Scene, x: number, y: number, title: string, value: string, accent: number): void {
  label(scene, x, y, title.toUpperCase(), 9, '#777f8b', 'bold');
  scene.add.rectangle(x, y + 24, 502, 46, 0x151a20, 0.96).setOrigin(0).setStrokeStyle(1, accent, 0.26);
  label(scene, x + 16, y + 34, value, 20, '#f7f3e8', 'bold');
}

function renderPerfectSparks(scene: Phaser.Scene, x: number, y: number, accent: number): void {
  const offsets = [
    [-155, -96], [-105, -142], [0, -158], [112, -132], [162, -70],
    [-168, 18], [154, 34], [-118, 118], [118, 120],
  ] as const;
  offsets.forEach(([dx, dy], index) => {
    const spark = scene.add.circle(x + dx, y + dy, index % 3 === 0 ? 4 : 3, accent, 0.8);
    scene.tweens.add({
      targets: spark,
      y: spark.y - 18,
      alpha: 0,
      scaleX: 0.4,
      scaleY: 0.4,
      duration: 420 + index * 24,
      delay: index * 28,
      ease: 'Cubic.Out',
      onComplete: () => spark.destroy(),
    });
  });
}

function modeGlyph(mode: RestorationMode): string {
  switch (mode) {
    case 'safe': return '◇';
    case 'pro': return '◆';
    case 'risky': return '⚡';
  }
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

function gradeTitle(locale: Locale, grade: RestorationGrade): string {
  switch (grade) {
    case 'perfect': return t(locale, 'restorationPerfect');
    case 'good': return t(locale, 'restorationGood');
    case 'rough': return t(locale, 'restorationRough');
  }
}

function conditionColor(condition: number): string {
  if (condition >= 0.86) return '#63d28d';
  if (condition >= 0.7) return '#e9b949';
  if (condition >= 0.55) return '#d8a46c';
  return '#ff8d85';
}

function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  color: string,
  style: 'normal' | 'bold' = 'normal',
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, {
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
  value: string,
  size: number,
  color: string,
  style: 'normal' | 'bold' = 'normal',
): Phaser.GameObjects.Text {
  return label(scene, x, y, value, size, color, style).setOrigin(0.5);
}

function hexColor(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}

function hexColorToNumber(value: string): number {
  return Number.parseInt(value.slice(1), 16);
}
