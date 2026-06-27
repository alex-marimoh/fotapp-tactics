/*
 * Side-effect-free league and club metadata (ADR 0003).
 * Safe to import on Supabase boot paths — no roster generation.
 */
import { GREEK_SUPER_LEAGUE } from './league';

export const DEFAULT_TEAM_SLUG = GREEK_SUPER_LEAGUE.clubs[0].slug;

export function getLeagueRules() {
  return GREEK_SUPER_LEAGUE.rules;
}

/** @param {typeof GREEK_SUPER_LEAGUE.clubs[number]} club */
export function clubMeta(club) {
  return {
    slug: club.slug,
    name: club.name,
    short: club.short,
    league: GREEK_SUPER_LEAGUE.id,
    colors: club.colors,
  };
}

export function getClubs() {
  return GREEK_SUPER_LEAGUE.clubs;
}

/** @param {string} slug */
export function getClubBySlug(slug) {
  return GREEK_SUPER_LEAGUE.clubs.find((c) => c.slug === slug)
    ?? GREEK_SUPER_LEAGUE.clubs.find((c) => c.slug === DEFAULT_TEAM_SLUG);
}

export function getTeamsMeta() {
  return GREEK_SUPER_LEAGUE.clubs.map(clubMeta);
}
