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
        alternativeItemIds: ['chronograph-watch'],
        clue: {
          ru: 'Сверить метку на военных часах или механическом хронографе.',
          en: 'Cross-check the mark on either the military watch or a mechanical chronograph.',
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
        alternativeItemIds: ['clockwork-automaton'],
        clue: {
          ru: 'Пойти по одной из двух веток: предсерийная фигурка или заводной автомат с тем же клеймом.',
          en: 'Follow either branch: the pre-production figure or a clockwork automaton carrying the same maker mark.',
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
        alternativeItemIds: ['signed-vinyl'],
        clue: {
          ru: 'Сверить подпись по редкому постеру или подписанной пластинке.',
          en: 'Cross-check the signature through either a rare poster or a signed record.',
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
  {
    id: 'black-glass-estate',
    title: { ru: 'Наследство из чёрного стекла', en: 'The Black Glass Estate' },
    premise: {
      ru: 'Несвязанные на первый взгляд предметы из богатого дома несут один и тот же инвентарный шифр и ведут к скрытой распродаже частной коллекции.',
      en: 'Unrelated objects from a wealthy estate carry the same inventory cipher and point toward a concealed private-collection dispersal.',
    },
    steps: [
      {
        itemId: 'binoculars',
        clue: {
          ru: 'Найти старый бинокль с чёрной стеклянной вставкой и первым номером описи.',
          en: 'Find the old binoculars with a black-glass insert and the first inventory number.',
        },
      },
      {
        itemId: 'porcelain-figurine',
        alternativeItemIds: ['enamel-brooch'],
        clue: {
          ru: 'Проверить одну из двух веток описи: фарфоровую статуэтку или эмалевую брошь с тем же шифром.',
          en: 'Follow either inventory branch: a porcelain figurine or an enamel brooch carrying the same cipher.',
        },
      },
      {
        itemId: 'art-deco-lamp',
        clue: {
          ru: 'Найти лампу ар-деко: её основание скрывает адрес частного оценщика.',
          en: 'Find the Art Deco lamp whose base hides the address of a private appraiser.',
        },
      },
      {
        itemId: 'silver-ring',
        alternativeItemIds: ['enamel-brooch'],
        clue: {
          ru: 'Сверить ювелирную ветку через серебряное кольцо или брошь из той же закрытой описи.',
          en: 'Cross-check the jewelry branch through the silver ring or the brooch from the same sealed inventory.',
        },
      },
      {
        itemId: 'telescope',
        clue: {
          ru: 'Замкнуть дело телескопом владельца, внутри футляра которого лежит последняя карточка коллекции.',
          en: "Close the case with the owner's telescope, whose case contains the collection's final card.",
        },
      },
    ],
    rewardCash: 4200,
    rewardReputationXp: 90,
  },
];

export const DISCOVERY_CHAIN_BY_ID = new Map(
  DISCOVERY_CHAINS.map((chain) => [chain.id, chain] as const),
);
