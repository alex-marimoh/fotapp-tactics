import React from 'react';
import { bootStore, usesSupabase } from './data/store';
import { ToastHost } from './ui/ToastHost';
import App from './App.jsx';

function BootScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#eef2f6', color: '#141a22', fontFamily: '"DM Sans", system-ui, sans-serif',
    }}>
      <p style={{ fontSize: 14, opacity: 0.6 }}>Loading…</p>
    </div>
  );
}

export function Root() {
  const [ready, setReady] = React.useState(!usesSupabase());
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!usesSupabase()) return;
    bootStore()
      .then(() => setReady(true))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to connect'));
  }, []);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        background: '#eef2f6', color: '#141a22', fontFamily: '"DM Sans", system-ui, sans-serif',
      }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>Could not connect to Supabase</p>
          <p style={{ fontSize: 13, opacity: 0.65 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) return <BootScreen />;
  return (
    <>
      <App />
      <ToastHost />
    </>
  );
}
