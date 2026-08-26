from pathlib import Path
import re


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8")


# Shared palette / atmosphere -------------------------------------------------
p = Path("src/game/visual.ts")
s = p.read_text(encoding="utf-8")
s, count = re.subn(
    r"export const VISUAL = \{.*?\} as const;",
    """export const VISUAL = {
  ink: 0x061a2d,
  panel: 0x0b2944,
  panelRaised: 0x103958,
  panelDeep: 0x071d33,
  steel: 0x315474,
  text: '#fff8ea',
  muted: '#a8c0d5',
  faint: '#7894ad',
  warm: 0xf6b72c,
  copper: 0xe97832,
  success: 0x47d36f,
  rare: 0x37a9ff,
  purple: 0x9959ff,
  brass: 0xd68a2f,
  wood: 0x6a341d,
  leather: 0x4a2720,
  paper: 0xf0ddaf,
  velvet: 0x4a245c,
} as const;""",
    s,
    flags=re.S,
)
if count != 1:
    raise SystemExit(f"VISUAL palette replacement count={count}")

s, count = re.subn(
    r"export function addAtmosphere\(.*?\n\}\n\nexport function addSurface",
    """export function addAtmosphere(
  scene: Phaser.Scene,
  width: number,
  height: number,
  accent: number,
  focusX = width * 0.78,
): Phaser.GameObjects.Container {
  const base = scene.add.rectangle(0, 0, width, height, VISUAL.ink).setOrigin(0);
  const backWall = scene.add.rectangle(0, 0, width, height * 0.74, 0x08233a, 0.99).setOrigin(0);
  const upperGlow = scene.add.ellipse(width * 0.52, height * 0.12, width * 0.98, height * 0.62, VISUAL.rare, 0.055);
  const focalWash = scene.add.ellipse(focusX, height * 0.34, width * 0.76, height * 0.92, accent, 0.095);
  const marqueeWash = scene.add.ellipse(width * 0.22, height * 0.24, width * 0.5, height * 0.44, VISUAL.warm, 0.06);
  const coolPool = scene.add.ellipse(width * 0.76, height * 0.68, width * 0.7, height * 0.48, VISUAL.rare, 0.045);
  const floor = scene.add.rectangle(0, height * 0.73, width, height * 0.27, 0x2f211c, 0.98).setOrigin(0);
  const floorWarmth = scene.add.ellipse(width * 0.45, height * 0.95, width * 0.9, height * 0.34, VISUAL.copper, 0.05);

  const beamLeft = scene.add.rectangle(width * 0.12, height * 0.04, width * 0.06, height * 0.72, VISUAL.warm, 0.028)
    .setOrigin(0.5, 0)
    .setAngle(-7);
  const beamRight = scene.add.rectangle(width * 0.86, height * 0.02, width * 0.055, height * 0.74, VISUAL.rare, 0.032)
    .setOrigin(0.5, 0)
    .setAngle(7);
  const ceiling = scene.add.rectangle(0, height * 0.105, width, 3, 0xffffff, 0.045).setOrigin(0);
  const horizon = scene.add.rectangle(0, height * 0.735, width, 2, VISUAL.brass, 0.28).setOrigin(0);

  const bokehA = scene.add.circle(width * 0.12, height * 0.17, 8, VISUAL.warm, 0.12);
  const bokehB = scene.add.circle(width * 0.18, height * 0.12, 4, 0xffffff, 0.12);
  const bokehC = scene.add.circle(width * 0.83, height * 0.17, 7, VISUAL.rare, 0.12);
  const bokehD = scene.add.circle(width * 0.89, height * 0.12, 4, 0xffffff, 0.1);

  const leftVignette = scene.add.rectangle(0, 0, width * 0.08, height, 0x000000, 0.13).setOrigin(0);
  const rightVignette = scene.add.rectangle(width * 0.94, 0, width * 0.06, height, 0x000000, 0.1).setOrigin(0);

  return scene.add.container(0, 0, [
    base,
    backWall,
    upperGlow,
    focalWash,
    marqueeWash,
    coolPool,
    floor,
    floorWarmth,
    beamLeft,
    beamRight,
    ceiling,
    horizon,
    bokehA,
    bokehB,
    bokehC,
    bokehD,
    leftVignette,
    rightVignette,
  ]);
}

export function addSurface""",
    s,
    flags=re.S,
)
if count != 1:
    raise SystemExit(f"addAtmosphere replacement count={count}")

for old, new in {
    "0x090b0e, 0.92": "0x051525, 0.96",
    "options.glowAlpha ?? 0.018": "options.glowAlpha ?? 0.04",
    "0xffffff, 0.035": "0xffffff, 0.07",
    "0xffffff, 0.055": "0xffffff, 0.1",
    "options.fill ?? VISUAL.panelDeep": "options.fill ?? 0x0a3152",
    "options.haloAlpha ?? 0.055": "options.haloAlpha ?? 0.09",
}.items():
    s = s.replace(old, new)
write(p, s)


# Lot selection --------------------------------------------------------------
p = Path("src/game/scenes/PolishedAuctionScene.ts")
s = p.read_text(encoding="utf-8")
for old, new in {
    "const CARD_ACCENTS = [0xe9b949, 0x61a8ff, 0xb576ff] as const;": "const CARD_ACCENTS = [0xf6b72c, 0x37a9ff, 0x9959ff] as const;",
    "0x11151c, 1": "0x0a2945, 1",
    "0x0c1016, 1": "0x0d3658, 1",
    "0x241a14, 0.12": "0x7a351e, 0.2",
    "0xb78a3b, 0.2": "0xd68a2f, 0.34",
    "'#f7f3e8'": "'#fff8ea'",
    "'#c8cdd5'": "'#dcebf8'",
    "0x122235, 0.72": "0x0d3e67, 0.88",
    "'#8fc3ff'": "'#9ed3ff'",
    "0x2b1e12, 0.78": "0x5a321d, 0.84",
    "'#f0c969'": "'#ffd56a'",
    "background: 0xe9b949": "background: 0xf6b72c",
    "accent: 0xffcf59": "accent: 0xffdd6a",
    "0x11151c, 0.98": "0x082944, 0.98",
    "0xe9b949, 0.45": "0xf6b72c, 0.64",
    "'#f1c75b'": "'#ffd66d'",
    "'#c4773a'": "'#ff8a42'",
    "'#9ca4b0'": "'#b8cde0'",
    "background: 0x253a55": "background: 0x126bb0",
    "foreground: '#d9e9ff'": "foreground: '#f3fbff'",
    "accent: 0x61a8ff": "accent: 0x37a9ff",
    "0x11151c, 0.96": "0x0b3152, 0.98",
    "'#777f8b'": "'#9cb8cf'",
    "0x171c24, 1": "0x0a2a47, 1",
    "0x0a0d11, 1": "0x0d3557, 1",
    "0x05070a, 0.54": "0x06121d, 0.2",
    "0xb78a3b, 0.22": "0xd68a2f, 0.4",
    "0xffffff, 0.04": "0xffffff, 0.1",
    "'#707985'": "'#9ab6ce'",
    "0x26351f": "0x174f3b",
    "0x15191f": "0x0d3658",
    "'#f4f0e7'": "'#fff7e9'",
}.items():
    s = s.replace(old, new)

old = "const lampPool = scene.add.ellipse(CARD_WIDTH * 0.7, 79, 210, 112, accent, 0.045);"
new = "const lampPool = scene.add.ellipse(CARD_WIDTH * 0.68, 76, 250, 138, accent, 0.105);\n  const coolWash = scene.add.ellipse(CARD_WIDTH * 0.34, 92, 238, 150, 0x37a9ff, 0.065);\n  const marquee = scene.add.rectangle(CARD_WIDTH / 2, 27, CARD_WIDTH - 74, 5, 0xffffff, 0.12);"
if old not in s:
    raise SystemExit("lot lamp marker not found")
s = s.replace(old, new)
s = s.replace(
    "card.add([lampPool, lowerShade, floorRail, leftPost, rightPost]);",
    "card.add([coolWash, lampPool, marquee, lowerShade, floorRail, leftPost, rightPost]);",
)
write(p, s)


# Core bidding / reveal ------------------------------------------------------
p = Path("src/game/scenes/PolishedAuctionSceneV2.ts")
s = p.read_text(encoding="utf-8")
for old, new in {
    "0xe9b949": "0xf6b72c",
    "0x61a8ff": "0x37a9ff",
    "0xb576ff": "0x9959ff",
    "0xc4773a": "0xe97832",
    "0x63d28d": "0x47d36f",
    "'#f0c969'": "'#ffd66d'",
    "'#f7f3e8'": "'#fff8ea'",
    "'#8f98a4'": "'#a9c5df'",
    "'#7f8996'": "'#9bb7cf'",
    "'#626b77'": "'#7f9db7'",
    "'#c1c7d0'": "'#dcebf8'",
    "0x0d1117, 0.98": "0x071f36, 0.99",
    "0x11151c, 0.45": "0x0d3658, 0.76",
    "0x11151c, 0.98": "0x082944, 0.99",
    "0x11151c, 0.96": "0x0b3152, 0.98",
    "0x10151b, 0.97": "0x0a2f50, 0.98",
    "0x0d1218, 0.94": "0x0b3152, 0.97",
    "0x171b21": "0x123b5a",
    "0x13171c": "0x0b2b49",
    "0x172535": "0x10436c",
    "0x151a20, 0.96": "0x0d3658, 0.98",
    "0x05070a, 0.58": "0x061622, 0.26",
    "0x362a15, 0.92": "0x5b3a17, 0.94",
    "0x173522": "0x174d39",
    "0x351719, 0.92": "0x5a2528, 0.94",
    "0x2f2114, 0.92": "0x6a3a1d, 0.92",
    "{ fill: 0x10151b, haloAlpha: 0.06 }": "{ fill: 0x0a3155, haloAlpha: 0.12 }",
    "{ fill: 0x12171d, haloAlpha: 0.052 }": "{ fill: 0x0a3155, haloAlpha: 0.1 }",
    "0x2b2117, 0.48": "0x0f3c60, 0.96",
    "'#9a8d78'": "'#b7d0e4'",
    "0x15263a, 0.95": "0x0d4875, 0.98",
    "0x172536, 0.9": "0x0d426b, 0.96",
    "background: 0x3f73b8": "background: 0x167fd1",
    "background: 0x2b313a": "background: 0x33465b",
    "accent: 0x6f7886": "accent: 0x7899b8",
}.items():
    s = s.replace(old, new)

old = "scene.add.rectangle(48, 150, 762, 286, 0x0b0d10, 0.94).setOrigin(0).setStrokeStyle(1, 0xf6b72c, 0.18);\n  scene.add.ellipse(430, 230, 620, 248, 0xf6b72c, 0.035);"
new = "scene.add.rectangle(48, 150, 762, 286, 0x0a2b49, 0.98).setOrigin(0).setStrokeStyle(2, 0xf6b72c, 0.34);\n  scene.add.ellipse(430, 226, 650, 270, 0x37a9ff, 0.07);\n  scene.add.ellipse(610, 226, 360, 250, 0xf6b72c, 0.09);"
if old not in s:
    raise SystemExit("bidding stage marker not found")
s = s.replace(old, new)

marker = "lotArt(scene, 429, 266, 756, 224);"
if marker not in s:
    raise SystemExit("lotArt bidding marker not found")
s = s.replace(
    marker,
    marker + "\n  const showBulbLeft = scene.add.circle(74, 174, 5, 0xffdd7a, 0.78);\n  const showBulbRight = scene.add.circle(784, 174, 5, 0x8fd1ff, 0.78);\n  scene.add.rectangle(429, 157, 690, 3, 0xffffff, 0.12);\n  if (!prefersReducedMotion()) {\n    scene.tweens.add({ targets: [showBulbLeft, showBulbRight], alpha: { from: 0.45, to: 0.95 }, duration: 720, yoyo: true, repeat: -1, ease: 'Sine.InOut' });\n  }",
)

marker = "const halo = scene.add.ellipse(414, 336, 520, 310, rarity, 0.042);"
if marker not in s:
    raise SystemExit("appraisal halo marker not found")
s = s.replace(
    marker,
    "const halo = scene.add.ellipse(414, 336, 560, 330, rarity, 0.095);\n  scene.add.circle(414, 326, 168, rarity, 0.028).setStrokeStyle(3, rarity, 0.22);\n  scene.add.circle(414, 326, 205, 0xffffff, 0.012).setStrokeStyle(2, 0xffffff, 0.08);",
)
write(p, s)


# Character-driven presentation ---------------------------------------------
p = Path("src/game/scenes/CharacterAuctionScene.ts")
s = p.read_text(encoding="utf-8")
s = s.replace("0xe9b949", "0xf6b72c").replace("0x61a8ff", "0x37a9ff").replace("0xb576ff", "0x9959ff").replace("0x63d28d", "0x47d36f")

pattern = r"function renderAuctionCharacters\(scene: CharacterRuntime\): void \{.*?\n\}\n\nfunction renderAuctioneerHeader"
replacement = """function renderAuctionCharacters(scene: CharacterRuntime): void {
  renderAuctioneerStageHost(scene);

  scene.opponents.forEach((opponent, index) => {
    const id = opponentCharacterId(opponent.id);
    if (!id) return;
    const y = 270 + index * 132;
    const active = opponent.id === scene.currentLeader;
    const portrait = addCharacterPortrait(scene, id, 916, y, 82, 104, active ? 0xf6b72c : 0x37a9ff).setDepth(14);
    if (active && !prefersReducedMotion()) {
      scene.tweens.add({
        targets: portrait,
        scaleX: { from: 0.93, to: 1 },
        scaleY: { from: 0.93, to: 1 },
        duration: 220,
        ease: 'Back.Out',
      });
    }
  });
}

function renderAuctioneerStageHost(scene: CharacterRuntime): void {
  const glow = scene.add.ellipse(668, 270, 250, 255, 0xf6b72c, 0.1).setDepth(10);
  scene.add.ellipse(668, 352, 190, 40, 0x000000, 0.3).setDepth(10);
  const portrait = addCharacterPortrait(scene, 'auctioneer', 668, 270, 176, 220, 0xf6b72c).setDepth(12);
  const bubbleShadow = scene.add.rectangle(548, 173, 236, 70, 0x000000, 0.28).setOrigin(0).setDepth(13);
  const bubble = scene.add.rectangle(542, 167, 236, 70, 0xfff2cf, 0.98).setOrigin(0).setStrokeStyle(2, 0xf6b72c, 0.75).setDepth(14);
  scene.add.triangle(650, 237, 0, 0, 28, 0, 28, 22, 0xfff2cf, 1).setDepth(14);
  scene.add.text(558, 180, scene.locale === 'ru' ? 'Кто даст больше?' : 'Who bids higher?', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '18px',
    fontStyle: 'bold',
    color: '#17324a',
  }).setDepth(15);
  scene.add.text(558, 205, scene.locale === 'ru' ? 'Следи за соперниками.' : 'Watch the rivals.', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '11px',
    color: '#4c6378',
  }).setDepth(15);
  if (!prefersReducedMotion()) {
    portrait.setY(282).setAlpha(0.72);
    scene.tweens.add({ targets: portrait, y: 270, alpha: 1, duration: 260, ease: 'Back.Out' });
    scene.tweens.add({ targets: glow, alpha: { from: 0.045, to: 0.12 }, duration: 520, yoyo: true, ease: 'Sine.Out' });
    scene.tweens.add({ targets: [bubble, bubbleShadow], x: '+=6', duration: 180, yoyo: true, ease: 'Cubic.Out' });
  }
}

function renderAuctioneerHeader"""
s, count = re.subn(pattern, replacement, s, flags=re.S)
if count != 1:
    raise SystemExit(f"auction character replacement count={count}")

old = "function renderRevealCoach(scene: CharacterRuntime): void {\n  if (!isTutorialSessionActive()) return;\n  const item = scene.items[scene.revealIndex];"
new = "function renderRevealCoach(scene: CharacterRuntime): void {\n  if (scene.revealStage === 'revealed' || scene.revealStage === 'appraised') {\n    renderAppraiserHost(scene);\n  }\n  if (!isTutorialSessionActive()) return;\n  const item = scene.items[scene.revealIndex];"
if old not in s:
    raise SystemExit("renderRevealCoach marker not found")
s = s.replace(old, new)

insert_before = "\nfunction captureDiscoverySnapshot(scene: CharacterRuntime): DiscoverySnapshot {"
helper = """

function renderAppraiserHost(scene: CharacterRuntime): void {
  const accent = scene.revealStage === 'appraised' ? 0x47d36f : 0x37a9ff;
  const halo = scene.add.ellipse(724, 260, 150, 184, accent, 0.075).setDepth(15);
  const portrait = addCharacterPortrait(scene, 'mentor', 724, 268, 112, 142, accent).setDepth(17);
  const bubble = scene.add.rectangle(638, 164, 214, 72, 0xfff2cf, 0.98).setOrigin(0).setStrokeStyle(2, accent, 0.62).setDepth(18);
  scene.add.triangle(716, 236, 0, 0, 26, 0, 20, 22, 0xfff2cf, 1).setDepth(18);
  scene.add.text(652, 177, scene.revealStage === 'appraised'
    ? (scene.locale === 'ru' ? 'Вот это находка!' : 'That is a find!')
    : (scene.locale === 'ru' ? 'Проверим ценность.' : 'Let’s check the value.'), {
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    fontStyle: 'bold',
    color: '#17324a',
  }).setDepth(19);
  scene.add.text(652, 201, scene.revealStage === 'appraised'
    ? (scene.locale === 'ru' ? 'Решай: оставить или продать.' : 'Keep it or make the deal.')
    : (scene.locale === 'ru' ? 'Состояние решает цену.' : 'Condition changes the price.'), {
    fontFamily: 'Arial, sans-serif',
    fontSize: '10px',
    color: '#52697e',
  }).setDepth(19);
  if (!prefersReducedMotion()) {
    portrait.setScale(0.95).setAlpha(0.76);
    scene.tweens.add({ targets: portrait, scaleX: 1, scaleY: 1, alpha: 1, duration: 240, ease: 'Back.Out' });
    scene.tweens.add({ targets: halo, alpha: { from: 0.035, to: 0.09 }, duration: 420, yoyo: true, ease: 'Sine.Out' });
  }
}
"""
if insert_before not in s:
    raise SystemExit("captureDiscoverySnapshot marker not found")
s = s.replace(insert_before, helper + insert_before)
write(p, s)


# Character frame language ---------------------------------------------------
p = Path("src/game/characters.ts")
s = p.read_text(encoding="utf-8")
for old, new in {
    "0x090c10, 1": "0x082944, 1",
    "0x11151c, 1": "0x0d3658, 1",
    "accent, 0.025": "accent, 0.07",
    "accent, 0.12": "accent, 0.24",
    "accent, 0.58": "accent, 0.78",
    "0xffffff, 0.07": "0xffffff, 0.13",
    "0xffffff, 0.14": "0xffffff, 0.22",
    "accent, 0.28": "accent, 0.46",
}.items():
    s = s.replace(old, new)
write(p, s)

print("Bright commercial runtime look pass applied")
