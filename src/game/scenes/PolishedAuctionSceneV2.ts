import Phaser from 'phaser';
import { trackEvent } from '../../analytics';
import { BIDDER_TELL_TEXT } from '../../data/balance';
import { uniqueCollectionCount } from '../../data/collections';
import { itemTraitNamesForIds, itemTraitValueMultiplier } from '../../data/itemTraits';
import { nextBid, opponentTell, type AuctionOpponent, type BidderTell } from '../../domain/auction';
import type { LotModifierDefinition } from '../../domain/lotModifier';
import type { Locale, LotTemplate, Rarity, RevealedItem, RestorationGrade } from '../../domain/types';
import { t } from '../../i18n';
import { resolveItemTexture, resolveLotTexture } from '../art';
import { playFeedbackCue } from '../feedback';
import { MOTION, prefersReducedMotion } from '../motion';
import { button } from '../ui';
import { PolishedAuctionScene } from './PolishedAuctionScene';

type RevealStage = 'closed' | 'revealed' | 'appraised' | 'restoring';

type AuctionRuntime = Phaser.Scene & {
  locale: Locale;
  lot: LotTemplate;
  lotModifier: LotModifierDefinition | null;
  items: RevealedItem[];
  opponents: AuctionOpponent[];
  currentBid: number;
  currentLeader: string;
  awaitingNpc: boolean;
  notice: string;
  revealIndex: number;
  revealStage: RevealStage;
  roundCost: number;
  roundReputationGain: number;
  restorationUsed: boolean;
  store: {
    snapshot: { cash: number; reputationXp: number; collection: string[] };
    canAfford: (value: number) => boolean;
  };
  resetCanvas: () => void;
  money: (value: number) => string;
  placePlayerBid: () => void;
  passAuction: () => void;
  renderRoundSummary: () => void;
  sellCurrentItem: () => void;
  keepCurrentItem: () => void;
  startRestoration: () => void;
  conditionLabel: (condition: number) => string;
  conditionColor: (condition: number) => number;
  conditionBar: (x: number, y: number, width: number, condition: number) => void;
  rarityLabel: (rarity: Rarity) => string;
  restorationGradeLabel: (grade: RestorationGrade) => string;
  hexColor: (value: number) => string;
  renderBidding: () => void;
  renderWin: () => void;
  renderReveal: () => void;
};

const RARITY_COLORS: Record<Rarity, number> = {
  common: 0xaeb5c0,
  uncommon: 0x63d28d,
  rare: 0x61a8ff,
  epic: 0xb576ff,
  legendary: 0xffc857,
};

const TELL_COLORS: Record<BidderTell, string> = {
  calm: '#87909c',
  watching: '#d7dbe2',
  hesitating: '#f0c969',
  out: '#5e6672',
};

export class PolishedAuctionSceneV2 extends PolishedAuctionScene {
  constructor() {
    super();
    const runtime = this as unknown as AuctionRuntime;
    runtime.renderBidding = () => renderBidding(runtime);
    runtime.renderWin = () => renderWin(runtime);
    runtime.renderReveal = () => renderReveal(runtime);
  }
}

function renderBidding(scene: AuctionRuntime): void {
  scene.resetCanvas();
  header(scene, t(scene.locale, 'title'), scene.lot.name[scene.locale]);

  panel(scene, 28, 132, 802, 554, 0xe9b949);
  lotArt(scene, 429, 258, 756, 212);
  scene.add.rectangle(51, 300, 756, 64, 0x05070a, 0.64).setOrigin(0);

  const bidCard = scene.add.container(70, 286);
  const bidGlow = scene.add.rectangle(0, 0, 312, 116, 0xe9b949, 0.08)
    .setOrigin(0)
    .setStrokeStyle(2, 0xe9b949, 0.52);
  bidCard.add([
    bidGlow,
    scene.add.rectangle(8, 8, 296, 100, 0x10151b, 0.96).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.08),
    text(scene, 26, 22, t(scene.locale, 'currentBid').toUpperCase(), 10, '#8f98a4', 'bold'),
    text(scene, 26, 43, scene.money(scene.currentBid), 42, '#f7f3e8', 'bold'),
  ]);
  if (!prefersReducedMotion()) {
    bidCard.setScale(0.965);
    scene.tweens.add({ targets: bidCard, scaleX: 1, scaleY: 1, duration: MOTION.bidPulseMs, ease: 'Back.Out' });
    scene.tweens.add({ targets: bidGlow, alpha: { from: 0.18, to: 0.08 }, duration: MOTION.bidPulseMs, ease: 'Sine.Out' });
  }

  const leader = scene.currentLeader === 'player'
    ? t(scene.locale, 'you')
    : scene.opponents.find((opponent) => opponent.id === scene.currentLeader)?.name[scene.locale] ?? t(scene.locale, 'npc');
  const playerLeading = scene.currentLeader === 'player';
  scene.add.rectangle(70, 418, 312, 40, playerLeading ? 0x173522 : 0x362a15, 0.86)
    .setOrigin(0)
    .setStrokeStyle(1, playerLeading ? 0x63d28d : 0xe9b949, 0.36);
  text(scene, 86, 429, `${t(scene.locale, 'leader')}: ${leader}`, 16, playerLeading ? '#7ee0a0' : '#f0c969', 'bold');

  if (scene.notice) {
    scene.add.rectangle(70, 468, 312, 34, 0x351719, 0.9).setOrigin(0).setStrokeStyle(1, 0xff8d85, 0.38);
    text(scene, 84, 477, scene.notice, 12, '#ffaaa4', 'bold').setWordWrapWidth(282);
  }

  cluePanel(scene);

  const requiredBid = nextBid(scene.currentBid, scene.lot);
  const canBid = scene.store.canAfford(requiredBid) && !scene.awaitingNpc;
  button(scene, 226, 626, `${t(scene.locale, 'bid')} +${scene.money(scene.lot.bidIncrement)}`, () => scene.placePlayerBid(), {
    width: 320,
    height: 62,
    background: 0xe9b949,
    accent: 0xffd260,
    disabled: !canBid,
    feedback: false,
  });
  button(scene, 580, 626, t(scene.locale, 'pass'), () => scene.passAuction(), {
    width: 240,
    height: 62,
    background: 0x2b313a,
    accent: 0x6f7886,
    disabled: scene.awaitingNpc,
    feedback: false,
  });

  rivalPanel(scene);

  if (scene.awaitingNpc) {
    const waiting = center(scene, 612, 585, scene.locale === 'ru' ? 'Соперники оценивают ставку…' : 'Rivals are weighing the bid…', 11, '#9ca4b0', 'bold');
    if (!prefersReducedMotion()) {
      scene.tweens.add({ targets: waiting, alpha: { from: 0.45, to: 1 }, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
  }
}

function cluePanel(scene: AuctionRuntime): void {
  scene.add.rectangle(410, 394, 398, 160, 0x0d1218, 0.94).setOrigin(0).setStrokeStyle(1, 0xe9b949, 0.18);
  text(scene, 430, 412, t(scene.locale, 'visibleClues').toUpperCase(), 10, '#f0c969', 'bold');
  scene.lot.clues.slice(0, 3).forEach((clue, index) => {
    const y = 439 + index * 31;
    scene.add.rectangle(430, y, 20, 20, 0xe9b949, 0.08).setOrigin(0).setStrokeStyle(1, 0xe9b949, 0.24);
    scene.add.circle(440, y + 10, 3, 0xe9b949, 0.85);
    text(scene, 462, y + 2, clue.text[scene.locale], 10, '#c1c7d0').setWordWrapWidth(320);
  });
  if (scene.lotModifier) {
    scene.add.rectangle(430, 532, 358, 26, 0x2f2114, 0.92).setOrigin(0).setStrokeStyle(1, 0xe9b949, 0.3);
    text(scene, 440, 539, `${t(scene.locale, 'event').toUpperCase()} · ${scene.lotModifier.name[scene.locale]}`, 9, '#f0c969', 'bold');
  }
}

function rivalPanel(scene: AuctionRuntime): void {
  panel(scene, 850, 132, 402, 554, 0x61a8ff);
  text(scene, 876, 156, t(scene.locale, 'bidders').toUpperCase(), 12, '#7f8996', 'bold');
  text(scene, 876, 178, scene.locale === 'ru' ? 'Характер и специализация влияют на давление в торгах' : 'Specialty and temperament shape their bidding pressure', 10, '#626b77').setWordWrapWidth(340);

  scene.opponents.forEach((opponent, index) => {
    const y = 220 + index * 132;
    const active = opponent.id === scene.currentLeader;
    const tell = opponentTell(opponent, scene.currentBid, scene.lot);
    const accent = active ? 0xe9b949 : tell === 'out' ? 0x59616d : 0x61a8ff;
    const card = scene.add.container(872, y);
    const glow = scene.add.rectangle(-4, -4, 358, 108, accent, active ? 0.07 : 0).setOrigin(0).setStrokeStyle(2, accent, active ? 0.55 : 0.12);
    const body = scene.add.rectangle(0, 0, 350, 100, active ? 0x171b21 : 0x13171c, 1).setOrigin(0).setStrokeStyle(1, accent, active ? 0.4 : 0.12);
    const portrait = scene.add.circle(44, 50, 27, active ? accent : 0x303640, 0.9).setStrokeStyle(2, accent, active ? 0.72 : 0.24);
    const initial = center(scene, 44, 50, opponent.name[scene.locale].slice(0, 1).toUpperCase(), 23, '#f7f3e8', 'bold');
    const name = text(scene, 86, 18, opponent.name[scene.locale], 19, active ? '#f7f3e8' : '#c8cdd5', 'bold');
    const trait = opponent.trait?.[scene.locale] ?? BIDDER_TELL_TEXT[tell][scene.locale];
    const detail = text(scene, 86, 46, trait, 10, TELL_COLORS[tell], 'bold').setWordWrapWidth(235);
    const chip = scene.add.rectangle(86, 73, 150, 20, active ? 0x362a15 : 0x172535, 0.9).setOrigin(0).setStrokeStyle(1, accent, 0.3);
    const chipText = text(scene, 95, 77, BIDDER_TELL_TEXT[tell][scene.locale].toUpperCase(), 8, TELL_COLORS[tell], 'bold');
    const status = center(scene, 326, 50, active ? '●' : tell === 'out' ? '×' : '○', 18, active ? '#f0c969' : '#68717e');
    card.add([glow, body, portrait, initial, name, detail, chip, chipText, status]);
    if (active && !prefersReducedMotion()) {
      scene.tweens.add({ targets: card, x: 878, duration: MOTION.rivalReactMs, ease: 'Back.Out' });
      scene.tweens.add({ targets: glow, alpha: { from: 0.03, to: 0.12 }, duration: MOTION.rivalReactMs, yoyo: true, ease: 'Sine.Out' });
    }
  });
}

function renderWin(scene: AuctionRuntime): void {
  scene.resetCanvas();
  header(scene, t(scene.locale, 'won'), scene.lot.name[scene.locale]);
  panel(scene, 140, 145, 1000, 500, 0xe9b949);
  const halo = scene.add.circle(640, 315, 205, 0xe9b949, 0.055).setStrokeStyle(2, 0xe9b949, 0.17);
  lotArt(scene, 640, 302, 620, 280);
  scene.add.rectangle(330, 380, 620, 62, 0x06080b, 0.76).setOrigin(0);
  center(scene, 640, 171, t(scene.locale, 'won').toUpperCase(), 38, '#f0c969', 'bold');
  center(scene, 640, 397, scene.lot.name[scene.locale], 25, '#f7f3e8', 'bold');
  metric(scene, 430, 470, t(scene.locale, 'paid'), scene.money(scene.roundCost), 0xc4773a);
  metric(scene, 650, 470, scene.locale === 'ru' ? 'РЕПУТАЦИЯ' : 'REPUTATION', `+${scene.roundReputationGain} REP`, 0x61a8ff);
  center(scene, 640, 535, t(scene.locale, 'wonValueTease'), 13, '#aeb5c0');
  button(scene, 640, 592, t(scene.locale, 'openLot'), () => {
    scene.revealIndex = 0;
    scene.revealStage = 'closed';
    scene.renderReveal();
  }, { width: 310, height: 58, background: 0xe9b949, accent: 0xffd260 });
  if (!prefersReducedMotion()) {
    scene.tweens.add({ targets: halo, scaleX: { from: 0.9, to: 1.08 }, scaleY: { from: 0.9, to: 1.08 }, alpha: { from: 0.03, to: 0.08 }, duration: MOTION.celebrateMs, yoyo: true, repeat: 1, ease: 'Sine.InOut' });
  }
}

function renderReveal(scene: AuctionRuntime): void {
  if (scene.revealIndex >= scene.items.length) {
    scene.renderRoundSummary();
    return;
  }
  const item = scene.items[scene.revealIndex];
  if (!item) {
    scene.renderRoundSummary();
    return;
  }

  scene.resetCanvas();
  header(scene, t(scene.locale, 'itemOf', { current: scene.revealIndex + 1, total: scene.items.length }), scene.lot.name[scene.locale]);
  progress(scene);

  if (scene.revealStage === 'closed') {
    sealed(scene, item);
    return;
  }
  revealed(scene, item);
}

function sealed(scene: AuctionRuntime, item: RevealedItem): void {
  panel(scene, 150, 150, 980, 500, 0xe9b949);
  const glow = scene.add.circle(640, 330, 220, 0xe9b949, 0.04).setStrokeStyle(2, 0xe9b949, 0.11);
  scene.add.rectangle(390, 205, 500, 300, 0x151a20, 1).setOrigin(0).setStrokeStyle(1, 0xe9b949, 0.26);
  const image = scene.add.image(640, 350, resolveItemTexture(scene, 'fallback')).setDisplaySize(420, 294);
  center(scene, 640, 520, t(scene.locale, 'sealedFind'), 20, '#c6ccd4', 'bold');
  center(scene, 640, 548, scene.locale === 'ru' ? 'Ценность ещё скрыта' : 'The value is still hidden', 12, '#737c88');
  button(scene, 640, 600, t(scene.locale, 'reveal'), () => {
    playFeedbackCue(scene, 'reveal');
    trackEvent('item_revealed', { itemId: item.definition.id, rarity: item.definition.rarity });
    scene.revealStage = 'revealed';
    scene.renderReveal();
  }, { width: 290, height: 60, background: 0xe9b949, accent: 0xffd260, feedback: false });
  if (!prefersReducedMotion()) {
    image.setY(360).setAlpha(0.7);
    scene.tweens.add({ targets: image, y: 345, alpha: 1, duration: MOTION.revealSettleMs, ease: 'Cubic.Out' });
    scene.tweens.add({ targets: glow, alpha: { from: 0.025, to: 0.065 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }
}

function revealed(scene: AuctionRuntime, item: RevealedItem): void {
  const rarity = RARITY_COLORS[item.definition.rarity];
  panel(scene, 42, 150, 744, 500, rarity);
  panel(scene, 806, 150, 432, 500, rarity);
  const halo = scene.add.circle(414, 342, 205, rarity, 0.045).setStrokeStyle(2, rarity, 0.13);
  const image = scene.add.image(414, 330, resolveItemTexture(scene, item.definition.id)).setDisplaySize(500, 350);
  center(scene, 414, 510, item.definition.name[scene.locale], 25, '#f7f3e8', 'bold');
  scene.add.rectangle(414, 551, 154, 28, rarity, 0.14).setStrokeStyle(1, rarity, 0.48);
  center(scene, 414, 551, scene.rarityLabel(item.definition.rarity).toUpperCase(), 10, scene.hexColor(rarity), 'bold');

  if (!prefersReducedMotion()) {
    image.setScale(0.9).setAlpha(0.2);
    scene.tweens.add({ targets: image, scaleX: 1, scaleY: 1, alpha: 1, y: { from: 350, to: 330 }, duration: MOTION.revealMs, ease: 'Back.Out' });
    scene.tweens.add({ targets: halo, alpha: { from: 0.015, to: 0.075 }, duration: MOTION.revealSettleMs, yoyo: true, ease: 'Sine.Out' });
  }

  if (scene.revealStage === 'revealed') {
    preAppraisal(scene, item, rarity);
  } else {
    appraisal(scene, item);
  }
}

function preAppraisal(scene: AuctionRuntime, item: RevealedItem, rarity: number): void {
  text(scene, 842, 187, scene.locale === 'ru' ? 'НАХОДКА ОТКРЫТА' : 'FIND REVEALED', 10, scene.hexColor(rarity), 'bold');
  text(scene, 842, 222, t(scene.locale, 'unknownValue'), 26, '#f7f3e8', 'bold').setWordWrapWidth(350);
  text(scene, 842, 285, scene.locale === 'ru' ? 'Оценка раскроет состояние, происхождение и рыночную цену.' : 'Appraisal resolves condition, provenance and market price.', 13, '#969faa').setWordWrapWidth(340);
  scene.add.rectangle(842, 360, 348, 1, 0xffffff, 0.08).setOrigin(0);
  text(scene, 842, 390, scene.locale === 'ru' ? 'ГОТОВО К ОЦЕНКЕ' : 'READY TO APPRAISE', 10, '#aeb5c0', 'bold');
  button(scene, 1016, 560, t(scene.locale, 'appraise'), () => {
    playFeedbackCue(scene, 'appraise');
    trackEvent('item_appraised', {
      itemId: item.definition.id,
      value: item.appraisedValue,
      condition: item.condition,
      traitIds: [...(item.traitIds ?? [])],
      traitMultiplier: itemTraitValueMultiplier(item.traitIds ?? []),
    });
    scene.revealStage = 'appraised';
    scene.renderReveal();
  }, { width: 318, height: 60, background: 0x61a8ff, foreground: '#0b1117', accent: 0x8fc3ff, feedback: false });
}

function appraisal(scene: AuctionRuntime, item: RevealedItem): void {
  text(scene, 842, 178, t(scene.locale, 'estimatedValue').toUpperCase(), 10, '#7f8996', 'bold');
  const price = text(scene, 842, 202, scene.money(item.appraisedValue), 38, '#63d28d', 'bold');
  animateValue(scene, price, item.appraisedValue);

  const traits = itemTraitNamesForIds(item.traitIds ?? [], scene.locale);
  if (traits.length > 0) {
    text(scene, 842, 266, scene.locale === 'ru' ? 'ПРИЗНАКИ' : 'TRAITS', 9, '#7f8996', 'bold');
    traits.slice(0, 3).forEach((trait, index) => {
      const x = 842 + (index % 2) * 168;
      const y = 288 + Math.floor(index / 2) * 32;
      scene.add.rectangle(x, y, 156, 24, 0x15263a, 0.95).setOrigin(0).setStrokeStyle(1, 0x61a8ff, 0.3);
      text(scene, x + 10, y + 6, trait, 9, '#9bc8ff', 'bold').setWordWrapWidth(136);
    });
  }

  const owned = scene.store.snapshot.collection.includes(item.definition.id);
  if (owned) {
    scene.add.rectangle(842, 350, 348, 28, 0x172536, 0.9).setOrigin(0).setStrokeStyle(1, 0x61a8ff, 0.32);
    text(scene, 852, 358, t(scene.locale, 'alreadyCollected'), 10, '#8fc3ff', 'bold');
  }

  text(scene, 842, 393, t(scene.locale, 'condition').toUpperCase(), 9, '#7f8996', 'bold');
  text(scene, 1190, 389, `${scene.conditionLabel(item.condition)} · ${Math.round(item.condition * 100)}%`, 11, scene.hexColor(scene.conditionColor(item.condition)), 'bold').setOrigin(1, 0);
  scene.conditionBar(842, 420, 348, item.condition);

  if (item.restored) {
    const grade = item.restorationGrade ? scene.restorationGradeLabel(item.restorationGrade) : '';
    scene.add.rectangle(842, 446, 348, 38, 0x173522, 0.85).setOrigin(0).setStrokeStyle(1, 0x63d28d, 0.34);
    text(scene, 854, 457, `${grade} · ${t(scene.locale, 'restorationGain', { amount: scene.money(item.restorationGain ?? 0) })}`, 10, '#7ee0a0', 'bold').setWordWrapWidth(322);
    button(scene, 928, 572, owned ? t(scene.locale, 'sellDuplicate') : t(scene.locale, 'sell'), () => scene.sellCurrentItem(), {
      width: 160,
      height: 52,
      feedback: false,
      fontSize: 13,
    });
    button(scene, 1104, 572, t(scene.locale, 'keep'), () => scene.keepCurrentItem(), {
      width: 160,
      height: 52,
      background: 0x3f73b8,
      accent: 0x61a8ff,
      feedback: false,
      fontSize: 14,
    });
    return;
  }

  const canRestore = !scene.restorationUsed;
  text(scene, 842, 452, canRestore ? t(scene.locale, 'restorationAvailable') : t(scene.locale, 'restorationSpent'), 10, canRestore ? '#d8a46c' : '#69717c', 'bold').setWordWrapWidth(348);
  button(scene, 882, 572, t(scene.locale, 'restore'), () => scene.startRestoration(), {
    width: 124,
    height: 52,
    background: 0xc4773a,
    accent: 0xe39a58,
    disabled: !canRestore,
    fontSize: 13,
  });
  button(scene, 1016, 572, owned ? t(scene.locale, 'sellDuplicate') : t(scene.locale, 'sell'), () => scene.sellCurrentItem(), {
    width: 124,
    height: 52,
    feedback: false,
    fontSize: 13,
  });
  button(scene, 1150, 572, t(scene.locale, 'keep'), () => scene.keepCurrentItem(), {
    width: 124,
    height: 52,
    background: 0x3f73b8,
    accent: 0x61a8ff,
    feedback: false,
    fontSize: 14,
  });
}

function animateValue(scene: AuctionRuntime, label: Phaser.GameObjects.Text, value: number): void {
  if (prefersReducedMotion()) return;
  const from = Math.max(1, Math.round(value * 0.35));
  label.setText(scene.money(from));
  scene.tweens.addCounter({
    from,
    to: value,
    duration: MOTION.valueCountMs,
    ease: 'Cubic.Out',
    onUpdate: (tween) => label.setText(scene.money(Math.round(tween.getValue() ?? value))),
  });
}

function progress(scene: AuctionRuntime): void {
  const startX = 640 - ((scene.items.length - 1) * 30) / 2;
  scene.items.forEach((_item, index) => {
    scene.add.circle(startX + index * 30, 122, index === scene.revealIndex ? 6 : 4, index < scene.revealIndex ? 0x63d28d : index === scene.revealIndex ? 0xe9b949 : 0x3c434d, 1);
  });
}

function header(scene: AuctionRuntime, titleValue: string, subtitle: string): void {
  scene.add.rectangle(28, 20, 204, 88, 0x11151c, 0.98).setOrigin(0).setStrokeStyle(2, 0xe9b949, 0.42);
  text(scene, 50, 34, 'AUCTION', 24, '#f0c969', 'bold');
  text(scene, 92, 65, 'HUNTER', 15, '#c4773a', 'bold');
  text(scene, 266, 31, titleValue, 25, '#f7f3e8', 'bold').setWordWrapWidth(390);
  text(scene, 266, 67, subtitle, 12, '#8f98a4').setWordWrapWidth(410);
  const save = scene.store.snapshot;
  stat(scene, 760, t(scene.locale, 'cash'), scene.money(save.cash), 0xe9b949);
  stat(scene, 910, t(scene.locale, 'collection'), String(uniqueCollectionCount(save.collection)), 0x61a8ff);
  stat(scene, 1060, t(scene.locale, 'reputation'), `${Math.floor(save.reputationXp)} REP`, 0xb576ff);
  scene.add.rectangle(28, 116, 1224, 1, 0xffffff, 0.08).setOrigin(0);
}

function stat(scene: Phaser.Scene, x: number, label: string, value: string, accent: number): void {
  scene.add.rectangle(x, 25, 132, 64, 0x11151c, 0.96).setOrigin(0).setStrokeStyle(1, accent, 0.3);
  text(scene, x + 12, 34, label.toUpperCase(), 8, '#707985', 'bold');
  scene.add.circle(x + 18, 68, 7, accent, 0.9);
  text(scene, x + 32, 55, value, 16, '#f7f3e8', 'bold');
}

function panel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, accent: number): void {
  scene.add.rectangle(x, y, width, height, 0x0d1117, 0.98).setOrigin(0).setStrokeStyle(2, accent, 0.22);
  scene.add.rectangle(x + 8, y + 8, width - 16, height - 16, 0x11151c, 0.45).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.04);
}

function lotArt(scene: AuctionRuntime, x: number, y: number, width: number, height: number): void {
  const texture = resolveLotTexture(scene, scene.lot.artId ?? scene.lot.id);
  if (texture) scene.add.image(x, y, texture).setDisplaySize(width, height);
  else scene.add.rectangle(x, y, width, height, 0x20242b).setStrokeStyle(1, 0xffffff, 0.08);
  scene.add.rectangle(x, y, width, height, 0x000000, 0).setStrokeStyle(1, 0xffffff, 0.1);
}

function metric(scene: Phaser.Scene, x: number, y: number, label: string, value: string, accent: number): void {
  scene.add.rectangle(x, y, 200, 54, 0x151a20, 0.96).setOrigin(0).setStrokeStyle(1, accent, 0.32);
  text(scene, x + 12, y + 8, label.toUpperCase(), 8, '#747d89', 'bold');
  text(scene, x + 12, y + 25, value, 17, '#f7f3e8', 'bold');
}

function text(scene: Phaser.Scene, x: number, y: number, value: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, { fontFamily: 'Arial, sans-serif', fontSize: `${size}px`, fontStyle: style, color });
}

function center(scene: Phaser.Scene, x: number, y: number, value: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
  return text(scene, x, y, value, size, color, style).setOrigin(0.5);
}
