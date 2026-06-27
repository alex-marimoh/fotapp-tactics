import { useT } from './theme';

export function PitchSvg({ horizontal }) {
  const T = useT();
  const vb = horizontal ? '0 0 105 68' : '0 0 68 105';
  return (
    <svg viewBox={vb} preserveAspectRatio="none" width="100%" height="100%"
      style={{ position: 'absolute', inset: 0, display: 'block' }}>
      <g fill="none" stroke={T.line} strokeWidth={1.2}>
        {horizontal ? (
          <>
            <rect x="2" y="2" width="101" height="64" />
            <line x1="52.5" y1="2" x2="52.5" y2="66" />
            <circle cx="52.5" cy="34" r="9" />
            <circle cx="52.5" cy="34" r="0.6" fill={T.line} />
            <rect x="2" y="14" width="16" height="40" />
            <rect x="2" y="24" width="6" height="20" />
            <rect x="87" y="14" width="16" height="40" />
            <rect x="97" y="24" width="6" height="20" />
          </>
        ) : (
          <>
            <rect x="2" y="2" width="64" height="101" />
            <line x1="2" y1="52.5" x2="66" y2="52.5" />
            <circle cx="34" cy="52.5" r="9" />
            <circle cx="34" cy="52.5" r="0.6" fill={T.line} />
            <rect x="14" y="2" width="40" height="16" />
            <rect x="24" y="2" width="20" height="6" />
            <rect x="14" y="87" width="40" height="16" />
            <rect x="24" y="97" width="20" height="6" />
          </>
        )}
      </g>
    </svg>
  );
}
