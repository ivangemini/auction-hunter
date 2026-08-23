import type { PlayerSave } from '../domain/types';

const STORAGE_KEY = 'auction-hunter.save.v1';

const DEFAULT_SAVE: PlayerSave = {
  version: 1,
  cash: 2500,
  collection: [],
  auctionsWon: 0,
  auctionsPlayed: 0,
  lifetimeSales: 0,
};

function loadSave(): PlayerSave {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE, collection: [] };

    const parsed = JSON.parse(raw) as Partial<PlayerSave>;
    if (parsed.version !== 1) return { ...DEFAULT_SAVE, collection: [] };

    return {
      ...DEFAULT_SAVE,
      ...parsed,
      collection: Array.isArray(parsed.collection) ? parsed.collection.filter((id): id is string => typeof id === 'string') : [],
    };
  } catch {
    return { ...DEFAULT_SAVE, collection: [] };
  }
}

export class GameStore {
  private state: PlayerSave = loadSave();

  get snapshot(): Readonly<PlayerSave> {
    return this.state;
  }

  canAfford(amount: number): boolean {
    return this.state.cash >= amount;
  }

  recordAuctionPlayed(): void {
    this.state.auctionsPlayed += 1;
    this.persist();
  }

  buyLot(price: number): void {
    if (!this.canAfford(price)) throw new Error('Insufficient cash');
    this.state.cash -= price;
    this.state.auctionsWon += 1;
    this.persist();
  }

  sellItem(value: number): void {
    this.state.cash += value;
    this.state.lifetimeSales += value;
    this.persist();
  }

  keepItem(itemId: string): void {
    this.state.collection.push(itemId);
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}
