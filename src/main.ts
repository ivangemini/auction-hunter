import Phaser from 'phaser';
import './styles.css';
import { trackEvent } from './analytics';
import { gameConfig } from './game/config';
import { installGameLifecycle } from './game/lifecycle';
import { initializeCloudSave } from './platform/cloudSave';
import { initializePlatformLifecycle } from './platform/lifecycle';
import { getPlatformLocale, initYandexSdk } from './platform/yandex';

function installBrowserGuards(): void {
  document.getElementById('game')?.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
}

async function bootstrap(): Promise<void> {
  installBrowserGuards();
  await initYandexSdk();
  initializePlatformLifecycle();
  await initializeCloudSave();
  trackEvent('session_started', { locale: getPlatformLocale() });
  const game = new Phaser.Game(gameConfig);
  installGameLifecycle(game);
}

void bootstrap();
