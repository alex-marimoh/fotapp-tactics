import { REG_LABEL_SHORT } from '../squad-data';

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
 * @param {{ size?: number }} [opts]
 */
export function regBadgeStyle(T, reg, opts = {}) {
  const sz = opts.size ?? 14;
  const rs = regStylesOf(T)[reg];
  return {
    label: rs.label,
    style: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: sz,
      height: sz,
      padding: '0 3px',
      borderRadius: T.pill,
      background: rs.bg,
      border: `1px solid ${rs.border}`,
      color: rs.color,
      fontSize: sz <= 14 ? 8 : 9,
      fontWeight: 800,
      lineHeight: `${sz - 2}px`,
      textAlign: 'center',
      display: 'grid',
      placeItems: 'center',
      boxShadow: '0 1px 4px rgba(0,0,0,.25)',
    },
  };
}
