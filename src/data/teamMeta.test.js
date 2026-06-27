import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('teamMeta import path', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('importing teamMeta does not call generateRoster', async () => {
    const spy = vi.fn();
    vi.doMock('./generator', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        generateRoster: (...args) => {
          spy(...args);
          return actual.generateRoster(...args);
        },
      };
    });

    const meta = await import('./teamMeta');
    expect(meta.DEFAULT_TEAM_SLUG).toBe('olympiacos');
    expect(meta.getLeagueRules()).toEqual({ noneu: { kind: 'max', value: 8 }, home: { kind: 'min', value: 3 } });
    expect(meta.getTeamsMeta()).toHaveLength(14);
    expect(spy).not.toHaveBeenCalled();
  });

  it('importing supabaseBackend module does not call generateRoster', async () => {
    const spy = vi.fn();
    vi.doMock('./generator', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        generateRoster: (...args) => {
          spy(...args);
          return actual.generateRoster(...args);
        },
      };
    });
    vi.doMock('../ui/toast', () => ({ showToast: vi.fn() }));
    vi.doMock('../supabaseClient', () => ({
      ensureSupabaseClient: async () => ({}),
      getSupabase: () => ({}),
    }));

    await import('./supabaseBackend');
    expect(spy).not.toHaveBeenCalled();
  });

  it('importing store in Supabase mode does not call generateRoster', async () => {
    const spy = vi.fn();
    vi.doMock('./generator', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        generateRoster: (...args) => {
          spy(...args);
          return actual.generateRoster(...args);
        },
      };
    });
    vi.doMock('../supabaseConfig', () => ({ isSupabaseConfigured: () => true }));

    const store = await import('./store');
    expect(store.usesSupabase()).toBe(true);
    expect(store.DEFAULT_TEAM_SLUG).toBe('olympiacos');
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('teams lazy roster generation', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('does not generate rosters until getTeam is called', async () => {
    const spy = vi.fn();
    vi.doMock('./generator', async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        generateRoster: (...args) => {
          spy(...args);
          return actual.generateRoster(...args);
        },
      };
    });

    const teams = await import('./teams');
    teams.getTeams();
    expect(spy).not.toHaveBeenCalled();

    teams.getTeam('paok');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].slug).toBe('paok');

    teams.getTeam('paok');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('produces identical deterministic rosters to direct generateRoster', async () => {
    const { generateRoster } = await import('./generator');
    const { getClubBySlug } = await import('./teamMeta');
    const { getTeam } = await import('./teams');

    const club = getClubBySlug('aek-athens');
    expect(getTeam('aek-athens').roster).toEqual(generateRoster(club));
  });
});
