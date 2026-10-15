import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LabelsProvider } from '../../labels';
import { moveById, SortableList } from './SortableList';

interface Task { id: string; text: string }
const start: Task[] = [{ id: 'a', text: 'Alpha' }, { id: 'b', text: 'Bravo' }, { id: 'c', text: 'Charlie' }];

function Tasks({ onReorder }: { onReorder?: (s: string, t: string) => void }) {
  const [tasks, setTasks] = useState(start);
  return (
    <SortableList
      ariaLabel="Tasks"
      items={tasks}
      onReorder={(s, t) => { onReorder?.(s, t); setTasks((all) => moveById(all, s, t) ?? all); }}
      renderItem={(t) => <button>{t.text}</button>}
      itemClassName={(t) => (t.id === 'c' ? 'is-done' : undefined)}
    />
  );
}

const rows = () => screen.getAllByRole('listitem');
const order = () => rows().map((r) => r.textContent);
/** jsdom has no DataTransfer: a stand-in with what the drag handlers touch. */
const dataTransfer = () => ({ setData: vi.fn(), effectAllowed: '', dropEffect: '' });

describe('moveById', () => {
  it('moves an item to where another one is, or returns null when nothing moves', () => {
    expect(moveById(start, 'a', 'c')?.map((t) => t.id)).toEqual(['b', 'c', 'a']);
    expect(moveById(start, 'c', 'a')?.map((t) => t.id)).toEqual(['c', 'a', 'b']);
    expect(moveById(start, 'a', 'a')).toBeNull();
    expect(moveById(start, 'a', 'zz')).toBeNull();
  });
});

describe('SortableList', () => {
  it('is a named list of rows, each with a grip and its content, and the keyboard instructions', () => {
    render(<Tasks />);
    const list = screen.getByRole('list', { name: 'Tasks' });
    expect(document.getElementById(list.getAttribute('aria-describedby')!)?.textContent).toBe('To move an item, press Alt with the up or down arrow.');
    expect(order()).toEqual(['Alpha', 'Bravo', 'Charlie']);
    expect(rows()[0].className).toBe('ps-sortable-item');
    expect(rows()[2].className).toBe('ps-sortable-item is-done');
    expect(rows()[0].querySelector('.ps-sortable-item-grip')?.getAttribute('title')).toBe('Drag to reorder');
    expect(rows()[0].getAttribute('draggable')).toBe('true');
  });

  it('moves a row with Alt + arrows from a control inside it, keeps focus there, and announces it', async () => {
    const user = userEvent.setup();
    render(<Tasks />);
    const alpha = screen.getByRole('button', { name: 'Alpha' });
    alpha.focus();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(order()).toEqual(['Bravo', 'Alpha', 'Charlie']);
    await act(() => new Promise((r) => requestAnimationFrame(r)));
    expect(document.activeElement).toBe(alpha);
    expect(screen.getByRole('status').textContent).toBe('Moved to position 2 of 3');
    await user.keyboard('{Alt>}{ArrowUp}{ArrowUp}{/Alt}');
    expect(order()).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('ignores the arrows without Alt', async () => {
    const onReorder = vi.fn();
    const user = userEvent.setup();
    render(<Tasks onReorder={onReorder} />);
    screen.getByRole('button', { name: 'Bravo' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('drops a dragged row onto another, marking both while dragging', () => {
    const onReorder = vi.fn();
    render(<Tasks onReorder={onReorder} />);
    const dt = dataTransfer();
    fireEvent.dragStart(rows()[0], { dataTransfer: dt });
    expect(dt.setData).toHaveBeenCalledWith('text/plain', 'a');
    fireEvent.dragOver(rows()[2], { dataTransfer: dt });
    expect(rows()[0].className).toContain('is-dragging');
    expect(rows()[2].className).toContain('is-drag-over');
    fireEvent.drop(rows()[2], { dataTransfer: dt });
    expect(onReorder).toHaveBeenCalledWith('a', 'c');
    expect(order()).toEqual(['Bravo', 'Charlie', 'Alpha']);
    expect(rows().some((r) => /is-drag/.test(r.className))).toBe(false);
  });

  it('ignores a drag that started inside the row, like a selection from a field', () => {
    const onReorder = vi.fn();
    render(<Tasks onReorder={onReorder} />);
    fireEvent.dragStart(screen.getByRole('button', { name: 'Alpha' }), { dataTransfer: dataTransfer() });
    fireEvent.dragOver(rows()[1], { dataTransfer: dataTransfer() });
    fireEvent.drop(rows()[1], { dataTransfer: dataTransfer() });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('shows the empty content when there are no rows, and takes words from the provider', () => {
    const { rerender } = render(<SortableList items={[]} onReorder={() => {}} renderItem={() => null} empty={<p>Nothing here</p>} />);
    expect(screen.getByText('Nothing here')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
    rerender(
      <LabelsProvider labels={{ dragToReorder: 'Arrastra' }}>
        <SortableList items={start} onReorder={() => {}} renderItem={(t) => t.text} />
      </LabelsProvider>
    );
    expect(rows()[0].querySelector('.ps-sortable-item-grip')?.getAttribute('title')).toBe('Arrastra');
  });

  it('slides in only the rows added after the first render', () => {
    const { rerender } = render(<SortableList items={start} onReorder={() => {}} renderItem={(t) => t.text} />);
    expect(rows().some((r) => r.className.includes('is-new'))).toBe(false);
    rerender(<SortableList items={[...start, { id: 'd', text: 'Delta' }]} onReorder={() => {}} renderItem={(t) => t.text} />);
    expect(rows().map((r) => r.className.includes('is-new'))).toEqual([false, false, false, true]);
  });
});
