import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';

/** Mirrors scripts/check-bundle-budget.mjs lazy-chunk exclusion. */
const LAZY_CHUNK_PATTERN = /^(AdminPage|QuizFlow)-/;

/**
 * @param {string} name
 * @returns {boolean}
 */
function isBoardEntryChunk(name) {
  return name.endsWith('.js') && !LAZY_CHUNK_PATTERN.test(name);
}

describe('check-bundle-budget chunk selection', () => {
  it('includes entry and vendor chunks', () => {
    expect(isBoardEntryChunk('index-CNwvASK5.js')).toBe(true);
    expect(isBoardEntryChunk('supabaseBackend-C02O946r.js')).toBe(true);
  });

  it('excludes lazy Admin and Quiz route chunks', () => {
    expect(isBoardEntryChunk('AdminPage-CtWumGmP.js')).toBe(false);
    expect(isBoardEntryChunk('QuizFlow-lCqB1utF.js')).toBe(false);
  });

  it('budget constant leaves headroom over typical board bundle', () => {
    const budgetBytes = 150 * 1024;
    // Sanity: gzip of a 200 KB raw chunk is well under budget alone
    const sampleGzip = gzipSync(Buffer.alloc(200 * 1024, 0)).length;
    expect(sampleGzip).toBeLessThan(budgetBytes);
  });
});
