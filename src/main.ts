import Phaser from 'phaser';
import './styles.css';
import { gameConfig } from './game/config';
import { initYandexSdk } from './platform/yandex';

function installBrowserGuards(): void {
  document.getElementById('game')?.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
}

async function bootstrap(): Promise<void> {
  installBrowserGuards();
  await initYandexSdk();
  new Phaser.Game(gameConfig);
}

void bootstrap();
