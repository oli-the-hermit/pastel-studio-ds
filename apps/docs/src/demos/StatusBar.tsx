import React, { useState } from 'react';
import { Button, IconButton, IconFile, IconFileImage, IconFileVideo, IconViewList, IconViewTiles, StatusBar, StatusCount } from '@pastel-studio/react';
import type { ComponentDemo } from './types';

const noop = () => {};
const wide = (node: React.ReactNode) => <div className="docs-gallery-span">{node}</div>;
function Views({ view, onChange }: { view: string; onChange: (v: string) => void }) {
  return (
    <>
      <IconButton label="List" size="sm" pressed={view === 'list'} onClick={() => onChange('list')}><IconViewList size={16} /></IconButton>
      <IconButton label="Tiles" size="sm" pressed={view === 'tiles'} onClick={() => onChange('tiles')}><IconViewTiles size={16} /></IconButton>
    </>
  );
}

function Demo() {
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(0);
  return (
    <div className="docs-demo-form docs-demo-wide">
      <StatusBar end={<Views view={view} onChange={setView} />}>
        <span>24 items</span>
        {selected > 0 && <span>{selected} selected · {(selected * 1.4).toFixed(1)} MB</span>}
      </StatusBar>
      <div className="docs-demo-row">
        <Button size="sm" onClick={() => setSelected((n) => n + 1)}>Select one more</Button>
        <Button size="sm" onClick={() => setSelected(0)}>Clear selection</Button>
      </div>
    </div>
  );
}

export const demo: ComponentDemo = {
  Demo,
  states: {
    Counts: wide(<StatusBar><span>24 items</span><span>3 selected · 4.2 MB</span></StatusBar>),
    'With end': wide(<StatusBar end={<Views view="list" onChange={noop} />}><span>24 items</span></StatusBar>),
    'Counts by kind': wide(
      <StatusBar>
        <span>3 folders</span>
        <StatusCount icon={<IconFileVideo />} label="12 videos">12</StatusCount>
        <StatusCount icon={<IconFileImage />} label="1,204 images">1,204</StatusCount>
        <StatusCount icon={<IconFile />} label="3 other files">3</StatusCount>
      </StatusBar>
    ),
  },
  variants: {},
  dos: [
    'Keep it to facts about the view: counts, sizes, the selection.',
    'Where a view holds a few kinds of things, count each with its icon (StatusCount) and give the words in `label`.',
    'Put view switches at the end, where they stay put as counts change.',
  ],
  donts: [
    'Don\'t put errors or confirmations here: use a toast.',
    'Don\'t put commands here: they belong in the toolbar.',
  ],
};
