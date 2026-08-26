import Phaser from 'phaser';
import { MOTION, prefersReducedMotion } from './motion';

export const VISUAL = {
  ink: 0x061a2d,
  panel: 0x0b2944,
  panelRaised: 0x103958,
  panelDeep: 0x071d33,
  steel: 0x315474,
  text: '#fff8ea',
  muted: '#a8c0d5',
  faint: '#7894ad',
  warm: 0xf6b72c,
  copper: 0xe97832,
  success: 0x47d36f,
  rare: 0x37a9ff,
  purple: 0x9959ff,
  brass: 0xd68a2f,
  wood: 0x6a341d,
  leather: 0x4a2720,
  paper: 0xf0ddaf,
  velvet: 0x4a245c,
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
  const backWall = scene.add.rectangle(0, 0, width, height * 0.74, 0x08233a, 0.99).setOrigin(0);
  const upperGlow = scene.add.ellipse(width * 0.52, height * 0.12, width * 0.98, height * 0.62, VISUAL.rare, 0.055);
  const focalWash = scene.add.ellipse(focusX, height * 0.34, width * 0.76, height * 0.92, accent, 0.095);
  const marqueeWash = scene.add.ellipse(width * 0.22, height * 0.24, width * 0.5, height * 0.44, VISUAL.warm, 0.06);
  const coolPool = scene.add.ellipse(width * 0.76, height * 0.68, width * 0.7, height * 0.48, VISUAL.rare, 0.045);
  const floor = scene.add.rectangle(0, height * 0.73, width, height * 0.27, 0x2f211c, 0.98).setOrigin(0);
  const floorWarmth = scene.add.ellipse(width * 0.45, height * 0.95, width * 0.9, height * 0.34, VISUAL.copper, 0.05);

  const beamLeft = scene.add.rectangle(width * 0.12, height * 0.04, width * 0.06, height * 0.72, VISUAL.warm, 0.028)
    .setOrigin(0.5, 0)
    .setAngle(-7);
  const beamRight = scene.add.rectangle(width * 0.86, height * 0.02, width * 0.055, height * 0.74, VISUAL.rare, 0.032)
    .setOrigin(0.5, 0)
    .setAngle(7);
  const ceiling = scene.add.rectangle(0, height * 0.105, width, 3, 0xffffff, 0.045).setOrigin(0);
  const horizon = scene.add.rectangle(0, height * 0.735, width, 2, VISUAL.brass, 0.28).setOrigin(0);

  const bokehA = scene.add.circle(width * 0.12, height * 0.17, 8, VISUAL.warm, 0.12);
  const bokehB = scene.add.circle(width * 0.18, height * 0.12, 4, 0xffffff, 0.12);
  const bokehC = scene.add.circle(width * 0.83, height * 0.17, 7, VISUAL.rare, 0.12);
  const bokehD = scene.add.circle(width * 0.89, height * 0.12, 4, 0xffffff, 0.1);

  const leftVignette = scene.add.rectangle(0, 0, width * 0.08, height, 0x000000, 0.13).setOrigin(0);
  const rightVignette = scene.add.rectangle(width * 0.94, 0, width * 0.06, height, 0x000000, 0.1).setOrigin(0);

  return scene.add.container(0, 0, [
    base,
    backWall,
    upperGlow,
    focalWash,
    marqueeWash,
    coolPool,
    floor,
    floorWarmth,
    beamLeft,
    beamRight,
    ceiling,
    horizon,
    bokehA,
    bokehB,
    bokehC,
    bokehD,
    leftVignette,
    rightVignette,
  ]);
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
  const strokeAlpha = options.strokeAlpha ?? 0.18;
  const shadowAlpha = options.shadowAlpha ?? 0.32;

  const shadow = scene.add.rectangle(7, 9, width + 2, height + 2, 0x000000, shadowAlpha).setOrigin(0);
  const underGlow = scene.add.rectangle(-4, -4, width + 8, height + 8, accent, options.glowAlpha ?? 0.04)
    .setOrigin(0)
    .setStrokeStyle(1, accent, 0.045);
  const outerFrame = scene.add.rectangle(-1, -1, width + 2, height + 2, 0x051525, 0.96)
    .setOrigin(0)
    .setStrokeStyle(1, accent, Math.max(0.08, strokeAlpha * 0.7));
  const body = scene.add.rectangle(0, 0, width, height, fill, 0.985)
    .setOrigin(0)
    .setStrokeStyle(1, accent, strokeAlpha);

  // Material-like bevels create depth without turning every card into decorative chrome.
  const top = scene.add.rectangle(0, 0, width, options.topLine === false ? 0 : 3, accent, options.topLine === false ? 0 : 0.46).setOrigin(0);
  const leftEdge = scene.add.rectangle(0, 3, 2, Math.max(0, height - 5), 0xffffff, 0.07).setOrigin(0);
  const innerTop = scene.add.rectangle(9, 9, Math.max(0, width - 18), 1, 0xffffff, 0.1).setOrigin(0);
  const innerLeft = scene.add.rectangle(9, 10, 1, Math.max(0, height - 20), 0xffffff, 0.025).setOrigin(0);
  const bottomLip = scene.add.rectangle(8, Math.max(0, height - 9), Math.max(0, width - 16), 2, 0x000000, 0.24).setOrigin(0);
  const corner = scene.add.rectangle(width - 15, 8, 7, 2, accent, 0.2).setOrigin(0);

  return scene.add.container(x, y, [
    shadow,
    underGlow,
    outerFrame,
    body,
    top,
    leftEdge,
    innerTop,
    innerLeft,
    bottomLip,
    corner,
  ]);
}

export function addHeroStage(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: number,
  options: { fill?: number; haloAlpha?: number } = {},
): Phaser.GameObjects.Container {
  const fill = options.fill ?? 0x0a3152;
  const container = scene.add.container(x, y);
  const shadow = scene.add.rectangle(8, 10, width, height, 0x000000, 0.42);
  const halo = scene.add.ellipse(0, -height * 0.04, width * 0.88, height * 0.72, accent, options.haloAlpha ?? 0.09);
  const frame = scene.add.rectangle(0, 0, width, height, fill, 0.98).setStrokeStyle(2, accent, 0.34);
  const inner = scene.add.rectangle(0, 0, width - 14, height - 14, 0xffffff, 0.008).setStrokeStyle(1, 0xffffff, 0.045);
  const plinthShadow = scene.add.ellipse(0, height * 0.31, width * 0.58, height * 0.12, 0x000000, 0.38);
  const topLine = scene.add.rectangle(0, -height / 2 + 3, width - 18, 2, accent, 0.48);
  container.add([shadow, halo, frame, inner, plinthShadow, topLine]);
  return container;
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
  const shadow = scene.add.rectangle(1, 2, width + 2, height + 2, 0x000000, filled ? 0.28 : 0.15);
  const bg = scene.add.rectangle(0, 0, width, height, accent, filled ? 0.18 : 0.06)
    .setStrokeStyle(1, accent, filled ? 0.7 : 0.36);
  const top = scene.add.rectangle(0, -height / 2 + 1, Math.max(12, width - 8), 1, 0xffffff, filled ? 0.13 : 0.06);
  const text = scene.add.text(0, 0, label, {
    fontFamily: 'Arial, sans-serif',
    fontSize: `${options.fontSize ?? 11}px`,
    fontStyle: 'bold',
    color: options.foreground ?? '#f3ead5',
    align: 'center',
  }).setOrigin(0.5);
  return scene.add.container(x, y, [shadow, bg, top, text]);
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
  const trackShadow = scene.add.rectangle(0, 2, width, 8, 0x000000, 0.28).setOrigin(0, 0.5);
  const track = scene.add.rectangle(0, 0, width, 8, VISUAL.steel, 0.86).setOrigin(0, 0.5);
  const fill = scene.add.rectangle(0, 0, Math.max(2, width * clamped), 8, accent, 0.95).setOrigin(0, 0.5);
  const shine = scene.add.rectangle(0, -2.5, Math.max(2, width * clamped), 1, 0xffffff, 0.2).setOrigin(0, 0.5);
  return scene.add.container(x, y, [trackShadow, track, fill, shine]);
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
