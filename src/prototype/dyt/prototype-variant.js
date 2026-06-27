/**
 * @param {string} param
 * @returns {string | null}
 */
export function readPrototypeVariant(param) {
  const v = new URLSearchParams(window.location.search).get(param);
  if (!v) return null;
  return v.toUpperCase();
}

/** @param {string} param @param {string} value */
export function setPrototypeVariant(param, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(param, value);
  window.history.replaceState(null, '', url.toString());
}
