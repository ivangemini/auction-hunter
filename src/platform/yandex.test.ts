import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

describe('Yandex SDK adapter', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('falls back safely when the SDK is unavailable', async () => {
    vi.stubGlobal('window', {});
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const yandex = await import('./yandex');

    await expect(yandex.initYandexSdk()).resolves.toBeUndefined();
    expect(yandex.getYandexSdk()).toBeNull();
    expect(yandex.getPlatformLocale()).toBe('en');
    expect(await yandex.getYandexPlayer()).toBeNull();
    expect(info).toHaveBeenCalledOnce();
  });

  test('initializes once-per-state SDK actions and caches the player', async () => {
    const ready = vi.fn();
    const start = vi.fn();
    const stop = vi.fn();
    const player = {
      getData: vi.fn().mockResolvedValue({}),
      setData: vi.fn().mockResolvedValue(undefined),
    };
    const getPlayer = vi.fn().mockResolvedValue(player);
    const init = vi.fn().mockResolvedValue({
      environment: { i18n: { lang: 'ru-RU' } },
      features: {
        LoadingAPI: { ready },
        GameplayAPI: { start, stop },
      },
      getPlayer,
    });

    vi.stubGlobal('window', { YaGames: { init } });
    const yandex = await import('./yandex');

    await yandex.initYandexSdk();
    expect(init).toHaveBeenCalledOnce();
    expect(yandex.getPlatformLocale()).toBe('ru');

    yandex.markGameReady();
    yandex.markGameReady();
    expect(ready).toHaveBeenCalledOnce();

    const activity = vi.fn();
    yandex.subscribeGameplayActivity(activity);
    expect(activity).toHaveBeenCalledWith(false);
    activity.mockClear();

    yandex.setGameplayActive(true);
    yandex.setGameplayActive(true);
    yandex.setGameplayActive(false);
    yandex.setGameplayActive(false);
    yandex.setGameplayActive(true);
    expect(start).toHaveBeenCalledTimes(2);
    expect(stop).toHaveBeenCalledOnce();
    expect(activity.mock.calls.map(([active]) => active)).toEqual([true, false, true]);

    expect(await yandex.getYandexPlayer()).toBe(player);
    expect(await yandex.getYandexPlayer()).toBe(player);
    expect(getPlayer).toHaveBeenCalledOnce();
  });

  test('contains SDK initialization failure and keeps local fallback semantics', async () => {
    const failure = new Error('sdk unavailable');
    vi.stubGlobal('window', {
      YaGames: { init: vi.fn().mockRejectedValue(failure) },
    });
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const yandex = await import('./yandex');

    await expect(yandex.initYandexSdk()).resolves.toBeUndefined();
    expect(yandex.getYandexSdk()).toBeNull();
    expect(yandex.getPlatformLocale()).toBe('en');
    expect(error).toHaveBeenCalledWith('[Yandex] SDK initialization failed.', failure);
  });
});
