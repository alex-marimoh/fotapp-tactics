/*
 * PROTOTYPE — 8 layout approaches, same skin as variant A.
 * Only structure/interaction differs — not colors or theme.
 */
import React from 'react';
import { SwipeDeck } from './SwipeDeck';
import { useDeckActions } from './useDeckActions';
import {
  DeckChrome, FocusCardStack, PlayerMeta, PlayerOnlyCard, TierBlock,
  VerticalZonesCard, sideBtnStyle, useDeckKeyboard, zoneStyle,
} from './quiz-deck-ui';
import { withA } from './quiz-shared';

function PlayShell({ T, rest, children }) {
  const deck = useDeckActions(rest);
  useDeckKeyboard(deck, deck.player);
  return <DeckChrome T={T} deck={deck}>{children(deck)}</DeckChrome>;
}

function dropLabel(player) { return player.expiring ? 'Release' : 'Drop'; }
function keepLabel(player) { return player.expiring ? 'Renew' : 'Keep'; }

// A — vertical zones on card (production)
function PlayA(props) {
  return <SwipeDeck {...props} />;
}

// B — drag card left/right (same card, horizontal swipe)
function PlayB({ T, ...rest }) {
  return (
    <PlayShell T={T} rest={rest}>
      {(deck) => {
        const { player, pending, locked, onKeep, onDropTap, onRenewTap, onRelease } = deck;
        const [dx, setDx] = React.useState(0);
        const [dragging, setDragging] = React.useState(false);
        const start = React.useRef(null);
        React.useEffect(() => { setDx(0); setDragging(false); }, [player.num]);

        const keepOp = Math.min(1, Math.max(0, dx / 70));
        const dropOp = Math.min(1, Math.max(0, -dx / 70));

        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', touchAction: 'none' }}>
            <div className="quiz-swipe-stamp quiz-swipe-stamp--drop" style={{ opacity: dropOp, color: T.gap, borderColor: T.gap }}>
              {dropLabel(player).toUpperCase()}
            </div>
            <div className="quiz-swipe-stamp quiz-swipe-stamp--keep" style={{ opacity: keepOp, color: T.solid, borderColor: T.solid }}>
              {keepLabel(player).toUpperCase()}
            </div>
            <div
              onPointerDown={(e) => { if (!pending && !locked) { start.current = e.clientX; setDragging(true); } }}
              onPointerMove={(e) => { if (start.current != null) setDx(e.clientX - start.current); }}
              onPointerUp={() => {
                if (start.current == null || pending) return;
                if (dx > 80) (player.expiring ? onRenewTap : onKeep)();
                else if (dx < -80) (player.expiring ? onRelease : onDropTap)();
                start.current = null; setDragging(false); setDx(0);
              }}
            >
              <FocusCardStack
                T={T} player={player} deck={deck} exitMode="horizontal"
                outerStyle={{ transform: `translateX(${dx}px) rotate(${dx * 0.04}deg)`, transition: dragging ? 'none' : 'transform 0.35s ease' }}
              >
                <div style={{ padding: pending ? '20px 18px' : '28px 24px' }}>
                  <PlayerMeta T={T} player={player} />
                  <TierBlock T={T} deck={deck} />
                  {!pending && (
                    <p style={{ textAlign: 'center', fontSize: 11, opacity: 0.4, margin: '14px 0 0' }}>← drag or arrow keys →</p>
                  )}
                </div>
              </FocusCardStack>
            </div>
          </div>
        );
      }}
    </PlayShell>
  );
}

// C — flanking buttons beside the card
function PlayC({ T, ...rest }) {
  return (
    <PlayShell T={T} rest={rest}>
      {(deck) => {
        const { player, pending, locked, onKeep, onDropTap, onRenewTap, onRelease } = deck;
        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '20px 16px' }}>
            {!pending && (
              <button type="button" onClick={player.expiring ? onRelease : onDropTap} disabled={locked}
                style={{ ...sideBtnStyle(T, T.gap, locked), writingMode: 'vertical-rl' }}>
                ← {dropLabel(player)}
              </button>
            )}
            <PlayerOnlyCard T={T} player={player} deck={deck} />
            {!pending && (
              <button type="button" onClick={player.expiring ? onRenewTap : onKeep} disabled={locked}
                style={{ ...sideBtnStyle(T, player.expiring ? T.accent : T.solid, locked), writingMode: 'vertical-rl' }}>
                {keepLabel(player)} →
              </button>
            )}
          </div>
        );
      }}
    </PlayShell>
  );
}

// D — bottom action bar (card clean, buttons below)
function PlayD({ T, ...rest }) {
  return (
    <PlayShell T={T} rest={rest}>
      {(deck) => {
        const { player, pending, locked, onKeep, onDropTap, onRenewTap, onRelease } = deck;
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 20 }}>
            <PlayerOnlyCard T={T} player={player} deck={deck} />
            {!pending && (
              <div style={{ display: 'flex', gap: 10, width: 'min(400px, 100%)' }}>
                <button type="button" onClick={player.expiring ? onRelease : onDropTap} disabled={locked}
                  style={{ ...sideBtnStyle(T, T.gap, locked), flex: 1, textAlign: 'center' }}>
                  ↓ {dropLabel(player)}
                </button>
                <button type="button" onClick={player.expiring ? onRenewTap : onKeep} disabled={locked}
                  style={{ ...sideBtnStyle(T, player.expiring ? T.accent : T.solid, locked), flex: 1, textAlign: 'center' }}>
                  ↑ {keepLabel(player)}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </PlayShell>
  );
}

// E — split tap: subtle left/right zones behind card
function PlayE({ T, ...rest }) {
  return (
    <PlayShell T={T} rest={rest}>
      {(deck) => {
        const { player, pending, locked, onKeep, onDropTap, onRenewTap, onRelease } = deck;
        const [hover, setHover] = React.useState(null);
        return (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
            {!pending && !locked && (
              <>
                <button type="button" onMouseEnter={() => setHover('left')} onMouseLeave={() => setHover(null)}
                  onClick={player.expiring ? onRelease : onDropTap}
                  style={{ border: 'none', cursor: 'pointer', background: withA(T.gap, hover === 'left' ? 0.1 : 0.04), fontFamily: T.display, fontSize: 14, fontWeight: 800, color: withA(T.gap, hover === 'left' ? 0.9 : 0.35), letterSpacing: '.06em' }}>
                  {dropLabel(player).toUpperCase()}
                </button>
                <button type="button" onMouseEnter={() => setHover('right')} onMouseLeave={() => setHover(null)}
                  onClick={player.expiring ? onRenewTap : onKeep}
                  style={{ border: 'none', cursor: 'pointer', background: withA(T.solid, hover === 'right' ? 0.1 : 0.04), fontFamily: T.display, fontSize: 14, fontWeight: 800, color: withA(T.solid, hover === 'right' ? 0.9 : 0.35), letterSpacing: '.06em' }}>
                  {keepLabel(player).toUpperCase()}
                </button>
              </>
            )}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', padding: 20 }}>
              <div style={{ pointerEvents: deck.pending ? 'auto' : 'none', width: 'min(360px, 90vw)' }}>
                <PlayerOnlyCard T={T} player={player} deck={deck} />
              </div>
            </div>
          </div>
        );
      }}
    </PlayShell>
  );
}

// F — same as A + renew viewport ring on confirm
function PlayF({ T, ...rest }) {
  return (
    <PlayShell T={T} rest={rest}>
      {(deck) => (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <VerticalZonesCard T={T} deck={deck} />
        </div>
      )}
    </PlayShell>
  );
}

// G — horizontal zones on card (← drop | keep →)
function PlayG({ T, ...rest }) {
  return (
    <PlayShell T={T} rest={rest}>
      {(deck) => {
        const { player, pending, locked, onKeep, onDropTap, onRenewTap, onRelease } = deck;
        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <FocusCardStack T={T} player={player} deck={deck} exitMode="horizontal">
              {!pending && (
                <div style={{ display: 'flex' }}>
                  <button type="button" onClick={player.expiring ? onRelease : onDropTap}
                    style={{ ...zoneStyle(T, T.gap, false, locked), flex: 1 }}>← {dropLabel(player)}</button>
                  <button type="button" onClick={player.expiring ? onRenewTap : onKeep}
                    style={{ ...zoneStyle(T, player.expiring ? T.accent : T.solid, false, locked), flex: 1 }}>{keepLabel(player)} →</button>
                </div>
              )}
              <div style={{ padding: pending ? '20px 18px' : '28px 24px' }}>
                <PlayerMeta T={T} player={player} />
                <TierBlock T={T} deck={deck} />
              </div>
            </FocusCardStack>
          </div>
        );
      }}
    </PlayShell>
  );
}

// H — floating pill buttons at viewport edges
function PlayH({ T, ...rest }) {
  return (
    <PlayShell T={T} rest={rest}>
      {(deck) => {
        const { player, pending, locked, onKeep, onDropTap, onRenewTap, onRelease } = deck;
        return (
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            {!pending && !locked && (
              <>
                <button type="button" onClick={player.expiring ? onRelease : onDropTap}
                  style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', ...sideBtnStyle(T, T.gap, locked) }}>
                  ← {dropLabel(player)}
                </button>
                <button type="button" onClick={player.expiring ? onRenewTap : onKeep}
                  style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', ...sideBtnStyle(T, player.expiring ? T.accent : T.solid, locked) }}>
                  {keepLabel(player)} →
                </button>
              </>
            )}
            <PlayerOnlyCard T={T} player={player} deck={deck} />
          </div>
        );
      }}
    </PlayShell>
  );
}

export const QUIZ_PLAY_VARIANTS = [
  { id: 'A', name: 'Vertical zones', desc: '↑ Keep / ↓ Drop on card' },
  { id: 'B', name: 'Swipe card', desc: 'Drag left or right' },
  { id: 'C', name: 'Flanking', desc: 'Buttons beside card' },
  { id: 'D', name: 'Bottom bar', desc: 'Buttons below card' },
  { id: 'E', name: 'Split tap', desc: 'Tap left/right halves' },
  { id: 'F', name: 'Renew pulse', desc: 'Like A + ring on renew' },
  { id: 'G', name: 'Horizontal zones', desc: '← Drop | Keep → on card' },
  { id: 'H', name: 'Edge pills', desc: 'Floating buttons at sides' },
];

export function getQuizVariant(id) {
  return QUIZ_PLAY_VARIANTS.find((v) => v.id === id) ?? QUIZ_PLAY_VARIANTS[0];
}

export function renderPlayVariant(id, props) {
  switch (id) {
    case 'A': return <PlayA {...props} />;
    case 'B': return <PlayB {...props} />;
    case 'C': return <PlayC {...props} />;
    case 'D': return <PlayD {...props} />;
    case 'E': return <PlayE {...props} />;
    case 'F': return <PlayF {...props} />;
    case 'G': return <PlayG {...props} />;
    case 'H': return <PlayH {...props} />;
    default: return <PlayA {...props} />;
  }
}
