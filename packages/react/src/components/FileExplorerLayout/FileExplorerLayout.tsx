import React, { forwardRef, useCallback, useLayoutEffect, useRef } from 'react';
import { useLabels } from '../../labels';
import { cx } from '../../lib/cx';
import { Toolbar } from '../Toolbar';

export interface FileExplorerLayoutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Back, forward, up and refresh: icon buttons, set in a toolbar named "Navigation". */
  navigation?: React.ReactNode;
  /** The AddressBar. Without it the search moves to the end of the row. */
  address?: React.ReactNode;
  /** The SearchField. */
  search?: React.ReactNode;
  /** The navigation pane, usually a TreeView. Without it the content takes its place. */
  tree?: React.ReactNode;
  /** The content's commands, set in a toolbar named "Commands". Its collapsible buttons fold to icons when the row runs out of room. */
  commands?: React.ReactNode;
  /** The content: a FileView, a MediaGrid… It fills the card and scrolls itself. */
  children: React.ReactNode;
  /** A StatusBar under the content. */
  status?: React.ReactNode;
  /** The details card's content, such as a DetailsPane; it should name itself as a landmark. */
  details?: React.ReactNode;
  detailsOpen?: boolean;
  /** Names the content card: the folder or the place on screen. */
  contentLabel: string;
}

/**
 * The file explorer's layout without its state: the navigation, address and search on the page;
 * below them the tree, the content (its commands, the view and the status) and the details, as
 * tonal cards. FileExplorer is built on it; an app with its own data builds its explorer the same way.
 */
export const FileExplorerLayout = forwardRef<HTMLDivElement, FileExplorerLayoutProps>(({
  navigation, address, search, tree, commands, children, status, details, detailsOpen = false, contentLabel, className, ...rest
}, ref) => {
  const labels = useLabels();
  const commandsRef = useRef<HTMLDivElement>(null);

  // The commands keep one line: when they don't fit, the labelled buttons fold to their icons,
  // and if that is not enough the dividers go and the buttons close up. Measured unfolded each
  // time, so they unfold as soon as there is room again.
  const fold = useCallback(() => {
    const bar = commandsRef.current;
    if (!bar) return;
    const overflows = () => bar.scrollWidth > bar.clientWidth + 1;
    delete bar.dataset.folded;
    if (!overflows()) return;
    bar.dataset.folded = 'icons';
    if (overflows()) bar.dataset.folded = 'tight';
  }, []);
  useLayoutEffect(fold);
  useLayoutEffect(() => {
    const bar = commandsRef.current;
    if (!bar || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fold);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [fold]);

  const showDetails = detailsOpen && details != null;
  return (
    <div
      ref={ref}
      className={cx('ps-file-explorer-layout', showDetails && 'is-details-open', !tree && 'is-treeless', className)}
      {...rest}
    >
      <div className="ps-file-explorer-layout-top">
        {navigation && <Toolbar label={labels.navigation} className="ps-file-explorer-layout-nav">{navigation}</Toolbar>}
        {address && <div className="ps-file-explorer-layout-address">{address}</div>}
        {search && <div className="ps-file-explorer-layout-search">{search}</div>}
      </div>

      <div className="ps-file-explorer-layout-body">
        {tree && <nav className="ps-file-explorer-layout-tree" aria-label={labels.navigationPane}>{tree}</nav>}

        <section className="ps-file-explorer-layout-main" aria-label={contentLabel}>
          {commands && <Toolbar ref={commandsRef} label={labels.commands} className="ps-file-explorer-layout-commands">{commands}</Toolbar>}
          <div className="ps-file-explorer-layout-view">{children}</div>
          {status && <div className="ps-file-explorer-layout-status">{status}</div>}
        </section>

        {showDetails && <div className="ps-file-explorer-layout-details">{details}</div>}
      </div>
    </div>
  );
});
FileExplorerLayout.displayName = 'FileExplorerLayout';
