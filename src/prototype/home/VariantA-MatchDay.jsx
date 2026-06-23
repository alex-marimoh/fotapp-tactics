/**
 * PROTOTYPE A — The Pitch
 * Immersive formation view; tap a player for a bottom sheet with depth + news.
 */
import { useState } from 'react';
import { KitShirt } from '../../shared';
import { TEAM, getPositionRows, getSquadNeeds, getNewsForPlayer, getPlayerByNum } from './home-data';
import { injectHomeStyles, PlayerDetailSheet, NeedDot } from './home-shared';

export const VARIANT_NAME = 'The Pitch';

const PITCH = {
  bg: 'linear-gradient(180deg, #1a5c38 0%, #0f4a2c 40%, #0d3d24 100%)',
  line: 'rgba(255,255,255,.45)',
};

const COORDS = {
  GK: [50, 90], RB: [82, 72], CB: [62, 78], CB2: [38, 78], LB: [18, 72],
  DM: [50, 58], CM: [68, 46], AM: [32, 46], RW: [80, 24], LW: [20, 24], ST: [50, 12],
};

export function VariantA() {
  const [selectedNum, setSelectedNum] = useState(null);
  injectHomeStyles();
  const rows = getPositionRows();
  const needs = getSquadNeeds();
  const needPositions = new Set(needs.filter((n) => n.severity === 'high').map((n) => n.pos));
  const player = selectedNum ? getPlayerByNum(selectedNum) : null;
  const row = player ? rows.find((r) => r.starter.num === player.num || r.backups.some((b) => b.num === player.num)) : null;
  const news = player ? getNewsForPlayer(player.name) : [];

  return (
    <div style={{ minHeight: '100vh', background: '#0a1124', fontFamily: '"Inter", system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12,
        background: 'linear-gradient(180deg, rgba(10,17,36,.85) 0%, transparent 100%)',
        color: '#fff',
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{TEAM.name}</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{TEAM.formation} · tap anyone on the pitch</div>
        </div>
        {needs.length > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', padding: '8px 14px', borderRadius: 20, fontSize: 11 }}>
            <NeedDot severity="high" />
            <span>{needs.filter((n) => n.severity === 'high').length} position{needs.filter((n) => n.severity === 'high').length !== 1 ? 's' : ''} need backup</span>
          </div>
        )}
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 100px' }}>
        <div style={{
          position: 'relative', width: 'min(420px, 90vw)', aspectRatio: '68/105',
          background: PITCH.bg, borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.15)',
          overflow: 'hidden',
        }}>
          <GrassLines />
          {rows.map((r) => {
            const p = getPlayerByNum(r.starter.num);
            if (!p) return null;
            const [x, y] = COORDS[r.pos] ?? [50, 50];
            const sel = selectedNum === p.num;
            return (
              <button
                key={r.pos}
                type="button"
                onClick={() => setSelectedNum(p.num)}
                style={{
                  position: 'absolute', left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) scale(${sel ? 1.12 : 1})`,
                  border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                  transition: 'transform .2s', zIndex: sel ? 5 : 2,
                  filter: sel ? 'drop-shadow(0 8px 16px rgba(0,0,0,.4))' : 'drop-shadow(0 2px 6px rgba(0,0,0,.3))',
                }}
              >
                {needPositions.has(r.pos) && (
                  <span style={{ position: 'absolute', top: -4, right: -4, zIndex: 3 }}><NeedDot severity="high" /></span>
                )}
                <div style={{
                  width: 48, height: 48, borderRadius: 24, background: sel ? '#fff' : 'rgba(255,255,255,.95)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,.25)',
                }}>
                  <KitShirt size={28} variant="solid" primary={sel ? '#0040ff' : '#0a1124'} secondary="#fff" />
                </div>
                <div style={{
                  marginTop: 4, fontSize: 10, fontWeight: 700, color: '#fff', textAlign: 'center',
                  textShadow: '0 1px 4px rgba(0,0,0,.8)', whiteSpace: 'nowrap',
                }}>
                  {p.name.split(' ').pop()}
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,.75)', textAlign: 'center', fontWeight: 600 }}>{r.pos}</div>
              </button>
            );
          })}
        </div>
      </div>

      {player && (
        <PlayerDetailSheet player={player} row={row} news={news} onClose={() => setSelectedNum(null)} />
      )}
    </div>
  );
}

function GrassLines() {
  return (
    <svg viewBox="0 0 68 105" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <rect x="5" y="5" width="58" height="95" fill="none" stroke={PITCH.line} strokeWidth="0.5" />
      <line x1="5" y1="52.5" x2="63" y2="52.5" stroke={PITCH.line} strokeWidth="0.5" />
      <circle cx="34" cy="52.5" r="7" fill="none" stroke={PITCH.line} strokeWidth="0.5" />
      <rect x="22" y="5" width="24" height="8" fill="none" stroke={PITCH.line} strokeWidth="0.4" />
      <rect x="22" y="92" width="24" height="8" fill="none" stroke={PITCH.line} strokeWidth="0.4" />
      {/* mow stripes */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x="5" y={5 + i * 11.8} width="58" height="5.9" fill="rgba(255,255,255,.04)" />
      ))}
    </svg>
  );
}
