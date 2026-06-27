import { useT, hcOf } from './theme';

export function CompChip({ label, c }) {
  const T = useT();
  const hc = hcOf(T);
  const col = c.state === 'over' || c.state === 'under' ? hc.gap : c.state === 'at' ? hc.thin : hc.solid;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: T.pill,
      background: T.soft, border: `1px solid ${col}` }}>
      <span style={{ fontSize: 11, opacity: 0.7 }}>{label}</span>
      <b style={{ color: col, fontSize: 13 }}>{c.n}/{c.lim.value}</b>
    </span>
  );
}
