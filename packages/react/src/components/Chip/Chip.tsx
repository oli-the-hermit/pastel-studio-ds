import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `accent` uses the accent container colors; `overlay` sits on video, on the see-through dock color. */
  tone?: 'default' | 'accent' | 'overlay';
}

/** A small read-only label, e.g. "3 tasks remaining". */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(({ tone = 'default', className, ...rest }, ref) => (
  <span ref={ref} className={cx('ps-chip', tone !== 'default' && `ps-chip--${tone}`, className)} {...rest} />
));
Chip.displayName = 'Chip';
