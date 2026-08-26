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
  brass: 0xb78a3b,
  wood: 0x4a3023,
  leather: 0x3a2620,
  paper: 0xd8c7a1,
  velvet: 0x2c2235,
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
  const backWall = scene.add.rectangle(0, 0, width, height * 0.74, 0x12161b, 0.96).setOrigin(0);
  const floor = scene.add.rectangle(0, height * 0.73, width, height * 0.27, VISUAL.panelDeep, 0.96).setOrigin(0);

  // Broad pools establish warm/cool depth without filters or expensive post-processing.
  const focalWash = scene.add.ellipse(focusX, height * 0.34, width * 0.72, height * 0.92, accent, 0.052);
  const warmPool = scene.add.ellipse(width * 0.25, height * 0.88, width * 0.72, height * 0.34, VISUAL.warm, 0.018);
  const coolPool = scene.add.ellipse(width * 0.82, height * 0.84, width * 0.66, height * 0.3, VISUAL.rare, 0.012);

  // Architectural cues keep the canvas from reading as a featureless black web page.
  const beamLeft = scene.add.rectangle(width * 0.09, height * 0.1, width * 0.045, height * 0.66, 0xffffff, 0.012)
    .setOrigin(0.5, 0);
  const beamRight = scene.add.rectangle(width * 0.89, height * 0.05, width * 0.035, height * 0.72, accent, 0.018)
    .setOrigin(0.5, 0);
  const ceiling = scene.add.rectangle(0, height * 0.12, width, 2, 0xffffff, 0.025).setOrigin(0);
  const shelfA = scene.add.rectangle(0, height * 0.56, width * 0.28, 2, 0xffffff, 0.022).setOrigin(0);
  const shelfB = scene.add.rectangle(width * 0.72, height * 0.47, width * 0.28, 2, accent, 0.03).setOrigin(0);
  const horizon = scene.add.rectangle(0, height * 0.735, width, 1, accent, 0.2).setOrigin(0);

  // Restrained edge vignettes focus the play area while remaining cheap on mobile GPUs.
  const leftVignette = scene.add.rectangle(0, 0, width * 0.14, height, 0x000000, 0.2).setOrigin(0);
  const rightVignette = scene.add.rectangle(width * 0.9, 0, width * 0.1, height, 0x000000, 0.16).setOrigin(0);

  return scene.add.container(0, 0, [
    base,
    backWall,
    floor,
    focalWash,
    warmPool,
    coolPool,
    beamLeft,
    beamRight,
    ceiling,
    shelfA,
    shelfB,
    horizon,
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
  const underGlow = scene.add.rectangle(-4, -4, width + 8, height + 8, accent, options.glowAlpha ?? 0.018)
    .setOrigin(0)
    .setStrokeStyle(1, accent, 0.045);
  const outerFrame = scene.add.rectangle(-1, -1, width + 2, height + 2, 0x090b0e, 0.92)
    .setOrigin(0)
    .setStrokeStyle(1, accent, Math.max(0.08, strokeAlpha * 0.7));
  const body = scene.add.rectangle(0, 0, width, height, fill, 0.985)
    .setOrigin(0)
    .setStrokeStyle(1, accent, strokeAlpha);

  // Material-like bevels create depth without turning every card into decorative chrome.
  const top = scene.add.rectangle(0, 0, width, options.topLine === false ? 0 : 3, accent, options.topLine === false ? 0 : 0.46).setOrigin(0);
  const leftEdge = scene.add.rectangle(0, 3, 2, Math.max(0, height - 5), 0xffffff, 0.035).setOrigin(0);
  const innerTop = scene.add.rectangle(9, 9, Math.max(0, width - 18), 1, 0xffffff, 0.055).setOrigin(0);
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
  const fill = options.fill ?? VISUAL.panelDeep;
  const container = scene.add.container(x, y);
  const shadow = scene.add.rectangle(8, 10, width, height, 0x000000, 0.42);
  const halo = scene.add.ellipse(0, -height * 0.04, width * 0.88, height * 0.72, accent, options.haloAlpha ?? 0.055);
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
