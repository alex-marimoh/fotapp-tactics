import React from 'react';

/**
 * @typedef {'board' | 'admin' | 'quiz'} AppScreen
 */

/**
 * @typedef {{
 *   screen: AppScreen,
 *   team: string | null,
 *   admin: string | null,
 *   quiz: string | null,
 * }} AppRoute
 */

/**
 * @typedef {{
 *   team?: string | null,
 *   admin?: string | null,
 *   quiz?: string | null,
 *   replace?: boolean,
 * }} NavigateTarget
 */

/** @type {Set<(route: AppRoute) => void>} */
const listeners = new Set();

let popstateBound = false;

/**
 * Derive route state from a query string.
 * @param {string} [search]
 * @returns {AppRoute}
 */
export function parseRoute(search = window.location.search) {
  const params = new URLSearchParams(search);
  const admin = params.get('admin');
  const quiz = params.get('quiz');
  const team = params.get('team');

  if (admin) {
    return { screen: 'admin', admin, team: null, quiz: null };
  }
  if (quiz === 'squad') {
    return { screen: 'quiz', quiz, team, admin: null };
  }
  return { screen: 'board', team, admin: null, quiz: null };
}

/**
 * Build a query string for the given navigation target.
 * @param {NavigateTarget} target
 * @returns {string}
 */
export function buildSearch(target) {
  const params = new URLSearchParams();

  if (target.admin) {
    params.set('admin', target.admin);
  } else if (target.quiz === 'squad') {
    params.set('quiz', 'squad');
    if (target.team) params.set('team', target.team);
  } else if (target.team) {
    params.set('team', target.team);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

/** @param {AppRoute} route */
function emitRoute(route) {
  for (const listener of listeners) listener(route);
}

function bindPopstate() {
  if (popstateBound) return;
  popstateBound = true;
  window.addEventListener('popstate', () => {
    emitRoute(parseRoute());
  });
}

/**
 * Update the URL and notify subscribers without reloading the document.
 * @param {NavigateTarget} target
 */
export function navigate(target) {
  bindPopstate();
  const search = buildSearch(target);
  const url = `${window.location.pathname}${search}`;
  const historyFn = target.replace ? 'replaceState' : 'pushState';
  window.history[historyFn](null, '', url);
  emitRoute(parseRoute(search));
}

/**
 * Subscribe to in-app route changes (including popstate).
 * @param {(route: AppRoute) => void} listener
 * @returns {() => void}
 */
export function subscribeRoute(listener) {
  bindPopstate();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * React hook for the current in-app route.
 * @returns {AppRoute}
 */
export function useAppRoute() {
  const [route, setRoute] = React.useState(() => parseRoute());

  React.useEffect(() => subscribeRoute(setRoute), []);

  return route;
}
