import React from 'react';

const BAR = {
  position: 'fixed',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 16px',
  background: '#1a1a1a',
  color: '#f5f5f5',
  borderRadius: 999,
  boxShadow: '0 8px 32px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.08)',
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: 12,
  userSelect: 'none',
};

const BTN = {
  border: 'none',
  background: 'rgba(255,255,255,.1)',
  color: '#fff',
  width: 32,
  height: 32,
  borderRadius: 16,
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  fontSize: 14,
  lineHeight: 1,
};

function isEditableFocused() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
}

/**
 * Floating bar to cycle UI prototype variants via URL search param.
 * @param {{ variants: string[], labels?: Record<string, string>, current: string, onChange: (v: string) => void }} props
 */
export function PrototypeSwitcher({ variants, labels = {}, current, onChange }) {
  const idx = Math.max(0, variants.indexOf(current));
  const label = labels[current] ?? current;

  const cycle = React.useCallback((dir) => {
    const next = variants[(idx + dir + variants.length) % variants.length];
    onChange(next);
  }, [variants, idx, onChange]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (isEditableFocused()) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); cycle(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); cycle(1); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cycle]);

  if (import.meta.env.PROD) return null;

  return (
    <div style={BAR} role="toolbar" aria-label="Prototype variant switcher">
      <span style={{ fontSize: 9, letterSpacing: '0.12em', opacity: 0.5, marginRight: 4 }}>PROTOTYPE</span>
      <button type="button" style={BTN} onClick={() => cycle(-1)} aria-label="Previous variant">←</button>
      <span style={{ minWidth: 180, textAlign: 'center', fontWeight: 600 }}>
        {current} — {label}
      </span>
      <button type="button" style={BTN} onClick={() => cycle(1)} aria-label="Next variant">→</button>
    </div>
  );
}
