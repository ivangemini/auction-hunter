import Phaser from 'phaser';
import { CampaignFinaleScene } from './scenes/CampaignFinaleScene';
import { CampaignInboxScene } from './scenes/CampaignInboxScene';
import { CampaignOfficeScene } from './scenes/CampaignOfficeScene';
import { CampaignOptionalScene } from './scenes/CampaignOptionalScene';
import { CampaignPrincipalScene } from './scenes/CampaignPrincipalScene';
import { CampaignProvenanceAuctionScene } from './scenes/CampaignProvenanceAuctionScene';
import { CollectionScene } from './scenes/CollectionScene';
import { CollectorRequestBuyerMarketScene } from './scenes/CollectorRequestBuyerMarketScene';
import { DiscoveryBoardScene } from './scenes/DiscoveryBoardScene';
import { OnboardingScene } from './scenes/OnboardingScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#101216',
  scene: [OnboardingScene, CampaignPrincipalScene, CampaignInboxScene, CampaignOptionalScene, CampaignFinaleScene, CampaignProvenanceAuctionScene, CollectionScene, DiscoveryBoardScene, CollectorRequestBuyerMarketScene, CampaignOfficeScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  render: {
    antialias: true,
    pixelArt: false,
  },
};
