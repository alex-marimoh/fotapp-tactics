/*
 * Squad quiz deck — trading card with Tinder-style action buttons.
 */
import React from 'react';
import { useDeckActions } from './useDeckActions';
import { DeckChrome, TradingCardView, DeckActionButtons, useDeckKeyboard } from './quiz-deck-ui';
import { RenewPrototypeDeck, getRenewPrototypeVariant } from './renew-ui-prototype';

export function SwipeDeck({ T, model, decisions, decide, idx, setIdx }) {
  const ordered = model.ordered;
  const renewVariant = getRenewPrototypeVariant();
  if (renewVariant) {
    return (
      <RenewPrototypeDeck
        T={T}
        ordered={ordered}
        decisions={decisions}
        decide={decide}
        idx={idx}
        setIdx={setIdx}
        variant={renewVariant}
      />
    );
  }

  const deck = useDeckActions({ ordered, decisions, decide, idx, setIdx });
  useDeckKeyboard(deck, deck.player);

  const showActions = !deck.pending;

  return (
    <DeckChrome T={T} deck={deck}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '20px 20px 28px', gap: 24,
      }}>
        <TradingCardView T={T} deck={deck} />
        {showActions && <DeckActionButtons T={T} deck={deck} />}
      </div>
    </DeckChrome>
  );
}
