import { ITEM_BY_ID } from './catalog';
import {
  DISCOVERY_CHAIN_BY_ID,
  DISCOVERY_CHAINS,
  type DiscoveryChainDefinition,
} from './discoveryChains';

/** Optional post-campaign Black Ledger cases that turn the final P9 catalog batch into endgame investigation content. */
export const CAMPAIGN_AFTERMATH_DISCOVERY_CHAINS: readonly DiscoveryChainDefinition[] = [
  {
    id: 'ledger-clearance-control',
    title: { ru: 'Контрольная ведомость', en: 'The Control Ledger' },
    premise: {
      ru: 'Ключи, жетоны и точное время показывают, что распродажи коллекции Вейра шли по заранее подготовленному графику.',
      en: "Keys, consignment tokens and exact timing show that Veyr's collection clearances followed a prepared schedule.",
    },
    steps: [
      {
        itemId: 'estate-key-register',
        clue: { ru: 'Найдите реестр, связывающий ключи с отдельными комнатами поместья.', en: 'Find the register linking individual keys to rooms in the estate.' },
      },
      {
        itemId: 'consignment-token-board',
        clue: { ru: 'Сопоставьте номера партий с доской жетонов, снятой с одного из складов.', en: 'Match the consignment sequence to the token board removed from one of the storage sites.' },
      },
      {
        itemId: 'railway-chronometer',
        clue: { ru: 'Замкните график хронометром, по которому отмечали окна отправки.', en: 'Close the schedule with the chronometer used to mark dispatch windows.' },
      },
    ],
    rewardCash: 6400,
    rewardReputationXp: 130,
  },
  {
    id: 'ledger-sealed-dispatch',
    title: { ru: 'Запечатанная отправка', en: 'The Sealed Dispatch' },
    premise: {
      ru: 'Сигнальный фонарь, шифролента и инструмент для проверки печатей раскрывают резервный речной канал перевозки.',
      en: 'A signal lantern, cipher tape and seal-checking tool expose a backup river transport channel.',
    },
    steps: [
      {
        itemId: 'river-signal-lantern',
        clue: { ru: 'Найдите фонарь с необычной последовательностью цветных заслонок.', en: 'Find the lantern with an unusual sequence of colored shutters.' },
      },
      {
        itemId: 'cipher-tape-reader',
        clue: { ru: 'Прочитайте маршрут через аппарат, настроенный на тот же ритм сигналов.', en: 'Decode the route through the reader configured to the same signal cadence.' },
      },
      {
        itemId: 'brass-seal-calipers',
        clue: { ru: 'Подтвердите подмену контейнеров по калибру сургучных и металлических печатей.', en: 'Confirm the container swap through the measured dimensions of wax and metal seals.' },
      },
    ],
    rewardCash: 6800,
    rewardReputationXp: 140,
  },
];

export function registerCampaignAftermathDiscovery(): void {
  const mutable = DISCOVERY_CHAINS as DiscoveryChainDefinition[];
  for (const chain of CAMPAIGN_AFTERMATH_DISCOVERY_CHAINS) {
    for (const step of chain.steps) {
      for (const itemId of [step.itemId, ...(step.alternativeItemIds ?? [])]) {
        if (!ITEM_BY_ID.has(itemId)) throw new Error(`Missing campaign aftermath discovery item ${chain.id}:${itemId}`);
      }
    }
    if (!mutable.some((candidate) => candidate.id === chain.id)) mutable.push(chain);
    DISCOVERY_CHAIN_BY_ID.set(chain.id, chain);
  }
}
