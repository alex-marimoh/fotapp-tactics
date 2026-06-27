import React from 'react';
import { getTeams } from '../data/store';
import { withA } from '../lib/format';

/**
 * Club switcher dropdown — navigates via ?team= or ?admin= query param.
 * @param {{ T: object, team: object, param?: 'team' | 'admin' }} props
 */
export function TeamPicker({ T, team, param = 'team' }) {
  const [open, setOpen] = React.useState(false);
  const teams = getTeams();
  const dot = (c) => ({
    width: 10,
    height: 10,
    borderRadius: 999,
    background: c,
    flexShrink: 0,
    border: `1px solid ${T.hair2}`,
  });

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 13px',
          borderRadius: T.pill,
          border: `1px solid ${T.hair2}`,
          background: T.soft,
          color: T.text,
          fontWeight: 800,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <span style={dot(team.colors?.primary || T.accent)} />
        {team.name}
        <span style={{ fontSize: 10, opacity: 0.6 }}>▾</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 6,
              zIndex: 50,
              background: T.surface,
              border: `1px solid ${T.hair2}`,
              borderRadius: T.radius,
              padding: 4,
              minWidth: 220,
              maxHeight: 360,
              overflowY: 'auto',
              boxShadow: '0 12px 32px rgba(0,0,0,.35)',
            }}
          >
            {teams.map((t) => (
              <button
                key={t.slug}
                onClick={() => { window.location.search = `?${param}=${t.slug}`; }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  background: t.slug === team.slug ? withA(T.accent, 0.16) : 'transparent',
                  color: T.text,
                  padding: '9px 11px',
                  borderRadius: Math.max(0, T.radius - 5),
                  fontSize: 13,
                  fontWeight: t.slug === team.slug ? 800 : 500,
                  fontFamily: 'inherit',
                }}
              >
                <span style={dot(t.colors?.primary || T.accent)} />
                {t.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
