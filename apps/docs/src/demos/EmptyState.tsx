import React, { useState } from 'react';
import { Button, EmptyState, IconFileVideo, IconFolderOpen, Spinner, TextButton } from '@pastel-studio/react';
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
    'With a picture': (
      <div className="docs-demo-wide">
        <EmptyState icon={<IconFileVideo />} title="No videos in this folder">
          It has 12 images.
          <TextButton accent>Show everything</TextButton>
        </EmptyState>
      </div>
    ),
    Loading: <div className="docs-demo-wide"><EmptyState icon={<Spinner size="lg" />} title="Reading…" /></div>,
  },
  variants: {
    md: <div className="docs-demo-wide"><EmptyState>No sessions this week.</EmptyState></div>,
    sm: <div className="docs-demo-wide"><EmptyState size="sm" icon={<IconFolderOpen />} title="No folders here">Create one with New folder.</EmptyState></div>,
  },
  dos: [
    'Say what will appear here, and how to make it appear: "No lists yet. Create one with New."',
    'Say what is missing, exactly: with a filter on, "No videos in this folder", not "No media".',
    'While the view is still read, show a Spinner in place of the picture: "empty" is only true once it is known.',
  ],
  donts: [
    'Don\'t blame or scold: "You have no tasks" reads like a failure.',
  ],
};
