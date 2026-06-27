import React from 'react';
import { POSITION_TYPES } from '../squad-data';
import { field } from '../ui/styles';
import { useT } from './theme';

const POS_GROUP = { GK: 'GK', RB: 'DEF', CB: 'DEF', LB: 'DEF', DM: 'MID', CM: 'MID', AM: 'MID', RW: 'ATT', LW: 'ATT', ST: 'ATT' };

export function RosterTable({ roster }) {
  const T = useT();
  const [q, setQ] = React.useState('');
  const [grp, setGrp] = React.useState('all');
  const [reg, setReg] = React.useState('all');
  const [showFilters, setShowFilters] = React.useState(false);
  const order = Object.fromEntries(POSITION_TYPES.map((t, i) => [t, i]));
  const rows = [...roster]
    .sort((a, b) => (order[a.pos[0]] - order[b.pos[0]]) || (b.rating - a.rating))
    .filter((p) =>
      (grp === 'all' || POS_GROUP[p.pos[0]] === grp) &&
      (reg === 'all' || p.reg === reg) &&
      (q.trim() === '' || p.name.toLowerCase().includes(q.trim().toLowerCase())));
  const regLabel = { home: 'HG', eu: 'EU', noneu: 'Non-EU' };
  const regColor = { home: T.solid, eu: T.text, noneu: T.accent2 };
  const th = { textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase',
    opacity: 0.5, padding: '7px 8px', position: 'sticky', top: 0, background: T.panel };
  const td = { fontSize: 12, padding: '8px', borderTop: `1px solid ${T.hair}`, whiteSpace: 'nowrap' };
  const fieldStyle = field(T, { padding: '7px 10px', fontSize: 12 });
  const Chip = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{ padding: '4px 10px', borderRadius: T.pill, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 11, fontWeight: 700, border: `1px solid ${active ? T.accent : T.hair2}`,
      background: active ? T.accent : 'transparent', color: active ? T.onAccent : T.text }}>{children}</button>
  );
  const row = { display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' };
  const tag = { fontSize: 10, opacity: 0.45, width: 26, flexShrink: 0 };

  const active = (q.trim() ? 1 : 0) + (grp !== 'all' ? 1 : 0) + (reg !== 'all' ? 1 : 0);
  const clear = () => { setQ(''); setGrp('all'); setReg('all'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        {active > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.5 }}>{rows.length} of {roster.length}</span>}
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
              <th style={{ ...th, textAlign: 'center' }}>★</th>
              <th style={{ ...th, textAlign: 'right' }}>Reg</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.num}>
                <td style={{ ...td, opacity: 0.5 }}>{p.num}</td>
                <td style={{ ...td, fontWeight: 700 }}>{p.name}</td>
                <td style={{ ...td, opacity: 0.85 }}>{p.pos.join('/')}</td>
                <td style={{ ...td, textAlign: 'center' }}>{p.age}</td>
                <td style={{ ...td, textAlign: 'center' }}>{p.rating}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: T.pill,
                    background: T.soft, color: regColor[p.reg] }}>{regLabel[p.reg]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : (
        <div style={{ opacity: 0.5, fontSize: 13, padding: '16px 4px', textAlign: 'center' }}>No players match.</div>
      )}
    </div>
  );
}
