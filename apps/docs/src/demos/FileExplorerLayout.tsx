import React, { useMemo, useState } from 'react';
import {
  AddressBar, Button, buttonClass, DetailsPane, FileExplorerLayout, IconArrowUp, IconBack, IconButton, IconChevronDown, IconCopy, IconCut,
  IconForward, IconHeart, IconMonitor, IconPanelRight, IconPaste, IconPlus, IconRefresh, IconRename, IconSort, IconTag, IconTrash,
  IconViewTiles, MediaGrid, MediaTile, Menu, SearchField, StatusBar, ToolbarDivider, ToolbarGroup, ToolbarSpacer, TreeView,
  buildNavTree, entryIdOf, isGroupRow, type FsEntry, type SelectMode,
} from '@pastel-studio/react';
import { covers } from '@pastel-studio/catalog/fixtures';
import { ScaledStage } from '../blocks/ScaledStage';
import type { ComponentDemo } from './types';

// A photo library built on the layout: its own folders (read as they open), a MediaGrid and the app's commands.
interface Photo { id: string; name: string; src: string; meta: string; size: number }

const art = Object.values(covers);
const photosIn = (folder: string, count: number): Photo[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${folder}-${i}`,
    name: `IMG_${String(i + 1).padStart(4, '0')}.png`,
    src: art[(i + folder.length) % art.length],
    meta: `${1200 + (i % 7) * 200} × ${1200 + (i % 5) * 150}`,
    size: 1_400_000 + (i % 9) * 310_000,
  }));

// The folders the "backend" knows; the tree learns each one's subfolders when it is expanded.
const DISK: Record<string, { name: string; kind: FsEntry['kind']; children: string[]; photos: number }> = {
  pc: { name: 'This PC', kind: 'folder', children: ['c', 'd'], photos: 0 },
  c: { name: 'Local Disk (C:)', kind: 'drive', children: ['pictures'], photos: 0 },
  pictures: { name: 'Pictures', kind: 'folder', children: ['screens'], photos: 24 },
  screens: { name: 'Screenshots', kind: 'folder', children: [], photos: 9 },
  d: { name: 'Photos (D:)', kind: 'drive', children: ['trips', 'studio'], photos: 0 },
  trips: { name: 'Trips', kind: 'folder', children: ['coast'], photos: 40 },
  coast: { name: 'Coast', kind: 'folder', children: [], photos: 120 },
  studio: { name: 'Studio', kind: 'folder', children: [], photos: 64 },
};
const parentOf = (id: string) => Object.keys(DISK).find((k) => DISK[k].children.includes(id));
const pathTo = (id: string): string[] => (id === 'pc' ? ['pc'] : [...pathTo(parentOf(id) ?? 'pc'), id]);

function entry(id: string, loaded: ReadonlySet<string>): FsEntry {
  const d = DISK[id];
  return { id, name: d.name, kind: d.kind, children: loaded.has(id) ? d.children.map((c) => entry(c, loaded)) : undefined };
}

function Library({ width, height, initial = 'coast', details: detailsAtStart = true, tree: withTree = true, selected: selectedAtStart = false }: { width?: number; height?: number; initial?: string; details?: boolean; tree?: boolean; selected?: boolean }) {
  const [history, setHistory] = useState([initial]);
  const [at, setAt] = useState(0);
  const here = history[at];
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set(pathTo(initial)));
  const [selection, setSelection] = useState<ReadonlySet<string>>(() => new Set(selectedAtStart ? [`${initial}-1`, `${initial}-2`] : []));
  const [detailsOpen, setDetailsOpen] = useState(detailsAtStart);
  const [query, setQuery] = useState('');
  const photos = useMemo(() => photosIn(here, DISK[here].photos).filter((p) => p.name.toLowerCase().includes(query.toLowerCase())), [here, query]);
  const selected = photos.filter((p) => selection.has(p.id));

  const go = (id: string) => {
    if (id === here) return;
    setHistory((h) => [...h.slice(0, at + 1), id]);
    setAt((a) => a + 1);
    setSelection(new Set());
    setLoaded((l) => new Set([...l, ...pathTo(id)]));
  };
  const step = (to: number) => { setAt(to); setSelection(new Set()); };
  const select = (key: string, mode: SelectMode) => setSelection((prev) => {
    if (mode === 'replace') return new Set([key]);
    const next = new Set(prev);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });

  const nodes = buildNavTree(entry('pc', loaded), { pinned: [{ id: 'trips', name: 'Trips', kind: 'folder' }, { id: 'pictures', name: 'Pictures', kind: 'folder' }] });
  const menu = (label: string, icon: React.ReactNode, variant?: 'tonal') => (
    <Menu
      items={[{ key: 'a', label: 'First choice', onSelect: () => {} }, { key: 'b', label: 'Second choice', onSelect: () => {} }]}
      align="start"
      ariaLabel={label}
      triggerClassName={buttonClass({ variant, size: 'sm', collapsible: true })}
      trigger={<>{icon}<span className="ps-button-label">{label}</span><span className="ps-button-trailing"><IconChevronDown size={14} /></span></>}
    />
  );
  const none = selection.size === 0;
  const bytes = selected.reduce((sum, p) => sum + p.size, 0);
  const one = selected.length === 1 ? selected[0] : undefined;

  const layout = (
    <FileExplorerLayout
      contentLabel={DISK[here].name}
      navigation={
        <>
          <IconButton label="Back (Alt+←)" size="sm" disabled={at === 0} onClick={() => step(at - 1)}><IconBack size={17} /></IconButton>
          <IconButton label="Forward (Alt+→)" size="sm" disabled={at === history.length - 1} onClick={() => step(at + 1)}><IconForward size={17} /></IconButton>
          <IconButton label="Up (Alt+↑)" size="sm" disabled={here === 'pc'} onClick={() => go(parentOf(here) ?? 'pc')}><IconArrowUp size={17} /></IconButton>
          <IconButton label="Refresh" size="sm"><IconRefresh size={16} /></IconButton>
        </>
      }
      address={withTree && (
        <AddressBar
          path={pathTo(here).map((id) => ({ id, label: DISK[id].name, icon: id === 'pc' ? <IconMonitor size={16} /> : undefined }))}
          onNavigate={go}
          childrenOf={(id) => DISK[id].children.map((c) => ({ id: c, label: DISK[c].name }))}
        />
      )}
      search={<SearchField value={query} onChange={setQuery} placeholder={`Search ${DISK[here].name}`} />}
      tree={withTree && (
        <TreeView
          label="Folders"
          size="sm"
          nodes={nodes}
          selectedId={here}
          onSelect={(id) => !isGroupRow(id) && go(entryIdOf(id))}
          onExpand={(id) => setLoaded((l) => new Set([...l, entryIdOf(id)]))}
          defaultExpanded={['__quick', ...pathTo(initial)]}
        />
      )}
      commands={
        <>
          {menu('New', <IconPlus size={16} />, 'tonal')}
          <ToolbarDivider />
          <ToolbarGroup>
            <IconButton label="Cut (Ctrl+X)" size="sm" disabled={none}><IconCut size={16} /></IconButton>
            <IconButton label="Copy (Ctrl+C)" size="sm" disabled={none}><IconCopy size={16} /></IconButton>
            <IconButton label="Paste (Ctrl+V)" size="sm" disabled><IconPaste size={16} /></IconButton>
            <IconButton label="Rename (F2)" size="sm" disabled={selection.size !== 1}><IconRename size={17} /></IconButton>
            <IconButton label="Move to the trash (Del)" size="sm" tone="danger" disabled={none}><IconTrash size={16} /></IconButton>
          </ToolbarGroup>
          {!none && (
            <>
              <ToolbarDivider />
              <Button size="sm" collapsible icon={<IconHeart size={16} />}>Favorite</Button>
              <Button size="sm" collapsible icon={<IconTag size={16} />}>Labels</Button>
            </>
          )}
          <ToolbarDivider />
          {menu('Sort', <IconSort size={15} />)}
          {menu('View', <IconViewTiles size={16} />)}
          <ToolbarSpacer />
          <IconButton label="Details pane" size="sm" pressed={detailsOpen} onClick={() => setDetailsOpen((o) => !o)}><IconPanelRight size={17} /></IconButton>
        </>
      }
      status={
        <StatusBar>
          <span>{photos.length} items</span>
          {!none && <span>{selection.size} selected · {(bytes / 1_000_000).toFixed(1)} MB</span>}
        </StatusBar>
      }
      detailsOpen={detailsOpen}
      details={
        <DetailsPane
          entries={selected.map((p) => ({ id: p.id, name: p.name, kind: 'file', size: p.size, meta: { Dimensions: p.meta } }))}
          folder={{ id: here, name: DISK[here].name, kind: DISK[here].kind }}
          actions={one && <Button size="sm" variant="tonal">Open</Button>}
        />
      }
    >
      <MediaGrid<Photo>
        label={`Photos in ${DISK[here].name}`}
        items={photos}
        getKey={(p) => p.id}
        size="m"
        selection={selection}
        onSelect={select}
        onSelectAll={() => setSelection(new Set(photos.map((p) => p.id)))}
        onClearSelection={() => setSelection(new Set())}
        onOpen={() => {}}
        renderTile={(p, state) => <MediaTile name={p.name} src={p.src} meta={p.meta} selected={state.selected} selecting={state.selecting} />}
      />
    </FileExplorerLayout>
  );
  // Without a width it fills its frame at its real size, as a narrow window would.
  return width && height ? <ScaledStage width={width} height={height}>{layout}</ScaledStage> : layout;
}

const still = (width: number, props: Partial<React.ComponentProps<typeof Library>> = {}) => (
  <div className="docs-gallery-span"><Library width={width} height={560} {...props} /></div>
);

export const demo: ComponentDemo = {
  Demo: () => (
    <div className="docs-demo-form docs-demo-wide">
      <Library width={1200} height={640} selected />
      <span className="docs-demo-status" role="status">A photo library on the layout: its folders load as they open, and its commands fold to icons when the row runs out of room.</span>
    </div>
  ),
  states: {
    'Details open': still(1200, { selected: true }),
    'Without a tree': still(1200, { tree: false }),
    'Folded commands': still(1200, { selected: true }),
  },
  variants: {
    Wide: still(1200),
    Medium: still(960),
    Narrow: <div className="docs-gallery-span docs-explorer-narrow"><Library /></div>,
  },
  dos: [
    'Use it when the app owns the files and their state: a media library, a cloud drive. For an in-memory tree, FileExplorer already does all of it.',
    'Give the commands collapsible buttons (`collapsible`, or `buttonClass({ collapsible: true })` for a menu trigger), so they fold to icons instead of wrapping.',
    'Name the content card after the place on screen with `contentLabel`.',
  ],
  donts: [
    'Don\'t wrap the parts in cards of your own: the layout draws the cards.',
    'Don\'t put a second toolbar or a selection bar under the content: the commands go in `commands`, the rest in the context menu.',
  ],
};
