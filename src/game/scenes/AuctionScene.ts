import Phaser from 'phaser';
import { trackEvent } from '../../analytics';
import { BIDDER_PROFILES, BIDDER_TELL_TEXT, ITEM_CONDITION_RANGE, MARKET_FACTOR_RANGE } from '../../data/balance';
import { ITEM_BY_ID, LOTS } from '../../data/catalog';
import { uniqueCollectionCount } from '../../data/collections';
import { getDailySpecial, localDayKey, type DailySpecialDefinition } from '../../data/daily';
import { ADVANCED_INSPECTION_COST, ADVANCED_INSPECTION_MIN_REP } from '../../data/inspection';
import { LOT_MODIFIERS, LOT_MODIFIER_CHANCE } from '../../data/lotModifiers';
import { MONETIZATION_POLICY } from '../../data/monetization';
import { AUCTION_TIERS, getAuctionTier, highestUnlockedAuctionTier, type AuctionTierId } from '../../data/tiers';
import {
  chooseRandom,
  createAuctionOpponents,
  createLotItems,
  eligibleOpponents,
  nextBid,
  opponentTell,
} from '../../domain/auction';
import type { AuctionOpponent, BidderTell } from '../../domain/auction';
import { inspectLot, type InspectionConditionBand, type InspectionReport } from '../../domain/inspection';
import {
  applyLotModifier,
  modifierConditionRange,
  modifierMarketMultiplier,
  selectLotModifier,
  type LotModifierDefinition,
} from '../../domain/lotModifier';
import { chooseDistinctRandom } from '../../domain/lotSelection';
import { rewardedSummaryBonus, shouldRequestInterstitial } from '../../domain/monetization';
import { applyRestoration } from '../../domain/restoration';
import type { Locale, LotTemplate, Rarity, RestorationGrade, RevealedItem } from '../../domain/types';
import { t } from '../../i18n';
import { isAdvertisingAvailable, showInterstitialAd, showRewardedAd } from '../../platform/ads';
import { getPlatformLocale, markGameReady, setGameplayActive } from '../../platform/yandex';
import { preloadArt, resolveItemTexture, resolveLotTexture } from '../art';
import { playFeedbackCue } from '../feedback';
import { GameStore } from '../store';
import { button } from '../ui';

type RevealStage = 'closed' | 'revealed' | 'appraised' | 'restoring';

interface LotChoice {
  lot: LotTemplate;
  modifier: LotModifierDefinition | null;
}

const WIDTH = 1280;
const HEIGHT = 720;
const LOT_CHOICE_COUNT = 3;

const RARITY_COLORS: Record<Rarity, number> = {
  common: 0xaeb5c0,
  uncommon: 0x63d28d,
  rare: 0x61a8ff,
  epic: 0xb576ff,
  legendary: 0xffc857,
};

const TELL_COLORS: Record<BidderTell, string> = {
  calm: '#8b93a1',
  watching: '#d7dbe2',
  hesitating: '#e9b949',
  out: '#666e79',
};

export class AuctionScene extends Phaser.Scene {
  private static lotChoiceCycle = -1;
  private static readonly lotChoiceCache = new Map<AuctionTierId, LotChoice[]>();

  private readonly store = new GameStore();
  private locale: Locale = 'en';
  private lot!: LotTemplate;
  private lotChoices: LotChoice[] = [];
  private lotModifier: LotModifierDefinition | null = null;
  private inspectionReport: InspectionReport | null = null;
  private items: RevealedItem[] = [];
  private opponents: AuctionOpponent[] = [];
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
  private roundKeptValue = 0;
  private roundReputationGain = 0;
  private roundRewardClaimed = false;
  private roundTelemetrySent = false;
  private rewardedAdPending = false;
  private transitionAdPending = false;
  private restorationUsed = false;
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
    this.prepareLotChoices();
    this.renderLotSelection();
    markGameReady();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => setGameplayActive(false));
  }

  private prepareLotChoices(): void {
    const save = this.store.snapshot;
    let tier = getAuctionTier(this.currentTierId);
    if (save.reputationXp < tier.minReputationXp) {
      tier = highestUnlockedAuctionTier(save.reputationXp);
      this.currentTierId = tier.id;
    }

    if (AuctionScene.lotChoiceCycle !== save.auctionsPlayed) {
      AuctionScene.lotChoiceCycle = save.auctionsPlayed;
      AuctionScene.lotChoiceCache.clear();
    }

    const cachedChoices = AuctionScene.lotChoiceCache.get(this.currentTierId);
    if (cachedChoices) {
      this.lotChoices = cachedChoices;
      this.trackLotOptionsPresented();
      return;
    }

    const tierLots = tier.lotIds
      .map((lotId) => LOTS.find((candidate) => candidate.id === lotId))
      .filter((candidate): candidate is LotTemplate => Boolean(candidate));
    const baseLots = chooseDistinctRandom(tierLots, LOT_CHOICE_COUNT);
    if (baseLots.length === 0) throw new Error(`No lot templates configured for tier ${tier.id}`);

    this.lotChoices = baseLots.map((baseLot) => {
      const modifier = selectLotModifier(LOT_MODIFIERS, LOT_MODIFIER_CHANCE);
      return {
        lot: applyLotModifier(baseLot, modifier),
        modifier,
      };
    });
    AuctionScene.lotChoiceCache.set(this.currentTierId, this.lotChoices);
    this.trackLotOptionsPresented();
  }

  private trackLotOptionsPresented(): void {
    trackEvent('lot_options_presented', {
      tierId: this.currentTierId,
      lotIds: this.lotChoices.map((choice) => choice.lot.id),
      modifierIds: this.lotChoices.map((choice) => choice.modifier?.id ?? null),
    });
  }

  private prepareDailyLot(): void {
    const daily = this.dailySpecial;
    if (!daily) return;
    const baseLot = LOTS.find((candidate) => candidate.id === daily.lotId);
    if (!baseLot) throw new Error(`Daily lot template ${daily.lotId} is missing`);
    this.currentTierId = daily.tierId;
    this.prepareLot(baseLot, null, daily.valueMultiplier);
  }

  private prepareLot(lot: LotTemplate, modifier: LotModifierDefinition | null, valueMultiplier = 1): void {
    this.lot = lot;
    this.lotModifier = modifier;
    const conditionRange = modifierConditionRange(ITEM_CONDITION_RANGE, modifier);
    const marketMultiplier = valueMultiplier * modifierMarketMultiplier(modifier);

    this.items = createLotItems(
      this.lot,
      ITEM_BY_ID,
      conditionRange,
      MARKET_FACTOR_RANGE,
      marketMultiplier,
    );
    this.opponents = createAuctionOpponents(this.lot, this.items, BIDDER_PROFILES);
    this.resetRoundState();
  }

  private resetRoundState(): void {
    this.inspectionReport = null;
    this.currentBid = this.lot.reservePrice;
    this.currentLeader = this.opponents[0]?.id ?? '';
    this.awaitingNpc = false;
    this.revealIndex = 0;
    this.revealStage = 'closed';
    this.roundCost = 0;
    this.roundSales = 0;
    this.roundKept = 0;
    this.roundKeptValue = 0;
    this.roundReputationGain = 0;
    this.roundRewardClaimed = false;
    this.roundTelemetrySent = false;
    this.rewardedAdPending = false;
    this.transitionAdPending = false;
    this.restorationUsed = false;
    this.notice = '';
  }

  private selectLotChoice(choice: LotChoice, optionIndex: number): void {
    trackEvent('lot_option_selected', {
      tierId: this.currentTierId,
      lotId: choice.lot.id,
      optionIndex,
      reservePrice: choice.lot.reservePrice,
      itemCount: choice.lot.itemCount,
      modifierId: choice.modifier?.id,
    });
    this.lotChoices = [];
    this.prepareLot(choice.lot, choice.modifier);
    this.renderLobby();
  }

  private renderLotSelection(): void {
    setGameplayActive(false);
    this.resetCanvas();
    this.renderHeader();
    this.renderTierTabs(true);

    this.label(70, 198, t(this.locale, 'chooseLotTitle'), 28, '#f7f8fa', 'bold');
    this.label(70, 235, t(this.locale, 'chooseLotHint'), 14, '#8b93a1').setWordWrapWidth(680);

    button(this, 940, 218, t(this.locale, 'collectionBook'), () => this.scene.start('collection'), {
      width: 180,
      height: 38,
      background: 0x61a8ff,
      hitSlop: 4,
    });
    this.renderDailyControl(218, 1140, 180);

    const cardXs = [70, 445, 820];
    this.lotChoices.forEach((choice, index) => {
      const x = cardXs[index];
      if (x === undefined) return;
      const centerX = x + 170;
      this.panel(x, 280, 340, 370, 0x15181e);
      this.renderLotArtworkFor(choice.lot, centerX, 340, 300, 105);
      this.centerLabel(centerX, 407, choice.lot.name[this.locale], 20, '#f7f8fa', 'bold').setWordWrapWidth(300);
      this.centerLabel(centerX, 434, choice.lot.location[this.locale], 12, '#8b93a1');

      this.label(x + 20, 462, t(this.locale, 'reservePrice'), 12, '#737b88');
      this.label(x + 320, 458, this.money(choice.lot.reservePrice), 17, '#f7f8fa', 'bold').setOrigin(1, 0);
      this.label(x + 20, 489, t(this.locale, 'itemsInside'), 12, '#737b88');
      this.label(x + 320, 485, String(choice.lot.itemCount), 17, '#f7f8fa', 'bold').setOrigin(1, 0);

      const eventText = choice.modifier
        ? `${t(this.locale, 'event').toUpperCase()} · ${choice.modifier.name[this.locale]}`
        : t(this.locale, 'noEvent');
      this.label(x + 20, 516, eventText, 12, choice.modifier ? '#e9b949' : '#666e79', choice.modifier ? 'bold' : 'normal');
      this.label(x + 20, 542, t(this.locale, 'visibleClues'), 11, '#8b93a1', 'bold');
      choice.lot.clues.slice(0, 2).forEach((clue, clueIndex) => {
        this.label(
          x + 20,
          562 + clueIndex * 21,
          `• ${this.compactText(clue.text[this.locale], 48)}`,
          11,
          '#c3c8d0',
        );
      });

      button(this, centerX, 625, t(this.locale, 'chooseLot'), () => this.selectLotChoice(choice, index), {
        width: 250,
        height: 42,
        hitSlop: 6,
      });
    });
  }

  private renderLobby(): void {
    this.resetCanvas();
    this.renderHeader();
    this.renderTierTabs(false);

    this.panel(70, 190, 760, 460);
    const lotEyebrow = this.dailySpecial ? t(this.locale, 'dailySpecial').toUpperCase() : t(this.locale, 'lot').toUpperCase();
    this.label(105, 214, lotEyebrow, 14, this.dailySpecial ? '#e9b949' : '#8b93a1', this.dailySpecial ? 'bold' : 'normal');
    this.label(105, 242, this.lot.name[this.locale], 32, '#f7f8fa', 'bold');
    this.label(105, 284, `${t(this.locale, 'location')}: ${this.lot.location[this.locale]}`, 16, '#aeb5c0');

    if (this.lotModifier) {
      this.label(105, 316, `${t(this.locale, 'event').toUpperCase()} · ${this.lotModifier.name[this.locale]}`, 14, '#e9b949', 'bold');
      this.label(105, 340, this.lotModifier.description[this.locale], 13, '#aeb5c0').setWordWrapWidth(340);
      this.renderLotArtwork(285, 495, 360, 180);
    } else {
      this.renderLotArtwork(285, 438, 360, 205);
    }

    this.label(500, 322, t(this.locale, 'visibleClues'), 18, '#e9b949', 'bold');
    this.label(500, 348, t(this.locale, 'clueBackedHint'), 12, '#737b88').setWordWrapWidth(285);
    this.lot.clues.forEach((clue, index) => {
      this.label(500, 385 + index * 64, `• ${clue.text[this.locale]}`, 17, '#d7dbe2').setWordWrapWidth(285);
    });

    this.panel(865, 190, 345, 460, 0x171a20);
    this.label(900, 215, t(this.locale, 'currentBid'), 14, '#8b93a1');
    this.label(900, 240, this.money(this.lot.reservePrice), 32, '#f7f8fa', 'bold');
    this.divider(900, 286, 275);
    this.label(900, 301, t(this.locale, 'bidIncrement'), 13, '#8b93a1');
    this.label(900, 324, `+${this.money(this.lot.bidIncrement)}`, 21, '#d7dbe2', 'bold');
    this.label(900, 359, t(this.locale, 'itemsInside'), 13, '#8b93a1');
    this.label(900, 382, String(this.lot.itemCount), 21, '#f7f8fa', 'bold');

    this.renderInspectionControl();

    button(this, 1038, 620, this.dailySpecial ? t(this.locale, 'startDailyAuction') : t(this.locale, 'startAuction'), () => this.startAuction(), {
      width: 270,
      height: 48,
      hitSlop: 4,
    });
  }

  private renderTierTabs(interactive: boolean): void {
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

      if (interactive && unlocked && !selected) {
        rect.setInteractive({ useHandCursor: true });
        rect.on('pointerover', () => rect.setStrokeStyle(1, tier.accent, 0.6));
        rect.on('pointerout', () => rect.setStrokeStyle(1, 0xffffff, 0.18));
        rect.on('pointerup', () => {
          if (!interactive) return;
          playFeedbackCue(this, 'ui');
          trackEvent('tier_selected', { tierId: tier.id, reputationXp });
          this.dailySpecial = null;
          this.currentTierId = tier.id;
          this.prepareLotChoices();
          this.renderLotSelection();
        });
      }
    });
  }

  private renderInspectionControl(): void {
    const save = this.store.snapshot;
    const fee = ADVANCED_INSPECTION_COST[this.currentTierId];
    this.label(900, 414, t(this.locale, 'advancedInspection'), 12, '#8b93a1', 'bold');

    if (this.inspectionReport) {
      const condition = this.inspectionConditionLabel(this.inspectionReport.conditionBand);
      const premium = this.inspectionPremiumLabel(this.inspectionReport.premiumFinds);
      this.centerLabel(1038, 468, `${condition} · ${premium}`, 12, '#63d28d', 'bold').setWordWrapWidth(270);
      return;
    }

    if (save.reputationXp < ADVANCED_INSPECTION_MIN_REP) {
      this.centerLabel(1038, 468, t(this.locale, 'inspectionLocked', { xp: ADVANCED_INSPECTION_MIN_REP }), 12, '#737b88');
      return;
    }

    button(this, 1038, 468, t(this.locale, 'inspectLot', { amount: this.money(fee) }), () => this.useAdvancedInspection(), {
      width: 270,
      height: 36,
      background: 0x3f73b8,
      disabled: !this.store.canAfford(fee),
      hitSlop: 4,
    });
  }

  private useAdvancedInspection(): void {
    if (this.inspectionReport) return;
    const save = this.store.snapshot;
    if (save.reputationXp < ADVANCED_INSPECTION_MIN_REP) return;

    const fee = ADVANCED_INSPECTION_COST[this.currentTierId];
    if (!this.store.payInspectionFee(fee)) return;

    this.inspectionReport = inspectLot(this.items);
    trackEvent('advanced_inspection_used', {
      lotId: this.lot.id,
      tierId: this.currentTierId,
      fee,
      conditionBand: this.inspectionReport.conditionBand,
      premiumFinds: this.inspectionReport.premiumFinds,
      daily: Boolean(this.dailySpecial),
      modifierId: this.lotModifier?.id,
    });
    this.renderLobby();
  }

  private renderDailyControl(y = 540, x = 1038, width = 270): void {
    const today = localDayKey();
    const completed = this.store.snapshot.lastDailyCompletedDay === today;

    if (completed) {
      this.centerLabel(x, y, t(this.locale, 'dailyComplete'), 12, '#63d28d', 'bold').setWordWrapWidth(width);
      return;
    }

    if (this.dailySpecial?.dayKey === today) {
      this.centerLabel(x, y, t(this.locale, 'dailyActive'), 12, '#e9b949', 'bold').setWordWrapWidth(width);
      return;
    }

    button(this, x, y, t(this.locale, 'dailySpecial'), () => this.activateDailySpecial(), {
      width,
      height: 38,
      background: 0xc4773a,
      hitSlop: 4,
    });
  }

  private activateDailySpecial(): void {
    const today = localDayKey();
    const save = this.store.snapshot;
    if (save.lastDailyCompletedDay === today) return;

    this.dailySpecial = getDailySpecial(today, save.reputationXp);
    this.currentTierId = this.dailySpecial.tierId;
    trackEvent('daily_special_activated', {
      dayKey: this.dailySpecial.dayKey,
      tierId: this.dailySpecial.tierId,
      lotId: this.dailySpecial.lotId,
    });
    this.prepareDailyLot();
    this.renderLobby();
  }

  private startAuction(): void {
    const auctionNumber = this.store.recordAuctionPlayed();
    trackEvent('auction_started', {
      auctionNumber,
      lotId: this.lot.id,
      tierId: this.currentTierId,
      daily: Boolean(this.dailySpecial),
      openingBid: this.lot.reservePrice,
      modifierId: this.lotModifier?.id,
    });
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
    if (this.lotModifier) this.label(80, 225, `${t(this.locale, 'event').toUpperCase()} · ${this.lotModifier.name[this.locale]}`, 13, '#e9b949', 'bold');

    this.panel(70, 245, 760, 370);
    this.renderLotArtwork(645, 342, 300, 150);
    this.add.rectangle(495, 267, 1, 326, 0xffffff, 0.08).setOrigin(0);
    this.label(105, 285, t(this.locale, 'currentBid'), 17, '#8b93a1');
    this.label(105, 321, this.money(this.currentBid), 52, '#f7f8fa', 'bold');

    const leaderName = this.currentLeader === 'player'
      ? t(this.locale, 'you')
      : this.opponents.find((opponent) => opponent.id === this.currentLeader)?.name[this.locale] ?? t(this.locale, 'npc');

    this.label(105, 402, `${t(this.locale, 'leader')}: ${leaderName}`, 21, this.currentLeader === 'player' ? '#63d28d' : '#d7dbe2', 'bold');
    if (this.notice) this.label(105, 452, this.notice, 17, '#ff8d85');

    this.label(520, 430, t(this.locale, 'visibleClues'), 13, '#e9b949', 'bold');
    this.lot.clues.forEach((clue, index) => {
      this.label(520, 450 + index * 22, `• ${clue.text[this.locale]}`, 12, '#aeb5c0').setWordWrapWidth(285);
    });

    const requiredBid = nextBid(this.currentBid, this.lot);
    const canBid = this.store.canAfford(requiredBid) && !this.awaitingNpc;
    button(this, 250, 555, `${t(this.locale, 'bid')} +${this.money(this.lot.bidIncrement)}`, () => this.placePlayerBid(), {
      width: 280,
      height: 64,
      disabled: !canBid,
      feedback: false,
    });
    button(this, 560, 555, t(this.locale, 'pass'), () => this.passAuction(), {
      width: 220,
      height: 64,
      background: 0x2c313a,
      disabled: this.awaitingNpc,
      feedback: false,
    });

    this.panel(865, 245, 345, 370, 0x171a20);
    this.label(900, 275, t(this.locale, 'bidders'), 19, '#e9b949', 'bold');
    this.opponents.forEach((opponent, index) => {
      const y = 320 + index * 92;
      const active = opponent.id === this.currentLeader;
      const tell = opponentTell(opponent, this.currentBid, this.lot);
      const trait = opponent.trait?.[this.locale];
      const detail = trait ? `${trait} · ${BIDDER_TELL_TEXT[tell][this.locale]}` : BIDDER_TELL_TEXT[tell][this.locale];
      this.label(900, y, opponent.name[this.locale], 19, active ? '#f7f8fa' : tell === 'out' ? '#666e79' : '#aeb5c0', active ? 'bold' : 'normal');
      this.label(900, y + 28, detail, 12, TELL_COLORS[tell]).setWordWrapWidth(225);
      this.label(1145, y + 2, active ? '●' : tell === 'out' ? '×' : '○', 17, active ? '#e9b949' : '#555c68');
    });
  }

  private placePlayerBid(): void {
    if (this.awaitingNpc) return;
    const requiredBid = nextBid(this.currentBid, this.lot);
    if (!this.store.canAfford(requiredBid)) {
      this.notice = t(this.locale, 'notEnoughCash');
      this.renderBidding();
      return;
    }

    this.currentBid = requiredBid;
    this.currentLeader = 'player';
    this.awaitingNpc = true;
    this.notice = '';
    playFeedbackCue(this, 'bid');
    trackEvent('bid_placed', {
      lotId: this.lot.id,
      tierId: this.currentTierId,
      bid: this.currentBid,
      cash: this.store.snapshot.cash,
      daily: Boolean(this.dailySpecial),
    });
    this.renderBidding();
    this.time.delayedCall(550, () => this.npcRespond());
  }

  private npcRespond(): void {
    const eligible = eligibleOpponents(this.opponents, this.currentBid, this.lot);
    if (eligible.length === 0) {
      this.time.delayedCall(450, () => this.finalizeWin());
      return;
    }

    const opponent = chooseRandom(eligible);
    if (!opponent) {
      this.finalizeWin();
      return;
    }

    this.currentBid = nextBid(this.currentBid, this.lot);
    this.currentLeader = opponent.id;
    this.awaitingNpc = false;
    playFeedbackCue(this, 'npc-bid');
    this.renderBidding();
  }

  private passAuction(): void {
    playFeedbackCue(this, 'pass');
    trackEvent('auction_passed', {
      lotId: this.lot.id,
      tierId: this.currentTierId,
      currentBid: this.currentBid,
      daily: Boolean(this.dailySpecial),
    });
    setGameplayActive(false);
    this.resetCanvas();
    this.renderHeader();
    this.panel(260, 180, 760, 390);
    this.centerLabel(640, 265, t(this.locale, 'lost'), 40, '#f7f8fa', 'bold');
    this.centerLabel(640, 330, `${t(this.locale, 'currentBid')}: ${this.money(this.currentBid)}`, 22, '#aeb5c0');
    button(this, 640, 465, t(this.locale, 'nextAuction'), () => {
      this.continueAfterNaturalBreak(() => {
        if (this.dailySpecial) {
          this.dailySpecial = null;
          this.currentTierId = highestUnlockedAuctionTier(this.store.snapshot.reputationXp).id;
        }
        this.prepareLotChoices();
        this.renderLotSelection();
      });
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
    const save = this.store.snapshot;
    trackEvent('auction_won', {
      finalBid: this.currentBid,
      reputationGain: this.roundReputationGain,
      auctionsWon: save.auctionsWon,
      lotId: this.lot.id,
      tierId: this.currentTierId,
      daily: Boolean(completedDailyDay),
    });
    if (completedDailyDay) {
      trackEvent('daily_special_completed', {
        dayKey: completedDailyDay,
        reputationGain: this.roundReputationGain,
      });
    }
    playFeedbackCue(this, 'win');
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
    this.centerLabel(640, 497, t(this.locale, 'wonValueTease'), 17, '#d7dbe2');
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
      this.centerLabel(640, 458, t(this.locale, 'sealedFind'), 19, '#aeb5c0');
      button(this, 640, 555, t(this.locale, 'reveal'), () => {
        playFeedbackCue(this, 'reveal');
        trackEvent('item_revealed', {
          itemId: item.definition.id,
          rarity: item.definition.rarity,
        });
        this.revealStage = 'revealed';
        this.renderReveal();
      }, { width: 270, height: 62, feedback: false });
      return;
    }

    const color = RARITY_COLORS[item.definition.rarity];
    this.add.rectangle(640, 304, 390, 238, color, 0.07).setStrokeStyle(2, color, 0.5);
    const itemImage = this.add.image(640, 310, resolveItemTexture(this, item.definition.id)).setDisplaySize(315, 220).setAlpha(0.35);
    this.tweens.add({ targets: itemImage, y: 296, alpha: 1, duration: 180, ease: 'Cubic.Out' });
    this.centerLabel(640, 414, item.definition.name[this.locale], 24, '#f7f8fa', 'bold');
    this.centerLabel(640, 446, this.rarityLabel(item.definition.rarity), 16, this.hexColor(color), 'bold');

    if (this.revealStage === 'revealed') {
      this.centerLabel(640, 510, t(this.locale, 'unknownValue'), 18, '#aeb5c0');
      button(this, 640, 568, t(this.locale, 'appraise'), () => {
        playFeedbackCue(this, 'appraise');
        trackEvent('item_appraised', {
          itemId: item.definition.id,
          value: item.appraisedValue,
          condition: item.condition,
        });
        this.revealStage = 'appraised';
        this.renderReveal();
      }, { width: 250, height: 58, feedback: false });
      return;
    }

    const alreadyOwned = this.store.snapshot.collection.includes(item.definition.id);
    if (alreadyOwned) this.centerLabel(640, 470, t(this.locale, 'alreadyCollected'), 13, '#61a8ff', 'bold');

    this.label(420, 486, t(this.locale, 'condition'), 14, '#8b93a1');
    this.label(835, 486, `${this.conditionLabel(item.condition)} · ${Math.round(item.condition * 100)}%`, 14, this.hexColor(this.conditionColor(item.condition)), 'bold').setOrigin(1, 0);
    this.conditionBar(420, 511, 415, item.condition);
    this.label(420, 526, t(this.locale, 'estimatedValue'), 14, '#8b93a1');
    this.label(835, 519, this.money(item.appraisedValue), 28, '#63d28d', 'bold').setOrigin(1, 0);

    if (item.restored) {
      const grade = item.restorationGrade ? this.restorationGradeLabel(item.restorationGrade) : '';
      const gain = item.restorationGain ?? 0;
      this.centerLabel(640, 565, `${grade} · ${t(this.locale, 'restorationGain', { amount: this.money(gain) })}`, 14, '#63d28d', 'bold');
      button(this, 505, 607, alreadyOwned ? t(this.locale, 'sellDuplicate') : t(this.locale, 'sell'), () => this.sellCurrentItem(), { width: 220, height: 50, feedback: false });
      button(this, 775, 607, t(this.locale, 'keep'), () => this.keepCurrentItem(), { width: 220, height: 50, background: 0x3f73b8, feedback: false });
      return;
    }

    const canRestore = !this.restorationUsed;
    this.centerLabel(640, 565, canRestore ? t(this.locale, 'restorationAvailable') : t(this.locale, 'restorationSpent'), 13, canRestore ? '#c9955f' : '#737b88', 'bold');
    button(this, 405, 607, t(this.locale, 'restore'), () => this.startRestoration(), {
      width: 190,
      height: 50,
      background: 0xc4773a,
      disabled: !canRestore,
    });
    button(this, 640, 607, alreadyOwned ? t(this.locale, 'sellDuplicate') : t(this.locale, 'sell'), () => this.sellCurrentItem(), { width: 190, height: 50, feedback: false });
    button(this, 875, 607, t(this.locale, 'keep'), () => this.keepCurrentItem(), { width: 190, height: 50, background: 0x3f73b8, feedback: false });
  }

  private startRestoration(): void {
    const item = this.items[this.revealIndex];
    if (!item || item.restored || this.restorationUsed) return;

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
    if (!item || this.restorationUsed) return;

    const outcome = applyRestoration(
      item.appraisedValue,
      item.condition,
      markerPosition,
      this.restorationTargetCenter,
      this.restorationTargetHalfWidth,
    );

    trackEvent('restoration_completed', {
      itemId: item.definition.id,
      grade: outcome.grade,
      conditionBefore: outcome.conditionBefore,
      conditionAfter: outcome.conditionAfter,
      valueGain: outcome.valueGain,
    });
    item.condition = outcome.conditionAfter;
    item.appraisedValue = outcome.valueAfter;
    item.restored = true;
    item.restorationGrade = outcome.grade;
    item.restorationGain = outcome.valueGain;
    this.restorationUsed = true;
    this.revealStage = 'appraised';
    playFeedbackCue(this, outcome.grade === 'perfect' ? 'restore-perfect' : outcome.grade === 'good' ? 'restore-good' : 'restore-rough');
    this.renderReveal();
  }

  private sellCurrentItem(): void {
    const item = this.items[this.revealIndex];
    if (!item) return;
    this.store.sellItem(item.appraisedValue, item.definition.id);
    this.roundSales += item.appraisedValue;
    playFeedbackCue(this, 'sell');
    this.advanceReveal();
  }

  private keepCurrentItem(): void {
    const item = this.items[this.revealIndex];
    if (!item) return;
    this.store.keepItem(item.definition.id);
    this.roundKept += 1;
    this.roundKeptValue += item.appraisedValue;
    playFeedbackCue(this, 'keep');
    this.advanceReveal();
  }

  private advanceReveal(): void {
    this.revealIndex += 1;
    this.revealStage = 'closed';
    this.renderReveal();
  }

  private renderRoundSummary(): void {
    setGameplayActive(false);
    const totalEstimatedValue = this.roundSales + this.roundKeptValue;
    const totalEstimatedResult = totalEstimatedValue - this.roundCost;

    if (!this.roundTelemetrySent) {
      this.roundTelemetrySent = true;
      trackEvent('round_completed', {
        lotId: this.lot.id,
        tierId: this.currentTierId,
        cost: this.roundCost,
        sales: this.roundSales,
        kept: this.roundKept,
        keptValue: this.roundKeptValue,
        totalEstimatedResult,
        daily: Boolean(this.dailySpecial),
      });
    }

    this.resetCanvas();
    this.renderHeader();
    this.panel(235, 120, 810, 540);
    this.centerLabel(640, 170, t(this.locale, 'roundDone'), 38, '#f7f8fa', 'bold');
    this.summaryRow(320, 235, t(this.locale, 'paid'), -this.roundCost);
    this.summaryRow(320, 280, t(this.locale, 'sales'), this.roundSales);
    this.summaryRow(320, 325, t(this.locale, 'keptValue', { count: this.roundKept }), this.roundKeptValue);
    this.summaryRow(320, 370, t(this.locale, 'liquidResult'), this.roundSales - this.roundCost);
    this.summaryRow(320, 415, t(this.locale, 'estimatedResult'), totalEstimatedResult);

    const reward = rewardedSummaryBonus(totalEstimatedValue, MONETIZATION_POLICY.rewardedSummary);
    if (this.roundRewardClaimed) {
      this.centerLabel(640, 500, t(this.locale, 'adRewardClaimed', { amount: this.money(reward) }), 15, '#63d28d', 'bold');
    } else if (isAdvertisingAvailable('rewarded')) {
      button(
        this,
        640,
        500,
        this.rewardedAdPending ? t(this.locale, 'adLoading') : t(this.locale, 'watchAdReward', { amount: this.money(reward) }),
        () => this.claimRoundRewardedBonus(),
        {
          width: 330,
          height: 50,
          background: 0xc4773a,
          disabled: this.rewardedAdPending,
        },
      );
    } else {
      this.centerLabel(640, 500, t(this.locale, 'adUnavailable'), 14, '#737b88');
    }

    button(this, 640, 590, t(this.locale, 'nextAuction'), () => {
      this.continueAfterNaturalBreak(() => {
        if (this.dailySpecial) {
          this.dailySpecial = null;
          this.currentTierId = highestUnlockedAuctionTier(this.store.snapshot.reputationXp).id;
        }
        this.prepareLotChoices();
        this.renderLotSelection();
      });
    }, { width: 290, height: 60, disabled: this.transitionAdPending });
  }

  private claimRoundRewardedBonus(): void {
    if (this.roundRewardClaimed || this.rewardedAdPending) return;

    const rewardBasis = this.roundSales + this.roundKeptValue;
    const reward = rewardedSummaryBonus(rewardBasis, MONETIZATION_POLICY.rewardedSummary);
    this.rewardedAdPending = true;
    this.renderRoundSummary();
    trackEvent('rewarded_ad_requested', { placement: 'round_summary', reward });

    void showRewardedAd(() => {
      if (this.roundRewardClaimed) return;
      this.store.grantBonusCash(reward);
      this.roundRewardClaimed = true;
      playFeedbackCue(this, 'reward');
      trackEvent('rewarded_ad_rewarded', { placement: 'round_summary', reward });
    }).then((result) => {
      this.rewardedAdPending = false;
      trackEvent('rewarded_ad_closed', {
        placement: 'round_summary',
        reward,
        rewarded: result.rewarded,
        wasShown: result.wasShown,
        outcome: result.status,
      });
      this.time.delayedCall(0, () => this.renderRoundSummary());
    });
  }

  private continueAfterNaturalBreak(onContinue: () => void): void {
    if (this.transitionAdPending) return;
    this.transitionAdPending = true;

    const auctionNumber = this.store.snapshot.auctionsPlayed;
    const shouldShow = isAdvertisingAvailable('interstitial')
      && shouldRequestInterstitial(auctionNumber, MONETIZATION_POLICY.interstitial);

    const finish = (): void => {
      this.time.delayedCall(0, () => {
        this.transitionAdPending = false;
        onContinue();
      });
    };

    if (!shouldShow) {
      finish();
      return;
    }

    trackEvent('interstitial_ad_requested', { placement: 'between_auctions', auctionNumber });
    void showInterstitialAd().then((result) => {
      trackEvent('interstitial_ad_closed', {
        placement: 'between_auctions',
        auctionNumber,
        wasShown: result.wasShown,
        outcome: result.status,
      });
      finish();
    });
  }

  private summaryRow(x: number, y: number, label: string, value: number): void {
    this.label(x, y, label, 19, '#aeb5c0');
    const formatted = `${value >= 0 ? '+' : ''}${this.money(value)}`;
    const color = value < 0 ? '#ff8d85' : value > 0 ? '#63d28d' : '#f7f8fa';
    this.label(820, y, formatted, 21, color, 'bold').setOrigin(1, 0);
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
    this.renderLotArtworkFor(this.lot, x, y, width, height);
  }

  private renderLotArtworkFor(lot: LotTemplate, x: number, y: number, width: number, height: number): void {
    const texture = resolveLotTexture(this, lot.artId ?? lot.id);
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

  private compactText(value: string, maxLength: number): string {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
  }

  private inspectionConditionLabel(band: InspectionConditionBand): string {
    switch (band) {
      case 'rough': return t(this.locale, 'inspectionConditionRough');
      case 'mixed': return t(this.locale, 'inspectionConditionMixed');
      case 'preserved': return t(this.locale, 'inspectionConditionPreserved');
    }
  }

  private inspectionPremiumLabel(count: number): string {
    if (count <= 0) return t(this.locale, 'inspectionPremiumNone');
    if (count === 1) return t(this.locale, 'inspectionPremiumOne');
    return t(this.locale, 'inspectionPremiumMultiple', { count });
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

  private hexColor(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }
}
