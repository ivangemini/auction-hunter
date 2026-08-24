import Phaser from 'phaser';
import './styles.css';
import { trackEvent } from './analytics';
import { gameConfig } from './game/config';
import { installAuctionHistoryTracking } from './game/historyTracking';
import { installGameLifecycle } from './game/lifecycle';
import { applyAccessibilityPreferences } from './game/preferences';
import { t } from './i18n';
import { initializeCloudSave } from './platform/cloudSave';
import { initializePlatformLifecycle } from './platform/lifecycle';
import { getPlatformLocale, initYandexSdk } from './platform/yandex';
import type { Locale } from './domain/types';

function installBrowserGuards(): void {
  document.getElementById('game')?.addEventListener('contextmenu', (event) => event.preventDefault());
}

function localizeOrientationGuard(locale: Locale): void {
  document.documentElement.lang = locale;
  const title = document.getElementById('orientation-title');
  const body = document.getElementById('orientation-body');
  if (title) title.textContent = t(locale, 'rotateDeviceTitle');
  if (body) body.textContent = t(locale, 'rotateDeviceBody');
}

async function bootstrap(): Promise<void> {
  installBrowserGuards();
  applyAccessibilityPreferences();
  await initYandexSdk();
  const locale = getPlatformLocale();
  localizeOrientationGuard(locale);
  initializePlatformLifecycle();
  await initializeCloudSave();
  installAuctionHistoryTracking();
  trackEvent('session_started', { locale });
  const game = new Phaser.Game(gameConfig);
  installGameLifecycle(game);
}

void bootstrap();
