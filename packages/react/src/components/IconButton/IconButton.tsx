import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';
import { surfaceClass, type Surface } from '../../lib/surface';

export interface IconButtonLook {
  size?: 'md' | 'sm' | 'xs';
  tone?: 'default' | 'danger';
  /** Shown as on (accent container), e.g. the toggle of an open panel. */
  active?: boolean;
  /** The surface it sits on (default 1, a card); its hover is one step above. */
  surface?: Surface;
}

export interface IconButtonProps extends IconButtonLook, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Accessible name, also shown as the tooltip. Required: the button has no visible text. */
  label: string;
  /** For a toggle (like, mute, pin): announces on or off, and shows the active look when on. */
  pressed?: boolean;
  children: React.ReactNode;
}

/** The classes of an icon button; also used by triggers that render their own `<button>`. */
export const iconButtonClass = ({ size = 'md', tone = 'default', active = false, surface }: IconButtonLook = {}): string =>
  cx('ps-icon-button', size !== 'md' && `ps-icon-button--${size}`, tone === 'danger' && 'ps-icon-button--danger', active && 'is-active', surfaceClass(surface));

/** Round icon-only button. Defaults to `type="button"`. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, size, tone, active, pressed, surface, className, type = 'button', title, children, ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cx(iconButtonClass({ size, tone, active: active ?? pressed, surface }), className)}
      aria-label={label}
      aria-pressed={pressed}
      title={title ?? label}
      {...rest}
    >
      {children}
    </button>
  )
);
IconButton.displayName = 'IconButton';
