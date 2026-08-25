import Phaser from 'phaser';
import type { AuctionOpponent } from '../../domain/auction';
import type { Locale, RevealedItem } from '../../domain/types';
import { addCharacterPortrait, opponentCharacterId, preloadCharacters } from '../characters';
import { prefersReducedMotion } from '../motion';
import { endTutorialSession, isTutorialSessionActive } from '../tutorial';
import { PolishedAuctionSceneV2 } from './PolishedAuctionSceneV2';

type RevealStage = 'closed' | 'revealed' | 'appraised' | 'restoring';

type CharacterRuntime = Phaser.Scene & {
  locale: Locale;
  opponents: AuctionOpponent[];
  revealStage: RevealStage;
  revealIndex: number;
  items: RevealedItem[];
  currentLeader: string;
  store: {
    snapshot: {
      onboardingComplete: boolean;
      auctionsPlayed: number;
      auctionsWon: number;
    };
    completeOnboarding: () => void;
  };
  renderLotSelection: () => void;
  renderBidding: () => void;
  renderWin: () => void;
  renderReveal: () => void;
  renderRoundSummary: () => void;
};

/**
 * P7 character/tutorial presentation layer.
 * Core auction rules, economy and persistence remain owned by AuctionScene.
 */
export class CharacterAuctionScene extends PolishedAuctionSceneV2 {
  constructor() {
    super();
    const runtime = this as unknown as CharacterRuntime;

    const lotSelection = runtime.renderLotSelection;
    const bidding = runtime.renderBidding;
    const win = runtime.renderWin;
    const reveal = runtime.renderReveal;
    const roundSummary = runtime.renderRoundSummary.bind(runtime);

    runtime.renderLotSelection = () => {
      lotSelection();
      renderLotSelectionCoach(runtime);
    };
    runtime.renderBidding = () => {
      bidding();
      renderAuctionCharacters(runtime);
      renderBiddingCoach(runtime);
    };
    runtime.renderWin = () => {
      win();
      renderAuctioneerHeader(runtime);
      renderWinCoach(runtime);
    };
    runtime.renderReveal = () => {
      reveal();
      renderRevealCoach(runtime);
    };
    runtime.renderRoundSummary = () => {
      if (isTutorialSessionActive()) {
        runtime.store.completeOnboarding();
        endTutorialSession();
      }
      roundSummary();
    };
  }

  preload(): void {
    super.preload();
    preloadCharacters(this);
  }
}

function renderAuctionCharacters(scene: CharacterRuntime): void {
  renderAuctioneerHeader(scene);

  scene.opponents.forEach((opponent, index) => {
    const id = opponentCharacterId(opponent.id);
    if (!id) return;
    const y = 270 + index * 132;
    const active = opponent.id === scene.currentLeader;
    const portrait = addCharacterPortrait(scene, id, 916, y, 58, 74, active ? 0xe9b949 : 0x61a8ff);
    if (active && !prefersReducedMotion()) {
      scene.tweens.add({
        targets: portrait,
        scaleX: { from: 0.96, to: 1 },
        scaleY: { from: 0.96, to: 1 },
        duration: 180,
        ease: 'Back.Out',
      });
    }
  });
}

function renderAuctioneerHeader(scene: CharacterRuntime): void {
  // Keep the auctioneer as a visible show host, not a tiny decorative avatar.
  const plate = scene.add.rectangle(704, 72, 116, 112, 0x0b1016, 0.94).setStrokeStyle(2, 0xe9b949, 0.42);
  scene.add.rectangle(704, 118, 104, 22, 0x17130b, 0.94).setStrokeStyle(1, 0xe9b949, 0.35);
  scene.add.text(704, 118, scene.locale === 'ru' ? 'ВЕДУЩИЙ' : 'AUCTIONEER', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '9px',
    fontStyle: 'bold',
    color: '#f0c969',
  }).setOrigin(0.5);
  const portrait = addCharacterPortrait(scene, 'auctioneer', 704, 66, 96, 118, 0xe9b949);
  if (!prefersReducedMotion()) {
    scene.tweens.add({
      targets: [portrait, plate],
      y: '-=2',
      duration: 980,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }
}

function renderLotSelectionCoach(scene: CharacterRuntime): void {
  if (!isTutorialSessionActive()) return;
  tutorialBubble(
    scene,
    112,
    248,
    286,
    248,
    scene.locale === 'ru'
      ? 'Шаг 1 · Читай сигналы: они связаны с реальными категориями находок. Сравни цену и риск, затем выбери лот.'
      : 'Step 1 · Read the clues: they map to real find categories. Compare price and risk, then choose a lot.',
    0x63d28d,
  );
  const g = scene.add.graphics();
  g.lineStyle(3, 0x63d28d, 0.72);
  g.beginPath();
  g.moveTo(300, 298);
  g.lineTo(250, 382);
  g.lineTo(230, 610);
  g.strokePath();
  g.fillStyle(0x63d28d, 0.9);
  g.fillTriangle(222, 603, 238, 606, 229, 620);
}

function renderBiddingCoach(scene: CharacterRuntime): void {
  if (!isTutorialSessionActive()) return;
  tutorialBubble(
    scene,
    430,
    155,
    620,
    155,
    scene.locale === 'ru'
      ? 'Шаг 2 · Смотри на текущую ставку и реакции соперников. Если цена уже плохая — пас тоже правильное решение.'
      : 'Step 2 · Watch the current bid and rival reactions. If the price turns bad, passing is also a good decision.',
    0x61a8ff,
    48,
    60,
  );
}

function renderWinCoach(scene: CharacterRuntime): void {
  if (!isTutorialSessionActive()) return;
  tutorialBubble(
    scene,
    208,
    562,
    378,
    557,
    scene.locale === 'ru'
      ? 'Победа. Теперь открой лот — прибыль станет понятна только после оценки находок.'
      : 'You won. Open the lot now — profit only becomes clear after you appraise the finds.',
    0xe9b949,
    64,
    80,
  );
}

function renderRevealCoach(scene: CharacterRuntime): void {
  if (!isTutorialSessionActive()) return;
  const item = scene.items[scene.revealIndex];
  if (!item) return;

  let copy: string;
  let accent = 0xb576ff;
  if (scene.revealStage === 'closed') {
    copy = scene.locale === 'ru'
      ? 'Шаг 3 · Открывай находки по одной. Редкость видна сразу, но цена ещё скрыта.'
      : 'Step 3 · Reveal finds one by one. Rarity appears first, but value is still hidden.';
  } else if (scene.revealStage === 'revealed') {
    copy = scene.locale === 'ru'
      ? 'Оцени предмет: состояние и признаки могут сильно изменить его реальную цену.'
      : 'Appraise it: condition and traits can change its real value dramatically.';
    accent = 0x61a8ff;
  } else if (scene.revealStage === 'appraised') {
    copy = scene.locale === 'ru'
      ? 'Решение за тобой: оставить для набора, продать сейчас или потратить единственную реставрацию лота.'
      : 'Your call: keep it for a set, sell now, or spend the lot’s single restoration attempt.';
    accent = 0x63d28d;
  } else {
    return;
  }

  tutorialBubble(scene, 130, 575, 316, 573, copy, accent, 62, 78);
}

function tutorialBubble(
  scene: CharacterRuntime,
  portraitX: number,
  portraitY: number,
  bubbleX: number,
  bubbleY: number,
  copy: string,
  accent: number,
  portraitWidth = 72,
  portraitHeight = 90,
): void {
  const portrait = addCharacterPortrait(scene, 'mentor', portraitX, portraitY, portraitWidth, portraitHeight, accent);
  const width = 330;
  const height = 74;
  scene.add.rectangle(bubbleX, bubbleY, width, height, 0x0b1016, 0.96).setOrigin(0.5).setStrokeStyle(2, accent, 0.58);
  scene.add.triangle(bubbleX - width / 2 - 12, bubbleY, 0, 12, 24, 0, 24, 24, 0x0b1016, 1).setOrigin(0.5);
  scene.add.text(bubbleX - width / 2 + 18, bubbleY - 24, copy, {
    fontFamily: 'Arial, sans-serif',
    fontSize: '11px',
    fontStyle: 'bold',
    color: '#e8edf3',
    wordWrap: { width: width - 36 },
    lineSpacing: 2,
  });
  if (!prefersReducedMotion()) {
    scene.tweens.add({ targets: portrait, y: portraitY - 2, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  }
}
