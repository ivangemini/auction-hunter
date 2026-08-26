import type { ItemTraitId, LocalizedText } from '../domain/types';

export interface CampaignProvenanceVariantDefinition {
  id: string;
  itemId: string;
  name: LocalizedText;
  description: LocalizedText;
  requiredTraits: readonly ItemTraitId[];
  bonusMultiplier: number;
}

/**
 * Authored P9 copy-level stories. These deliberately reuse existing randomized
 * concrete-copy traits instead of introducing a new persisted rarity/trait enum.
 * A variant is discovered only after appraisal resolves the copy's traits.
 */
export const CAMPAIGN_PROVENANCE_VARIANTS: readonly CampaignProvenanceVariantDefinition[] = [
  {
    id: 'veyr-appraisal-loupe', itemId: 'archivist-loupe', requiredTraits: ['documented-history'], bonusMultiplier: 1.06,
    name: { ru: 'Лупа оценщика Вейра', en: "Veyr Appraiser's Loupe" },
    description: { ru: 'Архивная карточка связывает эту лупу с ведомостью ликвидатора.', en: "Archive paperwork links this loupe to Veyr's liquidator inventory." },
  },
  {
    id: 'municipal-microfilm-unit', itemId: 'microfilm-reader', requiredTraits: ['matching-serials'], bonusMultiplier: 1.05,
    name: { ru: 'Архивный аппарат C-17', en: 'Archive Unit C-17' },
    description: { ru: 'Серийная табличка связывает аппарат с комнатой C-17.', en: 'The serial plate links this reader to room C-17.' },
  },
  {
    id: 'liquidator-seal-kit', itemId: 'wax-seal-box', requiredTraits: ['documented-history'], bonusMultiplier: 1.07,
    name: { ru: 'Набор печатей ликвидатора', en: "Liquidator's Seal Kit" },
    description: { ru: 'Вложенная карточка документирует использование набора при распродаже коллекции Вейра.', en: "An enclosed card documents the kit's use during the Veyr liquidation." },
  },
  {
    id: 'veyr-clearance-ledger', itemId: 'auctioneers-ledger', requiredTraits: ['documented-history'], bonusMultiplier: 1.08,
    name: { ru: 'Журнал распродажи Вейра', en: 'Veyr Clearance Ledger' },
    description: { ru: 'Поля содержат даты, совпадающие с известными распродажами Чёрного реестра.', en: 'Margin dates align with known Black Ledger clearances.' },
  },
  {
    id: 'c17-cipher-wheel', itemId: 'brass-cipher-wheel', requiredTraits: ['rare-variant'], bonusMultiplier: 1.07,
    name: { ru: 'Шифр-диск C-17', en: 'C-17 Cipher Wheel' },
    description: { ru: 'Редкая шкала содержит сектор C-17, отсутствующий на обычных экземплярах.', en: 'The rare scale includes a C-17 sector missing from standard examples.' },
  },
  {
    id: 'river-route-camera', itemId: 'expedition-camera', requiredTraits: ['matching-serials'], bonusMultiplier: 1.08,
    name: { ru: 'Камера речного маршрута', en: 'River Route Camera' },
    description: { ru: 'Номера корпуса и оптического блока совпадают с полевой ведомостью речного маршрута.', en: "Body and lens serials match the field inventory from Veyr's river route." },
  },
  {
    id: 'dock-interview-recorder', itemId: 'field-recorder', requiredTraits: ['matching-serials'], bonusMultiplier: 1.06,
    name: { ru: 'Диктофон портового интервью', en: 'Dock Interview Recorder' },
    description: { ru: 'Номера катушечного блока совпадают с архивной карточкой перевозчика.', en: "Transport-archive paperwork matches the recorder deck's serials." },
  },
  {
    id: 'liquidator-desk-scale', itemId: 'postal-scale', requiredTraits: ['matching-serials'], bonusMultiplier: 1.05,
    name: { ru: 'Весы стола ликвидатора', en: "Liquidator's Desk Scale" },
    description: { ru: 'Клеймо и номер связывают весы со столом приёма документов.', en: "The stamp and serial tie the scale to the liquidator's document desk." },
  },
  {
    id: 'estate-negative-archive', itemId: 'negative-album', requiredTraits: ['documented-history'], bonusMultiplier: 1.07,
    name: { ru: 'Негативы поместья Вейра', en: 'Veyr Estate Negatives' },
    description: { ru: 'Подписанные конверты фиксируют комнаты до разделения коллекции.', en: 'Annotated sleeves document rooms before the collection was split.' },
  },
  {
    id: 'river-survey-map-case', itemId: 'brass-map-case', requiredTraits: ['documented-history'], bonusMultiplier: 1.08,
    name: { ru: 'Футляр речной съёмки', en: 'River Survey Map Case' },
    description: { ru: 'Сохранившаяся записка отмечает тот же маршрут, что и финальный индекс.', en: 'A surviving note marks the same route as the final index.' },
  },
  {
    id: 'veyr-survey-transit', itemId: 'surveyor-transit', requiredTraits: ['matching-serials'], bonusMultiplier: 1.07,
    name: { ru: 'Теодолит экспедиции Вейра', en: 'Veyr Expedition Transit' },
    description: { ru: 'Номера прибора и футляра совпадают с полевой описью.', en: 'Instrument and case serials match the field inventory.' },
  },
  {
    id: 'black-ledger-document-case', itemId: 'lacquer-document-case', requiredTraits: ['documented-history'], bonusMultiplier: 1.09,
    name: { ru: 'Дипломат Чёрного реестра', en: 'Black Ledger Document Case' },
    description: { ru: 'Архивная карточка подтверждает, что в этом дипломате перевозили части реестра.', en: 'Archive paperwork confirms this case carried sections of the Black Ledger.' },
  },
];

export function campaignProvenanceVariantFor(
  itemId: string,
  traitIds: readonly ItemTraitId[],
): CampaignProvenanceVariantDefinition | null {
  const traits = new Set(traitIds);
  return CAMPAIGN_PROVENANCE_VARIANTS.find(
    (variant) => variant.itemId === itemId && variant.requiredTraits.every((traitId) => traits.has(traitId)),
  ) ?? null;
}

export function campaignProvenanceBonusMultiplier(itemId: string, traitIds: readonly ItemTraitId[]): number {
  const bonus = campaignProvenanceVariantFor(itemId, traitIds)?.bonusMultiplier ?? 1;
  return Number.isFinite(bonus) ? Math.max(1, Math.min(1.12, bonus)) : 1;
}
