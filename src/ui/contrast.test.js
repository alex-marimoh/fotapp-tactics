import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { DEFAULT_SKIN } from '../default-skin';
import { contrastRatio } from './contrast';

const __dirname = dirname(fileURLToPath(import.meta.url));
const focusCss = readFileSync(join(__dirname, 'focus-visible.css'), 'utf8');

describe('focus-visible.css', () => {
  it('defines keyboard-only focus rings without mouse :focus styling', () => {
    expect(focusCss).toMatch(/:focus-visible/);
    expect(focusCss).toMatch(/outline:\s*2px\s+solid/);
    expect(focusCss).toMatch(/:focus\s*\{[^}]*outline:\s*none/);
  });
});

describe('textMuted tokens', () => {
  it('meets WCAG AA 4.5:1 on light panel and page backgrounds', () => {
    expect(contrastRatio(DEFAULT_SKIN.textMuted, DEFAULT_SKIN.panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(DEFAULT_SKIN.textMuted, DEFAULT_SKIN.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('meets WCAG AA 4.5:1 on dark prototype panels', () => {
    expect(contrastRatio(DEFAULT_SKIN.textMutedOnDark, '#1c2433')).toBeGreaterThanOrEqual(4.5);
  });
});
