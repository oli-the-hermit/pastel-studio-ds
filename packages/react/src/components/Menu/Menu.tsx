import React, { useEffect, useRef, useState } from 'react';
import { IconCheck, IconChevronLeft, IconChevronRight, IconMore } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import type { Surface } from '../../lib/surface';
import { iconButtonClass, type IconButtonLook } from '../IconButton';
import { Popover } from '../Popover';

export interface MenuAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** Right-aligned hint, e.g. a keyboard shortcut. */
  hint?: string;
  /** A check row: on when true. Alone it toggles (a checkbox); with `radio`, one of a group (a radio). */
  checked?: boolean;
  /** Makes a check row one choice of a group, e.g. a speed inside a submenu. */
  radio?: boolean;
  /** Keeps the menu open after picking, e.g. for a toggle. */
  keepOpen?: boolean;
  onSelect: () => void;
}

/** A row that opens its own items in the same panel, with a Back row on top. */
export interface MenuSubmenu {
  key: string;
  label: string;
  icon?: React.ReactNode;
  /** Right-aligned, e.g. the current choice: "1×", "Auto". */
  hint?: string;
  disabled?: boolean;
  items: MenuItem[];
}

export interface MenuDivider {
  key: string;
  divider: true;
}

export type MenuItem = MenuAction | MenuSubmenu | MenuDivider;

export const isDivider = (item: MenuItem): item is MenuDivider => 'divider' in item;
export const isSubmenu = (item: MenuItem): item is MenuSubmenu => 'items' in item;

/** Drops leading, trailing and doubled dividers left by conditional items. */
export function tidyMenuItems(items: (MenuItem | false | null | undefined)[]): MenuItem[] {
  const out: MenuItem[] = [];
  for (const item of items) {
    if (!item) continue;
    if (isDivider(item) && (out.length === 0 || isDivider(out[out.length - 1]))) continue;
    out.push(item);
  }
  while (out.length && isDivider(out[out.length - 1])) out.pop();
  return out;
}

/** Arrow keys, Home and End move focus between a menu's items. */
export function handleMenuKeyDown(e: React.KeyboardEvent<HTMLElement>) {
  const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  e.preventDefault();
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('.ps-menu-item:not(:disabled)'));
  if (!items.length) return;
  const i = items.indexOf(e.target as HTMLButtonElement);
  const next =
    e.key === 'Home' ? 0
      : e.key === 'End' ? items.length - 1
        : e.key === 'ArrowDown' ? (i + 1) % items.length
          : (i - 1 + items.length) % items.length;
  items[next].focus();
}

export interface MenuListProps {
  items: MenuItem[];
  /** Called when an item is picked, before its own `onSelect`: close the menu here. */
  onPicked: () => void;
  labels?: LabelOverrides<'back'>;
}

/**
 * The rows of a menu; shared by the overflow Menu and the right-click ContextMenu. A submenu row
 * opens its items in place: → or Enter opens it, ← or its Back row goes back.
 */
export function MenuList({ items, onPicked, labels: ownLabels }: MenuListProps) {
  const labels = useLabels(ownLabels);
  const [path, setPath] = useState<MenuSubmenu[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const open = path[path.length - 1];
  const shown = open ? open.items : items;

  // After going into a submenu or back out, focus lands on its first row.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    listRef.current?.querySelector<HTMLButtonElement>('.ps-menu-item:not(:disabled)')?.focus();
  }, [path]);

  const go = (next: MenuSubmenu[]) => {
    moved.current = true;
    setPath(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && open) {
      e.preventDefault();
      go(path.slice(0, -1));
    }
  };

  return (
    <div ref={listRef} className="ps-menu-list" onKeyDown={onKeyDown}>
      {open && (
        <button type="button" role="menuitem" className="ps-menu-item ps-menu-item--back" aria-label={`${labels.back}: ${open.label}`} onClick={() => go(path.slice(0, -1))}>
          <span className="ps-menu-item-icon"><IconChevronLeft size={16} /></span>
          <span className="ps-menu-item-label">{open.label}</span>
        </button>
      )}
      {open && <div className="ps-menu-divider" role="separator" />}
      {shown.map((item) => {
        if (isDivider(item)) return <div key={item.key} className="ps-menu-divider" role="separator" />;
        if (isSubmenu(item)) {
          return (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              className="ps-menu-item"
              disabled={item.disabled}
              onClick={() => go([...path, item])}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  e.preventDefault();
                  go([...path, item]);
                }
              }}
            >
              <span className="ps-menu-item-icon">{item.icon}</span>
              <span className="ps-menu-item-label">{item.label}</span>
              {item.hint && <span className="ps-menu-item-hint">{item.hint}</span>}
              <span className="ps-menu-item-more" aria-hidden="true"><IconChevronRight size={16} /></span>
            </button>
          );
        }
        const check = item.checked !== undefined;
        const mark = item.checked ? <IconCheck size={16} strokeWidth={2.4} /> : null;
        return (
          <button
            key={item.key}
            type="button"
            role={check ? (item.radio ? 'menuitemradio' : 'menuitemcheckbox') : 'menuitem'}
            aria-checked={check ? item.checked : undefined}
            className={cx('ps-menu-item', item.danger && 'is-danger', item.checked && 'is-checked')}
            disabled={item.disabled}
            onClick={() => {
              if (!item.keepOpen) onPicked();
              item.onSelect();
            }}
          >
            <span className="ps-menu-item-icon">{item.icon ?? mark}</span>
            <span className="ps-menu-item-label">{item.label}</span>
            {item.hint && <kbd className="ps-menu-item-hint">{item.hint}</kbd>}
            {item.icon && check && <span className="ps-menu-item-check" aria-hidden="true">{mark}</span>}
          </button>
        );
      })}
    </div>
  );
}

export interface MenuProps {
  items: MenuItem[];
  /** The trigger's accessible name and tooltip. Defaults to "More actions". */
  ariaLabel?: string;
  /** Custom trigger content; defaults to a vertical "more" glyph. */
  trigger?: React.ReactNode;
  /** Classes for a custom trigger; the default icon trigger uses `triggerSize` and `triggerSurface`. */
  triggerClassName?: string;
  triggerSize?: IconButtonLook['size'];
  triggerSurface?: Surface;
  /** The edge of the trigger the menu lines up with. */
  align?: 'start' | 'end';
  /** Shown above the items, e.g. who's signed in. Its lines stay on one line each and end with "…" past the menu's width limit. */
  header?: React.ReactNode;
  /** Extra class on the menu panel. */
  menuClassName?: string;
  /** `overlay` when it opens from the dock over video: the panel takes the dock's dark, see-through color. */
  surface?: 'default' | 'overlay';
  labels?: LabelOverrides<'moreActions' | 'back'>;
}

/** Overflow menu: an icon button that opens a list of actions. */
export function Menu({
  items,
  ariaLabel,
  trigger,
  triggerClassName,
  triggerSize,
  triggerSurface,
  align = 'end',
  header,
  menuClassName,
  surface = 'default',
  labels: ownLabels,
}: MenuProps) {
  const labels = useLabels(ownLabels);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cx(triggerClassName ?? iconButtonClass({ size: triggerSize, surface: triggerSurface }), open && 'is-active')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel ?? labels.moreActions}
        title={ariaLabel ?? labels.moreActions}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {trigger || <IconMore size={18} />}
      </button>
      <Popover
        open={open}
        anchorRef={triggerRef}
        onClose={() => setOpen(false)}
        onEscape={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        align={align}
        matchWidth={false}
        className={cx('ps-menu', surface === 'overlay' && 'ps-menu--overlay', menuClassName)}
        role="menu"
      >
        {header && <div className="ps-menu-header">{header}</div>}
        <div onKeyDown={handleMenuKeyDown}>
          <MenuList items={items} onPicked={() => setOpen(false)} labels={ownLabels} />
        </div>
      </Popover>
    </>
  );
}
