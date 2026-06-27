/*
 * Team accessor seam (docs/design-user-management.md §2, ADR 0003).
 * The ONE place team/roster data enters the app. Today it builds teams from the
 * generator; later a Supabase-backed store can satisfy the same interface
 * (getTeams / getTeam / getLeagueRules) without any screen changing.
 */
import { GREEK_SUPER_LEAGUE } from './league';
import { generateRoster } from './generator';

// Build every club's full team once (generated rosters are deterministic per slug).
const TEAMS = GREEK_SUPER_LEAGUE.clubs.map((club) => ({
  slug: club.slug,
  name: club.name,
  short: club.short,
  league: GREEK_SUPER_LEAGUE.id,
  colors: club.colors,
  rules: GREEK_SUPER_LEAGUE.rules,
  roster: generateRoster(club),
}));

const BY_SLUG = Object.fromEntries(TEAMS.map((t) => [t.slug, t]));

export const DEFAULT_TEAM_SLUG = TEAMS[0].slug;

// Lightweight list for pickers (no roster payload).
export function getTeams() {
  return TEAMS.map(({ slug, name, short, league, colors }) => ({ slug, name, short, league, colors }));
}

// Full team (with roster) for the board and quiz.
export function getTeam(slug) {
  return BY_SLUG[slug] || BY_SLUG[DEFAULT_TEAM_SLUG];
}

export function getLeagueRules() {
  return GREEK_SUPER_LEAGUE.rules;
}
