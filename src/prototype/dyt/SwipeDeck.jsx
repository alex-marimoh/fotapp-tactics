import React from 'react';
import { fmtM, fmtWage, HEALTH_LABEL } from './data';

const withA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const cardBg = (T) => (T.flat ? T.cardTo : `linear-gradient(160deg,${T.cardFrom},${T.cardTo})`);
const metaTag = (T) => ({ fontSize: 12, padding: '3px 9px', borderRadius: Math.max(0, T.radius - 4), background: T.soft, color: T.text });

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

export function SwipeDeck({ T, model, decisions, decide, idx, setIdx }) {
  const ORDERED = model.ordered;
  const total = ORDERED.length;
  const player = ORDERED[idx];
  const d = decisions[player.num] || {};
  const cons = model.consequenceFor(player.num);
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
