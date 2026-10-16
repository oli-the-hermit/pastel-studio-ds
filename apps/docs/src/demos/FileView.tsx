import React, { useState } from 'react';
import { FileView, StatusBar, IconButton, IconViewDetails, IconViewIcons, IconViewList, IconViewTiles, useFileBrowser, useLabels, type FileCommand, type FileViewMode, type FsEntry } from '@pastel-studio/react';
import { albums, computer } from '../fixtures/files';
import type { ComponentDemo } from './types';

const noop = () => {};
const views: { mode: FileViewMode; label: string; Icon: typeof IconViewList }[] = [
  { mode: 'details', label: 'Details', Icon: IconViewDetails },
  { mode: 'list', label: 'List', Icon: IconViewList },
  { mode: 'tiles', label: 'Tiles', Icon: IconViewTiles },
  { mode: 'icons', label: 'Icons', Icon: IconViewIcons },
];

function Demo() {
  const labels = useLabels();
  const [root, setRoot] = useState(albums);
  const [renaming, setRenaming] = useState<string>();
  const [said, setSaid] = useState('Double-click a folder to open it. Try F2, Ctrl+A or Shift+arrows.');
  const fb = useFileBrowser(root, { labels, onOpenFile: (e) => setSaid(`Opened ${e.name}`) });
  const rename = (id: string, name: string) => {
    const swap = (e: FsEntry): FsEntry => ({ ...e, name: e.id === id ? name : e.name, children: e.children?.map(swap) });
    setRoot(swap(root));
    setRenaming(undefined);
  };
  const onCommand = (c: FileCommand) => {
    if (c === 'rename' && fb.selected.length === 1) setRenaming(fb.selected[0].id);
    else if (c === 'up') fb.up();
    else if (c === 'back') fb.back();
    else if (c === 'forward') fb.forward();
    else setSaid(`The app would ${c} ${fb.selected.length} item${fb.selected.length === 1 ? '' : 's'}`);
  };
  return (
    <div className="docs-demo-form docs-demo-wide">
      <div className="docs-file-frame">
        <FileView
          label={`Files in ${fb.current.name}`}
          items={fb.items}
          view={fb.view}
          selection={fb.selection}
          onSelect={fb.select}
          onSelectAll={fb.selectAll}
          onClearSelection={fb.clearSelection}
          onOpen={fb.open}
          sort={fb.sort}
          onSortChange={fb.toggleSort}
          renamingId={renaming}
          onRenameCommit={rename}
          onRenameCancel={() => setRenaming(undefined)}
          onCommand={onCommand}
        />
      </div>
      <StatusBar end={views.map(({ mode, label, Icon }) => <IconButton key={mode} label={label} size="sm" pressed={fb.view === mode} onClick={() => fb.setView(mode)}><Icon size={16} /></IconButton>)}>
        <span>{fb.items.length} items</span>
        {fb.selected.length > 0 && <span>{fb.selected.length} selected</span>}
        <span>{said}</span>
      </StatusBar>
    </div>
  );
}

const still = (props: Partial<React.ComponentProps<typeof FileView>> = {}) => (
  <div className="docs-gallery-span docs-file-frame">
    <FileView label="Files in Albums" items={albums.children!.filter((e) => !e.hidden)} view="details" selection={new Set()} onSelect={noop} onOpen={noop} {...props} />
  </div>
);
const sortedBySize = [...albums.children!].filter((e) => !e.hidden).sort((a, b) => (a.kind === 'file') === (b.kind === 'file') ? (b.size ?? 0) - (a.size ?? 0) : a.kind === 'file' ? 1 : -1);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Selected: still({ selection: new Set(['cover', 'cover-psd', 'liner']) }),
    Sorted: still({ items: sortedBySize, sort: { key: 'size', dir: 'desc' }, onSortChange: noop }),
    Renaming: still({ selection: new Set(['tracklist']), renamingId: 'tracklist' }),
    'Search results': still({ items: albums.children!.filter((e) => e.name.includes('.flac')), locationOf: () => 'Media (D:) › Music › Albums' }),
    'Unavailable and hidden': still({ items: albums.children!.slice(0, 5).concat(albums.children!.slice(-1)), isDisabled: (e) => e.kind === 'file' && !e.hidden }),
    Empty: still({ items: [] }),
  },
  variants: {
    details: still(),
    list: still({ view: 'list' }),
    tiles: still({ view: 'tiles', items: computer.children! }),
    icons: still({ view: 'icons', items: albums.children!.filter((e) => !e.hidden).slice(0, 8) }),
  },
  dos: [
    'Drive it with `useFileBrowser`: it keeps the folder, history, selection, sort and search for you.',
    'Carry out `onCommand` in the app, with a confirmation for anything destructive.',
    'Name the list after the folder: "Files in Music".',
  ],
  donts: [
    'Don\'t use it for a short list of choices: use a select or a list picker.',
    'Don\'t open files on a single click: a click selects, a double-click or Enter opens.',
  ],
};
