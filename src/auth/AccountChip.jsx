import React from 'react';
import {
  currentUser, signInWithEmail, signInWithGoogle, signOut, onAuthChange, usesSupabase,
} from '../data/store';

/**
 * Account chip + sign-in modal for the app ribbon.
 * @param {{ T: object }} props
 */
export function AccountChip({ T }) {
  const [user, setUser] = React.useState(() => currentUser());
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => onAuthChange(setUser), []);

  const label = user?.isAnonymous
    ? 'Guest'
    : (user?.displayName || user?.email || 'Signed in');

  const chipBtn = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: T.pill,
    border: `1px solid ${T.hair2}`, background: T.soft, color: T.text, fontWeight: 700, fontSize: 12,
    cursor: usesSupabase() ? 'pointer' : 'default', fontFamily: 'inherit', maxWidth: 180,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  };
  const field = {
    background: T.soft, border: `1px solid ${T.hair2}`, color: T.text, fontFamily: 'inherit',
    borderRadius: Math.max(0, T.radius - 4), padding: '10px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box',
  };
  const primaryBtn = {
    padding: '9px 16px', borderRadius: T.pill, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: 800, fontSize: 13, color: T.onAccent,
    background: T.flat ? T.accent : `linear-gradient(90deg,${T.accent},${T.accentDark})`,
  };
  const ghostBtn = {
    padding: '9px 14px', borderRadius: T.pill, border: `1px solid ${T.hair2}`, cursor: 'pointer',
    fontFamily: 'inherit', fontWeight: 700, fontSize: 12, color: T.text, background: T.soft,
  };

  const run = async (fn) => {
    setBusy(true);
    setStatus('');
    try {
      await fn();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (!usesSupabase()) {
    return <span style={chipBtn} title="Offline mode">{label}</span>;
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={chipBtn} title="Account">
        <span style={{ opacity: 0.55 }}>●</span>
        {label}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.35)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 101,
            background: T.panel, border: `1px solid ${T.hair2}`, borderRadius: T.radius, padding: 24,
            width: 'min(400px, calc(100vw - 32px))', boxShadow: '0 16px 48px rgba(0,0,0,.25)', fontFamily: T.font,
          }}>
            <h2 style={{ margin: '0 0 4px', fontFamily: T.display, fontSize: 22 }}>Account</h2>
            <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.6 }}>
              {user?.isAnonymous
                ? 'You are signed in anonymously. Upgrade to save across devices.'
                : `Signed in${user?.email ? ` as ${user.email}` : ''}.`}
            </p>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '.05em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 6 }}>
              Email magic link
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ ...field, marginBottom: 10 }}
            />
            <button
              type="button"
              disabled={busy || !email.trim()}
              onClick={() => run(async () => {
                await signInWithEmail(email.trim());
                setStatus(user?.isAnonymous
                  ? 'Check your email to confirm and link this account.'
                  : 'Magic link sent — check your email.');
              })}
              style={{ ...primaryBtn, width: '100%', marginBottom: 10, opacity: busy || !email.trim() ? 0.5 : 1 }}
            >
              Send magic link
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => run(signInWithGoogle)}
              style={{ ...ghostBtn, width: '100%', marginBottom: 16 }}
            >
              Continue with Google
            </button>
            {status && <p style={{ margin: '0 0 12px', fontSize: 12, color: T.accent }}>{status}</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setOpen(false)} style={ghostBtn}>Close</button>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(async () => {
                  await signOut();
                  setOpen(false);
                })}
                style={{ ...ghostBtn, color: T.gap }}
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
