// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import {
  useWide,
  usePhone,
  useViewport,
  resetViewportSubscriberForTests,
} from './useViewport';

/** @param {number} width */
function setWindowWidth(width) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
}

function BothBreakpoints() {
  const wide = useWide(1080);
  const phone = usePhone(720);
  return React.createElement('div', {
    'data-wide': String(wide),
    'data-phone': String(phone),
  });
}

function ViewportHook() {
  const { wide, phone } = useViewport(1080, 720);
  return React.createElement('div', {
    'data-wide': String(wide),
    'data-phone': String(phone),
  });
}

describe('useViewport hooks', () => {
  /** @type {import('react-dom/client').Root | null} */
  let root = null;
  /** @type {HTMLDivElement} */
  let container;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    setWindowWidth(1200);
    resetViewportSubscriberForTests();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    container.remove();
    resetViewportSubscriberForTests();
  });

  it('registers one window.resize listener when both useWide and usePhone mount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');

    act(() => {
      root.render(React.createElement(BothBreakpoints));
    });

    const resizeAdds = addSpy.mock.calls.filter(([event]) => event === 'resize');
    expect(resizeAdds).toHaveLength(1);

    addSpy.mockRestore();
  });

  it('matches wide/phone flags at 1080 and 720 breakpoints', () => {
    act(() => {
      root.render(React.createElement(BothBreakpoints));
    });

    const el = container.firstElementChild;
    expect(el?.getAttribute('data-wide')).toBe('true');
    expect(el?.getAttribute('data-phone')).toBe('false');

    act(() => {
      setWindowWidth(800);
      window.dispatchEvent(new Event('resize'));
    });
    expect(el?.getAttribute('data-wide')).toBe('false');
    expect(el?.getAttribute('data-phone')).toBe('false');

    act(() => {
      setWindowWidth(600);
      window.dispatchEvent(new Event('resize'));
    });
    expect(el?.getAttribute('data-wide')).toBe('false');
    expect(el?.getAttribute('data-phone')).toBe('true');
  });

  it('useViewport returns the same flags as separate hooks', () => {
    act(() => {
      root.render(React.createElement(ViewportHook));
    });

    const el = container.firstElementChild;
    expect(el?.getAttribute('data-wide')).toBe('true');
    expect(el?.getAttribute('data-phone')).toBe('false');

    act(() => {
      setWindowWidth(600);
      window.dispatchEvent(new Event('resize'));
    });
    expect(el?.getAttribute('data-wide')).toBe('false');
    expect(el?.getAttribute('data-phone')).toBe('true');
  });

  it('removes the shared listener when all subscribers unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    act(() => {
      root.render(React.createElement(BothBreakpoints));
    });

    act(() => {
      root?.unmount();
    });

    const resizeRemoves = removeSpy.mock.calls.filter(([event]) => event === 'resize');
    expect(resizeRemoves).toHaveLength(1);

    removeSpy.mockRestore();
  });
});
