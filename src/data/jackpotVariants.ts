import type { ItemTraitId, LocalizedText } from '../domain/types';

export interface JackpotVariantDefinition {
  id: string;
  name: LocalizedText;
  requiredTraits: readonly ItemTraitId[];
  bonusMultiplier: number;
}

export const JACKPOT_VARIANTS: readonly JackpotVariantDefinition[] = [
  {
    id: 'archive-grade',
    name: { ru: 'Архивный экземпляр', en: 'Archive-grade copy' },
    requiredTraits: ['provenance', 'rare-variant'],
    bonusMultiplier: 1.1,
  },
  {
    id: 'sealed-first-run',
    name: { ru: 'Запечатанный ранний выпуск', en: 'Sealed first run' },
    requiredTraits: ['first-edition', 'factory-sealed'],
    bonusMultiplier: 1.1,
  },
  {
    id: 'matching-mechanical',
    name: { ru: 'Номерная механика', en: 'Matching mechanical copy' },
    requiredTraits: ['mechanical', 'matching-serials'],
    bonusMultiplier: 1.08,
  },
  {
    id: 'documented-prototype',
    name: { ru: 'Документированный прототип', en: 'Documented prototype' },
    requiredTraits: ['prototype', 'documented-history'],
    bonusMultiplier: 1.14,
  },
];

export function jackpotVariantForTraits(traitIds: readonly ItemTraitId[]): JackpotVariantDefinition | null {
  const traits = new Set(traitIds);
  return JACKPOT_VARIANTS.find((variant) => variant.requiredTraits.every((traitId) => traits.has(traitId))) ?? null;
}

export function jackpotTraitBonusMultiplier(traitIds: readonly ItemTraitId[]): number {
  const bonus = jackpotVariantForTraits(traitIds)?.bonusMultiplier ?? 1;
  return Number.isFinite(bonus) ? Math.max(1, Math.min(1.2, bonus)) : 1;
}
