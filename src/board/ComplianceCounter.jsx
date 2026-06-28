import { complianceDisplay } from '../squad-data';
import { withA } from '../lib/format';
import { useT, hcOf } from './theme';

/**
 * Explicit registration compliance counter with progress bar.
 * @param {{ label: string, c: { n: number, lim: { kind: string, value: number }, state: string } }} props
 */
export function ComplianceCounter({ label, c }) {
  const T = useT();
  const hc = hcOf(T);
  const { primary, secondary, fill } = complianceDisplay(c);
  const col = c.state === 'over' || c.state === 'under'
    ? hc.gap
    : c.state === 'at'
      ? hc.thin
      : hc.solid;

  return (
    <div style={{ minWidth: 140, maxWidth: 180, flex: '1 1 140px' }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase',
        color: T.textMuted, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.25 }}>{primary}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: col, marginTop: 1, lineHeight: 1.25 }}>{secondary}</div>
      <div style={{ marginTop: 5, height: 4, borderRadius: 2, background: withA(T.text, 0.08), overflow: 'hidden' }}
        role="progressbar"
        aria-valuenow={c.n}
        aria-valuemin={0}
        aria-valuemax={c.lim.value}
        aria-label={`${label}: ${primary}, ${secondary}`}>
        <div style={{ width: `${fill * 100}%`, height: '100%', background: col, borderRadius: 2,
          transition: 'width .2s ease' }} />
      </div>
    </div>
  );
}

/** @deprecated Use ComplianceCounter */
export { ComplianceCounter as CompChip };
