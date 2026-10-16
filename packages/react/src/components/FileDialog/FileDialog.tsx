import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { IconArrowUp, IconBack, IconBookmark, IconFolderPlus, IconForward, IconViewDetails, IconViewIcons, IconViewTiles } from '../../icons';
import { LabelsProvider, useLabels, type Labels } from '../../labels';
import { cx } from '../../lib/cx';
import { descendants, findPath, isContainer, type FsEntry } from '../../lib/fs';
import { buildNavTree, entryIdOf, isGroupRow } from '../../lib/navTree';
import { useFileBrowser, type FileViewMode, type SelectMode } from '../../lib/useFileBrowser';
import { AddressBar } from '../AddressBar';
import { Button } from '../Button';
import { Field, TextInput } from '../Field';
import { FileView } from '../FileView';
import { IconButton } from '../IconButton';
import { Modal } from '../Modal';
import { SearchField } from '../SearchField';
import { Select } from '../Select';
import { Switch } from '../Switch';
import { TreeView } from '../TreeView';

export interface FileFilter {
  /** "Images", "All files". */
  label: string;
  /** Extensions without the dot; ["*"] for all files. */
  extensions: string[];
}

export interface FileDialogResult {
  /** Open: the picked files. Folder: the folder. Save: none. */
  entries: FsEntry[];
  /** The folder it was in, or the picked folder. */
  folder: FsEntry;
  /** Save: the typed name. */
  name?: string;
}

export interface FileDialogProps {
  open: boolean;
  /** `open` picks existing files, `save` names a new one, `folder` picks a folder. */
  mode: 'open' | 'save' | 'folder';
  /** Open: pick several. */
  multiple?: boolean;
  root: FsEntry;
  initialId?: string;
  filters?: FileFilter[];
  /** Save: the suggested name. */
  defaultName?: string;
  /** Instead of "Open", "Save as" or "Select folder". */
  title?: string;
  /** Places in the sidebar. */
  recent?: FsEntry[];
  bookmarks?: FsEntry[];
  /** Turns on bookmarking the current folder. */
  onBookmarksChange?: (bookmarks: FsEntry[]) => void;
  /** A new folder in the current one (save and folder modes); returns its id, to rename it. */
  onCreateFolder?: (parentId: string) => string | void;
  onConfirm: (result: FileDialogResult) => void;
  onCancel: () => void;
  className?: string;
  /** Its words and its parts' words, for this one dialog. */
  labels?: Partial<Labels>;
}

const VIEWS: { key: FileViewMode; word: keyof Labels; Icon: typeof IconViewDetails }[] = [
  { key: 'details', word: 'viewDetails', Icon: IconViewDetails },
  { key: 'tiles', word: 'viewTiles', Icon: IconViewTiles },
  { key: 'icons', word: 'viewIcons', Icon: IconViewIcons },
];
const NO_WORDS: Partial<Labels> = {};

/**
 * The app's own open, save and folder dialog, in place of the system's: places on the left, the
 * folder in the middle, the name, type filter and buttons below. Built on the explorer's parts
 * and useFileBrowser; it reads the tree it is given and never touches a disk.
 */
export function FileDialog({ labels: ownLabels, ...props }: FileDialogProps) {
  return (
    <LabelsProvider labels={ownLabels ?? NO_WORDS}>
      <Dialog {...props} />
    </LabelsProvider>
  );
}

function Dialog({
  open, mode, multiple = false, root, initialId, filters, defaultName = '', title, recent, bookmarks = [], onBookmarksChange, onCreateFolder, onConfirm, onCancel, className,
}: Omit<FileDialogProps, 'labels'>) {
  const labels = useLabels();
  const [filterIndex, setFilterIndex] = useState(0);
  const filter = filters?.[filterIndex];
  const fb = useFileBrowser(root, { initialId, foldersOnly: mode === 'folder', filter: filter?.extensions, labels });
  const [name, setName] = useState(defaultName);
  const [renaming, setRenaming] = useState<string>();
  const nameRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<HTMLDivElement>(null);
  const nameId = useId();
  const typeId = useId();

  // First focus: the name to type when saving, otherwise the folder's content.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      if (mode === 'save') {
        nameRef.current?.focus();
        nameRef.current?.select();
      } else (filesRef.current?.querySelector<HTMLElement>('[role="option"][tabindex="0"]') ?? filesRef.current?.querySelector<HTMLElement>('[role="listbox"]'))?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, mode]);

  // Picking files fills the name field.
  useEffect(() => {
    if (mode === 'folder') return;
    const picked = fb.items.filter((e) => fb.selection.has(e.id) && !isContainer(e));
    if (picked.length) setName(picked.map((f) => (picked.length > 1 ? `"${f.name}"` : f.name)).join(' '));
    // Only a new selection fills it; typing afterwards is the person's.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fb.selection, mode]);

  const pinned = useMemo(() => descendants(root).filter((e) => e.pinned), [root]);
  const tree = useMemo(() => buildNavTree(root, { recent, bookmarks, pinned, labels }), [root, recent, bookmarks, pinned, labels]);
  const bookmarked = bookmarks.some((b) => b.id === fb.current.id);

  const files = fb.selected.filter((e) => !isContainer(e));
  const pickedFolder = mode === 'folder' ? fb.selected.find(isContainer) ?? fb.current : fb.current;
  const canConfirm = mode === 'open' ? files.length > 0 && (multiple || files.length === 1) : mode === 'save' ? name.trim().length > 0 : true;
  const confirm = () => {
    if (!canConfirm) return;
    if (mode === 'open') onConfirm({ entries: files, folder: fb.current });
    else if (mode === 'save') onConfirm({ entries: [], folder: fb.current, name: name.trim() });
    else onConfirm({ entries: [pickedFolder], folder: pickedFolder });
  };
  const openEntry = (e: FsEntry) => {
    if (isContainer(e)) fb.navigate(e.id);
    else if (mode === 'open') onConfirm({ entries: [e], folder: fb.current });
    else if (mode === 'save') {
      setName(e.name);
      nameRef.current?.focus();
    }
  };
  const select = (id: string, how: SelectMode) => fb.select(id, multiple ? how : 'replace');
  const titles = { open: labels.open, save: labels.saveAs, folder: labels.selectFolder };
  const confirmWord = { open: labels.open, save: labels.save, folder: labels.selectFolder };

  return (
    <Modal isOpen={open} title={title ?? titles[mode]} onClose={onCancel} dismissible className={cx('ps-file-dialog', className)}>
      <div className="ps-file-dialog-body">
        <div className="ps-file-dialog-top">
          <div className="ps-file-dialog-nav">
            <IconButton label={labels.back} size="sm" disabled={!fb.canBack} onClick={fb.back}><IconBack size={17} /></IconButton>
            <IconButton label={labels.forward} size="sm" disabled={!fb.canForward} onClick={fb.forward}><IconForward size={17} /></IconButton>
            <IconButton label={labels.up} size="sm" disabled={!fb.canUp} onClick={fb.up}><IconArrowUp size={17} /></IconButton>
          </div>
          <AddressBar
            path={fb.path.map((p) => ({ id: p.id, label: p.name }))}
            onNavigate={fb.navigate}
            childrenOf={(id) => (findPath(root, id)?.at(-1)?.children ?? []).filter((c) => isContainer(c) && !c.hidden).map((c) => ({ id: c.id, label: c.name }))}
            maxVisible={3}
          />
          <SearchField className="ps-file-dialog-search" value={fb.query} onChange={fb.setQuery} placeholder={labels.searchIn.replace('{name}', fb.current.name)} />
        </div>

        <div className="ps-file-dialog-main">
          <div className="ps-file-dialog-places">
            <TreeView
              label={labels.places}
              size="sm"
              nodes={tree}
              selectedId={fb.current.id}
              onSelect={(id) => !isGroupRow(id) && fb.navigate(entryIdOf(id))}
              defaultExpanded={['__quick', root.id, ...fb.path.map((p) => p.id)]}
            />
          </div>
          <div className="ps-file-dialog-files" ref={filesRef}>
            <div className="ps-file-dialog-tools">
              {onCreateFolder && mode !== 'open' && (
                <Button
                  size="xs"
                  variant="tonal"
                  icon={<IconFolderPlus size={15} />}
                  onClick={() => {
                    const id = onCreateFolder(fb.current.id);
                    if (!id) return;
                    fb.select(id);
                    setRenaming(id);
                  }}
                >
                  {labels.newFolder}
                </Button>
              )}
              {onBookmarksChange && (
                <Button
                  size="xs"
                  surface={0}
                  icon={<IconBookmark size={14} />}
                  aria-pressed={bookmarked}
                  onClick={() => onBookmarksChange(bookmarked ? bookmarks.filter((b) => b.id !== fb.current.id) : [...bookmarks, fb.current])}
                >
                  {bookmarked ? labels.removeBookmark : labels.bookmarkFolder}
                </Button>
              )}
              <span className="ps-file-dialog-spacer" />
              {VIEWS.map(({ key, word, Icon }) => (
                <IconButton key={key} label={labels[word]} size="sm" surface={0} pressed={fb.view === key} onClick={() => fb.setView(key)}><Icon size={15} /></IconButton>
              ))}
            </div>
            <FileView
              className="ps-file-dialog-view"
              label={labels.filesIn.replace('{name}', fb.current.name)}
              items={fb.items}
              view={fb.view}
              selection={fb.selection}
              onSelect={select}
              onSelectAll={multiple ? fb.selectAll : undefined}
              onClearSelection={fb.clearSelection}
              onOpen={openEntry}
              sort={fb.sort}
              onSortChange={fb.toggleSort}
              locationOf={fb.query ? fb.locationOf : undefined}
              renamingId={renaming}
              onRenameCommit={() => setRenaming(undefined)}
              onRenameCancel={() => setRenaming(undefined)}
              onCommand={(c) => (c === 'up' ? fb.up() : c === 'back' ? fb.back() : c === 'forward' ? fb.forward() : undefined)}
              emptyText={fb.query ? labels.noResultsFor.replace('{query}', fb.query) : mode === 'folder' ? labels.noFolders : undefined}
            />
          </div>
        </div>
      </div>

      <div className="ps-file-dialog-footer">
        <div className="ps-file-dialog-fields">
          {mode === 'folder' ? (
            <Field label={labels.folderField} htmlFor={nameId}>
              <TextInput id={nameId} readOnly value={findPath(root, pickedFolder.id)?.slice(1).map((p) => p.name).join(' › ') || pickedFolder.name} />
            </Field>
          ) : (
            <Field label={labels.fileNameField} htmlFor={nameId}>
              <TextInput
                ref={nameRef}
                id={nameId}
                value={name}
                readOnly={mode === 'open'}
                placeholder={mode === 'open' ? (multiple ? labels.pickFiles : labels.pickFile) : labels.untitled}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirm()}
              />
            </Field>
          )}
          {filters && filters.length > 0 && mode !== 'folder' && (
            <Field label={labels.fileType} htmlFor={typeId}>
              <Select
                id={typeId}
                ariaLabel={labels.fileTypeFilter}
                value={filterIndex}
                onChange={setFilterIndex}
                options={filters.map((f, i) => ({ value: i, label: f.label, meta: f.extensions.includes('*') ? undefined : f.extensions.map((x) => `.${x}`).join(' ') }))}
              />
            </Field>
          )}
        </div>
        <div className="ps-file-dialog-actions">
          <Switch className="ps-file-dialog-hidden" layout="inline" label={labels.hiddenItems} checked={fb.showHidden} onChange={fb.setShowHidden} />
          <span className="ps-file-dialog-spacer" />
          <Button onClick={onCancel}>{labels.cancel}</Button>
          <Button variant="primary" disabled={!canConfirm} onClick={confirm}>{confirmWord[mode]}</Button>
        </div>
      </div>
    </Modal>
  );
}
