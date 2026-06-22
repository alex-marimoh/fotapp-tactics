import React from 'react';
import { Stars, Flag, SQUAD, DEMOGRAPHICS, LOANS, NEWS, DEPTH_CHARTS } from './shared';

/**
 * Home / squad-planning dashboard — 5 layout explorations.
 * Shared Telemetry light/blue theme. The pitch is always present but never the
 * dominant element. Routed via ?board=home&v=1..5.
 */

const PITCH_ASPECT = 68 / 105;
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const FONT = '"Inter", -apple-system, system-ui, sans-serif';

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

const POS_ORDER = ['GK', 'RB', 'CB', 'CB2', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];
const POS_LABEL = {
  GK: 'Goalkeeper', RB: 'Right back', CB: 'Centre back', CB2: 'Centre back (2)',
  LB: 'Left back', DM: 'Defensive mid', CM: 'Central mid', AM: 'Attacking mid',
  RW: 'Right wing', LW: 'Left wing', ST: 'Striker',
};
const LINE_OF = { GK: 'GK', RB: 'DEF', CB: 'DEF', LB: 'DEF', DM: 'MID', CM: 'MID', AM: 'MID', RW: 'FWD', LW: 'FWD', ST: 'FWD' };
const LINE_LABEL = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', FWD: 'Forwards' };

const INJURED = new Set(['F. Brennan']);
const starterNums = new Set(Object.values(DEPTH_CHARTS).map(dc => dc.starter && dc.starter.num).filter(Boolean));

function statusFor(p) {
  return INJURED.has(p.name) ? { label: 'KNOCK', tone: 'warn' } : { label: 'FIT', tone: 'good' };
}
function gapCount() {
  return POS_ORDER.filter(k => (DEPTH_CHARTS[k]?.backups?.length ?? 0) === 0).length;
}
function getXI() {
  return Object.values(DEPTH_CHARTS)
    .map(dc => SQUAD.find(p => p.num === dc.starter?.num))
    .filter(Boolean);
}

/* ------------------------------- primitives ------------------------------- */

function Shell({ children }) {
  return (
    <div style={{
      width: '100%', height: '100vh', minHeight: '100vh', background: C.bg, color: C.text,
      fontFamily: FONT, fontSize: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>{children}</div>
  );
}

function TopBar({ active = 'Home' }) {
  return (
    <div style={{ height: 48, background: C.surface, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 20, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 22, height: 22, background: C.accent, borderRadius: 4, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>F</div>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>fotapp</span>
      </div>
      <nav style={{ display: 'flex', gap: 4 }}>
        {['Home', 'Squad', 'Tactics', 'Schedule', 'Transfers'].map(t => (
          <span key={t} style={{ padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: t === active ? 600 : 500, color: t === active ? C.accent : C.muted, background: t === active ? C.accentSoft : 'transparent', cursor: 'pointer' }}>{t}</span>
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: C.muted, fontFamily: MONO }}>
        <span>NEXT</span><span style={{ color: C.text, fontWeight: 600 }}>vs Olympiacos (H)</span>
        <span style={{ width: 1, height: 14, background: C.line2 }} /><span>SAT 18 OCT</span>
      </div>
    </div>
  );
}

function SummaryStrip() {
  const gaps = gapCount();
  const avg = (SQUAD.reduce((s, p) => s + p.rating, 0) / SQUAD.length).toFixed(1);
  const stats = [
    { label: 'Squad size', value: SQUAD.length },
    { label: 'Avg rating', value: avg, suffix: '★' },
    { label: 'Depth gaps', value: gaps, tone: gaps > 0 ? 'warn' : 'good' },
    { label: 'Nationalities', value: DEMOGRAPHICS.length },
    { label: 'Out on loan', value: LOANS.length },
  ];
  return (
    <div style={{ display: 'flex', background: C.surface, borderBottom: `1px solid ${C.line}`, padding: '0 20px', flexShrink: 0 }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 28px 12px 0', marginRight: 28, borderRight: i < stats.length - 1 ? `1px solid ${C.line}` : 'none' }}>
          <span style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</span>
          <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: s.tone === 'warn' ? C.warn : s.tone === 'good' ? C.good : C.text }}>
            {s.value}{s.suffix && <span style={{ fontSize: 13, color: C.faint, marginLeft: 2 }}>{s.suffix}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function Card({ title, right, action, children, scroll, bodyStyle, style }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', ...style }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</span>
          {action || (right && <span style={{ fontSize: 10, color: C.muted, fontFamily: MONO }}>{right}</span>)}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflowY: scroll ? 'auto' : 'visible', ...bodyStyle }}>{children}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = { good: { fg: C.good, bg: C.goodSoft }, warn: { fg: C.warn, bg: C.warnSoft }, bad: { fg: C.bad, bg: C.badSoft } };
  const c = map[status.tone] || map.good;
  return <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 3, color: c.fg, background: c.bg }}>{status.label}</span>;
}

const th = { textAlign: 'center', fontWeight: 500, padding: '8px 10px', borderBottom: `1px solid ${C.line}`, whiteSpace: 'nowrap' };
const td = { padding: '7px 10px', verticalAlign: 'middle' };

function RosterTable({ compact }) {
  const rows = compact ? SQUAD.filter(p => starterNums.has(p.num)) : SQUAD;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ color: C.muted, fontSize: 10, fontFamily: MONO, letterSpacing: '0.06em', position: 'sticky', top: 0, background: C.surface, zIndex: 1 }}>
          <th style={th}>#</th>
          <th style={{ ...th, textAlign: 'left' }}>PLAYER</th>
          <th style={th}>POS</th>
          {!compact && <th style={{ ...th, textAlign: 'left' }}>ROLE</th>}
          <th style={{ ...th, textAlign: 'left' }}>RATING</th>
          <th style={{ ...th, textAlign: 'right' }}>STATUS</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(p => (
          <tr key={p.id} style={{ borderBottom: `1px solid ${C.line}` }}>
            <td style={{ ...td, textAlign: 'center', fontFamily: MONO, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{p.num}</td>
            <td style={td}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flag code={p.nat} /><span style={{ fontWeight: 500 }}>{p.name}</span>
                {starterNums.has(p.num) && <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: C.accent, background: C.accentSoft, padding: '1px 4px', borderRadius: 2, letterSpacing: '0.06em' }}>XI</span>}
              </div>
            </td>
            <td style={{ ...td, textAlign: 'center' }}><span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, padding: '1px 5px', background: C.surface2, color: C.text2, borderRadius: 2 }}>{p.pos}</span></td>
            {!compact && <td style={{ ...td, color: C.muted, fontFamily: MONO, fontSize: 11 }}>{p.role}</td>}
            <td style={td}><Stars value={p.rating} size={9} color={C.accent} empty={C.line2} /></td>
            <td style={{ ...td, textAlign: 'right' }}><StatusPill status={statusFor(p)} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RosterGrouped() {
  const byLine = { GK: [], DEF: [], MID: [], FWD: [] };
  SQUAD.forEach(p => { (byLine[LINE_OF[p.pos]] || byLine.MID).push(p); });
  Object.values(byLine).forEach(arr => arr.sort((a, b) => (starterNums.has(b.num) - starterNums.has(a.num)) || (b.rating - a.rating)));
  return (
    <div>
      {['GK', 'DEF', 'MID', 'FWD'].map(line => (
        <div key={line}>
          <div style={{ position: 'sticky', top: 0, background: C.surface2, padding: '6px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.line}`, zIndex: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.text2 }}>{LINE_LABEL[line].toUpperCase()}</span>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: MONO }}>{byLine[line].length}</span>
          </div>
          {byLine[line].map(p => {
            const starter = starterNums.has(p.num);
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto auto', alignItems: 'center', gap: 10, padding: '8px 16px', borderBottom: `1px solid ${C.line}`, background: starter ? 'rgba(0,64,255,.03)' : 'transparent' }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted, textAlign: 'center' }}>{p.num}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Flag code={p.nat} /><span style={{ fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: C.muted }}>{p.pos}</span>
                  {starter && <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: C.accent, background: C.accentSoft, padding: '1px 4px', borderRadius: 2 }}>XI</span>}
                </div>
                <Stars value={p.rating} size={9} color={C.accent} empty={C.line2} />
                <StatusPill status={statusFor(p)} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Pitch({ W, H, horizontal, shirt = 20 }) {
  const padX = 10, padY = 10;
  const xi = getXI();
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', background: C.pitch, border: `1px solid ${C.line}`, borderRadius: 6 }}>
        <defs>
          <pattern id={`g-${horizontal ? 'h' : 'v'}`} width="18" height="18" patternUnits="userSpaceOnUse">
            <path d="M 18 0 L 0 0 0 18" fill="none" stroke={C.line} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#g-${horizontal ? 'h' : 'v'})`} />
        {horizontal ? <PitchLinesH W={W} H={H} pad={{ x: padX, y: padY }} /> : <PitchLinesV W={W} H={H} pad={{ x: padX, y: padY }} />}
      </svg>
      {xi.map(p => {
        const x = p.x ?? 50, y = p.y ?? 50;
        const left = horizontal ? padX + ((100 - y) / 100) * (W - padX * 2) : padX + (x / 100) * (W - padX * 2);
        const top = horizontal ? padY + (x / 100) * (H - padY * 2) : padY + (y / 100) * (H - padY * 2);
        const inj = INJURED.has(p.name);
        return (
          <div key={p.id} style={{ position: 'absolute', left, top, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <div style={{ position: 'relative', width: shirt, height: shirt, borderRadius: '50%', background: C.accent, border: '2px solid #fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: shirt * 0.42, fontWeight: 700, fontFamily: MONO }}>
              {p.num}
              {inj && <span style={{ position: 'absolute', top: -2, right: -3, width: 7, height: 7, borderRadius: '50%', background: C.warn, border: '1.5px solid #fff' }} />}
            </div>
            <span style={{ fontSize: 8, fontWeight: 600, color: C.text2, background: 'rgba(255,255,255,.82)', padding: '0 2px', borderRadius: 2, whiteSpace: 'nowrap' }}>{p.name.split('. ').pop()}</span>
          </div>
        );
      })}
    </div>
  );
}

function PitchLinesV({ W, H, pad }) {
  const x0 = pad.x, x1 = W - pad.x, y0 = pad.y, y1 = H - pad.y;
  const cx = W / 2, cy = H / 2, iW = x1 - x0, iH = y1 - y0;
  const boxW = iW * (40.32 / 68), boxH = iH * (16.5 / 105), sixW = iW * (18.32 / 68), sixH = iH * (5.5 / 105), cR = iW * (9.15 / 68);
  return (
    <g fill="none" stroke={C.line2} strokeWidth="1">
      <rect x={x0} y={y0} width={iW} height={iH} />
      <line x1={x0} y1={cy} x2={x1} y2={cy} />
      <circle cx={cx} cy={cy} r={cR} /><circle cx={cx} cy={cy} r={1.5} fill={C.line2} />
      <rect x={cx - boxW / 2} y={y0} width={boxW} height={boxH} /><rect x={cx - sixW / 2} y={y0} width={sixW} height={sixH} />
      <rect x={cx - boxW / 2} y={y1 - boxH} width={boxW} height={boxH} /><rect x={cx - sixW / 2} y={y1 - sixH} width={sixW} height={sixH} />
    </g>
  );
}

function PitchLinesH({ W, H, pad }) {
  const x0 = pad.x, x1 = W - pad.x, y0 = pad.y, y1 = H - pad.y;
  const cx = W / 2, cy = H / 2, iW = x1 - x0, iH = y1 - y0;
  const boxH = iH * (40.32 / 68), boxW = iW * (16.5 / 105), sixH = iH * (18.32 / 68), sixW = iW * (5.5 / 105), cR = iH * (9.15 / 68);
  return (
    <g fill="none" stroke={C.line2} strokeWidth="1">
      <rect x={x0} y={y0} width={iW} height={iH} />
      <line x1={cx} y1={y0} x2={cx} y2={y1} />
      <circle cx={cx} cy={cy} r={cR} /><circle cx={cx} cy={cy} r={1.5} fill={C.line2} />
      <rect x={x0} y={cy - boxH / 2} width={boxW} height={boxH} /><rect x={x0} y={cy - sixH / 2} width={sixW} height={sixH} />
      <rect x={x1 - boxW} y={cy - boxH / 2} width={boxW} height={boxH} /><rect x={x1 - sixW} y={cy - sixH / 2} width={sixW} height={sixH} />
    </g>
  );
}

function DepthList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {POS_ORDER.map(k => {
        const dc = DEPTH_CHARTS[k];
        if (!dc || !dc.starter) return null;
        const n = dc.backups?.length ?? 0, gap = n === 0;
        return (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', alignItems: 'center', gap: 10, padding: '7px 16px', borderBottom: `1px solid ${C.line}`, background: gap ? C.warnSoft : 'transparent' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: gap ? C.warn : C.text }}>{k}</span>
              <span style={{ fontSize: 9, color: C.muted }}>{POS_LABEL[k]}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dc.starter.name}</span>
              <span style={{ fontSize: 10, color: gap ? C.warn : C.muted }}>{gap ? 'No backup — needs cover' : `${n} backup${n > 1 ? 's' : ''}`}</span>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              <Dot filled />{Array.from({ length: 2 }).map((_, i) => <Dot key={i} filled={i < n} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function Dot({ filled }) { return <span style={{ width: 7, height: 7, borderRadius: '50%', background: filled ? C.accent : C.line2 }} />; }

const TAG = {
  INJURY: { fg: C.bad, bg: C.badSoft }, TRANSFER: { fg: C.accent, bg: C.accentSoft },
  MATCH: { fg: '#1d4ed8', bg: '#dbeafe' }, BOARD: { fg: '#7c3aed', bg: '#ede9fe' },
  MEDIA: { fg: C.warn, bg: C.warnSoft }, YOUTH: { fg: C.good, bg: C.goodSoft },
};
function NewsList({ limit }) {
  const items = limit ? NEWS.slice(0, limit) : NEWS;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((n, i) => {
        const c = TAG[n.tag] || { fg: C.muted, bg: C.surface2 };
        return (
          <div key={i} style={{ padding: '11px 16px', borderBottom: i < items.length - 1 ? `1px solid ${C.line}` : 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
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
  );
}

function DemographicsList() {
  const top = [...DEMOGRAPHICS].sort((a, b) => b.count - a.count).slice(0, 5);
  const max = Math.max(...top.map(d => d.count));
  return (
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
  );
}

function LoansList() {
  return (
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
  );
}

/* ------------------------------- V1: Command Center ------------------------------- */

function HomeV1() {
  return (
    <Shell>
      <TopBar /><SummaryStrip />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '360px 1fr 340px', gap: 12, padding: 12, boxSizing: 'border-box' }}>
        <Card title="Squad roster" right={`${SQUAD.length} players`} scroll><RosterTable /></Card>
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12, minHeight: 0 }}>
          <Card title="Formation" right="4-3-3 DM">
            <div style={{ display: 'flex', justifyContent: 'center', padding: 14 }}><Pitch W={430} H={430 * PITCH_ASPECT} horizontal shirt={22} /></div>
          </Card>
          <Card title="Depth & gaps" right={`${gapCount()} gap`} scroll><DepthList /></Card>
        </div>
        <div style={{ display: 'grid', gridTemplateRows: '1fr auto auto', gap: 12, minHeight: 0 }}>
          <Card title="Player news" right={`${NEWS.length} items`} scroll><NewsList /></Card>
          <Card title="Demographics" right="22 senior"><DemographicsList /></Card>
          <Card title="Out on loan" right={`${LOANS.length}`}><LoansList /></Card>
        </div>
      </div>
    </Shell>
  );
}

/* ------------------------------- V2: Collapsible Rails ------------------------------- */

function Chevron({ dir = 'left' }) {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d={dir === 'left' ? 'M9 3L5 7l4 4' : 'M5 3l4 4-4 4'} /></svg>;
}
function RailIcon({ d }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 8, display: 'grid', placeItems: 'center', color: C.muted, cursor: 'pointer' }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
    </div>
  );
}

function HomeV2() {
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(true);
  return (
    <Shell>
      <TopBar />
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12, padding: 12, boxSizing: 'border-box' }}>
        {/* Left rail — collapsible (shown collapsed) */}
        {leftOpen ? (
          <div style={{ width: 280, display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: 12, minHeight: 0 }}>
            <Card title="Formation" action={<button onClick={() => setLeftOpen(false)} style={iconBtn}><Chevron dir="left" /></button>}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}><Pitch W={180} H={180 / PITCH_ASPECT} shirt={16} /></div>
            </Card>
            <Card title="Demographics"><DemographicsList /></Card>
            <Card title="Out on loan" scroll><LoansList /></Card>
          </div>
        ) : (
          <div style={{ width: 52, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 6 }}>
            <button onClick={() => setLeftOpen(true)} style={{ ...iconBtn, color: C.accent }}><Chevron dir="right" /></button>
            <div style={{ height: 1, width: 28, background: C.line, margin: '4px 0' }} />
            <RailIcon d={<><rect x="3" y="3" width="5" height="5" /><rect x="10" y="3" width="5" height="5" /><rect x="3" y="10" width="5" height="5" /><rect x="10" y="10" width="5" height="5" /></>} />
            <RailIcon d={<><rect x="2.5" y="2.5" width="13" height="13" rx="1" /><line x1="9" y1="2.5" x2="9" y2="15.5" /><circle cx="9" cy="9" r="2.5" /></>} />
            <RailIcon d={<><circle cx="9" cy="9" r="6.5" /><line x1="2.5" y1="9" x2="15.5" y2="9" /><path d="M9 2.5a10 10 0 010 13M9 2.5a10 10 0 000 13" /></>} />
          </div>
        )}
        {/* Center — hero roster */}
        <Card title="Squad roster" right={`${SQUAD.length} players · ${gapCount()} gap`} scroll style={{ flex: 1 }}><RosterTable /></Card>
        {/* Right rail — collapsible context (shown expanded) */}
        {rightOpen ? (
          <div style={{ width: 340, display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12, minHeight: 0 }}>
            <Card title="Depth & gaps" action={<button onClick={() => setRightOpen(false)} style={iconBtn}><Chevron dir="right" /></button>} scroll style={{ maxHeight: 280 }}><DepthList /></Card>
            <Card title="Player news" right={`${NEWS.length}`} scroll><NewsList /></Card>
          </div>
        ) : (
          <div style={{ width: 52, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 6 }}>
            <button onClick={() => setRightOpen(true)} style={{ ...iconBtn, color: C.accent }}><Chevron dir="left" /></button>
          </div>
        )}
      </div>
    </Shell>
  );
}
const iconBtn = { border: 'none', background: 'transparent', color: C.muted, cursor: 'pointer', padding: 4, display: 'grid', placeItems: 'center', borderRadius: 6 };

/* ------------------------------- V3: Tabbed Workspace ------------------------------- */

function HomeV3() {
  const [tab, setTab] = React.useState('Overview');
  const tabs = ['Overview', 'Roster', 'Depth & gaps', 'News'];
  const gaps = gapCount();
  return (
    <Shell>
      <TopBar />
      {/* persistent hero header: compact pitch + key tiles */}
      <div style={{ display: 'flex', gap: 16, padding: '14px 20px', background: C.surface, borderBottom: `1px solid ${C.line}`, alignItems: 'center', flexShrink: 0 }}>
        <Pitch W={220} H={220 * PITCH_ASPECT} horizontal shirt={16} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Formation</span>
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>4-3-3 DM</span>
          <span style={{ fontSize: 11, color: C.muted }}>Positive · wide</span>
        </div>
        <div style={{ flex: 1 }} />
        {[{ l: 'Squad', v: SQUAD.length }, { l: 'Avg rating', v: '3.8★' }, { l: 'Depth gaps', v: gaps, tone: 'warn' }, { l: 'Injuries', v: 1, tone: 'bad' }].map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 22px', borderLeft: `1px solid ${C.line}` }}>
            <span style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.l}</span>
            <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 600, color: s.tone === 'warn' ? C.warn : s.tone === 'bad' ? C.bad : C.text }}>{s.v}</span>
          </div>
        ))}
      </div>
      {/* tab bar */}
      <div style={{ display: 'flex', gap: 2, padding: '0 20px', background: C.surface, borderBottom: `1px solid ${C.line}`, flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 14px', fontSize: 12, fontWeight: tab === t ? 600 : 500, fontFamily: 'inherit', color: tab === t ? C.accent : C.muted, background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === t ? C.accent : 'transparent'}`, cursor: 'pointer' }}>{t}</button>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: 12 }}>
        {tab === 'Overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: 12, height: '100%', minHeight: 0 }}>
            <Card title="Starting XI" right="11" scroll><RosterTable compact /></Card>
            <Card title="Depth & gaps" right={`${gaps} gap`} scroll><DepthList /></Card>
            <Card title="Player news" right={`${NEWS.length}`} scroll><NewsList /></Card>
          </div>
        )}
        {tab === 'Roster' && <Card title="Squad roster" right={`${SQUAD.length} players`} scroll style={{ height: '100%' }}><RosterTable /></Card>}
        {tab === 'Depth & gaps' && <Card title="Depth & gaps" right={`${gaps} gap`} scroll style={{ height: '100%' }}><DepthList /></Card>}
        {tab === 'News' && <Card title="Player news" right={`${NEWS.length} items`} scroll style={{ height: '100%' }}><NewsList /></Card>}
      </div>
    </Shell>
  );
}

/* ------------------------------- V4: Squad-First (grouped) ------------------------------- */

function HomeV4() {
  return (
    <Shell>
      <TopBar /><SummaryStrip />
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.7fr 320px', gap: 12, padding: 12, boxSizing: 'border-box' }}>
        <Card title="Squad by position" right={`${SQUAD.length} players`} scroll><RosterGrouped /></Card>
        <div style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: 12, minHeight: 0 }}>
          <Card title="Formation" right="4-3-3 DM">
            <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}><Pitch W={150} H={150 / PITCH_ASPECT} shirt={15} /></div>
          </Card>
          <Card title="Depth & gaps" right={`${gapCount()} gap`} scroll style={{ maxHeight: 230 }}><DepthList /></Card>
          <Card title="Player news" right={`${NEWS.length}`} scroll><NewsList /></Card>
        </div>
      </div>
    </Shell>
  );
}

/* ------------------------------- V5: Insight-Led ------------------------------- */

function AttentionCard({ tone, kicker, head, body }) {
  const map = { warn: { fg: C.warn, bg: C.warnSoft }, bad: { fg: C.bad, bg: C.badSoft }, good: { fg: C.good, bg: C.goodSoft }, accent: { fg: C.accent, bg: C.accentSoft } };
  const c = map[tone] || map.accent;
  return (
    <div style={{ flex: 1, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, borderTop: `3px solid ${c.fg}` }}>
      <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: c.fg, alignSelf: 'flex-start', padding: '2px 6px', borderRadius: 3, background: c.bg }}>{kicker}</span>
      <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{head}</span>
      <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{body}</span>
    </div>
  );
}

function HomeV5() {
  return (
    <Shell>
      <TopBar />
      <div style={{ display: 'flex', gap: 12, padding: '12px 12px 0', flexShrink: 0 }}>
        <AttentionCard tone="warn" kicker="SQUAD GAP" head="Centre back needs cover" body="CB2 has no backup. One injury leaves you short at the back." />
        <AttentionCard tone="bad" kicker="INJURY" head="Brennan picks up a knock" body="Talisman striker — 3–5 day assessment. Plan a replacement up top." />
        <AttentionCard tone="good" kicker="IN FORM" head="Vasconcelos rated 8.4" body="MOTM vs PAOK — assists + 92% passing. Keep him central." />
        <AttentionCard tone="accent" kicker="NEXT MATCH" head="vs Olympiacos (H)" body="Sat 18 Oct. Pick your XI and check fitness before kickoff." />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: 12, padding: 12, boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12, minHeight: 0 }}>
          <Card title="Formation" right="4-3-3 DM">
            <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}><Pitch W={300} H={300 * PITCH_ASPECT} horizontal shirt={18} /></div>
          </Card>
          <Card title="Squad roster" right={`${SQUAD.length}`} scroll><RosterTable compact /></Card>
        </div>
        <Card title="Depth & gaps" right={`${gapCount()} gap`} scroll><DepthList /></Card>
        <div style={{ display: 'grid', gridTemplateRows: '1fr auto', gap: 12, minHeight: 0 }}>
          <Card title="Player news" right={`${NEWS.length}`} scroll><NewsList /></Card>
          <Card title="Demographics" right="22 senior"><DemographicsList /></Card>
        </div>
      </div>
    </Shell>
  );
}

/* ------------------------------- V6: Synthesis ------------------------------- */
/* Attention cards (V5) + grouped roster (V4) + horizontal pitch (V1) + collapsible rails (V2). */

function HomeV6() {
  const [leftOpen, setLeftOpen] = React.useState(true);
  const [rightOpen, setRightOpen] = React.useState(true);
  return (
    <Shell>
      <TopBar />
      {/* Attention zone */}
      <div style={{ display: 'flex', gap: 12, padding: '12px 12px 0', flexShrink: 0 }}>
        <AttentionCard tone="warn" kicker="SQUAD GAP" head="Centre back needs cover" body="CB2 has no backup. One injury leaves you short at the back." />
        <AttentionCard tone="bad" kicker="INJURY" head="Brennan picks up a knock" body="Talisman striker — 3–5 day assessment." />
        <AttentionCard tone="good" kicker="IN FORM" head="Vasconcelos rated 8.4" body="MOTM vs PAOK — assists + 92% passing." />
        <AttentionCard tone="accent" kicker="NEXT MATCH" head="vs Olympiacos (H)" body="Sat 18 Oct. Set your XI before kickoff." />
      </div>
      {/* Body: collapsible left context · grouped roster hero · collapsible right context */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 12, padding: 12, boxSizing: 'border-box' }}>
        {leftOpen ? (
          <div style={{ width: 240, display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12, minHeight: 0 }}>
            <Card title="Demographics" action={<button onClick={() => setLeftOpen(false)} style={iconBtn}><Chevron dir="left" /></button>}><DemographicsList /></Card>
            <Card title="Out on loan" right={`${LOANS.length}`} scroll><LoansList /></Card>
          </div>
        ) : (
          <div style={{ width: 52, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 6 }}>
            <button onClick={() => setLeftOpen(true)} style={{ ...iconBtn, color: C.accent }}><Chevron dir="right" /></button>
            <div style={{ height: 1, width: 28, background: C.line, margin: '4px 0' }} />
            <RailIcon d={<><circle cx="9" cy="9" r="6.5" /><line x1="2.5" y1="9" x2="15.5" y2="9" /><path d="M9 2.5a10 10 0 010 13M9 2.5a10 10 0 000 13" /></>} />
            <RailIcon d={<><path d="M3 9h9" /><path d="M9 5l4 4-4 4" /></>} />
          </div>
        )}

        <Card title="Squad by position" right={`${SQUAD.length} players · ${gapCount()} gap`} scroll style={{ flex: 1 }}><RosterGrouped /></Card>

        {rightOpen ? (
          <div style={{ width: 340, display: 'grid', gridTemplateRows: 'auto 1fr 1fr', gap: 12, minHeight: 0 }}>
            <Card title="Formation" action={<button onClick={() => setRightOpen(false)} style={iconBtn}><Chevron dir="right" /></button>}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}><Pitch W={300} H={300 * PITCH_ASPECT} horizontal shirt={18} /></div>
            </Card>
            <Card title="Depth & gaps" right={`${gapCount()} gap`} scroll><DepthList /></Card>
            <Card title="Player news" right={`${NEWS.length}`} scroll><NewsList /></Card>
          </div>
        ) : (
          <div style={{ width: 52, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 6 }}>
            <button onClick={() => setRightOpen(true)} style={{ ...iconBtn, color: C.accent }}><Chevron dir="left" /></button>
            <div style={{ height: 1, width: 28, background: C.line, margin: '4px 0' }} />
            <RailIcon d={<><rect x="2.5" y="2.5" width="13" height="13" rx="1" /><line x1="9" y1="2.5" x2="9" y2="15.5" /><circle cx="9" cy="9" r="2.5" /></>} />
            <RailIcon d={<><line x1="4" y1="5" x2="14" y2="5" /><line x1="4" y1="9" x2="14" y2="9" /><line x1="4" y1="13" x2="10" y2="13" /></>} />
          </div>
        )}
      </div>
    </Shell>
  );
}

const VARIANTS = { 1: HomeV1, 2: HomeV2, 3: HomeV3, 4: HomeV4, 5: HomeV5, 6: HomeV6 };

function HomeLab({ v }) {
  const Cmp = VARIANTS[v] || HomeV1;
  return <Cmp />;
}

export { HomeLab, HomeV1, HomeV2, HomeV3, HomeV4, HomeV5, HomeV6 };
