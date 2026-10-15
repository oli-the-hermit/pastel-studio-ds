import React, { useState } from 'react';
import { IconButton, IconCopy, IconCut, IconFolderPlus, IconPaste, IconRename, IconTrash, SearchField, Toolbar, ToolbarDivider, ToolbarGroup, ToolbarSpacer } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const wide = (node: React.ReactNode) => <div className="docs-gallery-span">{node}</div>;

function Commands({ selected, search }: { selected: boolean; search?: React.ReactNode }) {
  return (
    <Toolbar label="File commands">
      <ToolbarGroup>
        <IconButton label="New folder" onClick={noop}><IconFolderPlus size={18} /></IconButton>
      </ToolbarGroup>
      <ToolbarDivider />
      <ToolbarGroup>
        <IconButton label="Cut" disabled={!selected} onClick={noop}><IconCut size={18} /></IconButton>
        <IconButton label="Copy" disabled={!selected} onClick={noop}><IconCopy size={18} /></IconButton>
        <IconButton label="Paste" onClick={noop}><IconPaste size={18} /></IconButton>
        <IconButton label="Rename" disabled={!selected} onClick={noop}><IconRename size={18} /></IconButton>
        <IconButton label="Delete" tone="danger" disabled={!selected} onClick={noop}><IconTrash size={18} /></IconButton>
      </ToolbarGroup>
      {search && <><ToolbarSpacer />{search}</>}
    </Toolbar>
  );
}

function Demo() {
  const [selected, setSelected] = useState(true);
  const [query, setQuery] = useState('');
  return (
    <div className="docs-demo-form docs-demo-wide">
      <Commands selected={selected} search={<SearchField placeholder="Search Music" value={query} onChange={setQuery} />} />
      <label className="docs-demo-status"><input type="checkbox" checked={selected} onChange={(e) => setSelected(e.target.checked)} /> A file is selected</label>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    'Some unavailable': wide(<Commands selected={false} />),
  },
  variants: {
    Groups: wide(<Commands selected />),
    'With spacer': wide(<Commands selected search={<SearchField placeholder="Search Music" value="" onChange={noop} />} />),
  },
  dos: [
    'Group commands by what they act on: creating, then the selection.',
    'Disable commands that don\'t apply rather than hiding them, so the bar doesn\'t jump.',
    'Give every icon button a name: it is its tooltip too.',
  ],
  donts: [
    'Don\'t put more than one search field or a primary action in a toolbar.',
    'Don\'t make it scroll sideways: it wraps on purpose.',
  ],
};
