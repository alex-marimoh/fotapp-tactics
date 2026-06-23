/**
 * PROTOTYPE C — Depth Columns
 * Kanban-style: one column per position, starter on top, backups below, gaps visible.
 */
import { useState } from 'react';
import { Flag, Stars } from '../../shared';
import { TEAM, getPositionRows, getNewsForPlayer, getPlayerByNum } from './home-data';
import { injectHomeStyles, PlayerDetailSheet } from './home-shared';

export const VARIANT_NAME = 'Depth Columns';

const COL_HEADER = {
  GK: '#7c3aed', RB: '#2563eb', CB: '#1d4ed8', CB2: '#1d4ed8', LB: '#2563eb',
  DM: '#059669', CM: '#0d9488', AM: '#0891b2', RW: '#d97706', LW: '#d97706', ST: '#dc2626',
};

export function VariantC() {
  const [selectedNum, setSelectedNum] = useState(null);
  injectHomeStyles();
  const rows = getPositionRows();
  const player = selectedNum ? getPlayerByNum(selectedNum) : null;
  const row = player ? rows.find((r) => r.starter.num === player.num || r.backups.some((b) => b.num === player.num)) : null;
  const news = player ? getNewsForPlayer(player.name) : [];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter", system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        padding: '20px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{TEAM.name}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Every position, every option — scroll sideways</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: 6 }}>
          {rows.filter((r) => r.gap).length} gaps · {TEAM.squadSize} players
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 0 100px' }}>
        <div style={{ display: 'flex', gap: 12, padding: '0 24px', minWidth: 'max-content' }}>
          {rows.map((r) => (
            <Column key={r.pos} row={r} selectedNum={selectedNum} onSelect={setSelectedNum} />
          ))}
        </div>
      </div>

      {player && (
        <PlayerDetailSheet player={player} row={row} news={news} onClose={() => setSelectedNum(null)} />
      )}
    </div>
  );
}

function Column({ row, selectedNum, onSelect }) {
  const color = COL_HEADER[row.pos] ?? '#64748b';
  return (
    <div style={{ width: 168, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        padding: '10px 12px', borderRadius: 8, background: color, color: '#fff',
        fontWeight: 700, fontSize: 13, textAlign: 'center',
      }}>
        {row.pos.replace('CB2', 'CB')}
        <div style={{ fontSize: 10, fontWeight: 500, opacity: 0.85, marginTop: 2 }}>{row.label}</div>
      </div>

      <SlotCard
        player={row.starter}
        label="Starter"
        accent
        selected={selectedNum === row.starter.num}
        onSelect={() => onSelect(row.starter.num)}
      />

      {row.backups.map((b, i) => (
        <SlotCard
          key={b.num}
          player={b}
          label={`Backup ${i + 1}`}
          selected={selectedNum === b.num}
          onSelect={() => onSelect(b.num)}
        />
      ))}

      {row.gap && (
        <div style={{
          padding: 20, border: '2px dashed #f87171', borderRadius: 10, background: '#fef2f2',
          textAlign: 'center', fontSize: 11, color: '#b91c1c', fontWeight: 600,
        }}>
          Empty slot
          <div style={{ fontWeight: 400, marginTop: 4, fontSize: 10 }}>No backup yet</div>
        </div>
      )}

      {row.thin && !row.gap && (
        <div style={{ padding: 10, fontSize: 10, color: '#b45309', textAlign: 'center', background: '#fffbeb', borderRadius: 6 }}>
          Thin — only {row.depth} deep
        </div>
      )}
    </div>
  );
}

function SlotCard({ player, label, accent, selected, onSelect }) {
  const p = getPlayerByNum(player.num);
  if (!p) return null;
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        border: selected ? '2px solid #0040ff' : '1px solid #e2e8f0',
        borderRadius: 10, padding: 12, background: selected ? '#eff6ff' : '#fff',
        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', width: '100%',
        boxShadow: selected ? '0 4px 12px rgba(0,64,255,.15)' : '0 1px 3px rgba(0,0,0,.06)',
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: accent ? '#0040ff' : '#94a3b8', marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 8, lineHeight: 1.2 }}>{player.name}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Flag code={p.nat} />
        <Stars value={player.rating} size={8} />
      </div>
    </button>
  );
}
