import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export type ActionRowProps = React.HTMLAttributes<HTMLDivElement>;

/** The buttons that close a dialog or an inline confirm panel: right-aligned, the main action last. */
export const ActionRow = forwardRef<HTMLDivElement, ActionRowProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-action-row', className)} {...rest} />
));
ActionRow.displayName = 'ActionRow';
