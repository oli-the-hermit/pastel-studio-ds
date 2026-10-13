import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

  it('does nothing outside a provider, so the browser behaves as usual', () => {
    render(<Row />);
    const allowed = fireEvent.contextMenu(screen.getByText('A row'), { clientX: 40, clientY: 60 });
    expect(allowed).toBe(true);
    expect(names()).toEqual([]);
  });
});
