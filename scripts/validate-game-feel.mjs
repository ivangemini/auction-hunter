import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const ui = read('src/game/ui.ts');
const auction = read('src/game/scenes/AuctionScene.ts');
const restoration = read('src/game/restorationUi.ts');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const token of [
  "hitTarget.on('pointerover'",
  "hitTarget.on('pointerdown'",
  "hitTarget.on('pointerup'",
  'scene.tweens.killTweensOf(visual)',
  'prefersReducedMotion()',
]) assert(ui.includes(token), `Shared button game-feel contract missing: ${token}`);

for (const method of [
  'animateBidValue(',
  'animateBidderReaction(',
  'animateWin(',
  'animateReveal(',
  'emitRevealSparks(',
  'animateAppraisalValue(',
]) {
  const uses = auction.split(method).length - 1;
  assert(uses >= 2, `Auction game-feel method must stay wired into the core loop: ${method} (${uses} occurrence(s))`);
}

for (const token of [
  'MOTION.bidPulseMs',
  'MOTION.rivalReactMs',
  'MOTION.revealMs',
  'MOTION.valueCountMs',
  'if (prefersReducedMotion())',
]) assert(auction.includes(token), `Auction game-feel contract missing: ${token}`);

for (const token of [
  'enterWithStagger(scene, card, 170, index)',
  'installCardHover(scene, card, body, color)',
  'if (choicePending) return',
  'if (stopped) return',
  'if (!prefersReducedMotion())',
]) assert(restoration.includes(token), `Restoration game-feel contract missing: ${token}`);

console.log('P7 game-feel source contract OK: tactile controls, bid/reveal/value feedback, staged restoration and reduced-motion paths');
