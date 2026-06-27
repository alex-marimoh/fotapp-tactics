import React from 'react';
import { TacticsBoard } from './board';
import { QuizFlow } from './prototype/dyt/QuizFlow';
import { AdminPage } from './admin/AdminPage';
import { getTeam, DEFAULT_TEAM_SLUG } from './data/store';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const adminSlug = params.get('admin');
  if (adminSlug) return <AdminPage team={getTeam(adminSlug)} />;

  const team = getTeam(params.get('team') || DEFAULT_TEAM_SLUG);
  if (params.get('quiz') === 'squad') return <QuizFlow team={team} />;
  return <TacticsBoard team={team} />;
}
