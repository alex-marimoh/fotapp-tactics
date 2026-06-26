/*
 * Squad quiz data layer. Adds finance fields (market value, wage, contract end)
 * derived from the canonical ROSTER without touching squad-data.js.
 * numbers are stable across renders. Everything else (slots, depth, health)
 * is read straight from the real squad-data module.
 */
import {
  ROSTER, FORMATIONS, FORMATION_NAMES, buildDepth, healthOf,
  effectiveStarterNum, POSITION_TYPES, HEALTH_LABEL,
} from '../../squad-data';

export const SEASON = 2026; // today is mid-2026 — contracts ending this year are expiring now

const VAL_BY_RATING = { 1: 0.4, 2: 1, 3: 2.5, 4: 6, 5: 12 };   // € millions, at peak age
const WAGE_BY_RATING = { 1: 5, 2: 10, 3: 18, 4: 32, 5: 55 };   // € k / week, at peak age
const round5 = (n) => Math.max(0.3, Math.round(n * 2) / 2);

export function valueOf(p) {
  const ageF = Math.max(0.5, 1.05 - Math.abs(p.age - 25) * 0.045);
  return round5(VAL_BY_RATING[p.rating] * ageF);
}
export function wageOf(p) {
  const ageF = Math.max(0.6, 1.1 - Math.abs(p.age - 27) * 0.02);
  return Math.round(WAGE_BY_RATING[p.rating] * ageF);
}
export function contractEndOf(p) {
  return SEASON + ((p.num * 7) % 3); // 2026 / 2027 / 2028, deterministic; ~1/3 expiring
}
export function augment(p) {
  const contractEnd = contractEndOf(p);
  return { ...p, value: valueOf(p), wage: wageOf(p), contractEnd, expiring: contractEnd <= SEASON };
}

const ORDER = Object.fromEntries(POSITION_TYPES.map((t, i) => [t, i]));
export const ORDERED = ROSTER
  .map(augment)
  .sort((a, b) => (ORDER[a.pos[0]] - ORDER[b.pos[0]]) || (b.rating - a.rating));
export const byNumA = Object.fromEntries(ORDERED.map((p) => [p.num, p]));

export const FORMATION = FORMATION_NAMES[0]; // '4-3-3' — the lens for depth/gaps
export const SLOTS = FORMATIONS[FORMATION];
export const DEPTH = buildDepth(ROSTER, SLOTS);

const EMPTY = new Set();

export function starterSlotOf(num) {
  return SLOTS.find((s) => DEPTH[s.id].starter && DEPTH[s.id].starter.num === num) || null;
}
export function consequenceFor(num) {
  const s = starterSlotOf(num);
  if (s) {
    const before = healthOf(DEPTH, s.id, EMPTY);
    const after = healthOf(DEPTH, s.id, new Set([num]));
    return { role: `Starter · ${s.label}`, slot: s.label, after, severe: after === 'gap', worse: after !== before };
  }
  const backup = SLOTS.find((sl) => DEPTH[sl.id].backups.some((b) => b.num === num));
  if (backup) return { role: `Backup · ${backup.label}`, slot: backup.label, after: null, severe: false, worse: false };
  return { role: 'Squad player', slot: null, after: null, severe: false, worse: false };
}
export function healthForSlot(slotId, soldSet) {
  return healthOf(DEPTH, slotId, soldSet);
}
export function effectiveStarter(slotId, soldSet) {
  return effectiveStarterNum(DEPTH, slotId, soldSet);
}
export function gapsFor(soldSet) {
  return SLOTS.filter((s) => healthOf(DEPTH, s.id, soldSet) === 'gap').map((s) => s.label);
}

export function summaryOf(decisions) {
  const sold = ORDERED.filter((p) => decisions[p.num]?.verdict === 'sell');
  const kept = ORDERED.filter((p) => decisions[p.num]?.verdict === 'keep');
  const warChest = sold.reduce((a, p) => a + (decisions[p.num]?.price ?? p.value), 0);
  const wagesFreed = sold.reduce((a, p) => a + p.wage, 0);
  const soldSet = new Set(sold.map((p) => p.num));
  return {
    sold, kept, warChest, wagesFreed, soldSet,
    sellCount: sold.length, keepCount: kept.length,
    decided: sold.length + kept.length, total: ORDERED.length,
    gaps: gapsFor(soldSet),
  };
}

export const fmtM = (v) => `€${v.toFixed(1)}M`;
export const fmtWage = (w) => `€${w}k/wk`;
export { HEALTH_LABEL };

// ---- Quiz framing (prototype) ---------------------------------------------
// Variant A reframed as a "squad quiz": these power the result screen.

// Deterministic stand-in for crowdsourced sentiment (product feature #4) until
// real fan votes exist — % of fans who would KEEP this player. Stable per player.
export function crowdKeepPct(num) {
  return 18 + ((num * 37) % 72); // 18–89, a clear lean either way
}

// The quiz "result": a manager archetype read off the finished decisions.
export function archetypeOf(summary) {
  const sellRate = summary.total ? summary.sellCount / summary.total : 0;
  if (summary.gaps.length >= 2)
    return { title: 'The Firesale', blurb: `You raised ${fmtM(summary.warChest)} — but left ${summary.gaps.length} holes to fill.` };
  if (sellRate >= 0.4)
    return { title: 'The Rebuilder', blurb: `Out with the old — ${summary.sellCount} sold for a ${fmtM(summary.warChest)} war chest.` };
  if (sellRate <= 0.1)
    return { title: 'The Loyalist', blurb: `You backed the group — ${summary.keepCount} kept, barely a sale.` };
  return { title: 'The Architect', blurb: `A measured trim: ${fmtM(summary.warChest)} freed, the squad still stands up.` };
}

// Each decided player vs. the crowd, most contrarian first — the shareable hook.
export function crowdCallsOf(decisions) {
  return ORDERED
    .filter((p) => decisions[p.num]?.verdict)
    .map((p) => {
      const verdict = decisions[p.num].verdict;       // 'keep' | 'sell'
      const keepPct = crowdKeepPct(p.num);
      const crowd = keepPct >= 50 ? 'keep' : 'sell';  // what the crowd leans to
      const crowdPct = keepPct >= 50 ? keepPct : 100 - keepPct;
      const agrees = crowd === verdict;
      return { player: p, verdict, crowd, crowdPct, agrees, score: agrees ? -crowdPct : crowdPct };
    })
    .sort((a, b) => b.score - a.score);
}
