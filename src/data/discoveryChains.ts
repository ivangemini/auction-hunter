import type { LocalizedText } from '../domain/types';

export interface DiscoveryChainStep {
  itemId: string;
  clue: LocalizedText;
}

export interface DiscoveryChainDefinition {
  id: string;
  title: LocalizedText;
  premise: LocalizedText;
  steps: readonly DiscoveryChainStep[];
  rewardCash: number;
  rewardReputationXp: number;
}

export const DISCOVERY_CHAINS: readonly DiscoveryChainDefinition[] = [
  {
    id: 'watchmaker-ledger',
    title: { ru: 'Книга часовщика', en: "The Watchmaker's Ledger" },
    premise: {
      ru: 'Повторяющаяся мастерская метка связывает часы из разных распродаж.',
      en: 'A recurring workshop mark links watches from unrelated auctions.',
    },
    steps: [
      {
        itemId: 'travel-clock',
        clue: { ru: 'Найти дорожные часы с первой меткой.', en: 'Find the travel clock carrying the first mark.' },
      },
      {
        itemId: 'military-watch',
        clue: { ru: 'Сопоставить метку с военными часами.', en: 'Match the mark to a military wristwatch.' },
      },
      {
        itemId: 'pocket-watch',
        clue: { ru: 'Замкнуть историю редкими карманными часами.', en: 'Close the trail with the rare pocket watch.' },
      },
    ],
    rewardCash: 1800,
    rewardReputationXp: 45,
  },
  {
    id: 'prototype-trail',
    title: { ru: 'След прототипа', en: 'Prototype Trail' },
    premise: {
      ru: 'Серийные игрушки ведут к ранним образцам исчезнувшего производителя.',
      en: 'Production toys point toward early samples from a vanished maker.',
    },
    steps: [
      {
        itemId: 'tin-car',
        clue: { ru: 'Начать с необычной заводной машинки.', en: 'Start with the unusual wind-up car.' },
      },
      {
        itemId: 'preproduction-figure',
        clue: { ru: 'Найти предсерийную фигурку с тем же клеймом.', en: 'Find the pre-production figure with the same maker mark.' },
      },
      {
        itemId: 'prototype-toy',
        clue: { ru: 'Добраться до настоящего коллекционного прототипа.', en: 'Reach the genuine collectible prototype.' },
      },
    ],
    rewardCash: 2200,
    rewardReputationXp: 55,
  },
  {
    id: 'lost-master-study',
    title: { ru: 'Потерянный этюд', en: 'The Lost Study' },
    premise: {
      ru: 'Номерные отпечатки и подписи складываются в происхождение неизвестного этюда.',
      en: 'Numbered prints and signatures build a provenance trail toward a missing study.',
    },
    steps: [
      {
        itemId: 'gallery-print',
        clue: { ru: 'Зацепиться за номерной галерейный принт.', en: 'Pick up the trail from a numbered gallery print.' },
      },
      {
        itemId: 'signed-poster',
        clue: { ru: 'Сверить подпись с редким концертным постером.', en: 'Cross-check the signature on a rare concert poster.' },
      },
      {
        itemId: 'master-study',
        clue: { ru: 'Подтвердить происхождение этюдом мастера.', en: 'Confirm the provenance with the master artist study.' },
      },
    ],
    rewardCash: 2800,
    rewardReputationXp: 65,
  },
  {
    id: 'dead-air-broadcast',
    title: { ru: 'Мёртвый эфир', en: 'Dead Air Broadcast' },
    premise: {
      ru: 'Одинаковая сервисная наклейка всплывает на технике из трёх разных складов.',
      en: 'The same service sticker keeps appearing on electronics from three unrelated storage lots.',
    },
    steps: [
      {
        itemId: 'cassette-player',
        clue: { ru: 'Найти кассетный плеер с выцветшим номером мастерской.', en: 'Find the cassette player with a faded workshop number.' },
      },
      {
        itemId: 'pocket-radio',
        clue: { ru: 'Сопоставить номер с карманным радиоприёмником.', en: 'Match the number to a pocket radio.' },
      },
      {
        itemId: 'pocket-television',
        clue: { ru: 'Закрыть цепочку редким карманным телевизором.', en: 'Finish the broadcast trail with the pocket television.' },
      },
    ],
    rewardCash: 2100,
    rewardReputationXp: 50,
  },
  {
    id: 'workshop-estate',
    title: { ru: 'Мастерская без хозяина', en: 'The Abandoned Workshop' },
    premise: {
      ru: 'Набор меток владельца ведёт от обычного инструмента к профессиональному рабочему месту.',
      en: 'A set of owner marks leads from ordinary tools toward a complete professional workbench.',
    },
    steps: [
      {
        itemId: 'toolbox',
        clue: { ru: 'Начать со старого ящика с выгравированными инициалами.', en: 'Start with the old toolbox carrying engraved initials.' },
      },
      {
        itemId: 'multimeter',
        clue: { ru: 'Найти измеритель с теми же отметками ремонта.', en: 'Find the multimeter with matching repair marks.' },
      },
      {
        itemId: 'soldering-station',
        clue: { ru: 'Найти главный предмет мастерской — паяльную станцию.', en: 'Locate the workshop centerpiece: the soldering station.' },
      },
    ],
    rewardCash: 2000,
    rewardReputationXp: 48,
  },
  {
    id: 'estate-correspondence',
    title: { ru: 'Последнее письмо', en: 'The Last Letter' },
    premise: {
      ru: 'Письменные принадлежности и книга из разных лотов указывают на архив одного владельца.',
      en: 'Writing tools and a book from separate auctions point back to one private archive.',
    },
    steps: [
      {
        itemId: 'fountain-pen',
        clue: { ru: 'Найти перьевую ручку с личной гравировкой.', en: 'Find the fountain pen with a personal engraving.' },
      },
      {
        itemId: 'first-edition-book',
        clue: { ru: 'Отыскать первое издание с заметкой тем же почерком.', en: 'Locate the first-edition book annotated in the same hand.' },
      },
      {
        itemId: 'manual-typewriter',
        clue: { ru: 'Завершить архив печатной машинкой владельца.', en: "Complete the archive with the owner's manual typewriter." },
      },
    ],
    rewardCash: 2500,
    rewardReputationXp: 60,
  },
];

export const DISCOVERY_CHAIN_BY_ID = new Map(
  DISCOVERY_CHAINS.map((chain) => [chain.id, chain] as const),
);
