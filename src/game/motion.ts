import Phaser from 'phaser';
import { loadAccessibilityPreferences } from './preferences';

export const MOTION = {
  hoverMs: 140,
  pressMs: 75,
  settleMs: 160,
  cardEnterMs: 260,
  cardEnterStaggerMs: 55,
  selectMs: 130,
  bidPulseMs: 180,
  rivalReactMs: 220,
  revealMs: 320,
  revealSettleMs: 420,
  valueCountMs: 460,
  celebrateMs: 520,
} as const;

type StaggerTarget = Phaser.GameObjects.GameObject & {
  setAlpha: (alpha: number) => StaggerTarget;
  setY: (y: number) => StaggerTarget;
};

export function prefersReducedMotion(): boolean {
  return loadAccessibilityPreferences().reducedMotion;
}

export function enterWithStagger(
  scene: Phaser.Scene,
  target: StaggerTarget,
  baseY: number,
  index: number,
): void {
  if (prefersReducedMotion()) {
    target.setAlpha(1);
    target.setY(baseY);
    return;
  }

  target.setAlpha(0);
  target.setY(baseY + 14);
  scene.tweens.add({
    targets: target,
    alpha: 1,
    y: baseY,
    duration: MOTION.cardEnterMs,
    delay: index * MOTION.cardEnterStaggerMs,
    ease: 'Cubic.Out',
  });
}
