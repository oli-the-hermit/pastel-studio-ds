import React, { forwardRef } from 'react';
import { IconChevronDown, IconSidebar } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { useControllable } from '../../lib/useControllable';
import { Menu, type MenuItem } from '../Menu';

export interface NavRailItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** A count on the icon, e.g. rewards ready; hidden at 0. */
  badge?: number;
  /** What the count means, for screen readers: "2 ready to claim". */
  badgeLabel?: string;
}

/** A place in a section: a pinned folder, a collection, a drive. */
export interface NavRailPlace {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** The place on screen. */
  active?: boolean;
  /** A short fact at the end of the row, e.g. a count. */
  meta?: React.ReactNode;
  /** The tooltip, e.g. a folder's full path (default: the label). */
  title?: string;
}

/** A foldable list of places under the pages, e.g. Quick access or Collections. */
export interface NavRailSection {
  key: string;
  label: string;
  /** The section's button in the rail, which lists its places in a menu. */
  icon: React.ReactNode;
  places: NavRailPlace[];
  /** A small button at the end of the heading, e.g. New collection; the last entry of the rail's menu. */
  action?: { label: string; icon: React.ReactNode; onClick: () => void };
  /** Said when there are no places. */
  empty?: string;
}

export interface NavRailProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Accessible name, e.g. "Main". */
  label: string;
  items: NavRailItem[];
  activeKey: string;
  /** A page or a section's place was chosen, by its key. */
  onSelect: (key: string) => void;
  /** `rail` icons with tooltips; `expanded` labels beside the icons. */
  variant?: 'rail' | 'expanded';
  /** The app's mark at the top, followed by its name when expanded. Leave it out when the app
   *  carries its mark somewhere else, such as an app bar. */
  brand?: { mark: React.ReactNode; name: string };
  /** Makes the mark the expand and collapse button (without a mark, a side-panel button). */
  onToggle?: () => void;
  /** Lists of places under the pages. Expanded, each folds under its heading; as a rail, each is one button with a menu. */
  sections?: NavRailSection[];
  /** The open sections, by key (default: all of them). */
  openSections?: ReadonlySet<string>;
  onOpenSectionsChange?: (open: Set<string>) => void;
  /** Pinned to the bottom, e.g. the account. A function gets whether the drawer is expanded (an account badge shows its name then). */
  footer?: React.ReactNode | ((state: { expanded: boolean }) => React.ReactNode);
  /** Rendered after the drawer's content, e.g. a dialog opened from it. */
  children?: React.ReactNode;
  labels?: LabelOverrides<'expandMenu' | 'collapseMenu'>;
}

const ALL_OPEN = Symbol('all');

/**
 * The app's navigation drawer: a floating panel on the same surface as the page's cards. The pages
 * sit centered between the head and the footer; with sections, they sit at the top and the places
 * follow. The current item's pill is its own layer, named for a view transition, so a page change
 * can slide it from item to item.
 */
export const NavRail = forwardRef<HTMLElement, NavRailProps>(({
  label, items, activeKey, onSelect, variant = 'rail', brand, onToggle, sections, openSections, onOpenSectionsChange, footer, children,
  labels: ownLabels, className, ...rest
}, ref) => {
  const labels = useLabels(ownLabels);
  const expanded = variant === 'expanded';
  const toggleLabel = expanded ? labels.collapseMenu : labels.expandMenu;
  const [open, setOpen] = useControllable<ReadonlySet<string> | typeof ALL_OPEN>(openSections, ALL_OPEN, (v) => v !== ALL_OPEN && onOpenSectionsChange?.(new Set(v)));
  const isOpen = (key: string) => open === ALL_OPEN || open.has(key);
  const flip = (key: string) => {
    const now = new Set(open === ALL_OPEN ? (sections ?? []).map((s) => s.key) : open);
    if (now.has(key)) now.delete(key);
    else now.add(key);
    setOpen(now);
  };
  const hasSections = !!sections?.length;

  return (
    <nav ref={ref} className={cx('ps-nav-rail', expanded && 'ps-nav-rail--expanded', hasSections && 'ps-nav-rail--sections', className)} aria-label={label} {...rest}>
      {/* The mark, then the app's name when expanded, lined up like the items below. The mark is
          the expand and collapse button when there is one. */}
      {(brand || onToggle) && (
        <div className="ps-nav-rail-head">
          {brand && onToggle && (
            <button type="button" className="ps-nav-rail-brand is-toggle" aria-label={toggleLabel} title={toggleLabel} aria-expanded={expanded} onClick={onToggle}>
              {brand.mark}
            </button>
          )}
          {brand && !onToggle && <div className="ps-nav-rail-brand" title={brand.name}>{brand.mark}</div>}
          {!brand && onToggle && (
            <button type="button" className="ps-nav-rail-toggle" aria-label={toggleLabel} title={toggleLabel} aria-expanded={expanded} onClick={onToggle}>
              <IconSidebar size={16} />
            </button>
          )}
          {expanded && brand && <span className="ps-nav-rail-brand-name">{brand.name}</span>}
        </div>
      )}

      <div className="ps-nav-rail-items">
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              className={cx('ps-nav-rail-item', active && 'is-active')}
              data-key={item.key}
              title={expanded ? undefined : item.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect(item.key)}
            >
              <span className="ps-nav-rail-indicator">
                {active && <span className="ps-nav-rail-pill" aria-hidden="true" />}
                {item.icon}
                {!!item.badge && <span className="ps-nav-rail-badge" aria-label={item.badgeLabel}>{item.badge}</span>}
              </span>
              <span className="ps-nav-rail-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      {hasSections && (
        <div className="ps-nav-rail-sections">
          {sections!.map((section) =>
            expanded ? (
              <div key={section.key} className="ps-nav-rail-section" role="group" aria-label={section.label}>
                {/* The section's icon (the one the rail shows) and its name, the fold's chevron at the
                    end as on every collapsible part; an action sits just before the chevron. */}
                <div className={cx('ps-nav-rail-section-head', section.action && 'is-actionable')}>
                  <button type="button" className="ps-nav-rail-section-toggle" aria-expanded={isOpen(section.key)} onClick={() => flip(section.key)}>
                    <span className="ps-nav-rail-section-icon" aria-hidden="true">{section.icon}</span>
                    <span className="ps-nav-rail-section-label">{section.label}</span>
                    <IconChevronDown size={14} className="ps-nav-rail-section-chevron" aria-hidden="true" />
                  </button>
                  {section.action && (
                    <button type="button" className="ps-nav-rail-section-action" aria-label={section.action.label} title={section.action.label} onClick={section.action.onClick}>
                      {section.action.icon}
                    </button>
                  )}
                </div>
                {isOpen(section.key) && (
                  <div className="ps-nav-rail-places">
                    {section.places.map((place) => (
                      <button
                        key={place.key}
                        type="button"
                        className={cx('ps-nav-rail-place', place.active && 'is-active')}
                        data-key={place.key}
                        title={place.title ?? place.label}
                        aria-current={place.active ? 'page' : undefined}
                        onClick={() => onSelect(place.key)}
                      >
                        <span className="ps-nav-rail-place-icon">{place.icon}</span>
                        <span className="ps-nav-rail-place-label">{place.label}</span>
                        {place.meta != null && <span className="ps-nav-rail-place-meta">{place.meta}</span>}
                      </button>
                    ))}
                    {!section.places.length && section.empty && <p className="ps-nav-rail-places-empty">{section.empty}</p>}
                  </div>
                )}
              </div>
            ) : (
              <Menu
                key={section.key}
                ariaLabel={section.label}
                align="start"
                triggerClassName={cx('ps-nav-rail-item', section.places.some((p) => p.active) && 'is-current')}
                trigger={
                  <>
                    <span className="ps-nav-rail-indicator">{section.icon}</span>
                    <span className="ps-nav-rail-label">{section.label}</span>
                  </>
                }
                items={railMenu(section, onSelect)}
              />
            )
          )}
        </div>
      )}

      <div className="ps-nav-rail-footer">{typeof footer === 'function' ? footer({ expanded }) : footer}</div>
      {children}
    </nav>
  );
});
NavRail.displayName = 'NavRail';

/** A section as the rail's menu: its places, then its action. */
function railMenu(section: NavRailSection, onSelect: (key: string) => void): MenuItem[] {
  const places: MenuItem[] = section.places.map((p) => ({ key: p.key, label: p.label, icon: p.icon, checked: p.active, onSelect: () => onSelect(p.key) }));
  if (!places.length) places.push({ key: '__empty', label: section.empty ?? section.label, disabled: true, onSelect: () => {} });
  if (!section.action) return places;
  const { label, icon, onClick } = section.action;
  return [...places, { key: '__divider', divider: true }, { key: '__action', label, icon, onSelect: onClick }];
}
