import React, { useState } from 'react';
import { Button, IconChevronDown, IconPlus, IconTrash } from '@pastel-studio/react';
import { OnSurface } from '../blocks/OnSurface';
import type { ComponentDemo } from './types';

function Demo() {
  const [tasks, setTasks] = useState(2);
  return (
    <div className="docs-demo-row">
      <Button variant="primary" icon={<IconPlus />} onClick={() => setTasks((n) => n + 1)}>Add task</Button>
      <Button disabled={tasks === 0} onClick={() => setTasks(0)}>Clear all</Button>
      <span className="docs-demo-status" role="status">{tasks === 1 ? '1 task' : `${tasks} tasks`}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Default: <Button>Save</Button>,
    Disabled: <Button disabled>Save</Button>,
    'With icon': <Button icon={<IconPlus />}>Add task</Button>,
    'Trailing icon': <Button trailingIcon={<IconChevronDown size={16} />}>Sort by</Button>,
    Block: <Button block>Continue</Button>,
    Collapsible: <Button collapsible icon={<IconPlus />} aria-label="Add task" title="Add task">Add task</Button>,
  },
  variants: {
    secondary: <Button>Cancel</Button>,
    primary: <Button variant="primary">Save</Button>,
    tonal: <Button variant="tonal">Add to list</Button>,
    danger: <Button variant="danger" icon={<IconTrash />}>Delete</Button>,
    lg: <Button size="lg" variant="primary">Claim reward</Button>,
    sm: <Button size="sm">Edit</Button>,
    xs: <Button size="xs">Complete</Button>,
    'On the page': <OnSurface surface={0}><Button surface={0}>Cancel</Button></OnSurface>,
    'On a raised surface': (
      <>
        <OnSurface surface={2}><Button surface={2}>Cancel</Button></OnSurface>
        <OnSurface surface={3}><Button surface={3}>Cancel</Button></OnSurface>
      </>
    ),
    'On accent': <OnSurface surface="accent"><Button variant="primary" surface="accent">Start</Button></OnSurface>,
  },
  dos: [
    'Use one `primary` button per surface, for the action most people take.',
    'Start the label with a verb that says what happens: "Save changes", "Add task".',
    'Set `surface` when the button sits on anything other than a card, so its fill stays visible.',
  ],
  donts: [
    'Don\'t use `danger` for something one click can undo.',
    'Don\'t write "OK" or "Yes": say what the button does.',
    'Don\'t use a button to go to another page: use a link.',
  ],
};
