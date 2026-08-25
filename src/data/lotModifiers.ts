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
  {
    id: 'estate-deadline',
    name: { ru: 'Срочное закрытие наследства', en: 'Estate deadline' },
    description: { ru: 'Наследникам нужны быстрые деньги: резерв заметно ниже, но вещи хранились без особой заботы.', en: 'The heirs want a fast sale: reserve is notably lower, but the contents were stored with little care.' },
    reserveMultiplier: 0.72,
    conditionDelta: { min: -0.05, max: -0.03 },
  },
  {
    id: 'archivist-notes',
    name: { ru: 'Заметки архивиста', en: 'Archivist notes' },
    description: { ru: 'Опись выглядит многообещающе: средняя ценность выше, но продавец тоже поднял ожидания.', en: 'The inventory notes look promising: average value is higher, but the seller raised expectations too.' },
    reserveMultiplier: 1.12,
    marketMultiplier: 1.18,
  },
  {
    id: 'dusty-back-room',
    name: { ru: 'Дальний склад', en: 'Dusty back room' },
    description: { ru: 'Лот давно забыли в подсобке: цена входа ниже, состояние в среднем хуже.', en: 'The lot sat forgotten in a back room: entry price is lower, while condition trends rougher.' },
    reserveMultiplier: 0.78,
    conditionDelta: { min: -0.1, max: -0.04 },
  },
  {
    id: 'dealer-feud',
    name: { ru: 'Спор дилеров', en: 'Dealer feud' },
    description: { ru: 'Вокруг лота поднялся шум: рынок оценивает находки выше, но резерв уже отражает часть ажиотажа.', en: 'Dealer chatter surrounds the lot: finds appraise higher, but the reserve already reflects part of the hype.' },
    reserveMultiplier: 1.1,
    marketMultiplier: 1.16,
  },
  {
    id: 'sealed-storage',
    name: { ru: 'Запечатанный склад', en: 'Sealed storage' },
    description: {
      ru: 'Опись неполная: видна только одна подсказка. Внутри на один предмет больше, старт ниже, но шаг ставки вдвое крупнее.',
      en: 'The inventory is incomplete: only one clue is visible. There is one extra find, entry is cheaper, but bid steps are doubled.',
    },
    clueLimit: 1,
    itemCountDelta: 1,
    reserveMultiplier: 0.84,
    bidIncrementMultiplier: 2,
    marketMultiplier: 1.04,
  },
];
