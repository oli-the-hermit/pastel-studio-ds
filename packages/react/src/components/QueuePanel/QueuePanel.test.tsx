import React, { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { moveById, useSortable } from '../SortableList';
import { QueueItem, QueueMetaItem, QueuePanel } from './QueuePanel';

const noop = () => {};

function Sessions({ onSelect = noop }: { onSelect?: (id: string) => void }) {
  const [rows, setRows] = useState([{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Bravo' }]);
  const sortable = useSortable({ ids: rows.map((r) => r.id), onReorder: (s, t) => setRows((all) => moveById(all, s, t) ?? all) });
  return (
    <QueuePanel title="Sessions" ids={rows.map((r) => r.id)} emptyMessage="None">
      {(isNew) =>
        rows.map((r) => (
          <QueueItem key={r.id} id={r.id} title={r.name} active={r.id === 'a'} onSelect={() => onSelect(r.id)} actions={[]} drag={sortable.itemProps(r.id)} isNew={isNew(r.id)} />
        ))
      }
    </QueuePanel>
  );
}

describe('QueuePanel', () => {
  it('has a heading, its rows, and an empty message when there are none', () => {
    const ref = createRef<HTMLElement>();
    const { rerender } = render(<Sessions />);
    expect(screen.getByRole('heading', { name: 'Sessions' })).toBeTruthy();
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Alpha', 'Bravo']);
    rerender(<QueuePanel ref={ref} title="Sessions" ids={[]} emptyMessage="No sessions yet.">{() => null}</QueuePanel>);
    expect(screen.getByText('No sessions yet.').className).toBe('ps-empty-state ps-empty-state--sm');
    expect(ref.current?.className).toBe('ps-card ps-queue-panel');
  });

  it('selects a row with a click, Enter or Space, and marks the active one', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Sessions onSelect={onSelect} />);
    const bravo = screen.getByRole('button', { name: 'Bravo' });
    expect(screen.getByRole('button', { name: 'Alpha' }).getAttribute('aria-pressed')).toBe('true');
    await user.click(bravo);
    bravo.focus();
    await user.keyboard('{Enter} ');
    expect(onSelect).toHaveBeenCalledTimes(3);
  });

  it('moves a row with Alt + arrows without selecting it', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Sessions onSelect={onSelect} />);
    screen.getByRole('button', { name: 'Alpha' }).focus();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Bravo', 'Alpha']);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('QueueItem', () => {
  it('shows details, floats its tools without them, and runs a tool without selecting', async () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    const actions = [{ key: 'del', label: 'Delete Alpha', icon: <i />, danger: true, onClick: onDelete }];
    const { container, rerender } = render(<QueueItem id="a" title="Alpha" active={false} onSelect={onSelect} actions={actions} trailing="3 left" />);
    expect(container.querySelector('.ps-queue-item-actions--floating')).toBeTruthy();
    expect(container.querySelector('.ps-queue-item-trailing')?.textContent).toBe('3 left');
    await user.click(screen.getByRole('button', { name: 'Delete Alpha' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
    rerender(<QueueItem id="a" title="Alpha" active onSelect={onSelect} actions={actions} meta={<QueueMetaItem title="Length">25 min</QueueMetaItem>} isNew />);
    expect(container.querySelector('.ps-queue-item-meta')?.textContent).toBe('25 min');
    expect(container.firstElementChild?.className).toBe('ps-queue-item is-active is-new');
  });
});
