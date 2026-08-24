import {
  getYandexSdk,
  subscribeGameplayActivity,
  type StickyBannerReason,
  type StickyBannerStatus,
} from './yandex';

export type AdFormat = 'rewarded' | 'interstitial' | 'sticky';
export type RewardedAdStatus = 'rewarded' | 'closed' | 'unavailable' | 'error';
export type InterstitialAdStatus = 'closed' | 'unavailable' | 'error';
export type StickyBannerResultStatus = 'shown' | 'hidden' | 'unavailable' | 'error';

export interface RewardedAdResult {
  status: RewardedAdStatus;
  wasShown: boolean;
  rewarded: boolean;
}

export interface InterstitialAdResult {
  status: InterstitialAdStatus;
  wasShown: boolean;
}

export interface StickyBannerResult {
  status: StickyBannerResultStatus;
  stickyAdvIsShowing: boolean;
  reason?: StickyBannerReason;
}

let stickyBannerPolicyInstalled = false;
let stickyBannerQueue: Promise<void> = Promise.resolve();

export function isAdvertisingAvailable(format: AdFormat): boolean {
  const adv = getYandexSdk()?.adv;
  if (format === 'rewarded') return typeof adv?.showRewardedVideo === 'function';
  if (format === 'interstitial') return typeof adv?.showFullscreenAdv === 'function';
  return typeof adv?.showBannerAdv === 'function' && typeof adv?.hideBannerAdv === 'function';
}

function normalizeStickyBannerResult(
  visibleRequested: boolean,
  result: StickyBannerStatus | { stickyAdvIsShowing: boolean },
): StickyBannerResult {
  const reason = 'reason' in result ? result.reason : undefined;

  if (result.stickyAdvIsShowing) {
    return { status: 'shown', stickyAdvIsShowing: true, reason };
  }
  if (!visibleRequested) {
    return { status: 'hidden', stickyAdvIsShowing: false, reason };
  }
  if (reason === 'ADV_IS_NOT_CONNECTED') {
    return { status: 'unavailable', stickyAdvIsShowing: false, reason };
  }
  if (reason === 'UNKNOWN') {
    return { status: 'error', stickyAdvIsShowing: false, reason };
  }
  return { status: 'hidden', stickyAdvIsShowing: false };
}

async function applyStickyBannerVisibility(visible: boolean): Promise<StickyBannerResult> {
  const adv = getYandexSdk()?.adv;
  const method = visible ? adv?.showBannerAdv : adv?.hideBannerAdv;
  if (!method) {
    return { status: 'unavailable', stickyAdvIsShowing: false };
  }

  try {
    const result = await method.call(adv);
    return normalizeStickyBannerResult(visible, result);
  } catch (error) {
    console.warn(`[Ads] Sticky banner ${visible ? 'show' : 'hide'} failed.`, error);
    return { status: 'error', stickyAdvIsShowing: false };
  }
}

export function setStickyBannerVisible(visible: boolean): Promise<StickyBannerResult> {
  const operation = stickyBannerQueue.then(() => applyStickyBannerVisibility(visible));
  stickyBannerQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export function initializeStickyBannerPolicy(): void {
  if (stickyBannerPolicyInstalled) return;
  stickyBannerPolicyInstalled = true;

  subscribeGameplayActivity((active) => {
    void setStickyBannerVisible(!active);
  });
}

export function showRewardedAd(onRewarded: () => void): Promise<RewardedAdResult> {
  const adv = getYandexSdk()?.adv;
  if (!adv?.showRewardedVideo) {
    return Promise.resolve({ status: 'unavailable', wasShown: false, rewarded: false });
  }

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
      adv.showRewardedVideo({
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
  const adv = getYandexSdk()?.adv;
  if (!adv?.showFullscreenAdv) return Promise.resolve({ status: 'unavailable', wasShown: false });

  return new Promise((resolve) => {
    let settled = false;
    let wasShown = false;

    const finish = (status: InterstitialAdStatus, shown = wasShown): void => {
      if (settled) return;
      settled = true;
      resolve({ status, wasShown: shown });
    };

    try {
      adv.showFullscreenAdv({
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
