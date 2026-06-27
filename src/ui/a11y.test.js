import { describe, it, expect, vi } from 'vitest';
import { handleTrapTab } from './a11y';

describe('handleTrapTab', () => {
  it('wraps forward Tab from last focusable to first', () => {
    const first = { focus: vi.fn() };
    const last = { focus: vi.fn() };
    const focusables = [first, last];
    const event = {
      key: 'Tab',
      shiftKey: false,
      preventDefault: vi.fn(),
    };

    vi.stubGlobal('document', { activeElement: last });
    handleTrapTab(event, focusables);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(first.focus).toHaveBeenCalled();
  });

  it('wraps backward Tab from first focusable to last', () => {
    const first = { focus: vi.fn() };
    const last = { focus: vi.fn() };
    const focusables = [first, last];
    const event = {
      key: 'Tab',
      shiftKey: true,
      preventDefault: vi.fn(),
    };

    vi.stubGlobal('document', { activeElement: first });
    handleTrapTab(event, focusables);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(last.focus).toHaveBeenCalled();
  });

  it('ignores non-Tab keys', () => {
    const first = { focus: vi.fn() };
    const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };

    handleTrapTab(event, [first]);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(first.focus).not.toHaveBeenCalled();
  });
});
