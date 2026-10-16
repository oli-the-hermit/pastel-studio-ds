import React, { forwardRef } from 'react';
import { IconSidebar } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';

export interface NavRailItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** A count on the icon, e.g. rewards ready; hidden at 0. */
  badge?: number;
  /** What the count means, for screen readers: "2 ready to claim". */
  badgeLabel?: string;
}

export interface NavRailProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Accessible name, e.g. "Main". */
  label: string;
  items: NavRailItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  /** `rail` icons with tooltips; `expanded` labels beside the icons. */
  variant?: 'rail' | 'expanded';
  /** The app's mark at the top; its name shows as an overline when expanded. */
  brand: { mark: React.ReactNode; name: string };
  /** Makes the mark the expand and collapse button (it turns into a side-panel icon when expanded). */
  onToggle?: () => void;
  /** Pinned to the bottom, e.g. the account. */
  footer?: React.ReactNode;
  /** Rendered after the drawer's content, e.g. a dialog opened from it. */
  children?: React.ReactNode;
  labels?: LabelOverrides<'expandMenu' | 'collapseMenu'>;
}

/**
 * The app's navigation drawer: a floating panel tinted with the accent's hue, the items centered
 * between the mark and the footer. The current item's pill is its own layer, named for a view
 * transition, so a page change can slide it from item to item.
 */
export const NavRail = forwardRef<HTMLElement, NavRailProps>(({
  label, items, activeKey, onSelect, variant = 'rail', brand, onToggle, footer, children, labels: ownLabels, className, ...rest
}, ref) => {
  const labels = useLabels(ownLabels);
  const expanded = variant === 'expanded';
  const toggleLabel = expanded ? labels.collapseMenu : labels.expandMenu;
  return (
    <nav ref={ref} className={cx('ps-nav-rail', expanded && 'ps-nav-rail--expanded', className)} aria-label={label} {...rest}>
      {/* Expanded: the name as an overline at the start, the mark at the end, like a card's head. */}
      <div className="ps-nav-rail-head">
        {expanded && <span className="ps-overline ps-nav-rail-brand-name" aria-hidden="true">{brand.name}</span>}
        {onToggle ? (
          <button type="button" className="ps-nav-rail-brand is-toggle" aria-label={toggleLabel} title={toggleLabel} aria-expanded={expanded} onClick={onToggle}>
            {expanded ? <IconSidebar size={16} /> : brand.mark}
          </button>
        ) : (
          <div className="ps-nav-rail-brand" title={brand.name}>{brand.mark}</div>
        )}
      </div>

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

      <div className="ps-nav-rail-footer">{footer}</div>
      {children}
    </nav>
  );
});
NavRail.displayName = 'NavRail';
