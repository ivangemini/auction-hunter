import type { ItemDefinition, LotTemplate } from '../domain/types';

export const ITEMS: ItemDefinition[] = [
  { id: 'toolbox', name: { ru: 'Старый ящик инструментов', en: 'Old toolbox' }, category: 'tools', rarity: 'common', baseValue: 90 },
  { id: 'cassette-player', name: { ru: 'Кассетный плеер', en: 'Cassette player' }, category: 'electronics', rarity: 'common', baseValue: 120 },
  { id: 'vinyl-box', name: { ru: 'Коробка виниловых пластинок', en: 'Box of vinyl records' }, category: 'collectibles', rarity: 'uncommon', baseValue: 260 },
  { id: 'toy-robot', name: { ru: 'Винтажный игрушечный робот', en: 'Vintage toy robot' }, category: 'toys', rarity: 'uncommon', baseValue: 340 },
  { id: 'brass-clock', name: { ru: 'Латунные настольные часы', en: 'Brass desk clock' }, category: 'watches', rarity: 'uncommon', baseValue: 390 },
  { id: 'film-camera', name: { ru: 'Плёночная камера', en: 'Film camera' }, category: 'electronics', rarity: 'rare', baseValue: 780 },
  { id: 'telescope', name: { ru: 'Любительский телескоп', en: 'Amateur telescope' }, category: 'collectibles', rarity: 'rare', baseValue: 980 },
  { id: 'signed-poster', name: { ru: 'Подписанный концертный постер', en: 'Signed concert poster' }, category: 'art', rarity: 'epic', baseValue: 1450 },
  { id: 'silver-ring', name: { ru: 'Старинное серебряное кольцо', en: 'Antique silver ring' }, category: 'collectibles', rarity: 'epic', baseValue: 1750 },
  { id: 'arcade-handheld', name: { ru: 'Редкая портативная консоль', en: 'Rare handheld console' }, category: 'electronics', rarity: 'epic', baseValue: 2100 },
  { id: 'pocket-watch', name: { ru: 'Карманные часы 1930-х', en: '1930s pocket watch' }, category: 'watches', rarity: 'legendary', baseValue: 4800 },
  { id: 'prototype-toy', name: { ru: 'Прототип коллекционной игрушки', en: 'Prototype collectible toy' }, category: 'toys', rarity: 'legendary', baseValue: 5600 },
];

export const LOTS: LotTemplate[] = [
  {
    id: 'garage-17',
    name: { ru: 'Гаражный бокс №17', en: 'Garage Locker #17' },
    location: { ru: 'Старый склад у вокзала', en: 'Old depot by the station' },
    clues: [
      { ru: 'Колесо велосипеда у двери', en: 'A bicycle wheel by the door' },
      { ru: 'Две запечатанные коробки', en: 'Two sealed cartons' },
      { ru: 'Тяжёлый деревянный футляр', en: 'A heavy wooden case' },
    ],
    reservePrice: 300,
    bidIncrement: 75,
    itemCount: 4,
    itemPool: ['toolbox', 'cassette-player', 'vinyl-box', 'toy-robot', 'film-camera', 'telescope', 'silver-ring', 'pocket-watch'],
  },
  {
    id: 'estate-42',
    name: { ru: 'Наследственный склад №42', en: 'Estate Locker #42' },
    location: { ru: 'Частное хранилище', en: 'Private storage facility' },
    clues: [
      { ru: 'Старая мебель под чехлами', en: 'Old furniture under covers' },
      { ru: 'Коробка с надписью «FRAGILE»', en: 'A box marked “FRAGILE”' },
      { ru: 'Видна полка с пластинками', en: 'A shelf of records is visible' },
    ],
    reservePrice: 450,
    bidIncrement: 100,
    itemCount: 4,
    itemPool: ['vinyl-box', 'brass-clock', 'film-camera', 'signed-poster', 'silver-ring', 'pocket-watch', 'prototype-toy'],
  },
  {
    id: 'collector-8',
    name: { ru: 'Бокс коллекционера №8', en: 'Collector Locker #8' },
    location: { ru: 'Закрытый клубный аукцион', en: 'Members-only auction house' },
    clues: [
      { ru: 'Стеллажи с аккуратными коробками', en: 'Shelves of carefully packed boxes' },
      { ru: 'Чехол от электроники 1990-х', en: 'A 1990s electronics case' },
      { ru: 'Небольшой сейф без ключа', en: 'A small safe with no key' },
    ],
    reservePrice: 700,
    bidIncrement: 125,
    itemCount: 4,
    itemPool: ['toy-robot', 'film-camera', 'telescope', 'signed-poster', 'arcade-handheld', 'pocket-watch', 'prototype-toy'],
  },
];

export const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));
