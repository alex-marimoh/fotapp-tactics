import { useT } from './theme';

export function Pill({ onClick, children, tone, title }) {
  const T = useT();
  const tones = {
    accent: { bg: T.accent, color: T.onAccent, border: T.accent },
    danger: { bg: 'transparent', color: T.gap, border: T.gap },
    ghost: { bg: T.soft, color: T.text, border: T.hair2 },
  };
  const sx = tones[tone] || tones.ghost;
  return (
    <button onClick={onClick} title={title}
      style={{ padding: '5px 10px', borderRadius: T.pill, fontSize: 11, fontWeight: 800, cursor: 'pointer',
        background: sx.bg, color: sx.color, border: `1px solid ${sx.border}`, fontFamily: 'inherit' }}>
      {children}
    </button>
  );
}
