/** PROTOTYPE — squad-planning helpers. Delete with prototype. */

import { SQUAD, DEPTH_CHARTS, NEWS } from '../../shared';

export const TEAM = {
  name: 'Panathinaikos',
  label: 'My team',
  formation: '4-3-3 DM',
  squadSize: SQUAD.length,
};

const POSITION_ORDER = ['GK', 'RB', 'CB', 'CB2', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];

const POSITION_LABELS = {
  GK: 'Goalkeeper',
  RB: 'Right back',
  CB: 'Centre back',
  CB2: 'Centre back',
  LB: 'Left back',
  DM: 'Defensive mid',
  CM: 'Central mid',
  AM: 'Attacking mid',
  RW: 'Right wing',
  LW: 'Left wing',
  ST: 'Striker',
};

/** @returns {Array<{ pos: string, label: string, starter: object, backups: object[], depth: number, gap: boolean, thin: boolean }>} */
export function getPositionRows() {
  return POSITION_ORDER.map((pos) => {
    const dc = DEPTH_CHARTS[pos];
    if (!dc) return null;
    const depth = 1 + dc.backups.length;
    return {
      pos,
      label: POSITION_LABELS[pos] ?? pos,
      starter: dc.starter,
      backups: dc.backups,
      depth,
      gap: depth <= 1,
      thin: depth <= 2,
    };
  }).filter(Boolean);
}

/** Squad needs derived from depth — what everyday users care about when planning */
export function getSquadNeeds() {
  const rows = getPositionRows();
  const needs = [];

  rows.filter((r) => r.gap).forEach((r) => {
    needs.push({
      id: `gap-${r.pos}`,
      severity: 'high',
      title: `No backup at ${r.label}`,
      body: `${r.starter.name} is your only ${r.pos} option. Consider adding depth.`,
      pos: r.pos,
    });
  });

  rows.filter((r) => r.thin && !r.gap).forEach((r) => {
    needs.push({
      id: `thin-${r.pos}`,
      severity: 'medium',
      title: `Thin at ${r.label}`,
      body: `Only ${r.depth} players cover this spot.`,
      pos: r.pos,
    });
  });

  const lowRated = rows.filter((r) => r.starter.rating <= 3);
  lowRated.forEach((r) => {
    needs.push({
      id: `rating-${r.pos}`,
      severity: 'low',
      title: `Starter question mark — ${r.label}`,
      body: `${r.starter.name} is rated ${r.starter.rating}/5. Worth upgrading or finding a backup plan.`,
      pos: r.pos,
    });
  });

  return needs.slice(0, 6);
}

/** News items loosely tied to squad players for click-through demos */
export function getNewsForPlayer(playerName) {
  const matches = NEWS.filter(
    (n) => n.head.toLowerCase().includes(playerName.split(' ').pop().toLowerCase())
      || n.body.toLowerCase().includes(playerName.split(' ').pop().toLowerCase()),
  );
  return matches.length > 0 ? matches : NEWS.slice(0, 2);
}

export function getPlayerByNum(num) {
  return SQUAD.find((p) => p.num === num);
}
