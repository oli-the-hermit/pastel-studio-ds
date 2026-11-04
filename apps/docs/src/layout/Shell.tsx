import React, { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { cx } from '@pastel-studio/react';
import { DesktopWindowControls, DRAG_REGION, isDesktop, useFullscreenKeys } from '@pastel-studio/desktop';
import { PAGES, SECTIONS } from '../registry';
import { ThemeControls } from './ThemeControls';

// In the desktop app the top bar is the window's title bar: its free space moves the window.
const desktop = isDesktop();
const drag = desktop ? DRAG_REGION : undefined;

export function Shell() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useFullscreenKeys();

  const index = PAGES.findIndex((p) => p.path === pathname);
  const prev = index > 0 ? PAGES[index - 1] : undefined;
  const next = index >= 0 && index < PAGES.length - 1 ? PAGES[index + 1] : undefined;

  return (
    <div className="docs-shell">
      <a className="docs-skip" href="#main">Skip to content</a>
      <header className={cx('docs-topbar', desktop && 'is-framed')} {...drag}>
        <Link to="/" className="docs-brand">
          <span className="docs-brand-mark" aria-hidden="true" />
          <span className="docs-brand-name">Pastel Studio</span>
          <span className="docs-brand-sub">Design System</span>
        </Link>
        <span className="docs-version">0.1</span>
        <div className="docs-topbar-spacer" {...drag} />
        <ThemeControls />
        {desktop && <DesktopWindowControls className="docs-window-controls" />}
      </header>
      <div className="docs-body">
        <nav className="docs-nav" aria-label="Documentation">
          {SECTIONS.map((section) => (
            <div key={section} className="docs-nav-section">
              <p className="ps-overline docs-nav-title">{section}</p>
              <ul>
                {PAGES.filter((p) => p.section === section).map((p) => (
                  <li key={p.path}>
                    <NavLink to={p.path} end className={({ isActive }) => cx('docs-nav-link', isActive && 'is-active')}>
                      {p.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <main id="main" className="docs-main" tabIndex={-1}>
          <Outlet />
          {(prev || next) && (
            <nav className="docs-pager" aria-label="Previous and next page">
              {prev ? (
                <Link to={prev.path} className="docs-pager-link">
                  <span className="docs-pager-dir">Previous</span>{prev.title}
                </Link>
              ) : <span />}
              {next && (
                <Link to={next.path} className="docs-pager-link is-next">
                  <span className="docs-pager-dir">Next</span>{next.title}
                </Link>
              )}
            </nav>
          )}
          <footer className="docs-footer">
            Pastel Studio Design System · MIT License · © 2026 San Milano
          </footer>
        </main>
      </div>
    </div>
  );
}
