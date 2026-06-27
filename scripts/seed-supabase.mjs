#!/usr/bin/env node
/*
 * One-time seed: teams + generated rosters → Supabase.
 * Run after applying migrations: node scripts/seed-supabase.mjs
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or VITE_* equivalents).
 */
import { createClient } from '@supabase/supabase-js';
import { GREEK_SUPER_LEAGUE } from '../src/data/league.js';
import { generateRoster } from '../src/data/generator.js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Set SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

function rowFromPlayer(teamSlug, p) {
  return {
    team_slug: teamSlug,
    num: p.num,
    name: p.name,
    age: p.age,
    nat: p.nat,
    reg: p.reg,
    rating: p.rating,
    pos: p.pos,
    pos2: p.pos2 ?? [],
    wage: p.wage,
    market_value: p.value,
    transfer_fee: p.transferFee ?? null,
    contract_end: p.contractEnd,
    on_loan: p.onLoan ?? false,
  };
}

const { count: teamCount } = await supabase.from('teams').select('*', { count: 'exact', head: true });
if (teamCount > 0) {
  console.log(`teams already seeded (${teamCount} rows) — skipping`);
  process.exit(0);
}

const teams = GREEK_SUPER_LEAGUE.clubs.map((club) => ({
  slug: club.slug,
  name: club.name,
  short: club.short,
  league: GREEK_SUPER_LEAGUE.id,
  colors: club.colors,
}));

const { error: teamsErr } = await supabase.from('teams').insert(teams);
if (teamsErr) {
  console.error('teams insert failed:', teamsErr.message);
  process.exit(1);
}
console.log(`inserted ${teams.length} teams`);

const players = [];
for (const club of GREEK_SUPER_LEAGUE.clubs) {
  for (const p of generateRoster(club)) {
    players.push(rowFromPlayer(club.slug, p));
  }
}

const BATCH = 200;
for (let i = 0; i < players.length; i += BATCH) {
  const chunk = players.slice(i, i + BATCH);
  const { error } = await supabase.from('players').insert(chunk);
  if (error) {
    console.error('players insert failed:', error.message);
    process.exit(1);
  }
  console.log(`inserted players ${i + 1}–${Math.min(i + BATCH, players.length)} of ${players.length}`);
}

console.log('seed complete');
