/**
 * Build production assets and fail if board-route initial JS exceeds the gzip budget.
 * Board-route JS = all dist JS except lazy AdminPage and QuizFlow chunks.
 *
 * @see docs/perf-budgets.md
 */

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

/** @type {number} 150 KB */
const BUDGET_BYTES = 150 * 1024;

/** Lazy route chunks not loaded on the default board screen. */
const LAZY_CHUNK_PATTERN = /^(AdminPage|QuizFlow)-/;

/**
 * @param {string} distAssetsDir
 * @returns {{ name: string, gzipBytes: number }[]}
 */
function measureBoardEntryChunks(distAssetsDir) {
  const files = readdirSync(distAssetsDir).filter((f) => f.endsWith('.js'));
  const chunks = [];

  for (const name of files) {
    if (LAZY_CHUNK_PATTERN.test(name)) continue;
    const raw = readFileSync(join(distAssetsDir, name));
    chunks.push({ name, gzipBytes: gzipSync(raw).length });
  }

  return chunks.sort((a, b) => b.gzipBytes - a.gzipBytes);
}

function main() {
  console.log('Building production bundle…');
  execSync('npm run build', { stdio: 'inherit' });

  const distAssetsDir = join(process.cwd(), 'dist', 'assets');
  const chunks = measureBoardEntryChunks(distAssetsDir);
  const totalGzip = chunks.reduce((sum, c) => sum + c.gzipBytes, 0);

  console.log('\nBoard-route JS (gzip), excluding lazy Admin/Quiz chunks:\n');
  for (const { name, gzipBytes } of chunks) {
    console.log(`  ${(gzipBytes / 1024).toFixed(2).padStart(7)} KB  ${name}`);
  }
  console.log(`  ${'─'.repeat(40)}`);
  console.log(`  ${(totalGzip / 1024).toFixed(2).padStart(7)} KB  total`);
  console.log(`  ${(BUDGET_BYTES / 1024).toFixed(2).padStart(7)} KB  budget\n`);

  if (totalGzip > BUDGET_BYTES) {
    const over = totalGzip - BUDGET_BYTES;
    console.error(
      `FAIL: board-route JS ${(totalGzip / 1024).toFixed(2)} KB gzip exceeds `
      + `${(BUDGET_BYTES / 1024).toFixed(0)} KB budget by ${(over / 1024).toFixed(2)} KB.`,
    );
    process.exit(1);
  }

  console.log('PASS: board-route JS within budget.');
}

main();
