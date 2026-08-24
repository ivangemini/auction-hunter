import Phaser from 'phaser';
import { playFeedbackCue } from './feedback';
import { MOTION, prefersReducedMotion } from './motion';

interface ButtonOptions {
  width?: number;
  height?: number;
  background?: number;
  foreground?: string;
  disabled?: boolean;
  hitSlop?: number;
  feedback?: boolean;
  accent?: number;
  motion?: boolean;
}

export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  options: ButtonOptions = {},
): Phaser.GameObjects.Container {
  const width = options.width ?? 220;
  const height = options.height ?? 56;
  const background = options.disabled ? 0x343943 : (options.background ?? 0xe9b949);
  const foreground = options.disabled
    ? '#858b96'
    : options.foreground ?? defaultForeground(background);
  const accent = options.accent ?? background;
  const hitSlop = Math.max(0, options.hitSlop ?? 14);
  const motionEnabled = options.motion !== false && !prefersReducedMotion();

  const shadow = scene.add.rectangle(0, 4, width + 4, height + 4, 0x000000, options.disabled ? 0.18 : 0.34)
    .setStrokeStyle(1, accent, 0.08);
  const glow = scene.add.rectangle(0, 0, width + 8, height + 8, accent, 0)
    .setStrokeStyle(2, accent, 0);
  const rect = scene.add.rectangle(0, 0, width, height, background, 1)
    .setStrokeStyle(2, options.disabled ? 0x707783 : accent, options.disabled ? 0.18 : 0.52);
  const topHighlight = scene.add.rectangle(0, -height / 2 + 2, Math.max(24, width - 10), 2, 0xffffff, options.disabled ? 0.03 : 0.16);
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'Arial, sans-serif',
    fontSize: '20px',
    fontStyle: 'bold',
    color: foreground,
    align: 'center',
    wordWrap: { width: Math.max(80, width - 24) },
  }).setOrigin(0.5);

  // The visual shell animates independently. The outer container and hit target stay fixed,
  // so quick clicks/taps cannot lose pointerup because the control moved under the pointer.
  const visual = scene.add.container(0, 0, [shadow, glow, rect, topHighlight, text]);
  const hitTarget = scene.add.rectangle(0, 0, width + hitSlop * 2, height + hitSlop * 2, 0xffffff, 0.001);
  const container = scene.add.container(x, y, [visual, hitTarget]);

  if (!options.disabled) {
    hitTarget.setInteractive({ useHandCursor: true });

    const settle = (hovered: boolean): void => {
      scene.tweens.killTweensOf(visual);
      scene.tweens.killTweensOf(glow);
      scene.tweens.killTweensOf(shadow);
      if (!motionEnabled) {
        visual.setScale(hovered ? 1.018 : 1).setY(hovered ? -1 : 0);
        glow.setAlpha(hovered ? 0.12 : 0);
        shadow.setAlpha(hovered ? 0.44 : 0.34);
        return;
      }
      scene.tweens.add({
        targets: visual,
        scaleX: hovered ? 1.025 : 1,
        scaleY: hovered ? 1.025 : 1,
        y: hovered ? -2 : 0,
        duration: hovered ? MOTION.hoverMs : MOTION.settleMs,
        ease: hovered ? 'Cubic.Out' : 'Back.Out',
      });
      scene.tweens.add({
        targets: glow,
        alpha: hovered ? 0.13 : 0,
        duration: MOTION.hoverMs,
        ease: 'Sine.Out',
      });
      scene.tweens.add({
        targets: shadow,
        alpha: hovered ? 0.48 : 0.34,
        y: hovered ? 6 : 4,
        duration: MOTION.settleMs,
        ease: 'Sine.Out',
      });
    };

    hitTarget.on('pointerover', () => settle(true));
    hitTarget.on('pointerout', () => settle(false));
    hitTarget.on('pointerdown', () => {
      scene.tweens.killTweensOf(visual);
      if (motionEnabled) {
        scene.tweens.add({
          targets: visual,
          scaleX: 0.972,
          scaleY: 0.972,
          y: 1,
          duration: MOTION.pressMs,
          ease: 'Cubic.Out',
        });
      } else {
        visual.setScale(0.985).setY(1);
      }
      glow.setAlpha(0.2);
    });
    hitTarget.on('pointerup', () => {
      if (motionEnabled) {
        scene.tweens.killTweensOf(visual);
        scene.tweens.add({
          targets: visual,
          scaleX: 1.025,
          scaleY: 1.025,
          y: -2,
          duration: MOTION.settleMs,
          ease: 'Back.Out',
        });
      } else {
        visual.setScale(1.018).setY(-1);
      }
      glow.setAlpha(0.13);
      if (options.feedback !== false) playFeedbackCue(scene, 'ui');
      onClick();
    });
  }

  return container;
}

function defaultForeground(background: number): string {
  return background === 0xe9b949 || background === 0xc4773a || background === 0x61a8ff
    ? '#101216'
    : '#f7f8fa';
}
