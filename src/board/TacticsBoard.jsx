import React from 'react';
import {
  FORMATIONS, FORMATION_NAMES, buildDepth, healthOf, complianceOf, tierFor, HEALTH_LABEL,
} from '../squad-data';
import {
  getTeam, DEFAULT_TEAM_SLUG, loadScenario, saveScenario, clearScenario, isAdminFor,
} from '../data/store';
import { AccountChip } from '../auth/AccountChip';
import { usePhone, useWide } from '../hooks/useViewport';
import { withA } from '../lib/format';
import { navigate } from '../navigation/appRoute';
import { AddModal } from './AddModal';
import { InfoPanel } from './InfoPanel';
import { PitchPanel } from './PitchPanel';
import { Pill } from './Pill';
import { DEFAULT_SKIN, ThemeContext, hcOf, tierColorOf } from './theme';
import {
  attackerSlot, clampInfoPanelWidth, INFO_PANEL_WIDTH_VAR,
} from './utils';

export { DEFAULT_SKIN } from './theme';

export function TacticsBoard({ skin = DEFAULT_SKIN, team = getTeam(DEFAULT_TEAM_SLUG) }) {
  const T = skin;
  const hc = hcOf(T);
  const tierColor = tierColorOf(T);
  const wide = useWide(1080);
  const phone = usePhone(720);
  const pitchWrapRef = React.useRef(null);
  const formationTriggerRef = React.useRef(/** @type {HTMLButtonElement | null} */ (null));
  const formationListId = React.useId();
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

  const skipAutosaveRef = React.useRef(true);
  React.useEffect(() => {
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }
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
  const [infoView, setInfoView] = React.useState('roster');
  const [infoWidth, setInfoWidth] = React.useState(460);
  const gridRef = React.useRef(/** @type {HTMLDivElement | null} */ (null));
  const isInfoResizingRef = React.useRef(false);

  React.useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || isInfoResizingRef.current) return;
    grid.style.setProperty(INFO_PANEL_WIDTH_VAR, `${infoWidth}px`);
  }, [infoWidth]);

  const startInfoResize = (e) => {
    e.preventDefault();
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    isInfoResizingRef.current = true;
    let pendingWidth = infoWidth;
    let rafId = 0;

    const applyWidth = (clamped) => {
      pendingWidth = clamped;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        grid.style.setProperty(INFO_PANEL_WIDTH_VAR, `${pendingWidth}px`);
      });
    };

    const onMove = (ev) => {
      applyWidth(clampInfoPanelWidth(rect.right - ev.clientX, rect.width));
    };
    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      isInfoResizingRef.current = false;
      setInfoWidth(pendingWidth);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  const allByNum = React.useMemo(() => Object.fromEntries(roster.map((p) => [p.num, p])), [roster]);
  const slots = FORMATIONS[formation];
  const depth = depthMap[formation] || buildDepth(roster, slots);

  const toggle = (num) => setLeaving((prev) => {
    const next = new Set(prev);
    next.has(num) ? next.delete(num) : next.add(num);
    return next;
  });

  const chooseFormation = React.useCallback((name) => {
    setMenuOpen(false);
    setDepthMap((m) => (m[name] ? m : { ...m, [name]: buildDepth(roster, FORMATIONS[name]) }));
    setFormation(name);
    setSelected(attackerSlot(FORMATIONS[name]));
  }, [roster]);

  const onToggleMenu = React.useCallback(() => setMenuOpen((o) => !o), []);
  const onCloseMenu = React.useCallback(() => setMenuOpen(false), []);
  const onSelectSlot = React.useCallback((slotId) => setSelected(slotId), []);
  const onInfoViewChange = React.useCallback((view) => setInfoView(view), []);

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

  const comp = React.useMemo(
    () => complianceOf(roster, leaving, team.rules),
    [roster, leaving, team.rules],
  );
  const selDepth = depth[selected];
  const selSlot = slots.find((s) => s.id === selected);
  const selHealth = selDepth ? healthOf(depth, selected, leaving) : null;

  const pitchPanel = (
    <PitchPanel
      phone={phone}
      wide={wide}
      pitchBox={pitchBox}
      pitchWrapRef={pitchWrapRef}
      formation={formation}
      menuOpen={menuOpen}
      onToggleMenu={onToggleMenu}
      onCloseMenu={onCloseMenu}
      formationTriggerRef={formationTriggerRef}
      formationListId={formationListId}
      onChooseFormation={chooseFormation}
      team={team}
      comp={comp}
      slots={slots}
      depth={depth}
      leaving={leaving}
      selected={selected}
      allByNum={allByNum}
      onSelectSlot={onSelectSlot}
    />
  );

  const infoPanel = (
    <InfoPanel
      phone={phone}
      infoView={infoView}
      onInfoViewChange={onInfoViewChange}
      roster={roster}
    />
  );

  const depthDrawer = (
        <div style={{ flexShrink: 0, background: T.panel, borderTop: `1px solid ${T.hair}`,
          padding: phone ? '11px 14px' : '11px 22px', minHeight: 126 }}>
        {selDepth ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: T.display }}>{selSlot ? selSlot.label : ''}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: hc[selHealth] }}>
                {HEALTH_LABEL[selHealth]}
              </span>
              <span style={{ fontSize: 12, color: T.textMuted }}>· reorder, sell, or add depth</span>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, minHeight: 106, alignItems: 'stretch' }}>
              {[selDepth.starter, ...selDepth.backups].filter(Boolean).map((o, i) => {
                const p = allByNum[o.num];
                if (!p) return null;
                const gone = leaving.has(o.num);
                const isStarter = i === 0;
                const bIdx = i - 1;
                return (
                  <div key={`${o.num}-${i}`} style={{ position: 'relative', minWidth: 196, padding: 11, borderRadius: T.radius,
                    background: gone ? withA(T.gap, 0.1) : (T.flat ? T.cardTo : `linear-gradient(160deg,${T.cardFrom},${T.cardTo})`),
                    border: `1.5px solid ${gone ? hc.gap : isStarter ? hc[selHealth] : T.hair2}`,
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
            color: T.textMuted, fontSize: 14 }}>
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
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <AccountChip T={T} />
          <button onClick={() => { clearScenario(team.slug); window.location.reload(); }}
            title="Reset this board to the squad"
            style={{ padding: '7px 13px', borderRadius: T.pill, border: `1px solid ${T.hair2}`, background: T.soft,
              color: T.text, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            ↺ Reset
          </button>
          {isAdminFor(team.slug) && (
          <button onClick={() => navigate({ admin: team.slug })}
            style={{ padding: '7px 13px', borderRadius: T.pill, border: `1px solid ${T.hair2}`, background: T.soft,
              color: T.text, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Manage squad
          </button>
          )}
          <button onClick={() => navigate({ quiz: 'squad', team: team.slug })}
            style={{ padding: '8px 16px', borderRadius: T.pill, border: 'none',
              background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`, color: T.onAccent,
              fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Squad quiz →
          </button>
        </div>
      </div>

      {phone ? (
        <div style={{ display: 'flex', flexDirection: 'column', background: T.hair, gap: 1 }}>
          {pitchPanel}
          {depthDrawer}
          {infoPanel}
        </div>
      ) : (
        <>
          <div ref={gridRef} style={{ flex: 1, minHeight: 0, display: 'grid',
            gridTemplateColumns: `minmax(360px, 1fr) 6px var(${INFO_PANEL_WIDTH_VAR}, 460px)`,
            gap: 1, background: T.hair }}>
            {pitchPanel}
            <div onPointerDown={startInfoResize} role="separator" aria-orientation="vertical"
              aria-label="Resize panel" title="Drag to resize"
              style={{ cursor: 'col-resize', background: T.soft, display: 'flex',
                alignItems: 'center', justifyContent: 'center', touchAction: 'none' }}>
              <div style={{ width: 2, height: 28, borderRadius: 2, background: T.hair2 }} />
            </div>
            {infoPanel}
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
