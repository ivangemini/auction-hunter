import Phaser from 'phaser';
import type { CampaignMission } from '../../data/campaign';
import { getPlatformLocale } from '../../platform/yandex';
import { CampaignStore } from '../campaignStore';
import { button } from '../ui';
import { VISUAL } from '../visual';
import { CampaignGatewayScene } from './CampaignGatewayScene';

type CampaignPrincipalRuntime = Phaser.Scene & {
  renderMissionActions: (mission: CampaignMission, auctionsPlayed: number, auctionsWon: number) => void;
};

/**
 * Adds the fourth principal's playable Dealer War beat without duplicating the
 * base CampaignScene mission dispatcher.
 */
export class CampaignPrincipalScene extends CampaignGatewayScene {
  private readonly principalCampaign = new CampaignStore();

  constructor() {
    super();
    const runtime = this as unknown as CampaignPrincipalRuntime;
    const renderMissionActions = runtime.renderMissionActions.bind(runtime);

    runtime.renderMissionActions = (mission, auctionsPlayed, auctionsWon) => {
      if (mission.id === 'dealer-war-nadia-archive') {
        this.renderNadiaArchiveDeal(mission);
        return;
      }
      renderMissionActions(mission, auctionsPlayed, auctionsWon);
    };
  }

  private renderNadiaArchiveDeal(mission: CampaignMission): void {
    const locale = getPlatformLocale();
    const cash = this.principalCampaign.snapshot.cash;
    const money = (value: number) => `${Math.max(0, Math.round(value)).toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽`;

    this.add.image(1090, 420, 'provenance-folder').setDisplaySize(195, 118);
    this.add.text(610, 570, locale === 'ru'
      ? 'Выбор изменит доверие/соперничество Нади и через relationship pressure повлияет на её будущие ставки.'
      : "The choice changes Nadia's trust/rivalry and therefore her future auction pressure.", {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#737b88',
      wordWrap: { width: 410 },
    });

    button(this, 704, 624, locale === 'ru' ? 'Обменяться уликой' : 'Trade a lead', () => {
      this.principalCampaign.chooseBranch('nadia-shared-lead', 'npc-6', { trust: 12, debt: -3 });
      this.principalCampaign.completeMission(mission.id);
      this.scene.restart();
    }, { width: 188, height: 54, background: 0x1f3a31, accent: VISUAL.success, fontSize: 9 });

    button(this, 910, 624, locale === 'ru' ? `Купить · ${money(900)}` : `Buy copy · ${money(900)}`, () => {
      if (!this.principalCampaign.payBranchChoice('nadia-bought-card', 900, 'npc-6', { trust: 5 })) return;
      this.principalCampaign.completeMission(mission.id);
      this.scene.restart();
    }, { width: 188, height: 54, disabled: cash < 900, background: 0x3b3020, accent: VISUAL.warm, fontSize: 9 });

    button(this, 1116, 624, locale === 'ru' ? 'Надавить' : 'Pressure her', () => {
      this.principalCampaign.chooseBranch('nadia-pressured', 'npc-6', { rivalry: 14 });
      this.principalCampaign.completeMission(mission.id);
      this.scene.restart();
    }, { width: 188, height: 54, background: 0x402829, accent: 0xc35d54, fontSize: 9 });
  }
}
