import { describe, expect, it } from 'vitest';
import { COPY } from './i18n';

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{([^}]+)\}/g)]
    .map((match) => match[1] ?? '')
    .filter(Boolean)
    .sort();
}

describe('RU/EN localization', () => {
  it('keeps the same non-empty keys in both locales', () => {
    const ruKeys = Object.keys(COPY.ru).sort();
    const enKeys = Object.keys(COPY.en).sort();

    expect(ruKeys).toEqual(enKeys);

    for (const key of enKeys) {
      const typedKey = key as keyof typeof COPY.en;
      expect(COPY.ru[typedKey].trim(), `empty RU copy for ${key}`).not.toBe('');
      expect(COPY.en[typedKey].trim(), `empty EN copy for ${key}`).not.toBe('');
    }
  });

  it('keeps interpolation placeholders aligned', () => {
    for (const key of Object.keys(COPY.en) as Array<keyof typeof COPY.en>) {
      expect(placeholders(COPY.ru[key]), `placeholder mismatch for ${key}`).toEqual(
        placeholders(COPY.en[key]),
      );
    }
  });
});
