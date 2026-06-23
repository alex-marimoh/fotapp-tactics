import React from 'react';
import {
  ROSTER, FORMATIONS, FORMATION_NAMES, PLACEHOLDER_NEWS, POSITION_TYPES, TIER_LABEL,
  buildDepth, healthOf, effectiveStarterNum, complianceOf, tierFor, HEALTH_LABEL,
} from './squad-data';

const T = {
  bg: '#06140d', panel: '#081d12', text: '#eafff3',
  accent: '#16c75e', accent2: '#ff7a1a',
  solid: '#10d469', thin: '#ffc23d', gap: '#ff5d5d',
};
const hc = { solid: T.solid, thin: T.thin, gap: T.gap };
const tierColor = { nat: T.solid, sec: T.thin, oop: T.gap };

const attackerSlot = (slots) => (slots.find((s) => s.type === 'ST') || slots[0]).id;

export function TacticsBoard() {
  const [roster, setRoster] = React.useState(ROSTER);
  const [formation, setFormation] = React.useState(FORMATION_NAMES[0]);
  const [depthMap, setDepthMap] = React.useState(() => ({ [FORMATION_NAMES[0]]: buildDepth(ROSTER, FORMATIONS[FORMATION_NAMES[0]]) }));
  const [selected, setSelected] = React.useState(() => attackerSlot(FORMATIONS[FORMATION_NAMES[0]]));
  const [leaving, setLeaving] = React.useState(() => new Set());
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [adding, setAdding] = React.useState(null); // slot id being added to
  const [addTab, setAddTab] = React.useState('roster');
  const [form, setForm] = React.useState({ name: '', type: 'CB', reg: 'eu', age: '21', rating: '3' });

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
    <div style={{ width: '100%', height: '100vh', background: T.bg, color: T.text,
      fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ribbon (branding only) */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px',
        background: 'linear-gradient(90deg,#0a2417,#06140d)', borderBottom: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
        <span style={{ fontWeight: 850, fontSize: 18, letterSpacing: '-0.02em',
          background: `linear-gradient(90deg,${T.accent},${T.accent2})`, WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent' }}>fotapp</span>
        <span style={{ fontSize: 13, opacity: 0.55, fontWeight: 600 }}>Build your season</span>
      </div>

      {/* hero: pitch half | info half */}
      <div style={{ flex: 1, minHeight: 0, display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: 1, background: 'rgba(255,255,255,.06)' }}>

        {/* pitch half — controls live in this view */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column',
          padding: 16, gap: 12, minHeight: 0, minWidth: 0,
          background: 'radial-gradient(120% 90% at 50% 0%, #16633a 0%, #0c3a22 55%, #06160e 100%)' }}>

          {/* in-pitch control row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen((o) => !o)}
                style={{ padding: '8px 16px', borderRadius: 999, border: 'none',
                  background: `linear-gradient(90deg,${T.accent},#0fa84e)`, color: '#03130a', fontWeight: 800,
                  fontSize: 13, cursor: 'pointer' }}>{formation} ▾</button>
              {menuOpen && (
                <>
                  <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 50,
                    background: '#0c2c1c', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10,
                    padding: 4, minWidth: 150, boxShadow: '0 12px 32px rgba(0,0,0,.5)',
                    maxHeight: 320, overflowY: 'auto' }}>
                    {FORMATION_NAMES.map((name) => (
                      <button key={name} onClick={() => chooseFormation(name)}
                        style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                          background: name === formation ? 'rgba(22,199,94,.18)' : 'transparent',
                          color: T.text, padding: '9px 12px', borderRadius: 7, fontSize: 13,
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

          {/* pitch */}
          <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', height: '100%', aspectRatio: '68 / 105', maxWidth: '100%' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${(i / 9) * 100}%`,
                height: `${100 / 9}%`, background: i % 2 ? 'rgba(255,255,255,.05)' : 'transparent' }} />
            ))}
            <div style={{ position: 'absolute', inset: 0 }}><PitchSvg /></div>

            {slots.map((slot) => {
              const h = healthOf(depth, slot.id, leaving);
              const pn = effectiveStarterNum(depth, slot.id, leaving);
              const p = pn && allByNum[pn];
              const isSel = selected === slot.id;
              return (
                <div key={slot.id} onClick={() => setSelected(slot.id)}
                  style={{ position: 'absolute', left: `${slot.left}%`, top: `${slot.top}%`,
                    transform: `translate(-50%,-50%) scale(${isSel ? 1.08 : 1})`, transition: 'transform .15s',
                    cursor: 'pointer', textAlign: 'center', zIndex: isSel ? 6 : 3 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', margin: '0 auto',
                    background: 'rgba(7,22,14,.8)', border: `2.5px solid ${hc[h]}`,
                    boxShadow: `0 0 14px ${hc[h]}66, 0 4px 10px rgba(0,0,0,.45)`,
                    display: 'grid', placeItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{p ? p.num : '!'}</span>
                  </div>
                  <div style={{ marginTop: 5, display: 'inline-block', padding: '2px 8px', borderRadius: 999,
                    background: 'rgba(7,22,14,.74)', fontSize: 11, fontWeight: 700,
                    color: p ? '#eafff3' : hc.gap, whiteSpace: 'nowrap' }}>
                    {p ? p.name : `${slot.label} gap`}
                  </div>
                </div>
              );
            })}

            <div style={{ position: 'absolute', left: 4, bottom: 4 }}>
              <LegendGlow />
            </div>
          </div>
          </div>
        </div>

        {/* info half (PLACEHOLDER — news / whatever) */}
        <div style={{ background: T.panel, padding: '16px 20px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Team news</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.accent2,
              border: `1px solid ${T.accent2}`, borderRadius: 999, padding: '1px 7px' }}>PLACEHOLDER</span>
          </div>
          {PLACEHOLDER_NEWS.map((n, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', padding: '2px 7px',
                  borderRadius: 999, background: `${n.c}22`, color: n.c }}>{n.tag}</span>
                <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 'auto' }}>{n.when}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{n.head}</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>
            </div>
          ))}
          <div style={{ marginTop: 'auto', fontSize: 11, opacity: 0.4, lineHeight: 1.5 }}>
            Placeholder panel — swap for news feed, rumors, fixtures, or finances later.
          </div>
        </div>
      </div>

      {/* depth drawer */}
      <div style={{ flexShrink: 0, background: T.panel, borderTop: '1px solid rgba(255,255,255,.08)',
        padding: '14px 22px', minHeight: 158 }}>
        {selDepth ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 800 }}>{selSlot ? selSlot.label : ''}</span>
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
                  <div key={`${o.num}-${i}`} style={{ position: 'relative', minWidth: 196, padding: 14, borderRadius: 14,
                    background: gone ? 'rgba(255,93,93,.10)' : 'linear-gradient(160deg,#11432a,#0c2c1c)',
                    border: `1.5px solid ${gone ? hc.gap : isStarter ? hc[healthOf(depth, selected, leaving)] : 'rgba(255,255,255,.12)'}`,
                    opacity: gone ? 0.65 : 1 }}>
                    <button onClick={() => removeAt(selected, i)} title="Remove from this position"
                      style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%',
                        border: 'none', background: 'rgba(255,255,255,.1)', color: T.text, cursor: 'pointer',
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
                style={{ minWidth: 130, borderRadius: 14, border: `1.5px dashed rgba(255,255,255,.25)`,
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
  );
}

function AddModal({ slot, depth, roster, tab, setTab, form, setForm, onPick, onCreate, onClose }) {
  const inSlot = new Set([depth.starter && depth.starter.num, ...depth.backups.map((b) => b.num)].filter(Boolean));
  const candidates = roster
    .filter((p) => !inSlot.has(p.num))
    .map((p) => ({ p, tier: tierFor(p, slot.type) }))
    .sort((a, b) => {
      const rank = { nat: 0, sec: 1, oop: 2 };
      return rank[a.tier] - rank[b.tier] || b.p.rating - a.p.rating;
    });

  const field = { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.15)',
    color: T.text, borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', width: '100%' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.55)',
      display: 'grid', placeItems: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: '100%', maxHeight: '78vh',
        display: 'flex', flexDirection: 'column', background: '#0b2417', color: T.text,
        border: '1px solid rgba(255,255,255,.12)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Add depth at {slot.label}</span>
          <span style={{ fontSize: 11, opacity: 0.5 }}>({slot.type})</span>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'transparent', border: 'none',
            color: T.text, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '10px 18px 0' }}>
          {[['roster', 'From roster'], ['new', 'New player']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 12, fontWeight: 800, background: tab === k ? T.accent : 'rgba(255,255,255,.06)',
                color: tab === k ? '#03130a' : T.text }}>{l}</button>
          ))}
        </div>

        <div style={{ padding: 18, overflowY: 'auto' }}>
          {tab === 'roster' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {candidates.map(({ p, tier }) => (
                <button key={p.num} onClick={() => onPick(p.num)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', cursor: 'pointer',
                    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10,
                    color: T.text, fontFamily: 'inherit', textAlign: 'left' }}>
                  <span style={{ fontSize: 12, opacity: 0.5, width: 24 }}>#{p.num}</span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.6 }}>Age {p.age} · ★{p.rating} · {p.pos.join('/')}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
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
                style={{ marginTop: 4, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: T.accent, color: '#03130a', fontWeight: 800, fontSize: 13, fontFamily: 'inherit' }}>
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
  const tones = {
    accent: { bg: T.accent, color: '#03130a', border: T.accent },
    danger: { bg: 'transparent', color: T.gap, border: T.gap },
    ghost: { bg: 'rgba(255,255,255,.06)', color: T.text, border: 'rgba(255,255,255,.18)' },
  };
  const sx = tones[tone] || tones.ghost;
  return (
    <button onClick={onClick} title={title}
      style={{ padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, cursor: 'pointer',
        background: sx.bg, color: sx.color, border: `1px solid ${sx.border}`, fontFamily: 'inherit' }}>
      {children}
    </button>
  );
}

function PitchSvg() {
  return (
    <svg viewBox="0 0 68 105" preserveAspectRatio="none" width="100%" height="100%"
      style={{ position: 'absolute', inset: 0, display: 'block' }}>
      <g fill="none" stroke="rgba(255,255,255,.32)" strokeWidth={1.2}>
        <rect x="2" y="2" width="64" height="101" />
        <line x1="2" y1="52.5" x2="66" y2="52.5" />
        <circle cx="34" cy="52.5" r="9" />
        <circle cx="34" cy="52.5" r="0.6" fill="rgba(255,255,255,.32)" />
        <rect x="14" y="2" width="40" height="16" />
        <rect x="24" y="2" width="20" height="6" />
        <rect x="14" y="87" width="40" height="16" />
        <rect x="24" y="97" width="20" height="6" />
      </g>
    </svg>
  );
}

function LegendGlow() {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '8px 12px', borderRadius: 999, background: 'rgba(7,22,14,.6)' }}>
      {[['solid', 'Solid'], ['thin', 'Thin'], ['gap', 'Gap']].map(([k, l]) => (
        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: hc[k], boxShadow: `0 0 8px ${hc[k]}` }} />{l}
        </span>
      ))}
    </div>
  );
}

function CompChip({ label, c }) {
  const col = c.state === 'over' || c.state === 'under' ? hc.gap : c.state === 'at' ? hc.thin : hc.solid;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999,
      background: 'rgba(255,255,255,.06)', border: `1px solid ${col}` }}>
      <span style={{ fontSize: 11, opacity: 0.7 }}>{label}</span>
      <b style={{ color: col, fontSize: 13 }}>{c.n}/{c.lim.value}</b>
    </span>
  );
}
