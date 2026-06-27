/*
 * League definition: registration rule set + club metadata for the Greek Super League.
 * Real club names + plausible kit colours; rosters are generated (see generator.js).
 * `strength` (0..1) skews the rating distribution so the big clubs read stronger.
 */

// Registration quota rules (ADR 0009). Was the global LIMITS in squad-data; now lives on the league.
export const GREEK_SL_RULES = {
  noneu: { kind: 'max', value: 8 },
  home: { kind: 'min', value: 3 },
};

export const GREEK_SUPER_LEAGUE = {
  id: 'greek-super-league',
  name: 'Greek Super League',
  rules: GREEK_SL_RULES,
  clubs: [
    { slug: 'olympiacos',   name: 'Olympiacos',        short: 'OLY', colors: { primary: '#c8102e', secondary: '#ffffff' }, strength: 0.95 },
    { slug: 'paok',         name: 'PAOK',              short: 'PAO', colors: { primary: '#111111', secondary: '#ffffff' }, strength: 0.85 },
    { slug: 'aek-athens',   name: 'AEK Athens',        short: 'AEK', colors: { primary: '#f4d000', secondary: '#111111' }, strength: 0.84 },
    { slug: 'panathinaikos', name: 'Panathinaikos',    short: 'PAN', colors: { primary: '#0a7d3b', secondary: '#ffffff' }, strength: 0.82 },
    { slug: 'aris',         name: 'Aris',              short: 'ARI', colors: { primary: '#f7c600', secondary: '#111111' }, strength: 0.62 },
    { slug: 'ofi-crete',    name: 'OFI Crete',         short: 'OFI', colors: { primary: '#111111', secondary: '#ffffff' }, strength: 0.5 },
    { slug: 'atromitos',    name: 'Atromitos',         short: 'ATR', colors: { primary: '#1a3d8f', secondary: '#ffffff' }, strength: 0.52 },
    { slug: 'volos',        name: 'Volos',             short: 'VOL', colors: { primary: '#b01e2e', secondary: '#1a3d8f' }, strength: 0.46 },
    { slug: 'asteras',      name: 'Asteras Tripolis',  short: 'AST', colors: { primary: '#f7c600', secondary: '#1a3d8f' }, strength: 0.5 },
    { slug: 'panetolikos',  name: 'Panetolikos',       short: 'PAE', colors: { primary: '#b01e2e', secondary: '#0a7d3b' }, strength: 0.44 },
    { slug: 'lamia',        name: 'Lamia',             short: 'LAM', colors: { primary: '#111111', secondary: '#ffffff' }, strength: 0.4 },
    { slug: 'kallithea',    name: 'Kallithea',         short: 'KAL', colors: { primary: '#b01e2e', secondary: '#ffffff' }, strength: 0.4 },
    { slug: 'levadiakos',   name: 'Levadiakos',        short: 'LEV', colors: { primary: '#0a7d3b', secondary: '#ffffff' }, strength: 0.42 },
    { slug: 'panserraikos', name: 'Panserraikos',      short: 'PAN', colors: { primary: '#b01e2e', secondary: '#111111' }, strength: 0.38 },
  ],
};

export const LEAGUES = { [GREEK_SUPER_LEAGUE.id]: GREEK_SUPER_LEAGUE };

export function leagueRules(leagueId = GREEK_SUPER_LEAGUE.id) {
  return (LEAGUES[leagueId] || GREEK_SUPER_LEAGUE).rules;
}
