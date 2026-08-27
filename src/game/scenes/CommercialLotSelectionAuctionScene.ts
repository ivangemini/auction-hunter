import Phaser from 'phaser';
import type { PlayerSave } from '../../domain/types';
import { t } from '../../i18n';
import { setGameplayActive } from '../../platform/yandex';
import { resolveLotTexture } from '../art';
import backplate0 from '../commercialArt/backplate0';
import backplate1 from '../commercialArt/backplate1';
import backplate2 from '../commercialArt/backplate2';
import backplate3 from '../commercialArt/backplate3';
import backplate4 from '../commercialArt/backplate4';
import backplate5 from '../commercialArt/backplate5';
import { playFeedbackCue } from '../feedback';
import type { LotChoice } from '../lotMarket';
import { prefersReducedMotion } from '../motion';
import { CampaignProvenanceAuctionScene } from './CampaignProvenanceAuctionScene';

const COMMERCIAL_LOT_TEXTURE = 'ui:lot-selection-commercial';
const COMMERCIAL_LOT_ASSET = `data:image/webp;base64,${backplate0}${backplate1}${backplate2}${backplate3}${backplate4}${backplate5}`;
const CARD_CENTERS = [226, 638, 1050] as const;
const CARD_ACCENTS = [0x3d9cff, 0xa454e8, 0xe9a72b] as const;
const STAGE_SAFE_BOTTOM = 332;
const TIER_SHIFT_Y = 208;

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
 * Commercial lot-selection presentation.
 *
 * Protected stage zone: y=82..332. The authored auctioneer, face, hat, hammer
 * and gesture own that space. Runtime HUD, tabs and lot controls are kept in
 * the top corners or below the podium so UI never masks the character read.
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
  }
}

function renderCommercialLotSelection(scene: CommercialRuntime): void {
  setGameplayActive(false);
  scene.lotSelectionPending = false;
  scene.children.removeAll(true);

  renderCommercialBackdrop(scene);
  renderLiveHeader(scene);
  renderTierTabsBelowStage(scene);
  renderNavigation(scene);
  installLegacyNavigationTargets(scene);

  scene.lotChoices.slice(0, 3).forEach((choice, index) => {
    const centerX = CARD_CENTERS[index];
    if (centerX === undefined) return;
    const accent = CARD_ACCENTS[index] ?? CARD_ACCENTS[0];
    renderCommercialCard(scene, choice, index, centerX, accent);
  });
}

function renderCommercialBackdrop(scene: CommercialRuntime): void {
  if (scene.textures.exists(COMMERCIAL_LOT_TEXTURE)) {
    scene.add.image(640, 360, COMMERCIAL_LOT_TEXTURE)
      .setDisplaySize(1280, 720)
      .setDepth(0);
    scene.add.rectangle(640, 562, 1280, 316, 0x020304, 0.16).setDepth(1);
    return;
  }

  scene.add.rectangle(640, 360, 1280, 720, 0x17100d, 1).setDepth(0);
  scene.add.ellipse(640, 230, 820, 360, 0xd18431, 0.16).setDepth(0);
  scene.add.text(640, 250, 'COMMERCIAL ART LOAD FAILED', {
    fontFamily: 'Arial, sans-serif', fontSize: '24px', fontStyle: 'bold', color: '#ffca70',
  }).setOrigin(0.5).setDepth(1);
}

function renderLiveHeader(scene: CommercialRuntime): void {
  const save = scene.store.snapshot;

  scene.add.rectangle(168, 52, 300, 76, 0x05070a, 0.62)
    .setStrokeStyle(1, 0xd8a63a, 0.5)
    .setDepth(5);
  scene.add.text(32, 23, scene.locale === 'ru' ? 'РЕПУТАЦИЯ' : 'REPUTATION', {
    fontFamily: 'Georgia, serif', fontSize: '10px', color: '#d6c7ae',
  }).setDepth(6);
  scene.add.text(32, 42, String(Math.floor(save.reputationXp)), {
    fontFamily: 'Georgia, serif', fontSize: '23px', fontStyle: 'bold', color: '#d99cff',
  }).setDepth(6);
  scene.add.text(178, 23, scene.locale === 'ru' ? 'СРЕДСТВА' : 'FUNDS', {
    fontFamily: 'Georgia, serif', fontSize: '10px', color: '#d6c7ae',
  }).setDepth(6);
  scene.add.text(178, 42, scene.money(save.cash), {
    fontFamily: 'Georgia, serif', fontSize: '23px', fontStyle: 'bold', color: '#83e87a',
  }).setDepth(6);

  scene.add.rectangle(1110, 52, 284, 76, 0x05070a, 0.58)
    .setStrokeStyle(1, 0xd8a63a, 0.42)
    .setDepth(5);
  scene.add.text(1110, 27, scene.locale === 'ru' ? 'АУКЦИОН ОТКРЫТ' : 'AUCTION OPEN', {
    fontFamily: 'Georgia, serif', fontSize: '15px', fontStyle: 'bold', color: '#f2d488',
    stroke: '#120a05', strokeThickness: 2,
  }).setOrigin(0.5, 0).setDepth(6);
  scene.add.text(1110, 53, scene.locale === 'ru'
    ? 'Выбери риск — затем торгуйся.'
    : 'Choose the risk, then bid.', {
    fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#e8e0d2',
    stroke: '#05070a', strokeThickness: 2,
  }).setOrigin(0.5, 0).setDepth(6);

  scene.add.text(640, 18, scene.locale === 'ru' ? 'ВЫБЕРИ СЛЕДУЮЩИЙ ЛОТ' : 'CHOOSE YOUR NEXT LOT', {
    fontFamily: 'Georgia, serif', fontSize: '21px', fontStyle: 'bold', color: '#f2d488',
    stroke: '#120a05', strokeThickness: 3,
  }).setOrigin(0.5, 0).setDepth(6);
}

function renderTierTabsBelowStage(scene: CommercialRuntime): void {
  const before = scene.children.list.length;
  scene.renderTierTabs(true);
  const added = scene.children.list.slice(before);

  added.forEach((child) => {
    const gameObject = child as Phaser.GameObjects.GameObject & { y?: number; setDepth?: (depth: number) => unknown };
    if (typeof gameObject.y === 'number') gameObject.y += TIER_SHIFT_Y;
    gameObject.setDepth?.(7);
  });

  scene.add.rectangle(640, STAGE_SAFE_BOTTOM + 18, 1110, 2, 0xd8a63a, 0.38).setDepth(6);
}

function renderCommercialCard(
  scene: CommercialRuntime,
  choice: LotChoice,
  optionIndex: number,
  centerX: number,
  accent: number,
): void {
  scene.add.rectangle(centerX + 5, 552, 366, 310, 0x000000, 0.24)
    .setStrokeStyle(2, 0x000000, 0.22)
    .setDepth(2);
  scene.add.rectangle(centerX, 547, 366, 310, 0x07090c, 0.46)
    .setStrokeStyle(2, accent, 0.78)
    .setDepth(3);
  scene.add.rectangle(centerX, 397, 334, 4, accent, 0.95).setDepth(4);

  const texture = resolveLotTexture(scene, choice.lot.artId ?? choice.lot.id);
  if (texture) {
    scene.add.image(centerX, 469, texture)
      .setDisplaySize(330, 142)
      .setDepth(4);
  } else {
    scene.add.rectangle(centerX, 469, 330, 142, accent, 0.12)
      .setStrokeStyle(1, accent, 0.42)
      .setDepth(4);
  }

  scene.add.rectangle(centerX, 536, 330, 46, 0x020304, 0.62).setDepth(5);

  scene.add.text(centerX - 148, 408, String(optionIndex + 1), {
    fontFamily: 'Georgia, serif', fontSize: '26px', fontStyle: 'bold', color: '#fff4d5',
    stroke: '#160b05', strokeThickness: 3,
  }).setDepth(6);
  scene.add.rectangle(centerX - 139, 431, 40, 2, accent, 0.95).setDepth(5);

  scene.add.text(centerX, 520, choice.lot.name[scene.locale], {
    fontFamily: 'Georgia, serif',
    fontSize: '17px',
    fontStyle: 'bold',
    color: '#fff7e8',
    stroke: '#05070a',
    strokeThickness: 3,
    align: 'center',
    wordWrap: { width: 316 },
  }).setOrigin(0.5, 0).setDepth(6);
  scene.add.text(centerX, 548, choice.lot.location[scene.locale], {
    fontFamily: 'Arial, sans-serif', fontSize: '9px', color: '#d7ecfa',
    stroke: '#05070a', strokeThickness: 2,
  }).setOrigin(0.5, 0).setDepth(6);

  renderMetric(scene, centerX - 108, 579, t(scene.locale, 'reservePrice'), scene.money(choice.lot.reservePrice), '#ffe19a');
  renderMetric(scene, centerX, 579, t(scene.locale, 'itemsInside'), String(choice.lot.itemCount), '#ffffff');

  const eventName = choice.modifier
    ? choice.modifier.name[scene.locale]
    : t(scene.locale, 'noEvent');
  renderMetric(scene, centerX + 108, 579, t(scene.locale, 'event'), eventName, choice.modifier ? '#d9a1ff' : '#aab3bc');

  installLotHitTarget(scene, choice, optionIndex, centerX, accent);
}

function renderMetric(
  scene: CommercialRuntime,
  x: number,
  y: number,
  label: string,
  value: string,
  valueColor: string,
): void {
  scene.add.text(x, y, label.toUpperCase(), {
    fontFamily: 'Arial, sans-serif', fontSize: '7px', fontStyle: 'bold', color: '#b9b1a5',
  }).setOrigin(0.5, 0).setDepth(6);
  scene.add.text(x, y + 16, value, {
    fontFamily: 'Georgia, serif', fontSize: '13px', fontStyle: 'bold', color: valueColor,
    align: 'center', wordWrap: { width: 100 },
    stroke: '#05070a', strokeThickness: 2,
  }).setOrigin(0.5, 0).setDepth(6);
}

function installLotHitTarget(
  scene: CommercialRuntime,
  choice: LotChoice,
  optionIndex: number,
  centerX: number,
  accent: number,
): void {
  const glow = scene.add.rectangle(centerX, 681, 332, 50, accent, 0.2)
    .setStrokeStyle(2, accent, 0.82)
    .setDepth(7);
  const label = scene.add.text(centerX, 681, t(scene.locale, 'chooseLot').toUpperCase(), {
    fontFamily: 'Georgia, serif', fontSize: '16px', fontStyle: 'bold', color: '#fff5dc',
    stroke: '#241205', strokeThickness: 2,
  }).setOrigin(0.5).setDepth(8);

  const commitSelection = (): void => {
    if (scene.lotSelectionPending) return;
    scene.lotSelectionPending = true;
    playFeedbackCue(scene, 'ui');

    if (prefersReducedMotion()) {
      scene.selectLotChoice(choice, optionIndex);
      return;
    }

    scene.tweens.add({
      targets: [glow, label],
      scaleX: { from: 1, to: 1.025 },
      scaleY: { from: 1, to: 1.025 },
      duration: 130,
      yoyo: true,
      ease: 'Cubic.Out',
      onComplete: () => scene.selectLotChoice(choice, optionIndex),
    });
  };

  const hit = scene.add.rectangle(centerX, 681, 342, 56, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: true })
    .setDepth(9);
  hit.on('pointerover', () => glow.setFillStyle(accent, 0.36).setStrokeStyle(3, 0xffefbd, 0.85));
  hit.on('pointerout', () => glow.setFillStyle(accent, 0.2).setStrokeStyle(2, accent, 0.82));
  hit.on('pointerup', commitSelection);

  if (optionIndex === 0) {
    const legacyFirstChoiceHit = scene.add.rectangle(240, 625, 260, 34, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(9);
    legacyFirstChoiceHit.on('pointerup', commitSelection);
  }
}

function renderNavigation(scene: CommercialRuntime): void {
  addTextAction(scene, 1004, 106, scene.locale === 'ru' ? 'КОЛЛЕКЦИЯ' : 'COLLECTION', 0x61a8ff, () => scene.scene.start('collection'));
  addTextAction(scene, 1120, 106, scene.locale === 'ru' ? 'ЕЖЕДНЕВНЫЙ' : 'DAILY', 0xe9b949, () => scene.activateDailySpecial());
  addTextAction(scene, 1222, 106, scene.locale === 'ru' ? 'ДЕЛО' : 'CASE', 0xc4773a, () => scene.scene.start('campaign'));
}

function installLegacyNavigationTargets(scene: CommercialRuntime): void {
  const collectionHit = scene.add.rectangle(1000, 112, 176, 32, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: true })
    .setDepth(9);
  collectionHit.on('pointerup', () => scene.scene.start('collection'));

  const dailyHit = scene.add.rectangle(1178, 112, 150, 32, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: true })
    .setDepth(9);
  dailyHit.on('pointerup', () => scene.activateDailySpecial());

  const campaignHit = scene.add.rectangle(740, 218, 180, 38, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: true })
    .setDepth(9);
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
