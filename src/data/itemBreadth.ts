import type { ItemDefinition } from '../domain/types';
import { ITEM_BY_ID, ITEMS } from './catalog';
import { ALL_LOTS } from './catalogBreadth';
import { COLLECTION_SETS, type CollectionSetDefinition } from './collections';

/**
 * Post-moderation P5 item breadth. Keep these identities stable and pair every
 * entry with direct 512x360 art plus at least one real auction/collection route.
 */
export const BREADTH_ITEMS: readonly ItemDefinition[] = [
  { id: 'slide-projector', name: { ru: 'Винтажный диапроектор', en: 'Vintage slide projector' }, category: 'electronics', rarity: 'rare', baseValue: 1020 },
  { id: 'watchmaker-tools', name: { ru: 'Набор инструментов часовщика', en: 'Watchmaker tool set' }, category: 'tools', rarity: 'rare', baseValue: 1180 },
  { id: 'field-compass', name: { ru: 'Полевой латунный компас', en: 'Brass field compass' }, category: 'collectibles', rarity: 'uncommon', baseValue: 520 },
  { id: 'tin-airplane', name: { ru: 'Жестяной заводной самолёт', en: 'Tin wind-up airplane' }, category: 'toys', rarity: 'rare', baseValue: 1250 },
  { id: 'mantel-clock', name: { ru: 'Каминные механические часы', en: 'Mechanical mantel clock' }, category: 'watches', rarity: 'epic', baseValue: 2450 },
  { id: 'numbered-lithograph', name: { ru: 'Номерная авторская литография', en: 'Numbered artist lithograph' }, category: 'art', rarity: 'epic', baseValue: 2700 },

  { id: 'pocket-calculator', name: { ru: 'Карманный калькулятор', en: 'Pocket calculator' }, category: 'electronics', rarity: 'uncommon', baseValue: 440 },
  { id: 'reel-recorder', name: { ru: 'Портативный катушечный магнитофон', en: 'Portable reel recorder' }, category: 'electronics', rarity: 'rare', baseValue: 1250 },
  { id: 'shortwave-receiver', name: { ru: 'Коротковолновый приёмник', en: 'Shortwave receiver' }, category: 'electronics', rarity: 'rare', baseValue: 720 },

  { id: 'hand-drill', name: { ru: 'Ручная механическая дрель', en: 'Hand-crank drill' }, category: 'tools', rarity: 'uncommon', baseValue: 320 },
  { id: 'micrometer-set', name: { ru: 'Набор микрометров', en: 'Micrometer set' }, category: 'tools', rarity: 'rare', baseValue: 620 },
  { id: 'bench-vise', name: { ru: 'Слесарные тиски', en: 'Bench vise' }, category: 'tools', rarity: 'uncommon', baseValue: 540 },

  { id: 'stamp-album', name: { ru: 'Альбом редких марок', en: 'Rare stamp album' }, category: 'collectibles', rarity: 'rare', baseValue: 1250 },
  { id: 'aviation-badge', name: { ru: 'Авиационный нагрудный знак', en: 'Aviation badge' }, category: 'collectibles', rarity: 'rare', baseValue: 900 },
  { id: 'brass-sextant', name: { ru: 'Латунный секстант', en: 'Brass sextant' }, category: 'collectibles', rarity: 'epic', baseValue: 2100 },

  { id: 'tin-motorcycle', name: { ru: 'Жестяной заводной мотоцикл', en: 'Tin wind-up motorcycle' }, category: 'toys', rarity: 'uncommon', baseValue: 560 },
  { id: 'wooden-puppet', name: { ru: 'Деревянная шарнирная кукла', en: 'Wooden jointed puppet' }, category: 'toys', rarity: 'rare', baseValue: 820 },
  { id: 'model-rocket', name: { ru: 'Коллекционная модель ракеты', en: 'Collector model rocket' }, category: 'toys', rarity: 'rare', baseValue: 1180 },

  { id: 'twin-bell-alarm', name: { ru: 'Механический будильник с двумя звонками', en: 'Twin-bell mechanical alarm' }, category: 'watches', rarity: 'uncommon', baseValue: 620 },
  { id: 'railway-watch', name: { ru: 'Железнодорожные карманные часы', en: 'Railway pocket watch' }, category: 'watches', rarity: 'epic', baseValue: 3100 },
  { id: 'diver-watch', name: { ru: 'Винтажные дайверские часы', en: 'Vintage diver watch' }, category: 'watches', rarity: 'epic', baseValue: 3600 },

  { id: 'etched-plate', name: { ru: 'Авторская офортная пластина', en: 'Artist etched plate' }, category: 'art', rarity: 'rare', baseValue: 1450 },
  { id: 'studio-ceramic', name: { ru: 'Студийная керамическая ваза', en: 'Studio ceramic vase' }, category: 'art', rarity: 'rare', baseValue: 1700 },
  { id: 'abstract-gouache', name: { ru: 'Абстрактная гуашь', en: 'Abstract gouache' }, category: 'art', rarity: 'epic', baseValue: 2950 },
];

/**
 * Additive goals only: existing sets are intentionally untouched so an old
 * completed/claimed set can never become incomplete after a content update.
 */
export const BREADTH_COLLECTION_SETS: readonly CollectionSetDefinition[] = [
  {
    id: 'field-workshop', name: { ru: 'Полевая мастерская', en: 'Field Workshop' },
    itemIds: ['watchmaker-tools', 'field-compass', 'mantel-clock', 'tin-airplane'], reward: 3500,
    perk: { description: { ru: '+2% к продаже инструментов, часов и игрушек', en: '+2% quick-sale value for tools, watches and toys' }, categories: ['tools', 'watches', 'toys'], resaleRateBonus: 0.02 },
  },
  {
    id: 'projection-room', name: { ru: 'Проекционный зал', en: 'Projection Room' },
    itemIds: ['slide-projector', 'numbered-lithograph', 'film-camera', 'gallery-print'], reward: 3200,
    perk: { description: { ru: '+2% к продаже электроники и искусства', en: '+2% quick-sale value for electronics and art' }, categories: ['electronics', 'art'], resaleRateBonus: 0.02 },
  },
  {
    id: 'analog-signals', name: { ru: 'Аналоговые сигналы', en: 'Analog Signals' },
    itemIds: ['pocket-calculator', 'reel-recorder', 'shortwave-receiver', 'slide-projector'], reward: 3800,
    perk: { description: { ru: '+2% к продаже электроники', en: '+2% quick-sale value for electronics' }, categories: ['electronics'], resaleRateBonus: 0.02 },
  },
  {
    id: 'tool-bench', name: { ru: 'Верстак мастера', en: 'Master Tool Bench' },
    itemIds: ['hand-drill', 'micrometer-set', 'bench-vise', 'watchmaker-tools'], reward: 3400,
    perk: { description: { ru: '+2% к продаже инструментов', en: '+2% quick-sale value for tools' }, categories: ['tools'], resaleRateBonus: 0.02 },
  },
  {
    id: 'explorer-cabinet', name: { ru: 'Кабинет исследователя', en: 'Explorer Cabinet' },
    itemIds: ['stamp-album', 'aviation-badge', 'brass-sextant', 'field-compass'], reward: 4200,
    perk: { description: { ru: '+2% к продаже коллекционных вещей', en: '+2% quick-sale value for collectibles' }, categories: ['collectibles'], resaleRateBonus: 0.02 },
  },
  {
    id: 'mechanical-playroom', name: { ru: 'Механическая игровая', en: 'Mechanical Playroom' },
    itemIds: ['tin-motorcycle', 'wooden-puppet', 'model-rocket', 'tin-airplane'], reward: 3700,
    perk: { description: { ru: '+2% к продаже игрушек', en: '+2% quick-sale value for toys' }, categories: ['toys'], resaleRateBonus: 0.02 },
  },
  {
    id: 'timekeepers-line', name: { ru: 'Линия хранителей времени', en: 'Timekeepers Line' },
    itemIds: ['twin-bell-alarm', 'railway-watch', 'diver-watch', 'mantel-clock'], reward: 4700,
    perk: { description: { ru: '+2% к продаже часов', en: '+2% quick-sale value for watches' }, categories: ['watches'], resaleRateBonus: 0.02 },
  },
  {
    id: 'atelier-archive', name: { ru: 'Архив ателье', en: 'Atelier Archive' },
    itemIds: ['etched-plate', 'studio-ceramic', 'abstract-gouache', 'numbered-lithograph'], reward: 4600,
    perk: { description: { ru: '+2% к продаже искусства', en: '+2% quick-sale value for art' }, categories: ['art'], resaleRateBonus: 0.02 },
  },
];

/** Existing clue copy remains truthful for each routed category/item. */
export const BREADTH_LOT_ROUTES: Readonly<Record<string, readonly string[]>> = {
  'slide-projector': ['photographer-studio-34'],
  'watchmaker-tools': ['repair-shop-4'],
  'field-compass': ['scholar-estate-26'],
  'tin-airplane': ['hobby-locker-22'],
  'mantel-clock': ['horology-case-5'],
  'numbered-lithograph': ['scholar-estate-26'],

  'pocket-calculator': ['radio-repair-unit-16'],
  'reel-recorder': ['music-estate-24'],
  'shortwave-receiver': ['radio-repair-unit-16'],
  'hand-drill': ['moving-sale-35'],
  'micrometer-set': ['maker-locker-41'],
  'bench-vise': ['repair-shop-4'],
  'stamp-album': ['media-vault-31'],
  'aviation-badge': ['traveler-estate-12'],
  'brass-sextant': ['traveler-estate-12'],
  'tin-motorcycle': ['toy-market-crate-9'],
  'wooden-puppet': ['hobby-locker-22'],
  'model-rocket': ['hobby-locker-22'],
  'twin-bell-alarm': ['horology-case-5'],
  'railway-watch': ['horology-case-5'],
  'diver-watch': ['mechanical-vault-18'],
  'etched-plate': ['writer-estate-33'],
  'studio-ceramic': ['collector-parlor-15'],
  'abstract-gouache': ['design-vault-21'],
};

/** Explicit and idempotent installation shared by runtime and tests. */
export function registerItemBreadth(): void {
  for (const item of BREADTH_ITEMS) {
    if (ITEM_BY_ID.has(item.id)) continue;
    ITEMS.push(item);
    ITEM_BY_ID.set(item.id, item);
  }

  for (const [itemId, lotIds] of Object.entries(BREADTH_LOT_ROUTES)) {
    if (!ITEM_BY_ID.has(itemId)) throw new Error(`Missing breadth item ${itemId}`);
    for (const lotId of lotIds) {
      const lot = ALL_LOTS.find((candidate) => candidate.id === lotId);
      if (!lot) throw new Error(`Missing breadth route lot ${lotId}`);
      if (!lot.itemPool.includes(itemId)) lot.itemPool.push(itemId);
    }
  }

  for (const set of BREADTH_COLLECTION_SETS) {
    if (!COLLECTION_SETS.some((candidate) => candidate.id === set.id)) COLLECTION_SETS.push(set);
  }
}
