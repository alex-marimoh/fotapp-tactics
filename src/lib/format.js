/** Current game season — contracts ending this year are expiring. */
export const SEASON = 2026;

/** Round to nearest 0.5, floor at 0.3 (market values, transfer fees). */
export const round5 = (n) => Math.max(0.3, Math.round(n * 2) / 2);

/** #rrggbb + alpha → rgba(), for skin-derived translucent fills. */
export const withA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

/** Hint copy for renew-tier picker steps in the squad quiz. */
export const RENEW_TIER_HINT = {
  more: 'A step above current',
  same: 'Hold the line',
  less: 'A step below current',
};
