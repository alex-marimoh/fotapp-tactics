import React from 'react';
import { TacticsBoard } from './board';
import { QuizFlow } from './prototype/dyt/QuizFlow';
import { getTeam, DEFAULT_TEAM_SLUG } from './data/teams';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const team = getTeam(params.get('team') || DEFAULT_TEAM_SLUG);
  if (params.get('quiz') === 'squad') return <QuizFlow team={team} />;
  return <TacticsBoard team={team} />;
}
