export interface AccessibilityPreferences {
  soundFeedback: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

export type AccessibilityPreferenceKey = keyof AccessibilityPreferences;

export const ACCESSIBILITY_STORAGE_KEY = 'auction-hunter.accessibility.v1';

export function normalizeAccessibilityPreferences(
  value: unknown,
  systemReducedMotion = false,
): AccessibilityPreferences {
  const record = isRecord(value) ? value : {};
  return {
    soundFeedback: typeof record.soundFeedback === 'boolean' ? record.soundFeedback : true,
    reducedMotion: typeof record.reducedMotion === 'boolean' ? record.reducedMotion : systemReducedMotion,
    highContrast: typeof record.highContrast === 'boolean' ? record.highContrast : false,
  };
}

export function loadAccessibilityPreferences(): AccessibilityPreferences {
  const systemReducedMotion = prefersReducedMotion();
  if (typeof localStorage === 'undefined') {
    return normalizeAccessibilityPreferences(null, systemReducedMotion);
  }

  try {
    const raw = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
    return raw
      ? normalizeAccessibilityPreferences(JSON.parse(raw), systemReducedMotion)
      : normalizeAccessibilityPreferences(null, systemReducedMotion);
  } catch {
    return normalizeAccessibilityPreferences(null, systemReducedMotion);
  }
}

export function setAccessibilityPreference<K extends AccessibilityPreferenceKey>(
  key: K,
  value: AccessibilityPreferences[K],
): AccessibilityPreferences {
  const next = { ...loadAccessibilityPreferences(), [key]: value };
  try {
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Device preferences are best-effort and must never block gameplay.
  }
  applyAccessibilityPreferences(next);
  return next;
}

export function applyAccessibilityPreferences(
  preferences = loadAccessibilityPreferences(),
): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.highContrast = String(preferences.highContrast);
  document.documentElement.dataset.reducedMotion = String(preferences.reducedMotion);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
