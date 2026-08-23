import type { PlayerSave } from '../domain/types';
import { loadLocalSave, normalizeSave, writeLocalSave } from '../game/save';
import { getYandexPlayer, type YandexPlayer } from './yandex';

const CLOUD_KEY = 'auctionHunterSaveV1';
const CLOUD_SCHEMA_VERSION = 1 as const;
const CLOUD_SAVE_INTERVAL_MS = 4000;

interface CloudEnvelope {
  schemaVersion: typeof CLOUD_SCHEMA_VERSION;
  save: PlayerSave;
}

export interface StartupSaveChoice {
  source: 'local' | 'cloud';
  save: PlayerSave;
}

let player: YandexPlayer | null = null;
let pendingSave: PlayerSave | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;
let lifecycleInstalled = false;

export async function initializeCloudSave(): Promise<StartupSaveChoice> {
  const local = loadLocalSave();
  if (initialized) return { source: 'local', save: local };
  initialized = true;

  player = await getYandexPlayer();
  if (!player) return { source: 'local', save: local };

  installLifecycleFlush();

  try {
    const data = await player.getData([CLOUD_KEY]);
    const cloud = parseCloudSave(data[CLOUD_KEY]);
    const choice = pickStartupSave(local, cloud);

    if (choice.source === 'cloud') {
      writeLocalSave(choice.save, false);
    } else if (!cloud || !sameSave(choice.save, cloud)) {
      await uploadSave(choice.save, true);
    }

    return choice;
  } catch (error) {
    console.warn('[CloudSave] Initial sync failed; continuing with local progress.', error);
    return { source: 'local', save: local };
  }
}

export function scheduleCloudSave(save: PlayerSave): void {
  if (!player) return;
  pendingSave = normalizeSave(save);
  if (flushTimer) return;

  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushCloudSave(false);
  }, CLOUD_SAVE_INTERVAL_MS);
}

export async function flushCloudSave(flush = true): Promise<void> {
  if (!player || !pendingSave) return;

  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  const save = pendingSave;
  pendingSave = null;

  try {
    await uploadSave(save, flush);
  } catch (error) {
    requeueFailedSave(save);
    console.warn('[CloudSave] Upload failed; progress remains queued locally.', error);
  }
}

export function pickStartupSave(local: PlayerSave, cloud: PlayerSave | null): StartupSaveChoice {
  if (!cloud) return { source: 'local', save: local };
  if (cloud.updatedAt > local.updatedAt) return { source: 'cloud', save: cloud };
  if (local.updatedAt > cloud.updatedAt) return { source: 'local', save: local };

  return progressScore(cloud) > progressScore(local)
    ? { source: 'cloud', save: cloud }
    : { source: 'local', save: local };
}

function requeueFailedSave(save: PlayerSave): void {
  const queuedSave = pendingSave;
  if (!queuedSave || queuedSave.updatedAt < save.updatedAt) pendingSave = save;
}

function parseCloudSave(value: unknown): PlayerSave | null {
  if (!isRecord(value) || value.schemaVersion !== CLOUD_SCHEMA_VERSION || !isRecord(value.save)) return null;
  if (value.save.version !== 1) return null;
  return normalizeSave(value.save);
}

async function uploadSave(save: PlayerSave, flush: boolean): Promise<void> {
  if (!player) return;
  const envelope: CloudEnvelope = {
    schemaVersion: CLOUD_SCHEMA_VERSION,
    save: normalizeSave(save),
  };
  await player.setData({ [CLOUD_KEY]: envelope }, flush);
}

function sameSave(left: PlayerSave, right: PlayerSave): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function progressScore(save: PlayerSave): number {
  return save.auctionsWon * 1_000_000
    + save.reputationXp * 10_000
    + save.collection.length * 1_000
    + save.claimedSetRewards.length * 500
    + Math.min(save.lifetimeSales, 999_999);
}

function installLifecycleFlush(): void {
  if (lifecycleInstalled || typeof document === 'undefined') return;
  lifecycleInstalled = true;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flushCloudSave(true);
  });
  window.addEventListener('pagehide', () => {
    void flushCloudSave(true);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
