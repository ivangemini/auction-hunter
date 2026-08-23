import Phaser from 'phaser';
import './styles.css';
import { trackEvent } from './analytics';
import { gameConfig } from './game/config';
import { initializeCloudSave } from './platform/cloudSave';
import { getPlatformLocale, initYandexSdk } from './platform/yandex';

function installBrowserGuards(): void {
  document.getElementById('game')?.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
}

async function bootstrap(): Promise<void> {
  installBrowserGuards();
  await initYandexSdk();
  await initializeCloudSave();
  trackEvent('session_started', { locale: getPlatformLocale() });
  new Phaser.Game(gameConfig);
}

void bootstrap();
