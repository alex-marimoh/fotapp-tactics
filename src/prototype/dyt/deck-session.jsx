/*
 * Deck play session — remounts on player change so deck action state resets cleanly.
 */
import { useDeckActions } from './useDeckActions';
import { DeckChrome, TradingCardView, DeckActionButtons } from './quiz-deck-ui';
import { useDeckKeyboard } from './useDeckKeyboard';

function DeckSessionInner({ T, ordered, decisions, decide, idx, setIdx, children }) {
  const deck = useDeckActions({ ordered, decisions, decide, idx, setIdx });
  useDeckKeyboard(deck, deck.player);

  if (children) {
    return (
      <DeckChrome T={T} deck={deck}>
        {children(deck)}
      </DeckChrome>
    );
  }

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

/**
 * @param {{ T: object, ordered: object[], decisions: object, decide: Function, idx: number, setIdx: Function, children?: (deck: object) => React.ReactNode }} props
 */
export function KeyedDeckSession({ T, ordered, decisions, decide, idx, setIdx, children }) {
  const playerNum = ordered[idx]?.num ?? idx;
  return (
    <DeckSessionInner
      key={playerNum}
      T={T}
      ordered={ordered}
      decisions={decisions}
      decide={decide}
      idx={idx}
      setIdx={setIdx}
    >
      {children}
    </DeckSessionInner>
  );
}
