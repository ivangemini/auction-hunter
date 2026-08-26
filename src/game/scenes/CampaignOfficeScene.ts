import { CAMPAIGN_CHAPTERS, CAMPAIGN_MISSIONS } from '../../data/campaign';
import { campaignMissionById } from '../../domain/campaign';
import { getPlatformLocale } from '../../platform/yandex';
import { GameStore } from '../store';
import { button } from '../ui';
import { addChip, addSurface, VISUAL } from '../visual';
import { OfficeScene } from './OfficeScene';

/**
 * P9 keeps every existing Office tab intact and adds the investigation command
 * surface directly to the same scene. The inherited Phaser key remains `office`.
 */
export class CampaignOfficeScene extends OfficeScene {
  private readonly campaignOfficeStore = new GameStore();

  override create(): void {
    super.create();
    this.renderCampaignCommandSurface();
  }

  private renderCampaignCommandSurface(): void {
    const locale = getPlatformLocale();
    const save = this.campaignOfficeStore.snapshot;
    const progress = save.campaign;
    const active = campaignMissionById(CAMPAIGN_MISSIONS, progress.activeMissionId)
      ?? CAMPAIGN_MISSIONS.find((mission) => !progress.completedMissionIds.includes(mission.id));
    const chapter = active ? CAMPAIGN_CHAPTERS.find((entry) => entry.id === active.chapterId) : undefined;
    const completed = progress.completedMissionIds.length;

    addSurface(this, 338, 24, 238, 88, {
      fill: 0x17130f,
      accent: progress.completed ? VISUAL.success : VISUAL.warm,
      strokeAlpha: 0.34,
      glowAlpha: 0.016,
      shadowAlpha: 0.24,
    });

    this.add.text(352, 34, locale === 'ru' ? 'ШТАБ · ЧЁРНЫЙ РЕЕСТР' : 'HQ · BLACK LEDGER', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#d6a45f',
    });
    this.add.text(352, 51, progress.completed
      ? (locale === 'ru' ? 'Дело закрыто · карьера продолжается' : 'Case closed · career continues')
      : (active?.title[locale] ?? (locale === 'ru' ? 'Начать расследование' : 'Begin investigation')), {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#f7f3e8',
      wordWrap: { width: 205 },
    });

    if (chapter && !progress.completed) {
      addChip(this, 535, 41, `${chapter.order}/5`, VISUAL.warm, { width: 46, height: 22, filled: true, fontSize: 8 });
    }
    addChip(this, 535, 63, `${completed}/${CAMPAIGN_MISSIONS.length}`, VISUAL.rare, { width: 60, height: 22, fontSize: 8 });

    button(this, 400, 91, locale === 'ru' ? 'Дело' : 'Case', () => this.scene.start('campaign'), {
      width: 102,
      height: 28,
      background: VISUAL.warm,
      accent: 0xffd260,
      foreground: '#111318',
      fontSize: 8,
      hitSlop: 4,
    });
    button(this, 514, 91, locale === 'ru' ? 'Телефон' : 'Inbox', () => this.scene.start('campaign-inbox'), {
      width: 102,
      height: 28,
      background: 0x242b31,
      accent: VISUAL.rare,
      fontSize: 8,
      hitSlop: 4,
    });
  }
}
