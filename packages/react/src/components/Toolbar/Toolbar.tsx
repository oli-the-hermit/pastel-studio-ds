import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface ToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Accessible name, e.g. "File commands". */
  label: string;
}

/**
 * A row of commands in groups, with dividers: a file browser's command bar, an editor's tools.
 * ← and → move between its buttons; it wraps rather than scrolls.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(({ label, className, children, onKeyDown, ...rest }, ref) => (
  <div
    ref={ref}
    role="toolbar"
    aria-label={label}
    className={cx('ps-toolbar', className)}
    onKeyDown={(e) => {
      onKeyDown?.(e);
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if ((e.target as HTMLElement).closest('input, [role="slider"]')) return;
      const list = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled)'));
      const i = list.indexOf(e.target as HTMLElement);
      if (i < 0) return;
      e.preventDefault();
      list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length].focus();
    }}
    {...rest}
  >
    {children}
  </div>
));
Toolbar.displayName = 'Toolbar';

/** Commands that belong together, packed closer than the groups around them. */
export const ToolbarGroup = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cx('ps-toolbar-group', className)}>{children}</div>
);

/** A thin vertical line between groups. */
export const ToolbarDivider = () => <span className="ps-toolbar-divider" role="separator" aria-orientation="vertical" />;

/** Pushes what follows to the end of the toolbar. */
export const ToolbarSpacer = () => <span className="ps-toolbar-spacer" />;
