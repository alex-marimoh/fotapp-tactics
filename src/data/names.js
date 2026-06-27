/*
 * Name + nationality pools for the roster generator (see docs/design-user-management.md §1).
 * Surnames are grouped by linguistic region; each nationality maps to a region pool.
 * Nothing here is "real" — it's plausible filler so generated squads read like football squads.
 */

// --- surname pools, by region ----------------------------------------------
export const SURNAMES = {
  greek: [
    'Papadopoulos', 'Mihalakis', 'Karras', 'Papadakis', 'Vlachos', 'Samaras', 'Tzavellas',
    'Fortounis', 'Mantalos', 'Giannakopoulos', 'Kapetanos', 'Lymperopoulos', 'Tziolis',
    'Stafylidis', 'Bakasetas', 'Kourbelis', 'Retsos', 'Mavropanos', 'Galanopoulos', 'Masouras',
    'Androutsos', 'Siopis', 'Douvikas', 'Pavlidis', 'Limnios', 'Kotsiras', 'Ioannidis', 'Tsimikas',
    'Vagiannidis', 'Chatzigiovanis', 'Kyriakopoulos', 'Athanasiadis', 'Konstantelias', 'Zafeiris',
    'Kourbelis', 'Roditis', 'Manolas', 'Sokratis', 'Tsoukalas', 'Papastathopoulos',
  ],
  romance: [
    'García', 'Martínez', 'López', 'Rodríguez', 'Fernández', 'Gómez', 'Silva', 'Santos', 'Pereira',
    'Costa', 'Oliveira', 'Souza', 'Ramos', 'Torres', 'Vargas', 'Castro', 'Herrera', 'Núñez',
    'Cardoso', 'Moreno', 'Suárez', 'Cabral', 'Mendes', 'Rojas', 'Rossi', 'Russo', 'Esposito',
    'Romano', 'Conti', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Fonseca', 'Vidal',
  ],
  french: [
    'Martin', 'Bernard', 'Dubois', 'Diallo', 'Traoré', 'Koné', 'Diop', 'Mendy', 'Sarr', 'Camara',
    'Fofana', 'Cissé', 'Ndiaye', 'Bamba', 'Lefebvre', 'Moreau', 'Girard', 'Benali', 'Hakimi',
    'Ziyech', 'Aubameyang', 'Lacroix', 'Thuram', 'Konaté', 'Dembélé',
  ],
  germanic: [
    'Müller', 'Schmidt', 'Bakker', 'de Jong', 'van Dijk', 'Janssen', 'Eriksson', 'Larsson',
    'Nielsen', 'Hansen', 'Andersen', 'Berg', 'Lindqvist', 'Achterberg', 'Vermeer', 'Sørensen',
    'Schäfer', 'Wagner', 'Forsberg', 'Olsen', 'de Vries', 'Bergström', 'Hofmann', 'Kruse',
  ],
  slavic: [
    'Kovač', 'Petrović', 'Nowak', 'Wójcik', 'Marković', 'Jovanović', 'Horvat', 'Novák', 'Popescu',
    'Ivanov', 'Stoyanov', 'Dimitrov', 'Kowalski', 'Zieliński', 'Vasilev', 'Radić', 'Babić',
    'Šimić', 'Levchenko', 'Tomić', 'Modrić', 'Kovačić', 'Vlašić', 'Stankovic',
  ],
  english: [
    'Smith', 'Brennan', 'Murphy', 'Kelly', 'O’Brien', 'Walsh', 'Johnson', 'Williams', 'Brown',
    'Carter', 'Hughes', 'Doyle', 'Ryan', 'Gallagher', 'Fitzgerald', 'Connolly', 'Mitchell', 'Reid',
  ],
  african: [
    'Okonkwo', 'Owusu', 'Mensah', 'Adeyemi', 'Eze', 'Osei', 'Boateng', 'Asante', 'Salah', 'Elneny',
    'Hassan', 'Okafor', 'Nwankwo', 'Appiah', 'Acheampong', 'Mohamed', 'Aidoo', 'Partey', 'Kudus',
  ],
  asian: [
    'Tanaka', 'Sato', 'Suzuki', 'Yamamoto', 'Nakamura', 'Kim', 'Lee', 'Park', 'Son', 'Watanabe',
    'Ito', 'Kobayashi', 'Choi', 'Jung', 'Kang', 'Mitoma', 'Endo', 'Hwang',
  ],
};

// nationality (ISO-ish code) -> surname pool
const NAT_TO_POOL = {
  GR: 'greek',
  ES: 'romance', PT: 'romance', IT: 'romance', BR: 'romance', AR: 'romance', CO: 'romance',
  UY: 'romance', CL: 'romance', MX: 'romance',
  FR: 'french', SN: 'french', CI: 'french', CM: 'french', MA: 'french', DZ: 'french', TN: 'french',
  DE: 'germanic', AT: 'germanic', NL: 'germanic', BE: 'germanic', DK: 'germanic', SE: 'germanic',
  NO: 'germanic', CH: 'germanic', IS: 'germanic',
  PL: 'slavic', HR: 'slavic', RS: 'slavic', CZ: 'slavic', BG: 'slavic', RO: 'slavic', UA: 'slavic',
  SK: 'slavic', SI: 'slavic',
  IE: 'english', US: 'english', GB: 'english', AU: 'english',
  NG: 'african', GH: 'african', EG: 'african', KE: 'african', ZA: 'african',
  JP: 'asian', KR: 'asian',
};

export function poolForNat(nat) {
  return SURNAMES[NAT_TO_POOL[nat] || 'romance'];
}

// EU/EEA member states we draw "eu"-category players from (reg derives from this).
export const EU_NATIONS = [
  'FR', 'DE', 'ES', 'IT', 'PT', 'NL', 'BE', 'SE', 'DK', 'PL', 'HR', 'IE', 'AT', 'RO', 'BG', 'CZ',
  'SK', 'SI', 'NO',
];

// Non-EU nations we draw "noneu"-category players from.
export const NONEU_NATIONS = [
  'BR', 'AR', 'NG', 'GH', 'SN', 'RS', 'JP', 'KR', 'US', 'CO', 'EG', 'MA', 'CI', 'CM', 'UY', 'CL',
  'UA', 'AU',
];

// Registration category derived from nationality (ADR 0009): Greek = homegrown,
// EU/EEA = eu, everything else = non-EU. The admin page can override this per player.
export function regForNat(nat) {
  if (nat === 'GR') return 'home';
  return EU_NATIONS.includes(nat) ? 'eu' : 'noneu';
}

// All nationalities the admin picker offers, grouped by category.
export const ALL_NATIONS = ['GR', ...EU_NATIONS, ...NONEU_NATIONS];
