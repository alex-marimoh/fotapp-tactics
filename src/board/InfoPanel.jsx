import React from 'react';
import { PLACEHOLDER_NEWS } from '../squad-data';
import { RosterTable } from './RosterTable';
import { useT } from './theme';

export const InfoPanel = React.memo(function InfoPanel({
  phone,
  infoView,
  onInfoViewChange,
  roster,
  comp,
  starterNums,
  highlightedNum,
  onSelectPlayer,
}) {
  const T = useT();

  return (
    <div style={{ background: T.panel, padding: phone ? '14px 14px' : '16px 20px', overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {[['news', 'Team news'], ['roster', 'Roster']].map(([k, l]) => (
          <button key={k} onClick={() => onInfoViewChange(k)}
            style={{ padding: '6px 13px', borderRadius: T.pill, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: 800, background: infoView === k ? T.accent : T.soft,
              color: infoView === k ? T.onAccent : T.text }}>{l}</button>
        ))}
        {infoView === 'news'
          ? <span style={{ fontSize: 10, fontWeight: 700, color: T.accent2, marginLeft: 6,
              border: `1px solid ${T.accent2}`, borderRadius: T.pill, padding: '1px 7px' }}>PLACEHOLDER</span>
          : <span style={{ marginLeft: 'auto', fontSize: 11, color: T.textMuted }}>{roster.length} players</span>}
      </div>

      {infoView === 'news' ? (
        <>
          {PLACEHOLDER_NEWS.map((n, i) => (
            <div key={i} style={{ background: T.soft, border: `1px solid ${T.hair}`,
              borderRadius: T.radius, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', padding: '2px 7px',
                  borderRadius: T.pill, background: `${n.c}22`, color: n.c }}>{n.tag}</span>
                <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 'auto' }}>{n.when}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{n.head}</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>
            </div>
          ))}
          <div style={{ marginTop: 'auto', fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
            Placeholder panel — swap for news feed, rumors, fixtures, or finances later.
          </div>
        </>
      ) : (
        <RosterTable
          roster={roster}
          comp={comp}
          starterNums={starterNums}
          highlightedNum={highlightedNum}
          onSelectPlayer={onSelectPlayer}
        />
      )}
    </div>
  );
});
