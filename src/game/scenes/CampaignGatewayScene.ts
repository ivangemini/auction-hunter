import { loadLocalSave } from '../save';
import { button } from '../ui';
import { VISUAL } from '../visual';
import { CampaignScene } from './CampaignScene';

export class CampaignGatewayScene extends CampaignScene {
  override create(): void {
    super.create();
    const campaign = loadLocalSave().campaign;
    const finaleUnlocked = campaign.completedMissionIds.includes('closed-circle-ledger-room');
    if (!finaleUnlocked || campaign.completed) return;

    this.add.rectangle(1112, 167, 214, 82, 0x2b2118, 0.97).setStrokeStyle(1, VISUAL.warm, 0.7);
    this.add.text(1024, 143, '05', { fontFamily: 'Arial, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#e9b949' });
    this.add.text(1024, 160, 'THE LOST COLLECTION', { fontFamily: 'Arial, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#f7f3e8' });
    this.add.text(1024, 180, 'FINAL AUCTION UNLOCKED', { fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#d6a45f' });
    button(this, 1112, 205, 'ENTER FINALE', () => this.scene.start('campaign-finale'), {
      width: 188,
      height: 30,
      background: VISUAL.warm,
      accent: 0xffd260,
      foreground: '#111318',
      fontSize: 9,
    });
  }
}
