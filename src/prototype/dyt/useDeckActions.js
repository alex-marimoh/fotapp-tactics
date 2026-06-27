/*
 * PROTOTYPE — shared keep/drop/renew state machine for quiz play variants.
 */
import React from 'react';
import { priceForTier, wageForTier } from './data';

/**
 * @param {{ ordered: object[], decisions: object, decide: Function, idx: number, setIdx: Function }} props
 */
export function useDeckActions({ ordered, decisions, decide, idx, setIdx }) {
  const total = ordered.length;
  const player = ordered[idx];
  const d = decisions[player.num] || {};

  const [pending, setPending] = React.useState(null);
  const [tier, setTier] = React.useState('same');
  const [flash, setFlash] = React.useState(null);
  const [exit, setExit] = React.useState(null);
  const [fx, setFx] = React.useState(null);

  React.useEffect(() => {
    setPending(null);
    setTier('same');
    setFlash(null);
    setExit(null);
    setFx(null);
  }, [player.num]);

  const advance = React.useCallback(() => {
    setPending(null);
    setTier('same');
    setIdx((i) => Math.min(i + 1, total - 1));
    setTimeout(() => { setExit(null); setFlash(null); setFx(null); }, 50);
  }, [setIdx, total]);

  const finish = React.useCallback((verdict, patch, flashKey, exitKey, fxKey) => {
    if (exit) return;
    decide(player.num, { verdict, ...patch });
    setFlash(flashKey);
    setExit(exitKey);
    if (fxKey) setFx(fxKey);
    setTimeout(advance, fxKey === 'renew-pulse' ? 700 : 420);
  }, [player.num, decide, advance, exit]);

  const onKeep = () => finish('keep', {}, 'keep', 'keep');
  const onDropTap = () => {
    if (exit) return;
    setPending('drop');
    setTier(d.priceTier ?? 'same');
  };
  const onRenewTap = () => {
    if (exit) return;
    setPending('renew');
    setTier(d.wageTier ?? 'same');
    setFx('renew-arm');
  };
  const onRelease = () => finish('release', {}, 'release', 'sell');
  const confirmDrop = () => {
    finish('sell', { price: priceForTier(player, tier), priceTier: tier }, 'drop', 'sell');
  };
  const confirmRenew = () => {
    finish('renew', { wage: wageForTier(player, tier), wageTier: tier }, 'renew', 'keep', 'renew-pulse');
  };
  const cancelPending = () => {
    setPending(null);
    setFx(null);
  };

  const locked = !!exit;

  return {
    total, player, d, pending, tier, setTier, flash, exit, fx, locked,
    onKeep, onDropTap, onRenewTap, onRelease, confirmDrop, confirmRenew, cancelPending,
    idx, setIdx,
  };
}
