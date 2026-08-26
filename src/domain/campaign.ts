import type { CampaignProgressState } from './types';
import { CAMPAIGN_CHAPTER_ORDER, type CampaignMission } from '../data/campaign';

export interface CampaignMissionAvailability {
  mission: CampaignMission;
  available: boolean;
  completed: boolean;
}

export function campaignMissionById(
  missions: readonly CampaignMission[],
  missionId: string | null,
): CampaignMission | null {
  return missionId ? missions.find((mission) => mission.id === missionId) ?? null : null;
}

export function campaignMissionAvailable(
  mission: CampaignMission,
  progress: Readonly<CampaignProgressState>,
): boolean {
  if (progress.completedMissionIds.includes(mission.id)) return false;
  return mission.prerequisiteMissionIds.every((id) => progress.completedMissionIds.includes(id));
}

export function campaignMissionAvailability(
  missions: readonly CampaignMission[],
  progress: Readonly<CampaignProgressState>,
): CampaignMissionAvailability[] {
  return missions.map((mission) => ({
    mission,
    available: campaignMissionAvailable(mission, progress),
    completed: progress.completedMissionIds.includes(mission.id),
  }));
}

export function nextCampaignMission(
  missions: readonly CampaignMission[],
  progress: Readonly<CampaignProgressState>,
): CampaignMission | null {
  const active = campaignMissionById(missions, progress.activeMissionId);
  if (active && !progress.completedMissionIds.includes(active.id)) return active;

  return [...missions]
    .sort((left, right) => CAMPAIGN_CHAPTER_ORDER[left.chapterId] - CAMPAIGN_CHAPTER_ORDER[right.chapterId] || left.order - right.order)
    .find((mission) => campaignMissionAvailable(mission, progress)) ?? null;
}

export function startCampaignMission(
  progress: Readonly<CampaignProgressState>,
  mission: CampaignMission,
): CampaignProgressState {
  if (!campaignMissionAvailable(mission, progress)) return cloneProgress(progress);
  return {
    ...cloneProgress(progress),
    started: true,
    activeMissionId: mission.id,
  };
}

export function completeCampaignMission(
  progress: Readonly<CampaignProgressState>,
  mission: CampaignMission,
): CampaignProgressState {
  const completedMissionIds = [...new Set([...progress.completedMissionIds, mission.id])];
  const evidenceIds = [...new Set([...progress.evidenceIds, ...(mission.evidenceRewardIds ?? [])])];
  return {
    ...cloneProgress(progress),
    started: true,
    activeMissionId: progress.activeMissionId === mission.id ? null : progress.activeMissionId,
    completedMissionIds,
    evidenceIds,
  };
}

export function applyCampaignRelationshipDelta(
  progress: Readonly<CampaignProgressState>,
  rivalId: string,
  delta: Partial<Record<'trust' | 'rivalry' | 'debt', number>>,
): CampaignProgressState {
  const next = cloneProgress(progress);
  if (delta.trust) next.relationshipTrust[rivalId] = bounded((next.relationshipTrust[rivalId] ?? 0) + delta.trust);
  if (delta.rivalry) next.relationshipRivalry[rivalId] = bounded((next.relationshipRivalry[rivalId] ?? 0) + delta.rivalry);
  if (delta.debt) next.relationshipDebt[rivalId] = bounded((next.relationshipDebt[rivalId] ?? 0) + delta.debt);
  return next;
}

export function recordCampaignBranchChoice(
  progress: Readonly<CampaignProgressState>,
  choiceId: string,
): CampaignProgressState {
  return {
    ...cloneProgress(progress),
    branchChoiceIds: [...new Set([...progress.branchChoiceIds, choiceId])],
  };
}

function cloneProgress(progress: Readonly<CampaignProgressState>): CampaignProgressState {
  return {
    ...progress,
    completedMissionIds: [...progress.completedMissionIds],
    evidenceIds: [...progress.evidenceIds],
    branchChoiceIds: [...progress.branchChoiceIds],
    missionBaselineAuctionsPlayed: { ...progress.missionBaselineAuctionsPlayed },
    missionBaselineAuctionsWon: { ...progress.missionBaselineAuctionsWon },
    relationshipTrust: { ...progress.relationshipTrust },
    relationshipRivalry: { ...progress.relationshipRivalry },
    relationshipDebt: { ...progress.relationshipDebt },
  };
}

function bounded(value: number): number {
  return Math.max(-100, Math.min(100, Math.trunc(value)));
}
