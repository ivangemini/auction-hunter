import Phaser from 'phaser';
import { CampaignFinaleScene } from './scenes/CampaignFinaleScene';
import { CampaignGatewayScene } from './scenes/CampaignGatewayScene';
import { CampaignOptionalScene } from './scenes/CampaignOptionalScene';
import { CollectionScene } from './scenes/CollectionScene';
import { CollectorRequestBuyerMarketScene } from './scenes/CollectorRequestBuyerMarketScene';
import { DiscoveryBoardScene } from './scenes/DiscoveryBoardScene';
import { OfficeScene } from './scenes/OfficeScene';
import { OnboardingScene } from './scenes/OnboardingScene';
import { RivalBehaviorAuctionScene } from './scenes/RivalBehaviorAuctionScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#101216',
  scene: [OnboardingScene, CampaignGatewayScene, CampaignOptionalScene, CampaignFinaleScene, RivalBehaviorAuctionScene, CollectionScene, DiscoveryBoardScene, CollectorRequestBuyerMarketScene, OfficeScene],
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
