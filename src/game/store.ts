import { trackEvent } from '../analytics';
import { dailyBuyerOffersForDay, buyerOfferMatches, buyerOfferValue } from '../data/buyers';
import { ITEM_BY_ID } from '../data/catalog';
import { localDayKey } from '../data/daily';
import { itemTraitsFor } from '../data/itemTraits';
import { ACHIEVEMENTS, BUSINESS_UPGRADES, dailyContractsForDay } from '../data/meta';
import { appendAuctionHistory } from '../domain/history';
import {
  achievementMetricValue,
  contractRewardValue,
  nextUpgradeCost,
  setRewardValue,
} from '../domain/meta';
import type {
  AuctionHistoryEntry,
  BusinessUpgradeId,
  CollectionItem,
  ContractMetric,
  PlayerSave,
  RevealedItem,
} from '../domain/types';
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

  prepareDailyContracts(dayKey = localDayKey()): void {
    this.sync();
    if (!this.resetDailyContractsIfNeeded(dayKey)) return;
    this.persist();
  }

  prepareBuyerMarket(dayKey = localDayKey()): void {
    this.sync();
    if (!this.resetBuyerMarketIfNeeded(dayKey)) return;
    this.persist();
  }

  recordAuctionPlayed(): number {
    this.sync();
    this.resetDailyContractsIfNeeded(localDayKey());
    this.state.auctionsPlayed += 1;
    this.addContractProgress('auctionsPlayed', 1);
    this.persist();
    return this.state.auctionsPlayed;
  }

  buyLot(price: number, reputationXp = 0, completedDailyDay?: string): void {
    this.sync();
    this.resetDailyContractsIfNeeded(localDayKey());
    if (this.state.cash < price) throw new Error('Insufficient cash');
    this.state.cash -= price;
    this.state.auctionsWon += 1;
    this.state.reputationXp += Math.max(0, reputationXp);
    if (completedDailyDay) this.state.lastDailyCompletedDay = completedDailyDay;
    this.addContractProgress('auctionsWon', 1);
    this.persist();
  }

  sellItem(value: number, itemId?: string): void {
    this.sync();
    this.resetDailyContractsIfNeeded(localDayKey());
    const saleValue = this.cleanCashAmount(value);
    this.state.cash += saleValue;
    this.state.lifetimeSales += saleValue;
    this.addContractProgress('itemsSold', 1);
    this.addContractProgress('salesValue', saleValue);
    this.updateHighestCash();
    this.persist();
    trackEvent('item_dispositioned', { disposition: 'sell', itemId, value: saleValue, source: 'round' });
  }

  keepItem(item: string | RevealedItem): void {
    this.sync();
    this.resetDailyContractsIfNeeded(localDayKey());
    const collectionItem = this.toCollectionItem(item);
    this.state.collection.push(collectionItem.itemId);
    this.collectionItems().push(collectionItem);
    this.addContractProgress('itemsKept', 1);
    this.persist();
    trackEvent('item_dispositioned', { disposition: 'keep', itemId: collectionItem.itemId, source: 'round' });
  }

  sellCollectionItem(itemId: string, value: number): boolean {
    const saleValue = this.cleanCashAmount(value);
    if (saleValue <= 0) return false;

    this.sync();
    this.resetDailyContractsIfNeeded(localDayKey());
    const collectionIndex = this.state.collection.indexOf(itemId);
    if (collectionIndex < 0) return false;

    const instances = this.collectionItems();
    const instance = instances
      .filter((candidate) => candidate.itemId === itemId)
      .sort((left, right) => left.appraisedValue - right.appraisedValue || left.acquiredAt - right.acquiredAt)[0];
    if (instance) {
      const instanceIndex = instances.findIndex((candidate) => candidate.id === instance.id);
      if (instanceIndex >= 0) instances.splice(instanceIndex, 1);
    }

    this.state.collection.splice(collectionIndex, 1);
    this.state.cash += saleValue;
    this.state.lifetimeSales += saleValue;
    this.addContractProgress('itemsSold', 1);
    this.addContractProgress('salesValue', saleValue);
    this.updateHighestCash();
    this.persist();
    trackEvent('item_dispositioned', { disposition: 'sell', itemId, value: saleValue, source: 'collection' });
    return true;
  }

  sellToBuyer(buyerId: string, itemKey: string, dayKey = localDayKey()): number {
    this.sync();
    this.resetDailyContractsIfNeeded(dayKey);
    this.resetBuyerMarketIfNeeded(dayKey);

    if (this.state.claimedBuyerOfferIds.includes(buyerId)) return 0;
    const offer = dailyBuyerOffersForDay(dayKey).find((candidate) => candidate.id === buyerId);
    if (!offer) return 0;

    const candidates = this.collectionItems()
      .filter((instance) => instance.id === itemKey || instance.itemId === itemKey)
      .map((instance) => {
        const item = ITEM_BY_ID.get(instance.itemId);
        if (!item || !buyerOfferMatches(item, offer, instance.traitIds)) return null;
        return {
          instance,
          item,
          value: buyerOfferValue(item, offer, instance.appraisedValue, instance.traitIds),
        };
      })
      .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
      .sort((left, right) => right.value - left.value);

    const best = candidates[0];
    if (!best || best.value <= 0) return 0;

    const collectionIndex = this.state.collection.indexOf(best.item.id);
    if (collectionIndex < 0) return 0;
    const instanceIndex = this.collectionItems().findIndex((candidate) => candidate.id === best.instance.id);
    if (instanceIndex < 0) return 0;

    this.state.collection.splice(collectionIndex, 1);
    this.collectionItems().splice(instanceIndex, 1);
    this.state.claimedBuyerOfferIds.push(offer.id);
    this.state.cash += best.value;
    this.state.lifetimeSales += best.value;
    this.addContractProgress('itemsSold', 1);
    this.addContractProgress('salesValue', best.value);
    this.updateHighestCash();
    this.persist();

    trackEvent('buyer_sale_completed', {
      buyerId: offer.id,
      itemId: best.item.id,
      dayKey,
      value: best.value,
      premiumMultiplier: offer.multiplier,
      traitIds: [...best.instance.traitIds],
    });
    trackEvent('item_dispositioned', { disposition: 'sell', itemId: best.item.id, value: best.value, source: 'collection' });
    return best.value;
  }

  grantBonusCash(amount: number): void {
    const reward = this.cleanCashAmount(amount);
    if (reward <= 0) return;
    this.sync();
    this.state.cash += reward;
    this.updateHighestCash();
    this.persist();
  }

  payInspectionFee(amount: number): boolean {
    const fee = this.cleanCashAmount(amount);
    if (fee <= 0) return false;
    this.sync();
    if (this.state.cash < fee) return false;
    this.state.cash -= fee;
    this.persist();
    return true;
  }

  claimSetReward(setId: string, reward: number, requiredItemIds: readonly string[]): boolean {
    this.sync();
    if (this.state.claimedSetRewards.includes(setId)) return false;

    const owned = new Set(this.state.collection);
    if (!requiredItemIds.every((itemId) => owned.has(itemId))) return false;

    const actualReward = setRewardValue(reward, this.state.businessUpgrades.showroom);
    this.state.cash += actualReward;
    this.state.claimedSetRewards.push(setId);
    this.updateHighestCash();
    this.persist();
    trackEvent('collection_set_reward_claimed', { setId, reward: actualReward });
    return true;
  }

  claimDailyContractReward(contractId: string): number {
    this.sync();
    this.resetDailyContractsIfNeeded(localDayKey());
    const dayKey = this.state.contractDayKey;
    if (!dayKey || this.state.claimedContractRewards.includes(contractId)) return 0;

    const contract = dailyContractsForDay(dayKey).find((candidate) => candidate.id === contractId);
    if (!contract) return 0;
    const progress = this.state.contractProgress[contract.id] ?? 0;
    if (progress < contract.target) return 0;

    const reward = contractRewardValue(contract.reward, this.state.businessUpgrades.contractsDesk);
    this.state.claimedContractRewards.push(contract.id);
    this.state.cash += reward;
    this.updateHighestCash();
    this.persist();
    trackEvent('daily_contract_reward_claimed', { contractId: contract.id, dayKey, reward });
    return reward;
  }

  claimAchievement(achievementId: string): number {
    this.sync();
    if (this.state.claimedAchievements.includes(achievementId)) return 0;
    const achievement = ACHIEVEMENTS.find((candidate) => candidate.id === achievementId);
    if (!achievement) return 0;
    if (achievementMetricValue(this.state, achievement.metric) < achievement.target) return 0;

    this.state.claimedAchievements.push(achievement.id);
    this.state.cash += achievement.reward;
    this.updateHighestCash();
    this.persist();
    trackEvent('achievement_reward_claimed', { achievementId: achievement.id, reward: achievement.reward });
    return achievement.reward;
  }

  buyBusinessUpgrade(id: BusinessUpgradeId): boolean {
    this.sync();
    const definition = BUSINESS_UPGRADES[id];
    const currentLevel = this.state.businessUpgrades[id];
    const cost = nextUpgradeCost(definition.costs, currentLevel);
    if (cost === null || this.state.cash < cost) return false;

    this.state.cash -= cost;
    this.state.businessUpgrades[id] = currentLevel + 1;
    this.persist();
    trackEvent('business_upgrade_purchased', { upgradeId: id, level: currentLevel + 1, cost });
    return true;
  }

  recordAuctionHistory(entry: AuctionHistoryEntry): void {
    this.sync();
    this.state.auctionHistory = appendAuctionHistory(this.state.auctionHistory, entry);
    this.persist();
  }

  completeOnboarding(): void {
    this.sync();
    if (this.state.onboardingComplete) return;
    this.state.onboardingComplete = true;
    this.persist();
    trackEvent('onboarding_completed', {});
  }

  private collectionItems(): CollectionItem[] {
    this.state.collectionItems ??= [];
    return this.state.collectionItems;
  }

  private toCollectionItem(item: string | RevealedItem): CollectionItem {
    if (typeof item === 'string') {
      const definition = ITEM_BY_ID.get(item);
      return {
        id: this.createInventoryId(item),
        itemId: item,
        appraisedValue: Math.max(1, definition?.baseValue ?? 1),
        condition: 1,
        restored: false,
        traitIds: itemTraitsFor(item),
        acquiredAt: Date.now(),
      };
    }

    return {
      id: this.createInventoryId(item.definition.id),
      itemId: item.definition.id,
      appraisedValue: this.cleanCashAmount(item.appraisedValue),
      condition: Math.min(1, Math.max(0, item.condition)),
      restored: item.restored,
      traitIds: [...(item.traitIds ?? itemTraitsFor(item.definition.id))],
      acquiredAt: Date.now(),
      ...(item.restorationGrade ? { restorationGrade: item.restorationGrade } : {}),
    };
  }

  private createInventoryId(itemId: string): string {
    const randomId = typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    return `item-${itemId}-${randomId}`;
  }

  private sync(): void {
    this.state = loadLocalSave();
  }

  private resetDailyContractsIfNeeded(dayKey: string): boolean {
    if (this.state.contractDayKey === dayKey) return false;
    this.state.contractDayKey = dayKey;
    this.state.contractProgress = {};
    this.state.claimedContractRewards = [];
    return true;
  }

  private resetBuyerMarketIfNeeded(dayKey: string): boolean {
    if (this.state.buyerMarketDayKey === dayKey) return false;
    this.state.buyerMarketDayKey = dayKey;
    this.state.claimedBuyerOfferIds = [];
    return true;
  }

  private addContractProgress(metric: ContractMetric, amount: number): void {
    const dayKey = this.state.contractDayKey;
    if (!dayKey || amount <= 0) return;
    for (const contract of dailyContractsForDay(dayKey)) {
      if (contract.metric !== metric) continue;
      const current = this.state.contractProgress[contract.id] ?? 0;
      this.state.contractProgress[contract.id] = Math.min(contract.target, current + amount);
    }
  }

  private updateHighestCash(): void {
    this.state.highestCash = Math.max(this.state.highestCash, this.state.cash);
  }

  private cleanCashAmount(amount: number): number {
    return Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  }

  private persist(): void {
    this.updateHighestCash();
    this.state = writeLocalSave(this.state, true);
    scheduleCloudSave(this.state);
  }
}
