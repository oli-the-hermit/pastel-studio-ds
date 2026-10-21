import React, { forwardRef, useId, useRef } from 'react';
import { cx } from '../../lib/cx';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: TabItem[];
  /** The active tab's key. */
  value: string;
  onChange: (key: string) => void;
  /** The tab list's accessible name, e.g. "Settings". */
  ariaLabel: string;
  /** The active tab's content. */
  children: React.ReactNode;
}

/**
 * Tabs in a folder look: the active tab and the panel share a color and read as one piece, the tab's
 * bottom corners curving into the panel. One tab stop; the arrow keys move and open (wrapping
 * around), Home and End jump to the ends.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(({ tabs, value, onChange, ariaLabel, children, className, ...rest }, ref) => {
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const active = Math.max(0, tabs.findIndex((t) => t.key === value));
  const tabId = (i: number) => `${id}-tab-${i}`;
  const panelId = `${id}-panel`;

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = tabs.length - 1;
    const target =
      e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
      : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (target === null) return;
    e.preventDefault();
    buttons.current[target]?.focus();
    if (target !== i) onChange(tabs[target].key);
  };

  return (
    <div ref={ref} className={cx('ps-tabs', className)} {...rest}>
      <div className="ps-tabs-list" role="tablist" aria-label={ariaLabel}>
        {tabs.map((t, i) => {
          const selected = i === active;
          return (
            <button
              key={t.key}
              ref={(el) => { buttons.current[i] = el; }}
              type="button"
              role="tab"
              id={tabId(i)}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={cx('ps-tabs-tab', selected && 'is-active')}
              onClick={() => onChange(t.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
      <div
        className={cx('ps-tabs-panel', active === 0 && 'is-at-start')}
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(active)}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
});
Tabs.displayName = 'Tabs';
