import type { RestorationGrade } from '../domain/types';

export interface RestorationOutcome {
  grade: RestorationGrade;
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

export function applyRestoration(
  valueBefore: number,
  conditionBefore: number,
  markerPosition: number,
  targetCenter: number,
  targetHalfWidth: number,
): RestorationOutcome {
  const distance = Math.abs(clamp01(markerPosition) - clamp01(targetCenter));
  const safeHalfWidth = Math.max(0.02, Math.min(0.25, targetHalfWidth));

  let grade: RestorationGrade;
  let conditionGain: number;

  if (distance <= safeHalfWidth) {
    grade = 'perfect';
    conditionGain = 0.24;
  } else if (distance <= safeHalfWidth + 0.12) {
    grade = 'good';
    conditionGain = 0.14;
  } else {
    grade = 'rough';
    conditionGain = 0.06;
  }

  const before = clamp01(conditionBefore);
  const after = Math.min(1, before + conditionGain);
  const multiplierBefore = conditionValueMultiplier(before);
  const multiplierAfter = conditionValueMultiplier(after);
  const valueAfter = roundToTen(valueBefore * (multiplierAfter / multiplierBefore));

  return {
    grade,
    conditionBefore: before,
    conditionAfter: after,
    valueBefore,
    valueAfter,
    valueGain: Math.max(0, valueAfter - valueBefore),
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function roundToTen(value: number): number {
  return Math.max(10, Math.round(value / 10) * 10);
}
