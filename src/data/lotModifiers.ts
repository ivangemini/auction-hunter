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
  {
    id: 'mislabelled-crate',
    name: { ru: 'Ошибочная маркировка', en: 'Mislabelled crate' },
    description: { ru: 'Лот выставили слишком дёшево из-за путаницы в описи, а рынок оценивает находки чуть выше обычного.', en: 'A catalog mix-up lowered the reserve while the finds appraise slightly above normal.' },
    reserveMultiplier: 0.85,
    marketMultiplier: 1.04,
  },
  {
    id: 'damp-storage',
    name: { ru: 'Сырой склад', en: 'Damp storage' },
    description: { ru: 'Следы сырости снижают ожидаемое состояние, зато продавец заметно уступил по резерву.', en: 'Moisture lowers expected condition, but the seller accepted a noticeably lower reserve.' },
    reserveMultiplier: 0.8,
    conditionDelta: { min: -0.08, max: -0.08 },
  },
  {
    id: 'curated-consignment',
    name: { ru: 'Кураторская подборка', en: 'Curated consignment' },
    description: { ru: 'Предметов меньше, но отбор сильнее; резерв и интерес рынка немного выше.', en: 'There are fewer finds, but the selection is stronger; reserve and market interest are both higher.' },
    itemCountDelta: -1,
    reserveMultiplier: 1.08,
    marketMultiplier: 1.22,
  },
  {
    id: 'overpacked-lot',
    name: { ru: 'Переполненный лот', en: 'Overpacked lot' },
    description: { ru: 'Внутри на одну находку больше, но продавец поднял резерв и средняя оценка чуть ниже.', en: 'The lot hides one extra find, but the seller raised the reserve and average appraisal is slightly lower.' },
    itemCountDelta: 1,
    reserveMultiplier: 1.15,
    marketMultiplier: 0.96,
  },
];
