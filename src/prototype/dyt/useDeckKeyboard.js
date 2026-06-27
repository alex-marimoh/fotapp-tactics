import React from 'react';

export function useDeckKeyboard(deck, player) {
  const {
    pending, onKeep, onDropTap, onRenewTap, onRelease,
    confirmDrop, confirmRenew, setIdx, idx, total,
  } = deck;

  React.useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (pending === 'drop') {
        if (e.key === 'Enter') { e.preventDefault(); confirmDrop(); }
        return;
      }
      if (pending === 'renew') {
        if (e.key === 'Enter') { e.preventDefault(); confirmRenew(); }
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (player.expiring) onRenewTap();
        else onKeep();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (player.expiring) onRelease();
        else onDropTap();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.metaKey || e.ctrlKey) setIdx((i) => Math.max(i - 1, 0));
        else if (player.expiring) onRelease();
        else onDropTap();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.metaKey || e.ctrlKey) setIdx((i) => Math.min(i + 1, total - 1));
        else if (player.expiring) onRenewTap();
        else onKeep();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player.num, player.expiring, pending, onKeep, onDropTap, onRenewTap, onRelease, confirmDrop, confirmRenew, setIdx, total, idx]);
}
