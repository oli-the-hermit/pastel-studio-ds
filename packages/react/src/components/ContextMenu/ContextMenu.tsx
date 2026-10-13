import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IconCopy } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { handleMenuKeyDown, MenuList, tidyMenuItems, type MenuItem } from '../Menu';
import { Popover, type AnchorPoint } from '../Popover';

type MaybeItem = MenuItem | false | null | undefined;

/** Opens the menu for a right-click: `menu(event, items)`. Falsy items are skipped. */
export type OpenContextMenu = (e: React.MouseEvent | MouseEvent, items: MaybeItem[]) => void;

type ContextMenuLabels = LabelOverrides<'copy' | 'actions'>;

interface MenuState {
  point: AnchorPoint;
  items: MenuItem[];
  returnFocus: HTMLElement | null;
}

/** Inputs keep the native menu: it has cut, paste and spellcheck suggestions. */
function isEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.closest) return false;
  if (el.closest('textarea, [contenteditable=""], [contenteditable="true"]')) return true;
  const input = el.closest('input') as HTMLInputElement | null;
  return !!input && !['button', 'checkbox', 'radio', 'range', 'color', 'file', 'submit', 'reset'].includes(input.type);
}

/** Keyboard-opened menus (Shift+F10, Menu key) report 0,0: use the focused element. */
function pointFor(e: React.MouseEvent | MouseEvent): AnchorPoint {
  const target = e.target as HTMLElement;
  const doc = target?.ownerDocument || document;
  if (e.clientX === 0 && e.clientY === 0 && target?.getBoundingClientRect) {
    const r = target.getBoundingClientRect();
    return { x: r.left + 12, y: r.top + Math.min(r.height, 32), doc };
  }
  return { x: e.clientX, y: e.clientY, doc };
}

function selectedText(doc: Document): string {
  return doc.getSelection?.()?.toString().trim() || '';
}

/**
 * State and element for one right-click menu. Used by the provider for a whole app, and
 * directly by anything that lives in its own window or wants a menu for one area.
 */
export function useContextMenuState(ownLabels?: ContextMenuLabels) {
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const labels = useLabels(ownLabels);
  // A ref keeps openMenu stable for the listeners that hold it.
  const labelsRef = useRef(labels);
  labelsRef.current = labels;

  const openMenu = useCallback<OpenContextMenu>((e, rawItems) => {
    e.preventDefault();
    e.stopPropagation();
    const point = pointFor(e);
    const text = point.doc ? selectedText(point.doc) : '';
    // Selected text gets a Copy entry, since the native menu is gone.
    const items = tidyMenuItems([
      !!text && {
        key: 'copy',
        label: labelsRef.current.copy,
        icon: <IconCopy size={15} />,
        onSelect: () => void navigator.clipboard?.writeText(text).catch(() => {}),
      },
      !!text && { key: 'copy-div', divider: true as const },
      ...rawItems,
    ]);
    if (!items.length) return;
    const doc = point.doc || document;
    setMenu({ point, items, returnFocus: doc.activeElement as HTMLElement | null });
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Focus the first item so arrow keys work right away (focus-visible keeps the
  // ring off for mouse users).
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLButtonElement>('.ps-menu-item:not(:disabled)')?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, menu]);

  const element = menu ? (
    <Popover
      open={open}
      anchorPoint={menu.point}
      onClose={close}
      onEscape={() => {
        close();
        menu.returnFocus?.focus?.();
      }}
      matchWidth={false}
      className="ps-menu ps-context-menu"
      role="menu"
      ariaLabel={labels.actions}
    >
      <div ref={panelRef} onKeyDown={handleMenuKeyDown}>
        <MenuList items={menu.items} onPicked={close} />
      </div>
    </Popover>
  ) : null;

  return { openMenu, close, element };
}

const ContextMenuContext = createContext<OpenContextMenu | null>(null);

export interface ContextMenuProviderProps {
  children: React.ReactNode;
  /** Items for a right-click that no component handled (the page background). */
  getGlobalItems: () => MaybeItem[];
  labels?: ContextMenuLabels;
}

/**
 * Replaces the browser's right-click menu for a whole app. Components that want their own
 * menu call `useContextMenu()(event, items)` from `onContextMenu`; anything else gets the
 * global items. Text fields keep the browser's menu.
 */
export function ContextMenuProvider({ children, getGlobalItems, labels }: ContextMenuProviderProps) {
  const { openMenu, element } = useContextMenuState(labels);
  const globalRef = useRef(getGlobalItems);
  globalRef.current = getGlobalItems;

  useEffect(() => {
    // Bubble phase on the document runs after React's handlers, so a component
    // that opened its own menu has already called preventDefault().
    const onContextMenu = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (isEditable(e.target)) return;
      openMenu(e, globalRef.current());
    };
    document.addEventListener('contextmenu', onContextMenu);
    return () => document.removeEventListener('contextmenu', onContextMenu);
  }, [openMenu]);

  const value = useMemo(() => openMenu, [openMenu]);
  return (
    <ContextMenuContext.Provider value={value}>
      {children}
      {element}
    </ContextMenuContext.Provider>
  );
}

/**
 * Returns the function that opens the menu:
 *   const menu = useContextMenu();
 *   <div onContextMenu={(e) => menu(e, items)} />
 * Outside a provider it does nothing, so the browser behaves as usual.
 */
export function useContextMenu(): OpenContextMenu {
  return useContext(ContextMenuContext) || noopOpen;
}

const noopOpen: OpenContextMenu = () => {};
