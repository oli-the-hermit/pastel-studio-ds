import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { handleMenuKeyDown, MenuList, type MenuItem } from '../Menu';
import { Popover } from '../Popover';
import { Tooltip } from '../Tooltip';

export interface MenuBarMenu {
  key: string;
  /** The trigger's text, and its accessible name when `iconOnly`. */
  label: string;
  /** Shown before the label, e.g. the app's mark on the first menu. */
  icon?: React.ReactNode;
  /** Shows only the icon; the label stays as the name and tooltip. */
  iconOnly?: boolean;
  /** The app's own menu (the "File" place): its label is bolder. */
  brand?: boolean;
  items: MenuItem[];
  /** Shown above the items. */
  header?: React.ReactNode;
}

export interface MenuBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  menus: MenuBarMenu[];
  labels?: LabelOverrides<'menuBar' | 'back'>;
}

const FIRST_ITEM = '.ps-menu-item:not(:disabled)';

/**
 * A row of menus, like File, Edit and Help in a desktop app's title bar. One menu is open at a
 * time; once one is open, pointing at another trigger or pressing ← and → switches to it.
 */
export const MenuBar = forwardRef<HTMLDivElement, MenuBarProps>(({ menus, labels: ownLabels, className, ...rest }, ref) => {
  const labels = useLabels(ownLabels);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Opened from the keyboard: focus moves into the menu.
  const focusItems = useRef(false);

  const openIndex = menus.findIndex((m) => m.key === openKey);
  const openMenu = openIndex >= 0 ? menus[openIndex] : null;
  anchorRef.current = openIndex >= 0 ? triggerRefs.current[openIndex] : null;

  useEffect(() => {
    if (!openKey || !focusItems.current) return;
    focusItems.current = false;
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLButtonElement>(FIRST_ITEM)?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [openKey]);

  const open = (index: number, fromKeyboard: boolean) => {
    focusItems.current = fromKeyboard;
    setFocusIndex(index);
    setOpenKey(menus[index].key);
  };
  const close = () => setOpenKey(null);
  const focusTrigger = (index: number) => {
    setFocusIndex(index);
    triggerRefs.current[index]?.focus();
  };
  const step = (from: number, by: number) => (from + by + menus.length) % menus.length;

  const onTriggerKeyDown = (e: React.KeyboardEvent, index: number) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => (openKey ? open(step(index, 1), true) : focusTrigger(step(index, 1))),
      ArrowLeft: () => (openKey ? open(step(index, -1), true) : focusTrigger(step(index, -1))),
      Home: () => focusTrigger(0),
      End: () => focusTrigger(menus.length - 1),
      ArrowDown: () => open(index, true),
      Enter: () => open(index, true),
      ' ': () => open(index, true),
    };
    const action = keys[e.key];
    if (!action) return;
    e.preventDefault();
    action();
  };

  // ← and → inside an open menu go to the neighbouring menu, unless a submenu used them.
  const onPanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    handleMenuKeyDown(e);
    if (e.defaultPrevented || openIndex < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      open(step(openIndex, e.key === 'ArrowRight' ? 1 : -1), true);
    }
  };

  return (
    <div ref={ref} role="menubar" aria-label={labels.menuBar} className={cx('ps-menubar', className)} {...rest}>
      {menus.map((menu, i) => (
        <Tooltip key={menu.key} label={menu.label} disabled={!menu.iconOnly || openKey !== null}>
          <button
            ref={(el) => {
              triggerRefs.current[i] = el;
            }}
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={openKey === menu.key}
            aria-label={menu.iconOnly ? menu.label : undefined}
            tabIndex={i === focusIndex ? 0 : -1}
            className={cx(
              'ps-menubar-trigger',
              menu.brand && 'ps-menubar-trigger--brand',
              menu.iconOnly && 'ps-menubar-trigger--icon',
              openKey === menu.key && 'is-active',
            )}
            onClick={() => (openKey === menu.key ? close() : open(i, false))}
            onPointerEnter={() => {
              if (openKey && openKey !== menu.key) open(i, false);
            }}
            onFocus={() => setFocusIndex(i)}
            onKeyDown={(e) => onTriggerKeyDown(e, i)}
          >
            {menu.icon && <span className="ps-menubar-icon">{menu.icon}</span>}
            {!menu.iconOnly && <span className="ps-menubar-label">{menu.label}</span>}
          </button>
        </Tooltip>
      ))}
      {openMenu && (
        <Popover
          key={openMenu.key}
          open
          anchorRef={anchorRef}
          onClose={close}
          onEscape={() => {
            close();
            focusTrigger(openIndex);
          }}
          matchWidth={false}
          className="ps-menu ps-menubar-menu"
          role="menu"
          ariaLabel={openMenu.label}
        >
          {openMenu.header && <div className="ps-menu-header">{openMenu.header}</div>}
          <div ref={panelRef} onKeyDown={onPanelKeyDown}>
            <MenuList items={openMenu.items} onPicked={close} labels={ownLabels} />
          </div>
        </Popover>
      )}
    </div>
  );
});
MenuBar.displayName = 'MenuBar';
