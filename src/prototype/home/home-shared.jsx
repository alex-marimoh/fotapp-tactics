/** PROTOTYPE — shared UI bits for home variants */

import { KitShirt, Stars, Flag } from '../../shared';

export const TAG_COLOR = {
  INJURY: '#dc2626', TRANSFER: '#2563eb', MATCH: '#0891b2',
  BOARD: '#7c3aed', MEDIA: '#d97706', YOUTH: '#059669',
};

export function injectHomeStyles() {
  if (typeof document === 'undefined' || document.getElementById('proto-home-styles')) return;
  const s = document.createElement('style');
  s.id = 'proto-home-styles';
  s.textContent = `
    @keyframes protoSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes protoFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes protoPulse { 0%,100% { opacity: 1; } 50% { opacity: .55; } }
    .proto-sheet { animation: protoSheetUp .28s cubic-bezier(.2,.8,.2,1); }
    .proto-overlay { animation: protoFadeIn .2s ease; }
    .proto-need-pulse { animation: protoPulse 2s ease infinite; }
  `;
  document.head.appendChild(s);
}

export function PlayerChip({ player, size = 'md', selected, onClick, showPos }) {
  const dim = size === 'lg' ? 52 : size === 'sm' ? 34 : 42;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: selected ? '2px solid #0040ff' : '2px solid transparent',
        borderRadius: size === 'lg' ? 12 : 10,
        background: selected ? 'rgba(0,64,255,.08)' : 'rgba(255,255,255,.92)',
        boxShadow: selected ? '0 8px 24px rgba(0,64,255,.2)' : '0 2px 8px rgba(0,0,0,.12)',
        padding: size === 'lg' ? 10 : 6,
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        fontFamily: 'inherit', color: '#0a1124', minWidth: dim + 16,
        transition: 'transform .15s, box-shadow .15s',
        transform: selected ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      <KitShirt size={dim - 8} variant="solid" primary={selected ? '#0040ff' : '#0a1124'} secondary="#fff" />
      <span style={{ fontSize: size === 'lg' ? 12 : 10, fontWeight: 600, maxWidth: 88, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {player.name.split(' ').pop()}
      </span>
      {showPos && <span style={{ fontSize: 9, color: '#6c7384', fontWeight: 500 }}>{player.pos}</span>}
    </button>
  );
}

export function PlayerDetailSheet({ player, row, news, onClose }) {
  if (!player) return null;
  injectHomeStyles();
  return (
    <div className="proto-overlay" style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,17,36,.45)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div
        className="proto-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 72, left: '50%', transform: 'translateX(-50%)',
          width: 'min(480px, calc(100vw - 32px))', maxHeight: '70vh', overflow: 'auto',
          background: '#fff', borderRadius: '16px 16px 8px 8px',
          boxShadow: '0 -8px 40px rgba(0,0,0,.2)', padding: 24, fontFamily: '"Inter", system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 20 }}>
          <KitShirt size={48} variant="solid" primary="#0040ff" secondary="#fff" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{player.name}</div>
            <div style={{ fontSize: 12, color: '#6c7384', marginTop: 4 }}>#{player.num} · {player.pos} · {player.role}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
              <Flag code={player.nat} />
              <Stars value={player.rating} />
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: '#f0f2f5', width: 32, height: 32, borderRadius: 16, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        {row && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6c7384', marginBottom: 10 }}>WHO PLAYS HERE</div>
            <DepthStack row={row} highlightNum={player.num} />
          </div>
        )}

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#6c7384', marginBottom: 10 }}>IN THE NEWS</div>
          {news.map((n) => (
            <div key={n.head} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #e3e6eb' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: TAG_COLOR[n.tag] ?? '#6c7384' }}>{n.tag}</span>
              <div style={{ fontWeight: 600, marginTop: 6, lineHeight: 1.35, fontSize: 13 }}>{n.head}</div>
              <div style={{ fontSize: 12, color: '#6c7384', marginTop: 4, lineHeight: 1.5 }}>{n.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DepthStack({ row, highlightNum, compact }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 4 : 6 }}>
      <DepthRow label="1st" player={row.starter} active={row.starter.num === highlightNum} />
      {row.backups.map((b, i) => (
        <DepthRow key={b.num} label={`${i + 2}${i === 0 ? 'nd' : 'rd'}`} player={b} active={b.num === highlightNum} />
      ))}
      {row.gap && (
        <div style={{ padding: '10px 12px', border: '2px dashed #c2410c', borderRadius: 8, fontSize: 11, color: '#c2410c', textAlign: 'center' }}>
          No backup — gap in your squad
        </div>
      )}
    </div>
  );
}

function DepthRow({ label, player, active }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8,
      background: active ? '#dde4ff' : '#f6f7f9',
    }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: '#6c7384', width: 28 }}>{label}</span>
      <span style={{ flex: 1, fontWeight: active ? 700 : 500, fontSize: 13 }}>{player.name}</span>
      <Stars value={player.rating} size={8} />
    </div>
  );
}

export function NeedDot({ severity = 'high' }) {
  const color = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#6c7384';
  return (
    <span
      className={severity === 'high' ? 'proto-need-pulse' : undefined}
      style={{ width: 10, height: 10, borderRadius: 5, background: color, boxShadow: `0 0 0 3px ${color}33`, display: 'inline-block' }}
    />
  );
}
