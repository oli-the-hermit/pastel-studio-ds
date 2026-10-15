import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface PlayerControlProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'aria-pressed'> {
  /** Screen-reader name, also the tooltip. */
  label: string;
  /** `primary` is the big play/pause in the phase color; `secondary` a filled round button; `ghost` a quiet toggle. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** `sm` for bars and mini players. A container can resize them through --ps-player-control-size-sm(-primary). */
  size?: 'md' | 'sm';
  /** A toggle that's on: sets aria-pressed, and a ghost takes the phase color. */
  pressed?: boolean;
}

/**
 * A round media transport button (play/pause, reset, skip, toggles): the base of every player
 * control. Defaults to `type="button"`; the tooltip defaults to the label. The phase color is
 * the accent; set --ps-player-control-phase (and its family) on its class to retint it.
 */
export const PlayerControl = forwardRef<HTMLButtonElement, PlayerControlProps>(
  ({ label, variant = 'secondary', size = 'md', pressed, className, title, type = 'button', children, ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cx(
        'ps-player-control',
        variant !== 'secondary' && `ps-player-control--${variant}`,
        size === 'sm' && 'ps-player-control--sm',
        pressed && 'is-on',
        className
      )}
      aria-label={label}
      aria-pressed={pressed}
      title={title ?? label}
      {...rest}
    >
      {children}
    </button>
  )
);
PlayerControl.displayName = 'PlayerControl';
