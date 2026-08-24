import type { Locale } from '../domain/types';

interface LoadingApi {
  ready(): void;
}

interface GameplayApi {
  start(): void;
  stop(): void;
}

interface FullscreenAdCallbacks {
  onOpen?: () => void;
  onClose?: (wasShown: boolean) => void;
  onError?: (error: object) => void;
}

interface RewardedAdCallbacks {
  onOpen?: () => void;
  onRewarded?: () => void;
  onClose?: (wasShown: boolean) => void;
  onError?: (error: object) => void;
}

export type StickyBannerReason = 'ADV_IS_NOT_CONNECTED' | 'UNKNOWN';

export interface StickyBannerStatus {
  stickyAdvIsShowing: boolean;
  reason?: StickyBannerReason;
}

interface AdvertisingApi {
  showFullscreenAdv(options?: { callbacks?: FullscreenAdCallbacks }): void;
  showRewardedVideo(options?: { callbacks?: RewardedAdCallbacks }): void;
  getBannerAdvStatus?(): Promise<StickyBannerStatus>;
  showBannerAdv?(): Promise<StickyBannerStatus>;
  hideBannerAdv?(): Promise<{ stickyAdvIsShowing: boolean }>;
}

export interface YandexPlayer {
  getData(keys?: string[]): Promise<Record<string, unknown>>;
  setData(data: Record<string, unknown>, flush?: boolean): Promise<void>;
  isAuthorized?(): boolean;
}

export interface YandexSdk {
  features?: {
    LoadingAPI?: LoadingApi;
    GameplayAPI?: GameplayApi;
  };
  adv?: AdvertisingApi;
  environment?: {
    i18n?: {
      lang?: string;
    };
  };
  getPlayer?(): Promise<YandexPlayer>;
  on?(event: 'game_api_pause' | 'game_api_resume', callback: () => void): void;
  off?(event: 'game_api_pause' | 'game_api_resume', callback: () => void): void;
}

interface YaGamesGlobal {
  init(): Promise<YandexSdk>;
}

declare global {
  interface Window {
    YaGames?: YaGamesGlobal;
  }
}

type GameplayActivityListener = (active: boolean) => void;

let sdk: YandexSdk | null = null;
let cachedPlayer: YandexPlayer | null = null;
let readySent = false;
let gameplayActive = false;
const gameplayActivityListeners = new Set<GameplayActivityListener>();

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

export function getYandexSdk(): YandexSdk | null {
  return sdk;
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

export function subscribeGameplayActivity(listener: GameplayActivityListener): () => void {
  gameplayActivityListeners.add(listener);
  listener(gameplayActive);
  return () => gameplayActivityListeners.delete(listener);
}

export function setGameplayActive(active: boolean): void {
  if (active === gameplayActive) return;

  if (active) {
    sdk?.features?.GameplayAPI?.start();
  } else {
    sdk?.features?.GameplayAPI?.stop();
  }

  gameplayActive = active;
  for (const listener of gameplayActivityListeners) listener(active);
}
