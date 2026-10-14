import React, { forwardRef } from 'react';
import { IconCheck, IconClose, IconInfo, IconWarning } from '../../icons';
import { cx } from '../../lib/cx';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export interface ToastData {
  id: string;
  /** A few words: "List saved". */
  message: React.ReactNode;
  /** Sets the color and the icon. */
  tone: ToastTone;
  /** Playing its exit animation. */
  leaving?: boolean;
}

/** Every tone has its own icon, so color is never the only signal. */
const TONE_ICONS: Record<ToastTone, React.ReactNode> = {
  success: <IconCheck size={18} strokeWidth={2.4} />,
  info: <IconInfo size={18} />,
  warning: <IconWarning size={18} />,
  error: <IconClose size={18} strokeWidth={2.4} />,
};

export interface ToastProps extends Omit<ToastData, 'id'>, Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {}

/** One line of feedback: a tone icon and a message. */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(({ message, tone, leaving, className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-toast', `is-${tone}`, leaving && 'is-leaving', className)} role={tone === 'error' ? 'alert' : undefined} {...rest}>
    <span className="ps-toast-icon" aria-hidden="true">{TONE_ICONS[tone]}</span>
    <span className="ps-toast-message">{message}</span>
  </div>
));
Toast.displayName = 'Toast';

export interface ToastRegionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'children'> {
  /** The toasts to show, oldest first: the list from `useToasts()`. */
  toasts: ToastData[];
}

/**
 * Where toasts appear: the top right of the window. A polite live region; errors interrupt on
 * their own (role="alert"). Set --ps-toast-region-top on its class to clear an app bar.
 */
export const ToastRegion = forwardRef<HTMLDivElement, ToastRegionProps>(({ toasts, className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-toast-region', className)} role="status" aria-live="polite" {...rest}>
    {toasts.map((t) => (
      <Toast key={t.id} message={t.message} tone={t.tone} leaving={t.leaving} />
    ))}
  </div>
));
ToastRegion.displayName = 'ToastRegion';
