/*
 * Squad quiz deck — trading card with Tinder-style action buttons.
 */
import { KeyedDeckSession } from './deck-session';
import { RenewPrototypeDeck } from './renew-ui-prototype';
import { getRenewPrototypeVariant } from './renew-prototype-variant';

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

  return (
    <KeyedDeckSession
      T={T}
      ordered={ordered}
      decisions={decisions}
      decide={decide}
      idx={idx}
      setIdx={setIdx}
    />
  );
}
