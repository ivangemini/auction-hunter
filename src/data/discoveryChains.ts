import type { LocalizedText } from '../domain/types';

export interface DiscoveryChainStep {
  itemId: string;
  alternativeItemIds?: readonly string[];
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

export function discoveryStepItemIds(step: DiscoveryChainStep): readonly string[] {
  return [step.itemId, ...(step.alternativeItemIds ?? [])];
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
        alternativeItemIds: ['wristwatch'],
        clue: {
          ru: 'Сверить метку на военных или других механических наручных часах.',
          en: 'Cross-check the mark on a military or another mechanical wristwatch.',
        },
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
        alternativeItemIds: ['prototype-robot'],
        clue: {
          ru: 'Пойти по одной из двух веток: предсерийная фигурка или ранний робот с тем же клеймом.',
          en: 'Follow either branch: a pre-production figure or an early robot carrying the same maker mark.',
        },
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
        alternativeItemIds: ['signed-photo'],
        clue: {
          ru: 'Сверить подпись по редкому постеру или подписанной фотографии.',
          en: 'Cross-check the signature through either a rare poster or a signed photograph.',
        },
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
        itemId: 'portable-radio',
        clue: { ru: 'Сопоставить номер с переносным радиоприёмником.', en: 'Match the number to a portable radio.' },
      },
      {
        itemId: 'pocket-tv',
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
        alternativeItemIds: ['precision-caliper'],
        clue: {
          ru: 'Продолжить через измеритель или точный штангенциркуль с теми же отметками.',
          en: 'Continue through either the multimeter or precision caliper carrying the same marks.',
        },
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
        alternativeItemIds: ['annotated-manuscript'],
        clue: {
          ru: 'Выбрать ветку архива: первое издание или рукопись с тем же почерком.',
          en: 'Follow either archive branch: a first edition or an annotated manuscript in the same hand.',
        },
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
