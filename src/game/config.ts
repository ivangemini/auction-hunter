import Phaser from 'phaser';
import { CollectionScene } from './scenes/CollectionScene';
import { DiscoveryBoardScene } from './scenes/DiscoveryBoardScene';
import { ForecastBuyerMarketScene } from './scenes/ForecastBuyerMarketScene';
import { OfficeScene } from './scenes/OfficeScene';
import { OnboardingScene } from './scenes/OnboardingScene';
import { RivalBehaviorAuctionScene } from './scenes/RivalBehaviorAuctionScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#101216',
  scene: [OnboardingScene, RivalBehaviorAuctionScene, CollectionScene, DiscoveryBoardScene, ForecastBuyerMarketScene, OfficeScene],
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
