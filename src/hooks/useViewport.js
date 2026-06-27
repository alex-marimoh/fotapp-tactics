import React from 'react';

/** @type {Set<(width: number) => void>} */
const subscribers = new Set();
let listenerAttached = false;
let currentWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

function onWindowResize() {
  currentWidth = window.innerWidth;
  subscribers.forEach((fn) => fn(currentWidth));
}

/**
 * Subscribe to window width changes via a single shared resize listener.
 * @param {(width: number) => void} callback
 * @returns {() => void} unsubscribe
 */
function subscribeToWidth(callback) {
  subscribers.add(callback);
  if (typeof window !== 'undefined' && !listenerAttached) {
    window.addEventListener('resize', onWindowResize);
    listenerAttached = true;
  }
  callback(currentWidth);
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0 && listenerAttached && typeof window !== 'undefined') {
      window.removeEventListener('resize', onWindowResize);
      listenerAttached = false;
    }
  };
}

/** @param {number} width @param {number} wideBp @param {number} phoneBp */
function viewportFlags(width, wideBp, phoneBp) {
  return {
    wide: width >= wideBp,
    phone: width < phoneBp,
  };
}

/**
 * Returns both breakpoint flags from one shared resize subscription.
 * @param {number} [wideBp=1080]
 * @param {number} [phoneBp=720]
 * @returns {{ wide: boolean, phone: boolean }}
 */
export function useViewport(wideBp = 1080, phoneBp = 720) {
  const [viewport, setViewport] = React.useState(() =>
    viewportFlags(
      typeof window !== 'undefined' ? window.innerWidth : 0,
      wideBp,
      phoneBp,
    ),
  );
  React.useEffect(() => {
    return subscribeToWidth((width) => {
      setViewport(viewportFlags(width, wideBp, phoneBp));
    });
  }, [wideBp, phoneBp]);
  return viewport;
}

/** True on wide screens — drives the landscape-pitch layout. */
export function useWide(bp = 1080) {
  const [wide, setWide] = React.useState(() => typeof window !== 'undefined' && window.innerWidth >= bp);
  React.useEffect(() => {
    return subscribeToWidth((width) => setWide(width >= bp));
  }, [bp]);
  return wide;
}

/** True on phone-width screens — single-column, page-scrolling layout. */
export function usePhone(bp = 720) {
  const [phone, setPhone] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < bp);
  React.useEffect(() => {
    return subscribeToWidth((width) => setPhone(width < bp));
  }, [bp]);
  return phone;
}

/** @internal Exposed for unit tests only. */
export function resetViewportSubscriberForTests() {
  subscribers.clear();
  if (listenerAttached && typeof window !== 'undefined') {
    window.removeEventListener('resize', onWindowResize);
  }
  listenerAttached = false;
  currentWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
}
