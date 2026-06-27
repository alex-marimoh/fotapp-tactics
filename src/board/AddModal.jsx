import { useId } from 'react';
import { POSITION_TYPES, TIER_LABEL, tierFor } from '../squad-data';
import { ModalDialog } from '../ui/ModalDialog';
import { field } from '../ui/styles';
import { useT, tierColorOf } from './theme';

export function AddModal({ slot, depth, roster, tab, setTab, form, setForm, onPick, onCreate, onClose }) {
  const T = useT();
  const titleId = useId();
  const tierColor = tierColorOf(T);
  const inSlot = new Set([depth.starter && depth.starter.num, ...depth.backups.map((b) => b.num)].filter(Boolean));
  const candidates = roster
    .filter((p) => !inSlot.has(p.num))
    .map((p) => ({ p, tier: tierFor(p, slot.type) }))
    .sort((a, b) => {
      const rank = { nat: 0, sec: 1, oop: 2 };
      return rank[a.tier] - rank[b.tier] || b.p.rating - a.p.rating;
    });

  const fieldStyle = field(T);
  const dialogLabel = `Add depth at ${slot.label}`;

  return (
    <ModalDialog
      open
      onClose={onClose}
      ariaLabel={dialogLabel}
      titleId={titleId}
      backdropStyle={{
        position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.55)',
        display: 'grid', placeItems: 'center', padding: 20,
      }}
      panelStyle={{
        width: 460, maxWidth: '100%', maxHeight: '78vh',
        display: 'flex', flexDirection: 'column', background: T.surface, color: T.text, fontFamily: T.font,
        border: `1px solid ${T.hair2}`, borderRadius: T.radius, overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.hair}`,
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <span id={titleId} style={{ fontSize: 15, fontWeight: 800, fontFamily: T.display }}>Add depth at {slot.label}</span>
        <span style={{ fontSize: 11, color: T.textMuted }}>({slot.type})</span>
        <button type="button" onClick={onClose} aria-label="Close dialog" style={{ marginLeft: 'auto', background: 'transparent', border: 'none',
          color: T.text, fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '10px 18px 0' }}>
        {[['roster', 'From roster'], ['new', 'New player']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            style={{ padding: '7px 14px', borderRadius: T.pill, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: 800, background: tab === k ? T.accent : T.soft,
              color: tab === k ? T.onAccent : T.text }}>{l}</button>
        ))}
      </div>

      <div style={{ padding: 18, overflowY: 'auto' }}>
        {tab === 'roster' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {candidates.map(({ p, tier }) => (
              <button key={p.num} type="button" onClick={() => onPick(p.num)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', cursor: 'pointer',
                  background: T.soft, border: `1px solid ${T.hair}`, borderRadius: Math.max(0, T.radius - 2),
                  color: T.text, fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ fontSize: 12, color: T.textMuted, width: 24 }}>#{p.num}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{p.name}</span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>Age {p.age} · ★{p.rating} · {p.pos.join('/')}</span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: T.pill,
                  background: `${tierColor[tier]}22`, color: tierColor[tier] }}>{TIER_LABEL[tier]}</span>
              </button>
            ))}
            {candidates.length === 0 && <div style={{ color: T.textMuted, fontSize: 13 }}>Everyone's already in this chart.</div>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 12, opacity: 0.7 }}>Name
              <input style={{ ...fieldStyle, marginTop: 4 }} value={form.name} placeholder={`New ${form.type}`}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>Position
                <select style={{ ...fieldStyle, marginTop: 4 }} value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {POSITION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>Registration
                <select style={{ ...fieldStyle, marginTop: 4 }} value={form.reg}
                  onChange={(e) => setForm({ ...form, reg: e.target.value })}>
                  <option value="home">Homegrown</option>
                  <option value="eu">EU</option>
                  <option value="noneu">Non-EU</option>
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>Age
                <input type="number" min="15" max="40" style={{ ...fieldStyle, marginTop: 4 }} value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })} />
              </label>
              <label style={{ fontSize: 12, opacity: 0.7, flex: 1 }}>Rating
                <select style={{ ...fieldStyle, marginTop: 4 }} value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}>
                  {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{'★'.repeat(r)}</option>)}
                </select>
              </label>
            </div>
            <button type="button" onClick={onCreate}
              style={{ marginTop: 4, padding: '10px 16px', borderRadius: Math.max(0, T.radius - 2), border: 'none', cursor: 'pointer',
                background: T.accent, color: T.onAccent, fontWeight: 800, fontSize: 13, fontFamily: 'inherit' }}>
              Create & add to {slot.label}
            </button>
          </div>
        )}
      </div>
    </ModalDialog>
  );
}
