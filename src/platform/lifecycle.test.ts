import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

type Listener = (...args: any[]) => void;

interface LifecycleHarness {
  sdkEvents: Map<string, Listener>;
  windowEvents: Map<string, Listener>;
  documentEvents: Map<string, Listener>;
  mediaEvents: Map<string, Listener>;
  documentState: { visibilityState: 'visible' | 'hidden' };
  mediaState: { matches: boolean };
}

async function installHarness(initialPortrait = false): Promise<LifecycleHarness> {
  const sdkEvents = new Map<string, Listener>();
  const windowEvents = new Map<string, Listener>();
  const documentEvents = new Map<string, Listener>();
  const mediaEvents = new Map<string, Listener>();
  const documentState: { visibilityState: 'visible' | 'hidden' } = { visibilityState: 'visible' };
  const mediaState = { matches: initialPortrait };

  const mediaQuery = {
    get matches() {
      return mediaState.matches;
    },
    addEventListener: vi.fn((event: string, listener: Listener) => mediaEvents.set(event, listener)),
  };

  vi.stubGlobal('document', {
    get visibilityState() {
      return documentState.visibilityState;
    },
    addEventListener: vi.fn((event: string, listener: Listener) => documentEvents.set(event, listener)),
  });

  vi.stubGlobal('window', {
    YaGames: {
      init: vi.fn().mockResolvedValue({
        on: (event: string, listener: Listener) => sdkEvents.set(event, listener),
        off: vi.fn(),
      }),
    },
    addEventListener: vi.fn((event: string, listener: Listener) => windowEvents.set(event, listener)),
    matchMedia: vi.fn(() => mediaQuery),
  });

  const yandex = await import('./yandex');
  await yandex.initYandexSdk();

  return { sdkEvents, windowEvents, documentEvents, mediaEvents, documentState, mediaState };
}

describe('platform pause lifecycle', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('does not resume until every active pause reason clears', async () => {
    const harness = await installHarness(false);
    const lifecycle = await import('./lifecycle');
    lifecycle.initializePlatformLifecycle();

    const states: boolean[] = [];
    lifecycle.subscribePlatformPause((paused) => states.push(paused));

    harness.sdkEvents.get('game_api_pause')?.();
    expect(lifecycle.isPlatformPaused()).toBe(true);
    expect(states).toEqual([true]);

    harness.windowEvents.get('blur')?.();
    harness.sdkEvents.get('game_api_resume')?.();
    expect(lifecycle.isPlatformPaused()).toBe(true);
    expect(states).toEqual([true]);

    harness.windowEvents.get('focus')?.();
    expect(lifecycle.isPlatformPaused()).toBe(false);
    expect(states).toEqual([true, false]);
  });

  test('combines visibility and orientation guards with Yandex lifecycle events', async () => {
    const harness = await installHarness(true);
    const lifecycle = await import('./lifecycle');
    lifecycle.initializePlatformLifecycle();

    expect(lifecycle.isPlatformPaused()).toBe(true);
    const states: boolean[] = [];
    lifecycle.subscribePlatformPause((paused) => states.push(paused));

    harness.sdkEvents.get('game_api_pause')?.();
    harness.mediaState.matches = false;
    harness.mediaEvents.get('change')?.({ matches: false });
    expect(lifecycle.isPlatformPaused()).toBe(true);
    expect(states).toEqual([]);

    harness.sdkEvents.get('game_api_resume')?.();
    expect(lifecycle.isPlatformPaused()).toBe(false);
    expect(states).toEqual([false]);

    harness.documentState.visibilityState = 'hidden';
    harness.documentEvents.get('visibilitychange')?.();
    expect(lifecycle.isPlatformPaused()).toBe(true);
    expect(states).toEqual([false, true]);

    harness.documentState.visibilityState = 'visible';
    harness.documentEvents.get('visibilitychange')?.();
    expect(lifecycle.isPlatformPaused()).toBe(false);
    expect(states).toEqual([false, true, false]);
  });
});
