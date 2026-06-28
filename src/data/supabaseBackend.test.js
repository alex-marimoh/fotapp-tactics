import { describe, it, expect, vi, beforeEach } from 'vitest';

const showToast = vi.hoisted(() => vi.fn());
const serverPlayers = vi.hoisted(() => ([
  {
    id: 'p1',
    team_slug: 'olympiacos',
    num: 1,
    name: 'Server Player',
    age: 25,
    nat: 'GR',
    reg: 'home',
    rating: 3,
    pos: ['CB'],
    pos2: [],
    market_value: 1,
    wage: 10,
    contract_end: 2028,
    transfer_fee: null,
    on_loan: false,
  },
]));

const mockDelete = vi.hoisted(() => vi.fn());
const mockSelectEq = vi.hoisted(() => vi.fn());
const mockUpsert = vi.hoisted(() => vi.fn());
const mockMaybeSingle = vi.hoisted(() => vi.fn());

function userScopedQuery() {
  const result = Promise.resolve({ data: [], error: null });
  const chain = {
    order: () => result,
    then: result.then.bind(result),
  };
  return {
    eq: () => chain,
  };
}

function buildMockClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }),
      signInAnonymously: async () => ({ data: { user: { id: 'u1' } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (table) => {
      if (table === 'teams') {
        return {
          select: () => ({
            order: async () => ({
              data: [{ slug: 'olympiacos', name: 'Olympiacos', short: 'OLY', league: 'GR', colors: {} }],
            }),
          }),
        };
      }
      if (table === 'players') {
        return {
          select: (cols) => ({
            eq: (col, val) => {
              if (col === 'team_slug' && cols === '*') {
                mockSelectEq(val);
                return Promise.resolve({ data: serverPlayers.filter((p) => p.team_slug === val), error: null });
              }
              return {
                eq: () => ({ maybeSingle: mockMaybeSingle }),
              };
            },
          }),
          delete: () => ({
            eq: () => ({
              eq: () => mockDelete(),
            }),
          }),
          upsert: (...args) => mockUpsert(...args),
        };
      }
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: 'u1', display_name: 'Guest', is_admin: true }, error: null }),
            }),
          }),
        };
      }
      return {
        select: () => userScopedQuery(),
      };
    },
  };
}

const mockClient = vi.hoisted(() => buildMockClient());

vi.mock('../ui/toast', () => ({ showToast }));

vi.mock('../supabaseClient', () => ({
  ensureSupabaseClient: async () => mockClient,
  getSupabase: () => mockClient,
}));

describe('supabaseBackend persistUpsertPlayer', () => {
  beforeEach(async () => {
    vi.resetModules();
    showToast.mockReset();
    mockDelete.mockReset();
    mockSelectEq.mockReset();
    mockUpsert.mockReset();
    mockMaybeSingle.mockReset();
    mockMaybeSingle.mockResolvedValue({ data: null });
    mockDelete.mockResolvedValue({ error: null });
    mockUpsert.mockReturnValue({
      select: () => ({
        single: async () => ({ data: { id: 'upsert-id' }, error: null }),
      }),
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('saves an existing player with a single upsert and no pre-save SELECT', async () => {
    const backend = await import('./supabaseBackend');
    await backend.init();

    backend.upsertPlayer('olympiacos', {
      id: 'p1',
      num: 1,
      name: 'Updated Player',
      age: 25,
      nat: 'GR',
      reg: 'home',
      rating: 4,
      pos: ['CB'],
      pos2: [],
      value: 1,
      wage: 10,
      contractEnd: 2028,
    });

    await vi.waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledTimes(1);
    });

    expect(mockMaybeSingle).not.toHaveBeenCalled();
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ team_slug: 'olympiacos', num: 1, name: 'Updated Player', id: 'p1' }),
      { onConflict: 'team_slug,num' },
    );
    expect(backend.getTeam('olympiacos').roster.find((p) => p.num === 1)?.id).toBe('upsert-id');
  });

  it('creates a new player via upsert and back-fills its id', async () => {
    const backend = await import('./supabaseBackend');
    await backend.init();

    backend.upsertPlayer('olympiacos', {
      num: 42,
      name: 'New Signing',
      age: 20,
      nat: 'GR',
      reg: 'home',
      rating: 2,
      pos: ['CM'],
      pos2: [],
      value: 1,
      wage: 5,
      contractEnd: 2029,
    });

    await vi.waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledTimes(1);
    });

    expect(mockMaybeSingle).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
    expect(backend.getTeam('olympiacos').roster.find((p) => p.num === 42)?.id).toBe('upsert-id');
  });

  it('renumbers a player by upserting the new num and deleting the old row', async () => {
    const backend = await import('./supabaseBackend');
    await backend.init();

    backend.upsertPlayer(
      'olympiacos',
      {
        id: 'p1',
        num: 7,
        name: 'Renumbered Player',
        age: 25,
        nat: 'GR',
        reg: 'home',
        rating: 3,
        pos: ['CB'],
        pos2: [],
        value: 1,
        wage: 10,
        contractEnd: 2028,
      },
      1,
    );

    await vi.waitFor(() => {
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.not.objectContaining({ id: 'p1' }),
      { onConflict: 'team_slug,num' },
    );
    expect(mockDelete).toHaveBeenCalled();
    expect(backend.getTeam('olympiacos').roster.find((p) => p.num === 7)?.id).toBe('upsert-id');
    expect(backend.getTeam('olympiacos').roster.some((p) => p.num === 1)).toBe(false);
  });
});

describe('supabaseBackend player write failures', () => {
  beforeEach(async () => {
    vi.resetModules();
    showToast.mockReset();
    mockDelete.mockReset();
    mockSelectEq.mockReset();
    mockUpsert.mockReset();
    mockMaybeSingle.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows toast, logs, and refetches roster after a failed upsert', async () => {
    mockUpsert.mockReturnValue({
      select: () => ({
        single: async () => ({ data: null, error: { message: 'RLS denied' } }),
      }),
    });

    const backend = await import('./supabaseBackend');
    await backend.init();

    const rosterUpdates = [];
    backend.subscribeRoster('olympiacos', (roster) => rosterUpdates.push(roster));

    backend.upsertPlayer('olympiacos', {
      num: 99,
      name: 'Optimistic',
      age: 22,
      nat: 'GR',
      reg: 'home',
      rating: 3,
      pos: ['ST'],
      pos2: [],
      value: 1,
      wage: 10,
      contractEnd: 2028,
    });

    await vi.waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Could not save player. Your changes were not saved.');
    });

    expect(console.error).toHaveBeenCalled();
    expect(mockSelectEq).toHaveBeenCalledWith('olympiacos');
    expect(rosterUpdates.at(-1)?.some((p) => p.name === 'Server Player')).toBe(true);
    expect(rosterUpdates.at(-1)?.some((p) => p.name === 'Optimistic')).toBe(false);
  });

  it('shows toast and refetches after a failed delete', async () => {
    mockDelete.mockResolvedValue({ error: { message: 'RLS denied' } });

    const backend = await import('./supabaseBackend');
    await backend.init();

    const rosterUpdates = [];
    backend.subscribeRoster('olympiacos', (roster) => rosterUpdates.push(roster));

    backend.deletePlayer('olympiacos', 1);

    await vi.waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('Could not delete player. Your changes were not saved.');
    });

    expect(console.error).toHaveBeenCalled();
    expect(rosterUpdates.at(-1)?.some((p) => p.num === 1)).toBe(true);
  });
});
