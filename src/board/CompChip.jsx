import { withA } from '../lib/format';
import { useT, hcOf } from './theme';

export function CompChip({ label, c }) {
  const T = useT();
  const hc = hcOf(T);
  const col = c.state === 'over' || c.state === 'under' ? hc.gap : c.state === 'at' ? hc.thin : hc.solid;
  const bg = c.state === 'over' || c.state === 'under'
    ? withA(hc.gap, 0.32)
    : c.state === 'at'
      ? withA(hc.thin, 0.32)
      : withA(T.bg, 0.88);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: T.pill,
      background: bg, border: `1px solid ${col}`, boxShadow: '0 2px 8px rgba(0,0,0,.18)' }}>
      <span style={{ fontSize: 11, opacity: 0.7 }}>{label}</span>
      <b style={{ color: col, fontSize: 13 }}>{c.n}/{c.lim.value}</b>
    </span>
  );
}
