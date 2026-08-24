import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

async function loadAds(adv?: Record<string, unknown>) {
  vi.stubGlobal('window', {
    YaGames: {
      init: vi.fn().mockResolvedValue({ adv }),
    },
  });
  const yandex = await import('./yandex');
  await yandex.initYandexSdk();
  return import('./ads');
}

describe('Yandex advertising adapter', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('grants a rewarded benefit exactly once and only from onRewarded', async () => {
    let callbacks: Record<string, (...args: unknown[]) => void> = {};
    const showRewardedVideo = vi.fn((options: { callbacks?: Record<string, (...args: unknown[]) => void> }) => {
      callbacks = options.callbacks ?? {};
    });
    const ads = await loadAds({ showRewardedVideo });
    const grant = vi.fn();

    const resultPromise = ads.showRewardedAd(grant);
    expect(grant).not.toHaveBeenCalled();

    callbacks.onOpen?.();
    callbacks.onRewarded?.();
    callbacks.onRewarded?.();
    expect(grant).toHaveBeenCalledOnce();

    callbacks.onClose?.(true);
    await expect(resultPromise).resolves.toEqual({
      status: 'rewarded',
      wasShown: true,
      rewarded: true,
    });
  });

  test('closing rewarded video without onRewarded never grants the benefit', async () => {
    let callbacks: Record<string, (...args: unknown[]) => void> = {};
    const showRewardedVideo = vi.fn((options: { callbacks?: Record<string, (...args: unknown[]) => void> }) => {
      callbacks = options.callbacks ?? {};
    });
    const ads = await loadAds({ showRewardedVideo });
    const grant = vi.fn();

    const resultPromise = ads.showRewardedAd(grant);
    callbacks.onOpen?.();
    callbacks.onClose?.(true);

    expect(grant).not.toHaveBeenCalled();
    await expect(resultPromise).resolves.toEqual({
      status: 'closed',
      wasShown: true,
      rewarded: false,
    });
  });

  test('an error after confirmed reward preserves the reward result', async () => {
    let callbacks: Record<string, (...args: unknown[]) => void> = {};
    const showRewardedVideo = vi.fn((options: { callbacks?: Record<string, (...args: unknown[]) => void> }) => {
      callbacks = options.callbacks ?? {};
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const ads = await loadAds({ showRewardedVideo });
    const grant = vi.fn();

    const resultPromise = ads.showRewardedAd(grant);
    callbacks.onOpen?.();
    callbacks.onRewarded?.();
    callbacks.onError?.({ code: 'network' });

    expect(grant).toHaveBeenCalledOnce();
    await expect(resultPromise).resolves.toEqual({
      status: 'rewarded',
      wasShown: true,
      rewarded: true,
    });
    expect(warn).toHaveBeenCalledOnce();
  });

  test('uses the fullscreen close callback as the authoritative shown flag', async () => {
    let callbacks: Record<string, (...args: unknown[]) => void> = {};
    const showFullscreenAdv = vi.fn((options: { callbacks?: Record<string, (...args: unknown[]) => void> }) => {
      callbacks = options.callbacks ?? {};
    });
    const ads = await loadAds({ showFullscreenAdv });

    const resultPromise = ads.showInterstitialAd();
    callbacks.onClose?.(true);

    await expect(resultPromise).resolves.toEqual({ status: 'closed', wasShown: true });
  });

  test('shows sticky ads outside gameplay and hides them while gameplay is active', async () => {
    const showBannerAdv = vi.fn().mockResolvedValue({ stickyAdvIsShowing: true });
    const hideBannerAdv = vi.fn().mockResolvedValue({ stickyAdvIsShowing: false });
    const ads = await loadAds({ showBannerAdv, hideBannerAdv });
    const yandex = await import('./yandex');

    expect(ads.isAdvertisingAvailable('sticky')).toBe(true);
    ads.initializeStickyBannerPolicy();
    ads.initializeStickyBannerPolicy();

    yandex.setGameplayActive(false);
    await vi.waitFor(() => expect(showBannerAdv).toHaveBeenCalledOnce());

    yandex.setGameplayActive(true);
    await vi.waitFor(() => expect(hideBannerAdv).toHaveBeenCalledOnce());

    yandex.setGameplayActive(false);
    await vi.waitFor(() => expect(showBannerAdv).toHaveBeenCalledTimes(2));
  });

  test('maps a disconnected sticky banner to unavailable without throwing', async () => {
    const showBannerAdv = vi.fn().mockResolvedValue({
      stickyAdvIsShowing: false,
      reason: 'ADV_IS_NOT_CONNECTED',
    });
    const hideBannerAdv = vi.fn().mockResolvedValue({ stickyAdvIsShowing: false });
    const ads = await loadAds({ showBannerAdv, hideBannerAdv });

    await expect(ads.setStickyBannerVisible(true)).resolves.toEqual({
      status: 'unavailable',
      stickyAdvIsShowing: false,
      reason: 'ADV_IS_NOT_CONNECTED',
    });
    await expect(ads.setStickyBannerVisible(false)).resolves.toEqual({
      status: 'hidden',
      stickyAdvIsShowing: false,
      reason: undefined,
    });
  });

  test('reports unavailable formats without fabricating an impression or reward', async () => {
    const ads = await loadAds(undefined);
    const grant = vi.fn();

    await expect(ads.showRewardedAd(grant)).resolves.toEqual({
      status: 'unavailable',
      wasShown: false,
      rewarded: false,
    });
    await expect(ads.showInterstitialAd()).resolves.toEqual({
      status: 'unavailable',
      wasShown: false,
    });
    await expect(ads.setStickyBannerVisible(true)).resolves.toEqual({
      status: 'unavailable',
      stickyAdvIsShowing: false,
    });
    expect(ads.isAdvertisingAvailable('sticky')).toBe(false);
    expect(grant).not.toHaveBeenCalled();
  });
});
