import Phaser from 'phaser';
import { CAMPAIGN_MISSIONS } from '../../data/campaign';
import { CAMPAIGN_OPTIONAL_OBJECTIVES } from '../../data/campaignOptionalObjectives';
import { getPlatformLocale } from '../../platform/yandex';
import { loadLocalSave } from '../save';
import { button } from '../ui';
import { addAtmosphere, addChip, addSurface, VISUAL } from '../visual';

const WIDTH = 1280;
const HEIGHT = 720;

export class CampaignOptionalScene extends Phaser.Scene {
  constructor() {
    super('campaign-optional');
  }

  create(): void {
    const locale = getPlatformLocale();
    const save = loadLocalSave();
    const activeMissionId = save.campaign.activeMissionId;

    addAtmosphere(this, WIDTH, HEIGHT, VISUAL.copper, 1080);
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x090b0e, 0.28).setOrigin(0);
    this.add.rectangle(48, 34, 6, 78, VISUAL.warm, 0.88).setOrigin(0);
    this.add.text(70, 38, locale === 'ru' ? 'ДОПОЛНИТЕЛЬНЫЕ ЦЕЛИ' : 'OPTIONAL OBJECTIVES', {
      fontFamily: 'Arial, sans-serif', fontSize: '29px', fontStyle: 'bold', color: '#f4dfad',
    });
    this.add.text(70, 78, locale === 'ru'
      ? 'Не блокируют сюжет. Выполнение даёт дополнительный капитал, REP и иногда меняет отношения.'
      : 'They never block the story. Mastery pays extra cash, REP and occasionally changes relationships.', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#9fa8b3',
    });
    button(this, 1160, 62, locale === 'ru' ? 'Назад к делу' : 'Back to case', () => this.scene.start('campaign'), {
      width: 170, height: 44, background: VISUAL.steel, accent: VISUAL.warm, fontSize: 10,
    });

    CAMPAIGN_OPTIONAL_OBJECTIVES.forEach((objective, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 58 + col * 606;
      const y = 138 + row * 174;
      const mission = CAMPAIGN_MISSIONS.find((candidate) => candidate.id === objective.missionId);
      const claimed = save.campaign.branchChoiceIds.includes(`optional:${objective.id}`);
      const missionDone = save.campaign.completedMissionIds.includes(objective.missionId);
      const active = activeMissionId === objective.missionId;
      const accent = claimed ? VISUAL.success : active ? VISUAL.warm : missionDone ? 0x6c7681 : VISUAL.copper;

      addSurface(this, x, y, 558, 146, {
        fill: claimed ? 0x15231d : 0x15191e,
        accent,
        strokeAlpha: claimed || active ? 0.5 : 0.22,
        glowAlpha: active ? 0.022 : 0.008,
      });
      this.add.text(x + 20, y + 18, objective.title[locale], {
        fontFamily: 'Arial, sans-serif', fontSize: '17px', fontStyle: 'bold', color: claimed ? '#79dfa0' : '#f5ead2',
      });
      addChip(this, x + 471, y + 28, claimed
        ? (locale === 'ru' ? 'ВЫПОЛНЕНО' : 'DONE')
        : active
          ? (locale === 'ru' ? 'АКТИВНО' : 'ACTIVE')
          : missionDone
            ? (locale === 'ru' ? 'УПУЩЕНО' : 'MISSED')
            : (locale === 'ru' ? 'ПОЗЖЕ' : 'LOCKED'), accent, { width: 116, height: 26, filled: claimed || active, fontSize: 8 });
      this.add.text(x + 20, y + 51, objective.description[locale], {
        fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#aeb5c0', wordWrap: { width: 350 }, lineSpacing: 3,
      });
      this.add.text(x + 20, y + 108, `${objective.rewardCash.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽  ·  +${objective.rewardRep} REP`, {
        fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#e9b949',
      });
      this.add.text(x + 310, y + 108, mission ? mission.title[locale] : objective.missionId, {
        fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#747e89', wordWrap: { width: 225 }, align: 'right',
      });
    });

    this.add.text(58, 668, locale === 'ru'
      ? 'Статус фиксируется один раз при закрытии соответствующей сюжетной миссии.'
      : 'Each objective is evaluated once when its linked campaign mission closes.', {
      fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#737d88',
    });
  }
}
