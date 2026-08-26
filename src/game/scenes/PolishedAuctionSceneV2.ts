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
import { addHeroStage, VISUAL } from '../visual';
import { PolishedAuctionScene } from './PolishedAuctionScene';

type RevealStage = 'closed' | 'revealed' | 'appraised' | 'restoring';
type DecisionFeedbackKind = 'sell' | 'keep';

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
  uncommon: 0x47d36f,
  rare: 0x37a9ff,
  epic: 0x9959ff,
  legendary: 0xffc857,
};

const TELL_COLORS: Record<BidderTell, string> = {
  calm: '#87909c',
  watching: '#d7dbe2',
  hesitating: '#ffd66d',
  out: '#5e6672',
};

export class PolishedAuctionSceneV2 extends PolishedAuctionScene {
  constructor() {
    super();
    const runtime = this as unknown as AuctionRuntime;
    const sellCurrentItem = runtime.sellCurrentItem.bind(runtime);
    const keepCurrentItem = runtime.keepCurrentItem.bind(runtime);
    runtime.renderBidding = () => renderBidding(runtime);
    runtime.renderWin = () => renderWin(runtime);
    runtime.renderReveal = () => renderReveal(runtime);
    runtime.sellCurrentItem = () => {
      const item = runtime.items[runtime.revealIndex];
      sellCurrentItem();
      if (item) showDecisionFeedback(runtime, 'sell', item);
    };
    runtime.keepCurrentItem = () => {
      const item = runtime.items[runtime.revealIndex];
      keepCurrentItem();
      if (item) showDecisionFeedback(runtime, 'keep', item);
    };
  }
}

function renderBidding(scene: AuctionRuntime): void {
  scene.resetCanvas();
  header(scene, t(scene.locale, 'title'), scene.lot.name[scene.locale]);

  panel(scene, 28, 132, 802, 554, 0xf6b72c);

  // A theatrical lot stage: environment first, UI floats in front of it.
  scene.add.rectangle(48, 150, 762, 286, 0x0a2b49, 0.98).setOrigin(0).setStrokeStyle(2, 0xf6b72c, 0.34);
  scene.add.ellipse(430, 226, 650, 270, 0x37a9ff, 0.07);
  scene.add.ellipse(610, 226, 360, 250, 0xf6b72c, 0.09);
  lotArt(scene, 429, 266, 756, 224);
  const showBulbLeft = scene.add.circle(74, 174, 5, 0xffdd7a, 0.78);
  const showBulbRight = scene.add.circle(784, 174, 5, 0x8fd1ff, 0.78);
  scene.add.rectangle(429, 157, 690, 3, 0xffffff, 0.12);
  if (!prefersReducedMotion()) {
    scene.tweens.add({ targets: [showBulbLeft, showBulbRight], alpha: { from: 0.45, to: 0.95 }, duration: 720, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }
  scene.add.rectangle(51, 328, 756, 58, 0x061622, 0.26).setOrigin(0);
  scene.add.rectangle(51, 382, 756, 3, VISUAL.brass, 0.25).setOrigin(0);
  scene.add.rectangle(51, 386, 756, 15, VISUAL.wood, 0.24).setOrigin(0);

  const bidCard = scene.add.container(70, 300);
  const bidShadow = scene.add.rectangle(7, 8, 326, 120, 0x000000, 0.46).setOrigin(0);
  const bidGlow = scene.add.rectangle(-4, -4, 326, 120, 0xf6b72c, 0.08)
    .setOrigin(0)
    .setStrokeStyle(2, 0xf6b72c, 0.56);
  const bidBody = scene.add.rectangle(4, 4, 310, 104, 0x0a2f50, 0.98)
    .setOrigin(0)
    .setStrokeStyle(1, 0xffffff, 0.09);
  const bidTop = scene.add.rectangle(12, 12, 294, 2, 0xf6b72c, 0.42).setOrigin(0);
  bidCard.add([
    bidShadow,
    bidGlow,
    bidBody,
    bidTop,
    text(scene, 26, 23, t(scene.locale, 'currentBid').toUpperCase(), 10, '#a9c5df', 'bold'),
    text(scene, 26, 44, scene.money(scene.currentBid), 42, '#fff8ea', 'bold'),
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
  scene.add.rectangle(70, 429, 326, 42, playerLeading ? 0x174d39 : 0x5b3a17, 0.94)
    .setOrigin(0)
    .setStrokeStyle(1, playerLeading ? 0x47d36f : 0xf6b72c, 0.44);
  scene.add.rectangle(70, 429, 5, 42, playerLeading ? 0x47d36f : 0xf6b72c, 0.88).setOrigin(0);
  text(scene, 88, 440, `${t(scene.locale, 'leader')}: ${leader}`, 16, playerLeading ? '#7ee0a0' : '#ffd66d', 'bold');

  if (scene.notice) {
    scene.add.rectangle(70, 480, 326, 34, 0x5a2528, 0.94).setOrigin(0).setStrokeStyle(1, 0xff8d85, 0.42);
    text(scene, 84, 489, scene.notice, 12, '#ffaaa4', 'bold').setWordWrapWidth(294);
  }

  cluePanel(scene);

  const requiredBid = nextBid(scene.currentBid, scene.lot);
  const canBid = scene.store.canAfford(requiredBid) && !scene.awaitingNpc;
  button(scene, 226, 626, `${t(scene.locale, 'bid')} +${scene.money(scene.lot.bidIncrement)}`, () => scene.placePlayerBid(), {
    width: 320,
    height: 62,
    background: 0xf6b72c,
    accent: 0xffd260,
    disabled: !canBid,
    feedback: false,
  });
  button(scene, 580, 626, t(scene.locale, 'pass'), () => scene.passAuction(), {
    width: 240,
    height: 62,
    background: 0x33465b,
    accent: 0x7899b8,
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
  scene.add.rectangle(410, 394, 398, 160, 0x0b3152, 0.97).setOrigin(0).setStrokeStyle(1, 0xf6b72c, 0.18);
  text(scene, 430, 412, t(scene.locale, 'visibleClues').toUpperCase(), 10, '#ffd66d', 'bold');
  scene.lot.clues.slice(0, 3).forEach((clue, index) => {
    const y = 439 + index * 31;
    scene.add.rectangle(430, y, 20, 20, 0xf6b72c, 0.08).setOrigin(0).setStrokeStyle(1, 0xf6b72c, 0.24);
    scene.add.circle(440, y + 10, 3, 0xf6b72c, 0.85);
    text(scene, 462, y + 2, clue.text[scene.locale], 10, '#dcebf8').setWordWrapWidth(320);
  });
  if (scene.lotModifier) {
    scene.add.rectangle(430, 532, 358, 26, 0x6a3a1d, 0.92).setOrigin(0).setStrokeStyle(1, 0xf6b72c, 0.3);
    text(scene, 440, 539, `${t(scene.locale, 'event').toUpperCase()} · ${scene.lotModifier.name[scene.locale]}`, 9, '#ffd66d', 'bold');
  }
}

function rivalPanel(scene: AuctionRuntime): void {
  panel(scene, 850, 132, 402, 554, 0x37a9ff);
  text(scene, 876, 156, t(scene.locale, 'bidders').toUpperCase(), 12, '#9bb7cf', 'bold');
  text(scene, 876, 178, scene.locale === 'ru' ? 'Характер и специализация влияют на давление в торгах' : 'Specialty and temperament shape their bidding pressure', 10, '#7f9db7').setWordWrapWidth(340);

  scene.opponents.forEach((opponent, index) => {
    const y = 220 + index * 132;
    const active = opponent.id === scene.currentLeader;
    const tell = opponentTell(opponent, scene.currentBid, scene.lot);
    const accent = active ? 0xf6b72c : tell === 'out' ? 0x59616d : 0x37a9ff;
    const card = scene.add.container(872, y);
    const glow = scene.add.rectangle(-4, -4, 358, 108, accent, active ? 0.07 : 0).setOrigin(0).setStrokeStyle(2, accent, active ? 0.55 : 0.12);
    const body = scene.add.rectangle(0, 0, 350, 100, active ? 0x123b5a : 0x0b2b49, 1).setOrigin(0).setStrokeStyle(1, accent, active ? 0.4 : 0.12);
    const portrait = scene.add.circle(44, 50, 27, active ? accent : 0x303640, 0.9).setStrokeStyle(2, accent, active ? 0.72 : 0.24);
    const initial = center(scene, 44, 50, opponent.name[scene.locale].slice(0, 1).toUpperCase(), 23, '#fff8ea', 'bold');
    const name = text(scene, 86, 18, opponent.name[scene.locale], 19, active ? '#fff8ea' : '#c8cdd5', 'bold');
    const trait = opponent.trait?.[scene.locale] ?? BIDDER_TELL_TEXT[tell][scene.locale];
    const detail = text(scene, 86, 46, trait, 10, TELL_COLORS[tell], 'bold').setWordWrapWidth(235);
    const chip = scene.add.rectangle(86, 73, 150, 20, active ? 0x362a15 : 0x10436c, 0.9).setOrigin(0).setStrokeStyle(1, accent, 0.3);
    const chipText = text(scene, 95, 77, BIDDER_TELL_TEXT[tell][scene.locale].toUpperCase(), 8, TELL_COLORS[tell], 'bold');
    const status = center(scene, 326, 50, active ? '●' : tell === 'out' ? '×' : '○', 18, active ? '#ffd66d' : '#68717e');
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
  panel(scene, 140, 145, 1000, 500, 0xf6b72c);
  scene.add.rectangle(166, 168, 948, 292, 0x0a0d10, 0.92).setOrigin(0).setStrokeStyle(1, 0xf6b72c, 0.22);
  const halo = scene.add.ellipse(640, 302, 720, 330, 0xf6b72c, 0.06).setStrokeStyle(2, 0xf6b72c, 0.15);
  lotArt(scene, 640, 304, 690, 294);
  scene.add.rectangle(295, 382, 690, 68, 0x06080b, 0.72).setOrigin(0);
  scene.add.rectangle(295, 446, 690, 3, VISUAL.brass, 0.3).setOrigin(0);
  center(scene, 640, 171, t(scene.locale, 'won').toUpperCase(), 38, '#ffd66d', 'bold');
  center(scene, 640, 402, scene.lot.name[scene.locale], 25, '#fff8ea', 'bold');
  metric(scene, 430, 475, t(scene.locale, 'paid'), scene.money(scene.roundCost), 0xe97832);
  metric(scene, 650, 475, scene.locale === 'ru' ? 'РЕПУТАЦИЯ' : 'REPUTATION', `+${scene.roundReputationGain} REP`, 0x37a9ff);
  center(scene, 640, 537, t(scene.locale, 'wonValueTease'), 13, '#aeb5c0');
  button(scene, 640, 592, t(scene.locale, 'openLot'), () => {
    scene.revealIndex = 0;
    scene.revealStage = 'closed';
    scene.renderReveal();
  }, { width: 310, height: 58, background: 0xf6b72c, accent: 0xffd260 });
  if (!prefersReducedMotion()) {
    scene.tweens.add({ targets: halo, scaleX: { from: 0.92, to: 1.05 }, scaleY: { from: 0.92, to: 1.05 }, alpha: { from: 0.025, to: 0.075 }, duration: MOTION.celebrateMs, yoyo: true, repeat: 1, ease: 'Sine.InOut' });
    for (let index = 0; index < 7; index += 1) {
      const mote = scene.add.circle(430 + index * 70, 250 + (index % 3) * 46, 2 + (index % 2), 0xf6b72c, 0.55);
      scene.tweens.add({ targets: mote, y: mote.y - 24, alpha: 0, duration: MOTION.celebrateMs, delay: index * 35, ease: 'Cubic.Out', onComplete: () => mote.destroy() });
    }
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
  panel(scene, 150, 150, 980, 500, 0xf6b72c);
  const stage = addHeroStage(scene, 640, 354, 650, 334, VISUAL.warm, { fill: 0x0a3155, haloAlpha: 0.1 });
  stage.setDepth(0);
  scene.add.rectangle(395, 438, 490, 18, VISUAL.wood, 0.35).setOrigin(0);
  scene.add.rectangle(395, 436, 490, 2, VISUAL.brass, 0.34).setOrigin(0);
  const image = scene.add.image(640, 350, resolveItemTexture(scene, 'fallback')).setDisplaySize(440, 308);
  center(scene, 640, 526, t(scene.locale, 'sealedFind'), 21, '#d8dde4', 'bold');
  center(scene, 640, 553, scene.locale === 'ru' ? 'Ценность скрыта под пылью и упаковкой' : 'Value is still hidden beneath the dust and packing', 12, '#7f8894');
  button(scene, 640, 603, t(scene.locale, 'reveal'), () => {
    playFeedbackCue(scene, 'reveal');
    trackEvent('item_revealed', { itemId: item.definition.id, rarity: item.definition.rarity });
    scene.revealStage = 'revealed';
    scene.renderReveal();
  }, { width: 290, height: 60, background: 0xf6b72c, accent: 0xffd260, feedback: false });
  if (!prefersReducedMotion()) {
    image.setY(362).setAlpha(0.72);
    scene.tweens.add({ targets: image, y: 348, alpha: 1, duration: MOTION.revealSettleMs, ease: 'Cubic.Out' });
  }
}

function revealed(scene: AuctionRuntime, item: RevealedItem): void {
  const rarity = RARITY_COLORS[item.definition.rarity];
  panel(scene, 42, 150, 744, 500, rarity);
  panel(scene, 806, 150, 432, 500, rarity);

  const stage = addHeroStage(scene, 414, 350, 680, 410, rarity, { fill: 0x0a3155, haloAlpha: 0.12 });
  stage.setDepth(0);
  scene.add.rectangle(150, 443, 528, 26, VISUAL.wood, 0.24).setOrigin(0);
  scene.add.rectangle(150, 441, 528, 3, VISUAL.brass, 0.25).setOrigin(0);
  const halo = scene.add.ellipse(414, 336, 560, 330, rarity, 0.095);
  scene.add.circle(414, 326, 168, rarity, 0.028).setStrokeStyle(3, rarity, 0.22);
  scene.add.circle(414, 326, 205, 0xffffff, 0.012).setStrokeStyle(2, 0xffffff, 0.08);
  const image = scene.add.image(414, 326, resolveItemTexture(scene, item.definition.id)).setDisplaySize(520, 364);
  center(scene, 414, 520, item.definition.name[scene.locale], 25, '#fff8ea', 'bold');
  scene.add.rectangle(414, 560, 166, 30, rarity, 0.14).setStrokeStyle(1, rarity, 0.5);
  center(scene, 414, 560, scene.rarityLabel(item.definition.rarity).toUpperCase(), 10, scene.hexColor(rarity), 'bold');

  if (!prefersReducedMotion()) {
    image.setScale(0.9).setAlpha(0.2);
    scene.tweens.add({ targets: image, scaleX: 1, scaleY: 1, alpha: 1, y: { from: 346, to: 326 }, duration: MOTION.revealMs, ease: 'Back.Out' });
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
  text(scene, 842, 222, t(scene.locale, 'unknownValue'), 26, '#fff8ea', 'bold').setWordWrapWidth(350);
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
  }, { width: 318, height: 60, background: 0x37a9ff, foreground: '#0b1117', accent: 0x8fc3ff, feedback: false });
}

function appraisal(scene: AuctionRuntime, item: RevealedItem): void {
  // Appraiser's desk treatment: value first, physical-material accents second.
  scene.add.rectangle(826, 168, 388, 98, 0x0f3c60, 0.96).setOrigin(0).setStrokeStyle(1, VISUAL.brass, 0.24);
  scene.add.rectangle(826, 168, 5, 98, VISUAL.brass, 0.7).setOrigin(0);
  scene.add.rectangle(838, 176, 362, 1, 0xf0dba8, 0.12).setOrigin(0);
  text(scene, 842, 184, t(scene.locale, 'estimatedValue').toUpperCase(), 10, '#b7d0e4', 'bold');
  const price = text(scene, 842, 207, scene.money(item.appraisedValue), 39, '#63d28d', 'bold');
  animateValue(scene, price, item.appraisedValue);

  const traits = itemTraitNamesForIds(item.traitIds ?? [], scene.locale);
  if (traits.length > 0) {
    text(scene, 842, 286, scene.locale === 'ru' ? 'ПРИЗНАКИ' : 'TRAITS', 9, '#9bb7cf', 'bold');
    traits.slice(0, 3).forEach((trait, index) => {
      const x = 842 + (index % 2) * 168;
      const y = 307 + Math.floor(index / 2) * 32;
      scene.add.rectangle(x + 2, y + 3, 156, 24, 0x000000, 0.24).setOrigin(0);
      scene.add.rectangle(x, y, 156, 24, 0x0d4875, 0.98).setOrigin(0).setStrokeStyle(1, 0x37a9ff, 0.34);
      scene.add.rectangle(x, y, 3, 24, 0x37a9ff, 0.68).setOrigin(0);
      text(scene, x + 10, y + 6, trait, 9, '#9bc8ff', 'bold').setWordWrapWidth(136);
    });
  }

  const owned = scene.store.snapshot.collection.includes(item.definition.id);
  if (owned) {
    scene.add.rectangle(842, 369, 348, 28, 0x0d426b, 0.96).setOrigin(0).setStrokeStyle(1, 0x37a9ff, 0.34);
    text(scene, 852, 377, t(scene.locale, 'alreadyCollected'), 10, '#8fc3ff', 'bold');
  }

  text(scene, 842, 409, t(scene.locale, 'condition').toUpperCase(), 9, '#9bb7cf', 'bold');
  text(scene, 1190, 405, `${scene.conditionLabel(item.condition)} · ${Math.round(item.condition * 100)}%`, 11, scene.hexColor(scene.conditionColor(item.condition)), 'bold').setOrigin(1, 0);
  scene.conditionBar(842, 436, 348, item.condition);
  scene.add.rectangle(842, 442, 348, 1, VISUAL.brass, 0.16).setOrigin(0);

  if (item.restored) {
    const grade = item.restorationGrade ? scene.restorationGradeLabel(item.restorationGrade) : '';
    const accent = restorationAccent(item.restorationGrade);
    const plate = scene.add.rectangle(842, 458, 348, 38, accent, 0.12).setOrigin(0).setStrokeStyle(1, accent, 0.56);
    const result = text(
      scene,
      854,
      469,
      `${grade} · ${t(scene.locale, 'restorationGain', { amount: scene.money(item.restorationGain ?? 0) })}`,
      10,
      scene.hexColor(accent),
      'bold',
    ).setWordWrapWidth(322);
    renderRestorationResultFeedback(scene, item.restorationGrade, plate, result);
    button(scene, 928, 572, owned ? t(scene.locale, 'sellDuplicate') : t(scene.locale, 'sell'), () => scene.sellCurrentItem(), {
      width: 160,
      height: 52,
      feedback: false,
      fontSize: 13,
    });
    button(scene, 1104, 572, t(scene.locale, 'keep'), () => scene.keepCurrentItem(), {
      width: 160,
      height: 52,
      background: 0x167fd1,
      accent: 0x37a9ff,
      feedback: false,
      fontSize: 14,
    });
    return;
  }

  const canRestore = !scene.restorationUsed;
  text(scene, 842, 466, canRestore ? t(scene.locale, 'restorationAvailable') : t(scene.locale, 'restorationSpent'), 10, canRestore ? '#d8a46c' : '#69717c', 'bold').setWordWrapWidth(348);
  button(scene, 882, 572, t(scene.locale, 'restore'), () => scene.startRestoration(), {
    width: 124,
    height: 52,
    background: 0xe97832,
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
    background: 0x167fd1,
    accent: 0x37a9ff,
    feedback: false,
    fontSize: 14,
  });
}

function restorationAccent(grade: RestorationGrade | undefined): number {
  if (grade === 'perfect') return 0x47d36f;
  if (grade === 'good') return 0x37a9ff;
  return 0xe97832;
}

function renderRestorationResultFeedback(
  scene: AuctionRuntime,
  grade: RestorationGrade | undefined,
  plate: Phaser.GameObjects.Rectangle,
  result: Phaser.GameObjects.Text,
): void {
  if (prefersReducedMotion()) return;
  const accent = restorationAccent(grade);
  plate.setAlpha(0.28);
  result.setAlpha(0.35).setX(866);
  scene.tweens.add({ targets: plate, alpha: 1, duration: MOTION.settleMs, ease: 'Cubic.Out' });
  scene.tweens.add({ targets: result, x: 854, alpha: 1, duration: MOTION.settleMs, ease: 'Cubic.Out' });

  const particleCount = grade === 'perfect' ? 7 : grade === 'good' ? 4 : 0;
  for (let index = 0; index < particleCount; index += 1) {
    const angle = (Math.PI * 2 * index) / particleCount;
    const distance = grade === 'perfect' ? 34 : 25;
    const particle = scene.add.circle(1016, 465, grade === 'perfect' ? 3 : 2, accent, 0.88).setDepth(12);
    scene.tweens.add({
      targets: particle,
      x: 1016 + Math.cos(angle) * distance,
      y: 465 + Math.sin(angle) * distance * 0.55,
      alpha: 0,
      scaleX: 0.55,
      scaleY: 0.55,
      duration: MOTION.celebrateMs,
      ease: 'Cubic.Out',
      onComplete: () => particle.destroy(),
    });
  }
}

function showDecisionFeedback(scene: AuctionRuntime, kind: DecisionFeedbackKind, item: RevealedItem): void {
  const selling = kind === 'sell';
  const accent = selling ? 0x47d36f : 0x37a9ff;
  const label = selling
    ? `${scene.locale === 'ru' ? 'ПРОДАНО' : 'SOLD'} · +${scene.money(item.appraisedValue)}`
    : `${scene.locale === 'ru' ? 'В КОЛЛЕКЦИЮ' : 'KEPT'} · ${item.definition.name[scene.locale]}`;
  const receipt = scene.add.container(640, 608).setDepth(820).setName('decision-feedback');
  const shadow = scene.add.rectangle(0, 6, 460, 54, 0x000000, 0.46);
  const body = scene.add.rectangle(0, 0, 460, 54, accent, 0.28).setStrokeStyle(2, accent, 0.95);
  const inner = scene.add.rectangle(0, 0, 444, 40, 0x10151b, 0.98).setStrokeStyle(1, 0xffffff, 0.06);
  const stripe = scene.add.rectangle(-225, 0, 10, 54, accent, 1);
  const copy = center(scene, 0, 0, label, 13, selling ? '#b8f5ca' : '#c3e1ff', 'bold');
  receipt.add([shadow, body, inner, stripe, copy]);

  if (prefersReducedMotion()) {
    scene.time.delayedCall(900, () => receipt.destroy());
    return;
  }

  receipt.setAlpha(0).setY(622).setScale(0.985);
  scene.tweens.add({
    targets: receipt,
    y: 608,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    duration: MOTION.settleMs,
    ease: 'Cubic.Out',
  });
  scene.time.delayedCall(900, () => {
    if (!receipt.active) return;
    scene.tweens.add({
      targets: receipt,
      y: 598,
      alpha: 0,
      duration: MOTION.hoverMs,
      ease: 'Cubic.In',
      onComplete: () => receipt.destroy(),
    });
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
    scene.add.circle(startX + index * 30, 122, index === scene.revealIndex ? 6 : 4, index < scene.revealIndex ? 0x47d36f : index === scene.revealIndex ? 0xf6b72c : 0x3c434d, 1);
  });
}

function header(scene: AuctionRuntime, titleValue: string, subtitle: string): void {
  scene.add.rectangle(28, 20, 204, 88, 0x082944, 0.99).setOrigin(0).setStrokeStyle(2, 0xf6b72c, 0.42);
  text(scene, 50, 34, 'AUCTION', 24, '#ffd66d', 'bold');
  text(scene, 92, 65, 'HUNTER', 15, '#c4773a', 'bold');
  text(scene, 266, 31, titleValue, 25, '#fff8ea', 'bold').setWordWrapWidth(390);
  text(scene, 266, 67, subtitle, 12, '#a9c5df').setWordWrapWidth(410);
  const save = scene.store.snapshot;
  stat(scene, 760, t(scene.locale, 'cash'), scene.money(save.cash), 0xf6b72c);
  stat(scene, 910, t(scene.locale, 'collection'), String(uniqueCollectionCount(save.collection)), 0x37a9ff);
  stat(scene, 1060, t(scene.locale, 'reputation'), `${Math.floor(save.reputationXp)} REP`, 0x9959ff);
  scene.add.rectangle(28, 116, 1224, 1, 0xffffff, 0.08).setOrigin(0);
}

function stat(scene: Phaser.Scene, x: number, label: string, value: string, accent: number): void {
  scene.add.rectangle(x, 25, 132, 64, 0x0b3152, 0.98).setOrigin(0).setStrokeStyle(1, accent, 0.3);
  text(scene, x + 12, 34, label.toUpperCase(), 8, '#707985', 'bold');
  scene.add.circle(x + 18, 68, 7, accent, 0.9);
  text(scene, x + 32, 55, value, 16, '#fff8ea', 'bold');
}

function panel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, accent: number): void {
  scene.add.rectangle(x, y, width, height, 0x071f36, 0.99).setOrigin(0).setStrokeStyle(2, accent, 0.22);
  scene.add.rectangle(x + 8, y + 8, width - 16, height - 16, 0x0d3658, 0.76).setOrigin(0).setStrokeStyle(1, 0xffffff, 0.04);
}

function lotArt(scene: AuctionRuntime, x: number, y: number, width: number, height: number): void {
  const texture = resolveLotTexture(scene, scene.lot.artId ?? scene.lot.id);
  if (texture) scene.add.image(x, y, texture).setDisplaySize(width, height);
  else scene.add.rectangle(x, y, width, height, 0x20242b).setStrokeStyle(1, 0xffffff, 0.08);
  scene.add.rectangle(x, y, width, height, 0x000000, 0).setStrokeStyle(1, 0xffffff, 0.1);
}

function metric(scene: Phaser.Scene, x: number, y: number, label: string, value: string, accent: number): void {
  scene.add.rectangle(x, y, 200, 54, 0x0d3658, 0.98).setOrigin(0).setStrokeStyle(1, accent, 0.32);
  text(scene, x + 12, y + 8, label.toUpperCase(), 8, '#747d89', 'bold');
  text(scene, x + 12, y + 25, value, 17, '#fff8ea', 'bold');
}

function text(scene: Phaser.Scene, x: number, y: number, value: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, { fontFamily: 'Arial, sans-serif', fontSize: `${size}px`, fontStyle: style, color });
}

function center(scene: Phaser.Scene, x: number, y: number, value: string, size: number, color: string, style: 'normal' | 'bold' = 'normal'): Phaser.GameObjects.Text {
  return text(scene, x, y, value, size, color, style).setOrigin(0.5);
}
