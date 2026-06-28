/*
 * Squad quiz data layer — per-team. createQuizModel(team) builds the ordered
 * roster + depth lens + bound helpers for one club's squad. Players already carry
 * finance fields (value, wage, contractEnd, expiring) from the team generator.
 */
import {
  FORMATIONS, FORMATION_NAMES, buildDepth, healthOf, POSITION_TYPES, HEALTH_LABEL,
} from '../../squad-data';

import { round5 } from '../../lib/format';

export { SEASON } from '../../lib/format';

const ORDER = Object.fromEntries(POSITION_TYPES.map((t, i) => [t, i]));
const EMPTY = new Set();

export const FORMATION = FORMATION_NAMES[0]; // '4-3-3' — the lens for depth/gaps
export const SLOTS = FORMATIONS[FORMATION];

export const fmtM = (v) => `€${v.toFixed(1)}M`;
export const fmtWage = (w) => `€${w}k/wk`;
/** Contract end as `Contract Exp: 09/27`. */
export function fmtContractEnd(p) {
  const end = p.contractEnd;
  if (end == null) return 'Contract Exp: —';
  if (typeof end === 'object' && 'month' in end) {
    const mm = String(end.month + 1).padStart(2, '0');
    const yy = String(end.year).slice(-2);
    return `Contract Exp: ${mm}/${yy}`;
  }
  return `Contract Exp: ${end}`;
}
/** Weekly wage (€k/wk) → annual salary label. */
export const fmtSalaryYear = (weeklyK) => {
  const annualK = weeklyK * 52;
  if (annualK >= 1000) return `€${(annualK / 1000).toFixed(1)}M/yr`;
  return `€${Math.round(annualK)}k/yr`;
};
export { HEALTH_LABEL };

/** Display label: `7 Mihalakis` — squad number + surname (names are surname-only in the generator). */
export function displayName(p) {
  return `${p.num} ${p.name}`;
}

/** Card title without squad number — number lives in the medallion. */
export function displayNameCard(p) {
  return p.name;
}

/** Natural + secondary positions for the deck card. */
export function formatPositions(p) {
  const nat = p.pos.join(' / ');
  if (!p.pos2?.length) return nat;
  return `${nat} · ${p.pos2.join(' / ')}`;
}

const PRICE_MULT = { more: 1.2, same: 1, less: 0.8 };
const WAGE_MULT = { more: 1.15, same: 1, less: 0.85 };

export function priceForTier(player, tier) {
  return round5(player.value * (PRICE_MULT[tier] ?? 1));
}

export function wageForTier(player, tier) {
  return Math.round(player.wage * (WAGE_MULT[tier] ?? 1));
}

// Deterministic stand-in for crowdsourced sentiment until real fan votes exist
// (deferred — see docs/design-user-management.md). % of fans who would KEEP. Stable per player.
export function crowdKeepPct(num) {
  return 18 + ((num * 37) % 72); // 18–89, a clear lean either way
}

// The quiz "result": a manager archetype read off the finished decisions.
export function archetypeOf(summary) {
  const sellRate = summary.total ? summary.sellCount / summary.total : 0;
  if (summary.gaps.length >= 2)
    return { title: 'The Firesale', blurb: `You raised ${fmtM(summary.warChest)} — but left ${summary.gaps.length} holes to fill.` };
  if (sellRate >= 0.4)
    return { title: 'The Rebuilder', blurb: `Out with the old — ${summary.sellCount} dropped for a ${fmtM(summary.warChest)} war chest.` };
  if (sellRate <= 0.1)
    return { title: 'The Loyalist', blurb: `You backed the group — ${summary.keepCount} kept, barely a sale.` };
  return { title: 'The Architect', blurb: `A measured trim: ${fmtM(summary.warChest)} freed, the squad still stands up.` };
}

// Build the quiz model for one team: ordered roster, a depth lens, and bound helpers.
/**
 * Order quiz deck by primary position or shuffle.
 * @param {object[]} roster
 * @param {'position'|'random'} mode
 */
export function orderQuizRoster(roster, mode = 'position') {
  if (mode === 'random') {
    const copy = [...roster];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  return [...roster].sort(
    (a, b) => (ORDER[a.pos[0]] - ORDER[b.pos[0]]) || (b.rating - a.rating),
  );
}

/** @param {import('../../data/store').Team} team @param {'position'|'random'} [orderMode] */
export function createQuizModel(team, orderMode = 'position') {
  const roster = team.roster;
  const slots = SLOTS;
  const depth = buildDepth(roster, slots);
  const ordered = orderQuizRoster(roster, orderMode);
  const byNum = Object.fromEntries(ordered.map((p) => [p.num, p]));

  const starterSlotOf = (num) =>
    slots.find((s) => depth[s.id].starter && depth[s.id].starter.num === num) || null;

  const consequenceFor = (num) => {
    const s = starterSlotOf(num);
    if (s) {
      const before = healthOf(depth, s.id, EMPTY);
      const after = healthOf(depth, s.id, new Set([num]));
      return { role: `Starter · ${s.label}`, slot: s.label, after, severe: after === 'gap', worse: after !== before };
    }
    const backup = slots.find((sl) => depth[sl.id].backups.some((b) => b.num === num));
    if (backup) return { role: `Backup · ${backup.label}`, slot: backup.label, after: null, severe: false, worse: false };
    return { role: 'Squad player', slot: null, after: null, severe: false, worse: false };
  };

  const gapsFor = (soldSet) =>
    slots.filter((s) => healthOf(depth, s.id, soldSet) === 'gap').map((s) => s.label);

  const summaryOf = (decisions) => {
    const sold = ordered.filter((p) => decisions[p.num]?.verdict === 'sell');
    const released = ordered.filter((p) => decisions[p.num]?.verdict === 'release');
    const kept = ordered.filter((p) => {
      const v = decisions[p.num]?.verdict;
      return v === 'keep' || v === 'renew';
    });
    const warChest = sold.reduce((a, p) => a + (decisions[p.num]?.price ?? p.value), 0);
    const wagesFreed = [...sold, ...released].reduce((a, p) => a + p.wage, 0);
    const leaving = [...sold, ...released].map((p) => p.num);
    const soldSet = new Set(leaving);
    return {
      sold, released, kept, warChest, wagesFreed, soldSet,
      sellCount: sold.length,
      releaseCount: released.length,
      keepCount: kept.length,
      decided: sold.length + released.length + kept.length,
      total: ordered.length,
      gaps: gapsFor(soldSet),
    };
  };

  const crowdCallsOf = (decisions) =>
    ordered
      .filter((p) => decisions[p.num]?.verdict)
      .map((p) => {
        const verdict = decisions[p.num].verdict;
        const label = verdict === 'sell' ? 'drop' : verdict === 'release' ? 'release' : verdict === 'renew' ? 'renew' : 'keep';
        const keepPct = crowdKeepPct(p.num);
        const crowd = keepPct >= 50 ? 'keep' : 'drop';
        const crowdPct = keepPct >= 50 ? keepPct : 100 - keepPct;
        const agrees = (crowd === 'keep' && (verdict === 'keep' || verdict === 'renew'))
          || (crowd === 'drop' && (verdict === 'sell' || verdict === 'release'));
        return { player: p, verdict: label, crowd, crowdPct, agrees, score: agrees ? -crowdPct : crowdPct };
      })
      .sort((a, b) => b.score - a.score);

  return { team, ordered, byNum, slots, depth, consequenceFor, gapsFor, summaryOf, crowdCallsOf };
}
