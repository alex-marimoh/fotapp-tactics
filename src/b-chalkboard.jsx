import React from 'react';
import { Stars, Flag, SQUAD, DEMOGRAPHICS, LOANS, NEWS, DEPTH_CHARTS as DEPTH_CHART } from './shared';

const B = {
  paper:     '#f4ede0',
  paper2:    '#ebe2d1',
  card:      '#fbf6ec',
  ink:       '#1c1a16',
  ink2:      '#3d362a',
  muted:     '#7a6f5c',
  faint:     '#b9ad96',
  line:      '#d8cdb6',
  accent:    '#c43d2a',
  accentSoft:'#e8b4ac',
  pitch:     '#e6dcc4',
  pitchAlt:  '#dccfb1',
  pitchLine: '#3d362a',
  good:      '#3a6b3e',
};

function ChalkboardBoard() {
  const [hovered, setHovered] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [tab, setTab] = React.useState('Combined');
  return (
    <div style={{
      width: 1440, height: 920, background: B.paper, color: B.ink,
      fontFamily: '"IBM Plex Sans", -apple-system, system-ui, sans-serif',
      fontSize: 13, position: 'relative',
      backgroundImage: `radial-gradient(circle at 20% 10%, rgba(0,0,0,.025) 0, transparent 40%), radial-gradient(circle at 80% 90%, rgba(0,0,0,.03) 0, transparent 50%)`,
    }}>
      <ChTopBar />
      <div style={{
        display: 'grid', gridTemplateColumns: '300px 1fr 360px',
        gap: 20, padding: '16px 20px 20px', height: 'calc(100% - 56px)', boxSizing: 'border-box',
      }}>
        <ChLeftRail />
        <ChPitchPanel tab={tab} setTab={setTab} hovered={hovered} setHovered={setHovered} selected={selected} setSelected={setSelected} />
        <ChRightRail />
      </div>
      {selected && <ChDepthChart player={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ChTopBar() {
  return (
    <div style={{
      height: 56, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 28,
      borderBottom: `1px solid ${B.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: '"Source Serif Pro", "Source Serif 4", Georgia, serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Fotapp.</span>
        <span style={{ fontSize: 11, color: B.muted, fontStyle: 'italic' }}>tactics ledger</span>
      </div>
      <nav style={{ display: 'flex', gap: 22, marginLeft: 12, fontSize: 13 }}>
        {['Squad', 'Tactics', 'Schedule', 'Transfers', 'Scouting'].map((t, i) => (
          <span key={t} style={{
            color: i === 1 ? B.ink : B.muted,
            borderBottom: i === 1 ? `2px solid ${B.accent}` : '2px solid transparent',
            paddingBottom: 4, cursor: 'pointer', fontWeight: i === 1 ? 600 : 400,
          }}>{t}</span>
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 12, color: B.muted, display: 'flex', alignItems: 'center', gap: 14, fontFamily: '"IBM Plex Mono", monospace' }}>
        <span>SAT 18 OCT</span>
        <span style={{ width: 1, height: 14, background: B.line }} />
        <span>vs <span style={{ color: B.ink, fontWeight: 600 }}>Olympiacos</span> (H)</span>
      </div>
      <button style={{
        padding: '8px 18px', background: B.ink, color: B.paper, border: 'none',
        fontFamily: 'inherit', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', cursor: 'pointer',
      }}>Continue →</button>
    </div>
  );
}

function ChLeftRail() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, overflow: 'hidden' }}>
      <ChCard title="Demographics" hint="22 senior squad">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {DEMOGRAPHICS.map(d => (
            <div key={d.code} style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', alignItems: 'center', gap: 10 }}>
              <Flag code={d.code} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12 }}>{d.name}</span>
                <span style={{ flex: 1, height: 1, borderBottom: `1px dotted ${B.faint}` }} />
              </div>
              <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, fontWeight: 500 }}>
                {d.count}
              </span>
            </div>
          ))}
        </div>
      </ChCard>

      <ChCard title="On Loan" hint={`${LOANS.length} away`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {LOANS.map((l, i) => (
            <div key={l.name} style={{
              padding: '10px 0', display: 'flex', alignItems: 'flex-start', gap: 10,
              borderTop: i > 0 ? `1px dashed ${B.line}` : 'none',
            }}>
              <span style={{
                fontFamily: '"IBM Plex Mono", monospace', fontSize: 9, fontWeight: 600,
                background: B.paper2, padding: '2px 5px', color: B.ink2, marginTop: 2,
              }}>{l.pos}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{l.name}</span>
                <span style={{ fontSize: 11, color: B.muted, fontStyle: 'italic' }}>at {l.to} · until {l.until}</span>
              </div>
            </div>
          ))}
        </div>
      </ChCard>
    </div>
  );
}

function ChCard({ title, hint, children }) {
  return (
    <div style={{
      background: B.card, border: `1px solid ${B.line}`,
      padding: '16px 18px', position: 'relative',
      boxShadow: '2px 2px 0 rgba(28,26,22,.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${B.line}`,
      }}>
        <span style={{ fontFamily: '"Source Serif Pro", Georgia, serif', fontSize: 15, fontWeight: 600 }}>{title}</span>
        {hint && <span style={{ fontSize: 10, color: B.muted, fontStyle: 'italic' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ChPitchPanel({ tab, setTab, hovered, setHovered, selected, setSelected }) {
  return (
    <div style={{
      background: B.card, border: `1px solid ${B.line}`,
      display: 'flex', flexDirection: 'column', boxShadow: '2px 2px 0 rgba(28,26,22,.06)',
    }}>
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${B.line}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: '"Source Serif Pro", Georgia, serif', fontSize: 18, fontWeight: 600 }}>Tactics Board</span>
        <span style={{ fontSize: 11, color: B.muted, fontStyle: 'italic' }}>4-3-3 DM · positive · wide</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 0, border: `1px solid ${B.line}`, borderRadius: 0 }}>
          {['Combined', 'In Possession', 'Out of Possession'].map((t, i) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 12px', fontSize: 11, fontFamily: 'inherit',
              background: tab === t ? B.ink : 'transparent',
              color: tab === t ? B.paper : B.ink,
              border: 'none', borderLeft: i > 0 ? `1px solid ${B.line}` : 'none',
              cursor: 'pointer', fontWeight: tab === t ? 600 : 400,
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <ChPitch hovered={hovered} setHovered={setHovered} selected={selected} setSelected={setSelected} />
      </div>

      <div style={{ borderTop: `1px solid ${B.line}`, padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 28 }}>
        {[
          { l: 'Possession', v: '58%' },
          { l: 'xG / 90', v: '2.14' },
          { l: 'Shots on T', v: '6.2' },
          { l: 'Press eff.', v: 'High', good: true },
          { l: 'Morale', v: 'Good', good: true },
        ].map(s => (
          <div key={s.l} style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 10, color: B.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.l}</span>
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 16, fontWeight: 500, color: s.good ? B.good : B.ink }}>{s.v}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <button style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${B.ink}`, color: B.ink, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save tactic</button>
        <button style={{ padding: '8px 16px', background: B.accent, border: `1px solid ${B.accent}`, color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Set instructions</button>
      </div>
    </div>
  );
}

function ChPitch({ hovered, setHovered, selected, setSelected }) {
  const W = 700, H = Math.round(W * 68 / 105);
  const padX = 14, padY = 14;
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <svg width={W} height={H} style={{ display: 'block' }}>
        <defs>
          <pattern id="paper-noise" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill={B.pitch} />
            <circle cx="1" cy="1" r="0.4" fill="rgba(0,0,0,.04)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#paper-noise)" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={0} y={(H / 8) * i} width={W} height={H / 8}
            fill={i % 2 ? 'rgba(0,0,0,.015)' : 'transparent'} />
        ))}
        <PitchLinesB W={W} H={H} pad={{ x: padX, y: padY }} />
      </svg>

      <div style={{ position: 'absolute', top: 6, left: 14, fontSize: 10, color: B.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: '0.1em' }}>
        ATTACK ↑
      </div>
      <div style={{ position: 'absolute', bottom: 6, right: 14, fontSize: 9, color: B.faint, fontStyle: 'italic' }}>
        105 m × 68 m
      </div>

      {SQUAD.map(p => {
        const left = padX + (p.x / 100) * (W - padX * 2);
        const top  = padY + ((100 - p.y) / 100) * (H - padY * 2);
        return (
          <ChPlayerNode key={p.id} player={p} left={left} top={top}
            hovered={hovered === p.id} setHovered={setHovered}
            onSelect={() => setSelected(p)} />
        );
      })}
      {hovered && <ChTooltip player={SQUAD.find(p => p.id === hovered)} />}
    </div>
  );
}

function PitchLinesB({ W, H, pad }) {
  const x0 = pad.x, x1 = W - pad.x, y0 = pad.y, y1 = H - pad.y;
  const cx = W / 2, cy = H / 2;
  const boxW = (W - pad.x * 2) * 0.40;
  const boxH = (H - pad.y * 2) * 0.21;
  const sixW = boxW * 0.55;
  const sixH = boxH * 0.45;
  return (
    <g fill="none" stroke={B.pitchLine} strokeWidth="1.4" strokeLinecap="round">
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} />
      <line x1={x0} y1={cy} x2={x1} y2={cy} />
      <circle cx={cx} cy={cy} r={(H - pad.y * 2) * 0.13} />
      <circle cx={cx} cy={cy} r={2} fill={B.pitchLine} />
      <rect x={cx - boxW / 2} y={y0} width={boxW} height={boxH} />
      <rect x={cx - sixW / 2} y={y0} width={sixW} height={sixH} />
      <path d={`M ${cx - 18} ${y0 + boxH} A 22 22 0 0 0 ${cx + 18} ${y0 + boxH}`} />
      <rect x={cx - boxW / 2} y={y1 - boxH} width={boxW} height={boxH} />
      <rect x={cx - sixW / 2} y={y1 - sixH} width={sixW} height={sixH} />
      <path d={`M ${cx - 18} ${y1 - boxH} A 22 22 0 0 1 ${cx + 18} ${y1 - boxH}`} />
    </g>
  );
}

function ChPlayerNode({ player, left, top, hovered, setHovered, onSelect }) {
  return (
    <div
      onMouseEnter={() => setHovered(player.id)}
      onMouseLeave={() => setHovered(null)}
      onClick={onSelect}
      style={{
        position: 'absolute', left, top, transform: `translate(-50%, -50%) scale(${hovered ? 1.06 : 1})`,
        transition: 'transform .15s', cursor: 'pointer', zIndex: hovered ? 10 : 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        filter: hovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,.25))' : 'drop-shadow(0 1px 2px rgba(0,0,0,.15))',
      }}
    >
      <div style={{
        background: '#fbf6ec', border: `1px solid ${B.ink}`, borderRadius: 0,
        width: 60, padding: '2px 0',
        textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
      }}>{player.role}</div>
      <div style={{
        width: 38, height: 38, borderRadius: '50%', background: B.card,
        border: `1.5px solid ${B.ink}`, display: 'grid', placeItems: 'center',
        fontFamily: '"Source Serif Pro", Georgia, serif', fontSize: 18, fontWeight: 700,
      }}>{player.num}</div>
      <div style={{
        background: B.card, padding: '2px 6px', border: `1px solid ${B.line}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 64,
      }}>
        <span style={{ fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap', color: B.ink }}>{player.name}</span>
        <Stars value={player.rating} size={7} color={B.accent} empty={B.faint} />
      </div>
    </div>
  );
}

function ChTooltip({ player }) {
  if (!player) return null;
  return (
    <div style={{
      position: 'absolute', top: 12, right: 12, width: 220,
      background: '#fffaf0', border: `1px solid ${B.ink}`,
      padding: 12, fontSize: 11, zIndex: 20,
      boxShadow: '4px 4px 0 rgba(28,26,22,.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Flag code={player.nat} />
        <span style={{ fontFamily: '"Source Serif Pro", Georgia, serif', fontWeight: 600, fontSize: 13 }}>{player.name}</span>
        <span style={{ marginLeft: 'auto', fontFamily: '"IBM Plex Mono", monospace', color: B.muted, fontSize: 10 }}>#{player.num}</span>
      </div>
      <div style={{ fontSize: 10, color: B.muted, letterSpacing: '0.06em', marginBottom: 4, textTransform: 'uppercase' }}>Latest</div>
      <div style={{ color: B.ink2, lineHeight: 1.4, fontStyle: 'italic' }}>
        {player.rating >= 5 ? '"Has lifted training mood. Press: generational defender."' : 'Twisted ankle in training. Day-to-day.'}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: B.muted }}>
        <span>L5 <span style={{ color: B.ink }}>{player.rating >= 4 ? '7.6' : '6.9'}</span></span>
        <span>FIT <span style={{ color: player.rating >= 5 ? B.good : B.accent }}>{player.rating >= 5 ? '98%' : '82%'}</span></span>
      </div>
    </div>
  );
}

function ChRightRail() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
      <ChCard title="Newsroom" hint="today's wire">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {NEWS.map((n, i) => (
            <div key={i} style={{
              padding: '12px 0', borderTop: i > 0 ? `1px dashed ${B.line}` : 'none',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, fontFamily: '"IBM Plex Mono", monospace',
                  letterSpacing: '0.08em', color: tagColor(n.tag),
                  borderLeft: `2px solid ${tagColor(n.tag)}`, paddingLeft: 6,
                }}>{n.tag}</span>
                <span style={{ fontSize: 10, color: B.muted, fontStyle: 'italic', marginLeft: 'auto' }}>
                  {n.when || n.height}
                </span>
              </div>
              <div style={{ fontFamily: '"Source Serif Pro", Georgia, serif', fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{n.head}</div>
              <div style={{ fontSize: 11, color: B.ink2, lineHeight: 1.45 }}>{n.body}</div>
            </div>
          ))}
        </div>
      </ChCard>
    </div>
  );
}

function tagColor(tag) {
  return ({
    INJURY: B.accent, TRANSFER: '#5b6f3a', MATCH: '#3a5b6f',
    BOARD: '#6b3a6f', MEDIA: '#a06b1f', YOUTH: B.good,
  })[tag] || B.muted;
}

function ChDepthChart({ player, onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,26,22,.4)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 500, background: B.card, border: `1px solid ${B.ink}`,
        boxShadow: '8px 8px 0 rgba(28,26,22,.18)',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${B.line}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, color: B.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Position</div>
            <div style={{ fontFamily: '"Source Serif Pro", Georgia, serif', fontSize: 22, fontWeight: 600, marginTop: 2 }}>{DEPTH_CHART.position}</div>
            <div style={{ fontSize: 12, color: B.accent, fontStyle: 'italic', marginTop: 2 }}>{DEPTH_CHART.role}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', color: B.muted, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <DepthRowB label="1st choice" player={DEPTH_CHART.starter} starter />
          {DEPTH_CHART.backups.map((p, i) => (
            <DepthRowB key={i} label={`Backup ${i + 1}`} player={p} />
          ))}
          <div style={{ marginTop: 8, fontSize: 11, color: B.muted, fontStyle: 'italic', textAlign: 'center' }}>
            Drag to re-order hierarchy
          </div>
        </div>
      </div>
    </div>
  );
}

function DepthRowB({ label, player, starter }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '90px 32px 1fr auto auto', alignItems: 'center', gap: 14,
      padding: '10px 14px', background: starter ? '#f7e9c8' : '#fbf6ec',
      border: `1px solid ${starter ? B.accent : B.line}`,
    }}>
      <span style={{ fontSize: 10, color: starter ? B.accent : B.muted, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, color: B.muted }}>#{player.num}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{player.name}</span>
      <Stars value={player.rating} size={9} color={B.accent} empty={B.faint} />
      <span style={{ fontSize: 10, color: B.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{player.form}</span>
    </div>
  );
}

export { ChalkboardBoard };
