/*
 * Per-team admin / power-user page (docs/design-user-management.md §4).
 * Manage a club's roster: add / edit / remove players and set their contract,
 * wage, market value, transfer fee, registration category, rating and positions.
 * Reachable at ?admin=<slug>; writes go through the store (localStorage for now).
 */
import React from 'react';
import { DEFAULT_SKIN } from '../default-skin';
import { POSITION_TYPES, complianceOf } from '../squad-data';
import { ALL_NATIONS, regForNat } from '../data/names';
import { SEASON } from '../lib/format';
import {
  upsertPlayer, deletePlayer, regenerateTeam, hasRosterEdits, usesSupabase, subscribeRoster,
} from '../data/store';
import { navigate } from '../navigation/appRoute';
import { AccountChip } from '../auth/AccountChip';
import { usePhone } from '../hooks/useViewport';
import { ModalDialog } from '../ui/ModalDialog';
import { field, primaryBtn, ghostBtn } from '../ui/styles';
import { TeamPicker } from '../ui/TeamPicker';

const REG_LABEL = { home: 'Greek (HG)', eu: 'EU', noneu: 'Non-EU' };
const EMPTY = new Set();

function FieldLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', color: DEFAULT_SKIN.textMuted, marginBottom: 4 }}>{children}</div>;
}

function PosChips({ T, values, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {POSITION_TYPES.map((t) => {
        const on = values.includes(t);
        return (
          <button key={t} onClick={() => onToggle(t)} style={{
            padding: '5px 9px', borderRadius: T.pill, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
            border: `1px solid ${on ? T.accent : T.hair2}`, background: on ? T.accent : 'transparent', color: on ? T.onAccent : T.text }}>{t}</button>
        );
      })}
    </div>
  );
}

function nextFreeNum(roster) {
  const used = new Set(roster.map((p) => p.num));
  for (let n = 1; n < 100; n++) if (!used.has(n)) return n;
  return roster.length + 1;
}

function blankPlayer(roster) {
  return {
    num: nextFreeNum(roster), name: '', age: 24, nat: 'GR', reg: 'home', rating: 3,
    pos: ['CB'], pos2: [], value: 1, wage: 10, transferFee: 1, contractEnd: SEASON + 2, onLoan: false,
  };
}

// ---- the add/edit editor ---------------------------------------------------
function PlayerEditor({ T, initial, originalNum, otherNums, onSave, onCancel }) {
  const titleId = React.useId();
  const [p, setP] = React.useState(initial);
  const [natTouchedReg, setNatTouchedReg] = React.useState(false);
  const dialogLabel = originalNum == null ? 'Add player' : 'Edit player';
  const set = (patch) => setP((cur) => ({ ...cur, ...patch }));

  const pickNat = (nat) => set({ nat, reg: natTouchedReg ? p.reg : regForNat(nat) });
  const togglePos = (key, t) => {
    const cur = p[key];
    const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t];
    set({ [key]: next });
  };

  const numNum = Number(p.num);
  const errors = [];
  if (!p.name.trim()) errors.push('Name is required.');
  if (!Number.isInteger(numNum) || numNum < 1) errors.push('Squad number must be a positive whole number.');
  else if (otherNums.has(numNum)) errors.push(`Number ${numNum} is already taken.`);
  if (p.pos.length === 0) errors.push('Pick at least one primary position.');

  const save = () => {
    if (errors.length) return;
    onSave({
      num: numNum,
      name: p.name.trim(),
      age: Number(p.age) || 0,
      nat: p.nat,
      reg: p.reg,
      rating: Number(p.rating) || 1,
      pos: p.pos,
      pos2: p.pos2.filter((x) => !p.pos.includes(x)),
      value: Number(p.value) || 0,
      wage: Number(p.wage) || 0,
      transferFee: Number(p.transferFee) || 0,
      contractEnd: Number(p.contractEnd) || SEASON,
      expiring: (Number(p.contractEnd) || SEASON) <= SEASON,
      onLoan: Boolean(p.onLoan),
    }, originalNum);
  };

  return (
    <ModalDialog
      open
      onClose={onCancel}
      ariaLabel={dialogLabel}
      titleId={titleId}
      backdropStyle={{
        position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(8,12,20,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      panelStyle={{
        width: 'min(640px,100%)', maxHeight: '90vh', overflowY: 'auto', background: T.surface,
        border: `1px solid ${T.hair2}`, borderRadius: T.radius, padding: 22,
      }}
    >
        <div id={titleId} style={{ fontFamily: T.display, fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
          {dialogLabel}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}><FieldLabel>Name</FieldLabel><input value={p.name} onChange={(e) => set({ name: e.target.value })} style={field(T)} /></div>
          <div><FieldLabel>Number</FieldLabel><input type="number" value={p.num} onChange={(e) => set({ num: e.target.value })} style={field(T)} /></div>
          <div><FieldLabel>Age</FieldLabel><input type="number" value={p.age} onChange={(e) => set({ age: e.target.value })} style={field(T)} /></div>
          <div>
            <FieldLabel>Rating</FieldLabel>
            <select value={p.rating} onChange={(e) => set({ rating: e.target.value })} style={field(T)}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Nationality</FieldLabel>
            <select value={p.nat} onChange={(e) => pickNat(e.target.value)} style={field(T)}>
              {ALL_NATIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Registration</FieldLabel>
            <select value={p.reg} onChange={(e) => { setNatTouchedReg(true); set({ reg: e.target.value }); }} style={field(T)}>
              {Object.entries(REG_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div><FieldLabel>Market value (€M)</FieldLabel><input type="number" step="0.5" value={p.value} onChange={(e) => set({ value: e.target.value })} style={field(T)} /></div>
          <div><FieldLabel>Wage (€k/wk)</FieldLabel><input type="number" value={p.wage} onChange={(e) => set({ wage: e.target.value })} style={field(T)} /></div>
          <div><FieldLabel>Transfer fee (€M)</FieldLabel><input type="number" step="0.5" value={p.transferFee} onChange={(e) => set({ transferFee: e.target.value })} style={field(T)} /></div>
          <div><FieldLabel>Contract until</FieldLabel><input type="number" value={p.contractEnd} onChange={(e) => set({ contractEnd: e.target.value })} style={field(T)} /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={p.onLoan} onChange={(e) => set({ onLoan: e.target.checked })} /> On loan
            </label>
          </div>
          <div style={{ gridColumn: '1 / -1' }}><FieldLabel>Primary positions</FieldLabel><PosChips T={T} values={p.pos} onToggle={(t) => togglePos("pos", t)} /></div>
          <div style={{ gridColumn: '1 / -1' }}><FieldLabel>Secondary positions</FieldLabel><PosChips T={T} values={p.pos2} onToggle={(t) => togglePos("pos2", t)} /></div>
        </div>

        {errors.length > 0 && (
          <div style={{ marginTop: 14, fontSize: 12, color: T.gap }}>{errors.map((e, i) => <div key={i}>• {e}</div>)}</div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" onClick={onCancel} style={ghostBtn(T)}>Cancel</button>
          <button type="button" onClick={save} disabled={errors.length > 0} style={{ ...primaryBtn(T), opacity: errors.length ? 0.5 : 1, cursor: errors.length ? 'default' : 'pointer' }}>Save</button>
        </div>
    </ModalDialog>
  );
}

export function AdminPage({ team }) {
  const T = DEFAULT_SKIN;
  const phone = usePhone(720);
  const [roster, setRoster] = React.useState(team.roster);
  const [editing, setEditing] = React.useState(null); // { player, originalNum } | null
  const edited = hasRosterEdits(team.slug);

  React.useEffect(() => {
    if (!usesSupabase()) return undefined;
    return subscribeRoster(team.slug, setRoster);
  }, [team.slug]);

  const comp = complianceOf(roster, EMPTY, team.rules);
  const otherNums = (originalNum) => new Set(roster.filter((p) => p.num !== originalNum).map((p) => p.num));

  const onSave = (player, originalNum) => {
    setRoster(upsertPlayer(team.slug, player, originalNum));
    setEditing(null);
  };
  const onDelete = (num) => {
    if (window.confirm('Remove this player from the squad?')) setRoster(deletePlayer(team.slug, num));
  };
  const onRegenerate = () => {
    if (window.confirm('Discard all manual edits and regenerate this squad?')) setRoster(regenerateTeam(team.slug));
  };

  const th = { textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: T.textMuted, padding: '8px 10px', position: 'sticky', top: 0, background: T.panel };
  const td = { fontSize: 13, padding: '9px 10px', borderTop: `1px solid ${T.hair}`, whiteSpace: 'nowrap' };
  const compTag = (c) => ({
    fontSize: 12, fontWeight: 800, padding: '5px 11px', borderRadius: T.pill,
    color: c.state === 'over' || c.state === 'under' ? T.onAccent : T.text,
    background: c.state === 'over' ? T.gap : c.state === 'under' ? T.thin : T.soft,
    border: `1px solid ${T.hair2}`,
  });

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {/* ribbon */}
      <div style={{ minHeight: 56, display: 'flex', alignItems: 'center', gap: 12, rowGap: 8, flexWrap: 'wrap', padding: phone ? '8px 14px' : '0 26px', background: T.flat ? T.ribbon[0] : `linear-gradient(90deg,${T.ribbon[0]},${T.ribbon[1]})`, borderBottom: `1px solid ${T.hair}`, position: 'sticky', top: 0, zIndex: 30 }}>
        <span style={{ fontWeight: 850, fontSize: 19, letterSpacing: '-.02em', fontFamily: T.display }}>
          <span style={{ color: T.accent }}>fot</span><span style={{ color: T.accent2 }}>app</span>
        </span>
        <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 600 }}>Manage squad</span>
        <TeamPicker T={T} team={team} param="admin" />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AccountChip T={T} />
          <button onClick={() => navigate({ team: team.slug })} style={ghostBtn(T)}>← Back to board</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: phone ? '16px 14px' : '24px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontFamily: T.display, fontSize: 28, fontWeight: 800 }}>{team.name}</h1>
          <span style={{ fontSize: 13, color: T.textMuted }}>{roster.length} players{edited ? ' · edited' : ''}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={compTag(comp.noneu)}>Non-EU {comp.noneu.n}/{comp.noneu.lim.value}</span>
            <span style={compTag(comp.home)}>Greek {comp.home.n} (min {comp.home.lim.value})</span>
            {edited && <button onClick={onRegenerate} style={ghostBtn(T)}>↺ Regenerate</button>}
            <button onClick={() => setEditing({ player: blankPlayer(roster), originalNum: null })} style={primaryBtn(T)}>+ Add player</button>
          </div>
        </div>

        <div style={{ background: T.panel, border: `1px solid ${T.hair}`, borderRadius: T.radius, overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: phone ? 760 : 'auto', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'Name', 'Pos', 'Age', 'Nat', 'Reg', '★', 'Value', 'Wage', 'Fee', 'Until', ''].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roster.map((p) => (
                <tr key={p.num}>
                  <td style={{ ...td, opacity: 0.6 }}>{p.num}</td>
                  <td style={{ ...td, fontWeight: 700 }}>{p.name}{p.onLoan && <span style={{ fontSize: 10, marginLeft: 6, color: T.textMuted }}>LOAN</span>}</td>
                  <td style={td}>{p.pos.join('/')}{p.pos2.length ? <span style={{ color: T.textMuted }}> · {p.pos2.join('/')}</span> : null}</td>
                  <td style={td}>{p.age}</td>
                  <td style={td}>{p.nat}</td>
                  <td style={{ ...td, color: p.reg === 'noneu' ? T.accent2 : p.reg === 'home' ? T.solid : T.text, fontWeight: 700 }}>{REG_LABEL[p.reg]}</td>
                  <td style={td}>{p.rating}</td>
                  <td style={td}>€{Number(p.value).toFixed(1)}M</td>
                  <td style={td}>€{p.wage}k</td>
                  <td style={td}>€{Number(p.transferFee ?? 0).toFixed(1)}M</td>
                  <td style={{ ...td, color: p.expiring ? T.thin : T.text }}>{p.contractEnd}</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <button onClick={() => setEditing({ player: p, originalNum: p.num })} style={{ ...ghostBtn(T), padding: '5px 11px' }}>Edit</button>
                    <button onClick={() => onDelete(p.num)} style={{ ...ghostBtn(T), padding: '5px 11px', marginLeft: 6, color: T.gap }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <PlayerEditor
          T={T}
          initial={editing.player}
          originalNum={editing.originalNum}
          otherNums={otherNums(editing.originalNum)}
          onSave={onSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
