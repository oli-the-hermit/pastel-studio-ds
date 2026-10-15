import React, { useState } from 'react';
import { Button, EmptyState } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

function Demo() {
  const [items, setItems] = useState(['Return the library books']);
  return (
    <div className="docs-demo-form docs-demo-narrow">
      {items.length ? items.map((i) => <p key={i}>{i}</p>) : <EmptyState size="sm">No tasks left. Enjoy the quiet.</EmptyState>}
      <div className="docs-demo-actions">
        <Button size="sm" onClick={() => setItems((all) => (all.length ? [] : ['Return the library books']))}>{items.length ? 'Finish the task' : 'Start over'}</Button>
      </div>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Message: <div className="docs-demo-wide"><EmptyState>No sessions this week.</EmptyState></div>,
  },
  variants: {
    md: <div className="docs-demo-wide"><EmptyState>No sessions this week.</EmptyState></div>,
    sm: <div className="docs-demo-wide"><EmptyState size="sm">No tasks left.</EmptyState></div>,
  },
  dos: [
    'Say what will appear here, and how to make it appear: "No lists yet. Create one with New."',
  ],
  donts: [
    'Don\'t blame or scold: "You have no tasks" reads like a failure.',
  ],
};
