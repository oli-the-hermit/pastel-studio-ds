import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `accent` uses the accent container colors. */
  tone?: 'default' | 'accent';
}

/** A small read-only label, e.g. "3 tasks remaining". */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(({ tone = 'default', className, ...rest }, ref) => (
  <span ref={ref} className={cx('ps-chip', tone === 'accent' && 'ps-chip--accent', className)} {...rest} />
));
Chip.displayName = 'Chip';
