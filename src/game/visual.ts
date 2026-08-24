import Phaser from 'phaser';

export const VISUAL = {
  background: 0x0b0e13,
  backgroundRaised: 0x10141a,
  surface: 0x11151c,
  surfaceRaised: 0x151a20,
  surfaceDeep: 0x0c1016,
  line: 0xffffff,
  gold: 0xe9b949,
  copper: 0xc4773a,
  blue: 0x61a8ff,
  green: 0x63d28d,
  violet: 0xb576ff,
  danger: 0xff8d85,
  text: '#f7f3e8',
  textSoft: '#c8cdd5',
  muted: '#8f98a4',
  dim: '#69717d',
} as const;

export function surface(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  accent = VISUAL.line,
  accentAlpha = 0.18,
): Phaser.GameObjects.Rectangle {
  scene.add.rectangle(x + 5, y + 7, width, height, 0x000000, 0.34).setOrigin(0);
  return scene.add.rectangle(x, y, width, height, VISUAL.surface, 0.98)
    .setOrigin(0)
    .setStrokeStyle(1, accent, accentAlpha);
}

export function insetSurface(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  accent = VISUAL.line,
  accentAlpha = 0.1,
): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(x, y, width, height, VISUAL.surfaceDeep, 0.98)
    .setOrigin(0)
    .setStrokeStyle(1, accent, accentAlpha);
}

export function chip(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  labelValue: string,
  accent: number,
  foreground = '#f7f3e8',
): Phaser.GameObjects.Container {
  const body = scene.add.rectangle(0, 0, width, 26, accent, 0.12).setOrigin(0).setStrokeStyle(1, accent, 0.38);
  const dot = scene.add.circle(13, 13, 4, accent, 0.9);
  const text = scene.add.text(25, 7, labelValue, {
    fontFamily: 'Arial, sans-serif',
    fontSize: '9px',
    fontStyle: 'bold',
    color: foreground,
  });
  return scene.add.container(x, y, [body, dot, text]);
}

export function text(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  color = VISUAL.text,
  style: 'normal' | 'bold' = 'normal',
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, {
    fontFamily: 'Arial, sans-serif',
    fontSize: `${size}px`,
    fontStyle: style,
    color,
  });
}

export function centerText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  color = VISUAL.text,
  style: 'normal' | 'bold' = 'normal',
): Phaser.GameObjects.Text {
  return text(scene, x, y, value, size, color, style).setOrigin(0.5);
}

export function hex(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}
