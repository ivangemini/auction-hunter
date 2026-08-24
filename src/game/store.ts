import { trackEvent } from '../analytics';
import type { PlayerSave } from '../domain/types';
import { scheduleCloudSave } from '../platform/cloudSave';
import { loadLocalSave, writeLocalSave } from './save';

export class GameStore {
  private state: PlayerSave = loadLocalSave();

  get snapshot(): Readonly<PlayerSave> {
    this.sync();
    return this.state;
  }

  canAfford(amount: number): boolean {
    this.sync();
    return this.state.cash >= amount;
  }

  recordAuctionPlayed(): number {
    this.sync();
    this.state.auctionsPlayed += 1;
    this.persist();
    return this.state.auctionsPlayed;
  }

  buyLot(price: number, reputationXp = 0, completedDailyDay?: string): void {
    this.sync();
    if (this.state.cash < price) throw new Error('Insufficient cash');
    this.state.cash -= price;
    this.state.auctionsWon += 1;
    this.state.reputationXp += Math.max(0, reputationXp);
    if (completedDailyDay) this.state.lastDailyCompletedDay = completedDailyDay;
    this.persist();
  }

  sellItem(value: number, itemId?: string): void {
    this.sync();
    this.state.cash += value;
    this.state.lifetimeSales += value;
    this.persist();
    trackEvent('item_dispositioned', { disposition: 'sell', itemId, value, source: 'round' });
  }

  keepItem(itemId: string): void {
    this.sync();
    this.state.collection.push(itemId);
    this.persist();
    trackEvent('item_dispositioned', { disposition: 'keep', itemId, source: 'round' });
  }

  sellCollectionItem(itemId: string, value: number): boolean {
    const saleValue = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
    if (saleValue <= 0) return false;

    this.sync();
    const index = this.state.collection.indexOf(itemId);
    if (index < 0) return false;

    this.state.collection.splice(index, 1);
    this.state.cash += saleValue;
    this.state.lifetimeSales += saleValue;
    this.persist();
    trackEvent('item_dispositioned', { disposition: 'sell', itemId, value: saleValue, source: 'collection' });
    return true;
  }

  grantBonusCash(amount: number): void {
    const reward = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
    if (reward <= 0) return;
    this.sync();
    this.state.cash += reward;
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
    trackEvent('collection_set_reward_claimed', { setId, reward });
    return true;
  }

  completeOnboarding(): void {
    this.sync();
    if (this.state.onboardingComplete) return;
    this.state.onboardingComplete = true;
    this.persist();
    trackEvent('onboarding_completed', {});
  }

  private sync(): void {
    this.state = loadLocalSave();
  }

  private persist(): void {
    this.state = writeLocalSave(this.state, true);
    scheduleCloudSave(this.state);
  }
}
