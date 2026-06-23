import React from 'react';

/**
 * Sync a single URL search param with React state (replaceState, no router).
 * @param {string} key
 * @param {string} fallback
 * @returns {[string, (next: string) => void]}
 */
export function useSearchParam(key, fallback) {
  const read = React.useCallback(() => {
    const v = new URLSearchParams(window.location.search).get(key);
    return v ?? fallback;
  }, [key, fallback]);

  const [value, setValue] = React.useState(read);

  React.useEffect(() => {
    const onPop = () => setValue(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [read]);

  const set = React.useCallback((next) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, next);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState({}, '', url);
    setValue(next);
  }, [key]);

  return [value, set];
}
