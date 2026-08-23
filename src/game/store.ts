import { trackEvent, type RewardedAdPlacement } from '../analytics';
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

  recordAuctionPlayed(): void {
    this.sync();
    this.state.auctionsPlayed += 1;
    this.persist();
    trackEvent('auction_started', { auctionNumber: this.state.auctionsPlayed });
  }

  buyLot(price: number, reputationXp = 0, completedDailyDay?: string): void {
    this.sync();
    if (this.state.cash < price) throw new Error('Insufficient cash');
    this.state.cash -= price;
    this.state.auctionsWon += 1;
    this.state.reputationXp += Math.max(0, reputationXp);
    if (completedDailyDay) this.state.lastDailyCompletedDay = completedDailyDay;
    this.persist();

    trackEvent('auction_won', {
      finalBid: price,
      reputationGain: reputationXp,
      auctionsWon: this.state.auctionsWon,
      daily: Boolean(completedDailyDay),
    });
    if (completedDailyDay) {
      trackEvent('daily_special_completed', { dayKey: completedDailyDay, reputationGain: reputationXp });
    }
  }

  sellItem(value: number, itemId?: string): void {
    this.sync();
    this.state.cash += value;
    this.state.lifetimeSales += value;
    this.persist();
    trackEvent('item_dispositioned', { disposition: 'sell', itemId, value });
  }

  keepItem(itemId: string): void {
    this.sync();
    this.state.collection.push(itemId);
    this.persist();
    trackEvent('item_dispositioned', { disposition: 'keep', itemId });
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

  grantRewardedCash(amount: number, placement: RewardedAdPlacement): boolean {
    this.sync();
    const reward = Math.max(0, Math.round(amount));
    if (reward === 0) return false;

    this.state.cash += reward;
    this.persist();
    trackEvent('rewarded_cash_granted', { placement, amount: reward });
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
