/*
 * Squad quiz deck UI — trading card + Tinder-style action buttons.
 */
import { displayNameCard, formatPositions, fmtContractEnd, fmtM, fmtSalaryYear, priceForTier } from './data';
import { cardBg } from './quiz-shared-utils';
import { withA, RENEW_TIER_HINT } from '../../lib/format';
import { FocusProgress, DecisionFlash } from './quiz-shared';

const TIER_OPTS = [
  ['more', 'Higher'],
  ['same', 'Same'],
  ['less', 'Lower'],
];

export function TierPicker({ T, amountLabel, amount, selected, onSelect, onConfirm, onBack, confirmLabel, dark = false }) {
  const hair = dark ? 'rgba(255,255,255,.15)' : T.hair2;
  const soft = dark ? 'rgba(255,255,255,.08)' : T.soft;
  const text = dark ? '#f4f6fa' : T.text;
  return (
    <div style={{ marginTop: 4, color: text }}>
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
              fontSize: 12, fontWeight: 800, border: `1px solid ${selected === k ? T.accent : hair}`,
              background: selected === k ? T.accent : soft,
              color: selected === k ? T.onAccent : text,
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
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, color: text, opacity: 0.45,
      }}>← Back</button>
    </div>
  );
}

export function TierBlock({ T, deck, dark = false }) {
  const { player, pending, tier, setTier, confirmDrop, cancelPending } = deck;
  if (pending === 'drop') {
    return (
      <TierPicker
        T={T}
        dark={dark}
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
  return null;
}

/** Renew tier step — current salary only, no projected amount. */
export function RenewTierPanel({ T, player, deck, dark = false }) {
  const { tier, setTier, confirmRenew, cancelPending } = deck;
  const hair = dark ? 'rgba(255,255,255,.15)' : T.hair2;
  const soft = dark ? 'rgba(255,255,255,.08)' : T.soft;
  const text = dark ? '#f4f6fa' : T.text;
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
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 8 }}>
        Current salary
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>
        {fmtSalaryYear(player.wage)}
      </div>
      <div style={{ fontSize: 11, opacity: 0.45, marginBottom: 14 }}>New deal · vs current</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {tierBtn('more', 'Higher')}
        {tierBtn('same', 'Same')}
        {tierBtn('less', 'Lower')}
      </div>
      <div style={{ fontSize: 11, opacity: 0.5, marginTop: 10, minHeight: 16, fontStyle: 'italic' }}>
        {RENEW_TIER_HINT[tier]}
      </div>
      <button
        type="button"
        onClick={confirmRenew}
        style={{
          marginTop: 12, width: '100%', padding: '10px 0', borderRadius: T.pill, border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
          background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`,
          color: T.onAccent,
        }}
      >Confirm renew →</button>
      <button type="button" onClick={cancelPending} style={{
        marginTop: 8, width: '100%', padding: '6px 0', border: 'none', background: 'transparent',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, color: text, opacity: 0.45,
      }}>← Back</button>
    </div>
  );
}

/** Renew UI that keeps the player card visible — sheet slides up from card bottom. */
export function RenewPopup({ T, player, deck, dark = false }) {
  if (deck.pending !== 'renew') return null;

  return (
    <div
      className="renew-popup renew-popup--sheet"
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 4,
        padding: '16px 18px 18px',
        background: dark ? 'linear-gradient(165deg, #1c2433, #0f141c)' : cardBg(T),
        borderTop: `1.5px solid ${T.accent}`,
        boxShadow: dark ? '0 -16px 40px rgba(0,0,0,.45)' : '0 -16px 40px rgba(12,22,40,.12)',
      }}
    >
      <RenewTierPanel T={T} player={player} deck={deck} dark={dark} />
    </div>
  );
}

/** Progress bar + decision flash overlay. */
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

/** Tinder-style ✕ / ♥ (or ↻ renew) action buttons below the card. */
export function DeckActionButtons({ T, deck }) {
  const { player, locked, exit, onKeep, onDropTap, onRenewTap, onRelease } = deck;
  const disabled = locked || !!exit;
  const left = player.expiring
    ? { onClick: onRelease, label: 'Release', color: T.gap, glyph: '✕' }
    : { onClick: onDropTap, label: 'Drop', color: T.gap, glyph: '✕' };
  const right = player.expiring
    ? { onClick: onRenewTap, label: 'Renew', color: T.accent, glyph: '↻' }
    : { onClick: onKeep, label: 'Keep', color: T.solid, glyph: '♥' };

  const btn = ({ onClick, label, color, glyph }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 56, height: 56, borderRadius: '50%', border: `2px solid ${color}`,
        background: withA(color, 0.08), color, fontSize: glyph === '↻' ? 24 : 22,
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
        fontFamily: 'inherit', lineHeight: 1,
      }}
    >{glyph}</button>
  );

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {btn(left)}
      {btn(right)}
    </div>
  );
}

function TradingMetaPills({ T, player }) {
  const tag = {
    fontSize: 11, padding: '4px 9px', borderRadius: 999, fontWeight: 700,
    background: 'rgba(255,255,255,.1)', color: '#f4f6fa',
    border: '1px solid rgba(255,255,255,.15)',
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
      <span style={tag}>{formatPositions(player)}</span>
      <span style={tag}>Age {player.age}</span>
      <span style={{ ...tag, fontVariantNumeric: 'tabular-nums' }}>{fmtSalaryYear(player.wage)}</span>
      <span style={{
        ...tag, fontVariantNumeric: 'tabular-nums',
        ...(player.expiring ? { background: withA(T.thin, 0.2), color: T.thin, border: `1px solid ${withA(T.thin, 0.4)}` } : {}),
      }}>{fmtContractEnd(player)}</span>
    </div>
  );
}

/** Collectible trading card — dark slab, club stripe, squad number medallion. */
export function TradingCardView({ T, deck, renewLayout = 'swap' }) {
  const { player, pending, exit } = deck;
  const exitClass = exit ? `quiz-focus-exit--${exit}` : '';
  const renewInCard = pending === 'renew' && renewLayout === 'swap';
  const inFlow = renewInCard || pending === 'drop';
  const renewActive = pending === 'renew';

  return (
    <div
      key={player.num}
      className={`quiz-focus-enter ${exitClass}`.trim()}
      style={{ width: 'min(280px, 88vw)' }}
    >
      <div style={{
        position: 'relative', borderRadius: 14, overflow: 'hidden',
        background: 'linear-gradient(165deg, #1c2433 0%, #0f141c 55%, #1a1028 100%)',
        border: `2px solid ${renewActive ? T.accent : withA(T.accent2, 0.5)}`,
        boxShadow: `0 28px 56px rgba(0,0,0,.45), 0 0 0 1px ${withA(T.accent, 0.15)}`,
        color: '#f4f6fa',
        minHeight: inFlow ? 340 : undefined,
      }}>
        {!inFlow && (
          <div style={{
            position: 'absolute', top: -20, right: -30, width: 140, height: 140,
            background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
            transform: 'rotate(25deg)', opacity: 0.85,
          }} />
        )}
        <div style={{ position: 'relative', padding: inFlow ? '18px 16px 16px' : '14px 16px 16px' }}>
          {renewInCard && (
            <>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', opacity: 0.5 }}>NEW DEAL</span>
              <div style={{
                marginTop: 6, marginBottom: 16, textAlign: 'center',
                fontFamily: T.display, fontSize: 18, fontWeight: 800,
              }}>{displayNameCard(player)}</div>
              <RenewTierPanel T={T} player={player} deck={deck} dark />
            </>
          )}
          {pending === 'drop' && (
            <>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', opacity: 0.5 }}>DROP PLAYER</span>
              <div style={{
                marginTop: 6, marginBottom: 16, textAlign: 'center',
                fontFamily: T.display, fontSize: 18, fontWeight: 800,
              }}>{displayNameCard(player)}</div>
              <TierBlock T={T} deck={deck} dark />
            </>
          )}
          {!inFlow && (
            <>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.14em', opacity: 0.5 }}>SQUAD CARD</span>
              <div style={{
                margin: '20px auto 14px', width: 120, height: 120, borderRadius: '50%',
                background: `radial-gradient(circle at 30% 25%, ${withA(T.accent, 0.5)}, #0a0e14)`,
                border: `3px solid ${T.accent2}`, display: 'grid', placeItems: 'center',
                fontFamily: T.display, fontSize: 48, fontWeight: 800, color: '#fff',
                fontVariantNumeric: 'tabular-nums',
              }}>{player.num}</div>
              <h2 style={{
                margin: 0, textAlign: 'center', fontFamily: T.display,
                fontSize: 22, fontWeight: 800, letterSpacing: '-.02em',
              }}>{displayNameCard(player)}</h2>
              <div style={{ margin: '12px 0 0' }}><TradingMetaPills T={T} player={player} /></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

