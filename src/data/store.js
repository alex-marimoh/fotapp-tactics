/*
 * Persistence seam (docs/design-user-management.md §7).
 *
 * One module every screen reads/writes through, with a localStorage-backed
 * implementation for now. When the Supabase link arrives, a supabase backend
 * satisfies this same interface (getTeam / saveScenario / saveQuizResult / …):
 * hydrate a cache from the DB at boot, writes go to the DB + cache, and these
 * synchronous reads keep working unchanged.
 *
 *   Rosters       — admin edits overlay the generated seed, per team.
 *   Scenarios     — the board's what-if state, autosaved per team.
 *   Quiz results  — kept as history, per team.
 */
import { POSITION_TYPES } from '../squad-data';
import {
  getTeams as seedTeams, getTeam as seedTeam, getLeagueRules, DEFAULT_TEAM_SLUG,
} from './teams';

export { getLeagueRules, DEFAULT_TEAM_SLUG };

const KEYS = {
  rosters: 'fotapp.rosters.v1',
  scenarios: 'fotapp.scenarios.v1',
  quiz: 'fotapp.quiz.v1',
};

const hasLS = (() => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem('__fotapp_test__', '1');
    window.localStorage.removeItem('__fotapp_test__');
    return true;
  } catch {
    return false;
  }
})();

function load(key, fallback) {
  if (!hasLS) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  if (!hasLS) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / disabled — non-fatal for a sandbox */
  }
}

const sortRoster = (r) =>
  [...r].sort(
    (a, b) => POSITION_TYPES.indexOf(a.pos[0]) - POSITION_TYPES.indexOf(b.pos[0]) || b.rating - a.rating,
  );

// ---- teams / rosters (admin-editable overlay on the generated seed) --------
let rosterOverrides = load(KEYS.rosters, {}); // { [slug]: Player[] }

export function getTeams() {
  return seedTeams();
}

export function getTeam(slug) {
  const base = seedTeam(slug);
  const override = rosterOverrides[base.slug];
  return override ? { ...base, roster: override } : base;
}

function persistRoster(slug, roster) {
  rosterOverrides = { ...rosterOverrides, [slug]: sortRoster(roster) };
  save(KEYS.rosters, rosterOverrides);
  return rosterOverrides[slug];
}

// Add or replace a player. `originalNum` identifies the row being edited (its
// number may change); omit it when adding a new player.
export function upsertPlayer(slug, player, originalNum = player.num) {
  const kept = getTeam(slug).roster.filter((p) => p.num !== originalNum);
  return persistRoster(slug, [...kept, player]);
}

export function deletePlayer(slug, num) {
  return persistRoster(slug, getTeam(slug).roster.filter((p) => p.num !== num));
}

// Drop the override → the team falls back to the freshly generated seed.
export function regenerateTeam(slug) {
  const next = { ...rosterOverrides };
  delete next[slug];
  rosterOverrides = next;
  save(KEYS.rosters, rosterOverrides);
  return getTeam(slug).roster;
}

export function hasRosterEdits(slug) {
  return Boolean(rosterOverrides[slug]);
}

// Local backend: the device user manages everything. Real per-team gating
// arrives with Supabase roles (Phase 3).
export function isAdminFor() {
  return true;
}

// ---- board scenarios (autosaved what-if state) -----------------------------
export function loadScenario(slug) {
  return load(KEYS.scenarios, {})[slug] || null;
}
export function saveScenario(slug, state) {
  const all = load(KEYS.scenarios, {});
  all[slug] = state;
  save(KEYS.scenarios, all);
}
export function clearScenario(slug) {
  const all = load(KEYS.scenarios, {});
  delete all[slug];
  save(KEYS.scenarios, all);
}

// ---- quiz results (history) ------------------------------------------------
export function saveQuizResult(slug, result) {
  const all = load(KEYS.quiz, {});
  const list = all[slug] || [];
  list.unshift({ ...result, createdAt: Date.now() });
  all[slug] = list.slice(0, 20); // keep the last 20 per team
  save(KEYS.quiz, all);
}
export function listQuizResults(slug) {
  return load(KEYS.quiz, {})[slug] || [];
}
