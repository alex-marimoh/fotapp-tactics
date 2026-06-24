import React from 'react';
import {
  ROSTER, FORMATIONS, FORMATION_NAMES, PLACEHOLDER_NEWS, POSITION_TYPES, TIER_LABEL,
  buildDepth, healthOf, effectiveStarterNum, complianceOf, tierFor, HEALTH_LABEL,
} from './squad-data';

// Full skin schema — colors PLUS style tokens (font, radius, glow, flat, borders).
// The layout never changes; a skin only swaps these values. Override per render
// with the `skin` prop. DEFAULT_SKIN is the chosen "Enterprise / SaaS blue" look:
// light corporate surfaces, blue accent, neutral grays, flat (no gradient/glow).
export const DEFAULT_SKIN = {
  bg: '#f5f7fa', panel: '#ffffff', text: '#1f2937', surface: '#ffffff',
  accent: '#2563eb', accentDark: '#1d4ed8', accent2: '#7c3aed', onAccent: '#ffffff',
  solid: '#16a34a', thin: '#d97706', gap: '#dc2626', oop: '#8b5cf6',
  pitch: ['#dcebe1', '#cfe3d6', '#c3dccb'],
  ribbon: ['#ffffff', '#f5f7fa'],
  cardFrom: '#ffffff', cardTo: '#f8fafc',
  // style tokens
  font: '"Inter", -apple-system, system-ui, sans-serif',
  display: '"Inter", -apple-system, system-ui, sans-serif',
  radius: 8, pill: 6,
  glow: false, flat: true,
  line: 'rgba(31,41,55,.30)',
  hair: 'rgba(15,23,42,.10)',
  hair2: 'rgba(15,23,42,.16)',
  soft: 'rgba(15,23,42,.03)',
};

const ThemeContext = React.createContext(DEFAULT_SKIN);
const useT = () => React.useContext(ThemeContext);
const hcOf = (T) => ({ solid: T.solid, thin: T.thin, gap: T.gap });
const tierColorOf = (T) => ({ nat: T.solid, sec: T.oop, oop: T.oop });

// #rrggbb + alpha -> rgba(), for skin-derived translucent fills.
const withA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const attackerSlot = (slots) => (slots.find((s) => s.type === 'ST') || slots[0]).id;

// True on wide screens — drives the landscape-pitch layout.
function useWide(bp = 1080) {
  const [wide, setWide] = React.useState(() => typeof window !== 'undefined' && window.innerWidth >= bp);
  React.useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= bp);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [bp]);
  return wide;
}

export function TacticsBoard({ skin = DEFAULT_SKIN }) {
  const T = skin;
  const hc = hcOf(T);
  const tierColor = tierColorOf(T);
  const wide = useWide(1080); // landscape pitch + pitch-weighted columns on wide screens
  // Size the pitch to the largest true-proportion (105:68) box that fits — never stretched.
  const pitchWrapRef = React.useRef(null);
  const [pitchBox, setPitchBox] = React.useState({ w: 0, h: 0 });
  React.useEffect(() => {
    const el = pitchWrapRef.current;
    if (!el) return;
    const ratio = wide ? 105 / 68 : 68 / 105;
    const fit = () => {
      const cw = el.clientWidth, ch = el.clientHeight;
      let w = cw, h = cw / ratio;
      if (h > ch) { h = ch; w = ch * ratio; }
      setPitchBox({ w: Math.round(w), h: Math.round(h) });
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();
    return () => ro.disconnect();
  }, [wide]);
  const [roster, setRoster] = React.useState(ROSTER);
  const [formation, setFormation] = React.useState(FORMATION_NAMES[0]);
  const [depthMap, setDepthMap] = React.useState(() => ({ [FORMATION_NAMES[0]]: buildDepth(ROSTER, FORMATIONS[FORMATION_NAMES[0]]) }));
  const [selected, setSelected] = React.useState(() => attackerSlot(FORMATIONS[FORMATION_NAMES[0]]));
  const [leaving, setLeaving] = React.useState(() => new Set());
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [adding, setAdding] = React.useState(null); // slot id being added to
  const [addTab, setAddTab] = React.useState('roster');
  const [form, setForm] = React.useState({ name: '', type: 'CB', reg: 'eu', age: '21', rating: '3' });
  const [infoView, setInfoView] = React.useState('news'); // 'news' | 'roster'

  const allByNum = React.useMemo(() => Object.fromEntries(roster.map((p) => [p.num, p])), [roster]);
  const slots = FORMATIONS[formation];
  const depth = depthMap[formation] || buildDepth(roster, slots);

  const toggle = (num) => setLeaving((prev) => {
    const next = new Set(prev);
    next.has(num) ? next.delete(num) : next.add(num);
    return next;
  });

  const chooseFormation = (name) => {
    setMenuOpen(false);
    setDepthMap((m) => (m[name] ? m : { ...m, [name]: buildDepth(roster, FORMATIONS[name]) }));
    setFormation(name);
    setSelected(attackerSlot(FORMATIONS[name]));
  };

  const editSlot = (slotId, updater) =>
    setDepthMap((m) => ({ ...m, [formation]: { ...m[formation], [slotId]: updater(m[formation][slotId]) } }));

  const makeStarter = (slotId, idx) => editSlot(slotId, (d) => {
    const backups = [...d.backups];
    const promoted = backups.splice(idx, 1)[0];
    return { starter: promoted, backups: d.starter ? [d.starter, ...backups] : backups };
  });
  const moveBackup = (slotId, idx, dir) => editSlot(slotId, (d) => {
    const j = idx + dir;
    if (j < 0 || j >= d.backups.length) return d;
    const b = [...d.backups];
    [b[idx], b[j]] = [b[j], b[idx]];
    return { ...d, backups: b };
  });
  const removeAt = (slotId, i) => editSlot(slotId, (d) => {
    if (i === 0) { const [first, ...rest] = d.backups; return { starter: first || null, backups: rest }; }
    return { ...d, backups: d.backups.filter((_, k) => k !== i - 1) };
  });

  const openAdd = (slotId) => {
    const slot = slots.find((s) => s.id === slotId);
    setForm({ name: '', type: slot.type, reg: 'eu', age: '21', rating: '3' });
    setAddTab('roster');
    setAdding(slotId);
  };
  const addFromRoster = (slotId, num) => {
    const slot = slots.find((s) => s.id === slotId);
    editSlot(slotId, (d) => ({ ...d, backups: [...d.backups, { num, tier: tierFor(allByNum[num], slot.type) }] }));
    setAdding(null);
  };
  const createPlayer = (slotId) => {
    const slot = slots.find((s) => s.id === slotId);
    const num = Math.max(...roster.map((p) => p.num)) + 1;
    const player = { num, name: form.name.trim() || `New ${form.type}`, age: Number(form.age) || 21,
      nat: '—', reg: form.reg, rating: Number(form.rating) || 3, pos: [form.type], pos2: [] };
    setRoster((r) => [...r, player]);
    editSlot(slotId, (d) => ({ ...d, backups: [...d.backups, { num, tier: tierFor(player, slot.type) }] }));
    setAdding(null);
  };

  const comp = complianceOf(roster, leaving);
  const selDepth = depth[selected];
  const selSlot = slots.find((s) => s.id === selected);

  return (
    <ThemeContext.Provider value={T}>
    <div style={{ width: '100%', height: '100vh', background: T.bg, color: T.text,
      fontFamily: T.font,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ribbon (branding only) */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px',
        background: T.flat ? T.ribbon[0] : `linear-gradient(90deg,${T.ribbon[0]},${T.ribbon[1]})`,
        borderBottom: `1px solid ${T.hair}`, flexShrink: 0 }}>
        <span style={{ fontWeight: 850, fontSize: 18, letterSpacing: '-0.02em', fontFamily: T.display,
          background: `linear-gradient(90deg,${T.accent},${T.accent2})`, WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent' }}>fotapp</span>
        <span style={{ fontSize: 13, opacity: 0.55, fontWeight: 600 }}>Build your season</span>
      </div>

      {/* hero: pitch half | info half (pitch widens on wide screens) */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid',
        gridTemplateColumns: wide ? 'minmax(0, 1.5fr) minmax(300px, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: 1, background: T.hair }}>

        {/* pitch half — controls live in this view */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column',
          padding: 16, gap: 12, minHeight: 0, minWidth: 0,
          background: T.flat ? T.pitch[1] : `radial-gradient(120% 90% at 50% 0%, ${T.pitch[0]} 0%, ${T.pitch[1]} 55%, ${T.pitch[2]} 100%)` }}>

          {/* in-pitch control row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen((o) => !o)}
                style={{ padding: '8px 16px', borderRadius: T.pill, border: 'none',
                  background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`, color: T.onAccent, fontWeight: 800,
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>{formation} ▾</button>
              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 50,
                    background: T.surface, border: `1px solid ${T.hair2}`, borderRadius: T.radius,
                    padding: 4, minWidth: 150, boxShadow: '0 12px 32px rgba(0,0,0,.5)',
                    maxHeight: 320, overflowY: 'auto' }}>
                    {FORMATION_NAMES.map((name) => (
                      <button key={name} onClick={() => chooseFormation(name)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                          background: name === formation ? withA(T.accent, 0.18) : 'transparent',
                          color: T.text, padding: '9px 12px', borderRadius: Math.max(0, T.radius - 5), fontSize: 13,
                          fontWeight: name === formation ? 800 : 500, fontFamily: 'inherit' }}>{name}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div style={{ flex: 1 }} />
            <CompChip label="Non-EU" c={comp.noneu} />
            <CompChip label="Homegrown" c={comp.home} />
          </div>

          {/* pitch — portrait when narrow, landscape (attack →) when wide; sized to true 105:68, never stretched */}
          <div ref={pitchWrapRef} style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: pitchBox.w || '100%', height: pitchBox.h || '100%' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ position: 'absolute', background: i % 2 ? T.soft : 'transparent',
                ...(wide
                  ? { top: 0, bottom: 0, left: `${(i / 9) * 100}%`, width: `${100 / 9}%` }
                  : { left: 0, right: 0, top: `${(i / 9) * 100}%`, height: `${100 / 9}%` }) }} />
            ))}
            <div style={{ position: 'absolute', inset: 0 }}><PitchSvg horizontal={wide} /></div>

            {slots.map((slot) => {
              const h = healthOf(depth, slot.id, leaving);
              const pn = effectiveStarterNum(depth, slot.id, leaving);
              const p = pn && allByNum[pn];
              const isSel = selected === slot.id;
              // Wide: rotate the vertical (left/top) layout 90° so attack points right.
              const nx = wide ? 100 - slot.top : slot.left;
              const ny = wide ? slot.left : slot.top;
              const sz = wide ? 46 : 42;
              return (
                <div key={slot.id} onClick={() => setSelected(slot.id)}
                  style={{ position: 'absolute', left: `${nx}%`, top: `${ny}%`,
                    transform: `translate(-50%,-50%) scale(${isSel ? 1.08 : 1})`, transition: 'transform .15s',
                    cursor: 'pointer', textAlign: 'center', zIndex: isSel ? 6 : 3 }}>
                  <div style={{ width: sz, height: sz, borderRadius: '50%', margin: '0 auto',
                    background: withA(T.bg, 0.8), border: `2.5px solid ${hc[h]}`,
                    boxShadow: T.glow ? `0 0 14px ${hc[h]}66, 0 4px 10px rgba(0,0,0,.45)` : 'none',
                    display: 'grid', placeItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: wide ? 15 : 14 }}>{p ? p.num : '!'}</span>
                  </div>
                  <div style={{ marginTop: 5, display: 'inline-block', padding: '2px 8px', borderRadius: T.pill,
                    background: withA(T.bg, 0.74), fontSize: wide ? 12 : 11, fontWeight: 700,
                    color: p ? T.text : hc.gap, whiteSpace: 'nowrap' }}>
                    {p ? p.name : `${slot.label} gap`}
                  </div>
                </div>
              );
            })}

          </div>
          </div>
          <InfoLegend />
        </div>

        {/* info half — News / Roster views */}
        <div style={{ background: T.panel, padding: '16px 20px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {[['news', 'Team news'], ['roster', 'Roster']].map(([k, l]) => (
              <button key={k} onClick={() => setInfoView(k)}
                style={{ padding: '6px 13px', borderRadius: T.pill, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 800, background: infoView === k ? T.accent : T.soft,
                  color: infoView === k ? T.onAccent : T.text }}>{l}</button>
            ))}
            {infoView === 'news'
              ? <span style={{ fontSize: 10, fontWeight: 700, color: T.accent2, marginLeft: 6,
                  border: `1px solid ${T.accent2}`, borderRadius: T.pill, padding: '1px 7px' }}>PLACEHOLDER</span>
              : <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.5 }}>{roster.length} players</span>}
          </div>

          {infoView === 'news' ? (
            <>
              {PLACEHOLDER_NEWS.map((n, i) => (
                <div key={i} style={{ background: T.soft, border: `1px solid ${T.hair}`,
                  borderRadius: T.radius, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', padding: '2px 7px',
                      borderRadius: T.pill, background: `${n.c}22`, color: n.c }}>{n.tag}</span>
                    <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 'auto' }}>{n.when}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{n.head}</div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>
                </div>
              ))}
              <div style={{ marginTop: 'auto', fontSize: 11, opacity: 0.4, lineHeight: 1.5 }}>
                Placeholder panel — swap for news feed, rumors, fixtures, or finances later.
              </div>
            </>
          ) : (
            <RosterTable roster={roster} />
          )}
        </div>
      </div>

      {/* depth drawer */}
      <div style={{ flexShrink: 0, background: T.panel, borderTop: `1px solid ${T.hair}`,
        padding: '14px 22px', minHeight: 158 }}>
        {selDepth ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: T.display }}>{selSlot ? selSlot.label : ''}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: hc[healthOf(depth, selected, leaving)] }}>
                {HEALTH_LABEL[healthOf(depth, selected, leaving)]}
              </span>
              <span style={{ fontSize: 12, opacity: 0.5 }}>· reorder, sell, or add depth</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, minHeight: 132, alignItems: 'stretch' }}>
              {[selDepth.starter, ...selDepth.backups].filter(Boolean).map((o, i) => {
                const p = allByNum[o.num];
                if (!p) return null;
                const gone = leaving.has(o.num);
                const isStarter = i === 0;
                const bIdx = i - 1;
                return (
                  <div key={`${o.num}-${i}`} style={{ position: 'relative', minWidth: 196, padding: 14, borderRadius: T.radius,
                    background: gone ? withA(T.gap, 0.1) : (T.flat ? T.cardTo : `linear-gradient(160deg,${T.cardFrom},${T.cardTo})`),
                    border: `1.5px solid ${gone ? hc.gap : isStarter ? hc[healthOf(depth, selected, leaving)] : T.hair2}`,
                    opacity: gone ? 0.65 : 1 }}>
                    <button onClick={() => removeAt(selected, i)} title="Remove from this position"
                      style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%',
                        border: 'none', background: T.soft, color: T.text, cursor: 'pointer',
                        fontSize: 15, lineHeight: 1, display: 'grid', placeItems: 'center', opacity: 0.75 }}>×</button>
                    <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', opacity: 0.6, paddingRight: 24 }}>
                      {isStarter ? 'STARTER' : `BACKUP ${i}`}
                      {o.tier !== 'nat' && <span style={{ color: tierColor[o.tier], marginLeft: 6 }}>{o.tier === 'sec' ? 'OOP' : '✕ OOP'}</span>}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginTop: 6, textDecoration: gone ? 'line-through' : 'none' }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                      <span>#{p.num}</span><span>Age {p.age}</span><span>★{p.rating}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                      {!isStarter && <Pill onClick={() => makeStarter(selected, bIdx)} tone="accent">Make starter</Pill>}
                      {!isStarter && bIdx > 0 && <Pill onClick={() => moveBackup(selected, bIdx, -1)} tone="ghost" title="Move up">↑</Pill>}
                      {!isStarter && bIdx < selDepth.backups.length - 1 && <Pill onClick={() => moveBackup(selected, bIdx, 1)} tone="ghost" title="Move down">↓</Pill>}
                      <Pill onClick={() => toggle(o.num)} tone={gone ? 'ghost' : 'danger'}>{gone ? 'Keep' : 'Sell'}</Pill>
                    </div>
                  </div>
                );
              })}

              {/* add-player card */}
              <button onClick={() => openAdd(selected)}
                style={{ minWidth: 130, borderRadius: T.radius, border: `1.5px dashed ${T.hair2}`,
                  background: 'transparent', color: T.text, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: 24, fontWeight: 400, lineHeight: 1 }}>+</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Add player</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.55, fontSize: 14 }}>
            Tap a position on the pitch to see and edit its depth →
          </div>
        )}
      </div>

      {adding && (
        <AddModal
          slot={slots.find((s) => s.id === adding)}
          depth={depth[adding]}
          roster={roster}
          tab={addTab} setTab={setAddTab}
          form={form} setForm={setForm}
          onPick={(num) => addFromRoster(adding, num)}
          onCreate={() => createPlayer(adding)}
          onClose={() => setAdding(null)}
        />
      )}
    </div>
    </ThemeContext.Provider>
  );
}

function AddModal({ slot, depth, roster, tab, setTab, form, setForm, onPick, onCreate, onClose }) {
  const T = useT();
  const tierColor = tierColorOf(T);
  const inSlot = new Set([depth.starter && depth.starter.num, ...depth.backups.map((b) => b.num)].filter(Boolean));
  const candidates = roster
    .filter((p) => !inSlot.has(p.num))
    .map((p) => ({ p, tier: tierFor(p, slot.type) }))
    .sort((a, b) => {
      const rank = { nat: 0, sec: 1, oop: 2 };
      return rank[a.tier] - rank[b.tier] || b.p.rating - a.p.rating;
    });

  const field = { background: T.soft, border: `1px solid ${T.hair2}`,
    color: T.text, borderRadius: Math.max(0, T.radius - 4), padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', width: '100%' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.55)',
      display: 'grid', placeItems: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: '100%', maxHeight: '78vh',
        display: 'flex', flexDirection: 'column', background: T.surface, color: T.text, fontFamily: T.font,
        border: `1px solid ${T.hair2}`, borderRadius: T.radius, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.hair}`,
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 800, fontFamily: T.display }}>Add depth at {slot.label}</span>
          <span style={{ fontSize: 11, opacity: 0.5 }}>({slot.type})</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'transparent', border: 'none',
            color: T.text, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '10px 18px 0' }}>
          {[['roster', 'From roster'], ['new', 'New player']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding: '7px 14px', borderRadius: T.pill, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 12, fontWeight: 800, background: tab === k ? T.accent : T.soft,
                color: tab === k ? T.onAccent : T.text }}>{l}</button>
          ))}
        </div>

        <div style={{ padding: 18, overflowY: 'auto' }}>
          {tab === 'roster' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {candidates.map(({ p, tier }) => (
                <button key={p.num} onClick={() => onPick(p.num)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', cursor: 'pointer',
                    background: T.soft, border: `1px solid ${T.hair}`, borderRadius: Math.max(0, T.radius - 2),
                    color: T.text, fontFamily: 'inherit', textAlign: 'left' }}>
                  <span style={{ fontSize: 12, opacity: 0.5, width: 24 }}>#{p.num}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.6 }}>Age {p.age} · ★{p.rating} · {p.pos.join('/')}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: T.pill,
                    background: `${tierColor[tier]}22`, color: tierColor[tier] }}>{TIER_LABEL[tier]}</span>
                </button>
              ))}
              {candidates.length === 0 && <div style={{ opacity: 0.5, fontSize: 13 }}>Everyone's already in this chart.</div>}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, opacity: 0.7 }}>Name
                <input style={{ ...field, marginTop: 4 }} value={form.name} placeholder={`New ${form.type}`}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>Position
                  <select style={{ ...field, marginTop: 4 }} value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {POSITION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>Registration
                  <select style={{ ...field, marginTop: 4 }} value={form.reg}
                    onChange={(e) => setForm({ ...form, reg: e.target.value })}>
                    <option value="home">Homegrown</option>
                    <option value="eu">EU</option>
                    <option value="noneu">Non-EU</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>Age
                  <input type="number" min="15" max="40" style={{ ...field, marginTop: 4 }} value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </label>
                <label style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>Rating
                  <select style={{ ...field, marginTop: 4 }} value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                    {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{'★'.repeat(r)}</option>)}
                  </select>
                </label>
              </div>
              <button onClick={onCreate}
                style={{ marginTop: 4, padding: '10px 16px', borderRadius: Math.max(0, T.radius - 2), border: 'none', cursor: 'pointer',
                  background: T.accent, color: T.onAccent, fontWeight: 800, fontSize: 13, fontFamily: 'inherit' }}>
                Create & add to {slot.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({ onClick, children, tone, title }) {
  const T = useT();
  const tones = {
    accent: { bg: T.accent, color: T.onAccent, border: T.accent },
    danger: { bg: 'transparent', color: T.gap, border: T.gap },
    ghost: { bg: T.soft, color: T.text, border: T.hair2 },
  };
  const sx = tones[tone] || tones.ghost;
  return (
    <button onClick={onClick} title={title}
      style={{ padding: '5px 10px', borderRadius: T.pill, fontSize: 11, fontWeight: 800, cursor: 'pointer',
        background: sx.bg, color: sx.color, border: `1px solid ${sx.border}`, fontFamily: 'inherit' }}>
      {children}
    </button>
  );
}

function PitchSvg({ horizontal }) {
  const T = useT();
  const vb = horizontal ? '0 0 105 68' : '0 0 68 105';
  return (
    <svg viewBox={vb} preserveAspectRatio="none" width="100%" height="100%"
      style={{ position: 'absolute', inset: 0, display: 'block' }}>
      <g fill="none" stroke={T.line} strokeWidth={1.2}>
        {horizontal ? (
          <>
            <rect x="2" y="2" width="101" height="64" />
            <line x1="52.5" y1="2" x2="52.5" y2="66" />
            <circle cx="52.5" cy="34" r="9" />
            <circle cx="52.5" cy="34" r="0.6" fill={T.line} />
            <rect x="2" y="14" width="16" height="40" />
            <rect x="2" y="24" width="6" height="20" />
            <rect x="87" y="14" width="16" height="40" />
            <rect x="97" y="24" width="6" height="20" />
          </>
        ) : (
          <>
            <rect x="2" y="2" width="64" height="101" />
            <line x1="2" y1="52.5" x2="66" y2="52.5" />
            <circle cx="34" cy="52.5" r="9" />
            <circle cx="34" cy="52.5" r="0.6" fill={T.line} />
            <rect x="14" y="2" width="40" height="16" />
            <rect x="24" y="2" width="20" height="6" />
            <rect x="14" y="87" width="40" height="16" />
            <rect x="24" y="97" width="20" height="6" />
          </>
        )}
      </g>
    </svg>
  );
}

function InfoLegend() {
  const T = useT();
  const hc = hcOf(T);
  const [open, setOpen] = React.useState(false);
  const items = [
    ['Solid', hc.solid, 'Natural starter with a natural backup.'],
    ['Thin', hc.thin, 'Out-of-position starter, or no natural backup.'],
    ['Gap', hc.gap, 'No one available to start here.'],
    ['Out of position', T.oop, 'A player filling a non-natural role.'],
  ];
  return (
    <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 10 }}>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
          <div style={{ position: 'absolute', right: 0, bottom: 'calc(100% + 8px)', zIndex: 1, width: 248,
            background: T.surface, color: T.text, border: `1px solid ${T.hair2}`, borderRadius: T.radius,
            padding: '12px 14px', boxShadow: '0 12px 32px rgba(0,0,0,.3)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, fontFamily: T.display }}>What the colors mean</div>
            {items.map(([label, col, desc]) => (
              <div key={label} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '5px 0' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: col, marginTop: 3, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: col }}>{label}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.35 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <button onClick={() => setOpen((o) => !o)} title="What do the colors mean?" aria-label="Legend"
        style={{ width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontFamily: 'Georgia, serif',
          background: T.surface, color: T.accent, border: `1px solid ${T.hair2}`,
          fontSize: 17, fontWeight: 700, fontStyle: 'italic', display: 'grid', placeItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,.18)' }}>i</button>
    </div>
  );
}

const POS_GROUP = { GK: 'GK', RB: 'DEF', CB: 'DEF', LB: 'DEF', DM: 'MID', CM: 'MID', AM: 'MID', RW: 'ATT', LW: 'ATT', ST: 'ATT' };

function RosterTable({ roster }) {
  const T = useT();
  const [q, setQ] = React.useState('');
  const [grp, setGrp] = React.useState('all');
  const [reg, setReg] = React.useState('all');
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
  const field = { background: T.soft, border: `1px solid ${T.hair2}`, color: T.text, fontFamily: 'inherit',
    borderRadius: Math.max(0, T.radius - 4), padding: '7px 10px', fontSize: 12, width: '100%', boxSizing: 'border-box' };
  const Chip = ({ active, onClick, children }) => (
    <button onClick={onClick} style={{ padding: '4px 10px', borderRadius: T.pill, cursor: 'pointer', fontFamily: 'inherit',
      fontSize: 11, fontWeight: 700, border: `1px solid ${active ? T.accent : T.hair2}`,
      background: active ? T.accent : 'transparent', color: active ? T.onAccent : T.text }}>{children}</button>
  );
  const row = { display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' };
  const tag = { fontSize: 10, opacity: 0.45, width: 26, flexShrink: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search players…" style={field} />
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

      {rows.length ? (
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
      ) : (
        <div style={{ opacity: 0.5, fontSize: 13, padding: '16px 4px', textAlign: 'center' }}>No players match.</div>
      )}
    </div>
  );
}

function CompChip({ label, c }) {
  const T = useT();
  const hc = hcOf(T);
  const col = c.state === 'over' || c.state === 'under' ? hc.gap : c.state === 'at' ? hc.thin : hc.solid;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: T.pill,
      background: T.soft, border: `1px solid ${col}` }}>
      <span style={{ fontSize: 11, opacity: 0.7 }}>{label}</span>
      <b style={{ color: col, fontSize: 13 }}>{c.n}/{c.lim.value}</b>
    </span>
  );
}
