import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { IconArrowDown, IconArrowUp } from '../../icons';
import { useLabels, type LabelOverrides, type Labels } from '../../labels';
import { cx } from '../../lib/cx';
import { formatBytes, formatDateTime } from '../../lib/format';
import { typeLabel, type FsEntry } from '../../lib/fs';
import type { FileViewMode, SelectMode, SortKey, SortState } from '../../lib/useFileBrowser';
import { FileIcon } from '../FileIcon';
import { ProgressBar } from '../ProgressBar';

/** A command from the keyboard, for the app to carry out. */
export type FileCommand = 'delete' | 'rename' | 'up' | 'back' | 'forward' | 'copy' | 'cut' | 'paste';

type FileViewWord = 'fileName' | 'dateModified' | 'fileType' | 'fileSize' | 'location' | 'folderEmpty' | 'sortBy' | 'renameItem' | 'freeOf' | 'driveUsed'
  | 'typeFolder' | 'typeDrive' | 'typeFile' | 'typeImage' | 'typeVideo' | 'typeAudio' | 'typeText' | 'typeDocument' | 'typePdf' | 'typeSpreadsheet'
  | 'typePresentation' | 'typeCode' | 'typeArchive' | 'typeApp' | 'typeFont' | 'typeModel' | 'typeOther';

export interface FileViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'onContextMenu'> {
  items: FsEntry[];
  view: FileViewMode;
  selection: ReadonlySet<string>;
  onSelect: (id: string, mode: SelectMode) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  /** Double-click or Enter. */
  onOpen: (entry: FsEntry) => void;
  sort?: SortState;
  /** Makes the details columns sortable. */
  onSortChange?: (key: SortKey) => void;
  /** Search results: adds a Location column (details) or line (tiles). */
  locationOf?: (entry: FsEntry) => string;
  /** Entries shown but not openable, e.g. files in a folder picker. */
  isDisabled?: (entry: FsEntry) => boolean;
  /** The entry being renamed in place (F2 asks for it through `onCommand`). */
  renamingId?: string;
  onRenameCommit?: (id: string, name: string) => void;
  onRenameCancel?: () => void;
  onCommand?: (command: FileCommand) => void;
  /** A right-click on an entry, or on the empty space (`null`). */
  onContextMenu?: (event: React.MouseEvent, entry: FsEntry | null) => void;
  /** Accessible name of the list: "Files in Music". */
  label: string;
  /** Instead of "This folder is empty.", e.g. "No results for…". */
  emptyText?: string;
  labels?: LabelOverrides<FileViewWord>;
}

const COLUMNS: { key: SortKey; word: keyof Labels }[] = [
  { key: 'name', word: 'fileName' },
  { key: 'modified', word: 'dateModified' },
  { key: 'type', word: 'fileType' },
  { key: 'size', word: 'fileSize' },
];

/**
 * A folder's content in four views: details (sortable columns), list, tiles and icons. One
 * listbox for all of them, with a desktop's selection: click, Ctrl+click, Shift+click, the arrows
 * (by row and column in tiles and icons), Ctrl+A; Enter opens.
 */
export const FileView = forwardRef<HTMLDivElement, FileViewProps>(({
  items, view, selection, onSelect, onSelectAll, onClearSelection, onOpen, sort, onSortChange, locationOf, isDisabled,
  renamingId, onRenameCommit, onRenameCancel, onCommand, onContextMenu, label, emptyText, labels: ownLabels, className, ...rest
}, ref) => {
  const labels = useLabels(ownLabels);
  const listRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const grid = view === 'tiles' || view === 'icons';

  useEffect(() => setFocusIndex((i) => Math.min(i, Math.max(0, items.length - 1))), [items.length]);

  const focusAt = (i: number) => {
    setFocusIndex(i);
    requestAnimationFrame(() => listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[i]?.focus());
  };

  // How many entries sit on the first row of a grid, for ↑ and ↓.
  const columnsPerRow = () => {
    if (!grid || !listRef.current) return 1;
    const options = Array.from(listRef.current.querySelectorAll<HTMLElement>('[role="option"]'));
    const top = options[0]?.offsetTop;
    return Math.max(1, options.filter((o) => o.offsetTop === top).length);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    const n = items.length;
    const mod = e.ctrlKey || e.metaKey;
    const cols = columnsPerRow();
    const step: Record<string, number> = grid ? { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols } : { ArrowDown: 1, ArrowUp: -1 };
    const command = (c: FileCommand) => {
      e.preventDefault();
      onCommand?.(c);
    };
    if (e.altKey && e.key === 'ArrowUp') return command('up');
    if (e.altKey && e.key === 'ArrowLeft') return command('back');
    if (e.altKey && e.key === 'ArrowRight') return command('forward');
    if (e.key in step || e.key === 'Home' || e.key === 'End') {
      if (!n) return;
      e.preventDefault();
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : Math.max(0, Math.min(n - 1, focusIndex + step[e.key]));
      focusAt(next);
      if (!mod) onSelect(items[next].id, e.shiftKey ? 'range' : 'replace');
      return;
    }
    const focused = items[focusIndex];
    if (e.key === 'Enter' && focused) {
      e.preventDefault();
      if (!isDisabled?.(focused)) onOpen(focused);
      return;
    }
    if (e.key === ' ' && focused) {
      e.preventDefault();
      onSelect(focused.id, mod ? 'toggle' : 'replace');
      return;
    }
    const key = e.key.toLowerCase();
    if (mod && key === 'a') {
      e.preventDefault();
      onSelectAll?.();
      return;
    }
    if (mod && key === 'c') return onCommand?.('copy');
    if (mod && key === 'x') return onCommand?.('cut');
    if (mod && key === 'v') return onCommand?.('paste');
    if (e.key === 'F2') return command('rename');
    if (e.key === 'Delete') return onCommand?.('delete');
    if (e.key === 'Backspace') return command('up');
    if (e.key === 'Escape' && selection.size) onClearSelection?.();
  };

  const name = (entry: FsEntry) =>
    entry.id === renamingId ? (
      <input
        className="ps-file-view-rename"
        defaultValue={entry.name}
        aria-label={labels.renameItem.replace('{name}', entry.name)}
        autoFocus
        onFocus={(e) => {
          // The name without its extension, as desktops select it.
          const dot = entry.kind === 'file' ? entry.name.lastIndexOf('.') : -1;
          e.currentTarget.setSelectionRange(0, dot > 0 ? dot : entry.name.length);
        }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') onRenameCommit?.(entry.id, e.currentTarget.value.trim() || entry.name);
          if (e.key === 'Escape') onRenameCancel?.();
        }}
        onBlur={(e) => onRenameCommit?.(entry.id, e.currentTarget.value.trim() || entry.name)}
      />
    ) : (
      <span className="ps-file-view-name" title={entry.name}>{entry.name}</span>
    );

  const free = (entry: FsEntry) => labels.freeOf.replace('{free}', formatBytes(entry.free ?? 0)).replace('{total}', formatBytes(entry.capacity ?? 0));
  const size = (entry: FsEntry) => (entry.kind === 'drive' && entry.capacity ? free(entry) : entry.kind === 'file' ? formatBytes(entry.size ?? 0) : '');

  return (
    <div ref={ref} className={cx('ps-file-view', `ps-file-view--${view}`, locationOf && 'ps-file-view--with-location', className)} {...rest}>
      {view === 'details' && (
        <div className="ps-file-view-head">
          {COLUMNS.map(({ key, word }) => {
            const sorted = sort?.key === key ? sort : undefined;
            return (
              <button
                key={key}
                type="button"
                className={cx('ps-file-view-head-cell', `is-${key}`, sorted && 'is-sorted')}
                aria-label={labels.sortBy.replace('{column}', labels[word])}
                aria-pressed={!!sorted}
                onClick={() => onSortChange?.(key)}
                disabled={!onSortChange}
              >
                <span>{labels[word]}</span>
                {sorted && (sorted.dir === 'asc' ? <IconArrowUp size={13} /> : <IconArrowDown size={13} />)}
              </button>
            );
          })}
          {locationOf && <span className="ps-file-view-head-cell is-location">{labels.location}</span>}
        </div>
      )}

      <div
        ref={listRef}
        role="listbox"
        aria-label={label}
        aria-multiselectable="true"
        aria-orientation={grid ? 'horizontal' : 'vertical'}
        className="ps-file-view-items"
        tabIndex={items.length ? -1 : 0}
        onKeyDown={onKeyDown}
        onClick={(e) => e.target === e.currentTarget && onClearSelection?.()}
        onContextMenu={(e) => {
          if (e.target !== e.currentTarget || !onContextMenu) return;
          e.preventDefault();
          onContextMenu(e, null);
        }}
      >
        {items.length === 0 && <p className="ps-file-view-empty">{emptyText ?? labels.folderEmpty}</p>}
        {items.map((entry, i) => {
          const selected = selection.has(entry.id);
          const disabled = isDisabled?.(entry) ?? false;
          const used = entry.kind === 'drive' && entry.capacity ? ((entry.capacity - (entry.free ?? 0)) / entry.capacity) * 100 : undefined;
          return (
            <div
              key={entry.id}
              role="option"
              aria-selected={selected}
              aria-disabled={disabled || undefined}
              tabIndex={i === focusIndex ? 0 : -1}
              className={cx('ps-file-view-item', selected && 'is-selected', disabled && 'is-disabled', entry.hidden && 'is-hidden')}
              onClick={(e) => {
                setFocusIndex(i);
                onSelect(entry.id, e.shiftKey ? 'range' : e.ctrlKey || e.metaKey ? 'toggle' : 'replace');
              }}
              onDoubleClick={() => !disabled && onOpen(entry)}
              onContextMenu={(e) => {
                if (!onContextMenu) return;
                e.preventDefault();
                if (!selected) onSelect(entry.id, 'replace');
                onContextMenu(e, entry);
              }}
            >
              {view === 'details' && (
                <>
                  <span className="ps-file-view-cell is-name"><FileIcon entry={entry} size="md" />{name(entry)}</span>
                  <span className="ps-file-view-cell is-modified">{entry.modified ? formatDateTime(entry.modified) : ''}</span>
                  <span className="ps-file-view-cell is-type">{typeLabel(entry, labels)}</span>
                  <span className="ps-file-view-cell is-size">{size(entry)}</span>
                  {locationOf && <span className="ps-file-view-cell is-location">{locationOf(entry)}</span>}
                </>
              )}
              {view === 'list' && (
                <>
                  <FileIcon entry={entry} size="sm" />
                  {name(entry)}
                </>
              )}
              {view === 'tiles' && (
                <>
                  <FileIcon entry={entry} size="lg" />
                  <span className="ps-file-view-tile-text">
                    {name(entry)}
                    <span className="ps-file-view-tile-meta">{locationOf ? locationOf(entry) : typeLabel(entry, labels)}</span>
                    {used !== undefined && (
                      <ProgressBar
                        className="ps-file-view-drive-meter"
                        value={used}
                        label={labels.driveUsed.replace('{name}', entry.name)}
                        tone={used > 90 ? 'danger' : used > 75 ? 'warning' : 'accent'}
                      />
                    )}
                    {size(entry) && <span className="ps-file-view-tile-meta">{size(entry)}</span>}
                  </span>
                </>
              )}
              {view === 'icons' && (
                <>
                  <FileIcon entry={entry} size="xl" />
                  {name(entry)}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
FileView.displayName = 'FileView';
