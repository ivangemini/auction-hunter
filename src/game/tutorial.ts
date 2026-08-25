let active = false;

export function beginTutorialSession(): void {
  active = true;
}

export function endTutorialSession(): void {
  active = false;
}

export function isTutorialSessionActive(): boolean {
  return active;
}
