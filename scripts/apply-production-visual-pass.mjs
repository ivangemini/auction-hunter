import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, content) {
  fs.writeFileSync(path, content);
}

function replaceOnce(source, before, after, label) {
  const index = source.indexOf(before);
  if (index < 0) throw new Error(`Missing replacement marker: ${label}`);
  if (source.indexOf(before, index + before.length) >= 0) throw new Error(`Ambiguous replacement marker: ${label}`);
  return source.slice(0, index) + after + source.slice(index + before.length);
}

function replaceRange(source, start, end, replacement, label) {
  const startIndex = source.indexOf(start);
  if (startIndex < 0) throw new Error(`Missing start marker: ${label}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  if (endIndex < 0) throw new Error(`Missing end marker: ${label}`);
  return source.slice(0, startIndex) + replacement + '\n\n' + source.slice(endIndex);
}

// ---------------------------------------------------------------------------
// Auction base: environment/material foundation used by production subclasses.
// ---------------------------------------------------------------------------
{
  const path = 'src/game/scenes/AuctionScene.ts';
  let src = read(path);
  src = replaceOnce(
    src,
    "import { button } from '../ui';",
    "import { button } from '../ui';\nimport { addAtmosphere, VISUAL } from '../visual';",
    'AuctionScene visual import',
  );

  src = replaceRange(
    src,
    '  private resetCanvas(): void {',
    '  private divider(',
    String.raw`  private resetCanvas(): void {
    this.children.removeAll(true);
    const tierAccent = getAuctionTier(this.currentTierId).accent ?? VISUAL.warm;
    addAtmosphere(this, WIDTH, HEIGHT, tierAccent, 1040);

    // Physical room cues survive behind every inherited production renderer.
    this.add.rectangle(0, 112, WIDTH, 2, 0xffffff, 0.025).setOrigin(0);
    this.add.rectangle(0, 682, WIDTH, 38, VISUAL.wood, 0.18).setOrigin(0);
    this.add.rectangle(0, 680, WIDTH, 2, VISUAL.brass, 0.16).setOrigin(0);
    this.add.ellipse(1040, 180, 440, 250, tierAccent, 0.028);
  }

  private panel(x: number, y: number, width: number, height: number, color = 0x15181e): Phaser.GameObjects.Rectangle {
    this.add.rectangle(x + 7, y + 9, width, height, 0x000000, 0.36).setOrigin(0);
    this.add.rectangle(x - 3, y - 3, width + 6, height + 6, VISUAL.warm, 0.012)
      .setOrigin(0)
      .setStrokeStyle(1, VISUAL.warm, 0.045);
    const body = this.add.rectangle(x, y, width, height, color, 0.985)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff, 0.09);
    this.add.rectangle(x + 9, y + 9, Math.max(0, width - 18), 1, 0xffffff, 0.05).setOrigin(0);
    this.add.rectangle(x, y, width, 2, VISUAL.warm, 0.18).setOrigin(0);
    return body;
  }`,
    'AuctionScene reset/panel',
  );

  src = replaceRange(
    src,
    '  private renderLotArtworkFor(',
    '  private conditionBar(',
    String.raw`  private renderLotArtworkFor(lot: LotTemplate, x: number, y: number, width: number, height: number): void {
    const texture = resolveLotTexture(this, lot.artId ?? lot.id);
    this.add.rectangle(x + 6, y + 8, width + 2, height + 2, 0x000000, 0.42);
    this.add.rectangle(x, y, width + 8, height + 8, VISUAL.warm, 0.018)
      .setStrokeStyle(1, VISUAL.warm, 0.08);
    if (!texture) {
      this.add.rectangle(x, y, width, height, 0x20242b).setStrokeStyle(1, 0xffffff, 0.08);
      return;
    }
    this.add.image(x, y, texture).setDisplaySize(width, height);
    this.add.rectangle(x, y + height * 0.38, width, height * 0.24, 0x000000, 0.14);
    this.add.rectangle(x, y, width, height, 0x000000, 0).setStrokeStyle(1, 0xffffff, 0.14);
    this.add.rectangle(x, y - height / 2 + 2, Math.max(24, width - 12), 2, VISUAL.warm, 0.18);
  }`,
    'AuctionScene lot art',
  );
  write(path, src);
}

// ---------------------------------------------------------------------------
// Lot selection: more environment-led cards, less metric-dashboard language.
// ---------------------------------------------------------------------------
{
  const path = 'src/game/scenes/PolishedAuctionScene.ts';
  let src = read(path);

  src = replaceOnce(
    src,
    '    card.add([shadow, glow, body, inner]);',
    String.raw`    const materialBack = scene.add.rectangle(10, 10, CARD_WIDTH - 20, CARD_HEIGHT - 20, 0x241a14, 0.12)
      .setOrigin(0)
      .setStrokeStyle(1, 0xe9b949, 0.06);
    const brassRail = scene.add.rectangle(13, CARD_HEIGHT - 13, CARD_WIDTH - 26, 2, 0xb78a3b, 0.2).setOrigin(0);
    card.add([shadow, glow, body, inner, materialBack, brassRail]);`,
    'lot card material shell',
  );

  src = replaceRange(
    src,
    'function renderHeroArt(',
    'function renderRankRibbon(',
    String.raw`function renderHeroArt(
  scene: AuctionRuntime,
  card: Phaser.GameObjects.Container,
  choice: LotChoice,
  accent: number,
): void {
  const artShadow = scene.add.rectangle(25, 27, CARD_WIDTH - 42, 194, 0x000000, 0.42)
    .setOrigin(0);
  const artFrame = scene.add.rectangle(18, 16, CARD_WIDTH - 36, 202, 0x171c24, 1)
    .setOrigin(0)
    .setStrokeStyle(2, accent, 0.42);
  const innerFrame = scene.add.rectangle(23, 21, CARD_WIDTH - 46, 192, 0x0a0d11, 1)
    .setOrigin(0)
    .setStrokeStyle(1, 0xffffff, 0.08);
  card.add([artShadow, artFrame, innerFrame]);

  const texture = resolveLotTexture(scene, choice.lot.artId ?? choice.lot.id);
  if (texture) {
    const image = scene.add.image(CARD_WIDTH / 2, 117, texture).setDisplaySize(CARD_WIDTH - 48, 188);
    card.add(image);
  } else {
    card.add(scene.add.rectangle(24, 23, CARD_WIDTH - 48, 188, 0x20242b, 1).setOrigin(0));
  }

  // Lighting and foreground framing make the lot read as a place rather than a thumbnail.
  const lampPool = scene.add.ellipse(CARD_WIDTH * 0.7, 79, 210, 112, accent, 0.045);
  const lowerShade = scene.add.rectangle(24, 162, CARD_WIDTH - 48, 49, 0x05070a, 0.54).setOrigin(0);
  const floorRail = scene.add.rectangle(24, 207, CARD_WIDTH - 48, 3, 0xb78a3b, 0.22).setOrigin(0);
  const leftPost = scene.add.rectangle(24, 23, 4, 188, accent, 0.25).setOrigin(0);
  const rightPost = scene.add.rectangle(CARD_WIDTH - 28, 23, 4, 188, 0xffffff, 0.04).setOrigin(0);
  card.add([lampPool, lowerShade, floorRail, leftPost, rightPost]);
}`,
    'lot hero art',
  );

  src = replaceRange(
    src,
    'function renderMetric(',
    'function installCardHover(',
    String.raw`function renderMetric(
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
  const labelText = text(scene, x + 2, y, label.toUpperCase(), 8, '#707985', 'bold');
  const shadow = scene.add.rectangle(x + 3, y + 20, width, 34, 0x000000, 0.3).setOrigin(0);
  const box = scene.add.rectangle(x, y + 17, width, 34, emphasized ? 0x26351f : 0x15191f, 0.96)
    .setOrigin(0)
    .setStrokeStyle(1, accent, emphasized ? 0.5 : 0.22);
  const rail = scene.add.rectangle(x, y + 17, 4, 34, accent, emphasized ? 0.86 : 0.5).setOrigin(0);
  const top = scene.add.rectangle(x + 7, y + 20, Math.max(8, width - 14), 1, 0xffffff, 0.08).setOrigin(0);
  const valueText = text(scene, x + 14, y + 25, value, emphasized ? 17 : 13, '#f4f0e7', 'bold')
    .setWordWrapWidth(width - 20);
  card.add([labelText, shadow, box, rail, top, valueText]);
}`,
    'lot metric tags',
  );
  write(path, src);
}

// ---------------------------------------------------------------------------
// Core bidding/reveal/appraisal: stage energy + item hero treatment.
// ---------------------------------------------------------------------------
{
  const path = 'src/game/scenes/PolishedAuctionSceneV2.ts';
  let src = read(path);
  src = replaceOnce(
    src,
    "import { button } from '../ui';",
    "import { button } from '../ui';\nimport { addHeroStage, VISUAL } from '../visual';",
    'PolishedAuctionSceneV2 visual import',
  );

  src = replaceRange(
    src,
    'function renderBidding(scene: AuctionRuntime): void {',
    'function cluePanel(',
    String.raw`function renderBidding(scene: AuctionRuntime): void {
  scene.resetCanvas();
  header(scene, t(scene.locale, 'title'), scene.lot.name[scene.locale]);

  panel(scene, 28, 132, 802, 554, 0xe9b949);

  // A theatrical lot stage: environment first, UI floats in front of it.
  scene.add.rectangle(48, 150, 762, 286, 0x0b0d10, 0.94).setOrigin(0).setStrokeStyle(1, 0xe9b949, 0.18);
  scene.add.ellipse(430, 230, 620, 248, 0xe9b949, 0.035);
  lotArt(scene, 429, 266, 756, 224);
  scene.add.rectangle(51, 328, 756, 58, 0x05070a, 0.58).setOrigin(0);
  scene.add.rectangle(51, 382, 756, 3, VISUAL.brass, 0.25).setOrigin(0);
  scene.add.rectangle(51, 386, 756, 15, VISUAL.wood, 0.24).setOrigin(0);

  const bidCard = scene.add.container(70, 300);
  const bidShadow = scene.add.rectangle(7, 8, 326, 120, 0x000000, 0.46).setOrigin(0);
  const bidGlow = scene.add.rectangle(-4, -4, 326, 120, 0xe9b949, 0.08)
    .setOrigin(0)
    .setStrokeStyle(2, 0xe9b949, 0.56);
  const bidBody = scene.add.rectangle(4, 4, 310, 104, 0x10151b, 0.97)
    .setOrigin(0)
    .setStrokeStyle(1, 0xffffff, 0.09);
  const bidTop = scene.add.rectangle(12, 12, 294, 2, 0xe9b949, 0.42).setOrigin(0);
  bidCard.add([
    bidShadow,
    bidGlow,
    bidBody,
    bidTop,
    text(scene, 26, 23, t(scene.locale, 'currentBid').toUpperCase(), 10, '#8f98a4', 'bold'),
    text(scene, 26, 44, scene.money(scene.currentBid), 42, '#f7f3e8', 'bold'),
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
  scene.add.rectangle(70, 429, 326, 42, playerLeading ? 0x173522 : 0x362a15, 0.92)
    .setOrigin(0)
    .setStrokeStyle(1, playerLeading ? 0x63d28d : 0xe9b949, 0.44);
  scene.add.rectangle(70, 429, 5, 42, playerLeading ? 0x63d28d : 0xe9b949, 0.88).setOrigin(0);
  text(scene, 88, 440, `${t(scene.locale, 'leader')}: ${leader}`, 16, playerLeading ? '#7ee0a0' : '#f0c969', 'bold');

  if (scene.notice) {
    scene.add.rectangle(70, 480, 326, 34, 0x351719, 0.92).setOrigin(0).setStrokeStyle(1, 0xff8d85, 0.42);
    text(scene, 84, 489, scene.notice, 12, '#ffaaa4', 'bold').setWordWrapWidth(294);
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
}`,
    'production bidding',
  );

  src = replaceRange(
    src,
    'function renderWin(scene: AuctionRuntime): void {',
    'function renderReveal(',
    String.raw`function renderWin(scene: AuctionRuntime): void {
  scene.resetCanvas();
  header(scene, t(scene.locale, 'won'), scene.lot.name[scene.locale]);
  panel(scene, 140, 145, 1000, 500, 0xe9b949);
  scene.add.rectangle(166, 168, 948, 292, 0x0a0d10, 0.92).setOrigin(0).setStrokeStyle(1, 0xe9b949, 0.22);
  const halo = scene.add.ellipse(640, 302, 720, 330, 0xe9b949, 0.06).setStrokeStyle(2, 0xe9b949, 0.15);
  lotArt(scene, 640, 304, 690, 294);
  scene.add.rectangle(295, 382, 690, 68, 0x06080b, 0.72).setOrigin(0);
  scene.add.rectangle(295, 446, 690, 3, VISUAL.brass, 0.3).setOrigin(0);
  center(scene, 640, 171, t(scene.locale, 'won').toUpperCase(), 38, '#f0c969', 'bold');
  center(scene, 640, 402, scene.lot.name[scene.locale], 25, '#f7f3e8', 'bold');
  metric(scene, 430, 475, t(scene.locale, 'paid'), scene.money(scene.roundCost), 0xc4773a);
  metric(scene, 650, 475, scene.locale === 'ru' ? 'РЕПУТАЦИЯ' : 'REPUTATION', `+${scene.roundReputationGain} REP`, 0x61a8ff);
  center(scene, 640, 537, t(scene.locale, 'wonValueTease'), 13, '#aeb5c0');
  button(scene, 640, 592, t(scene.locale, 'openLot'), () => {
    scene.revealIndex = 0;
    scene.revealStage = 'closed';
    scene.renderReveal();
  }, { width: 310, height: 58, background: 0xe9b949, accent: 0xffd260 });
  if (!prefersReducedMotion()) {
    scene.tweens.add({ targets: halo, scaleX: { from: 0.92, to: 1.05 }, scaleY: { from: 0.92, to: 1.05 }, alpha: { from: 0.025, to: 0.075 }, duration: MOTION.celebrateMs, yoyo: true, repeat: 1, ease: 'Sine.InOut' });
    for (let index = 0; index < 7; index += 1) {
      const mote = scene.add.circle(430 + index * 70, 250 + (index % 3) * 46, 2 + (index % 2), 0xe9b949, 0.55);
      scene.tweens.add({ targets: mote, y: mote.y - 24, alpha: 0, duration: MOTION.celebrateMs, delay: index * 35, ease: 'Cubic.Out', onComplete: () => mote.destroy() });
    }
  }
}`,
    'production win',
  );

  src = replaceRange(
    src,
    'function sealed(scene: AuctionRuntime, item: RevealedItem): void {',
    'function revealed(',
    String.raw`function sealed(scene: AuctionRuntime, item: RevealedItem): void {
  panel(scene, 150, 150, 980, 500, 0xe9b949);
  const stage = addHeroStage(scene, 640, 354, 650, 334, VISUAL.warm, { fill: 0x12171d, haloAlpha: 0.052 });
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
  }, { width: 290, height: 60, background: 0xe9b949, accent: 0xffd260, feedback: false });
  if (!prefersReducedMotion()) {
    image.setY(362).setAlpha(0.72);
    scene.tweens.add({ targets: image, y: 348, alpha: 1, duration: MOTION.revealSettleMs, ease: 'Cubic.Out' });
  }
}`,
    'sealed item stage',
  );

  src = replaceRange(
    src,
    'function revealed(scene: AuctionRuntime, item: RevealedItem): void {',
    'function preAppraisal(',
    String.raw`function revealed(scene: AuctionRuntime, item: RevealedItem): void {
  const rarity = RARITY_COLORS[item.definition.rarity];
  panel(scene, 42, 150, 744, 500, rarity);
  panel(scene, 806, 150, 432, 500, rarity);

  const stage = addHeroStage(scene, 414, 350, 680, 410, rarity, { fill: 0x10151b, haloAlpha: 0.06 });
  stage.setDepth(0);
  scene.add.rectangle(150, 443, 528, 26, VISUAL.wood, 0.24).setOrigin(0);
  scene.add.rectangle(150, 441, 528, 3, VISUAL.brass, 0.25).setOrigin(0);
  const halo = scene.add.ellipse(414, 336, 520, 310, rarity, 0.042);
  const image = scene.add.image(414, 326, resolveItemTexture(scene, item.definition.id)).setDisplaySize(520, 364);
  center(scene, 414, 520, item.definition.name[scene.locale], 25, '#f7f3e8', 'bold');
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
}`,
    'revealed item stage',
  );

  src = replaceRange(
    src,
    'function appraisal(scene: AuctionRuntime, item: RevealedItem): void {',
    'function restorationAccent(',
    String.raw`function appraisal(scene: AuctionRuntime, item: RevealedItem): void {
  // Appraiser's desk treatment: value first, physical-material accents second.
  scene.add.rectangle(826, 168, 388, 98, 0x2b2117, 0.48).setOrigin(0).setStrokeStyle(1, VISUAL.brass, 0.24);
  scene.add.rectangle(826, 168, 5, 98, VISUAL.brass, 0.7).setOrigin(0);
  scene.add.rectangle(838, 176, 362, 1, 0xf0dba8, 0.12).setOrigin(0);
  text(scene, 842, 184, t(scene.locale, 'estimatedValue').toUpperCase(), 10, '#9a8d78', 'bold');
  const price = text(scene, 842, 207, scene.money(item.appraisedValue), 39, '#63d28d', 'bold');
  animateValue(scene, price, item.appraisedValue);

  const traits = itemTraitNamesForIds(item.traitIds ?? [], scene.locale);
  if (traits.length > 0) {
    text(scene, 842, 286, scene.locale === 'ru' ? 'ПРИЗНАКИ' : 'TRAITS', 9, '#7f8996', 'bold');
    traits.slice(0, 3).forEach((trait, index) => {
      const x = 842 + (index % 2) * 168;
      const y = 307 + Math.floor(index / 2) * 32;
      scene.add.rectangle(x + 2, y + 3, 156, 24, 0x000000, 0.24).setOrigin(0);
      scene.add.rectangle(x, y, 156, 24, 0x15263a, 0.95).setOrigin(0).setStrokeStyle(1, 0x61a8ff, 0.34);
      scene.add.rectangle(x, y, 3, 24, 0x61a8ff, 0.68).setOrigin(0);
      text(scene, x + 10, y + 6, trait, 9, '#9bc8ff', 'bold').setWordWrapWidth(136);
    });
  }

  const owned = scene.store.snapshot.collection.includes(item.definition.id);
  if (owned) {
    scene.add.rectangle(842, 369, 348, 28, 0x172536, 0.9).setOrigin(0).setStrokeStyle(1, 0x61a8ff, 0.34);
    text(scene, 852, 377, t(scene.locale, 'alreadyCollected'), 10, '#8fc3ff', 'bold');
  }

  text(scene, 842, 409, t(scene.locale, 'condition').toUpperCase(), 9, '#7f8996', 'bold');
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
      background: 0x3f73b8,
      accent: 0x61a8ff,
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
}`,
    'appraisal desk',
  );

  write(path, src);
}

// ---------------------------------------------------------------------------
// Characters: show host staging and richer portrait frames.
// ---------------------------------------------------------------------------
{
  const path = 'src/game/scenes/CharacterAuctionScene.ts';
  let src = read(path);
  src = replaceRange(
    src,
    'function renderAuctioneerHeader(scene: CharacterRuntime): void {',
    'function renderLotSelectionCoach(',
    String.raw`function renderAuctioneerHeader(scene: CharacterRuntime): void {
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
}`,
    'auctioneer production staging',
  );
  write(path, src);
}

{
  const path = 'src/game/characters.ts';
  let src = read(path);
  src = replaceRange(
    src,
    'export function addCharacterPortrait(',
    '\n}',
    String.raw`export function addCharacterPortrait(
  scene: Phaser.Scene,
  id: CharacterId,
  x: number,
  y: number,
  width: number,
  height: number,
  accent = 0xe9b949,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const outerShadow = scene.add.rectangle(5, 7, width + 5, height + 5, 0x000000, 0.4).setOrigin(0.5);
  const glow = scene.add.rectangle(0, 0, width + 6, height + 6, accent, 0.025).setStrokeStyle(1, accent, 0.12);
  const outer = scene.add.rectangle(0, 0, width, height, 0x090c10, 1).setStrokeStyle(2, accent, 0.58);
  const frame = scene.add.rectangle(0, 0, width - 6, height - 6, 0x11151c, 1).setStrokeStyle(1, 0xffffff, 0.07);
  const image = scene.add.image(0, 0, characterTextureKey(id)).setDisplaySize(width - 10, height - 10);
  const topLight = scene.add.rectangle(0, -height / 2 + 5, Math.max(10, width - 14), 2, 0xffffff, 0.14);
  const foot = scene.add.rectangle(0, height / 2 - 5, Math.max(10, width - 14), 3, accent, 0.28);
  container.add([outerShadow, glow, outer, frame, image, topLight, foot]);
  return container;
}`,
    'character portrait frame',
  );
  write(path, src);
}

// ---------------------------------------------------------------------------
// Collection: make set cards display cases, not rows of tiny utility icons.
// ---------------------------------------------------------------------------
{
  const path = 'src/game/scenes/CollectionScene.ts';
  let src = read(path);
  src = replaceOnce(
    src,
    '    const startX = itemCount <= 1 ? 54 : 30;\n\n    set.itemIds.forEach((itemId, index) => {',
    String.raw`    const startX = itemCount <= 1 ? 54 : 30;

    // A shelf/display-case field gives owned finds a physical collection context.
    const displayCase = this.add.rectangle(18, 92, 344, 101, VISUAL.wood, 0.18)
      .setOrigin(0)
      .setStrokeStyle(1, VISUAL.warm, 0.12);
    const velvetBack = this.add.rectangle(24, 98, 332, 82, VISUAL.velvet, 0.22)
      .setOrigin(0)
      .setStrokeStyle(1, 0xffffff, 0.035);
    const shelfShadow = this.add.rectangle(24, 179, 332, 8, 0x000000, 0.32).setOrigin(0);
    const shelfRail = this.add.rectangle(24, 176, 332, 4, VISUAL.brass, 0.34).setOrigin(0);
    card.add([displayCase, velvetBack, shelfShadow, shelfRail]);

    set.itemIds.forEach((itemId, index) => {`,
    'collection display case',
  );
  src = replaceOnce(src, 'const shadow = this.add.rectangle(2, 4, 68, 72, 0x000000, 0.34);', 'const shadow = this.add.rectangle(2, 5, 72, 76, 0x000000, 0.4);', 'collection slot shadow');
  src = replaceOnce(src, 'const frame = this.add.rectangle(0, 0, 68, 72, rarityColor, owned ? 0.085 : 0.018)', 'const frame = this.add.rectangle(0, 0, 72, 76, rarityColor, owned ? 0.095 : 0.018)', 'collection slot frame');
  src = replaceOnce(src, '.setDisplaySize(64, 46)', '.setDisplaySize(68, 50)', 'collection item slot image');
  write(path, src);
}

// ---------------------------------------------------------------------------
// Buyer market: concrete item becomes a genuine hero object in the dossier.
// ---------------------------------------------------------------------------
{
  const path = 'src/game/scenes/BuyerMarketScene.ts';
  let src = read(path);
  src = replaceOnce(
    src,
    "import { addAtmosphere, addChip, addSurface, VISUAL } from '../visual';",
    "import { addAtmosphere, addChip, addHeroStage, addSurface, VISUAL } from '../visual';",
    'BuyerMarket hero import',
  );
  src = replaceRange(
    src,
    '    const hero = addSurface(this, 28, 176, 326, 173, {',
    '    card.add(hero);',
    String.raw`    const hero = addHeroStage(this, 191, 262, 326, 173, accent, {
      fill: VISUAL.panelDeep,
      haloAlpha: 0.06,
    });
    hero.add(this.add.ellipse(0, -7, 248, 132, accent, 0.05));
    hero.add(this.add.image(0, -10, resolveItemTexture(this, item.id)).setDisplaySize(224, 152));
    hero.add(addChip(this, -98, 68, item.rarity.toUpperCase(), accent, { width: 112, filled: true, fontSize: 9 }));
    if (match.condition !== undefined) {
      hero.add(addChip(this, 101, 68, `${Math.round(match.condition * 100)}%`, VISUAL.rare, { width: 72, fontSize: 10 }));
    }
    card.add(hero);`,
    'BuyerMarket item hero',
  );
  write(path, src);
}

// ---------------------------------------------------------------------------
// Office and campaign: strengthen physical place / HQ atmosphere.
// ---------------------------------------------------------------------------
{
  const path = 'src/game/scenes/OfficeScene.ts';
  let src = read(path);
  src = replaceOnce(
    src,
    '    addAtmosphere(this, WIDTH, HEIGHT, accent, 1030);\n    this.renderHeader(accent);',
    String.raw`    addAtmosphere(this, WIDTH, HEIGHT, accent, 1030);
    // The Office sits in a real working room: desk edge, lamp pool and brass filing rail.
    this.add.ellipse(1020, 232, 430, 330, VISUAL.warm, 0.026);
    this.add.rectangle(0, 650, WIDTH, 70, VISUAL.wood, 0.2).setOrigin(0);
    this.add.rectangle(0, 648, WIDTH, 3, VISUAL.brass, 0.22).setOrigin(0);
    this.add.rectangle(30, 188, 1220, 8, VISUAL.leather, 0.2).setOrigin(0);
    this.renderHeader(accent);`,
    'Office environment dressing',
  );
  write(path, src);
}

{
  const path = 'src/game/scenes/CampaignScene.ts';
  let src = read(path);
  src = replaceOnce(
    src,
    "    addAtmosphere(this, WIDTH, HEIGHT, VISUAL.warm, 980);\n    this.add.image(952, 360, 'campaign-estate-study').setDisplaySize(620, 520).setAlpha(0.34);\n    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x090b0e, 0.42).setOrigin(0);",
    String.raw`    addAtmosphere(this, WIDTH, HEIGHT, VISUAL.warm, 980);
    // Let authored campaign environment art read through the UI instead of burying it under black.
    this.add.image(952, 360, 'campaign-estate-study').setDisplaySize(660, 548).setAlpha(0.52);
    this.add.ellipse(990, 250, 520, 390, VISUAL.warm, 0.035);
    this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x090b0e, 0.26).setOrigin(0);
    this.add.rectangle(0, 676, WIDTH, 44, VISUAL.wood, 0.28).setOrigin(0);
    this.add.rectangle(0, 674, WIDTH, 3, VISUAL.brass, 0.28).setOrigin(0);
    this.add.rectangle(42, 222, 1195, 4, VISUAL.leather, 0.24).setOrigin(0);`,
    'Campaign environment exposure',
  );
  write(path, src);
}

// ---------------------------------------------------------------------------
// Keep campaign navigation out of the lot art itself.
// ---------------------------------------------------------------------------
{
  const path = 'src/game/scenes/RivalBehaviorAuctionScene.ts';
  let src = read(path);
  src = replaceOnce(
    src,
    '        740,\n        218,',
    '        740,\n        112,',
    'campaign case navigation placement',
  );
  write(path, src);
}

// Fix canceled-press visual state in the shared tactile button.
{
  const path = 'src/game/ui.ts';
  let src = read(path);
  src = replaceOnce(
    src,
    '    hitTarget.on(\'pointerout\', () => settle(false));',
    "    hitTarget.on('pointerout', () => { lowerEdge.setAlpha(1); settle(false); });",
    'button pointerout reset',
  );
  write(path, src);
}

console.log('Production visual integration source patch applied.');
