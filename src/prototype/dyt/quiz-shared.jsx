export function FocusProgress({ T, idx, total }) {
  const pct = ((idx + 1) / total) * 100;
  return (
    <div className="quiz-focus-progress" aria-hidden>
      <div className="quiz-focus-progress-fill" style={{ width: `${pct}%`, background: T.accent }} />
    </div>
  );
}

export function DecisionFlash({ T, verdict }) {
  if (!verdict) return null;
  const labels = { keep: 'Keep', drop: 'Drop', release: 'Release', renew: 'Renew' };
  const colors = { keep: T.solid, drop: T.gap, release: T.gap, renew: T.accent };
  return (
    <div className="quiz-focus-flash" style={{ '--flash': colors[verdict] ?? T.text }}>
      {labels[verdict] ?? verdict}
    </div>
  );
}
