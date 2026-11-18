import React, { forwardRef, useMemo } from 'react';
import { cx } from '../../lib/cx';
import { mergeRefs } from '../../lib/mergeRefs';
import { surfaceClass, type Surface } from '../../lib/surface';
import { ariaKeyShortcuts, useTooltip, type TooltipContent } from '../Tooltip';

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
   * On phones, show only the leading icon. Give it an `aria-label` and a `tooltip` that say the
   * whole action, since the text is hidden there.
   */
  collapsible?: boolean;
  /** A tooltip: a line about what it does, or a name, shortcut and line. Its shortcut is also set as `aria-keyshortcuts`. */
  tooltip?: string | TooltipContent;
  /** The surface it sits on (default 1, a card); keeps its fill one step above. */
  surface?: Surface;
}

export type ButtonLook = Pick<ButtonProps, 'variant' | 'size' | 'block' | 'collapsible' | 'surface'>;

/** The classes of a button; also used by triggers that render their own `<button>`, such as a Menu's. */
export const buttonClass = ({ variant = 'secondary', size = 'md', block = false, collapsible = false, surface }: ButtonLook = {}): string =>
  cx('ps-button', variant !== 'secondary' && `ps-button--${variant}`, size !== 'md' && `ps-button--${size}`, block && 'is-block', collapsible && 'is-collapsible', surfaceClass(surface));

/** Pill-shaped action button. Defaults to `type="button"`, so it never submits a form by accident. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'secondary', size = 'md', icon, trailingIcon, collapsible = false, block = false, surface, className, type = 'button', tooltip, 'aria-describedby': describedBy, children, ...rest },
    ref
  ) => {
    // A plain string is the line about it; the button's own text is its name.
    const content = useMemo<TooltipContent | null>(
      () => (!tooltip ? null : typeof tooltip === 'string' ? { label: children, description: tooltip } : tooltip),
      [tooltip, children]
    );
    const tip = useTooltip(content);
    const merged = useMemo(() => mergeRefs(ref, tip.ref), [ref, tip.ref]);
    return (
      <>
        <button
          ref={merged}
          type={type}
          className={cx(buttonClass({ variant, size, block, collapsible, surface }), className)}
          aria-describedby={cx(describedBy, tip.describedBy) || undefined}
          aria-keyshortcuts={ariaKeyShortcuts(content?.shortcut)}
          {...rest}
        >
          {icon}
          {collapsible ? <span className="ps-button-label">{children}</span> : children}
          {trailingIcon && <span className="ps-button-trailing">{trailingIcon}</span>}
        </button>
        {tip.element}
      </>
    );
  }
);
Button.displayName = 'Button';
