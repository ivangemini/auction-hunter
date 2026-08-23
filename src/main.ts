import Phaser from 'phaser';
import './styles.css';
import { gameConfig } from './game/config';
import { initYandexSdk } from './platform/yandex';

async function bootstrap(): Promise<void> {
  await initYandexSdk();
  new Phaser.Game(gameConfig);
}

void bootstrap();
