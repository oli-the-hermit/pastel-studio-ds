import React, { useState } from 'react';
import { Button, IconCheck, IconCopy, IconGrip, IconReset, IconTrash, Menu, moveById, SortableList } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

interface Task {
  id: string;
  text: string;
  done?: boolean;
}

const startingTasks: Task[] = [
  { id: 't1', text: 'Return the library books' },
  { id: 't2', text: 'Call the plumber about the sink' },
  { id: 't3', text: 'Buy a birthday card', done: true },
  { id: 't4', text: 'Book the dentist' },
];

const noop = () => {};
const text = (task: Task) => <span className="docs-sortable-text">{task.text}</span>;

function Demo() {
  const [tasks, setTasks] = useState(startingTasks);
  const [count, setCount] = useState(5);
  const update = (id: string, change: (t: Task) => Task | null) =>
    setTasks((all) => all.flatMap((t) => (t.id === id ? (change(t) ?? []) : [t])));
  return (
    <div className="docs-demo-form docs-demo-narrow">
      <SortableList
        ariaLabel="Weekend errands"
        items={tasks}
        onReorder={(source, target) => setTasks((all) => moveById(all, source, target) ?? all)}
        itemClassName={(t) => (t.done ? 'docs-sortable-done' : undefined)}
        renderItem={(task) => (
          <>
            {text(task)}
            <Menu
              ariaLabel={`Actions for ${task.text}`}
              triggerSize="sm"
              triggerSurface={2}
              items={[
                task.done
                  ? { key: 'undo', label: 'Mark as not done', icon: <IconReset size={15} />, onSelect: () => update(task.id, (t) => ({ ...t, done: false })) }
                  : { key: 'done', label: 'Mark as done', icon: <IconCheck size={15} />, onSelect: () => update(task.id, (t) => ({ ...t, done: true })) },
                { key: 'dup', label: 'Duplicate', icon: <IconCopy size={15} />, onSelect: () => {
                  setTasks((all) => all.flatMap((t) => (t.id === task.id ? [t, { ...t, id: `t${count}`, done: false }] : [t])));
                  setCount((n) => n + 1);
                } },
                { key: 'div', divider: true },
                { key: 'delete', label: 'Delete', icon: <IconTrash size={15} />, danger: true, onSelect: () => update(task.id, () => null) },
              ]}
            />
          </>
        )}
        empty={<p className="docs-demo-status">No tasks left.</p>}
      />
      <div className="docs-demo-actions">
        <Button size="sm" onClick={() => setTasks(startingTasks)}>Start over</Button>
      </div>
    </div>
  );
}

/* A row standing still in a drag state: the classes SortableList sets while dragging. */
const stillRow = (state: string, label: string) => (
  <div className="docs-demo-wide">
    <div className="ps-sortable-list-items">
      <div className={`ps-sortable-item ${state}`}>
        <IconGrip className="ps-sortable-item-grip" />
        <span className="docs-sortable-text">{label}</span>
      </div>
    </div>
  </div>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Rows: <div className="docs-demo-wide"><SortableList items={startingTasks.slice(0, 2)} onReorder={noop} renderItem={text} /></div>,
    Dragging: stillRow('is-dragging', 'Call the plumber about the sink'),
    'Drop target': stillRow('is-drag-over', 'Return the library books'),
    Empty: <div className="docs-demo-wide"><SortableList items={[]} onReorder={noop} renderItem={text} empty={<p className="docs-demo-status">No tasks left.</p>} /></div>,
  },
  variants: {
    'Finished rows': (
      <div className="docs-demo-wide">
        <SortableList items={startingTasks.slice(1, 3)} onReorder={noop} renderItem={text} itemClassName={(t) => (t.done ? 'docs-sortable-done' : undefined)} />
      </div>
    ),
  },
  dos: [
    'Use it where the order means something: priority, a queue, the steps of a plan.',
    'Keep each row\'s actions in its ⋮ menu, so the row stays one line.',
    'Save the new order as soon as a row is dropped; there is no Save button.',
  ],
  donts: [
    'Don\'t make a list sortable when it is sorted by date or name: the order would jump back.',
    'Don\'t rely on the grip alone: keyboard users move rows with Alt and the arrows.',
  ],
};
