import type { Rarity, RestorationGrade } from './types';

export type RestorationMode = 'safe' | 'pro' | 'risky';

export interface RestorationModeRules {
  targetWidthMultiplier: number;
  goodMargin: number;
  markerDurationMs: number;
  perfectConditionGain: number;
  goodConditionGain: number;
  roughConditionGain: number;
}

export const RESTORATION_MODE_RULES: Readonly<Record<RestorationMode, RestorationModeRules>> = {
  safe: {
    targetWidthMultiplier: 1.45,
    goodMargin: 0.14,
    markerDurationMs: 1100,
    perfectConditionGain: 0.16,
    goodConditionGain: 0.1,
    roughConditionGain: 0.04,
  },
  pro: {
    targetWidthMultiplier: 1,
    goodMargin: 0.12,
    markerDurationMs: 900,
    perfectConditionGain: 0.24,
    goodConditionGain: 0.14,
    roughConditionGain: 0.06,
  },
  risky: {
    targetWidthMultiplier: 0.68,
    goodMargin: 0.08,
    markerDurationMs: 720,
    perfectConditionGain: 0.34,
    goodConditionGain: 0.18,
    roughConditionGain: 0,
  },
};

export interface RestorationOutcome {
  grade: RestorationGrade;
  mode: RestorationMode;
  conditionBefore: number;
  conditionAfter: number;
  valueBefore: number;
  valueAfter: number;
  valueGain: number;
}

export function conditionValueMultiplier(condition: number): number {
  const normalized = clamp01(condition);
  return 0.4 + normalized * 0.7;
}

export function estimateItemValue(baseValue: number, condition: number, marketFactor: number): number {
  return roundToTen(baseValue * marketFactor * conditionValueMultiplier(condition));
}

export function baseRestorationTargetHalfWidth(rarity: Rarity): number {
  switch (rarity) {
    case 'common': return 0.14;
    case 'uncommon': return 0.12;
    case 'rare': return 0.105;
    case 'epic': return 0.09;
    case 'legendary': return 0.075;
  }
}

export function restorationTargetHalfWidth(baseHalfWidth: number, mode: RestorationMode): number {
  const base = Math.max(0.02, Math.min(0.25, baseHalfWidth));
  return Math.max(0.02, Math.min(0.25, base * RESTORATION_MODE_RULES[mode].targetWidthMultiplier));
}

export function applyRestoration(
  valueBefore: number,
  conditionBefore: number,
  markerPosition: number,
  targetCenter: number,
  baseTargetHalfWidth: number,
  mode: RestorationMode = 'pro',
): RestorationOutcome {
  const rules = RESTORATION_MODE_RULES[mode];
  const distance = Math.abs(clamp01(markerPosition) - clamp01(targetCenter));
  const targetHalfWidth = restorationTargetHalfWidth(baseTargetHalfWidth, mode);

  let grade: RestorationGrade;
  let conditionGain: number;

  if (distance <= targetHalfWidth) {
    grade = 'perfect';
    conditionGain = rules.perfectConditionGain;
  } else if (distance <= targetHalfWidth + rules.goodMargin) {
    grade = 'good';
    conditionGain = rules.goodConditionGain;
  } else {
    grade = 'rough';
    conditionGain = rules.roughConditionGain;
  }

  const before = clamp01(conditionBefore);
  const after = Math.min(1, before + conditionGain);
  const multiplierBefore = conditionValueMultiplier(before);
  const multiplierAfter = conditionValueMultiplier(after);
  const valueAfter = roundToTen(valueBefore * (multiplierAfter / multiplierBefore));

  return {
    grade,
    mode,
    conditionBefore: before,
    conditionAfter: after,
    valueBefore,
    valueAfter,
    valueGain: Math.max(0, valueAfter - valueBefore),
  };
}

export function roundToTen(value: number): number {
  return Math.max(10, Math.round(value / 10) * 10);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
