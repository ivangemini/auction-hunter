import type { PlayerSave } from '../domain/types';

const STORAGE_KEY = 'auction-hunter.save.v1';

const DEFAULT_SAVE: PlayerSave = {
  version: 1,
  cash: 2500,
  collection: [],
  claimedSetRewards: [],
  reputationXp: 0,
  auctionsWon: 0,
  auctionsPlayed: 0,
  lifetimeSales: 0,
};

function cleanStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
}

function cleanNonNegativeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function freshDefaultSave(): PlayerSave {
  return { ...DEFAULT_SAVE, collection: [], claimedSetRewards: [] };
}

function loadSave(): PlayerSave {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshDefaultSave();

    const parsed = JSON.parse(raw) as Partial<PlayerSave>;
    if (parsed.version !== 1) return freshDefaultSave();

    return {
      ...DEFAULT_SAVE,
      ...parsed,
      collection: cleanStringArray(parsed.collection),
      claimedSetRewards: cleanStringArray(parsed.claimedSetRewards),
      reputationXp: cleanNonNegativeNumber(parsed.reputationXp),
    };
  } catch {
    return freshDefaultSave();
  }
}

export class GameStore {
  private state: PlayerSave = loadSave();

  get snapshot(): Readonly<PlayerSave> {
    this.sync();
    return this.state;
  }

  canAfford(amount: number): boolean {
    this.sync();
    return this.state.cash >= amount;
  }

  recordAuctionPlayed(): void {
    this.sync();
    this.state.auctionsPlayed += 1;
    this.persist();
  }

  buyLot(price: number, reputationXp = 0): void {
    this.sync();
    if (this.state.cash < price) throw new Error('Insufficient cash');
    this.state.cash -= price;
    this.state.auctionsWon += 1;
    this.state.reputationXp += cleanNonNegativeNumber(reputationXp);
    this.persist();
  }

  sellItem(value: number): void {
    this.sync();
    this.state.cash += value;
    this.state.lifetimeSales += value;
    this.persist();
  }

  keepItem(itemId: string): void {
    this.sync();
    this.state.collection.push(itemId);
    this.persist();
  }

  claimSetReward(setId: string, reward: number, requiredItemIds: readonly string[]): boolean {
    this.sync();
    if (this.state.claimedSetRewards.includes(setId)) return false;

    const owned = new Set(this.state.collection);
    if (!requiredItemIds.every((itemId) => owned.has(itemId))) return false;

    this.state.cash += reward;
    this.state.claimedSetRewards.push(setId);
    this.persist();
    return true;
  }

  private sync(): void {
    this.state = loadSave();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}
