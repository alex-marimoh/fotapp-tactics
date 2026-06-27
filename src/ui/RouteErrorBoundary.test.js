// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import {
  RouteErrorBoundary,
  RouteErrorFallback,
} from './RouteErrorBoundary';
import { logRouteRenderError } from './routeErrorLog';

function ThrowingChild() {
  throw new Error('render boom');
}

function GoodChild() {
  return React.createElement('p', null, 'all good');
}

describe('logRouteRenderError', () => {
  it('logs with RouteErrorBoundary prefix', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const err = new Error('test');
    logRouteRenderError(err, { componentStack: '\n    in ThrowingChild' });

    expect(spy).toHaveBeenCalledWith(
      '[RouteErrorBoundary]',
      err,
      '\n    in ThrowingChild',
    );
    spy.mockRestore();
  });
});

describe('RouteErrorFallback', () => {
  it('offers reload and back-to-board actions', () => {
    const onReload = vi.fn();
    const onBackToBoard = vi.fn();
    const container = document.createElement('div');
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(RouteErrorFallback, { onReload, onBackToBoard }),
      );
    });

    expect(container.textContent).toMatch(/Something went wrong/);
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(2);
    buttons[0].click();
    buttons[1].click();
    expect(onReload).toHaveBeenCalledOnce();
    expect(onBackToBoard).toHaveBeenCalledOnce();

    root.unmount();
  });
});

describe('RouteErrorBoundary', () => {
  /** @type {HTMLDivElement} */
  let container;
  /** @type {import('react-dom/client').Root} */
  let root;
  /** @type {import('vitest').MockInstance} */
  let consoleError;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  /** @param {import('react').ReactNode} node */
  function renderBoundary(node) {
    act(() => {
      root.render(node);
    });
  }

  afterEach(() => {
    root.unmount();
    container.remove();
    consoleError.mockRestore();
  });

  it('renders children when no error occurs', () => {
    renderBoundary(
      React.createElement(
        RouteErrorBoundary,
        null,
        React.createElement(GoodChild),
      ),
    );
    expect(container.textContent).toBe('all good');
  });

  it('shows styled fallback when a child throws during render', () => {
    renderBoundary(
      React.createElement(
        RouteErrorBoundary,
        null,
        React.createElement(ThrowingChild),
      ),
    );
    expect(container.textContent).toMatch(/Something went wrong/);
    expect(container.textContent).toMatch(/Reload page/);
    expect(container.textContent).toMatch(/Back to board/);
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('logs the error for debugging', () => {
    renderBoundary(
      React.createElement(
        RouteErrorBoundary,
        null,
        React.createElement(ThrowingChild),
      ),
    );
    const boundaryLog = consoleError.mock.calls.find(
      (call) => call[0] === '[RouteErrorBoundary]',
    );
    expect(boundaryLog).toBeTruthy();
    expect(boundaryLog?.[1]).toBeInstanceOf(Error);
  });
});
