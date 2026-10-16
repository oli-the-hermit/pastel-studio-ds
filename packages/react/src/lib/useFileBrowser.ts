import { useCallback, useMemo, useState } from 'react';
import { defaultLabels, type Labels } from '../labels';
import { descendants, findPath, isContainer, matchesFilter, typeLabel, type FsEntry } from './fs';

export type FileViewMode = 'details' | 'list' | 'tiles' | 'icons';
export type SortKey = 'name' | 'modified' | 'type' | 'size';
export interface SortState { key: SortKey; dir: 'asc' | 'desc' }
export type SelectMode = 'replace' | 'toggle' | 'range';

export interface FileBrowserOptions {
  /** The folder to start in (default: the root). */
  initialId?: string;
  initialView?: FileViewMode;
  /** Ids selected at start, to restore a selection. */
  initialSelection?: string[];
  /** Show only folders and drives (folder pickers). */
  foldersOnly?: boolean;
  /** Extensions to show (files only), e.g. ["png", "jpg"]. */
  filter?: string[];
  /** A file was opened (double-click, Enter). */
  onOpenFile?: (entry: FsEntry) => void;
  /** The words type sorting compares; pass `useLabels()` so it sorts in the reader's language. */
  labels?: Labels;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function compare(a: FsEntry, b: FsEntry, s: SortState, labels: Labels): number {
  // Folders and drives come first whatever the key, as in Windows and macOS.
  if (isContainer(a) !== isContainer(b)) return isContainer(a) ? -1 : 1;
  // Drives keep their letter order (C:, D:, E:) when sorted by name.
  const letter = (e: FsEntry) => /\(([A-Z]):\)/.exec(e.name)?.[1] ?? e.name;
  let r = 0;
  if (s.key === 'name') r = a.kind === 'drive' && b.kind === 'drive' ? collator.compare(letter(a), letter(b)) : collator.compare(a.name, b.name);
  if (s.key === 'modified') r = (a.modified ?? '').localeCompare(b.modified ?? '');
  if (s.key === 'type') r = collator.compare(typeLabel(a, labels), typeLabel(b, labels)) || collator.compare(a.name, b.name);
  if (s.key === 'size') r = (a.size ?? 0) - (b.size ?? 0);
  return s.dir === 'asc' ? r : -r;
}

/**
 * The state of a file browser: where you are, history, selection, sort, view, search and hidden
 * files. Pure state over an FsEntry tree; it never touches a disk. FileExplorer and FileDialog
 * share it, and an app can drive its own layout with it.
 */
export function useFileBrowser(root: FsEntry, opts: FileBrowserOptions = {}) {
  const { initialId, initialView, initialSelection, foldersOnly, filter, onOpenFile, labels = defaultLabels } = opts;
  const [history, setHistory] = useState<string[]>([initialId ?? root.id]);
  const [cursor, setCursor] = useState(0);
  const [selection, setSelection] = useState<Set<string>>(() => new Set(initialSelection ?? []));
  const [anchor, setAnchor] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({ key: 'name', dir: 'asc' });
  const [view, setView] = useState<FileViewMode>(initialView ?? 'details');
  const [query, setQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);

  const currentId = history[cursor];
  const path = useMemo(() => findPath(root, currentId) ?? [root], [root, currentId]);
  const current = path[path.length - 1];

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? descendants(current).filter((e) => e.name.toLowerCase().includes(q)) : current.children ?? [];
    return pool
      .filter((e) => showHidden || !e.hidden)
      .filter((e) => !foldersOnly || isContainer(e))
      .filter((e) => matchesFilter(e, filter))
      .sort((a, b) => compare(a, b, sort, labels));
  }, [current, query, showHidden, sort, foldersOnly, filter, labels]);

  const navigate = useCallback(
    (id: string) => {
      if (id === currentId) return;
      setHistory((h) => [...h.slice(0, cursor + 1), id]);
      setCursor((c) => c + 1);
      setSelection(new Set());
      setQuery('');
    },
    [currentId, cursor]
  );

  const open = useCallback(
    (e: FsEntry) => {
      if (isContainer(e)) navigate(e.id);
      else onOpenFile?.(e);
    },
    [navigate, onOpenFile]
  );

  const select = useCallback(
    (id: string, mode: SelectMode = 'replace') => {
      if (mode === 'replace') {
        setSelection(new Set([id]));
        setAnchor(id);
      } else if (mode === 'toggle') {
        setSelection((s) => {
          const n = new Set(s);
          if (n.has(id)) n.delete(id);
          else n.add(id);
          return n;
        });
        setAnchor(id);
      } else {
        const ids = items.map((i) => i.id);
        const a = ids.indexOf(anchor ?? id);
        const b = ids.indexOf(id);
        const [lo, hi] = a < b ? [a, b] : [b, a];
        setSelection(new Set(ids.slice(Math.max(0, lo), hi + 1)));
      }
    },
    [items, anchor]
  );

  const step = (to: number) => {
    setCursor(to);
    setSelection(new Set());
    setQuery('');
  };

  return {
    root,
    path,
    current,
    items,
    navigate,
    open,
    back: () => cursor > 0 && step(cursor - 1),
    forward: () => cursor < history.length - 1 && step(cursor + 1),
    up: () => path.length > 1 && navigate(path[path.length - 2].id),
    canBack: cursor > 0,
    canForward: cursor < history.length - 1,
    canUp: path.length > 1,
    selection,
    selected: items.filter((i) => selection.has(i.id)),
    select,
    selectAll: () => setSelection(new Set(items.map((i) => i.id))),
    clearSelection: () => setSelection(new Set()),
    sort,
    setSort,
    toggleSort: (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })),
    view,
    setView,
    query,
    setQuery,
    showHidden,
    setShowHidden,
    /** Where a search result lives: "Music › Albums". */
    locationOf: (e: FsEntry) => (findPath(root, e.id) ?? []).slice(1, -1).map((p) => p.name).join(' › '),
  };
}

export type FileBrowser = ReturnType<typeof useFileBrowser>;
