/*
 * localStorage-backed store (Phase 1–2). Default when Supabase env keys are absent.
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
    /* quota / disabled — non-fatal */
  }
}

const sortRoster = (r) =>
  [...r].sort(
    (a, b) => POSITION_TYPES.indexOf(a.pos[0]) - POSITION_TYPES.indexOf(b.pos[0]) || b.rating - a.rating,
  );

let rosterOverrides = load(KEYS.rosters, {});

export async function init() {
  /* no-op — sync backend is ready immediately */
}

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

export function upsertPlayer(slug, player, originalNum = player.num) {
  const kept = getTeam(slug).roster.filter((p) => p.num !== originalNum);
  return persistRoster(slug, [...kept, player]);
}

export function deletePlayer(slug, num) {
  return persistRoster(slug, getTeam(slug).roster.filter((p) => p.num !== num));
}

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

export function isAdminFor() {
  return true;
}

export function currentUser() {
  return { id: 'local', email: null, isAnonymous: true, displayName: 'Local dev' };
}

export async function signInAnonymously() {
  return currentUser();
}

export async function signInWithEmail() {
  throw new Error('Email sign-in requires Supabase');
}

export async function signInWithGoogle() {
  throw new Error('Google sign-in requires Supabase');
}

export async function signOut() {
  /* no-op offline */
}

export function onAuthChange() {
  return () => {};
}

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

export function saveQuizResult(slug, result) {
  const all = load(KEYS.quiz, {});
  const list = all[slug] || [];
  list.unshift({ ...result, createdAt: Date.now() });
  all[slug] = list.slice(0, 20);
  save(KEYS.quiz, all);
}

export function listQuizResults(slug) {
  return load(KEYS.quiz, {})[slug] || [];
}
