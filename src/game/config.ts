import Phaser from 'phaser';
import { BuyerMarketScene } from './scenes/BuyerMarketScene';
import { CollectionScene } from './scenes/CollectionScene';
import { OfficeScene } from './scenes/OfficeScene';
import { OnboardingScene } from './scenes/OnboardingScene';
import { PolishedAuctionSceneV2 } from './scenes/PolishedAuctionSceneV2';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#101216',
  scene: [OnboardingScene, PolishedAuctionSceneV2, CollectionScene, BuyerMarketScene, OfficeScene],
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
