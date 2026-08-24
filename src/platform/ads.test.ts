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
    expect(grant).not.toHaveBeenCalled();
  });
});
