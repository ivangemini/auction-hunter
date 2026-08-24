import Phaser from 'phaser';
import { ITEM_ART_IDS, LOT_ART_IDS } from '../data/artManifest';

const ART_SVG_SIZE = { width: 512, height: 360 } as const;

// First P7 raster pass. Semantic texture keys remain stable, so scenes and lot data do not care
// whether an environment is currently authored as SVG or higher-fidelity WebP.
const RASTER_LOT_ART_IDS = new Set<string>([
  'estate-42',
  'estate-attic',
  'estate-studio',
]);

export function preloadArt(scene: Phaser.Scene): void {
  for (const id of ITEM_ART_IDS) {
    const key = itemTextureKey(id);
    if (!scene.textures.exists(key)) scene.load.svg(key, `assets/items/${id}.svg`, ART_SVG_SIZE);
  }

  const fallbackKey = itemTextureKey('fallback');
  if (!scene.textures.exists(fallbackKey)) scene.load.svg(fallbackKey, 'assets/items/fallback.svg', ART_SVG_SIZE);

  for (const id of LOT_ART_IDS) {
    const key = lotTextureKey(id);
    if (scene.textures.exists(key)) continue;

    if (RASTER_LOT_ART_IDS.has(id)) {
      scene.load.image(key, `assets/lots/${id}.webp`);
    } else {
      scene.load.svg(key, `assets/lots/${id}.svg`, ART_SVG_SIZE);
    }
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
