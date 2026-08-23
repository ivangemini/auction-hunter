import { getYandexSdk } from './yandex';

type PauseReason = 'yandex' | 'visibility' | 'blur';
type PauseListener = (paused: boolean) => void;

const pauseReasons = new Set<PauseReason>();
const listeners = new Set<PauseListener>();
let initialized = false;

export function initializePlatformLifecycle(): void {
  if (initialized) return;
  initialized = true;

  const sdk = getYandexSdk();
  sdk?.on?.('game_api_pause', handleYandexPause);
  sdk?.on?.('game_api_resume', handleYandexResume);

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('focus', handleWindowFocus);

  if (document.visibilityState === 'hidden') setPauseReason('visibility', true);
}

export function isPlatformPaused(): boolean {
  return pauseReasons.size > 0;
}

export function subscribePlatformPause(listener: PauseListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function handleYandexPause(): void {
  setPauseReason('yandex', true);
}

function handleYandexResume(): void {
  setPauseReason('yandex', false);
}

function handleVisibilityChange(): void {
  setPauseReason('visibility', document.visibilityState === 'hidden');
}

function handleWindowBlur(): void {
  setPauseReason('blur', true);
}

function handleWindowFocus(): void {
  setPauseReason('blur', false);
}

function setPauseReason(reason: PauseReason, active: boolean): void {
  const wasPaused = isPlatformPaused();
  if (active) pauseReasons.add(reason);
  else pauseReasons.delete(reason);

  const paused = isPlatformPaused();
  if (paused === wasPaused) return;
  for (const listener of listeners) listener(paused);
}
