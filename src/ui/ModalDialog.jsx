import React from 'react';
import { useDialogA11y } from './a11y';

/**
 * Accessible modal shell: role=dialog, aria-modal, labelled, focus trap, Escape to close.
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   ariaLabel: string,
 *   titleId?: string,
 *   backdropStyle?: import('react').CSSProperties,
 *   panelStyle?: import('react').CSSProperties,
 *   children: import('react').ReactNode,
 * }} props
 */
export function ModalDialog({
  open,
  onClose,
  ariaLabel,
  titleId,
  backdropStyle,
  panelStyle,
  children,
}) {
  const panelRef = React.useRef(/** @type {HTMLDivElement | null} */ (null));
  useDialogA11y({ open, onClose, panelRef });

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={backdropStyle}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={titleId ? undefined : ariaLabel}
        aria-labelledby={titleId || undefined}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        style={panelStyle}
      >
        {children}
      </div>
    </div>
  );
}
