import React from 'react';

export const withA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const cardBg = (T) => (T.flat ? T.cardTo : `linear-gradient(160deg,${T.cardFrom},${T.cardTo})`);

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

export function decidedCount(decisions) {
  return Object.values(decisions).filter((d) => d?.verdict).length;
}
