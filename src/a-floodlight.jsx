import React from 'react';
import { KitShirt, Stars, Flag, SQUAD, DEMOGRAPHICS, LOANS, NEWS, DEPTH_CHARTS as DEPTH_CHART } from './shared';

const A = {
  bg: '#0d1014', surface: '#141a21', surface2: '#1a2129',
  line: '#222b35', text: '#e8edf2', muted: '#7a8794', dim: '#4d5763',
  accent: '#c6f24e', pitch: '#0f3f25', pitchAlt: '#0c3621',
  pitchLine: 'rgba(255,255,255,.55)', warn: '#f59e0b', bad: '#ef4444',
};

function FloodlightBoard() {
  const [hovered, setHovered] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [tab, setTab] = React.useState('Combined');
  return (
    <div style={{
      width: 1440, height: 920, background: A.bg, color: A.text,
      fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
      fontSize: 13, display: 'flex', flexDirection: 'column', letterSpacing: '-0.005em',
    }}>
      <FlTopBar />
      <div style={{
        flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 340px',
        gap: 1, background: A.line, minHeight: 0,
      }}>
        <FlLeftRail />
        <FlPitchPanel tab={tab} setTab={setTab} hovered={hovered} setHovered={setHovered} selected={selected} setSelected={setSelected} />
        <FlRightRail />
      </div>
      {selected && <FlDepthChart player={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function FlTopBar() {
  return (
    <div style={{
      height: 52, background: A.surface, borderBottom: `1px solid ${A.line}`,
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 24, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 4, background: A.accent, display: 'grid', placeItems: 'center', color: '#0d1014', fontWeight: 800, fontSize: 14 }}>F</div>
        <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>FOTAPP</span>
      </div>
      <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
        {['Squad', 'Tactics', 'Schedule', 'Transfers', 'Scouting'].map((t, i) => (
          <div key={t} style={{
            padding: '8px 14px', fontSize: 12, fontWeight: 500,
            color: i === 1 ? A.text : A.muted,
            borderBottom: i === 1 ? `2px solid ${A.accent}` : '2px solid transparent',
            cursor: 'pointer',
          }}>{t}</div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: A.muted, fontFamily: 'JetBrains Mono, monospace' }}>
        <span>FORMATION</span>
        <span style={{ color: A.text, fontWeight: 600 }}>4-3-3 DM</span>
      </div>
    </div>
  );
}

function FlLeftRail() {
  const max = Math.max(...DEMOGRAPHICS.map(x => x.count));
  return (
    <div style={{ background: A.surface, padding: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <section>
        <FlSectionHead title="Demographics" hint="22 senior squad" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DEMOGRAPHICS.map(d => (
            <div key={d.code} style={{ display: 'grid', gridTemplateColumns: '18px 1fr auto', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <Flag code={d.code} />
              <div style={{ position: 'relative', height: 18, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: A.surface2, borderRadius: 2 }} />
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(d.count / max) * 100}%`, background: d.code === 'GR' ? A.accent : A.dim, opacity: d.code === 'GR' ? 1 : 0.6, borderRadius: 2 }} />
                <span style={{ position: 'relative', paddingLeft: 8, color: d.code === 'GR' ? '#0d1014' : A.text, fontWeight: 500 }}>{d.name}</span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: A.muted, fontVariantNumeric: 'tabular-nums' }}>{String(d.count).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <FlSectionHead title="Out on Loan" hint={`${LOANS.length} active`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LOANS.map(l => (
            <div key={l.name} style={{ padding: 10, background: A.surface2, borderRadius: 4, borderLeft: `2px solid ${A.dim}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 500, fontSize: 12 }}>{l.name}</span>
                <span style={{ color: A.muted, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{l.pos}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: A.muted }}>
                <span>→ {l.to}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>UNTIL {l.until.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FlSectionHead({ title, hint }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${A.line}` }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</span>
      {hint && <span style={{ fontSize: 10, color: A.muted, fontFamily: 'JetBrains Mono, monospace' }}>{hint}</span>}
    </div>
  );
}

function FlPitchPanel({ tab, setTab, hovered, setHovered, selected, setSelected }) {
  return (
    <div style={{ background: A.bg, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '14px 24px',
        borderBottom: `1px solid ${A.line}`, gap: 4, flexShrink: 0,
      }}>
        {['Combined', 'In Possession', 'Out of Possession'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 14px', fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
            background: tab === t ? A.surface2 : 'transparent',
            color: tab === t ? A.text : A.muted,
            border: `1px solid ${tab === t ? A.line : 'transparent'}`,
            borderRadius: 4, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 0 }}>
        <FlPitch hovered={hovered} setHovered={setHovered} selected={selected} setSelected={setSelected} />
      </div>
    </div>
  );
}

function FlPitch({ hovered, setHovered, selected, setSelected }) {
  const W = 760;
  const H = W * 68 / 105;
  const padX = 14, padY = 14;
  return (
    <div style={{ position: 'relative', width: W, height: H, aspectRatio: '105 / 68' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} preserveAspectRatio="xMidYMid meet" style={{
        display: 'block', background: `linear-gradient(180deg, ${A.pitch} 0%, ${A.pitchAlt} 100%)`,
        borderRadius: 4, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.05)',
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={(W / 12) * i} y={0} width={W / 12} height={H} fill={i % 2 ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.04)'} />
        ))}
        <PitchLines W={W} H={H} pad={{ x: padX, y: padY }} stroke={A.pitchLine} />
      </svg>

      <div style={{ position: 'absolute', top: -22, left: 4, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: A.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
        <span>ATTACK</span>
        <svg width="20" height="8" viewBox="0 0 20 8" fill="none" stroke={A.accent} strokeWidth="1.2"><path d="M2 4h16M14 1l4 3-4 3" /></svg>
      </div>
      <div style={{ position: 'absolute', bottom: -22, right: 4, fontSize: 9, color: A.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>
        105 m × 68 m
      </div>

      {SQUAD.map(p => {
        const left = padX + (p.x / 100) * (W - padX * 2);
        const top  = padY + ((100 - p.y) / 100) * (H - padY * 2);
        return (
          <FlPlayerNode key={p.id} player={p} left={left} top={top}
            hovered={hovered === p.id} setHovered={setHovered}
            onSelect={() => setSelected(p)} />
        );
      })}
      {hovered && <FlTooltip player={SQUAD.find(p => p.id === hovered)} />}
    </div>
  );
}

function PitchLines({ W, H, pad, stroke }) {
  const x0 = pad.x, x1 = W - pad.x, y0 = pad.y, y1 = H - pad.y;
  const cx = W / 2, cy = H / 2;
  const innerW = x1 - x0, innerH = y1 - y0;
  const boxW = innerW * (40.32 / 68);
  const boxH = innerH * (16.5 / 105);
  const sixW = innerW * (18.32 / 68);
  const sixH = innerH * (5.5 / 105);
  const cR   = innerH * (9.15 / 105);
  return (
    <g fill="none" stroke={stroke} strokeWidth="1">
      <rect x={x0} y={y0} width={innerW} height={innerH} />
      <line x1={x0} y1={cy} x2={x1} y2={cy} />
      <circle cx={cx} cy={cy} r={cR} />
      <circle cx={cx} cy={cy} r={1.5} fill={stroke} />
      <rect x={cx - boxW / 2} y={y0} width={boxW} height={boxH} />
      <rect x={cx - sixW / 2} y={y0} width={sixW} height={sixH} />
      <circle cx={cx} cy={y0 + innerH * (11 / 105)} r={1.5} fill={stroke} />
      <path d={`M ${cx - 18} ${y0 + boxH} A ${cR} ${cR} 0 0 0 ${cx + 18} ${y0 + boxH}`} />
      <rect x={cx - boxW / 2} y={y1 - boxH} width={boxW} height={boxH} />
      <rect x={cx - sixW / 2} y={y1 - sixH} width={sixW} height={sixH} />
      <circle cx={cx} cy={y1 - innerH * (11 / 105)} r={1.5} fill={stroke} />
      <path d={`M ${cx - 18} ${y1 - boxH} A ${cR} ${cR} 0 0 1 ${cx + 18} ${y1 - boxH}`} />
    </g>
  );
}

function FlPlayerNode({ player, left, top, hovered, setHovered, onSelect }) {
  const ratingColor = player.rating >= 5 ? A.accent : player.rating >= 4 ? '#a8d63a' : A.muted;
  return (
    <div
      onMouseEnter={() => setHovered(player.id)}
      onMouseLeave={() => setHovered(null)}
      onClick={onSelect}
      style={{
        position: 'absolute', left, top, transform: `translate(-50%, -50%) scale(${hovered ? 1.06 : 1})`,
        transition: 'transform .15s', cursor: 'pointer', zIndex: hovered ? 10 : 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        filter: hovered ? 'drop-shadow(0 6px 12px rgba(0,0,0,.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,.4))',
      }}
    >
      <div style={{ padding: '1px 6px', background: 'rgba(13,16,20,.85)', border: `1px solid ${A.accent}`, borderRadius: 2, color: A.accent, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'JetBrains Mono, monospace' }}>{player.role}</div>
      <KitShirt size={32} variant="stripes" primary="#142a4f" secondary="#ffffff" stroke="rgba(0,0,0,.4)" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: 'rgba(13,16,20,.9)', padding: '2px 6px', borderRadius: 2, border: `1px solid ${A.line}`, minWidth: 60 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: A.text, whiteSpace: 'nowrap' }}>{player.name}</span>
        <Stars value={player.rating} size={7} color={ratingColor} empty="rgba(255,255,255,.15)" />
      </div>
    </div>
  );
}

function FlTooltip({ player }) {
  if (!player) return null;
  return (
    <div style={{ position: 'absolute', top: 8, right: 8, width: 220, background: A.surface, border: `1px solid ${A.line}`, borderRadius: 4, padding: 12, fontSize: 11, zIndex: 20, boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Flag code={player.nat} />
        <span style={{ fontWeight: 600, fontSize: 12 }}>{player.name}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', color: A.muted, fontSize: 10 }}>#{player.num}</span>
      </div>
      <div style={{ borderTop: `1px solid ${A.line}`, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 10, color: A.muted, letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>LATEST</div>
        <div style={{ color: A.text, lineHeight: 1.4 }}>
          {player.rating >= 5 ? 'Excellent form — 8.4 avg over last 5.' : 'Twisted ankle in training. 3-5 day assessment.'}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 4, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: A.muted }}>
          <span>L5 <span style={{ color: A.text }}>{player.rating >= 4 ? '7.6' : '6.9'}</span></span>
          <span>FIT <span style={{ color: player.rating >= 5 ? A.accent : A.warn }}>{player.rating >= 5 ? '98%' : '82%'}</span></span>
          <span>MOR <span style={{ color: A.text }}>GOOD</span></span>
        </div>
      </div>
    </div>
  );
}

function FlRightRail() {
  return (
    <div style={{ background: A.surface, padding: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Team News</span>
        <span style={{ fontSize: 10, color: A.muted, fontFamily: 'JetBrains Mono, monospace' }}>{NEWS.length} ITEMS</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
        {NEWS.map((n, i) => (
          <div key={i} style={{ padding: '14px 0', borderBottom: i < NEWS.length - 1 ? `1px solid ${A.line}` : 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <NewsTag tag={n.tag} />
              <span style={{ fontSize: 10, color: A.muted, fontFamily: 'JetBrains Mono, monospace', marginLeft: 'auto' }}>
                {(n.when || n.height || '').toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: A.text, lineHeight: 1.3 }}>{n.head}</div>
            <div style={{ fontSize: 11, color: A.muted, lineHeight: 1.4 }}>{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsTag({ tag }) {
  const map = {
    INJURY:   { fg: '#fda4af', bg: 'rgba(239,68,68,.15)' },
    TRANSFER: { fg: A.accent, bg: 'rgba(198,242,78,.12)' },
    MATCH:    { fg: '#93c5fd', bg: 'rgba(59,130,246,.15)' },
    BOARD:    { fg: '#d8b4fe', bg: 'rgba(168,85,247,.15)' },
    MEDIA:    { fg: '#fcd34d', bg: 'rgba(245,158,11,.15)' },
    YOUTH:    { fg: '#86efac', bg: 'rgba(34,197,94,.15)' },
  };
  const c = map[tag] || { fg: A.muted, bg: A.surface2 };
  return (
    <span style={{ padding: '2px 6px', background: c.bg, color: c.fg, fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', borderRadius: 2, fontFamily: 'JetBrains Mono, monospace' }}>{tag}</span>
  );
}

function FlDepthChart({ player, onClose }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, background: A.surface, border: `1px solid ${A.line}`, borderRadius: 6, boxShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${A.line}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, color: A.muted, letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>POSITION</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>{DEPTH_CHART.position}</div>
            <div style={{ fontSize: 12, color: A.accent, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{DEPTH_CHART.role}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: A.muted, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DepthSlot label="1ST CHOICE" player={DEPTH_CHART.starter} starter />
          {DEPTH_CHART.backups.map((p, i) => (
            <DepthSlot key={i} label={`BACKUP ${i + 1}`} player={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DepthSlot({ label, player, starter }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '70px 32px 1fr auto auto', alignItems: 'center', gap: 14, padding: '10px 12px', background: starter ? 'rgba(198,242,78,.06)' : A.surface2, borderLeft: `2px solid ${starter ? A.accent : A.dim}`, borderRadius: 2 }}>
      <span style={{ fontSize: 10, color: starter ? A.accent : A.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: A.muted, fontVariantNumeric: 'tabular-nums' }}>#{player.num}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{player.name}</span>
      <Stars value={player.rating} size={9} color={A.accent} empty="rgba(255,255,255,.15)" />
      <span style={{ fontSize: 10, color: A.muted, fontFamily: 'JetBrains Mono, monospace' }}>{player.form}</span>
    </div>
  );
}

export { FloodlightBoard };
