import type { LocalizedText } from '../domain/types';

export interface DiscoveryChainStepDefinition {
  itemId: string;
  title: LocalizedText;
  clue: LocalizedText;
}

export interface DiscoveryChainDefinition {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  steps: DiscoveryChainStepDefinition[];
  rewardCash: number;
  rewardReputationXp: number;
  accent: number;
}

export const DISCOVERY_CHAINS: readonly DiscoveryChainDefinition[] = [
  {
    id: 'signal-in-dust',
    name: { ru: 'Сигнал в пыли', en: 'Signal in the Dust' },
    description: {
      ru: 'Серия полевых находок складывается в историю закрытого наблюдательного поста.',
      en: 'A trail of field finds points toward the story of an abandoned observation post.',
    },
    rewardCash: 3500,
    rewardReputationXp: 90,
    accent: 0x61a8ff,
    steps: [
      {
        itemId: 'portable-radio',
        title: { ru: 'Старый эфир', en: 'Old Frequency' },
        clue: { ru: 'Найди и сохрани карманное радио.', en: 'Find and keep a portable radio.' },
      },
      {
        itemId: 'binoculars',
        title: { ru: 'Наблюдатель', en: 'The Watcher' },
        clue: { ru: 'След ведёт к полевой оптике.', en: 'The trail points to field optics.' },
      },
      {
        itemId: 'military-watch',
        title: { ru: 'Отметка времени', en: 'Time Mark' },
        clue: { ru: 'Нужны часы с военной историей.', en: 'Recover a watch with military history.' },
      },
      {
        itemId: 'pocket-tv',
        title: { ru: 'Последний экран', en: 'The Last Screen' },
        clue: { ru: 'Финальная улика спрятана в карманном телевизоре.', en: 'The final clue hides in a pocket television.' },
      },
    ],
  },
  {
    id: 'missing-maker',
    name: { ru: 'Пропавший мастер', en: 'The Missing Maker' },
    description: {
      ru: 'Инструменты и механизмы ведут к мастерской автора необычного автомата.',
      en: 'Tools and mechanisms trace the workshop of an elusive automaton maker.',
    },
    rewardCash: 4500,
    rewardReputationXp: 120,
    accent: 0xe9b949,
    steps: [
      {
        itemId: 'toolbox',
        title: { ru: 'Чужой ящик', en: 'Unknown Toolbox' },
        clue: { ru: 'Сохрани старый набор инструментов.', en: 'Keep an old toolbox as the first lead.' },
      },
      {
        itemId: 'soldering-station',
        title: { ru: 'След ремонта', en: 'Repair Trace' },
        clue: { ru: 'Ищи паяльную станцию из той же эпохи.', en: 'Find a soldering station from the same era.' },
      },
      {
        itemId: 'clockwork-automaton',
        title: { ru: 'Подпись механизма', en: 'Mechanical Signature' },
        clue: { ru: 'Нужен заводной автомат с характерной механикой.', en: 'Recover a clockwork automaton with the maker’s signature mechanics.' },
      },
      {
        itemId: 'chronograph-watch',
        title: { ru: 'Последняя работа', en: 'Final Commission' },
        clue: { ru: 'Цепочка завершается механическим хронографом.', en: 'Complete the trail with a mechanical chronograph.' },
      },
    ],
  },
  {
    id: 'patrons-secret',
    name: { ru: 'Секрет мецената', en: 'The Patron’s Secret' },
    description: {
      ru: 'Книги, подписи и произведения искусства раскрывают тайную коллекцию частного покровителя.',
      en: 'Books, signatures and artworks reveal the hidden collection of a private patron.',
    },
    rewardCash: 6000,
    rewardReputationXp: 160,
    accent: 0xb576ff,
    steps: [
      {
        itemId: 'first-edition-book',
        title: { ru: 'Запись на полях', en: 'Margin Note' },
        clue: { ru: 'Первое издание содержит начальную улику.', en: 'A first-edition book contains the opening clue.' },
      },
      {
        itemId: 'fountain-pen',
        title: { ru: 'Та же рука', en: 'The Same Hand' },
        clue: { ru: 'Сохрани старую перьевую ручку.', en: 'Keep an old fountain pen tied to the note.' },
      },
      {
        itemId: 'master-study',
        title: { ru: 'Эскиз из архива', en: 'Archive Study' },
        clue: { ru: 'След ведёт к авторскому художественному этюду.', en: 'The trail points to an original artist study.' },
      },
      {
        itemId: 'signed-vinyl',
        title: { ru: 'Закрытая коллекция', en: 'Private Collection' },
        clue: { ru: 'Подписанный редкий винил закрывает досье.', en: 'A signed rare vinyl record completes the dossier.' },
      },
    ],
  },
];

export const DISCOVERY_CHAIN_BY_ID = new Map(DISCOVERY_CHAINS.map((chain) => [chain.id, chain]));
