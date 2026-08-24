import Phaser from 'phaser';
import { MOTION, prefersReducedMotion } from './motion';

export const VISUAL = {
  ink: 0x101216,
  panel: 0x171a20,
  panelRaised: 0x1d2229,
  panelDeep: 0x11151a,
  steel: 0x2b3038,
  text: '#f7f8fa',
  muted: '#8b93a1',
  faint: '#66707c',
  warm: 0xe9b949,
  copper: 0xc4773a,
  success: 0x63d28d,
  rare: 0x61a8ff,
  purple: 0xb576ff,
} as const;

export interface SurfaceOptions {
  fill?: number;
  accent?: number;
  strokeAlpha?: number;
  glowAlpha?: number;
  shadowAlpha?: number;
  topLine?: boolean;
}

export function addAtmosphere(
  scene: Phaser.Scene,
  width: number,
  height: number,
  accent: number,
  focusX = width * 0.78,
): Phaser.GameObjects.Container {
  const base = scene.add.rectangle(0, 0, width, height, VISUAL.ink).setOrigin(0);
  const wash = scene.add.ellipse(focusX, height * 0.36, width * 0.7, height * 0.95, accent, 0.035);
  const wash2 = scene.add.ellipse(width * 0.22, height * 0.85, width * 0.65, height * 0.36, 0xffffff, 0.012);
  const horizon = scene.add.rectangle(0, height * 0.74, width, height * 0.26, VISUAL.panelDeep, 0.55).setOrigin(0);
  const rail = scene.add.rectangle(0, height * 0.74, width, 1, accent, 0.12).setOrigin(0);
  return scene.add.container(0, 0, [base, wash, wash2, horizon, rail]);
}

export function addSurface(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  options: SurfaceOptions = {},
): Phaser.GameObjects.Container {
  const fill = options.fill ?? VISUAL.panel;
  const accent = options.accent ?? VISUAL.warm;
  const shadow = scene.add.rectangle(5, 7, width, height, 0x000000, options.shadowAlpha ?? 0.32).setOrigin(0);
  const glow = scene.add.rectangle(-3, -3, width + 6, height + 6, accent, options.glowAlpha ?? 0.018)
    .setOrigin(0)
    .setStrokeStyle(1, accent, 0.05);
  const body = scene.add.rectangle(0, 0, width, height, fill, 1)
    .setOrigin(0)
    .setStrokeStyle(1, accent, options.strokeAlpha ?? 0.18);
  const top = scene.add.rectangle(0, 0, width, options.topLine === false ? 0 : 2, accent, options.topLine === false ? 0 : 0.42).setOrigin(0);
  const inner = scene.add.rectangle(8, 8, Math.max(0, width - 16), Math.max(0, height - 16), 0xffffff, 0.008)
    .setOrigin(0)
    .setStrokeStyle(1, 0xffffff, 0.025);
  return scene.add.container(x, y, [shadow, glow, body, top, inner]);
}

export function addChip(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  accent: number,
  options: { width?: number; height?: number; filled?: boolean; fontSize?: number; foreground?: string } = {},
): Phaser.GameObjects.Container {
  const width = options.width ?? Math.max(74, Math.round(label.length * 7.2 + 26));
  const height = options.height ?? 28;
  const filled = options.filled ?? false;
  const bg = scene.add.rectangle(0, 0, width, height, accent, filled ? 0.16 : 0.055)
    .setStrokeStyle(1, accent, filled ? 0.62 : 0.32);
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'Arial, sans-serif',
    fontSize: `${options.fontSize ?? 11}px`,
    fontStyle: 'bold',
    color: options.foreground ?? '#f3ead5',
    align: 'center',
  }).setOrigin(0.5);
  return scene.add.container(x, y, [bg, text]);
}

export function addProgressBar(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  ratio: number,
  accent: number,
): Phaser.GameObjects.Container {
  const clamped = Phaser.Math.Clamp(ratio, 0, 1);
  const track = scene.add.rectangle(0, 0, width, 7, VISUAL.steel, 0.78).setOrigin(0, 0.5);
  const fill = scene.add.rectangle(0, 0, Math.max(2, width * clamped), 7, accent, 0.92).setOrigin(0, 0.5);
  const shine = scene.add.rectangle(0, -2, Math.max(2, width * clamped), 1, 0xffffff, 0.18).setOrigin(0, 0.5);
  return scene.add.container(x, y, [track, fill, shine]);
}

export function enableHoverLift(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Container,
  baseY: number,
  options: { lift?: number; scale?: number } = {},
): void {
  const lift = options.lift ?? 3;
  const scale = options.scale ?? 1.012;
  const settle = (hovered: boolean): void => {
    scene.tweens.killTweensOf(target);
    if (prefersReducedMotion()) {
      target.setY(hovered ? baseY - 1 : baseY).setScale(hovered ? 1.006 : 1);
      return;
    }
    scene.tweens.add({
      targets: target,
      y: hovered ? baseY - lift : baseY,
      scaleX: hovered ? scale : 1,
      scaleY: hovered ? scale : 1,
      duration: hovered ? MOTION.hoverMs : MOTION.settleMs,
      ease: hovered ? 'Cubic.Out' : 'Sine.Out',
    });
  };
  target.on('pointerover', () => settle(true));
  target.on('pointerout', () => settle(false));
}
