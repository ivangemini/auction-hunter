import { describe, expect, it } from 'vitest';
import { COPY_KEYS, rawCopy } from './i18n';

function placeholders(value: string): string[] {
  return [...value.matchAll(/\{([^}]+)\}/g)]
    .map((match) => match[1] ?? '')
    .filter(Boolean)
    .sort();
}

describe('localization contract', () => {
  it('has non-empty RU and EN copy for every key', () => {
    for (const key of COPY_KEYS) {
      const ru = rawCopy('ru', key);
      const en = rawCopy('en', key);

      expect(typeof ru, `missing RU copy for ${key}`).toBe('string');
      expect(typeof en, `missing EN copy for ${key}`).toBe('string');
      expect(ru.trim(), `empty RU copy for ${key}`).not.toBe('');
      expect(en.trim(), `empty EN copy for ${key}`).not.toBe('');
    }
  });

  it('keeps interpolation placeholders aligned between locales', () => {
    for (const key of COPY_KEYS) {
      expect(placeholders(rawCopy('ru', key)), `placeholder mismatch for ${key}`).toEqual(
        placeholders(rawCopy('en', key)),
      );
    }
  });
});
