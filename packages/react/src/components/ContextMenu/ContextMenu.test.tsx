import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MenuItem } from '../Menu';
import { ContextMenuProvider, useContextMenu } from './ContextMenu';

const noop = () => {};
const globalItems: MenuItem[] = [{ key: 'help', label: 'Help', onSelect: noop }];

function Row({ onRename = noop }: { onRename?: () => void }) {
  const menu = useContextMenu();
  return (
    <button onContextMenu={(e) => menu(e, [{ key: 'rename', label: 'Rename', onSelect: onRename }, false, { key: 'delete', label: 'Delete', onSelect: noop }])}>
      A row
    </button>
  );
}

function App({ onRename }: { onRename?: () => void }) {
  return (
    <ContextMenuProvider getGlobalItems={() => globalItems}>
      <p>The page</p>
      <Row onRename={onRename} />
      <input aria-label="Name" />
    </ContextMenuProvider>
  );
}

const names = () => screen.queryAllByRole('menuitem').map((el) => el.textContent);

describe('ContextMenu', () => {
  it('opens the global items for a right-click nothing else handled', () => {
    render(<App />);
    fireEvent.contextMenu(screen.getByText('The page'), { clientX: 40, clientY: 60 });
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy();
    expect(names()).toEqual(['Help']);
  });

  it("opens a component's own items instead, skipping the falsy ones", () => {
    render(<App />);
    fireEvent.contextMenu(screen.getByText('A row'), { clientX: 40, clientY: 60 });
    expect(names()).toEqual(['Rename', 'Delete']);
  });

  it('picks an item and closes', async () => {
    const onRename = vi.fn();
    const user = userEvent.setup();
    render(<App onRename={onRename} />);
    fireEvent.contextMenu(screen.getByText('A row'), { clientX: 40, clientY: 60 });
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    expect(onRename).toHaveBeenCalledTimes(1);
  });

  it("leaves text fields with the browser's menu", () => {
    render(<App />);
    const allowed = fireEvent.contextMenu(screen.getByLabelText('Name'), { clientX: 40, clientY: 60 });
    expect(allowed).toBe(true);
    expect(names()).toEqual([]);
  });

  it('closes on Escape and gives focus back to where it was', async () => {
    const user = userEvent.setup();
    render(<App />);
    const row = screen.getByText('A row');
    row.focus();
    fireEvent.contextMenu(row, { clientX: 40, clientY: 60 });
    expect(names()).toEqual(['Rename', 'Delete']);
    await user.keyboard('{Escape}');
    expect(document.activeElement).toBe(row);
  });

  // Right-click A, open "Export as", then right-click B: the menu is B's, from the top.
  it('starts every right-click at the top level, acting on what was right-clicked', async () => {
    const user = userEvent.setup();
    const exported = vi.fn();
    function File({ name }: { name: string }) {
      const menu = useContextMenu();
      return (
        <button onContextMenu={(e) => menu(e, [{ key: 'export', label: 'Export as', items: [{ key: 'png', label: 'PNG', onSelect: () => exported(name) }] }])}>
          {name}
        </button>
      );
    }
    render(
      <ContextMenuProvider getGlobalItems={() => globalItems}>
        <File name="a.psd" />
        <File name="b.psd" />
      </ContextMenuProvider>
    );
    fireEvent.contextMenu(screen.getByText('a.psd'), { clientX: 40, clientY: 60 });
    await user.click(screen.getByRole('menuitem', { name: 'Export as' }));
    expect(names()).toContain('PNG');
    fireEvent.contextMenu(screen.getByText('b.psd'), { clientX: 40, clientY: 90 });
    expect(names()).toEqual(['Export as']);
    await user.click(screen.getByRole('menuitem', { name: 'Export as' }));
    await user.click(screen.getByRole('menuitem', { name: 'PNG' }));
    expect(exported.mock.calls).toEqual([['b.psd']]);
  });

  it('does nothing outside a provider, so the browser behaves as usual', () => {
    render(<Row />);
    const allowed = fireEvent.contextMenu(screen.getByText('A row'), { clientX: 40, clientY: 60 });
    expect(allowed).toBe(true);
    expect(names()).toEqual([]);
  });
});

describe('ContextMenu in a short window', () => {
  const restore: (() => void)[] = [];
  const stub = (obj: object, key: string, value: number | ((el: HTMLElement) => number)) => {
    const before = Object.getOwnPropertyDescriptor(obj, key);
    Object.defineProperty(obj, key, {
      configurable: true,
      get(this: HTMLElement) {
        return typeof value === 'function' ? value(this) : value;
      },
    });
    restore.push(() => (before ? Object.defineProperty(obj, key, before) : delete (obj as Record<string, unknown>)[key]));
  };
  afterEach(() => restore.splice(0).forEach((undo) => undo()));

  it('spreads into columns instead of scrolling, with each group kept whole', () => {
    stub(window, 'innerHeight', 420);
    stub(window, 'innerWidth', 1280);
    // Like real layout: the rows split between the columns the panel has.
    stub(HTMLElement.prototype, 'scrollHeight', (el) => Math.ceil(700 / Number(el.closest('[data-columns]')?.getAttribute('data-columns') || 1)));
    stub(HTMLElement.prototype, 'offsetWidth', 240);
    render(<App />);
    fireEvent.contextMenu(screen.getByText('A row'), { clientX: 40, clientY: 200 });
    const menu = screen.getByRole('menu', { name: 'Actions' });
    expect(menu.getAttribute('data-columns')).toBe('2');
    expect(menu.style.getPropertyValue('--ps-popover-columns')).toBe('2');
    expect(menu.querySelectorAll('.ps-menu-group').length).toBeGreaterThan(0);
  });
});
