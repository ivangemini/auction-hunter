import Phaser from 'phaser';
import { ITEM_BY_ID, LOTS } from '../../data/catalog';
import type { ItemDefinition, Locale, LotTemplate, Rarity, RevealedItem } from '../../domain/types';
import { getPlatformLocale, markGameReady, setGameplayActive } from '../../platform/yandex';
import { t } from '../../i18n';
import { GameStore } from '../store';
import { button } from '../ui';

type RevealStage = 'closed' | 'revealed' | 'appraised';

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
  private currentBid = 0;
  private currentLeader = '';
  private awaitingNpc = false;
  private revealIndex = 0;
  private revealStage: RevealStage = 'closed';
  private roundCost = 0;
  private roundSales = 0;
  private roundKept = 0;
  private notice = '';

  constructor() {
    super('auction');
  }

  create(): void {
    this.locale = getPlatformLocale();
    this.prepareNextLot();
    this.renderLobby();
    markGameReady();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => setGameplayActive(false));
  }

  private prepareNextLot(): void {
    const lot = LOTS[Math.floor(Math.random() * LOTS.length)];
    if (!lot) throw new Error('No lot templates configured');

    this.lot = lot;
    this.items = this.createLotItems(lot);
    this.opponents = this.createOpponents();
    this.currentBid = lot.reservePrice;
    this.currentLeader = this.opponents[0]?.id ?? '';
    this.awaitingNpc = false;
    this.revealIndex = 0;
    this.revealStage = 'closed';
    this.roundCost = 0;
    this.roundSales = 0;
    this.roundKept = 0;
    this.notice = '';
  }

  private createLotItems(lot: LotTemplate): RevealedItem[] {
    const pool = [...lot.itemPool];
    const selected: ItemDefinition[] = [];

    while (selected.length < lot.itemCount && pool.length > 0) {
      const index = Math.floor(Math.random() * pool.length);
      const [id] = pool.splice(index, 1);
      if (!id) continue;
      const item = ITEM_BY_ID.get(id);
      if (item) selected.push(item);
    }

    return selected.map((definition) => ({
      definition,
      appraisedValue: this.roundToTen(definition.baseValue * Phaser.Math.FloatBetween(0.78, 1.32)),
    }));
  }

  private createOpponents(): Opponent[] {
    const hiddenValue = this.items.reduce((sum, item) => sum + item.appraisedValue, 0);
    const names = this.locale === 'ru'
      ? ['Виктор', 'Мира', 'Антон']
      : ['Victor', 'Mira', 'Anton'];
    const factors = [Phaser.Math.FloatBetween(0.26, 0.38), Phaser.Math.FloatBetween(0.34, 0.48), Phaser.Math.FloatBetween(0.42, 0.58)];

    return names.map((name, index) => ({
      id: `npc-${index}`,
      name,
      maxBid: Math.max(this.lot.reservePrice, this.roundToBid(hiddenValue * (factors[index] ?? 0.35))),
    }));
  }

  private renderLobby(): void {
    this.resetCanvas();
    this.renderHeader();

    this.panel(70, 150, 760, 500);
    this.label(105, 180, t(this.locale, 'lot').toUpperCase(), 16, '#8b93a1');
    this.label(105, 212, this.lot.name[this.locale], 36, '#f7f8fa', 'bold');
    this.label(105, 262, `${t(this.locale, 'location')}: ${this.lot.location[this.locale]}`, 18, '#aeb5c0');

    this.label(105, 325, t(this.locale, 'visibleClues'), 20, '#e9b949', 'bold');
    this.lot.clues.forEach((clue, index) => {
      this.label(120, 368 + index * 45, `• ${clue[this.locale]}`, 20, '#d7dbe2');
    });

    this.panel(865, 150, 345, 500, 0x171a20);
    this.label(900, 190, t(this.locale, 'currentBid'), 17, '#8b93a1');
    this.label(900, 222, this.money(this.lot.reservePrice), 38, '#f7f8fa', 'bold');
    this.label(900, 295, this.locale === 'ru' ? 'Шаг ставки' : 'Bid increment', 17, '#8b93a1');
    this.label(900, 327, `+${this.money(this.lot.bidIncrement)}`, 26, '#d7dbe2', 'bold');

    button(this, 1038, 565, t(this.locale, 'startAuction'), () => this.startAuction(), {
      width: 270,
      height: 64,
    });
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
    this.label(80, 204, this.lot.location[this.locale], 17, '#8b93a1');

    this.panel(70, 255, 760, 350);
    this.label(105, 292, t(this.locale, 'currentBid'), 18, '#8b93a1');
    this.label(105, 328, this.money(this.currentBid), 54, '#f7f8fa', 'bold');

    const leaderName = this.currentLeader === 'player'
      ? t(this.locale, 'you')
      : this.opponents.find((opponent) => opponent.id === this.currentLeader)?.name ?? t(this.locale, 'npc');

    this.label(105, 405, `${t(this.locale, 'leader')}: ${leaderName}`, 22, this.currentLeader === 'player' ? '#63d28d' : '#d7dbe2', 'bold');

    if (this.notice) {
      this.label(105, 458, this.notice, 18, '#ff8d85');
    }

    const nextBid = this.currentBid + this.lot.bidIncrement;
    const canBid = this.store.canAfford(nextBid) && !this.awaitingNpc;

    button(this, 250, 545, `${t(this.locale, 'bid')} +${this.money(this.lot.bidIncrement)}`, () => this.placePlayerBid(), {
      width: 280,
      height: 64,
      disabled: !canBid,
    });
    button(this, 560, 545, t(this.locale, 'pass'), () => this.passAuction(), {
      width: 220,
      height: 64,
      background: 0x2c313a,
      disabled: this.awaitingNpc,
    });

    this.panel(865, 255, 345, 350, 0x171a20);
    this.label(900, 290, this.locale === 'ru' ? 'Участники' : 'Bidders', 20, '#e9b949', 'bold');
    this.opponents.forEach((opponent, index) => {
      const active = opponent.id === this.currentLeader;
      this.label(900, 340 + index * 62, opponent.name, 21, active ? '#f7f8fa' : '#aeb5c0', active ? 'bold' : 'normal');
      this.label(1080, 342 + index * 62, active ? '●' : '○', 19, active ? '#e9b949' : '#555c68');
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
    this.store.buyLot(this.currentBid);
    this.renderWin();
  }

  private renderWin(): void {
    this.resetCanvas();
    this.renderHeader();
    this.panel(240, 165, 800, 430);
    this.centerLabel(640, 240, t(this.locale, 'won'), 46, '#e9b949', 'bold');
    this.centerLabel(640, 310, this.lot.name[this.locale], 28, '#f7f8fa', 'bold');
    this.centerLabel(640, 360, `${t(this.locale, 'paid')}: ${this.money(this.roundCost)}`, 22, '#aeb5c0');
    this.centerLabel(640, 405, this.locale === 'ru' ? 'Теперь узнаем, стоило ли оно того.' : 'Now we find out whether it was worth it.', 19, '#d7dbe2');

    button(this, 640, 510, t(this.locale, 'openLot'), () => {
      this.revealIndex = 0;
      this.revealStage = 'closed';
      this.renderReveal();
    }, { width: 280, height: 64 });
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
    this.centerLabel(640, 145, t(this.locale, 'itemOf', { current: this.revealIndex + 1, total: this.items.length }), 18, '#8b93a1');

    this.panel(275, 185, 730, 420);

    if (this.revealStage === 'closed') {
      this.add.rectangle(640, 335, 250, 160, 0x2a2f38).setStrokeStyle(3, 0x555c68, 1);
      this.centerLabel(640, 325, '?', 72, '#8b93a1', 'bold');
      this.centerLabel(640, 405, this.locale === 'ru' ? 'Запечатанная находка' : 'Sealed find', 20, '#aeb5c0');
      button(this, 640, 535, t(this.locale, 'reveal'), () => {
        this.revealStage = 'revealed';
        this.renderReveal();
      }, { width: 270, height: 62 });
      return;
    }

    const color = RARITY_COLORS[item.definition.rarity];
    this.add.rectangle(640, 290, 300, 120, color, 0.12).setStrokeStyle(3, color, 0.85);
    this.centerLabel(640, 275, item.definition.name[this.locale], 26, '#f7f8fa', 'bold');
    this.centerLabel(640, 320, this.rarityLabel(item.definition.rarity), 17, this.hexColor(color), 'bold');

    if (this.revealStage === 'revealed') {
      this.centerLabel(640, 405, t(this.locale, 'unknownValue'), 20, '#aeb5c0');
      button(this, 640, 515, t(this.locale, 'appraise'), () => {
        this.revealStage = 'appraised';
        this.renderReveal();
      }, { width: 250, height: 62 });
      return;
    }

    this.centerLabel(640, 390, t(this.locale, 'estimatedValue'), 17, '#8b93a1');
    this.centerLabel(640, 430, this.money(item.appraisedValue), 36, '#63d28d', 'bold');

    button(this, 505, 535, t(this.locale, 'sell'), () => this.sellCurrentItem(), {
      width: 230,
      height: 62,
    });
    button(this, 775, 535, t(this.locale, 'keep'), () => this.keepCurrentItem(), {
      width: 230,
      height: 62,
      background: 0x61a8ff,
    });
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
    this.stat(790, t(this.locale, 'cash'), this.money(save.cash));
    this.stat(970, t(this.locale, 'collection'), String(save.collection.length));
    this.stat(1135, t(this.locale, 'wins'), String(save.auctionsWon));
  }

  private stat(x: number, label: string, value: string): void {
    this.label(x, 43, label.toUpperCase(), 12, '#737b88');
    this.label(x, 67, value, 20, '#f7f8fa', 'bold');
  }

  private resetCanvas(): void {
    this.children.removeAll(true);
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x101216);
    this.add.rectangle(WIDTH / 2, 116, WIDTH - 120, 1, 0x2b3038);
  }

  private panel(x: number, y: number, width: number, height: number, color = 0x15181e): Phaser.GameObjects.Rectangle {
    return this.add.rectangle(x, y, width, height, color, 1)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff, 0.08);
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

  private money(value: number): string {
    const formatted = new Intl.NumberFormat(this.locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value);
    return `${formatted} ₽`;
  }

  private roundToTen(value: number): number {
    return Math.max(10, Math.round(value / 10) * 10);
  }

  private roundToBid(value: number): number {
    return Math.max(this.lot.reservePrice, Math.round(value / this.lot.bidIncrement) * this.lot.bidIncrement);
  }

  private hexColor(value: number): string {
    return `#${value.toString(16).padStart(6, '0')}`;
  }
}
