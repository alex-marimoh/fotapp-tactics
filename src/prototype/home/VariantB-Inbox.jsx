/**
 * PROTOTYPE B — The Board
 * Cork tactics-board metaphor: magnets on zones, sticky notes for squad needs.
 */
import { useState } from 'react';
import { TEAM, getPositionRows, getSquadNeeds, getNewsForPlayer, getPlayerByNum } from './home-data';
import { injectHomeStyles, PlayerDetailSheet, DepthStack } from './home-shared';

export const VARIANT_NAME = 'The Board';

const CORK = '#c4a574';
const ZONES = [
  { id: 'att', label: 'Attack', y: 8, h: 22, positions: ['RW', 'ST', 'LW'] },
  { id: 'mid', label: 'Midfield', y: 32, h: 22, positions: ['AM', 'CM', 'DM'] },
  { id: 'def', label: 'Defence', y: 56, h: 28, positions: ['RB', 'CB', 'CB2', 'LB'] },
  { id: 'gk', label: 'Goalkeeper', y: 86, h: 10, positions: ['GK'] },
];

export function VariantB() {
  const [selectedNum, setSelectedNum] = useState(null);
  const [focusedPos, setFocusedPos] = useState(null);
  injectHomeStyles();
  const rows = getPositionRows();
  const needs = getSquadNeeds();
  const byPos = Object.fromEntries(rows.map((r) => [r.pos, r]));
  const player = selectedNum ? getPlayerByNum(selectedNum) : null;
  const row = focusedPos ? byPos[focusedPos] : (player ? rows.find((r) => r.starter.num === player.num || r.backups.some((b) => b.num === player.num)) : null);
  const news = player ? getNewsForPlayer(player.name) : [];

  return (
    <div style={{
      minHeight: '100vh', background: `linear-gradient(135deg, #d4c4a8 0%, ${CORK} 50%, #b8956a 100%)`,
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      padding: '24px 24px 100px',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: '"Comic Sans MS", "Segoe Print", cursive', fontSize: 28, color: '#3d2e1a', transform: 'rotate(-1deg)' }}>{TEAM.name}</div>
            <div style={{ fontSize: 12, color: '#5c4a32', marginTop: 4 }}>Drag players between slots — coming soon. Tap a magnet to see depth.</div>
          </div>

          <div style={{
            position: 'relative', background: CORK, borderRadius: 4,
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,.15), 4px 8px 24px rgba(0,0,0,.2)',
            border: '8px solid #8b6914', minHeight: 520, padding: 16,
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(0,0,0,.04) 0, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,.06) 0, transparent 40%)',
          }}>
            {ZONES.map((zone) => (
              <div key={zone.id} style={{
                position: 'absolute', left: 16, right: 16, top: `${zone.y}%`, height: `${zone.h}%`,
                border: '2px dashed rgba(61,46,26,.35)', borderRadius: 8,
                display: 'flex', alignItems: 'flex-start', padding: '8px 12px',
              }}>
                <span style={{
                  fontFamily: '"Comic Sans MS", cursive', fontSize: 11, color: 'rgba(61,46,26,.6)',
                  background: 'rgba(255,255,255,.4)', padding: '2px 8px', borderRadius: 4,
                }}>{zone.label}</span>
              </div>
            ))}

            {rows.map((r) => {
              const [x, y] = magnetCoords(r.pos);
              const p = getPlayerByNum(r.starter.num);
              if (!p) return null;
              const sel = selectedNum === p.num || focusedPos === r.pos;
              return (
                <button
                  key={r.pos}
                  type="button"
                  onClick={() => { setSelectedNum(p.num); setFocusedPos(r.pos); }}
                  style={{
                    position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) rotate(${magnetRotate(r.pos)}deg)`,
                    width: 56, height: 56, borderRadius: 28,
                    background: sel ? '#c43d2a' : `hsl(${(p.num * 37) % 360}, 55%, 45%)`,
                    border: '3px solid rgba(0,0,0,.25)',
                    boxShadow: sel ? '0 6px 20px rgba(196,61,42,.5), inset 0 2px 4px rgba(255,255,255,.3)' : '0 4px 12px rgba(0,0,0,.35), inset 0 2px 4px rgba(255,255,255,.25)',
                    cursor: 'pointer', color: '#fff', fontWeight: 800, fontSize: 16,
                    display: 'grid', placeItems: 'center', fontFamily: 'inherit',
                    zIndex: sel ? 10 : 2,
                  }}
                >
                  {p.num}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {needs.slice(0, 3).map((n, i) => (
            <div
              key={n.id}
              style={{
                background: '#fef4a8', padding: '14px 16px', boxShadow: '2px 4px 12px rgba(0,0,0,.15)',
                transform: `rotate(${[-2, 1.5, -1][i]}deg)`, fontFamily: '"Comic Sans MS", cursive',
                fontSize: 13, color: '#5a4a2a', lineHeight: 1.4, cursor: 'pointer',
              }}
              onClick={() => setFocusedPos(n.pos)}
            >
              <strong>{n.title}</strong>
              <div style={{ marginTop: 6, fontSize: 12 }}>{n.body}</div>
            </div>
          ))}

          {row && (
            <div style={{ background: 'rgba(255,255,255,.85)', borderRadius: 8, padding: 16, boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#5c4a32', marginBottom: 10, letterSpacing: '0.06em' }}>
                {row.label.toUpperCase()} DEPTH
              </div>
              <DepthStack row={row} highlightNum={selectedNum ?? row.starter.num} compact />
            </div>
          )}
        </div>
      </div>

      {player && (
        <PlayerDetailSheet player={player} row={row} news={news} onClose={() => { setSelectedNum(null); setFocusedPos(null); }} />
      )}
    </div>
  );
}

function magnetCoords(pos) {
  const m = {
    GK: [50, 91], RB: [78, 68], CB: [58, 72], CB2: [42, 72], LB: [22, 68],
    DM: [50, 52], CM: [65, 42], AM: [35, 42], RW: [75, 18], LW: [25, 18], ST: [50, 10],
  };
  return m[pos] ?? [50, 50];
}

function magnetRotate(pos) {
  const r = { GK: 0, RB: 8, LB: -6, ST: 3, RW: -4, LW: 5 };
  return r[pos] ?? ((pos.charCodeAt(0) % 7) - 3);
}
