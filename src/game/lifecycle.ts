import type Phaser from 'phaser';
import { isPlatformPaused, subscribePlatformPause } from '../platform/lifecycle';

export function installGameLifecycle(game: Phaser.Game): () => void {
  let suspended = false;

  const applyPauseState = (paused: boolean): void => {
    if (paused === suspended) return;
    suspended = paused;

    if (paused) {
      game.sound.pauseAll();
      game.pause();
      return;
    }

    game.resume();
    game.sound.resumeAll();
  };

  const unsubscribe = subscribePlatformPause(applyPauseState);
  applyPauseState(isPlatformPaused());

  return () => {
    unsubscribe();
    if (!suspended) return;
    suspended = false;
    game.resume();
    game.sound.resumeAll();
  };
}
