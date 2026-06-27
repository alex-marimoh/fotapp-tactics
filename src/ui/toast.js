/*
 * Lightweight imperative toast queue. Data layer calls showToast; ToastHost renders.
 */

/** @typedef {{ id: number, message: string, type: 'error' | 'info' }} Toast */

/** @type {Set<(toast: Toast) => void>} */
const listeners = new Set();

/**
 * @param {string} message
 * @param {'error' | 'info'} [type]
 */
export function showToast(message, type = 'error') {
  const toast = { id: Date.now() + Math.random(), message, type };
  listeners.forEach((fn) => fn(toast));
}

/** @param {(toast: Toast) => void} fn */
export function subscribeToasts(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
