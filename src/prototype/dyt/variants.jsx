/* PROTOTYPE — the five "Design Your Team" review variants. Delete with the folder. */
import React from 'react';
import {
  ORDERED, byNumA, SLOTS, DEPTH, consequenceFor, healthForSlot, effectiveStarter,
  fmtM, fmtWage, HEALTH_LABEL,
} from './data';

const withA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const hcol = (T, h) => (h === 'gap' ? T.gap : h === 'thin' ? T.thin : T.solid);
const cardBg = (T) => (T.flat ? T.cardTo : `linear-gradient(160deg,${T.cardFrom},${T.cardTo})`);

// ---- shared little pieces -------------------------------------------------
function PriceRow({ T, player, value, onChange }) {
  const min = Math.max(0.5, Math.round(player.value * 0.5 * 2) / 2);
  const max = Math.round(player.value * 2 * 2) / 2;
  const v = value ?? player.value;
  const pct = Math.round((v / player.value - 1) * 100);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 20, fontWeight: 800 }}>{fmtM(v)}</span>
        <span style={{ fontSize: 12, opacity: 0.6 }}>asking · market {fmtM(player.value)} ({pct >= 0 ? '+' : ''}{pct}%)</span>
      </div>
      <input type="range" min={min} max={max} step={0.5} value={v}
        onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: T.accent }} />
    </div>
  );
}
function WageRow({ T, value, onPick }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[['more', 'More wage'], ['same', 'Same'], ['less', 'Less']].map(([k, l]) => (
        <button key={k} onClick={() => onPick(k)} style={{
          flex: 1, padding: '8px 0', borderRadius: T.pill, cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 12, fontWeight: 800, border: `1px solid ${value === k ? T.accent : T.hair2}`,
          background: value === k ? T.accent : 'transparent', color: value === k ? T.onAccent : T.text }}>{l}</button>
      ))}
    </div>
  );
}
const metaTag = (T) => ({ fontSize: 12, padding: '3px 9px', borderRadius: Math.max(0, T.radius - 4), background: T.soft, color: T.text });

// ===========================================================================
// A — Swipe deck
// ===========================================================================
export function SwipeDeck({ T, decisions, decide, idx, setIdx }) {
  const total = ORDERED.length;
  const player = ORDERED[idx];
  const d = decisions[player.num] || {};
  const cons = consequenceFor(player.num);
  const back = () => setIdx((i) => Math.max(i - 1, 0));
  const fwd = () => setIdx((i) => Math.min(i + 1, total - 1));
  const keep = () => { decide(player.num, { verdict: 'keep' }); if (!player.expiring) fwd(); };
  const sell = () => decide(player.num, { verdict: 'sell', price: d.price ?? player.value });

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); fwd(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); keep(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); sell(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const zone = (c, active) => ({ display: 'block', width: '100%', border: 'none', cursor: 'pointer',
    fontFamily: 'inherit', fontSize: 12, fontWeight: 800, letterSpacing: '.06em', padding: '9px 0',
    color: c, background: withA(c, active ? 0.22 : 0.1) });
  const nav = (dis) => ({ width: 40, borderRadius: T.radius, border: `1px solid ${T.hair2}`, background: T.surface,
    color: T.text, cursor: dis ? 'default' : 'pointer', opacity: dis ? 0.4 : 1, fontSize: 20, fontFamily: 'inherit' });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 16 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {ORDERED.map((p, i) => {
          const v = decisions[p.num]?.verdict;
          const c = i === idx ? T.accent : v === 'keep' ? T.solid : v === 'sell' ? T.gap : T.hair2;
          return <span key={p.num} style={{ width: i === idx ? 16 : 7, height: 7, borderRadius: 999, background: c, transition: 'width .15s' }} />;
        })}
      </div>
      <div style={{ fontSize: 12, opacity: 0.6, fontFamily: T.display, letterSpacing: '.08em' }}>{idx + 1} / {total}</div>

      <div style={{ display: 'flex', alignItems: 'stretch', gap: 12, width: 'min(440px,100%)' }}>
        <button onClick={back} disabled={idx === 0} aria-label="Previous player" style={nav(idx === 0)}>‹</button>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '12px -7px -12px -7px', background: cardBg(T), border: `1px solid ${T.hair}`, borderRadius: T.radius, opacity: 0.4 }} />
          <div style={{ position: 'absolute', inset: '6px -3px -6px -3px', background: cardBg(T), border: `1px solid ${T.hair}`, borderRadius: T.radius, opacity: 0.7 }} />
          <div style={{ position: 'relative', background: cardBg(T), borderRadius: T.radius, overflow: 'hidden',
            border: `1.5px solid ${d.verdict === 'keep' ? T.solid : d.verdict === 'sell' ? T.gap : T.hair2}` }}>
            <button onClick={keep} style={zone(T.solid, d.verdict === 'keep')}>↑ Keep{d.verdict === 'keep' ? ' ✓' : ''}</button>
            <div style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.6 }}>{cons.role}</span>
                {player.expiring
                  ? <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 999, background: withA(T.thin, 0.16), color: T.thin }}>Contract ends {player.contractEnd}</span>
                  : <span style={{ fontSize: 11, opacity: 0.5 }}>Until {player.contractEnd}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.01em' }}>{player.name}</span>
                <span style={{ fontSize: 13, opacity: 0.55 }}>#{player.num}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0 12px' }}>
                {[`Age ${player.age}`, `★ ${player.rating}`, fmtM(player.value), fmtWage(player.wage)].map((t) => (
                  <span key={t} style={metaTag(T)}>{t}</span>
                ))}
              </div>
              {cons.after && cons.severe && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: Math.max(0, T.radius - 2), background: withA(T.gap, 0.1), color: T.gap, fontSize: 13, fontWeight: 700 }}>
                  Sell → {cons.slot} drops to {HEALTH_LABEL[cons.after]}
                </div>
              )}
              {d.verdict === 'sell' && (
                <div style={{ marginTop: 12 }}>
                  <PriceRow T={T} player={player} value={d.price} onChange={(v) => decide(player.num, { price: v })} />
                  <button onClick={fwd} style={{ marginTop: 10, width: '100%', padding: '9px 0', borderRadius: T.pill, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13, background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`, color: T.onAccent }}>Confirm sell ›</button>
                </div>
              )}
              {d.verdict === 'keep' && player.expiring && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>Renew expiring deal:</div>
                  <WageRow T={T} value={d.wage} onPick={(w) => { decide(player.num, { wage: w }); fwd(); }} />
                </div>
              )}
            </div>
            <button onClick={sell} style={zone(T.gap, d.verdict === 'sell')}>↓ Sell{d.verdict === 'sell' ? ' ✓' : ''}</button>
          </div>
        </div>
        <button onClick={fwd} disabled={idx === total - 1} aria-label="Next player" style={nav(idx === total - 1)}>›</button>
      </div>
      <div style={{ fontSize: 11, opacity: 0.45 }}>← → browse · ↑ keep · ↓ sell</div>
    </div>
  );
}

// ===========================================================================
// B — Pitch sweep
// ===========================================================================
export function PitchSweep({ T, decisions, decide }) {
  const [sel, setSel] = React.useState('ST');
  const soldSet = new Set(ORDERED.filter((p) => decisions[p.num]?.verdict === 'sell').map((p) => p.num));
  const slot = SLOTS.find((s) => s.id === sel) || SLOTS[0];
  const stack = [DEPTH[slot.id].starter, ...DEPTH[slot.id].backups].filter(Boolean).map((o) => o.num);
  const h = healthForSlot(slot.id, soldSet);
  const mini = (c, active) => ({ width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 13, fontWeight: 800, border: `1px solid ${active ? c : T.hair2}`, background: active ? c : 'transparent', color: active ? T.onAccent : c });

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(260px,360px)', gap: 16, padding: 16 }}>
      <div style={{ position: 'relative', borderRadius: T.radius, overflow: 'hidden',
        background: T.flat ? T.pitch[1] : `radial-gradient(120% 90% at 50% 0%, ${T.pitch[0]}, ${T.pitch[2]})` }}>
        {SLOTS.map((s) => {
          const sh = healthForSlot(s.id, soldSet);
          const pn = effectiveStarter(s.id, soldSet);
          const isSel = s.id === slot.id;
          return (
            <button key={s.id} onClick={() => setSel(s.id)} style={{ position: 'absolute', left: `${s.left}%`, top: `${s.top}%`,
              transform: `translate(-50%,-50%) scale(${isSel ? 1.12 : 1})`, border: 'none', background: 'transparent', cursor: 'pointer', transition: 'transform .15s' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: withA(T.bg, 0.85), border: `2.5px solid ${hcol(T, sh)}`, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, color: T.text, margin: '0 auto' }}>{pn ?? '!'}</div>
              <div style={{ marginTop: 3, fontSize: 10, fontWeight: 800, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,.6)' }}>{s.label}</div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: T.display }}>{slot.label}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: hcol(T, h) }}>{HEALTH_LABEL[h]}</span>
          <span style={{ fontSize: 11, opacity: 0.5, marginLeft: 'auto' }}>tap a position →</span>
        </div>
        {stack.map((num, i) => {
          const p = byNumA[num];
          const v = decisions[num]?.verdict;
          return (
            <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderRadius: T.radius,
              background: T.panel, border: `1px solid ${v === 'sell' ? T.gap : T.hair}`, opacity: v === 'sell' ? 0.6 : 1 }}>
              <span style={{ fontSize: 10, fontWeight: 800, opacity: 0.5, width: 56 }}>{i === 0 ? 'STARTER' : `BACKUP ${i}`}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, textDecoration: v === 'sell' ? 'line-through' : 'none' }}>{p.name}</span>
              <span style={{ fontSize: 11, opacity: 0.6 }}>{fmtM(p.value)}</span>
              <button onClick={() => decide(num, { verdict: 'keep' })} aria-label="Keep" style={mini(T.solid, v === 'keep')}>✓</button>
              <button onClick={() => decide(num, { verdict: 'sell', price: p.value })} aria-label="Sell" style={mini(T.gap, v === 'sell')}>✕</button>
            </div>
          );
        })}
        {h === 'gap' && <div style={{ padding: '10px 12px', border: `2px dashed ${T.gap}`, borderRadius: T.radius, color: T.gap, fontSize: 12, textAlign: 'center' }}>No one left to start here.</div>}
      </div>
    </div>
  );
}

// ===========================================================================
// C — Triage list
// ===========================================================================
export function TriageList({ T, decisions, decide, summary }) {
  const seg = (c, active) => ({ padding: '6px 14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 12, fontWeight: 800, background: active ? withA(c, 0.16) : 'transparent', color: active ? c : T.text });
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 16 }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: T.soft, borderRadius: T.radius, marginBottom: 10 }}>
          <span style={{ fontSize: 13, opacity: 0.7 }}>{summary.decided} of {summary.total} decided</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.6 }}>War chest</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: T.solid }}>{fmtM(summary.warChest)}</span>
        </div>
        {ORDERED.map((p) => {
          const d = decisions[p.num] || {};
          return (
            <div key={p.num} style={{ borderBottom: `1px solid ${T.hair}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px' }}>
                <span style={{ width: 34, fontSize: 11, opacity: 0.5 }}>{p.pos[0]}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{p.name}
                  <span style={{ fontSize: 12, opacity: 0.5, fontWeight: 400 }}> {fmtM(p.value)}{p.expiring ? ` · ends ${p.contractEnd}` : ''}</span></span>
                <div style={{ display: 'flex', border: `1px solid ${T.hair2}`, borderRadius: T.pill, overflow: 'hidden' }}>
                  <button onClick={() => decide(p.num, { verdict: 'keep' })} style={seg(T.solid, d.verdict === 'keep')}>Keep</button>
                  <button onClick={() => decide(p.num, { verdict: 'sell', price: d.price ?? p.value })} style={seg(T.gap, d.verdict === 'sell')}>Sell</button>
                </div>
              </div>
              {d.verdict === 'sell' && <div style={{ padding: '2px 4px 12px 48px' }}><PriceRow T={T} player={p} value={d.price} onChange={(v) => decide(p.num, { price: v })} /></div>}
              {d.verdict === 'keep' && p.expiring && (
                <div style={{ padding: '2px 4px 12px 48px' }}>
                  <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 6 }}>Expiring — renew at:</div>
                  <WageRow T={T} value={d.wage} onPick={(w) => decide(p.num, { wage: w })} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===========================================================================
// D — Budget ledger
// ===========================================================================
export function BudgetLedger({ T, decisions, decide, summary }) {
  const th = { textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', opacity: 0.5, padding: '9px 12px' };
  const td = { fontSize: 13, padding: '9px 12px', borderTop: `1px solid ${T.hair}` };
  const btn = (c, active) => ({ padding: '4px 10px', borderRadius: T.pill, cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 11, fontWeight: 800, border: `1px solid ${active ? c : T.hair2}`, background: active ? withA(c, 0.14) : 'transparent', color: active ? c : T.text });
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 16 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', border: `1px solid ${T.hair}`, borderRadius: T.radius, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: T.soft }}>
            <th style={th}>Player</th><th style={{ ...th, textAlign: 'right' }}>Value</th>
            <th style={{ ...th, textAlign: 'right' }}>Wage</th><th style={{ ...th, textAlign: 'right' }}>Decision</th>
          </tr></thead>
          <tbody>
            {ORDERED.map((p) => {
              const d = decisions[p.num] || {};
              return (
                <tr key={p.num}>
                  <td style={td}><b style={{ fontWeight: 700 }}>{p.name}</b> <span style={{ opacity: 0.5, fontSize: 11 }}>{p.pos[0]}</span></td>
                  <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtM(p.value)}</td>
                  <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{p.wage}k</td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', gap: 6 }}>
                      <button onClick={() => decide(p.num, { verdict: 'keep' })} style={btn(T.solid, d.verdict === 'keep')}>Keep</button>
                      <button onClick={() => decide(p.num, { verdict: 'sell', price: d.price ?? p.value })} style={btn(T.gap, d.verdict === 'sell')}>{d.verdict === 'sell' ? `+${fmtM(d.price ?? p.value)}` : 'Sell'}</button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot><tr style={{ background: T.soft, borderTop: `2px solid ${T.hair2}` }}>
            <td style={{ ...td, fontWeight: 800, borderTop: 'none' }}>War chest</td>
            <td colSpan={2} style={{ ...td, textAlign: 'right', fontSize: 11, opacity: 0.6, borderTop: 'none' }}>{summary.sellCount} sold · {summary.wagesFreed}k/wk freed</td>
            <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: T.solid, fontSize: 16, borderTop: 'none' }}>{fmtM(summary.warChest)}</td>
          </tr></tfoot>
        </table>
      </div>
    </div>
  );
}

// ===========================================================================
// E — Two-pile sorter
// ===========================================================================
function Pile({ T, title, color, items, decide, kind }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: T.panel, border: `1px solid ${color}`, borderRadius: T.radius, padding: 12, minHeight: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color, marginBottom: 10 }}>{kind === 'keep' ? '↑' : '↓'} {title} · {items.length}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, overflowY: 'auto', alignContent: 'flex-start' }}>
        {items.map((p) => (
          <button key={p.num} onClick={() => decide(p.num, { verdict: undefined })} title="Click to put back"
            style={{ fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 999, border: 'none', cursor: 'pointer', background: withA(color, 0.14), color }}>
            {p.name}{kind === 'sell' ? ` ${fmtM(p.price ?? p.value)}` : ''}
          </button>
        ))}
        {items.length === 0 && <span style={{ fontSize: 12, opacity: 0.4 }}>Empty</span>}
      </div>
    </div>
  );
}
export function TwoPileSorter({ T, decisions, decide, summary }) {
  const current = ORDERED.find((p) => !decisions[p.num]?.verdict) || null;
  const sold = summary.sold.map((p) => ({ ...p, price: decisions[p.num]?.price }));
  const big = (c) => ({ padding: '10px 16px', borderRadius: T.pill, border: `1px solid ${c}`, cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: 800, fontSize: 13, background: withA(c, 0.12), color: c });
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 16, maxWidth: 760, margin: '0 auto', width: '100%' }}>
      {current ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: cardBg(T), border: `1.5px solid ${T.hair2}`, borderRadius: T.radius }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{current.name}
              <span style={{ fontSize: 12, opacity: 0.5, fontWeight: 400 }}> {current.pos[0]} · {fmtM(current.value)}{current.expiring ? ` · ends ${current.contractEnd}` : ''}</span></div>
          </div>
          <button onClick={() => decide(current.num, { verdict: 'keep', wage: current.expiring ? 'same' : undefined })} style={big(T.solid)}>↑ Keep</button>
          <button onClick={() => decide(current.num, { verdict: 'sell', price: current.value })} style={big(T.gap)}>↓ Sell</button>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', background: withA(T.solid, 0.1), borderRadius: T.radius, color: T.solid, fontWeight: 700, textAlign: 'center' }}>
          All {summary.total} reviewed — war chest {fmtM(summary.warChest)}{summary.gaps.length ? ` · gaps: ${summary.gaps.join(', ')}` : ' · no gaps'}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Pile T={T} title="Keep" color={T.solid} items={summary.kept} decide={decide} kind="keep" />
        <Pile T={T} title="Sell" color={T.gap} items={sold} decide={decide} kind="sell" />
      </div>
    </div>
  );
}
