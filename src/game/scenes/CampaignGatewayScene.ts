import { BIDDER_PROFILES } from '../../data/balance';
import { buildCampaignCompletionSummary } from '../../domain/campaignSummary';
import { getPlatformLocale } from '../../platform/yandex';
import { CampaignStore } from '../campaignStore';
import { button } from '../ui';
import { VISUAL } from '../visual';
import { CampaignScene } from './CampaignScene';

/**
 * Stable scene key adapter for the campaign hub. Chapter V lives in the normal
 * mission graph. This adapter owns secondary hub navigation so the campaign
 * rendering scene can stay focused on the current investigation/mission.
 */
export class CampaignGatewayScene extends CampaignScene {
  private readonly gatewayCampaign = new CampaignStore();

  override create(): void {
    super.create();
    const locale = getPlatformLocale();
    button(this, 644, 50, locale === 'ru' ? 'Телефон' : 'Inbox', () => this.scene.start('campaign-inbox'), {
      width: 118,
      height: 36,
      background: 0x242b31,
      accent: VISUAL.rare,
      fontSize: 9,
      hitSlop: 4,
    });
    button(this, 790, 50, locale === 'ru' ? 'Доп. цели' : 'Bonus goals', () => this.scene.start('campaign-optional'), {
      width: 128,
      height: 36,
      background: 0x30281f,
      accent: VISUAL.copper,
      fontSize: 9,
      hitSlop: 4,
    });

    const progress = this.gatewayCampaign.progress;
    if (progress.completed && progress.epilogueId) {
      const summary = buildCampaignCompletionSummary(progress);
      const ally = summary.strongestAlly
        ? BIDDER_PROFILES.find((profile) => profile.id === summary.strongestAlly?.rivalId)
        : null;
      const rival = summary.strongestRival
        ? BIDDER_PROFILES.find((profile) => profile.id === summary.strongestRival?.rivalId)
        : null;
      const relationshipParts: string[] = [];
      if (ally && summary.strongestAlly) {
        relationshipParts.push(locale === 'ru'
          ? `Союзник: ${ally.name.ru} +${summary.strongestAlly.value}`
          : `Top ally: ${ally.name.en} +${summary.strongestAlly.value}`);
      }
      if (rival && summary.strongestRival) {
        relationshipParts.push(locale === 'ru'
          ? `Соперник: ${rival.name.ru} ${summary.strongestRival.value}`
          : `Top rival: ${rival.name.en} ${summary.strongestRival.value}`);
      }

      this.add.text(610, 428, locale === 'ru' ? 'ИТОГИ ДЕЛА' : 'CASE RECORD', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#d6a45f',
      });
      this.add.text(610, 451, locale === 'ru'
        ? `Миссии ${summary.missionsCompleted}/${summary.missionsTotal}  ·  Улики ${summary.evidenceRecovered}/${summary.evidenceTotal}  ·  Мастерство ${summary.masteryCompleted}/${summary.masteryTotal}`
        : `Missions ${summary.missionsCompleted}/${summary.missionsTotal}  ·  Evidence ${summary.evidenceRecovered}/${summary.evidenceTotal}  ·  Mastery ${summary.masteryCompleted}/${summary.masteryTotal}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#d7dbe2',
        wordWrap: { width: 560 },
      });
      this.add.text(610, 480, locale === 'ru'
        ? `Финальные лоты ${summary.finaleLotsRecovered}/4${relationshipParts.length ? `  ·  ${relationshipParts.join('  ·  ')}` : ''}`
        : `Finale lots ${summary.finaleLotsRecovered}/4${relationshipParts.length ? `  ·  ${relationshipParts.join('  ·  ')}` : ''}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        color: '#9da6b1',
        wordWrap: { width: 560 },
      });

      button(this, 1036, 588, locale === 'ru' ? 'Итог дела' : 'View epilogue', () => this.scene.start('campaign-finale'), {
        width: 260,
        height: 54,
        background: VISUAL.warm,
        accent: 0xffd260,
        foreground: '#111318',
        fontSize: 12,
      });
    }
  }
}
