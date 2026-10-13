import React, { useRef, useState } from 'react';
import { IconMore } from '../../icons';
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
  onSelect: () => void;
}

export interface MenuDivider {
  key: string;
  divider: true;
}

export type MenuItem = MenuAction | MenuDivider;

export const isDivider = (item: MenuItem): item is MenuDivider => 'divider' in item;

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
}

/** The rows of a menu; shared by the overflow Menu and the right-click ContextMenu. */
export function MenuList({ items, onPicked }: MenuListProps) {
  return (
    <>
      {items.map((item) =>
        isDivider(item) ? (
          <div key={item.key} className="ps-menu-divider" role="separator" />
        ) : (
          <button
            key={item.key}
            type="button"
            role="menuitem"
            className={cx('ps-menu-item', item.danger && 'is-danger')}
            disabled={item.disabled}
            onClick={() => {
              onPicked();
              item.onSelect();
            }}
          >
            <span className="ps-menu-item-icon">{item.icon}</span>
            <span className="ps-menu-item-label">{item.label}</span>
            {item.hint && <kbd className="ps-menu-item-hint">{item.hint}</kbd>}
          </button>
        )
      )}
    </>
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
  /** Shown above the items, e.g. who's signed in. */
  header?: React.ReactNode;
  /** Extra class on the menu panel. */
  menuClassName?: string;
  labels?: LabelOverrides<'moreActions'>;
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
        className={cx('ps-menu', menuClassName)}
        role="menu"
      >
        {header}
        <div onKeyDown={handleMenuKeyDown}>
          <MenuList items={items} onPicked={() => setOpen(false)} />
        </div>
      </Popover>
    </>
  );
}
