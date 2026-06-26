/*
 * PROTOTYPE — "Design Your Team" host. Routed from App.jsx at ?proto=dyt.
 * Five variants (A–E) over one shared decision state, so flipping variants keeps
 * your keep/sell calls. Delete this folder + the App.jsx branch to remove.
 */
import React from 'react';
import { DEFAULT_SKIN } from '../../board';
import { summaryOf, fmtM } from './data';
import { SwipeDeck, PitchSweep, TriageList, BudgetLedger, TwoPileSorter } from './variants';

const VARIANTS = [
  ['A', 'Swipe deck', SwipeDeck],
  ['B', 'Pitch sweep', PitchSweep],
  ['C', 'Triage list', TriageList],
  ['D', 'Budget ledger', BudgetLedger],
  ['E', 'Two-pile sorter', TwoPileSorter],
];

function useSearchParam(key, def) {
  const [v, setV] = React.useState(() => new URLSearchParams(window.location.search).get(key) || def);
  const set = (nv) => {
    const u = new URL(window.location.href);
    u.searchParams.set(key, nv);
    window.history.replaceState({}, '', u);
    setV(nv);
  };
  return [v, set];
}

function SummaryChip({ T, label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: T.pill, background: T.soft, border: `1px solid ${T.hair2}` }}>
      <span style={{ fontSize: 10, opacity: 0.6 }}>{label}</span>
      <b style={{ fontSize: 12, color }}>{value}</b>
    </span>
  );
}

export function DesignYourTeam() {
  const T = DEFAULT_SKIN;
  const [variant, setVariant] = useSearchParam('v', 'A');
  const key = VARIANTS.some(([k]) => k === variant) ? variant : 'A';
  const [decisions, setDecisions] = React.useState({});
  const [idx, setIdx] = React.useState(0);
  const decide = React.useCallback((num, patch) => setDecisions((d) => ({ ...d, [num]: { ...d[num], ...patch } })), []);
  const summary = React.useMemo(() => summaryOf(decisions), [decisions]);
  const View = VARIANTS.find(([k]) => k === key)[2];

  return (
    <div style={{ width: '100%', height: '100vh', background: T.bg, color: T.text, fontFamily: T.font, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', flexShrink: 0,
        background: T.flat ? T.ribbon[0] : `linear-gradient(90deg,${T.ribbon[0]},${T.ribbon[1]})`, borderBottom: `1px solid ${T.hair}` }}>
        <span style={{ fontWeight: 850, fontSize: 19, letterSpacing: '-.02em', fontFamily: T.display }}>
          <span style={{ color: T.accent }}>fot</span><span style={{ color: T.accent2 }}>app</span>
        </span>
        <span style={{ fontSize: 13, opacity: 0.55, fontWeight: 600 }}>Design your team</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <SummaryChip T={T} label="War chest" value={fmtM(summary.warChest)} color={T.solid} />
          <SummaryChip T={T} label="Sell" value={String(summary.sellCount)} color={T.gap} />
          <SummaryChip T={T} label="Gaps" value={summary.gaps.length ? summary.gaps.join(' ') : '0'} color={summary.gaps.length ? T.gap : T.text} />
          <SummaryChip T={T} label="Decided" value={`${summary.decided}/${summary.total}`} color={T.accent} />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <View T={T} decisions={decisions} decide={decide} summary={summary} idx={idx} setIdx={setIdx} />
      </div>

      <div style={{ position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#15171c', color: '#fff',
        borderRadius: 999, boxShadow: '0 8px 32px rgba(0,0,0,.35)', fontFamily: T.font, fontSize: 12, userSelect: 'none' }}>
        <span style={{ fontSize: 9, letterSpacing: '.12em', opacity: 0.5, marginRight: 2 }}>VARIANT</span>
        {VARIANTS.map(([k]) => (
          <button key={k} onClick={() => setVariant(k)} style={{ border: 'none', cursor: 'pointer', borderRadius: 999, padding: '5px 11px',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700, background: k === key ? T.accent : 'rgba(255,255,255,.1)', color: '#fff' }}>{k}</button>
        ))}
        <span style={{ marginLeft: 6, opacity: 0.7, minWidth: 92 }}>{VARIANTS.find(([k]) => k === key)[1]}</span>
      </div>
    </div>
  );
}
