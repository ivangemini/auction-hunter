import Phaser from 'phaser';
import { AuctionScene } from './scenes/AuctionScene';
import { CollectionScene } from './scenes/CollectionScene';
import { OnboardingScene } from './scenes/OnboardingScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#101216',
  scene: [OnboardingScene, AuctionScene, CollectionScene],
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
