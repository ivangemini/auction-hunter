import { getPlatformLocale } from '../../platform/yandex';
import { button } from '../ui';
import { VISUAL } from '../visual';
import { CampaignScene } from './CampaignScene';

/**
 * Stable scene key adapter for the campaign hub. Chapter V lives in the normal
 * mission graph. This adapter owns secondary hub navigation so the campaign
 * rendering scene can stay focused on the current investigation/mission.
 */
export class CampaignGatewayScene extends CampaignScene {
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
  }
}
