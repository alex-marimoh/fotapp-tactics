import React from 'react';
import { useDismissOnEscape } from '../ui/a11y';
import { regStylesOf } from './regStyles';
import { useT, hcOf } from './theme';

/**
 * Compact inline legend for depth health colors and registration badges.
 * @param {{ phone?: boolean, inline?: boolean }} props
 */
export function InfoLegend({ phone = false, inline = false }) {
  const T = useT();
  const hc = hcOf(T);
  const regStyles = regStylesOf(T);
  const [open, setOpen] = React.useState(false);
  const btnRef = React.useRef(/** @type {HTMLButtonElement | null} */ (null));
  useDismissOnEscape(open && phone, () => setOpen(false), btnRef);

  const healthItems = [
    ['Solid', hc.solid],
    ['Thin', hc.thin],
    ['Gap', hc.gap],
  ];

  const legendContent = (
    <div style={{ display: 'flex', alignItems: 'center', gap: phone ? 8 : 10, flexWrap: 'wrap',
      fontSize: 10, fontWeight: 700, color: T.textMuted }}>
      {healthItems.map(([label, col]) => (
        <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0,
            border: `1px solid ${col}` }} aria-hidden="true" />
          <span style={{ color: T.text }}>{label}</span>
        </span>
      ))}
      <span style={{ opacity: 0.35 }} aria-hidden="true">|</span>
      {(['home', 'eu', 'noneu']).map((reg) => (
        <span key={reg} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 4px', borderRadius: T.pill,
            background: regStyles[reg].bg, border: `1px solid ${regStyles[reg].border}`,
            color: regStyles[reg].color }} aria-hidden="true">{regStyles[reg].label}</span>
          <span style={{ color: T.text }}>
            {reg === 'home' ? 'Homegrown' : reg === 'eu' ? 'EU' : 'Non-EU'}
          </span>
        </span>
      ))}
    </div>
  );

  if (inline) {
    if (phone) {
      return (
        <div style={{ position: 'relative' }}>
          <button ref={btnRef} type="button" onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            style={{ padding: '5px 10px', borderRadius: T.pill, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 11, fontWeight: 700, background: T.soft, color: T.text, border: `1px solid ${T.hair2}` }}>
            Legend {open ? '▴' : '▾'}
          </button>
          {open && (
            <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: T.radius,
              background: T.surface, border: `1px solid ${T.hair2}` }}>
              {legendContent}
            </div>
          )}
        </div>
      );
    }
    return legendContent;
  }

  return null;
}
