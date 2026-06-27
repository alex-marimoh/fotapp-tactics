/** Shared inline style factories — spread overrides to tweak per screen. */

export const field = (T, overrides = {}) => ({
  background: T.soft,
  border: `1px solid ${T.hair2}`,
  color: T.text,
  fontFamily: 'inherit',
  borderRadius: Math.max(0, T.radius - 4),
  padding: '8px 10px',
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
  ...overrides,
});

export const primaryBtn = (T, overrides = {}) => ({
  padding: '9px 18px',
  borderRadius: T.pill,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontWeight: 800,
  fontSize: 13,
  color: T.onAccent,
  background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`,
  ...overrides,
});

export const ghostBtn = (T, overrides = {}) => ({
  padding: '9px 14px',
  borderRadius: T.pill,
  border: `1px solid ${T.hair2}`,
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontWeight: 700,
  fontSize: 12,
  color: T.text,
  background: T.soft,
  ...overrides,
});
