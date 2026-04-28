import React from 'react';
import { KitShirt, Flag, SQUAD, DEMOGRAPHICS, LOANS, NEWS, DEPTH_CHARTS } from './shared';

/** FIFA pitch length:width ≈ 105m × 68m — used for SVG and resize math */
const PITCH_ASPECT = 68 / 105;

/** Smallest rendered pitch (px); wrapper scrolls if the viewport is tighter */
const PITCH_MIN_HEIGHT = 320;
const PITCH_MIN_WIDTH = PITCH_MIN_HEIGHT * PITCH_ASPECT;

const C = {
  bg: '#f6f7f9', surface: '#ffffff', surface2: '#f0f2f5',
  line: '#e3e6eb', line2: '#d4d8df',
  text: '#0a1124', text2: '#3b4254', muted: '#6c7384', faint: '#9aa0ad',
  accent: '#0040ff', accentSoft: '#dde4ff',
  pitch: '#fafbfc', pitchLine: '#0a1124',
  good: '#057a55', warn: '#b45309', bad: '#c2410c',
};

function TelemetryBoard() {
  const [hovered, setHovered] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [depthCharts, setDepthCharts] = React.useState(DEPTH_CHARTS);
  const [rightTab, setRightTab] = React.useState('news');

  return (
    <div style={{
      width: '100%', height: '100vh', minHeight: '100vh', background: C.bg, color: C.text,
      fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
      fontSize: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <TmTopBar />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr 360px', gridTemplateRows: 'minmax(0, 1fr)', gap: 1, background: C.line, minHeight: 0 }}>
        <TmLeftRail />
        <TmPitchPanel hovered={hovered} setHovered={setHovered} setSelected={setSelected} depthCharts={depthCharts} />
        <TmRightRail rightTab={rightTab} setRightTab={setRightTab} />
      </div>
      {selected && <TmDepthChart player={selected} depthCharts={depthCharts} setDepthCharts={setDepthCharts} onClose={() => setSelected(null)} />}
    </div>
  );
}

function TmTopBar() {
  return (
    <div style={{
      height: 48, background: C.surface, borderBottom: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 22, height: 22, background: C.accent, borderRadius: 4, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>F</div>
        <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>fotapp</span>
      </div>
      <div style={{ flex: 1 }} />
    </div>
  );
}

function TmLeftRail() {
  const demoTotal = DEMOGRAPHICS.reduce((s, x) => s + x.count, 0);
  const topDemographics = [...DEMOGRAPHICS].sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div style={{ background: C.surface, padding: 18, display: 'flex', flexDirection: 'column', gap: 22, overflow: 'hidden' }}>
      <section>
        <TmSectionHead title="Demographics" right="22 senior" />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ color: C.muted, fontSize: 10, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.06em' }}>
              <th style={{ textAlign: 'left', fontWeight: 500, padding: '4px 0', borderBottom: `1px solid ${C.line}` }}>NAT</th>
              <th style={{ textAlign: 'left', fontWeight: 500, padding: '4px 0', borderBottom: `1px solid ${C.line}` }}>NATIONALITY</th>
              <th style={{ textAlign: 'right', fontWeight: 500, padding: '4px 0', borderBottom: `1px solid ${C.line}` }}>N</th>
              <th style={{ textAlign: 'right', fontWeight: 500, padding: '4px 0', borderBottom: `1px solid ${C.line}` }}>%</th>
            </tr>
          </thead>
          <tbody>
            {topDemographics.map(d => {
              const pct = demoTotal > 0 ? ((d.count / demoTotal) * 100).toFixed(0) : '0';
              return (
                <tr key={d.code} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <td style={{ padding: '7px 0' }}><Flag code={d.code} /></td>
                  <td style={{ padding: '7px 0', color: C.text }}>{d.name}</td>
                  <td style={{ padding: '7px 0', textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', fontVariantNumeric: 'tabular-nums' }}>{d.count}</td>
                  <td style={{ padding: '7px 0', textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', color: C.muted, fontVariantNumeric: 'tabular-nums' }}>{pct}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section>
        <TmSectionHead title="Out on Loan" right={`${LOANS.length}`} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {LOANS.map(l => (
            <div key={l.name} style={{
              padding: '8px 10px', background: C.surface2, borderRadius: 4,
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 4, alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 600, padding: '1px 4px', background: C.surface, color: C.text2, borderRadius: 2 }}>{l.pos}</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{l.name}</span>
              </div>
              <span style={{ fontSize: 10, color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}>{l.until}</span>
              <span style={{ gridColumn: '1 / -1', fontSize: 11, color: C.muted }}>→ {l.to}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

function TmSectionHead({ title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.text }}>{title}</span>
      {right && <span style={{ fontSize: 10, color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}>{right}</span>}
    </div>
  );
}

function TmPitchPanel({ hovered, setHovered, setSelected, depthCharts }) {
  return (
    <div style={{ background: C.surface, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, flex: 1 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: C.bg }}>
        <TmPitch hovered={hovered} setHovered={setHovered} setSelected={setSelected} depthCharts={depthCharts} />
      </div>
    </div>
  );
}

function TmPitch({ hovered, setHovered, setSelected, depthCharts }) {
  const wrapRef = React.useRef(null);
  const pitchRef = React.useRef(null);

  const initialDims = React.useMemo(() => {
    const H = typeof window !== 'undefined'
      ? Math.max(PITCH_MIN_HEIGHT, Math.min(820, window.innerHeight - 140))
      : Math.max(PITCH_MIN_HEIGHT, 820);
    return { W: H * PITCH_ASPECT, H };
  }, []);

  const [{ W, H }, setDims] = React.useState(initialDims);

  React.useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      const s = getComputedStyle(el);
      const padX = parseFloat(s.paddingLeft) + parseFloat(s.paddingRight);
      const padY = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
      const availW = el.clientWidth - padX;
      const availH = el.clientHeight - padY;
      let nextH = availH;
      let nextW = nextH * PITCH_ASPECT;
      if (nextW > availW) {
        nextW = availW;
        nextH = nextW / PITCH_ASPECT;
      }
      if (nextH < PITCH_MIN_HEIGHT) {
        nextH = PITCH_MIN_HEIGHT;
        nextW = PITCH_MIN_WIDTH;
      }
      setDims(prev =>
        Math.abs(prev.H - nextH) < 0.5 && Math.abs(prev.W - nextW) < 0.5 ? prev : { W: nextW, H: nextH },
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const padX = 12, padY = 12;

  const startingXI = React.useMemo(() => {
    return Object.values(depthCharts)
      .map(dc => {
        const squadPlayer = SQUAD.find(p => p.num === dc.starter.num);
        return squadPlayer ? { ...squadPlayer } : null;
      })
      .filter(p => p !== null);
  }, [depthCharts]);

  const [positions, setPositions] = React.useState(
    () => Object.fromEntries(startingXI.map(p => [p.id, { x: p.x ?? 50, y: p.y ?? 50 }]))
  );

  const onMovePlayer = React.useCallback((id, clientX, clientY) => {
    const rect = pitchRef.current.getBoundingClientRect();
    const rawX = ((clientX - rect.left - padX) / (W - padX * 2)) * 100;
    const rawY = ((clientY - rect.top  - padY) / (H - padY * 2)) * 100;
    setPositions(prev => ({
      ...prev,
      [id]: { x: Math.max(0, Math.min(100, rawX)), y: Math.max(0, Math.min(100, rawY)) },
    }));
  }, [W, H]);

  return (
    <div
      ref={wrapRef}
      style={{
        flex: 1,
        alignSelf: 'stretch',
        width: '100%',
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div ref={pitchRef} style={{ position: 'relative', width: W, height: H, flexShrink: 0, aspectRatio: '68 / 105', background: C.surface, border: `1px solid ${C.line}`, borderRadius: 4 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} preserveAspectRatio="xMidYMid meet" style={{ display: 'block', borderRadius: 4 }}>
        <defs>
          <pattern id="grid-tm" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke={C.line} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid-tm)" />
        <PitchLinesC W={W} H={H} pad={{ x: padX, y: padY }} />
      </svg>

      {startingXI.map(p => {
        const pos = positions[p.id] ?? { x: p.x ?? 50, y: p.y ?? 50 };
        const left = padX + (pos.x / 100) * (W - padX * 2);
        const top  = padY + (pos.y / 100) * (H - padY * 2);
        return (
          <TmPlayerNode key={p.id} player={p} left={left} top={top}
            hovered={hovered === p.id} setHovered={setHovered}
            onSelect={() => setSelected(p)}
            onMove={(cx, cy) => onMovePlayer(p.id, cx, cy)} />
        );
      })}
      {hovered && (() => {
        const hoveredPlayer = startingXI.find(p => p.id === hovered);
        if (!hoveredPlayer) return null;
        const pos = positions[hovered] ?? { x: hoveredPlayer.x ?? 50, y: hoveredPlayer.y ?? 50 };
        const left = padX + (pos.x / 100) * (W - padX * 2);
        const top  = padY + (pos.y / 100) * (H - padY * 2);
        return <TmTooltip player={hoveredPlayer} left={left} top={top} />;
      })()}
      </div>
    </div>
  );
}

function PitchLinesC({ W, H, pad }) {
  const x0 = pad.x, x1 = W - pad.x, y0 = pad.y, y1 = H - pad.y;
  const cx = W / 2, cy = H / 2;
  const innerW = x1 - x0, innerH = y1 - y0;
  const boxW = innerW * (40.32 / 68);
  const boxH = innerH * (16.5 / 105);
  const sixW = innerW * (18.32 / 68);
  const sixH = innerH * (5.5 / 105);
  const cR   = innerW * (9.15 / 68);
  return (
    <g fill="none" stroke={C.pitchLine} strokeWidth="1.1">
      <rect x={x0} y={y0} width={innerW} height={innerH} />
      <line x1={x0} y1={cy} x2={x1} y2={cy} />
      <circle cx={cx} cy={cy} r={cR} />
      <circle cx={cx} cy={cy} r={1.5} fill={C.pitchLine} />
      <rect x={cx - boxW / 2} y={y0} width={boxW} height={boxH} />
      <rect x={cx - sixW / 2} y={y0} width={sixW} height={sixH} />
      <circle cx={cx} cy={y0 + innerH * (11 / 105)} r={1.5} fill={C.pitchLine} />
      <path d={`M ${cx - 18} ${y0 + boxH} A ${cR} ${cR} 0 0 0 ${cx + 18} ${y0 + boxH}`} />
      <rect x={cx - boxW / 2} y={y1 - boxH} width={boxW} height={boxH} />
      <rect x={cx - sixW / 2} y={y1 - sixH} width={sixW} height={sixH} />
      <circle cx={cx} cy={y1 - innerH * (11 / 105)} r={1.5} fill={C.pitchLine} />
      <path d={`M ${cx - 18} ${y1 - boxH} A ${cR} ${cR} 0 0 1 ${cx + 18} ${y1 - boxH}`} />
    </g>
  );
}

function TmPlayerNode({ player, left, top, hovered, setHovered, onSelect, onMove }) {
  const didDrag = React.useRef(false);

  const onPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    didDrag.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
    setHovered(null);
  };

  const onPointerMove = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    didDrag.current = true;
    onMove(e.clientX, e.clientY);
  };

  const onPointerUp = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!didDrag.current) onSelect();
  };

  return (
    <div
      onMouseEnter={() => setHovered(player.id)}
      onMouseLeave={() => setHovered(null)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: 'absolute', left, top,
        transform: `translate(-50%, -50%) scale(${hovered ? 1.05 : 1})`,
        transition: 'transform .15s', cursor: 'grab', zIndex: hovered ? 10 : 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        filter: hovered ? 'drop-shadow(0 6px 12px rgba(10,17,36,.18))' : 'drop-shadow(0 1px 2px rgba(10,17,36,.08))',
        userSelect: 'none',
      }}
    >
      <KitShirt size={32} variant="solid" primary={C.accent} secondary="#fff" stroke="rgba(0,0,0,.2)" />
      <span style={{ fontSize: 10, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', background: C.surface, padding: '1px 5px', borderRadius: 2 }}>{player.name}</span>
    </div>
  );
}

function TmTooltip({ player, left, top }) {
  if (!player) return null;
  return (
    <div style={{
      position: 'absolute', left: left + 20, top: top - 60, width: 230,
      background: C.surface, border: `1px solid ${C.line}`, borderRadius: 6,
      boxShadow: '0 10px 30px rgba(10,17,36,.12)', padding: 12, fontSize: 11, zIndex: 20,
      pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.line}` }}>
        <Flag code={player.nat} />
        <span style={{ fontWeight: 600, fontSize: 12 }}>{player.name}</span>
      </div>
      <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Latest</div>
      <div style={{ color: C.text2, lineHeight: 1.4 }}>
        {player.rating >= 5 ? 'Excellent form — 8.4 avg over last 5 matches.' : 'Twisted ankle in training. 3-5 day assessment.'}
      </div>
    </div>
  );
}

function getPositionGroups() {
  const groups = {
    'Goalkeepers': [],
    'Defenders': [],
    'Midfielders': [],
    'Attackers': [],
  };

  SQUAD.forEach(p => {
    if (p.pos === 'GK') groups['Goalkeepers'].push(p);
    else if (['RB', 'CB', 'LB'].includes(p.pos)) groups['Defenders'].push(p);
    else if (['DM', 'CM', 'AM'].includes(p.pos)) groups['Midfielders'].push(p);
    else if (['RW', 'LW', 'ST'].includes(p.pos)) groups['Attackers'].push(p);
  });

  return Object.entries(groups).map(([name, players]) => ({ name, players }));
}

function TmRightRail({ rightTab, setRightTab }) {
  return (
    <div style={{ background: C.surface, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {['News', 'Roster'].map(tab => (
            <button
              key={tab}
              onClick={() => setRightTab(tab.toLowerCase())}
              style={{
                padding: '4px 10px', fontSize: 11, border: 'none',
                background: rightTab === tab.toLowerCase() ? C.accentSoft : 'transparent',
                color: rightTab === tab.toLowerCase() ? C.accent : C.muted,
                borderRadius: 3, cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: rightTab === tab.toLowerCase() ? 600 : 400,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {rightTab === 'news' && (
        <>
          <div style={{ display: 'flex', gap: 4 }}>
            {['All', 'Unread', 'Starred'].map((t, i) => (
              <button key={t} style={{
                padding: '3px 8px', fontSize: 11, border: 'none',
                background: i === 0 ? C.accentSoft : 'transparent',
                color: i === 0 ? C.accent : C.muted,
                borderRadius: 3, cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: i === 0 ? 600 : 400,
              }}>{t}{i === 1 ? ' · 4' : ''}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {NEWS.map((n, i) => (
              <div key={i} style={{
                padding: '12px 0', borderBottom: i < NEWS.length - 1 ? `1px solid ${C.line}` : 'none',
                display: 'grid', gridTemplateColumns: '4px 1fr', gap: 12,
              }}>
                <div style={{ width: 3, background: tmTagColor(n.tag), borderRadius: 2 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                      color: tmTagColor(n.tag), fontFamily: '"JetBrains Mono", monospace',
                    }}>{n.tag}</span>
                    <span style={{ fontSize: 10, color: C.muted, fontFamily: '"JetBrains Mono", monospace', marginLeft: 'auto' }}>
                      {n.when || n.height}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{n.head}</div>
                  <div style={{ fontSize: 11, color: C.text2, lineHeight: 1.45 }}>{n.body}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {rightTab === 'roster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {getPositionGroups().map(group => (
            <div key={group.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.muted }}>
                {group.name}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {group.players.map(p => (
                  <div key={p.id} style={{
                    padding: '8px 10px', background: C.surface2, borderRadius: 4,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 600, padding: '1px 4px', background: C.surface, color: C.text2, borderRadius: 2 }}>{p.pos}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: 10, color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}>#{p.num}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function tmTagColor(tag) {
  return ({
    INJURY: '#dc2626', TRANSFER: '#0040ff', MATCH: '#0891b2',
    BOARD: '#7c3aed', MEDIA: '#b45309', YOUTH: '#059669',
  })[tag] || C.muted;
}

function TmDepthChart({ player, depthCharts, setDepthCharts, onClose }) {
  const depthChart = depthCharts[player.pos];
  const allPlayers = depthChart.backups;

  const movePlayer = (idx, direction) => {
    if (direction === -1 && idx === 0) {
      // #1 backup moving up → swap with starter; block only if they're already starting elsewhere
      const firstNum = allPlayers[0].num;
      const firstIsStarterElsewhere = Object.keys(depthCharts).some(
        pos => pos !== player.pos && depthCharts[pos].starter.num === firstNum,
      );
      if (firstIsStarterElsewhere) return;

      const newBackups = [...allPlayers];
      const oldStarter = depthChart.starter;
      setDepthCharts({ ...depthCharts, [player.pos]: { starter: newBackups[0], backups: [oldStarter, ...newBackups.slice(1)] } });
    } else {
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= allPlayers.length) return;
      const newBackups = [...allPlayers];
      [newBackups[idx], newBackups[newIdx]] = [newBackups[newIdx], newBackups[idx]];
      setDepthCharts({ ...depthCharts, [player.pos]: { ...depthChart, backups: newBackups } });
    }
  };

  const swapStarter = () => {
    if (depthChart.backups.length > 0) {
      // Check if the backup is already a starter elsewhere
      const backupNum = depthChart.backups[0].num;
      const otherPositions = Object.keys(depthCharts).filter(pos => pos !== player.pos);
      const isStarterElsewhere = otherPositions.some(pos => depthCharts[pos].starter.num === backupNum);

      if (isStarterElsewhere) {
        return; // Can't swap if already a starter elsewhere
      }

      const newBackups = [...depthChart.backups];
      const oldStarter = depthChart.starter;
      setDepthCharts({ ...depthCharts, [player.pos]: { starter: newBackups[0], backups: [oldStarter, ...newBackups.slice(1)] } });
    }
  };

  const addPlayer = (p) => {
    const isInChart = depthChart.starter.num === p.num || depthChart.backups.some(b => b.num === p.num);
    if (isInChart) {
      setDepthCharts({ ...depthCharts, [player.pos]: { ...depthChart, backups: depthChart.backups.filter(b => b.num !== p.num) } });
    } else {
      setDepthCharts({
        ...depthCharts,
        [player.pos]: {
          ...depthChart,
          backups: [...depthChart.backups, { name: p.name, num: p.num, age: p.age ?? 25 }],
        },
      });
    }
  };

  const inChart = new Set([depthChart.starter.num, ...depthChart.backups.map(b => b.num)]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,17,36,.4)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 980, maxHeight: '80vh', background: C.surface, borderRadius: 10,
        boxShadow: '0 30px 80px rgba(10,17,36,.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Position depth</div>
          <button onClick={onClose} style={{ background: C.surface2, border: 'none', borderRadius: 4, width: 28, height: 28, fontSize: 16, cursor: 'pointer', color: C.muted }}>×</button>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: C.line, minHeight: 0, overflow: 'hidden' }}>
          {/* Depth Chart */}
          <div style={{ background: C.bg, padding: 20, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(() => {
              const firstBackupNum = depthChart.backups.length > 0 ? depthChart.backups[0].num : null;
              const isFirstBackupStarterElsewhere = firstBackupNum ? Object.keys(depthCharts).some(pos => pos !== player.pos && depthCharts[pos].starter.num === firstBackupNum) : false;
              return <DepthRowC label="Starter" player={depthChart.starter} starter onSwapDown={() => swapStarter()} hasBackups={depthChart.backups.length > 0 && !isFirstBackupStarterElsewhere} />;
            })()}
            {depthChart.backups.map((p, i) => {
              const isStarterElsewhere = Object.keys(depthCharts).some(pos => pos !== player.pos && depthCharts[pos].starter.num === p.num);
              return (
                <DepthRowDrag
                  key={i}
                  idx={i}
                  label={`Backup ${i + 1}`}
                  player={p}
                  totalBackups={depthChart.backups.length}
                  onMoveUp={() => movePlayer(i, -1)}
                  onMoveDown={() => movePlayer(i, 1)}
                  isStarterElsewhere={isStarterElsewhere}
                />
              );
            })}
            <div style={{ fontSize: 11, color: C.muted, marginTop: 'auto', paddingTop: 8, borderTop: `1px solid ${C.line}` }}>
              Use ↑↓ to reorder
            </div>
          </div>

          {/* Team Roster */}
          <div style={{ background: C.surface, padding: 20, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.text, marginBottom: 8 }}>Team Roster ({SQUAD.length})</div>
            {SQUAD.map(p => {
              const isSelected = inChart.has(p.num);
              const starterElsewhere = Object.keys(depthCharts).some(
                pos => pos !== player.pos && depthCharts[pos].starter.num === p.num,
              );
              return (
                <div
                  key={p.id}
                  onClick={() => addPlayer(p)}
                  style={{
                    padding: '10px 12px',
                    background: isSelected ? C.accentSoft : C.surface2,
                    borderRadius: 4,
                    border: `1px solid ${isSelected ? C.accent : C.line}`,
                    cursor: 'pointer',
                    fontSize: 11,
                    display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s',
                  }}
                >
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600, color: C.muted }}>#{p.num}</span>
                  <span style={{ flex: 1, color: C.text }}>{p.name}</span>
                  <span style={{ fontSize: 9, color: C.muted }}>{p.pos}</span>
                  {isSelected && <span style={{ fontSize: 10, color: C.accent, fontWeight: 600 }}>✓</span>}
                  {starterElsewhere && (
                    <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }} title="Starter in another position">
                      ⭐
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DepthRowDrag({ idx, label, player, totalBackups, onMoveUp, onMoveDown, isStarterElsewhere }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '80px 28px 1fr auto auto auto auto', alignItems: 'center', gap: 12,
      padding: '10px 14px', background: isStarterElsewhere ? C.accentSoft : C.surface,
      border: `1px solid ${isStarterElsewhere ? C.accent : C.line}`, borderRadius: 6,
    }}>
      <span style={{ fontSize: 10, color: isStarterElsewhere ? C.accent : C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>#{player.num}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{player.name}</span>
      <span style={{ fontSize: 10, color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}>Age {player.age}</span>
      <button
        onClick={onMoveUp}
        disabled={isStarterElsewhere && idx === 0}
        title={isStarterElsewhere && idx === 0 ? 'Starter elsewhere — cannot take this #1 slot' : undefined}
        style={{
          width: 24, height: 24, padding: 0, border: 'none', borderRadius: 3,
          background: isStarterElsewhere && idx === 0 ? C.line : C.accentSoft,
          color: isStarterElsewhere && idx === 0 ? C.faint : C.accent,
          cursor: isStarterElsewhere && idx === 0 ? 'not-allowed' : 'pointer',
          fontSize: 12, fontWeight: 600,
        }}
      >
        ↑
      </button>
      <button
        onClick={onMoveDown}
        disabled={idx === totalBackups - 1}
        style={{
          width: 24, height: 24, padding: 0, border: 'none', borderRadius: 3,
          background: idx === totalBackups - 1 ? C.line : C.accentSoft, color: idx === totalBackups - 1 ? C.faint : C.accent,
          cursor: idx === totalBackups - 1 ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600,
        }}
      >
        ↓
      </button>
    </div>
  );
}

function DepthRowC({ label, player, starter, onSwapDown, hasBackups }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '80px 28px 1fr auto auto auto auto', alignItems: 'center', gap: 12,
      padding: '10px 14px', background: C.surface,
      border: `1px solid ${starter ? C.accent : C.line}`, borderRadius: 6,
    }}>
      <span style={{ fontSize: 10, color: starter ? C.accent : C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: C.muted, fontVariantNumeric: 'tabular-nums' }}>#{player.num}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{player.name}</span>
      <span style={{ fontSize: 10, color: C.muted, fontFamily: '"JetBrains Mono", monospace' }}>Age {player.age}</span>
      <button
        disabled
        style={{
          width: 24, height: 24, padding: 0, border: 'none', borderRadius: 3,
          background: C.line, color: C.faint,
          cursor: 'not-allowed', fontSize: 12, fontWeight: 600,
        }}
      >
        ↑
      </button>
      <button
        onClick={onSwapDown}
        disabled={!hasBackups}
        style={{
          width: 24, height: 24, padding: 0, border: 'none', borderRadius: 3,
          background: !hasBackups ? C.line : C.accentSoft, color: !hasBackups ? C.faint : C.accent,
          cursor: !hasBackups ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 600,
        }}
      >
        ↓
      </button>
    </div>
  );
}

export { TelemetryBoard };
