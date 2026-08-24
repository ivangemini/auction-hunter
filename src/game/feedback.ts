import type Phaser from 'phaser';
import { isPlatformPaused } from '../platform/lifecycle';

export type FeedbackCue = 'ui' | 'bid' | 'npc-bid' | 'pass' | 'win' | 'reveal' | 'appraise' | 'restore-perfect' | 'restore-good' | 'restore-rough' | 'sell' | 'keep' | 'reward';

let audioContext: AudioContext | null = null;

export function playFeedbackCue(scene: Phaser.Scene, cue: FeedbackCue): void {
  if (isPlatformPaused()) return;

  try {
    playCueAudio(cue);
    if (cue === 'win') scene.cameras.main.shake(110, 0.0022);
    if (cue === 'restore-perfect') scene.cameras.main.shake(70, 0.0012);
  } catch {
    // Feedback is deliberately best-effort; game input must never depend on audio/juice support.
  }
}

function playCueAudio(cue: FeedbackCue): void {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') void context.resume().catch(() => undefined);

  switch (cue) {
    case 'ui': tone(context, 360, 0.035, 0.018); break;
    case 'bid': tone(context, 470, 0.055, 0.025); break;
    case 'npc-bid': tone(context, 280, 0.06, 0.02); break;
    case 'pass': tone(context, 210, 0.08, 0.02); break;
    case 'reveal':
      tone(context, 520, 0.06, 0.02);
      tone(context, 720, 0.07, 0.018, 0.055);
      break;
    case 'appraise': tone(context, 620, 0.07, 0.022); break;
    case 'win':
      tone(context, 520, 0.08, 0.025);
      tone(context, 660, 0.09, 0.025, 0.07);
      tone(context, 820, 0.11, 0.025, 0.14);
      break;
    case 'restore-perfect':
      tone(context, 680, 0.08, 0.025);
      tone(context, 920, 0.11, 0.024, 0.06);
      break;
    case 'restore-good': tone(context, 620, 0.09, 0.022); break;
    case 'restore-rough': tone(context, 330, 0.09, 0.02); break;
    case 'sell': tone(context, 560, 0.065, 0.022); break;
    case 'keep': tone(context, 430, 0.075, 0.02); break;
    case 'reward':
      tone(context, 720, 0.08, 0.024);
      tone(context, 960, 0.12, 0.024, 0.07);
      break;
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return null;
  if (!audioContext) audioContext = new window.AudioContext();
  return audioContext;
}

function tone(
  context: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  delay = 0,
): void {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  const end = start + duration;

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + Math.min(0.012, duration / 3));
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.01);
}
