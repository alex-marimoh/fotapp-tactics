/*
 * Persistence seam (docs/design-user-management.md §7).
 *
 * One module every screen reads/writes through. Picks supabaseBackend when
 * VITE_SUPABASE_* env keys are present, otherwise localBackend (offline dev).
 */
import { isSupabaseConfigured } from '../supabaseClient';
import * as local from './localBackend';
import * as remote from './supabaseBackend';

/** @type {typeof local} */
let backend = local;

let bootPromise = null;

/** @returns {boolean} */
export function usesSupabase() {
  return isSupabaseConfigured();
}

/** Boot the active backend (no-op for local). Call once before rendering. */
export function bootStore() {
  if (!isSupabaseConfigured()) return Promise.resolve();
  if (!bootPromise) bootPromise = remote.init().then(() => { backend = remote; });
  return bootPromise;
}

export { DEFAULT_TEAM_SLUG, getLeagueRules } from './teams';

export const getTeams = (...a) => backend.getTeams(...a);
export const getTeam = (...a) => backend.getTeam(...a);
export const upsertPlayer = (...a) => backend.upsertPlayer(...a);
export const deletePlayer = (...a) => backend.deletePlayer(...a);
export const regenerateTeam = (...a) => backend.regenerateTeam(...a);
export const hasRosterEdits = (...a) => backend.hasRosterEdits(...a);
export const isAdminFor = (...a) => backend.isAdminFor(...a);
export const currentUser = (...a) => backend.currentUser(...a);
export const signInAnonymously = (...a) => backend.signInAnonymously(...a);
export const signInWithEmail = (...a) => backend.signInWithEmail(...a);
export const signInWithGoogle = (...a) => backend.signInWithGoogle(...a);
export const signOut = (...a) => backend.signOut(...a);
export const onAuthChange = (...a) => backend.onAuthChange(...a);
export const loadScenario = (...a) => backend.loadScenario(...a);
export const saveScenario = (...a) => backend.saveScenario(...a);
export const clearScenario = (...a) => backend.clearScenario(...a);
export const saveQuizResult = (...a) => backend.saveQuizResult(...a);
export const listQuizResults = (...a) => backend.listQuizResults(...a);
export const subscribeRoster = (...a) => (backend.subscribeRoster ? backend.subscribeRoster(...a) : () => {});
