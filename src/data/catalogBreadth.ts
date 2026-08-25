import type { LotTemplate } from '../domain/types';
import { LOTS } from './catalog';

/**
 * Second P5 lot-breadth pack.
 * Reuses accepted semantic environment art while adding new clue/pool combinations.
 */
export const BREADTH_LOTS: readonly LotTemplate[] = [
  {
    id: 'moving-sale-35', artId: 'garage-market',
    name: { ru: 'Распродажа переезда №35', en: 'Moving Sale Unit #35' },
    location: { ru: 'Склад срочного переезда', en: 'Rush-move storage yard' },
    clues: [
      { text: { ru: 'В открытой коробке лежат старые радиодетали и экран', en: 'Old radio parts and a small screen sit in an open box' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'На стеллаже видны модели и жестяные игрушки', en: 'Models and tin toys are visible on a shelf' }, signal: { categories: ['toys'] } },
      { text: { ru: 'Под столом стоит ящик с ручным инструментом', en: 'A hand-tool crate sits beneath the table' }, signal: { categories: ['tools'] } },
    ],
    reservePrice: 400, bidIncrement: 75, itemCount: 4,
    itemPool: ['multimeter', 'portable-radio', 'pocket-tv', 'tin-car', 'model-train', 'toolbox', 'soldering-station'],
  },
  {
    id: 'club-locker-11', artId: 'garage-workshop',
    name: { ru: 'Клубный шкаф №11', en: 'Club Locker #11' },
    location: { ru: 'Подвал закрытого дома культуры', en: 'Closed community-club basement' },
    clues: [
      { text: { ru: 'На полке стоят коробки с комиксами и пластинками', en: 'Comic and record boxes line a shelf' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'В углу лежит старая портативная камера', en: 'An old portable camera rests in the corner' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'В витрине осталась небольшая заводная игрушка', en: 'A small wind-up toy remains in a display case' }, signal: { categories: ['toys'] } },
    ],
    reservePrice: 425, bidIncrement: 75, itemCount: 4,
    itemPool: ['comic-stack', 'vinyl-box', 'manual-typewriter', 'film-camera', 'instant-camera', 'tin-car', 'toy-robot'],
  },
  {
    id: 'music-estate-24', artId: 'estate-studio',
    name: { ru: 'Музыкальный архив №24', en: 'Music Estate #24' },
    location: { ru: 'Дом бывшего музыкального продюсера', en: 'Former music producer estate' },
    clues: [
      { text: { ru: 'В коробках стоят пластинки и подписанные конверты', en: 'Record boxes include signed sleeves' }, signal: { categories: ['art', 'collectibles'] } },
      { text: { ru: 'На стене свёрнуты концертные афиши', en: 'Concert posters are rolled beside the wall' }, signal: { categories: ['art'] } },
      { text: { ru: 'На столе оставлена старая портативная техника', en: 'Old portable electronics were left on the desk' }, signal: { categories: ['electronics'] } },
    ],
    reservePrice: 700, bidIncrement: 100, itemCount: 4,
    itemPool: ['vinyl-box', 'signed-vinyl', 'signed-poster', 'gallery-print', 'portable-radio', 'cassette-player', 'mini-console'],
  },
  {
    id: 'traveler-estate-12', artId: 'estate-attic',
    name: { ru: 'Архив путешественника №12', en: 'Traveler Estate #12' },
    location: { ru: 'Чердак дома коллекционера-путешественника', en: 'Attic of a collector-traveler estate' },
    clues: [
      { text: { ru: 'В кожаном футляре лежат часы и дорожные принадлежности', en: 'A leather case holds watches and travel accessories' }, signal: { categories: ['watches'] } },
      { text: { ru: 'У окна стоят бинокль и оптический чехол', en: 'Binoculars and an optical case sit by the window' }, signal: { categories: ['collectibles'] } },
      { text: { ru: 'В кофре видна старая камера', en: 'An old camera is visible inside a travel trunk' }, signal: { categories: ['electronics'] } },
    ],
    reservePrice: 725, bidIncrement: 100, itemCount: 4,
    itemPool: ['travel-clock', 'military-watch', 'chronograph-watch', 'binoculars', 'telescope', 'film-camera', 'instant-camera'],
  },
  {
    id: 'design-vault-21', artId: 'collector-gallery',
    name: { ru: 'Дизайнерский сейф №21', en: 'Design Vault #21' },
    location: { ru: 'Частный интерьерный архив', en: 'Private interiors archive' },
    clues: [
      { text: { ru: 'В витрине видны предметы яркого дизайна эпохи', en: 'Period-design pieces are visible in a display' }, signal: { categories: ['art', 'collectibles'] } },
      { text: { ru: 'Рядом лежит дорогой футляр для часов', en: 'A premium watch presentation case sits nearby' }, signal: { categories: ['watches'] } },
      { text: { ru: 'Под тканью угадывается фарфоровая фигура', en: 'A porcelain figure is visible beneath a cloth' }, signal: { itemIds: ['porcelain-figurine'] } },
    ],
    reservePrice: 1200, bidIncrement: 150, itemCount: 4,
    itemPool: ['art-deco-lamp', 'porcelain-figurine', 'fountain-pen', 'chronograph-watch', 'master-study', 'enamel-brooch', 'clockwork-automaton'],
  },
  {
    id: 'prototype-vault-7', artId: 'collector-vault',
    name: { ru: 'Прототипный сейф №7', en: 'Prototype Vault #7' },
    location: { ru: 'Закрытое хранилище промышленного дизайнера', en: 'Industrial designer private vault' },
    clues: [
      { text: { ru: 'На коробках стоят пометки «образец» и номера партий', en: 'Boxes carry sample labels and production numbers' }, signal: { itemIds: ['prototype-toy', 'preproduction-figure', 'mini-console'] } },
      { text: { ru: 'В антистатическом кейсе лежит портативная электроника', en: 'Portable electronics sit in an anti-static case' }, signal: { categories: ['electronics'] } },
      { text: { ru: 'Под стеклом виден сложный механический объект', en: 'A complex mechanical object is visible under glass' }, signal: { itemIds: ['clockwork-automaton', 'chronograph-watch'] } },
    ],
    reservePrice: 1250, bidIncrement: 150, itemCount: 4,
    itemPool: ['prototype-toy', 'preproduction-figure', 'mini-console', 'arcade-handheld', 'clockwork-automaton', 'chronograph-watch', 'pocket-watch'],
  },
];

export const ALL_LOTS: readonly LotTemplate[] = [...LOTS, ...BREADTH_LOTS];
