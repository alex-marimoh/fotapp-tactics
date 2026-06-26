/*
 * PROTOTYPE — layout explorations for squad quiz (same skin as A).
 * ?prototype=quiz&variant=A..H
 */
import React from 'react';
import { DEFAULT_SKIN } from '../../board';
import { summaryOf } from './data';
import { QUIZ_PLAY_VARIANTS, getQuizVariant, renderPlayVariant } from './quiz-play-variants';

export function QuizPrototypeFlow() {
  const T = DEFAULT_SKIN;
  const [variantId, setVariantId] = React.useState(() =>
    (new URLSearchParams(window.location.search).get('variant') ?? 'A').toUpperCase(),
  );
  const variant = getQuizVariant(variantId);

  const [decisions, setDecisions] = React.useState({});
  const [idx, setIdx] = React.useState(0);
  const decide = React.useCallback((num, patch) => setDecisions((d) => ({ ...d, [num]: { ...d[num], ...patch } })), []);
  const summary = React.useMemo(() => summaryOf(decisions), [decisions]);

  const setVariant = (id) => {
    setVariantId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('prototype', 'quiz');
    url.searchParams.set('variant', id);
    url.searchParams.delete('quiz');
    window.history.replaceState({}, '', url);
  };

  React.useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('quiz') === 'squad' && url.searchParams.get('variant')) {
      url.searchParams.set('prototype', 'quiz');
      url.searchParams.delete('quiz');
      window.history.replaceState({}, '', url);
    }
  }, []);

  React.useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 8) setVariant(QUIZ_PLAY_VARIANTS[n - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const playProps = { T, decisions, decide, idx, setIdx };

  return (
    <div style={{ width: '100%', height: '100vh', background: T.bg, color: T.text, fontFamily: T.font, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px',
        background: T.flat ? T.ribbon[0] : `linear-gradient(90deg,${T.ribbon[0]},${T.ribbon[1]})`,
        borderBottom: `1px solid ${T.hair}`,
      }}>
        <button type="button" onClick={() => { window.location.search = ''; }}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, color: T.text, opacity: 0.6 }}>
          ← Board
        </button>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>
          Layout prototype · <span style={{ color: T.accent }}>{variantId}</span> {variant.name}
          <span style={{ opacity: 0.45, fontWeight: 500 }}> — {variant.desc}</span>
        </span>
        <span style={{ fontSize: 12, opacity: 0.45, fontVariantNumeric: 'tabular-nums' }}>{idx + 1}/{summary.total}</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <nav aria-label="Layout variant" style={{
          width: 48, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3, padding: 4,
          background: T.panel, borderRight: `1px solid ${T.hair}`,
        }}>
          {QUIZ_PLAY_VARIANTS.map((v) => (
            <button
              key={v.id}
              type="button"
              title={`${v.id}: ${v.name} — ${v.desc}`}
              onClick={() => setVariant(v.id)}
              style={{
                height: 36, border: 'none', borderRadius: T.pill, cursor: 'pointer',
                fontFamily: T.display, fontWeight: 800, fontSize: 14,
                background: v.id === variantId ? T.accent : T.soft,
                color: v.id === variantId ? T.onAccent : T.text,
                opacity: v.id === variantId ? 1 : 0.55,
              }}
            >
              {v.id}
            </button>
          ))}
        </nav>

        <div key={variantId} style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          {renderPlayVariant(variantId, playProps)}
        </div>
      </div>
    </div>
  );
}
