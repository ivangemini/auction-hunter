import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { MOTION } from './motion';

const gameRoot = path.dirname(fileURLToPath(import.meta.url));
const read = (relativePath: string) => fs.readFileSync(path.join(gameRoot, relativePath), 'utf8');
const uiSource = read('ui.ts');
const auctionSource = read(path.join('scenes', 'AuctionScene.ts'));
const restorationSource = read('restorationUi.ts');

describe('P7 commercial game-feel acceptance', () => {
  it('keeps shared timing tokens inside the restrained interaction budget', () => {
    expect(MOTION.hoverMs).toBeGreaterThanOrEqual(110);
    expect(MOTION.hoverMs).toBeLessThanOrEqual(160);
    expect(MOTION.pressMs).toBeGreaterThanOrEqual(65);
    expect(MOTION.pressMs).toBeLessThanOrEqual(95);
    expect(MOTION.cardEnterMs).toBeGreaterThanOrEqual(220);
    expect(MOTION.cardEnterMs).toBeLessThanOrEqual(340);
    expect(MOTION.revealMs).toBeGreaterThanOrEqual(320);
    expect(MOTION.revealSettleMs).toBeLessThanOrEqual(520);
    expect(MOTION.celebrateMs).toBeGreaterThanOrEqual(420);
    expect(MOTION.celebrateMs).toBeLessThanOrEqual(700);
  });

  it('keeps the shared button tactile, touch-safe and reduced-motion aware', () => {
    expect(uiSource).toContain("hitTarget.on('pointerover'");
    expect(uiSource).toContain("hitTarget.on('pointerdown'");
    expect(uiSource).toContain("hitTarget.on('pointerup'");
    expect(uiSource).toContain('prefersReducedMotion()');
    expect(uiSource).toContain('scene.tweens.killTweensOf(visual)');
    expect(uiSource).toContain('const hitTarget = scene.add.rectangle');
  });

  it('keeps auction tension, reveal and value feedback wired into the core loop', () => {
    for (const method of [
      'animateBidValue(',
      'animateBidderReaction(',
      'animateWin(',
      'animateReveal(',
      'emitRevealSparks(',
      'animateAppraisalValue(',
    ]) {
      expect(auctionSource.split(method).length - 1, method).toBeGreaterThanOrEqual(2);
    }
    expect(auctionSource).toContain('MOTION.bidPulseMs');
    expect(auctionSource).toContain('MOTION.rivalReactMs');
    expect(auctionSource).toContain('MOTION.revealMs');
    expect(auctionSource).toContain('MOTION.valueCountMs');
    expect(auctionSource).toContain('if (prefersReducedMotion())');
  });

  it('keeps restoration cards staged and guards repeat input', () => {
    expect(restorationSource).toContain('enterWithStagger(scene, card, 170, index)');
    expect(restorationSource).toContain('installCardHover(scene, card, body, color)');
    expect(restorationSource).toContain('if (choicePending) return');
    expect(restorationSource).toContain('if (stopped) return');
    expect(restorationSource).toContain('if (!prefersReducedMotion())');
  });
});
