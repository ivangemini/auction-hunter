import { getYandexSdk } from './yandex';

export type AdFormat = 'rewarded' | 'interstitial';
export type RewardedAdStatus = 'rewarded' | 'closed' | 'unavailable' | 'error';
export type InterstitialAdStatus = 'closed' | 'unavailable' | 'error';

export interface RewardedAdResult {
  status: RewardedAdStatus;
  wasShown: boolean;
  rewarded: boolean;
}

export interface InterstitialAdResult {
  status: InterstitialAdStatus;
  wasShown: boolean;
}

export function isAdvertisingAvailable(format: AdFormat): boolean {
  const adv = getYandexSdk()?.adv;
  return format === 'rewarded'
    ? typeof adv?.showRewardedVideo === 'function'
    : typeof adv?.showFullscreenAdv === 'function';
}

export function showRewardedAd(onRewarded: () => void): Promise<RewardedAdResult> {
  const show = getYandexSdk()?.adv?.showRewardedVideo;
  if (!show) return Promise.resolve({ status: 'unavailable', wasShown: false, rewarded: false });

  return new Promise((resolve) => {
    let settled = false;
    let wasShown = false;
    let rewarded = false;

    const finish = (status: RewardedAdStatus): void => {
      if (settled) return;
      settled = true;
      resolve({ status, wasShown, rewarded });
    };

    try {
      show({
        callbacks: {
          onOpen: () => {
            wasShown = true;
          },
          onRewarded: () => {
            if (rewarded) return;
            rewarded = true;
            onRewarded();
          },
          onClose: () => {
            finish(rewarded ? 'rewarded' : 'closed');
          },
          onError: (error) => {
            console.warn('[Ads] Rewarded ad failed.', error);
            finish(rewarded ? 'rewarded' : 'error');
          },
        },
      });
    } catch (error) {
      console.warn('[Ads] Rewarded ad call failed.', error);
      finish('error');
    }
  });
}

export function showInterstitialAd(): Promise<InterstitialAdResult> {
  const show = getYandexSdk()?.adv?.showFullscreenAdv;
  if (!show) return Promise.resolve({ status: 'unavailable', wasShown: false });

  return new Promise((resolve) => {
    let settled = false;
    let wasShown = false;

    const finish = (status: InterstitialAdStatus, shown = wasShown): void => {
      if (settled) return;
      settled = true;
      resolve({ status, wasShown: shown });
    };

    try {
      show({
        callbacks: {
          onOpen: () => {
            wasShown = true;
          },
          onClose: (shown) => {
            finish('closed', shown);
          },
          onError: (error) => {
            console.warn('[Ads] Interstitial ad failed.', error);
            finish('error');
          },
        },
      });
    } catch (error) {
      console.warn('[Ads] Interstitial ad call failed.', error);
      finish('error');
    }
  });
}
