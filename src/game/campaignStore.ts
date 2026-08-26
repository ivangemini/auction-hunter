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
import type { CampaignEpilogueId } from '../domain/campaignFinale';
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
    next.missionBaselineAuctionsPlayed[missionId] = save.auctionsPlayed;
    next.missionBaselineAuctionsWon[missionId] = save.auctionsWon;
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
    if (save.campaign.branchChoiceIds.includes(choiceId)) return;
    save.campaign = recordCampaignBranchChoice(save.campaign, choiceId);
    if (rivalId && delta) save.campaign = applyCampaignRelationshipDelta(save.campaign, rivalId, delta);
    this.persist(save);
    trackEvent('campaign_branch_chosen', { choiceId, rivalId });
  }

  payBranchChoice(
    choiceId: string,
    cost: number,
    rivalId?: string,
    delta?: Partial<Record<'trust' | 'rivalry' | 'debt', number>>,
  ): boolean {
    const save = loadLocalSave();
    if (save.campaign.branchChoiceIds.includes(choiceId)) return false;
    const amount = Math.max(0, Math.round(cost));
    if (save.cash < amount) return false;
    save.cash -= amount;
    save.campaign = recordCampaignBranchChoice(save.campaign, choiceId);
    if (rivalId && delta) save.campaign = applyCampaignRelationshipDelta(save.campaign, rivalId, delta);
    this.persist(save);
    trackEvent('campaign_branch_chosen', { choiceId, rivalId });
    return true;
  }

  resetBranchChoices(prefix: string): void {
    const save = loadLocalSave();
    save.campaign = {
      ...save.campaign,
      branchChoiceIds: save.campaign.branchChoiceIds.filter((choiceId) => !choiceId.startsWith(prefix)),
    };
    this.persist(save);
  }

  finishCampaign(epilogueId: CampaignEpilogueId, acquiredLotIds: readonly string[]): boolean {
    const save = loadLocalSave();
    if (save.campaign.completed || save.campaign.activeMissionId !== 'lost-collection-finale') return false;
    const finaleMission = campaignMissionById(CAMPAIGN_MISSIONS, 'lost-collection-finale');
    if (!finaleMission) return false;

    save.campaign = completeCampaignMission(save.campaign, finaleMission);
    save.campaign = {
      ...save.campaign,
      started: true,
      activeMissionId: null,
      completed: true,
      epilogueId,
      branchChoiceIds: [
        ...new Set([
          ...save.campaign.branchChoiceIds,
          ...acquiredLotIds.map((id) => `finale-buy:${id}`),
          `finale-epilogue:${epilogueId}`,
        ]),
      ],
    };
    save.cash += 5000;
    save.reputationXp += 300;
    save.highestCash = Math.max(save.highestCash, save.cash);
    this.persist(save);
    trackEvent('campaign_mission_completed', {
      chapterId: finaleMission.chapterId,
      missionId: finaleMission.id,
      rewardCash: 0,
      rewardRep: 0,
      evidenceIds: [],
    });
    trackEvent('campaign_branch_chosen', { choiceId: `campaign-completed:${epilogueId}` });
    return true;
  }

  private persist(save: PlayerSave): void {
    const next = writeLocalSave(save, true);
    scheduleCloudSave(next);
  }
}
