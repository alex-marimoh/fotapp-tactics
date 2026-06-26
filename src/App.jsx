import React from 'react';
import { TacticsBoard } from './board';
import { QuizFlow } from './prototype/dyt/QuizFlow';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('quiz') === 'squad') return <QuizFlow />;
  return <TacticsBoard />;
}
