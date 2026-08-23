import Phaser from 'phaser';
import './styles.css';
import { trackEvent } from './analytics';
import { gameConfig } from './game/config';
import { getPlatformLocale, initYandexSdk } from './platform/yandex';

function installBrowserGuards(): void {
  document.getElementById('game')?.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
}

async function bootstrap(): Promise<void> {
  installBrowserGuards();
  await initYandexSdk();
  trackEvent('session_started', { locale: getPlatformLocale() });
  new Phaser.Game(gameConfig);
}

void bootstrap();
