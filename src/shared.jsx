import React from 'react';

const SQUAD = [
  { id: 'p1',  num: 1,  name: 'V. Mihalakis',    pos: 'GK',  role: 'SK',  rating: 4, nat: 'GR', x: 50,  y: 92, kit: 'home' },
  { id: 'p2',  num: 2,  name: 'L. Owusu',        pos: 'RB',  role: 'WBA', rating: 4, nat: 'GH', x: 82,  y: 72, kit: 'home' },
  { id: 'p3',  num: 4,  name: 'M. Karras',       pos: 'CB',  role: 'BPD', rating: 5, nat: 'GR', x: 62,  y: 78, kit: 'home' },
  { id: 'p4',  num: 5,  name: 'D. Achterberg',   pos: 'CB',  role: 'CD',  rating: 4, nat: 'NL', x: 38,  y: 78, kit: 'home' },
  { id: 'p5',  num: 3,  name: 'A. Petrović',     pos: 'LB',  role: 'WBS', rating: 3, nat: 'RS', x: 18,  y: 72, kit: 'home' },
  { id: 'p6',  num: 6,  name: 'T. Sælen',        pos: 'DM',  role: 'DLP', rating: 4, nat: 'NO', x: 50,  y: 60, kit: 'home' },
  { id: 'p7',  num: 8,  name: 'I. Papadakis',    pos: 'CM',  role: 'PCM', rating: 4, nat: 'GR', x: 68,  y: 48, kit: 'home' },
  { id: 'p8',  num: 10, name: 'R. Vasconcelos',  pos: 'AM',  role: 'AP',  rating: 5, nat: 'PT', x: 32,  y: 48, kit: 'home' },
  { id: 'p9',  num: 7,  name: 'K. Aritz',        pos: 'RW',  role: 'WFD', rating: 4, nat: 'ES', x: 80,  y: 28, kit: 'home' },
  { id: 'p10', num: 11, name: 'J. Diatta',       pos: 'LW',  role: 'IF',  rating: 4, nat: 'SN', x: 20,  y: 28, kit: 'home' },
  { id: 'p11', num: 9,  name: 'F. Brennan',      pos: 'ST',  role: 'CF',  rating: 5, nat: 'IE', x: 50,  y: 16, kit: 'home' },

  // Bench / reserves — extra bodies for depth-chart & roster testing
  { id: 'p12', num: 12, name: 'M. Okonkwo',      pos: 'GK', role: 'GK',  rating: 3, nat: 'NG', age: 22, x: 44, y: 90, kit: 'home' },
  { id: 'p13', num: 13, name: 'H. Lindqvist',    pos: 'RB', role: 'WB',  rating: 3, nat: 'SE', age: 21, x: 76, y: 76, kit: 'home' },
  { id: 'p14', num: 14, name: 'S. Benali',       pos: 'CB', role: 'CD',  rating: 4, nat: 'FR', age: 24, x: 55, y: 82, kit: 'home' },
  { id: 'p15', num: 15, name: 'J. Ortíz',        pos: 'DM', role: 'BWM', rating: 3, nat: 'AR', age: 26, x: 42, y: 62, kit: 'home' },
  { id: 'p16', num: 16, name: 'Y. Tanaka',       pos: 'CM', role: 'BBM', rating: 4, nat: 'JP', age: 23, x: 58, y: 52, kit: 'home' },
  { id: 'p17', num: 17, name: 'L. Forsberg',     pos: 'AM', role: 'AP',  rating: 4, nat: 'SE', age: 27, x: 35, y: 42, kit: 'home' },
  { id: 'p18', num: 18, name: 'M. Dubois',       pos: 'RW', role: 'IW',  rating: 3, nat: 'BE', age: 20, x: 74, y: 34, kit: 'home' },
  { id: 'p19', num: 19, name: 'T. Williams',     pos: 'LW', role: 'W',   rating: 3, nat: 'WI', age: 19, x: 26, y: 34, kit: 'home' },
  { id: 'p20', num: 20, name: 'K. Mensah',       pos: 'ST', role: 'TM',  rating: 4, nat: 'GH', age: 25, x: 62, y: 18, kit: 'home' },
  { id: 'p21', num: 22, name: 'V. Costa',        pos: 'LB', role: 'WB',  rating: 3, nat: 'BR', age: 22, x: 14, y: 76, kit: 'home' },
];

const DEMOGRAPHICS = [
  { code: 'GR', name: 'Greek',      count: 12 },
  { code: 'PT', name: 'Portuguese', count: 4 },
  { code: 'ES', name: 'Spanish',    count: 3 },
  { code: 'NL', name: 'Dutch',      count: 2 },
  { code: 'NO', name: 'Norwegian',  count: 2 },
  { code: 'SN', name: 'Senegalese', count: 1 },
  { code: 'GH', name: 'Ghanaian',   count: 2 },
  { code: 'RS', name: 'Serbian',    count: 1 },
  { code: 'IE', name: 'Irish',      count: 1 },
  { code: 'FR', name: 'French',     count: 1 },
  { code: 'SE', name: 'Swedish',    count: 2 },
  { code: 'JP', name: 'Japanese',   count: 1 },
  { code: 'NG', name: 'Nigerian',   count: 1 },
  { code: 'AR', name: 'Argentine',  count: 1 },
  { code: 'BE', name: 'Belgian',    count: 1 },
  { code: 'WI', name: 'Welsh',      count: 1 },
  { code: 'BR', name: 'Brazilian',  count: 1 },
];

const LOANS = [
  { name: 'C. Voutsinas',  pos: 'AM', to: 'Levadiakos', until: 'Jun 27' },
  { name: 'P. Anastasiou', pos: 'CB', to: 'Atromitos',  until: 'Jun 26' },
  { name: 'S. Linde',      pos: 'GK', to: 'Lamia',      until: 'Jan 27' },
  { name: 'M. Diallo',     pos: 'ST', to: 'Volos NFC',  until: 'Jun 26' },
];

const NEWS = [
  { tag: 'INJURY',   when: 'Today · 09:14',     head: 'Brennan picks up minor knock',               body: 'Talisman striker limped off in training. Physio says 3–5 day assessment.' },
  { tag: 'TRANSFER', when: 'Today · 07:00',     head: 'Atromitos enquire about Voutsinas',          body: 'Loan club triggers option-to-buy talks. Director wants to extend instead.' },
  { tag: 'MATCH',    when: 'Yesterday · 22:38', head: 'Player ratings vs PAOK',                     body: 'Vasconcelos 8.4 — assists, 92% pass completion. MOTM.' },
  { tag: 'BOARD',    when: 'Yesterday · 16:02', head: 'Quarterly review scheduled',                 body: 'Board wants update on youth pathway and wage budget for January.' },
  { tag: 'MEDIA',    height: 'Mon · 11:20',     head: 'Press: "Karras a generational defender"',   body: 'Local press piece glowing about your captain. Morale +.' },
  { tag: 'YOUTH',    when: 'Mon · 08:00',       head: 'U19 win 3–1 at Olympiacos',                 body: 'Kostas Voulgaris brace. Scout flagged for first-team integration review.' },
];

const getInitialDepthCharts = () => {
  const depthCharts = {
    GK: { starter: null, backups: [] },
    RB: { starter: null, backups: [] },
    CB: { starter: null, backups: [] },
    CB2: { starter: null, backups: [] },
    LB: { starter: null, backups: [] },
    DM: { starter: null, backups: [] },
    CM: { starter: null, backups: [] },
    AM: { starter: null, backups: [] },
    RW: { starter: null, backups: [] },
    LW: { starter: null, backups: [] },
    ST: { starter: null, backups: [] },
  };

  const usedNums = new Set();

  // First pass: assign starters
  SQUAD.forEach(p => {
    let position = p.pos;
    // If it's a CB and CB position is already filled, use CB2
    if (p.pos === 'CB' && depthCharts['CB'].starter && !depthCharts['CB2'].starter) {
      position = 'CB2';
    }

    if (depthCharts[position] && !depthCharts[position].starter) {
      depthCharts[position].starter = { name: p.name, num: p.num, rating: p.rating, age: p.age };
      usedNums.add(p.num);
    }
  });

  // Second pass: assign remaining players as backups
  SQUAD.forEach(p => {
    if (depthCharts[p.pos] && !usedNums.has(p.num)) {
      depthCharts[p.pos].backups.push({ name: p.name, num: p.num, rating: p.rating, age: p.age });
      usedNums.add(p.num);
    }
  });

  return depthCharts;
};

const DEPTH_CHARTS = getInitialDepthCharts();

function KitShirt({ size = 36, variant = 'stripes', primary = '#0b3b6f', secondary = '#ffffff', stroke = 'rgba(0,0,0,.25)' }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <clipPath id={`kit-${id}`}>
          <path d="M8 8 L14 5 C14 9 18 11 20 11 C22 11 26 9 26 5 L32 8 L34 16 L29 17 L29 34 L11 34 L11 17 L6 16 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#kit-${id})`}>
        <rect x="0" y="0" width="40" height="40" fill={primary} />
        {variant === 'stripes' && [0,1,2,3].map(i => (
          <rect key={i} x={9 + i*5} y="0" width="2.5" height="40" fill={secondary} opacity="0.85" />
        ))}
        {variant === 'sash' && (
          <path d="M-5 30 L45 0 L45 8 L-5 38 Z" fill={secondary} opacity="0.9" />
        )}
        {variant === 'hoops' && [0,1,2,3].map(i => (
          <rect key={i} x="0" y={6 + i*8} width="40" height="3" fill={secondary} opacity="0.85" />
        ))}
        {variant === 'solid' && (
          <path d="M14 5 C14 9 18 11 20 11 C22 11 26 9 26 5 L24 6 L20 8 L16 6 Z" fill={secondary} opacity="0.4" />
        )}
      </g>
      <path d="M8 8 L14 5 C14 9 18 11 20 11 C22 11 26 9 26 5 L32 8 L34 16 L29 17 L29 34 L11 34 L11 17 L6 16 Z"
        fill="none" stroke={stroke} strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

function Stars({ value = 0, max = 5, size = 9, color = '#f6c451', empty = 'rgba(255,255,255,.2)', gap = 1 }) {
  return (
    <span style={{ display: 'inline-flex', gap, lineHeight: 0 }}>
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 10 10" style={{ display: 'block' }}>
          <path d="M5 .5 L6.3 3.7 L9.7 4 L7.1 6.2 L7.9 9.5 L5 7.8 L2.1 9.5 L2.9 6.2 L.3 4 L3.7 3.7 Z"
            fill={i < value ? color : empty} />
        </svg>
      ))}
    </span>
  );
}

const FLAG_COLORS = {
  GR: ['#0d5eaf', '#fff'], PT: ['#046a38', '#da291c'], ES: ['#aa151b', '#f1bf00'],
  NL: ['#ae1c28', '#fff'], NO: ['#ba0c2f', '#00205b'], SN: ['#00853f', '#fdef42'],
  GH: ['#ce1126', '#fcd116'], RS: ['#c6363c', '#0c4076'], IE: ['#169b62', '#ff883e'],
  NG: ['#008751', '#fff'], FR: ['#002395', '#fff'], SE: ['#006aa7', '#fecc00'],
  AR: ['#74acdf', '#fff'], JP: ['#fff', '#bc002d'], BE: ['#000', '#fdda24'],
  WI: ['#00ab66', '#fff'], BR: ['#009c3b', '#ffdf00'],
};

function Flag({ code, w = 14, h = 10, radius = 1.5 }) {
  const [a, b] = FLAG_COLORS[code] || ['#999', '#666'];
  return (
    <svg width={w} height={h} viewBox="0 0 14 10" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="0" y="0" width="14" height="10" rx={radius} fill={a} />
      <rect x="9" y="0" width="5" height="10" rx={0} fill={b} />
      <rect x="0" y="0" width="14" height="10" rx={radius} fill="none" stroke="rgba(0,0,0,.15)" strokeWidth="0.5" />
    </svg>
  );
}

export { SQUAD, DEMOGRAPHICS, LOANS, NEWS, DEPTH_CHARTS, KitShirt, Stars, Flag };
