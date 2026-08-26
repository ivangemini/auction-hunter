import type { LocalizedText, PlayerSave } from '../domain/types';

export type CampaignOptionalRule =
  | { type: 'avoid-branch'; branchId: string }
  | { type: 'auction-efficiency'; maxAuctions: number; minWins: number }
  | { type: 'require-branch'; branchId: string };

export interface CampaignOptionalObjectiveDefinition {
  id: string;
  missionId: string;
  title: LocalizedText;
  description: LocalizedText;
  rewardCash: number;
  rewardRep: number;
  rule: CampaignOptionalRule;
  relationship?: {
    rivalId: string;
    delta: Partial<Record<'trust' | 'rivalry' | 'debt', number>>;
  };
}

export const CAMPAIGN_OPTIONAL_OBJECTIVES: readonly CampaignOptionalObjectiveDefinition[] = [
  {
    id: 'estate-ignore-decoy',
    missionId: 'estate-linked-lots',
    title: { ru: 'Холодная голова', en: 'Cold Read' },
    description: { ru: 'Не тратьте общий бюджет на красивый ложный лот.', en: 'Do not spend the shared budget on the attractive decoy lot.' },
    rewardCash: 450,
    rewardRep: 20,
    rule: { type: 'avoid-branch', branchId: 'linked-buy:decorative-decoy' },
  },
  {
    id: 'dealer-pressure-first-try',
    missionId: 'dealer-war-pressure',
    title: { ru: 'Без второй попытки', en: 'No Second Chance Needed' },
    description: { ru: 'Выиграйте требуемый аукцион с первой попытки после старта задания.', en: 'Win the required auction on your first attempt after starting the mission.' },
    rewardCash: 700,
    rewardRep: 35,
    rule: { type: 'auction-efficiency', maxAuctions: 1, minWins: 1 },
    relationship: { rivalId: 'npc-2', delta: { rivalry: 4 } },
  },
  {
    id: 'closed-circle-precision-bid',
    missionId: 'closed-circle-sealed-bid',
    title: { ru: 'Точная ставка', en: 'Precision Bid' },
    description: { ru: 'Возьмите sealed lot ставкой 8 800 ₽ без лишней переплаты.', en: 'Take the sealed lot at 8,800 ₽ without unnecessary overpay.' },
    rewardCash: 850,
    rewardRep: 40,
    rule: { type: 'require-branch', branchId: 'circle-bid:8800' },
  },
  {
    id: 'finale-market-read-winning',
    missionId: 'lost-collection-market-read',
    title: { ru: 'Рынок прочитан', en: 'Market Read' },
    description: { ru: 'Выиграйте минимум 2 из 3 подготовительных аукционов.', en: 'Win at least 2 of the 3 preparation auctions.' },
    rewardCash: 1100,
    rewardRep: 55,
    rule: { type: 'auction-efficiency', maxAuctions: 3, minWins: 2 },
  },
  {
    id: 'finale-pressure-clean-run',
    missionId: 'lost-collection-pressure-run',
    title: { ru: 'Не кормить Антона', en: 'Starve Anton' },
    description: { ru: 'Получите 2 требуемые победы максимум за 3 аукциона.', en: 'Secure the 2 required wins within no more than 3 auctions.' },
    rewardCash: 1400,
    rewardRep: 70,
    rule: { type: 'auction-efficiency', maxAuctions: 3, minWins: 2 },
    relationship: { rivalId: 'npc-2', delta: { rivalry: 6 } },
  },
];

export function optionalObjectiveForMission(missionId: string): CampaignOptionalObjectiveDefinition | null {
  return CAMPAIGN_OPTIONAL_OBJECTIVES.find((objective) => objective.missionId === missionId) ?? null;
}

export function campaignOptionalObjectiveCompleted(
  objective: CampaignOptionalObjectiveDefinition,
  save: Readonly<PlayerSave>,
): boolean {
  if (save.campaign.branchChoiceIds.includes(`optional:${objective.id}`)) return false;

  if (objective.rule.type === 'avoid-branch') {
    return !save.campaign.branchChoiceIds.includes(objective.rule.branchId);
  }
  if (objective.rule.type === 'require-branch') {
    return save.campaign.branchChoiceIds.includes(objective.rule.branchId);
  }

  const playedBaseline = save.campaign.missionBaselineAuctionsPlayed[objective.missionId] ?? save.auctionsPlayed;
  const wonBaseline = save.campaign.missionBaselineAuctionsWon[objective.missionId] ?? save.auctionsWon;
  const played = Math.max(0, save.auctionsPlayed - playedBaseline);
  const won = Math.max(0, save.auctionsWon - wonBaseline);
  return played <= objective.rule.maxAuctions && won >= objective.rule.minWins;
}
