import React, { forwardRef, useMemo } from 'react';
import { cx } from '../../lib/cx';
import { mergeRefs } from '../../lib/mergeRefs';
import { surfaceClass, type Surface } from '../../lib/surface';
import { ariaKeyShortcuts, useTooltip } from '../Tooltip';

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
  /** The key that does the same, as menus print it ("Ctrl+C"): shown in the tooltip and set as `aria-keyshortcuts`. */
  shortcut?: string;
  /** One short line in the tooltip, for a button whose name doesn't explain it. */
  description?: React.ReactNode;
  /** `false` for no tooltip, e.g. when the name is written next to the button anyway. */
  tooltip?: boolean;
  children: React.ReactNode;
}

/** The classes of an icon button; also used by triggers that render their own `<button>`. */
export const iconButtonClass = ({ size = 'md', tone = 'default', active = false, surface }: IconButtonLook = {}): string =>
  cx('ps-icon-button', size !== 'md' && `ps-icon-button--${size}`, tone === 'danger' && 'ps-icon-button--danger', active && 'is-active', surfaceClass(surface));

/** Round icon-only button with a tooltip of its name. Defaults to `type="button"`. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { label, size, tone, active, pressed, surface, className, type = 'button', title, shortcut, description, tooltip = true, 'aria-describedby': describedBy, children, ...rest },
    ref
  ) => {
    const content = useMemo(
      () => (tooltip ? { label: title ?? label, shortcut, description } : null),
      [tooltip, title, label, shortcut, description]
    );
    const tip = useTooltip(content);
    const merged = useMemo(() => mergeRefs(ref, tip.ref), [ref, tip.ref]);
    return (
      <>
        <button
          ref={merged}
          type={type}
          className={cx(iconButtonClass({ size, tone, active: active ?? pressed, surface }), className)}
          aria-label={label}
          aria-pressed={pressed}
          aria-keyshortcuts={ariaKeyShortcuts(shortcut)}
          aria-describedby={cx(describedBy, tip.describedBy) || undefined}
          title={tooltip ? undefined : title}
          {...rest}
        >
          {children}
        </button>
        {tip.element}
      </>
    );
  }
);
IconButton.displayName = 'IconButton';
