import React from 'react';
import { subscribeToasts } from './toast';

const HOST = {
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 200,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  maxWidth: 'min(360px, calc(100vw - 32px))',
  pointerEvents: 'none',
};

const ITEM = {
  padding: '12px 16px',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.4,
  boxShadow: '0 8px 24px rgba(8,12,20,.18)',
  pointerEvents: 'auto',
};

export function ToastHost() {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    return subscribeToasts((toast) => {
      setToasts((cur) => [...cur, toast]);
      window.setTimeout(() => {
        setToasts((cur) => cur.filter((t) => t.id !== toast.id));
      }, 6000);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={HOST} aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          style={{
            ...ITEM,
            background: t.type === 'error' ? '#3d1218' : '#1a2430',
            color: t.type === 'error' ? '#ffb4bc' : '#e8eef4',
            border: `1px solid ${t.type === 'error' ? '#6b1f2a' : '#2a3848'}`,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
