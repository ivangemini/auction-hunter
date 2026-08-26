import { CAMPAIGN_EVIDENCE, CAMPAIGN_MISSIONS } from '../data/campaign';
import { CAMPAIGN_OPTIONAL_OBJECTIVES } from '../data/campaignOptionalObjectives';
import type { CampaignProgressState } from './types';

export interface CampaignRelationPeak {
  rivalId: string;
  value: number;
}

export interface CampaignCompletionSummary {
  missionsCompleted: number;
  missionsTotal: number;
  evidenceRecovered: number;
  evidenceTotal: number;
  masteryCompleted: number;
  masteryTotal: number;
  finaleLotsRecovered: number;
  strongestAlly: CampaignRelationPeak | null;
  strongestRival: CampaignRelationPeak | null;
}

export function buildCampaignCompletionSummary(
  progress: Readonly<CampaignProgressState>,
): CampaignCompletionSummary {
  const missionIds = new Set<string>(CAMPAIGN_MISSIONS.map((mission) => mission.id));
  const evidenceIds = new Set<string>(CAMPAIGN_EVIDENCE.map((evidence) => evidence.id));
  const masteryIds = new Set<string>(CAMPAIGN_OPTIONAL_OBJECTIVES.map((objective) => `optional:${objective.id}`));
  const completedMissionIds = new Set(progress.completedMissionIds.filter((missionId) => missionIds.has(missionId)));
  const recoveredEvidenceIds = new Set(progress.evidenceIds.filter((evidenceId) => evidenceIds.has(evidenceId)));
  const completedMasteryIds = new Set(progress.branchChoiceIds.filter((choiceId) => masteryIds.has(choiceId)));
  const finaleLotIds = new Set<string>();

  for (const choiceId of progress.branchChoiceIds) {
    if (!choiceId.startsWith('finale-buy:') && !choiceId.startsWith('finale-pick:')) continue;
    const itemId = choiceId.slice(choiceId.indexOf(':') + 1);
    if (itemId) finaleLotIds.add(itemId);
  }

  return {
    missionsCompleted: completedMissionIds.size,
    missionsTotal: missionIds.size,
    evidenceRecovered: recoveredEvidenceIds.size,
    evidenceTotal: evidenceIds.size,
    masteryCompleted: completedMasteryIds.size,
    masteryTotal: masteryIds.size,
    finaleLotsRecovered: finaleLotIds.size,
    strongestAlly: strongestPositive(progress.relationshipTrust),
    strongestRival: strongestPositive(progress.relationshipRivalry),
  };
}

function strongestPositive(values: Readonly<Record<string, number>>): CampaignRelationPeak | null {
  const strongest = Object.entries(values)
    .filter(([, value]) => value > 0)
    .sort(([leftId, leftValue], [rightId, rightValue]) => rightValue - leftValue || leftId.localeCompare(rightId))[0];
  return strongest ? { rivalId: strongest[0], value: strongest[1] } : null;
}
