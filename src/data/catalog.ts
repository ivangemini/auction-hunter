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
    id: 'garage-17', artId: 'garage-17',
    name: { ru: 'Гаражный бокс №17', en: 'Garage Locker #17' },
    location: { ru: 'Старый склад у вокзала', en: 'Old depot by the station' },
    clues: [
      { text: { ru: 'Запылённый набор ручного инструмента', en: 'A dusty set of hand tools' }, signal: { categories: ['tools'] } },
      { text: { ru: 'Из коробки торчит провод наушников', en: 'A headphone cable sticks out of a box' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'Коробка с наклейками музыкального магазина', en: 'A carton with record-store stickers' }, signal: { categories: ['collectibles'] } },
    ],
    reservePrice: 300, bidIncrement: 75, itemCount: 4,
    itemPool: ['toolbox', 'cassette-player', 'vinyl-box', 'toy-robot', 'brass-clock', 'film-camera', 'telescope'],
  },
  {
    id: 'garage-31', artId: 'garage-17',
    name: { ru: 'Мастерская №31', en: 'Workshop Locker #31' },
    location: { ru: 'Кооперативные гаражи', en: 'Co-op garage row' },
    clues: [
      { text: { ru: 'Под брезентом видны детали старой игрушки', en: 'Old toy parts show beneath a tarp' }, signal: { categories: ['toys'] } },
      { text: { ru: 'На полке лежит ремень от камеры', en: 'A camera strap rests on a shelf' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'В лотке лежит маленький заводной ключ', en: 'A small winding key sits in a tray' }, signal: { categories: ['watches'] } },
    ],
    reservePrice: 350, bidIncrement: 75, itemCount: 4,
    itemPool: ['toolbox', 'cassette-player', 'vinyl-box', 'toy-robot', 'brass-clock', 'film-camera', 'arcade-handheld'],
  },
  {
    id: 'moving-unit-6', artId: 'garage-17',
    name: { ru: 'Склад переезда №6', en: 'Moving Unit #6' },
    location: { ru: 'Городской self-storage', en: 'City self-storage' },
    clues: [
      { text: { ru: 'Подписанная коробка «КОЛЛЕКЦИЯ»', en: 'A box labeled “COLLECTION”' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'Бархатный футляр размером с часы', en: 'A velvet case sized for a clock' }, signal: { categories: ['watches'] } },
      { text: { ru: 'Сверху лежит инструкция от фототехники', en: 'A camera manual lies on top' }, signal: { categories: ['electronics'] } },
    ],
    reservePrice: 325, bidIncrement: 75, itemCount: 4,
    itemPool: ['cassette-player', 'vinyl-box', 'toy-robot', 'brass-clock', 'film-camera', 'telescope', 'silver-ring'],
  },
  {
    id: 'estate-42', artId: 'estate-42',
    name: { ru: 'Наследственный склад №42', en: 'Estate Locker #42' },
    location: { ru: 'Частное хранилище', en: 'Private storage facility' },
    clues: [
      { text: { ru: 'Видна полка с пластинками и футлярами', en: 'A shelf of records and cases is visible' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'За мебелью стоит упакованная рамка', en: 'A wrapped frame stands behind furniture' }, signal: { categories: ['art'] } },
      { text: { ru: 'На столе лежит старый футляр для часов', en: 'An old watch case rests on a table' }, signal: { categories: ['watches'] } },
    ],
    reservePrice: 500, bidIncrement: 100, itemCount: 4,
    itemPool: ['vinyl-box', 'brass-clock', 'film-camera', 'signed-poster', 'silver-ring', 'pocket-watch', 'prototype-toy'],
  },
  {
    id: 'estate-attic-9', artId: 'estate-42',
    name: { ru: 'Чердак усадьбы №9', en: 'Estate Attic #9' },
    location: { ru: 'Старый загородный дом', en: 'Old country house' },
    clues: [
      { text: { ru: 'В ящике лежат цепочки и маленькие футляры', en: 'Chains and small cases sit in a drawer' }, signal: { categories: ['watches'] } },
      { text: { ru: 'Стопка рам и свёрнутой бумаги', en: 'A stack of frames and rolled paper' }, signal: { categories: ['art'] } },
      { text: { ru: 'Тяжёлый оптический футляр у стены', en: 'A heavy optical case rests by the wall' }, signal: { categories: ['collectibles'] } },
    ],
    reservePrice: 550, bidIncrement: 100, itemCount: 4,
    itemPool: ['brass-clock', 'film-camera', 'telescope', 'signed-poster', 'silver-ring', 'pocket-watch', 'prototype-toy'],
  },
  {
    id: 'studio-estate-21', artId: 'estate-42',
    name: { ru: 'Студийный склад №21', en: 'Studio Estate #21' },
    location: { ru: 'Бывшая мастерская дизайнера', en: 'Former designer studio' },
    clues: [
      { text: { ru: 'Тубусы с постерами подписаны от руки', en: 'Poster tubes are labeled by hand' }, signal: { categories: ['art'] } },
      { text: { ru: 'В пластиковом кейсе лежат кабели и батареи', en: 'Cables and batteries fill a plastic case' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'На коробке нарисован персонаж старой игрушки', en: 'An old toy character is printed on a carton' }, signal: { categories: ['toys'] } },
    ],
    reservePrice: 600, bidIncrement: 100, itemCount: 4,
    itemPool: ['vinyl-box', 'toy-robot', 'film-camera', 'signed-poster', 'silver-ring', 'arcade-handheld', 'prototype-toy'],
  },
  {
    id: 'collector-8', artId: 'collector-8',
    name: { ru: 'Бокс коллекционера №8', en: 'Collector Locker #8' },
    location: { ru: 'Закрытый клубный аукцион', en: 'Members-only auction house' },
    clues: [
      { text: { ru: 'Чехол от электроники 1990-х', en: 'A 1990s electronics case' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'Небольшой сейф и коробка с механизмами', en: 'A small safe and a box of mechanisms' }, signal: { categories: ['watches'] } },
      { text: { ru: 'Плотный архивный тубус с биркой', en: 'A tagged archival poster tube' }, signal: { categories: ['art'] } },
    ],
    reservePrice: 800, bidIncrement: 125, itemCount: 4,
    itemPool: ['toy-robot', 'film-camera', 'telescope', 'signed-poster', 'arcade-handheld', 'pocket-watch', 'prototype-toy'],
  },
  {
    id: 'dealer-vault-3', artId: 'collector-8',
    name: { ru: 'Хранилище дилера №3', en: 'Dealer Vault #3' },
    location: { ru: 'Премиальное хранилище', en: 'Premium storage vault' },
    clues: [
      { text: { ru: 'На бархате лежит пустой футляр от часов', en: 'An empty watch case rests on velvet' }, signal: { categories: ['watches'] } },
      { text: { ru: 'Антистатический пакет с маркировкой сервиса', en: 'An anti-static service bag is visible' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'За сейфом виден край подписанной бумаги', en: 'Signed paper peeks out behind the safe' }, signal: { categories: ['art'] } },
    ],
    reservePrice: 900, bidIncrement: 150, itemCount: 4,
    itemPool: ['film-camera', 'telescope', 'signed-poster', 'silver-ring', 'arcade-handheld', 'pocket-watch', 'prototype-toy'],
  },
  {
    id: 'expo-crate-11', artId: 'collector-8',
    name: { ru: 'Выставочный ящик №11', en: 'Expo Crate #11' },
    location: { ru: 'Склад после коллекционной выставки', en: 'Post-exhibition warehouse' },
    clues: [
      { text: { ru: 'Формованный ложемент похож на упаковку игрушки', en: 'A molded insert looks like toy packaging' }, signal: { categories: ['toys'] } },
      { text: { ru: 'Защитный кейс с разъёмом питания', en: 'A protective case has a power connector' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'Оптическая труба и мягкий чехол', en: 'An optical tube and padded sleeve' }, signal: { categories: ['collectibles'] } },
    ],
    reservePrice: 1000, bidIncrement: 150, itemCount: 4,
    itemPool: ['toy-robot', 'telescope', 'signed-poster', 'silver-ring', 'arcade-handheld', 'pocket-watch', 'prototype-toy'],
  },
];

export const ITEM_BY_ID = new Map(ITEMS.map((item) => [item.id, item]));
