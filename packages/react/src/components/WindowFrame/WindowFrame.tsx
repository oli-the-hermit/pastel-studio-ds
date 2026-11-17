import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface WindowFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The frameless window's buttons (WindowControls), at the end of the bar. */
  windowControls?: React.ReactNode;
  /**
   * Attributes that let the bar move the window, spread on the bar and its free space:
   * `{ 'data-tauri-drag-region': true }`. Tauri only honours the attribute on the pressed element.
   */
  dragRegionProps?: Record<string, unknown>;
  /** The screen: it fills the window under the bar. */
  children: React.ReactNode;
}

/**
 * A frameless window's title bar for a screen with no TopBar (starting up, signing in): an empty
 * bar that moves the window, with the window's buttons where TopBar puts them, and the screen
 * under it. Once the app has a TopBar, that bar is the title bar instead.
 */
export const WindowFrame = forwardRef<HTMLDivElement, WindowFrameProps>(({ windowControls, dragRegionProps, className, children, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-window-frame', className)} {...rest}>
    <div className="ps-window-frame-bar" {...dragRegionProps}>
      <div className="ps-window-frame-space" {...dragRegionProps} />
      {windowControls && <div className="ps-window-frame-controls">{windowControls}</div>}
    </div>
    <div className="ps-window-frame-body">{children}</div>
  </div>
));
WindowFrame.displayName = 'WindowFrame';
