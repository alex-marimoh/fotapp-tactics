import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseRoute, buildSearch, navigate, subscribeRoute } from './appRoute';

describe('parseRoute', () => {
  it('returns board for empty search', () => {
    expect(parseRoute('')).toEqual({
      screen: 'board', team: null, admin: null, quiz: null,
    });
  });

  it('returns board for team param', () => {
    expect(parseRoute('?team=arsenal')).toEqual({
      screen: 'board', team: 'arsenal', admin: null, quiz: null,
    });
  });

  it('returns admin when admin param is present', () => {
    expect(parseRoute('?admin=chelsea')).toEqual({
      screen: 'admin', admin: 'chelsea', team: null, quiz: null,
    });
  });

  it('returns quiz for squad quiz with team', () => {
    expect(parseRoute('?quiz=squad&team=liverpool')).toEqual({
      screen: 'quiz', quiz: 'squad', team: 'liverpool', admin: null,
    });
  });

  it('prefers admin over quiz when both are present', () => {
    expect(parseRoute('?admin=arsenal&quiz=squad&team=arsenal').screen).toBe('admin');
  });
});

describe('buildSearch', () => {
  it('builds board URLs', () => {
    expect(buildSearch({ team: 'arsenal' })).toBe('?team=arsenal');
    expect(buildSearch({})).toBe('');
  });

  it('builds admin URLs', () => {
    expect(buildSearch({ admin: 'chelsea' })).toBe('?admin=chelsea');
  });

  it('builds quiz URLs', () => {
    expect(buildSearch({ quiz: 'squad', team: 'liverpool' })).toBe('?quiz=squad&team=liverpool');
  });
});

describe('navigate', () => {
  /** @type {ReturnType<typeof vi.spyOn> | undefined} */
  let pushState;
  /** @type {ReturnType<typeof vi.spyOn> | undefined} */
  let replaceState;

  beforeEach(() => {
    vi.stubGlobal('window', {
      location: { pathname: '/', search: '' },
      history: { pushState: vi.fn(), replaceState: vi.fn() },
      addEventListener: vi.fn(),
    });
    pushState = vi.spyOn(window.history, 'pushState');
    replaceState = vi.spyOn(window.history, 'replaceState');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses pushState by default', () => {
    navigate({ team: 'arsenal' });
    expect(pushState).toHaveBeenCalledWith(null, '', '/?team=arsenal');
    expect(replaceState).not.toHaveBeenCalled();
  });

  it('uses replaceState when replace is true', () => {
    navigate({ admin: 'chelsea', replace: true });
    expect(replaceState).toHaveBeenCalledWith(null, '', '/?admin=chelsea');
    expect(pushState).not.toHaveBeenCalled();
  });

  it('notifies subscribers without assigning location.search', () => {
    const listener = vi.fn();
    const unsub = subscribeRoute(listener);
    listener.mockClear();

    navigate({ quiz: 'squad', team: 'liverpool' });

    expect(listener).toHaveBeenCalledWith({
      screen: 'quiz', quiz: 'squad', team: 'liverpool', admin: null,
    });
    unsub();
  });
});
