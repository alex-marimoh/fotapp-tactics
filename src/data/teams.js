/*
 * Team accessor seam (docs/design-user-management.md §2, ADR 0003).
 * The ONE place team/roster data enters the app for the offline backend.
 * Rosters are generated lazily on first access; metadata lives in teamMeta.js.
 */
import { generateRoster } from './generator';
import {
  DEFAULT_TEAM_SLUG,
  getLeagueRules,
  getClubBySlug,
  getTeamsMeta,
  clubMeta,
} from './teamMeta';

export { DEFAULT_TEAM_SLUG, getLeagueRules };

/** @type {Map<string, import('../squad-data').Player[]>} */
const rosterCache = new Map();

/** @param {ReturnType<typeof getClubBySlug>} club */
function rosterForClub(club) {
  if (!rosterCache.has(club.slug)) {
    rosterCache.set(club.slug, generateRoster(club));
  }
  return rosterCache.get(club.slug);
}

// Lightweight list for pickers (no roster payload).
export function getTeams() {
  return getTeamsMeta();
}

// Full team (with roster) for the board and quiz.
export function getTeam(slug) {
  const club = getClubBySlug(slug);
  return {
    ...clubMeta(club),
    rules: getLeagueRules(),
    roster: rosterForClub(club),
    strength: club.strength,
  };
}
