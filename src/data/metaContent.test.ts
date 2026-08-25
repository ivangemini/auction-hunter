import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, DAILY_CONTRACT_POOL, dailyContractsForDay } from './meta';

describe('meta goal breadth', () => {
  it('ships ten daily contract variants and sixteen achievements', () => {
    expect(DAILY_CONTRACT_POOL).toHaveLength(10);
    expect(ACHIEVEMENTS).toHaveLength(16);
    expect(new Set(DAILY_CONTRACT_POOL.map((contract) => contract.id)).size).toBe(10);
    expect(new Set(ACHIEVEMENTS.map((achievement) => achievement.id)).size).toBe(16);
  });

  it('selects three deterministic contracts with distinct behavior metrics', () => {
    for (const dayKey of ['2026-08-24', '2026-08-25', '2026-08-26', '2026-09-01', '2026-12-31']) {
      const first = dailyContractsForDay(dayKey);
      const second = dailyContractsForDay(dayKey);
      expect(first, dayKey).toEqual(second);
      expect(first, dayKey).toHaveLength(3);
      expect(new Set(first.map((contract) => contract.metric)).size, dayKey).toBe(3);
    }
  });

  it('keeps all authored goals bilingual and economically positive', () => {
    for (const contract of DAILY_CONTRACT_POOL) {
      expect(contract.title.ru.length, contract.id).toBeGreaterThan(0);
      expect(contract.title.en.length, contract.id).toBeGreaterThan(0);
      expect(contract.description.ru.length, contract.id).toBeGreaterThan(0);
      expect(contract.description.en.length, contract.id).toBeGreaterThan(0);
      expect(contract.target, contract.id).toBeGreaterThan(0);
      expect(contract.reward, contract.id).toBeGreaterThan(0);
    }
    for (const achievement of ACHIEVEMENTS) {
      expect(achievement.title.ru.length, achievement.id).toBeGreaterThan(0);
      expect(achievement.title.en.length, achievement.id).toBeGreaterThan(0);
      expect(achievement.description.ru.length, achievement.id).toBeGreaterThan(0);
      expect(achievement.description.en.length, achievement.id).toBeGreaterThan(0);
      expect(achievement.target, achievement.id).toBeGreaterThan(0);
      expect(achievement.reward, achievement.id).toBeGreaterThan(0);
    }
  });

  it('offers more than one difficulty tier for each daily contract metric', () => {
    const counts = new Map<string, number>();
    for (const contract of DAILY_CONTRACT_POOL) {
      counts.set(contract.metric, (counts.get(contract.metric) ?? 0) + 1);
    }
    expect([...counts.values()].every((count) => count >= 2)).toBe(true);
  });
});
