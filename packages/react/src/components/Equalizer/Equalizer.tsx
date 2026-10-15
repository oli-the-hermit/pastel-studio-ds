import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface EqualizerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Bounces while true; stands still otherwise. */
  playing?: boolean;
  /** Width and height in px. */
  size?: number;
}

/** Three "now playing" bars that bounce while something plays. Decorative: say "Playing" in words nearby. */
export const Equalizer = forwardRef<HTMLSpanElement, EqualizerProps>(({ playing = false, size = 14, className, style, ...rest }, ref) => (
  <span
    ref={ref}
    className={cx('ps-equalizer', playing && 'is-playing', className)}
    style={{ width: size, height: size, ...style }}
    aria-hidden="true"
    {...rest}
  >
    <span />
    <span />
    <span />
  </span>
));
Equalizer.displayName = 'Equalizer';
