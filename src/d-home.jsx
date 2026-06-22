import React from 'react';
import { KitShirt, Stars, Flag, SQUAD, DEMOGRAPHICS, LOANS, NEWS, DEPTH_CHARTS } from './shared';

/**
 * Combined "home" / squad-planning dashboard.
 * Telemetry light/blue theme. The pitch is one supporting panel that shares the
 * screen with the roster, depth & gaps, player news and demographics/loans.
 */

const PITCH_ASPECT = 68 / 105;

const C = {
  bg: '#f6f7f9', surface: '#ffffff', surface2: '#f0f2f5',
  line: '#e3e6eb', line2: '#d4d8df',
  text: '#0a1124', text2: '#3b4254', muted: '#6c7384', faint: '#9aa0ad',
  accent: '#0040ff', accentSoft: '#dde4ff',
  pitch: '#fafbfc', pitchLine: '#0a1124',
  good: '#057a55', goodSoft: '#d6f1e6',
  warn: '#b45309', warnSoft: '#fdeccd',
  bad: '#c2410c', badSoft: '#fde0d2',
};

const MONO = '"JetBrains Mono", ui-monospace, monospace';

// Position display order + readable labels for the depth/gaps panel.
const POS_ORDER = ['GK', 'RB', 'CB', 'CB2', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];
const POS_LABEL = {
  GK: 'Goalkeeper', RB: 'Right back', CB: 'Centre back', CB2: 'Centre back (2)',
  LB: 'Left back', DM: 'Defensive mid', CM: 'Central mid', AM: 'Attacking mid',
  RW: 'Right wing', LW: 'Left wing', ST: 'Striker',
};

// Squad members carrying a knock (drives the FIT/KNOCK status pill + news).
const INJURED = new Set(['F. Brennan']);

const starterNums = new Set(
  Object.values(DEPTH_CHARTS).map(dc => dc.starter && dc.starter.num).filter(Boolean),
);

function statusFor(player) {
  if (INJURED.has(player.name)) return { label: 'KNOCK', tone: 'warn' };
  return { label: 'FIT', tone: 'good' };
}

function HomeBoard() {
  return (
    <div style={{
      width: '100%', height: '100vh', minHeight: '100vh', background: C.bg, color: C.text,
      fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
      fontSize: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <HomeTopBar />
      <SummaryStrip />
      <div style={{
        flex: 1, minHeight: 0, display: 'grid',
        gridTemplateColumns: '380px 1fr 360px', gap: 12, padding: 12,
        background: C.bg, boxSizing: 'border-box',
      }}>
        <RosterCard />
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12, minHeight: 0 }}>
          <FormationCard />
          <DepthGapsCard />
        </div>
        <div style={{ display: 'grid', gridTemplateRows: '1fr auto auto', gap: 12, minHeight: 0 }}>
          <NewsCard />
          <DemographicsCard />
          <LoansCard />
        </div>
      </div>
    </div>
  );
}

function HomeTopBar() {
  return (
    <div style={{
      height: 48, background: C.surface, borderBottom: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 20, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 22, height: 22, background: C.accent, borderRadius: 4, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>F</div>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>fotapp</span>
      </div>
      <nav style={{ display: 'flex', gap: 4 }}>
        {['Home', 'Squad', 'Tactics', 'Schedule', 'Transfers'].map((t, i) => (
          <span key={t} style={{
            padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: i === 0 ? 600 : 500,
            color: i === 0 ? C.accent : C.muted, background: i === 0 ? C.accentSoft : 'transparent', cursor: 'pointer',
          }}>{t}</span>
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: C.muted, fontFamily: MONO }}>
        <span>NEXT</span>
        <span style={{ color: C.text, fontWeight: 600 }}>vs Olympiacos (H)</span>
        <span style={{ width: 1, height: 14, background: C.line2 }} />
        <span>SAT 18 OCT</span>
      </div>
    </div>
  );
}

function SummaryStrip() {
  const gaps = POS_ORDER.filter(k => (DEPTH_CHARTS[k]?.backups?.length ?? 0) === 0).length;
  const avg = (SQUAD.reduce((s, p) => s + p.rating, 0) / SQUAD.length).toFixed(1);
  const stats = [
    { label: 'Squad size', value: SQUAD.length },
    { label: 'Avg rating', value: avg, suffix: '★' },
    { label: 'Depth gaps', value: gaps, tone: gaps > 0 ? 'warn' : 'good' },
    { label: 'Nationalities', value: DEMOGRAPHICS.length },
    { label: 'Out on loan', value: LOANS.length },
  ];
  return (
    <div style={{
      display: 'flex', gap: 0, background: C.surface, borderBottom: `1px solid ${C.line}`,
      padding: '0 20px', flexShrink: 0,
    }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 28px 12px 0', marginRight: 28,
          borderRight: i < stats.length - 1 ? `1px solid ${C.line}` : 'none',
        }}>
          <span style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</span>
          <span style={{
            fontFamily: MONO, fontSize: 20, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
            color: s.tone === 'warn' ? C.warn : s.tone === 'good' ? C.good : C.text,
          }}>
            {s.value}{s.suffix && <span style={{ fontSize: 13, color: C.faint, marginLeft: 2 }}>{s.suffix}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function Card({ title, right, children, bodyStyle, scroll }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8,
      display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: `1px solid ${C.line}`, flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</span>
        {right && <span style={{ fontSize: 10, color: C.muted, fontFamily: MONO }}>{right}</span>}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: scroll ? 'auto' : 'visible', ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    good: { fg: C.good, bg: C.goodSoft },
    warn: { fg: C.warn, bg: C.warnSoft },
    bad: { fg: C.bad, bg: C.badSoft },
  };
  const c = map[status.tone] || map.good;
  return (
    <span style={{
      fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
      padding: '2px 6px', borderRadius: 3, color: c.fg, background: c.bg,
    }}>{status.label}</span>
  );
}

function RosterCard() {
  return (
    <Card title="Squad roster" right={`${SQUAD.length} players`} scroll>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ color: C.muted, fontSize: 10, fontFamily: MONO, letterSpacing: '0.06em', position: 'sticky', top: 0, background: C.surface, zIndex: 1 }}>
            <th style={th}>#</th>
            <th style={{ ...th, textAlign: 'left' }}>PLAYER</th>
            <th style={th}>POS</th>
            <th style={{ ...th, textAlign: 'left' }}>ROLE</th>
            <th style={{ ...th, textAlign: 'left' }}>RATING</th>
            <th style={{ ...th, textAlign: 'right' }}>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {SQUAD.map(p => {
            const starter = starterNums.has(p.num);
            return (
              <tr key={p.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td style={{ ...td, textAlign: 'center', fontFamily: MONO, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{p.num}</td>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Flag code={p.nat} />
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    {starter && <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: C.accent, background: C.accentSoft, padding: '1px 4px', borderRadius: 2, letterSpacing: '0.06em' }}>XI</span>}
                  </div>
                </td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, padding: '1px 5px', background: C.surface2, color: C.text2, borderRadius: 2 }}>{p.pos}</span>
                </td>
                <td style={{ ...td, color: C.muted, fontFamily: MONO, fontSize: 11 }}>{p.role}</td>
                <td style={td}><Stars value={p.rating} size={9} color={C.accent} empty={C.line2} /></td>
                <td style={{ ...td, textAlign: 'right' }}><StatusPill status={statusFor(p)} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

const th = { textAlign: 'center', fontWeight: 500, padding: '8px 10px', borderBottom: `1px solid ${C.line}`, whiteSpace: 'nowrap' };
const td = { padding: '7px 10px', verticalAlign: 'middle' };

function FormationCard() {
  const xi = React.useMemo(() => (
    Object.values(DEPTH_CHARTS)
      .map(dc => SQUAD.find(p => p.num === dc.starter?.num))
      .filter(Boolean)
  ), []);

  // Compact, supporting pitch — fixed modest height so it never dominates.
  const H = 300;
  const W = H * PITCH_ASPECT;
  const padX = 10, padY = 10;

  return (
    <Card title="Formation" right="4-3-3 DM">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}>
        <div style={{ position: 'relative', width: W, height: H }}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', background: C.pitch, border: `1px solid ${C.line}`, borderRadius: 6 }}>
            <defs>
              <pattern id="grid-home" width="18" height="18" patternUnits="userSpaceOnUse">
                <path d="M 18 0 L 0 0 0 18" fill="none" stroke={C.line} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#grid-home)" />
            <PitchLines W={W} H={H} pad={{ x: padX, y: padY }} />
          </svg>
          {xi.map(p => {
            const left = padX + ((p.x ?? 50) / 100) * (W - padX * 2);
            const top = padY + ((p.y ?? 50) / 100) * (H - padY * 2);
            const inj = INJURED.has(p.name);
            return (
              <div key={p.id} style={{
                position: 'absolute', left, top, transform: 'translate(-50%, -50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              }}>
                <div style={{ position: 'relative' }}>
                  <KitShirt size={20} variant="solid" primary={C.accent} secondary="#fff" stroke="rgba(0,0,0,.15)" />
                  {inj && <span style={{ position: 'absolute', top: -2, right: -3, width: 7, height: 7, borderRadius: '50%', background: C.warn, border: '1.5px solid #fff' }} />}
                </div>
                <span style={{ fontSize: 8, fontWeight: 600, color: C.text2, background: 'rgba(255,255,255,.82)', padding: '0 2px', borderRadius: 2, whiteSpace: 'nowrap' }}>
                  {p.name.split('. ').pop()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function PitchLines({ W, H, pad }) {
  const x0 = pad.x, x1 = W - pad.x, y0 = pad.y, y1 = H - pad.y;
  const cx = W / 2, cy = H / 2;
  const innerW = x1 - x0, innerH = y1 - y0;
  const boxW = innerW * (40.32 / 68);
  const boxH = innerH * (16.5 / 105);
  const sixW = innerW * (18.32 / 68);
  const sixH = innerH * (5.5 / 105);
  const cR = innerW * (9.15 / 68);
  return (
    <g fill="none" stroke={C.line2} strokeWidth="1">
      <rect x={x0} y={y0} width={innerW} height={innerH} />
      <line x1={x0} y1={cy} x2={x1} y2={cy} />
      <circle cx={cx} cy={cy} r={cR} />
      <circle cx={cx} cy={cy} r={1.5} fill={C.line2} />
      <rect x={cx - boxW / 2} y={y0} width={boxW} height={boxH} />
      <rect x={cx - sixW / 2} y={y0} width={sixW} height={sixH} />
      <rect x={cx - boxW / 2} y={y1 - boxH} width={boxW} height={boxH} />
      <rect x={cx - sixW / 2} y={y1 - sixH} width={sixW} height={sixH} />
    </g>
  );
}

function DepthGapsCard() {
  const gaps = POS_ORDER.filter(k => (DEPTH_CHARTS[k]?.backups?.length ?? 0) === 0).length;
  return (
    <Card title="Depth & gaps" right={gaps > 0 ? `${gaps} gap` : 'covered'} scroll>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {POS_ORDER.map(k => {
          const dc = DEPTH_CHARTS[k];
          if (!dc || !dc.starter) return null;
          const nBackups = dc.backups?.length ?? 0;
          const gap = nBackups === 0;
          return (
            <div key={k} style={{
              display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: 10,
              padding: '8px 16px', borderBottom: `1px solid ${C.line}`,
              background: gap ? C.warnSoft : 'transparent',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: gap ? C.warn : C.text }}>{k}</span>
                <span style={{ fontSize: 9, color: C.muted }}>{POS_LABEL[k]}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {dc.starter.name}
                </span>
                <span style={{ fontSize: 10, color: gap ? C.warn : C.muted }}>
                  {gap ? 'No backup — needs cover' : `${nBackups} backup${nBackups > 1 ? 's' : ''}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                <Dot filled />
                {Array.from({ length: 2 }).map((_, i) => <Dot key={i} filled={i < nBackups} />)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Dot({ filled }) {
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: filled ? C.accent : C.line2 }} />;
}

const TAG = {
  INJURY: { fg: C.bad, bg: C.badSoft }, TRANSFER: { fg: C.accent, bg: C.accentSoft },
  MATCH: { fg: '#1d4ed8', bg: '#dbeafe' }, BOARD: { fg: '#7c3aed', bg: '#ede9fe' },
  MEDIA: { fg: C.warn, bg: C.warnSoft }, YOUTH: { fg: C.good, bg: C.goodSoft },
};

function NewsCard() {
  return (
    <Card title="Player news" right={`${NEWS.length} items`} scroll>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {NEWS.map((n, i) => {
          const c = TAG[n.tag] || { fg: C.muted, bg: C.surface2 };
          return (
            <div key={i} style={{ padding: '12px 16px', borderBottom: i < NEWS.length - 1 ? `1px solid ${C.line}` : 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 3, color: c.fg, background: c.bg }}>{n.tag}</span>
                <span style={{ fontSize: 10, color: C.faint, fontFamily: MONO, marginLeft: 'auto' }}>{n.when || n.height}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{n.head}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45 }}>{n.body}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DemographicsCard() {
  const top = [...DEMOGRAPHICS].sort((a, b) => b.count - a.count).slice(0, 5);
  const max = Math.max(...top.map(d => d.count));
  return (
    <Card title="Demographics" right="22 senior">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '12px 16px' }}>
        {top.map(d => (
          <div key={d.code} style={{ display: 'grid', gridTemplateColumns: '18px 1fr auto', alignItems: 'center', gap: 10 }}>
            <Flag code={d.code} />
            <div style={{ position: 'relative', height: 16, display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, background: C.surface2, borderRadius: 3 }} />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(d.count / max) * 100}%`, background: d.code === 'GR' ? C.accent : C.accentSoft, borderRadius: 3 }} />
              <span style={{ position: 'relative', paddingLeft: 8, fontSize: 11, fontWeight: 500, color: d.code === 'GR' ? '#fff' : C.text }}>{d.name}</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{d.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LoansCard() {
  return (
    <Card title="Out on loan" right={`${LOANS.length}`}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {LOANS.map((l, i) => (
          <div key={l.name} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 8, padding: '9px 16px', borderBottom: i < LOANS.length - 1 ? `1px solid ${C.line}` : 'none' }}>
            <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, padding: '1px 5px', background: C.surface2, color: C.text2, borderRadius: 2 }}>{l.pos}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{l.name}</span>
              <span style={{ fontSize: 10, color: C.muted }}>→ {l.to}</span>
            </div>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: MONO }}>{l.until}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export { HomeBoard };
