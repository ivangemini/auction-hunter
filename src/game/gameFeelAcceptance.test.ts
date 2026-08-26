import { describe, expect, it } from 'vitest';
import { MOTION } from './motion';

describe('P7 commercial game-feel timing acceptance', () => {
  it('keeps shared interaction timings inside the restrained motion budget', () => {
    expect(MOTION.hoverMs).toBeGreaterThanOrEqual(110);
    expect(MOTION.hoverMs).toBeLessThanOrEqual(160);
    expect(MOTION.pressMs).toBeGreaterThanOrEqual(65);
    expect(MOTION.pressMs).toBeLessThanOrEqual(95);
    expect(MOTION.cardEnterMs).toBeGreaterThanOrEqual(220);
    expect(MOTION.cardEnterMs).toBeLessThanOrEqual(340);
    expect(MOTION.revealMs).toBeGreaterThanOrEqual(320);
    expect(MOTION.revealSettleMs).toBeLessThanOrEqual(520);
    expect(MOTION.valueCountMs).toBeGreaterThanOrEqual(300);
    expect(MOTION.valueCountMs).toBeLessThanOrEqual(600);
    expect(MOTION.celebrateMs).toBeGreaterThanOrEqual(420);
    expect(MOTION.celebrateMs).toBeLessThanOrEqual(700);
  });
});
