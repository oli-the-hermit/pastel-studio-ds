import React, { forwardRef } from 'react';
import { IconClose, IconMaximize, IconMinimize, IconRestore } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';

export interface WindowButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'aria-pressed'> {
  /** Accessible name; also the tooltip unless `title` is given. */
  label: string;
  /** `md` for the title bar, `sm` for a small window such as a mini player. */
  size?: 'md' | 'sm';
  /** The close button: fills red on hover (`md`). */
  danger?: boolean;
  /** A window toggle that is on (pin, always on top). */
  pressed?: boolean;
}

/** A button of a frameless window's chrome: minimize, maximize, close, pin. */
export const WindowButton = forwardRef<HTMLButtonElement, WindowButtonProps>(
  ({ label, size = 'md', danger = false, pressed, className, title, type = 'button', children, ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cx('ps-window-button', size === 'sm' && 'ps-window-button--sm', danger && 'ps-window-button--danger', pressed && 'is-active', className)}
      aria-label={label}
      aria-pressed={pressed}
      title={title ?? label}
      {...rest}
    >
      {children}
    </button>
  )
);
WindowButton.displayName = 'WindowButton';

export interface WindowControlsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Whether the window is maximized: the middle button then restores it. */
  maximized?: boolean;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  labels?: LabelOverrides<'minimize' | 'maximize' | 'restore' | 'close'>;
}

/**
 * Minimize, maximize or restore, and close, for a frameless window. It only draws and reports: the
 * app makes the window calls (Tauri, Electron), so the library knows no shell.
 */
export const WindowControls = forwardRef<HTMLDivElement, WindowControlsProps>(
  ({ maximized = false, onMinimize, onToggleMaximize, onClose, labels: ownLabels, className, ...rest }, ref) => {
    const labels = useLabels(ownLabels);
    return (
      <div ref={ref} className={cx('ps-window-controls', className)} role="group" {...rest}>
        <WindowButton label={labels.minimize} onClick={onMinimize}>
          <IconMinimize size={16} />
        </WindowButton>
        <WindowButton label={maximized ? labels.restore : labels.maximize} onClick={onToggleMaximize}>
          {maximized ? <IconRestore size={15} /> : <IconMaximize size={14} />}
        </WindowButton>
        <WindowButton danger label={labels.close} onClick={onClose}>
          <IconClose size={17} />
        </WindowButton>
      </div>
    );
  }
);
WindowControls.displayName = 'WindowControls';
