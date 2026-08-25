import Phaser from 'phaser';

export type CharacterId = 'auctioneer' | 'mentor' | 'victor' | 'mira' | 'anton' | 'leah' | 'roman' | 'sofia';

export const CHARACTER_IDS: readonly CharacterId[] = [
  'auctioneer',
  'mentor',
  'victor',
  'mira',
  'anton',
  'leah',
  'roman',
  'sofia',
];

const OPPONENT_CHARACTER: Record<string, CharacterId> = {
  'npc-0': 'victor',
  'npc-1': 'mira',
  'npc-2': 'anton',
  'npc-3': 'leah',
  'npc-4': 'roman',
  'npc-5': 'sofia',
};

const CHARACTER_SIZE = { width: 480, height: 600 } as const;

export function preloadCharacters(scene: Phaser.Scene): void {
  for (const id of CHARACTER_IDS) {
    const key = characterTextureKey(id);
    if (!scene.textures.exists(key)) {
      scene.load.svg(key, `assets/characters/${id}.svg`, CHARACTER_SIZE);
    }
  }
}

export function characterTextureKey(id: CharacterId): string {
  return `character:${id}`;
}

export function opponentCharacterId(opponentId: string): CharacterId | null {
  return OPPONENT_CHARACTER[opponentId] ?? null;
}

export function addCharacterPortrait(
  scene: Phaser.Scene,
  id: CharacterId,
  x: number,
  y: number,
  width: number,
  height: number,
  accent = 0xe9b949,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  const shadow = scene.add.rectangle(4, 5, width, height, 0x000000, 0.34).setOrigin(0.5);
  const frame = scene.add.rectangle(0, 0, width, height, 0x11151c, 1).setStrokeStyle(2, accent, 0.52);
  const image = scene.add.image(0, 0, characterTextureKey(id)).setDisplaySize(width - 6, height - 6);
  container.add([shadow, frame, image]);
  return container;
}
