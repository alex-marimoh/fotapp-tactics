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
                eq: () => ({ maybeSingle: async () => ({ data: null }) }),
              };
            },
          }),
          delete: () => ({
            eq: () => ({
              eq: () => mockDelete(),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: async () => ({ data: null, error: { message: 'RLS denied' } }),
            }),
          }),
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

describe('supabaseBackend player write failures', () => {
  beforeEach(async () => {
    vi.resetModules();
    showToast.mockReset();
    mockDelete.mockReset();
    mockSelectEq.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows toast, logs, and refetches roster after a failed upsert', async () => {
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
