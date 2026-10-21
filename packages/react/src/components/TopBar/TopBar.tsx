import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface TopBarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The page's title, the page's heading (`h1`). */
  title: React.ReactNode;
  /** Beside the title: a live status, e.g. a timer or what is playing. */
  status?: React.ReactNode;
  /** The tools at the end, usually icon buttons. */
  tools?: React.ReactNode;
  /** A frameless window's buttons (WindowControls), after the tools. */
  windowControls?: React.ReactNode;
  /**
   * Attributes that let the bar move the window, spread on the bar, the title and the free space:
   * `{ 'data-tauri-drag-region': true }`. Tauri only honours the attribute on the pressed element.
   */
  dragRegionProps?: Record<string, unknown>;
}

/**
 * The bar above the page: its title, a status, the tools and, in a frameless window, the window's
 * buttons. With `dragRegionProps` it doubles as the title bar. It sits in AppShell's `topBar` slot.
 */
export const TopBar = forwardRef<HTMLElement, TopBarProps>(({ title, status, tools, windowControls, dragRegionProps, className, ...rest }, ref) => (
  <header ref={ref} className={cx('ps-top-bar', windowControls ? 'ps-top-bar--framed' : false, className)} {...dragRegionProps} {...rest}>
    <h1 className="ps-top-bar-title" {...dragRegionProps}>{title}</h1>
    {status}
    <div className="ps-top-bar-spacer" {...dragRegionProps} />
    {tools && <div className="ps-top-bar-tools">{tools}</div>}
    {windowControls && <div className="ps-top-bar-window">{windowControls}</div>}
  </header>
));
TopBar.displayName = 'TopBar';
