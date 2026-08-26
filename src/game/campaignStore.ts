import { trackEvent } from '../analytics';
import { CAMPAIGN_MISSIONS } from '../data/campaign';
import {
  applyCampaignRelationshipDelta,
  campaignMissionById,
  completeCampaignMission,
  nextCampaignMission,
  recordCampaignBranchChoice,
  startCampaignMission,
} from '../domain/campaign';
import type { CampaignProgressState, PlayerSave } from '../domain/types';
import { scheduleCloudSave } from '../platform/cloudSave';
import { loadLocalSave, writeLocalSave } from './save';

export class CampaignStore {
  get snapshot(): Readonly<PlayerSave> {
    return loadLocalSave();
  }

  get progress(): Readonly<CampaignProgressState> {
    return this.snapshot.campaign;
  }

  nextMission() {
    return nextCampaignMission(CAMPAIGN_MISSIONS, this.progress);
  }

  startMission(missionId: string): boolean {
    const save = loadLocalSave();
    const mission = campaignMissionById(CAMPAIGN_MISSIONS, missionId);
    if (!mission) return false;
    const next = startCampaignMission(save.campaign, mission);
    if (next.activeMissionId !== missionId) return false;
    save.campaign = next;
    this.persist(save);
    trackEvent('campaign_mission_started', { chapterId: mission.chapterId, missionId: mission.id });
    return true;
  }

  completeMission(missionId: string): boolean {
    const save = loadLocalSave();
    const mission = campaignMissionById(CAMPAIGN_MISSIONS, missionId);
    if (!mission || save.campaign.completedMissionIds.includes(missionId)) return false;
    save.campaign = completeCampaignMission(save.campaign, mission);
    save.cash += Math.max(0, Math.round(mission.rewardCash));
    save.reputationXp += Math.max(0, Math.round(mission.rewardRep));
    save.highestCash = Math.max(save.highestCash, save.cash);
    this.persist(save);
    trackEvent('campaign_mission_completed', {
      chapterId: mission.chapterId,
      missionId: mission.id,
      rewardCash: mission.rewardCash,
      rewardRep: mission.rewardRep,
      evidenceIds: [...(mission.evidenceRewardIds ?? [])],
    });
    return true;
  }

  chooseBranch(choiceId: string, rivalId?: string, delta?: Partial<Record<'trust' | 'rivalry' | 'debt', number>>): void {
    const save = loadLocalSave();
    save.campaign = recordCampaignBranchChoice(save.campaign, choiceId);
    if (rivalId && delta) save.campaign = applyCampaignRelationshipDelta(save.campaign, rivalId, delta);
    this.persist(save);
    trackEvent('campaign_branch_chosen', { choiceId, rivalId });
  }

  private persist(save: PlayerSave): void {
    const next = writeLocalSave(save, true);
    scheduleCloudSave(next);
  }
}
