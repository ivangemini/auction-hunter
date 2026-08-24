import Phaser from 'phaser';
import { uniqueCollectionCount } from '../../data/collections';
import { summarizeLotHistory } from '../../domain/history';
import { t } from '../../i18n';
import { setGameplayActive } from '../../platform/yandex';
import { resolveLotTexture } from '../art';
import { enterWithStagger, MOTION, prefersReducedMotion } from '../motion';
import type { LotChoice } from '../lotMarket';
import { button } from '../ui';
import { AuctionScene } from './AuctionScene';

type AuctionRuntime = Phaser.Scene & {
  locale: 'ru' | 'en';
  lotChoices: LotChoice[];
  currentTierId: string;
  store: {
    snapshot: {
      cash: number;
      reputationXp: number;
      collection: string[];
      auctionHistory: Parameters<typeof summarizeLotHistory>[0];
    };
  };
  resetCanvas: () => void;
  renderTierTabs: (interactive: boolean) => void;
  renderDailyControl: (y?: number, x?: number, width?: number) => void;
  selectLotChoice: (choice: LotChoice, optionIndex: number) => void;
  money: (value: number) => string;
  signedMoney: (value: number) => string;
  compactText: (value: string, maxLength: number) => string;
  renderLotSelection: () => void;
};

const CARD_ACCENTS = [0xe9b949, 0x61a8ff, 0xb576ff] as const;
const CARD_XS = [28, 444, 860] as const;
const CARD_WIDTH = 392;
const CARD_HEIGHT = 476;
const CARD_Y = 190;

/**
 * Presentation-only subclass. Auction rules/state remain owned by AuctionScene;
 * this class swaps the lot-selection renderer for the P7 visual system.
 */
export class PolishedAuctionScene extends AuctionScene {
  constructor() {
    super();
    const runtime = this as unknown as AuctionRuntime;
    runtime.renderLotSelection = () => renderPolishedLotSelection(runtime);
  }
}

function renderPolishedLotSelection(scene: AuctionRuntime): void {
  setGameplayActive(false);
  scene.resetCanvas();
  renderHeader(scene);
  scene.renderTierTabs(true);

  const history = scene.store.snapshot.auctionHistory;

  scene.lotChoices.forEach((choice, index) => {
    const x = CARD_XS[index];
    if (x === undefined) return;
    const accent = CARD_ACCENTS[index] ?? CARD_ACCENTS[0];
    const memory = summarizeLotHistory(history, choice.lot.id);
    const card = scene.add.container(x, CARD_Y);

    const shadow = scene.add.rectangle(6, 8, CARD_WIDTH, CARD_HEIGHT, 0x000000, 0.38)
      .setOrigin(0)
      .setStrokeStyle(2, 0x000000, 0.25);
    const glow = scene.add.rectangle(-3, -3, CARD_WIDTH + 6, CARD_HEIGHT + 6, accent, 0)
      .setOrigin(0)
      .setStrokeStyle(2, accent, 0.18);
    const body = scene.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, 0x11151c, 1)
      .setOrigin(0)
      .setStrokeStyle(2, accent, 0.58);
    const inner = scene.add.rectangle(8, 8, CARD_WIDTH - 16, CARD_HEIGHT - 16, 0x0c1016, 1)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff, 0.06);

    card.add([shadow, glow, body, inner]);

    renderHeroArt(scene, card, choice, accent);
    renderRankRibbon(scene, card, index + 1, accent);

    const title = text(scene, CARD_WIDTH / 2, 214, choice.lot.name[scene.locale], 21, '#f7f3e8', 'bold')
      .setOrigin(0.5, 0)
      .setWordWrapWidth(340)
      .setAlign('center');
    const location = text(scene, CARD_WIDTH / 2, 242, choice.lot.location[scene.locale], 12, hex(accent), 'bold')
      .setOrigin(0.5, 0);
    const divider = scene.add.rectangle(20, 265, CARD_WIDTH - 40, 1, 0xffffff, 0.09).setOrigin(0);
    card.add([title, location, divider]);

    renderMetric(scene, card, 20, 278, 104, t(scene.locale, 'reservePrice'), scene.money(choice.lot.reservePrice), accent, true);
    renderMetric(scene, card, 144, 278, 92, t(scene.locale, 'itemsInside'), String(choice.lot.itemCount), 0xc4773a, false);

    const eventText = choice.modifier
      ? scene.compactText(choice.modifier.name[scene.locale], 16)
      : t(scene.locale, 'noEvent');
    renderMetric(scene, card, 256, 278, 116, t(scene.locale, 'event'), eventText, choice.modifier ? 0xb576ff : 0x59616d, false);

    const clueTitle = text(scene, 20, 336, t(scene.locale, 'visibleClues').toUpperCase(), 10, hex(accent), 'bold');
    card.add(clueTitle);

    choice.lot.clues.slice(0, 2).forEach((clue, clueIndex) => {
      const icon = scene.add.rectangle(21, 359 + clueIndex * 25, 18, 18, accent, 0.12)
        .setOrigin(0)
        .setStrokeStyle(1, accent, 0.45);
      const dot = scene.add.circle(30, 368 + clueIndex * 25, 3, accent, 0.9);
      const clueText = text(
        scene,
        48,
        358 + clueIndex * 25,
        scene.compactText(clue.text[scene.locale], 47),
        10,
        '#c8cdd5',
      ).setWordWrapWidth(320);
      card.add([icon, dot, clueText]);
    });

    const statusY = 411;
    if (memory.visits > 0) {
      const memoryText = memory.averageEstimatedResult === null
        ? t(scene.locale, 'dealerMemoryNoWins', { visits: memory.visits })
        : t(scene.locale, 'dealerMemory', {
          wins: memory.wins,
          visits: memory.visits,
          result: scene.signedMoney(memory.averageEstimatedResult),
        });
      const memoryBadge = scene.add.rectangle(20, statusY, CARD_WIDTH - 40, 22, 0x122235, 0.72)
        .setOrigin(0)
        .setStrokeStyle(1, 0x61a8ff, 0.24);
      const memoryLabel = text(scene, 30, statusY + 5, scene.compactText(memoryText, 59), 9, '#8fc3ff', 'bold');
      card.add([memoryBadge, memoryLabel]);
    } else if (choice.modifier) {
      const modifierBadge = scene.add.rectangle(20, statusY, CARD_WIDTH - 40, 22, 0x2b1e12, 0.78)
        .setOrigin(0)
        .setStrokeStyle(1, 0xe9b949, 0.28);
      const modifierLabel = text(
        scene,
        30,
        statusY + 5,
        `${t(scene.locale, 'event').toUpperCase()} · ${scene.compactText(choice.modifier.description[scene.locale], 48)}`,
        9,
        '#f0c969',
        'bold',
      );
      card.add([modifierBadge, modifierLabel]);
    }

    const choose = button(scene, CARD_WIDTH / 2, 451, t(scene.locale, 'chooseLot'), () => {
      animateSelection(scene, card, accent, () => scene.selectLotChoice(choice, index));
    }, {
      width: 344,
      height: 42,
      background: 0xe9b949,
      accent: 0xffcf59,
      hitSlop: 5,
    });
    card.add(choose);

    const hoverTarget = scene.add.rectangle(CARD_WIDTH / 2, 205, CARD_WIDTH - 12, 402, 0xffffff, 0.001);
    card.addAt(hoverTarget, 4);
    installCardHover(scene, card, hoverTarget, glow, body, accent);

    enterWithStagger(scene, card, CARD_Y, index);
  });
}

function renderHeader(scene: AuctionRuntime): void {
  const save = scene.store.snapshot;

  scene.add.rectangle(28, 20, 212, 88, 0x11151c, 0.98)
    .setOrigin(0)
    .setStrokeStyle(2, 0xe9b949, 0.45);
  text(scene, 50, 32, 'AUCTION', 27, '#f1c75b', 'bold');
  text(scene, 88, 64, 'HUNTER', 17, '#c4773a', 'bold');
  text(scene, 275, 29, t(scene.locale, 'chooseLotTitle').toUpperCase(), 29, '#f7f3e8', 'bold');
  text(scene, 275, 67, t(scene.locale, 'chooseLotHint'), 13, '#9ca4b0').setWordWrapWidth(410);

  renderHeaderStat(scene, 750, t(scene.locale, 'cash'), scene.money(save.cash), 0xe9b949);
  renderHeaderStat(scene, 890, t(scene.locale, 'collection'), String(uniqueCollectionCount(save.collection)), 0x61a8ff);
  renderHeaderStat(scene, 1030, t(scene.locale, 'reputation'), `${Math.floor(save.reputationXp)} REP`, 0xb576ff);

  button(scene, 1000, 112, t(scene.locale, 'collectionBook'), () => scene.scene.start('collection'), {
    width: 176,
    height: 32,
    background: 0x253a55,
    foreground: '#d9e9ff',
    accent: 0x61a8ff,
    hitSlop: 3,
  });
  scene.renderDailyControl(112, 1178, 150);
}

function renderHeaderStat(
  scene: AuctionRuntime,
  x: number,
  label: string,
  value: string,
  accent: number,
): void {
  scene.add.rectangle(x, 25, 126, 64, 0x11151c, 0.96)
    .setOrigin(0)
    .setStrokeStyle(1, accent, 0.35);
  text(scene, x + 12, 34, label.toUpperCase(), 9, '#777f8b', 'bold');
  scene.add.circle(x + 18, 68, 8, accent, 0.9);
  text(scene, x + 33, 55, value, 17, '#f7f3e8', 'bold');
}

function renderHeroArt(
  scene: AuctionRuntime,
  card: Phaser.GameObjects.Container,
  choice: LotChoice,
  accent: number,
): void {
  const artFrame = scene.add.rectangle(20, 18, CARD_WIDTH - 40, 184, 0x171c24, 1)
    .setOrigin(0)
    .setStrokeStyle(1, accent, 0.36);
  card.add(artFrame);

  const texture = resolveLotTexture(scene, choice.lot.artId ?? choice.lot.id);
  if (texture) {
    const image = scene.add.image(CARD_WIDTH / 2, 110, texture).setDisplaySize(CARD_WIDTH - 44, 180);
    card.add(image);
  } else {
    card.add(scene.add.rectangle(22, 20, CARD_WIDTH - 44, 180, 0x20242b, 1).setOrigin(0));
  }

  const lowerShade = scene.add.rectangle(22, 165, CARD_WIDTH - 44, 35, 0x06080b, 0.58).setOrigin(0);
  const warmEdge = scene.add.rectangle(22, 20, 4, 180, accent, 0.22).setOrigin(0);
  card.add([lowerShade, warmEdge]);
}

function renderRankRibbon(
  scene: AuctionRuntime,
  card: Phaser.GameObjects.Container,
  rank: number,
  accent: number,
): void {
  const ribbon = scene.add.rectangle(39, 16, 48, 70, accent, 0.92)
    .setOrigin(0.5, 0)
    .setStrokeStyle(2, 0xffffff, 0.16);
  const tail = scene.add.triangle(39, 86, 15, 0, 63, 0, 39, 20, accent, 0.92).setOrigin(0.5, 0);
  const rankText = text(scene, 39, 27, String(rank), 27, '#f7f3e8', 'bold').setOrigin(0.5, 0);
  card.add([ribbon, tail, rankText]);
}

function renderMetric(
  scene: AuctionRuntime,
  card: Phaser.GameObjects.Container,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  accent: number,
  emphasized: boolean,
): void {
  const labelText = text(scene, x, y, label.toUpperCase(), 8, '#707985', 'bold');
  const box = scene.add.rectangle(x, y + 18, width, 34, emphasized ? 0x233d18 : 0x151a20, 1)
    .setOrigin(0)
    .setStrokeStyle(1, accent, emphasized ? 0.52 : 0.24);
  const pip = scene.add.circle(x + 15, y + 35, 7, accent, emphasized ? 0.95 : 0.65);
  const valueText = text(scene, x + 29, y + 24, value, emphasized ? 17 : 13, '#f4f0e7', 'bold')
    .setWordWrapWidth(width - 34);
  card.add([labelText, box, pip, valueText]);
}

function installCardHover(
  scene: AuctionRuntime,
  card: Phaser.GameObjects.Container,
  hit: Phaser.GameObjects.Rectangle,
  glow: Phaser.GameObjects.Rectangle,
  body: Phaser.GameObjects.Rectangle,
  accent: number,
): void {
  hit.setInteractive({ useHandCursor: true });
  const reduced = prefersReducedMotion();

  const move = (hovered: boolean): void => {
    scene.tweens.killTweensOf(card);
    scene.tweens.killTweensOf(glow);
    if (reduced) {
      card.setScale(hovered ? 1.006 : 1).setY(hovered ? CARD_Y - 1 : CARD_Y);
      glow.setAlpha(hovered ? 0.07 : 0);
      body.setStrokeStyle(2, accent, hovered ? 0.78 : 0.58);
      return;
    }
    scene.tweens.add({
      targets: card,
      y: hovered ? CARD_Y - 5 : CARD_Y,
      scaleX: hovered ? 1.018 : 1,
      scaleY: hovered ? 1.018 : 1,
      duration: hovered ? MOTION.hoverMs : MOTION.settleMs,
      ease: hovered ? 'Cubic.Out' : 'Back.Out',
    });
    scene.tweens.add({
      targets: glow,
      alpha: hovered ? 0.1 : 0,
      duration: MOTION.hoverMs,
      ease: 'Sine.Out',
    });
    body.setStrokeStyle(2, accent, hovered ? 0.86 : 0.58);
  };

  hit.on('pointerover', () => move(true));
  hit.on('pointerout', () => move(false));
}

function animateSelection(
  scene: AuctionRuntime,
  card: Phaser.GameObjects.Container,
  accent: number,
  onComplete: () => void,
): void {
  if (!scene.input.enabled) return;
  scene.input.enabled = false;

  const complete = (): void => {
    try {
      onComplete();
    } finally {
      scene.input.enabled = true;
    }
  };

  if (prefersReducedMotion()) {
    complete();
    return;
  }

  scene.tweens.killTweensOf(card);
  const flash = scene.add.rectangle(CARD_WIDTH / 2, CARD_HEIGHT / 2, CARD_WIDTH - 10, CARD_HEIGHT - 10, accent, 0);
  card.add(flash);
  scene.tweens.add({
    targets: [card],
    scaleX: 1.025,
    scaleY: 1.025,
    duration: MOTION.selectMs,
    ease: 'Cubic.Out',
  });
  scene.tweens.add({
    targets: flash,
    alpha: { from: 0, to: 0.12 },
    yoyo: true,
    duration: MOTION.selectMs,
    ease: 'Sine.Out',
    onComplete: complete,
  });
}

function text(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  color: string,
  style: 'normal' | 'bold' = 'normal',
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, {
    fontFamily: 'Arial, sans-serif',
    fontSize: `${size}px`,
    fontStyle: style,
    color,
  });
}

function hex(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}
