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
];

export const DISCOVERY_CHAIN_BY_ID = new Map(
  DISCOVERY_CHAINS.map((chain) => [chain.id, chain] as const),
);
