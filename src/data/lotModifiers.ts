import type { LotModifierDefinition } from '../domain/lotModifier';

export const LOT_MODIFIER_CHANCE = 0.22;

export const LOT_MODIFIERS: readonly LotModifierDefinition[] = [
  {
    id: 'extra-crate',
    name: { ru: 'Лишняя коробка', en: 'Extra crate' },
    description: { ru: 'В лоте на одну находку больше, но содержимое в среднем чуть менее премиальное.', en: 'The lot contains one extra find, but its contents are slightly less premium on average.' },
    itemCountDelta: 1,
    marketMultiplier: 0.92,
  },
  {
    id: 'well-kept',
    name: { ru: 'Хорошее хранение', en: 'Well kept' },
    description: { ru: 'Сухое помещение повышает ожидаемое состояние находок.', en: 'Dry storage improves the expected condition of finds.' },
    conditionDelta: { min: 0.1, max: 0.06 },
  },
  {
    id: 'rushed-clearance',
    name: { ru: 'Срочная распродажа', en: 'Rushed clearance' },
    description: { ru: 'Продавец снизил резервную цену примерно на четверть.', en: 'The seller cut the reserve price by roughly a quarter.' },
    reserveMultiplier: 0.75,
  },
  {
    id: 'collector-buzz',
    name: { ru: 'Ажиотаж коллекционеров', en: 'Collector buzz' },
    description: { ru: 'Рынок горячий: оценки выше, но конкуренты тоже это чувствуют.', en: 'The market is hot: appraisals rise, but rivals feel it too.' },
    marketMultiplier: 1.12,
  },
];
