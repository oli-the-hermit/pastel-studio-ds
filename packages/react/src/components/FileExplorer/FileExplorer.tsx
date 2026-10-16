import React, { forwardRef, useMemo, useState } from 'react';
import {
  IconArrowUp, IconBack, IconChevronDown, IconCopy, IconCut, IconExternal, IconFileText, IconFolderPlus, IconForward, IconPanelRight,
  IconPaste, IconPin, IconPlus, IconRefresh, IconRename, IconShare, IconSort, IconTrash, IconViewDetails, IconViewIcons, IconViewList, IconViewTiles,
} from '../../icons';
import { LabelsProvider, useLabels, type Labels } from '../../labels';
import { cx } from '../../lib/cx';
import { formatBytes } from '../../lib/format';
import { descendants, findPath, isContainer, type FsEntry } from '../../lib/fs';
import { buildNavTree, entryIdOf, isGroupRow } from '../../lib/navTree';
import { useFileBrowser, type FileViewMode, type SortKey } from '../../lib/useFileBrowser';
import { AddressBar } from '../AddressBar';
import { Button, buttonClass } from '../Button';
import { useContextMenuState } from '../ContextMenu';
import { DetailsPane } from '../DetailsPane';
import { FileView, type FileCommand } from '../FileView';
import { IconButton } from '../IconButton';
import { Menu, tidyMenuItems, type MenuItem } from '../Menu';
import { SearchField } from '../SearchField';
import { StatusBar } from '../StatusBar';
import { Toolbar, ToolbarDivider, ToolbarGroup, ToolbarSpacer } from '../Toolbar';
import { TreeView } from '../TreeView';

/** What the app lets people do. Each command shows only when its operation is given. */
export interface FileOperations {
  /** Returns the new folder's id, to start renaming it. */
  createFolder?: (parentId: string) => string | void;
  createFile?: (parentId: string) => string | void;
  rename?: (id: string, name: string) => void;
  /** Confirm before deleting: the explorer only asks. */
  delete?: (ids: string[]) => void;
  copy?: (ids: string[]) => void;
  cut?: (ids: string[]) => void;
  paste?: (targetId: string) => void;
  canPaste?: boolean;
  share?: (ids: string[]) => void;
  togglePin?: (id: string) => void;
}

export interface FileExplorerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The computer: drives and their folders. */
  root: FsEntry;
  initialId?: string;
  /** Rows above and below the folders in the tree. */
  home?: FsEntry;
  gallery?: FsEntry;
  network?: FsEntry;
  onOpenFile?: (entry: FsEntry) => void;
  operations?: FileOperations;
  defaultView?: FileViewMode;
  defaultDetailsOpen?: boolean;
  defaultSelectedIds?: string[];
  /** Its words and its parts' words, for this one explorer. */
  labels?: Partial<Labels>;
}

const SORTS: { key: SortKey; word: keyof Labels }[] = [
  { key: 'name', word: 'fileName' },
  { key: 'modified', word: 'dateModified' },
  { key: 'type', word: 'fileType' },
  { key: 'size', word: 'fileSize' },
];
const VIEWS: { key: FileViewMode; word: keyof Labels; Icon: typeof IconViewList }[] = [
  { key: 'details', word: 'viewDetails', Icon: IconViewDetails },
  { key: 'list', word: 'viewList', Icon: IconViewList },
  { key: 'tiles', word: 'viewTiles', Icon: IconViewTiles },
  { key: 'icons', word: 'viewIcons', Icon: IconViewIcons },
];
const NO_WORDS: Partial<Labels> = {};

/**
 * A file manager in a desktop layout: back, forward, the address and search on top; the folder
 * tree, the folder's content with its commands and status, and the details pane below, as three
 * tonal cards. Its state comes from useFileBrowser; changing files is up to the app.
 */
export const FileExplorer = forwardRef<HTMLDivElement, FileExplorerProps>(({ labels: ownLabels, ...props }, ref) => (
  <LabelsProvider labels={ownLabels ?? NO_WORDS}>
    <Explorer ref={ref} {...props} />
  </LabelsProvider>
));
FileExplorer.displayName = 'FileExplorer';

const Explorer = forwardRef<HTMLDivElement, Omit<FileExplorerProps, 'labels'>>(({
  root, initialId, home, gallery, network, onOpenFile, operations: ops = {}, defaultView = 'details', defaultDetailsOpen = true, defaultSelectedIds, className, ...rest
}, ref) => {
  const labels = useLabels();
  const fb = useFileBrowser(root, { initialId, initialView: defaultView, initialSelection: defaultSelectedIds, onOpenFile, labels });
  const [detailsOpen, setDetailsOpen] = useState(defaultDetailsOpen);
  const [renaming, setRenaming] = useState<string>();
  const context = useContextMenuState();
  const all = useMemo(() => [root, ...descendants(root)], [root]);
  const pinned = useMemo(() => all.filter((e) => e.pinned), [all]);
  const tree = useMemo(() => buildNavTree(root, { home, gallery, network, pinned, labels }), [root, home, gallery, network, pinned, labels]);

  const ids = fb.selected.map((s) => s.id);
  const one = fb.selected.length === 1 ? fb.selected[0] : undefined;
  const run = (command: FileCommand) => {
    if (command === 'up') fb.up();
    if (command === 'back') fb.back();
    if (command === 'forward') fb.forward();
    if (command === 'rename' && one && ops.rename) setRenaming(one.id);
    if (command === 'delete' && ids.length) ops.delete?.(ids);
    if (command === 'copy' && ids.length) ops.copy?.(ids);
    if (command === 'cut' && ids.length) ops.cut?.(ids);
    if (command === 'paste' && ops.canPaste) ops.paste?.(fb.current.id);
  };
  const create = (make?: (parentId: string) => string | void) => {
    const id = make?.(fb.current.id);
    if (!id) return;
    fb.select(id);
    setRenaming(id);
  };

  const newItems = tidyMenuItems([
    ops.createFolder && { key: 'folder', label: labels.typeFolder, icon: <IconFolderPlus size={16} />, onSelect: () => create(ops.createFolder) },
    ops.createFile && { key: 'text', label: labels.textDocument, icon: <IconFileText size={16} />, onSelect: () => create(ops.createFile) },
  ]);
  const sortItems: MenuItem[] = [
    ...SORTS.map(({ key, word }) => ({ key, label: labels[word], checked: fb.sort.key === key, radio: true, onSelect: () => fb.setSort({ ...fb.sort, key }) })),
    { key: 'd', divider: true },
    { key: 'asc', label: labels.ascending, checked: fb.sort.dir === 'asc', radio: true, onSelect: () => fb.setSort({ ...fb.sort, dir: 'asc' }) },
    { key: 'desc', label: labels.descending, checked: fb.sort.dir === 'desc', radio: true, onSelect: () => fb.setSort({ ...fb.sort, dir: 'desc' }) },
  ];
  const viewItems: MenuItem[] = [
    ...VIEWS.map(({ key, word }) => ({ key, label: labels[word], checked: fb.view === key, radio: true, onSelect: () => fb.setView(key) })),
    { key: 'd', divider: true },
    { key: 'hidden', label: labels.hiddenItems, checked: fb.showHidden, keepOpen: true, onSelect: () => fb.setShowHidden(!fb.showHidden) },
    { key: 'pane', label: labels.detailsPane, checked: detailsOpen, keepOpen: true, onSelect: () => setDetailsOpen((o) => !o) },
  ];
  const itemMenu = (entry: FsEntry | null): MenuItem[] =>
    tidyMenuItems([
      entry && { key: 'open', label: labels.open, icon: <IconExternal size={16} />, hint: 'Enter', onSelect: () => fb.open(entry) },
      entry && isContainer(entry) && ops.togglePin && { key: 'pin', label: entry.pinned ? labels.unpinFromQuickAccess : labels.pinToQuickAccess, icon: <IconPin size={16} />, onSelect: () => ops.togglePin?.(entry.id) },
      { key: 'd1', divider: true },
      entry && ops.cut && { key: 'cut', label: labels.cut, icon: <IconCut size={16} />, hint: 'Ctrl+X', onSelect: () => run('cut') },
      entry && ops.copy && { key: 'copy', label: labels.copy, icon: <IconCopy size={16} />, hint: 'Ctrl+C', onSelect: () => run('copy') },
      ops.paste && { key: 'paste', label: labels.paste, icon: <IconPaste size={16} />, hint: 'Ctrl+V', disabled: !ops.canPaste, onSelect: () => run('paste') },
      entry && ops.rename && { key: 'rename', label: labels.rename, icon: <IconRename size={16} />, hint: 'F2', onSelect: () => run('rename') },
      entry && ops.share && { key: 'share', label: labels.share, icon: <IconShare size={16} />, onSelect: () => ops.share?.(ids.length ? ids : [entry.id]) },
      !entry && newItems.length > 0 && { key: 'new', label: labels.newItem, icon: <IconPlus size={16} />, items: newItems },
      !entry && { key: 'sort', label: labels.sortByMenu, icon: <IconSort size={16} />, items: sortItems },
      !entry && { key: 'view', label: labels.view, icon: <IconViewDetails size={16} />, items: viewItems },
      { key: 'd2', divider: true },
      entry && ops.delete && { key: 'delete', label: labels.delete, icon: <IconTrash size={16} />, hint: 'Del', danger: true, onSelect: () => run('delete') },
    ]);

  const menuButton = (label: string, icon: React.ReactNode, items: MenuItem[], variant?: 'tonal') => (
    <Menu
      items={items}
      align="start"
      ariaLabel={label}
      triggerClassName={buttonClass({ variant, size: 'sm', collapsible: true })}
      trigger={<>{icon}<span className="ps-button-label">{label}</span><span className="ps-button-trailing"><IconChevronDown size={14} /></span></>}
    />
  );
  const hasCommands = !!(ops.cut || ops.copy || ops.paste || ops.rename || ops.share || ops.delete);
  const command = (word: keyof Labels, key: string) => `${labels[word]} (${key})`;
  const totalSelected = fb.selected.reduce((sum, e) => sum + (e.size ?? 0), 0);
  const count = fb.items.length;
  const CurrentView = VIEWS.find((v) => v.key === fb.view)!.Icon;

  return (
    <div ref={ref} className={cx('ps-file-explorer', detailsOpen && 'is-details-open', className)} {...rest}>
      <div className="ps-file-explorer-top">
        <Toolbar label={labels.navigation} className="ps-file-explorer-nav">
          <IconButton label={command('back', 'Alt+←')} size="sm" disabled={!fb.canBack} onClick={fb.back}><IconBack size={17} /></IconButton>
          <IconButton label={command('forward', 'Alt+→')} size="sm" disabled={!fb.canForward} onClick={fb.forward}><IconForward size={17} /></IconButton>
          <IconButton label={command('up', 'Alt+↑')} size="sm" disabled={!fb.canUp} onClick={fb.up}><IconArrowUp size={17} /></IconButton>
          <IconButton label={labels.refresh} size="sm" onClick={() => fb.navigate(fb.current.id)}><IconRefresh size={16} /></IconButton>
        </Toolbar>
        <AddressBar
          path={fb.path.map((p) => ({ id: p.id, label: p.name }))}
          onNavigate={fb.navigate}
          childrenOf={(id) => (findPath(root, id)?.at(-1)?.children ?? []).filter((c) => isContainer(c) && !c.hidden).map((c) => ({ id: c.id, label: c.name }))}
          onSubmitPath={(text) => {
            const want = text.split(/[\\/]/).filter(Boolean).pop()?.toLowerCase();
            const hit = all.find((e) => isContainer(e) && e.name.toLowerCase() === want);
            if (hit) fb.navigate(hit.id);
          }}
        />
        <SearchField className="ps-file-explorer-search" value={fb.query} onChange={fb.setQuery} placeholder={labels.searchIn.replace('{name}', fb.current.name)} />
      </div>

      <div className="ps-file-explorer-body">
        <nav className="ps-file-explorer-tree" aria-label={labels.navigationPane}>
          <TreeView
            label={labels.folders}
            nodes={tree}
            selectedId={fb.current.id}
            onSelect={(id) => !isGroupRow(id) && fb.navigate(entryIdOf(id))}
            defaultExpanded={['__quick', root.id, ...fb.path.map((p) => p.id)]}
          />
        </nav>

        <section className="ps-file-explorer-main" aria-label={fb.current.name}>
          <Toolbar label={labels.commands} className="ps-file-explorer-commands">
            {newItems.length > 0 && <>{menuButton(labels.newItem, <IconPlus size={16} />, newItems, 'tonal')}<ToolbarDivider /></>}
            {hasCommands && <><ToolbarGroup>
              {ops.cut && <IconButton label={command('cut', 'Ctrl+X')} size="sm" disabled={!ids.length} onClick={() => run('cut')}><IconCut size={16} /></IconButton>}
              {ops.copy && <IconButton label={command('copy', 'Ctrl+C')} size="sm" disabled={!ids.length} onClick={() => run('copy')}><IconCopy size={16} /></IconButton>}
              {ops.paste && <IconButton label={command('paste', 'Ctrl+V')} size="sm" disabled={!ops.canPaste} onClick={() => run('paste')}><IconPaste size={16} /></IconButton>}
              {ops.rename && <IconButton label={command('rename', 'F2')} size="sm" disabled={!one} onClick={() => run('rename')}><IconRename size={17} /></IconButton>}
              {ops.share && <IconButton label={labels.share} size="sm" disabled={!ids.length} onClick={() => ops.share?.(ids)}><IconShare size={16} /></IconButton>}
              {ops.delete && <IconButton label={command('delete', 'Del')} size="sm" tone="danger" disabled={!ids.length} onClick={() => run('delete')}><IconTrash size={16} /></IconButton>}
            </ToolbarGroup>
            <ToolbarDivider /></>}
            {menuButton(labels.sort, <IconSort size={15} />, sortItems)}
            {menuButton(labels.view, <CurrentView size={16} />, viewItems)}
            <ToolbarSpacer />
            <IconButton label={labels.detailsPane} size="sm" pressed={detailsOpen} onClick={() => setDetailsOpen((o) => !o)}><IconPanelRight size={17} /></IconButton>
          </Toolbar>

          <FileView
            className="ps-file-explorer-view"
            label={labels.filesIn.replace('{name}', fb.current.name)}
            items={fb.items}
            view={fb.view}
            selection={fb.selection}
            onSelect={fb.select}
            onSelectAll={fb.selectAll}
            onClearSelection={fb.clearSelection}
            onOpen={fb.open}
            sort={fb.sort}
            onSortChange={fb.toggleSort}
            locationOf={fb.query ? fb.locationOf : undefined}
            emptyText={fb.query ? labels.noResultsFor.replace('{query}', fb.query) : undefined}
            renamingId={renaming}
            onRenameCommit={(id, name) => {
              ops.rename?.(id, name);
              setRenaming(undefined);
            }}
            onRenameCancel={() => setRenaming(undefined)}
            onCommand={run}
            onContextMenu={(e, entry) => context.openMenu(e, itemMenu(entry))}
          />

          <StatusBar
            className="ps-file-explorer-status"
            end={VIEWS.filter((v) => v.key === 'details' || v.key === 'tiles').map(({ key, word, Icon }) => (
              <IconButton key={key} label={labels[word]} size="sm" pressed={fb.view === key} onClick={() => fb.setView(key)}><Icon size={15} /></IconButton>
            ))}
          >
            <span>{(count === 1 ? labels.itemOne : labels.itemOther).replace('{count}', String(count))}</span>
            {fb.selected.length > 0 && (
              <span>{labels.selectedCount.replace('{count}', String(fb.selected.length))}{totalSelected ? ` · ${formatBytes(totalSelected)}` : ''}</span>
            )}
          </StatusBar>
        </section>

        {detailsOpen && (
          <DetailsPane
            className="ps-file-explorer-details"
            entries={fb.selected}
            folder={fb.current}
            location={one ? fb.locationOf(one) : undefined}
            actions={one && (
              <>
                <Button size="sm" variant="tonal" onClick={() => fb.open(one)}>{labels.open}</Button>
                {ops.share && <Button size="sm" icon={<IconShare size={15} />} onClick={() => ops.share?.([one.id])}>{labels.share}</Button>}
              </>
            )}
          />
        )}
      </div>
      {context.element}
    </div>
  );
});
Explorer.displayName = 'Explorer';
