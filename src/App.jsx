import React from 'react';
import { TacticsBoard } from './board';
import { QuizFlow } from './prototype/dyt/QuizFlow';
import { DesignYourTeam } from './prototype/dyt/DesignYourTeam';

export default function App() {
  // PROTOTYPE — the "Squad quiz" (variant A wrapped as intro → swipe → result) is the
  // default view. The real Matchday board is at ?board=tactics; the old A–E variant
  // switcher is kept at ?deck=variants for reference.
  const params = new URLSearchParams(window.location.search);
  if (params.get('board') === 'tactics') return <TacticsBoard />;
  if (params.get('deck') === 'variants') return <DesignYourTeam />;
  return <QuizFlow />;
}
