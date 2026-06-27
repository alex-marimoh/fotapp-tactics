/*
 * Squad quiz data layer — now per-team. createQuizModel(team) builds the ordered
 * roster + depth lens + bound helpers for one club's squad. Players already carry
 * finance fields (value, wage, contractEnd, expiring) from the team generator, so
 * nothing is augmented here anymore — it reads straight off the team's roster.
 */
import {
  FORMATIONS, FORMATION_NAMES, buildDepth, healthOf, POSITION_TYPES, HEALTH_LABEL,
} from '../../squad-data';

export const SEASON = 2026;

const ORDER = Object.fromEntries(POSITION_TYPES.map((t, i) => [t, i]));
const EMPTY = new Set();

export const FORMATION = FORMATION_NAMES[0]; // '4-3-3' — the lens for depth/gaps
export const SLOTS = FORMATIONS[FORMATION];

export const fmtM = (v) => `€${v.toFixed(1)}M`;
export const fmtWage = (w) => `€${w}k/wk`;
export { HEALTH_LABEL };

// Deterministic stand-in for crowdsourced sentiment until real fan votes exist
// (deferred — see docs/design-user-management.md). % of fans who would KEEP. Stable per player.
export function crowdKeepPct(num) {
  return 18 + ((num * 37) % 72); // 18–89, a clear lean either way
}

// The quiz "result": a manager archetype read off the finished decisions. Pure.
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

// Build the quiz model for one team: ordered roster, a depth lens, and bound helpers.
export function createQuizModel(team) {
  const roster = team.roster;
  const slots = SLOTS;
  const depth = buildDepth(roster, slots);
  const ordered = [...roster].sort(
    (a, b) => (ORDER[a.pos[0]] - ORDER[b.pos[0]]) || (b.rating - a.rating),
  );
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
    const kept = ordered.filter((p) => decisions[p.num]?.verdict === 'keep');
    const warChest = sold.reduce((a, p) => a + (decisions[p.num]?.price ?? p.value), 0);
    const wagesFreed = sold.reduce((a, p) => a + p.wage, 0);
    const soldSet = new Set(sold.map((p) => p.num));
    return {
      sold, kept, warChest, wagesFreed, soldSet,
      sellCount: sold.length, keepCount: kept.length,
      decided: sold.length + kept.length, total: ordered.length,
      gaps: gapsFor(soldSet),
    };
  };

  // Each decided player vs. the crowd, most contrarian first — the shareable hook.
  const crowdCallsOf = (decisions) =>
    ordered
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

  return { team, ordered, byNum, slots, depth, consequenceFor, gapsFor, summaryOf, crowdCallsOf };
}
