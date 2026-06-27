/*
 * Deterministic roster generator (docs/design-user-management.md §1).
 *
 * generateRoster(club) returns a full squad of players in the canonical shape
 * (num, name, age, nat, reg, rating, pos[], pos2[]) PLUS first-class finance
 * fields (value, wage, contractEnd, expiring, transferFee). Seeded by club slug,
 * so a club looks identical every run until an admin edits it.
 *
 * Nationality mix per squad (locked with author): 5–15 EU, 3–7 non-EU, rest Greek,
 * with home clamped to >= 3 so the homegrown minimum stays satisfiable.
 */
import { POSITION_TYPES } from '../squad-data';
import { SEASON, round5 } from '../lib/format';
import { poolForNat, EU_NATIONS, NONEU_NATIONS } from './names';

export { SEASON } from '../lib/format';

// --- seeded RNG (mulberry32 off a string hash) -----------------------------
function hash(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const randInt = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const shuffle = (r, arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// --- squad shape ------------------------------------------------------------
// Base position template (~24), filled out to give every formation real depth.
const BASE_TEMPLATE = { GK: 3, RB: 2, CB: 4, LB: 2, DM: 2, CM: 3, AM: 2, RW: 2, LW: 2, ST: 2 };
// Where a player can also plausibly cover (secondary eligibility).
const ADJ = {
  GK: [], RB: ['CB', 'LB'], CB: ['RB', 'LB', 'DM'], LB: ['CB', 'RB'], DM: ['CM', 'CB'],
  CM: ['DM', 'AM'], AM: ['CM', 'RW', 'LW'], RW: ['LW', 'ST', 'AM'], LW: ['RW', 'ST', 'AM'],
  ST: ['AM', 'RW', 'LW'],
};

const VAL_BY_RATING = { 1: 0.4, 2: 1, 3: 2.5, 4: 6, 5: 12 };  // € millions, at peak age
const WAGE_BY_RATING = { 1: 5, 2: 10, 3: 18, 4: 32, 5: 55 };  // € k / week, at peak age
function valueOf(rating, age) {
  const ageF = Math.max(0.5, 1.05 - Math.abs(age - 25) * 0.045);
  return round5(VAL_BY_RATING[rating] * ageF);
}
function wageOf(rating, age) {
  const ageF = Math.max(0.6, 1.1 - Math.abs(age - 27) * 0.02);
  return Math.round(WAGE_BY_RATING[rating] * ageF);
}

// Build the list of slot position-types for one squad, with a little jitter.
function squadPositions(r) {
  const tmpl = { ...BASE_TEMPLATE };
  // +1 to one or two random outfield positions for variety (squad 24..26).
  const bump = shuffle(r, ['CB', 'CM', 'ST', 'RB', 'LB', 'AM']).slice(0, randInt(r, 1, 2));
  for (const p of bump) tmpl[p] += 1;
  const out = [];
  for (const type of POSITION_TYPES) for (let i = 0; i < (tmpl[type] || 0); i++) out.push(type);
  return out;
}

// Nationality categories for a squad of `size`: 5–15 eu, 3–7 noneu, rest home (>=3).
function nationalityTags(r, size) {
  const noneu = randInt(r, 3, 7);
  const euMax = Math.max(5, size - 3 - noneu);
  const eu = Math.min(randInt(r, 5, 15), euMax);
  const home = size - noneu - eu;
  const tags = [
    ...Array(home).fill('home'),
    ...Array(eu).fill('eu'),
    ...Array(noneu).fill('noneu'),
  ];
  return shuffle(r, tags);
}

function natFor(r, reg) {
  if (reg === 'home') return 'GR';
  if (reg === 'eu') return pick(r, EU_NATIONS);
  return pick(r, NONEU_NATIONS);
}

function ratingFor(r, strength) {
  // mean ~2.8 (weak) .. ~4.0 (strong); spread around it, clamped 1..5.
  const mean = 2.8 + strength * 1.2;
  const v = mean + (r() - r()) * 1.3;
  return Math.max(1, Math.min(5, Math.round(v)));
}

export function generateRoster(club) {
  const r = rng(hash(club.slug));
  const strength = club.strength ?? 0.5;
  const positions = squadPositions(r);
  const size = positions.length;
  const tags = nationalityTags(r, size);

  // unique squad numbers; keep #1 for the first keeper, draw the rest from 2..40.
  const numberQueue = shuffle(r, Array.from({ length: 39 }, (_, i) => i + 2));
  const usedNames = new Set();

  const pickName = (nat) => {
    const pool = poolForNat(nat);
    for (let tries = 0; tries < 40; tries++) {
      const n = pick(r, pool);
      if (!usedNames.has(n)) { usedNames.add(n); return n; }
    }
    return pick(r, pool); // pool exhausted — allow a repeat (rare)
  };

  let gkAssigned = false;
  const roster = positions.map((type, i) => {
    const reg = tags[i];
    const nat = natFor(r, reg);
    const name = pickName(nat);
    const age = Math.max(17, Math.min(36, Math.round(24 + (r() - r()) * 8)));
    const rating = ratingFor(r, strength);
    const pos2 = ADJ[type].length && r() < 0.4 ? [pick(r, ADJ[type])] : [];
    const contractEnd = SEASON + randInt(r, 0, 3); // 2026..2029
    const value = valueOf(rating, age);
    let num;
    if (type === 'GK' && !gkAssigned) { num = 1; gkAssigned = true; }
    else { num = numberQueue.shift(); }

    return {
      num,
      name,
      age,
      nat,
      reg,
      rating,
      pos: [type],
      pos2,
      value,                                            // market value, € millions
      wage: wageOf(rating, age),                        // € k / week
      contractEnd,
      expiring: contractEnd <= SEASON,
      transferFee: round5(value * (1.2 + (contractEnd - SEASON) * 0.15)),
    };
  });

  return roster.sort(
    (a, b) => POSITION_TYPES.indexOf(a.pos[0]) - POSITION_TYPES.indexOf(b.pos[0]) || b.rating - a.rating,
  );
}
