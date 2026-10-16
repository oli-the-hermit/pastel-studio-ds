import React, { useEffect, useId, useRef, useState } from 'react';
import { IconClose } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cssDurationMs } from '../../lib/css';
import { cx } from '../../lib/cx';
import { useBlockingOverlay } from '../../lib/overlays';
import { IconButton } from '../IconButton';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  /** Called by the close button, and by Escape when `dismissible`. */
  onClose: () => void;
  /** A wider dialog, for content with two columns or a long form. */
  wide?: boolean;
  /**
   * When true, Escape also closes the modal. Form modals leave this off so typed
   * input is only discarded through the explicit close and Cancel buttons.
   * Clicking the backdrop never closes a modal.
   */
  dismissible?: boolean;
  children: React.ReactNode;
  /** Extra class on the dialog, e.g. to size a dialog built on it. */
  className?: string;
  labels?: LabelOverrides<'close'>;
}

const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** A dialog over the page: a title, a close button and whatever it asks or shows. */
export function Modal({ isOpen, title, onClose, wide = false, dismissible = false, children, className, labels: ownLabels }: ModalProps) {
  const labels = useLabels(ownLabels);
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Keep the last content on screen while the exit animation plays.
  const [mounted, setMounted] = useState(isOpen);
  useBlockingOverlay(isOpen || mounted);
  const lastRef = useRef({ title, children });
  if (isOpen) lastRef.current = { title, children };

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }
    // Stays mounted while the exit animation (--ps-dur-2 in modal.css) plays.
    const t = window.setTimeout(() => setMounted(false), cssDurationMs('--ps-dur-2'));
    return () => window.clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !dismissible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dismissible]);

  useEffect(() => {
    if (!isOpen) return;
    // Focus goes back to whatever opened the modal once it closes.
    const opener = document.activeElement as HTMLElement | null;

    // Focus the first field, or the dialog itself, unless a child already claimed focus (autoFocus).
    const timer = setTimeout(() => {
      const modal = modalRef.current;
      if (!modal || modal.contains(document.activeElement)) return;
      (modal.querySelector<HTMLElement>('input:not([type="hidden"]), textarea, select, .ps-select-trigger') ?? modal).focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      if (opener?.isConnected) opener.focus();
    };
  }, [isOpen]);

  // Tab stays inside the dialog: the page behind it is not reachable while it is open.
  const keepFocusInside = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!items.length) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === e.currentTarget)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!isOpen && !mounted) return null;
  const shown = isOpen ? { title, children } : lastRef.current;

  return (
    <div className={cx('ps-modal-backdrop', !isOpen && 'is-closing')} aria-hidden={!isOpen || undefined}>
      <div
        ref={modalRef}
        className={cx('ps-modal', wide && 'ps-modal--wide', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={keepFocusInside}
      >
        <div className="ps-modal-header">
          <h3 className="ps-modal-title" id={titleId}>{shown.title}</h3>
          <IconButton label={labels.close} onClick={onClose}>
            <IconClose size={18} strokeWidth={2.2} />
          </IconButton>
        </div>
        <div className="ps-modal-body">
          {shown.children}
        </div>
      </div>
    </div>
  );
}
