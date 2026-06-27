import React from 'react';
import { useT, hcOf } from './theme';

export function InfoLegend() {
  const T = useT();
  const hc = hcOf(T);
  const [open, setOpen] = React.useState(false);
  const items = [
    ['Solid', hc.solid, 'Natural starter with a natural backup.'],
    ['Thin', hc.thin, 'Out-of-position starter, or no natural backup.'],
    ['Gap', hc.gap, 'No one available to start here.'],
    ['Out of position', T.oop, 'A player filling a non-natural role.'],
  ];
  return (
    <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 10 }}>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
          <div style={{ position: 'absolute', right: 0, bottom: 'calc(100% + 8px)', zIndex: 1, width: 248,
            background: T.surface, color: T.text, border: `1px solid ${T.hair2}`, borderRadius: T.radius,
            padding: '12px 14px', boxShadow: '0 12px 32px rgba(0,0,0,.3)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, fontFamily: T.display }}>What the colors mean</div>
            {items.map(([label, col, desc]) => (
              <div key={label} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '5px 0' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: col, marginTop: 3, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: col }}>{label}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.35 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <button onClick={() => setOpen((o) => !o)} title="What do the colors mean?" aria-label="Legend"
        style={{ width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontFamily: 'Georgia, serif',
          background: T.surface, color: T.accent, border: `1px solid ${T.hair2}`,
          fontSize: 17, fontWeight: 700, fontStyle: 'italic', display: 'grid', placeItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,.18)' }}>i</button>
    </div>
  );
}
