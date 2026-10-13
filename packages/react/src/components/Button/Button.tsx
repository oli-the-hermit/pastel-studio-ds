import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';
import { surfaceClass, type Surface } from '../../lib/surface';

export type ButtonVariant = 'secondary' | 'primary' | 'tonal' | 'danger';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `secondary` (default) is the neutral tonal button. */
  variant?: ButtonVariant;
  /** `xs` is for compact cards: taller than a chip, smaller than a title. */
  size?: 'lg' | 'md' | 'sm' | 'xs';
  /** Fills the width of its container. */
  block?: boolean;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Icon after the text, e.g. a chevron on a button that opens a menu. */
  trailingIcon?: React.ReactNode;
  /**
   * On phones, show only the leading icon. Give it an `aria-label` and a `title` that say the
   * whole action, since the text is hidden there.
   */
  collapsible?: boolean;
  /** The surface it sits on (default 1, a card); keeps its fill one step above. */
  surface?: Surface;
}

/** Pill-shaped action button. Defaults to `type="button"`, so it never submits a form by accident. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', icon, trailingIcon, collapsible = false, block = false, surface, className, type = 'button', children, ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cx(
        'ps-button',
        variant !== 'secondary' && `ps-button--${variant}`,
        size !== 'md' && `ps-button--${size}`,
        block && 'is-block',
        collapsible && 'is-collapsible',
        surfaceClass(surface),
        className
      )}
      {...rest}
    >
      {icon}
      {collapsible ? <span className="ps-button-label">{children}</span> : children}
      {trailingIcon && <span className="ps-button-trailing">{trailingIcon}</span>}
    </button>
  )
);
Button.displayName = 'Button';
