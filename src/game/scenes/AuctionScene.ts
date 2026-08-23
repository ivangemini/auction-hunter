import Phaser from 'phaser';
import { ITEM_BY_ID, LOTS } from '../../data/catalog';
import { uniqueCollectionCount } from '../../data/collections';
import { getDailySpecial, localDayKey, type DailySpecialDefinition } from '../../data/daily';
import { AUCTION_TIERS, getAuctionTier, highestUnlockedAuctionTier, type AuctionTierId } from '../../data/tiers';
import type { ItemDefinition, Locale, LotTemplate, Rarity, RestorationGrade, RevealedItem } from '../../domain/types';
import { t } from '../../i18n';
import { getPlatformLocale, markGameReady, setGameplayActive } from '../../platform/yandex';
import { preloadArt, resolveItemTexture, resolveLotTexture } from '../art';
import { applyRestoration, estimateItemValue } from '../restoration';
import { GameStore } from '../store';
import { button } from '../ui';

type RevealStage = 'closed' | 'revealed' | 'appraised' | 'restoring';

interface Opponent {
  id: string;
  name: string;
  maxBid: number;
}

const WIDTH = 1280;
const HEIGHT = 720;

const RARITY_COLORS: Record<Rarity, number> = {
  common: 0xaeb5c0,
  uncommon: 0x63d28d,
  rare: 0x61a8ff,
  epic: 0xb576ff,
  legendary: 0xffc857,
};

export class AuctionScene extends Phaser.Scene {
  private readonly store = new GameStore();
  private locale: Locale = 'en';
  private lot!: LotTemplate;
  private items: RevealedItem[] = [];
  private opponents: Opponent[] = [];
  private currentTierId: AuctionTierId = 'garage';
  private dailySpecial: DailySpecialDefinition | null = null;
  private currentBid = 0;
  private currentLeader = '';
  private awaitingNpc = false;
  private revealIndex = 0;
  private revealStage: RevealStage = 'closed';
  private roundCost = 0;
  private roundSales = 0;
  private roundKept = 0;
  private roundReputationGain = 0;
  private notice = '';
  private restorationTargetCenter = 0.5;
  private restorationTargetHalfWidth = 0.1;

  constructor() {
    super('auction');
  }

  preload(): void {
    preloadArt(this);
  }

  create(): void {
    this.locale = getPlatformLocale();
    this.dailySpecial = null;
    this.currentTierId = highestUnlockedAuctionTier(this.store.snapshot.reputationXp).id;
    this.prepareNextLot();
    this.renderLobby();
    markGameReady();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => setGameplayActive(false));
  }

  private prepareNextLot(): void {
    const save = this.store.snapshot;
    const today = localDayKey();
    if (this.dailySpecial && (this.dailySpecial.dayKey !== today || save.lastDailyCompletedDay === today)) {
      this.dailySpecial = null;
    }

    let tier = getAuctionTier(this.currentTierId);
    let lot: LotTemplate | undefined;
    let valueMultiplier = 1;

    if (this.dailySpecial) {
      tier = getAuctionTier(this.dailySpecial.tierId);
      this.currentTierId = tier.id;
      lot = LOTS.find((candidate) => candidate.id === this.dailySpecial?.lotId);
      valueMultiplier = this.dailySpecial.valueMultiplier;
    } else {
      if (save.reputationXp < tier.minReputationXp) {
        tier = highestUnlockedAuctionTier(save.reputationXp);
        this.currentTierId = tier.id;
      }

      const tierLots = tier.lotIds
        .map((lotId) => LOTS.find((candidate) => candidate.id === lotId))
        .filter((candidate): candidate is LotTemplate => Boolean(candidate));
      lot = tierLots[Math.floor(Math.random() * tierLots.length)];
    }

    if (!lot) throw new Error(`No lot templates configured for tier ${tier.id}`);

    this.lot = lot;
    this.items = this.createLotItems(lot, valueMultiplier);
    this.opponents = this.createOpponents();
    this.currentBid = lot.reservePrice;
    this.currentLeader = this.opponents[0]?.id ?? '';
    this.awaitingNpc = false;
    this.revealIndex = 0;
    this.revealStage = 'closed';
    this.roundCost = 0;
    this.roundSales = 0;
    this.roundKept = 0;
    this.roundReputationGain = 0;
    this.notice = '';
  }

  private createLotItems(lot: LotTemplate, valueMultiplier = 1): RevealedItem[] {
    const pool = [...lot.itemPool];
    const selected: ItemDefinition[] = [];

    while (selected.length < lot.itemCount && pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length);
      const [id] = pool.splice(index, 1);
      if (!id) continue;
      const item = ITEM_BY_ID.get(id);
      if (item) selected.push(item);
    }

    return selected.map((definition) => {
      const condition = Phaser.Math.FloatBetween(0.42, 0.92);
      const marketFactor = Phaser.Math.FloatBetween(0.9, 1.15) * valueMultiplier;
      return {
        definition,
        condition,
        restored: false,
        appraisedValue: estimateItemValue(definition.baseValue, condition, marketFactor),
      };
    });
  }

  private createOpponents(): Opponent[] {
    const hiddenValue = this.items.reduce((sum, item) => sum + item.appraisedValue, 0);
    const names = this.locale === 'ru' ? ['Виктор', 'Мира', 'Антон'] : ['Victor', 'Mira', 'Anton'];
    const factors = [
      Phaser.Math.FloatBetween(0.26, 0.38),
      Phaser.Math.FloatBetween(0.34, 0.48),
      Phaser.Math.FloatBetween(0.42, 0.58),
    ];

    return names.map((name, index) => ({
      id: `npc-${index}`,
      name,
      maxBid: Math.max(this.lot.reservePrice, this.roundToBid(hiddenValue * (factors[index] ?? 0.35))),
    }));
  }

  private renderLobby(): void {
    this.resetCanvas();
    this.renderHeader();
    this.renderTierTabs();

    this.panel(70, 190, 760, 460);
    const lotEyebrow = this.dailySpecial ? t(this.locale, 'dailySpecial').toUpperCase() : t(this.locale, 'lot').toUpperCase();
    this.label(105, 214, lotEyebrow, 14, this.dailySpecial ? '#e9b949' : '#8b93a1', this.dailySpecial ? 'bold' : 'normal');
    this.label(105, 242, this.lot.name[this.locale], 32, '#f7f8fa', 'bold');
    this.label(105, 284, `${t(this.locale, 'location')}: ${this.lot.location[this.locale]}`, 16, '#aeb5c0');
    this.renderLotArtwork(285, 438, 360, 205);

    this.label(500, 326, t(this.locale, 'visibleClues'), 18, '#e9b949', 'bold');
    this.lot.clues.forEach((clue, index) => {
      this.label(500, 368 + index * 62, `• ${clue[this.locale]}`, 18, '#d7dbe2').setWordWrapWidth(285);
    });

    this.panel(865, 190, 345, 460, 0x171a20);
    this.label(900, 222, t(this.locale, 'currentBid'), 15, '#8b93a1');
    this.label(900, 250, this.money(this.lot.reservePrice), 34, '#f7f8fa', 'bold');
    this.divider(900, 300, 275);
    this.label(900, 318, this.locale === 'ru' ? 'Шаг ставки' : 'Bid increment', 14, '#8b93a1');
    this.label(900, 345, `+${this.money(this.lot.bidIncrement)}`, 23, '#d7dbe2', 'bold');
    this.label(900, 390, this.locale === 'ru' ? 'Предметов внутри' : 'Items inside', 14, '#8b93a1');
    this.label(900, 416, String(this.lot.itemCount), 23, '#f7f8fa', 'bold');

    button(this, 1038, 476, t(this.locale, 'collectionBook'), () => this.scene.start('collection'), {
      width: 270,
      height: 42,
      background: 0x61a8ff,
    });
    this.renderDailyControl();
    button(this, 1038, 605, this.dailySpecial ? t(this.locale, 'startDailyAuction') : t(this.locale, 'startAuction'), () => this.startAuction(), {
      width: 270,
      height: 50,
    });
  }

  private renderTierTabs(): void {
    const reputationXp = this.store.snapshot.reputationXp;

    AUCTION_TIERS.forEach((tier, index) => {
      const x = 250 + index * 390;
      const unlocked = reputationXp >= tier.minReputationXp;
      const selected = tier.id === this.currentTierId;
      const fill = selected ? tier.accent : 0x171a20;
      const fillAlpha = selected ? 0.16 : 1;
      const borderAlpha = selected ? 0.75 : unlocked ? 0.18 : 0.07;
      const border = selected ? tier.accent : 0xffffff;

      const rect = this.add.rectangle(x, 151, 340, 48, fill, fillAlpha).setStrokeStyle(1, border, borderAlpha);
      const text = unlocked
        ? tier.name[this.locale]
        : `${tier.name[this.locale]} · ${t(this.locale, 'lockedAtReputation', { xp: tier.minReputationXp })}`;
      this.centerLabel(x, 151, text, 14, selected ? this.hexColor(tier.accent) : unlocked ? '#d7dbe2' : '#666e79', selected ? 'bold' : 'normal');

      if (unlocked && (!selected || this.dailySpecial)) {
        rect.setInteractive({ useHandCursor: true });
        rect.on('pointerover', () => rect.setStrokeStyle(1, tier.accent, 0.6));
        rect.on('pointerout', () => rect.setStrokeStyle(1, selected ? tier.accent : 0xffffff, selected ? 0.75 : 0.18));
        rect.on('pointerup', () => {
          this.dailySpecial = null;
          this.currentTierId = tier.id;
          this.prepareNextLot();
          this.renderLobby();
        });
      }
    });
  }

  private renderDailyControl(): void {
    const today = localDayKey();
    const completed = this.store.snapshot.lastDailyCompletedDay === today;

    if (completed) {
      this.centerLabel(1038, 540, t(this.locale, 'dailyComplete'), 13, '#63d28d', 'bold');
      return;
    }

    if (this.dailySpecial?.dayKey === today) {
      this.centerLabel(1038, 540, t(this.locale, 'dailyActive'), 13, '#e9b949', 'bold');
      return;
    }

    button(this, 1038, 540, t(this.locale, 'dailySpecial'), () => this.activateDailySpecial(), {
      width: 270,
      height: 42,
      background: 0xc4773a,
    });
  }

  private activateDailySpecial(): void {
    const today = localDayKey();
    const save = this.store.snapshot;
    if (save.lastDailyCompletedDay === today) return;

    this.dailySpecial = getDailySpecial(today, save.reputationXp);
    this.currentTierId = this.dailySpecial.tierId;
    this.prepareNextLot();
    this.renderLobby();
  }

  private startAuction(): void {
    this.store.recordAuctionPlayed();
    setGameplayActive(true);
    this.currentBid = this.lot.reservePrice;
    this.currentLeader = this.opponents[0]?.id ?? '';
    this.notice = '';
    this.renderBidding();
  }

  private renderBidding(): void {
    this.resetCanvas();
    this.renderHeader();
    this.label(80, 160, this.lot.name[this.locale], 28, '#f7f8fa', 'bold');
    this.label(80, 202, this.lot.location[this.locale], 16, '#8b93a1');

    this.panel(70, 245, 760, 370);
    this.renderLotArtwork(645, 342, 300, 150);
    this.add.rectangle(495, 267, 1, 326, 0xffffff, 0.08).setOrigin(0);
    this.label(105, 285, t(this.locale, 'currentBid'), 17, '#8b93a1');
    this.label(105, 321, this.money(this.currentBid), 52, '#f7f8fa', 'bold');

    const leaderName = this.currentLeader === 'player'
      ? t(this.locale, 'you')
      : this.opponents.find((opponent) => opponent.id === this.currentLeader)?.name ?? t(this.locale, 'npc');

    this.label(105, 402, `${t(this.locale, 'leader')}: ${leaderName}`, 21, this.currentLeader === 'player' ? '#63d28d' : '#d7dbe2', 'bold');
    if (this.notice) this.label(105, 452, this.notice, 17, '#ff8d85');

    const nextBid = this.currentBid + this.lot.bidIncrement;
    const canBid = this.store.canAfford(nextBid) && !this.awaitingNpc;
    button(this, 250, 555, `${t(this.locale, 'bid')} +${this.money(this.lot.bidIncrement)}`, () => this.placePlayerBid(), {
      width: 280,
      height: 64,
      disabled: !canBid,
    });
    button(this, 560, 555, t(this.locale, 'pass'), () => this.passAuction(), {
      width: 220,
      height: 64,
      background: 0x2c313a,
      disabled: this.awaitingNpc,
    });

    this.panel(865, 245, 345, 370, 0x171a20);
    this.label(900, 282, this.locale === 'ru' ? 'Участники' : 'Bidders', 19, '#e9b949', 'bold');
    this.opponents.forEach((opponent, index) => {
      const active = opponent.id === this.currentLeader;
      this.label(900, 338 + index * 66, opponent.name, 21, active ? '#f7f8fa' : '#aeb5c0', active ? 'bold' : 'normal');
      this.label(1115, 340 + index * 66, active ? '●' : '○', 18, active ? '#e9b949' : '#555c68');
    });
  }

  private placePlayerBid(): void {
    if (this.awaitingNpc) return;
    const nextBid = this.currentBid + this.lot.bidIncrement;
    if (!this.store.canAfford(nextBid)) {
      this.notice = t(this.locale, 'notEnoughCash');
      this.renderBidding();
      return;
    }

    this.currentBid = nextBid;
    this.currentLeader = 'player';
    this.awaitingNpc = true;
    this.notice = '';
    this.renderBidding();
    this.time.delayedCall(550, () => this.npcRespond());
  }

  private npcRespond(): void {
    const nextBid = this.currentBid + this.lot.bidIncrement;
    const eligible = this.opponents.filter((opponent) => opponent.maxBid >= nextBid);
    if (eligible.length === 0) {
      this.time.delayedCall(450, () => this.finalizeWin());
      return;
    }

    const opponent = eligible[Math.floor(Math.random() * eligible.length)];
    if (!opponent) {
      this.finalizeWin();
      return;
    }

    this.currentBid = nextBid;
    this.currentLeader = opponent.id;
    this.awaitingNpc = false;
    this.renderBidding();
  }

  private passAuction(): void {
    setGameplayActive(false);
    this.resetCanvas();
    this.renderHeader();
    this.panel(260, 180, 760, 390);
    this.centerLabel(640, 265, t(this.locale, 'lost'), 40, '#f7f8fa', 'bold');
    this.centerLabel(640, 330, `${t(this.locale, 'currentBid')}: ${this.money(this.currentBid)}`, 22, '#aeb5c0');
    button(this, 640, 465, t(this.locale, 'nextAuction'), () => {
      this.prepareNextLot();
      this.renderLobby();
    }, { width: 280, height: 64 });
  }

  private finalizeWin(): void {
    this.awaitingNpc = false;
    this.roundCost = this.currentBid;
    const tier = getAuctionTier(this.currentTierId);
    const completedDailyDay = this.dailySpecial?.dayKey;
    this.roundReputationGain = this.dailySpecial
      ? Math.round(tier.winXp * this.dailySpecial.reputationMultiplier)
      : tier.winXp;
    this.store.buyLot(this.currentBid, this.roundReputationGain, completedDailyDay);
    this.renderWin();
  }

  private renderWin(): void {
    this.resetCanvas();
    this.renderHeader();
    this.panel(240, 155, 800, 450);
    this.renderLotArtwork(640, 285, 330, 165);
    this.centerLabel(640, 190, t(this.locale, 'won'), 42, '#e9b949', 'bold');
    this.centerLabel(640, 395, this.lot.name[this.locale], 26, '#f7f8fa', 'bold');
    this.centerLabel(640, 430, `${t(this.locale, 'paid')}: ${this.money(this.roundCost)}`, 20, '#aeb5c0');
    this.centerLabel(640, 466, t(this.locale, 'reputationGain', { xp: this.roundReputationGain }), 18, '#61a8ff', 'bold');
    this.centerLabel(640, 497, this.locale === 'ru' ? 'Теперь узнаем, стоило ли оно того.' : 'Now we find out whether it was worth it.', 17, '#d7dbe2');
    button(this, 640, 560, t(this.locale, 'openLot'), () => {
      this.revealIndex = 0;
      this.revealStage = 'closed';
      this.renderReveal();
    }, { width: 280, height: 58 });
  }

  private renderReveal(): void {
    if (this.revealIndex >= this.items.length) {
      this.renderRoundSummary();
      return;
    }

    const item = this.items[this.revealIndex];
    if (!item) {
      this.renderRoundSummary();
      return;
    }

    this.resetCanvas();
    this.renderHeader();
    this.centerLabel(640, 142, t(this.locale, 'itemOf', { current: this.revealIndex + 1, total: this.items.length }), 17, '#8b93a1');
    this.panel(245, 165, 790, 465);

    if (this.revealStage === 'closed') {
      this.add.rectangle(640, 350, 340, 250, 0xe9b949, 0.04).setStrokeStyle(1, 0xe9b949, 0.18);
      this.add.image(640, 340, resolveItemTexture(this, 'fallback')).setDisplaySize(300, 210);
      this.centerLabel(640, 458, this.locale === 'ru' ? 'Запечатанная находка' : 'Sealed find', 19, '#aeb5c0');
      button(this, 640, 555, t(this.locale, 'reveal'), () => {
        this.revealStage = 'revealed';
        this.renderReveal();
      }, { width: 270, height: 62 });
      return;
    }

    const color = RARITY_COLORS[item.definition.rarity];
    this.add.rectangle(640, 304, 390, 238, color, 0.07).setStrokeStyle(2, color, 0.5);
    this.add.image(640, 296, resolveItemTexture(this, item.definition.id)).setDisplaySize(315, 220);
    this.centerLabel(640, 421, item.definition.name[this.locale], 24, '#f7f8fa', 'bold');
    this.centerLabel(640, 454, this.rarityLabel(item.definition.rarity), 16, this.hexColor(color), 'bold');

    if (this.revealStage === 'revealed') {
      this.centerLabel(640, 510, t(this.locale, 'unknownValue'), 18, '#aeb5c0');
      button(this, 640, 568, t(this.locale, 'appraise'), () => {
        this.revealStage = 'appraised';
        this.renderReveal();
      }, { width: 250, height: 58 });
      return;
    }

    this.label(420, 486, t(this.locale, 'condition'), 14, '#8b93a1');
    this.label(835, 486, `${this.conditionLabel(item.condition)} · ${Math.round(item.condition * 100)}%`, 14, this.hexColor(this.conditionColor(item.condition)), 'bold').setOrigin(1, 0);
    this.conditionBar(420, 511, 415, item.condition);
    this.label(420, 532, t(this.locale, 'estimatedValue'), 14, '#8b93a1');
    this.label(835, 525, this.money(item.appraisedValue), 28, '#63d28d', 'bold').setOrigin(1, 0);

    if (item.restored) {
      const grade = item.restorationGrade ? this.restorationGradeLabel(item.restorationGrade) : '';
      const gain = item.restorationGain ?? 0;
      this.centerLabel(640, 570, `${grade} · ${t(this.locale, 'restorationGain', { amount: this.money(gain) })}`, 14, '#63d28d', 'bold');
      button(this, 505, 607, t(this.locale, 'sell'), () => this.sellCurrentItem(), { width: 220, height: 50 });
      button(this, 775, 607, t(this.locale, 'keep'), () => this.keepCurrentItem(), { width: 220, height: 50, background: 0x3f73b8 });
      return;
    }

    button(this, 405, 603, t(this.locale, 'restore'), () => this.startRestoration(), { width: 190, height: 52, background: 0xc4773a });
    button(this, 640, 603, t(this.locale, 'sell'), () => this.sellCurrentItem(), { width: 190, height: 52 });
    button(this, 875, 603, t(this.locale, 'keep'), () => this.keepCurrentItem(), { width: 190, height: 52, background: 0x3f73b8 });
  }

  private startRestoration(): void {
    const item = this.items[this.revealIndex];
    if (!item || item.restored) return;

    this.revealStage = 'restoring';
    this.restorationTargetHalfWidth = this.targetHalfWidth(item.definition.rarity);
    const edge = this.restorationTargetHalfWidth + 0.08;
    this.restorationTargetCenter = Phaser.Math.FloatBetween(edge, 1 - edge);
    this.renderRestoration();
  }

  private renderRestoration(): void {
    const item = this.items[this.revealIndex];
    if (!item) return;

    this.resetCanvas();
    this.renderHeader();
    this.panel(180, 145, 920, 500);
    this.centerLabel(640, 190, t(this.locale, 'restorationTitle'), 34, '#e9b949', 'bold');

    this.add.image(380, 315, resolveItemTexture(this, item.definition.id)).setDisplaySize(300, 210);
    this.centerLabel(380, 433, `${t(this.locale, 'condition')}: ${Math.round(item.condition * 100)}%`, 18, '#d7dbe2', 'bold');

    this.label(565, 255, t(this.locale, 'restorationHelp'), 18, '#d7dbe2').setWordWrapWidth(420);

    const barX = 320;
    const barY = 500;
    const barWidth = 640;
    const targetX = barX + barWidth * this.restorationTargetCenter;
    const targetWidth = barWidth * this.restorationTargetHalfWidth * 2;

    this.add.rectangle(barX, barY, barWidth, 26, 0x2b3038).setOrigin(0, 0.5).setStrokeStyle(1, 0xffffff, 0.12);
    this.add.rectangle(targetX, barY, targetWidth, 26, 0x63d28d, 0.52).setStrokeStyle(2, 0x63d28d, 0.9);
    const marker = this.add.rectangle(barX, barY, 8, 54, 0xf7f8fa).setOrigin(0.5);
    const tween = this.tweens.add({
      targets: marker,
      x: barX + barWidth,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    button(this, 640, 585, t(this.locale, 'restorationStop'), () => {
      const markerPosition = Phaser.Math.Clamp((marker.x - barX) / barWidth, 0, 1);
      tween.stop();
      this.finishRestoration(markerPosition);
    }, { width: 260, height: 60, background: 0xc4773a });
  }

  private finishRestoration(markerPosition: number): void {
    const item = this.items[this.revealIndex];
    if (!item) return;

    const outcome = applyRestoration(
      item.appraisedValue,
      item.condition,
      markerPosition,
      this.restorationTargetCenter,
      this.restorationTargetHalfWidth,
    );

    item.condition = outcome.conditionAfter;
    item.appraisedValue = outcome.valueAfter;
    item.restored = true;
    item.restorationGrade = outcome.grade;
    item.restorationGain = outcome.valueGain;
    this.revealStage = 'appraised';
    this.renderReveal();
  }

  private sellCurrentItem(): void {
    const item = this.items[this.revealIndex];
    if (!item) return;
    this.store.sellItem(item.appraisedValue);
    this.roundSales += item.appraisedValue;
    this.advanceReveal();
  }

  private keepCurrentItem(): void {
    const item = this.items[this.revealIndex];
    if (!item) return;
    this.store.keepItem(item.definition.id);
    this.roundKept += 1;
    this.advanceReveal();
  }

  private advanceReveal(): void {
    this.revealIndex += 1;
    this.revealStage = 'closed';
    this.renderReveal();
  }

  private renderRoundSummary(): void {
    setGameplayActive(false);
    this.resetCanvas();
    this.renderHeader();
    this.panel(235, 155, 810, 470);
    this.centerLabel(640, 220, t(this.locale, 'roundDone'), 40, '#f7f8fa', 'bold');
    this.summaryRow(320, 300, t(this.locale, 'paid'), -this.roundCost);
    this.summaryRow(320, 352, t(this.locale, 'sales'), this.roundSales);
    this.summaryRow(320, 404, t(this.locale, 'kept'), this.roundKept, false);
    this.summaryRow(320, 456, t(this.locale, 'liquidResult'), this.roundSales - this.roundCost);
    button(this, 640, 555, t(this.locale, 'nextAuction'), () => {
      if (this.dailySpecial) {
        this.dailySpecial = null;
        this.currentTierId = highestUnlockedAuctionTier(this.store.snapshot.reputationXp).id;
      }
      this.prepareNextLot();
      this.renderLobby();
    }, { width: 290, height: 64 });
  }

  private summaryRow(x: number, y: number, label: string, value: number, money = true): void {
    this.label(x, y, label, 20, '#aeb5c0');
    const formatted = money ? `${value >= 0 ? '+' : ''}${this.money(value)}` : String(value);
    const color = money && value < 0 ? '#ff8d85' : '#f7f8fa';
    this.label(820, y, formatted, 22, color, 'bold').setOrigin(1, 0);
  }

  private renderHeader(): void {
    this.label(70, 42, t(this.locale, 'title'), 28, '#f7f8fa', 'bold');
    this.label(70, 80, t(this.locale, 'subtitle'), 15, '#737b88');
    const save = this.store.snapshot;
    this.stat(760, t(this.locale, 'cash'), this.money(save.cash));
    this.stat(930, t(this.locale, 'collection'), String(uniqueCollectionCount(save.collection)));
    this.stat(1080, t(this.locale, 'reputation'), `${Math.floor(save.reputationXp)} REP`);
  }

  private stat(x: number, label: string, value: string): void {
    this.label(x, 43, label.toUpperCase(), 12, '#737b88');
    this.label(x, 67, value, 20, '#f7f8fa', 'bold');
  }

  private renderLotArtwork(x: number, y: number, width: number, height: number): void {
    const texture = resolveLotTexture(this, this.lot.id);
    if (!texture) {
      this.add.rectangle(x, y, width, height, 0x20242b).setStrokeStyle(1, 0xffffff, 0.08);
      return;
    }
    this.add.image(x, y, texture).setDisplaySize(width, height);
    this.add.rectangle(x, y, width, height, 0x000000, 0).setStrokeStyle(1, 0xffffff, 0.12);
  }

  private conditionBar(x: number, y: number, width: number, condition: number): void {
    const normalized = Phaser.Math.Clamp(condition, 0, 1);
    this.add.rectangle(x, y, width, 8, 0x2b3038).setOrigin(0, 0.5);
    this.add.rectangle(x, y, width * normalized, 8, this.conditionColor(normalized)).setOrigin(0, 0.5);
  }

  private resetCanvas(): void {
    this.children.removeAll(true);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x101216);
    this.add.rectangle(1050, HEIGHT / 2, 460, HEIGHT, 0xe9b949, 0.018);
    this.add.rectangle(WIDTH / 2, 116, WIDTH - 120, 1, 0x2b3038);
  }

  private panel(x: number, y: number, width: number, height: number, color = 0x15181e): Phaser.GameObjects.Rectangle {
    return this.add.rectangle(x, y, width, height, color, 1).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.08);
  }

  private divider(x: number, y: number, width: number): void {
    this.add.rectangle(x, y, width, 1, 0xffffff, 0.08).setOrigin(0);
  }

  private label(x: number, y: number, text: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: `${size}px`,
      fontStyle: style,
      color,
    });
  }

  private centerLabel(x: number, y: number, text: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
    return this.label(x, y, text, size, color, style).setOrigin(0.5);
  }

  private rarityLabel(rarity: Rarity): string {
    switch (rarity) {
      case 'common': return t(this.locale, 'rarity_common');
      case 'uncommon': return t(this.locale, 'rarity_uncommon');
      case 'rare': return t(this.locale, 'rarity_rare');
      case 'epic': return t(this.locale, 'rarity_epic');
      case 'legendary': return t(this.locale, 'rarity_legendary');
    }
  }

  private conditionLabel(condition: number): string {
    if (condition < 0.55) return t(this.locale, 'conditionPoor');
    if (condition < 0.7) return t(this.locale, 'conditionFair');
    if (condition < 0.86) return t(this.locale, 'conditionGood');
    return t(this.locale, 'conditionExcellent');
  }

  private restorationGradeLabel(grade: RestorationGrade): string {
    switch (grade) {
      case 'perfect': return t(this.locale, 'restorationPerfect');
      case 'good': return t(this.locale, 'restorationGood');
      case 'rough': return t(this.locale, 'restorationRough');
    }
  }

  private conditionColor(condition: number): number {
    if (condition < 0.55) return 0xff8d85;
    if (condition < 0.7) return 0xe9b949;
    if (condition < 0.86) return 0x63d28d;
    return 0x61a8ff;
  }

  private targetHalfWidth(rarity: Rarity): number {
    switch (rarity) {
      case 'common': return 0.14;
      case 'uncommon': return 0.12;
      case 'rare': return 0.105;
      case 'epic': return 0.09;
      case 'legendary': return 0.075;
    }
  }

  private money(value: number): string {
    const formatted = new Intl.NumberFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value);
    return `${formatted} ₽`;
  }

  private roundToBid(value: number): number {
    return Math.max(this.lot.reservePrice, Math.round(value / this.lot.bidIncrement) * this.lot.bidIncrement);
  }

  private hexColor(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }
}
