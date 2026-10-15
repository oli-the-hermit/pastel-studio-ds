import React, { useState } from 'react';
import { Button, Equalizer, IconClock, IconCopy, IconPlus, IconTasks, IconTrash, moveById, QueueItem, QueueMetaItem, QueuePanel, useSortable } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

interface Session {
  id: string;
  name: string;
  minutes: number;
  tasks: number;
}

const startingSessions: Session[] = [
  { id: 's1', name: 'Morning deep work', minutes: 90, tasks: 4 },
  { id: 's2', name: 'Email and admin', minutes: 30, tasks: 2 },
  { id: 's3', name: 'Reading', minutes: 45, tasks: 1 },
];

const noop = () => {};
const meta = (s: Session) => (
  <>
    <QueueMetaItem title="Length"><IconClock size={13} />{s.minutes} min</QueueMetaItem>
    <QueueMetaItem title="Tasks"><IconTasks size={13} />{s.tasks}</QueueMetaItem>
  </>
);

function Demo() {
  const [sessions, setSessions] = useState(startingSessions);
  const [activeId, setActiveId] = useState('s1');
  const [count, setCount] = useState(4);
  const sortable = useSortable({ ids: sessions.map((s) => s.id), onReorder: (a, b) => setSessions((all) => moveById(all, a, b) ?? all) });
  const add = () => {
    setSessions((all) => [...all, { id: `s${count}`, name: `Session ${count}`, minutes: 25, tasks: 0 }]);
    setCount((n) => n + 1);
  };
  return (
    <div className="docs-page-patch">
      <QueuePanel
        className="docs-queue-panel"
        title="Sessions"
        action={<Button size="sm" variant="tonal" icon={<IconPlus size={16} />} onClick={add}>New</Button>}
        ids={sessions.map((s) => s.id)}
        emptyMessage="No sessions yet."
      >
        {(isNew) =>
          sessions.map((s) => (
            <QueueItem
              key={s.id}
              id={s.id}
              title={s.name}
              active={s.id === activeId}
              onSelect={() => setActiveId(s.id)}
              leading={s.id === activeId ? <Equalizer playing size={14} /> : undefined}
              meta={meta(s)}
              actions={[
                { key: 'dup', label: `Duplicate ${s.name}`, icon: <IconCopy size={14} />, onClick: () => { setSessions((all) => [...all, { ...s, id: `s${count}`, name: `${s.name} (copy)` }]); setCount((n) => n + 1); } },
                { key: 'del', label: `Delete ${s.name}`, icon: <IconTrash size={14} />, danger: true, onClick: () => setSessions((all) => all.filter((x) => x.id !== s.id)) },
              ]}
              drag={sortable.itemProps(s.id)}
              isDragging={sortable.isDragging(s.id)}
              isDragOver={sortable.isDragOver(s.id)}
              isNew={isNew(s.id)}
            />
          ))
        }
      </QueuePanel>
    </div>
  );
}

const panel = (rows: React.ReactNode, ids = ['a']) => (
  <div className="docs-page-patch">
    <QueuePanel className="docs-queue-panel" title="Sessions" ids={ids} emptyMessage="No sessions yet.">{() => rows}</QueuePanel>
  </div>
);
const item = (props: Partial<React.ComponentProps<typeof QueueItem>>) => (
  <QueueItem id="a" title="Morning deep work" active={false} onSelect={noop} actions={[{ key: 'del', label: 'Delete', icon: <IconTrash size={14} />, danger: true, onClick: noop }]} {...props} />
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Rows: panel(item({})),
    Active: panel(item({ active: true, meta: meta(startingSessions[0]) })),
    'With details': panel(item({ meta: meta(startingSessions[1]), title: 'Email and admin' })),
    Empty: panel(null, []),
  },
  variants: {
    'Leading and trailing': panel(item({ leading: <Equalizer size={14} />, trailing: '3 left', title: 'Reading' })),
  },
  dos: [
    'Use it for the few things a person switches between: sessions, lists.',
    'Keep the tools to two or three; put the rest in a right-click menu.',
  ],
  donts: [
    'Don\'t use it for long lists: a SortableList or a table scales better.',
    'Don\'t make two rows active.',
  ],
};
