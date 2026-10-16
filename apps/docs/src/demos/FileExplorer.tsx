import React, { useState } from 'react';
import { FileExplorer, findPath, type FileOperations, type FsEntry } from '@pastel-studio/react';
import { ScaledStage } from '../blocks/ScaledStage';
import { computer } from '../fixtures/files';
import type { ComponentDemo } from './types';

// The examples' computer with Albums pinned to Quick access.
const pinnedComputer = (() => {
  const pin = (e: FsEntry): FsEntry => ({ ...e, pinned: e.id === 'albums' || e.pinned, children: e.children?.map(pin) });
  return pin(computer);
})();

const map = (e: FsEntry, f: (e: FsEntry) => FsEntry | null): FsEntry | null => {
  const self = f(e);
  return self && { ...self, children: self.children?.map((c) => map(c, f)).filter((c): c is FsEntry => !!c) };
};

function Demo() {
  const [root, setRoot] = useState(pinnedComputer);
  const [said, setSaid] = useState('Right-click for more. Folders open on double-click.');
  const [clipboard, setClipboard] = useState<string[]>([]);
  let made = 0;
  const operations: FileOperations = {
    createFolder: (parent) => {
      const id = `new-${Date.now()}-${made++}`;
      setRoot((r) => map(r, (e) => (e.id === parent ? { ...e, children: [...(e.children ?? []), { id, name: 'New folder', kind: 'folder', children: [], modified: new Date().toISOString() }] } : e))!);
      return id;
    },
    rename: (id, name) => setRoot((r) => map(r, (e) => (e.id === id ? { ...e, name } : e))!),
    delete: (ids) => {
      setRoot((r) => map(r, (e) => (ids.includes(e.id) ? null : e))!);
      setSaid(`Deleted ${ids.length} (an app asks first)`);
    },
    copy: (ids) => { setClipboard(ids); setSaid(`Copied ${ids.length}`); },
    paste: (target) => setSaid(`Would paste ${clipboard.length} into ${findPath(root, target)?.at(-1)?.name}`),
    canPaste: clipboard.length > 0,
    share: (ids) => setSaid(`Would share ${ids.length}`),
    togglePin: (id) => setRoot((r) => map(r, (e) => (e.id === id ? { ...e, pinned: !e.pinned } : e))!),
  };
  return (
    <div className="docs-demo-form docs-demo-wide">
      <ScaledStage width={1200} height={640}>
        <FileExplorer root={root} initialId="albums" operations={operations} onOpenFile={(e) => setSaid(`Opened ${e.name}`)} />
      </ScaledStage>
      <span className="docs-demo-status" role="status">{said}</span>
    </div>
  );
}

const ops: FileOperations = { createFolder: () => undefined, rename: () => {}, delete: () => {}, copy: () => {}, cut: () => {}, paste: () => {}, share: () => {} };
const still = (width: number, props: Partial<React.ComponentProps<typeof FileExplorer>> = {}) => (
  <div className="docs-gallery-span">
    <ScaledStage width={width} height={560}>
      <FileExplorer root={pinnedComputer} initialId="albums" operations={ops} {...props} />
    </ScaledStage>
  </div>
);
const narrow = (props: Partial<React.ComponentProps<typeof FileExplorer>> = {}) => (
  <div className="docs-gallery-span docs-explorer-narrow">
    <FileExplorer root={pinnedComputer} initialId="albums" operations={ops} {...props} />
  </div>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Selection: still(1200, { defaultSelectedIds: ['cover', 'cover-psd'] }),
    'Without details pane': still(1200, { defaultDetailsOpen: false, defaultView: 'tiles' }),
    'Read-only': still(1200, { operations: undefined, defaultSelectedIds: ['low-tide'] }),
  },
  variants: {
    Wide: still(1200, { defaultSelectedIds: ['cover'] }),
    Medium: still(960),
    Narrow: narrow(),
  },
  dos: [
    'Give it the whole window or a large panel: it is a place, not a widget.',
    'Pass only the operations the app supports; the rest of the commands stay out of sight.',
    'Confirm deletes in `operations.delete` and say what happened in a toast.',
  ],
  donts: [
    'Don\'t use it to pick a file for the app: use FileDialog, which has the name field and the buttons.',
    'Don\'t put it inside a card: it brings its own cards.',
  ],
};
