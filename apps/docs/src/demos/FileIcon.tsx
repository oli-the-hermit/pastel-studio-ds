import React from 'react';
import { FileIcon, typeLabel, type FsEntry } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const files = ['Cover.png', 'Trailer.mp4', 'Low Tide.flac', 'Notes.txt', 'Letter.docx', 'Manual.pdf', 'Budget.xlsx', 'Pitch.pptx', 'App.tsx', 'Masters.zip', 'Setup.exe', 'Geist.ttf', 'Scene.blend', 'README']
  .map((name): Pick<FsEntry, 'kind' | 'name'> => ({ kind: 'file', name }));
const folder: Pick<FsEntry, 'kind' | 'name'> = { kind: 'folder', name: 'Albums' };
const drive: Pick<FsEntry, 'kind' | 'name'> = { kind: 'drive', name: 'Media (D:)' };
const sample = files[0];

const grid = (entries: Pick<FsEntry, 'kind' | 'name'>[], size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => (
  <ul className="docs-file-icons">
    {entries.map((e) => <li key={e.name}><FileIcon entry={e} size={size} /><span>{typeLabel(e)}</span></li>)}
  </ul>
);

export const demo: ComponentDemo = {
  Demo: () => grid([folder, drive, ...files]),
  states: {
    Categories: grid(files.slice(0, 6)),
    'Folders and drives': grid([folder, drive]),
  },
  variants: {
    sm: <FileIcon entry={sample} size="sm" />,
    md: <FileIcon entry={sample} size="md" />,
    lg: <div className="docs-demo-row"><FileIcon entry={sample} size="lg" /><FileIcon entry={folder} size="lg" /></div>,
    xl: <div className="docs-demo-row"><FileIcon entry={sample} size="xl" /><FileIcon entry={{ kind: 'file', name: 'Cover.psd' }} size="xl" /><FileIcon entry={folder} size="xl" /></div>,
  },
  dos: [
    'Pair it with the name and type in words: the glyph is a hint, not the label.',
    'Use `xl` where two files of one category sit side by side: the extension tells them apart.',
  ],
  donts: [
    'Don\'t tint file glyphs by type: only folders carry the accent.',
    'Don\'t use it for app navigation icons: use the icon set directly.',
  ],
};
