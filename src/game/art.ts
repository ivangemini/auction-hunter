import Phaser from 'phaser';

const ITEM_IDS = [
  'toolbox',
  'cassette-player',
  'vinyl-box',
  'toy-robot',
  'brass-clock',
  'film-camera',
  'telescope',
  'signed-poster',
  'silver-ring',
  'arcade-handheld',
  'pocket-watch',
  'prototype-toy',
] as const;

const LOT_IDS = ['garage-17', 'estate-42', 'collector-8'] as const;

export function preloadArt(scene: Phaser.Scene): void {
  for (const id of ITEM_IDS) {
    const key = itemTextureKey(id);
    if (!scene.textures.exists(key)) scene.load.svg(key, `assets/items/${id}.svg`);
  }

  const fallbackKey = itemTextureKey('fallback');
  if (!scene.textures.exists(fallbackKey)) scene.load.svg(fallbackKey, 'assets/items/fallback.svg');

  for (const id of LOT_IDS) {
    const key = lotTextureKey(id);
    if (!scene.textures.exists(key)) scene.load.svg(key, `assets/lots/${id}.svg`);
  }
}

export function itemTextureKey(id: string): string {
  return `item:${id}`;
}

export function lotTextureKey(id: string): string {
  return `lot:${id}`;
}

export function resolveItemTexture(scene: Phaser.Scene, id: string): string {
  const key = itemTextureKey(id);
  return scene.textures.exists(key) ? key : itemTextureKey('fallback');
}

export function resolveLotTexture(scene: Phaser.Scene, id: string): string | null {
  const key = lotTextureKey(id);
  return scene.textures.exists(key) ? key : null;
}
