import React, { useState } from 'react';
import { IconDownload, IconMusic, TreeView, type TreeNode } from '@pastel-studio/react';
import { tree } from '../fixtures/folders';
import type { ComponentDemo } from './types';

const noop = () => {};
const narrow = (node: React.ReactNode) => <div className="docs-demo-narrow">{node}</div>;
const places: TreeNode[] = [
  { id: 'music', label: 'Music', icon: <IconMusic size={16} />, trailing: '128' },
  { id: 'downloads', label: 'Downloads', icon: <IconDownload size={16} />, trailing: '12' },
];
const flatTree = tree.filter((n) => !n.heading && !n.separator);

function Demo() {
  const [selected, setSelected] = useState('albums');
  return (
    <div className="docs-demo-form docs-demo-narrow">
      <TreeView label="Folders" nodes={tree} selectedId={selected} onSelect={setSelected} defaultExpanded={['home', 'music']} />
      <span className="docs-demo-status" role="status">Opened {selected}</span>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Selected: narrow(<TreeView label="Places" nodes={places} selectedId="music" onSelect={noop} />),
    Expanded: narrow(<TreeView label="Folders" nodes={flatTree} selectedId="albums" onSelect={noop} defaultExpanded={['home', 'music']} />),
    'With groups': narrow(<TreeView label="Folders" nodes={tree} selectedId="home" onSelect={noop} />),
  },
  variants: {
    md: narrow(<TreeView label="Folders" nodes={flatTree} selectedId="music" onSelect={noop} defaultExpanded={['home']} />),
    sm: narrow(<TreeView label="Folders" nodes={flatTree} selectedId="music" onSelect={noop} defaultExpanded={['home']} size="sm" />),
  },
  dos: [
    'Open the path to the current folder, so the selection is in view.',
    'Use `hasChildren` and `onExpand` to load big trees a level at a time.',
    'Split places from drives with a `heading`.',
  ],
  donts: [
    'Don\'t use it for app navigation with a few fixed pages: use a navigation rail.',
    'Don\'t nest deeper than people can follow; let the address bar carry long paths.',
  ],
};
