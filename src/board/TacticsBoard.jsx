import React from 'react';
import {
  FORMATIONS, FORMATION_NAMES, PLACEHOLDER_NEWS,
  buildDepth, healthOf, effectiveStarterNum, complianceOf, tierFor, HEALTH_LABEL,
} from '../squad-data';
import {
  getTeam, DEFAULT_TEAM_SLUG, loadScenario, saveScenario, clearScenario, isAdminFor,
} from '../data/store';
import { AccountChip } from '../auth/AccountChip';
import { usePhone, useWide } from '../hooks/useViewport';
import { withA } from '../lib/format';
import { TeamPicker } from '../ui/TeamPicker';
import { AddModal } from './AddModal';
import { CompChip } from './CompChip';
import { InfoLegend } from './InfoLegend';
import { Pill } from './Pill';
import { PitchSvg } from './PitchSvg';
import { RosterTable } from './RosterTable';
import { DEFAULT_SKIN, ThemeContext, hcOf, tierColorOf } from './theme';
import { attackerSlot } from './utils';

export { DEFAULT_SKIN } from './theme';

export function TacticsBoard({ skin = DEFAULT_SKIN, team = getTeam(DEFAULT_TEAM_SLUG) }) {
  const T = skin;
  const hc = hcOf(T);
  const tierColor = tierColorOf(T);
  const wide = useWide(1080);
  const phone = usePhone(720);
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

  const saved = React.useMemo(() => loadScenario(team.slug), [team.slug]);
  const startFormation = saved?.formation ?? FORMATION_NAMES[0];
  const startRoster = saved?.roster ?? team.roster;
  const [roster, setRoster] = React.useState(startRoster);
  const [formation, setFormation] = React.useState(startFormation);
  const [depthMap, setDepthMap] = React.useState(
    () => saved?.depthMap ?? { [startFormation]: buildDepth(startRoster, FORMATIONS[startFormation]) },
  );
  const [selected, setSelected] = React.useState(() => attackerSlot(FORMATIONS[startFormation]));
  const [leaving, setLeaving] = React.useState(() => new Set(saved?.leaving ?? []));

  React.useEffect(() => {
    const id = setTimeout(
      () => saveScenario(team.slug, { formation, depthMap, leaving: [...leaving], roster }),
      400,
    );
    return () => clearTimeout(id);
  }, [team.slug, formation, depthMap, leaving, roster]);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [adding, setAdding] = React.useState(null);
  const [addTab, setAddTab] = React.useState('roster');
  const [form, setForm] = React.useState({ name: '', type: 'CB', reg: 'eu', age: '21', rating: '3' });
  const [infoView, setInfoView] = React.useState('news');

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

  const comp = complianceOf(roster, leaving, team.rules);
  const selDepth = depth[selected];
  const selSlot = slots.find((s) => s.id === selected);

  const pitchHalf = (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column',
          padding: phone ? 12 : 16, gap: 12, minHeight: 0, minWidth: 0,
          background: T.flat ? T.pitch[1] : `radial-gradient(120% 90% at 50% 0%, ${T.pitch[0]} 0%, ${T.pitch[1]} 55%, ${T.pitch[2]} 100%)` }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
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

          <div ref={pitchWrapRef} style={{ flex: phone ? 'none' : 1, height: phone ? '58vh' : undefined,
            minHeight: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: pitchBox.w || '100%', height: pitchBox.h || '100%' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} aria-hidden="true" style={{ position: 'absolute', background: i % 2 ? T.soft : 'transparent',
                ...(wide
                  ? { top: 0, bottom: 0, left: `${(i / 9) * 100}%`, width: `${100 / 9}%` }
                  : { left: 0, right: 0, top: `${(i / 9) * 100}%`, height: `${100 / 9}%` }) }} />
            ))}
            <div style={{ position: 'absolute', inset: 0 }} aria-hidden="true"><PitchSvg horizontal={wide} /></div>

            {slots.map((slot) => {
              const h = healthOf(depth, slot.id, leaving);
              const pn = effectiveStarterNum(depth, slot.id, leaving);
              const p = pn && allByNum[pn];
              const isSel = selected === slot.id;
              const nx = wide ? 100 - slot.top : slot.left;
              const ny = wide ? slot.left : slot.top;
              const sz = wide ? 46 : 42;
              const markerLabel = p
                ? `${slot.label}, ${p.name}, ${HEALTH_LABEL[h]}`
                : `${slot.label}, ${slot.label} gap, ${HEALTH_LABEL[h]}`;
              return (
                <button key={slot.id} type="button" onClick={() => setSelected(slot.id)}
                  aria-label={markerLabel} aria-current={isSel ? 'true' : undefined}
                  style={{ position: 'absolute', left: `${nx}%`, top: `${ny}%`,
                    transform: `translate(-50%,-50%) scale(${isSel ? 1.08 : 1})`, transition: 'transform .15s',
                    cursor: 'pointer', textAlign: 'center', zIndex: isSel ? 6 : 3,
                    border: 'none', background: 'transparent', padding: 0, fontFamily: 'inherit', color: 'inherit' }}>
                  <div aria-hidden="true" style={{ width: sz, height: sz, borderRadius: '50%', margin: '0 auto',
                    background: withA(T.bg, 0.8), border: `2.5px solid ${hc[h]}`,
                    boxShadow: T.glow ? `0 0 14px ${hc[h]}66, 0 4px 10px rgba(0,0,0,.45)` : 'none',
                    display: 'grid', placeItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: wide ? 15 : 14 }}>{p ? p.num : '!'}</span>
                  </div>
                  <div aria-hidden="true" style={{ marginTop: 5, display: 'inline-block', padding: '2px 8px', borderRadius: T.pill,
                    background: withA(T.bg, 0.74), fontSize: wide ? 12 : 11, fontWeight: 700,
                    color: p ? T.text : hc.gap, whiteSpace: 'nowrap' }}>
                    {p ? p.name : `${slot.label} gap`}
                  </div>
                </button>
              );
            })}

          </div>
          </div>
          <InfoLegend />
        </div>
  );

  const infoHalf = (
        <div style={{ background: T.panel, padding: phone ? '14px 14px' : '16px 20px', overflowY: 'auto',
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
  );

  const depthDrawer = (
        <div style={{ flexShrink: 0, background: T.panel, borderTop: `1px solid ${T.hair}`,
          padding: phone ? '14px 14px' : '14px 22px', minHeight: 158 }}>
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
  );

  return (
    <ThemeContext.Provider value={T}>
    <div style={{ width: '100%', height: phone ? 'auto' : '100vh', minHeight: '100vh',
      background: T.bg, color: T.text, fontFamily: T.font,
      display: 'flex', flexDirection: 'column', overflow: phone ? 'visible' : 'hidden' }}>

      <div style={{ minHeight: 56, display: 'flex', alignItems: 'center', gap: 12, rowGap: 8,
        padding: phone ? '8px 14px' : '0 26px', flexWrap: phone ? 'wrap' : 'nowrap',
        background: T.flat ? T.ribbon[0] : `linear-gradient(90deg,${T.ribbon[0]},${T.ribbon[1]})`,
        borderBottom: `1px solid ${T.hair}`, flexShrink: 0, position: phone ? 'sticky' : 'static', top: 0, zIndex: 30 }}>
        <span style={{ fontWeight: 850, fontSize: 19, letterSpacing: '-0.02em', fontFamily: T.display }}>
          <span style={{ color: T.accent }}>fot</span><span style={{ color: T.accent2 }}>app</span>
        </span>
        <TeamPicker T={T} team={team} param="team" />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <AccountChip T={T} />
          <button onClick={() => { clearScenario(team.slug); window.location.reload(); }}
            title="Reset this board to the squad"
            style={{ padding: '7px 13px', borderRadius: T.pill, border: `1px solid ${T.hair2}`, background: T.soft,
              color: T.text, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            ↺ Reset
          </button>
          {isAdminFor(team.slug) && (
          <button onClick={() => { window.location.search = `?admin=${team.slug}`; }}
            style={{ padding: '7px 13px', borderRadius: T.pill, border: `1px solid ${T.hair2}`, background: T.soft,
              color: T.text, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Manage squad
          </button>
          )}
          <button onClick={() => { window.location.search = `?quiz=squad&team=${team.slug}`; }}
            style={{ padding: '8px 16px', borderRadius: T.pill, border: 'none',
              background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`, color: T.onAccent,
              fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Squad quiz →
          </button>
        </div>
      </div>

      {phone ? (
        <div style={{ display: 'flex', flexDirection: 'column', background: T.hair, gap: 1 }}>
          {pitchHalf}
          {depthDrawer}
          {infoHalf}
        </div>
      ) : (
        <>
          <div style={{ flex: 1, minHeight: 0, display: 'grid',
            gridTemplateColumns: wide ? 'minmax(0, 1.5fr) minmax(300px, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 1, background: T.hair }}>
            {pitchHalf}
            {infoHalf}
          </div>
          {depthDrawer}
        </>
      )}

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
