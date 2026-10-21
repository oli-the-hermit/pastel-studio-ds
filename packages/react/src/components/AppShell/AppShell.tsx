import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface AppShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The navigation drawer (NavRail). It floats on the page background with the page margin around it. */
  nav: React.ReactNode;
  /** The bar above the page, beside the drawer (TopBar, or any bar of the app's own). */
  topBar: React.ReactNode;
  /** The page, usually a few `AppShellPage`s. It scrolls on its own, under the top bar. */
  children: React.ReactNode;
  /** Rendered inside the shell, above everything: toasts, alerts, celebrations, the tour. */
  overlays?: React.ReactNode;
  /** A stack in the bottom-right corner of the window, e.g. the UpdateCard (toasts sit at the top right). */
  corner?: React.ReactNode;
  /** A bar across the column under the page, e.g. the now-playing bar. */
  bottomBar?: React.ReactNode;
  /** A side panel beside the page, e.g. a queue; shown while `asideOpen`. */
  aside?: React.ReactNode;
  asideOpen?: boolean;
  /** `transparent` leaves the page area see-through, for a picture drawn behind the window's page. */
  surface?: 'solid' | 'transparent';
}

/**
 * The app's window: a navigation drawer floating at the left, and beside it a column with the top
 * bar over the page. Only the page scrolls. The margin and gutter (16px, 20 from 1024, 24 from
 * 1920) are set on the shell, so everything inside reads `--ps-grid-margin` and `--ps-grid-gutter`.
 * It measures itself, not the screen, so it also fits a window inside a page. Give it a height.
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(({
  nav, topBar, children, overlays, corner, bottomBar, aside, asideOpen = false, surface = 'solid', className, ...rest
}, ref) => (
  <div ref={ref} className={cx('ps-app-shell', className)} data-surface={surface} {...rest}>
    <div className="ps-app-shell-frame">
      <div className="ps-app-shell-nav">{nav}</div>
      <div className="ps-app-shell-column">
        <div className="ps-app-shell-top">{topBar}</div>
        <div className="ps-app-shell-body">
          <main className="ps-app-shell-main">{children}</main>
          {aside && asideOpen && <div className="ps-app-shell-aside">{aside}</div>}
        </div>
        {bottomBar && <div className="ps-app-shell-bottom">{bottomBar}</div>}
      </div>
    </div>
    {corner && <div className="ps-app-shell-corner">{corner}</div>}
    {overlays}
  </div>
));
AppShell.displayName = 'AppShell';

export interface AppShellPageProps extends React.HTMLAttributes<HTMLElement> {
  /** Only the active page shows. The others stay mounted, so they keep their state. */
  active: boolean;
  /** The page fills the shell's height and lays its parts out in a column (a calendar). */
  fill?: boolean;
}

/** One page of the app. A page change slides the new page in. */
export const AppShellPage = forwardRef<HTMLElement, AppShellPageProps>(({ active, fill = false, className, ...rest }, ref) => (
  <section ref={ref} className={cx('ps-app-shell-page', fill && 'ps-app-shell-page--fill', active && 'is-active', className)} {...rest} />
));
AppShellPage.displayName = 'AppShellPage';
