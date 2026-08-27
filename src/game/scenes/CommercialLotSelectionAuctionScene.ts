import Phaser from 'phaser';
import type { PlayerSave } from '../../domain/types';
import { t } from '../../i18n';
import { setGameplayActive } from '../../platform/yandex';
import { playFeedbackCue } from '../feedback';
import type { LotChoice } from '../lotMarket';
import { prefersReducedMotion } from '../motion';
import { CampaignProvenanceAuctionScene } from './CampaignProvenanceAuctionScene';

const COMMERCIAL_LOT_TEXTURE = 'ui:lot-selection-commercial';
const COMMERCIAL_LOT_ASSET = '/assets/ui/lot-selection-commercial.webp';
const COMMERCIAL_CARD_TEXTURE = 'ui:lot-card-commercial';
const COMMERCIAL_CARD_ASSET = '/assets/ui/lot-card-commercial.webp';
const CARD_CENTERS = [226, 638, 1050] as const;
const CARD_ACCENTS = [0x3d9cff, 0xa454e8, 0xe9a72b] as const;

type CommercialRuntime = Phaser.Scene & {
  locale: 'ru' | 'en';
  lotChoices: LotChoice[];
  lotSelectionPending: boolean;
  store: { snapshot: Readonly<PlayerSave> };
  selectLotChoice: (choice: LotChoice, optionIndex: number) => void;
  activateDailySpecial: () => void;
  money: (value: number) => string;
  renderTierTabs: (interactive: boolean) => void;
  renderLotSelection: () => void;
};

/**
 * Painterly production presentation for the real lot-selection runtime.
 * Raster assets own scene/character/material richness; Phaser owns live data,
 * navigation, hit targets, localization, analytics and auction/economy truth.
 */
export class CommercialLotSelectionAuctionScene extends CampaignProvenanceAuctionScene {
  constructor() {
    super();
    const runtime = this as unknown as CommercialRuntime;
    runtime.renderLotSelection = () => renderCommercialLotSelection(runtime);
  }

  preload(): void {
    super.preload();
    if (!this.textures.exists(COMMERCIAL_LOT_TEXTURE)) {
      this.load.image(COMMERCIAL_LOT_TEXTURE, COMMERCIAL_LOT_ASSET);
    }
    if (!this.textures.exists(COMMERCIAL_CARD_TEXTURE)) {
      this.load.image(COMMERCIAL_CARD_TEXTURE, COMMERCIAL_CARD_ASSET);
    }
  }
}

function renderCommercialLotSelection(scene: CommercialRuntime): void {
  setGameplayActive(false);
  scene.lotSelectionPending = false;
  scene.children.removeAll(true);

  renderCommercialBackdrop(scene);
  renderLiveHeader(scene);

  // AuctionScene remains the sole owner of tier state, market-cycle cache,
  // unlock rules, Daily clearing and tier analytics.
  scene.renderTierTabs(true);

  renderNavigation(scene);
  installLegacyNavigationTargets(scene);

  scene.lotChoices.slice(0, 3).forEach((choice, index) => {
    const centerX = CARD_CENTERS[index];
    if (centerX === undefined) return;
    const accent = CARD_ACCENTS[index] ?? CARD_ACCENTS[0];
    renderCommercialCardShell(scene, centerX, accent);
    renderLiveLotData(scene, choice, centerX, accent);
    installLotHitTarget(scene, choice, index, centerX, accent);
  });
}

function renderCommercialBackdrop(scene: CommercialRuntime): void {
  if (scene.textures.exists(COMMERCIAL_LOT_TEXTURE)) {
    scene.add.image(640, 360, COMMERCIAL_LOT_TEXTURE)
      .setDisplaySize(1280, 720)
      .setDepth(0);
    return;
  }

  // Never fail silently into a black screen. CI screenshot gates should make
  // a missing production asset immediately obvious.
  scene.add.rectangle(640, 360, 1280, 720, 0x251412, 1).setDepth(0);
  scene.add.text(640, 260, 'COMMERCIAL ART LOAD FAILED', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '30px',
    fontStyle: 'bold',
    color: '#ffca70',
  }).setOrigin(0.5).setDepth(1);
}

function renderCommercialCardShell(scene: CommercialRuntime, centerX: number, accent: number): void {
  if (scene.textures.exists(COMMERCIAL_CARD_TEXTURE)) {
    scene.add.image(centerX, 535, COMMERCIAL_CARD_TEXTURE)
      .setDisplaySize(388, 328)
      .setTint(accent)
      .setAlpha(0.94)
      .setDepth(2);
    return;
  }

  // Fallback is intentionally conspicuous rather than a polished rectangle.
  scene.add.text(centerX, 500, 'ART', {
    fontFamily: 'Arial, sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#ffca70',
  }).setOrigin(0.5).setDepth(2);
}

function renderLiveHeader(scene: CommercialRuntime): void {
  const save = scene.store.snapshot;

  scene.add.text(32, 24, scene.locale === 'ru' ? 'РЕПУТАЦИЯ' : 'REPUTATION', {
    fontFamily: 'Georgia, serif', fontSize: '10px', color: '#d6c7ae',
    stroke: '#07090c', strokeThickness: 3,
  }).setDepth(6);
  scene.add.text(32, 42, String(Math.floor(save.reputationXp)), {
    fontFamily: 'Georgia, serif', fontSize: '23px', fontStyle: 'bold', color: '#d99cff',
    stroke: '#07090c', strokeThickness: 4,
  }).setDepth(6);

  scene.add.text(178, 24, scene.locale === 'ru' ? 'СРЕДСТВА' : 'FUNDS', {
    fontFamily: 'Georgia, serif', fontSize: '10px', color: '#d6c7ae',
    stroke: '#07090c', strokeThickness: 3,
  }).setDepth(6);
  scene.add.text(178, 42, scene.money(save.cash), {
    fontFamily: 'Georgia, serif', fontSize: '23px', fontStyle: 'bold', color: '#83e87a',
    stroke: '#07090c', strokeThickness: 4,
  }).setDepth(6);

  if (scene.locale === 'ru') {
    scene.add.text(640, 24, 'ВЫБЕРИ СЛЕДУЮЩИЙ ЛОТ', {
      fontFamily: 'Georgia, serif', fontSize: '31px', fontStyle: 'bold', color: '#f2d488',
      stroke: '#07090c', strokeThickness: 5,
    }).setOrigin(0.5, 0).setDepth(6);
    scene.add.text(640, 66, 'Три разных лота. Оцени риск и выбери, за что торговаться.', {
      fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#f3eee4',
      stroke: '#07090c', strokeThickness: 3,
    }).setOrigin(0.5, 0).setDepth(6);
  }
}

function renderLiveLotData(
  scene: CommercialRuntime,
  choice: LotChoice,
  centerX: number,
  accent: number,
): void {
  scene.add.text(centerX, 386, choice.lot.name[scene.locale], {
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#fff7e8',
    stroke: '#05070a',
    strokeThickness: 4,
    align: 'center',
    wordWrap: { width: 286 },
  }).setOrigin(0.5, 0).setDepth(6);
  scene.add.text(centerX, 416, choice.lot.location[scene.locale], {
    fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#d7ecfa',
    stroke: '#05070a', strokeThickness: 3,
  }).setOrigin(0.5, 0).setDepth(6);

  const infoX = centerX + 100;
  scene.add.text(infoX, 474, t(scene.locale, 'reservePrice').toUpperCase(), {
    fontFamily: 'Arial, sans-serif', fontSize: '8px', color: '#c9c0ae',
    stroke: '#05070a', strokeThickness: 2,
  }).setOrigin(0.5, 0).setDepth(6);
  scene.add.text(infoX, 491, scene.money(choice.lot.reservePrice), {
    fontFamily: 'Georgia, serif', fontSize: '17px', fontStyle: 'bold', color: '#ffe19a',
    stroke: '#05070a', strokeThickness: 3,
  }).setOrigin(0.5, 0).setDepth(6);

  scene.add.text(infoX, 531, t(scene.locale, 'itemsInside').toUpperCase(), {
    fontFamily: 'Arial, sans-serif', fontSize: '8px', color: '#c9c0ae',
    stroke: '#05070a', strokeThickness: 2,
  }).setOrigin(0.5, 0).setDepth(6);
  scene.add.text(infoX, 548, String(choice.lot.itemCount), {
    fontFamily: 'Georgia, serif', fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
    stroke: '#05070a', strokeThickness: 3,
  }).setOrigin(0.5, 0).setDepth(6);

  const eventName = choice.modifier
    ? choice.modifier.name[scene.locale]
    : t(scene.locale, 'noEvent');
  scene.add.text(infoX, 585, t(scene.locale, 'event').toUpperCase(), {
    fontFamily: 'Arial, sans-serif', fontSize: '8px', color: '#c9c0ae',
    stroke: '#05070a', strokeThickness: 2,
  }).setOrigin(0.5, 0).setDepth(6);
  scene.add.text(infoX, 601, eventName, {
    fontFamily: 'Arial, sans-serif', fontSize: '8px', fontStyle: 'bold',
    color: choice.modifier ? '#d9a1ff' : '#d5dde4', align: 'center',
    stroke: '#05070a', strokeThickness: 2,
    wordWrap: { width: 98 },
  }).setOrigin(0.5, 0).setDepth(6);
}

function installLotHitTarget(
  scene: CommercialRuntime,
  choice: LotChoice,
  optionIndex: number,
  centerX: number,
  accent: number,
): void {
  const glow = scene.add.rectangle(centerX, 681, 344, 54, accent, 0)
    .setStrokeStyle(3, accent, 0)
    .setDepth(7);
  const commitSelection = (): void => {
    if (scene.lotSelectionPending) return;
    scene.lotSelectionPending = true;
    playFeedbackCue(scene, 'ui');

    if (prefersReducedMotion()) {
      scene.selectLotChoice(choice, optionIndex);
      return;
    }

    scene.tweens.add({
      targets: glow,
      alpha: { from: 1, to: 0.15 },
      scaleX: { from: 1, to: 1.025 },
      scaleY: { from: 1, to: 1.025 },
      duration: 130,
      ease: 'Cubic.Out',
      onComplete: () => scene.selectLotChoice(choice, optionIndex),
    });
  };

  const hit = scene.add.rectangle(centerX, 681, 354, 62, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: true })
    .setDepth(8);
  hit.on('pointerover', () => glow.setFillStyle(accent, 0.08).setStrokeStyle(3, accent, 0.7));
  hit.on('pointerout', () => glow.setFillStyle(accent, 0).setStrokeStyle(3, accent, 0));
  hit.on('pointerup', commitSelection);

  if (optionIndex === 0) {
    const legacyFirstChoiceHit = scene.add.rectangle(240, 625, 260, 34, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(8);
    legacyFirstChoiceHit.on('pointerup', commitSelection);
  }
}

function renderNavigation(scene: CommercialRuntime): void {
  addTextAction(scene, 1026, 106, scene.locale === 'ru' ? 'КОЛЛЕКЦИЯ' : 'COLLECTION', 0x61a8ff, () => scene.scene.start('collection'));
  addTextAction(scene, 1134, 106, scene.locale === 'ru' ? 'ЕЖЕДНЕВНЫЙ' : 'DAILY', 0xe9b949, () => scene.activateDailySpecial());
  addTextAction(scene, 1234, 106, scene.locale === 'ru' ? 'ДЕЛО' : 'CASE', 0xc4773a, () => scene.scene.start('campaign'));
}

function installLegacyNavigationTargets(scene: CommercialRuntime): void {
  const collectionHit = scene.add.rectangle(1000, 112, 176, 32, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: true })
    .setDepth(7);
  collectionHit.on('pointerup', () => scene.scene.start('collection'));

  const dailyHit = scene.add.rectangle(1178, 112, 150, 32, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: true })
    .setDepth(7);
  dailyHit.on('pointerup', () => scene.activateDailySpecial());

  const campaignHit = scene.add.rectangle(740, 218, 180, 38, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: true })
    .setDepth(7);
  campaignHit.on('pointerup', () => scene.scene.start('campaign'));
}

function addTextAction(
  scene: CommercialRuntime,
  x: number,
  y: number,
  label: string,
  accent: number,
  action: () => void,
): void {
  const text = scene.add.text(x, y, label, {
    fontFamily: 'Arial, sans-serif', fontSize: '9px', fontStyle: 'bold', color: '#eadbbd',
    stroke: '#05070a', strokeThickness: 2,
  }).setOrigin(0.5).setDepth(8).setInteractive({ useHandCursor: true });
  const underline = scene.add.rectangle(x, y + 10, Math.max(42, text.width + 8), 2, accent, 0.5).setDepth(8);
  text.on('pointerover', () => underline.setAlpha(1));
  text.on('pointerout', () => underline.setAlpha(0.5));
  text.on('pointerup', () => {
    playFeedbackCue(scene, 'ui');
    action();
  });
}
