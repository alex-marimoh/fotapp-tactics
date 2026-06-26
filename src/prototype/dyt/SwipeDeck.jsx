/*
 * Squad quiz deck — one player, Keep / Drop (or Renew / Release when expiring).
 */
import React from 'react';
import { displayName, formatPositions, fmtM, fmtSalaryYear, priceForTier, wageForTier } from './data';
import { withA, cardBg, FocusProgress, DecisionFlash } from './quiz-shared';

const TIER_OPTS = [
  ['more', 'Higher'],
  ['same', 'Same'],
  ['less', 'Lower'],
];

function TierPicker({ T, amountLabel, amount, selected, onSelect, onConfirm, onBack, confirmLabel }) {
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 8 }}>
        {amountLabel}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, fontVariantNumeric: 'tabular-nums' }}>{amount}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {TIER_OPTS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => onSelect(k)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: T.pill, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: 800, border: `1px solid ${selected === k ? T.accent : T.hair2}`,
              background: selected === k ? T.accent : T.soft,
              color: selected === k ? T.onAccent : T.text,
            }}
          >{label}</button>
        ))}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        style={{
          marginTop: 12, width: '100%', padding: '10px 0', borderRadius: T.pill, border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
          background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`,
          color: T.onAccent,
        }}
      >{confirmLabel}</button>
      <button type="button" onClick={onBack} style={{
        marginTop: 8, width: '100%', padding: '6px 0', border: 'none', background: 'transparent',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, color: T.text, opacity: 0.45,
      }}>← Back</button>
    </div>
  );
}

function DeckPlayerLabel({ T, player }) {
  const metaTag = {
    fontSize: 12, padding: '4px 10px', borderRadius: Math.max(0, T.radius - 4),
    background: T.soft, color: T.text, fontWeight: 600,
  };
  return (
    <div style={{ textAlign: 'center' }}>
      {player.expiring && (
        <span style={{
          display: 'inline-block', marginBottom: 10, fontSize: 11, fontWeight: 800,
          letterSpacing: '.06em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999,
          background: withA(T.thin, 0.16), color: T.thin, border: `1px solid ${withA(T.thin, 0.35)}`,
        }}>
          Contract expiring
        </span>
      )}
      <h2 style={{
        margin: 0, fontFamily: T.display, fontSize: 'clamp(32px,7vw,56px)', fontWeight: 800,
        letterSpacing: '-.02em', lineHeight: 1.05,
      }}>
        {displayName(player)}
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 14 }}>
        <span style={metaTag}>{formatPositions(player)}</span>
        <span style={metaTag}>Age {player.age}</span>
        <span style={{ ...metaTag, fontVariantNumeric: 'tabular-nums' }}>{fmtSalaryYear(player.wage)}</span>
      </div>
    </div>
  );
}

export function SwipeDeck({ T, model, decisions, decide, idx, setIdx }) {
  const ordered = model.ordered;
  const total = ordered.length;
  const player = ordered[idx];
  const d = decisions[player.num] || {};

  const [pending, setPending] = React.useState(null);
  const [tier, setTier] = React.useState('same');
  const [flash, setFlash] = React.useState(null);
  const [exit, setExit] = React.useState(null);

  React.useEffect(() => {
    setPending(null);
    setTier('same');
    setFlash(null);
    setExit(null);
  }, [player.num]);

  const advance = React.useCallback(() => {
    setPending(null);
    setTier('same');
    setIdx((i) => Math.min(i + 1, total - 1));
    setTimeout(() => { setExit(null); setFlash(null); }, 50);
  }, [setIdx, total]);

  const finish = React.useCallback((verdict, patch, flashKey, exitKey) => {
    if (exit) return;
    decide(player.num, { verdict, ...patch });
    setFlash(flashKey);
    setExit(exitKey);
    setTimeout(advance, 400);
  }, [player.num, decide, advance, exit]);

  const onKeep = () => finish('keep', {}, 'keep', 'keep');
  const onDropTap = () => {
    if (exit) return;
    setPending('drop');
    setTier(d.priceTier ?? 'same');
  };
  const onRenewTap = () => {
    if (exit) return;
    setPending('renew');
    setTier(d.wageTier ?? 'same');
  };
  const onRelease = () => finish('release', {}, 'release', 'sell');
  const confirmDrop = () => finish('sell', { price: priceForTier(player, tier), priceTier: tier }, 'drop', 'sell');
  const confirmRenew = () => finish('renew', { wage: wageForTier(player, tier), wageTier: tier }, 'renew', 'keep');

  React.useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (pending === 'drop') {
        if (e.key === 'Enter') { e.preventDefault(); confirmDrop(); }
        return;
      }
      if (pending === 'renew') {
        if (e.key === 'Enter') { e.preventDefault(); confirmRenew(); }
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (player.expiring) onRenewTap();
        else onKeep();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (player.expiring) onRelease();
        else onDropTap();
      } else if (e.key === 'ArrowLeft') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); setIdx((i) => Math.min(i + 1, total - 1)); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const exitClass = exit ? `quiz-focus-exit--${exit}` : '';
  const dropAmount = fmtM(priceForTier(player, tier));
  const renewAmount = fmtSalaryYear(wageForTier(player, tier));
  const zoneStyle = (color, active) => ({
    flex: 1, border: 'none', cursor: exit ? 'default' : 'pointer', fontFamily: 'inherit',
    fontSize: 12, fontWeight: 800, letterSpacing: '.06em', padding: '11px 0',
    color, background: withA(color, active ? 0.14 : 0.08), opacity: exit ? 0.4 : 1,
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, position: 'relative' }}>
      <FocusProgress T={T} idx={idx} total={total} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div key={player.num} className={`quiz-focus-enter ${exitClass}`} style={{ width: 'min(400px, 100%)' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '10px -6px -10px -6px', background: cardBg(T), borderRadius: T.radius, border: `1px solid ${T.hair}`, opacity: 0.35 }} />
            <div style={{ position: 'absolute', inset: '5px -3px -5px -3px', background: cardBg(T), borderRadius: T.radius, border: `1px solid ${T.hair}`, opacity: 0.6 }} />
            <div style={{
              position: 'relative', background: cardBg(T), borderRadius: T.radius, overflow: 'hidden',
              border: `1.5px solid ${pending === 'drop' ? T.gap : pending === 'renew' ? T.accent : T.hair2}`,
              boxShadow: '0 20px 50px rgba(12,22,40,.12)',
            }}>
              {!pending && (
                <div style={{ display: 'flex' }}>
                  {player.expiring ? (
                    <button type="button" onClick={onRenewTap} style={{ ...zoneStyle(T.accent, false), flex: 1 }}>↻ Renew</button>
                  ) : (
                    <button type="button" onClick={onKeep} style={{ ...zoneStyle(T.solid, false), flex: 1 }}>↑ Keep</button>
                  )}
                </div>
              )}
              <div style={{ padding: pending ? '20px 18px' : '28px 24px' }}>
                <DeckPlayerLabel T={T} player={player} />
                {pending === 'drop' && (
                  <TierPicker
                    T={T}
                    amountLabel="Asking price · market"
                    amount={`${dropAmount} (market ${fmtM(player.value)})`}
                    selected={tier}
                    onSelect={setTier}
                    onConfirm={confirmDrop}
                    onBack={() => setPending(null)}
                    confirmLabel="Confirm drop →"
                  />
                )}
                {pending === 'renew' && (
                  <TierPicker
                    T={T}
                    amountLabel="New salary · current"
                    amount={`${renewAmount} (was ${fmtSalaryYear(player.wage)})`}
                    selected={tier}
                    onSelect={setTier}
                    onConfirm={confirmRenew}
                    onBack={() => setPending(null)}
                    confirmLabel="Confirm renew →"
                  />
                )}
              </div>
              {!pending && (
                <button
                  type="button"
                  onClick={player.expiring ? onRelease : onDropTap}
                  style={{
                    display: 'block', width: '100%', border: 'none', cursor: exit ? 'default' : 'pointer',
                    fontFamily: 'inherit', fontSize: 12, fontWeight: 800, letterSpacing: '.06em', padding: '11px 0',
                    color: T.gap, background: withA(T.gap, 0.08), opacity: exit ? 0.4 : 1,
                  }}
                >
                  {player.expiring ? '↓ Release' : '↓ Drop'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {flash && <DecisionFlash T={T} verdict={flash} />}
    </div>
  );
}
