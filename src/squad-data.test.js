import { describe, it, expect } from 'vitest';
import {
  tierFor,
  buildDepth,
  healthOf,
  effectiveStarterNum,
  effectiveStarterNums,
  complianceOf,
  complianceDisplay,
  squadComplianceStatus,
  slotForPlayer,
  FORMATIONS,
  LIMITS,
} from './squad-data';

/** @param {number} num @param {object} [opts] */
function player(num, opts = {}) {
  return {
    num,
    reg: 'eu',
    rating: 3,
    pos: ['CM'],
    pos2: [],
    ...opts,
  };
}

const SLOTS = FORMATIONS['4-3-3'];

describe('tierFor', () => {
  it('returns nat when primary position matches slot type', () => {
    expect(tierFor(player(1, { pos: ['CB'] }), 'CB')).toBe('nat');
  });

  it('returns sec when only secondary position matches', () => {
    expect(tierFor(player(2, { pos: ['CM'], pos2: ['CB'] }), 'CB')).toBe('sec');
  });

  it('returns oop when neither primary nor secondary matches', () => {
    expect(tierFor(player(3, { pos: ['ST'], pos2: ['RW'] }), 'GK')).toBe('oop');
  });
});

describe('buildDepth', () => {
  it('assigns highest-rated natural starter per slot', () => {
    const roster = [
      player(1, { pos: ['GK'], rating: 5 }),
      player(2, { pos: ['GK'], rating: 3 }),
      player(3, { pos: ['RB'], rating: 4 }),
      player(4, { pos: ['CB'], rating: 4 }),
      player(5, { pos: ['CB'], rating: 3 }),
      player(6, { pos: ['LB'], rating: 4 }),
      player(7, { pos: ['CM'], rating: 4 }),
      player(8, { pos: ['CM'], rating: 3 }),
      player(9, { pos: ['CM'], rating: 2 }),
      player(10, { pos: ['RW'], rating: 4 }),
      player(11, { pos: ['ST'], rating: 4 }),
      player(12, { pos: ['LW'], rating: 4 }),
    ];
    const depth = buildDepth(roster, SLOTS);

    expect(depth.GK.starter).toEqual({ num: 1, tier: 'nat' });
    expect(depth.CB1.starter.num).toBe(4);
    expect(depth.CB2.starter.num).toBe(5);
  });

  it('falls back to secondary when no natural is available', () => {
    const roster = [
      player(1, { pos: ['GK'], rating: 4 }),
      player(2, { pos: ['CM'], pos2: ['RB'], rating: 4 }),
      player(3, { pos: ['CB'], rating: 4 }),
      player(4, { pos: ['CB'], rating: 3 }),
      player(5, { pos: ['LB'], rating: 4 }),
      player(6, { pos: ['CM'], rating: 4 }),
      player(7, { pos: ['CM'], rating: 3 }),
      player(8, { pos: ['CM'], rating: 2 }),
      player(9, { pos: ['RW'], rating: 4 }),
      player(10, { pos: ['ST'], rating: 4 }),
      player(11, { pos: ['LW'], rating: 4 }),
    ];
    const depth = buildDepth(roster, SLOTS);

    expect(depth.RB.starter).toEqual({ num: 2, tier: 'sec' });
  });

  it('leaves starter null when no eligible player exists', () => {
    const roster = [player(1, { pos: ['ST'], rating: 5 })];
    const depth = buildDepth(roster, SLOTS);

    expect(depth.GK.starter).toBeNull();
  });

  it('adds up to two backups preferring natural over secondary', () => {
    const roster = [
      player(1, { pos: ['GK'], rating: 5 }),
      player(2, { pos: ['GK'], rating: 4 }),
      player(3, { pos: ['GK'], rating: 3 }),
      player(4, { pos: ['CM'], pos2: ['GK'], rating: 2 }),
    ];
    const depth = buildDepth(roster, [{ id: 'GK', label: 'GK', type: 'GK', left: 50, top: 90 }]);

    expect(depth.GK.starter.num).toBe(1);
    expect(depth.GK.backups.map((b) => b.num)).toEqual([2, 3]);
    expect(depth.GK.backups.every((b) => b.tier === 'nat')).toBe(true);
  });
});

describe('healthOf', () => {
  const depth = {
    ST: {
      starter: { num: 9, tier: 'nat' },
      backups: [
        { num: 19, tier: 'nat' },
        { num: 29, tier: 'sec' },
      ],
    },
    RW: {
      starter: { num: 7, tier: 'sec' },
      backups: [{ num: 17, tier: 'nat' }],
    },
    GK: {
      starter: { num: 1, tier: 'nat' },
      backups: [],
    },
    AM: {
      starter: null,
      backups: [],
    },
  };

  it('returns solid when natural starter has a natural backup', () => {
    expect(healthOf(depth, 'ST', new Set())).toBe('solid');
  });

  it('returns thin when starter is out of position or secondary', () => {
    expect(healthOf(depth, 'RW', new Set())).toBe('thin');
  });

  it('returns thin when natural starter has no natural backup', () => {
    expect(healthOf(depth, 'GK', new Set())).toBe('thin');
  });

  it('returns gap when no one remains after leaving set', () => {
    expect(healthOf(depth, 'ST', new Set([9, 19, 29]))).toBe('gap');
  });

  it('returns gap when slot has no starter or backups', () => {
    expect(healthOf(depth, 'AM', new Set())).toBe('gap');
  });

  it('promotes backup to starter when starter is leaving', () => {
    // ST: starter 9 leaves → 19 (nat) becomes starter; only sec backup 29 remains → thin
    expect(healthOf(depth, 'ST', new Set([9]))).toBe('thin');
    // RW: sec starter 7 leaves → 17 (nat) becomes starter with no backups → thin
    expect(healthOf(depth, 'RW', new Set([7]))).toBe('thin');
  });
});

describe('effectiveStarterNum', () => {
  const depth = {
    CM1: {
      starter: { num: 6, tier: 'nat' },
      backups: [{ num: 16, tier: 'nat' }, { num: 26, tier: 'sec' }],
    },
    DM: {
      starter: { num: 5, tier: 'nat' },
      backups: [],
    },
  };

  it('returns the starter when they are not leaving', () => {
    expect(effectiveStarterNum(depth, 'CM1', new Set())).toBe(6);
  });

  it('returns first available backup when starter is leaving', () => {
    expect(effectiveStarterNum(depth, 'CM1', new Set([6]))).toBe(16);
  });

  it('returns null when everyone in the stack is leaving', () => {
    expect(effectiveStarterNum(depth, 'CM1', new Set([6, 16, 26]))).toBeNull();
    expect(effectiveStarterNum(depth, 'DM', new Set([5]))).toBeNull();
  });
});

describe('complianceOf', () => {
  const roster = [
    player(1, { reg: 'home' }),
    player(2, { reg: 'home' }),
    player(3, { reg: 'home' }),
    player(4, { reg: 'noneu' }),
    player(5, { reg: 'noneu' }),
    player(6, { reg: 'eu' }),
  ];

  it('reports ok when within registration limits', () => {
    const result = complianceOf(roster, new Set());

    expect(result.home).toEqual({ n: 3, lim: LIMITS.home, state: 'ok' });
    expect(result.noneu).toEqual({ n: 2, lim: LIMITS.noneu, state: 'ok' });
  });

  it('reports under when homegrown minimum is not met', () => {
    const result = complianceOf(roster, new Set([1, 2]));

    expect(result.home.state).toBe('under');
    expect(result.home.n).toBe(1);
  });

  it('reports at when non-EU count equals the maximum', () => {
    const heavy = [
      ...Array.from({ length: 8 }, (_, i) => player(i + 1, { reg: 'noneu' })),
      player(99, { reg: 'home' }),
      player(98, { reg: 'home' }),
      player(97, { reg: 'home' }),
    ];
    const result = complianceOf(heavy, new Set());

    expect(result.noneu.state).toBe('at');
    expect(result.noneu.n).toBe(8);
  });

  it('reports over when non-EU count exceeds the maximum', () => {
    const over = [
      ...Array.from({ length: 9 }, (_, i) => player(i + 1, { reg: 'noneu' })),
      player(99, { reg: 'home' }),
      player(98, { reg: 'home' }),
      player(97, { reg: 'home' }),
    ];
    const result = complianceOf(over, new Set());

    expect(result.noneu.state).toBe('over');
    expect(result.noneu.n).toBe(9);
  });

  it('excludes leaving players from counts', () => {
    const result = complianceOf(roster, new Set([4, 5]));

    expect(result.noneu.n).toBe(0);
    expect(result.noneu.state).toBe('ok');
  });
});

describe('complianceDisplay', () => {
  it('formats max-limit counters with slots left', () => {
    const c = { n: 7, lim: LIMITS.noneu, state: 'ok' };
    expect(complianceDisplay(c)).toEqual({
      primary: '7 of 8 used',
      secondary: '1 slot left',
      fill: 7 / 8,
    });
  });

  it('formats max-limit at cap', () => {
    const c = { n: 8, lim: LIMITS.noneu, state: 'at' };
    expect(complianceDisplay(c).secondary).toBe('at cap');
  });

  it('formats max-limit over cap', () => {
    const c = { n: 9, lim: LIMITS.noneu, state: 'over' };
    expect(complianceDisplay(c).secondary).toBe('1 over cap');
  });

  it('formats min-limit homegrown ok', () => {
    const c = { n: 10, lim: LIMITS.home, state: 'ok' };
    expect(complianceDisplay(c)).toEqual({
      primary: '10 registered',
      secondary: '3 required ✓',
      fill: 1,
    });
  });

  it('formats min-limit homegrown under', () => {
    const c = { n: 2, lim: LIMITS.home, state: 'under' };
    expect(complianceDisplay(c).secondary).toBe('1 short of 3 required');
  });
});

describe('squadComplianceStatus', () => {
  it('reports valid when within limits', () => {
    const comp = complianceOf(
      [player(1, { reg: 'home' }), player(2, { reg: 'home' }), player(3, { reg: 'home' })],
      new Set(),
    );
    expect(squadComplianceStatus(comp)).toEqual({ valid: true, message: 'Squad valid ✓' });
  });

  it('reports over Non-EU cap', () => {
    const heavy = [
      ...Array.from({ length: 9 }, (_, i) => player(i + 1, { reg: 'noneu' })),
      player(99, { reg: 'home' }), player(98, { reg: 'home' }), player(97, { reg: 'home' }),
    ];
    const comp = complianceOf(heavy, new Set());
    expect(squadComplianceStatus(comp).valid).toBe(false);
    expect(squadComplianceStatus(comp).message).toBe('1 over Non-EU cap');
  });

  it('reports homegrown shortfall', () => {
    const comp = complianceOf([player(1, { reg: 'home' })], new Set());
    expect(squadComplianceStatus(comp).valid).toBe(false);
    expect(squadComplianceStatus(comp).message).toBe('2 short on homegrown');
  });
});

describe('slotForPlayer', () => {
  it('returns slot id when player is in depth stack', () => {
    const roster = [
      player(1, { pos: ['GK'], rating: 4 }),
      player(2, { pos: ['CB'], rating: 4 }),
      player(3, { pos: ['CB'], rating: 3 }),
      player(4, { pos: ['RB'], rating: 4 }),
      player(5, { pos: ['LB'], rating: 4 }),
      player(6, { pos: ['CM'], rating: 4 }),
      player(7, { pos: ['CM'], rating: 3 }),
      player(8, { pos: ['CM'], rating: 2 }),
      player(9, { pos: ['RW'], rating: 4 }),
      player(10, { pos: ['ST'], rating: 4 }),
      player(11, { pos: ['LW'], rating: 4 }),
    ];
    const depth = buildDepth(roster, FORMATIONS['4-3-3']);
    expect(slotForPlayer(depth, 1)).toBe('GK');
    expect(slotForPlayer(depth, 99)).toBeNull();
  });
});

describe('effectiveStarterNums', () => {
  it('collects all effective starter jersey numbers', () => {
    const roster = [
      player(1, { pos: ['GK'], rating: 4 }),
      player(2, { pos: ['CB'], rating: 4 }),
      player(3, { pos: ['CB'], rating: 3 }),
      player(4, { pos: ['RB'], rating: 4 }),
      player(5, { pos: ['LB'], rating: 4 }),
      player(6, { pos: ['CM'], rating: 4 }),
      player(7, { pos: ['CM'], rating: 3 }),
      player(8, { pos: ['CM'], rating: 2 }),
      player(9, { pos: ['RW'], rating: 4 }),
      player(10, { pos: ['ST'], rating: 4 }),
      player(11, { pos: ['LW'], rating: 4 }),
    ];
    const depth = buildDepth(roster, FORMATIONS['4-3-3']);
    const nums = effectiveStarterNums(depth, new Set());
    expect(nums.size).toBe(11);
    expect(nums.has(1)).toBe(true);
    expect(nums.has(10)).toBe(true);
  });
});
