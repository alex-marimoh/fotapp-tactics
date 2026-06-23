/*
 * Squad data + domain model (the data seam — see docs/adr/0003 + 0007).
 * Hardcoded for now; later this module is the single place a real data source plugs in.
 *
 *   reg:  'home' | 'eu' | 'noneu'   — registration category (ADR 0009)
 *   pos:  natural position types     — eligibility, natural tier (ADR 0007)
 *   pos2: secondary position types   — eligibility, "out of position" tier
 *
 * Formation slots carry a `label` (what the user sees, e.g. RWB) and a `type`
 * (what drives eligibility, e.g. RB). Wing-backs map to full-backs, wide mids to
 * wingers, so the squad can fill any of the ten formations.
 */

export const POSITION_TYPES = ['GK', 'RB', 'CB', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];

export const ROSTER = [
  { num: 1,  name: 'Mihalakis',   age: 29, nat: 'GR', reg: 'home',  rating: 4, pos: ['GK'],       pos2: [] },
  { num: 12, name: 'Okonkwo',     age: 22, nat: 'NG', reg: 'noneu', rating: 3, pos: ['GK'],       pos2: [] },
  { num: 2,  name: 'Owusu',       age: 27, nat: 'GH', reg: 'noneu', rating: 4, pos: ['RB'],       pos2: ['CB'] },
  { num: 13, name: 'Lindqvist',   age: 21, nat: 'SE', reg: 'eu',    rating: 3, pos: ['RB'],       pos2: ['LB'] },
  { num: 4,  name: 'Karras',      age: 30, nat: 'GR', reg: 'home',  rating: 5, pos: ['CB'],       pos2: [] },
  { num: 14, name: 'Benali',      age: 24, nat: 'FR', reg: 'eu',    rating: 4, pos: ['CB'],       pos2: ['DM'] },
  { num: 5,  name: 'Achterberg',  age: 28, nat: 'NL', reg: 'eu',    rating: 4, pos: ['CB'],       pos2: ['LB'] },
  { num: 3,  name: 'Petrović',    age: 26, nat: 'RS', reg: 'noneu', rating: 3, pos: ['LB'],       pos2: ['CB'] },
  { num: 22, name: 'Costa',       age: 22, nat: 'BR', reg: 'noneu', rating: 3, pos: ['LB'],       pos2: ['RB'] },
  { num: 6,  name: 'Sælen',       age: 27, nat: 'NO', reg: 'eu',    rating: 4, pos: ['DM'],       pos2: ['CM'] },
  { num: 15, name: 'Ortíz',       age: 26, nat: 'AR', reg: 'noneu', rating: 3, pos: ['DM'],       pos2: ['CM'] },
  { num: 8,  name: 'Papadakis',   age: 25, nat: 'GR', reg: 'home',  rating: 4, pos: ['CM'],       pos2: ['DM', 'AM'] },
  { num: 16, name: 'Tanaka',      age: 23, nat: 'JP', reg: 'noneu', rating: 4, pos: ['CM'],       pos2: ['DM'] },
  { num: 10, name: 'Vasconcelos', age: 24, nat: 'PT', reg: 'eu',    rating: 5, pos: ['AM', 'CM'], pos2: [] },
  { num: 17, name: 'Forsberg',    age: 27, nat: 'SE', reg: 'eu',    rating: 4, pos: ['AM'],       pos2: ['CM'] },
  { num: 7,  name: 'Aritz',       age: 26, nat: 'ES', reg: 'eu',    rating: 4, pos: ['RW'],       pos2: ['ST', 'LW'] },
  { num: 11, name: 'Diatta',      age: 25, nat: 'SN', reg: 'noneu', rating: 4, pos: ['LW'],       pos2: ['RW', 'ST'] },
  { num: 9,  name: 'Brennan',     age: 28, nat: 'IE', reg: 'eu',    rating: 5, pos: ['ST'],       pos2: [] },
  { num: 20, name: 'Mensah',      age: 25, nat: 'GH', reg: 'noneu', rating: 4, pos: ['ST'],       pos2: ['AM'] },
];
export const byNum = Object.fromEntries(ROSTER.map((p) => [p.num, p]));

const s = (id, label, type, left, top) => ({ id, label, type, left, top });

// The ten most popular formations. left/top are % on a vertical pitch (small top = attack).
export const FORMATIONS = {
  '4-3-3': [
    s('GK', 'GK', 'GK', 50, 90),
    s('RB', 'RB', 'RB', 82, 72), s('CB1', 'CB', 'CB', 62, 77), s('CB2', 'CB', 'CB', 38, 77), s('LB', 'LB', 'LB', 18, 72),
    s('CM1', 'CM', 'CM', 50, 57), s('CM2', 'CM', 'CM', 68, 45), s('CM3', 'CM', 'CM', 32, 45),
    s('RW', 'RW', 'RW', 81, 24), s('ST', 'ST', 'ST', 50, 15), s('LW', 'LW', 'LW', 19, 24),
  ],
  '4-4-2': [
    s('GK', 'GK', 'GK', 50, 90),
    s('RB', 'RB', 'RB', 82, 72), s('CB1', 'CB', 'CB', 62, 77), s('CB2', 'CB', 'CB', 38, 77), s('LB', 'LB', 'LB', 18, 72),
    s('RM', 'RM', 'RW', 84, 50), s('CM1', 'CM', 'CM', 60, 52), s('CM2', 'CM', 'CM', 40, 52), s('LM', 'LM', 'LW', 16, 50),
    s('ST1', 'ST', 'ST', 38, 16), s('ST2', 'ST', 'ST', 62, 16),
  ],
  '4-2-3-1': [
    s('GK', 'GK', 'GK', 50, 90),
    s('RB', 'RB', 'RB', 82, 72), s('CB1', 'CB', 'CB', 62, 77), s('CB2', 'CB', 'CB', 38, 77), s('LB', 'LB', 'LB', 18, 72),
    s('DM1', 'DM', 'DM', 38, 60), s('DM2', 'DM', 'DM', 62, 60),
    s('RW', 'RW', 'RW', 82, 32), s('AM', 'AM', 'AM', 50, 42), s('LW', 'LW', 'LW', 18, 32),
    s('ST', 'ST', 'ST', 50, 14),
  ],
  '4-1-4-1': [
    s('GK', 'GK', 'GK', 50, 90),
    s('RB', 'RB', 'RB', 82, 72), s('CB1', 'CB', 'CB', 62, 77), s('CB2', 'CB', 'CB', 38, 77), s('LB', 'LB', 'LB', 18, 72),
    s('DM', 'DM', 'DM', 50, 62),
    s('RM', 'RM', 'RW', 84, 46), s('CM1', 'CM', 'CM', 60, 48), s('CM2', 'CM', 'CM', 40, 48), s('LM', 'LM', 'LW', 16, 46),
    s('ST', 'ST', 'ST', 50, 15),
  ],
  '3-5-2': [
    s('GK', 'GK', 'GK', 50, 90),
    s('CB1', 'CB', 'CB', 66, 78), s('CB2', 'CB', 'CB', 50, 80), s('CB3', 'CB', 'CB', 34, 78),
    s('RWB', 'RWB', 'RB', 88, 58), s('CM1', 'CM', 'CM', 66, 50), s('CM2', 'CM', 'CM', 50, 54), s('CM3', 'CM', 'CM', 34, 50), s('LWB', 'LWB', 'LB', 12, 58),
    s('ST1', 'ST', 'ST', 40, 16), s('ST2', 'ST', 'ST', 60, 16),
  ],
  '3-4-3': [
    s('GK', 'GK', 'GK', 50, 90),
    s('CB1', 'CB', 'CB', 66, 78), s('CB2', 'CB', 'CB', 50, 80), s('CB3', 'CB', 'CB', 34, 78),
    s('RM', 'RM', 'RW', 86, 52), s('CM1', 'CM', 'CM', 60, 54), s('CM2', 'CM', 'CM', 40, 54), s('LM', 'LM', 'LW', 14, 52),
    s('RW', 'RW', 'RW', 78, 24), s('ST', 'ST', 'ST', 50, 15), s('LW', 'LW', 'LW', 22, 24),
  ],
  '5-3-2': [
    s('GK', 'GK', 'GK', 50, 90),
    s('RWB', 'RWB', 'RB', 88, 64), s('CB1', 'CB', 'CB', 66, 78), s('CB2', 'CB', 'CB', 50, 80), s('CB3', 'CB', 'CB', 34, 78), s('LWB', 'LWB', 'LB', 12, 64),
    s('CM1', 'CM', 'CM', 66, 50), s('CM2', 'CM', 'CM', 50, 52), s('CM3', 'CM', 'CM', 34, 50),
    s('ST1', 'ST', 'ST', 40, 16), s('ST2', 'ST', 'ST', 60, 16),
  ],
  '4-4-1-1': [
    s('GK', 'GK', 'GK', 50, 90),
    s('RB', 'RB', 'RB', 82, 72), s('CB1', 'CB', 'CB', 62, 77), s('CB2', 'CB', 'CB', 38, 77), s('LB', 'LB', 'LB', 18, 72),
    s('RM', 'RM', 'RW', 84, 50), s('CM1', 'CM', 'CM', 60, 52), s('CM2', 'CM', 'CM', 40, 52), s('LM', 'LM', 'LW', 16, 50),
    s('AM', 'SS', 'AM', 50, 32), s('ST', 'ST', 'ST', 50, 15),
  ],
  '4-5-1': [
    s('GK', 'GK', 'GK', 50, 90),
    s('RB', 'RB', 'RB', 82, 72), s('CB1', 'CB', 'CB', 62, 77), s('CB2', 'CB', 'CB', 38, 77), s('LB', 'LB', 'LB', 18, 72),
    s('RM', 'RM', 'RW', 86, 48), s('CM1', 'CM', 'CM', 64, 52), s('CM2', 'CM', 'CM', 50, 50), s('CM3', 'CM', 'CM', 36, 52), s('LM', 'LM', 'LW', 14, 48),
    s('ST', 'ST', 'ST', 50, 15),
  ],
  '4-3-1-2': [
    s('GK', 'GK', 'GK', 50, 90),
    s('RB', 'RB', 'RB', 82, 72), s('CB1', 'CB', 'CB', 62, 77), s('CB2', 'CB', 'CB', 38, 77), s('LB', 'LB', 'LB', 18, 72),
    s('DM', 'DM', 'DM', 50, 62), s('CM1', 'CM', 'CM', 30, 50), s('CM2', 'CM', 'CM', 70, 50),
    s('AM', 'AM', 'AM', 50, 36),
    s('ST1', 'ST', 'ST', 40, 16), s('ST2', 'ST', 'ST', 60, 16),
  ],
};
export const FORMATION_NAMES = Object.keys(FORMATIONS);

export const LIMITS = { noneu: { kind: 'max', value: 8 }, home: { kind: 'min', value: 3 } };

export const PLACEHOLDER_NEWS = [
  { tag: 'INJURY', c: '#ff5d5d', when: 'Today', head: 'Brennan picks up a knock', body: '3–5 day assessment — depth at ST suddenly matters.' },
  { tag: 'RUMOUR', c: '#ffc23d', when: 'Today', head: 'Atromitos eye Petrović', body: 'Loan-to-buy interest in your cover at the back.' },
  { tag: 'YOUTH',  c: '#10d469', when: 'Mon',   head: 'U19 keeper shining', body: 'Flagged for first-team depth review next window.' },
];

export const HEALTH_LABEL = { solid: 'Solid', thin: 'Thin', gap: 'Gap' };
export const TIER_LABEL = { nat: 'Natural', sec: 'Secondary', oop: 'Out of position' };

// A player's fit for a slot type: natural / secondary / out of position.
export function tierFor(player, type) {
  if (player.pos.includes(type)) return 'nat';
  if (player.pos2.includes(type)) return 'sec';
  return 'oop';
}

// Build an initial depth chart for a formation from the given roster.
export function buildDepth(roster, slots) {
  const used = new Set();
  const depth = {};
  for (const slot of slots) {
    const nat = roster.filter((p) => !used.has(p.num) && p.pos.includes(slot.type)).sort((a, b) => b.rating - a.rating);
    let pick = nat[0] ? { p: nat[0], tier: 'nat' } : null;
    if (!pick) {
      const sec = roster.filter((p) => !used.has(p.num) && p.pos2.includes(slot.type)).sort((a, b) => b.rating - a.rating);
      if (sec[0]) pick = { p: sec[0], tier: 'sec' };
    }
    depth[slot.id] = { starter: pick ? { num: pick.p.num, tier: pick.tier } : null, backups: [] };
    if (pick) used.add(pick.p.num);
  }
  for (const slot of slots) {
    const cands = roster
      .filter((p) => !used.has(p.num))
      .map((p) => {
        const tier = p.pos.includes(slot.type) ? 'nat' : p.pos2.includes(slot.type) ? 'sec' : null;
        return tier ? { num: p.num, tier, rating: p.rating } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (a.tier === b.tier ? b.rating - a.rating : a.tier === 'nat' ? -1 : 1));
    depth[slot.id].backups = cands.slice(0, 2).map((c) => ({ num: c.num, tier: c.tier }));
  }
  return depth;
}

// --- pure model fns ------------------------------------------------------
// Health: Solid = natural starter + a natural backup. Thin = out-of-position
// starter or no natural backup. Gap = no one left to start.
export function healthOf(depth, slotId, leaving) {
  const d = depth[slotId];
  const stack = [d.starter, ...d.backups].filter((x) => x && !leaving.has(x.num));
  if (stack.length === 0) return 'gap';
  const starter = stack[0];
  const naturalBackups = stack.slice(1).filter((x) => x.tier === 'nat').length;
  if (starter.tier !== 'nat') return 'thin';
  return naturalBackups >= 1 ? 'solid' : 'thin';
}

export function effectiveStarterNum(depth, slotId, leaving) {
  const d = depth[slotId];
  const x = [d.starter, ...d.backups].find((y) => y && !leaving.has(y.num));
  return x ? x.num : null;
}

export function complianceOf(roster, leaving) {
  const live = roster.filter((p) => !leaving.has(p.num));
  const count = (reg) => live.filter((p) => p.reg === reg).length;
  const noneu = count('noneu');
  const home = count('home');
  const state = (n, lim) =>
    lim.kind === 'max'
      ? n > lim.value ? 'over' : n === lim.value ? 'at' : 'ok'
      : n < lim.value ? 'under' : 'ok';
  return {
    noneu: { n: noneu, lim: LIMITS.noneu, state: state(noneu, LIMITS.noneu) },
    home: { n: home, lim: LIMITS.home, state: state(home, LIMITS.home) },
  };
}
