import { withA } from '../lib/format';
import { useT, hcOf } from './theme';

/**
 * Aggregate squad registration status for the top ribbon.
 * @param {{ valid: boolean, message: string }} status
 */
export function SquadStatusPill({ status }) {
  const T = useT();
  const hc = hcOf(T);
  const col = status.valid ? hc.solid : hc.gap;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: T.pill,
      background: withA(col, 0.12), border: `1px solid ${col}`, color: col,
      fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
      {status.message}
    </span>
  );
}
