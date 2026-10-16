import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface AppLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** A bar across the very top, edge to edge: a title bar, a File, Edit, View menu row. */
  appBar?: React.ReactNode;
  /** The navigation drawer (NavRail). */
  nav?: React.ReactNode;
  /** A bar above the page, beside the drawer: the page's title, search, account. */
  topBar?: React.ReactNode;
  /** The page. It scrolls on its own. */
  children: React.ReactNode;
  /** A side panel, e.g. a queue or details; shown while `asideOpen`. */
  aside?: React.ReactNode;
  asideOpen?: boolean;
  /** A bar across the bottom, e.g. the now-playing bar. */
  bottomBar?: React.ReactNode;
}

/**
 * The app's shell: floating tonal panels on the page background, apart by gaps, never borders.
 * An app bar across the top; drawer | page | side panel; a bottom bar across. Under 1024px wide
 * the side panel floats over the end of the page. The gaps grow with the window.
 */
export const AppLayout = forwardRef<HTMLDivElement, AppLayoutProps>(({ appBar, nav, topBar, children, aside, asideOpen = false, bottomBar, className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-app-layout', className)} {...rest}>
    {appBar && <div className="ps-app-layout-app-bar">{appBar}</div>}
    <div className="ps-app-layout-grid">
      {nav && <div className="ps-app-layout-nav">{nav}</div>}
      {topBar && <div className="ps-app-layout-top">{topBar}</div>}
      <main className="ps-app-layout-main">{children}</main>
      {aside && asideOpen && <div className="ps-app-layout-aside">{aside}</div>}
      {bottomBar && <div className="ps-app-layout-bottom">{bottomBar}</div>}
    </div>
  </div>
));
AppLayout.displayName = 'AppLayout';
