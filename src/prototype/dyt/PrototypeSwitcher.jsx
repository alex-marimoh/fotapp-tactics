/*
 * PROTOTYPE — floating variant switcher for UI explorations.
 * Dev-only; hidden in production builds.
 */
import React from 'react';
import { DEFAULT_SKIN } from '../../default-skin';

const LABELS = {
  A: 'Side panel',
  B: 'Drop-down',
  C: 'Split spread',
};

/**
 * @param {{ param: string, variants: string[], current: string, onCycle: (next: string) => void, hint?: string }} props
 */
export function PrototypeSwitcher({ param, variants, current, onCycle, hint }) {
  const idx = variants.indexOf(current);
  const prev = variants[(idx - 1 + variants.length) % variants.length];
  const next = variants[(idx + 1) % variants.length];

  React.useEffect(() => {
    if (import.meta.env.PROD) return;
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onCycle(prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onCycle(next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next, onCycle]);

  if (import.meta.env.PROD) return null;

  const label = LABELS[current] ?? current;

  return (
    <div
      style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10000,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        pointerEvents: 'none',
      }}
    >
      {hint && (
        <div style={{
          fontSize: 11, fontWeight: 600, opacity: 0.65, maxWidth: 320, textAlign: 'center',
          padding: '4px 10px', borderRadius: 999, background: 'rgba(0,0,0,.55)', color: '#fff',
        }}>{hint}</div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', borderRadius: 999,
        background: '#111827', color: '#f9fafb', boxShadow: '0 8px 32px rgba(0,0,0,.45)',
        border: '1px solid rgba(255,255,255,.12)', fontFamily: 'system-ui, sans-serif',
        pointerEvents: 'auto',
      }}>
        <button
          type="button"
          onClick={() => onCycle(prev)}
          aria-label="Previous variant"
          style={arrowBtn}
        >←</button>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '0 10px', minWidth: 160, textAlign: 'center' }}>
          {current} — {label}
          <span style={{ display: 'block', fontSize: 10, fontWeight: 500, color: DEFAULT_SKIN.textMutedOnDark, marginTop: 1 }}>
            ?{param}={current}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onCycle(next)}
          aria-label="Next variant"
          style={arrowBtn}
        >→</button>
      </div>
    </div>
  );
}

const arrowBtn = {
  width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,.15)',
  background: 'rgba(255,255,255,.08)', color: '#fff', cursor: 'pointer', fontSize: 14,
  fontFamily: 'inherit', lineHeight: 1,
};
