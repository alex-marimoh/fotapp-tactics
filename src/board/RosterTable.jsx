import React from 'react';
import { POSITION_TYPES, REG_LABEL_SHORT, squadComplianceStatus } from '../squad-data';
import { withA } from '../lib/format';
import { field } from '../ui/styles';
import { regStylesOf } from './regStyles';
import { useT } from './theme';

const POS_GROUP = { GK: 'GK', RB: 'DEF', CB: 'DEF', LB: 'DEF', DM: 'MID', CM: 'MID', AM: 'MID', RW: 'ATT', LW: 'ATT', ST: 'ATT' };
const REG_ORDER = { home: 0, eu: 1, noneu: 2 };

/**
 * @param {object} props
 * @param {object[]} props.roster
 * @param {Set<number>} [props.starterNums]
 * @param {object} [props.comp]
 * @param {number|null} [props.highlightedNum]
 * @param {(num: number) => void} [props.onSelectPlayer]
 */
export function RosterTable({ roster, starterNums, comp, highlightedNum, onSelectPlayer }) {
  const T = useT();
  const regStyles = regStylesOf(T);
  const [q, setQ] = React.useState('');
  const [grp, setGrp] = React.useState('all');
  const [reg, setReg] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('position');
  const [showFilters, setShowFilters] = React.useState(false);
  const rowRefs = React.useRef(/** @type {Record<number, HTMLTableRowElement>} */ ({}));

  const order = Object.fromEntries(POSITION_TYPES.map((t, i) => [t, i]));
  const status = comp ? squadComplianceStatus(comp) : null;

  const priorityReg = (p) => {
    if (!comp || status?.valid) return null;
    if (comp.noneu.state === 'over' || comp.noneu.state === 'at') {
      if (p.reg === 'noneu') return 'noneu';
    }
    if (comp.home.state === 'under' && p.reg === 'home') return 'home';
    return null;
  };

  const rows = [...roster]
    .filter((p) =>
      (grp === 'all' || POS_GROUP[p.pos[0]] === grp) &&
      (reg === 'all' || p.reg === reg) &&
      (q.trim() === '' || p.name.toLowerCase().includes(q.trim().toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'registration') {
        const rd = REG_ORDER[a.reg] - REG_ORDER[b.reg];
        return rd !== 0 ? rd : b.rating - a.rating;
      }
      return (order[a.pos[0]] - order[b.pos[0]]) || (b.rating - a.rating);
    });

  React.useEffect(() => {
    if (highlightedNum == null) return;
    const el = rowRefs.current[highlightedNum];
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [highlightedNum]);

  const th = { textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase',
    color: T.textMuted, padding: '7px 8px', position: 'sticky', top: 0, background: T.panel };
  const td = { fontSize: 12, padding: '8px', borderTop: `1px solid ${T.hair}`, whiteSpace: 'nowrap' };
  const fieldStyle = field(T, { padding: '7px 10px', fontSize: 12 });
  const Chip = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{ padding: '4px 10px', borderRadius: T.pill, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 11, fontWeight: 700, border: `1px solid ${active ? T.accent : T.hair2}`,
      background: active ? T.accent : 'transparent', color: active ? T.onAccent : T.text }}>{children}</button>
  );
  const row = { display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' };
  const tag = { fontSize: 10, color: T.textMuted, width: 26, flexShrink: 0 };

  const active = (q.trim() ? 1 : 0) + (grp !== 'all' ? 1 : 0) + (reg !== 'all' ? 1 : 0);
  const clear = () => { setQ(''); setGrp('all'); setReg('all'); };

  const handleRowActivate = (num) => {
    onSelectPlayer?.(num);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: T.textMuted, textTransform: 'uppercase',
          letterSpacing: '0.04em' }}>Sort</span>
        {[['position', 'Position'], ['registration', 'Registration']].map(([k, l]) => (
          <Chip key={k} active={sortBy === k} onClick={() => setSortBy(k)}>{l}</Chip>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setShowFilters((s) => !s)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: T.pill,
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 800, background: T.soft, color: T.text,
            border: `1px solid ${showFilters || active ? T.accent : T.hair2}` }}>
          Filters{active ? ` · ${active}` : ''} <span style={{ fontSize: 10 }}>{showFilters ? '▴' : '▾'}</span>
        </button>
        {active > 0 && (
          <button onClick={clear} style={{ background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: T.accent }}>Clear</button>
        )}
        {active > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, color: T.textMuted }}>{rows.length} of {roster.length}</span>}
      </div>

      {showFilters && (
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players…" style={fieldStyle} />
          <div style={row}>
            <span style={tag}>Pos</span>
            {[['all', 'All'], ['GK', 'GK'], ['DEF', 'DEF'], ['MID', 'MID'], ['ATT', 'ATT']].map(([k, l]) => (
              <Chip key={k} active={grp === k} onClick={() => setGrp(k)}>{l}</Chip>
            ))}
          </div>
          <div style={row}>
            <span style={tag}>Reg</span>
            {[['all', 'All'], ['home', 'HG'], ['eu', 'EU'], ['noneu', 'Non-EU']].map(([k, l]) => (
              <Chip key={k} active={reg === k} onClick={() => setReg(k)}>{l}</Chip>
            ))}
          </div>
        </>
      )}

      {rows.length ? (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 26 }}>#</th>
              <th style={th}>Name</th>
              <th style={th}>Pos</th>
              <th style={{ ...th, textAlign: 'center' }}>Age</th>
              <th style={{ ...th, textAlign: 'center' }} title="1–5 squad rating">Rating</th>
              <th style={{ ...th, textAlign: 'right' }}>Reg</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const isHighlighted = highlightedNum === p.num;
              const isStarter = starterNums?.has(p.num);
              const pri = priorityReg(p);
              const priBg = pri === 'noneu' ? withA(T.thin, 0.12) : pri === 'home' ? withA(T.gap, 0.08) : undefined;
              return (
              <tr key={p.num}
                ref={(el) => { if (el) rowRefs.current[p.num] = el; else delete rowRefs.current[p.num]; }}
                tabIndex={0}
                role="button"
                aria-label={`${p.name}, ${p.pos.join('/')}, ${REG_LABEL_SHORT[p.reg]}`}
                aria-current={isHighlighted ? 'true' : undefined}
                onClick={() => handleRowActivate(p.num)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRowActivate(p.num);
                  }
                }}
                style={{
                  cursor: onSelectPlayer ? 'pointer' : 'default',
                  background: isHighlighted ? withA(T.accent, 0.12) : priBg,
                  boxShadow: isHighlighted ? `inset 3px 0 0 ${T.accent}` : undefined,
                }}>
                <td style={{ ...td, color: T.textMuted }}>{p.num}</td>
                <td style={{ ...td, fontWeight: 700 }}>
                  {isStarter && (
                    <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: T.pill,
                      background: withA(T.accent, 0.15), color: T.accent, marginRight: 6 }}>XI</span>
                  )}
                  {p.name}
                </td>
                <td style={{ ...td, opacity: 0.85 }}>{p.pos.join('/')}</td>
                <td style={{ ...td, textAlign: 'center' }}>{p.age}</td>
                <td style={{ ...td, textAlign: 'center' }}>{p.rating}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: T.pill,
                    background: regStyles[p.reg].bg, color: regStyles[p.reg].color,
                    border: `1px solid ${regStyles[p.reg].border}` }}>{REG_LABEL_SHORT[p.reg]}</span>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      ) : (
        <div style={{ color: T.textMuted, fontSize: 13, padding: '16px 4px', textAlign: 'center' }}>No players match.</div>
      )}
    </div>
  );
}
