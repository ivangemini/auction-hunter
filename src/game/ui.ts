import Phaser from 'phaser';
import { playFeedbackCue } from './feedback';

interface ButtonOptions {
  width?: number;
  height?: number;
  background?: number;
  foreground?: string;
  disabled?: boolean;
  hitSlop?: number;
  feedback?: boolean;
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
  const hitSlop = Math.max(0, options.hitSlop ?? 14);

  // Transparent hit target keeps visual density while making landscape-phone controls easier to tap.
  const hitTarget = scene.add.rectangle(0, 0, width + hitSlop * 2, height + hitSlop * 2, 0xffffff, 0.001);
  const rect = scene.add.rectangle(0, 0, width, height, background, 1).setStrokeStyle(2, 0xffffff, 0.12);
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'Arial, sans-serif',
    fontSize: '20px',
    fontStyle: 'bold',
    color: foreground,
    align: 'center',
    wordWrap: { width: Math.max(80, width - 24) },
  }).setOrigin(0.5);

  const container = scene.add.container(x, y, [hitTarget, rect, text]);

  if (!options.disabled) {
    hitTarget.setInteractive({ useHandCursor: true });
    hitTarget.on('pointerover', () => rect.setAlpha(0.88));
    hitTarget.on('pointerout', () => {
      rect.setAlpha(1);
      container.setScale(1);
    });
    hitTarget.on('pointerdown', () => container.setScale(0.985));
    hitTarget.on('pointerup', () => {
      container.setScale(1);
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
