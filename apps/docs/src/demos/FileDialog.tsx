import React, { useState } from 'react';
import { Button, FileDialog, type FileDialogProps, type FileFilter, type FsEntry } from '@pastel-studio/react';
import { ModalStage } from '../blocks/StaticOverlay';
import { albums, computer, music } from '../fixtures/files';
import type { ComponentDemo } from './types';

const noop = () => {};
const filters: FileFilter[] = [
  { label: 'Audio', extensions: ['flac', 'mp3', 'wav'] },
  { label: 'Images', extensions: ['png', 'psd', 'jpg'] },
  { label: 'All files', extensions: ['*'] },
];

function Demo() {
  const [mode, setMode] = useState<FileDialogProps['mode'] | null>(null);
  const [bookmarks, setBookmarks] = useState<FsEntry[]>([music]);
  const [said, setSaid] = useState('Nothing picked yet.');
  return (
    <div className="docs-demo-stack">
      <div className="docs-demo-row">
        <Button onClick={() => setMode('open')}>Open files…</Button>
        <Button onClick={() => setMode('save')}>Save as…</Button>
        <Button onClick={() => setMode('folder')}>Pick a folder…</Button>
      </div>
      <span className="docs-demo-status" role="status">{said}</span>
      {mode && (
        <FileDialog
          open
          mode={mode}
          multiple
          root={computer}
          initialId="albums"
          filters={mode === 'folder' ? undefined : filters}
          defaultName="Late mix.flac"
          recent={[albums]}
          bookmarks={bookmarks}
          onBookmarksChange={setBookmarks}
          onCreateFolder={() => undefined}
          onCancel={() => setMode(null)}
          onConfirm={(r) => {
            setSaid(r.name ? `Save "${r.name}" in ${r.folder.name}` : `Picked ${r.entries.map((e) => e.name).join(', ')}`);
            setMode(null);
          }}
        />
      )}
    </div>
  );
}

const stage = (props: Partial<FileDialogProps>) => (
  <ModalStage height={760}>
    <FileDialog open mode="open" root={computer} initialId="albums" onConfirm={noop} onCancel={noop} {...props} />
  </ModalStage>
);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Places: stage({ recent: [albums], bookmarks: [music], onBookmarksChange: noop }),
    'Type filter': stage({ filters }),
  },
  variants: {
    open: stage({ multiple: true }),
    save: stage({ mode: 'save', defaultName: 'Late mix.flac', filters, onCreateFolder: noop }),
    folder: stage({ mode: 'folder', onCreateFolder: noop }),
  },
  dos: [
    'Use it where the app works inside its own file tree (a project, a library) or the system dialog can\'t follow the app\'s look.',
    'Give filters a plain name and the extensions; end with "All files".',
    'Suggest a name when saving, with its extension.',
  ],
  donts: [
    'Don\'t use it for a plain "upload a photo" on the web: the browser\'s picker is expected there.',
    'Don\'t overwrite a file silently: ask in `onConfirm` when the name is taken.',
  ],
};
