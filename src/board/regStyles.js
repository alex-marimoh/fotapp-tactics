import { REG_LABEL_SHORT } from '../squad-data';
import { withA } from '../lib/format';

/**
 * Registration badge/pill colors from skin tokens.
 * @param {import('./theme').DEFAULT_SKIN} T
 * @returns {Record<'home'|'eu'|'noneu', { label: string, color: string, bg: string, border: string }>}
 */
export function regStylesOf(T) {
  return {
    home: { label: REG_LABEL_SHORT.home, color: T.solid, bg: `${T.solid}18`, border: T.solid },
    eu: { label: REG_LABEL_SHORT.eu, color: T.text, bg: T.soft, border: T.hair2 },
    noneu: { label: REG_LABEL_SHORT.noneu, color: T.accent2, bg: `${T.accent2}18`, border: T.accent2 },
  };
}

/**
 * Inline styles for a compact registration badge.
 * @param {import('./theme').DEFAULT_SKIN} T
 * @param {'home'|'eu'|'noneu'} reg
 * @param {{ size?: number, inline?: boolean }} [opts]
 */
export function regBadgeStyle(T, reg, opts = {}) {
  const sz = opts.size ?? 14;
  const rs = regStylesOf(T)[reg];
  const chip = {
    borderRadius: T.pill,
    background: withA(T.panel, 0.96),
    border: `1.5px solid ${rs.border}`,
    color: rs.color,
    fontWeight: 800,
    boxShadow: `0 1px 5px rgba(0,0,0,.35), 0 0 0 1px ${withA(T.bg, 0.2)}`,
  };
  if (opts.inline) {
    return {
      label: rs.label,
      style: { ...chip, fontSize: 8, padding: '1px 4px' },
    };
  }
  return {
    label: rs.label,
    style: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: sz,
      height: sz,
      padding: '0 3px',
      ...chip,
      fontSize: sz <= 14 ? 8 : 9,
      lineHeight: `${sz - 2}px`,
      textAlign: 'center',
      display: 'grid',
      placeItems: 'center',
    },
  };
}
