/*
 * Supabase-backed store (Phase 3). Hydrates an in-memory cache at boot so reads
 * stay synchronous; writes update cache then persist async.
 */
import { POSITION_TYPES } from '../squad-data';
import { ensureSupabaseClient, getSupabase } from '../supabaseClient';
import { showToast } from '../ui/toast';
import { GREEK_SUPER_LEAGUE } from './league';
import { generateRoster, SEASON } from './generator';
import { getLeagueRules, DEFAULT_TEAM_SLUG } from './teamMeta';

export { getLeagueRules, DEFAULT_TEAM_SLUG };

const clubBySlug = Object.fromEntries(GREEK_SUPER_LEAGUE.clubs.map((c) => [c.slug, c]));

const sortRoster = (r) =>
  [...r].sort(
    (a, b) => POSITION_TYPES.indexOf(a.pos[0]) - POSITION_TYPES.indexOf(b.pos[0]) || b.rating - a.rating,
  );

/** @type {Array<{ slug: string, name: string, short: string, league: string, colors: object }>} */
let teamsMeta = [];
/** @type {Record<string, import('../squad-data').Player[]>} */
let rosters = {};
/** @type {Record<string, object>} */
let scenarios = {};
/** @type {Record<string, object[]>} */
let quizByTeam = {};
/** @type {{ id: string, display_name: string | null, is_admin: boolean } | null} */
let profile = null;
/** @type {Set<string>} */
let teamAdminSlugs = new Set();
/** @type {import('@supabase/supabase-js').User | null} */
let authUser = null;
/** @type {Map<string, Set<(roster: import('../squad-data').Player[]) => void>>} */
const rosterListeners = new Map();

function playerFromRow(row) {
  return {
    id: row.id,
    num: row.num,
    name: row.name,
    age: row.age,
    nat: row.nat,
    reg: row.reg,
    rating: row.rating,
    pos: row.pos,
    pos2: row.pos2 ?? [],
    value: Number(row.market_value),
    wage: Number(row.wage),
    contractEnd: row.contract_end,
    expiring: row.contract_end != null && row.contract_end <= SEASON,
    transferFee: row.transfer_fee != null ? Number(row.transfer_fee) : undefined,
    onLoan: row.on_loan ?? false,
  };
}

function playerToRow(slug, p) {
  const row = {
    team_slug: slug,
    num: p.num,
    name: p.name,
    age: p.age,
    nat: p.nat,
    reg: p.reg,
    rating: p.rating,
    pos: p.pos,
    pos2: p.pos2 ?? [],
    wage: p.wage,
    market_value: p.value,
    transfer_fee: p.transferFee ?? null,
    contract_end: p.contractEnd,
    on_loan: p.onLoan ?? false,
  };
  if (p.id) row.id = p.id;
  return row;
}

function rosterSignature(roster) {
  return JSON.stringify(
    roster.map((p) => [p.num, p.name, p.rating, p.reg, p.pos, p.pos2, p.wage, p.value, p.contractEnd]),
  );
}

function mapUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
    isAnonymous: Boolean(user.is_anonymous),
    displayName: profile?.display_name ?? user.email ?? (user.is_anonymous ? 'Guest' : 'Signed in'),
  };
}

async function ensureSession() {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    authUser = session.user;
    return session;
  }
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  authUser = data.user;
  return data.session;
}

async function loadProfile() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('profiles').select('id, display_name, is_admin').eq('id', authUser.id).single();
  if (error && error.code !== 'PGRST116') throw error;
  profile = data ?? { id: authUser.id, display_name: 'Guest', is_admin: false };
}

async function reloadUserData() {
  const supabase = getSupabase();
  const uid = authUser.id;

  const [{ data: adminRows }, { data: scenRows }, { data: quizRows }] = await Promise.all([
    supabase.from('team_admins').select('team_slug').eq('user_id', uid),
    supabase.from('board_scenarios').select('team_slug, state').eq('user_id', uid),
    supabase.from('quiz_results').select('team_slug, summary, archetype, created_at').eq('user_id', uid).order('created_at', { ascending: false }),
  ]);

  teamAdminSlugs = new Set((adminRows ?? []).map((r) => r.team_slug));
  scenarios = Object.fromEntries((scenRows ?? []).map((r) => [r.team_slug, r.state]));
  quizByTeam = {};
  for (const row of quizRows ?? []) {
    if (!quizByTeam[row.team_slug]) quizByTeam[row.team_slug] = [];
    if (quizByTeam[row.team_slug].length >= 20) continue;
    quizByTeam[row.team_slug].push({
      ...row.summary,
      archetype: row.archetype,
      createdAt: new Date(row.created_at).getTime(),
    });
  }
}

async function loadTeamsAndRosters() {
  const supabase = getSupabase();
  const [{ data: teams }, { data: players }] = await Promise.all([
    supabase.from('teams').select('slug, name, short, league, colors').order('name'),
    supabase.from('players').select('*'),
  ]);
  if (!teams?.length) throw new Error('Supabase teams table is empty — run scripts/seed-supabase.mjs');
  teamsMeta = teams;
  rosters = {};
  for (const row of players ?? []) {
    if (!rosters[row.team_slug]) rosters[row.team_slug] = [];
    rosters[row.team_slug].push(playerFromRow(row));
  }
  for (const slug of Object.keys(rosters)) rosters[slug] = sortRoster(rosters[slug]);
}

async function reloadTeamRoster(slug) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('players').select('*').eq('team_slug', slug);
  if (error) throw error;
  rosters[slug] = sortRoster((data ?? []).map(playerFromRow));
  notifyRoster(slug);
}

function notifyRoster(slug) {
  const roster = rosters[slug] ?? [];
  rosterListeners.get(slug)?.forEach((cb) => cb([...roster]));
}

/**
 * @param {string} action
 * @param {string} slug
 * @param {unknown} err
 */
async function handlePlayerWriteFailure(action, slug, err) {
  console.error(`Supabase ${action} failed:`, err);
  showToast(`Could not ${action}. Your changes were not saved.`);
  try {
    await reloadTeamRoster(slug);
  } catch (refetchErr) {
    console.error('Failed to refetch roster after write failure:', refetchErr);
    showToast('Could not sync roster with server. Please refresh the page.');
  }
}

/** @param {string} slug @param {(roster: import('../squad-data').Player[]) => void} cb */
export function subscribeRoster(slug, cb) {
  if (!rosterListeners.has(slug)) rosterListeners.set(slug, new Set());
  rosterListeners.get(slug).add(cb);
  return () => rosterListeners.get(slug)?.delete(cb);
}

export async function init() {
  await ensureSupabaseClient();
  await ensureSession();
  await loadProfile();
  await Promise.all([loadTeamsAndRosters(), reloadUserData()]);
}

export function getTeams() {
  return teamsMeta;
}

export function getTeam(slug) {
  const key = slug && teamsMeta.some((t) => t.slug === slug) ? slug : (teamsMeta[0]?.slug ?? DEFAULT_TEAM_SLUG);
  const meta = teamsMeta.find((t) => t.slug === key) ?? teamsMeta[0];
  const club = clubBySlug[meta.slug];
  return {
    ...meta,
    rules: getLeagueRules(),
    roster: rosters[meta.slug] ?? [],
    strength: club?.strength,
  };
}

export function upsertPlayer(slug, player, originalNum = player.num) {
  const kept = (rosters[slug] ?? []).filter((p) => p.num !== originalNum);
  rosters[slug] = sortRoster([...kept, { ...player }]);
  persistUpsertPlayer(slug, player, originalNum).catch((err) => {
    handlePlayerWriteFailure('save player', slug, err);
  });
  return rosters[slug];
}

async function persistUpsertPlayer(slug, player, originalNum) {
  const supabase = getSupabase();
  const renumbered = player.num !== originalNum;
  const row = playerToRow(slug, player);
  if (renumbered) delete row.id;

  const { data, error } = await supabase
    .from('players')
    .upsert(row, { onConflict: 'team_slug,num' })
    .select('id')
    .single();
  if (error) throw error;

  if (renumbered) {
    const { error: deleteError } = await supabase.from('players').delete().eq('team_slug', slug).eq('num', originalNum);
    if (deleteError) throw deleteError;
  }

  const cached = rosters[slug].find((p) => p.num === player.num);
  if (cached) cached.id = data.id;
}

export function deletePlayer(slug, num) {
  rosters[slug] = (rosters[slug] ?? []).filter((p) => p.num !== num);
  getSupabase().from('players').delete().eq('team_slug', slug).eq('num', num).then(({ error }) => {
    if (error) handlePlayerWriteFailure('delete player', slug, error);
  });
  return rosters[slug];
}

export function regenerateTeam(slug) {
  const club = clubBySlug[slug];
  if (!club) return rosters[slug] ?? [];
  const fresh = generateRoster(club);
  rosters[slug] = fresh;
  persistRegenerateTeam(slug, fresh).catch((err) => {
    handlePlayerWriteFailure('regenerate squad', slug, err);
  });
  return rosters[slug];
}

async function persistRegenerateTeam(slug, fresh) {
  const supabase = getSupabase();
  const rows = fresh.map((p) => {
    const row = playerToRow(slug, p);
    delete row.team_slug;
    delete row.id;
    return row;
  });
  const { data, error } = await supabase.rpc('regenerate_team_players', {
    p_team_slug: slug,
    p_players: rows,
  });
  if (error) throw error;
  for (const row of data ?? []) {
    const p = rosters[slug].find((x) => x.num === row.num);
    if (p) p.id = row.id;
  }
}

export function hasRosterEdits(slug) {
  const club = clubBySlug[slug];
  if (!club) return false;
  const seed = generateRoster(club);
  return rosterSignature(rosters[slug] ?? []) !== rosterSignature(seed);
}

export function isAdminFor(slug) {
  if (profile?.is_admin) return true;
  return teamAdminSlugs.has(slug);
}

export function currentUser() {
  return mapUser(authUser);
}

export async function signInAnonymously() {
  await ensureSession();
  await loadProfile();
  return currentUser();
}

/** @param {string} email */
export async function signInWithEmail(email) {
  const supabase = getSupabase();
  if (authUser?.is_anonymous) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
    return currentUser();
  }
  const redirectTo = window.location.origin + window.location.pathname + window.location.search;
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  if (error) throw error;
}

export async function signInWithGoogle() {
  const supabase = getSupabase();
  const redirectTo = window.location.origin + window.location.pathname + window.location.search;
  if (authUser?.is_anonymous) {
    const { error } = await supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo } });
    if (error) throw error;
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  if (error) throw error;
}

export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  await ensureSession();
  await loadProfile();
  await reloadUserData();
}

/** @param {(user: ReturnType<typeof currentUser>) => void} cb */
export function onAuthChange(cb) {
  const supabase = getSupabase();
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    authUser = session?.user ?? null;
    if (authUser) {
      await loadProfile();
      await reloadUserData();
    }
    cb(currentUser());
  });
  return () => subscription.unsubscribe();
}

export function loadScenario(slug) {
  return scenarios[slug] ?? null;
}

export function saveScenario(slug, state) {
  scenarios[slug] = state;
  const supabase = getSupabase();
  supabase.from('board_scenarios').upsert(
    { user_id: authUser.id, team_slug: slug, name: 'current', state },
    { onConflict: 'user_id,team_slug,name' },
  ).then(({ error }) => { if (error) console.error(error); });
}

export function clearScenario(slug) {
  delete scenarios[slug];
  getSupabase().from('board_scenarios').delete()
    .eq('user_id', authUser.id).eq('team_slug', slug).eq('name', 'current')
    .then(({ error }) => { if (error) console.error(error); });
}

export function saveQuizResult(slug, result) {
  const entry = { ...result, createdAt: Date.now() };
  if (!quizByTeam[slug]) quizByTeam[slug] = [];
  quizByTeam[slug].unshift(entry);
  quizByTeam[slug] = quizByTeam[slug].slice(0, 20);
  getSupabase().from('quiz_results').insert({
    user_id: authUser.id,
    team_slug: slug,
    decisions: {},
    summary: result,
    archetype: result.archetype ?? null,
  }).then(({ error }) => { if (error) console.error(error); });
}

export function listQuizResults(slug) {
  return quizByTeam[slug] ?? [];
}
