import React, { useMemo, useRef, useState } from 'react';
import { MediaGrid, MediaTile, SegmentedControl, StatusBar, type SelectMode } from '@pastel-studio/react';
import { covers } from '@pastel-studio/catalog/fixtures';
import type { ComponentDemo } from './types';

interface Photo { id: string; name: string; src: string; meta: string; favorite: boolean }

const art = Object.values(covers);
const library = (count: number): Photo[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `p${i}`,
    name: `IMG_${String(i + 1).padStart(5, '0')}.png`,
    src: art[i % art.length],
    meta: `${1200 + (i % 7) * 200} × ${1200 + (i % 5) * 150}`,
    favorite: i % 11 === 0,
  }));

/** A desktop's selection over a list: what an app keeps around a MediaGrid. */
function useSelection(items: Photo[]) {
  const [selection, setSelection] = useState<ReadonlySet<string>>(new Set());
  const anchor = useRef<string | null>(null);
  const select = (key: string, mode: SelectMode) => {
    if (mode === 'range' && anchor.current) {
      const a = items.findIndex((p) => p.id === anchor.current);
      const b = items.findIndex((p) => p.id === key);
      setSelection(new Set(items.slice(Math.min(a, b), Math.max(a, b) + 1).map((p) => p.id)));
      return;
    }
    anchor.current = key;
    setSelection((prev) => {
      if (mode === 'replace') return new Set([key]);
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  return { selection, select, selectAll: () => setSelection(new Set(items.map((p) => p.id))), clear: () => setSelection(new Set()) };
}

type Size = 's' | 'm' | 'l' | 'xl';
const sizes: { value: Size; label: string }[] = [
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

function Grid({ items, size = 'm', header, empty, overlay = false, openOnClick = false, tileWidth }: {
  items: Photo[];
  size?: Size;
  header?: React.ReactNode;
  empty?: React.ReactNode;
  overlay?: boolean;
  openOnClick?: boolean;
  tileWidth?: number;
}) {
  const { selection, select, selectAll, clear } = useSelection(items);
  return (
    <div className="docs-file-frame docs-media-frame docs-gallery-span">
      <MediaGrid<Photo>
        label="Photos"
        items={items}
        getKey={(p) => p.id}
        size={size}
        tileWidth={tileWidth}
        captions={overlay ? 'overlay' : 'below'}
        openOnClick={openOnClick}
        header={header}
        empty={empty}
        selection={selection}
        onSelect={select}
        onSelectAll={selectAll}
        onClearSelection={clear}
        onOpen={() => {}}
        renderTile={(p, state) => (
          <MediaTile name={p.name} src={p.src} meta={p.meta} favorite={p.favorite} selected={state.selected} selecting={state.selecting} caption={overlay ? 'overlay' : 'below'} />
        )}
      />
    </div>
  );
}

function Demo() {
  const items = useMemo(() => library(10000), []);
  const [size, setSize] = useState<Size>('m');
  const [said, setSaid] = useState('Shift + click, Ctrl + click, the arrows or Ctrl + A. Double-click opens.');
  const { selection, select, selectAll, clear } = useSelection(items);
  return (
    <div className="docs-demo-form docs-demo-wide">
      <div className="docs-file-frame">
        <MediaGrid<Photo>
          label="10,000 photos"
          items={items}
          getKey={(p) => p.id}
          size={size}
          selection={selection}
          onSelect={select}
          onSelectAll={selectAll}
          onClearSelection={clear}
          onOpen={(p) => setSaid(`Opened ${p.name}`)}
          onCommand={(c) => setSaid(`The app would ${c} ${selection.size} item${selection.size === 1 ? '' : 's'}`)}
          renderTile={(p, state) => <MediaTile name={p.name} src={p.src} meta={p.meta} favorite={p.favorite} selected={state.selected} selecting={state.selecting} />}
        />
      </div>
      <StatusBar end={<SegmentedControl ariaLabel="Tile size" options={sizes} value={size} onChange={setSize} />}>
        <span>{items.length.toLocaleString()} items</span>
        {selection.size > 0 && <span>{selection.size.toLocaleString()} selected</span>}
        <span>{said}</span>
      </StatusBar>
    </div>
  );
}

const few = library(14);

export const demo: ComponentDemo = {
  Demo,
  states: {
    Tiles: <Grid items={few} />,
    Selection: <Grid items={few} size="s" />,
    'With header': <Grid items={few} size="s" header={<p className="docs-demo-status">A strip of folders or a banner scrolls here.</p>} />,
    Empty: <Grid items={[]} />,
  },
  variants: {
    Sizes: (
      <div className="docs-gallery-span docs-demo-stack">
        <Grid items={few} size="s" />
        <Grid items={few} size="xl" />
        <Grid items={few} tileWidth={600} />
      </div>
    ),
    'Open on click': <Grid items={few} size="s" openOnClick />,
    'Overlay captions': <Grid items={few} size="s" overlay />,
  },
  dos: [
    'Give the grid a height (a flex child of a full-height page) so it scrolls by itself.',
    'Keep the selection in the app and apply `onSelect`: `range` runs from the last clicked or toggled tile.',
    'Use a stable key per file, so tiles keep their loaded thumbnails when the list changes.',
  ],
  donts: [
    'Don\'t put a MediaGrid inside another scrolling area: it virtualizes against its own scroll.',
    'Don\'t open an item on a single click: a click selects, a double-click or Enter opens.',
  ],
};
