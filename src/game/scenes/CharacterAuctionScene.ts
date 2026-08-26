import Phaser from 'phaser';
import { DISCOVERY_CHAINS, type DiscoveryChainDefinition } from '../../data/discoveryChains';
import type { AuctionOpponent } from '../../domain/auction';
import type { Locale, RevealedItem } from '../../domain/types';
import { addCharacterPortrait, opponentCharacterId, preloadCharacters } from '../characters';
import { playFeedbackCue } from '../feedback';
import { prefersReducedMotion } from '../motion';
import { endTutorialSession, isTutorialSessionActive } from '../tutorial';
import { button } from '../ui';
import { PolishedAuctionSceneV2 } from './PolishedAuctionSceneV2';

type RevealStage = 'closed' | 'revealed' | 'appraised' | 'restoring';

type DiscoverySnapshot = {
  progress: Record<string, number>;
  completed: string[];
};

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
      discoveryChainProgress: Record<string, number>;
      completedDiscoveryChains: string[];
    };
    completeOnboarding: () => void;
  };
  renderLotSelection: () => void;
  renderBidding: () => void;
  renderWin: () => void;
  renderReveal: () => void;
  renderRoundSummary: () => void;
  sellCurrentItem: () => void;
  keepCurrentItem: () => void;
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
    const sellCurrentItem = runtime.sellCurrentItem.bind(runtime);
    const keepCurrentItem = runtime.keepCurrentItem.bind(runtime);

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
    runtime.sellCurrentItem = () => {
      const before = captureDiscoverySnapshot(runtime);
      sellCurrentItem();
      renderDiscoveryFeedback(runtime, before, captureDiscoverySnapshot(runtime));
    };
    runtime.keepCurrentItem = () => {
      const before = captureDiscoverySnapshot(runtime);
      keepCurrentItem();
      renderDiscoveryFeedback(runtime, before, captureDiscoverySnapshot(runtime));
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
  // The auctioneer is a stage host. Keep the resting state strong and reserve motion for entry/emphasis.
  const spotlight = scene.add.ellipse(704, 72, 176, 162, 0xe9b949, 0.055).setDepth(2);
  const shadow = scene.add.rectangle(710, 77, 126, 122, 0x000000, 0.42).setDepth(3);
  const plate = scene.add.rectangle(704, 72, 124, 120, 0x0b1016, 0.96).setStrokeStyle(2, 0xe9b949, 0.5).setDepth(4);
  scene.add.rectangle(704, 124, 112, 24, 0x251c0f, 0.96).setStrokeStyle(1, 0xe9b949, 0.42).setDepth(6);
  scene.add.text(704, 124, scene.locale === 'ru' ? 'ВЕДУЩИЙ' : 'AUCTIONEER', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '9px',
    fontStyle: 'bold',
    color: '#f0c969',
  }).setOrigin(0.5).setDepth(7);
  const portrait = addCharacterPortrait(scene, 'auctioneer', 704, 65, 102, 124, 0xe9b949).setDepth(5);
  if (!prefersReducedMotion()) {
    portrait.setAlpha(0.7).setScale(0.96);
    scene.tweens.add({ targets: portrait, alpha: 1, scaleX: 1, scaleY: 1, duration: 240, ease: 'Back.Out' });
    scene.tweens.add({ targets: spotlight, alpha: { from: 0.02, to: 0.07 }, duration: 360, yoyo: true, ease: 'Sine.Out' });
    scene.tweens.add({ targets: [plate, shadow], y: { from: 78, to: 72 }, duration: 220, ease: 'Cubic.Out' });
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

function captureDiscoverySnapshot(scene: CharacterRuntime): DiscoverySnapshot {
  const save = scene.store.snapshot;
  return {
    progress: { ...save.discoveryChainProgress },
    completed: [...save.completedDiscoveryChains],
  };
}

function renderDiscoveryFeedback(
  scene: CharacterRuntime,
  before: DiscoverySnapshot,
  after: DiscoverySnapshot,
): void {
  const chain = DISCOVERY_CHAINS.find((candidate) => {
    const beforeStage = before.progress[candidate.id] ?? 0;
    const afterStage = after.progress[candidate.id] ?? 0;
    return afterStage > beforeStage;
  });
  if (!chain) return;

  const stage = Math.min(chain.steps.length, Math.max(0, after.progress[chain.id] ?? 0));
  const completed = after.completed.includes(chain.id);
  showDiscoveryModal(scene, chain, stage, completed);
}

function showDiscoveryModal(
  scene: CharacterRuntime,
  chain: DiscoveryChainDefinition,
  stage: number,
  completed: boolean,
): void {
  playFeedbackCue(scene, completed ? 'reward' : 'ui');
  const accent = completed ? 0x63d28d : 0xe9b949;
  const overlay = scene.add.rectangle(640, 360, 1280, 720, 0x05070a, 0.68)
    .setDepth(900)
    .setInteractive({ useHandCursor: false });
  const modal = scene.add.container(640, 360).setDepth(901);
  const shadow = scene.add.rectangle(6, 8, 560, 252, 0x000000, 0.42);
  const body = scene.add.rectangle(0, 0, 560, 252, 0x11151c, 0.99)
    .setStrokeStyle(2, accent, 0.66);
  const inner = scene.add.rectangle(0, 0, 536, 228, 0x171c23, 0.58)
    .setStrokeStyle(1, 0xffffff, 0.05);
  modal.add([shadow, body, inner]);

  const badge = scene.add.rectangle(-182, -91, 154, 28, accent, 0.14)
    .setStrokeStyle(1, accent, 0.54);
  const badgeText = scene.add.text(-182, -91, completed
    ? (scene.locale === 'ru' ? 'ДЕЛО ЗАКРЫТО' : 'CASE SOLVED')
    : (scene.locale === 'ru' ? 'НОВАЯ ЗАЦЕПКА' : 'NEW LEAD'), {
    fontFamily: 'Arial, sans-serif',
    fontSize: '10px',
    fontStyle: 'bold',
    color: completed ? '#bfe8ce' : '#f0c969',
  }).setOrigin(0.5);
  modal.add([badge, badgeText]);

  modal.add(scene.add.text(-244, -60, chain.title[scene.locale], {
    fontFamily: 'Arial, sans-serif',
    fontSize: '25px',
    fontStyle: 'bold',
    color: '#f7f3e8',
  }).setWordWrapWidth(488));
  modal.add(scene.add.text(244, -56, `${stage}/${chain.steps.length}`, {
    fontFamily: 'Arial, sans-serif',
    fontSize: '18px',
    fontStyle: 'bold',
    color: completed ? '#7ee0a0' : '#f0c969',
  }).setOrigin(1, 0));

  const detail = completed
    ? `${scene.locale === 'ru' ? 'Награда' : 'Reward'}: ${formatMoney(scene.locale, chain.rewardCash)} · +${chain.rewardReputationXp} REP`
    : chain.steps[stage]?.clue[scene.locale]
      ?? (scene.locale === 'ru' ? 'След расследования обновлён.' : 'The investigation trail has been updated.');
  modal.add(scene.add.text(-244, -18, detail, {
    fontFamily: 'Arial, sans-serif',
    fontSize: completed ? '16px' : '14px',
    fontStyle: 'bold',
    color: completed ? '#7ee0a0' : '#c8ced6',
    wordWrap: { width: 488 },
    lineSpacing: 3,
  }));

  const close = (): void => {
    overlay.destroy();
    modal.destroy();
  };
  const continueButton = button(
    scene,
    0,
    83,
    scene.locale === 'ru' ? 'Продолжить' : 'Continue',
    close,
    {
      width: 220,
      height: 48,
      background: completed ? 0x2f6e49 : 0x8f6c22,
      accent,
      fontSize: 14,
    },
  );
  modal.add(continueButton);

  if (!prefersReducedMotion()) {
    modal.setAlpha(0).setScale(0.965);
    scene.tweens.add({
      targets: modal,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: completed ? 360 : 260,
      ease: completed ? 'Back.Out' : 'Cubic.Out',
    });
  }
}

function formatMoney(locale: Locale, value: number): string {
  const formatted = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 0 }).format(value);
  return `${formatted} ₽`;
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
