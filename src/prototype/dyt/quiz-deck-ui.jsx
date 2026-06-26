/*
 * Shared squad-quiz deck UI — same skin as production (variant A).
 */
import React from 'react';
import { displayName, formatPositions, fmtContractEnd, fmtM, fmtSalaryYear, priceForTier, wageForTier } from './data';
import { withA, cardBg, FocusProgress, DecisionFlash } from './quiz-shared';

const TIER_OPTS = [
  ['more', 'Higher'],
  ['same', 'Same'],
  ['less', 'Lower'],
];

export function zoneStyle(T, color, active, locked) {
  return {
    flex: 1, border: 'none', cursor: locked ? 'default' : 'pointer', fontFamily: 'inherit',
    fontSize: 12, fontWeight: 800, letterSpacing: '.06em', padding: '11px 0',
    color, background: withA(color, active ? 0.14 : 0.08), opacity: locked ? 0.4 : 1,
  };
}

export function sideBtnStyle(T, color, locked) {
  return {
    border: 'none', cursor: locked ? 'default' : 'pointer', fontFamily: 'inherit',
    fontWeight: 800, fontSize: 13, letterSpacing: '.04em', borderRadius: T.pill,
    padding: '14px 20px', color, background: withA(color, 0.1),
    opacity: locked ? 0.4 : 1, whiteSpace: 'nowrap',
  };
}

export function PlayerMeta({ T, player, center = true, large = false }) {
  const metaTag = {
    fontSize: 12, padding: '4px 10px', borderRadius: Math.max(0, T.radius - 4),
    background: T.soft, color: T.text, fontWeight: 600,
  };
  return (
    <div style={{ textAlign: center ? 'center' : 'left' }}>
      <h2 style={{
        margin: 0, fontFamily: T.display,
        fontSize: large ? 'clamp(36px,8vw,64px)' : 'clamp(32px,7vw,56px)',
        fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.05,
      }}>
        {displayName(player)}
      </h2>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        justifyContent: center ? 'center' : 'flex-start', marginTop: 14,
      }}>
        <span style={metaTag}>{formatPositions(player)}</span>
        <span style={metaTag}>Age {player.age}</span>
        <span style={{ ...metaTag, fontVariantNumeric: 'tabular-nums' }}>{fmtSalaryYear(player.wage)}</span>
        <span style={{
          ...metaTag, fontVariantNumeric: 'tabular-nums',
          ...(player.expiring ? {
            background: withA(T.thin, 0.16), color: T.thin,
            border: `1px solid ${withA(T.thin, 0.35)}`,
          } : {}),
        }}>
          {fmtContractEnd(player)}
        </span>
      </div>
    </div>
  );
}

export function TierPicker({ T, amountLabel, amount, selected, onSelect, onConfirm, onBack, confirmLabel }) {
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

export function TierBlock({ T, deck }) {
  const { player, pending, tier, setTier, confirmDrop, confirmRenew, cancelPending } = deck;
  if (pending === 'drop') {
    return (
      <TierPicker
        T={T}
        amountLabel="Asking price · market"
        amount={`${fmtM(priceForTier(player, tier))} (market ${fmtM(player.value)})`}
        selected={tier}
        onSelect={setTier}
        onConfirm={confirmDrop}
        onBack={cancelPending}
        confirmLabel="Confirm drop →"
      />
    );
  }
  if (pending === 'renew') {
    return (
      <TierPicker
        T={T}
        amountLabel="New salary · current"
        amount={`${fmtSalaryYear(wageForTier(player, tier))} (was ${fmtSalaryYear(player.wage)})`}
        selected={tier}
        onSelect={setTier}
        onConfirm={confirmRenew}
        onBack={cancelPending}
        confirmLabel="Confirm renew →"
      />
    );
  }
  return null;
}

/** Progress, flash, optional renew ring — same chrome as variant A. */
export function DeckChrome({ T, deck, children }) {
  const { flash, fx, idx, total } = deck;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, position: 'relative', color: T.text }}>
      <FocusProgress T={T} idx={idx} total={total} />
      {fx === 'renew-pulse' && <div className="proto-renew-pulse" style={{ '--pulse': T.accent }} />}
      {fx === 'renew-arm' && <div className="proto-renew-arm" style={{ '--pulse': T.accent }} />}
      {children}
      {flash && <DecisionFlash T={T} verdict={flash} />}
    </div>
  );
}

/** Stacked card shell — shared across all layout variants. */
export function FocusCardStack({ T, player, deck, children, exitMode = 'vertical', outerStyle, className = '' }) {
  const { pending, exit } = deck;
  const exitPrefix = exitMode === 'horizontal' ? 'quiz-focus-exit-h' : 'quiz-focus-exit';
  const exitClass = exit ? `${exitPrefix}--${exit}` : '';

  return (
    <div
      key={player.num}
      className={`quiz-focus-enter ${exitClass} ${className}`.trim()}
      style={{ width: 'min(400px, 100%)', ...outerStyle }}
    >
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: '10px -6px -10px -6px', background: cardBg(T), borderRadius: T.radius, border: `1px solid ${T.hair}`, opacity: 0.35 }} />
        <div style={{ position: 'absolute', inset: '5px -3px -5px -3px', background: cardBg(T), borderRadius: T.radius, border: `1px solid ${T.hair}`, opacity: 0.6 }} />
        <div style={{
          position: 'relative', background: cardBg(T), borderRadius: T.radius, overflow: 'hidden',
          border: `1.5px solid ${pending === 'drop' ? T.gap : pending === 'renew' ? T.accent : T.hair2}`,
          boxShadow: '0 20px 50px rgba(12,22,40,.12)',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Variant A layout — ↑ keep / ↓ drop zones on the card. */
export function VerticalZonesCard({ T, deck }) {
  const { player, pending, locked, onKeep, onDropTap, onRenewTap, onRelease } = deck;

  return (
    <FocusCardStack T={T} player={player} deck={deck}>
      {!pending && (
        <div style={{ display: 'flex' }}>
          {player.expiring ? (
            <button type="button" onClick={onRenewTap} style={{ ...zoneStyle(T, T.accent, false, locked), flex: 1 }}>↻ Renew</button>
          ) : (
            <button type="button" onClick={onKeep} style={{ ...zoneStyle(T, T.solid, false, locked), flex: 1 }}>↑ Keep</button>
          )}
        </div>
      )}
      <div style={{ padding: pending ? '20px 18px' : '28px 24px' }}>
        <PlayerMeta T={T} player={player} />
        <TierBlock T={T} deck={deck} />
      </div>
      {!pending && (
        <button
          type="button"
          onClick={player.expiring ? onRelease : onDropTap}
          style={{ ...zoneStyle(T, T.gap, false, locked), display: 'block', width: '100%' }}
        >
          {player.expiring ? '↓ Release' : '↓ Drop'}
        </button>
      )}
    </FocusCardStack>
  );
}

/** Player-only card — actions live outside the card. */
export function PlayerOnlyCard({ T, player, deck, padding = '28px 24px' }) {
  return (
    <FocusCardStack T={T} player={player} deck={deck}>
      <div style={{ padding: deck.pending ? '20px 18px' : padding }}>
        <PlayerMeta T={T} player={player} />
        <TierBlock T={T} deck={deck} />
      </div>
    </FocusCardStack>
  );
}

export function useDeckKeyboard(deck, player) {
  const {
    pending, onKeep, onDropTap, onRenewTap, onRelease,
    confirmDrop, confirmRenew, setIdx, idx, total,
  } = deck;

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
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.metaKey || e.ctrlKey) setIdx((i) => Math.max(i - 1, 0));
        else if (player.expiring) onRelease();
        else onDropTap();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.metaKey || e.ctrlKey) setIdx((i) => Math.min(i + 1, total - 1));
        else if (player.expiring) onRenewTap();
        else onKeep();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player.num, player.expiring, pending, onKeep, onDropTap, onRenewTap, onRelease, confirmDrop, confirmRenew, setIdx, total, idx]);
}
