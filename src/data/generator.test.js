import { describe, it, expect } from 'vitest';
import { generateRoster, SEASON } from './generator';
import { POSITION_TYPES } from '../squad-data';
import { GREEK_SUPER_LEAGUE } from './league';

const REQUIRED_FIELDS = [
  'num',
  'name',
  'age',
  'nat',
  'reg',
  'rating',
  'pos',
  'pos2',
  'value',
  'wage',
  'contractEnd',
  'expiring',
  'transferFee',
];

describe('generateRoster', () => {
  const club = GREEK_SUPER_LEAGUE.clubs[0];

  it('is deterministic for the same club slug', () => {
    const first = generateRoster(club);
    const second = generateRoster(club);

    expect(second).toEqual(first);
  });

  it('produces different rosters for different club slugs', () => {
    const a = generateRoster(GREEK_SUPER_LEAGUE.clubs[0]);
    const b = generateRoster(GREEK_SUPER_LEAGUE.clubs[1]);

    expect(b).not.toEqual(a);
  });

  it('returns players with the canonical roster shape', () => {
    const roster = generateRoster(club);

    expect(roster.length).toBeGreaterThanOrEqual(24);
    expect(roster.length).toBeLessThanOrEqual(26);

    for (const p of roster) {
      for (const field of REQUIRED_FIELDS) {
        expect(p).toHaveProperty(field);
      }
      expect(p.pos).toHaveLength(1);
      expect(POSITION_TYPES).toContain(p.pos[0]);
      expect(['home', 'eu', 'noneu']).toContain(p.reg);
      expect(p.rating).toBeGreaterThanOrEqual(1);
      expect(p.rating).toBeLessThanOrEqual(5);
      expect(p.age).toBeGreaterThanOrEqual(17);
      expect(p.age).toBeLessThanOrEqual(36);
      expect(p.expiring).toBe(p.contractEnd <= SEASON);
    }
  });

  it('assigns squad number 1 to the first goalkeeper', () => {
    const roster = generateRoster(club);
    const keepers = roster.filter((p) => p.pos[0] === 'GK');

    expect(keepers.some((p) => p.num === 1)).toBe(true);
  });

  it('satisfies nationality mix constraints', () => {
    const roster = generateRoster(club);
    const home = roster.filter((p) => p.reg === 'home').length;
    const eu = roster.filter((p) => p.reg === 'eu').length;
    const noneu = roster.filter((p) => p.reg === 'noneu').length;

    expect(home).toBeGreaterThanOrEqual(3);
    expect(eu).toBeGreaterThanOrEqual(5);
    expect(eu).toBeLessThanOrEqual(15);
    expect(noneu).toBeGreaterThanOrEqual(3);
    expect(noneu).toBeLessThanOrEqual(7);
    expect(home + eu + noneu).toBe(roster.length);
  });

  it('sorts by position type then descending rating', () => {
    const roster = generateRoster(club);

    for (let i = 1; i < roster.length; i += 1) {
      const prev = roster[i - 1];
      const curr = roster[i];
      const prevIdx = POSITION_TYPES.indexOf(prev.pos[0]);
      const currIdx = POSITION_TYPES.indexOf(curr.pos[0]);

      if (prevIdx === currIdx) {
        expect(prev.rating).toBeGreaterThanOrEqual(curr.rating);
      } else {
        expect(prevIdx).toBeLessThan(currIdx);
      }
    }
  });
});
