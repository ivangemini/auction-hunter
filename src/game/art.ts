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
    scene.load.svg(itemTextureKey(id), `/assets/items/${id}.svg`);
  }
  scene.load.svg(itemTextureKey('fallback'), '/assets/items/fallback.svg');

  for (const id of LOT_IDS) {
    scene.load.svg(lotTextureKey(id), `/assets/lots/${id}.svg`);
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
