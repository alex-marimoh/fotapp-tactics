import React from 'react';

/** Selectors for keyboard-focusable elements inside a container. */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * @param {ParentNode} root
 * @returns {HTMLElement[]}
 */
export function getFocusableElements(root) {
  if (!root) return [];
  return [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );
}

/**
 * Keep Tab / Shift+Tab inside a focus cycle.
 * @param {KeyboardEvent} event
 * @param {HTMLElement[]} focusables
 */
export function handleTrapTab(event, focusables) {
  if (event.key !== 'Tab' || focusables.length === 0) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;

  if (event.shiftKey) {
    if (active === first || !focusables.includes(/** @type {HTMLElement} */ (active))) {
      event.preventDefault();
      last.focus();
    }
    return;
  }

  if (active === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Focus the first focusable element in a panel, or the panel itself.
 * @param {HTMLElement | null} panel
 */
export function focusInitial(panel) {
  if (!panel) return;
  const focusables = getFocusableElements(panel);
  if (focusables.length > 0) {
    focusables[0].focus();
    return;
  }
  panel.focus();
}

/**
 * Restore focus to the element that was active before an overlay opened.
 * @param {import('react').RefObject<Element | null>} previouslyFocusedRef
 */
export function restoreFocus(previouslyFocusedRef) {
  const prev = previouslyFocusedRef.current;
  if (prev instanceof HTMLElement && typeof prev.focus === 'function') {
    prev.focus();
  }
}

/**
 * Trap focus, restore on close, and dismiss on Escape for modal dialogs.
 * @param {{ open: boolean, onClose: () => void, panelRef: import('react').RefObject<HTMLElement | null> }} opts
 */
export function useDialogA11y({ open, onClose, panelRef }) {
  const previouslyFocused = React.useRef(/** @type {Element | null} */ (null));

  React.useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;
    focusInitial(panelRef.current);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel || !panel.contains(document.activeElement)) return;
      handleTrapTab(event, getFocusableElements(panel));
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreFocus(previouslyFocused);
    };
  }, [open, onClose, panelRef]);
}

/**
 * Close popovers / dropdowns on Escape and optionally restore trigger focus.
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {import('react').RefObject<HTMLElement | null>} [triggerRef]
 */
export function useDismissOnEscape(open, onClose, triggerRef) {
  React.useEffect(() => {
    if (!open) return undefined;

    const trigger = triggerRef?.current ?? null;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [open, onClose, triggerRef]);
}
