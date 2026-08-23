import type { Locale } from '../domain/types';

interface LoadingApi {
  ready(): void;
}

interface GameplayApi {
  start(): void;
  stop(): void;
}

export interface YandexPlayer {
  getData(keys?: string[]): Promise<Record<string, unknown>>;
  setData(data: Record<string, unknown>, flush?: boolean): Promise<void>;
  isAuthorized?(): boolean;
}

interface YandexSdk {
  features?: {
    LoadingAPI?: LoadingApi;
    GameplayAPI?: GameplayApi;
  };
  environment?: {
    i18n?: {
      lang?: string;
    };
  };
  getPlayer?(): Promise<YandexPlayer>;
}

interface YaGamesGlobal {
  init(): Promise<YandexSdk>;
}

declare global {
  interface Window {
    YaGames?: YaGamesGlobal;
  }
}

let sdk: YandexSdk | null = null;
let cachedPlayer: YandexPlayer | null = null;
let readySent = false;
let gameplayActive = false;

export async function initYandexSdk(): Promise<void> {
  if (!window.YaGames) {
    console.info('[Yandex] SDK unavailable; running in local fallback mode.');
    return;
  }

  try {
    sdk = await window.YaGames.init();
  } catch (error) {
    console.error('[Yandex] SDK initialization failed.', error);
  }
}

export async function getYandexPlayer(): Promise<YandexPlayer | null> {
  if (cachedPlayer) return cachedPlayer;
  if (!sdk?.getPlayer) return null;

  try {
    cachedPlayer = await sdk.getPlayer();
    return cachedPlayer;
  } catch (error) {
    console.warn('[Yandex] Player initialization failed; cloud save disabled for this session.', error);
    return null;
  }
}

export function getPlatformLocale(): Locale {
  const language = sdk?.environment?.i18n?.lang?.toLowerCase();
  return language?.startsWith('ru') ? 'ru' : 'en';
}

export function markGameReady(): void {
  if (readySent) return;
  sdk?.features?.LoadingAPI?.ready();
  readySent = true;
}

export function setGameplayActive(active: boolean): void {
  if (active === gameplayActive) return;

  if (active) {
    sdk?.features?.GameplayAPI?.start();
  } else {
    sdk?.features?.GameplayAPI?.stop();
  }

  gameplayActive = active;
}
