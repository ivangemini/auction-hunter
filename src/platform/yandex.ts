import type { Locale } from '../domain/types';

interface LoadingApi {
  ready(): void;
}

interface GameplayApi {
  start(): void;
  stop(): void;
}

interface RewardedVideoCallbacks {
  onOpen?: () => void;
  onRewarded?: () => void;
  onClose?: (wasShown: boolean) => void;
  onError?: (error: object) => void;
}

interface AdvApi {
  showRewardedVideo(options?: {
    callbacks?: RewardedVideoCallbacks;
  }): void;
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
  adv?: AdvApi;
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

export type RewardedAdResult = 'rewarded' | 'closed' | 'unavailable' | 'error';

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

export function showRewardedAd(onRewarded: () => void): Promise<RewardedAdResult> {
  const showRewardedVideo = sdk?.adv?.showRewardedVideo;
  if (!showRewardedVideo) return Promise.resolve('unavailable');

  const resumeGameplayAfterAd = gameplayActive;
  setGameplayActive(false);

  return new Promise((resolve) => {
    let rewarded = false;
    let rewardGranted = false;
    let settled = false;

    const finish = (result: RewardedAdResult): void => {
      if (settled) return;
      settled = true;
      if (resumeGameplayAfterAd) setGameplayActive(true);
      resolve(result);
    };

    try {
      showRewardedVideo.call(sdk?.adv, {
        callbacks: {
          onRewarded: () => {
            rewarded = true;
            if (rewardGranted) return;
            rewardGranted = true;
            onRewarded();
          },
          onClose: () => finish(rewarded ? 'rewarded' : 'closed'),
          onError: (error) => {
            console.warn('[Yandex] Rewarded video failed.', error);
            finish(rewarded ? 'rewarded' : 'error');
          },
        },
      });
    } catch (error) {
      console.warn('[Yandex] Rewarded video call failed.', error);
      finish(rewarded ? 'rewarded' : 'error');
    }
  });
}
