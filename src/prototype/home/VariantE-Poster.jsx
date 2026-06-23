/**
 * PROTOTYPE E — Lineup Poster
 * One scrollable typographic "squad poster" — formation as a beautiful hierarchy tree.
 */
import { useState } from 'react';
import { KitShirt, Flag, Stars } from '../../shared';
import { TEAM, getPositionRows, getSquadNeeds, getNewsForPlayer, getPlayerByNum } from './home-data';
import { injectHomeStyles, TAG_COLOR } from './home-shared';

export const VARIANT_NAME = 'Lineup Poster';

const LINES = [
  { name: 'Forwards', positions: ['RW', 'ST', 'LW'], color: '#c43d2a' },
  { name: 'Midfield', positions: ['AM', 'CM', 'DM'], color: '#2d6a4f' },
  { name: 'Defence', positions: ['RB', 'CB', 'CB2', 'LB'], color: '#1d3557' },
  { name: 'Goalkeeper', positions: ['GK'], color: '#6b4c9a' },
];

export function VariantE() {
  const [expandedPos, setExpandedPos] = useState(null);
  const [selectedNum, setSelectedNum] = useState(null);
  injectHomeStyles();
  const rows = getPositionRows();
  const needs = getSquadNeeds();
  const byPos = Object.fromEntries(rows.map((r) => [r.pos, r]));
  const selected = selectedNum ? getPlayerByNum(selectedNum) : null;
  const news = selected ? getNewsForPlayer(selected.name) : [];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1c1a16 0%, #2d2a24 100%)',
      color: '#f4ede0',
      fontFamily: '"Source Serif 4", Georgia, serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 120px' }}>
        <header style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.25em', color: '#b9ad96', marginBottom: 12 }}>MY SQUAD</div>
          <h1 style={{ margin: 0, fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            {TEAM.name}
          </h1>
          <div style={{ fontSize: 16, color: '#b9ad96', marginTop: 12, fontStyle: 'italic' }}>
            {TEAM.formation} · {TEAM.squadSize} players
          </div>
        </header>

        {needs.length > 0 && (
          <div style={{
            marginBottom: 40, padding: '16px 20px', borderLeft: '3px solid #c43d2a',
            background: 'rgba(196,61,42,.1)', fontSize: 14, lineHeight: 1.5,
            fontFamily: '"IBM Plex Sans", sans-serif',
          }}>
            <strong style={{ color: '#e8b4ac' }}>Squad gaps:</strong>{' '}
            {needs.filter((n) => n.severity === 'high').map((n) => n.title).join(' · ') || needs[0].title}
          </div>
        )}

        {LINES.map((line) => (
          <section key={line.name} style={{ marginBottom: 48 }}>
            <div style={{
              fontSize: 11, letterSpacing: '0.2em', color: line.color, marginBottom: 20,
              fontFamily: '"IBM Plex Sans", sans-serif', fontWeight: 600,
            }}>{line.name.toUpperCase()}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {line.positions.map((pos) => {
                const row = byPos[pos];
                if (!row) return null;
                const open = expandedPos === pos;
                const starter = getPlayerByNum(row.starter.num);
                return (
                  <div key={pos}>
                    <button
                      type="button"
                      onClick={() => setExpandedPos(open ? null : pos)}
                      style={{
                        display: 'grid', gridTemplateColumns: '48px 1fr auto auto', gap: 16, alignItems: 'center',
                        width: '100%', padding: '16px 0', border: 'none', borderBottom: '1px solid rgba(255,255,255,.08)',
                        background: 'transparent', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', textAlign: 'left',
                      }}
                    >
                      <span style={{
                        fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 600,
                        color: row.gap ? '#e8b4ac' : '#b9ad96',
                      }}>{pos.replace('CB2', 'CB')}</span>
                      <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{row.starter.name}</span>
                      {starter && <Flag code={starter.nat} />}
                      <Stars value={row.starter.rating} color="#f6c451" />
                      <span style={{ fontSize: 18, color: '#b9ad96', marginLeft: 8 }}>{open ? '−' : '+'}</span>
                    </button>

                    {open && (
                      <div style={{
                        padding: '12px 0 20px 48px', fontFamily: '"IBM Plex Sans", sans-serif',
                        animation: 'protoFadeIn .2s ease',
                      }}>
                        {row.backups.map((b, i) => {
                          const bp = getPlayerByNum(b.num);
                          return (
                            <button
                              key={b.num}
                              type="button"
                              onClick={() => setSelectedNum(b.num)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                                padding: '10px 0', border: 'none', background: 'transparent',
                                cursor: 'pointer', color: '#d8cdb6', fontFamily: 'inherit', textAlign: 'left',
                                fontSize: 15,
                              }}
                            >
                              <span style={{ fontSize: 10, color: '#7a6f5c', width: 64 }}>backup {i + 1}</span>
                              <span style={{ flex: 1, fontWeight: 500 }}>{b.name}</span>
                              {bp && <Flag code={bp.nat} />}
                              <Stars value={b.rating} size={8} />
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => setSelectedNum(row.starter.num)}
                          style={{
                            marginTop: 8, padding: '8px 14px', border: '1px solid rgba(255,255,255,.15)',
                            background: 'transparent', color: '#b9ad96', borderRadius: 6, cursor: 'pointer',
                            fontSize: 12, fontFamily: 'inherit',
                          }}
                        >
                          News about {row.starter.name.split(' ').pop()} →
                        </button>
                        {row.gap && (
                          <div style={{ marginTop: 12, fontSize: 13, color: '#e8b4ac', fontStyle: 'italic' }}>
                            No backup at this position
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {selected && (
          <div style={{
            marginTop: 32, padding: 24, background: 'rgba(255,255,255,.05)', borderRadius: 8,
            border: '1px solid rgba(255,255,255,.1)', fontFamily: '"IBM Plex Sans", sans-serif',
          }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <KitShirt size={40} variant="solid" primary="#c43d2a" secondary="#fff" />
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, fontFamily: '"Source Serif 4", serif' }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: '#b9ad96' }}>#{selected.num} · {selected.pos}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNum(null)}
                style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: '#b9ad96', cursor: 'pointer', fontSize: 20 }}
              >×</button>
            </div>
            {news.map((n) => (
              <div key={n.head} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: TAG_COLOR[n.tag] }}>{n.tag}</span>
                <div style={{ fontWeight: 600, marginTop: 6, lineHeight: 1.35 }}>{n.head}</div>
                <div style={{ fontSize: 13, color: '#b9ad96', marginTop: 4, lineHeight: 1.5 }}>{n.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
