import { describe, it, expect, vi } from 'vitest';
import { showToast, subscribeToasts } from './toast';

describe('showToast', () => {
  it('notifies subscribers with error toasts', () => {
    const fn = vi.fn();
    const unsub = subscribeToasts(fn);

    showToast('Could not save player.');
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Could not save player.',
      type: 'error',
    }));

    unsub();
  });
});
