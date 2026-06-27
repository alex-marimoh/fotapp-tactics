/*
 * PROTOTYPE — renew contract UI variants (?renewVariant=A|B|C on ?quiz=squad).
 * Question: card stays visible; where does Higher/Same/Lower live?
 */
import React from 'react';
import { withA, RENEW_TIER_HINT } from '../../lib/format';
import { TradingCardView, DeckActionButtons } from './quiz-deck-ui';
import { KeyedDeckSession } from './deck-session';
import { PrototypeSwitcher } from './PrototypeSwitcher';
import { setPrototypeVariant } from './prototype-variant';
import { RENEW_PROTOTYPE_VARIANTS } from './renew-prototype-variant';

const VARIANTS = RENEW_PROTOTYPE_VARIANTS;

/** Tier step only — salary already on the card. */
export function RenewTierCompact({ T, deck, dark = false }) {
  const { tier, setTier, confirmRenew, cancelPending } = deck;
  const hair = dark ? 'rgba(255,255,255,.15)' : T.hair2;
  const soft = dark ? 'rgba(255,255,255,.08)' : T.soft;
  const text = dark ? '#f4f6fa' : T.text;
  const muted = dark ? T.textMutedOnDark : T.textMuted;
  const tierBtn = (k, label) => (
    <button
      key={k}
      type="button"
      onClick={() => setTier(k)}
      style={{
        flex: 1, padding: '9px 0', borderRadius: T.pill, cursor: 'pointer', fontFamily: 'inherit',
        fontSize: 12, fontWeight: 800, border: `1px solid ${tier === k ? T.accent : hair}`,
        background: tier === k ? T.accent : soft,
        color: tier === k ? T.onAccent : text,
      }}
    >{label}</button>
  );

  return (
    <div style={{ color: text }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: muted, marginBottom: 10 }}>
        New deal · vs current wage
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {tierBtn('more', 'Higher')}
        {tierBtn('same', 'Same')}
        {tierBtn('less', 'Lower')}
      </div>
      <div style={{ fontSize: 11, color: muted, marginTop: 10, minHeight: 16, fontStyle: 'italic' }}>
        {RENEW_TIER_HINT[tier]}
      </div>
      <button
        type="button"
        onClick={confirmRenew}
        style={{
          marginTop: 14, width: '100%', padding: '10px 0', borderRadius: T.pill, border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
          background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`,
          color: T.onAccent,
        }}
      >Confirm renew →</button>
      <button type="button" onClick={cancelPending} style={{
        marginTop: 8, width: '100%', padding: '6px 0', border: 'none', background: 'transparent',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, color: muted,
      }}>← Back</button>
    </div>
  );
}

function panelShell(T, { className = '', children, width }) {
  return (
    <div
      className={className}
      style={{
        width: width ?? 'min(220px, 42vw)',
        flexShrink: 0,
        borderRadius: 14,
        padding: '16px 16px 14px',
        background: 'linear-gradient(165deg, #1c2433 0%, #0f141c 55%, #1a1028 100%)',
        border: `2px solid ${T.accent}`,
        boxShadow: '0 20px 48px rgba(0,0,0,.4)',
        color: '#f4f6fa',
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', color: T.textMutedOnDark }}>NEW DEAL</span>
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}

/** A — renew panel slides in to the right; card untouched. */
function RenewVariantA({ T, deck }) {
  const renewing = deck.pending === 'renew';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: renewing ? 14 : 0, flexWrap: 'wrap' }}>
      <TradingCardView T={T} deck={deck} renewLayout="keep" />
      {renewing && panelShell(T, { className: 'renew-popup renew-popup--side', children: <RenewTierCompact T={T} deck={deck} dark /> })}
    </div>
  );
}

/** B — panel drops below the card; card stays fully visible. */
function RenewVariantB({ T, deck }) {
  const renewing = deck.pending === 'renew';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'min(280px, 88vw)' }}>
      <TradingCardView T={T} deck={deck} renewLayout="keep" />
      {renewing && (
        <div className="renew-popup renew-popup--sheet" style={{
          width: '100%', marginTop: 10, zIndex: 4,
          padding: '14px 16px 16px', borderRadius: 14,
          background: 'linear-gradient(165deg, #1c2433, #0f141c)',
          border: `2px solid ${T.accent}`,
          boxShadow: '0 16px 40px rgba(0,0,0,.4)',
        }}>
          <RenewTierCompact T={T} deck={deck} dark />
        </div>
      )}
    </div>
  );
}

/** C — two-card spread; renew is a sibling slab, not an overlay. */
function RenewVariantC({ T, deck }) {
  const renewing = deck.pending === 'renew';
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: 10,
      flexWrap: 'wrap', maxWidth: 'min(580px, 96vw)',
    }}>
      <div style={{
        flex: renewing ? '0 1 auto' : undefined,
        opacity: renewing ? 0.92 : 1,
        transform: renewing ? 'scale(0.96)' : 'none',
        transition: 'transform 0.25s ease, opacity 0.25s ease',
      }}>
        <TradingCardView T={T} deck={deck} renewLayout="keep" />
      </div>
      {renewing && (
        <div className="renew-popup renew-popup--spread" style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          width: 'min(240px, 44vw)', minHeight: 280,
          borderRadius: 14, padding: '16px',
          background: `linear-gradient(165deg, ${withA(T.accent, 0.15)} 0%, #0f141c 60%)`,
          border: `2px dashed ${withA(T.accent, 0.6)}`,
          boxShadow: '0 16px 40px rgba(0,0,0,.35)',
        }}>
          <RenewTierCompact T={T} deck={deck} dark />
        </div>
      )}
    </div>
  );
}

const RENDERERS = { A: RenewVariantA, B: RenewVariantB, C: RenewVariantC };

function firstExpiringIdx(ordered) {
  const i = ordered.findIndex((p) => p.expiring);
  return i >= 0 ? i : 0;
}

function RenewPrototypeBody({ T, deck, current, cycle }) {
  const Renderer = RENDERERS[current] ?? RenewVariantA;
  const showActions = !deck.pending;

  return (
    <>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '20px 20px 80px', gap: 24,
      }}>
        {!deck.player.expiring && !deck.pending && (
          <div style={{
            fontSize: 12, fontWeight: 600, color: T.textMuted, textAlign: 'center', maxWidth: 300,
            padding: '8px 12px', borderRadius: 8, background: withA(T.thin, 0.12), border: `1px solid ${withA(T.thin, 0.25)}`,
          }}>
            This player isn&apos;t expiring — tap ↻ anyway, or use arrows to find an expiring contract.
          </div>
        )}
        <Renderer T={T} deck={deck} />
        {showActions && <DeckActionButtons T={T} deck={deck} />}
      </div>
      <PrototypeSwitcher
        param="renewVariant"
        variants={VARIANTS}
        current={current}
        onCycle={cycle}
        hint="Tap ↻ on an expiring player · card should stay put"
      />
    </>
  );
}

/**
 * @param {{ T: object, ordered: object[], decisions: object, decide: Function, idx: number, setIdx: Function, variant: string }} props
 */
export function RenewPrototypeDeck({ T, ordered, decisions, decide, idx, setIdx, variant }) {
  const [current, setCurrent] = React.useState(() => {
    const v = variant.toUpperCase();
    return VARIANTS.includes(v) ? v : 'A';
  });

  const cycle = React.useCallback((next) => {
    setCurrent(next);
    setPrototypeVariant('renewVariant', next);
  }, []);

  const didJump = React.useRef(false);
  React.useEffect(() => {
    if (didJump.current) return;
    didJump.current = true;
    const player = ordered[idx];
    if (player && !player.expiring) {
      setIdx(firstExpiringIdx(ordered));
    }
  }, [ordered, idx, setIdx]);

  return (
    <KeyedDeckSession
      T={T}
      ordered={ordered}
      decisions={decisions}
      decide={decide}
      idx={idx}
      setIdx={setIdx}
    >
      {(deck) => <RenewPrototypeBody T={T} deck={deck} current={current} cycle={cycle} />}
    </KeyedDeckSession>
  );
}
